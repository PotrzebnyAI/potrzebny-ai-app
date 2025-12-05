# CLAUDE.md - AI Assistant Guide for potrzebny.ai

## Project Overview

**potrzebny.ai** is a full-stack AI-powered learning platform that automatically generates study materials (notes, quizzes, flashcards) from audio lectures. It targets Polish education, health, and research sectors with accessibility-first design supporting multiple learning modes (ADHD, dyslexia, visual, auditory learners).

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 15.0 |
| Frontend | React | 19.0 |
| Language | TypeScript | 5.6 |
| Styling | Tailwind CSS | 4.0 |
| Database | Supabase (PostgreSQL) | - |
| Auth | Supabase Auth (SSR) | 0.5.0 |
| AI | OpenAI (Whisper, GPT-4o-mini) | - |
| Payments | Stripe | 16.12 |
| Icons | Lucide React | 0.460 |

## Quick Commands

```bash
npm run dev      # Start development server on localhost:3000
npm run build    # Create production build
npm run start    # Run production server
npm run lint     # Run ESLint
```

## Project Structure

```
/src
├── /app                     # Next.js App Router
│   ├── /api                 # API routes
│   │   ├── /stripe          # Payment endpoints (checkout, portal, webhook)
│   │   └── /transcribe      # Audio processing & AI content generation
│   ├── /auth                # Auth pages (login, register, callback)
│   ├── /dashboard           # Protected routes
│   │   ├── /materials       # Audio upload & management
│   │   ├── /learn           # Study materials browser
│   │   │   └── /[id]        # Material detail (notes, quiz, flashcards)
│   │   └── /settings        # User preferences
│   ├── page.tsx             # Landing page
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles & CSS variables
│
├── /components              # React components
│   ├── /landing             # Landing page sections
│   ├── /dashboard           # Dashboard components
│   └── /ui                  # Reusable UI components
│
├── /lib                     # Utilities & configurations
│   ├── /supabase            # Supabase clients (server.ts, client.ts, middleware.ts)
│   ├── /stripe              # Stripe config (server.ts, client.ts, config.ts)
│   └── utils.ts             # Utility functions (cn for class merging)
│
├── /types                   # TypeScript definitions
│   └── database.ts          # Supabase schema types
│
└── middleware.ts            # Auth middleware (route protection)

/supabase
└── /migrations              # Database migrations
```

## Architecture Patterns

### Authentication Flow
1. Middleware intercepts all requests (`/src/middleware.ts`)
2. Supabase SSR handles session via cookies
3. Protected routes (`/dashboard/*`) redirect to `/auth/login` if unauthenticated
4. Auth pages redirect to `/dashboard` if already logged in
5. OAuth callback handled at `/auth/callback`

### API Route Pattern
- Server-side Supabase client: `createClient()` from `/lib/supabase/server.ts`
- Always check authentication before processing
- Return proper HTTP status codes with JSON responses

### Component Organization
- **Landing components**: `/components/landing/` - Marketing site sections
- **Dashboard components**: `/components/dashboard/` - App UI
- **UI primitives**: `/components/ui/` - Reusable building blocks

## Database Schema

### Core Tables
| Table | Purpose |
|-------|---------|
| `profiles` | User accounts, subscription tier, learning mode |
| `materials` | Audio files (status: pending/processing/completed/failed) |
| `transcriptions` | Text transcripts from audio |
| `notes` | AI-generated study notes |
| `quizzes` | Quiz questions with answers |
| `quiz_attempts` | User quiz history |
| `flashcard_decks` | Flashcard sets |
| `flashcard_progress` | Spaced repetition tracking |

### Key Enums
- **LearningMode**: `standard`, `adhd`, `dyslexia`, `visual`, `auditory`
- **SubscriptionTier**: `free`, `starter`, `pro`, `team`
- **MaterialStatus**: `pending`, `processing`, `completed`, `failed`
- **UserRole**: `student`, `teacher`, `admin`

## Environment Variables

Required environment variables (create `.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_STARTER_PRICE_ID=
STRIPE_PRO_PRICE_ID=
STRIPE_TEAM_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## Code Conventions

### TypeScript
- Strict mode enabled
- Path alias: `@/*` maps to `./src/*`
- All database types in `/src/types/database.ts`
- Use type inference where possible, explicit types for function params

### Styling
- Use Tailwind CSS utility classes
- CSS variables defined in `globals.css` for theming
- Use `cn()` utility from `/lib/utils.ts` for conditional classes
- Support light/dark mode via `prefers-color-scheme`

### File Naming
- Components: PascalCase (`DashboardNav.tsx`)
- Utilities: camelCase (`utils.ts`)
- Pages/Routes: lowercase with hyphens (Next.js convention)

### API Routes
- Use `NextRequest` and `NextResponse` from `next/server`
- Always validate user authentication first
- Return JSON with appropriate status codes
- Handle errors gracefully with try/catch

## Key Workflows

### Audio Processing Pipeline
1. User uploads audio file (MP3, WAV, M4A, OGG)
2. File stored in Supabase Storage (`audio` bucket)
3. Material status set to `processing`
4. OpenAI Whisper transcribes audio (Polish language)
5. GPT-4o-mini generates notes, quizzes, flashcards in parallel
6. Content adapted to user's learning mode
7. Status updated to `completed`

### Subscription Flow
- Three tiers: Starter (29 PLN), Pro (49 PLN), Team (79 PLN)
- Stripe Checkout for payment
- Webhooks update `profiles.subscription_tier` and `subscription_status`
- Customer portal for subscription management

## Common Tasks

### Adding a New API Route
1. Create folder in `/src/app/api/[route-name]/`
2. Add `route.ts` with HTTP method handlers
3. Use `createClient()` for authenticated Supabase access
4. Follow existing patterns in `/api/transcribe` or `/api/stripe`

### Adding a New Dashboard Page
1. Create folder in `/src/app/dashboard/[page-name]/`
2. Add `page.tsx` (automatically protected by middleware)
3. Use server components for data fetching
4. Add navigation link in `DashboardNav.tsx`

### Adding a New Component
1. Create in appropriate folder (`/components/ui/`, `/components/dashboard/`, etc.)
2. Use TypeScript interfaces for props
3. Export as default or named export consistently
4. Use `cn()` for conditional styling

## Important Notes

### Language
- UI text is in **Polish** (pl)
- OpenAI prompts specify Polish language output
- Keep all user-facing text in Polish

### Security
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client
- Validate all user input
- Use Row Level Security (RLS) in Supabase
- Webhook signatures must be verified

### Performance
- Use React Server Components where possible
- Lazy load heavy components
- Optimize images with Next.js Image component
- Supabase domain allowlisted in `next.config.ts`

## Debugging Tips

- Check browser console for client-side errors
- Check terminal for server-side errors
- Supabase dashboard for database/auth issues
- Stripe dashboard for payment issues
- OpenAI dashboard for API usage/errors

## File References

| Purpose | File Path |
|---------|-----------|
| Root layout | `/src/app/layout.tsx` |
| Auth middleware | `/src/middleware.ts` |
| Supabase server client | `/src/lib/supabase/server.ts` |
| Supabase browser client | `/src/lib/supabase/client.ts` |
| Stripe config | `/src/lib/stripe/config.ts` |
| Database types | `/src/types/database.ts` |
| Global styles | `/src/app/globals.css` |
| Button component | `/src/components/ui/button.tsx` |
