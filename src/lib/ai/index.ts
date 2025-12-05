// AI Module - Główny eksport wszystkich funkcji AI
// potrzebny.ai SuperMózg

// Groq - transkrypcja i generowanie tekstu
export {
  generateText,
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
