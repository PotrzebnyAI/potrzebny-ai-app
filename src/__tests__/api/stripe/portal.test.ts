import { describe, it, expect, vi, beforeEach } from 'vitest'

// Use vi.hoisted to declare mocks before vi.mock hoisting
const { mockStripeBillingPortal, mockSupabaseFrom, mockSupabaseAuth } = vi.hoisted(() => ({
  mockStripeBillingPortal: {
    sessions: {
      create: vi.fn(),
    },
  },
  mockSupabaseFrom: vi.fn(),
  mockSupabaseAuth: {
    getUser: vi.fn(),
  },
}))

vi.mock('@/lib/stripe/server', () => ({
  stripe: {
    billingPortal: mockStripeBillingPortal,
  },
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: mockSupabaseFrom,
    auth: mockSupabaseAuth,
  })),
}))

import { POST } from '@/app/api/stripe/portal/route'

describe('Stripe Portal API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const request = new Request('http://localhost/api/stripe/portal', {
        method: 'POST',
        headers: {
          origin: 'http://localhost:3000',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })
  })

  describe('Subscription Validation', () => {
    it('should return 400 when user has no subscription', async () => {
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
              data: { stripe_customer_id: null },
              error: null,
            }),
          }),
        }),
      })

      const request = new Request('http://localhost/api/stripe/portal', {
        method: 'POST',
        headers: {
          origin: 'http://localhost:3000',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('No subscription found')
    })

    it('should return 400 when profile not found', async () => {
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
              data: null,
              error: null,
            }),
          }),
        }),
      })

      const request = new Request('http://localhost/api/stripe/portal', {
        method: 'POST',
        headers: {
          origin: 'http://localhost:3000',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('No subscription found')
    })
  })

  describe('Portal Session Creation', () => {
    it('should create billing portal session for valid customer', async () => {
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
              data: { stripe_customer_id: 'cus_test_123' },
              error: null,
            }),
          }),
        }),
      })

      mockStripeBillingPortal.sessions.create.mockResolvedValue({
        url: 'https://billing.stripe.com/session/test_123',
      })

      const request = new Request('http://localhost/api/stripe/portal', {
        method: 'POST',
        headers: {
          origin: 'http://localhost:3000',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.url).toBe('https://billing.stripe.com/session/test_123')
    })

    it('should pass correct customer ID to Stripe', async () => {
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
              data: { stripe_customer_id: 'cus_specific_456' },
              error: null,
            }),
          }),
        }),
      })

      mockStripeBillingPortal.sessions.create.mockResolvedValue({
        url: 'https://billing.stripe.com/session/test_123',
      })

      const request = new Request('http://localhost/api/stripe/portal', {
        method: 'POST',
        headers: {
          origin: 'http://localhost:3000',
        },
      })

      await POST(request)

      expect(mockStripeBillingPortal.sessions.create).toHaveBeenCalledWith({
        customer: 'cus_specific_456',
        return_url: 'http://localhost:3000/dashboard/settings',
      })
    })

    it('should use correct return URL from origin header', async () => {
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
              data: { stripe_customer_id: 'cus_test_123' },
              error: null,
            }),
          }),
        }),
      })

      mockStripeBillingPortal.sessions.create.mockResolvedValue({
        url: 'https://billing.stripe.com/session/test_123',
      })

      const request = new Request('http://localhost/api/stripe/portal', {
        method: 'POST',
        headers: {
          origin: 'https://potrzebny.ai',
        },
      })

      await POST(request)

      expect(mockStripeBillingPortal.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          return_url: 'https://potrzebny.ai/dashboard/settings',
        })
      )
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
              data: { stripe_customer_id: 'cus_test_123' },
              error: null,
            }),
          }),
        }),
      })

      mockStripeBillingPortal.sessions.create.mockRejectedValue(new Error('Stripe API error'))

      const request = new Request('http://localhost/api/stripe/portal', {
        method: 'POST',
        headers: {
          origin: 'http://localhost:3000',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create portal session')
    })

    it('should return 500 when database query fails', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_123', email: 'test@example.com' },
        },
        error: null,
      })

      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockRejectedValue(new Error('Database error')),
          }),
        }),
      })

      const request = new Request('http://localhost/api/stripe/portal', {
        method: 'POST',
        headers: {
          origin: 'http://localhost:3000',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create portal session')
    })
  })

  describe('Profile Query', () => {
    it('should query profiles table with correct user ID', async () => {
      const mockSelectEq = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { stripe_customer_id: 'cus_test_123' },
          error: null,
        }),
      })

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockSelectEq,
      })

      mockSupabaseAuth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user_specific_789', email: 'test@example.com' },
        },
        error: null,
      })

      mockSupabaseFrom.mockReturnValue({
        select: mockSelect,
      })

      mockStripeBillingPortal.sessions.create.mockResolvedValue({
        url: 'https://billing.stripe.com/session/test_123',
      })

      const request = new Request('http://localhost/api/stripe/portal', {
        method: 'POST',
        headers: {
          origin: 'http://localhost:3000',
        },
      })

      await POST(request)

      expect(mockSupabaseFrom).toHaveBeenCalledWith('profiles')
      expect(mockSelect).toHaveBeenCalledWith('stripe_customer_id')
      expect(mockSelectEq).toHaveBeenCalledWith('id', 'user_specific_789')
    })
  })
})
