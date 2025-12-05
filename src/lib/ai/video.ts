// Video Generation using Replicate (free tier available)
// Uses Stable Video Diffusion for image-to-video

const REPLICATE_API_URL = "https://api.replicate.com/v1/predictions";

export interface VideoGenerationRequest {
  imageUrl?: string;
  prompt: string;
  duration?: number; // 2-4 seconds
  fps?: number;
}

export interface VideoGenerationResult {
  videoUrl: string;
  status: "starting" | "processing" | "succeeded" | "failed";
  id: string;
}

// Generate video from image using Stable Video Diffusion
export async function generateVideoFromImage(
  request: VideoGenerationRequest
): Promise<VideoGenerationResult> {
  const apiKey = process.env.REPLICATE_API_TOKEN;

  if (!apiKey) {
    throw new Error("REPLICATE_API_TOKEN not configured");
  }

  const response = await fetch(REPLICATE_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
      input: {
        input_image: request.imageUrl,
        motion_bucket_id: 127,
        cond_aug: 0.02,
        decoding_t: 14,
        seed: Math.floor(Math.random() * 1000000),
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Replicate API error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    videoUrl: data.output?.[0] || "",
    status: data.status,
    id: data.id,
  };
}

// Generate video from text prompt using AnimateDiff
export async function generateVideoFromText(
  prompt: string,
  negativePrompt?: string
): Promise<VideoGenerationResult> {
  const apiKey = process.env.REPLICATE_API_TOKEN;

  if (!apiKey) {
    throw new Error("REPLICATE_API_TOKEN not configured");
  }

  const response = await fetch(REPLICATE_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "c5c1500e9a95c4ed3c4b7e2b384c862c7c6a84f6e12baa5e6e3cc4b6a8e3e8f5",
      input: {
        prompt: prompt,
        negative_prompt: negativePrompt || "blurry, low quality, distorted",
        num_frames: 16,
        num_inference_steps: 25,
        guidance_scale: 7.5,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Replicate API error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    videoUrl: data.output?.[0] || "",
    status: data.status,
    id: data.id,
  };
}

// Check video generation status
export async function checkVideoStatus(predictionId: string): Promise<VideoGenerationResult> {
  const apiKey = process.env.REPLICATE_API_TOKEN;

  if (!apiKey) {
    throw new Error("REPLICATE_API_TOKEN not configured");
  }

  const response = await fetch(`${REPLICATE_API_URL}/${predictionId}`, {
    headers: {
      "Authorization": `Token ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Replicate API error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    videoUrl: data.output?.[0] || "",
    status: data.status,
    id: data.id,
  };
}
