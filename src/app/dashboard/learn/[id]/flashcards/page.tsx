"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Layers, RotateCcw, ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Card {
  front: string;
  back: string;
}

export default function FlashcardsPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [deck, setDeck] = useState<{ id: string; title: string; cards: Card[] } | null>(null);
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<boolean[]>([]);

  useEffect(() => {
    async function loadFlashcards() {
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
        .from("flashcard_decks")
        .select("*")
        .eq("material_id", id)
        .single();

      if (data) {
        setDeck({
          id: data.id,
          title: data.title,
          cards: data.cards as Card[],
        });
        setKnown(new Array((data.cards as Card[]).length).fill(false));
      }
      setLoading(false);
    }
    loadFlashcards();
  }, [id, supabase, router]);

  const handleFlip = () => setFlipped(!flipped);

  const handleNext = () => {
    if (deck && currentCard < deck.cards.length - 1) {
      setCurrentCard(currentCard + 1);
      setFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setFlipped(false);
    }
  };

  const handleKnow = (know: boolean) => {
    const newKnown = [...known];
    newKnown[currentCard] = know;
    setKnown(newKnown);
    handleNext();
  };

  const handleReset = () => {
    setCurrentCard(0);
    setFlipped(false);
    setKnown(new Array(deck?.cards.length || 0).fill(false));
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Layers size={48} className="mx-auto text-[var(--muted-foreground)] animate-pulse mb-4" />
        <p>Ładowanie fiszek...</p>
      </div>
    );
  }

  if (!deck || !deck.cards.length) {
    return (
      <div className="max-w-2xl mx-auto">
        <Link href={`/dashboard/materials/${id}`} className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6">
          <ArrowLeft size={20} />
          Powrót
        </Link>
        <div className="bg-[var(--background)] rounded-xl p-12 text-center">
          <Layers size={48} className="mx-auto text-[var(--muted-foreground)] mb-4" />
          <p>Fiszki nie są jeszcze dostępne.</p>
        </div>
      </div>
    );
  }

  const card = deck.cards[currentCard];
  const knownCount = known.filter(Boolean).length;
  const progress = ((currentCard + 1) / deck.cards.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={`/dashboard/materials/${id}`} className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6">
        <ArrowLeft size={20} />
        Powrót
      </Link>

      <div className="bg-[var(--background)] rounded-xl p-6 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-[var(--muted-foreground)]">
            Fiszka {currentCard + 1} z {deck.cards.length}
          </span>
          <span className="text-sm text-green-500">
            Umiem: {knownCount}/{deck.cards.length}
          </span>
        </div>

        <div className="h-2 bg-[var(--secondary)] rounded-full overflow-hidden mb-6">
          <div className="h-full bg-[var(--primary)] transition-all" style={{ width: `${progress}%` }} />
        </div>

        {/* Flashcard */}
        <div
          onClick={handleFlip}
          className="relative h-64 cursor-pointer perspective-1000"
        >
          <div
            className={cn(
              "absolute inset-0 rounded-xl p-6 flex items-center justify-center text-center transition-all duration-500 preserve-3d",
              flipped ? "rotate-y-180" : ""
            )}
          >
            {/* Front */}
            <div className={cn(
              "absolute inset-0 rounded-xl p-6 flex items-center justify-center bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white backface-hidden",
              flipped ? "invisible" : ""
            )}>
              <p className="text-xl font-medium">{card.front}</p>
            </div>

            {/* Back */}
            <div className={cn(
              "absolute inset-0 rounded-xl p-6 flex items-center justify-center bg-[var(--secondary)] backface-hidden rotate-y-180",
              !flipped ? "invisible" : ""
            )}>
              <p className="text-lg">{card.back}</p>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-[var(--muted-foreground)] mt-4 mb-6">
          Kliknij, aby obrócić fiszkę
        </p>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="sm" onClick={handlePrev} disabled={currentCard === 0}>
            <ChevronLeft size={20} />
          </Button>

          <Button variant="outline" onClick={() => handleKnow(false)} className="text-red-500 border-red-500/20 hover:bg-red-500/10">
            <X size={20} className="mr-2" />
            Nie umiem
          </Button>

          <Button onClick={() => handleKnow(true)} className="bg-green-500 hover:bg-green-600">
            <Check size={20} className="mr-2" />
            Umiem
          </Button>

          <Button variant="outline" size="sm" onClick={handleNext} disabled={currentCard === deck.cards.length - 1}>
            <ChevronRight size={20} />
          </Button>
        </div>

        <div className="flex justify-center mt-6">
          <Button variant="ghost" onClick={handleReset}>
            <RotateCcw size={16} className="mr-2" />
            Zacznij od nowa
          </Button>
        </div>
      </div>

      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
