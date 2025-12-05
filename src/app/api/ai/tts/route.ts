import { NextResponse } from "next/server";
import { textToSpeech, POLISH_VOICES } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text, voice } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text required" }, { status: 400 });
    }

    // Limit tekstu dla darmowego tier (10k znaków/mies)
    if (text.length > 5000) {
      return NextResponse.json(
        { error: "Text too long. Maximum 5000 characters." },
        { status: 400 }
      );
    }

    const voiceId = voice || POLISH_VOICES.adam;
    const audioBuffer = await textToSpeech(text, { voiceId });

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'attachment; filename="speech.mp3"',
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json({ error: "TTS failed" }, { status: 500 });
  }
}

// Pobierz dostępne głosy
export async function GET() {
  return NextResponse.json({
    voices: [
      { id: POLISH_VOICES.adam, name: "Adam", gender: "male" },
      { id: POLISH_VOICES.antoni, name: "Antoni", gender: "male" },
      { id: POLISH_VOICES.bella, name: "Bella", gender: "female" },
      { id: POLISH_VOICES.rachel, name: "Rachel", gender: "female" },
    ],
  });
}
