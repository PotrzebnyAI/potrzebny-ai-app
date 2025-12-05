"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  X,
  Zap,
  Brain,
  Trophy,
  Flame,
  Volume2,
  Shuffle,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty?: "easy" | "medium" | "hard";
  lastReviewed?: string;
  correctCount?: number;
  incorrectCount?: number;
}

interface FlashcardSessionStats {
  correct: number;
  incorrect: number;
  streak: number;
  xpEarned: number;
  timeSpent: number;
  perfectCards: string[];
}

interface InteractiveFlashcardsProps {
  cards: Flashcard[];
  onComplete?: (stats: FlashcardSessionStats) => void;
  onCardReview?: (cardId: string, correct: boolean) => void;
}

export function InteractiveFlashcards({
  cards,
  onComplete,
  onCardReview,
}: InteractiveFlashcardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState<FlashcardSessionStats>({
    correct: 0,
    incorrect: 0,
    streak: 0,
    xpEarned: 0,
    timeSpent: 0,
    perfectCards: [],
  });
  const [reviewedCards, setReviewedCards] = useState<Set<string>>(new Set());
  const [showResult, setShowResult] = useState<"correct" | "incorrect" | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>(cards);
  const [startTime] = useState(Date.now());

  // Shuffle cards
  const shuffleCards = useCallback(() => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setReviewedCards(new Set());
    setIsComplete(false);
  }, [cards]);

  useEffect(() => {
    setShuffledCards(cards);
  }, [cards]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isComplete) return;

      switch (e.key) {
        case " ":
        case "Enter":
          e.preventDefault();
          setIsFlipped((prev) => !prev);
          break;
        case "ArrowLeft":
          if (isFlipped) handleAnswer(false);
          break;
        case "ArrowRight":
          if (isFlipped) handleAnswer(true);
          break;
        case "ArrowUp":
        case "ArrowDown":
          setIsFlipped((prev) => !prev);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, isComplete]);

  const currentCard = shuffledCards[currentIndex];
  const progress = ((reviewedCards.size / shuffledCards.length) * 100).toFixed(0);

  const handleAnswer = (correct: boolean) => {
    if (!currentCard || reviewedCards.has(currentCard.id)) return;

    const newReviewed = new Set(reviewedCards).add(currentCard.id);
    setReviewedCards(newReviewed);

    const xpGained = correct ? 5 : 2;
    const newStreak = correct ? stats.streak + 1 : 0;

    setStats((prev) => ({
      ...prev,
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
      streak: newStreak,
      xpEarned: prev.xpEarned + xpGained + (newStreak >= 5 ? 3 : 0),
      perfectCards: correct
        ? [...prev.perfectCards, currentCard.id]
        : prev.perfectCards,
    }));

    setShowResult(correct ? "correct" : "incorrect");
    onCardReview?.(currentCard.id, correct);

    // Move to next card after delay
    setTimeout(() => {
      setShowResult(null);
      setIsFlipped(false);

      if (newReviewed.size >= shuffledCards.length) {
        const finalStats = {
          ...stats,
          correct: stats.correct + (correct ? 1 : 0),
          incorrect: stats.incorrect + (correct ? 0 : 1),
          xpEarned: stats.xpEarned + xpGained,
          timeSpent: Math.floor((Date.now() - startTime) / 1000),
        };
        setIsComplete(true);
        onComplete?.(finalStats);
      } else {
        // Find next unreviewed card
        let nextIndex = (currentIndex + 1) % shuffledCards.length;
        while (newReviewed.has(shuffledCards[nextIndex].id)) {
          nextIndex = (nextIndex + 1) % shuffledCards.length;
        }
        setCurrentIndex(nextIndex);
      }
    }, 500);
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pl-PL";
      speechSynthesis.speak(utterance);
    }
  };

  if (isComplete) {
    const accuracy = Math.round(
      (stats.correct / shuffledCards.length) * 100
    );
    const isPerfect = accuracy === 100;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto text-center py-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="text-6xl mb-6"
        >
          {isPerfect ? "🏆" : accuracy >= 80 ? "🎉" : accuracy >= 60 ? "👍" : "💪"}
        </motion.div>

        <h2 className="text-2xl font-bold mb-2">
          {isPerfect
            ? "Perfekcyjnie!"
            : accuracy >= 80
            ? "Świetna robota!"
            : accuracy >= 60
            ? "Dobra robota!"
            : "Nie poddawaj się!"}
        </h2>

        <p className="text-[var(--muted-foreground)] mb-8">
          Ukończyłeś sesję z {shuffledCards.length} fiszkami
        </p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-green-500/10 rounded-xl p-4">
            <Check className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-500">{stats.correct}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Poprawne</p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-4">
            <X className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-500">{stats.incorrect}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Niepoprawne</p>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-4">
            <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-500">+{stats.xpEarned}</p>
            <p className="text-xs text-[var(--muted-foreground)]">XP</p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={shuffleCards}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary)]/90 transition-colors"
          >
            <RotateCcw size={20} />
            Jeszcze raz
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-[var(--secondary)] rounded-xl hover:bg-[var(--secondary)]/80 transition-colors"
          >
            Zakończ
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Stats Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Flame className={cn("w-5 h-5", stats.streak >= 3 ? "text-orange-500" : "text-gray-400")} />
            <span className="font-medium">{stats.streak}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span className="font-medium">+{stats.xpEarned} XP</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--muted-foreground)]">
            {reviewedCards.size}/{shuffledCards.length}
          </span>
          <div className="w-24 h-2 bg-[var(--secondary)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--primary)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="relative perspective-1000 mb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard?.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="relative"
          >
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className={cn(
                "relative w-full aspect-[4/3] cursor-pointer preserve-3d transition-transform duration-500",
                isFlipped && "rotate-y-180"
              )}
              style={{
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* Front */}
              <div
                className={cn(
                  "absolute inset-0 backface-hidden rounded-2xl p-8 flex flex-col items-center justify-center text-center",
                  "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl"
                )}
                style={{ backfaceVisibility: "hidden" }}
              >
                <Brain className="w-8 h-8 mb-4 opacity-50" />
                <p className="text-xl md:text-2xl font-medium">{currentCard?.front}</p>
                <p className="text-sm mt-4 opacity-70">Kliknij lub naciśnij spację</p>
              </div>

              {/* Back */}
              <div
                className={cn(
                  "absolute inset-0 backface-hidden rounded-2xl p-8 flex flex-col items-center justify-center text-center",
                  "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl"
                )}
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <Trophy className="w-8 h-8 mb-4 opacity-50" />
                <p className="text-xl md:text-2xl font-medium">{currentCard?.back}</p>
              </div>
            </div>

            {/* Result overlay */}
            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "absolute inset-0 rounded-2xl flex items-center justify-center",
                    showResult === "correct" ? "bg-green-500/90" : "bg-red-500/90"
                  )}
                >
                  <div className="text-white text-center">
                    <div className="text-6xl mb-2">
                      {showResult === "correct" ? "✓" : "✗"}
                    </div>
                    <p className="text-xl font-bold">
                      {showResult === "correct" ? "+5 XP" : "+2 XP"}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {!isFlipped ? (
          <button
            onClick={() => setIsFlipped(true)}
            className="flex-1 max-w-xs py-4 bg-[var(--primary)] text-white rounded-xl font-medium hover:bg-[var(--primary)]/90 transition-colors"
          >
            Pokaż odpowiedź
          </button>
        ) : (
          <>
            <button
              onClick={() => handleAnswer(false)}
              className="flex-1 py-4 bg-red-500/10 text-red-500 rounded-xl font-medium hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
            >
              <X size={20} />
              Nie wiem
            </button>
            <button
              onClick={() => handleAnswer(true)}
              className="flex-1 py-4 bg-green-500/10 text-green-500 rounded-xl font-medium hover:bg-green-500/20 transition-colors flex items-center justify-center gap-2"
            >
              <Check size={20} />
              Wiem!
            </button>
          </>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={() => currentCard && speakText(isFlipped ? currentCard.back : currentCard.front)}
          className="p-2 rounded-full hover:bg-[var(--secondary)] transition-colors"
          title="Przeczytaj głośno"
        >
          <Volume2 size={20} className="text-[var(--muted-foreground)]" />
        </button>
        <button
          onClick={shuffleCards}
          className="p-2 rounded-full hover:bg-[var(--secondary)] transition-colors"
          title="Przetasuj"
        >
          <Shuffle size={20} className="text-[var(--muted-foreground)]" />
        </button>
      </div>

      {/* Keyboard hints */}
      <div className="text-center text-xs text-[var(--muted-foreground)] mt-8">
        <kbd className="px-2 py-1 bg-[var(--secondary)] rounded">Spacja</kbd> odwróć •{" "}
        <kbd className="px-2 py-1 bg-[var(--secondary)] rounded">←</kbd> nie wiem •{" "}
        <kbd className="px-2 py-1 bg-[var(--secondary)] rounded">→</kbd> wiem
      </div>
    </div>
  );
}
