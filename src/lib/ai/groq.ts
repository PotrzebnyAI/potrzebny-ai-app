// Groq API Client - Darmowe AI dla potrzebny.ai
// Whisper Large V3 (transkrypcja) + Llama 3.1 70B (generowanie)

const GROQ_API_URL = "https://api.groq.com/openai/v1";

interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GroqCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface GroqTranscriptionResponse {
  text: string;
}

// Generowanie tekstu z Llama 3.1 70B
export async function generateText(
  messages: GroqMessage[],
  options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    response_format?: { type: "json_object" };
  }
): Promise<string> {
  const response = await fetch(`${GROQ_API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: options?.model || "llama-3.1-70b-versatile",
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 4096,
      response_format: options?.response_format,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${error}`);
  }

  const data: GroqCompletionResponse = await response.json();
  return data.choices[0].message.content;
}

// Transkrypcja audio z Whisper Large V3
export async function transcribeAudio(
  audioBlob: Blob,
  language: string = "pl"
): Promise<string> {
  const formData = new FormData();
  formData.append("file", audioBlob, "audio.mp3");
  formData.append("model", "whisper-large-v3");
  formData.append("language", language);

  const response = await fetch(`${GROQ_API_URL}/audio/transcriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq Whisper error: ${error}`);
  }

  const data: GroqTranscriptionResponse = await response.json();
  return data.text;
}

// Generowanie JSON (notatki, quizy, fiszki)
export async function generateJSON<T>(
  systemPrompt: string,
  userContent: string,
  options?: { model?: string }
): Promise<T> {
  const content = await generateText(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent.slice(0, 15000) },
    ],
    {
      model: options?.model,
      response_format: { type: "json_object" },
    }
  );

  return JSON.parse(content);
}
