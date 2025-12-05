"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Sparkles,
  Zap,
  BookOpen,
  Trophy,
  Heart,
  ChevronRight,
  ChevronLeft,
  Check,
  Upload,
  Layers,
  Target,
  Flame,
  Star,
  GraduationCap,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  features?: string[];
  action?: string;
  image?: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Witaj w SuperMózg AI! 🧠",
    description:
      "Rozpoczynasz przygodę z najnowocześniejszą platformą do nauki w Polsce. Przygotuj się na rewolucję w Twoim uczeniu się!",
    icon: Brain,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    features: [
      "AI automatycznie przetwarza Twoje materiały",
      "Fiszki, quizy i notatki generowane w sekundach",
      "Gamifikacja - zdobywaj XP i odznaki",
    ],
  },
  {
    id: "upload",
    title: "Wgraj materiały 📚",
    description:
      "Wgraj swoje wykłady, notatki lub nagrania. Nasza AI je przetworzy i stworzy spersonalizowane materiały do nauki.",
    icon: Upload,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    features: [
      "Pliki audio i video - wykłady, nagrania",
      "Dokumenty PDF, Word, PowerPoint",
      "Zdjęcia notatek i tablicy",
    ],
    action: "Wgraj pierwszy materiał",
  },
  {
    id: "flashcards",
    title: "Fiszki & Quizy 🎯",
    description:
      "AI automatycznie generuje fiszki i quizy z Twoich materiałów. Ucz się efektywnie metodą spaced repetition!",
    icon: Layers,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    features: [
      "Automatycznie generowane fiszki",
      "Interaktywne quizy z feedbackiem",
      "System powtórek dla trwałej pamięci",
    ],
  },
  {
    id: "gamification",
    title: "Zdobywaj XP i Odznaki! 🏆",
    description:
      "Każda sesja nauki to szansa na zdobycie punktów doświadczenia. Rywalizuj ze znajomymi i wspinaj się w rankingu!",
    icon: Trophy,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    features: [
      "15 poziomów do zdobycia",
      "Ponad 20 unikalnych odznak",
      "Serie dni - buduj codzienne nawyki",
    ],
  },
  {
    id: "wellness",
    title: "Dbaj o siebie 💚",
    description:
      "Nauka to nie wszystko! SuperMózg dba też o Twoje zdrowie i samopoczucie. Odkryj sekcję Wellness.",
    icon: Heart,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    features: [
      "Porady wellness i biohacking",
      "Przypomnienia o przerwach",
      "Informacje o jakości powietrza",
    ],
  },
  {
    id: "ready",
    title: "Gotowe! Zaczynamy! 🚀",
    description:
      "Jesteś gotowy, aby rozpocząć naukę z SuperMózg AI. Wgraj pierwszy materiał i zobacz, jak AI odmieni Twoje uczenie się!",
    icon: Sparkles,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    features: [
      "7 dni PRO za darmo na start",
      "+100 XP bonusu powitalnego",
      "Dostęp do wszystkich trybów nauki",
    ],
    action: "Zacznij naukę!",
  },
];

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const step = onboardingSteps[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === onboardingSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const nextStep = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (!isFirstStep) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const skipOnboarding = () => {
    onComplete();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") nextStep();
      if (e.key === "ArrowLeft") prevStep();
      if (e.key === "Escape") skipOnboarding();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Close button */}
        <button
          onClick={skipOnboarding}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
        >
          <X size={20} className="text-gray-400" />
        </button>

        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-800">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentStep + 1) / onboardingSteps.length) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content */}
        <div className="p-8 pt-12">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step.id}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className={cn(
                  "w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center",
                  step.bgColor
                )}
              >
                <Icon className={cn("w-12 h-12", step.color)} />
              </motion.div>

              {/* Title */}
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{step.title}</h2>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                {step.description}
              </p>

              {/* Features */}
              {step.features && (
                <div className="space-y-3 mb-8 max-w-md mx-auto">
                  {step.features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="flex items-center gap-3 text-left bg-gray-50 dark:bg-gray-800 rounded-xl p-3"
                    >
                      <div className={cn("p-1 rounded-full", step.bgColor)}>
                        <Check size={14} className={step.color} />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Bonus badge for last step */}
              {isLastStep && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-full px-4 py-2 mb-6"
                >
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium">
                    +100 XP bonusu powitalnego!
                  </span>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="px-8 pb-8 flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={isFirstStep}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl transition-colors",
              isFirstStep
                ? "opacity-0 pointer-events-none"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            <ChevronLeft size={20} />
            Wstecz
          </button>

          {/* Step indicators */}
          <div className="flex items-center gap-2">
            {onboardingSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentStep ? 1 : -1);
                  setCurrentStep(index);
                }}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all",
                  index === currentStep
                    ? "w-8 bg-gradient-to-r from-indigo-500 to-purple-500"
                    : index < currentStep
                    ? "bg-indigo-500"
                    : "bg-gray-200 dark:bg-gray-700"
                )}
              />
            ))}
          </div>

          <button
            onClick={nextStep}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all",
              isLastStep
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg"
                : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            )}
          >
            {isLastStep ? (
              <>
                Zaczynamy!
                <Sparkles size={18} />
              </>
            ) : (
              <>
                Dalej
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>

        {/* Skip link */}
        <div className="text-center pb-6">
          <button
            onClick={skipOnboarding}
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            Pomiń wprowadzenie
          </button>
        </div>
      </motion.div>
    </div>
  );
}
