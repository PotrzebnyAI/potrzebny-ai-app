import { describe, it, expect, vi, beforeEach } from 'vitest'

// Use vi.hoisted to declare mocks before vi.mock hoisting
const {
  mockStripeCustomers,
  mockStripeCheckoutSessions,
  mockSupabaseFrom,
  mockSupabaseAuth,
} = vi.hoisted(() => ({
  mockStripeCustomers: {
    create: vi.fn(),
  },
  mockStripeCheckoutSessions: {
    create: vi.fn(),
  },
  mockSupabaseFrom: vi.fn(),
  mockSupabaseAuth: {
    getUser: vi.fn(),
  },
}))

vi.mock('@/lib/stripe/server', () => ({
  stripe: {
    customers: mockStripeCustomers,
    checkout: {
      sessions: mockStripeCheckoutSessions,
    },
  },
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: mockSupabaseFrom,
    auth: mockSupabaseAuth,
  })),
}))

vi.mock('@/lib/stripe/config', () => ({
  STRIPE_PLANS: {
    starter: {
      name: 'Starter',
      price: 29,
      priceId: 'price_starter_123',
    },
    pro: {
      name: 'Pro',
      price: 49,
      priceId: 'price_pro_123',
    },
    team: {
      name: 'Team',
      price: 79,
      priceId: 'price_team_123',
    },
  },
}))

import { POST } from '@/app/api/stripe/checkout/route'

describe('Stripe Checkout API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const request = new Request('http://localhost/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          origin: 'http://localhost:3000',
        },
        body: JSON.stringify({ planKey: 'pro' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })
  })

  describe('Plan Validation', () => {
    it('should return 400 for invalid plan key', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' },
        },
        error: null,
      })

      const request = new Request('http://localhost/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          origin: 'http://localhost:3000',
        },
        body: JSON.stringify({ planKey: 'invalid_plan' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid plan')
    })

    it('should return 400 when planKey is missing', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' },
        },
        error: null,
      })

      const request = new Request('http://localhost/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          origin: 'http://localhost:3000',
        },
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid plan')
    })
  })

  describe('Customer Creation', () => {
    it('should create new Stripe customer if not exists', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' },
        },
        error: null,
      })

      const mockSelectEq = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { stripe_customer_id: null, email: 'test@example.com' },
          error: null,
        }),
      })

      const mockUpdateEq = vi.fn().mockResolvedValue({ data: null, error: null })

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({ eq: mockSelectEq }),
            update: vi.fn().mockReturnValue({ eq: mockUpdateEq }),
          }
        }
        return {}
      })

      mockStripeCustomers.create.mockResolvedValue({
        id: 'cus_new_123',
      })

      mockStripeCheckoutSessions.create.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/cs_test_123',
      })

      const request = new Request('http://localhost/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          origin: 'http://localhost:3000',
        },
        body: JSON.stringify({ planKey: 'pro' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(mockStripeCustomers.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        metadata: {
          supabase_user_id: 'user_123',
        },
      })
      expect(response.status).toBe(200)
      expect(data.sessionId).toBe('cs_test_123')
    })

    it('should use existing Stripe customer if exists', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' },
        },
        error: null,
      })

      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { stripe_customer_id: 'cus_existing_123', email: 'test@example.com' },
              error: null,
            }),
          }),
        }),
      })

      mockStripeCheckoutSessions.create.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/cs_test_123',
      })

      const request = new Request('http://localhost/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          origin: 'http://localhost:3000',
        },
        body: JSON.stringify({ planKey: 'pro' }),
      })

      await POST(request)

      expect(mockStripeCustomers.create).not.toHaveBeenCalled()
      expect(mockStripeCheckoutSessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_existing_123',
        })
      )
    })
  })

  describe('Checkout Session Creation', () => {
    beforeEach(() => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' },
        },
        error: null,
      })

      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { stripe_customer_id: 'cus_existing_123', email: 'test@example.com' },
              error: null,
            }),
          }),
        }),
      })
    })

    it('should create checkout session with correct plan', async () => {
      mockStripeCheckoutSessions.create.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/cs_test_123',
      })

      const request = new Request('http://localhost/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          origin: 'http://localhost:3000',
        },
        body: JSON.stringify({ planKey: 'starter' }),
      })

      await POST(request)

      expect(mockStripeCheckoutSessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'subscription',
          line_items: [
            {
              price: 'price_starter_123',
              quantity: 1,
            },
          ],
        })
      )
    })

    it('should include Polish payment methods', async () => {
      mockStripeCheckoutSessions.create.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/cs_test_123',
      })

      const request = new Request('http://localhost/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          origin: 'http://localhost:3000',
        },
        body: JSON.stringify({ planKey: 'pro' }),
      })

      await POST(request)

      expect(mockStripeCheckoutSessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_method_types: ['card', 'blik', 'p24'],
          locale: 'pl',
        })
      )
    })

    it('should include user metadata in subscription', async () => {
      mockStripeCheckoutSessions.create.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/cs_test_123',
      })

      const request = new Request('http://localhost/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          origin: 'http://localhost:3000',
        },
        body: JSON.stringify({ planKey: 'team' }),
      })

      await POST(request)

      expect(mockStripeCheckoutSessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          subscription_data: {
            metadata: {
              supabase_user_id: 'user_123',
              plan: 'team',
            },
          },
        })
      )
    })

    it('should return session ID and URL on success', async () => {
      mockStripeCheckoutSessions.create.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/cs_test_123',
      })

      const request = new Request('http://localhost/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          origin: 'http://localhost:3000',
        },
        body: JSON.stringify({ planKey: 'pro' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        sessionId: 'cs_test_123',
        url: 'https://checkout.stripe.com/cs_test_123',
      })
    })
  })

  describe('Error Handling', () => {
    it('should return 500 when Stripe API fails', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' },
        },
        error: null,
      })

      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { stripe_customer_id: 'cus_123', email: 'test@example.com' },
              error: null,
            }),
          }),
        }),
      })

      mockStripeCheckoutSessions.create.mockRejectedValue(new Error('Stripe API error'))

      const request = new Request('http://localhost/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          origin: 'http://localhost:3000',
        },
        body: JSON.stringify({ planKey: 'pro' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create checkout session')
    })
  })
})
