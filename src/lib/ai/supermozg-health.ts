// SuperMózg Health Optimization Module
// Supplements, Air Purifiers, Plants, Lifestyle Stacks
import { generateFromPrompt } from "./groq";

// ============================================
// TYPES
// ============================================

export interface Supplement {
  id: string;
  name: string;
  category: SupplementCategory;
  benefits: string[];
  dosage: string;
  timing: "morning" | "afternoon" | "evening" | "with_meals" | "empty_stomach";
  interactions: string[];
  contraindications: string[];
  scientificEvidence: "strong" | "moderate" | "emerging" | "traditional";
  sources: string[];
}

export type SupplementCategory =
  | "nootropics"        // cognitive enhancement
  | "adaptogens"        // stress adaptation
  | "vitamins"          // essential vitamins
  | "minerals"          // essential minerals
  | "amino_acids"       // building blocks
  | "antioxidants"      // cell protection
  | "probiotics"        // gut health
  | "omega_fatty_acids" // brain & heart
  | "herbs"             // herbal supplements
  | "hormones"          // hormone support
  | "enzymes"           // digestive enzymes
  | "mushrooms";        // medicinal mushrooms

export interface SupplementStack {
  id: string;
  name: string;
  goal: StackGoal;
  supplements: StackItem[];
  schedule: DailySchedule;
  duration: string;
  notes: string;
  warnings: string[];
  expectedResults: string[];
  timeline: { week: number; expectation: string }[];
}

export interface StackItem {
  supplement: Supplement;
  dosage: string;
  frequency: string;
  priority: "essential" | "recommended" | "optional";
}

export interface DailySchedule {
  morning: string[];
  withBreakfast: string[];
  midday: string[];
  withLunch: string[];
  afternoon: string[];
  withDinner: string[];
  evening: string[];
  beforeBed: string[];
}

export type StackGoal =
  | "cognitive_enhancement"
  | "stress_reduction"
  | "energy_optimization"
  | "sleep_improvement"
  | "immune_support"
  | "longevity"
  | "athletic_performance"
  | "mood_balance"
  | "gut_health"
  | "detoxification"
  | "hormone_balance"
  | "skin_health"
  | "aldehyde_detox";  // aldehydy - Twój specjalny focus

export interface AirPurifier {
  id: string;
  name: string;
  technology: AirPurifierTech[];
  roomSize: string;
  cadr: number; // Clean Air Delivery Rate
  filters: string[];
  features: string[];
  targetPollutants: string[];
  noiseLevel: string;
  energyConsumption: string;
  maintenanceCost: string;
  recommendation: string;
}

export type AirPurifierTech =
  | "hepa"
  | "activated_carbon"
  | "uv_c"
  | "ionization"
  | "photocatalytic"
  | "plasma"
  | "ozone_free";

export interface Plant {
  id: string;
  name: string;
  scientificName: string;
  airPurifyingScore: number; // 1-10
  pollutantsRemoved: string[];
  careLevel: "easy" | "medium" | "difficult";
  lightRequirement: "low" | "medium" | "bright_indirect" | "direct_sun";
  wateringFrequency: string;
  petSafe: boolean;
  additionalBenefits: string[];
  placement: string[];
  nasaRating: boolean; // NASA Clean Air Study
}

export interface HealthOptimizationPlan {
  id: string;
  userId: string;
  goals: StackGoal[];
  supplementStack: SupplementStack;
  airPurifiers: AirPurifier[];
  plants: Plant[];
  lifestyleRecommendations: LifestyleRecommendation[];
  dailyRoutine: DailyRoutine;
  trackingMetrics: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LifestyleRecommendation {
  category: "sleep" | "nutrition" | "exercise" | "stress" | "environment" | "social" | "mindfulness";
  recommendation: string;
  priority: "high" | "medium" | "low";
  scientificBasis: string;
  implementation: string[];
}

export interface DailyRoutine {
  wakeUp: string;
  morningRoutine: string[];
  workBlocks: { time: string; activity: string }[];
  breaks: { time: string; activity: string }[];
  eveningRoutine: string[];
  bedtime: string;
  sleepOptimization: string[];
}

// ============================================
// SUPPLEMENT DATABASE (przykładowe)
// ============================================

export const SUPPLEMENT_DATABASE: Partial<Record<string, Supplement>> = {
  "lions_mane": {
    id: "lions_mane",
    name: "Lion's Mane (Soplówka jeżowata)",
    category: "mushrooms",
    benefits: ["Neurogeneza", "Poprawa pamięci", "Ochrona neuronów", "Redukcja lęku"],
    dosage: "500-3000mg dziennie",
    timing: "morning",
    interactions: ["Leki przeciwkrzepliwe"],
    contraindications: ["Alergia na grzyby"],
    scientificEvidence: "moderate",
    sources: ["PubMed: PMID 24266378", "Journal of Agricultural and Food Chemistry"]
  },
  "magnesium_glycinate": {
    id: "magnesium_glycinate",
    name: "Magnez (glicynian)",
    category: "minerals",
    benefits: ["Relaksacja mięśni", "Poprawa snu", "Redukcja stresu", "Zdrowie kości"],
    dosage: "200-400mg dziennie",
    timing: "evening",
    interactions: ["Antybiotyki", "Bisfosfoniany"],
    contraindications: ["Niewydolność nerek"],
    scientificEvidence: "strong",
    sources: ["Nutrients 2017", "Magnesium Research"]
  },
  "vitamin_d3": {
    id: "vitamin_d3",
    name: "Witamina D3",
    category: "vitamins",
    benefits: ["Zdrowie kości", "Układ odpornościowy", "Nastrój", "Zdrowie mięśni"],
    dosage: "2000-5000 IU dziennie",
    timing: "with_meals",
    interactions: ["Statyny", "Steroidy"],
    contraindications: ["Hiperkalcemia"],
    scientificEvidence: "strong",
    sources: ["Endocrine Reviews", "NEJM"]
  },
  "omega3": {
    id: "omega3",
    name: "Omega-3 (EPA/DHA)",
    category: "omega_fatty_acids",
    benefits: ["Zdrowie mózgu", "Redukcja stanów zapalnych", "Zdrowie serca", "Nastrój"],
    dosage: "2-4g dziennie (min. 1g EPA)",
    timing: "with_meals",
    interactions: ["Leki przeciwkrzepliwe"],
    contraindications: ["Alergia na ryby"],
    scientificEvidence: "strong",
    sources: ["American Heart Association", "JAMA"]
  },
  "nac": {
    id: "nac",
    name: "NAC (N-Acetylocysteina)",
    category: "amino_acids",
    benefits: ["Detoksykacja", "Wsparcie wątroby", "Antyoksydant", "Zdrowie płuc", "DETOX ALDEHYDÓW"],
    dosage: "600-1800mg dziennie",
    timing: "empty_stomach",
    interactions: ["Nitrogliceryna"],
    contraindications: ["Astma (ostrożnie)"],
    scientificEvidence: "strong",
    sources: ["Biochemical Pharmacology", "Respiratory Research"]
  },
  "glutathione": {
    id: "glutathione",
    name: "Glutation (liposomalny)",
    category: "antioxidants",
    benefits: ["Master antyoksydant", "Detoksykacja", "NEUTRALIZACJA ALDEHYDÓW", "Wsparcie wątroby"],
    dosage: "250-500mg dziennie",
    timing: "empty_stomach",
    interactions: [],
    contraindications: [],
    scientificEvidence: "moderate",
    sources: ["Oxidative Medicine and Cellular Longevity"]
  },
  "molybdenum": {
    id: "molybdenum",
    name: "Molibden",
    category: "minerals",
    benefits: ["Metabolizm siarki", "DETOX ALDEHYDÓW (aldehydowa oksydaza)", "Metabolizm puryn"],
    dosage: "75-250mcg dziennie",
    timing: "with_meals",
    interactions: ["Wysoki poziom miedzi"],
    contraindications: [],
    scientificEvidence: "moderate",
    sources: ["Journal of Trace Elements in Medicine and Biology"]
  }
};

// ============================================
// PLANT DATABASE (NASA Clean Air Study + więcej)
// ============================================

export const PLANT_DATABASE: Partial<Record<string, Plant>> = {
  "peace_lily": {
    id: "peace_lily",
    name: "Skrzydłokwiat (Peace Lily)",
    scientificName: "Spathiphyllum",
    airPurifyingScore: 9,
    pollutantsRemoved: ["Formaldehyd", "Benzen", "Trichloroetylen", "Ksylen", "Amoniak", "ALDEHYDY"],
    careLevel: "easy",
    lightRequirement: "low",
    wateringFrequency: "1-2x tygodniowo",
    petSafe: false,
    additionalBenefits: ["Zwiększa wilgotność", "Kwitnie w cieniu"],
    placement: ["Sypialnia", "Łazienka", "Biuro"],
    nasaRating: true
  },
  "snake_plant": {
    id: "snake_plant",
    name: "Sansewieria (Snake Plant)",
    scientificName: "Dracaena trifasciata",
    airPurifyingScore: 8,
    pollutantsRemoved: ["Formaldehyd", "Benzen", "Ksylen", "Toluen", "Trichloroetylen"],
    careLevel: "easy",
    lightRequirement: "low",
    wateringFrequency: "co 2-3 tygodnie",
    petSafe: false,
    additionalBenefits: ["Produkuje tlen w nocy", "Prawie niezniszczalna"],
    placement: ["Sypialnia", "Biuro", "Salon"],
    nasaRating: true
  },
  "spider_plant": {
    id: "spider_plant",
    name: "Zielistka (Spider Plant)",
    scientificName: "Chlorophytum comosum",
    airPurifyingScore: 8,
    pollutantsRemoved: ["Formaldehyd", "Ksylen", "Tlenek węgla"],
    careLevel: "easy",
    lightRequirement: "bright_indirect",
    wateringFrequency: "1x tygodniowo",
    petSafe: true,
    additionalBenefits: ["Bezpieczna dla zwierząt", "Szybko się rozmnaża"],
    placement: ["Kuchnia", "Salon", "Wiszące doniczki"],
    nasaRating: true
  },
  "boston_fern": {
    id: "boston_fern",
    name: "Nefrolepis (Boston Fern)",
    scientificName: "Nephrolepis exaltata",
    airPurifyingScore: 9,
    pollutantsRemoved: ["Formaldehyd", "Ksylen", "ALDEHYDY", "Toluen"],
    careLevel: "medium",
    lightRequirement: "bright_indirect",
    wateringFrequency: "utrzymuj wilgotność",
    petSafe: true,
    additionalBenefits: ["Najlepsza do usuwania formaldehydu", "Naturalne nawilżanie"],
    placement: ["Łazienka", "Kuchnia"],
    nasaRating: true
  },
  "english_ivy": {
    id: "english_ivy",
    name: "Bluszcz pospolity (English Ivy)",
    scientificName: "Hedera helix",
    airPurifyingScore: 9,
    pollutantsRemoved: ["Formaldehyd", "Benzen", "ALDEHYDY", "Pleśń", "Fekalia"],
    careLevel: "easy",
    lightRequirement: "medium",
    wateringFrequency: "gdy wierzch przeschnie",
    petSafe: false,
    additionalBenefits: ["Redukuje pleśń w powietrzu", "Pnące"],
    placement: ["Łazienka", "Wisząca doniczka"],
    nasaRating: true
  }
};

// ============================================
// GENERATION FUNCTIONS
// ============================================

// Generate personalized supplement stack
export async function generateSupplementStack(
  goals: StackGoal[],
  userProfile: {
    age?: number;
    gender?: string;
    currentSupplements?: string[];
    healthConditions?: string[];
    medications?: string[];
    budget?: "low" | "medium" | "high";
    preferences?: string[];
  }
): Promise<SupplementStack> {
  const prompt = `Stwórz spersonalizowany stack suplementów dla użytkownika.

CELE: ${goals.join(", ")}

PROFIL UŻYTKOWNIKA:
- Wiek: ${userProfile.age || "nieznany"}
- Płeć: ${userProfile.gender || "nieznana"}
- Obecne suplementy: ${userProfile.currentSupplements?.join(", ") || "brak"}
- Stany zdrowia: ${userProfile.healthConditions?.join(", ") || "brak"}
- Leki: ${userProfile.medications?.join(", ") || "brak"}
- Budżet: ${userProfile.budget || "medium"}
- Preferencje: ${userProfile.preferences?.join(", ") || "brak"}

WAŻNE DLA DETOKSU ALDEHYDÓW:
- NAC (N-Acetylocysteina) - prekursor glutationu
- Glutation liposomalny - bezpośrednia neutralizacja
- Molibden - kofaktor aldehydowej oksydazy
- Witamina B1 (tiamina) - metabolizm aldehydów
- Witamina C - wsparcie antyoksydacyjne
- Selen - wsparcie glutationu

Odpowiedz TYLKO w formacie JSON:
{
  "name": "Nazwa stacku",
  "goal": "główny cel",
  "supplements": [
    {
      "name": "Nazwa suplementu",
      "dosage": "dawka",
      "timing": "morning/afternoon/evening/with_meals/empty_stomach",
      "frequency": "dziennie/2x dziennie/etc",
      "priority": "essential/recommended/optional",
      "benefits": ["korzyść 1", "korzyść 2"],
      "scientificBasis": "podstawa naukowa"
    }
  ],
  "schedule": {
    "morning": ["suplement1", "suplement2"],
    "withBreakfast": ["suplement3"],
    "midday": [],
    "withLunch": ["suplement4"],
    "afternoon": [],
    "withDinner": ["suplement5"],
    "evening": ["suplement6"],
    "beforeBed": ["suplement7"]
  },
  "duration": "czas trwania stacku",
  "notes": "dodatkowe uwagi",
  "warnings": ["ostrzeżenie 1", "ostrzeżenie 2"],
  "expectedResults": ["rezultat 1", "rezultat 2"],
  "timeline": [
    {"week": 1, "expectation": "co można oczekiwać"},
    {"week": 4, "expectation": "co można oczekiwać"},
    {"week": 12, "expectation": "co można oczekiwać"}
  ],
  "totalMonthlyCost": "szacunkowy koszt miesięczny PLN"
}

ZASADY:
1. Rozpocznij od podstaw (witaminy D3, magnez, omega-3)
2. Dodawaj stopniowo - nie wszystko naraz
3. Uwzględnij interakcje między suplementami
4. Ostrzegaj o potencjalnych interakcjach z lekami
5. Dla aldehydów: priorytet NAC, glutation, molibden
6. Maksymalnie 30-40 suplementów dla zaawansowanych stacków`;

  const response = await generateFromPrompt(prompt, {
    maxTokens: 4000,
    temperature: 0.7,
  });

  try {
    const parsed = JSON.parse(response);
    return {
      id: `stack_${Date.now()}`,
      ...parsed,
    };
  } catch {
    throw new Error("Nie udało się wygenerować stacku suplementów.");
  }
}

// Generate air quality optimization plan
export async function generateAirQualityPlan(
  roomDetails: {
    rooms: { name: string; size: string; usage: string }[];
    pollutionSources?: string[];
    budget?: string;
    concerns?: string[];
  }
): Promise<{
  purifiers: { room: string; recommendation: AirPurifier }[];
  plants: { room: string; plants: Plant[] }[];
  additionalTips: string[];
  maintenanceSchedule: { task: string; frequency: string }[];
}> {
  const prompt = `Stwórz plan optymalizacji jakości powietrza.

POMIESZCZENIA:
${roomDetails.rooms.map(r => `- ${r.name}: ${r.size}, użycie: ${r.usage}`).join("\n")}

ŹRÓDŁA ZANIECZYSZCZEŃ: ${roomDetails.pollutionSources?.join(", ") || "standardowe domowe"}
BUDŻET: ${roomDetails.budget || "średni"}
GŁÓWNE OBAWY: ${roomDetails.concerns?.join(", ") || "ogólna jakość powietrza"}

Odpowiedz TYLKO w formacie JSON:
{
  "purifiers": [
    {
      "room": "nazwa pokoju",
      "recommendation": {
        "name": "nazwa urządzenia/typu",
        "technology": ["hepa", "activated_carbon"],
        "roomSize": "do X m²",
        "cadr": 300,
        "features": ["cecha1", "cecha2"],
        "targetPollutants": ["aldehydy", "VOC", "pyłki"],
        "priceRange": "XXX-XXX PLN",
        "topPicks": ["model 1", "model 2"]
      }
    }
  ],
  "plants": [
    {
      "room": "nazwa pokoju",
      "plants": [
        {
          "name": "nazwa rośliny",
          "scientificName": "nazwa łacińska",
          "quantity": 2,
          "placement": "gdzie umieścić",
          "pollutantsRemoved": ["formaldehyd", "aldehydy"],
          "careLevel": "easy/medium/difficult"
        }
      ]
    }
  ],
  "additionalTips": [
    "wskazówka 1",
    "wskazówka 2"
  ],
  "maintenanceSchedule": [
    {"task": "wymiana filtra HEPA", "frequency": "co 6-12 miesięcy"},
    {"task": "podlewanie roślin", "frequency": "1-2x tygodniowo"}
  ],
  "aldehydeSources": ["meble z płyty", "farby", "dymy"],
  "aldehydeReductionStrategy": "szczegółowa strategia redukcji aldehydów"
}

PRIORYTET: Usuwanie aldehydów (formaldehyd, acetaldehyd) - używaj roślin z NASA Clean Air Study`;

  const response = await generateFromPrompt(prompt, {
    maxTokens: 3000,
    temperature: 0.6,
  });

  try {
    return JSON.parse(response);
  } catch {
    throw new Error("Nie udało się wygenerować planu jakości powietrza.");
  }
}

// Generate complete health optimization plan
export async function generateHealthOptimizationPlan(
  userInput: {
    goals: StackGoal[];
    currentHealth: string;
    lifestyle: string;
    budget: "low" | "medium" | "high" | "unlimited";
    timeCommitment: "minimal" | "moderate" | "dedicated";
    focusAreas: string[];
  }
): Promise<HealthOptimizationPlan> {
  const prompt = `Stwórz kompleksowy plan optymalizacji zdrowia SuperMózg.

CELE: ${userInput.goals.join(", ")}
OBECNY STAN ZDROWIA: ${userInput.currentHealth}
STYL ŻYCIA: ${userInput.lifestyle}
BUDŻET: ${userInput.budget}
ZAANGAŻOWANIE CZASOWE: ${userInput.timeCommitment}
OBSZARY FOKUSOWE: ${userInput.focusAreas.join(", ")}

Odpowiedz TYLKO w formacie JSON:
{
  "summary": "Podsumowanie planu",
  "supplementStack": {
    "name": "Nazwa stacku",
    "phases": [
      {
        "phase": 1,
        "duration": "4 tygodnie",
        "focus": "Fundamenty",
        "supplements": ["D3", "Magnez", "Omega-3"]
      }
    ]
  },
  "airQuality": {
    "priority": "high/medium/low",
    "recommendations": ["zalecenie 1", "zalecenie 2"]
  },
  "plants": [
    {"name": "roślina", "room": "pokój", "benefit": "korzyść"}
  ],
  "lifestyleRecommendations": [
    {
      "category": "sleep/nutrition/exercise/stress/environment",
      "recommendation": "zalecenie",
      "priority": "high/medium/low",
      "implementation": ["krok 1", "krok 2"]
    }
  ],
  "dailyRoutine": {
    "wakeUp": "6:00",
    "morningRoutine": ["krok 1", "krok 2"],
    "workBlocks": [{"time": "9:00-12:00", "activity": "deep work"}],
    "eveningRoutine": ["krok 1", "krok 2"],
    "bedtime": "22:30",
    "sleepOptimization": ["tip 1", "tip 2"]
  },
  "trackingMetrics": ["metryka 1", "metryka 2"],
  "weeklyCheckpoints": ["co sprawdzać tygodniowo"],
  "monthlyReview": ["co oceniać miesięcznie"],
  "expectedTimeline": {
    "week1": "oczekiwania",
    "month1": "oczekiwania",
    "month3": "oczekiwania",
    "month6": "oczekiwania"
  }
}`;

  const response = await generateFromPrompt(prompt, {
    maxTokens: 5000,
    temperature: 0.7,
  });

  try {
    const parsed = JSON.parse(response);
    return {
      id: `plan_${Date.now()}`,
      userId: "user",
      goals: userInput.goals,
      ...parsed,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch {
    throw new Error("Nie udało się wygenerować planu optymalizacji.");
  }
}

// Aldehyde-specific detox protocol
export async function generateAldehydeDetoxProtocol(
  exposureLevel: "low" | "moderate" | "high",
  sources: string[]
): Promise<{
  protocol: {
    phase: number;
    duration: string;
    supplements: { name: string; dosage: string; timing: string }[];
    lifestyle: string[];
  }[];
  environmentalChanges: string[];
  dietaryRecommendations: string[];
  monitoringMarkers: string[];
  scientificReferences: string[];
}> {
  const prompt = `Stwórz protokół detoksykacji aldehydów.

POZIOM EKSPOZYCJI: ${exposureLevel}
ŹRÓDŁA: ${sources.join(", ")}

KLUCZOWE SUPLEMENTY DLA ALDEHYDÓW:
1. NAC (N-Acetylocysteina) - prekursor glutationu, bezpośrednia neutralizacja
2. Glutation liposomalny - główny antyoksydant, wiąże aldehydy
3. Molibden - kofaktor aldehydowej oksydazy (ALDH)
4. Witamina B1 (Tiamina) - kofaktor dla ALDH
5. Witamina B2 (Ryboflawina) - wsparcie metabolizmu
6. Alfa-kwas liponowy - regeneracja glutationu
7. Witamina C - ochrona antyoksydacyjna
8. Selen - kofaktor peroksydazy glutationowej

Odpowiedz TYLKO w formacie JSON:
{
  "protocol": [
    {
      "phase": 1,
      "name": "Przygotowanie",
      "duration": "1-2 tygodnie",
      "supplements": [
        {"name": "NAC", "dosage": "600mg 2x dziennie", "timing": "na czczo"},
        {"name": "Molibden", "dosage": "150mcg", "timing": "z posiłkiem"}
      ],
      "lifestyle": ["zwiększ nawodnienie", "ogranicz alkohol"]
    },
    {
      "phase": 2,
      "name": "Intensywna detoksykacja",
      "duration": "4-6 tygodni",
      "supplements": [...],
      "lifestyle": [...]
    },
    {
      "phase": 3,
      "name": "Utrzymanie",
      "duration": "ongoing",
      "supplements": [...],
      "lifestyle": [...]
    }
  ],
  "environmentalChanges": [
    "Usuń źródła formaldehydu (meble z płyty wiórowej)",
    "Zainstaluj oczyszczacz z węglem aktywnym",
    "Dodaj rośliny oczyszczające (skrzydłokwiat, nefrolepis)"
  ],
  "dietaryRecommendations": [
    "Warzywa krzyżowe (brokuły, kapusta) - wsparcie detoksu",
    "Czosnek - źródło siarki",
    "Kurkuma - właściwości przeciwzapalne"
  ],
  "monitoringMarkers": [
    "Poziom glutationu (badanie krwi)",
    "Markery wątrobowe (ALT, AST)",
    "Samopoczucie i energia"
  ],
  "scientificReferences": [
    "Acetaldehyde metabolism - ALDH enzymes",
    "NAC and glutathione synthesis",
    "Molybdenum and aldehyde oxidase"
  ]
}`;

  const response = await generateFromPrompt(prompt, {
    maxTokens: 3500,
    temperature: 0.6,
  });

  try {
    return JSON.parse(response);
  } catch {
    throw new Error("Nie udało się wygenerować protokołu detoksu aldehydów.");
  }
}
