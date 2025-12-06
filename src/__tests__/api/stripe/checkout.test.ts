import { describe, it, expect, vi, beforeEach } from "vitest";

// Use vi.hoisted to define mocks that will be available when vi.mock runs
const {
  mockSupabaseUser,
  mockSupabaseSelect,
  mockSupabaseUpdate,
  mockStripeCustomerCreate,
  mockStripeCheckoutSessionCreate,
} = vi.hoisted(() => ({
  mockSupabaseUser: vi.fn(),
  mockSupabaseSelect: vi.fn(),
  mockSupabaseUpdate: vi.fn(),
  mockStripeCustomerCreate: vi.fn(),
  mockStripeCheckoutSessionCreate: vi.fn(),
}));

// Mock Supabase
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        getUser: mockSupabaseUser,
      },
      from: vi.fn(() => ({
        select: mockSupabaseSelect,
        update: mockSupabaseUpdate,
      })),
    })
  ),
}));

// Mock Stripe
vi.mock("@/lib/stripe/server", () => ({
  stripe: {
    customers: {
      create: mockStripeCustomerCreate,
    },
    checkout: {
      sessions: {
        create: mockStripeCheckoutSessionCreate,
      },
    },
  },
}));

// Mock Stripe config
vi.mock("@/lib/stripe/config", () => ({
  STRIPE_PLANS: {
    starter: {
      name: "Starter",
      price: 29,
      priceId: "price_starter_123",
      features: [],
      limits: { transcriptionMinutes: 300, learningModes: 1 },
    },
    pro: {
      name: "Pro",
      price: 49,
      priceId: "price_pro_123",
      features: [],
      limits: { transcriptionMinutes: 1200, learningModes: 5 },
    },
    team: {
      name: "Team",
      price: 79,
      priceId: "price_team_123",
      features: [],
      limits: { transcriptionMinutes: -1, learningModes: 5 },
    },
  },
}));

// Import after mocking
import { POST } from "@/app/api/stripe/checkout/route";

describe("Stripe Checkout API", () => {
  const createMockRequest = (body: object) => {
    return new Request("http://localhost:3000/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: "http://localhost:3000",
      },
      body: JSON.stringify(body),
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Authentication", () => {
    it("should return 401 when user is not authenticated", async () => {
      mockSupabaseUser.mockResolvedValue({ data: { user: null } });

      const request = createMockRequest({ planKey: "pro" });
      const response = await POST(request);

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("should proceed when user is authenticated", async () => {
      mockSupabaseUser.mockResolvedValue({
        data: { user: { id: "user-123", email: "test@example.com" } },
      });
      mockSupabaseSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { stripe_customer_id: "cus_123", email: "test@example.com" },
            error: null,
          }),
        }),
      });
      mockStripeCheckoutSessionCreate.mockResolvedValue({
        id: "cs_123",
        url: "https://checkout.stripe.com/cs_123",
      });

      const request = createMockRequest({ planKey: "pro" });
      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe("Plan Validation", () => {
    beforeEach(() => {
      mockSupabaseUser.mockResolvedValue({
        data: { user: { id: "user-123", email: "test@example.com" } },
      });
    });

    it("should return 400 for missing planKey", async () => {
      const request = createMockRequest({});
      const response = await POST(request);

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("Invalid plan");
    });

    it("should return 400 for invalid planKey", async () => {
      const request = createMockRequest({ planKey: "invalid_plan" });
      const response = await POST(request);

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("Invalid plan");
    });

    it("should accept valid starter plan", async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { stripe_customer_id: "cus_123" },
            error: null,
          }),
        }),
      });
      mockStripeCheckoutSessionCreate.mockResolvedValue({
        id: "cs_123",
        url: "https://checkout.stripe.com/cs_123",
      });

      const request = createMockRequest({ planKey: "starter" });
      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it("should accept valid pro plan", async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { stripe_customer_id: "cus_123" },
            error: null,
          }),
        }),
      });
      mockStripeCheckoutSessionCreate.mockResolvedValue({
        id: "cs_123",
        url: "https://checkout.stripe.com/cs_123",
      });

      const request = createMockRequest({ planKey: "pro" });
      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it("should accept valid team plan", async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { stripe_customer_id: "cus_123" },
            error: null,
          }),
        }),
      });
      mockStripeCheckoutSessionCreate.mockResolvedValue({
        id: "cs_123",
        url: "https://checkout.stripe.com/cs_123",
      });

      const request = createMockRequest({ planKey: "team" });
      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe("Customer Management", () => {
    beforeEach(() => {
      mockSupabaseUser.mockResolvedValue({
        data: { user: { id: "user-123", email: "test@example.com" } },
      });
    });

    it("should use existing Stripe customer if available", async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { stripe_customer_id: "cus_existing", email: "test@example.com" },
            error: null,
          }),
        }),
      });
      mockStripeCheckoutSessionCreate.mockResolvedValue({
        id: "cs_123",
        url: "https://checkout.stripe.com/cs_123",
      });

      const request = createMockRequest({ planKey: "pro" });
      await POST(request);

      expect(mockStripeCustomerCreate).not.toHaveBeenCalled();
      expect(mockStripeCheckoutSessionCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: "cus_existing",
        })
      );
    });

    it("should create new Stripe customer if not exists", async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { stripe_customer_id: null, email: "test@example.com" },
            error: null,
          }),
        }),
      });
      mockSupabaseUpdate.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      });
      mockStripeCustomerCreate.mockResolvedValue({ id: "cus_new" });
      mockStripeCheckoutSessionCreate.mockResolvedValue({
        id: "cs_123",
        url: "https://checkout.stripe.com/cs_123",
      });

      const request = createMockRequest({ planKey: "pro" });
      await POST(request);

      expect(mockStripeCustomerCreate).toHaveBeenCalledWith({
        email: "test@example.com",
        metadata: {
          supabase_user_id: "user-123",
        },
      });
      expect(mockSupabaseUpdate).toHaveBeenCalled();
    });
  });

  describe("Checkout Session Creation", () => {
    beforeEach(() => {
      mockSupabaseUser.mockResolvedValue({
        data: { user: { id: "user-123", email: "test@example.com" } },
      });
      mockSupabaseSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { stripe_customer_id: "cus_123" },
            error: null,
          }),
        }),
      });
    });

    it("should create checkout session with correct parameters", async () => {
      mockStripeCheckoutSessionCreate.mockResolvedValue({
        id: "cs_123",
        url: "https://checkout.stripe.com/cs_123",
      });

      const request = createMockRequest({ planKey: "pro" });
      await POST(request);

      expect(mockStripeCheckoutSessionCreate).toHaveBeenCalledWith({
        customer: "cus_123",
        mode: "subscription",
        payment_method_types: ["card", "blik", "p24"],
        line_items: [
          {
            price: "price_pro_123",
            quantity: 1,
          },
        ],
        success_url: expect.stringContaining("/dashboard?session_id="),
        cancel_url: expect.stringContaining("/pricing"),
        subscription_data: {
          metadata: {
            supabase_user_id: "user-123",
            plan: "pro",
          },
        },
        locale: "pl",
      });
    });

    it("should return session id and url on success", async () => {
      mockStripeCheckoutSessionCreate.mockResolvedValue({
        id: "cs_123",
        url: "https://checkout.stripe.com/cs_123",
      });

      const request = createMockRequest({ planKey: "pro" });
      const response = await POST(request);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.sessionId).toBe("cs_123");
      expect(json.url).toBe("https://checkout.stripe.com/cs_123");
    });
  });

  describe("Error Handling", () => {
    beforeEach(() => {
      mockSupabaseUser.mockResolvedValue({
        data: { user: { id: "user-123", email: "test@example.com" } },
      });
    });

    it("should return 500 on Stripe API error", async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { stripe_customer_id: "cus_123" },
            error: null,
          }),
        }),
      });
      mockStripeCheckoutSessionCreate.mockRejectedValue(
        new Error("Stripe API error")
      );

      const request = createMockRequest({ planKey: "pro" });
      const response = await POST(request);

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe("Failed to create checkout session");
    });

    it("should return 500 on database error", async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockRejectedValue(new Error("Database error")),
        }),
      });

      const request = createMockRequest({ planKey: "pro" });
      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });
});
