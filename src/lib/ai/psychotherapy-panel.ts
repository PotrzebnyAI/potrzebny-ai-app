// Psychotherapy Panel - Tools for Mental Health Professionals
// Therapy Support, Session Notes, Progress Tracking
import { generateFromPrompt } from "./groq";

// ============================================
// TYPES
// ============================================

export interface TherapistProfile {
  id: string;
  licenseType: "psychologist" | "psychiatrist" | "therapist" | "counselor";
  licenseNumber: string;
  specializations: TherapyApproach[];
  verified: boolean;
}

export type TherapyApproach =
  | "cbt"               // Cognitive Behavioral Therapy
  | "dbt"               // Dialectical Behavior Therapy
  | "psychodynamic"     // Psychodynamic Therapy
  | "humanistic"        // Humanistic/Person-Centered
  | "act"               // Acceptance and Commitment Therapy
  | "emdr"              // Eye Movement Desensitization
  | "mindfulness"       // Mindfulness-Based
  | "solution_focused"  // Solution-Focused Brief Therapy
  | "gestalt"           // Gestalt Therapy
  | "systemic"          // Systemic/Family Therapy
  | "integrative";      // Integrative Approach

export interface ClientProfile {
  id: string;
  // Note: Minimal data stored - therapist manages detailed records
  initials: string;
  startDate: string;
  primaryConcerns: string[];
  therapyGoals: string[];
  preferredApproach?: TherapyApproach;
}

export interface SessionNote {
  id: string;
  clientId: string;
  sessionNumber: number;
  date: string;
  duration: number; // minutes
  format: "individual" | "couple" | "family" | "group";
  presentingIssues: string[];
  interventionsUsed: string[];
  clientResponse: string;
  progressNotes: string;
  planForNext: string;
  homework?: string[];
  riskAssessment?: {
    suicidalIdeation: "none" | "passive" | "active_no_plan" | "active_with_plan";
    homicidalIdeation: boolean;
    selfHarm: boolean;
    otherRisks: string[];
    safetyPlanReviewed: boolean;
  };
  moodRating?: number; // 1-10
  anxietyRating?: number; // 1-10
  encrypted: boolean;
}

export interface TreatmentPlan {
  id: string;
  clientId: string;
  diagnosis?: string[]; // ICD-10 or DSM-5 codes
  goals: TreatmentGoal[];
  estimatedDuration: string;
  frequency: string;
  approach: TherapyApproach[];
  reviewDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface TreatmentGoal {
  id: string;
  description: string;
  objectives: {
    objective: string;
    measurable: string;
    targetDate: string;
    status: "not_started" | "in_progress" | "achieved" | "modified";
  }[];
  progress: number; // 0-100
}

export interface TherapyExercise {
  id: string;
  name: string;
  approach: TherapyApproach;
  targetIssues: string[];
  instructions: string;
  materials?: string[];
  duration: string;
  clientHandout?: string;
  therapistNotes: string;
}

export interface CrisisProtocol {
  clientId: string;
  emergencyContacts: { name: string; phone: string; relationship: string }[];
  safetyPlan: {
    warningSignsRecognized: string[];
    copingStrategies: string[];
    distractions: string[];
    supportPeople: string[];
    professionalContacts: string[];
    emergencyNumbers: string[];
    environmentalSafety: string[];
  };
  lastReviewed: string;
}

// ============================================
// SESSION SUPPORT FUNCTIONS
// ============================================

// Generate session note template based on approach
export async function generateSessionNoteTemplate(
  approach: TherapyApproach,
  sessionContext: {
    sessionNumber: number;
    presentingIssues: string[];
    previousSessionSummary?: string;
  }
): Promise<{
  suggestedStructure: string[];
  interventionSuggestions: string[];
  questionsToExplore: string[];
  homeworkIdeas: string[];
}> {
  const approachDescriptions: Record<TherapyApproach, string> = {
    cbt: "Terapia poznawczo-behawioralna - praca z myślami, emocjami i zachowaniami",
    dbt: "Dialektyczna terapia behawioralna - mindfulness, regulacja emocji, tolerancja dystresu",
    psychodynamic: "Psychodynamiczna - nieświadome procesy, relacje, historia",
    humanistic: "Humanistyczna - bezwarunkowa akceptacja, autentyczność, samorealizacja",
    act: "ACT - akceptacja, wartości, zaangażowane działanie",
    emdr: "EMDR - przetwarzanie traumy przez ruchy gałek ocznych",
    mindfulness: "Mindfulness - uważność, obecność, akceptacja",
    solution_focused: "Skoncentrowana na rozwiązaniach - zasoby, wyjątki, cele",
    gestalt: "Gestalt - tu i teraz, świadomość, eksperyment",
    systemic: "Systemowa - wzorce relacyjne, system rodzinny",
    integrative: "Integracyjna - łączenie różnych podejść"
  };

  const prompt = `Jako doświadczony terapeuta ${approachDescriptions[approach]}, przygotuj wsparcie dla sesji.

SESJA NUMER: ${sessionContext.sessionNumber}
GŁÓWNE PROBLEMY: ${sessionContext.presentingIssues.join(", ")}
${sessionContext.previousSessionSummary ? `POPRZEDNIA SESJA: ${sessionContext.previousSessionSummary}` : ""}

Odpowiedz TYLKO w formacie JSON:
{
  "suggestedStructure": [
    "Sprawdzenie samopoczucia i wydarzeń od ostatniej sesji",
    "Przegląd zadania domowego",
    "Główny temat sesji",
    "Praca terapeutyczna",
    "Podsumowanie i zadanie domowe"
  ],
  "interventionSuggestions": [
    "specyficzna interwencja dla tego podejścia",
    "kolejna interwencja"
  ],
  "questionsToExplore": [
    "pytanie do eksploracji",
    "kolejne pytanie"
  ],
  "techniquesForSession": [
    {
      "name": "nazwa techniki",
      "description": "krótki opis",
      "when": "kiedy użyć"
    }
  ],
  "homeworkIdeas": [
    "pomysł na zadanie domowe",
    "kolejny pomysł"
  ],
  "potentialChallenges": [
    "potencjalna trudność i jak ją adresować"
  ]
}

Bądź praktyczny i specyficzny dla podejścia ${approach}.`;

  const response = await generateFromPrompt(prompt, {
    maxTokens: 2000,
    temperature: 0.7,
  });

  try {
    return JSON.parse(response);
  } catch {
    throw new Error("Nie udało się wygenerować szablonu notatki.");
  }
}

// Generate treatment plan suggestions
export async function generateTreatmentPlanSuggestions(
  clientInfo: {
    presentingProblems: string[];
    history?: string;
    strengths?: string[];
    preferences?: string;
  }
): Promise<{
  suggestedApproaches: { approach: TherapyApproach; rationale: string }[];
  goals: TreatmentGoal[];
  estimatedDuration: string;
  frequency: string;
  considerations: string[];
}> {
  const prompt = `Jako doświadczony terapeuta, zaproponuj plan leczenia.

PROBLEMY ZGŁASZANE: ${clientInfo.presentingProblems.join(", ")}
${clientInfo.history ? `HISTORIA: ${clientInfo.history}` : ""}
${clientInfo.strengths ? `MOCNE STRONY: ${clientInfo.strengths.join(", ")}` : ""}
${clientInfo.preferences ? `PREFERENCJE: ${clientInfo.preferences}` : ""}

Odpowiedz TYLKO w formacie JSON:
{
  "suggestedApproaches": [
    {
      "approach": "cbt/dbt/psychodynamic/etc",
      "rationale": "uzasadnienie wyboru",
      "evidenceBase": "dowody skuteczności"
    }
  ],
  "goals": [
    {
      "description": "cel terapeutyczny",
      "objectives": [
        {
          "objective": "mierzalny cel cząstkowy",
          "measurable": "jak mierzyć postęp",
          "targetDate": "orientacyjny czas"
        }
      ]
    }
  ],
  "estimatedDuration": "szacowany czas terapii",
  "frequency": "zalecana częstotliwość sesji",
  "phases": [
    {
      "phase": "stabilizacja/eksploracja/przepracowanie/integracja",
      "duration": "czas trwania",
      "focus": "na czym skupienie"
    }
  ],
  "considerations": [
    "ważna kwestia do rozważenia"
  ],
  "contraindicationsToWatch": [
    "na co uważać"
  ]
}

Pamiętaj: To sugestie - plan wymaga dostosowania do indywidualnego klienta.`;

  const response = await generateFromPrompt(prompt, {
    maxTokens: 2500,
    temperature: 0.6,
  });

  try {
    const parsed = JSON.parse(response);
    return {
      ...parsed,
      goals: parsed.goals.map((g: Omit<TreatmentGoal, "id" | "progress">) => ({
        id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...g,
        progress: 0,
      })),
    };
  } catch {
    throw new Error("Nie udało się wygenerować sugestii planu leczenia.");
  }
}

// Generate therapy exercises for specific issues
export async function generateTherapyExercise(
  issue: string,
  approach: TherapyApproach,
  options?: {
    clientAge?: string;
    settingPreference?: "in_session" | "homework" | "both";
  }
): Promise<TherapyExercise> {
  const prompt = `Stwórz ćwiczenie terapeutyczne.

PROBLEM: ${issue}
PODEJŚCIE: ${approach}
${options?.clientAge ? `WIEK KLIENTA: ${options.clientAge}` : ""}
${options?.settingPreference ? `USTAWIENIE: ${options.settingPreference}` : ""}

Odpowiedz TYLKO w formacie JSON:
{
  "name": "nazwa ćwiczenia",
  "approach": "${approach}",
  "targetIssues": ["problem 1", "problem 2"],
  "rationale": "dlaczego to ćwiczenie pomaga",
  "instructions": "szczegółowe instrukcje krok po kroku",
  "materials": ["potrzebne materiały"],
  "duration": "czas trwania",
  "adaptations": {
    "simpler": "uproszczona wersja",
    "advanced": "bardziej zaawansowana wersja"
  },
  "clientHandout": "tekst do wydrukowania dla klienta (opcjonalnie)",
  "therapistNotes": "notatki dla terapeuty - na co zwracać uwagę",
  "processQuestions": [
    "pytanie do omówienia po ćwiczeniu"
  ],
  "contraindications": [
    "kiedy NIE stosować tego ćwiczenia"
  ]
}`;

  const response = await generateFromPrompt(prompt, {
    maxTokens: 2000,
    temperature: 0.7,
  });

  try {
    const parsed = JSON.parse(response);
    return {
      id: `exercise_${Date.now()}`,
      ...parsed,
    };
  } catch {
    throw new Error("Nie udało się wygenerować ćwiczenia.");
  }
}

// Generate safety plan
export async function generateSafetyPlan(
  clientContext: {
    warningSignsIdentified?: string[];
    previousCopingStrategies?: string[];
    supportNetwork?: string[];
  }
): Promise<CrisisProtocol["safetyPlan"]> {
  const prompt = `Pomóż stworzyć plan bezpieczeństwa dla osoby w kryzysie.

${clientContext.warningSignsIdentified ? `ZIDENTYFIKOWANE SYGNAŁY OSTRZEGAWCZE: ${clientContext.warningSignsIdentified.join(", ")}` : ""}
${clientContext.previousCopingStrategies ? `WCZEŚNIEJSZE STRATEGIE: ${clientContext.previousCopingStrategies.join(", ")}` : ""}
${clientContext.supportNetwork ? `SIEĆ WSPARCIA: ${clientContext.supportNetwork.join(", ")}` : ""}

Odpowiedz TYLKO w formacie JSON:
{
  "warningSignsRecognized": [
    "sygnał ostrzegawczy 1",
    "sygnał ostrzegawczy 2"
  ],
  "copingStrategies": [
    "strategia radzenia sobie 1 - co mogę zrobić sam/sama",
    "strategia 2"
  ],
  "distractions": [
    "aktywność odwracająca uwagę 1",
    "aktywność 2"
  ],
  "supportPeople": [
    "osoba wspierająca 1 - jak może pomóc",
    "osoba 2"
  ],
  "professionalContacts": [
    "terapeuta/psychiatra - kontakt",
    "linia kryzysowa"
  ],
  "emergencyNumbers": [
    "Telefon zaufania: 116 123",
    "Pogotowie: 112",
    "Centrum Wsparcia: numer"
  ],
  "environmentalSafety": [
    "usunięcie dostępu do środków samookaleczenia",
    "bezpieczne miejsce"
  ],
  "reasonsToLive": [
    "powód by żyć 1",
    "powód 2"
  ]
}

WAŻNE: To narzędzie wspomagające - plan musi być tworzony RAZEM z klientem.`;

  const response = await generateFromPrompt(prompt, {
    maxTokens: 1500,
    temperature: 0.5,
  });

  try {
    return JSON.parse(response);
  } catch {
    throw new Error("Nie udało się wygenerować planu bezpieczeństwa.");
  }
}

// Progress summary for client
export async function generateProgressSummary(
  sessions: {
    date: string;
    moodRating?: number;
    anxietyRating?: number;
    keyThemes: string[];
    interventions: string[];
  }[]
): Promise<{
  overallProgress: string;
  moodTrend: string;
  keyAchievements: string[];
  ongoingChallenges: string[];
  recommendations: string[];
  visualData: { metric: string; values: number[] }[];
}> {
  const prompt = `Przygotuj podsumowanie postępów terapeutycznych.

SESJE:
${sessions.map(s => `
Data: ${s.date}
Nastrój: ${s.moodRating || "brak"}/10
Lęk: ${s.anxietyRating || "brak"}/10
Tematy: ${s.keyThemes.join(", ")}
Interwencje: ${s.interventions.join(", ")}
`).join("\n")}

Odpowiedz TYLKO w formacie JSON:
{
  "overallProgress": "ogólna ocena postępów",
  "moodTrend": "trend nastroju - poprawa/stabilizacja/pogorszenie",
  "keyAchievements": [
    "osiągnięcie 1",
    "osiągnięcie 2"
  ],
  "patternsObserved": [
    "zaobserwowany wzorzec"
  ],
  "ongoingChallenges": [
    "wyzwanie wymagające pracy"
  ],
  "recommendations": [
    "rekomendacja na kolejny okres"
  ],
  "clientStrengths": [
    "mocna strona klienta"
  ]
}`;

  const response = await generateFromPrompt(prompt, {
    maxTokens: 1500,
    temperature: 0.6,
  });

  try {
    const parsed = JSON.parse(response);

    // Add visual data for mood/anxiety if available
    const visualData: { metric: string; values: number[] }[] = [];
    const moodValues = sessions.filter(s => s.moodRating).map(s => s.moodRating!);
    const anxietyValues = sessions.filter(s => s.anxietyRating).map(s => s.anxietyRating!);

    if (moodValues.length > 0) {
      visualData.push({ metric: "mood", values: moodValues });
    }
    if (anxietyValues.length > 0) {
      visualData.push({ metric: "anxiety", values: anxietyValues });
    }

    return {
      ...parsed,
      visualData,
    };
  } catch {
    throw new Error("Nie udało się wygenerować podsumowania postępów.");
  }
}

// ============================================
// RESOURCES LIBRARY
// ============================================

export const CBT_TECHNIQUES = [
  {
    name: "Restrukturyzacja poznawcza",
    description: "Identyfikacja i zmiana nieadaptacyjnych myśli",
    steps: ["Identyfikacja myśli automatycznej", "Szukanie dowodów za i przeciw", "Formułowanie myśli alternatywnej"],
  },
  {
    name: "Ekspozycja stopniowana",
    description: "Stopniowa konfrontacja z lękiem",
    steps: ["Stworzenie hierarchii lęku", "Rozpoczęcie od najmniej lękowej sytuacji", "Stopniowe zwiększanie trudności"],
  },
  {
    name: "Aktywacja behawioralna",
    description: "Zwiększanie aktywności dla poprawy nastroju",
    steps: ["Monitorowanie aktywności i nastroju", "Planowanie przyjemnych aktywności", "Stopniowe zwiększanie zaangażowania"],
  },
];

export const DBT_SKILLS = {
  mindfulness: ["Obserwowanie", "Opisywanie", "Uczestniczenie", "Bez osądzania", "Jednopunktowo", "Skutecznie"],
  distressTolerance: ["TIPP", "Dystansowanie", "STOP", "Pros and Cons", "Akceptacja radykalna"],
  emotionRegulation: ["ABC PLEASE", "Działanie przeciwne", "Sprawdzanie faktów", "Budowanie mistrzostwa"],
  interpersonalEffectiveness: ["DEAR MAN", "GIVE", "FAST"],
};
