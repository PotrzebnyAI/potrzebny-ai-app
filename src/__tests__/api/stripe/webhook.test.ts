import { describe, it, expect, vi, beforeEach } from 'vitest'
import type Stripe from 'stripe'

// Use vi.hoisted to declare mocks before vi.mock hoisting
const { mockStripeWebhooks, mockStripeSubscriptions, mockSupabaseFrom } = vi.hoisted(() => ({
  mockStripeWebhooks: {
    constructEvent: vi.fn(),
  },
  mockStripeSubscriptions: {
    retrieve: vi.fn(),
  },
  mockSupabaseFrom: vi.fn(),
}))

vi.mock('@/lib/stripe/server', () => ({
  stripe: {
    webhooks: mockStripeWebhooks,
    subscriptions: mockStripeSubscriptions,
  },
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockSupabaseFrom,
  })),
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => ({
    get: vi.fn((name: string) => {
      if (name === 'stripe-signature') return 'test_signature'
      return null
    }),
  })),
}))

// Import after mocks
import { POST } from '@/app/api/stripe/webhook/route'

describe('Stripe Webhook API', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock for Supabase queries
    mockSupabaseFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: 'user_123' }, error: null }),
        }),
      }),
    })
  })

  describe('Signature Verification', () => {
    it('should return 400 for invalid webhook signature', async () => {
      mockStripeWebhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature')
      })

      const request = new Request('http://localhost/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid signature')
    })

    it('should process valid webhook signature', async () => {
      const mockEvent: Partial<Stripe.Event> = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            customer: 'cus_test_123',
            subscription: 'sub_test_123',
          } as Stripe.Checkout.Session,
        },
      }

      mockStripeWebhooks.constructEvent.mockReturnValue(mockEvent)
      mockStripeSubscriptions.retrieve.mockResolvedValue({
        id: 'sub_test_123',
        metadata: {
          supabase_user_id: 'user_123',
          plan: 'pro',
        },
      })

      const request = new Request('http://localhost/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.received).toBe(true)
    })
  })

  describe('checkout.session.completed', () => {
    it('should update user profile with subscription data', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      })

      mockSupabaseFrom.mockReturnValue({
        update: mockUpdate,
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: 'user_123' }, error: null }),
          }),
        }),
      })

      const mockEvent: Partial<Stripe.Event> = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            customer: 'cus_test_123',
            subscription: 'sub_test_123',
          } as Stripe.Checkout.Session,
        },
      }

      mockStripeWebhooks.constructEvent.mockReturnValue(mockEvent)
      mockStripeSubscriptions.retrieve.mockResolvedValue({
        id: 'sub_test_123',
        metadata: {
          supabase_user_id: 'user_123',
          plan: 'pro',
        },
      })

      const request = new Request('http://localhost/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      await POST(request)

      expect(mockSupabaseFrom).toHaveBeenCalledWith('profiles')
      expect(mockUpdate).toHaveBeenCalledWith({
        stripe_customer_id: 'cus_test_123',
        stripe_subscription_id: 'sub_test_123',
        subscription_tier: 'pro',
        subscription_status: 'active',
      })
    })

    it('should handle starter plan correctly', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      })

      mockSupabaseFrom.mockReturnValue({
        update: mockUpdate,
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: 'user_123' }, error: null }),
          }),
        }),
      })

      const mockEvent: Partial<Stripe.Event> = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            customer: 'cus_test_123',
            subscription: 'sub_test_123',
          } as Stripe.Checkout.Session,
        },
      }

      mockStripeWebhooks.constructEvent.mockReturnValue(mockEvent)
      mockStripeSubscriptions.retrieve.mockResolvedValue({
        id: 'sub_test_123',
        metadata: {
          supabase_user_id: 'user_123',
          plan: 'starter',
        },
      })

      const request = new Request('http://localhost/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      await POST(request)

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          subscription_tier: 'starter',
        })
      )
    })
  })

  describe('customer.subscription.updated', () => {
    it('should update subscription status when changed', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      })

      mockSupabaseFrom.mockReturnValue({
        update: mockUpdate,
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: 'user_123' }, error: null }),
          }),
        }),
      })

      const mockEvent: Partial<Stripe.Event> = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test_123',
            status: 'past_due',
            metadata: {
              supabase_user_id: 'user_123',
              plan: 'pro',
            },
          } as unknown as Stripe.Subscription,
        },
      }

      mockStripeWebhooks.constructEvent.mockReturnValue(mockEvent)

      const request = new Request('http://localhost/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      await POST(request)

      expect(mockUpdate).toHaveBeenCalledWith({
        subscription_status: 'past_due',
        subscription_tier: 'pro',
      })
    })

    it('should handle unpaid status as past_due', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      })

      mockSupabaseFrom.mockReturnValue({
        update: mockUpdate,
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: 'user_123' }, error: null }),
          }),
        }),
      })

      const mockEvent: Partial<Stripe.Event> = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test_123',
            status: 'unpaid',
            metadata: {
              supabase_user_id: 'user_123',
              plan: 'team',
            },
          } as unknown as Stripe.Subscription,
        },
      }

      mockStripeWebhooks.constructEvent.mockReturnValue(mockEvent)

      const request = new Request('http://localhost/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      await POST(request)

      expect(mockUpdate).toHaveBeenCalledWith({
        subscription_status: 'past_due',
        subscription_tier: 'team',
      })
    })
  })

  describe('customer.subscription.deleted', () => {
    it('should reset user to free tier when subscription deleted', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      })

      mockSupabaseFrom.mockReturnValue({
        update: mockUpdate,
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: 'user_123' }, error: null }),
          }),
        }),
      })

      const mockEvent: Partial<Stripe.Event> = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_test_123',
            metadata: {
              supabase_user_id: 'user_123',
            },
          } as unknown as Stripe.Subscription,
        },
      }

      mockStripeWebhooks.constructEvent.mockReturnValue(mockEvent)

      const request = new Request('http://localhost/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      await POST(request)

      expect(mockUpdate).toHaveBeenCalledWith({
        subscription_status: 'canceled',
        subscription_tier: 'free',
        stripe_subscription_id: null,
      })
    })
  })

  describe('invoice.payment_failed', () => {
    it('should mark subscription as past_due when payment fails', async () => {
      const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
      const mockSelectEq = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: 'user_123' }, error: null }),
      })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockSelectEq })

      mockSupabaseFrom.mockReturnValue({
        update: mockUpdate,
        select: mockSelect,
      })

      const mockEvent: Partial<Stripe.Event> = {
        type: 'invoice.payment_failed',
        data: {
          object: {
            id: 'inv_test_123',
            customer: 'cus_test_123',
          } as unknown as Stripe.Invoice,
        },
      }

      mockStripeWebhooks.constructEvent.mockReturnValue(mockEvent)

      const request = new Request('http://localhost/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      await POST(request)

      expect(mockSelect).toHaveBeenCalledWith('id')
      expect(mockSelectEq).toHaveBeenCalledWith('stripe_customer_id', 'cus_test_123')
    })

    it('should not update if customer not found', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      })

      mockSupabaseFrom.mockReturnValue({
        update: mockUpdate,
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      })

      const mockEvent: Partial<Stripe.Event> = {
        type: 'invoice.payment_failed',
        data: {
          object: {
            id: 'inv_test_123',
            customer: 'cus_unknown_123',
          } as unknown as Stripe.Invoice,
        },
      }

      mockStripeWebhooks.constructEvent.mockReturnValue(mockEvent)

      const request = new Request('http://localhost/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
    })
  })

  describe('Error Handling', () => {
    it('should return 500 when handler throws', async () => {
      mockStripeWebhooks.constructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            customer: 'cus_test_123',
            subscription: 'sub_test_123',
          } as Stripe.Checkout.Session,
        },
      })

      mockStripeSubscriptions.retrieve.mockRejectedValue(new Error('Stripe API error'))

      const request = new Request('http://localhost/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Webhook handler failed')
    })
  })

  describe('Unknown Event Types', () => {
    it('should return success for unknown event types', async () => {
      const mockEvent: Partial<Stripe.Event> = {
        type: 'payment_intent.created' as Stripe.Event.Type,
        data: {
          object: {} as Stripe.Event.Data['object'],
        },
      }

      mockStripeWebhooks.constructEvent.mockReturnValue(mockEvent)

      const request = new Request('http://localhost/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.received).toBe(true)
    })
  })
})
