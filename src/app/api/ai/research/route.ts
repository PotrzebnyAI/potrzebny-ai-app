import { NextResponse } from "next/server";
import { searchPapers, getPaper, getRecommendations, searchAuthors } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, query, paperId, limit, year, fieldsOfStudy } = await request.json();

    switch (action) {
      case "search":
        if (!query) {
          return NextResponse.json({ error: "Query required" }, { status: 400 });
        }
        const searchResults = await searchPapers(query, {
          limit: limit || 10,
          year,
          fieldsOfStudy,
        });
        return NextResponse.json(searchResults);

      case "paper":
        if (!paperId) {
          return NextResponse.json({ error: "Paper ID required" }, { status: 400 });
        }
        const paper = await getPaper(paperId);
        return NextResponse.json(paper);

      case "recommendations":
        if (!paperId) {
          return NextResponse.json({ error: "Paper ID required" }, { status: 400 });
        }
        const recommendations = await getRecommendations(paperId, limit || 10);
        return NextResponse.json({ recommendations });

      case "authors":
        if (!query) {
          return NextResponse.json({ error: "Query required" }, { status: 400 });
        }
        const authors = await searchAuthors(query, limit || 10);
        return NextResponse.json({ authors });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Research error:", error);
    return NextResponse.json({ error: "Research failed" }, { status: 500 });
  }
}

// GET - szybkie wyszukiwanie
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") || "10");

  if (!query) {
    return NextResponse.json({ error: "Query parameter 'q' required" }, { status: 400 });
  }

  try {
    const results = await searchPapers(query, { limit });
    return NextResponse.json(results);
  } catch (error) {
    console.error("Research error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
