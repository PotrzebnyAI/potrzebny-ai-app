import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock environment variables before importing
vi.stubEnv('STRIPE_STARTER_PRICE_ID', 'price_starter_test')
vi.stubEnv('STRIPE_PRO_PRICE_ID', 'price_pro_test')
vi.stubEnv('STRIPE_TEAM_PRICE_ID', 'price_team_test')

describe('Stripe Config', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  describe('STRIPE_PLANS', () => {
    it('should export STRIPE_PLANS object', async () => {
      const { STRIPE_PLANS } = await import('@/lib/stripe/config')
      expect(STRIPE_PLANS).toBeDefined()
    })

    it('should have starter plan', async () => {
      const { STRIPE_PLANS } = await import('@/lib/stripe/config')
      expect(STRIPE_PLANS.starter).toBeDefined()
    })

    it('should have pro plan', async () => {
      const { STRIPE_PLANS } = await import('@/lib/stripe/config')
      expect(STRIPE_PLANS.pro).toBeDefined()
    })

    it('should have team plan', async () => {
      const { STRIPE_PLANS } = await import('@/lib/stripe/config')
      expect(STRIPE_PLANS.team).toBeDefined()
    })
  })

  describe('Starter Plan', () => {
    it('should have correct name', async () => {
      const { STRIPE_PLANS } = await import('@/lib/stripe/config')
      expect(STRIPE_PLANS.starter.name).toBe('Starter')
    })

    it('should have correct price', async () => {
      const { STRIPE_PLANS } = await import('@/lib/stripe/config')
      expect(STRIPE_PLANS.starter.price).toBe(29)
    })

    it('should have features array', async () => {
      const { STRIPE_PLANS } = await import('@/lib/stripe/config')
      expect(Array.isArray(STRIPE_PLANS.starter.features)).toBe(true)
      expect(STRIPE_PLANS.starter.features.length).toBeGreaterThan(0)
    })

    it('should have limits object', async () => {
      const { STRIPE_PLANS } = await import('@/lib/stripe/config')
      expect(STRIPE_PLANS.starter.limits).toBeDefined()
      expect(STRIPE_PLANS.starter.limits.transcriptionMinutes).toBe(300)
      expect(STRIPE_PLANS.starter.limits.learningModes).toBe(1)
    })
  })

  describe('Pro Plan', () => {
    it('should have correct name', async () => {
      const { STRIPE_PLANS } = await import('@/lib/stripe/config')
      expect(STRIPE_PLANS.pro.name).toBe('Pro')
    })

    it('should have correct price', async () => {
      const { STRIPE_PLANS } = await import('@/lib/stripe/config')
      expect(STRIPE_PLANS.pro.price).toBe(49)
    })

    it('should have more transcription minutes than starter', async () => {
      const { STRIPE_PLANS } = await import('@/lib/stripe/config')
      expect(STRIPE_PLANS.pro.limits.transcriptionMinutes).toBeGreaterThan(
        STRIPE_PLANS.starter.limits.transcriptionMinutes
      )
    })

    it('should have more learning modes than starter', async () => {
      const { STRIPE_PLANS } = await import('@/lib/stripe/config')
      expect(STRIPE_PLANS.pro.limits.learningModes).toBeGreaterThan(
        STRIPE_PLANS.starter.limits.learningModes
      )
    })
  })

  describe('Team Plan', () => {
    it('should have correct name', async () => {
      const { STRIPE_PLANS } = await import('@/lib/stripe/config')
      expect(STRIPE_PLANS.team.name).toBe('Team')
    })

    it('should have correct price', async () => {
      const { STRIPE_PLANS } = await import('@/lib/stripe/config')
      expect(STRIPE_PLANS.team.price).toBe(79)
    })

    it('should have unlimited transcription (-1)', async () => {
      const { STRIPE_PLANS } = await import('@/lib/stripe/config')
      expect(STRIPE_PLANS.team.limits.transcriptionMinutes).toBe(-1)
    })
  })

  describe('Plan Pricing Hierarchy', () => {
    it('should have increasing prices: starter < pro < team', async () => {
      const { STRIPE_PLANS } = await import('@/lib/stripe/config')
      expect(STRIPE_PLANS.starter.price).toBeLessThan(STRIPE_PLANS.pro.price)
      expect(STRIPE_PLANS.pro.price).toBeLessThan(STRIPE_PLANS.team.price)
    })
  })

  describe('PlanKey Type', () => {
    it('should export PlanKey type', async () => {
      const { STRIPE_PLANS } = await import('@/lib/stripe/config')
      const keys = Object.keys(STRIPE_PLANS)
      expect(keys).toContain('starter')
      expect(keys).toContain('pro')
      expect(keys).toContain('team')
    })
  })

  describe('Plan Features Content', () => {
    it('starter should mention 5 hours transcription', async () => {
      const { STRIPE_PLANS } = await import('@/lib/stripe/config')
      const hasTranscriptionFeature = STRIPE_PLANS.starter.features.some(
        (f) => f.includes('5 godzin') || f.includes('transkrypcji')
      )
      expect(hasTranscriptionFeature).toBe(true)
    })

    it('pro should mention 20 hours transcription', async () => {
      const { STRIPE_PLANS } = await import('@/lib/stripe/config')
      const hasTranscriptionFeature = STRIPE_PLANS.pro.features.some(
        (f) => f.includes('20 godzin') || f.includes('transkrypcji')
      )
      expect(hasTranscriptionFeature).toBe(true)
    })

    it('team should mention unlimited transcription', async () => {
      const { STRIPE_PLANS } = await import('@/lib/stripe/config')
      const hasUnlimitedFeature = STRIPE_PLANS.team.features.some(
        (f) => f.toLowerCase().includes('nielimitowana')
      )
      expect(hasUnlimitedFeature).toBe(true)
    })
  })
})
