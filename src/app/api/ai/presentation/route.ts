import { NextResponse } from "next/server";
import {
  generatePresentationStructure,
  toMarpMarkdown,
  presentationToHTML,
  toGoogleSlidesFormat,
} from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, slideCount, style, format, includeImages } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    // Generuj strukturę prezentacji
    const presentation = await generatePresentationStructure(content, {
      slideCount: slideCount || 10,
      style: style || "educational",
      includeImages: includeImages || false,
    });

    // Zwróć w wybranym formacie
    const outputFormat = format || "json";

    switch (outputFormat) {
      case "marp":
        return new NextResponse(toMarpMarkdown(presentation), {
          headers: {
            "Content-Type": "text/markdown",
            "Content-Disposition": `attachment; filename="${presentation.title}.md"`,
          },
        });

      case "html":
        return new NextResponse(presentationToHTML(presentation), {
          headers: {
            "Content-Type": "text/html",
            "Content-Disposition": `attachment; filename="${presentation.title}.html"`,
          },
        });

      case "google":
        return NextResponse.json({
          presentation,
          googleSlidesFormat: toGoogleSlidesFormat(presentation),
        });

      default:
        return NextResponse.json({ presentation });
    }
  } catch (error) {
    console.error("Presentation error:", error);
    return NextResponse.json({ error: "Presentation generation failed" }, { status: 500 });
  }
}
