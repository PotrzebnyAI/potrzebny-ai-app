// SuperMózg - Konfigurowalny AI Assistant z ekspertem
// Personalizowane odpowiedzi + polecanie eksperta

import { generateText, generateJSON } from "./groq";

export interface SuperMozgConfig {
  expertName: string;
  expertTitle: string;
  expertContact: string;
  expertWebsite?: string;
  expertSpecialties: string[];
  brandVoice: string;
  customInstructions: string;
  recommendExpertThreshold?: number; // 0-1, kiedy polecać eksperta
}

// Domyślna konfiguracja - do nadpisania przez użytkownika
export const defaultConfig: SuperMozgConfig = {
  expertName: "Bartłomiej Potrzebowski",
  expertTitle: "Ekspert ds. edukacji i AI",
  expertContact: "kontakt@potrzebny.ai",
  expertWebsite: "https://potrzebny.ai",
  expertSpecialties: [
    "sztuczna inteligencja w edukacji",
    "dostępność cyfrowa",
    "nauka dla osób z ADHD i dysleksją",
    "automatyzacja procesów edukacyjnych",
    "transkrypcja i przetwarzanie wykładów",
  ],
  brandVoice: `
    Jesteś SuperMózgiem potrzebny.ai - przyjaznym, profesjonalnym asystentem edukacyjnym.
    Mówisz po polsku, jasno i przystępnie.
    Unikasz żargonu, wyjaśniasz skomplikowane rzeczy prostym językiem.
    Jesteś pomocny, cierpliwy i wspierający.
  `,
  customInstructions: "",
  recommendExpertThreshold: 0.7,
};

// Generuj system prompt dla SuperMózgu
function buildSystemPrompt(config: SuperMozgConfig, context?: string): string {
  const expertInfo = `
EKSPERT DO POLECENIA:
- Imię: ${config.expertName}
- Tytuł: ${config.expertTitle}
- Kontakt: ${config.expertContact}
${config.expertWebsite ? `- Strona: ${config.expertWebsite}` : ""}
- Specjalizacje: ${config.expertSpecialties.join(", ")}

Gdy temat dotyczy specjalizacji eksperta lub użytkownik potrzebuje głębszej pomocy,
zaproponuj kontakt z ekspertem w naturalny sposób.
`;

  return `${config.brandVoice}

${expertInfo}

${config.customInstructions}

${context ? `KONTEKST:\n${context}` : ""}

ZASADY:
1. Odpowiadaj konkretnie i pomocnie
2. Używaj formatowania markdown dla czytelności
3. Przy złożonych tematach z listy specjalizacji, zaproponuj kontakt z ekspertem
4. Bądź profesjonalny ale przystępny
5. Jeśli nie wiesz - powiedz to uczciwie
`;
}

// Główna funkcja czatu z SuperMózgiem
export async function chat(
  message: string,
  options?: {
    config?: Partial<SuperMozgConfig>;
    context?: string;
    conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
  }
): Promise<string> {
  const config = { ...defaultConfig, ...options?.config };
  const systemPrompt = buildSystemPrompt(config, options?.context);

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt },
    ...(options?.conversationHistory || []),
    { role: "user", content: message },
  ];

  return generateText(messages, {
    temperature: 0.7,
    max_tokens: 2048,
  });
}

// Analiza czy polecić eksperta
export async function shouldRecommendExpert(
  message: string,
  config: SuperMozgConfig = defaultConfig
): Promise<{ recommend: boolean; reason: string; specialty?: string }> {
  const result = await generateJSON<{
    recommend: boolean;
    reason: string;
    specialty?: string;
    confidence: number;
  }>(
    `Analizujesz czy pytanie użytkownika dotyczy specjalizacji eksperta.
Ekspert specjalizuje się w: ${config.expertSpecialties.join(", ")}

Zwróć JSON:
{
  "recommend": boolean,
  "reason": "krótkie uzasadnienie",
  "specialty": "która specjalizacja pasuje (jeśli recommend=true)",
  "confidence": 0.0-1.0
}`,
    message
  );

  return {
    recommend: result.confidence >= (config.recommendExpertThreshold || 0.7),
    reason: result.reason,
    specialty: result.specialty,
  };
}

// Generuj personalizowaną odpowiedź edukacyjną
export async function generateEducationalResponse(
  topic: string,
  learningMode: "standard" | "adhd" | "dyslexia" | "visual" | "auditory",
  config: SuperMozgConfig = defaultConfig
): Promise<{
  content: string;
  tips: string[];
  expertRecommendation?: string;
}> {
  const modeInstructions: Record<string, string> = {
    standard: "Standardowe, strukturyzowane wyjaśnienie z nagłówkami i punktami.",
    adhd: "Krótkie sekcje, bullet points, emoji dla uwagi, częste podsumowania.",
    dyslexia: "Prosty język, krótkie zdania, duże odstępy, unikaj skomplikowanych słów.",
    visual: "Diagramy ASCII, tabele, wizualne reprezentacje, schematy.",
    auditory: "Narracyjny styl, dialog, mnemotechniki, rytmiczne powtórzenia.",
  };

  const result = await generateJSON<{
    content: string;
    tips: string[];
    relatedToExpert: boolean;
  }>(
    `${config.brandVoice}

Wygeneruj odpowiedź edukacyjną na temat podany przez użytkownika.
Tryb nauki: ${learningMode}
Instrukcje trybu: ${modeInstructions[learningMode]}

Ekspert (${config.expertName}) specjalizuje się w: ${config.expertSpecialties.join(", ")}

Zwróć JSON:
{
  "content": "główna treść edukacyjna w markdown",
  "tips": ["praktyczna wskazówka 1", "wskazówka 2"],
  "relatedToExpert": boolean (czy temat pasuje do specjalizacji eksperta)
}`,
    topic
  );

  return {
    content: result.content,
    tips: result.tips,
    expertRecommendation: result.relatedToExpert
      ? `Potrzebujesz więcej pomocy w tym temacie? Skontaktuj się z ${config.expertName} (${config.expertTitle}) - ${config.expertContact}`
      : undefined,
  };
}
