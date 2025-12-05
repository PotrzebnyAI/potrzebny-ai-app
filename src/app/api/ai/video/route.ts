import { NextRequest, NextResponse } from "next/server";
import { generateVideoFromText, generateVideoFromImage, checkVideoStatus } from "@/lib/ai/video";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const { allowed, remaining } = checkRateLimit(ip, "/api/ai/video");

    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } }
      );
    }

    const body = await request.json();
    const { prompt, imageUrl, action } = body;

    if (action === "status" && body.predictionId) {
      const status = await checkVideoStatus(body.predictionId);
      return NextResponse.json(status);
    }

    if (!prompt && !imageUrl) {
      return NextResponse.json(
        { error: "Prompt or imageUrl is required" },
        { status: 400 }
      );
    }

    let result;
    if (imageUrl) {
      result = await generateVideoFromImage({ prompt, imageUrl });
    } else {
      result = await generateVideoFromText(prompt);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Video generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate video" },
      { status: 500 }
    );
  }
}
