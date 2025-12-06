"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain, CheckCircle, XCircle, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<{ id: string; title: string; questions: Question[] } | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    async function loadQuiz() {
      // Verify user owns the material first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: material } = await supabase
        .from("materials")
        .select("id")
        .eq("id", id)
        .eq("teacher_id", user.id)
        .single();

      if (!material) {
        router.push("/dashboard");
        return;
      }

      const { data } = await supabase
        .from("quizzes")
        .select("*")
        .eq("material_id", id)
        .single();

      if (data) {
        setQuiz({
          id: data.id,
          title: data.title,
          questions: data.questions as Question[],
        });
      }
      setLoading(false);
    }
    loadQuiz();
  }, [id, supabase, router]);

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleNext = async () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Quiz finished
      setFinished(true);

      // Save attempt
      const { data: { user } } = await supabase.auth.getUser();
      if (user && quiz) {
        const score = newAnswers.filter((a, i) => a === quiz.questions[i].correctAnswer).length;
        await supabase.from("quiz_attempts").insert({
          quiz_id: quiz.id,
          student_id: user.id,
          answers: newAnswers,
          score,
          max_score: quiz.questions.length,
        });
      }
    }
  };

  const handleCheck = () => {
    setShowResult(true);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Brain size={48} className="mx-auto text-[var(--muted-foreground)] animate-pulse mb-4" />
        <p>Ładowanie quizu...</p>
      </div>
    );
  }

  if (!quiz || !quiz.questions.length) {
    return (
      <div className="max-w-2xl mx-auto">
        <Link href={`/dashboard/materials/${id}`} className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6">
          <ArrowLeft size={20} />
          Powrót
        </Link>
        <div className="bg-[var(--background)] rounded-xl p-12 text-center">
          <Brain size={48} className="mx-auto text-[var(--muted-foreground)] mb-4" />
          <p>Quiz nie jest jeszcze dostępny.</p>
        </div>
      </div>
    );
  }

  if (finished) {
    const score = answers.filter((a, i) => a === quiz.questions[i].correctAnswer).length;
    const percentage = Math.round((score / quiz.questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-[var(--background)] rounded-xl p-8 text-center">
          <Trophy size={64} className={cn("mx-auto mb-4", percentage >= 70 ? "text-yellow-500" : "text-[var(--muted-foreground)]")} />
          <h2 className="text-2xl font-bold mb-2">Quiz ukończony!</h2>
          <p className="text-4xl font-bold text-[var(--primary)] mb-2">{percentage}%</p>
          <p className="text-[var(--muted-foreground)] mb-6">
            {score} z {quiz.questions.length} poprawnych odpowiedzi
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => router.push(`/dashboard/materials/${id}`)}>
              Powrót do materiału
            </Button>
            <Button onClick={() => { setCurrentQuestion(0); setAnswers([]); setFinished(false); setSelectedAnswer(null); setShowResult(false); }}>
              Spróbuj ponownie
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={`/dashboard/materials/${id}`} className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6">
        <ArrowLeft size={20} />
        Powrót
      </Link>

      <div className="bg-[var(--background)] rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm text-[var(--muted-foreground)]">
            Pytanie {currentQuestion + 1} z {quiz.questions.length}
          </span>
          <div className="h-2 flex-1 mx-4 bg-[var(--secondary)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--primary)] transition-all"
              style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-6">{question.question}</h2>

        <div className="space-y-3 mb-6">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={showResult}
              className={cn(
                "w-full text-left p-4 rounded-lg border transition-all",
                selectedAnswer === i
                  ? showResult
                    ? isCorrect
                      ? "border-green-500 bg-green-500/10"
                      : "border-red-500 bg-red-500/10"
                    : "border-[var(--primary)] bg-[var(--primary)]/10"
                  : showResult && i === question.correctAnswer
                  ? "border-green-500 bg-green-500/10"
                  : "border-[var(--border)] hover:border-[var(--primary)]/50"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[var(--secondary)] flex items-center justify-center text-sm font-medium">
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{option}</span>
                {showResult && i === question.correctAnswer && <CheckCircle size={20} className="ml-auto text-green-500" />}
                {showResult && selectedAnswer === i && !isCorrect && <XCircle size={20} className="ml-auto text-red-500" />}
              </div>
            </button>
          ))}
        </div>

        {showResult && (
          <div className={cn("p-4 rounded-lg mb-6", isCorrect ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700")}>
            <p className="font-medium mb-1">{isCorrect ? "Dobrze!" : "Niestety, to nie ta odpowiedź"}</p>
            <p className="text-sm">{question.explanation}</p>
          </div>
        )}

        <div className="flex gap-4">
          {!showResult ? (
            <Button onClick={handleCheck} disabled={selectedAnswer === null} className="flex-1">
              Sprawdź
            </Button>
          ) : (
            <Button onClick={handleNext} className="flex-1">
              {currentQuestion < quiz.questions.length - 1 ? "Następne pytanie" : "Zakończ quiz"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
