import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FileAudio, FileText, Brain, Layers, ArrowLeft, Loader2, Clock } from "lucide-react";

export default async function MaterialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: material } = await supabase
    .from("materials")
    .select("*")
    .eq("id", id)
    .eq("teacher_id", user!.id)
    .single();

  if (!material) notFound();

  const [
    { data: transcription },
    { data: notes },
    { data: quizzes },
    { data: flashcards },
  ] = await Promise.all([
    supabase.from("transcriptions").select("*").eq("material_id", id).single(),
    supabase.from("notes").select("*").eq("material_id", id),
    supabase.from("quizzes").select("*").eq("material_id", id),
    supabase.from("flashcard_decks").select("*").eq("material_id", id),
  ]);

  const statusConfig = {
    pending: { label: "Oczekuje", color: "bg-gray-500/10 text-gray-500", icon: Clock },
    processing: { label: "Przetwarzanie", color: "bg-yellow-500/10 text-yellow-500", icon: Loader2 },
    completed: { label: "Gotowy", color: "bg-green-500/10 text-green-500", icon: null },
    failed: { label: "Błąd", color: "bg-red-500/10 text-red-500", icon: null },
  };

  const status = statusConfig[material.status as keyof typeof statusConfig];

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6">
        <ArrowLeft size={20} />
        Powrót do panelu
      </Link>

      <div className="bg-[var(--background)] rounded-xl p-6 shadow-sm mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
            <FileAudio size={28} />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{material.title}</h1>
            {material.description && (
              <p className="text-[var(--muted-foreground)] mb-3">{material.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded ${status.color}`}>
                {status.icon && <status.icon size={14} className={material.status === "processing" ? "animate-spin" : ""} />}
                {status.label}
              </span>
              <span className="text-[var(--muted-foreground)]">
                {new Date(material.created_at).toLocaleDateString("pl-PL")}
              </span>
            </div>
          </div>
        </div>

        {material.audio_url && (
          <div className="mt-6 p-4 bg-[var(--muted)] rounded-lg">
            <audio controls className="w-full" src={material.audio_url}>
              Twoja przeglądarka nie obsługuje odtwarzacza audio.
            </audio>
          </div>
        )}
      </div>

      {material.status === "processing" && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 text-center mb-6">
          <Loader2 size={32} className="animate-spin mx-auto text-yellow-500 mb-3" />
          <h3 className="font-semibold mb-1">Przetwarzanie w toku</h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            AI transkrybuje audio i generuje materiały. To może potrwać kilka minut.
          </p>
        </div>
      )}

      {material.status === "completed" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Link href={`/dashboard/learn/${id}/transcription`} className="bg-[var(--background)] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <FileText size={24} className="text-blue-500 mb-3" />
            <h3 className="font-semibold mb-1">Transkrypcja</h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              {transcription?.word_count || 0} słów
            </p>
          </Link>

          <Link href={`/dashboard/learn/${id}/notes`} className="bg-[var(--background)] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <FileText size={24} className="text-green-500 mb-3" />
            <h3 className="font-semibold mb-1">Notatki</h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              {notes?.length || 0} wersji
            </p>
          </Link>

          <Link href={`/dashboard/learn/${id}/quiz`} className="bg-[var(--background)] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <Brain size={24} className="text-purple-500 mb-3" />
            <h3 className="font-semibold mb-1">Quizy</h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              {quizzes?.length || 0} quizów
            </p>
          </Link>

          <Link href={`/dashboard/learn/${id}/flashcards`} className="bg-[var(--background)] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <Layers size={24} className="text-orange-500 mb-3" />
            <h3 className="font-semibold mb-1">Flashcards</h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              {flashcards?.length || 0} talii
            </p>
          </Link>
        </div>
      )}

      {transcription && (
        <div className="bg-[var(--background)] rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Transkrypcja</h2>
          <div className="prose prose-sm max-w-none text-[var(--foreground)]">
            <p className="whitespace-pre-wrap">{transcription.content}</p>
          </div>
        </div>
      )}
    </div>
  );
}
