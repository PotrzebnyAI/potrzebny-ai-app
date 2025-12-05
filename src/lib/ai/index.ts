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
