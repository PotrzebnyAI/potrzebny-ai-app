import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock router
const mockPush = vi.fn()
const mockRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

// Mock Supabase auth
const mockSignInWithPassword = vi.fn()
const mockSignInWithOAuth = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signInWithOAuth: mockSignInWithOAuth,
    },
  }),
}))

import LoginPage from '@/app/auth/login/page'

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render login form', () => {
      render(<LoginPage />)

      expect(screen.getByText('Witaj ponownie')).toBeInTheDocument()
      expect(screen.getByText('Zaloguj się do swojego konta')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Hasło')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /zaloguj się/i })).toBeInTheDocument()
    })

    it('should render Google login button', () => {
      render(<LoginPage />)

      expect(screen.getByText('Kontynuuj z Google')).toBeInTheDocument()
    })

    it('should render link to registration page', () => {
      render(<LoginPage />)

      expect(screen.getByText('Nie masz konta?')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /zarejestruj się/i })).toHaveAttribute(
        'href',
        '/auth/register'
      )
    })

    it('should render potrzebny.ai logo link', () => {
      render(<LoginPage />)

      expect(screen.getByRole('link', { name: /potrzebny\.ai/i })).toHaveAttribute('href', '/')
    })
  })

  describe('Email/Password Login', () => {
    it('should call signInWithPassword on form submit', async () => {
      mockSignInWithPassword.mockResolvedValue({ error: null })
      const user = userEvent.setup()

      render(<LoginPage />)

      await user.type(screen.getByLabelText('Email'), 'test@example.com')
      await user.type(screen.getByLabelText('Hasło'), 'password123')
      await user.click(screen.getByRole('button', { name: /zaloguj się/i }))

      await waitFor(() => {
        expect(mockSignInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        })
      })
    })

    it('should redirect to dashboard on successful login', async () => {
      mockSignInWithPassword.mockResolvedValue({ error: null })
      const user = userEvent.setup()

      render(<LoginPage />)

      await user.type(screen.getByLabelText('Email'), 'test@example.com')
      await user.type(screen.getByLabelText('Hasło'), 'password123')
      await user.click(screen.getByRole('button', { name: /zaloguj się/i }))

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
        expect(mockRefresh).toHaveBeenCalled()
      })
    })

    it('should display error message on failed login', async () => {
      mockSignInWithPassword.mockResolvedValue({
        error: { message: 'Invalid login credentials' },
      })
      const user = userEvent.setup()

      render(<LoginPage />)

      await user.type(screen.getByLabelText('Email'), 'wrong@example.com')
      await user.type(screen.getByLabelText('Hasło'), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /zaloguj się/i }))

      await waitFor(() => {
        expect(screen.getByText('Invalid login credentials')).toBeInTheDocument()
      })
    })

    it('should not redirect on failed login', async () => {
      mockSignInWithPassword.mockResolvedValue({
        error: { message: 'Invalid login credentials' },
      })
      const user = userEvent.setup()

      render(<LoginPage />)

      await user.type(screen.getByLabelText('Email'), 'wrong@example.com')
      await user.type(screen.getByLabelText('Hasło'), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /zaloguj się/i }))

      await waitFor(() => {
        expect(mockPush).not.toHaveBeenCalled()
      })
    })
  })

  describe('Google OAuth Login', () => {
    it('should call signInWithOAuth when Google button clicked', async () => {
      mockSignInWithOAuth.mockResolvedValue({ error: null })
      const user = userEvent.setup()

      render(<LoginPage />)

      await user.click(screen.getByText('Kontynuuj z Google'))

      await waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalledWith({
          provider: 'google',
          options: {
            redirectTo: expect.stringContaining('/auth/callback'),
          },
        })
      })
    })

    it('should display error on OAuth failure', async () => {
      mockSignInWithOAuth.mockResolvedValue({
        error: { message: 'OAuth error' },
      })
      const user = userEvent.setup()

      render(<LoginPage />)

      await user.click(screen.getByText('Kontynuuj z Google'))

      await waitFor(() => {
        expect(screen.getByText('OAuth error')).toBeInTheDocument()
      })
    })
  })

  describe('Form Validation', () => {
    it('should have required attribute on email input', () => {
      render(<LoginPage />)

      expect(screen.getByLabelText('Email')).toBeRequired()
    })

    it('should have required attribute on password input', () => {
      render(<LoginPage />)

      expect(screen.getByLabelText('Hasło')).toBeRequired()
    })

    it('should have email type on email input', () => {
      render(<LoginPage />)

      expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')
    })

    it('should have password type on password input', () => {
      render(<LoginPage />)

      expect(screen.getByLabelText('Hasło')).toHaveAttribute('type', 'password')
    })
  })

  describe('Loading State', () => {
    it('should disable submit button while loading', async () => {
      mockSignInWithPassword.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
      )
      const user = userEvent.setup()

      render(<LoginPage />)

      await user.type(screen.getByLabelText('Email'), 'test@example.com')
      await user.type(screen.getByLabelText('Hasło'), 'password123')
      await user.click(screen.getByRole('button', { name: /zaloguj się/i }))

      // Button should be disabled during loading
      expect(screen.getByRole('button', { name: /zaloguj/i })).toBeDisabled()
    })

    it('should disable Google button while loading', async () => {
      mockSignInWithOAuth.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
      )
      const user = userEvent.setup()

      render(<LoginPage />)

      await user.click(screen.getByText('Kontynuuj z Google'))

      // Google button should be disabled
      expect(screen.getByText('Kontynuuj z Google').closest('button')).toBeDisabled()
    })
  })
})
