import {
  boolean,
  date,
  decimal,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Pregnancy Profile ────────────────────────────────────────────────────────
/**
 * One pregnancy per dad user.
 * Dad sets up the pregnancy info (due date, baby nickname, etc.)
 * and then records mom's daily health data himself.
 */
export const pregnancies = mysqlTable("pregnancies", {
  id: int("id").autoincrement().primaryKey(),
  /** The dad's user ID — owner of this pregnancy record */
  userId: int("userId").notNull().unique(),
  dueDate: date("dueDate").notNull(),
  babyNickname: varchar("babyNickname", { length: 64 }),
  lmpDate: date("lmpDate"),
  partnerName: varchar("partnerName", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Pregnancy = typeof pregnancies.$inferSelect;
export type InsertPregnancy = typeof pregnancies.$inferInsert;

// ─── Mom Daily Health Logs ────────────────────────────────────────────────────
/**
 * Dad records mom's daily health status.
 * All fields are optional — dad fills in what he observes or mom tells him.
 */
export const momLogs = mysqlTable("mom_logs", {
  id: int("id").autoincrement().primaryKey(),
  /** The dad's user ID */
  userId: int("userId").notNull(),
  logDate: date("logDate").notNull(),
  weekNumber: int("weekNumber").notNull(),
  // Physical
  energyLevel: int("energyLevel"),      // 1–10
  nauseaLevel: int("nauseaLevel"),      // 1–10
  painLevel: int("painLevel"),          // 1–10
  sleepHours: decimal("sleepHours", { precision: 3, scale: 1 }),
  waterMl: int("waterMl"),
  weightKg: decimal("weightKg", { precision: 4, scale: 1 }),
  kickCount: int("kickCount"),
  // Emotional
  moodScore: int("moodScore"),          // 1–10
  anxietyScore: int("anxietyScore"),    // 1–10
  // Free text
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MomLog = typeof momLogs.$inferSelect;
export type InsertMomLog = typeof momLogs.$inferInsert;

// ─── Symptoms ─────────────────────────────────────────────────────────────────
/**
 * Specific symptoms logged per day.
 * Linked to a mom_log entry.
 */
export const symptoms = mysqlTable("symptoms", {
  id: int("id").autoincrement().primaryKey(),
  logId: int("logId").notNull(),
  userId: int("userId").notNull(),
  code: varchar("code", { length: 64 }).notNull(),
  severity: mysqlEnum("severity", ["mild", "moderate", "severe"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Symptom = typeof symptoms.$inferSelect;

// ─── Appointments ─────────────────────────────────────────────────────────────
export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  scheduledAt: timestamp("scheduledAt").notNull(),
  type: varchar("type", { length: 32 }).notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  notes: text("notes"),
  dadAttending: boolean("dadAttending").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;

// ─── AI Summaries Cache ───────────────────────────────────────────────────────
/**
 * Cached AI-generated summaries to avoid regenerating on every page load.
 * Refreshed once per day per user.
 */
export const aiSummaries = mysqlTable("ai_summaries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  weekNumber: int("weekNumber").notNull(),
  summaryDate: date("summaryDate").notNull(),
  momStatusJson: json("momStatusJson").notNull(),
  dadPlanJson: json("dadPlanJson").notNull(),
  dataSource: mysqlEnum("dataSource", ["live", "yesterday", "preset"]).default("preset"),
  modelUsed: varchar("modelUsed", { length: 64 }),
  promptTokens: int("promptTokens"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiSummary = typeof aiSummaries.$inferSelect;

// ─── Dad Profiles (Gamification) ─────────────────────────────────────────────
export const dadProfiles = mysqlTable("dad_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  xp: int("xp").default(0).notNull(),
  level: int("level").default(1).notNull(),
  currentStreak: int("currentStreak").default(0).notNull(),
  longestStreak: int("longestStreak").default(0).notNull(),
  shieldsAvailable: int("shieldsAvailable").default(0).notNull(),
  totalMissionsCompleted: int("totalMissionsCompleted").default(0).notNull(),
  lastCheckinDate: date("lastCheckinDate"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DadProfile = typeof dadProfiles.$inferSelect;

// ─── Father Profiles ──────────────────────────────────────────────────────────
export const fatherProfiles = mysqlTable("father_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  name: varchar("name", { length: 255 }),
  age: int("age"),
  location: varchar("location", { length: 255 }),
  preferredLanguage: varchar("preferredLanguage", { length: 10 }).default("en"),
  firstTimeDad: boolean("firstTimeDad").default(true),
  notificationPreferences: json("notificationPreferences"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FatherProfile = typeof fatherProfiles.$inferSelect;

// ─── Mother Profiles ──────────────────────────────────────────────────────────
export const motherProfiles = mysqlTable("mother_profiles", {
  id: int("id").autoincrement().primaryKey(),
  linkedFatherUserId: int("linkedFatherUserId").notNull(),
  name: varchar("name", { length: 255 }),
  dateOfBirth: timestamp("dateOfBirth"),
  estimatedDueDate: timestamp("estimatedDueDate"),
  pregnancyStartDate: timestamp("pregnancyStartDate"),
  currentPregnancyWeek: int("currentPregnancyWeek").default(1),
  bloodType: varchar("bloodType", { length: 10 }),
  allergies: text("allergies"),
  existingConditions: text("existingConditions"),
  currentMedications: text("currentMedications"),
  hospitalName: varchar("hospitalName", { length: 255 }),
  gpName: varchar("gpName", { length: 255 }),
  midwifeName: varchar("midwifeName", { length: 255 }),
  maternityTriageNumber: varchar("maternityTriageNumber", { length: 50 }),
  emergencyContactName: varchar("emergencyContactName", { length: 255 }),
  emergencyContactPhone: varchar("emergencyContactPhone", { length: 50 }),
  consentStatus: boolean("consentStatus").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MotherProfile = typeof motherProfiles.$inferSelect;

// ─── Health Records ───────────────────────────────────────────────────────────
export const healthRecords = mysqlTable("health_records", {
  id: int("id").autoincrement().primaryKey(),
  motherProfileId: int("motherProfileId").notNull(),
  recordedByUserId: int("recordedByUserId").notNull(),
  recordDate: timestamp("recordDate").defaultNow().notNull(),
  pregnancyWeek: int("pregnancyWeek"),
  systolicBp: int("systolicBp"),
  diastolicBp: int("diastolicBp"),
  bloodGlucose: decimal("bloodGlucose", { precision: 5, scale: 2 }),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  swellingLevel: mysqlEnum("swellingLevel", ["none", "mild", "moderate", "severe"]),
  fetalMovementCount: int("fetalMovementCount"),
  sleepQualityScore: int("sleepQualityScore"),
  waterIntakeMl: int("waterIntakeMl"),
  folicAcidTaken: boolean("folicAcidTaken").default(false),
  dhaTaken: boolean("dhaTaken").default(false),
  ironTaken: boolean("ironTaken").default(false),
  calciumTaken: boolean("calciumTaken").default(false),
  dietBalanceScore: int("dietBalanceScore"),
  moodTags: json("moodTags"),
  stressLevel: int("stressLevel"),
  anxietyLevel: int("anxietyLevel"),
  fatherNotes: text("fatherNotes"),
  symptoms: json("symptoms"),
  freeTextNotes: text("freeTextNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HealthRecord = typeof healthRecords.$inferSelect;

// ─── Risk Alerts ──────────────────────────────────────────────────────────────
export const riskAlerts = mysqlTable("risk_alerts", {
  id: int("id").autoincrement().primaryKey(),
  motherProfileId: int("motherProfileId").notNull(),
  healthRecordId: int("healthRecordId"),
  riskLevel: mysqlEnum("riskLevel", ["normal", "watch", "needs_attention", "urgent", "emergency"]).notNull(),
  riskCategory: varchar("riskCategory", { length: 100 }),
  title: varchar("title", { length: 255 }),
  explanation: text("explanation"),
  suggestedNextStep: text("suggestedNextStep"),
  emergencyGuidance: text("emergencyGuidance"),
  status: mysqlEnum("status", ["active", "acknowledged", "resolved"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
});

export type RiskAlert = typeof riskAlerts.$inferSelect;

// ─── Risk Rules ───────────────────────────────────────────────────────────────
export const riskRules = mysqlTable("risk_rules", {
  id: int("id").autoincrement().primaryKey(),
  ruleName: varchar("ruleName", { length: 255 }).notNull(),
  riskCategory: varchar("riskCategory", { length: 100 }),
  conditionJson: json("conditionJson"),
  riskLevel: mysqlEnum("riskLevel", ["normal", "watch", "needs_attention", "urgent", "emergency"]).notNull(),
  explanationTemplate: text("explanationTemplate"),
  suggestedNextStep: text("suggestedNextStep"),
  active: boolean("active").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RiskRule = typeof riskRules.$inferSelect;

// ─── Dad Game Profiles (Gamification v2) ─────────────────────────────────────
export const dadGameProfiles = mysqlTable("dad_game_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  xp: int("xp").default(0).notNull(),
  level: int("level").default(1).notNull(),
  title: varchar("title", { length: 100 }).default("Rookie Dad").notNull(),
  currentStreak: int("currentStreak").default(0).notNull(),
  longestStreak: int("longestStreak").default(0).notNull(),
  shieldsAvailable: int("shieldsAvailable").default(1).notNull(),
  lastActivityDate: varchar("lastActivityDate", { length: 10 }),
  totalMissionsCompleted: int("totalMissionsCompleted").default(0).notNull(),
  totalHealthLogs: int("totalHealthLogs").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DadGameProfile = typeof dadGameProfiles.$inferSelect;

// ─── Mission Templates ────────────────────────────────────────────────────────
export const missionTemplates = mysqlTable("mission_templates", {
  id: int("id").autoincrement().primaryKey(),
  pregnancyWeek: int("pregnancyWeek"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  actionType: mysqlEnum("actionType", [
    "log_health", "tick_checklist", "post_discussion",
    "save_appointment", "read_week_content", "write_reflection", "custom",
  ]).notNull(),
  xpReward: int("xpReward").default(20).notNull(),
  icon: varchar("icon", { length: 50 }).default("star"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MissionTemplate = typeof missionTemplates.$inferSelect;

// ─── Daily Missions ───────────────────────────────────────────────────────────
export const dailyMissions = mysqlTable("daily_missions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  missionDate: varchar("missionDate", { length: 10 }).notNull(),
  templateId: int("templateId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  actionType: varchar("actionType", { length: 50 }).notNull(),
  xpReward: int("xpReward").default(20).notNull(),
  icon: varchar("icon", { length: 50 }).default("star"),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyMission = typeof dailyMissions.$inferSelect;

// ─── XP Events ────────────────────────────────────────────────────────────────
export const xpEvents = mysqlTable("xp_events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  xpAwarded: int("xpAwarded").notNull(),
  reason: varchar("reason", { length: 255 }).notNull(),
  actionType: varchar("actionType", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type XpEvent = typeof xpEvents.$inferSelect;

// ─── Consultation Sessions ────────────────────────────────────────────────────
/**
 * A consultation session represents one doctor visit where the interpreter was used.
 */
export const consultationSessions = mysqlTable("consultation_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).default("Consultation").notNull(),
  dadLanguage: varchar("dadLanguage", { length: 10 }).default("zh").notNull(),
  doctorLanguage: varchar("doctorLanguage", { length: 10 }).default("en").notNull(),
  pregnancyWeek: int("pregnancyWeek"),
  status: mysqlEnum("status", ["active", "ended"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  endedAt: timestamp("endedAt"),
});
export type ConsultationSession = typeof consultationSessions.$inferSelect;

// ─── Consultation Messages ────────────────────────────────────────────────────
/**
 * Each message in a consultation session, with original text and translation.
 */
export const consultationMessages = mysqlTable("consultation_messages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  speaker: mysqlEnum("speaker", ["dad", "doctor"]).notNull(),
  originalText: text("originalText").notNull(),
  translatedText: text("translatedText").notNull(),
  originalLanguage: varchar("originalLanguage", { length: 10 }).notNull(),
  targetLanguage: varchar("targetLanguage", { length: 10 }).notNull(),
  inputMethod: mysqlEnum("inputMethod", ["text", "voice"]).default("text").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ConsultationMessage = typeof consultationMessages.$inferSelect;
