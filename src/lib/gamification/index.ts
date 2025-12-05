// Gamification System - XP, Levels, Achievements, Streaks
// potrzebny.ai SuperMózg

// ============================================
// TYPES
// ============================================

export interface UserProgress {
  id: string;
  userId: string;
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string;
  achievements: Achievement[];
  dailyGoalProgress: number;
  dailyGoalTarget: number;
  weeklyXP: number;
  totalStudyMinutes: number;
  flashcardsReviewed: number;
  quizzesPassed: number;
  notesCreated: number;
  perfectQuizzes: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatar?: string;
  xp: number;
  level: number;
  streak: number;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  type: "flashcards" | "quiz" | "notes" | "time" | "streak";
  target: number;
  progress: number;
  completed: boolean;
  expiresAt: string;
}

// ============================================
// XP & LEVEL SYSTEM
// ============================================

// XP needed for each level (exponential curve)
export function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function getLevelFromXP(totalXP: number): { level: number; currentXP: number; xpForNextLevel: number; progress: number } {
  let level = 1;
  let remainingXP = totalXP;

  while (remainingXP >= getXPForLevel(level)) {
    remainingXP -= getXPForLevel(level);
    level++;
  }

  const xpForNextLevel = getXPForLevel(level);
  const progress = (remainingXP / xpForNextLevel) * 100;

  return {
    level,
    currentXP: remainingXP,
    xpForNextLevel,
    progress,
  };
}

// XP rewards for different actions
export const XP_REWARDS = {
  flashcard_review: 2,
  flashcard_correct: 5,
  flashcard_perfect_session: 25,
  quiz_complete: 15,
  quiz_pass: 30,
  quiz_perfect: 100,
  notes_create: 20,
  notes_study: 10,
  material_upload: 25,
  daily_login: 10,
  streak_bonus_3: 25,
  streak_bonus_7: 75,
  streak_bonus_30: 300,
  daily_goal_complete: 50,
  weekly_goal_complete: 200,
  first_quiz: 50,
  first_flashcards: 50,
  first_notes: 50,
  study_30_minutes: 30,
  study_60_minutes: 75,
  study_120_minutes: 200,
};

// ============================================
// LEVEL TITLES (Polish, fun names)
// ============================================

export const LEVEL_TITLES: Record<number, { title: string; emoji: string }> = {
  1: { title: "Nowicjusz", emoji: "🌱" },
  2: { title: "Odkrywca", emoji: "🔍" },
  3: { title: "Początkujący Uczeń", emoji: "📚" },
  4: { title: "Adept Wiedzy", emoji: "🎓" },
  5: { title: "Młody Mędrzec", emoji: "🧠" },
  6: { title: "Poszukiwacz Prawdy", emoji: "💡" },
  7: { title: "Uczeń Mistrza", emoji: "⭐" },
  8: { title: "Strażnik Wiedzy", emoji: "🛡️" },
  9: { title: "Iluminat", emoji: "✨" },
  10: { title: "Mędrzec", emoji: "🔮" },
  11: { title: "Arcymistrz", emoji: "👑" },
  12: { title: "Legenda", emoji: "🏆" },
  13: { title: "Oświecony", emoji: "🌟" },
  14: { title: "Wszechwiedzący", emoji: "🌌" },
  15: { title: "SuperMózg", emoji: "🚀" },
};

export function getLevelTitle(level: number): { title: string; emoji: string } {
  if (level >= 15) return LEVEL_TITLES[15];
  return LEVEL_TITLES[level] || LEVEL_TITLES[1];
}

// ============================================
// ACHIEVEMENTS
// ============================================

export const ACHIEVEMENTS: Achievement[] = [
  // Learning achievements
  { id: "first_steps", name: "Pierwsze Kroki", description: "Ukończ swój pierwszy quiz", icon: "👣", rarity: "common" },
  { id: "flashcard_master", name: "Mistrz Fiszek", description: "Przejrzyj 100 fiszek", icon: "🃏", rarity: "common", maxProgress: 100 },
  { id: "quiz_champion", name: "Mistrz Quizów", description: "Zdaj 10 quizów", icon: "🏅", rarity: "rare", maxProgress: 10 },
  { id: "perfect_10", name: "Perfekcyjna Dziesiątka", description: "Zdobądź 100% w 10 quizach", icon: "💯", rarity: "epic", maxProgress: 10 },
  { id: "note_taker", name: "Notatkarz", description: "Stwórz 20 notatek", icon: "📝", rarity: "common", maxProgress: 20 },

  // Streak achievements
  { id: "streak_3", name: "Trzeci Dzień", description: "Utrzymaj 3-dniową serię", icon: "🔥", rarity: "common" },
  { id: "streak_7", name: "Tygodniowa Seria", description: "Utrzymaj 7-dniową serię", icon: "🔥", rarity: "rare" },
  { id: "streak_30", name: "Miesięczny Wojownik", description: "Utrzymaj 30-dniową serię", icon: "🔥", rarity: "epic" },
  { id: "streak_100", name: "Niezniszczalny", description: "Utrzymaj 100-dniową serię", icon: "💎", rarity: "legendary" },

  // Time achievements
  { id: "night_owl", name: "Nocny Marek", description: "Ucz się po 22:00", icon: "🦉", rarity: "common" },
  { id: "early_bird", name: "Ranny Ptaszek", description: "Ucz się przed 7:00", icon: "🐤", rarity: "common" },
  { id: "weekend_warrior", name: "Weekendowy Wojownik", description: "Ucz się w weekend", icon: "⚔️", rarity: "common" },
  { id: "marathon_learner", name: "Maratończyk", description: "Ucz się 2 godziny bez przerwy", icon: "🏃", rarity: "rare" },

  // Level achievements
  { id: "level_5", name: "Piątka!", description: "Osiągnij poziom 5", icon: "5️⃣", rarity: "common" },
  { id: "level_10", name: "Dziesiątka!", description: "Osiągnij poziom 10", icon: "🔟", rarity: "rare" },
  { id: "level_15", name: "SuperMózg", description: "Osiągnij najwyższy poziom", icon: "🧠", rarity: "legendary" },

  // Special achievements
  { id: "social_butterfly", name: "Towarzyski Motyl", description: "Dołącz do klasy", icon: "🦋", rarity: "common" },
  { id: "helper", name: "Pomocna Dłoń", description: "Pomóż innemu uczniowi", icon: "🤝", rarity: "rare" },
  { id: "completionist", name: "Kompletujący", description: "Ukończ wszystkie moduły kursu", icon: "✅", rarity: "epic" },
  { id: "speed_demon", name: "Speed Demon", description: "Ukończ quiz w mniej niż 30 sekund", icon: "⚡", rarity: "rare" },

  // Health & Wellness (related to aldehyde detox awareness)
  { id: "health_aware", name: "Świadomy Zdrowia", description: "Przeczytaj artykuł o optymalizacji zdrowia", icon: "💪", rarity: "common" },
  { id: "brain_optimizer", name: "Optymalizator Mózgu", description: "Poznaj 10 sposobów na lepszą pamięć", icon: "🧬", rarity: "rare" },
];

export function checkAchievement(
  achievementId: string,
  progress: UserProgress
): { unlocked: boolean; newProgress?: number } {
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievement) return { unlocked: false };

  switch (achievementId) {
    case "flashcard_master":
      return {
        unlocked: progress.flashcardsReviewed >= 100,
        newProgress: Math.min(progress.flashcardsReviewed, 100),
      };
    case "quiz_champion":
      return {
        unlocked: progress.quizzesPassed >= 10,
        newProgress: Math.min(progress.quizzesPassed, 10),
      };
    case "perfect_10":
      return {
        unlocked: progress.perfectQuizzes >= 10,
        newProgress: Math.min(progress.perfectQuizzes, 10),
      };
    case "streak_3":
      return { unlocked: progress.streak >= 3 };
    case "streak_7":
      return { unlocked: progress.streak >= 7 };
    case "streak_30":
      return { unlocked: progress.streak >= 30 };
    case "streak_100":
      return { unlocked: progress.streak >= 100 };
    case "level_5":
      return { unlocked: progress.level >= 5 };
    case "level_10":
      return { unlocked: progress.level >= 10 };
    case "level_15":
      return { unlocked: progress.level >= 15 };
    default:
      return { unlocked: false };
  }
}

// ============================================
// DAILY CHALLENGES
// ============================================

export function generateDailyChallenges(): DailyChallenge[] {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  return [
    {
      id: `daily_flashcards_${now.toDateString()}`,
      title: "Fiszkowicz",
      description: "Przejrzyj 20 fiszek",
      xpReward: 30,
      type: "flashcards",
      target: 20,
      progress: 0,
      completed: false,
      expiresAt: endOfDay.toISOString(),
    },
    {
      id: `daily_quiz_${now.toDateString()}`,
      title: "Quizowicz",
      description: "Ukończ quiz z wynikiem min. 70%",
      xpReward: 50,
      type: "quiz",
      target: 70,
      progress: 0,
      completed: false,
      expiresAt: endOfDay.toISOString(),
    },
    {
      id: `daily_time_${now.toDateString()}`,
      title: "Wytrwały",
      description: "Spędź 30 minut na nauce",
      xpReward: 40,
      type: "time",
      target: 30,
      progress: 0,
      completed: false,
      expiresAt: endOfDay.toISOString(),
    },
  ];
}

// ============================================
// STREAK MANAGEMENT
// ============================================

export function calculateStreak(lastActiveDate: string | null, currentStreak: number): {
  newStreak: number;
  streakMaintained: boolean;
  streakBroken: boolean;
} {
  if (!lastActiveDate) {
    return { newStreak: 1, streakMaintained: false, streakBroken: false };
  }

  const last = new Date(lastActiveDate);
  const now = new Date();

  // Reset time to compare just dates
  last.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Same day, streak unchanged
    return { newStreak: currentStreak, streakMaintained: true, streakBroken: false };
  } else if (diffDays === 1) {
    // Next day, streak continues
    return { newStreak: currentStreak + 1, streakMaintained: true, streakBroken: false };
  } else {
    // Streak broken
    return { newStreak: 1, streakMaintained: false, streakBroken: true };
  }
}

// ============================================
// MOTIVATIONAL MESSAGES
// ============================================

export const MOTIVATIONAL_MESSAGES = {
  streak: [
    "Niesamowite! {days} dni z rzędu! 🔥",
    "Twoja seria to {days} dni! Nie zwalniaj! 💪",
    "{days} dni! Jesteś maszyną do nauki! 🚀",
  ],
  levelUp: [
    "LEVEL UP! Jesteś teraz {title}! {emoji}",
    "Awansujesz na poziom {level}! {emoji}",
    "Nowy poziom odblokowany: {title}! {emoji}",
  ],
  achievement: [
    "Osiągnięcie odblokowane: {name}! {icon}",
    "Nowe osiągnięcie: {name}! {icon}",
    "Brawo! Zdobyłeś: {name}! {icon}",
  ],
  encouragement: [
    "Świetna robota! Kontynuuj! 🌟",
    "Każdy krok przybliża Cię do celu! 💫",
    "Twój mózg Ci dziękuje! 🧠",
    "Wiedza to potęga! 📚",
    "Jesteś niesamowity/a! ✨",
  ],
  comeback: [
    "Tęskniliśmy za Tobą! Czas wrócić do nauki! 📖",
    "Witaj ponownie! Twoja wiedza na Ciebie czeka! 🎓",
    "Nowy dzień, nowe możliwości! Zaczynamy! 🌅",
  ],
};

export function getRandomMessage(category: keyof typeof MOTIVATIONAL_MESSAGES, params?: Record<string, string | number>): string {
  const messages = MOTIVATIONAL_MESSAGES[category];
  let message = messages[Math.floor(Math.random() * messages.length)];

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, String(value));
    });
  }

  return message;
}

// ============================================
// LEADERBOARD
// ============================================

export function calculateLeaderboardPosition(
  userXP: number,
  allUsers: { xp: number }[]
): { rank: number; percentile: number } {
  const sorted = [...allUsers].sort((a, b) => b.xp - a.xp);
  const rank = sorted.findIndex(u => u.xp <= userXP) + 1;
  const percentile = Math.round((1 - rank / allUsers.length) * 100);

  return { rank, percentile };
}
