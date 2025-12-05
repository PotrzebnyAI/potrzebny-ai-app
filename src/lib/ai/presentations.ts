// Generowanie prezentacji - używa Groq do generowania struktury
// + opcjonalnie SlidesGPT API do PPTX

import { generateJSON } from "./groq";

export interface Slide {
  title: string;
  content: string[];
  notes?: string;
  imagePrompt?: string;
}

export interface Presentation {
  title: string;
  subtitle?: string;
  author?: string;
  slides: Slide[];
}

// Generuj strukturę prezentacji z treści
export async function generatePresentationStructure(
  content: string,
  options?: {
    slideCount?: number;
    style?: "professional" | "educational" | "minimal" | "creative";
    includeImages?: boolean;
  }
): Promise<Presentation> {
  const slideCount = options?.slideCount || 10;
  const style = options?.style || "educational";

  const styleInstructions: Record<string, string> = {
    professional: "Profesjonalny styl biznesowy, konkretne dane i wnioski.",
    educational: "Styl edukacyjny, jasne wyjaśnienia, przykłady, podsumowania.",
    minimal: "Minimalistyczny, tylko kluczowe punkty, dużo przestrzeni.",
    creative: "Kreatywny styl, metafory, storytelling, angażujący.",
  };

  return generateJSON<Presentation>(
    `Jesteś ekspertem od tworzenia prezentacji edukacyjnych.
Na podstawie podanej treści wygeneruj strukturę prezentacji.

STYL: ${styleInstructions[style]}
LICZBA SLAJDÓW: ${slideCount} (włącznie z tytułowym i podsumowaniem)

Zwróć JSON:
{
  "title": "tytuł prezentacji",
  "subtitle": "podtytuł (opcjonalnie)",
  "slides": [
    {
      "title": "tytuł slajdu",
      "content": ["punkt 1", "punkt 2", "punkt 3"],
      "notes": "notatki dla prezentera"${options?.includeImages ? ',\n      "imagePrompt": "opis obrazu do wygenerowania"' : ""}
    }
  ]
}

ZASADY:
- Slajd 1: Tytułowy
- Slajd 2: Agenda/Plan
- Slajdy 3-${slideCount - 1}: Treść merytoryczna
- Slajd ${slideCount}: Podsumowanie/Pytania
- Max 5 punktów na slajd
- Krótkie, konkretne punkty`,
    content
  );
}

// Eksport do formatu Marp (markdown prezentacje)
export function toMarpMarkdown(presentation: Presentation): string {
  let markdown = `---
marp: true
theme: default
paginate: true
---

# ${presentation.title}
${presentation.subtitle ? `## ${presentation.subtitle}` : ""}
${presentation.author ? `\n*${presentation.author}*` : ""}

---

`;

  for (const slide of presentation.slides) {
    markdown += `# ${slide.title}\n\n`;

    for (const point of slide.content) {
      markdown += `- ${point}\n`;
    }

    if (slide.notes) {
      markdown += `\n<!--\n${slide.notes}\n-->\n`;
    }

    markdown += "\n---\n\n";
  }

  return markdown;
}

// Eksport do HTML (prosty)
export function toHTML(presentation: Presentation): string {
  const slidesHtml = presentation.slides
    .map(
      (slide, i) => `
    <section class="slide" data-slide="${i + 1}">
      <h2>${slide.title}</h2>
      <ul>
        ${slide.content.map((point) => `<li>${point}</li>`).join("\n        ")}
      </ul>
    </section>
  `
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${presentation.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #1a1a2e; color: white; }
    .slide {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 4rem;
      border-bottom: 1px solid #333;
    }
    h2 { font-size: 2.5rem; margin-bottom: 2rem; color: #6366f1; }
    ul { font-size: 1.5rem; line-height: 2; }
    li { margin-bottom: 1rem; }
  </style>
</head>
<body>
  <header class="slide">
    <h1 style="font-size: 3rem; color: #6366f1;">${presentation.title}</h1>
    ${presentation.subtitle ? `<p style="font-size: 1.5rem; opacity: 0.8;">${presentation.subtitle}</p>` : ""}
    ${presentation.author ? `<p style="margin-top: 2rem; opacity: 0.6;">${presentation.author}</p>` : ""}
  </header>
  ${slidesHtml}
</body>
</html>`;
}

// Generuj JSON dla Google Slides API (struktura)
export function toGoogleSlidesFormat(presentation: Presentation) {
  return {
    title: presentation.title,
    slides: presentation.slides.map((slide, index) => ({
      objectId: `slide_${index}`,
      slideProperties: {
        layoutObjectId: index === 0 ? "TITLE" : "TITLE_AND_BODY",
      },
      pageElements: [
        {
          shape: {
            shapeType: "TEXT_BOX",
            text: {
              textElements: [
                { textRun: { content: slide.title, style: { bold: true, fontSize: { magnitude: 24, unit: "PT" } } } },
              ],
            },
          },
        },
        {
          shape: {
            shapeType: "TEXT_BOX",
            text: {
              textElements: slide.content.map((point) => ({
                textRun: { content: `• ${point}\n` },
              })),
            },
          },
        },
      ],
    })),
  };
}
