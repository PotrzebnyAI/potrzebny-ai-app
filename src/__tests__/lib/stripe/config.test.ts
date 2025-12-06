import { describe, it, expect, vi } from "vitest";
import { STRIPE_PLANS } from "@/lib/stripe/config";

// Mock environment variables
vi.stubEnv("STRIPE_STARTER_PRICE_ID", "price_starter_123");
vi.stubEnv("STRIPE_PRO_PRICE_ID", "price_pro_123");
vi.stubEnv("STRIPE_TEAM_PRICE_ID", "price_team_123");

describe("Stripe Config", () => {
  describe("STRIPE_PLANS structure", () => {
    it("should have starter plan", () => {
      expect(STRIPE_PLANS).toHaveProperty("starter");
    });

    it("should have pro plan", () => {
      expect(STRIPE_PLANS).toHaveProperty("pro");
    });

    it("should have team plan", () => {
      expect(STRIPE_PLANS).toHaveProperty("team");
    });
  });

  describe("Starter plan", () => {
    it("should have correct name", () => {
      expect(STRIPE_PLANS.starter.name).toBe("Starter");
    });

    it("should have correct price", () => {
      expect(STRIPE_PLANS.starter.price).toBe(29);
    });

    it("should have features array", () => {
      expect(Array.isArray(STRIPE_PLANS.starter.features)).toBe(true);
      expect(STRIPE_PLANS.starter.features.length).toBeGreaterThan(0);
    });

    it("should have correct transcription limit (5 hours)", () => {
      expect(STRIPE_PLANS.starter.limits.transcriptionMinutes).toBe(300);
    });

    it("should have correct learning modes limit", () => {
      expect(STRIPE_PLANS.starter.limits.learningModes).toBe(1);
    });
  });

  describe("Pro plan", () => {
    it("should have correct name", () => {
      expect(STRIPE_PLANS.pro.name).toBe("Pro");
    });

    it("should have correct price", () => {
      expect(STRIPE_PLANS.pro.price).toBe(49);
    });

    it("should have features array", () => {
      expect(Array.isArray(STRIPE_PLANS.pro.features)).toBe(true);
      expect(STRIPE_PLANS.pro.features.length).toBeGreaterThan(0);
    });

    it("should have correct transcription limit (20 hours)", () => {
      expect(STRIPE_PLANS.pro.limits.transcriptionMinutes).toBe(1200);
    });

    it("should have all learning modes", () => {
      expect(STRIPE_PLANS.pro.limits.learningModes).toBe(5);
    });

    it("should be more expensive than starter", () => {
      expect(STRIPE_PLANS.pro.price).toBeGreaterThan(STRIPE_PLANS.starter.price);
    });

    it("should have more transcription minutes than starter", () => {
      expect(STRIPE_PLANS.pro.limits.transcriptionMinutes).toBeGreaterThan(
        STRIPE_PLANS.starter.limits.transcriptionMinutes
      );
    });
  });

  describe("Team plan", () => {
    it("should have correct name", () => {
      expect(STRIPE_PLANS.team.name).toBe("Team");
    });

    it("should have correct price", () => {
      expect(STRIPE_PLANS.team.price).toBe(79);
    });

    it("should have features array", () => {
      expect(Array.isArray(STRIPE_PLANS.team.features)).toBe(true);
      expect(STRIPE_PLANS.team.features.length).toBeGreaterThan(0);
    });

    it("should have unlimited transcription (-1)", () => {
      expect(STRIPE_PLANS.team.limits.transcriptionMinutes).toBe(-1);
    });

    it("should have all learning modes", () => {
      expect(STRIPE_PLANS.team.limits.learningModes).toBe(5);
    });

    it("should be more expensive than pro", () => {
      expect(STRIPE_PLANS.team.price).toBeGreaterThan(STRIPE_PLANS.pro.price);
    });
  });

  describe("Price ordering", () => {
    it("should have ascending price order: starter < pro < team", () => {
      expect(STRIPE_PLANS.starter.price).toBeLessThan(STRIPE_PLANS.pro.price);
      expect(STRIPE_PLANS.pro.price).toBeLessThan(STRIPE_PLANS.team.price);
    });
  });

  describe("Features", () => {
    it("should have Polish language features", () => {
      // Check if features contain Polish text
      const starterFeature = STRIPE_PLANS.starter.features[0];
      expect(starterFeature).toMatch(/[ąćęłńóśźż]/i);
    });

    it("team should have more features than starter", () => {
      expect(STRIPE_PLANS.team.features.length).toBeGreaterThan(
        STRIPE_PLANS.starter.features.length
      );
    });
  });
});
