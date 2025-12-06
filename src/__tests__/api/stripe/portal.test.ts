import { describe, it, expect, vi, beforeEach } from "vitest";

// Use vi.hoisted to define mocks
const {
  mockSupabaseUser,
  mockSupabaseSelect,
  mockStripeBillingPortalCreate,
} = vi.hoisted(() => ({
  mockSupabaseUser: vi.fn(),
  mockSupabaseSelect: vi.fn(),
  mockStripeBillingPortalCreate: vi.fn(),
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
      })),
    })
  ),
}));

// Mock Stripe
vi.mock("@/lib/stripe/server", () => ({
  stripe: {
    billingPortal: {
      sessions: {
        create: mockStripeBillingPortalCreate,
      },
    },
  },
}));

// Import after mocking
import { POST } from "@/app/api/stripe/portal/route";

describe("Stripe Portal API", () => {
  const createMockRequest = () => {
    return new Request("http://localhost:3000/api/stripe/portal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: "http://localhost:3000",
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Authentication", () => {
    it("should return 401 when user is not authenticated", async () => {
      mockSupabaseUser.mockResolvedValue({ data: { user: null } });

      const request = createMockRequest();
      const response = await POST(request);

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("should proceed when user is authenticated", async () => {
      mockSupabaseUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
      });
      mockSupabaseSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { stripe_customer_id: "cus_123" },
            error: null,
          }),
        }),
      });
      mockStripeBillingPortalCreate.mockResolvedValue({
        url: "https://billing.stripe.com/session/123",
      });

      const request = createMockRequest();
      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe("Customer Validation", () => {
    beforeEach(() => {
      mockSupabaseUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
      });
    });

    it("should return 400 when user has no stripe_customer_id", async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { stripe_customer_id: null },
            error: null,
          }),
        }),
      });

      const request = createMockRequest();
      const response = await POST(request);

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("No subscription found");
    });

    it("should return 400 when profile not found", async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      const request = createMockRequest();
      const response = await POST(request);

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("No subscription found");
    });
  });

  describe("Portal Session Creation", () => {
    beforeEach(() => {
      mockSupabaseUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
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

    it("should create portal session with correct parameters", async () => {
      mockStripeBillingPortalCreate.mockResolvedValue({
        url: "https://billing.stripe.com/session/123",
      });

      const request = createMockRequest();
      await POST(request);

      expect(mockStripeBillingPortalCreate).toHaveBeenCalledWith({
        customer: "cus_123",
        return_url: "http://localhost:3000/dashboard/settings",
      });
    });

    it("should return portal URL on success", async () => {
      mockStripeBillingPortalCreate.mockResolvedValue({
        url: "https://billing.stripe.com/session/abc123",
      });

      const request = createMockRequest();
      const response = await POST(request);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.url).toBe("https://billing.stripe.com/session/abc123");
    });
  });

  describe("Error Handling", () => {
    beforeEach(() => {
      mockSupabaseUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
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

    it("should return 500 on Stripe API error", async () => {
      mockStripeBillingPortalCreate.mockRejectedValue(
        new Error("Stripe API error")
      );

      const request = createMockRequest();
      const response = await POST(request);

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe("Failed to create portal session");
    });

    it("should return 500 on database error", async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockRejectedValue(new Error("Database error")),
        }),
      });

      const request = createMockRequest();
      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });
});
