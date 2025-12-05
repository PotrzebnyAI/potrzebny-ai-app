// Quiz Generation using Groq AI
import { generateFromPrompt } from "./groq";

export interface QuizQuestion {
  id: string;
  type: "multiple_choice" | "true_false" | "open_ended" | "matching";
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  tags: string[];
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  totalPoints: number;
  timeLimit?: number; // minutes
  passingScore: number;
  createdAt: string;
}

// Generate comprehensive quiz from content
export async function generateQuiz(
  content: string,
  options: {
    questionCount?: number;
    types?: QuizQuestion["type"][];
    difficulty?: "easy" | "medium" | "hard" | "mixed";
    timeLimit?: number;
    topic?: string;
  } = {}
): Promise<Quiz> {
  const {
    questionCount = 10,
    types = ["multiple_choice", "true_false", "open_ended"],
    difficulty = "mixed",
    timeLimit = 15,
    topic,
  } = options;

  const prompt = `Wygeneruj quiz edukacyjny na podstawie poniższego tekstu.
${topic ? `Temat: ${topic}` : ""}
Liczba pytań: ${questionCount}
Typy pytań: ${types.join(", ")}
Poziom trudności: ${difficulty}

TEKST DO ANALIZY:
${content}

Odpowiedz TYLKO w formacie JSON (bez markdown):
{
  "title": "Tytuł quizu",
  "description": "Krótki opis quizu",
  "questions": [
    {
      "type": "multiple_choice",
      "question": "Treść pytania?",
      "options": ["A) Opcja 1", "B) Opcja 2", "C) Opcja 3", "D) Opcja 4"],
      "correctAnswer": "A",
      "explanation": "Wyjaśnienie poprawnej odpowiedzi",
      "difficulty": "easy|medium|hard",
      "points": 1,
      "tags": ["tag1", "tag2"]
    },
    {
      "type": "true_false",
      "question": "Stwierdzenie do oceny prawda/fałsz",
      "correctAnswer": "true",
      "explanation": "Wyjaśnienie",
      "difficulty": "easy",
      "points": 1,
      "tags": []
    },
    {
      "type": "open_ended",
      "question": "Pytanie otwarte?",
      "correctAnswer": "Oczekiwana odpowiedź lub kluczowe punkty",
      "explanation": "Dodatkowe wyjaśnienie",
      "difficulty": "hard",
      "points": 3,
      "tags": []
    }
  ]
}

Zasady:
1. Pytania powinny sprawdzać zrozumienie, nie tylko pamięć
2. Opcje w multiple_choice powinny być wiarygodne
3. Wyjaśnienia powinny być edukacyjne
4. Punktacja: easy=1, medium=2, hard=3
5. Używaj mieszanki typów pytań`;

  const response = await generateFromPrompt(prompt, {
    maxTokens: 5000,
    temperature: 0.7,
  });

  try {
    const parsed = JSON.parse(response);
    const questions = parsed.questions.map((q: Omit<QuizQuestion, "id">, index: number) => ({
      ...q,
      id: `q_${Date.now()}_${index}`,
    }));

    const totalPoints = questions.reduce((sum: number, q: QuizQuestion) => sum + q.points, 0);

    return {
      id: `quiz_${Date.now()}`,
      title: parsed.title,
      description: parsed.description,
      questions,
      totalPoints,
      timeLimit,
      passingScore: Math.ceil(totalPoints * 0.6), // 60% to pass
      createdAt: new Date().toISOString(),
    };
  } catch {
    throw new Error("Nie udało się wygenerować quizu. Spróbuj ponownie.");
  }
}

// Generate adaptive quiz that adjusts difficulty
export async function generateAdaptiveQuiz(
  content: string,
  userPerformance: { correctAnswers: number; totalAnswers: number }
): Promise<Quiz> {
  const accuracy = userPerformance.totalAnswers > 0
    ? userPerformance.correctAnswers / userPerformance.totalAnswers
    : 0.5;

  let difficulty: "easy" | "medium" | "hard";
  if (accuracy < 0.4) difficulty = "easy";
  else if (accuracy > 0.8) difficulty = "hard";
  else difficulty = "medium";

  return generateQuiz(content, {
    difficulty,
    questionCount: 5,
    types: ["multiple_choice", "true_false"],
  });
}

// Generate exam-style quiz with sections
export async function generateExam(
  content: string,
  sections: { name: string; questionCount: number; type: QuizQuestion["type"] }[]
): Promise<Quiz & { sections: { name: string; questionIds: string[] }[] }> {
  const allQuestions: QuizQuestion[] = [];
  const examSections: { name: string; questionIds: string[] }[] = [];

  for (const section of sections) {
    const sectionQuiz = await generateQuiz(content, {
      questionCount: section.questionCount,
      types: [section.type],
      difficulty: "mixed",
      topic: section.name,
    });

    const questionIds = sectionQuiz.questions.map(q => q.id);
    allQuestions.push(...sectionQuiz.questions);
    examSections.push({ name: section.name, questionIds });
  }

  const totalPoints = allQuestions.reduce((sum, q) => sum + q.points, 0);

  return {
    id: `exam_${Date.now()}`,
    title: "Egzamin",
    description: "Egzamin kompleksowy",
    questions: allQuestions,
    totalPoints,
    timeLimit: 60,
    passingScore: Math.ceil(totalPoints * 0.5),
    createdAt: new Date().toISOString(),
    sections: examSections,
  };
}

// Check quiz answers and calculate score
export function gradeQuiz(
  quiz: Quiz,
  answers: Record<string, string | string[]>
): {
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  results: { questionId: string; correct: boolean; points: number }[];
} {
  const results: { questionId: string; correct: boolean; points: number }[] = [];
  let score = 0;

  for (const question of quiz.questions) {
    const userAnswer = answers[question.id];
    const correctAnswer = question.correctAnswer;

    let isCorrect = false;
    if (Array.isArray(correctAnswer) && Array.isArray(userAnswer)) {
      isCorrect = correctAnswer.every(a => userAnswer.includes(a)) &&
                  userAnswer.every(a => correctAnswer.includes(a));
    } else {
      isCorrect = String(userAnswer).toLowerCase().trim() ===
                  String(correctAnswer).toLowerCase().trim();
    }

    const points = isCorrect ? question.points : 0;
    score += points;
    results.push({ questionId: question.id, correct: isCorrect, points });
  }

  const percentage = (score / quiz.totalPoints) * 100;

  return {
    score,
    totalPoints: quiz.totalPoints,
    percentage,
    passed: score >= quiz.passingScore,
    results,
  };
}
