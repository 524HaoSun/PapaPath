/**
 * Badge System — Dad Pregnancy Companion
 * Defines all badges, unlock conditions, and localStorage persistence
 */

export interface Badge {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  requirement: string; // human-readable requirement
  color: string; // oklch primary color
  bgColor: string; // oklch background
  glowColor: string; // oklch glow
  rarity: "common" | "rare" | "epic" | "legendary";
  // unlock condition
  condition: (stats: CheckInStats) => boolean;
}

export interface CheckInStats {
  streak: number;
  totalDays: number;
  lastCheckIn: string | null;
  checkedInToday: boolean;
  unlockedBadgeIds: string[];
}

export const BADGES: Badge[] = [
  {
    id: "first_step",
    emoji: "👶",
    title: "First Step",
    subtitle: "Day One",
    description: "You showed up. That's what matters most.",
    requirement: "Check in for the first time",
    color: "oklch(0.52 0.09 188)",
    bgColor: "oklch(0.92 0.04 188)",
    glowColor: "oklch(0.52 0.09 188 / 0.35)",
    rarity: "common",
    condition: (s) => s.totalDays >= 1,
  },
  {
    id: "three_days",
    emoji: "🌱",
    title: "Seedling Dad",
    subtitle: "Growing Strong",
    description: "Three days in a row. A habit is forming.",
    requirement: "3-day check-in streak",
    color: "oklch(0.55 0.14 145)",
    bgColor: "oklch(0.92 0.05 145)",
    glowColor: "oklch(0.55 0.14 145 / 0.35)",
    rarity: "common",
    condition: (s) => s.streak >= 3,
  },
  {
    id: "one_week",
    emoji: "⭐",
    title: "Steady Dad",
    subtitle: "One Full Week",
    description: "A full week of dedication. Your baby feels your love.",
    requirement: "7-day check-in streak",
    color: "oklch(0.72 0.15 80)",
    bgColor: "oklch(0.95 0.06 80)",
    glowColor: "oklch(0.72 0.15 80 / 0.4)",
    rarity: "rare",
    condition: (s) => s.streak >= 7,
  },
  {
    id: "two_weeks",
    emoji: "🔥",
    title: "On Fire",
    subtitle: "Two Weeks Solid",
    description: "Two weeks strong! Nothing can stop you now.",
    requirement: "14-day check-in streak",
    color: "oklch(0.60 0.17 25)",
    bgColor: "oklch(0.93 0.06 25)",
    glowColor: "oklch(0.60 0.17 25 / 0.4)",
    rarity: "rare",
    condition: (s) => s.streak >= 14,
  },
  {
    id: "one_month",
    emoji: "🏆",
    title: "Super Dad",
    subtitle: "30-Day Champion",
    description: "30 days of unwavering commitment. You are extraordinary.",
    requirement: "30-day check-in streak",
    color: "oklch(0.65 0.18 50)",
    bgColor: "oklch(0.94 0.07 50)",
    glowColor: "oklch(0.65 0.18 50 / 0.5)",
    rarity: "epic",
    condition: (s) => s.streak >= 30,
  },
  {
    id: "total_10",
    emoji: "💪",
    title: "Committed",
    subtitle: "10 Days In",
    description: "10 total check-ins. You're building a beautiful habit.",
    requirement: "10 total check-ins",
    color: "oklch(0.52 0.09 188)",
    bgColor: "oklch(0.92 0.04 188)",
    glowColor: "oklch(0.52 0.09 188 / 0.3)",
    rarity: "common",
    condition: (s) => s.totalDays >= 10,
  },
  {
    id: "total_30",
    emoji: "🌟",
    title: "Devoted Dad",
    subtitle: "30 Total Days",
    description: "30 total check-ins. Your dedication is inspiring.",
    requirement: "30 total check-ins",
    color: "oklch(0.62 0.16 270)",
    bgColor: "oklch(0.93 0.05 270)",
    glowColor: "oklch(0.62 0.16 270 / 0.4)",
    rarity: "rare",
    condition: (s) => s.totalDays >= 30,
  },
  {
    id: "legendary",
    emoji: "👑",
    title: "Dad of the Year",
    subtitle: "60-Day Legend",
    description: "60-day streak. A legend. Your child will be so proud.",
    requirement: "60-day check-in streak",
    color: "oklch(0.68 0.20 55)",
    bgColor: "oklch(0.95 0.08 55)",
    glowColor: "oklch(0.68 0.20 55 / 0.6)",
    rarity: "legendary",
    condition: (s) => s.streak >= 60,
  },
];

const STORAGE_KEY = "dad_companion_checkin_v2";

export function loadStats(): CheckInStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Migrate from old key if exists
      const oldRaw = localStorage.getItem("dad_companion_checkin");
      if (oldRaw) {
        const old = JSON.parse(oldRaw);
        const today = new Date().toDateString();
        const lastDate = old.lastCheckIn ? new Date(old.lastCheckIn).toDateString() : null;
        return {
          streak: old.streak ?? 0,
          totalDays: old.totalDays ?? 0,
          lastCheckIn: old.lastCheckIn ?? null,
          checkedInToday: lastDate === today,
          unlockedBadgeIds: old.streak >= 1 ? ["first_step"] : [],
        };
      }
      return { streak: 0, totalDays: 0, lastCheckIn: null, checkedInToday: false, unlockedBadgeIds: [] };
    }
    const data = JSON.parse(raw) as CheckInStats;
    const today = new Date().toDateString();
    const lastDate = data.lastCheckIn ? new Date(data.lastCheckIn).toDateString() : null;
    return { ...data, checkedInToday: lastDate === today };
  } catch {
    return { streak: 0, totalDays: 0, lastCheckIn: null, checkedInToday: false, unlockedBadgeIds: [] };
  }
}

function saveStats(stats: CheckInStats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export interface CheckInResult {
  stats: CheckInStats;
  newlyUnlocked: Badge[];
  alreadyCheckedIn: boolean;
}

export function performCheckIn(): CheckInResult {
  const current = loadStats();

  if (current.checkedInToday) {
    return { stats: current, newlyUnlocked: [], alreadyCheckedIn: true };
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  const lastDate = current.lastCheckIn ? new Date(current.lastCheckIn).toDateString() : null;

  const newStreak = lastDate === yesterdayStr ? current.streak + 1 : 1;
  const newTotal = current.totalDays + 1;

  const updatedStats: CheckInStats = {
    streak: newStreak,
    totalDays: newTotal,
    lastCheckIn: today.toISOString(),
    checkedInToday: true,
    unlockedBadgeIds: [...current.unlockedBadgeIds],
  };

  // Check for newly unlocked badges
  const newlyUnlocked: Badge[] = [];
  for (const badge of BADGES) {
    if (!updatedStats.unlockedBadgeIds.includes(badge.id) && badge.condition(updatedStats)) {
      updatedStats.unlockedBadgeIds.push(badge.id);
      newlyUnlocked.push(badge);
    }
  }

  saveStats(updatedStats);
  return { stats: updatedStats, newlyUnlocked, alreadyCheckedIn: false };
}

export function getUnlockedBadges(stats: CheckInStats): Badge[] {
  return BADGES.filter((b) => stats.unlockedBadgeIds.includes(b.id));
}

export function getNextBadge(stats: CheckInStats): Badge | null {
  return BADGES.find((b) => !stats.unlockedBadgeIds.includes(b.id)) ?? null;
}

export const RARITY_LABELS: Record<Badge["rarity"], string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

export const RARITY_COLORS: Record<Badge["rarity"], { text: string; bg: string }> = {
  common: { text: "oklch(0.52 0.09 188)", bg: "oklch(0.92 0.04 188)" },
  rare: { text: "oklch(0.55 0.14 145)", bg: "oklch(0.92 0.05 145)" },
  epic: { text: "oklch(0.60 0.17 25)", bg: "oklch(0.93 0.06 25)" },
  legendary: { text: "oklch(0.65 0.18 50)", bg: "oklch(0.94 0.07 50)" },
};
