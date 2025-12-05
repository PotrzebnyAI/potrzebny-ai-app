"use client";

import { useState, useEffect } from "react";
import { OnboardingModal } from "./OnboardingModal";

const ONBOARDING_KEY = "supermozg_onboarding_completed";

export function OnboardingWrapper() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  };

  const handleClose = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  };

  return (
    <OnboardingModal
      isOpen={showOnboarding}
      onClose={handleClose}
      onComplete={handleComplete}
    />
  );
}
