import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default async function TranscriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: material } = await supabase
    .from("materials")
    .select("*")
    .eq("id", id)
    .single();

  if (!material) notFound();

  const { data: transcription } = await supabase
    .from("transcriptions")
    .select("*")
    .eq("material_id", id)
    .single();

  return (
    <div className="max-w-4xl mx-auto">
      <Link href={`/dashboard/materials/${id}`} className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6">
        <ArrowLeft size={20} />
        Powrót do materiału
      </Link>

      <div className="bg-[var(--background)] rounded-xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText size={24} className="text-blue-500" />
          <h1 className="text-2xl font-bold">Transkrypcja: {material.title}</h1>
        </div>
        {transcription && (
          <p className="text-sm text-[var(--muted-foreground)]">
            {transcription.word_count} słów
          </p>
        )}
      </div>

      {transcription ? (
        <div className="bg-[var(--background)] rounded-xl p-6 shadow-sm">
          <div className="prose prose-sm max-w-none text-[var(--foreground)]">
            <p className="whitespace-pre-wrap leading-relaxed">{transcription.content}</p>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--background)] rounded-xl p-12 text-center">
          <FileText size={48} className="mx-auto text-[var(--muted-foreground)] mb-4" />
          <p className="text-[var(--muted-foreground)]">
            Transkrypcja nie jest jeszcze dostępna dla tego materiału.
          </p>
        </div>
      )}
    </div>
  );
}
