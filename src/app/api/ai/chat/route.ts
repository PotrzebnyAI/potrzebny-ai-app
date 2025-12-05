import { NextResponse } from "next/server";
import { superMozgChat, shouldRecommendExpert, superMozgDefaultConfig } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, context, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    // Sprawdź czy polecić eksperta
    const expertCheck = await shouldRecommendExpert(message);

    // Generuj odpowiedź SuperMózgu
    const response = await superMozgChat(message, {
      context,
      conversationHistory: history,
    });

    return NextResponse.json({
      response,
      expertRecommendation: expertCheck.recommend
        ? {
            recommend: true,
            reason: expertCheck.reason,
            specialty: expertCheck.specialty,
            expert: {
              name: superMozgDefaultConfig.expertName,
              title: superMozgDefaultConfig.expertTitle,
              contact: superMozgDefaultConfig.expertContact,
              website: superMozgDefaultConfig.expertWebsite,
            },
          }
        : null,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
