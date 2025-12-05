"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Brain, Trophy, Star, Flame } from "lucide-react";
import { useEffect, useState } from "react";

const rotatingWords = [
  "inteligentniej",
  "szybciej",
  "efektywniej",
  "z pasją",
  "bez stresu",
];

export function Hero() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length);
        setIsAnimating(false);
      }, 200);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 px-5 py-2 text-sm font-medium mb-8">
            <Sparkles size={16} className="text-indigo-500" />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-semibold">
              Rewolucja w polskiej edukacji
            </span>
            <span className="flex items-center gap-1 text-orange-500">
              <Flame size={14} />
              HOT
            </span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6">
            <span className="block text-gray-900 dark:text-white">
              Ucz się
            </span>
            <span
              className={`block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent transition-all duration-200 ${
                isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
              }`}
            >
              {rotatingWords[currentWordIndex]}
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto max-w-3xl text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            <strong className="text-gray-900 dark:text-white">SuperMózg AI</strong> automatycznie
            transkrybuje wykłady, generuje{" "}
            <span className="text-indigo-600 font-medium">fiszki</span>,{" "}
            <span className="text-purple-600 font-medium">quizy</span> i{" "}
            <span className="text-pink-600 font-medium">notatki w 9 formatach</span>.
            <br className="hidden sm:block" />
            Dostosowane do ADHD, dysleksji i Twojego stylu uczenia się.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                <Zap size={20} className="mr-2" />
                Zacznij za darmo
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 border-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                Zobacz jak to działa
              </Button>
            </Link>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              4.9/5
            </span>
            <span className="hidden sm:inline">•</span>
            <span>Bez karty kredytowej</span>
            <span className="hidden sm:inline">•</span>
            <span>7 dni za darmo</span>
            <span className="hidden sm:inline">•</span>
            <span>Anuluj kiedy chcesz</span>
          </div>
        </div>

        {/* Features mini-grid */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            {
              icon: Brain,
              title: "AI Transkrypcja",
              description: "Nagrania → Notatki",
              color: "text-indigo-500",
              bg: "bg-indigo-500/10",
            },
            {
              icon: Zap,
              title: "Fiszki & Quizy",
              description: "Automatycznie",
              color: "text-purple-500",
              bg: "bg-purple-500/10",
            },
            {
              icon: Trophy,
              title: "Gamifikacja",
              description: "XP, Poziomy, Streak",
              color: "text-pink-500",
              bg: "bg-pink-500/10",
            },
            {
              icon: Star,
              title: "9 Formatów Notatek",
              description: "ADHD, Dysleksja, Cornell",
              color: "text-orange-500",
              bg: "bg-orange-500/10",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
            >
              <div
                className={`w-10 h-10 rounded-xl ${feature.bg} flex items-center justify-center ${feature.color} mb-3`}
              >
                <feature.icon size={22} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats with animation */}
        <div className="mt-20 grid grid-cols-2 gap-8 sm:grid-cols-4 max-w-4xl mx-auto">
          {[
            { value: "10,000+", label: "Uczniów i studentów", emoji: "🎓" },
            { value: "500k+", label: "Przetworzonych minut", emoji: "⏱️" },
            { value: "98%", label: "Dokładność AI", emoji: "🎯" },
            { value: "#1", label: "Platforma w Polsce", emoji: "🏆" },
          ].map((stat) => (
            <div key={stat.label} className="text-center group">
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                {stat.emoji}
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Zaufali nam uczniowie i nauczyciele z:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            {["Uniwersytet Warszawski", "AGH Kraków", "Politechnika Wrocławska", "UJ Kraków", "UAM Poznań"].map(
              (uni) => (
                <span
                  key={uni}
                  className="text-sm font-medium text-gray-600 dark:text-gray-300"
                >
                  {uni}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
