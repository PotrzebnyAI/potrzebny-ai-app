// Scientific Research Database Module
// Integration with multiple free research APIs
import { generateFromPrompt } from "./groq";
import { searchPapers, getPaper, getRecommendations, type Paper } from "./semantic-scholar";

// ============================================
// TYPES
// ============================================

export interface ResearchPaper {
  id: string;
  source: ResearchSource;
  title: string;
  authors: string[];
  abstract: string;
  year: number;
  journal?: string;
  doi?: string;
  url: string;
  citationCount: number;
  openAccess: boolean;
  pdfUrl?: string;
  keywords: string[];
  topics: string[];
}

export type ResearchSource =
  | "semantic_scholar"
  | "pubmed"
  | "arxiv"
  | "core"
  | "crossref"
  | "openalex";

export interface ResearchCollection {
  id: string;
  name: string;
  description: string;
  papers: ResearchPaper[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  shared: boolean;
}

export interface LiteratureReview {
  id: string;
  title: string;
  topic: string;
  papers: ResearchPaper[];
  synthesis: {
    introduction: string;
    methodology: string;
    findings: {
      theme: string;
      summary: string;
      supportingPapers: string[];
    }[];
    gaps: string[];
    futureDirections: string[];
    conclusion: string;
  };
  bibliography: string[];
  createdAt: string;
}

export interface ResearchTrend {
  topic: string;
  period: string;
  paperCount: number;
  citationTrend: "increasing" | "stable" | "decreasing";
  keyAuthors: string[];
  emergingSubtopics: string[];
  hottestPapers: { title: string; citations: number; year: number }[];
}

export interface CitationNetwork {
  paperId: string;
  title: string;
  citations: { id: string; title: string; year: number }[];
  references: { id: string; title: string; year: number }[];
  relatedPapers: { id: string; title: string; similarity: number }[];
}

export interface ResearchAlert {
  id: string;
  userId: string;
  query: string;
  frequency: "daily" | "weekly" | "monthly";
  sources: ResearchSource[];
  lastChecked: string;
  newPapersCount: number;
}

// ============================================
// SEARCH FUNCTIONS
// ============================================

// Multi-source search
export async function searchResearch(
  query: string,
  options: {
    sources?: ResearchSource[];
    yearFrom?: number;
    yearTo?: number;
    limit?: number;
    openAccessOnly?: boolean;
    sortBy?: "relevance" | "citations" | "date";
  } = {}
): Promise<ResearchPaper[]> {
  const {
    sources = ["semantic_scholar"],
    yearFrom,
    yearTo,
    limit = 20,
    openAccessOnly = false,
    sortBy = "relevance",
  } = options;

  const results: ResearchPaper[] = [];

  // Search Semantic Scholar (primary free source)
  if (sources.includes("semantic_scholar")) {
    try {
      const papers = await searchPapers(query, {
        limit,
        fields: ["title", "abstract", "year", "citationCount", "authors", "venue", "url", "openAccessPdf"],
      });

      for (const paper of papers) {
        if (yearFrom && paper.year && paper.year < yearFrom) continue;
        if (yearTo && paper.year && paper.year > yearTo) continue;
        if (openAccessOnly && !paper.openAccessPdf) continue;

        results.push({
          id: paper.paperId,
          source: "semantic_scholar",
          title: paper.title,
          authors: paper.authors?.map((a: { name: string }) => a.name) || [],
          abstract: paper.abstract || "",
          year: paper.year || 0,
          journal: paper.venue || undefined,
          url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
          citationCount: paper.citationCount || 0,
          openAccess: !!paper.openAccessPdf,
          pdfUrl: paper.openAccessPdf?.url,
          keywords: [],
          topics: [],
        });
      }
    } catch (error) {
      console.error("Semantic Scholar search error:", error);
    }
  }

  // Sort results
  if (sortBy === "citations") {
    results.sort((a, b) => b.citationCount - a.citationCount);
  } else if (sortBy === "date") {
    results.sort((a, b) => b.year - a.year);
  }

  return results.slice(0, limit);
}

// Get paper details with full citation network
export async function getPaperDetails(
  paperId: string,
  source: ResearchSource = "semantic_scholar"
): Promise<ResearchPaper & { citations: Paper[]; references: Paper[] }> {
  if (source === "semantic_scholar") {
    const paper = await getPaper(paperId, {
      fields: [
        "title", "abstract", "year", "citationCount", "authors",
        "venue", "url", "openAccessPdf", "citations", "references"
      ],
    });

    return {
      id: paper.paperId,
      source: "semantic_scholar",
      title: paper.title,
      authors: paper.authors?.map((a: { name: string }) => a.name) || [],
      abstract: paper.abstract || "",
      year: paper.year || 0,
      journal: paper.venue || undefined,
      url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
      citationCount: paper.citationCount || 0,
      openAccess: !!paper.openAccessPdf,
      pdfUrl: paper.openAccessPdf?.url,
      keywords: [],
      topics: [],
      citations: paper.citations || [],
      references: paper.references || [],
    };
  }

  throw new Error(`Source ${source} not supported for paper details`);
}

// Get recommended papers based on a paper
export async function getRelatedPapers(
  paperId: string,
  limit?: number
): Promise<ResearchPaper[]> {
  const recommendations = await getRecommendations(paperId, { limit: limit || 10 });

  return recommendations.map(paper => ({
    id: paper.paperId,
    source: "semantic_scholar" as ResearchSource,
    title: paper.title,
    authors: paper.authors?.map((a: { name: string }) => a.name) || [],
    abstract: paper.abstract || "",
    year: paper.year || 0,
    journal: paper.venue || undefined,
    url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
    citationCount: paper.citationCount || 0,
    openAccess: false,
    keywords: [],
    topics: [],
  }));
}

// ============================================
// ANALYSIS FUNCTIONS
// ============================================

// Generate AI-powered literature review
export async function generateLiteratureReview(
  topic: string,
  papers: ResearchPaper[],
  options: {
    depth?: "overview" | "detailed" | "comprehensive";
    style?: "academic" | "accessible";
    focusAreas?: string[];
  } = {}
): Promise<LiteratureReview> {
  const { depth = "detailed", style = "academic", focusAreas = [] } = options;

  const paperSummaries = papers.slice(0, 15).map(p =>
    `[${p.year}] "${p.title}" by ${p.authors.slice(0, 3).join(", ")}${p.authors.length > 3 ? " et al." : ""}: ${p.abstract?.slice(0, 300)}...`
  ).join("\n\n");

  const prompt = `Jako ekspert badacz, przygotuj przegląd literatury na temat: "${topic}"

POZIOM SZCZEGÓŁOWOŚCI: ${depth}
STYL: ${style === "academic" ? "akademicki, z terminologią naukową" : "przystępny dla szerszego odbiorcy"}
${focusAreas.length > 0 ? `OBSZARY FOKUSOWE: ${focusAreas.join(", ")}` : ""}

PRZEANALIZOWANE PUBLIKACJE:
${paperSummaries}

Odpowiedz TYLKO w formacie JSON:
{
  "title": "Tytuł przeglądu literatury",
  "introduction": "Wprowadzenie do tematu i znaczenie badań (2-3 akapity)",
  "methodology": "Krótki opis metodologii przeglądu",
  "findings": [
    {
      "theme": "Temat/wątek badawczy",
      "summary": "Podsumowanie ustaleń w tym obszarze",
      "supportingPapers": ["tytuł publikacji 1", "tytuł publikacji 2"]
    }
  ],
  "gaps": [
    "Luka badawcza 1",
    "Luka badawcza 2"
  ],
  "futureDirections": [
    "Kierunek przyszłych badań 1"
  ],
  "conclusion": "Wnioski końcowe (1-2 akapity)",
  "keyInsights": [
    "Kluczowy wniosek 1",
    "Kluczowy wniosek 2"
  ]
}

Bądź szczegółowy i naukowy, ale także krytyczny wobec metodologii i ograniczeń badań.`;

  const response = await generateFromPrompt(prompt, {
    maxTokens: 5000,
    temperature: 0.6,
  });

  try {
    const synthesis = JSON.parse(response);
    return {
      id: `review_${Date.now()}`,
      title: synthesis.title,
      topic,
      papers,
      synthesis: {
        introduction: synthesis.introduction,
        methodology: synthesis.methodology,
        findings: synthesis.findings,
        gaps: synthesis.gaps,
        futureDirections: synthesis.futureDirections,
        conclusion: synthesis.conclusion,
      },
      bibliography: papers.map(p =>
        `${p.authors.join(", ")} (${p.year}). ${p.title}. ${p.journal || ""}`.trim()
      ),
      createdAt: new Date().toISOString(),
    };
  } catch {
    throw new Error("Nie udało się wygenerować przeglądu literatury.");
  }
}

// Analyze research trends
export async function analyzeResearchTrends(
  topic: string,
  papers: ResearchPaper[]
): Promise<ResearchTrend> {
  // Group by year
  const byYear: Record<number, ResearchPaper[]> = {};
  for (const paper of papers) {
    if (!byYear[paper.year]) byYear[paper.year] = [];
    byYear[paper.year].push(paper);
  }

  // Calculate citation trend
  const years = Object.keys(byYear).map(Number).sort();
  const recentYears = years.slice(-5);
  const recentCitations = recentYears.map(y =>
    byYear[y]?.reduce((sum, p) => sum + p.citationCount, 0) || 0
  );

  let citationTrend: "increasing" | "stable" | "decreasing" = "stable";
  if (recentCitations.length >= 3) {
    const firstHalf = recentCitations.slice(0, Math.floor(recentCitations.length / 2));
    const secondHalf = recentCitations.slice(Math.floor(recentCitations.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    if (secondAvg > firstAvg * 1.2) citationTrend = "increasing";
    else if (secondAvg < firstAvg * 0.8) citationTrend = "decreasing";
  }

  // Find key authors
  const authorCounts: Record<string, number> = {};
  for (const paper of papers) {
    for (const author of paper.authors) {
      authorCounts[author] = (authorCounts[author] || 0) + 1;
    }
  }
  const keyAuthors = Object.entries(authorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name]) => name);

  // Hottest papers
  const hottestPapers = papers
    .sort((a, b) => b.citationCount - a.citationCount)
    .slice(0, 5)
    .map(p => ({ title: p.title, citations: p.citationCount, year: p.year }));

  // Use AI to identify emerging subtopics
  const abstractsSample = papers.slice(0, 10).map(p => p.abstract).join("\n\n");

  const prompt = `Na podstawie abstraktów badań o "${topic}", zidentyfikuj wyłaniające się podtematy i trendy.

ABSTRAKTY (próbka):
${abstractsSample.slice(0, 3000)}

Odpowiedz TYLKO w formacie JSON:
{
  "emergingSubtopics": [
    "podtemat 1",
    "podtemat 2",
    "podtemat 3"
  ],
  "methodologicalTrends": [
    "trend metodologiczny"
  ],
  "applicationAreas": [
    "obszar zastosowań"
  ]
}`;

  let emergingSubtopics: string[] = [];
  try {
    const response = await generateFromPrompt(prompt, {
      maxTokens: 500,
      temperature: 0.5,
    });
    const parsed = JSON.parse(response);
    emergingSubtopics = parsed.emergingSubtopics || [];
  } catch {
    emergingSubtopics = [];
  }

  return {
    topic,
    period: years.length > 0 ? `${Math.min(...years)}-${Math.max(...years)}` : "N/A",
    paperCount: papers.length,
    citationTrend,
    keyAuthors,
    emergingSubtopics,
    hottestPapers,
  };
}

// Generate citation for paper
export function generateCitation(
  paper: ResearchPaper,
  style: "apa" | "mla" | "chicago" | "harvard" | "ieee" = "apa"
): string {
  const authors = paper.authors;
  const year = paper.year;
  const title = paper.title;
  const journal = paper.journal || "";

  switch (style) {
    case "apa":
      if (authors.length === 1) {
        return `${formatLastFirst(authors[0])} (${year}). ${title}. ${journal}.`;
      } else if (authors.length === 2) {
        return `${formatLastFirst(authors[0])}, & ${formatLastFirst(authors[1])} (${year}). ${title}. ${journal}.`;
      } else {
        return `${formatLastFirst(authors[0])}, et al. (${year}). ${title}. ${journal}.`;
      }

    case "mla":
      if (authors.length === 1) {
        return `${formatLastFirst(authors[0])}. "${title}." ${journal}, ${year}.`;
      } else if (authors.length === 2) {
        return `${formatLastFirst(authors[0])}, and ${authors[1]}. "${title}." ${journal}, ${year}.`;
      } else {
        return `${formatLastFirst(authors[0])}, et al. "${title}." ${journal}, ${year}.`;
      }

    case "chicago":
      return `${formatLastFirst(authors[0])}${authors.length > 1 ? " et al." : ""}. "${title}." ${journal} (${year}).`;

    case "harvard":
      return `${formatLastNames(authors)} ${year}, '${title}', ${journal}.`;

    case "ieee":
      return `${formatInitialsLast(authors)}, "${title}," ${journal}, ${year}.`;

    default:
      return `${authors.join(", ")} (${year}). ${title}. ${journal}.`;
  }
}

// Helper functions for citation formatting
function formatLastFirst(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0];
  const last = parts.pop();
  const initials = parts.map(p => p[0] + ".").join(" ");
  return `${last}, ${initials}`;
}

function formatLastNames(authors: string[]): string {
  if (authors.length === 1) return authors[0].split(" ").pop() || authors[0];
  if (authors.length === 2) {
    return `${authors[0].split(" ").pop()} & ${authors[1].split(" ").pop()}`;
  }
  return `${authors[0].split(" ").pop()} et al.`;
}

function formatInitialsLast(authors: string[]): string {
  return authors.slice(0, 3).map(name => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0];
    const last = parts.pop();
    const initials = parts.map(p => p[0] + ".").join(" ");
    return `${initials} ${last}`;
  }).join(", ") + (authors.length > 3 ? " et al." : "");
}

// ============================================
// COLLECTION MANAGEMENT
// ============================================

// Create research collection
export function createResearchCollection(
  name: string,
  description: string,
  papers: ResearchPaper[] = [],
  tags: string[] = []
): ResearchCollection {
  return {
    id: `col_${Date.now()}`,
    name,
    description,
    papers,
    tags,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    shared: false,
  };
}

// Export collection to BibTeX
export function exportToBibTeX(papers: ResearchPaper[]): string {
  return papers.map((paper, index) => {
    const key = `paper${index + 1}_${paper.year}`;
    const authors = paper.authors.join(" and ");

    return `@article{${key},
  author = {${authors}},
  title = {${paper.title}},
  journal = {${paper.journal || "Unknown"}},
  year = {${paper.year}},
  doi = {${paper.doi || ""}},
  url = {${paper.url}}
}`;
  }).join("\n\n");
}

// Export collection to RIS format
export function exportToRIS(papers: ResearchPaper[]): string {
  return papers.map(paper => {
    const lines = [
      "TY  - JOUR",
      ...paper.authors.map(a => `AU  - ${a}`),
      `TI  - ${paper.title}`,
      `JO  - ${paper.journal || ""}`,
      `PY  - ${paper.year}`,
      `DO  - ${paper.doi || ""}`,
      `UR  - ${paper.url}`,
      `AB  - ${paper.abstract.slice(0, 500)}`,
      "ER  - "
    ];
    return lines.join("\n");
  }).join("\n\n");
}

// ============================================
// SPECIALIZED SEARCHES
// ============================================

// Search for aldehyde-related research (special focus area)
export async function searchAldehydeResearch(
  subtopic: "toxicity" | "metabolism" | "detox" | "exposure" | "health_effects"
): Promise<ResearchPaper[]> {
  const queries: Record<string, string> = {
    toxicity: "aldehyde toxicity cellular damage oxidative stress",
    metabolism: "aldehyde dehydrogenase ALDH metabolism enzymes",
    detox: "aldehyde detoxification glutathione NAC acetylcysteine",
    exposure: "aldehyde exposure indoor air formaldehyde acetaldehyde",
    health_effects: "aldehyde health effects carcinogenic neurotoxic",
  };

  return searchResearch(queries[subtopic], {
    sources: ["semantic_scholar"],
    yearFrom: 2015,
    limit: 25,
    sortBy: "citations",
  });
}

// Search for supplement research
export async function searchSupplementResearch(
  supplement: string,
  focus: "efficacy" | "safety" | "mechanism" | "clinical_trials"
): Promise<ResearchPaper[]> {
  const queryModifiers: Record<string, string> = {
    efficacy: "efficacy effectiveness benefits clinical",
    safety: "safety adverse effects toxicity dosage",
    mechanism: "mechanism action pharmacology biochemistry",
    clinical_trials: "randomized controlled trial clinical study humans",
  };

  const query = `${supplement} ${queryModifiers[focus]}`;

  return searchResearch(query, {
    sources: ["semantic_scholar"],
    yearFrom: 2018,
    limit: 20,
    sortBy: "citations",
  });
}

// Generate research summary for non-experts
export async function generateAccessibleSummary(
  papers: ResearchPaper[],
  targetAudience: "general_public" | "students" | "professionals"
): Promise<{
  title: string;
  summary: string;
  keyTakeaways: string[];
  implications: string[];
  limitations: string[];
  furtherReading: string[];
}> {
  const audienceDescriptions = {
    general_public: "osób bez wykształcenia naukowego - używaj prostego języka",
    students: "studentów - wyjaśniaj terminy, ale bądź dokładny",
    professionals: "profesjonalistów z pokrewnej dziedziny",
  };

  const paperSummaries = papers.slice(0, 10).map(p =>
    `"${p.title}" (${p.year}): ${p.abstract?.slice(0, 200)}...`
  ).join("\n\n");

  const prompt = `Przygotuj przystępne podsumowanie badań dla ${audienceDescriptions[targetAudience]}.

BADANIA:
${paperSummaries}

Odpowiedz TYLKO w formacie JSON:
{
  "title": "Przystępny tytuł podsumowania",
  "summary": "Główne podsumowanie w 2-3 akapitach (proste słowa, bez żargonu)",
  "keyTakeaways": [
    "Najważniejszy wniosek 1",
    "Najważniejszy wniosek 2",
    "Najważniejszy wniosek 3"
  ],
  "implications": [
    "Co to oznacza w praktyce"
  ],
  "limitations": [
    "O czym pamiętać / jakie są ograniczenia badań"
  ],
  "furtherReading": [
    "Sugestia dalszej lektury"
  ],
  "mythBusting": [
    "Popularny mit obalony przez badania (jeśli dotyczy)"
  ]
}`;

  const response = await generateFromPrompt(prompt, {
    maxTokens: 2000,
    temperature: 0.6,
  });

  try {
    return JSON.parse(response);
  } catch {
    throw new Error("Nie udało się wygenerować podsumowania.");
  }
}
