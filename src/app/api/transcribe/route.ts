import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { transcribeAudio, generateJSON } from "@/lib/ai";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { materialId } = await request.json();

    if (!materialId) {
      return NextResponse.json({ error: "Material ID required" }, { status: 400 });
    }

    // Update status to processing
    await supabaseAdmin
      .from("materials")
      .update({ status: "processing" })
      .eq("id", materialId);

    // Get material
    const { data: material } = await supabaseAdmin
      .from("materials")
      .select("*")
      .eq("id", materialId)
      .single();

    if (!material?.audio_url) {
      throw new Error("No audio URL found");
    }

    // Fetch audio file
    const audioResponse = await fetch(material.audio_url);
    const audioBlob = await audioResponse.blob();

    // Transkrypcja z Groq Whisper (DARMOWE)
    const transcriptionText = await transcribeAudio(audioBlob, "pl");

    // Save transcription
    await supabaseAdmin.from("transcriptions").insert({
      material_id: materialId,
      content: transcriptionText,
      language: "pl",
      word_count: transcriptionText.split(/\s+/).length,
    });

    // Generate notes, quiz, and flashcards using Groq Llama (DARMOWE)
    const [notes, quiz, flashcards] = await Promise.all([
      generateNotes(transcriptionText, "standard"),
      generateQuiz(transcriptionText),
      generateFlashcards(transcriptionText),
    ]);

    // Save generated content
    await Promise.all([
      supabaseAdmin.from("notes").insert({
        material_id: materialId,
        learning_mode: "standard",
        content: notes,
      }),
      supabaseAdmin.from("quizzes").insert({
        material_id: materialId,
        title: material.title + " - Quiz",
        questions: quiz,
      }),
      supabaseAdmin.from("flashcard_decks").insert({
        material_id: materialId,
        title: material.title + " - Fiszki",
        cards: flashcards,
      }),
    ]);

    // Update material status
    await supabaseAdmin
      .from("materials")
      .update({ status: "completed" })
      .eq("id", materialId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Transcription error:", error);

    // Update status to failed
    try {
      const body = await request.clone().json();
      if (body.materialId) {
        await supabaseAdmin
          .from("materials")
          .update({ status: "failed" })
          .eq("id", body.materialId);
      }
    } catch {}

    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}

async function generateNotes(transcription: string, mode: string) {
  const modePrompts: Record<string, string> = {
    standard: "Stwórz strukturyzowane notatki z podanej transkrypcji wykładu.",
    adhd: "Stwórz krótkie, zwięzłe notatki z podziałem na małe sekcje. Używaj bullet pointów i emoji dla lepszej koncentracji.",
    dyslexia: "Stwórz notatki używając prostego języka, krótkich zdań i dużych odstępów między sekcjami.",
    visual: "Stwórz notatki z diagramami ASCII, tabelami i wizualnymi reprezentacjami pojęć.",
    auditory: "Stwórz notatki w formie dialogu i opowieści, z mnemotechnikami.",
  };

  return generateJSON<{
    title: string;
    summary: string;
    sections: Array<{ title: string; content: string }>;
    keyPoints: string[];
  }>(
    `Jesteś ekspertem od tworzenia materiałów edukacyjnych. ${modePrompts[mode]} Zwróć JSON z polami: title, summary, sections (array z title i content), keyPoints (array).`,
    transcription
  );
}

async function generateQuiz(transcription: string) {
  const result = await generateJSON<{
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    }>;
  }>(
    "Stwórz quiz sprawdzający wiedzę z transkrypcji. Zwróć JSON z polem questions (array obiektów z: question, options (array 4 opcji), correctAnswer (index 0-3), explanation).",
    transcription
  );

  return result.questions;
}

async function generateFlashcards(transcription: string) {
  const result = await generateJSON<{
    cards: Array<{ front: string; back: string }>;
  }>(
    "Stwórz fiszki do nauki z transkrypcji. Zwróć JSON z polem cards (array obiektów z: front (pytanie/pojęcie), back (odpowiedź/definicja)).",
    transcription
  );

  return result.cards;
}
