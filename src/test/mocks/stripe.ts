import { vi } from 'vitest'
import type Stripe from 'stripe'

// Mock Stripe events factory
export const createMockStripeEvent = (
  type: string,
  data: Record<string, unknown>
): Stripe.Event => ({
  id: `evt_test_${Date.now()}`,
  object: 'event',
  api_version: '2024-10-28.acacia',
  created: Math.floor(Date.now() / 1000),
  type: type as Stripe.Event.Type,
  data: {
    object: data as Stripe.Event.Data['object'],
  },
  livemode: false,
  pending_webhooks: 0,
  request: null,
})

export const createMockCheckoutSession = (
  overrides: Partial<Stripe.Checkout.Session> = {}
): Stripe.Checkout.Session => ({
  id: 'cs_test_123',
  object: 'checkout.session',
  customer: 'cus_test_123',
  subscription: 'sub_test_123',
  payment_status: 'paid',
  status: 'complete',
  mode: 'subscription',
  ...overrides,
} as Stripe.Checkout.Session)

export const createMockSubscription = (
  overrides: Partial<Stripe.Subscription> = {}
): Stripe.Subscription => ({
  id: 'sub_test_123',
  object: 'subscription',
  customer: 'cus_test_123',
  status: 'active',
  metadata: {
    supabase_user_id: 'user_123',
    plan: 'pro',
  },
  ...overrides,
} as Stripe.Subscription)

export const createMockInvoice = (
  overrides: Partial<Stripe.Invoice> = {}
): Stripe.Invoice => ({
  id: 'inv_test_123',
  object: 'invoice',
  customer: 'cus_test_123',
  status: 'open',
  ...overrides,
} as Stripe.Invoice)

// Mock Stripe client
export const mockStripeClient = {
  webhooks: {
    constructEvent: vi.fn(),
  },
  subscriptions: {
    retrieve: vi.fn(),
  },
  customers: {
    create: vi.fn(),
  },
  checkout: {
    sessions: {
      create: vi.fn(),
    },
  },
}

export const mockStripe = () => {
  vi.mock('@/lib/stripe/server', () => ({
    stripe: mockStripeClient,
  }))
}
