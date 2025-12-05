"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Leaf,
  Brain,
  Sparkles,
  Wind,
  Droplets,
  Sun,
  Moon,
  Apple,
  Activity,
  Heart,
  Zap,
  ChevronRight,
  Info,
  ExternalLink,
  Lightbulb,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

// This is a WELLNESS module - no medical claims, just lifestyle optimization
// Focus: Environment, supplements (non-medical), lifestyle habits

interface WellnessTip {
  id: string;
  category: string;
  icon: React.ElementType;
  title: string;
  description: string;
  benefits: string[];
  howTo: string[];
  scienceNote?: string;
}

const wellnessTips: WellnessTip[] = [
  {
    id: "plants",
    category: "Środowisko",
    icon: Leaf,
    title: "Rośliny Oczyszczające Powietrze",
    description:
      "Rośliny doniczkowe mogą poprawić jakość powietrza w Twoim miejscu nauki.",
    benefits: [
      "Naturalna filtracja powietrza",
      "Lepsza koncentracja",
      "Redukcja stresu",
      "Poprawa nastroju",
    ],
    howTo: [
      "Skrzydłokwiat - świetny do miejsc z mniejszym światłem",
      "Sansewieria - prawie niezniszczalna, oczyszcza powietrze w nocy",
      "Zielistka - bezpieczna dla zwierząt, łatwa w uprawie",
      "Nefrolepis (paproć) - doskonała do łazienki",
    ],
    scienceNote:
      "Badania NASA Clean Air Study pokazują, że niektóre rośliny mogą usuwać zanieczyszczenia z powietrza.",
  },
  {
    id: "air_quality",
    category: "Środowisko",
    icon: Wind,
    title: "Jakość Powietrza w Miejscu Nauki",
    description:
      "Czyste powietrze wspiera funkcje poznawcze i koncentrację podczas nauki.",
    benefits: [
      "Lepsza koncentracja",
      "Mniej zmęczenia",
      "Łatwiejsze zapamiętywanie",
      "Mniej bólów głowy",
    ],
    howTo: [
      "Regularnie wietrz pomieszczenie (5-10 min co 2-3 godziny)",
      "Rozważ oczyszczacz powietrza z filtrem HEPA",
      "Unikaj palenia i świec zapachowych podczas nauki",
      "Utrzymuj wilgotność 40-60%",
    ],
    scienceNote:
      "Aldehydy (np. formaldehyd z mebli) mogą negatywnie wpływać na samopoczucie. Wietrzenie i rośliny pomagają!",
  },
  {
    id: "hydration",
    category: "Nawodnienie",
    icon: Droplets,
    title: "Nawodnienie i Funkcje Mózgu",
    description:
      "Odpowiednie nawodnienie jest kluczowe dla optymalnej pracy mózgu.",
    benefits: [
      "Lepsza pamięć krótkotrwała",
      "Szybsze myślenie",
      "Więcej energii",
      "Mniej zmęczenia",
    ],
    howTo: [
      "Pij 8 szklanek wody dziennie (ok. 2 litry)",
      "Trzymaj butelkę wody przy biurku",
      "Pij wodę przed testem lub egzaminem",
      "Ogranicz napoje z kofeiną - odwadniają",
    ],
    scienceNote:
      "Nawet 1-2% odwodnienie może pogorszyć funkcje poznawcze i nastrój.",
  },
  {
    id: "sleep",
    category: "Sen",
    icon: Moon,
    title: "Sen i Konsolidacja Pamięci",
    description: "Sen jest niezbędny do utrwalania nauczonego materiału.",
    benefits: [
      "Konsolidacja wspomnień",
      "Lepsze przyswajanie informacji",
      "Regeneracja mózgu",
      "Stabilny nastrój",
    ],
    howTo: [
      "Śpij 7-9 godzin (nastolatki: 8-10 godzin)",
      "Stały czas snu i budzenia",
      "Nie ucz się bezpośrednio przed snem - przetwarzanie wymaga czasu",
      "Unikaj ekranów 1h przed snem (blue light)",
    ],
    scienceNote:
      "Podczas snu REM mózg przetwarza i utrwala informacje nauczone w ciągu dnia.",
  },
  {
    id: "movement",
    category: "Ruch",
    icon: Activity,
    title: "Aktywność Fizyczna i Nauka",
    description: "Ruch poprawia przepływ krwi do mózgu i wspiera naukę.",
    benefits: [
      "Lepszy przepływ krwi do mózgu",
      "Uwalnianie endorfin",
      "Redukcja stresu",
      "Poprawa koncentracji",
    ],
    howTo: [
      "5-10 minut ćwiczeń przed nauką",
      "Przerwy na rozciąganie co 45-60 minut",
      "Spacer podczas powtarzania materiału",
      "Regularna aktywność fizyczna 3-5x w tygodniu",
    ],
    scienceNote:
      "Badania pokazują, że nawet 20 minut umiarkowanego ruchu poprawia funkcje wykonawcze mózgu.",
  },
  {
    id: "nutrition",
    category: "Odżywianie",
    icon: Apple,
    title: "Jedzenie dla Mózgu",
    description: "Odpowiednia dieta dostarcza paliwa dla optymalnej pracy mózgu.",
    benefits: [
      "Stabilna energia przez cały dzień",
      "Lepsza koncentracja",
      "Wsparcie funkcji poznawczych",
      "Stabilny poziom cukru",
    ],
    howTo: [
      "Śniadanie przed nauką - mózg potrzebuje glukozy",
      "Orzechy i jagody jako zdrowe przekąski",
      "Tłuste ryby (omega-3) wspierają mózg",
      "Unikaj cukrowych przekąsek - powodują spadki energii",
    ],
    scienceNote:
      "Omega-3, witaminy z grupy B i antyoksydanty są szczególnie ważne dla funkcji poznawczych.",
  },
  {
    id: "light",
    category: "Środowisko",
    icon: Sun,
    title: "Oświetlenie i Produktywność",
    description: "Odpowiednie oświetlenie wpływa na koncentrację i nastrój.",
    benefits: [
      "Mniej zmęczenia oczu",
      "Lepsza koncentracja",
      "Regulacja rytmu dobowego",
      "Poprawa nastroju",
    ],
    howTo: [
      "Nauka przy naturalnym świetle gdy to możliwe",
      "Lampa biurkowa z ciepłym światłem (3000-4000K)",
      "Unikaj jarzeniówek - migotanie męczy oczy",
      "Rano: jasne światło, wieczorem: cieplejsze, przyćmione",
    ],
    scienceNote:
      "Ekspozycja na naturalne światło rano pomaga regulować cykl snu i czuwania.",
  },
  {
    id: "breaks",
    category: "Techniki",
    icon: Zap,
    title: "Technika Pomodoro i Przerwy",
    description: "Regularne przerwy zwiększają efektywność nauki.",
    benefits: [
      "Dłuższa koncentracja",
      "Mniej wypalenia",
      "Lepsze przyswajanie",
      "Więcej energii",
    ],
    howTo: [
      "25 minut nauki → 5 minut przerwy (Pomodoro)",
      "Po 4 cyklach: dłuższa przerwa 15-30 min",
      "Podczas przerwy: ruch, woda, spojrzenie w dal",
      "NIE przeglądaj social media podczas przerwy",
    ],
    scienceNote:
      "Mózg potrzebuje przerw do przetwarzania informacji - to część procesu uczenia się.",
  },
];

const supplementInfo = [
  {
    name: "Omega-3",
    description: "Kwasy tłuszczowe wspierające zdrowie mózgu",
    sources: "Tłuste ryby, orzechy włoskie, siemię lniane",
    note: "Podstawowy składnik diety śródziemnomorskiej",
  },
  {
    name: "Witamina D",
    description: "Ważna dla nastroju i funkcji poznawczych",
    sources: "Słońce, tłuste ryby, jaja",
    note: "W Polsce często niedobór, szczególnie zimą",
  },
  {
    name: "Magnez",
    description: "Wspiera relaksację i jakość snu",
    sources: "Orzechy, nasiona, ciemna czekolada, zielone warzywa",
    note: "Często niedoborowy w typowej diecie",
  },
  {
    name: "Witaminy B",
    description: "Wspierają energię i funkcje neurologiczne",
    sources: "Pełnoziarniste produkty, jaja, mięso, rośliny strączkowe",
    note: "Szczególnie B12 dla wegetarian/wegan",
  },
];

export default function HealthWellnessPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  const categories = [...new Set(wellnessTips.map((t) => t.category))];

  const filteredTips = activeCategory
    ? wellnessTips.filter((t) => t.category === activeCategory)
    : wellnessTips;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm font-medium mb-4">
          <Sparkles size={16} />
          SuperMózg Wellness
        </div>
        <h1 className="text-3xl font-bold mb-2">Optymalizacja Nauki</h1>
        <p className="text-[var(--muted-foreground)] max-w-xl mx-auto">
          Proste wskazówki lifestyle&apos;owe, które pomogą Ci uczyć się
          efektywniej i czuć się lepiej.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-[var(--muted-foreground)]">
            <strong>Uwaga:</strong> Te wskazówki dotyczą ogólnego dobrostanu i
            optymalizacji środowiska nauki. Nie stanowią porady medycznej. W
            przypadku problemów zdrowotnych skonsultuj się z lekarzem.
          </p>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            !activeCategory
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--secondary)] hover:bg-[var(--secondary)]/80"
          )}
        >
          Wszystkie
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              activeCategory === cat
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--secondary)] hover:bg-[var(--secondary)]/80"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tips Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredTips.map((tip) => (
          <div
            key={tip.id}
            className={cn(
              "bg-[var(--background)] rounded-xl shadow-sm overflow-hidden transition-all",
              expandedTip === tip.id && "ring-2 ring-[var(--primary)]"
            )}
          >
            <button
              onClick={() =>
                setExpandedTip(expandedTip === tip.id ? null : tip.id)
              }
              className="w-full p-5 text-left"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 flex-shrink-0">
                  <tip.icon size={24} />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-medium text-[var(--primary)] uppercase tracking-wide">
                    {tip.category}
                  </span>
                  <h3 className="font-semibold mt-1">{tip.title}</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1 line-clamp-2">
                    {tip.description}
                  </p>
                </div>
                <ChevronRight
                  className={cn(
                    "w-5 h-5 text-[var(--muted-foreground)] transition-transform",
                    expandedTip === tip.id && "rotate-90"
                  )}
                />
              </div>
            </button>

            {expandedTip === tip.id && (
              <div className="px-5 pb-5 border-t border-[var(--border)] pt-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                      <Heart size={14} className="text-pink-500" />
                      Korzyści
                    </h4>
                    <ul className="space-y-1">
                      {tip.benefits.map((benefit, i) => (
                        <li
                          key={i}
                          className="text-sm text-[var(--muted-foreground)] flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                      <Lightbulb size={14} className="text-yellow-500" />
                      Jak zacząć
                    </h4>
                    <ul className="space-y-1">
                      {tip.howTo.map((step, i) => (
                        <li
                          key={i}
                          className="text-sm text-[var(--muted-foreground)] flex items-start gap-2"
                        >
                          <span className="font-medium text-[var(--foreground)]">
                            {i + 1}.
                          </span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {tip.scienceNote && (
                    <div className="bg-[var(--secondary)] rounded-lg p-3">
                      <p className="text-xs text-[var(--muted-foreground)] flex items-start gap-2">
                        <Shield size={14} className="flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Nauka:</strong> {tip.scienceNote}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Nutrition Section */}
      <div className="bg-[var(--background)] rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Apple className="text-red-500" />
          Składniki Odżywcze dla Mózgu
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          Zbilansowana dieta dostarcza składników wspierających funkcje
          poznawcze. Oto kluczowe elementy:
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {supplementInfo.map((supp) => (
            <div
              key={supp.name}
              className="bg-[var(--secondary)] rounded-lg p-4"
            >
              <h3 className="font-semibold">{supp.name}</h3>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                {supp.description}
              </p>
              <p className="text-xs mt-2">
                <strong>Źródła:</strong> {supp.sources}
              </p>
              <p className="text-xs text-[var(--primary)] mt-1">{supp.note}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-[var(--muted-foreground)] text-center">
          Pamiętaj: Najlepiej pozyskiwać składniki z naturalnych źródeł
          pokarmowych. Suplementy rozważ po konsultacji ze specjalistą.
        </div>
      </div>

      {/* Aldehyde Info (Educational) */}
      <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-6 border border-amber-500/20">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Wind className="text-amber-600" />
          Czy wiesz co to aldehydy?
        </h2>
        <div className="space-y-4 text-sm">
          <p>
            <strong>Aldehydy</strong> (jak formaldehyd czy acetaldehyd) to
            związki chemiczne, które mogą znajdować się w powietrzu w naszych
            domach - uwalniają się z mebli, farb, a nawet niektórych kosmetyków.
          </p>
          <p className="text-[var(--muted-foreground)]">
            Dobra wiadomość? Możesz łatwo poprawić jakość powietrza:
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <Leaf className="w-4 h-4 text-green-500 mt-0.5" />
              <span>
                Rośliny jak Skrzydłokwiat i Nefrolepis pomagają filtrować
                powietrze
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Wind className="w-4 h-4 text-blue-500 mt-0.5" />
              <span>
                Regularne wietrzenie pomieszczenia znacząco poprawia jakość
                powietrza
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-purple-500 mt-0.5" />
              <span>
                Oczyszczacze z filtrem węglowym skutecznie usuwają lotne związki
              </span>
            </li>
          </ul>
        </div>
        <Link
          href="https://www.sciencedirect.com/topics/earth-and-planetary-sciences/indoor-air-pollution"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400 mt-4 hover:underline"
        >
          Dowiedz się więcej o jakości powietrza w pomieszczeniach
          <ExternalLink size={14} />
        </Link>
      </div>

      {/* CTA */}
      <div className="text-center py-8">
        <p className="text-[var(--muted-foreground)] mb-4">
          Chcesz więcej spersonalizowanych wskazówek?
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary)]/90 transition-colors"
        >
          <Brain size={20} />
          Wróć do nauki z SuperMózg
        </Link>
      </div>
    </div>
  );
}
