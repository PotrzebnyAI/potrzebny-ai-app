// Medical Panel - For Licensed Healthcare Professionals
// Research Integration, Clinical Tools, Evidence-Based Insights
import { generateFromPrompt } from "./groq";
import { searchPapers, getPaper, type Paper } from "./semantic-scholar";

// ============================================
// TYPES
// ============================================

export interface MedicalLicense {
  licenseNumber: string;
  type: "physician" | "specialist" | "nurse" | "pharmacist" | "psychologist" | "dietitian";
  specialty?: string;
  country: string;
  verified: boolean;
  verifiedAt?: string;
  expiresAt?: string;
}

export interface MedicalUser {
  id: string;
  license: MedicalLicense;
  specializations: string[];
  institution?: string;
  researchInterests: string[];
}

export interface ResearchQuery {
  query: string;
  filters: {
    yearFrom?: number;
    yearTo?: number;
    studyTypes?: StudyType[];
    minCitations?: number;
    journals?: string[];
    openAccess?: boolean;
  };
  maxResults?: number;
}

export type StudyType =
  | "meta_analysis"
  | "systematic_review"
  | "rct"           // Randomized Controlled Trial
  | "cohort"
  | "case_control"
  | "cross_sectional"
  | "case_report"
  | "in_vitro"
  | "animal_study";

export interface ResearchSummary {
  id: string;
  query: string;
  papers: Paper[];
  synthesis: {
    mainFindings: string[];
    consensus: string;
    controversies: string[];
    gaps: string[];
    clinicalImplications: string[];
    evidenceQuality: "high" | "moderate" | "low" | "very_low";
  };
  recommendations: {
    forPractice: string[];
    forResearch: string[];
  };
  createdAt: string;
}

export interface ClinicalGuideline {
  id: string;
  condition: string;
  source: string;
  lastUpdated: string;
  recommendations: {
    strength: "strong" | "moderate" | "weak" | "expert_opinion";
    recommendation: string;
    evidence: string;
  }[];
  contraindications: string[];
  monitoring: string[];
}

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: "major" | "moderate" | "minor";
  mechanism: string;
  clinicalEffect: string;
  management: string;
  references: string[];
}

export interface PatientCase {
  id: string;
  presentation: string;
  history: string;
  symptoms: string[];
  vitals?: Record<string, string>;
  labs?: Record<string, string>;
  imaging?: string[];
  differentialDiagnosis?: string[];
}

export interface ClinicalDecisionSupport {
  patientCase: PatientCase;
  differentialDiagnosis: {
    diagnosis: string;
    probability: "high" | "moderate" | "low";
    supportingFeatures: string[];
    againstFeatures: string[];
    testsToConfirm: string[];
  }[];
  recommendedTests: {
    test: string;
    rationale: string;
    urgency: "immediate" | "soon" | "routine";
  }[];
  redFlags: string[];
  suggestedManagement: string[];
  references: string[];
}

// ============================================
// RESEARCH FUNCTIONS
// ============================================

// Search medical literature with synthesis
export async function searchMedicalLiterature(
  query: ResearchQuery
): Promise<ResearchSummary> {
  // First, search papers using Semantic Scholar
  const papers = await searchPapers(query.query, {
    limit: query.maxResults || 20,
    fields: ["title", "abstract", "year", "citationCount", "authors", "venue", "url"],
  });

  // Then synthesize the findings
  const paperSummaries = papers.slice(0, 10).map(p =>
    `- ${p.title} (${p.year}, ${p.citationCount} citations): ${p.abstract?.slice(0, 200)}...`
  ).join("\n");

  const synthesisPrompt = `Jako ekspert medyczny, przeanalizuj poniższe badania naukowe i stwórz syntezę.

ZAPYTANIE: ${query.query}

ZNALEZIONE BADANIA:
${paperSummaries}

Odpowiedz TYLKO w formacie JSON:
{
  "mainFindings": [
    "główne odkrycie 1",
    "główne odkrycie 2"
  ],
  "consensus": "Gdzie jest zgoda w literaturze",
  "controversies": [
    "kontrowersja lub sprzeczność 1"
  ],
  "gaps": [
    "luka badawcza 1"
  ],
  "clinicalImplications": [
    "implikacja kliniczna 1"
  ],
  "evidenceQuality": "high/moderate/low/very_low",
  "forPractice": [
    "rekomendacja dla praktyki 1"
  ],
  "forResearch": [
    "sugestia dla przyszłych badań 1"
  ]
}

UWAGA: To jest narzędzie wspomagające - nie zastępuje osądu klinicznego.`;

  const synthesisResponse = await generateFromPrompt(synthesisPrompt, {
    maxTokens: 2000,
    temperature: 0.5,
  });

  try {
    const synthesis = JSON.parse(synthesisResponse);
    return {
      id: `research_${Date.now()}`,
      query: query.query,
      papers,
      synthesis: {
        mainFindings: synthesis.mainFindings,
        consensus: synthesis.consensus,
        controversies: synthesis.controversies,
        gaps: synthesis.gaps,
        clinicalImplications: synthesis.clinicalImplications,
        evidenceQuality: synthesis.evidenceQuality,
      },
      recommendations: {
        forPractice: synthesis.forPractice,
        forResearch: synthesis.forResearch,
      },
      createdAt: new Date().toISOString(),
    };
  } catch {
    throw new Error("Nie udało się zsyntezować badań.");
  }
}

// Generate clinical decision support
export async function getClinicalDecisionSupport(
  patientCase: PatientCase
): Promise<ClinicalDecisionSupport> {
  const prompt = `Jako system wspomagania decyzji klinicznych, przeanalizuj przypadek pacjenta.

PREZENTACJA: ${patientCase.presentation}
WYWIAD: ${patientCase.history}
OBJAWY: ${patientCase.symptoms.join(", ")}
${patientCase.vitals ? `PARAMETRY ŻYCIOWE: ${JSON.stringify(patientCase.vitals)}` : ""}
${patientCase.labs ? `BADANIA LABORATORYJNE: ${JSON.stringify(patientCase.labs)}` : ""}

Odpowiedz TYLKO w formacie JSON:
{
  "differentialDiagnosis": [
    {
      "diagnosis": "rozpoznanie",
      "probability": "high/moderate/low",
      "supportingFeatures": ["cecha wspierająca 1"],
      "againstFeatures": ["cecha przeciwko"],
      "testsToConfirm": ["test potwierdzający"]
    }
  ],
  "recommendedTests": [
    {
      "test": "nazwa badania",
      "rationale": "uzasadnienie",
      "urgency": "immediate/soon/routine"
    }
  ],
  "redFlags": [
    "sygnał ostrzegawczy wymagający natychmiastowej uwagi"
  ],
  "suggestedManagement": [
    "sugestia postępowania"
  ],
  "clinicalPearls": [
    "praktyczna wskazówka kliniczna"
  ]
}

ZASTRZEŻENIE: To jest narzędzie wspomagające. Nie zastępuje oceny klinicznej lekarza.
Zawsze weryfikuj z aktualnymi wytycznymi i własnym osądem klinicznym.`;

  const response = await generateFromPrompt(prompt, {
    maxTokens: 2500,
    temperature: 0.4, // Lower temperature for clinical accuracy
  });

  try {
    const parsed = JSON.parse(response);
    return {
      patientCase,
      differentialDiagnosis: parsed.differentialDiagnosis,
      recommendedTests: parsed.recommendedTests,
      redFlags: parsed.redFlags,
      suggestedManagement: parsed.suggestedManagement,
      references: [],
    };
  } catch {
    throw new Error("Nie udało się wygenerować wsparcia decyzji klinicznej.");
  }
}

// Check drug interactions
export async function checkDrugInteractions(
  drugs: string[]
): Promise<DrugInteraction[]> {
  const prompt = `Sprawdź interakcje między lekami: ${drugs.join(", ")}

Odpowiedz TYLKO w formacie JSON:
{
  "interactions": [
    {
      "drug1": "lek 1",
      "drug2": "lek 2",
      "severity": "major/moderate/minor",
      "mechanism": "mechanizm interakcji",
      "clinicalEffect": "efekt kliniczny",
      "management": "jak zarządzać",
      "monitoring": "co monitorować"
    }
  ],
  "safeToComibne": ["pary leków bez znaczących interakcji"],
  "generalWarnings": ["ogólne ostrzeżenia"]
}

Uwzględnij interakcje farmakokinetyczne (CYP450) i farmakodynamiczne.`;

  const response = await generateFromPrompt(prompt, {
    maxTokens: 2000,
    temperature: 0.3,
  });

  try {
    const parsed = JSON.parse(response);
    return parsed.interactions;
  } catch {
    return [];
  }
}

// Generate evidence summary for specific topic
export async function generateEvidenceSummary(
  topic: string,
  context: {
    patientPopulation?: string;
    intervention?: string;
    comparison?: string;
    outcome?: string;
  }
): Promise<{
  picoQuestion: string;
  evidenceSummary: string;
  qualityOfEvidence: string;
  recommendations: string[];
  limitations: string[];
  references: string[];
}> {
  // PICO format for clinical questions
  const pico = `
P (Population): ${context.patientPopulation || "ogólna populacja"}
I (Intervention): ${context.intervention || topic}
C (Comparison): ${context.comparison || "standard care/placebo"}
O (Outcome): ${context.outcome || "primary outcomes"}
  `.trim();

  const prompt = `Jako ekspert w medycynie opartej na dowodach (EBM), przygotuj podsumowanie dowodów.

TEMAT: ${topic}

PYTANIE KLINICZNE (PICO):
${pico}

Odpowiedz TYLKO w formacie JSON:
{
  "picoQuestion": "sformułowane pytanie kliniczne",
  "evidenceSummary": "podsumowanie dostępnych dowodów (2-3 akapity)",
  "levelOfEvidence": "I/II/III/IV/V",
  "qualityOfEvidence": "high/moderate/low/very_low",
  "gradeRecommendation": "A/B/C/D",
  "recommendations": [
    "rekomendacja oparta na dowodach 1",
    "rekomendacja 2"
  ],
  "limitations": [
    "ograniczenie dowodów 1"
  ],
  "clinicalBottomLine": "praktyczne podsumowanie dla klinicysty",
  "suggestedReferences": [
    "sugerowane kluczowe publikacje do przeczytania"
  ]
}`;

  const response = await generateFromPrompt(prompt, {
    maxTokens: 2500,
    temperature: 0.5,
  });

  try {
    return JSON.parse(response);
  } catch {
    throw new Error("Nie udało się wygenerować podsumowania dowodów.");
  }
}

// ============================================
// LICENSE VERIFICATION (placeholder - needs real implementation)
// ============================================

export async function verifyMedicalLicense(
  licenseNumber: string,
  country: string,
  type: MedicalLicense["type"]
): Promise<{ verified: boolean; message: string }> {
  // PLACEHOLDER: In production, this would connect to medical boards
  // For now, return a pending verification status
  return {
    verified: false,
    message: "Weryfikacja licencji medycznej wymaga ręcznego potwierdzenia. Skontaktujemy się w ciągu 24-48h.",
  };
}

// ============================================
// ALDEHYDE RESEARCH SPECIFIC
// ============================================

export async function getAldehydeResearch(
  subtopic: "acetaldehyde" | "formaldehyde" | "metabolism" | "detoxification" | "exposure"
): Promise<ResearchSummary> {
  const queries: Record<string, string> = {
    acetaldehyde: "acetaldehyde metabolism ALDH2 health effects",
    formaldehyde: "formaldehyde indoor air exposure health",
    metabolism: "aldehyde dehydrogenase ALDH polymorphisms",
    detoxification: "aldehyde detoxification glutathione NAC",
    exposure: "aldehyde exposure sources prevention",
  };

  return searchMedicalLiterature({
    query: queries[subtopic],
    filters: {
      yearFrom: 2018,
      minCitations: 10,
    },
    maxResults: 15,
  });
}

// Create aldehyde toxicity report
export async function generateAldehydeToxicityReport(): Promise<{
  overview: string;
  sources: { source: string; aldehydeTypes: string[]; exposureLevel: string }[];
  healthEffects: { system: string; effects: string[]; mechanism: string }[];
  biomarkers: { marker: string; interpretation: string }[];
  clinicalManagement: string[];
  prevention: string[];
}> {
  const prompt = `Jako toksykolog, przygotuj kompleksowy raport o toksyczności aldehydów.

Odpowiedz TYLKO w formacie JSON:
{
  "overview": "Przegląd aldehydów jako związków toksycznych (formaldehyd, acetaldehyd, akroleina, itp.)",
  "sources": [
    {
      "source": "źródło ekspozycji",
      "aldehydeTypes": ["typ aldehydu"],
      "exposureLevel": "poziom ryzyka"
    }
  ],
  "healthEffects": [
    {
      "system": "układ/narząd",
      "effects": ["efekt zdrowotny"],
      "mechanism": "mechanizm działania"
    }
  ],
  "metabolismPathways": {
    "phase1": "oksydacja przez ADH/CYP2E1",
    "phase2": "detoksykacja przez ALDH",
    "phase3": "koniugacja z glutationem"
  },
  "geneticFactors": [
    {
      "gene": "ALDH2",
      "variant": "*2 allele",
      "effect": "reduced aldehyde metabolism",
      "prevalence": "30-50% East Asian population"
    }
  ],
  "biomarkers": [
    {
      "marker": "marker",
      "interpretation": "co oznacza"
    }
  ],
  "clinicalManagement": [
    "postępowanie kliniczne"
  ],
  "prevention": [
    "metoda prewencji"
  ],
  "references": [
    "kluczowe publikacje naukowe"
  ]
}`;

  const response = await generateFromPrompt(prompt, {
    maxTokens: 3500,
    temperature: 0.5,
  });

  try {
    return JSON.parse(response);
  } catch {
    throw new Error("Nie udało się wygenerować raportu o aldehydach.");
  }
}
