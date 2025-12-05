// Teacher Panel Pro - Mass School Deployment Features
// Enhanced features for schools, districts, and educational institutions
import { generateFromPrompt } from "./groq";
import type { Classroom, StudentProgress, Assignment } from "./classroom";

// ============================================
// TYPES FOR MASS DEPLOYMENT
// ============================================

export interface School {
  id: string;
  name: string;
  type: "elementary" | "middle" | "high" | "university" | "vocational";
  address: string;
  adminIds: string[];
  teacherIds: string[];
  studentCount: number;
  classrooms: string[]; // classroom IDs
  settings: SchoolSettings;
  subscription: SchoolSubscription;
  createdAt: string;
}

export interface SchoolSettings {
  allowAIGrading: boolean;
  allowAIContent: boolean;
  dataRetentionDays: number;
  parentPortalEnabled: boolean;
  analyticsEnabled: boolean;
  integrations: {
    googleClassroom: boolean;
    microsoftTeams: boolean;
    canvas: boolean;
    moodle: boolean;
  };
  customBranding?: {
    logo: string;
    primaryColor: string;
    schoolName: string;
  };
}

export interface SchoolSubscription {
  plan: "free" | "school_basic" | "school_pro" | "district";
  maxTeachers: number;
  maxStudents: number;
  maxStorageGB: number;
  features: string[];
  expiresAt: string;
}

export interface District {
  id: string;
  name: string;
  schools: string[];
  adminIds: string[];
  settings: DistrictSettings;
  analytics: DistrictAnalytics;
}

export interface DistrictSettings {
  sharedResources: boolean;
  centralizedReporting: boolean;
  uniformCurriculum: boolean;
  dataSharing: "none" | "anonymized" | "full";
}

export interface DistrictAnalytics {
  totalStudents: number;
  totalTeachers: number;
  averagePerformance: number;
  activeClassrooms: number;
  contentCreated: number;
  quizzesCompleted: number;
}

export interface CurriculumStandard {
  id: string;
  code: string; // e.g., "CCSS.MATH.CONTENT.8.EE.A.1"
  subject: string;
  grade: string;
  description: string;
  skills: string[];
}

export interface BulkStudentImport {
  students: {
    firstName: string;
    lastName: string;
    email?: string;
    studentId?: string;
    grade?: string;
    class?: string;
  }[];
  classroomId: string;
  sendInvitations: boolean;
}

export interface TeacherAnalytics {
  teacherId: string;
  period: "week" | "month" | "semester" | "year";
  metrics: {
    classroomsActive: number;
    studentsEngaged: number;
    contentCreated: {
      lessons: number;
      quizzes: number;
      flashcards: number;
      presentations: number;
    };
    averageStudentGrade: number;
    feedbackGiven: number;
    timeSpentHours: number;
  };
  trends: {
    studentEngagement: "increasing" | "stable" | "decreasing";
    gradeImprovement: number; // percentage change
    contentUsage: "high" | "medium" | "low";
  };
}

export interface ParentReport {
  studentId: string;
  studentName: string;
  period: string;
  academicPerformance: {
    overallGrade: number;
    subjects: { subject: string; grade: number; trend: string }[];
  };
  attendance: {
    present: number;
    total: number;
    percentage: number;
  };
  strengths: string[];
  areasForImprovement: string[];
  teacherComments: string;
  recommendations: string[];
}

export interface AutomatedCurriculum {
  subject: string;
  grade: string;
  duration: string; // e.g., "semester", "year"
  units: CurriculumUnit[];
  assessments: AssessmentPlan[];
  pacing: PacingGuide[];
}

export interface CurriculumUnit {
  id: string;
  title: string;
  duration: string;
  objectives: string[];
  standards: string[];
  lessons: {
    title: string;
    duration: number;
    activities: string[];
    materials: string[];
  }[];
  assessment: string;
}

export interface AssessmentPlan {
  type: "formative" | "summative" | "diagnostic";
  frequency: string;
  description: string;
  weight: number;
}

export interface PacingGuide {
  week: number;
  unit: string;
  topics: string[];
  milestones: string[];
}

// ============================================
// MASS DEPLOYMENT FUNCTIONS
// ============================================

// Generate bulk student accounts from CSV data
export function processBulkStudentImport(
  csvData: string,
  classroomId: string
): BulkStudentImport {
  const lines = csvData.trim().split("\n");
  const headers = lines[0].toLowerCase().split(",").map(h => h.trim());

  const students = lines.slice(1).map(line => {
    const values = line.split(",").map(v => v.trim());
    const student: BulkStudentImport["students"][0] = {
      firstName: "",
      lastName: "",
    };

    headers.forEach((header, index) => {
      const value = values[index] || "";
      if (header.includes("first") || header === "imię") student.firstName = value;
      else if (header.includes("last") || header === "nazwisko") student.lastName = value;
      else if (header.includes("email")) student.email = value;
      else if (header.includes("id") || header === "numer") student.studentId = value;
      else if (header.includes("grade") || header === "klasa") student.grade = value;
      else if (header.includes("class") || header === "oddział") student.class = value;
    });

    return student;
  }).filter(s => s.firstName && s.lastName);

  return {
    students,
    classroomId,
    sendInvitations: true,
  };
}

// Generate school-wide analytics report
export async function generateSchoolAnalytics(
  schoolData: {
    name: string;
    classrooms: { name: string; studentCount: number; averageGrade: number }[];
    teachers: { name: string; classroomCount: number; studentCount: number }[];
    totalQuizzes: number;
    totalAssignments: number;
    period: string;
  }
): Promise<{
  summary: string;
  keyMetrics: { metric: string; value: string; trend: string }[];
  topPerformingClasses: string[];
  areasOfConcern: string[];
  recommendations: string[];
  comparisonToAverage: string;
}> {
  const avgGrade = schoolData.classrooms.length > 0
    ? schoolData.classrooms.reduce((sum, c) => sum + c.averageGrade, 0) / schoolData.classrooms.length
    : 0;

  const prompt = `Jako analityk edukacyjny, przygotuj raport dla szkoły.

SZKOŁA: ${schoolData.name}
OKRES: ${schoolData.period}
KLASY: ${schoolData.classrooms.length}
NAUCZYCIELE: ${schoolData.teachers.length}
ŚREDNIA OCEN: ${avgGrade.toFixed(1)}%
QUIZY UKOŃCZONE: ${schoolData.totalQuizzes}
ZADANIA: ${schoolData.totalAssignments}

SZCZEGÓŁY KLAS:
${schoolData.classrooms.map(c => `- ${c.name}: ${c.studentCount} uczniów, średnia ${c.averageGrade}%`).join("\n")}

Odpowiedz TYLKO w formacie JSON:
{
  "summary": "Podsumowanie stanu szkoły (2-3 zdania)",
  "keyMetrics": [
    {"metric": "nazwa metryki", "value": "wartość", "trend": "up/down/stable"}
  ],
  "topPerformingClasses": ["klasa1", "klasa2"],
  "areasOfConcern": ["obszar wymagający uwagi"],
  "recommendations": ["rekomendacja dla administracji"],
  "comparisonToAverage": "porównanie do średnich krajowych/regionalnych"
}`;

  const response = await generateFromPrompt(prompt, {
    maxTokens: 2000,
    temperature: 0.6,
  });

  try {
    return JSON.parse(response);
  } catch {
    throw new Error("Nie udało się wygenerować analiz szkolnych.");
  }
}

// Generate automated curriculum
export async function generateAutomatedCurriculum(
  subject: string,
  grade: string,
  duration: "semester" | "year",
  standards?: string[]
): Promise<AutomatedCurriculum> {
  const weeks = duration === "semester" ? 18 : 36;

  const prompt = `Stwórz kompletny program nauczania.

PRZEDMIOT: ${subject}
KLASA: ${grade}
CZAS TRWANIA: ${duration === "semester" ? "semestr (18 tygodni)" : "rok szkolny (36 tygodni)"}
${standards?.length ? `STANDARDY: ${standards.join(", ")}` : ""}

Odpowiedz TYLKO w formacie JSON:
{
  "subject": "${subject}",
  "grade": "${grade}",
  "duration": "${duration}",
  "overview": "Ogólny opis programu",
  "units": [
    {
      "title": "Tytuł działu",
      "duration": "X tygodni",
      "objectives": ["cel 1", "cel 2"],
      "standards": ["standard 1"],
      "lessons": [
        {
          "title": "Tytuł lekcji",
          "duration": 45,
          "activities": ["aktywność 1", "aktywność 2"],
          "materials": ["materiał 1"]
        }
      ],
      "assessment": "Sposób oceny działu"
    }
  ],
  "assessments": [
    {
      "type": "formative/summative/diagnostic",
      "frequency": "częstotliwość",
      "description": "opis",
      "weight": 20
    }
  ],
  "pacing": [
    {
      "week": 1,
      "unit": "Nazwa działu",
      "topics": ["temat 1", "temat 2"],
      "milestones": ["kamień milowy"]
    }
  ],
  "differentiation": {
    "advancedLearners": ["strategia dla zaawansowanych"],
    "strugglingStudents": ["wsparcie dla uczniów z trudnościami"],
    "ellStudents": ["wsparcie językowe"]
  },
  "resources": ["zalecane zasoby"]
}

Stwórz realistyczny, szczegółowy program na ${weeks} tygodni.`;

  const response = await generateFromPrompt(prompt, {
    maxTokens: 6000,
    temperature: 0.7,
  });

  try {
    return JSON.parse(response);
  } catch {
    throw new Error("Nie udało się wygenerować programu nauczania.");
  }
}

// Generate parent report
export async function generateParentReport(
  studentProgress: StudentProgress,
  additionalData: {
    attendance?: { present: number; total: number };
    teacherNotes?: string;
    period: string;
  }
): Promise<ParentReport> {
  const prompt = `Przygotuj raport dla rodziców o postępach ucznia.

UCZEŃ: ${studentProgress.studentName}
OKRES: ${additionalData.period}

WYNIKI:
- Średnia: ${studentProgress.stats.averageGrade}%
- Zadania ukończone: ${studentProgress.stats.assignmentsCompleted}/${studentProgress.stats.assignmentsTotal}
- Quizy: ${studentProgress.stats.quizzesTaken}
- Czas nauki: ${studentProgress.stats.timeSpentMinutes} min
- Seria dni: ${studentProgress.stats.streak}

MOCNE STRONY: ${studentProgress.strengths.join(", ")}
DO POPRAWY: ${studentProgress.areasToImprove.join(", ")}

${additionalData.attendance ? `OBECNOŚĆ: ${additionalData.attendance.present}/${additionalData.attendance.total}` : ""}
${additionalData.teacherNotes ? `NOTATKI NAUCZYCIELA: ${additionalData.teacherNotes}` : ""}

Odpowiedz TYLKO w formacie JSON:
{
  "overallAssessment": "Ogólna ocena postępów (2-3 zdania)",
  "academicHighlights": ["osiągnięcie 1", "osiągnięcie 2"],
  "growthAreas": ["obszar rozwoju 1"],
  "behaviorAndEngagement": "Opis zachowania i zaangażowania",
  "parentRecommendations": [
    "Jak rodzice mogą wspierać naukę w domu",
    "Sugestia 2"
  ],
  "upcomingFocus": "Na czym uczeń powinien się skupić",
  "teacherMessage": "Osobista wiadomość od nauczyciela (ciepła, profesjonalna)"
}`;

  const response = await generateFromPrompt(prompt, {
    maxTokens: 1500,
    temperature: 0.7,
  });

  try {
    const parsed = JSON.parse(response);
    return {
      studentId: studentProgress.studentId,
      studentName: studentProgress.studentName,
      period: additionalData.period,
      academicPerformance: {
        overallGrade: studentProgress.stats.averageGrade,
        subjects: [],
      },
      attendance: additionalData.attendance
        ? { ...additionalData.attendance, percentage: (additionalData.attendance.present / additionalData.attendance.total) * 100 || 0 }
        : { present: 0, total: 0, percentage: 0 },
      strengths: studentProgress.strengths,
      areasForImprovement: studentProgress.areasToImprove,
      teacherComments: parsed.teacherMessage,
      recommendations: parsed.parentRecommendations,
    };
  } catch {
    throw new Error("Nie udało się wygenerować raportu dla rodziców.");
  }
}

// Generate differentiated instruction suggestions
export async function generateDifferentiatedInstruction(
  topic: string,
  studentProfiles: {
    advanced: number;
    onLevel: number;
    struggling: number;
    ell: number;
  },
  grade: string
): Promise<{
  baselesson: string;
  tieredActivities: {
    tier: "advanced" | "on_level" | "approaching" | "ell_support";
    activity: string;
    modifications: string[];
    materials: string[];
  }[];
  assessmentOptions: string[];
  groupingStrategies: string[];
  accommodations: string[];
}> {
  const prompt = `Stwórz zróżnicowane instrukcje dla lekcji.

TEMAT: ${topic}
KLASA: ${grade}
PROFIL KLASY:
- Zaawansowani: ${studentProfiles.advanced} uczniów
- Na poziomie: ${studentProfiles.onLevel} uczniów
- Z trudnościami: ${studentProfiles.struggling} uczniów
- ELL/Obcokrajowcy: ${studentProfiles.ell} uczniów

Odpowiedz TYLKO w formacie JSON:
{
  "baseLesson": "Opis podstawowej lekcji dla wszystkich",
  "tieredActivities": [
    {
      "tier": "advanced",
      "activity": "Aktywność dla zaawansowanych",
      "modifications": ["modyfikacja 1"],
      "materials": ["materiał 1"]
    },
    {
      "tier": "on_level",
      "activity": "Standardowa aktywność",
      "modifications": [],
      "materials": []
    },
    {
      "tier": "approaching",
      "activity": "Aktywność ze wsparciem",
      "modifications": ["dodatkowe wsparcie"],
      "materials": ["wizualne pomoce"]
    },
    {
      "tier": "ell_support",
      "activity": "Aktywność z wsparciem językowym",
      "modifications": ["tłumaczenia", "wizualizacje"],
      "materials": ["słowniczek"]
    }
  ],
  "assessmentOptions": [
    "opcja oceny 1",
    "opcja oceny 2"
  ],
  "groupingStrategies": [
    "strategia grupowania"
  ],
  "accommodations": [
    "dostosowanie dla uczniów ze specjalnymi potrzebami"
  ],
  "scaffolding": [
    "technika scaffoldingu"
  ]
}`;

  const response = await generateFromPrompt(prompt, {
    maxTokens: 2500,
    temperature: 0.7,
  });

  try {
    return JSON.parse(response);
  } catch {
    throw new Error("Nie udało się wygenerować zróżnicowanych instrukcji.");
  }
}

// Generate automated progress alerts
export function generateProgressAlerts(
  students: StudentProgress[]
): {
  critical: { studentId: string; studentName: string; reason: string }[];
  warning: { studentId: string; studentName: string; reason: string }[];
  positive: { studentId: string; studentName: string; reason: string }[];
} {
  const alerts = {
    critical: [] as { studentId: string; studentName: string; reason: string }[],
    warning: [] as { studentId: string; studentName: string; reason: string }[],
    positive: [] as { studentId: string; studentName: string; reason: string }[],
  };

  for (const student of students) {
    const completionRate = student.stats.assignmentsCompleted / student.stats.assignmentsTotal;

    // Critical alerts
    if (student.stats.averageGrade < 40) {
      alerts.critical.push({
        studentId: student.studentId,
        studentName: student.studentName,
        reason: `Bardzo niska średnia (${student.stats.averageGrade}%) - wymaga natychmiastowej interwencji`,
      });
    } else if (completionRate < 0.3 && student.stats.assignmentsTotal > 3) {
      alerts.critical.push({
        studentId: student.studentId,
        studentName: student.studentName,
        reason: `Bardzo niski wskaźnik ukończenia zadań (${Math.round(completionRate * 100)}%)`,
      });
    }

    // Warning alerts
    else if (student.stats.averageGrade < 60) {
      alerts.warning.push({
        studentId: student.studentId,
        studentName: student.studentName,
        reason: `Średnia poniżej progu (${student.stats.averageGrade}%)`,
      });
    } else if (student.stats.streak === 0 && student.stats.timeSpentMinutes < 30) {
      alerts.warning.push({
        studentId: student.studentId,
        studentName: student.studentName,
        reason: "Brak aktywności w ostatnim okresie",
      });
    }

    // Positive alerts
    else if (student.stats.averageGrade >= 90) {
      alerts.positive.push({
        studentId: student.studentId,
        studentName: student.studentName,
        reason: `Doskonałe wyniki (${student.stats.averageGrade}%) - kandydat do zaawansowanych zadań`,
      });
    } else if (student.stats.streak >= 7) {
      alerts.positive.push({
        studentId: student.studentId,
        studentName: student.studentName,
        reason: `Imponująca seria ${student.stats.streak} dni nauki z rzędu`,
      });
    }
  }

  return alerts;
}

// Generate weekly teacher summary email
export async function generateWeeklyTeacherSummary(
  teacherName: string,
  classrooms: {
    name: string;
    studentCount: number;
    assignmentsGraded: number;
    assignmentsPending: number;
    averageGrade: number;
    alerts: number;
  }[]
): Promise<{
  subject: string;
  greeting: string;
  highlights: string[];
  actionItems: string[];
  tips: string[];
  closing: string;
}> {
  const totalStudents = classrooms.reduce((sum, c) => sum + c.studentCount, 0);
  const totalPending = classrooms.reduce((sum, c) => sum + c.assignmentsPending, 0);
  const totalAlerts = classrooms.reduce((sum, c) => sum + c.alerts, 0);

  const prompt = `Przygotuj tygodniowe podsumowanie dla nauczyciela.

NAUCZYCIEL: ${teacherName}
KLASY: ${classrooms.length}
UCZNIOWIE ŁĄCZNIE: ${totalStudents}
ZADANIA DO OCENY: ${totalPending}
ALERTY: ${totalAlerts}

SZCZEGÓŁY KLAS:
${classrooms.map(c => `- ${c.name}: ${c.studentCount} uczniów, średnia ${c.averageGrade}%, ${c.assignmentsPending} zadań do oceny`).join("\n")}

Odpowiedz TYLKO w formacie JSON:
{
  "subject": "Temat emaila (przyciągający uwagę)",
  "greeting": "Ciepłe powitanie",
  "highlights": [
    "Pozytywne wydarzenie z tego tygodnia",
    "Kolejne osiągnięcie"
  ],
  "actionItems": [
    "Pilna akcja do podjęcia",
    "Mniej pilna sugestia"
  ],
  "tips": [
    "Praktyczna wskazówka pedagogiczna"
  ],
  "closing": "Motywujące zakończenie"
}`;

  const response = await generateFromPrompt(prompt, {
    maxTokens: 1000,
    temperature: 0.7,
  });

  try {
    return JSON.parse(response);
  } catch {
    return {
      subject: `Tygodniowe podsumowanie - ${classrooms.length} klas`,
      greeting: `Cześć ${teacherName}!`,
      highlights: ["Ten tydzień przyniósł nowe wyzwania."],
      actionItems: totalPending > 0 ? [`${totalPending} zadań czeka na ocenę`] : [],
      tips: ["Pamiętaj o regularnym feedbacku dla uczniów."],
      closing: "Udanego tygodnia!",
    };
  }
}

// Export school data for backup/migration
export function exportSchoolData(
  school: School,
  classrooms: Classroom[],
  includeStudentData: boolean
): string {
  const exportData = {
    exportedAt: new Date().toISOString(),
    version: "1.0",
    school: {
      name: school.name,
      type: school.type,
      settings: school.settings,
    },
    classrooms: classrooms.map(c => ({
      name: c.name,
      description: c.description,
      channels: c.channels.map(ch => ({
        name: ch.name,
        type: ch.type,
        description: ch.description,
        allowStudentPosts: ch.allowStudentPosts,
      })),
      settings: c.settings,
      studentCount: includeStudentData ? c.students.length : undefined,
    })),
    statistics: {
      totalClassrooms: classrooms.length,
      totalStudents: classrooms.reduce((sum, c) => sum + c.students.length, 0),
    },
  };

  return JSON.stringify(exportData, null, 2);
}
