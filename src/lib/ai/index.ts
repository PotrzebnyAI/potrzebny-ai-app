// AI Module - Główny eksport wszystkich funkcji AI
// potrzebny.ai SuperMózg

// Groq - transkrypcja i generowanie tekstu
export {
  generateText,
  generateFromPrompt,
  transcribeAudio,
  generateJSON,
} from "./groq";

// ElevenLabs - Text-to-Speech
export {
  textToSpeech,
  getVoices,
  getUsage as getTTSUsage,
  POLISH_VOICES,
} from "./elevenlabs";

// Semantic Scholar - badania naukowe
export {
  searchPapers,
  getPaper,
  getRecommendations,
  searchAuthors,
} from "./semantic-scholar";

// Prezentacje
export {
  generatePresentationStructure,
  toMarpMarkdown,
  toHTML as presentationToHTML,
  toGoogleSlidesFormat,
  type Presentation,
  type Slide,
} from "./presentations";

// SuperMózg - konfigurowalny asystent
export {
  chat as superMozgChat,
  shouldRecommendExpert,
  generateEducationalResponse,
  defaultConfig as superMozgDefaultConfig,
  type SuperMozgConfig,
} from "./supermozg";

// Video Generation
export {
  generateVideoFromImage,
  generateVideoFromText,
  checkVideoStatus,
  type VideoGenerationRequest,
  type VideoGenerationResult,
} from "./video";

// Flashcards
export {
  generateFlashcards,
  generateSmartFlashcards,
  generateClozeFlashcards,
  type Flashcard,
  type FlashcardSet,
} from "./flashcards";

// Quiz
export {
  generateQuiz,
  generateAdaptiveQuiz,
  generateExam,
  gradeQuiz,
  type Quiz,
  type QuizQuestion,
} from "./quiz";

// Notes
export {
  generateNotes,
  generateMultiFormatNotes,
  generateStudyGuide,
  generateAudioScript,
  type Note,
  type NoteFormat,
} from "./notes";

// Classroom / Teacher Panel
export {
  generateClassroomCode,
  createDefaultChannels,
  generateSubmissionFeedback,
  generateProgressReport,
  generateClassSummary,
  generateLessonPlan,
  type Classroom,
  type Channel,
  type Assignment,
  type StudentProgress,
} from "./classroom";

// SuperMózg Health Optimization
export {
  generateSupplementStack,
  generateAirQualityPlan,
  generateHealthOptimizationPlan,
  generateAldehydeDetoxProtocol,
  SUPPLEMENT_DATABASE,
  PLANT_DATABASE,
  type Supplement,
  type SupplementStack,
  type SupplementCategory,
  type StackGoal,
  type AirPurifier,
  type Plant,
  type HealthOptimizationPlan,
  type LifestyleRecommendation,
  type DailyRoutine,
} from "./supermozg-health";

// Medical Panel (Licensed Professionals)
export {
  searchMedicalLiterature,
  getClinicalDecisionSupport,
  checkDrugInteractions,
  generateEvidenceSummary,
  verifyMedicalLicense,
  getAldehydeResearch,
  generateAldehydeToxicityReport,
  type MedicalLicense,
  type MedicalUser,
  type ResearchQuery,
  type ResearchSummary,
  type ClinicalDecisionSupport,
  type DrugInteraction,
  type PatientCase,
  type StudyType,
} from "./medical-panel";

// Psychotherapy Panel (Mental Health Professionals)
export {
  generateSessionNoteTemplate,
  generateTreatmentPlanSuggestions,
  generateTherapyExercise,
  generateSafetyPlan,
  generateProgressSummary,
  CBT_TECHNIQUES,
  DBT_SKILLS,
  type TherapistProfile,
  type TherapyApproach,
  type ClientProfile,
  type SessionNote,
  type TreatmentPlan,
  type TreatmentGoal,
  type TherapyExercise,
  type CrisisProtocol,
} from "./psychotherapy-panel";

// Teacher Panel Pro (Mass School Deployment)
export {
  processBulkStudentImport,
  generateSchoolAnalytics,
  generateAutomatedCurriculum,
  generateParentReport,
  generateDifferentiatedInstruction,
  generateProgressAlerts,
  generateWeeklyTeacherSummary,
  exportSchoolData,
  type School,
  type SchoolSettings,
  type SchoolSubscription,
  type District,
  type DistrictSettings,
  type DistrictAnalytics,
  type CurriculumStandard,
  type BulkStudentImport,
  type TeacherAnalytics,
  type ParentReport,
  type AutomatedCurriculum,
  type CurriculumUnit,
  type AssessmentPlan,
  type PacingGuide,
} from "./teacher-panel-pro";

// Research Database (Multi-source Scientific Search)
export {
  searchResearch,
  getPaperDetails,
  getRelatedPapers,
  generateLiteratureReview,
  analyzeResearchTrends,
  generateCitation,
  createResearchCollection,
  exportToBibTeX,
  exportToRIS,
  searchAldehydeResearch,
  searchSupplementResearch,
  generateAccessibleSummary,
  type ResearchPaper,
  type ResearchSource,
  type ResearchCollection,
  type LiteratureReview,
  type ResearchTrend,
  type CitationNetwork,
  type ResearchAlert,
} from "./research-database";
