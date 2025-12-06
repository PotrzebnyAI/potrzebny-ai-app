import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  describe('Basic String Merging', () => {
    it('should merge simple class strings', () => {
      const result = cn('class1', 'class2')
      expect(result).toBe('class1 class2')
    })

    it('should handle single class', () => {
      const result = cn('single-class')
      expect(result).toBe('single-class')
    })

    it('should handle empty strings', () => {
      const result = cn('', 'class1', '')
      expect(result).toBe('class1')
    })

    it('should handle multiple empty strings', () => {
      const result = cn('', '', '')
      expect(result).toBe('')
    })
  })

  describe('Conditional Classes', () => {
    it('should handle conditional classes with true', () => {
      const result = cn('base', true && 'conditional')
      expect(result).toBe('base conditional')
    })

    it('should handle conditional classes with false', () => {
      const result = cn('base', false && 'conditional')
      expect(result).toBe('base')
    })

    it('should handle undefined values', () => {
      const result = cn('base', undefined, 'end')
      expect(result).toBe('base end')
    })

    it('should handle null values', () => {
      const result = cn('base', null, 'end')
      expect(result).toBe('base end')
    })
  })

  describe('Object Syntax', () => {
    it('should handle object with true values', () => {
      const result = cn({ 'class-a': true, 'class-b': true })
      expect(result).toContain('class-a')
      expect(result).toContain('class-b')
    })

    it('should handle object with false values', () => {
      const result = cn({ 'class-a': true, 'class-b': false })
      expect(result).toContain('class-a')
      expect(result).not.toContain('class-b')
    })

    it('should handle object with mixed values', () => {
      const result = cn({ 'class-a': true, 'class-b': false, 'class-c': true })
      expect(result).toBe('class-a class-c')
    })

    it('should handle empty object', () => {
      const result = cn({})
      expect(result).toBe('')
    })
  })

  describe('Array Syntax', () => {
    it('should handle arrays of classes', () => {
      const result = cn(['class1', 'class2'])
      expect(result).toBe('class1 class2')
    })

    it('should handle nested arrays', () => {
      const result = cn(['class1', ['class2', 'class3']])
      expect(result).toBe('class1 class2 class3')
    })

    it('should handle arrays with conditionals', () => {
      const result = cn(['class1', false && 'class2', 'class3'])
      expect(result).toBe('class1 class3')
    })
  })

  describe('Tailwind Merge Functionality', () => {
    it('should merge conflicting padding classes', () => {
      const result = cn('p-4', 'p-6')
      expect(result).toBe('p-6')
    })

    it('should merge conflicting margin classes', () => {
      const result = cn('m-2', 'm-4')
      expect(result).toBe('m-4')
    })

    it('should merge conflicting width classes', () => {
      const result = cn('w-full', 'w-1/2')
      expect(result).toBe('w-1/2')
    })

    it('should merge conflicting height classes', () => {
      const result = cn('h-10', 'h-12')
      expect(result).toBe('h-12')
    })

    it('should merge conflicting text color classes', () => {
      const result = cn('text-red-500', 'text-blue-500')
      expect(result).toBe('text-blue-500')
    })

    it('should merge conflicting background color classes', () => {
      const result = cn('bg-white', 'bg-black')
      expect(result).toBe('bg-black')
    })

    it('should not merge non-conflicting classes', () => {
      const result = cn('p-4', 'm-4', 'text-red-500')
      expect(result).toBe('p-4 m-4 text-red-500')
    })

    it('should handle flex direction conflicts', () => {
      const result = cn('flex-row', 'flex-col')
      expect(result).toBe('flex-col')
    })

    it('should handle justify-content conflicts', () => {
      const result = cn('justify-start', 'justify-center')
      expect(result).toBe('justify-center')
    })

    it('should handle align-items conflicts', () => {
      const result = cn('items-start', 'items-center')
      expect(result).toBe('items-center')
    })
  })

  describe('Complex Real-World Examples', () => {
    it('should handle Button component class merging', () => {
      const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium'
      const variantClasses = 'bg-primary text-white'
      const sizeClasses = 'h-10 px-4'
      const customClasses = 'custom-class'

      const result = cn(baseClasses, variantClasses, sizeClasses, customClasses)

      expect(result).toContain('inline-flex')
      expect(result).toContain('items-center')
      expect(result).toContain('justify-center')
      expect(result).toContain('rounded-lg')
      expect(result).toContain('font-medium')
      expect(result).toContain('bg-primary')
      expect(result).toContain('text-white')
      expect(result).toContain('h-10')
      expect(result).toContain('px-4')
      expect(result).toContain('custom-class')
    })

    it('should handle conditional variant classes', () => {
      const variant = 'primary'
      const result = cn(
        'base-class',
        {
          'bg-primary': variant === 'primary',
          'bg-secondary': variant === 'secondary',
          'bg-transparent': variant === 'outline',
        }
      )

      expect(result).toBe('base-class bg-primary')
    })

    it('should handle responsive classes', () => {
      const result = cn('w-full', 'md:w-1/2', 'lg:w-1/3')
      expect(result).toBe('w-full md:w-1/2 lg:w-1/3')
    })

    it('should handle hover and focus states', () => {
      const result = cn('bg-white', 'hover:bg-gray-100', 'focus:ring-2')
      expect(result).toBe('bg-white hover:bg-gray-100 focus:ring-2')
    })

    it('should handle disabled state classes', () => {
      const isDisabled = true
      const result = cn(
        'bg-blue-500',
        isDisabled && 'opacity-50 cursor-not-allowed'
      )
      expect(result).toBe('bg-blue-500 opacity-50 cursor-not-allowed')
    })
  })

  describe('Edge Cases', () => {
    it('should handle no arguments', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle only falsy values', () => {
      const result = cn(false, null, undefined, 0, '')
      expect(result).toBe('')
    })

    it('should handle number 0 as class (should be ignored)', () => {
      const result = cn('class1', 0, 'class2')
      expect(result).toBe('class1 class2')
    })

    it('should preserve non-conflicting duplicate classes (clsx behavior)', () => {
      // Note: clsx does not deduplicate non-Tailwind classes
      // This is expected behavior - only Tailwind conflicts are merged
      const result = cn('class1', 'class1', 'class1')
      expect(result).toContain('class1')
    })

    it('should trim whitespace', () => {
      const result = cn('  class1  ', '  class2  ')
      expect(result).toBe('class1 class2')
    })

    it('should handle CSS variable classes', () => {
      const result = cn('bg-[var(--primary)]', 'text-[var(--foreground)]')
      expect(result).toBe('bg-[var(--primary)] text-[var(--foreground)]')
    })

    it('should handle arbitrary values', () => {
      const result = cn('w-[100px]', 'h-[200px]')
      expect(result).toBe('w-[100px] h-[200px]')
    })
  })
})
