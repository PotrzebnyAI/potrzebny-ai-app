import { NextRequest, NextResponse } from "next/server";
import {
  generateSessionNoteTemplate,
  generateTreatmentPlanSuggestions,
  generateTherapyExercise,
  generateSafetyPlan,
  generateProgressSummary,
  CBT_TECHNIQUES,
  DBT_SKILLS,
} from "@/lib/ai/psychotherapy-panel";
import { checkRateLimit } from "@/lib/security/rate-limit";

// Psychotherapy Panel API - for licensed mental health professionals
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const { allowed, remaining } = checkRateLimit(ip, "/api/ai/therapy");

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
      case "session_template":
        if (!params.approach) {
          return NextResponse.json(
            { error: "Therapy approach is required" },
            { status: 400 }
          );
        }
        result = await generateSessionNoteTemplate(params.approach, {
          sessionNumber: params.sessionNumber || 1,
          presentingIssues: params.presentingIssues || [],
          previousSessionSummary: params.previousSessionSummary,
        });
        break;

      case "treatment_plan":
        if (!params.presentingProblems || !Array.isArray(params.presentingProblems)) {
          return NextResponse.json(
            { error: "Presenting problems array is required" },
            { status: 400 }
          );
        }
        result = await generateTreatmentPlanSuggestions({
          presentingProblems: params.presentingProblems,
          history: params.history,
          strengths: params.strengths,
          preferences: params.preferences,
        });
        break;

      case "therapy_exercise":
        if (!params.issue || !params.approach) {
          return NextResponse.json(
            { error: "Issue and approach are required" },
            { status: 400 }
          );
        }
        result = await generateTherapyExercise(params.issue, params.approach, {
          clientAge: params.clientAge,
          settingPreference: params.settingPreference,
        });
        break;

      case "safety_plan":
        result = await generateSafetyPlan({
          warningSignsIdentified: params.warningSignsIdentified,
          previousCopingStrategies: params.previousCopingStrategies,
          supportNetwork: params.supportNetwork,
        });
        break;

      case "progress_summary":
        if (!params.sessions || !Array.isArray(params.sessions)) {
          return NextResponse.json(
            { error: "Sessions array is required" },
            { status: 400 }
          );
        }
        result = await generateProgressSummary(params.sessions);
        break;

      case "get_cbt_techniques":
        result = CBT_TECHNIQUES;
        break;

      case "get_dbt_skills":
        result = DBT_SKILLS;
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      ...result,
      disclaimer: "These are AI-generated suggestions to support clinical work. Always use professional judgment and adapt to individual client needs.",
    });
  } catch (error) {
    console.error("Therapy API error:", error);
    return NextResponse.json(
      { error: "Failed to process therapy request" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    description: "Psychotherapy Panel API for Mental Health Professionals",
    endpoints: {
      session_template: "Generate session structure and intervention suggestions",
      treatment_plan: "Generate treatment plan suggestions",
      therapy_exercise: "Generate therapy exercises for specific issues",
      safety_plan: "Generate safety plan template for crisis intervention",
      progress_summary: "Generate progress summary from session data",
      get_cbt_techniques: "Get CBT techniques library",
      get_dbt_skills: "Get DBT skills library",
    },
    supportedApproaches: [
      "cbt",
      "dbt",
      "psychodynamic",
      "humanistic",
      "act",
      "emdr",
      "mindfulness",
      "solution_focused",
      "gestalt",
      "systemic",
      "integrative",
    ],
    disclaimer: "This tool supports clinical work but does not replace professional training, supervision, or clinical judgment.",
  });
}
