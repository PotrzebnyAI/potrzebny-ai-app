// Semantic Scholar API - Badania naukowe
// Darmowy, unlimited access

const SEMANTIC_SCHOLAR_API = "https://api.semanticscholar.org/graph/v1";

interface Paper {
  paperId: string;
  title: string;
  abstract?: string;
  year?: number;
  citationCount?: number;
  authors?: Array<{ name: string }>;
  url?: string;
  venue?: string;
  openAccessPdf?: { url: string };
}

interface SearchResponse {
  total: number;
  data: Paper[];
}

// Wyszukiwanie publikacji naukowych
export async function searchPapers(
  query: string,
  options?: {
    limit?: number;
    offset?: number;
    year?: string;
    fieldsOfStudy?: string[];
  }
): Promise<SearchResponse> {
  const params = new URLSearchParams({
    query,
    limit: String(options?.limit || 10),
    offset: String(options?.offset || 0),
    fields: "paperId,title,abstract,year,citationCount,authors,url,venue,openAccessPdf",
  });

  if (options?.year) {
    params.append("year", options.year);
  }

  if (options?.fieldsOfStudy?.length) {
    params.append("fieldsOfStudy", options.fieldsOfStudy.join(","));
  }

  const response = await fetch(
    `${SEMANTIC_SCHOLAR_API}/paper/search?${params}`,
    {
      headers: {
        "x-api-key": process.env.SEMANTIC_SCHOLAR_API_KEY || "",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Semantic Scholar error: ${response.statusText}`);
  }

  return response.json();
}

// Pobierz szczegóły publikacji
export async function getPaper(paperId: string): Promise<Paper> {
  const response = await fetch(
    `${SEMANTIC_SCHOLAR_API}/paper/${paperId}?fields=paperId,title,abstract,year,citationCount,authors,url,venue,openAccessPdf,references,citations`,
    {
      headers: {
        "x-api-key": process.env.SEMANTIC_SCHOLAR_API_KEY || "",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Semantic Scholar error: ${response.statusText}`);
  }

  return response.json();
}

// Pobierz rekomendacje na podstawie publikacji
export async function getRecommendations(
  paperId: string,
  limit: number = 10
): Promise<Paper[]> {
  const response = await fetch(
    `${SEMANTIC_SCHOLAR_API}/recommendations/v1/papers/forpaper/${paperId}?limit=${limit}&fields=paperId,title,abstract,year,citationCount,authors,url`,
    {
      headers: {
        "x-api-key": process.env.SEMANTIC_SCHOLAR_API_KEY || "",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Semantic Scholar error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.recommendedPapers || [];
}

// Wyszukaj autorów
export async function searchAuthors(
  query: string,
  limit: number = 10
): Promise<Array<{ authorId: string; name: string; paperCount: number }>> {
  const response = await fetch(
    `${SEMANTIC_SCHOLAR_API}/author/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=authorId,name,paperCount`,
    {
      headers: {
        "x-api-key": process.env.SEMANTIC_SCHOLAR_API_KEY || "",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Semantic Scholar error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data || [];
}
