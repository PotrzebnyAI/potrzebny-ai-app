// Flashcard Generation using Groq AI
import { generateFromPrompt } from "./groq";

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
}

export interface FlashcardSet {
  title: string;
  description: string;
  cards: Flashcard[];
  totalCards: number;
  createdAt: string;
}

// Generate flashcards from content
export async function generateFlashcards(
  content: string,
  options: {
    count?: number;
    difficulty?: "easy" | "medium" | "hard" | "mixed";
    language?: string;
    topic?: string;
  } = {}
): Promise<FlashcardSet> {
  const { count = 10, difficulty = "mixed", language = "pl", topic } = options;

  const prompt = `Wygeneruj ${count} fiszek edukacyjnych na podstawie poniższego tekstu.
${topic ? `Temat: ${topic}` : ""}
Poziom trudności: ${difficulty === "mixed" ? "mieszany (łatwe, średnie i trudne)" : difficulty}
Język: ${language === "pl" ? "polski" : "angielski"}

TEKST DO ANALIZY:
${content}

Odpowiedz TYLKO w formacie JSON (bez markdown):
{
  "title": "Tytuł zestawu fiszek",
  "description": "Krótki opis zestawu",
  "cards": [
    {
      "front": "Pytanie lub pojęcie",
      "back": "Odpowiedź lub definicja",
      "difficulty": "easy|medium|hard",
      "tags": ["tag1", "tag2"]
    }
  ]
}

Zasady tworzenia fiszek:
1. Pytania powinny być konkretne i jednoznaczne
2. Odpowiedzi powinny być zwięzłe, ale kompletne
3. Używaj różnych typów pytań (definicje, porównania, przykłady)
4. Dodawaj tagi ułatwiające kategoryzację
5. Dla trudnych pojęć dodaj kontekst lub mnemoniki`;

  const response = await generateFromPrompt(prompt, {
    maxTokens: 4000,
    temperature: 0.7,
  });

  try {
    const parsed = JSON.parse(response);
    return {
      ...parsed,
      totalCards: parsed.cards.length,
      createdAt: new Date().toISOString(),
      cards: parsed.cards.map((card: Omit<Flashcard, "id">, index: number) => ({
        ...card,
        id: `fc_${Date.now()}_${index}`,
      })),
    };
  } catch {
    throw new Error("Nie udało się wygenerować fiszek. Spróbuj ponownie.");
  }
}

// Generate flashcards with spaced repetition scheduling
export async function generateSmartFlashcards(
  content: string,
  userLevel: "beginner" | "intermediate" | "advanced" = "intermediate"
): Promise<FlashcardSet & { schedule: Record<string, Date> }> {
  const flashcards = await generateFlashcards(content, {
    count: 15,
    difficulty: userLevel === "beginner" ? "easy" : userLevel === "advanced" ? "hard" : "mixed",
  });

  // Create spaced repetition schedule
  const schedule: Record<string, Date> = {};
  const now = new Date();

  flashcards.cards.forEach((card, index) => {
    const daysOffset = card.difficulty === "easy" ? 3 : card.difficulty === "medium" ? 1 : 0;
    const reviewDate = new Date(now);
    reviewDate.setDate(reviewDate.getDate() + daysOffset + Math.floor(index / 5));
    schedule[card.id] = reviewDate;
  });

  return {
    ...flashcards,
    schedule,
  };
}

// Generate cloze deletion flashcards (fill in the blank)
export async function generateClozeFlashcards(
  content: string,
  count: number = 10
): Promise<FlashcardSet> {
  const prompt = `Wygeneruj ${count} fiszek typu "uzupełnij lukę" (cloze deletion) na podstawie tekstu.

TEKST:
${content}

Odpowiedz TYLKO w formacie JSON:
{
  "title": "Tytuł zestawu",
  "description": "Opis",
  "cards": [
    {
      "front": "Zdanie z _____ do uzupełnienia",
      "back": "brakujące słowo lub fraza",
      "difficulty": "easy|medium|hard",
      "tags": ["cloze", "inne_tagi"]
    }
  ]
}

Zasady:
1. Ukrywaj kluczowe terminy, daty, nazwiska lub pojęcia
2. Zdanie powinno dawać wystarczający kontekst
3. Nie ukrywaj więcej niż jednego elementu na fiszkę`;

  const response = await generateFromPrompt(prompt, {
    maxTokens: 3000,
    temperature: 0.6,
  });

  try {
    const parsed = JSON.parse(response);
    return {
      ...parsed,
      totalCards: parsed.cards.length,
      createdAt: new Date().toISOString(),
      cards: parsed.cards.map((card: Omit<Flashcard, "id">, index: number) => ({
        ...card,
        id: `cloze_${Date.now()}_${index}`,
      })),
    };
  } catch {
    throw new Error("Nie udało się wygenerować fiszek cloze.");
  }
}
