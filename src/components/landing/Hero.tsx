"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 via-transparent to-[var(--accent)]/10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[var(--primary)]/5 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-4 py-1.5 text-sm font-medium text-[var(--primary)] mb-8">
            <Sparkles size={16} />
            <span>AI dla wszystkich</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Ucz się mądrzej,
            <br />
            <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
              nie ciężej
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-[var(--muted-foreground)] mb-10">
            Platforma AI która automatycznie transkrybuje wykłady, generuje notatki,
            quizy i flashcards. Dostosowana do ADHD, dysleksji i różnych stylów uczenia się.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto">
                Rozpocznij za darmo
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Zobacz demo
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-[var(--muted-foreground)]">
            Bez karty kredytowej. 7 dni za darmo.
          </p>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {[
            { value: "10k+", label: "Użytkowników" },
            { value: "500k+", label: "Przetworzonych minut" },
            { value: "98%", label: "Dokładność AI" },
            { value: "4.9/5", label: "Ocena użytkowników" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-[var(--primary)]">{stat.value}</div>
              <div className="mt-1 text-sm text-[var(--muted-foreground)]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
