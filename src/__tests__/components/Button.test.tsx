import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render button with children', () => {
      render(<Button>Click me</Button>)

      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
    })

    it('should render with default variant (primary)', () => {
      render(<Button>Primary</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-[var(--primary)]')
    })

    it('should render with default size (md)', () => {
      render(<Button>Medium</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10')
      expect(button).toHaveClass('px-4')
    })
  })

  describe('Variants', () => {
    it('should render primary variant correctly', () => {
      render(<Button variant="primary">Primary</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-[var(--primary)]')
      expect(button).toHaveClass('text-[var(--primary-foreground)]')
    })

    it('should render secondary variant correctly', () => {
      render(<Button variant="secondary">Secondary</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-[var(--secondary)]')
      expect(button).toHaveClass('text-[var(--secondary-foreground)]')
    })

    it('should render outline variant correctly', () => {
      render(<Button variant="outline">Outline</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('border')
      expect(button).toHaveClass('border-[var(--border)]')
      expect(button).toHaveClass('bg-transparent')
    })

    it('should render ghost variant correctly', () => {
      render(<Button variant="ghost">Ghost</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-[var(--secondary)]')
    })
  })

  describe('Sizes', () => {
    it('should render small size correctly', () => {
      render(<Button size="sm">Small</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-8')
      expect(button).toHaveClass('px-3')
      expect(button).toHaveClass('text-sm')
    })

    it('should render medium size correctly', () => {
      render(<Button size="md">Medium</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10')
      expect(button).toHaveClass('px-4')
    })

    it('should render large size correctly', () => {
      render(<Button size="lg">Large</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-12')
      expect(button).toHaveClass('px-6')
      expect(button).toHaveClass('text-lg')
    })
  })

  describe('Interactivity', () => {
    it('should handle click events', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(<Button onClick={handleClick}>Click me</Button>)

      await user.click(screen.getByRole('button'))

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not trigger click when disabled', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>
      )

      await user.click(screen.getByRole('button'))

      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should have disabled styles when disabled', () => {
      render(<Button disabled>Disabled</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:pointer-events-none')
      expect(button).toHaveClass('disabled:opacity-50')
    })
  })

  describe('Accessibility', () => {
    it('should be focusable', async () => {
      const user = userEvent.setup()

      render(<Button>Focusable</Button>)

      await user.tab()

      expect(screen.getByRole('button')).toHaveFocus()
    })

    it('should have focus-visible styles', () => {
      render(<Button>Focus</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus-visible:outline-none')
      expect(button).toHaveClass('focus-visible:ring-2')
    })

    it('should not be focusable when disabled', () => {
      render(<Button disabled>Disabled</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  describe('Custom Styling', () => {
    it('should merge custom className', () => {
      render(<Button className="custom-class">Custom</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })

    it('should allow custom className to override defaults', () => {
      render(<Button className="h-20">Custom Height</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-20')
    })
  })

  describe('HTML Attributes', () => {
    it('should pass through type attribute', () => {
      render(<Button type="submit">Submit</Button>)

      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
    })

    it('should pass through id attribute', () => {
      render(<Button id="my-button">Button</Button>)

      expect(screen.getByRole('button')).toHaveAttribute('id', 'my-button')
    })

    it('should pass through aria attributes', () => {
      render(<Button aria-label="Close dialog">X</Button>)

      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Close dialog')
    })

    it('should pass through data attributes', () => {
      render(<Button data-testid="custom-button">Button</Button>)

      expect(screen.getByTestId('custom-button')).toBeInTheDocument()
    })
  })

  describe('Ref Forwarding', () => {
    it('should forward ref to button element', () => {
      const ref = vi.fn()

      render(<Button ref={ref}>Ref Button</Button>)

      expect(ref).toHaveBeenCalled()
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLButtonElement)
    })
  })

  describe('Base Styles', () => {
    it('should have inline-flex display', () => {
      render(<Button>Button</Button>)

      expect(screen.getByRole('button')).toHaveClass('inline-flex')
    })

    it('should have centered content', () => {
      render(<Button>Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('items-center')
      expect(button).toHaveClass('justify-center')
    })

    it('should have rounded corners', () => {
      render(<Button>Button</Button>)

      expect(screen.getByRole('button')).toHaveClass('rounded-lg')
    })

    it('should have font-medium', () => {
      render(<Button>Button</Button>)

      expect(screen.getByRole('button')).toHaveClass('font-medium')
    })

    it('should have transition-colors', () => {
      render(<Button>Button</Button>)

      expect(screen.getByRole('button')).toHaveClass('transition-colors')
    })
  })
})
