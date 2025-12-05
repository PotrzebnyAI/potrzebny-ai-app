import { NextRequest, NextResponse } from "next/server";
import {
  generateSupplementStack,
  generateAirQualityPlan,
  generateHealthOptimizationPlan,
  generateAldehydeDetoxProtocol,
  SUPPLEMENT_DATABASE,
  PLANT_DATABASE,
} from "@/lib/ai/supermozg-health";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const { allowed, remaining } = checkRateLimit(ip, "/api/ai/health");

    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } }
      );
    }

    const body = await request.json();
    const { action, ...params } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    let result;
    switch (action) {
      case "supplement_stack":
        if (!params.goals || !Array.isArray(params.goals)) {
          return NextResponse.json(
            { error: "Goals array is required for supplement stack" },
            { status: 400 }
          );
        }
        result = await generateSupplementStack(params.goals, params.userProfile || {});
        break;

      case "air_quality":
        if (!params.roomDetails || !params.roomDetails.rooms) {
          return NextResponse.json(
            { error: "Room details are required for air quality plan" },
            { status: 400 }
          );
        }
        result = await generateAirQualityPlan(params.roomDetails);
        break;

      case "health_plan":
        if (!params.goals) {
          return NextResponse.json(
            { error: "Goals are required for health optimization plan" },
            { status: 400 }
          );
        }
        result = await generateHealthOptimizationPlan({
          goals: params.goals,
          currentHealth: params.currentHealth || "",
          lifestyle: params.lifestyle || "",
          budget: params.budget || "medium",
          timeCommitment: params.timeCommitment || "moderate",
          focusAreas: params.focusAreas || [],
        });
        break;

      case "aldehyde_detox":
        result = await generateAldehydeDetoxProtocol(
          params.exposureLevel || "moderate",
          params.sources || []
        );
        break;

      case "get_supplements":
        result = SUPPLEMENT_DATABASE;
        break;

      case "get_plants":
        result = PLANT_DATABASE;
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Health API error:", error);
    return NextResponse.json(
      { error: "Failed to process health request" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoints: {
      supplement_stack: "Generate personalized supplement stack",
      air_quality: "Generate air quality optimization plan",
      health_plan: "Generate complete health optimization plan",
      aldehyde_detox: "Generate aldehyde detoxification protocol",
      get_supplements: "Get supplement database",
      get_plants: "Get NASA Clean Air plants database",
    },
    example: {
      action: "supplement_stack",
      goals: ["cognitive_enhancement", "aldehyde_detox"],
      userProfile: {
        age: 35,
        budget: "medium",
      },
    },
  });
}
