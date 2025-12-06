import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse, NextRequest } from 'next/server'

// Use vi.hoisted for mocks
const { mockGetUser, mockCreateServerClient } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockCreateServerClient: vi.fn(),
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: mockCreateServerClient,
}))

vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server')
  return {
    ...actual,
    NextResponse: {
      next: vi.fn((options) => ({
        ...options,
        cookies: {
          set: vi.fn(),
        },
        type: 'next',
      })),
      redirect: vi.fn((url) => ({
        url,
        type: 'redirect',
      })),
    },
  }
})

import { updateSession } from '@/lib/supabase/middleware'

describe('Supabase Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock setup
    mockCreateServerClient.mockReturnValue({
      auth: {
        getUser: mockGetUser,
      },
    })
  })

  const createMockRequest = (pathname: string) => {
    const url = new URL(`http://localhost:3000${pathname}`)
    return {
      cookies: {
        getAll: vi.fn().mockReturnValue([]),
        set: vi.fn(),
      },
      nextUrl: {
        pathname,
        clone: () => ({
          pathname,
          toString: () => url.toString(),
        }),
      },
      url: url.toString(),
    } as unknown as NextRequest
  }

  describe('Protected Routes - Unauthenticated Users', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })
    })

    it('should redirect to login when accessing /dashboard without auth', async () => {
      const request = createMockRequest('/dashboard')

      await updateSession(request)

      expect(NextResponse.redirect).toHaveBeenCalled()
    })

    it('should redirect to login when accessing /dashboard/settings without auth', async () => {
      const request = createMockRequest('/dashboard/settings')

      await updateSession(request)

      expect(NextResponse.redirect).toHaveBeenCalled()
    })

    it('should redirect to login when accessing /dashboard/materials without auth', async () => {
      const request = createMockRequest('/dashboard/materials')

      await updateSession(request)

      expect(NextResponse.redirect).toHaveBeenCalled()
    })

    it('should redirect to login when accessing /api/protected routes without auth', async () => {
      const request = createMockRequest('/api/protected/data')

      await updateSession(request)

      expect(NextResponse.redirect).toHaveBeenCalled()
    })
  })

  describe('Protected Routes - Authenticated Users', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user_123', email: 'test@example.com' } },
        error: null,
      })
    })

    it('should allow access to /dashboard when authenticated', async () => {
      const request = createMockRequest('/dashboard')

      const result = await updateSession(request)

      expect(NextResponse.redirect).not.toHaveBeenCalled()
      expect(result.type).toBe('next')
    })

    it('should allow access to /dashboard/settings when authenticated', async () => {
      const request = createMockRequest('/dashboard/settings')

      const result = await updateSession(request)

      expect(NextResponse.redirect).not.toHaveBeenCalled()
    })

    it('should allow access to /dashboard/materials when authenticated', async () => {
      const request = createMockRequest('/dashboard/materials')

      const result = await updateSession(request)

      expect(NextResponse.redirect).not.toHaveBeenCalled()
    })
  })

  describe('Auth Pages - Authenticated Users', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user_123', email: 'test@example.com' } },
        error: null,
      })
    })

    it('should redirect to dashboard when accessing /auth/login while authenticated', async () => {
      const request = createMockRequest('/auth/login')

      await updateSession(request)

      expect(NextResponse.redirect).toHaveBeenCalled()
    })

    it('should redirect to dashboard when accessing /auth/register while authenticated', async () => {
      const request = createMockRequest('/auth/register')

      await updateSession(request)

      expect(NextResponse.redirect).toHaveBeenCalled()
    })
  })

  describe('Auth Pages - Unauthenticated Users', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })
    })

    it('should allow access to /auth/login when not authenticated', async () => {
      const request = createMockRequest('/auth/login')

      const result = await updateSession(request)

      expect(result.type).toBe('next')
    })

    it('should allow access to /auth/register when not authenticated', async () => {
      const request = createMockRequest('/auth/register')

      const result = await updateSession(request)

      expect(result.type).toBe('next')
    })
  })

  describe('Public Routes', () => {
    it('should allow access to home page without auth', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const request = createMockRequest('/')

      const result = await updateSession(request)

      expect(NextResponse.redirect).not.toHaveBeenCalled()
      expect(result.type).toBe('next')
    })

    it('should allow access to public API routes without auth', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const request = createMockRequest('/api/stripe/webhook')

      const result = await updateSession(request)

      expect(result.type).toBe('next')
    })
  })

  describe('Cookie Handling', () => {
    it('should pass cookies config to createServerClient', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const request = createMockRequest('/')

      await updateSession(request)

      expect(mockCreateServerClient).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          cookies: expect.objectContaining({
            getAll: expect.any(Function),
            setAll: expect.any(Function),
          }),
        })
      )
    })
  })

  describe('Supabase Client Creation', () => {
    it('should create server client with correct environment variables', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const request = createMockRequest('/')

      await updateSession(request)

      expect(mockCreateServerClient).toHaveBeenCalledWith(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        expect.objectContaining({
          cookies: expect.any(Object),
        })
      )
    })
  })
})
