# CLAUDE.md - Przewodnik dla Asystentów AI

## Przegląd Projektu

**potrzebny.ai** to pełnostackowa platforma edukacyjna wykorzystująca AI do automatycznego generowania materiałów do nauki (notatki, quizy, fiszki) z nagrań audio wykładów. Projekt jest skierowany do polskiego sektora edukacji, zdrowia i badań, z naciskiem na dostępność i wsparcie różnych stylów uczenia się (ADHD, dysleksja, wzrokowcy, słuchowcy).

### Kluczowe Funkcjonalności
- Transkrypcja audio w języku polskim (OpenAI Whisper)
- Generowanie notatek dostosowanych do stylu uczenia się
- Automatyczne tworzenie quizów i fiszek
- System subskrypcji z płatnościami Stripe
- Integracja z Google Drive (plan Team)

## Stos Technologiczny

| Warstwa | Technologia | Wersja |
|---------|-------------|--------|
| Framework | Next.js (App Router) | 15.0 |
| Frontend | React | 19.0 |
| Język | TypeScript | 5.6 |
| Stylowanie | Tailwind CSS | 4.0 |
| Baza danych | Supabase (PostgreSQL) | - |
| Autoryzacja | Supabase Auth (SSR) | 0.5.0 |
| AI | OpenAI (Whisper, GPT-4o-mini) | - |
| Płatności | Stripe | 16.12 |
| Ikony | Lucide React | 0.460 |

## Szybkie Komendy

```bash
npm run dev      # Serwer developerski na localhost:3000
npm run build    # Build produkcyjny
npm run start    # Uruchom serwer produkcyjny
npm run lint     # Sprawdź kod ESLint
```

## Struktura Projektu

```
/src
├── /app                     # Next.js App Router
│   ├── /api                 # Endpointy API
│   │   ├── /stripe          # Płatności (checkout, portal, webhook)
│   │   │   ├── /checkout    # POST - tworzenie sesji płatności
│   │   │   ├── /portal      # GET - portal zarządzania subskrypcją
│   │   │   └── /webhook     # POST - obsługa zdarzeń Stripe
│   │   └── /transcribe      # POST - przetwarzanie audio i generowanie AI
│   ├── /auth                # Strony autoryzacji
│   │   ├── /login           # Logowanie
│   │   ├── /register        # Rejestracja
│   │   └── /callback        # OAuth callback (Google)
│   ├── /dashboard           # Chronione trasy
│   │   ├── /materials       # Upload i zarządzanie nagraniami
│   │   │   └── /[id]        # Szczegóły materiału
│   │   ├── /learn           # Przeglądarka materiałów
│   │   │   └── /[id]        # Widok nauki
│   │   │       ├── /notes       # Notatki
│   │   │       ├── /quiz        # Quiz
│   │   │       └── /flashcards  # Fiszki
│   │   └── /settings        # Ustawienia użytkownika
│   ├── page.tsx             # Landing page
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Style globalne i zmienne CSS
│
├── /components              # Komponenty React
│   ├── /landing             # Sekcje landing page
│   │   ├── Header.tsx       # Nawigacja główna
│   │   ├── Hero.tsx         # Sekcja hero
│   │   ├── TabsSection.tsx  # Zakładki z funkcjami
│   │   ├── Pricing.tsx      # Cennik
│   │   └── Footer.tsx       # Stopka
│   ├── /dashboard           # Komponenty dashboardu
│   │   └── DashboardNav.tsx # Nawigacja boczna
│   └── /ui                  # Komponenty UI
│       └── button.tsx       # Przycisk (warianty)
│
├── /lib                     # Biblioteki i konfiguracje
│   ├── /supabase            # Klienty Supabase
│   │   ├── server.ts        # Klient serwerowy (SSR)
│   │   ├── client.ts        # Klient przeglądarkowy
│   │   └── middleware.ts    # Helper dla middleware
│   ├── /stripe              # Integracja Stripe
│   │   ├── server.ts        # Instancja Stripe
│   │   ├── client.ts        # Loader Stripe.js
│   │   └── config.ts        # Konfiguracja planów
│   └── utils.ts             # Funkcje pomocnicze (cn)
│
├── /types                   # Definicje TypeScript
│   └── database.ts          # Typy schematu Supabase
│
└── middleware.ts            # Middleware autoryzacji

/supabase
└── /migrations              # Migracje bazy danych
```

## Tryby Uczenia Się (Learning Modes)

Aplikacja wspiera 5 trybów uczenia się, które wpływają na sposób generowania notatek:

| Tryb | Opis | Styl Notatek |
|------|------|--------------|
| `standard` | Domyślny tryb | Strukturyzowane notatki z sekcjami |
| `adhd` | Dla osób z ADHD | Krótkie sekcje, bullet pointy, emoji |
| `dyslexia` | Dla osób z dysleksją | Prosty język, krótkie zdania, duże odstępy |
| `visual` | Dla wzrokowców | Diagramy ASCII, tabele, wizualizacje |
| `auditory` | Dla słuchowców | Forma dialogu, opowieści, mnemotechniki |

### Przykład Promptów dla Trybów

```typescript
const modePrompts: Record<string, string> = {
  standard: "Stwórz strukturyzowane notatki z podanej transkrypcji wykładu.",
  adhd: "Stwórz krótkie, zwięzłe notatki z podziałem na małe sekcje. Używaj bullet pointów i emoji dla lepszej koncentracji.",
  dyslexia: "Stwórz notatki używając prostego języka, krótkich zdań i dużych odstępów między sekcjami.",
  visual: "Stwórz notatki z diagramami ASCII, tabelami i wizualnymi reprezentacjami pojęć.",
  auditory: "Stwórz notatki w formie dialogu i opowieści, z mnemotechnikami.",
};
```

## Plany Subskrypcji

| Plan | Cena | Transkrypcja | Tryby Uczenia | Kluczowe Funkcje |
|------|------|--------------|---------------|------------------|
| **Starter** | 29 PLN/mies. | 5 godzin | 1 | Notatki AI, Quizy |
| **Pro** | 49 PLN/mies. | 20 godzin | 5 | + Fiszki, Google Drive |
| **Team** | 79 PLN/mies. | Bez limitu | 5 | + Panel nauczyciela, API |

## Schemat Bazy Danych

### Główne Tabele

```
profiles          - Konta użytkowników, subskrypcje, preferencje
├── id            (UUID, PK)
├── email         (string)
├── role          (student/teacher/admin)
├── learning_mode (standard/adhd/dyslexia/visual/auditory)
├── subscription_tier   (free/starter/pro/team)
└── stripe_customer_id  (string, nullable)

materials         - Pliki audio
├── id            (UUID, PK)
├── teacher_id    (UUID, FK -> profiles)
├── title         (string)
├── audio_url     (string, Supabase Storage)
├── status        (pending/processing/completed/failed)
└── course_id     (UUID, FK -> courses, nullable)

transcriptions    - Transkrypcje z Whisper
├── material_id   (UUID, FK -> materials)
├── content       (text)
├── language      (string, default: "pl")
└── word_count    (integer)

notes             - Notatki AI
├── material_id   (UUID, FK -> materials)
├── learning_mode (enum)
└── content       (JSON - title, summary, sections, keyPoints)

quizzes           - Quizy
├── material_id   (UUID, FK -> materials)
├── title         (string)
└── questions     (JSON - question, options, correctAnswer, explanation)

flashcard_decks   - Zestawy fiszek
├── material_id   (UUID, FK -> materials)
├── title         (string)
└── cards         (JSON - front, back)
```

### Struktury JSON

**Notatki (`notes.content`):**
```json
{
  "title": "Tytuł notatek",
  "summary": "Krótkie podsumowanie",
  "sections": [
    { "title": "Sekcja 1", "content": "Treść..." }
  ],
  "keyPoints": ["Punkt 1", "Punkt 2"]
}
```

**Quiz (`quizzes.questions`):**
```json
[
  {
    "question": "Pytanie?",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "explanation": "Wyjaśnienie..."
  }
]
```

**Fiszki (`flashcard_decks.cards`):**
```json
[
  { "front": "Pojęcie", "back": "Definicja" }
]
```

## Przepływy Pracy

### Pipeline Przetwarzania Audio

```
1. Upload pliku audio (MP3, WAV, M4A, OGG)
   └─> POST /api/transcribe { materialId }
       │
2. Zapisanie w Supabase Storage (bucket: audio)
       │
3. Status materiału: "processing"
       │
4. OpenAI Whisper API (język: pl)
   └─> Transkrypcja zapisana w tabeli transcriptions
       │
5. GPT-4o-mini (równoległe wywołania)
   ├─> generateNotes() -> tabela notes
   ├─> generateQuiz()  -> tabela quizzes
   └─> generateFlashcards() -> tabela flashcard_decks
       │
6. Status materiału: "completed"
```

### Przepływ Autoryzacji

```
Request
   │
   └─> middleware.ts (sprawdzenie sesji)
       ├─> /dashboard/* → wymaga zalogowania
       │   └─> Brak sesji → redirect /auth/login
       │
       └─> /auth/* → wymaga wylogowania
           └─> Jest sesja → redirect /dashboard
```

### Przepływ Płatności Stripe

```
1. Użytkownik wybiera plan
   └─> POST /api/stripe/checkout { priceId }
       │
2. Stripe Checkout Session
   └─> Redirect do strony płatności Stripe
       │
3. Płatność zakończona
   └─> Webhook: checkout.session.completed
       └─> Aktualizacja profiles.subscription_tier
           │
4. Zarządzanie subskrypcją
   └─> GET /api/stripe/portal
       └─> Redirect do Customer Portal
```

## Konwencje Kodu

### TypeScript
- Strict mode włączony
- Path alias: `@/*` mapuje do `./src/*`
- Wszystkie typy bazy w `/src/types/database.ts`
- Używaj type inference gdzie możliwe

### Użycie Typów

```typescript
import type { Database, LearningMode, MaterialStatus } from '@/types/database';

// Typ wiersza tabeli
type Profile = Database['public']['Tables']['profiles']['Row'];
type Material = Database['public']['Tables']['materials']['Row'];

// Użycie enumów
const mode: LearningMode = 'adhd';
const status: MaterialStatus = 'processing';
```

### Stylowanie (Tailwind CSS)
- Używaj klas utility Tailwind
- Zmienne CSS w `globals.css` dla motywów
- Używaj `cn()` z `/lib/utils.ts` dla warunkowych klas
- Wsparcie light/dark mode przez `prefers-color-scheme`

```typescript
import { cn } from '@/lib/utils';

// Przykład użycia cn()
<button className={cn(
  "px-4 py-2 rounded",
  isActive && "bg-indigo-600 text-white",
  disabled && "opacity-50 cursor-not-allowed"
)}>
```

### API Routes

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // 1. Sprawdź autoryzację
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Nieautoryzowany' },
        { status: 401 }
      );
    }

    // 2. Przetwórz request
    const body = await request.json();

    // 3. Logika biznesowa...

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}
```

### Nazewnictwo Plików
- Komponenty: PascalCase (`DashboardNav.tsx`)
- Utilities: camelCase (`utils.ts`)
- Strony/Routes: lowercase (konwencja Next.js)

## Typowe Zadania

### Dodanie Nowej Strony Dashboard

```bash
# 1. Utwórz folder
mkdir -p src/app/dashboard/nowa-strona

# 2. Utwórz page.tsx
```

```typescript
// src/app/dashboard/nowa-strona/page.tsx
import { createClient } from '@/lib/supabase/server';

export default async function NowaStronaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Pobierz dane...

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Nowa Strona</h1>
      {/* Zawartość */}
    </div>
  );
}
```

```typescript
// 3. Dodaj link w DashboardNav.tsx
{ name: 'Nowa Strona', href: '/dashboard/nowa-strona', icon: Icon }
```

### Dodanie Nowego API Endpoint

```typescript
// src/app/api/nowy-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  // ...
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  // ...
}
```

### Dodanie Nowego Komponentu UI

```typescript
// src/components/ui/card.tsx
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn(
      "bg-white rounded-lg shadow-md p-6",
      "dark:bg-gray-800",
      className
    )}>
      {children}
    </div>
  );
}
```

## Zmienne Środowiskowe

Utwórz plik `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # TYLKO server-side!

# OpenAI
OPENAI_API_KEY=sk-...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_TEAM_PRICE_ID=price_...
```

## Ważne Uwagi

### Język
- Cały UI jest w **języku polskim**
- Prompty OpenAI generują treści po polsku
- Wszystkie komunikaty błędów po polsku
- Transkrypcja Whisper: `language: "pl"`

### Bezpieczeństwo
- **NIGDY** nie eksponuj `SUPABASE_SERVICE_ROLE_KEY` do klienta
- Waliduj wszystkie dane wejściowe
- Używaj Row Level Security (RLS) w Supabase
- Weryfikuj sygnatury webhooków Stripe
- Sprawdzaj autoryzację w każdym API route

### Wydajność
- Używaj React Server Components gdzie możliwe
- Lazy load ciężkich komponentów
- Optymalizuj obrazy przez Next.js Image
- Domena Supabase w allowlist (`next.config.ts`)
- Równoległe wywołania AI w pipeline

## Debugowanie

| Problem | Gdzie szukać |
|---------|--------------|
| Błędy client-side | Konsola przeglądarki (DevTools) |
| Błędy server-side | Terminal (npm run dev) |
| Problemy z auth | Supabase Dashboard → Authentication |
| Problemy z bazą | Supabase Dashboard → Table Editor |
| Błędy płatności | Stripe Dashboard → Logs/Events |
| Błędy AI | OpenAI Dashboard → Usage |

### Typowe Błędy

```bash
# "Unauthorized" w API
→ Sprawdź czy middleware.ts przepuszcza trasę
→ Sprawdź czy sesja jest prawidłowa

# "Transcription failed"
→ Sprawdź format audio (MP3, WAV, M4A, OGG)
→ Sprawdź OPENAI_API_KEY
→ Sprawdź limity API OpenAI

# Webhook nie działa
→ Sprawdź STRIPE_WEBHOOK_SECRET
→ W dev użyj: stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Referencje Plików

| Cel | Ścieżka |
|-----|---------|
| Root layout | `/src/app/layout.tsx` |
| Middleware auth | `/src/middleware.ts` |
| Typy bazy danych | `/src/types/database.ts` |
| Klient Supabase (server) | `/src/lib/supabase/server.ts` |
| Klient Supabase (browser) | `/src/lib/supabase/client.ts` |
| Konfiguracja Stripe | `/src/lib/stripe/config.ts` |
| Pipeline transkrypcji | `/src/app/api/transcribe/route.ts` |
| Webhook Stripe | `/src/app/api/stripe/webhook/route.ts` |
| Style globalne | `/src/app/globals.css` |
| Komponent Button | `/src/components/ui/button.tsx` |
| Nawigacja dashboard | `/src/components/dashboard/DashboardNav.tsx` |

## Rozwój Projektu - Planowane Funkcje

- [ ] Eksport notatek do PDF
- [ ] Integracja z Google Drive
- [ ] Panel nauczyciela (tworzenie kursów)
- [ ] Analityka postępów ucznia
- [ ] API publiczne (plan Team)
- [ ] Aplikacja mobilna (React Native)
