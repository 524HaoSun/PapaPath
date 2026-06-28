import { and, desc, eq, sql } from "drizzle-orm";
import { dadGameProfiles, dailyMissions, missionTemplates, xpEvents } from "../drizzle/schema";
import { getDb } from "./db";

// ─── Level & Title System ─────────────────────────────────────────────────────

export const LEVELS = [
  { level: 1,  minXp: 0,    title: "Rookie Dad",        emoji: "🌱" },
  { level: 2,  minXp: 100,  title: "Scan Buddy",         emoji: "🔍" },
  { level: 3,  minXp: 250,  title: "Nappy Ninja",        emoji: "🥷" },
  { level: 4,  minXp: 500,  title: "Midnight Warrior",   emoji: "🌙" },
  { level: 5,  minXp: 800,  title: "Bump Whisperer",     emoji: "🤫" },
  { level: 6,  minXp: 1200, title: "Cravings Expert",    emoji: "🍕" },
  { level: 7,  minXp: 1700, title: "Birth Plan Warrior", emoji: "⚔️" },
  { level: 8,  minXp: 2300, title: "Hospital Bag Hero",  emoji: "🎒" },
  { level: 9,  minXp: 3000, title: "Labour Coach",       emoji: "💪" },
  { level: 10, minXp: 4000, title: "Dad Boss",           emoji: "👑" },
];

export function getLevelFromXp(xp: number) {
  let current = LEVELS[0]!;
  for (const lvl of LEVELS) {
    if (xp >= lvl.minXp) current = lvl;
    else break;
  }
  const nextLevel = LEVELS.find(l => l.level === current.level + 1);
  const xpForNext = nextLevel ? nextLevel.minXp : current.minXp;
  const xpIntoLevel = xp - current.minXp;
  const xpNeeded = xpForNext - current.minXp;
  const progressPct = nextLevel ? Math.min(100, Math.round((xpIntoLevel / xpNeeded) * 100)) : 100;
  return { ...current, nextLevel, xpForNext, progressPct };
}

// ─── XP Awards ────────────────────────────────────────────────────────────────

export const XP_REWARDS = {
  log_health:         30,
  tick_checklist:     15,
  post_discussion:    25,
  save_appointment:   20,
  read_week_content:  10,
  write_reflection:   20,
  complete_mission:   50, // bonus on top of mission's own xpReward
  daily_streak_bonus: 20,
  shield_used:        0,
} as const;

export type XpActionType = keyof typeof XP_REWARDS;

// ─── Get or create game profile ───────────────────────────────────────────────

export async function getOrCreateGameProfile(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const existing = await db
    .select()
    .from(dadGameProfiles)
    .where(eq(dadGameProfiles.userId, userId))
    .limit(1);

  if (existing.length > 0) return existing[0]!;

  await db.insert(dadGameProfiles).values({ userId });
  const created = await db
    .select()
    .from(dadGameProfiles)
    .where(eq(dadGameProfiles.userId, userId))
    .limit(1);
  return created[0]!;
}

// ─── Award XP ─────────────────────────────────────────────────────────────────

export async function awardXp(
  userId: number,
  amount: number,
  reason: string,
  actionType?: string
) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const profile = await getOrCreateGameProfile(userId);
  const newXp = profile.xp + amount;
  const { level, title } = getLevelFromXp(newXp);
  const leveledUp = level > profile.level;

  await db
    .update(dadGameProfiles)
    .set({ xp: newXp, level, title, updatedAt: new Date() })
    .where(eq(dadGameProfiles.userId, userId));

  await db.insert(xpEvents).values({
    userId,
    xpAwarded: amount,
    reason,
    actionType: actionType ?? null,
  });

  return { newXp, level, title, leveledUp };
}

// ─── Streak Management ────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export async function recordActivity(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const profile = await getOrCreateGameProfile(userId);
  const today = todayStr();
  const yesterday = yesterdayStr();

  if (profile.lastActivityDate === today) {
    // Already recorded today — no change
    return { streakChanged: false, currentStreak: profile.currentStreak };
  }

  let newStreak = 1;
  let shieldsAvailable = profile.shieldsAvailable;

  if (profile.lastActivityDate === yesterday) {
    // Consecutive day — extend streak
    newStreak = profile.currentStreak + 1;
  } else if (profile.lastActivityDate) {
    // Gap detected — check if shield can cover it
    const lastDate = new Date(profile.lastActivityDate);
    const todayDate = new Date(today);
    const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / 86400000);

    if (diffDays === 2 && shieldsAvailable > 0) {
      // Shield absorbs the one-day gap
      newStreak = profile.currentStreak + 1;
      shieldsAvailable = shieldsAvailable - 1;
    } else {
      // Streak broken
      newStreak = 1;
    }
  }

  // Award a weekly shield every 7 consecutive days
  if (newStreak % 7 === 0) {
    shieldsAvailable = Math.min(shieldsAvailable + 1, 3);
  }

  const longestStreak = Math.max(newStreak, profile.longestStreak);

  await db
    .update(dadGameProfiles)
    .set({
      currentStreak: newStreak,
      longestStreak,
      shieldsAvailable,
      lastActivityDate: today,
      updatedAt: new Date(),
    })
    .where(eq(dadGameProfiles.userId, userId));

  // Streak bonus XP
  if (newStreak > 1) {
    await awardXp(userId, XP_REWARDS.daily_streak_bonus, `Day ${newStreak} streak bonus`, "daily_streak_bonus");
  }

  return { streakChanged: true, currentStreak: newStreak, longestStreak, shieldsAvailable };
}

// ─── Daily Mission Generator ──────────────────────────────────────────────────

export async function getTodaysMissions(userId: number, pregnancyWeek?: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const today = todayStr();

  // Return existing missions if already generated today
  const existing = await db
    .select()
    .from(dailyMissions)
    .where(and(eq(dailyMissions.userId, userId), eq(dailyMissions.missionDate, today)));

  if (existing.length > 0) return existing;

  // Pick 3 missions from templates
  // Priority: week-specific first, then generic
  const weekSpecific = pregnancyWeek
    ? await db
        .select()
        .from(missionTemplates)
        .where(and(eq(missionTemplates.pregnancyWeek, pregnancyWeek), eq(missionTemplates.isActive, true)))
        .limit(2)
    : [];

  const generic = await db
    .select()
    .from(missionTemplates)
    .where(and(sql`${missionTemplates.pregnancyWeek} IS NULL`, eq(missionTemplates.isActive, true)))
    .orderBy(sql`RAND()`)
    .limit(3);

  const pool = [...weekSpecific, ...generic].slice(0, 3);

  if (pool.length === 0) return [];

  const toInsert = pool.map(t => ({
    userId,
    missionDate: today,
    templateId: t.id,
    title: t.title,
    description: t.description ?? null,
    actionType: t.actionType,
    xpReward: t.xpReward,
    icon: t.icon ?? "star",
  }));

  await db.insert(dailyMissions).values(toInsert);

  return db
    .select()
    .from(dailyMissions)
    .where(and(eq(dailyMissions.userId, userId), eq(dailyMissions.missionDate, today)));
}

// ─── Complete a Mission ───────────────────────────────────────────────────────

export async function completeMission(userId: number, missionId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const mission = await db
    .select()
    .from(dailyMissions)
    .where(and(eq(dailyMissions.id, missionId), eq(dailyMissions.userId, userId)))
    .limit(1);

  if (!mission[0] || mission[0].completed) return null;

  await db
    .update(dailyMissions)
    .set({ completed: true, completedAt: new Date() })
    .where(eq(dailyMissions.id, missionId));

  // Award XP: mission reward + completion bonus
  const totalXp = mission[0].xpReward + XP_REWARDS.complete_mission;
  const result = await awardXp(userId, totalXp, `Mission: ${mission[0].title}`, "complete_mission");

  // Update mission count
  await db
    .update(dadGameProfiles)
    .set({ totalMissionsCompleted: sql`totalMissionsCompleted + 1`, updatedAt: new Date() })
    .where(eq(dadGameProfiles.userId, userId));

  return { ...result, xpAwarded: totalXp };
}

// ─── Get XP History ───────────────────────────────────────────────────────────

export async function getXpHistory(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  return db
    .select()
    .from(xpEvents)
    .where(eq(xpEvents.userId, userId))
    .orderBy(desc(xpEvents.createdAt))
    .limit(limit);
}
