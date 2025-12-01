"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  User,
  Brain,
  CreditCard,
  Check,
  Loader2,
  ExternalLink,
} from "lucide-react";

type LearningMode = "standard" | "adhd" | "dyslexia" | "visual" | "auditory";

const learningModes: { id: LearningMode; name: string; description: string }[] = [
  { id: "standard", name: "Standardowy", description: "Klasyczne notatki i materiały" },
  { id: "adhd", name: "ADHD", description: "Krótkie sekcje, bullet pointy, emoji" },
  { id: "dyslexia", name: "Dysleksja", description: "Prosty język, duże odstępy" },
  { id: "visual", name: "Wzrokowiec", description: "Diagramy, tabele, schematy" },
  { id: "auditory", name: "Słuchowiec", description: "Narracja, mnemotechniki" },
];

const plans = [
  { id: "starter", name: "Starter", price: 29, current: false },
  { id: "pro", name: "Pro", price: 49, current: false, popular: true },
  { id: "team", name: "Team", price: 79, current: false },
];

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<{
    full_name: string | null;
    learning_mode: LearningMode;
    subscription_tier: string;
    subscription_status: string;
  } | null>(null);

  const [fullName, setFullName] = useState("");
  const [learningMode, setLearningMode] = useState<LearningMode>("standard");

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
        setLearningMode(data.learning_mode || "standard");
      }
      setLoading(false);
    }
    loadProfile();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({ full_name: fullName, learning_mode: learningMode })
      .eq("id", user.id);

    setSaving(false);
    router.refresh();
  };

  const handleSubscribe = async (planId: string) => {
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planKey: planId }),
    });

    const { url } = await response.json();
    if (url) window.location.href = url;
  };

  const handleManageSubscription = async () => {
    const response = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await response.json();
    if (url) window.location.href = url;
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Loader2 size={32} className="animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Ustawienia</h1>
        <p className="text-[var(--muted-foreground)]">Zarządzaj kontem i preferencjami</p>
      </div>

      {/* Profile */}
      <div className="bg-[var(--background)] rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <User size={24} className="text-[var(--primary)]" />
          <h2 className="text-lg font-semibold">Profil</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Imię i nazwisko</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
        </div>
      </div>

      {/* Learning mode */}
      <div className="bg-[var(--background)] rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Brain size={24} className="text-[var(--accent)]" />
          <h2 className="text-lg font-semibold">Tryb nauki</h2>
        </div>

        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          Wybierz tryb, który najlepiej odpowiada Twojemu stylowi uczenia się
        </p>

        <div className="grid gap-3">
          {learningModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setLearningMode(mode.id)}
              className={cn(
                "w-full text-left p-4 rounded-lg border transition-all",
                learningMode === mode.id
                  ? "border-[var(--primary)] bg-[var(--primary)]/10"
                  : "border-[var(--border)] hover:border-[var(--primary)]/50"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{mode.name}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">{mode.description}</p>
                </div>
                {learningMode === mode.id && (
                  <Check size={20} className="text-[var(--primary)]" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Save button */}
      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Zapisz zmiany
      </Button>

      {/* Subscription */}
      <div className="bg-[var(--background)] rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard size={24} className="text-green-500" />
          <h2 className="text-lg font-semibold">Subskrypcja</h2>
        </div>

        <div className="mb-6 p-4 bg-[var(--secondary)] rounded-lg">
          <p className="text-sm text-[var(--muted-foreground)]">Aktualny plan</p>
          <p className="text-xl font-bold capitalize">{profile?.subscription_tier || "free"}</p>
          {profile?.subscription_status === "active" && (
            <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-500/10 text-green-500 rounded">
              Aktywna
            </span>
          )}
        </div>

        {profile?.subscription_tier === "free" ? (
          <div className="grid gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "p-4 rounded-lg border",
                  plan.popular ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border)]"
                )}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{plan.name}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">{plan.price} PLN/msc</p>
                  </div>
                  <Button size="sm" onClick={() => handleSubscribe(plan.id)}>
                    Wybierz
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Button variant="outline" onClick={handleManageSubscription} className="w-full">
            <ExternalLink size={16} className="mr-2" />
            Zarządzaj subskrypcją
          </Button>
        )}
      </div>
    </div>
  );
}
