// Teacher Classroom & Channels Management
import { generateFromPrompt } from "./groq";

export interface Classroom {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  code: string; // join code
  students: string[]; // user IDs
  channels: Channel[];
  settings: ClassroomSettings;
  createdAt: string;
}

export interface Channel {
  id: string;
  name: string;
  type: "announcements" | "materials" | "assignments" | "discussion" | "resources";
  description: string;
  posts: ChannelPost[];
  allowStudentPosts: boolean;
}

export interface ChannelPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: "teacher" | "student";
  content: string;
  attachments: Attachment[];
  comments: Comment[];
  createdAt: string;
  pinned: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: "file" | "link" | "quiz" | "flashcards" | "video" | "presentation";
  url: string;
  metadata?: Record<string, unknown>;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface ClassroomSettings {
  allowStudentDiscussion: boolean;
  requireApproval: boolean;
  notificationsEnabled: boolean;
  gradingEnabled: boolean;
  leaderboardEnabled: boolean;
}

export interface Assignment {
  id: string;
  classroomId: string;
  channelId: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
  type: "quiz" | "essay" | "project" | "flashcards" | "presentation";
  attachments: Attachment[];
  submissions: Submission[];
  createdAt: string;
}

export interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  content: string;
  attachments: Attachment[];
  grade?: number;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
}

export interface StudentProgress {
  studentId: string;
  studentName: string;
  classroomId: string;
  stats: {
    assignmentsCompleted: number;
    assignmentsTotal: number;
    averageGrade: number;
    quizzesTaken: number;
    flashcardsStudied: number;
    timeSpentMinutes: number;
    streak: number;
  };
  recentActivity: {
    type: string;
    description: string;
    timestamp: string;
  }[];
  strengths: string[];
  areasToImprove: string[];
}

// Generate unique classroom join code
export function generateClassroomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create default channels for a classroom
export function createDefaultChannels(): Channel[] {
  return [
    {
      id: `ch_${Date.now()}_1`,
      name: "Ogłoszenia",
      type: "announcements",
      description: "Ważne ogłoszenia od nauczyciela",
      posts: [],
      allowStudentPosts: false,
    },
    {
      id: `ch_${Date.now()}_2`,
      name: "Materiały",
      type: "materials",
      description: "Materiały do nauki, notatki, prezentacje",
      posts: [],
      allowStudentPosts: false,
    },
    {
      id: `ch_${Date.now()}_3`,
      name: "Zadania",
      type: "assignments",
      description: "Zadania domowe i projekty",
      posts: [],
      allowStudentPosts: false,
    },
    {
      id: `ch_${Date.now()}_4`,
      name: "Dyskusja",
      type: "discussion",
      description: "Pytania i dyskusje na temat materiału",
      posts: [],
      allowStudentPosts: true,
    },
    {
      id: `ch_${Date.now()}_5`,
      name: "Zasoby",
      type: "resources",
      description: "Dodatkowe materiały i linki",
      posts: [],
      allowStudentPosts: true,
    },
  ];
}

// Generate AI feedback for student submission
export async function generateSubmissionFeedback(
  assignment: { title: string; description: string; points: number },
  submission: { content: string },
  rubric?: string
): Promise<{ grade: number; feedback: string; suggestions: string[] }> {
  const prompt = `Oceń pracę ucznia i daj konstruktywny feedback.

ZADANIE:
Tytuł: ${assignment.title}
Opis: ${assignment.description}
Maksymalna liczba punktów: ${assignment.points}
${rubric ? `Kryteria oceny: ${rubric}` : ""}

PRACA UCZNIA:
${submission.content}

Odpowiedz TYLKO w formacie JSON:
{
  "grade": [liczba punktów 0-${assignment.points}],
  "feedback": "Szczegółowy feedback dla ucznia (2-3 zdania)",
  "suggestions": ["sugestia poprawy 1", "sugestia 2", "sugestia 3"]
}

Bądź sprawiedliwy, konstruktywny i zachęcający.`;

  const response = await generateFromPrompt(prompt, {
    maxTokens: 1000,
    temperature: 0.6,
  });

  try {
    return JSON.parse(response);
  } catch {
    return {
      grade: Math.floor(assignment.points * 0.7),
      feedback: "Praca wymaga przeglądu przez nauczyciela.",
      suggestions: ["Skonsultuj się z nauczycielem w sprawie szczegółów oceny."],
    };
  }
}

// Generate progress report for student
export async function generateProgressReport(
  progress: StudentProgress
): Promise<string> {
  const prompt = `Wygeneruj krótki raport postępów dla ucznia.

DANE:
- Zadania ukończone: ${progress.stats.assignmentsCompleted}/${progress.stats.assignmentsTotal}
- Średnia ocen: ${progress.stats.averageGrade.toFixed(1)}%
- Quizy rozwiązane: ${progress.stats.quizzesTaken}
- Fiszki przestudiowane: ${progress.stats.flashcardsStudied}
- Czas nauki: ${progress.stats.timeSpentMinutes} minut
- Seria dni nauki: ${progress.stats.streak}
- Mocne strony: ${progress.strengths.join(", ")}
- Do poprawy: ${progress.areasToImprove.join(", ")}

Napisz krótki, pozytywny i motywujący raport (3-4 zdania) podsumowujący postępy ucznia.
Wspomnij o osiągnięciach i delikatnie zasugeruj obszary do pracy.`;

  return generateFromPrompt(prompt, {
    maxTokens: 500,
    temperature: 0.7,
  });
}

// Generate class summary for teacher
export async function generateClassSummary(
  studentProgressList: StudentProgress[]
): Promise<{
  overview: string;
  topPerformers: string[];
  needsAttention: string[];
  classAverage: number;
  recommendations: string[];
}> {
  const classAverage = studentProgressList.length > 0
    ? studentProgressList.reduce((sum, p) => sum + p.stats.averageGrade, 0) / studentProgressList.length
    : 0;

  const sorted = [...studentProgressList].sort(
    (a, b) => b.stats.averageGrade - a.stats.averageGrade
  );

  const topPerformers = sorted.slice(0, 3).map(p => p.studentName);
  const needsAttention = sorted
    .filter(p => p.stats.averageGrade < 60 || p.stats.assignmentsCompleted < p.stats.assignmentsTotal * 0.5)
    .map(p => p.studentName);

  const prompt = `Jako asystent nauczyciela, przygotuj krótkie podsumowanie klasy.

STATYSTYKI KLASY:
- Liczba uczniów: ${studentProgressList.length}
- Średnia ocen: ${classAverage.toFixed(1)}%
- Najlepsi: ${topPerformers.join(", ")}
- Wymagają uwagi: ${needsAttention.length > 0 ? needsAttention.join(", ") : "brak"}

Podaj 3-4 konkretne rekomendacje dla nauczyciela w formacie JSON:
{
  "overview": "Krótkie podsumowanie stanu klasy (2 zdania)",
  "recommendations": ["rekomendacja1", "rekomendacja2", "rekomendacja3"]
}`;

  const response = await generateFromPrompt(prompt, {
    maxTokens: 500,
    temperature: 0.6,
  });

  try {
    const parsed = JSON.parse(response);
    return {
      ...parsed,
      topPerformers,
      needsAttention,
      classAverage,
    };
  } catch {
    return {
      overview: `Klasa liczy ${studentProgressList.length} uczniów ze średnią ${classAverage.toFixed(1)}%.`,
      topPerformers,
      needsAttention,
      classAverage,
      recommendations: [
        "Regularnie sprawdzaj postępy uczniów",
        "Organizuj sesje Q&A dla uczniów z trudnościami",
        "Wykorzystuj quizy do sprawdzenia zrozumienia materiału",
      ],
    };
  }
}

// Generate lesson plan from topic
export async function generateLessonPlan(
  topic: string,
  duration: number = 45,
  level: "elementary" | "middle" | "high" | "university" = "high"
): Promise<{
  title: string;
  objectives: string[];
  materials: string[];
  activities: { duration: number; activity: string; description: string }[];
  assessment: string;
  homework?: string;
}> {
  const prompt = `Stwórz plan lekcji.

Temat: ${topic}
Czas trwania: ${duration} minut
Poziom: ${level === "elementary" ? "szkoła podstawowa" : level === "middle" ? "gimnazjum" : level === "high" ? "liceum" : "uniwersytet"}

Odpowiedz TYLKO w formacie JSON:
{
  "title": "Tytuł lekcji",
  "objectives": ["cel 1", "cel 2", "cel 3"],
  "materials": ["materiał 1", "materiał 2"],
  "activities": [
    {"duration": 5, "activity": "Wprowadzenie", "description": "opis"},
    {"duration": 15, "activity": "Główna część", "description": "opis"},
    {"duration": 10, "activity": "Ćwiczenia", "description": "opis"},
    {"duration": 5, "activity": "Podsumowanie", "description": "opis"}
  ],
  "assessment": "Jak sprawdzić zrozumienie materiału",
  "homework": "Opcjonalne zadanie domowe"
}

Suma czasów aktywności powinna wynosić ${duration} minut.`;

  const response = await generateFromPrompt(prompt, {
    maxTokens: 1500,
    temperature: 0.7,
  });

  try {
    return JSON.parse(response);
  } catch {
    throw new Error("Nie udało się wygenerować planu lekcji.");
  }
}
