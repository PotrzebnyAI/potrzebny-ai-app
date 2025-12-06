import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { POST } from "@/app/api/stripe/webhook/route";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Mock Stripe
vi.mock("@/lib/stripe/server", () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn(),
    },
    subscriptions: {
      retrieve: vi.fn(),
    },
  },
}));

// Mock Supabase Admin
const mockSupabaseUpdate = vi.fn().mockReturnValue({
  eq: vi.fn().mockResolvedValue({ data: null, error: null }),
});

const mockSupabaseSelect = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    single: vi.fn().mockResolvedValue({ data: { id: "user-123" }, error: null }),
  }),
});

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table: string) => ({
      update: mockSupabaseUpdate,
      select: mockSupabaseSelect,
    })),
  })),
}));

// Import mocked stripe after mocking
import { stripe } from "@/lib/stripe/server";

describe("Stripe Webhook Handler", () => {
  const createMockRequest = (body: string) => {
    return new Request("http://localhost:3000/api/stripe/webhook", {
      method: "POST",
      body,
      headers: {
        "stripe-signature": "test_signature",
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Signature Verification", () => {
    it("should return 400 for invalid signature", async () => {
      (stripe.webhooks.constructEvent as Mock).mockImplementation(() => {
        throw new Error("Invalid signature");
      });

      const request = createMockRequest(JSON.stringify({ type: "test" }));
      const response = await POST(request);

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("Invalid signature");
    });

    it("should process valid signature", async () => {
      const mockEvent: Partial<Stripe.Event> = {
        type: "checkout.session.completed",
        data: {
          object: {
            subscription: "sub_123",
            customer: "cus_123",
          } as Stripe.Checkout.Session,
        },
      };

      (stripe.webhooks.constructEvent as Mock).mockReturnValue(mockEvent);
      (stripe.subscriptions.retrieve as Mock).mockResolvedValue({
        metadata: { plan: "pro", supabase_user_id: "user-123" },
      });

      const request = createMockRequest(JSON.stringify(mockEvent));
      const response = await POST(request);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.received).toBe(true);
    });
  });

  describe("checkout.session.completed event", () => {
    it("should update user profile with subscription data", async () => {
      const mockEvent: Partial<Stripe.Event> = {
        type: "checkout.session.completed",
        data: {
          object: {
            subscription: "sub_123",
            customer: "cus_123",
          } as Stripe.Checkout.Session,
        },
      };

      (stripe.webhooks.constructEvent as Mock).mockReturnValue(mockEvent);
      (stripe.subscriptions.retrieve as Mock).mockResolvedValue({
        metadata: { plan: "pro", supabase_user_id: "user-123" },
      });

      const request = createMockRequest(JSON.stringify(mockEvent));
      await POST(request);

      expect(stripe.subscriptions.retrieve).toHaveBeenCalledWith("sub_123");
      expect(mockSupabaseUpdate).toHaveBeenCalled();
    });

    it("should map starter plan correctly", async () => {
      const mockEvent: Partial<Stripe.Event> = {
        type: "checkout.session.completed",
        data: {
          object: {
            subscription: "sub_123",
            customer: "cus_123",
          } as Stripe.Checkout.Session,
        },
      };

      (stripe.webhooks.constructEvent as Mock).mockReturnValue(mockEvent);
      (stripe.subscriptions.retrieve as Mock).mockResolvedValue({
        metadata: { plan: "starter", supabase_user_id: "user-123" },
      });

      const request = createMockRequest(JSON.stringify(mockEvent));
      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it("should map team plan correctly", async () => {
      const mockEvent: Partial<Stripe.Event> = {
        type: "checkout.session.completed",
        data: {
          object: {
            subscription: "sub_123",
            customer: "cus_123",
          } as Stripe.Checkout.Session,
        },
      };

      (stripe.webhooks.constructEvent as Mock).mockReturnValue(mockEvent);
      (stripe.subscriptions.retrieve as Mock).mockResolvedValue({
        metadata: { plan: "team", supabase_user_id: "user-123" },
      });

      const request = createMockRequest(JSON.stringify(mockEvent));
      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe("customer.subscription.updated event", () => {
    it("should update subscription status for active subscription", async () => {
      const mockEvent: Partial<Stripe.Event> = {
        type: "customer.subscription.updated",
        data: {
          object: {
            status: "active",
            metadata: { plan: "pro", supabase_user_id: "user-123" },
          } as unknown as Stripe.Subscription,
        },
      };

      (stripe.webhooks.constructEvent as Mock).mockReturnValue(mockEvent);

      const request = createMockRequest(JSON.stringify(mockEvent));
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockSupabaseUpdate).toHaveBeenCalled();
    });

    it("should handle past_due status", async () => {
      const mockEvent: Partial<Stripe.Event> = {
        type: "customer.subscription.updated",
        data: {
          object: {
            status: "past_due",
            metadata: { plan: "pro", supabase_user_id: "user-123" },
          } as unknown as Stripe.Subscription,
        },
      };

      (stripe.webhooks.constructEvent as Mock).mockReturnValue(mockEvent);

      const request = createMockRequest(JSON.stringify(mockEvent));
      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it("should handle canceled status", async () => {
      const mockEvent: Partial<Stripe.Event> = {
        type: "customer.subscription.updated",
        data: {
          object: {
            status: "canceled",
            metadata: { plan: "pro", supabase_user_id: "user-123" },
          } as unknown as Stripe.Subscription,
        },
      };

      (stripe.webhooks.constructEvent as Mock).mockReturnValue(mockEvent);

      const request = createMockRequest(JSON.stringify(mockEvent));
      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe("customer.subscription.deleted event", () => {
    it("should cancel subscription and reset to free tier", async () => {
      const mockEvent: Partial<Stripe.Event> = {
        type: "customer.subscription.deleted",
        data: {
          object: {
            metadata: { supabase_user_id: "user-123" },
          } as unknown as Stripe.Subscription,
        },
      };

      (stripe.webhooks.constructEvent as Mock).mockReturnValue(mockEvent);

      const request = createMockRequest(JSON.stringify(mockEvent));
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockSupabaseUpdate).toHaveBeenCalled();
    });
  });

  describe("invoice.payment_failed event", () => {
    it("should mark subscription as past_due", async () => {
      const mockEvent: Partial<Stripe.Event> = {
        type: "invoice.payment_failed",
        data: {
          object: {
            customer: "cus_123",
          } as Stripe.Invoice,
        },
      };

      (stripe.webhooks.constructEvent as Mock).mockReturnValue(mockEvent);

      const request = createMockRequest(JSON.stringify(mockEvent));
      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it("should handle case when profile not found", async () => {
      mockSupabaseSelect.mockReturnValueOnce({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      const mockEvent: Partial<Stripe.Event> = {
        type: "invoice.payment_failed",
        data: {
          object: {
            customer: "cus_unknown",
          } as Stripe.Invoice,
        },
      };

      (stripe.webhooks.constructEvent as Mock).mockReturnValue(mockEvent);

      const request = createMockRequest(JSON.stringify(mockEvent));
      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe("Error Handling", () => {
    it("should return 500 on handler error", async () => {
      const mockEvent: Partial<Stripe.Event> = {
        type: "checkout.session.completed",
        data: {
          object: {
            subscription: "sub_123",
            customer: "cus_123",
          } as Stripe.Checkout.Session,
        },
      };

      (stripe.webhooks.constructEvent as Mock).mockReturnValue(mockEvent);
      (stripe.subscriptions.retrieve as Mock).mockRejectedValue(
        new Error("Stripe API error")
      );

      const request = createMockRequest(JSON.stringify(mockEvent));
      const response = await POST(request);

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe("Webhook handler failed");
    });

    it("should handle unknown event types gracefully", async () => {
      const mockEvent: Partial<Stripe.Event> = {
        type: "unknown.event.type" as Stripe.Event["type"],
        data: { object: {} },
      };

      (stripe.webhooks.constructEvent as Mock).mockReturnValue(mockEvent);

      const request = createMockRequest(JSON.stringify(mockEvent));
      const response = await POST(request);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.received).toBe(true);
    });
  });
});
