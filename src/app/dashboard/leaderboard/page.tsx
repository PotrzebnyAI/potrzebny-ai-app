"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Crown,
  Medal,
  Star,
  Flame,
  Zap,
  ChevronLeft,
  Users,
  Globe,
  School,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getLevelFromXP, getLevelTitle } from "@/lib/gamification";

interface LeaderboardEntry {
  rank: number;
  previousRank?: number;
  userId: string;
  name: string;
  avatar?: string;
  xp: number;
  level: number;
  streak: number;
  achievements: number;
  school?: string;
  isCurrentUser?: boolean;
}

// Mock data - w produkcji z bazy danych
const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    previousRank: 1,
    userId: "1",
    name: "Mateusz K.",
    xp: 15420,
    level: 12,
    streak: 45,
    achievements: 18,
    school: "AGH Kraków",
  },
  {
    rank: 2,
    previousRank: 3,
    userId: "2",
    name: "Anna W.",
    xp: 14850,
    level: 11,
    streak: 32,
    achievements: 16,
    school: "UW Warszawa",
  },
  {
    rank: 3,
    previousRank: 2,
    userId: "3",
    name: "Piotr S.",
    xp: 14200,
    level: 11,
    streak: 28,
    achievements: 15,
    school: "PW Wrocław",
  },
  {
    rank: 4,
    previousRank: 5,
    userId: "4",
    name: "Kasia M.",
    xp: 12900,
    level: 10,
    streak: 21,
    achievements: 14,
    school: "UJ Kraków",
  },
  {
    rank: 5,
    previousRank: 4,
    userId: "5",
    name: "Jakub L.",
    xp: 12500,
    level: 10,
    streak: 19,
    achievements: 13,
    school: "UAM Poznań",
  },
  {
    rank: 6,
    previousRank: 6,
    userId: "current",
    name: "Ty",
    xp: 8750,
    level: 8,
    streak: 7,
    achievements: 8,
    school: "Twoja szkoła",
    isCurrentUser: true,
  },
  {
    rank: 7,
    previousRank: 8,
    userId: "7",
    name: "Ola K.",
    xp: 8200,
    level: 7,
    streak: 12,
    achievements: 9,
    school: "UŁ Łódź",
  },
  {
    rank: 8,
    previousRank: 7,
    userId: "8",
    name: "Tomek R.",
    xp: 7900,
    level: 7,
    streak: 8,
    achievements: 7,
    school: "PG Gdańsk",
  },
  {
    rank: 9,
    previousRank: 10,
    userId: "9",
    name: "Magda B.",
    xp: 7500,
    level: 7,
    streak: 15,
    achievements: 10,
    school: "US Szczecin",
  },
  {
    rank: 10,
    previousRank: 9,
    userId: "10",
    name: "Michał Z.",
    xp: 7200,
    level: 6,
    streak: 5,
    achievements: 6,
    school: "UMCS Lublin",
  },
];

const weeklyChampions = [
  { name: "Mateusz K.", xpThisWeek: 2340, avatar: "🧠" },
  { name: "Anna W.", xpThisWeek: 2180, avatar: "🌟" },
  { name: "Kasia M.", xpThisWeek: 1950, avatar: "🚀" },
];

type LeaderboardScope = "global" | "school" | "friends";
type LeaderboardPeriod = "all" | "week" | "month";

export default function LeaderboardPage() {
  const [scope, setScope] = useState<LeaderboardScope>("global");
  const [period, setPeriod] = useState<LeaderboardPeriod>("all");
  const [leaderboard, setLeaderboard] = useState(mockLeaderboard);
  const [isLoading, setIsLoading] = useState(false);

  const currentUser = leaderboard.find((e) => e.isCurrentUser);
  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const getRankChange = (current: number, previous?: number) => {
    if (!previous) return null;
    const diff = previous - current;
    if (diff > 0) return { direction: "up", amount: diff };
    if (diff < 0) return { direction: "down", amount: Math.abs(diff) };
    return { direction: "same", amount: 0 };
  };

  const getPodiumStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          gradient: "from-yellow-400 via-yellow-500 to-amber-600",
          shadow: "shadow-yellow-500/30",
          icon: Crown,
          size: "w-24 h-24",
          textSize: "text-4xl",
        };
      case 2:
        return {
          gradient: "from-gray-300 via-gray-400 to-gray-500",
          shadow: "shadow-gray-400/30",
          icon: Medal,
          size: "w-20 h-20",
          textSize: "text-3xl",
        };
      case 3:
        return {
          gradient: "from-amber-600 via-amber-700 to-orange-800",
          shadow: "shadow-amber-600/30",
          icon: Medal,
          size: "w-18 h-18",
          textSize: "text-2xl",
        };
      default:
        return {
          gradient: "from-gray-400 to-gray-500",
          shadow: "",
          icon: Star,
          size: "w-16 h-16",
          textSize: "text-xl",
        };
    }
  };

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
            Ranking SuperMózgów
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Rywalizuj i zdobywaj nagrody!
          </p>
        </div>
      </div>

      {/* Weekly Champions */}
      <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 rounded-2xl p-6 border border-purple-500/20">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-purple-500" />
          <h2 className="font-bold">Mistrzowie Tygodnia</h2>
          <span className="text-xs bg-purple-500/20 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
            +50% XP bonus
          </span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {weeklyChampions.map((champion, index) => (
            <motion.div
              key={champion.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm min-w-[140px] text-center"
            >
              <div className="text-3xl mb-2">{champion.avatar}</div>
              <p className="font-medium text-sm truncate">{champion.name}</p>
              <p className="text-xs text-[var(--muted-foreground)] flex items-center justify-center gap-1">
                <Zap size={12} className="text-yellow-500" />
                +{champion.xpThisWeek} XP
              </p>
              <div
                className={cn(
                  "mt-2 px-2 py-0.5 rounded-full text-xs font-bold",
                  index === 0
                    ? "bg-yellow-500/20 text-yellow-600"
                    : index === 1
                    ? "bg-gray-400/20 text-gray-600"
                    : "bg-amber-600/20 text-amber-700"
                )}
              >
                #{index + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2 bg-[var(--secondary)] p-1 rounded-xl">
          {[
            { value: "global", label: "Globalny", icon: Globe },
            { value: "school", label: "Szkoła", icon: School },
            { value: "friends", label: "Znajomi", icon: Users },
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setScope(value as LeaderboardScope)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                scope === value
                  ? "bg-white dark:bg-gray-800 shadow-sm"
                  : "hover:bg-white/50 dark:hover:bg-gray-800/50"
              )}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 bg-[var(--secondary)] p-1 rounded-xl">
          {[
            { value: "all", label: "Wszystko" },
            { value: "week", label: "Tydzień" },
            { value: "month", label: "Miesiąc" },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setPeriod(value as LeaderboardPeriod)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                period === value
                  ? "bg-white dark:bg-gray-800 shadow-sm"
                  : "hover:bg-white/50 dark:hover:bg-gray-800/50"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Podium - Top 3 */}
      <div className="flex items-end justify-center gap-4 py-8">
        {[topThree[1], topThree[0], topThree[2]].map((entry, idx) => {
          const actualRank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
          const style = getPodiumStyle(actualRank);
          const Icon = style.icon;
          const podiumHeight = actualRank === 1 ? "h-32" : actualRank === 2 ? "h-24" : "h-20";

          return (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: actualRank * 0.15 }}
              className="flex flex-col items-center"
            >
              {/* Avatar */}
              <div
                className={cn(
                  "relative rounded-full bg-gradient-to-br p-1 mb-2",
                  style.gradient,
                  `shadow-2xl ${style.shadow}`
                )}
              >
                <div
                  className={cn(
                    "rounded-full bg-white dark:bg-gray-800 flex items-center justify-center",
                    style.size
                  )}
                >
                  <span className={style.textSize}>
                    {entry.name.slice(0, 2)}
                  </span>
                </div>
                {actualRank === 1 && (
                  <Crown className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 text-yellow-500 fill-yellow-500" />
                )}
              </div>

              {/* Name & Stats */}
              <p className="font-bold text-sm">{entry.name}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{entry.school}</p>
              <div className="flex items-center gap-1 mt-1">
                <Zap size={12} className="text-yellow-500" />
                <span className="text-sm font-medium">
                  {entry.xp.toLocaleString()}
                </span>
              </div>

              {/* Podium */}
              <div
                className={cn(
                  "mt-4 w-24 rounded-t-xl flex items-center justify-center font-bold text-white",
                  podiumHeight,
                  actualRank === 1
                    ? "bg-gradient-to-b from-yellow-400 to-yellow-600"
                    : actualRank === 2
                    ? "bg-gradient-to-b from-gray-300 to-gray-500"
                    : "bg-gradient-to-b from-amber-500 to-amber-700"
                )}
              >
                <span className="text-2xl">#{actualRank}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Your Position Highlight */}
      {currentUser && currentUser.rank > 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-4 border-2 border-indigo-500/30"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
              #{currentUser.rank}
            </div>
            <div className="flex-1">
              <p className="font-bold">Twoja pozycja</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {currentUser.xp.toLocaleString()} XP • Poziom {currentUser.level}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium flex items-center gap-1">
                <Flame className="text-orange-500" size={16} />
                {currentUser.streak} dni
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Do TOP 5 brakuje {(12500 - currentUser.xp).toLocaleString()} XP
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Rest of Leaderboard */}
      <div className="space-y-2">
        {rest.map((entry, index) => {
          const rankChange = getRankChange(entry.rank, entry.previousRank);

          return (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl transition-colors",
                entry.isCurrentUser
                  ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-2 border-indigo-500/30"
                  : "bg-[var(--secondary)] hover:bg-[var(--secondary)]/80"
              )}
            >
              {/* Rank */}
              <div className="w-10 text-center">
                <span
                  className={cn(
                    "font-bold",
                    entry.rank <= 10 ? "text-lg" : "text-base text-[var(--muted-foreground)]"
                  )}
                >
                  #{entry.rank}
                </span>
                {rankChange && (
                  <div className="flex items-center justify-center mt-0.5">
                    {rankChange.direction === "up" ? (
                      <TrendingUp size={12} className="text-green-500" />
                    ) : rankChange.direction === "down" ? (
                      <TrendingDown size={12} className="text-red-500" />
                    ) : (
                      <Minus size={12} className="text-gray-400" />
                    )}
                  </div>
                )}
              </div>

              {/* Avatar */}
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center font-bold",
                  entry.isCurrentUser
                    ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                    : "bg-[var(--muted)]"
                )}
              >
                {entry.name.slice(0, 2)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {entry.name}
                  {entry.isCurrentUser && (
                    <span className="ml-2 text-xs bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                      To Ty!
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                  <span>{entry.school}</span>
                  <span className="flex items-center gap-1">
                    <Star size={10} className="text-yellow-500" />
                    Poz. {entry.level} - {getLevelTitle(entry.level).title}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center hidden sm:block">
                  <p className="font-medium flex items-center gap-1">
                    <Flame size={14} className="text-orange-500" />
                    {entry.streak}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">Seria</p>
                </div>
                <div className="text-center hidden sm:block">
                  <p className="font-medium flex items-center gap-1">
                    <Trophy size={14} className="text-yellow-500" />
                    {entry.achievements}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">Osiągnięcia</p>
                </div>
                <div className="text-right">
                  <p className="font-bold flex items-center gap-1">
                    <Zap size={16} className="text-yellow-500" />
                    {entry.xp.toLocaleString()}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">XP</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Load More */}
      <div className="text-center">
        <button className="px-6 py-3 bg-[var(--secondary)] rounded-xl hover:bg-[var(--secondary)]/80 transition-colors">
          Pokaż więcej
        </button>
      </div>

      {/* Motivation */}
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-6 text-center border border-green-500/20">
        <Target className="w-8 h-8 mx-auto text-green-500 mb-3" />
        <p className="font-medium mb-2">
          Cel tygodnia: Wejdź do TOP 5! 🎯
        </p>
        <p className="text-sm text-[var(--muted-foreground)]">
          Zdobądź jeszcze {currentUser ? (12500 - currentUser.xp).toLocaleString() : "3,750"} XP do piątku i odblokuj specjalną odznakę.
        </p>
        <Link
          href="/dashboard/learn"
          className="inline-flex items-center gap-2 mt-4 px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
        >
          <Zap size={18} />
          Zacznij naukę
        </Link>
      </div>
    </div>
  );
}
