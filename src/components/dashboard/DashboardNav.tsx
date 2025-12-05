"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { getLevelFromXP, getLevelTitle, getXPForLevel } from "@/lib/gamification";
import {
  Home,
  FileAudio,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  GraduationCap,
  CreditCard,
  Trophy,
  Flame,
  Zap,
  Bell,
  Star,
  Crown,
  Heart,
  TrendingUp,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  subscription_tier: string;
  learning_mode: string;
}

interface DashboardNavProps {
  user: User;
  profile: Profile | null;
}

// Mock user stats - w produkcji z bazy danych
const userStats = {
  xp: 8750,
  streak: 7,
  notifications: 3,
};

const navItems = [
  { href: "/dashboard", label: "Panel główny", icon: Home },
  { href: "/dashboard/materials", label: "Materiały", icon: FileAudio },
  { href: "/dashboard/learn", label: "Nauka", icon: BookOpen },
  { href: "/dashboard/achievements", label: "Osiągnięcia", icon: Trophy },
  { href: "/dashboard/leaderboard", label: "Ranking", icon: TrendingUp },
  { href: "/dashboard/health", label: "Wellness", icon: Heart },
  { href: "/dashboard/settings", label: "Ustawienia", icon: Settings },
];

export function DashboardNav({ user, profile }: DashboardNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const levelData = getLevelFromXP(userStats.xp);
  const level = levelData.level;
  const levelTitle = getLevelTitle(level);
  const xpProgress = levelData.progress;

  const tierLabels: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    free: { label: "Darmowy", color: "text-gray-500", icon: Star },
    starter: { label: "AI BASIC", color: "text-blue-500", icon: Zap },
    pro: { label: "POTRZEBNY PRO", color: "text-purple-500", icon: Crown },
    team: { label: "SUPERMÓZG ULTRA", color: "text-yellow-500", icon: Crown },
  };

  const currentTier = tierLabels[profile?.subscription_tier || "free"];
  const TierIcon = currentTier.icon;

  const notifications = [
    { id: 1, text: "Nowa odznaka: Nowicjusz! 🎉", time: "2 min temu", unread: true },
    { id: 2, text: "Twoja seria to już 7 dni! 🔥", time: "1 godz. temu", unread: true },
    { id: 3, text: "Nowy materiał do nauki", time: "3 godz. temu", unread: false },
  ];

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[var(--background)] border-b border-[var(--border)] h-16 flex items-center justify-between px-4">
        <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          SuperMózg
        </Link>

        {/* Mobile XP & Notifications */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm">
            <Zap size={16} className="text-yellow-500" />
            <span className="font-bold">{userStats.xp.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Flame size={16} className="text-orange-500" />
            <span className="font-bold">{userStats.streak}</span>
          </div>
          <button
            className="relative p-2"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {userStats.notifications > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {userStats.notifications}
              </span>
            )}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Notifications dropdown */}
      {showNotifications && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowNotifications(false)}
          />
          <div className="fixed top-16 right-4 z-50 w-80 bg-[var(--background)] rounded-xl shadow-2xl border border-[var(--border)] overflow-hidden">
            <div className="p-4 border-b border-[var(--border)]">
              <h3 className="font-semibold flex items-center gap-2">
                <Bell size={18} />
                Powiadomienia
              </h3>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 border-b border-[var(--border)] hover:bg-[var(--secondary)] cursor-pointer",
                    notification.unread && "bg-indigo-500/5"
                  )}
                >
                  <p className="text-sm">{notification.text}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    {notification.time}
                  </p>
                </div>
              ))}
            </div>
            <div className="p-3 text-center border-t border-[var(--border)]">
              <button className="text-sm text-indigo-600 hover:underline">
                Zobacz wszystkie
              </button>
            </div>
          </div>
        </>
      )}

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[var(--background)] border-r border-[var(--border)] transform transition-transform lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-[var(--border)]">
            <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              <span className="text-2xl">🧠</span>
              SuperMózg
            </Link>
          </div>

          {/* XP Progress Card */}
          <div className="p-4 border-b border-[var(--border)]">
            <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {level}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{levelTitle.title}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">Poziom {level}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-orange-500">
                  <Flame size={16} />
                  <span className="font-bold text-sm">{userStats.streak}</span>
                </div>
              </div>

              {/* XP Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <Zap size={12} className="text-yellow-500" />
                    {userStats.xp.toLocaleString()} XP
                  </span>
                  <span className="text-[var(--muted-foreground)]">
                    {levelData.xpForNextLevel.toLocaleString()} XP
                  </span>
                </div>
                <div className="h-2 bg-[var(--secondary)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    isActive
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                  )}
                >
                  <item.icon size={20} />
                  {item.label}
                  {item.href === "/dashboard/achievements" && (
                    <span className="ml-auto text-xs bg-yellow-500/20 text-yellow-600 px-2 py-0.5 rounded-full">
                      4
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User info & subscription */}
          <div className="p-4 border-t border-[var(--border)]">
            {/* Subscription badge */}
            <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-[var(--secondary)] to-[var(--secondary)]/50">
              <div className="flex items-center gap-2 text-sm">
                <TierIcon size={18} className={currentTier.color} />
                <span className={cn("font-semibold", currentTier.color)}>
                  {currentTier.label}
                </span>
              </div>
              {profile?.subscription_tier === "free" && (
                <Link
                  href="/dashboard/settings"
                  className="mt-2 block text-xs text-indigo-600 hover:underline font-medium"
                >
                  🚀 Ulepsz do PRO
                </Link>
              )}
            </div>

            {/* Learning mode */}
            <div className="mb-4 p-3 rounded-xl bg-[var(--secondary)]">
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap size={16} className="text-emerald-500" />
                <span className="text-[var(--muted-foreground)]">
                  Tryb: <span className="font-medium capitalize">{profile?.learning_mode || "standard"}</span>
                </span>
              </div>
            </div>

            {/* User */}
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--secondary)] transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {profile?.full_name?.[0] || user.email?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {profile?.full_name || "Użytkownik"}
                </p>
                <p className="text-xs text-[var(--muted-foreground)] truncate">
                  {user.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="mt-2 w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--muted-foreground)] hover:bg-red-500/10 hover:text-red-500 transition-colors"
            >
              <LogOut size={20} />
              Wyloguj się
            </button>
          </div>
        </div>
      </aside>

      {/* Spacer for mobile header */}
      <div className="lg:hidden h-16" />
    </>
  );
}
