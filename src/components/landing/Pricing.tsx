"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import Link from "next/link";

interface PricingPlan {
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
}

const plans: PricingPlan[] = [
  {
    name: "AI BASIC",
    price: 29,
    description: "Dla osób rozpoczynających przygodę z AI",
    features: [
      "5 godzin transkrypcji miesięcznie",
      "Notatki AI",
      "Podstawowe quizy",
      "1 tryb dostępności",
      "Email support",
    ],
    cta: "Wybierz AI BASIC",
  },
  {
    name: "POTRZEBNY PRO",
    price: 49,
    description: "Dla aktywnych studentów i profesjonalistów",
    features: [
      "20 godzin transkrypcji miesięcznie",
      "Notatki AI + streszczenia",
      "Quizy i flashcards",
      "Wszystkie tryby dostępności",
      "Integracja z Google Drive",
      "Priorytetowy support",
    ],
    popular: true,
    cta: "Wybierz POTRZEBNY PRO",
  },
  {
    name: "SUPERMÓZG ULTRA",
    price: 79,
    description: "Dla zespołów i organizacji",
    features: [
      "Nielimitowana transkrypcja",
      "Wszystko z POTRZEBNY PRO",
      "Panel nauczyciela",
      "Udostępnianie materiałów",
      "Analityka postępów",
      "API access",
      "Dedykowany opiekun",
    ],
    cta: "Wybierz SUPERMÓZG ULTRA",
  },
];

export function Pricing() {
  return (
    <section className="py-20" id="cennik">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Prosty i przejrzysty cennik
          </h2>
          <p className="text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Wybierz plan dopasowany do Twoich potrzeb. Bez ukrytych opłat.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl p-8 transition-all",
                plan.popular
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] scale-105 shadow-xl"
                  : "bg-[var(--muted)] hover:shadow-lg"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-[var(--accent)] text-white text-xs font-bold px-3 py-1 rounded-full">
                    Najpopularniejszy
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p
                  className={cn(
                    "text-sm mb-4",
                    plan.popular
                      ? "text-[var(--primary-foreground)]/80"
                      : "text-[var(--muted-foreground)]"
                  )}
                >
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span
                    className={cn(
                      "text-sm",
                      plan.popular
                        ? "text-[var(--primary-foreground)]/80"
                        : "text-[var(--muted-foreground)]"
                    )}
                  >
                    PLN/msc
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check
                      size={18}
                      className={cn(
                        "mt-0.5 flex-shrink-0",
                        plan.popular ? "text-[var(--primary-foreground)]" : "text-[var(--primary)]"
                      )}
                    />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/auth/register">
                <Button
                  className="w-full"
                  variant={plan.popular ? "secondary" : "primary"}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-[var(--muted-foreground)] mt-8">
          Wszystkie plany zawierają 7-dniowy okres próbny. Możesz anulować w każdej chwili.
        </p>
      </div>
    </section>
  );
}
