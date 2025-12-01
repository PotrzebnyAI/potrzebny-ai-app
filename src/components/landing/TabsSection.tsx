"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  GraduationCap,
  Heart,
  Microscope,
  Upload,
  FileText,
  Brain,
  HelpCircle,
  Layers,
  Accessibility,
} from "lucide-react";

type TabId = "edukacja" | "zdrowie" | "research";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  features: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }[];
}

const tabs: Tab[] = [
  {
    id: "edukacja",
    label: "Edukacja",
    icon: <GraduationCap size={20} />,
    title: "Naucz się w swoim tempie",
    description:
      "Przetwarzaj wykłady audio na notatki, quizy i flashcards. AI dostosowuje materiały do Twojego stylu uczenia się.",
    features: [
      {
        icon: <Upload size={24} />,
        title: "Upload audio",
        description:
          "Wgraj nagrania wykładów lub podłącz Google Drive. Obsługujemy MP3, WAV, M4A i więcej.",
      },
      {
        icon: <FileText size={24} />,
        title: "Automatyczna transkrypcja",
        description:
          "AI transkrybuje audio z 98% dokładnością. Działa z polskim i angielskim.",
      },
      {
        icon: <Brain size={24} />,
        title: "Inteligentne notatki",
        description:
          "AI generuje strukturyzowane notatki z najważniejszymi punktami i podsumowaniem.",
      },
      {
        icon: <HelpCircle size={24} />,
        title: "Quizy i testy",
        description:
          "Automatycznie generowane pytania sprawdzające wiedzę z materiału.",
      },
      {
        icon: <Layers size={24} />,
        title: "Flashcards",
        description:
          "Fiszki z algorytmem powtórek rozłożonych w czasie dla lepszego zapamiętywania.",
      },
      {
        icon: <Accessibility size={24} />,
        title: "Tryby dostępności",
        description:
          "ADHD, dysleksja, wzrokowiec, słuchowiec - materiały dostosowane do Twoich potrzeb.",
      },
    ],
  },
  {
    id: "zdrowie",
    label: "Zdrowie",
    icon: <Heart size={20} />,
    title: "Zadbaj o swoje zdrowie z AI",
    description:
      "Analizuj wyniki badań, śledź parametry zdrowotne i otrzymuj spersonalizowane rekomendacje.",
    features: [
      {
        icon: <FileText size={24} />,
        title: "Analiza wyników",
        description: "Wgraj wyniki badań krwi i otrzymaj przystępne wyjaśnienie każdego parametru.",
      },
      {
        icon: <Brain size={24} />,
        title: "Śledzenie trendów",
        description: "Monitoruj zmiany w wynikach w czasie i wykrywaj niepokojące trendy.",
      },
      {
        icon: <HelpCircle size={24} />,
        title: "Pytania do lekarza",
        description: "AI przygotuje listę pytań na wizytę u lekarza na podstawie Twoich wyników.",
      },
      {
        icon: <Layers size={24} />,
        title: "Baza wiedzy",
        description: "Dostęp do sprawdzonych informacji medycznych w przystępnej formie.",
      },
      {
        icon: <Upload size={24} />,
        title: "Import wyników",
        description: "Skanuj wyniki badań aparatem lub wgraj PDF z laboratorium.",
      },
      {
        icon: <Accessibility size={24} />,
        title: "Przypomnienia",
        description: "Ustaw przypomnienia o badaniach kontrolnych i lekach.",
      },
    ],
  },
  {
    id: "research",
    label: "Research",
    icon: <Microscope size={20} />,
    title: "Przyspiesz swoje badania",
    description:
      "Analizuj publikacje naukowe, wyciągaj kluczowe wnioski i twórz przeglądy literatury.",
    features: [
      {
        icon: <Upload size={24} />,
        title: "Import publikacji",
        description: "Wgraj PDF-y artykułów naukowych lub podaj DOI do automatycznego pobrania.",
      },
      {
        icon: <FileText size={24} />,
        title: "Streszczenia",
        description: "AI generuje zwięzłe streszczenia z metodologią, wynikami i wnioskami.",
      },
      {
        icon: <Brain size={24} />,
        title: "Ekstrakcja danych",
        description: "Automatyczne wyciąganie kluczowych danych i statystyk z publikacji.",
      },
      {
        icon: <HelpCircle size={24} />,
        title: "Pytania do artykułu",
        description: "Zadawaj pytania o artykuł i otrzymuj odpowiedzi z cytatami.",
      },
      {
        icon: <Layers size={24} />,
        title: "Przegląd literatury",
        description: "Twórz automatyczne przeglądy literatury z wielu źródeł.",
      },
      {
        icon: <Accessibility size={24} />,
        title: "Eksport do Zotero",
        description: "Integracja z popularnymi menedżerami bibliografii.",
      },
    ],
  },
];

export function TabsSection() {
  const [activeTab, setActiveTab] = useState<TabId>("edukacja");
  const currentTab = tabs.find((t) => t.id === activeTab)!;

  return (
    <section className="py-20 bg-[var(--muted)]" id="edukacja">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Jedna platforma, wiele możliwości
          </h2>
          <p className="text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Wybierz moduł dopasowany do Twoich potrzeb
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-lg bg-[var(--background)] p-1 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                id={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold mb-4">{currentTab.title}</h3>
          <p className="text-[var(--muted-foreground)] max-w-2xl mx-auto">
            {currentTab.description}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentTab.features.map((feature, index) => (
            <div
              key={index}
              className="bg-[var(--background)] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] mb-4">
                {feature.icon}
              </div>
              <h4 className="font-semibold mb-2">{feature.title}</h4>
              <p className="text-sm text-[var(--muted-foreground)]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
