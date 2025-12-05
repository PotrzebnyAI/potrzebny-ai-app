"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Star,
  Flame,
  Zap,
  Brain,
  Target,
  Clock,
  BookOpen,
  Award,
  Crown,
  Sparkles,
  Lock,
  ChevronLeft,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ACHIEVEMENTS, type Achievement } from "@/lib/gamification";

// Extended achievements with more details
const achievementsData: (Achievement & {
  category: string;
  xpReward: number;
  secret?: boolean;
})[] = [
  // Learning
  { ...ACHIEVEMENTS[0], category: "Nauka", xpReward: 50 },
  { ...ACHIEVEMENTS[1], category: "Nauka", xpReward: 100 },
  { ...ACHIEVEMENTS[2], category: "Nauka", xpReward: 200 },
  { ...ACHIEVEMENTS[3], category: "Nauka", xpReward: 500 },
  { ...ACHIEVEMENTS[4], category: "Nauka", xpReward: 150 },

  // Streaks
  { ...ACHIEVEMENTS[5], category: "Seria", xpReward: 50 },
  { ...ACHIEVEMENTS[6], category: "Seria", xpReward: 150 },
  { ...ACHIEVEMENTS[7], category: "Seria", xpReward: 500 },
  { ...ACHIEVEMENTS[8], category: "Seria", xpReward: 1000 },

  // Time
  { ...ACHIEVEMENTS[9], category: "Czas", xpReward: 25 },
  { ...ACHIEVEMENTS[10], category: "Czas", xpReward: 25 },
  { ...ACHIEVEMENTS[11], category: "Czas", xpReward: 50 },
  { ...ACHIEVEMENTS[12], category: "Czas", xpReward: 200 },

  // Levels
  { ...ACHIEVEMENTS[13], category: "Poziom", xpReward: 100 },
  { ...ACHIEVEMENTS[14], category: "Poziom", xpReward: 300 },
  { ...ACHIEVEMENTS[15], category: "Poziom", xpReward: 1000 },

  // Special
  { ...ACHIEVEMENTS[16], category: "Specjalne", xpReward: 50 },
  { ...ACHIEVEMENTS[17], category: "Specjalne", xpReward: 100 },
  { ...ACHIEVEMENTS[18], category: "Specjalne", xpReward: 300 },
  { ...ACHIEVEMENTS[19], category: "Specjalne", xpReward: 150 },

  // Health
  { ...ACHIEVEMENTS[20], category: "Wellness", xpReward: 30 },
  { ...ACHIEVEMENTS[21], category: "Wellness", xpReward: 100 },

  // Secret achievements
  {
    id: "secret_1",
    name: "???",
    description: "Sekretne osiągnięcie",
    icon: "🔮",
    rarity: "legendary",
    category: "Sekretne",
    xpReward: 500,
    secret: true,
  },
  {
    id: "secret_2",
    name: "???",
    description: "Sekretne osiągnięcie",
    icon: "👁️",
    rarity: "epic",
    category: "Sekretne",
    xpReward: 300,
    secret: true,
  },
];

// Mock user progress - w produkcji z bazy danych
const userProgress = {
  unlockedAchievements: ["first_steps", "streak_3", "night_owl", "health_aware"],
  achievementProgress: {
    flashcard_master: 45,
    quiz_champion: 3,
    perfect_10: 2,
    note_taker: 8,
    streak_7: 5,
  } as Record<string, number>,
};

const categories = ["Wszystkie", "Nauka", "Seria", "Czas", "Poziom", "Specjalne", "Wellness", "Sekretne"];
const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
const rarityColors = {
  common: "from-gray-400 to-gray-500",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-yellow-400 to-orange-500",
};
const rarityBorders = {
  common: "border-gray-300",
  rare: "border-blue-400",
  epic: "border-purple-400",
  legendary: "border-yellow-400",
};
const rarityLabels = {
  common: "Zwykłe",
  rare: "Rzadkie",
  epic: "Epickie",
  legendary: "Legendarne",
};

export default function AchievementsPage() {
  const [selectedCategory, setSelectedCategory] = useState("Wszystkie");
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  const filteredAchievements = achievementsData
    .filter((a) => selectedCategory === "Wszystkie" || a.category === selectedCategory)
    .filter((a) => !showUnlockedOnly || userProgress.unlockedAchievements.includes(a.id))
    .sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity]);

  const totalUnlocked = userProgress.unlockedAchievements.length;
  const totalAchievements = achievementsData.filter((a) => !a.secret).length;
  const completionPercent = Math.round((totalUnlocked / totalAchievements) * 100);

  const totalXPFromAchievements = achievementsData
    .filter((a) => userProgress.unlockedAchievements.includes(a.id))
    .reduce((sum, a) => sum + a.xpReward, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard"
          className="p-2 rounded-lg hover:bg-[var(--secondary)] transition-colors"
        >
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="text-yellow-500" />
            Osiągnięcia
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Zbieraj odznaki i zdobywaj dodatkowe XP
          </p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 rounded-2xl p-6 border border-yellow-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full px-2 py-1 text-sm font-bold border-2 border-yellow-400">
                {totalUnlocked}
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold">{completionPercent}%</p>
              <p className="text-[var(--muted-foreground)]">
                {totalUnlocked} z {totalAchievements} osiągnięć
              </p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-1 mt-1">
                <Zap size={14} />
                +{totalXPFromAchievements} XP z osiągnięć
              </p>
            </div>
          </div>

          {/* Rarity breakdown */}
          <div className="grid grid-cols-4 gap-3">
            {(["common", "rare", "epic", "legendary"] as const).map((rarity) => {
              const count = achievementsData.filter((a) => a.rarity === rarity && !a.secret).length;
              const unlocked = achievementsData.filter(
                (a) => a.rarity === rarity && userProgress.unlockedAchievements.includes(a.id)
              ).length;
              return (
                <div key={rarity} className="text-center">
                  <div
                    className={cn(
                      "w-10 h-10 mx-auto rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-lg mb-1",
                      rarityColors[rarity]
                    )}
                  >
                    {rarity === "legendary" ? "👑" : rarity === "epic" ? "💎" : rarity === "rare" ? "⭐" : "🏅"}
                  </div>
                  <p className="text-xs font-medium">
                    {unlocked}/{count}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">{rarityLabels[rarity]}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <Filter size={16} />
          Filtruj:
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                selectedCategory === cat
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--secondary)] hover:bg-[var(--secondary)]/80"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm ml-auto cursor-pointer">
          <input
            type="checkbox"
            checked={showUnlockedOnly}
            onChange={(e) => setShowUnlockedOnly(e.target.checked)}
            className="rounded"
          />
          Tylko odblokowane
        </label>
      </div>

      {/* Achievements Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => {
          const isUnlocked = userProgress.unlockedAchievements.includes(achievement.id);
          const progress = userProgress.achievementProgress[achievement.id];
          const progressPercent = progress && achievement.maxProgress
            ? Math.min((progress / achievement.maxProgress) * 100, 100)
            : 0;

          return (
            <div
              key={achievement.id}
              className={cn(
                "relative bg-[var(--background)] rounded-xl p-5 border-2 transition-all",
                isUnlocked
                  ? `${rarityBorders[achievement.rarity]} shadow-lg`
                  : "border-transparent opacity-60 grayscale"
              )}
            >
              {/* Rarity badge */}
              <div
                className={cn(
                  "absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-bold text-white bg-gradient-to-r",
                  rarityColors[achievement.rarity]
                )}
              >
                {rarityLabels[achievement.rarity]}
              </div>

              {/* Icon */}
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center text-3xl",
                    isUnlocked
                      ? `bg-gradient-to-br ${rarityColors[achievement.rarity]} shadow-lg`
                      : "bg-[var(--secondary)]"
                  )}
                >
                  {achievement.secret && !isUnlocked ? (
                    <Lock className="w-6 h-6 text-[var(--muted-foreground)]" />
                  ) : (
                    achievement.icon
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold">
                    {achievement.secret && !isUnlocked ? "???" : achievement.name}
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
                    {achievement.secret && !isUnlocked
                      ? "Odkryj to sekretne osiągnięcie"
                      : achievement.description}
                  </p>

                  {/* Progress bar */}
                  {!isUnlocked && progress !== undefined && achievement.maxProgress && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Postęp</span>
                        <span>
                          {progress}/{achievement.maxProgress}
                        </span>
                      </div>
                      <div className="h-2 bg-[var(--secondary)] rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full bg-gradient-to-r transition-all",
                            rarityColors[achievement.rarity]
                          )}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* XP reward */}
                  <div className="flex items-center gap-2 mt-2">
                    <Zap size={14} className="text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                      +{achievement.xpReward} XP
                    </span>
                    {isUnlocked && (
                      <span className="text-xs text-green-500 font-medium ml-auto">
                        ✓ Zdobyte
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 mx-auto text-[var(--muted-foreground)] mb-4" />
          <p className="text-[var(--muted-foreground)]">
            Brak osiągnięć w tej kategorii
          </p>
        </div>
      )}

      {/* Motivation */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 text-center border border-purple-500/20">
        <Sparkles className="w-8 h-8 mx-auto text-purple-500 mb-3" />
        <p className="font-medium mb-2">
          {totalUnlocked < 5
            ? "Dopiero zaczynasz swoją przygodę! 🚀"
            : totalUnlocked < 10
            ? "Świetnie Ci idzie! Tak trzymaj! 💪"
            : totalUnlocked < 15
            ? "Jesteś prawdziwym kolekcjonerem! 🏆"
            : "Legenda! Prawie wszystkie osiągnięcia! 👑"}
        </p>
        <p className="text-sm text-[var(--muted-foreground)]">
          Każde osiągnięcie przybliża Cię do mistrzostwa
        </p>
      </div>
    </div>
  );
}
