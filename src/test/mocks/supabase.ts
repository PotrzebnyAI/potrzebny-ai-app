import { vi } from 'vitest'

// Mock Supabase query builder
const createMockQueryBuilder = () => {
  const mockBuilder: Record<string, unknown> = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  }
  return mockBuilder
}

// Mock Supabase client
export const createMockSupabaseClient = () => {
  const mockQueryBuilder = createMockQueryBuilder()

  return {
    from: vi.fn(() => mockQueryBuilder),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
    _mockQueryBuilder: mockQueryBuilder,
  }
}

export const mockSupabaseAdmin = createMockSupabaseClient()

export const mockSupabase = () => {
  vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => mockSupabaseAdmin),
  }))

  vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(async () => mockSupabaseAdmin),
  }))

  vi.mock('@/lib/supabase/client', () => ({
    createClient: vi.fn(() => mockSupabaseAdmin),
  }))
}
