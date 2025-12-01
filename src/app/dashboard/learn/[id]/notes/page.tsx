import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

interface NotesContent {
  title?: string;
  summary?: string;
  sections?: { title: string; content: string }[];
  keyPoints?: string[];
}

export default async function NotesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: material } = await supabase
    .from("materials")
    .select("*")
    .eq("id", id)
    .single();

  if (!material) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("learning_mode")
    .single();

  const { data: notes } = await supabase
    .from("notes")
    .select("*")
    .eq("material_id", id)
    .eq("learning_mode", profile?.learning_mode || "standard")
    .single();

  const content = notes?.content as NotesContent | null;

  return (
    <div className="max-w-4xl mx-auto">
      <Link href={`/dashboard/materials/${id}`} className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6">
        <ArrowLeft size={20} />
        Powrót do materiału
      </Link>

      <div className="bg-[var(--background)] rounded-xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText size={24} className="text-green-500" />
          <h1 className="text-2xl font-bold">Notatki: {material.title}</h1>
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">
          Tryb: {profile?.learning_mode || "standard"}
        </p>
      </div>

      {content ? (
        <div className="space-y-6">
          {content.summary && (
            <div className="bg-[var(--background)] rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-3">Podsumowanie</h2>
              <p className="text-[var(--muted-foreground)]">{content.summary}</p>
            </div>
          )}

          {content.keyPoints && content.keyPoints.length > 0 && (
            <div className="bg-[var(--background)] rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-3">Kluczowe punkty</h2>
              <ul className="space-y-2">
                {content.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm flex-shrink-0">
                      {i + 1}
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {content.sections && content.sections.map((section, i) => (
            <div key={i} className="bg-[var(--background)] rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-3">{section.title}</h2>
              <p className="whitespace-pre-wrap">{section.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[var(--background)] rounded-xl p-12 text-center">
          <FileText size={48} className="mx-auto text-[var(--muted-foreground)] mb-4" />
          <p className="text-[var(--muted-foreground)]">
            Notatki nie są jeszcze dostępne dla tego materiału.
          </p>
        </div>
      )}
    </div>
  );
}
