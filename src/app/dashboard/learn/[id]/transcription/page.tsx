import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Clock } from "lucide-react";
import { CopyButton, DownloadButton } from "@/components/ui/transcription-actions";

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

  // Oblicz przybliżony czas czytania (200 słów/min)
  const readingTime = transcription?.word_count
    ? Math.ceil(transcription.word_count / 200)
    : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href={`/dashboard/materials/${id}`}
        className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6"
      >
        <ArrowLeft size={20} />
        Powrót do materiału
      </Link>

      <div className="bg-[var(--background)] rounded-xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText size={24} className="text-blue-500" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Transkrypcja: {material.title}</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--muted-foreground)]">
          {transcription?.word_count && (
            <span className="flex items-center gap-1">
              <FileText size={16} />
              {transcription.word_count.toLocaleString("pl-PL")} słów
            </span>
          )}
          {readingTime > 0 && (
            <span className="flex items-center gap-1">
              <Clock size={16} />
              ~{readingTime} min czytania
            </span>
          )}
          {transcription?.language && (
            <span className="px-2 py-1 bg-[var(--secondary)] rounded text-xs uppercase">
              {transcription.language}
            </span>
          )}
        </div>
      </div>

      {transcription ? (
        <div className="bg-[var(--background)] rounded-xl shadow-sm">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <span className="text-sm font-medium">Treść transkrypcji</span>
            <div className="flex items-center gap-2">
              <CopyButton text={transcription.content} />
              <DownloadButton
                text={transcription.content}
                filename={`${material.title}-transkrypcja.txt`}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="prose prose-sm max-w-none text-[var(--foreground)]">
              <p className="whitespace-pre-wrap leading-relaxed">{transcription.content}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--background)] rounded-xl p-12 text-center">
          <FileText size={48} className="mx-auto text-[var(--muted-foreground)] mb-4" />
          <h3 className="font-semibold mb-2">Transkrypcja niedostępna</h3>
          <p className="text-[var(--muted-foreground)]">
            Transkrypcja nie została jeszcze wygenerowana dla tego materiału.
          </p>
        </div>
      )}
    </div>
  );
}
