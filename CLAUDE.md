# CLAUDE.md - AI Assistant Guide for potrzebny.ai

## Project Overview

**potrzebny.ai** is a Polish-language SaaS platform that helps students, teachers, and researchers learn more effectively using AI-powered tools. The platform converts audio lectures into transcriptions, generates adaptive study notes, quizzes, and flashcards tailored to different learning modes (including accessibility-focused modes for ADHD and dyslexia).

## Tech Stack

- **Framework**: Next.js 15.0.0 with App Router
- **React**: 19.0.0
- **TypeScript**: 5.6.0 (strict mode enabled)
- **Styling**: Tailwind CSS 4.0.0 with PostCSS
- **Database**: Supabase (PostgreSQL with Row-Level Security)
- **Authentication**: Supabase Auth (email/password + Google OAuth)
- **Payments**: Stripe (subscriptions)
- **AI Services**: OpenAI (Whisper for transcription, GPT-4o-mini for content generation)
- **Icons**: Lucide React

## Directory Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API route handlers
│   │   ├── stripe/           # Payment endpoints (checkout, portal, webhook)
│   │   └── transcribe/       # AI transcription pipeline
│   ├── auth/                 # Authentication pages (login, register, callback)
│   ├── dashboard/            # Protected user dashboard
│   │   ├── materials/        # Audio upload & management
│   │   ├── learn/            # Learning modules (notes, quiz, flashcards)
│   │   └── settings/         # User settings & subscription
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Landing page
│   └── globals.css           # Global styles & CSS variables
├── components/
│   ├── ui/                   # Reusable base components (Button, etc.)
│   ├── landing/              # Landing page sections
│   └── dashboard/            # Dashboard components (DashboardNav)
├── lib/
│   ├── supabase/             # Supabase client setup (client, server, middleware)
│   ├── stripe/               # Stripe config & clients
│   └── utils.ts              # Utility functions (cn for className merging)
├── types/
│   └── database.ts           # TypeScript interfaces for database tables
└── middleware.ts             # Next.js auth middleware

supabase/
└── migrations/               # Database schema migrations
    └── 001_initial_schema.sql
```

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Key Conventions

### Import Aliases
Use `@/` for imports from `src/`:
```typescript
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
```

### Component Organization
- **Server Components**: Default for pages, can directly access database
- **Client Components**: Add `"use client"` directive for interactivity, forms, state
- Use `cn()` utility for conditional classNames:
```typescript
import { cn } from "@/lib/utils";
className={cn("base-class", condition && "conditional-class")}
```

### File Naming
- Components: PascalCase (`Button.tsx`, `DashboardNav.tsx`)
- Utilities/hooks: camelCase (`utils.ts`, `useAuth.ts`)
- Pages: `page.tsx` (Next.js convention)
- Route handlers: `route.ts`

### TypeScript
- Strict mode is enabled
- Use types from `@/types/database.ts` for database operations
- Define explicit return types for functions
- Use `as const` for constant objects

## Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles linked to Supabase auth.users |
| `courses` | Teacher-created course containers |
| `enrollments` | Student-course relationships |
| `materials` | Audio files with processing status |
| `transcriptions` | AI-generated transcription content |
| `notes` | Learning-mode specific study notes (JSONB) |
| `quizzes` | Auto-generated quiz questions (JSONB) |
| `quiz_attempts` | Student quiz submissions & scores |
| `flashcard_decks` | Study cards (JSONB array of {front, back}) |
| `flashcard_progress` | SM-2 spaced repetition tracking |

### Key Enums (defined in TypeScript and PostgreSQL)
```typescript
type LearningMode = "standard" | "adhd" | "dyslexia" | "visual" | "auditory";
type SubscriptionTier = "free" | "starter" | "pro" | "team";
type SubscriptionStatus = "inactive" | "active" | "canceled" | "past_due";
type UserRole = "student" | "teacher" | "admin";
type MaterialStatus = "pending" | "processing" | "completed" | "failed";
```

### Row-Level Security
All tables have RLS enabled. Access patterns:
- Users can only read/write their own data
- Teachers manage their own courses and materials
- Students access enrolled course materials only

## API Routes

### POST `/api/stripe/checkout`
Creates Stripe checkout session for subscription upgrades.
```typescript
Body: { planKey: "starter" | "pro" | "team" }
Returns: { sessionId: string, url: string }
```

### POST `/api/stripe/portal`
Redirects to Stripe customer billing portal.
```typescript
Returns: { url: string }
```

### POST `/api/stripe/webhook`
Handles Stripe events (checkout completion, subscription updates, payment failures).

### POST `/api/transcribe`
Triggers async transcription and content generation pipeline.
```typescript
Body: { materialId: string }
Process: Audio → Whisper → GPT-4o-mini → (transcription + notes + quiz + flashcards)
```

## Supabase Client Usage

### Server Components (RSC)
```typescript
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase.from("profiles").select("*").single();
}
```

### Client Components
```typescript
"use client";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
```

### API Routes (with service role)
```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

## Environment Variables

### Public (browser-accessible)
```
NEXT_PUBLIC_SUPABASE_URL        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   # Supabase anonymous key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  # Stripe public key
```

### Secret (server-only)
```
SUPABASE_SERVICE_ROLE_KEY       # Supabase admin key (webhooks, transcription)
STRIPE_SECRET_KEY               # Stripe secret key
STRIPE_WEBHOOK_SECRET           # Stripe webhook signature verification
STRIPE_STARTER_PRICE_ID         # Stripe price ID for Starter plan
STRIPE_PRO_PRICE_ID             # Stripe price ID for Pro plan
STRIPE_TEAM_PRICE_ID            # Stripe price ID for Team plan
OPENAI_API_KEY                  # OpenAI API key (Whisper + GPT)
```

## Learning Modes System

The platform adapts content for different learning needs:

| Mode | Description |
|------|-------------|
| `standard` | Classic structured notes with sections |
| `adhd` | Short sections, bullet points, visual markers |
| `dyslexia` | Simple language, increased spacing |
| `visual` | ASCII diagrams, tables, schematics |
| `auditory` | Narrative format, mnemonics, verbal cues |

## Subscription Tiers

| Tier | Transcription | Learning Modes |
|------|---------------|----------------|
| `free` | None | N/A |
| `starter` | 5 hrs/month | 1 mode |
| `pro` | 20 hrs/month | All 5 modes |
| `team` | Unlimited | All 5 modes + teacher features |

## Common Patterns

### Protected Page Pattern
```typescript
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // ... rest of component
}
```

### Form Handling Pattern (Client Component)
```typescript
"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function FormComponent() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // ... Supabase operations
    setLoading(false);
  };
}
```

### Material Processing Pipeline
1. User uploads audio → material created with `status: "pending"`
2. Frontend calls `/api/transcribe` with materialId
3. API updates status to `"processing"`
4. Whisper transcribes audio → stores in `transcriptions`
5. GPT-4o-mini generates notes, quiz, flashcards
6. Status updated to `"completed"` (or `"failed"` on error)

## UI Styling

### CSS Variables (in globals.css)
```css
--background, --foreground
--primary, --primary-foreground
--secondary, --accent, --muted
--border, --ring
```

### Tailwind Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px

### Button Variants
```typescript
<Button variant="primary" size="md">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
```

## Language

The UI is primarily in **Polish**. Keep user-facing text in Polish unless specifically requested otherwise. Variable names, code comments, and technical documentation should remain in English.

## Testing

No testing framework is currently configured. When adding tests, consider:
- Jest or Vitest for unit tests
- Playwright or Cypress for E2E tests
- React Testing Library for component tests

## Notes for AI Assistants

1. **Database operations**: Always use typed Supabase clients from `@/lib/supabase/`
2. **Auth checks**: Verify user authentication in protected routes/API handlers
3. **RLS awareness**: Database queries automatically filter by user due to RLS policies
4. **Learning modes**: Content generation should respect user's `learning_mode` preference
5. **Polish UI**: Keep user-facing strings in Polish
6. **No testing**: Be extra careful with changes since there's no test coverage
7. **Async processing**: Material transcription is fire-and-forget; handle status polling on frontend
