import { NextRequest, NextResponse } from "next/server";
import {
  generateClassroomCode,
  createDefaultChannels,
  generateSubmissionFeedback,
  generateProgressReport,
  generateClassSummary,
  generateLessonPlan,
} from "@/lib/ai/classroom";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const { allowed, remaining } = checkRateLimit(ip, "/api/ai/classroom");

    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } }
      );
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "generate-code":
        return NextResponse.json({ code: generateClassroomCode() });

      case "create-channels":
        return NextResponse.json({ channels: createDefaultChannels() });

      case "grade-submission":
        const { assignment, submission, rubric } = body;
        if (!assignment || !submission) {
          return NextResponse.json(
            { error: "Assignment and submission are required" },
            { status: 400 }
          );
        }
        const feedback = await generateSubmissionFeedback(assignment, submission, rubric);
        return NextResponse.json(feedback);

      case "progress-report":
        const { progress } = body;
        if (!progress) {
          return NextResponse.json(
            { error: "Progress data is required" },
            { status: 400 }
          );
        }
        const report = await generateProgressReport(progress);
        return NextResponse.json({ report });

      case "class-summary":
        const { studentProgressList } = body;
        if (!studentProgressList || !Array.isArray(studentProgressList)) {
          return NextResponse.json(
            { error: "Student progress list is required" },
            { status: 400 }
          );
        }
        const summary = await generateClassSummary(studentProgressList);
        return NextResponse.json(summary);

      case "lesson-plan":
        const { topic, duration, level } = body;
        if (!topic) {
          return NextResponse.json(
            { error: "Topic is required" },
            { status: 400 }
          );
        }
        const plan = await generateLessonPlan(topic, duration, level);
        return NextResponse.json(plan);

      default:
        return NextResponse.json(
          { error: "Invalid action. Valid actions: generate-code, create-channels, grade-submission, progress-report, class-summary, lesson-plan" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Classroom API error:", error);
    return NextResponse.json(
      { error: "Failed to process classroom request" },
      { status: 500 }
    );
  }
}
