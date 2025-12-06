import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key')
vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_123')
vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test_123')
vi.stubEnv('STRIPE_STARTER_PRICE_ID', 'price_starter_123')
vi.stubEnv('STRIPE_PRO_PRICE_ID', 'price_pro_123')
vi.stubEnv('STRIPE_TEAM_PRICE_ID', 'price_team_123')
vi.stubEnv('OPENAI_API_KEY', 'sk-test-openai-key')

// Mock Next.js headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({
    get: vi.fn((name: string) => {
      if (name === 'stripe-signature') return 'test_signature'
      if (name === 'origin') return 'http://localhost:3000'
      return null
    }),
  })),
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}))

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  })),
  useSearchParams: vi.fn(() => ({
    get: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
}))
