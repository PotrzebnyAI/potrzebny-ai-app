// ElevenLabs API - Text-to-Speech po polsku
// Darmowy tier: 10,000 znaków/miesiąc

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";

// Polskie głosy ElevenLabs
export const POLISH_VOICES = {
  adam: "pNInz6obpgDQGcFmaJgB", // Adam - męski
  antoni: "ErXwobaYiN019PkySvjV", // Antoni - męski
  bella: "EXAVITQu4vr4xnSDxMaL", // Bella - żeński
  rachel: "21m00Tcm4TlvDq8ikWAM", // Rachel - żeński
} as const;

interface TextToSpeechOptions {
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
}

// Generowanie audio z tekstu
export async function textToSpeech(
  text: string,
  options?: TextToSpeechOptions
): Promise<ArrayBuffer> {
  const voiceId = options?.voiceId || POLISH_VOICES.adam;

  const response = await fetch(
    `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      },
      body: JSON.stringify({
        text,
        model_id: options?.modelId || "eleven_multilingual_v2",
        voice_settings: {
          stability: options?.stability ?? 0.5,
          similarity_boost: options?.similarityBoost ?? 0.75,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs error: ${error}`);
  }

  return response.arrayBuffer();
}

// Pobierz dostępne głosy
export async function getVoices() {
  const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY!,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch voices");
  }

  return response.json();
}

// Sprawdź limit użycia
export async function getUsage() {
  const response = await fetch(`${ELEVENLABS_API_URL}/user/subscription`, {
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY!,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch usage");
  }

  return response.json();
}
