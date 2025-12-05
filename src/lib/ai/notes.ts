// Advanced Notes Generation using Groq AI
import { generateFromPrompt } from "./groq";

export interface Note {
  id: string;
  title: string;
  content: string;
  format: NoteFormat;
  sections: NoteSection[];
  keywords: string[];
  summary: string;
  createdAt: string;
}

export interface NoteSection {
  title: string;
  content: string;
  importance: "high" | "medium" | "low";
}

export type NoteFormat =
  | "cornell"      // Cornell method
  | "outline"      // Hierarchical outline
  | "mindmap"      // Mind map structure
  | "summary"      // Executive summary
  | "bullet"       // Bullet points
  | "feynman"      // Feynman technique (simple explanations)
  | "visual"       // Visual/diagram focused
  | "adhd"         // ADHD-friendly format
  | "dyslexia";    // Dyslexia-friendly format

// Generate notes in specified format
export async function generateNotes(
  content: string,
  format: NoteFormat = "outline",
  options: {
    language?: string;
    maxLength?: number;
    includeExamples?: boolean;
  } = {}
): Promise<Note> {
  const { language = "pl", maxLength = 2000, includeExamples = true } = options;

  const formatInstructions = getFormatInstructions(format);

  const prompt = `Wygeneruj notatki z poniższego tekstu w formacie: ${format}

${formatInstructions}

Język: ${language === "pl" ? "polski" : "angielski"}
${includeExamples ? "Dodaj przykłady gdzie to możliwe." : ""}
Maksymalna długość: ~${maxLength} słów

TEKST DO ANALIZY:
${content}

Odpowiedz TYLKO w formacie JSON (bez markdown):
{
  "title": "Tytuł notatki",
  "summary": "Krótkie podsumowanie (2-3 zdania)",
  "keywords": ["słowo1", "słowo2", "słowo3"],
  "sections": [
    {
      "title": "Tytuł sekcji",
      "content": "Treść sekcji w odpowiednim formacie",
      "importance": "high|medium|low"
    }
  ],
  "content": "Pełna treść notatki sformatowana zgodnie z wybranym stylem"
}`;

  const response = await generateFromPrompt(prompt, {
    maxTokens: 4000,
    temperature: 0.6,
  });

  try {
    const parsed = JSON.parse(response);
    return {
      id: `note_${Date.now()}`,
      ...parsed,
      format,
      createdAt: new Date().toISOString(),
    };
  } catch {
    throw new Error("Nie udało się wygenerować notatek.");
  }
}

function getFormatInstructions(format: NoteFormat): string {
  const instructions: Record<NoteFormat, string> = {
    cornell: `Format Cornell:
- KOLUMNA GŁÓWNA (prawa): Główne notatki i treść
- KOLUMNA WSKAZÓWEK (lewa): Pytania i słowa kluczowe
- PODSUMOWANIE (dół): Streszczenie całości
Używaj tego układu w sekcjach.`,

    outline: `Format Konspektowy:
I. Główny temat
   A. Podtemat
      1. Szczegół
      2. Szczegół
   B. Podtemat
II. Kolejny główny temat
Używaj hierarchicznej numeracji.`,

    mindmap: `Format Mapy Myśli:
- CENTRUM: Główna idea
- GAŁĘZIE GŁÓWNE: Kluczowe koncepcje (3-5)
- GAŁĘZIE PODRZĘDNE: Szczegóły i przykłady
Opisz strukturę jako drzewo z połączeniami.`,

    summary: `Format Streszczenia Wykonawczego:
- KLUCZOWE WNIOSKI: 3-5 najważniejszych punktów
- TŁO: Kontekst w 2-3 zdaniach
- SZCZEGÓŁY: Rozwinięcie kluczowych punktów
- DZIAŁANIA: Co można zrobić z tą wiedzą`,

    bullet: `Format Punktowy:
• Główny punkt
  - Podpunkt z detalem
  - Kolejny podpunkt
• Następny główny punkt
Używaj emoji dla kategorii: 📌 ważne, 💡 idea, ⚠️ uwaga`,

    feynman: `Technika Feynmana (proste wyjaśnienia):
1. POJĘCIE: Nazwa tematu
2. WYJAŚNIENIE: Opisz jakbyś tłumaczył 12-latkowi
3. LUKI: Wskaż co wymaga głębszego zrozumienia
4. UPROSZCZENIE: Użyj analogii i prostych słów`,

    visual: `Format Wizualny:
- Używaj ASCII art dla diagramów gdzie możliwe
- Opisuj relacje między elementami
- Sugeruj ikony/symbole dla pojęć
- Twórz tabele porównawcze`,

    adhd: `Format przyjazny ADHD:
- KRÓTKIE SEKCJE (max 3-4 zdania każda)
- WYRÓŻNIENIA: **pogrubienie** dla kluczowych słów
- LISTY zamiast długich paragrafów
- PODSUMOWANIE na początku każdej sekcji
- EMOJI dla kategorii i punktów
- ODSTĘPY między sekcjami`,

    dyslexia: `Format przyjazny Dysleksji:
- Proste, krótkie zdania
- Unikaj żargonu (jeśli musisz użyć - wyjaśnij)
- Używaj list numerowanych
- Dodawaj kontekst i przykłady
- Większe odstępy między sekcjami
- Powtarzaj kluczowe informacje`,
  };

  return instructions[format];
}

// Generate notes in multiple formats at once
export async function generateMultiFormatNotes(
  content: string,
  formats: NoteFormat[]
): Promise<Record<NoteFormat, Note>> {
  const results: Record<string, Note> = {};

  for (const format of formats) {
    results[format] = await generateNotes(content, format);
  }

  return results as Record<NoteFormat, Note>;
}

// Generate study guide from notes
export async function generateStudyGuide(
  content: string,
  examDate?: string
): Promise<{
  overview: string;
  keyTopics: string[];
  studyPlan: { day: number; topics: string[]; activities: string[] }[];
  practiceQuestions: string[];
  resources: string[];
}> {
  const daysUntilExam = examDate
    ? Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 7;

  const prompt = `Stwórz przewodnik do nauki na podstawie materiału.
Dni do egzaminu: ${daysUntilExam}

MATERIAŁ:
${content}

Odpowiedz TYLKO w formacie JSON:
{
  "overview": "Przegląd materiału (2-3 zdania)",
  "keyTopics": ["temat1", "temat2", "temat3"],
  "studyPlan": [
    {
      "day": 1,
      "topics": ["temat do nauki"],
      "activities": ["przeczytaj", "zrób notatki", "rozwiąż quiz"]
    }
  ],
  "practiceQuestions": ["pytanie1?", "pytanie2?"],
  "resources": ["sugerowane zasoby do nauki"]
}

Rozłóż materiał na ${Math.min(daysUntilExam, 7)} dni nauki.`;

  const response = await generateFromPrompt(prompt, {
    maxTokens: 3000,
    temperature: 0.7,
  });

  try {
    return JSON.parse(response);
  } catch {
    throw new Error("Nie udało się wygenerować przewodnika.");
  }
}

// Generate audio summary script for TTS
export async function generateAudioScript(
  content: string,
  duration: "short" | "medium" | "long" = "medium"
): Promise<string> {
  const wordCount = duration === "short" ? 150 : duration === "medium" ? 300 : 500;

  const prompt = `Napisz skrypt do odczytu audio (podcast edukacyjny) na ~${wordCount} słów.

MATERIAŁ ŹRÓDŁOWY:
${content}

Zasady:
- Pisz naturalnym, konwersacyjnym językiem
- Używaj krótkich zdań
- Dodaj pauzy [pauza] gdzie potrzebne
- Zacznij od przywitania i wprowadzenia tematu
- Zakończ podsumowaniem
- Nie używaj formatowania markdown

Napisz TYLKO skrypt (bez dodatkowych komentarzy):`;

  return generateFromPrompt(prompt, {
    maxTokens: 1500,
    temperature: 0.8,
  });
}
