import { NextRequest, NextResponse } from "next/server";
import { generateNotes, generateMultiFormatNotes, generateStudyGuide, generateAudioScript, type NoteFormat } from "@/lib/ai/notes";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const { allowed, remaining } = checkRateLimit(ip, "/api/ai/notes");

    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } }
      );
    }

    const body = await request.json();
    const { action = "generate", content, format = "outline", formats, options = {}, examDate, duration } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    switch (action) {
      case "generate":
        const notes = await generateNotes(content, format as NoteFormat, options);
        return NextResponse.json(notes);

      case "multi":
        if (!formats || !Array.isArray(formats)) {
          return NextResponse.json(
            { error: "Formats array is required for multi action" },
            { status: 400 }
          );
        }
        const multiNotes = await generateMultiFormatNotes(content, formats as NoteFormat[]);
        return NextResponse.json(multiNotes);

      case "study-guide":
        const guide = await generateStudyGuide(content, examDate);
        return NextResponse.json(guide);

      case "audio-script":
        const script = await generateAudioScript(content, duration);
        return NextResponse.json({ script });

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Notes generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate notes" },
      { status: 500 }
    );
  }
}
