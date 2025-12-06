import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FileAudio, BookOpen } from "lucide-react";

export default async function LearnPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: materials } = await supabase
    .from("materials")
    .select("*")
    .eq("teacher_id", user!.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Nauka</h1>
        <p className="text-[var(--muted-foreground)]">
          Wybierz materiał, aby rozpocząć naukę
        </p>
      </div>

      {materials && materials.length > 0 ? (
        <div className="grid gap-4">
          {materials.map((material) => (
            <Link
              key={material.id}
              href={`/dashboard/materials/${material.id}`}
              className="bg-[var(--background)] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                <FileAudio size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{material.title}</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {new Date(material.created_at).toLocaleDateString("pl-PL")}
                </p>
              </div>
              <span className="text-[var(--primary)]">
                <BookOpen size={20} />
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-[var(--background)] rounded-xl p-12 text-center">
          <BookOpen size={48} className="mx-auto text-[var(--muted-foreground)] mb-4" />
          <h3 className="font-semibold mb-2">Brak materiałów do nauki</h3>
          <p className="text-[var(--muted-foreground)] mb-4">
            Wgraj pierwszy materiał, aby rozpocząć naukę
          </p>
          <Link
            href="/dashboard/materials"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]"
          >
            Dodaj materiał
          </Link>
        </div>
      )}
    </div>
  );
}
