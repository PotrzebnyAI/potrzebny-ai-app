import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import { STRIPE_PLANS, PlanKey } from "@/lib/stripe/config";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planKey } = await request.json() as { planKey: PlanKey };

    if (!planKey || !STRIPE_PLANS[planKey]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const plan = STRIPE_PLANS[planKey];

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, email")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;

      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card", "blik", "p24"],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${request.headers.get("origin")}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get("origin")}/pricing`,
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          plan: planKey,
        },
      },
      locale: "pl",
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
