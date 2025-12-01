import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FileAudio,
  BookOpen,
  Brain,
  TrendingUp,
  Upload,
  Clock,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  // Get recent materials
  const { data: materials } = await supabase
    .from("materials")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  // Get stats
  const { count: materialsCount } = await supabase
    .from("materials")
    .select("*", { count: "exact", head: true });

  const { count: quizAttemptsCount } = await supabase
    .from("quiz_attempts")
    .select("*", { count: "exact", head: true })
    .eq("student_id", user!.id);

  const stats = [
    {
      label: "Materiały",
      value: materialsCount || 0,
      icon: FileAudio,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Ukończone quizy",
      value: quizAttemptsCount || 0,
      icon: Brain,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Godziny nauki",
      value: "0",
      icon: Clock,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Postęp tygodnia",
      value: "0%",
      icon: TrendingUp,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ];

  const learningModeLabels: Record<string, string> = {
    standard: "Standardowy",
    adhd: "ADHD",
    dyslexia: "Dysleksja",
    visual: "Wzrokowiec",
    auditory: "Słuchowiec",
  };

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Witaj, {profile?.full_name?.split(" ")[0] || "Użytkowniku"}!
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Tryb nauki: {learningModeLabels[profile?.learning_mode || "standard"]}
          </p>
        </div>
        <Link href="/dashboard/materials">
          <Button>
            <Upload size={18} className="mr-2" />
            Dodaj materiał
          </Button>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-[var(--background)] rounded-xl p-6 shadow-sm"
          >
            <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color} mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-[var(--muted-foreground)]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/dashboard/materials"
          className="bg-[var(--background)] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group"
        >
          <div className="w-12 h-12 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] mb-4 group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
            <Upload size={24} />
          </div>
          <h3 className="font-semibold mb-1">Wgraj materiał</h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            Dodaj nagranie wykładu lub podłącz Google Drive
          </p>
        </Link>

        <Link
          href="/dashboard/learn"
          className="bg-[var(--background)] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group"
        >
          <div className="w-12 h-12 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] mb-4 group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
            <BookOpen size={24} />
          </div>
          <h3 className="font-semibold mb-1">Rozpocznij naukę</h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            Przeglądaj notatki, quizy i flashcards
          </p>
        </Link>

        <Link
          href="/dashboard/settings"
          className="bg-[var(--background)] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group"
        >
          <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 mb-4 group-hover:bg-green-500 group-hover:text-white transition-colors">
            <Brain size={24} />
          </div>
          <h3 className="font-semibold mb-1">Tryb nauki</h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            Dostosuj materiały do swojego stylu
          </p>
        </Link>
      </div>

      {/* Recent materials */}
      <div className="bg-[var(--background)] rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Ostatnie materiały</h2>
          <Link
            href="/dashboard/materials"
            className="text-sm text-[var(--primary)] hover:underline"
          >
            Zobacz wszystkie
          </Link>
        </div>

        {materials && materials.length > 0 ? (
          <div className="space-y-4">
            {materials.map((material) => (
              <Link
                key={material.id}
                href={`/dashboard/materials/${material.id}`}
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-[var(--secondary)] transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                  <FileAudio size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{material.title}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {new Date(material.created_at).toLocaleDateString("pl-PL")}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    material.status === "completed"
                      ? "bg-green-500/10 text-green-500"
                      : material.status === "processing"
                      ? "bg-yellow-500/10 text-yellow-500"
                      : material.status === "failed"
                      ? "bg-red-500/10 text-red-500"
                      : "bg-gray-500/10 text-gray-500"
                  }`}
                >
                  {material.status === "completed"
                    ? "Gotowy"
                    : material.status === "processing"
                    ? "Przetwarzanie"
                    : material.status === "failed"
                    ? "Błąd"
                    : "Oczekuje"}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileAudio size={48} className="mx-auto text-[var(--muted-foreground)] mb-4" />
            <p className="text-[var(--muted-foreground)] mb-4">
              Nie masz jeszcze żadnych materiałów
            </p>
            <Link href="/dashboard/materials">
              <Button>Dodaj pierwszy materiał</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
