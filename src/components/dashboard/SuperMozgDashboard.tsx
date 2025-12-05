"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Flame,
  Zap,
  Trophy,
  Target,
  BookOpen,
  Brain,
  Sparkles,
  ChevronRight,
  Play,
  Clock,
  TrendingUp,
  Star,
  Award,
  Gift,
  Lightbulb,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getLevelFromXP,
  getLevelTitle,
  XP_REWARDS,
  type Achievement,
  type DailyChallenge,
} from "@/lib/gamification";

interface SuperMozgDashboardProps {
  user: {
    id: string;
    email: string;
  };
  profile: {
    full_name: string | null;
    learning_mode: string;
    subscription_tier: string;
  } | null;
  stats: {
    xp: number;
    streak: number;
    materialsCount: number;
    quizzesCompleted: number;
    flashcardsReviewed: number;
    studyMinutes: number;
  };
  recentMaterials: {
    id: string;
    title: string;
    status: string;
    created_at: string;
  }[];
  achievements: Achievement[];
  dailyChallenges: DailyChallenge[];
}

export function SuperMozgDashboard({
  user,
  profile,
  stats,
  recentMaterials,
  achievements,
  dailyChallenges,
}: SuperMozgDashboardProps) {
  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false);
  const [greeting, setGreeting] = useState("");

  const levelInfo = getLevelFromXP(stats.xp);
  const levelTitle = getLevelTitle(levelInfo.level);

  // Dynamic greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    const name = profile?.full_name?.split(" ")[0] || "Uczniu";

    if (hour < 6) setGreeting(`Nocna sesja, ${name}? 🦉`);
    else if (hour < 12) setGreeting(`Dzień dobry, ${name}! ☀️`);
    else if (hour < 18) setGreeting(`Cześć, ${name}! 👋`);
    else if (hour < 22) setGreeting(`Dobry wieczór, ${name}! 🌙`);
    else setGreeting(`Późna nauka, ${name}? 🌟`);
  }, [profile?.full_name]);

  // Quick action cards
  const quickActions = [
    {
      title: "Szybki Quiz",
      description: "5 pytań, 2 minuty",
      icon: Zap,
      color: "from-yellow-500 to-orange-500",
      href: "/dashboard/learn?mode=quick-quiz",
      xp: `+${XP_REWARDS.quiz_complete} XP`,
    },
    {
      title: "Fiszki",
      description: "Powtórka z AI",
      icon: Brain,
      color: "from-purple-500 to-pink-500",
      href: "/dashboard/learn?mode=flashcards",
      xp: `+${XP_REWARDS.flashcard_correct} XP/karta`,
    },
    {
      title: "Nowa Notatka",
      description: "9 formatów AI",
      icon: BookOpen,
      color: "from-blue-500 to-cyan-500",
      href: "/dashboard/materials?action=create-notes",
      xp: `+${XP_REWARDS.notes_create} XP`,
    },
    {
      title: "SuperMózg Chat",
      description: "Twój asystent AI",
      icon: Sparkles,
      color: "from-green-500 to-emerald-500",
      href: "/dashboard/chat",
      xp: "Unlimited",
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Hero Section - XP & Level */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 text-white shadow-xl">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse delay-300" />
        </div>

        <div className="relative z-10">
          {/* Greeting & Streak */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">{greeting}</h1>
              <p className="text-white/80">
                {levelTitle.emoji} {levelTitle.title} • Poziom {levelInfo.level}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Flame className="text-orange-300 animate-pulse" size={24} />
              <span className="font-bold text-lg">{stats.streak}</span>
              <span className="text-white/80 text-sm">dni</span>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="flex items-center gap-1">
                <Star size={16} className="text-yellow-300" />
                {stats.xp.toLocaleString()} XP
              </span>
              <span className="text-white/80">
                {levelInfo.xpForNextLevel - levelInfo.currentXP} XP do poziomu {levelInfo.level + 1}
              </span>
            </div>
            <div className="h-4 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-200 rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${levelInfo.progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>

          {/* Today's Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{stats.studyMinutes}</p>
              <p className="text-xs text-white/70">minut dzisiaj</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{stats.flashcardsReviewed}</p>
              <p className="text-xs text-white/70">fiszek</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{stats.quizzesCompleted}</p>
              <p className="text-xs text-white/70">quizów</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Challenges */}
      <div className="bg-[var(--background)] rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="text-orange-500" size={20} />
            <h2 className="font-semibold">Dzisiejsze Wyzwania</h2>
          </div>
          <span className="text-sm text-[var(--muted-foreground)]">
            Resetują się za{" "}
            {Math.floor((new Date().setHours(24, 0, 0, 0) - Date.now()) / 3600000)}h
          </span>
        </div>
        <div className="space-y-3">
          {dailyChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg border transition-all",
                challenge.completed
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-[var(--secondary)] border-transparent hover:border-[var(--primary)]/30"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  challenge.completed ? "bg-green-500 text-white" : "bg-orange-500/20 text-orange-500"
                )}
              >
                {challenge.completed ? "✓" : challenge.type === "flashcards" ? "🃏" : challenge.type === "quiz" ? "❓" : "⏱️"}
              </div>
              <div className="flex-1">
                <p className="font-medium">{challenge.title}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        challenge.completed ? "bg-green-500" : "bg-orange-500"
                      )}
                      style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {challenge.progress}/{challenge.target}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-[var(--primary)]">
                  +{challenge.xpReward} XP
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Play className="text-[var(--primary)]" size={20} />
          Szybki Start
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group relative overflow-hidden rounded-xl p-4 bg-[var(--background)] shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div
                className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br",
                  action.color
                )}
              />
              <div className="relative z-10">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br text-white",
                    action.color
                  )}
                >
                  <action.icon size={24} />
                </div>
                <h3 className="font-semibold group-hover:text-white transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] group-hover:text-white/80 transition-colors">
                  {action.description}
                </p>
                <p className="text-xs mt-2 font-medium text-[var(--primary)] group-hover:text-yellow-300 transition-colors">
                  {action.xp}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Materials */}
        <div className="bg-[var(--background)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Clock className="text-blue-500" size={20} />
              Ostatnio Dodane
            </h2>
            <Link
              href="/dashboard/materials"
              className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1"
            >
              Wszystkie <ChevronRight size={16} />
            </Link>
          </div>
          {recentMaterials.length > 0 ? (
            <div className="space-y-3">
              {recentMaterials.slice(0, 4).map((material) => (
                <Link
                  key={material.id}
                  href={`/dashboard/materials/${material.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--secondary)] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                    📄
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{material.title}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {new Date(material.created_at).toLocaleDateString("pl-PL")}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      material.status === "completed"
                        ? "bg-green-500/10 text-green-500"
                        : material.status === "processing"
                        ? "bg-yellow-500/10 text-yellow-500"
                        : "bg-gray-500/10 text-gray-500"
                    )}
                  >
                    {material.status === "completed" ? "Gotowy" : material.status === "processing" ? "..." : "Nowy"}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📚</div>
              <p className="text-[var(--muted-foreground)] mb-4">
                Brak materiałów. Dodaj pierwszy!
              </p>
              <Link
                href="/dashboard/materials"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors"
              >
                Dodaj materiał
              </Link>
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="bg-[var(--background)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Trophy className="text-yellow-500" size={20} />
              Osiągnięcia
            </h2>
            <Link
              href="/dashboard/achievements"
              className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1"
            >
              Wszystkie <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {achievements.slice(0, 8).map((achievement) => (
              <div
                key={achievement.id}
                className={cn(
                  "aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all",
                  achievement.unlockedAt
                    ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/30"
                    : "bg-[var(--secondary)] opacity-50 grayscale"
                )}
                title={`${achievement.name}: ${achievement.description}`}
              >
                <span className="text-2xl">{achievement.icon}</span>
                <span className="text-xs mt-1 text-center line-clamp-1">{achievement.name}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-[var(--muted-foreground)]">
              {achievements.filter(a => a.unlockedAt).length}/{achievements.length} odblokowanych
            </span>
            <Link href="/dashboard/achievements" className="text-[var(--primary)] hover:underline">
              Zobacz postęp
            </Link>
          </div>
        </div>
      </div>

      {/* Health & Wellness Tip (Aldehyde awareness without medical claims) */}
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-5 border border-green-500/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-500">
            <Lightbulb size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-green-700 dark:text-green-400 flex items-center gap-2">
              <Heart size={16} /> Wskazówka SuperMózg
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Wiedziałeś, że rośliny jak Skrzydłokwiat czy Sansewieria pomagają oczyszczać powietrze z aldehydów?
              Dobra jakość powietrza wspiera koncentrację i pamięć podczas nauki! 🌱
            </p>
            <Link
              href="/dashboard/health"
              className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400 mt-2 hover:underline"
            >
              Dowiedz się więcej o optymalizacji środowiska <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Motivational Footer */}
      <div className="text-center py-4">
        <p className="text-[var(--muted-foreground)] text-sm">
          &quot;Każda minuta nauki to inwestycja w Twoją przyszłość&quot; ✨
        </p>
      </div>
    </div>
  );
}
