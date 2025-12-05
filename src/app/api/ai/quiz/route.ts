import { NextRequest, NextResponse } from "next/server";
import { generateQuiz, generateAdaptiveQuiz, generateExam, gradeQuiz } from "@/lib/ai/quiz";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const { allowed, remaining } = checkRateLimit(ip, "/api/ai/quiz");

    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } }
      );
    }

    const body = await request.json();
    const { action = "generate", content, options = {}, quiz, answers, userPerformance, sections } = body;

    switch (action) {
      case "generate":
        if (!content) {
          return NextResponse.json(
            { error: "Content is required" },
            { status: 400 }
          );
        }
        const generatedQuiz = await generateQuiz(content, options);
        return NextResponse.json(generatedQuiz);

      case "adaptive":
        if (!content || !userPerformance) {
          return NextResponse.json(
            { error: "Content and userPerformance are required" },
            { status: 400 }
          );
        }
        const adaptiveQuiz = await generateAdaptiveQuiz(content, userPerformance);
        return NextResponse.json(adaptiveQuiz);

      case "exam":
        if (!content || !sections) {
          return NextResponse.json(
            { error: "Content and sections are required" },
            { status: 400 }
          );
        }
        const exam = await generateExam(content, sections);
        return NextResponse.json(exam);

      case "grade":
        if (!quiz || !answers) {
          return NextResponse.json(
            { error: "Quiz and answers are required" },
            { status: 400 }
          );
        }
        const results = gradeQuiz(quiz, answers);
        return NextResponse.json(results);

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Quiz error:", error);
    return NextResponse.json(
      { error: "Failed to process quiz request" },
      { status: 500 }
    );
  }
}
