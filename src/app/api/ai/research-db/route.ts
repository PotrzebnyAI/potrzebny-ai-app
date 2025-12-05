import { NextRequest, NextResponse } from "next/server";
import {
  searchResearch,
  getPaperDetails,
  getRelatedPapers,
  generateLiteratureReview,
  analyzeResearchTrends,
  generateCitation,
  exportToBibTeX,
  exportToRIS,
  searchAldehydeResearch,
  searchSupplementResearch,
  generateAccessibleSummary,
} from "@/lib/ai/research-database";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const { allowed, remaining } = checkRateLimit(ip, "/api/ai/research-db");

    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } }
      );
    }

    const body = await request.json();
    const { action, ...params } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    let result;
    switch (action) {
      case "search":
        if (!params.query) {
          return NextResponse.json(
            { error: "Query is required for search" },
            { status: 400 }
          );
        }
        result = await searchResearch(params.query, {
          sources: params.sources,
          yearFrom: params.yearFrom,
          yearTo: params.yearTo,
          limit: params.limit || 20,
          openAccessOnly: params.openAccessOnly,
          sortBy: params.sortBy,
        });
        break;

      case "paper_details":
        if (!params.paperId) {
          return NextResponse.json(
            { error: "Paper ID is required" },
            { status: 400 }
          );
        }
        result = await getPaperDetails(params.paperId, params.source);
        break;

      case "related_papers":
        if (!params.paperId) {
          return NextResponse.json(
            { error: "Paper ID is required" },
            { status: 400 }
          );
        }
        result = await getRelatedPapers(params.paperId, params.limit);
        break;

      case "literature_review":
        if (!params.topic || !params.papers || !Array.isArray(params.papers)) {
          return NextResponse.json(
            { error: "Topic and papers array are required" },
            { status: 400 }
          );
        }
        result = await generateLiteratureReview(params.topic, params.papers, {
          depth: params.depth,
          style: params.style,
          focusAreas: params.focusAreas,
        });
        break;

      case "research_trends":
        if (!params.topic || !params.papers) {
          return NextResponse.json(
            { error: "Topic and papers are required" },
            { status: 400 }
          );
        }
        result = await analyzeResearchTrends(params.topic, params.papers);
        break;

      case "generate_citation":
        if (!params.paper) {
          return NextResponse.json(
            { error: "Paper is required" },
            { status: 400 }
          );
        }
        result = {
          citation: generateCitation(params.paper, params.style || "apa"),
        };
        break;

      case "export_bibtex":
        if (!params.papers || !Array.isArray(params.papers)) {
          return NextResponse.json(
            { error: "Papers array is required" },
            { status: 400 }
          );
        }
        result = {
          bibtex: exportToBibTeX(params.papers),
          format: "bibtex",
        };
        break;

      case "export_ris":
        if (!params.papers || !Array.isArray(params.papers)) {
          return NextResponse.json(
            { error: "Papers array is required" },
            { status: 400 }
          );
        }
        result = {
          ris: exportToRIS(params.papers),
          format: "ris",
        };
        break;

      case "aldehyde_research":
        result = await searchAldehydeResearch(params.subtopic || "toxicity");
        break;

      case "supplement_research":
        if (!params.supplement) {
          return NextResponse.json(
            { error: "Supplement name is required" },
            { status: 400 }
          );
        }
        result = await searchSupplementResearch(
          params.supplement,
          params.focus || "efficacy"
        );
        break;

      case "accessible_summary":
        if (!params.papers || !Array.isArray(params.papers)) {
          return NextResponse.json(
            { error: "Papers array is required" },
            { status: 400 }
          );
        }
        result = await generateAccessibleSummary(
          params.papers,
          params.targetAudience || "general_public"
        );
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Research DB API error:", error);
    return NextResponse.json(
      { error: "Failed to process research request" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    description: "Scientific Research Database API",
    version: "1.0",
    sources: ["semantic_scholar"],
    endpoints: {
      search: "Search across research databases",
      paper_details: "Get full paper details with citations/references",
      related_papers: "Get recommended related papers",
      literature_review: "Generate AI-powered literature review",
      research_trends: "Analyze research trends in a topic",
      generate_citation: "Generate citation in various formats (APA, MLA, Chicago, Harvard, IEEE)",
      export_bibtex: "Export papers to BibTeX format",
      export_ris: "Export papers to RIS format",
      aldehyde_research: "Specialized search for aldehyde research",
      supplement_research: "Search for supplement efficacy/safety research",
      accessible_summary: "Generate accessible summary for non-experts",
    },
    examples: {
      search: {
        action: "search",
        query: "machine learning education",
        yearFrom: 2020,
        limit: 10,
        sortBy: "citations",
      },
      aldehyde_research: {
        action: "aldehyde_research",
        subtopic: "detox",
      },
      supplement_research: {
        action: "supplement_research",
        supplement: "NAC n-acetylcysteine",
        focus: "efficacy",
      },
    },
  });
}
