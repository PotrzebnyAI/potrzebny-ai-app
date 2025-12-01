"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
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

const navItems = [
  { href: "/dashboard", label: "Panel główny", icon: Home },
  { href: "/dashboard/materials", label: "Materiały", icon: FileAudio },
  { href: "/dashboard/learn", label: "Nauka", icon: BookOpen },
  { href: "/dashboard/settings", label: "Ustawienia", icon: Settings },
];

export function DashboardNav({ user, profile }: DashboardNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const tierLabels: Record<string, string> = {
    free: "Darmowy",
    starter: "Starter",
    pro: "Pro",
    team: "Team",
  };

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[var(--background)] border-b border-[var(--border)] h-16 flex items-center justify-between px-4">
        <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
          potrzebny.ai
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2"
          aria-label="Menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

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
            <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
              potrzebny.ai
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                  )}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User info & subscription */}
          <div className="p-4 border-t border-[var(--border)]">
            {/* Subscription badge */}
            <div className="mb-4 p-3 rounded-lg bg-[var(--secondary)]">
              <div className="flex items-center gap-2 text-sm">
                <CreditCard size={16} className="text-[var(--primary)]" />
                <span className="font-medium">
                  {tierLabels[profile?.subscription_tier || "free"]}
                </span>
              </div>
              {profile?.subscription_tier === "free" && (
                <Link
                  href="/dashboard/settings"
                  className="mt-2 block text-xs text-[var(--primary)] hover:underline"
                >
                  Uaktualnij plan
                </Link>
              )}
            </div>

            {/* Learning mode */}
            <div className="mb-4 p-3 rounded-lg bg-[var(--secondary)]">
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap size={16} className="text-[var(--accent)]" />
                <span className="text-[var(--muted-foreground)]">
                  Tryb: <span className="font-medium capitalize">{profile?.learning_mode || "standard"}</span>
                </span>
              </div>
            </div>

            {/* User */}
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--secondary)] transition-colors">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-medium">
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
              className="mt-2 w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-red-500 transition-colors"
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
