import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// Use service role for webhook (no user context)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const planKey = subscription.metadata.plan as string;
  const userId = subscription.metadata.supabase_user_id;

  const tierMap: Record<string, string> = {
    starter: "starter",
    pro: "pro",
    team: "team",
  };

  await supabaseAdmin
    .from("profiles")
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_tier: tierMap[planKey] || "starter",
      subscription_status: "active",
    })
    .eq("id", userId);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.supabase_user_id;
  const planKey = subscription.metadata.plan;

  const statusMap: Record<string, string> = {
    active: "active",
    past_due: "past_due",
    canceled: "canceled",
    unpaid: "past_due",
  };

  const tierMap: Record<string, string> = {
    starter: "starter",
    pro: "pro",
    team: "team",
  };

  await supabaseAdmin
    .from("profiles")
    .update({
      subscription_status: statusMap[subscription.status] || "inactive",
      subscription_tier: tierMap[planKey] || "starter",
    })
    .eq("id", userId);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.supabase_user_id;

  await supabaseAdmin
    .from("profiles")
    .update({
      subscription_status: "canceled",
      subscription_tier: "free",
      stripe_subscription_id: null,
    })
    .eq("id", userId);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (profile) {
    await supabaseAdmin
      .from("profiles")
      .update({
        subscription_status: "past_due",
      })
      .eq("id", profile.id);
  }
}
