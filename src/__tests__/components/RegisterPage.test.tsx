import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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
const mockSignUp = vi.fn()
const mockSignInWithOAuth = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signUp: mockSignUp,
      signInWithOAuth: mockSignInWithOAuth,
    },
  }),
}))

import RegisterPage from '@/app/auth/register/page'

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render registration form', () => {
      render(<RegisterPage />)

      expect(screen.getByRole('heading', { name: /utwórz konto/i })).toBeInTheDocument()
      expect(screen.getByText('Zacznij korzystać z AI już dziś')).toBeInTheDocument()
      expect(screen.getByLabelText('Imię i nazwisko')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Hasło')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /utwórz konto/i })).toBeInTheDocument()
    })

    it('should render Google signup button', () => {
      render(<RegisterPage />)

      expect(screen.getByText('Kontynuuj z Google')).toBeInTheDocument()
    })

    it('should render link to login page', () => {
      render(<RegisterPage />)

      expect(screen.getByText('Masz już konto?')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /zaloguj się/i })).toHaveAttribute(
        'href',
        '/auth/login'
      )
    })

    it('should render potrzebny.ai logo link', () => {
      render(<RegisterPage />)

      expect(screen.getByRole('link', { name: /potrzebny\.ai/i })).toHaveAttribute('href', '/')
    })

    it('should render terms and privacy links', () => {
      render(<RegisterPage />)

      expect(screen.getByRole('link', { name: /regulamin/i })).toHaveAttribute('href', '/terms')
      expect(screen.getByRole('link', { name: /politykę prywatności/i })).toHaveAttribute(
        'href',
        '/privacy'
      )
    })

    it('should show password requirements', () => {
      render(<RegisterPage />)

      expect(screen.getByText('Minimum 8 znaków')).toBeInTheDocument()
    })
  })

  describe('Email/Password Registration', () => {
    it('should call signUp on form submit', async () => {
      mockSignUp.mockResolvedValue({ error: null })
      const user = userEvent.setup()

      render(<RegisterPage />)

      await user.type(screen.getByLabelText('Imię i nazwisko'), 'Jan Kowalski')
      await user.type(screen.getByLabelText('Email'), 'jan@example.com')
      await user.type(screen.getByLabelText('Hasło'), 'password123')
      await user.click(screen.getByRole('button', { name: /utwórz konto/i }))

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'jan@example.com',
          password: 'password123',
          options: {
            data: {
              full_name: 'Jan Kowalski',
            },
            emailRedirectTo: expect.stringContaining('/auth/callback'),
          },
        })
      })
    })

    it('should show success message after registration', async () => {
      mockSignUp.mockResolvedValue({ error: null })
      const user = userEvent.setup()

      render(<RegisterPage />)

      await user.type(screen.getByLabelText('Imię i nazwisko'), 'Jan Kowalski')
      await user.type(screen.getByLabelText('Email'), 'jan@example.com')
      await user.type(screen.getByLabelText('Hasło'), 'password123')
      await user.click(screen.getByRole('button', { name: /utwórz konto/i }))

      await waitFor(() => {
        expect(screen.getByText('Sprawdź swoją skrzynkę')).toBeInTheDocument()
        expect(screen.getByText(/jan@example.com/)).toBeInTheDocument()
      })
    })

    it('should show back to login link after success', async () => {
      mockSignUp.mockResolvedValue({ error: null })
      const user = userEvent.setup()

      render(<RegisterPage />)

      await user.type(screen.getByLabelText('Imię i nazwisko'), 'Jan Kowalski')
      await user.type(screen.getByLabelText('Email'), 'jan@example.com')
      await user.type(screen.getByLabelText('Hasło'), 'password123')
      await user.click(screen.getByRole('button', { name: /utwórz konto/i }))

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /wróć do logowania/i })).toHaveAttribute(
          'href',
          '/auth/login'
        )
      })
    })

    it('should display error message on failed registration', async () => {
      mockSignUp.mockResolvedValue({
        error: { message: 'User already registered' },
      })
      const user = userEvent.setup()

      render(<RegisterPage />)

      await user.type(screen.getByLabelText('Imię i nazwisko'), 'Jan Kowalski')
      await user.type(screen.getByLabelText('Email'), 'existing@example.com')
      await user.type(screen.getByLabelText('Hasło'), 'password123')
      await user.click(screen.getByRole('button', { name: /utwórz konto/i }))

      await waitFor(() => {
        expect(screen.getByText('User already registered')).toBeInTheDocument()
      })
    })

    it('should not show success message on failed registration', async () => {
      mockSignUp.mockResolvedValue({
        error: { message: 'Registration failed' },
      })
      const user = userEvent.setup()

      render(<RegisterPage />)

      await user.type(screen.getByLabelText('Imię i nazwisko'), 'Jan Kowalski')
      await user.type(screen.getByLabelText('Email'), 'jan@example.com')
      await user.type(screen.getByLabelText('Hasło'), 'password123')
      await user.click(screen.getByRole('button', { name: /utwórz konto/i }))

      await waitFor(() => {
        expect(screen.queryByText('Sprawdź swoją skrzynkę')).not.toBeInTheDocument()
      })
    })
  })

  describe('Google OAuth Registration', () => {
    it('should call signInWithOAuth when Google button clicked', async () => {
      mockSignInWithOAuth.mockResolvedValue({ error: null })
      const user = userEvent.setup()

      render(<RegisterPage />)

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
        error: { message: 'OAuth provider error' },
      })
      const user = userEvent.setup()

      render(<RegisterPage />)

      await user.click(screen.getByText('Kontynuuj z Google'))

      await waitFor(() => {
        expect(screen.getByText('OAuth provider error')).toBeInTheDocument()
      })
    })
  })

  describe('Form Validation', () => {
    it('should have required attribute on full name input', () => {
      render(<RegisterPage />)

      expect(screen.getByLabelText('Imię i nazwisko')).toBeRequired()
    })

    it('should have required attribute on email input', () => {
      render(<RegisterPage />)

      expect(screen.getByLabelText('Email')).toBeRequired()
    })

    it('should have required attribute on password input', () => {
      render(<RegisterPage />)

      expect(screen.getByLabelText('Hasło')).toBeRequired()
    })

    it('should have email type on email input', () => {
      render(<RegisterPage />)

      expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')
    })

    it('should have password type on password input', () => {
      render(<RegisterPage />)

      expect(screen.getByLabelText('Hasło')).toHaveAttribute('type', 'password')
    })

    it('should have minLength 8 on password input', () => {
      render(<RegisterPage />)

      expect(screen.getByLabelText('Hasło')).toHaveAttribute('minLength', '8')
    })
  })

  describe('Loading State', () => {
    it('should disable submit button while loading', async () => {
      mockSignUp.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
      )
      const user = userEvent.setup()

      render(<RegisterPage />)

      await user.type(screen.getByLabelText('Imię i nazwisko'), 'Jan Kowalski')
      await user.type(screen.getByLabelText('Email'), 'jan@example.com')
      await user.type(screen.getByLabelText('Hasło'), 'password123')
      await user.click(screen.getByRole('button', { name: /utwórz konto/i }))

      expect(screen.getByRole('button', { name: /utwórz/i })).toBeDisabled()
    })

    it('should disable Google button while loading', async () => {
      mockSignInWithOAuth.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
      )
      const user = userEvent.setup()

      render(<RegisterPage />)

      await user.click(screen.getByText('Kontynuuj z Google'))

      expect(screen.getByText('Kontynuuj z Google').closest('button')).toBeDisabled()
    })
  })

  describe('Input Placeholders', () => {
    it('should have correct placeholder for full name', () => {
      render(<RegisterPage />)

      expect(screen.getByLabelText('Imię i nazwisko')).toHaveAttribute('placeholder', 'Jan Kowalski')
    })

    it('should have correct placeholder for email', () => {
      render(<RegisterPage />)

      expect(screen.getByLabelText('Email')).toHaveAttribute('placeholder', 'twoj@email.pl')
    })
  })
})
