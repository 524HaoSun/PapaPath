import { and, desc, eq, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  dadGameProfiles,
  fatherProfiles,
  healthRecords,
  motherProfiles,
  riskAlerts,
  riskRules,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── Father Profile ───────────────────────────────────────────────────────────
export async function getFatherProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(fatherProfiles).where(eq(fatherProfiles.userId, userId)).limit(1);
  return result[0] ?? null;
}

export async function upsertFatherProfile(userId: number, data: Partial<typeof fatherProfiles.$inferInsert>) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(fatherProfiles).values({ userId, ...data }).onDuplicateKeyUpdate({ set: { ...data, updatedAt: new Date() } });
  return getFatherProfile(userId);
}

// ─── Mother Profile ───────────────────────────────────────────────────────────
export async function getMotherProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(motherProfiles).where(eq(motherProfiles.linkedFatherUserId, userId)).limit(1);
  return result[0] ?? null;
}

export async function upsertMotherProfile(userId: number, data: Partial<typeof motherProfiles.$inferInsert>) {
  const db = await getDb();
  if (!db) return null;
  const existing = await getMotherProfile(userId);
  if (existing) {
    await db.update(motherProfiles).set({ ...data, updatedAt: new Date() }).where(eq(motherProfiles.linkedFatherUserId, userId));
  } else {
    await db.insert(motherProfiles).values({ linkedFatherUserId: userId, ...data });
  }
  return getMotherProfile(userId);
}

// ─── Health Records ───────────────────────────────────────────────────────────
export async function createHealthRecord(data: typeof healthRecords.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(healthRecords).values(data);
  const id = (result[0] as any).insertId;
  const rows = await db.select().from(healthRecords).where(eq(healthRecords.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getHealthRecords(motherProfileId: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(healthRecords)
    .where(eq(healthRecords.motherProfileId, motherProfileId))
    .orderBy(desc(healthRecords.recordDate))
    .limit(limit);
}

export async function getLatestHealthRecord(motherProfileId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(healthRecords)
    .where(eq(healthRecords.motherProfileId, motherProfileId))
    .orderBy(desc(healthRecords.recordDate))
    .limit(1);
  return result[0] ?? null;
}

export async function getHealthTrends(motherProfileId: number, days = 30) {
  const db = await getDb();
  if (!db) return [];
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return db.select().from(healthRecords)
    .where(and(
      eq(healthRecords.motherProfileId, motherProfileId),
      gte(healthRecords.recordDate, since)
    ))
    .orderBy(healthRecords.recordDate);
}

// ─── Risk Rules & Alerts ──────────────────────────────────────────────────────
export async function getActiveRiskRules() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(riskRules).where(eq(riskRules.active, true));
}

export async function createRiskAlert(data: typeof riskAlerts.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(riskAlerts).values(data);
  const id = (result[0] as any).insertId;
  const rows = await db.select().from(riskAlerts).where(eq(riskAlerts.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getRiskAlertHistory(motherProfileId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(riskAlerts)
    .where(eq(riskAlerts.motherProfileId, motherProfileId))
    .orderBy(desc(riskAlerts.createdAt))
    .limit(20);
}

// ─── Dad Game Profiles ────────────────────────────────────────────────────────
export async function getDadGameProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(dadGameProfiles).where(eq(dadGameProfiles.userId, userId)).limit(1);
  return result[0] ?? null;
}
