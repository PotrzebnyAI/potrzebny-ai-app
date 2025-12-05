"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileAudio,
  BookOpen,
  Brain,
  Zap,
  Trophy,
  Clock,
  Target,
  Flame,
  Star,
  ChevronRight,
  Play,
  Sparkles,
  Lightbulb,
  Layers,
  GraduationCap,
  BarChart3,
  Timer,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudyMode {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  xpBonus: number;
  duration: string;
  difficulty: "easy" | "medium" | "hard";
  locked?: boolean;
  popular?: boolean;
  new?: boolean;
}

const studyModes: StudyMode[] = [
  {
    id: "flashcards",
    name: "Fiszki",
    description: "Klasyczne karty do nauki z systemem powtórek",
    icon: Layers,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    xpBonus: 5,
    duration: "10-15 min",
    difficulty: "easy",
    popular: true,
  },
  {
    id: "quiz",
    name: "Quiz",
    description: "Sprawdź swoją wiedzę w interaktywnym quizie",
    icon: Target,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    xpBonus: 10,
    duration: "5-10 min",
    difficulty: "medium",
  },
  {
    id: "speed-review",
    name: "Speed Review",
    description: "Błyskawiczne powtórki na czas - ile zdążysz?",
    icon: Zap,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    xpBonus: 15,
    duration: "3-5 min",
    difficulty: "hard",
    new: true,
  },
  {
    id: "learn-mode",
    name: "Tryb Nauki",
    description: "AI uczy Cię krok po kroku z wyjaśnieniami",
    icon: GraduationCap,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    xpBonus: 8,
    duration: "15-20 min",
    difficulty: "easy",
  },
  {
    id: "spaced-repetition",
    name: "Spaced Repetition",
    description: "Naukowy system powtórek dla długiej pamięci",
    icon: Brain,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    xpBonus: 12,
    duration: "10-15 min",
    difficulty: "medium",
    popular: true,
  },
  {
    id: "ai-tutor",
    name: "AI Tutor",
    description: "Osobisty nauczyciel AI odpowiada na pytania",
    icon: Sparkles,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    xpBonus: 10,
    duration: "dowolnie",
    difficulty: "easy",
    new: true,
  },
  {
    id: "match-game",
    name: "Dopasuj Pary",
    description: "Gra memory - dopasuj pojęcia do definicji",
    icon: Lightbulb,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    xpBonus: 8,
    duration: "5-10 min",
    difficulty: "medium",
  },
  {
    id: "exam-mode",
    name: "Tryb Egzaminu",
    description: "Symulacja prawdziwego egzaminu",
    icon: GraduationCap,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    xpBonus: 20,
    duration: "30-60 min",
    difficulty: "hard",
    locked: true,
  },
];

// Mock data
const recentMaterials = [
  {
    id: "1",
    title: "Biologia - Fotosynteza",
    lastStudied: "2 godziny temu",
    progress: 75,
    totalCards: 45,
    masteredCards: 34,
  },
  {
    id: "2",
    title: "Historia - II Wojna Światowa",
    lastStudied: "wczoraj",
    progress: 45,
    totalCards: 80,
    masteredCards: 36,
  },
  {
    id: "3",
    title: "Matematyka - Całki",
    lastStudied: "3 dni temu",
    progress: 30,
    totalCards: 60,
    masteredCards: 18,
  },
];

const dailyGoals = {
  cardsReviewed: 45,
  cardsGoal: 100,
  minutesStudied: 28,
  minutesGoal: 45,
  streak: 7,
};

const difficultyColors = {
  easy: "text-green-500",
  medium: "text-yellow-500",
  hard: "text-red-500",
};

const difficultyLabels = {
  easy: "Łatwy",
  medium: "Średni",
  hard: "Trudny",
};

export default function LearnPage() {
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);

  const progressPercent = Math.round((dailyGoals.cardsReviewed / dailyGoals.cardsGoal) * 100);
  const timePercent = Math.round((dailyGoals.minutesStudied / dailyGoals.minutesGoal) * 100);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header with daily progress */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Brain className="text-indigo-500" />
            Centrum Nauki
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Wybierz tryb nauki i zdobywaj XP!
          </p>
        </div>

        {/* Daily Goals Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-5 border border-indigo-500/20 lg:min-w-[320px]"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Target size={18} className="text-indigo-500" />
              Dzisiejsze cele
            </h2>
            <div className="flex items-center gap-1 text-orange-500">
              <Flame size={18} />
              <span className="font-bold">{dailyGoals.streak} dni</span>
            </div>
          </div>

          <div className="space-y-3">
            {/* Cards Progress */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-1">
                  <Layers size={14} />
                  Fiszki
                </span>
                <span className="font-medium">
                  {dailyGoals.cardsReviewed}/{dailyGoals.cardsGoal}
                </span>
              </div>
              <div className="h-2 bg-[var(--secondary)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                />
              </div>
            </div>

            {/* Time Progress */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  Czas nauki
                </span>
                <span className="font-medium">
                  {dailyGoals.minutesStudied}/{dailyGoals.minutesGoal} min
                </span>
              </div>
              <div className="h-2 bg-[var(--secondary)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${timePercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-[var(--muted-foreground)] mt-3">
            {progressPercent >= 100
              ? "Gratulacje! Cel osiągnięty! 🎉"
              : `Jeszcze ${dailyGoals.cardsGoal - dailyGoals.cardsReviewed} fiszek do celu!`}
          </p>
        </motion.div>
      </div>

      {/* Quick Continue */}
      {recentMaterials.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Play size={20} className="text-green-500" />
            Kontynuuj naukę
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentMaterials.map((material, index) => (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedMaterial(material.id)}
                className={cn(
                  "bg-[var(--background)] rounded-xl p-5 border-2 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1",
                  selectedMaterial === material.id
                    ? "border-[var(--primary)] shadow-md"
                    : "border-transparent"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                    <BookOpen size={20} />
                  </div>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {material.lastStudied}
                  </span>
                </div>

                <h3 className="font-semibold mb-2 line-clamp-1">{material.title}</h3>

                <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-3">
                  <CheckCircle2 size={14} className="text-green-500" />
                  <span>
                    {material.masteredCards}/{material.totalCards} opanowanych
                  </span>
                </div>

                <div className="h-2 bg-[var(--secondary)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                    style={{ width: `${material.progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs font-medium text-green-500">
                    {material.progress}% ukończone
                  </span>
                  <ChevronRight size={16} className="text-[var(--muted-foreground)]" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Study Modes */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Sparkles size={20} className="text-yellow-500" />
          Tryby nauki
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {studyModes.map((mode, index) => {
            const Icon = mode.icon;
            return (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onMouseEnter={() => setHoveredMode(mode.id)}
                onMouseLeave={() => setHoveredMode(null)}
                className={cn(
                  "relative bg-[var(--background)] rounded-xl p-5 border-2 transition-all cursor-pointer group",
                  mode.locked
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:shadow-lg hover:-translate-y-1 hover:border-[var(--primary)]",
                  "border-transparent"
                )}
              >
                {/* Badges */}
                <div className="absolute -top-2 -right-2 flex gap-1">
                  {mode.popular && (
                    <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      Popular
                    </span>
                  )}
                  {mode.new && (
                    <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                      NEW
                    </span>
                  )}
                </div>

                {/* Lock overlay */}
                {mode.locked && (
                  <div className="absolute inset-0 bg-[var(--background)]/80 rounded-xl flex items-center justify-center z-10">
                    <div className="text-center">
                      <Lock className="w-8 h-8 mx-auto text-[var(--muted-foreground)] mb-2" />
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Odblokuj na poziomie 10
                      </p>
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                    mode.bgColor,
                    mode.color
                  )}
                >
                  <Icon size={24} />
                </div>

                {/* Content */}
                <h3 className="font-semibold mb-1">{mode.name}</h3>
                <p className="text-sm text-[var(--muted-foreground)] mb-4 line-clamp-2">
                  {mode.description}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <Zap size={12} className="text-yellow-500" />
                    +{mode.xpBonus} XP/karta
                  </span>
                  <span className={difficultyColors[mode.difficulty]}>
                    {difficultyLabels[mode.difficulty]}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] mt-2">
                  <Timer size={12} />
                  {mode.duration}
                </div>

                {/* Hover effect */}
                <AnimatePresence>
                  {hoveredMode === mode.id && !mode.locked && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-gradient-to-t from-[var(--primary)]/20 to-transparent rounded-xl pointer-events-none"
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Dziś przerobione",
            value: dailyGoals.cardsReviewed,
            icon: CheckCircle2,
            color: "text-green-500",
            bg: "bg-green-500/10",
          },
          {
            label: "Seria dni",
            value: dailyGoals.streak,
            icon: Flame,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
          },
          {
            label: "Czas nauki",
            value: `${dailyGoals.minutesStudied} min`,
            icon: Clock,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            label: "Zdobyte XP",
            value: 234,
            icon: Star,
            color: "text-yellow-500",
            bg: "bg-yellow-500/10",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="bg-[var(--background)] rounded-xl p-5 flex items-center gap-4"
          >
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                stat.bg,
                stat.color
              )}
            >
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-[var(--muted-foreground)]">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Motivation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-8 text-center border border-indigo-500/20"
      >
        <div className="text-4xl mb-4">🧠</div>
        <h3 className="text-xl font-bold mb-2">SuperMózg Tip</h3>
        <p className="text-[var(--muted-foreground)] max-w-xl mx-auto">
          Najlepiej uczyć się w krótkich sesjach 25-minutowych (technika Pomodoro).
          Po każdej sesji zrób 5-minutową przerwę!
        </p>
        <Link
          href="/dashboard/health"
          className="inline-flex items-center gap-2 mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Więcej porad <ChevronRight size={16} />
        </Link>
      </motion.div>

      {/* Empty state for no materials */}
      <div className="hidden">
        <div className="bg-[var(--background)] rounded-xl p-12 text-center">
          <BookOpen size={48} className="mx-auto text-[var(--muted-foreground)] mb-4" />
          <h3 className="font-semibold mb-2">Brak materiałów do nauki</h3>
          <p className="text-[var(--muted-foreground)] mb-4">
            Wgraj pierwszy materiał, aby rozpocząć naukę
          </p>
          <Link
            href="/dashboard/materials"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition-colors"
          >
            <Zap size={18} />
            Dodaj materiał
          </Link>
        </div>
      </div>
    </div>
  );
}
