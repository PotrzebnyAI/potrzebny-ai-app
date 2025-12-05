export const STRIPE_PLANS = {
  starter: {
    name: "AI BASIC",
    price: 29,
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    features: [
      "5 godzin transkrypcji miesięcznie",
      "Notatki AI",
      "Podstawowe quizy",
      "1 tryb dostępności",
      "Email support",
    ],
    limits: {
      transcriptionMinutes: 300, // 5 hours
      learningModes: 1,
    },
  },
  pro: {
    name: "POTRZEBNY PRO",
    price: 49,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      "20 godzin transkrypcji miesięcznie",
      "Notatki AI + streszczenia",
      "Quizy i flashcards",
      "Wszystkie tryby dostępności",
      "Integracja z Google Drive",
      "Priorytetowy support",
    ],
    limits: {
      transcriptionMinutes: 1200, // 20 hours
      learningModes: 5,
    },
  },
  team: {
    name: "SUPERMÓZG ULTRA",
    price: 79,
    priceId: process.env.STRIPE_TEAM_PRICE_ID!,
    features: [
      "Nielimitowana transkrypcja",
      "Wszystko z POTRZEBNY PRO",
      "Panel nauczyciela",
      "Udostępnianie materiałów",
      "Analityka postępów",
      "API access",
      "Dedykowany opiekun",
    ],
    limits: {
      transcriptionMinutes: -1, // unlimited
      learningModes: 5,
    },
  },
} as const;

export type PlanKey = keyof typeof STRIPE_PLANS;
