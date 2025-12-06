import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
process.env.STRIPE_SECRET_KEY = "sk_test_123";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_123";
process.env.STRIPE_STARTER_PRICE_ID = "price_starter_123";
process.env.STRIPE_PRO_PRICE_ID = "price_pro_123";
process.env.STRIPE_TEAM_PRICE_ID = "price_team_123";
process.env.OPENAI_API_KEY = "sk-test-openai-key";

// Mock Next.js headers
vi.mock("next/headers", () => ({
  headers: vi.fn(() => ({
    get: vi.fn((name: string) => {
      if (name === "stripe-signature") return "test_signature";
      if (name === "origin") return "http://localhost:3000";
      return null;
    }),
  })),
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    getAll: vi.fn(() => []),
  })),
}));

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
