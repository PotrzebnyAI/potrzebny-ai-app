import { NextRequest, NextResponse } from "next/server";
import { generateFlashcards, generateSmartFlashcards, generateClozeFlashcards } from "@/lib/ai/flashcards";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const { allowed, remaining } = checkRateLimit(ip, "/api/ai/flashcards");

    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } }
      );
    }

    const body = await request.json();
    const { content, type = "standard", options = {} } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    let flashcards;
    switch (type) {
      case "smart":
        flashcards = await generateSmartFlashcards(content, options.userLevel);
        break;
      case "cloze":
        flashcards = await generateClozeFlashcards(content, options.count);
        break;
      default:
        flashcards = await generateFlashcards(content, options);
    }

    return NextResponse.json(flashcards);
  } catch (error) {
    console.error("Flashcard generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate flashcards" },
      { status: 500 }
    );
  }
}
