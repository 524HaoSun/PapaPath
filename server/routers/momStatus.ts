/**
 * Mom Status Router
 *
 * Dad records mom's daily health data directly in this app.
 * AI summarizes the data for the homepage Mom Status and Dad's Weekly Plan cards.
 *
 * Data flow:
 *   Dad logs mom's daily health → mom_logs table → AI summarizes → homepage cards
 *
 * Caching: AI summaries cached once per day per user to control costs.
 * Fallback: When no live data exists, uses medically accurate preset data for the week.
 */

import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  aiSummaries,
  appointments,
  momLogs,
  pregnancies,
  symptoms,
} from "../../drizzle/schema";
import { getWeekData } from "./pregnancyPresets";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MomStatusOutput = {
  items: string[];
  careFocus: string;
  sentiment: "positive" | "neutral" | "needs_attention";
};

export type DadPlanOutput = {
  tasks: string[];
  priorityTask: string;
};

export type AiSummaryResponse = {
  momStatus: MomStatusOutput;
  dadPlan: DadPlanOutput;
  lastUpdated: string;
  weekNumber: number;
  dataSource: "live" | "yesterday" | "preset";
};

// ─── AI Prompt Builder ────────────────────────────────────────────────────────

function buildMomStatusPrompt(params: {
  weekNumber: number;
  trimesterName: string;
  daysUntilDue: number;
  babySize: string;
  hasLiveData: boolean;
  avgEnergy?: number;
  avgMood?: number;
  avgNausea?: number;
  avgSleep?: number;
  avgWater?: number;
  kickLogCount?: number;
  symptomList?: Array<{ label: string; severityLabel: string }>;
  upcomingAppointments?: Array<{ typeLabel: string; dateFormatted: string; dadAttending: boolean }>;
}): string {
  const {
    weekNumber,
    trimesterName,
    daysUntilDue,
    babySize,
    hasLiveData,
    avgEnergy,
    avgMood,
    avgNausea,
    avgSleep,
    avgWater,
    kickLogCount,
    symptomList = [],
    upcomingAppointments = [],
  } = params;

  const apptLines =
    upcomingAppointments.length > 0
      ? upcomingAppointments
          .map(
            (a) =>
              `- ${a.typeLabel} on ${a.dateFormatted}${a.dadAttending ? " (dad is attending)" : ""}`
          )
          .join("\n")
      : "No upcoming appointments this week.";

  const liveDataBlock = hasLiveData
    ? `Daily averages (past 7 days):
- Energy level: ${avgEnergy?.toFixed(1)}/10
- Mood score: ${avgMood?.toFixed(1)}/10
- Nausea level: ${avgNausea?.toFixed(1)}/10
- Sleep: ${avgSleep?.toFixed(1)} hours/night
- Hydration: ${avgWater} ml/day
- Kick counts logged: ${kickLogCount} times this week

Reported symptoms:
${symptomList.length > 0 ? symptomList.map((s) => `- ${s.label} (${s.severityLabel})`).join("\n") : "None reported"}`
    : `No live data available. Use medically accurate preset information for week ${weekNumber} of pregnancy.`;

  return `You are generating the "Mom Status" card for a pregnancy companion app shown to the DAD.
It tells him what his partner is experiencing this week in a warm, empathetic way.

## Current Context
- Pregnancy week: ${weekNumber} (${trimesterName})
- Days until due date: ${daysUntilDue}
- Baby size: approximately the size of a ${babySize}

## Mom's Health Data
${liveDataBlock}

## Upcoming Appointments
${apptLines}

## Output Format
Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "items": [
    "one status observation, max 10 words",
    "one status observation, max 10 words",
    "one status observation, max 10 words"
  ],
  "careFocus": "3-5 words, e.g. Rest & emotional support",
  "sentiment": "positive" | "neutral" | "needs_attention"
}

Rules:
- Be empathetic, warm, and non-alarmist
- If energy is low, mention it gently
- If an appointment is coming up that dad is attending, mention it
- Each item must be a complete, standalone observation`;
}

function buildDadPlanPrompt(params: {
  weekNumber: number;
  trimesterName: string;
  momStatusItems: string[];
  careFocus: string;
  upcomingAppointments?: Array<{ typeLabel: string; dateFormatted: string; dadAttending: boolean }>;
}): string {
  const { weekNumber, trimesterName, momStatusItems, careFocus, upcomingAppointments = [] } =
    params;

  const apptLines =
    upcomingAppointments.filter((a) => a.dadAttending).length > 0
      ? upcomingAppointments
          .filter((a) => a.dadAttending)
          .map((a) => `- ${a.typeLabel} on ${a.dateFormatted}`)
          .join("\n")
      : "None";

  return `You are generating the "Dad's Weekly Plan" card for a pregnancy companion app.
Give the dad 3 specific, actionable tasks for this week.

## Context
- Pregnancy week: ${weekNumber} (${trimesterName})
- Mom's status this week:
${momStatusItems.map((i) => `  • ${i}`).join("\n")}
- Care focus: ${careFocus}

## Appointments Dad Should Attend
${apptLines}

## Output Format
Return ONLY a valid JSON object (no markdown, no explanation):
{
  "tasks": [
    "actionable task starting with a verb, max 12 words",
    "actionable task starting with a verb, max 12 words",
    "actionable task starting with a verb, max 12 words"
  ],
  "priorityTask": "the single most important task this week, max 12 words"
}

Rules:
1. First task: directly address the highest-concern symptom or status item
2. Second task: a proactive care gesture (massage, meal prep, emotional check-in)
3. Third task: a practical/logistical task (appointment prep, research, purchase)
4. If dad has an appointment to attend, make it the priority task
5. All tasks must start with a verb (e.g., "Ask", "Prepare", "Attend", "Offer")`;
}

// ─── Helper: Symptom code → readable label ────────────────────────────────────

const SYMPTOM_LABELS: Record<string, string> = {
  back_pain: "Back pain",
  headache: "Headache",
  heartburn: "Heartburn",
  nausea: "Nausea",
  swelling: "Swelling",
  fatigue: "Fatigue",
  cramps: "Cramps",
  spotting: "Spotting",
  shortness_of_breath: "Shortness of breath",
  insomnia: "Insomnia",
  constipation: "Constipation",
  braxton_hicks: "Braxton Hicks contractions",
  pelvic_pressure: "Pelvic pressure",
  mood_swings: "Mood swings",
  food_aversion: "Food aversion",
};

// ─── Helper: Calculate trimester name ─────────────────────────────────────────

function getTrimesterName(week: number): string {
  if (week <= 13) return "First trimester";
  if (week <= 26) return "Second trimester";
  return "Third trimester";
}

// ─── Helper: Calculate current week from due date ─────────────────────────────

function calcCurrentWeek(dueDate: string | Date): number {
  const due = new Date(dueDate);
  const now = new Date();
  const daysUntilDue = Math.round((due.getTime() - now.getTime()) / 86400000);
  const weeksRemaining = Math.ceil(daysUntilDue / 7);
  const week = 40 - weeksRemaining;
  return Math.max(1, Math.min(40, week));
}

// ─── Main Router ──────────────────────────────────────────────────────────────

export const momStatusRouter = router({
  /**
   * Get the AI-generated Mom Status + Dad's Weekly Plan for the current week.
   * Uses cached summary if available (refreshed once per day).
   * Falls back to preset data when no live mom data exists.
   */
  getSummary: publicProcedure
    .input(z.object({ weekNumber: z.number().min(1).max(40) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const today = new Date().toISOString().split("T")[0]!;

      // 1. Find pregnancy record for this dad (only if authenticated)
      let pregnancyId: number | null = null;
      let dueDate: string | null = null;
      let babyNickname: string | null = null;
      let partnerName: string | null = null;

      if (db && ctx.user) {
        const pregnancyRows = await db
          .select()
          .from(pregnancies)
          .where(eq(pregnancies.userId, ctx.user.id))
          .limit(1);

        if (pregnancyRows.length > 0) {
          pregnancyId = pregnancyRows[0]!.id;
          const rawDue = pregnancyRows[0]!.dueDate;
          dueDate = rawDue instanceof Date
            ? rawDue.toISOString().split("T")[0]!
            : String(rawDue);
          babyNickname = pregnancyRows[0]!.babyNickname ?? null;
          partnerName = pregnancyRows[0]!.partnerName ?? null;
        }
      }

      // 2. Check for a cached summary from today
      if (db && ctx.user) {
        const cached = await db
          .select()
          .from(aiSummaries)
          .where(
            and(
              eq(aiSummaries.userId, ctx.user.id),
              sql`DATE(${aiSummaries.summaryDate}) = ${today}`,
              eq(aiSummaries.weekNumber, input.weekNumber)
            )
          )
          .limit(1);

        if (cached.length > 0) {
          const row = cached[0]!;
          return {
            momStatus: row.momStatusJson as MomStatusOutput,
            dadPlan: row.dadPlanJson as DadPlanOutput,
            lastUpdated: row.createdAt.toISOString(),
            weekNumber: row.weekNumber,
            dataSource: row.dataSource ?? "preset",
            dueDate,
            babyNickname,
            partnerName,
          };
        }
      }

      // 3. Gather live health data (dad's logs for mom)
      let hasLiveData = false;
      let avgEnergy: number | undefined;
      let avgMood: number | undefined;
      let avgNausea: number | undefined;
      let avgSleep: number | undefined;
      let avgWater: number | undefined;
      let kickLogCount = 0;
      let symptomList: Array<{ label: string; severityLabel: string }> = [];
      let upcomingAppointments: Array<{
        typeLabel: string;
        dateFormatted: string;
        dadAttending: boolean;
      }> = [];
      let dataSource: "live" | "yesterday" | "preset" = "preset";

      if (db && ctx.user) {
        // Get last 7 days of mom logs
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0]!;

        const logs = await db
          .select()
          .from(momLogs)
          .where(
            and(
              eq(momLogs.userId, ctx.user.id),
              sql`${momLogs.logDate} >= ${sevenDaysAgoStr}`
            )
          )
          .orderBy(desc(momLogs.logDate));

        if (logs.length > 0) {
          hasLiveData = true;
          const logDateStr = logs[0]!.logDate instanceof Date
            ? logs[0]!.logDate.toISOString().split("T")[0]
            : String(logs[0]!.logDate);
          dataSource = logDateStr === today ? "live" : "yesterday";

          const validEnergy = logs.filter((l) => l.energyLevel != null);
          const validMood = logs.filter((l) => l.moodScore != null);
          const validNausea = logs.filter((l) => l.nauseaLevel != null);
          const validSleep = logs.filter((l) => l.sleepHours != null);
          const validWater = logs.filter((l) => l.waterMl != null);

          avgEnergy =
            validEnergy.length > 0
              ? validEnergy.reduce((s, l) => s + l.energyLevel!, 0) / validEnergy.length
              : undefined;
          avgMood =
            validMood.length > 0
              ? validMood.reduce((s, l) => s + l.moodScore!, 0) / validMood.length
              : undefined;
          avgNausea =
            validNausea.length > 0
              ? validNausea.reduce((s, l) => s + l.nauseaLevel!, 0) / validNausea.length
              : undefined;
          avgSleep =
            validSleep.length > 0
              ? validSleep.reduce((s, l) => s + Number(l.sleepHours!), 0) / validSleep.length
              : undefined;
          avgWater =
            validWater.length > 0
              ? Math.round(
                  validWater.reduce((s, l) => s + l.waterMl!, 0) / validWater.length
                )
              : undefined;
          kickLogCount = logs.filter((l) => l.kickCount != null && l.kickCount > 0).length;

          // Get symptoms for these logs
          const logIds = logs.map((l) => l.id);
          if (logIds.length > 0) {
            const symptomRows = await db
              .select()
              .from(symptoms)
              .where(sql`${symptoms.logId} IN (${logIds.join(",")})`);

            // Deduplicate and pick highest severity per code
            const symptomMap = new Map<string, string>();
            const severityOrder = ["mild", "moderate", "severe"];
            for (const s of symptomRows) {
              const existing = symptomMap.get(s.code);
              if (!existing || severityOrder.indexOf(s.severity) > severityOrder.indexOf(existing)) {
                symptomMap.set(s.code, s.severity);
              }
            }
            symptomList = Array.from(symptomMap.entries()).map(([code, severity]) => ({
              label: SYMPTOM_LABELS[code] ?? code,
              severityLabel: severity,
            }));
          }
        }

        // Get upcoming appointments (next 14 days)
        const apptRows = await db
          .select()
          .from(appointments)
          .where(
            and(
              eq(appointments.userId, ctx.user.id),
              sql`${appointments.scheduledAt} >= NOW()`
            )
          )
          .orderBy(appointments.scheduledAt)
          .limit(3);

        upcomingAppointments = apptRows.map((a) => ({
          typeLabel:
            a.type.charAt(0).toUpperCase() + a.type.slice(1).replace("_", " ") + " appointment",
          dateFormatted: new Date(a.scheduledAt).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
          dadAttending: a.dadAttending ?? true,
        }));
      }

      // 4. Get preset data for the week (used as fallback context)
      const presetData = getWeekData(input.weekNumber);
      const daysUntilDue = dueDate
        ? Math.max(0, Math.round((new Date(dueDate).getTime() - Date.now()) / 86400000))
        : (40 - input.weekNumber) * 7;

      // 5. Generate AI summary
      const momStatusPrompt = buildMomStatusPrompt({
        weekNumber: input.weekNumber,
        trimesterName: getTrimesterName(input.weekNumber),
        daysUntilDue,
        babySize: presetData.babySize,
        hasLiveData,
        avgEnergy,
        avgMood,
        avgNausea,
        avgSleep,
        avgWater,
        kickLogCount,
        symptomList,
        upcomingAppointments,
      });

      let momStatus: MomStatusOutput;
      let dadPlan: DadPlanOutput;

      try {
        const momResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are a compassionate pregnancy companion AI. Always respond with valid JSON only, no markdown.",
            },
            { role: "user", content: momStatusPrompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "mom_status",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    items: { type: "string" },
                    description: "3 status observations about mom",
                  },
                  careFocus: { type: "string", description: "3-5 word care focus phrase" },
                  sentiment: {
                    type: "string",
                    enum: ["positive", "neutral", "needs_attention"],
                  },
                },
                required: ["items", "careFocus", "sentiment"],
                additionalProperties: false,
              },
            },
          },
        });

        const momContent = (momResponse.choices[0]?.message?.content as string) ?? "{}";
        momStatus = JSON.parse(momContent) as MomStatusOutput;
      } catch {
        // Fallback to preset
        momStatus = {
          items: presetData.momStatus.items,
          careFocus: presetData.momStatus.careFocus,
          sentiment: "neutral",
        };
      }

      const dadPlanPrompt = buildDadPlanPrompt({
        weekNumber: input.weekNumber,
        trimesterName: getTrimesterName(input.weekNumber),
        momStatusItems: momStatus.items,
        careFocus: momStatus.careFocus,
        upcomingAppointments,
      });

      try {
        const dadResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are a compassionate pregnancy companion AI. Always respond with valid JSON only, no markdown.",
            },
            { role: "user", content: dadPlanPrompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "dad_plan",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  tasks: {
                    type: "array",
                    items: { type: "string" },
                    description: "3 actionable tasks for dad",
                  },
                  priorityTask: { type: "string", description: "The single most important task" },
                },
                required: ["tasks", "priorityTask"],
                additionalProperties: false,
              },
            },
          },
        });

        const dadContent = (dadResponse.choices[0]?.message?.content as string) ?? "{}";
        dadPlan = JSON.parse(dadContent) as DadPlanOutput;
      } catch {
        dadPlan = {
          tasks: presetData.dadPlan.tasks,
          priorityTask: presetData.dadPlan.priorityTask,
        };
      }

      // 6. Cache the result (only for authenticated users)
      if (db && ctx.user) {
        try {
          await db.insert(aiSummaries).values({
            userId: ctx.user.id,
            weekNumber: input.weekNumber,
            summaryDate: new Date(today),
            momStatusJson: momStatus,
            dadPlanJson: dadPlan,
            dataSource,
          });
        } catch {
          // Cache write failure is non-fatal
        }
      }

      return {
        momStatus,
        dadPlan,
        lastUpdated: new Date().toISOString(),
        weekNumber: input.weekNumber,
        dataSource,
        dueDate,
        babyNickname,
        partnerName,
      };
    }),

  /**
   * Get the last 7 days of health trend data for the mini-chart.
   */
  getWeekTrend: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0]!;

    const logs = await db
      .select({
        logDate: momLogs.logDate,
        energyLevel: momLogs.energyLevel,
        moodScore: momLogs.moodScore,
        nauseaLevel: momLogs.nauseaLevel,
        kickCount: momLogs.kickCount,
      })
      .from(momLogs)
      .where(
        and(
          eq(momLogs.userId, ctx.user.id),
          sql`${momLogs.logDate} >= ${sevenDaysAgoStr}`
        )
      )
      .orderBy(momLogs.logDate);

    return logs;
  }),

  /**
   * Log today's mom health status (upsert — one log per day per user).
   */
  logToday: protectedProcedure
    .input(
      z.object({
        weekNumber: z.number().min(1).max(40),
        energyLevel: z.number().min(1).max(10).optional(),
        moodScore: z.number().min(1).max(10).optional(),
        nauseaLevel: z.number().min(1).max(10).optional(),
        anxietyScore: z.number().min(1).max(10).optional(),
        painLevel: z.number().min(1).max(10).optional(),
        sleepHours: z.number().min(0).max(24).optional(),
        waterMl: z.number().min(0).max(5000).optional(),
        kickCount: z.number().min(0).max(200).optional(),
        weightKg: z.number().min(30).max(200).optional(),
        notes: z.string().max(2000).optional(),
        symptoms: z
          .array(
            z.object({
              code: z.string(),
              severity: z.enum(["mild", "moderate", "severe"]),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const today = new Date().toISOString().split("T")[0]!;
      const { symptoms: symptomInput, ...logFields } = input;

      // Check if a log already exists for today
      const existing = await db
        .select()
        .from(momLogs)
        .where(
          and(
            eq(momLogs.userId, ctx.user.id),
            sql`DATE(${momLogs.logDate}) = ${today}`
          )
        )
        .limit(1);

      let logId: number;

      if (existing.length > 0) {
        // Update existing log
        await db
          .update(momLogs)
          .set({
            weekNumber: logFields.weekNumber,
            energyLevel: logFields.energyLevel,
            moodScore: logFields.moodScore,
            nauseaLevel: logFields.nauseaLevel,
            anxietyScore: logFields.anxietyScore,
            painLevel: logFields.painLevel,
            sleepHours: logFields.sleepHours != null ? String(logFields.sleepHours) : undefined,
            waterMl: logFields.waterMl,
            kickCount: logFields.kickCount,
            weightKg: logFields.weightKg != null ? String(logFields.weightKg) : undefined,
            notes: logFields.notes,
          })
          .where(eq(momLogs.id, existing[0]!.id));
        logId = existing[0]!.id;
      } else {
        // Insert new log
        const result = await db.insert(momLogs).values({
          userId: ctx.user.id,
          logDate: new Date(today),
          weekNumber: logFields.weekNumber,
          energyLevel: logFields.energyLevel,
          moodScore: logFields.moodScore,
          nauseaLevel: logFields.nauseaLevel,
          anxietyScore: logFields.anxietyScore,
          painLevel: logFields.painLevel,
          sleepHours: logFields.sleepHours != null ? String(logFields.sleepHours) : undefined,
          waterMl: logFields.waterMl,
          kickCount: logFields.kickCount,
          weightKg: logFields.weightKg != null ? String(logFields.weightKg) : undefined,
          notes: logFields.notes,
        });
        logId = Number((result as { insertId?: number | bigint }).insertId ?? 0);
      }

      // Replace symptoms for today
      if (symptomInput !== undefined) {
        // Delete existing symptoms for this log
        await db.delete(symptoms).where(eq(symptoms.logId, logId));

        // Insert new symptoms
        if (symptomInput.length > 0) {
          await db.insert(symptoms).values(
            symptomInput.map((s) => ({
              logId,
              userId: ctx.user.id,
              code: s.code,
              severity: s.severity,
            }))
          );
        }
      }

      // Invalidate today's AI summary cache so next getSummary regenerates
      await db
        .delete(aiSummaries)
        .where(
          and(
            eq(aiSummaries.userId, ctx.user.id),
            sql`DATE(${aiSummaries.summaryDate}) = ${today}`
          )
        );

      return { success: true, logId };
    }),

  /**
   * Get today's mom log for form pre-fill.
   */
  getTodayLog: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const today = new Date().toISOString().split("T")[0]!;

    const logs = await db
      .select()
      .from(momLogs)
      .where(
        and(
          eq(momLogs.userId, ctx.user.id),
          sql`DATE(${momLogs.logDate}) = ${today}`
        )
      )
      .limit(1);

    if (logs.length === 0) return null;

    const log = logs[0]!;

    // Get symptoms for this log
    const symptomRows = await db
      .select()
      .from(symptoms)
      .where(eq(symptoms.logId, log.id));

    return {
      ...log,
      symptoms: symptomRows.map((s) => ({ code: s.code, severity: s.severity })),
    };
  }),

  /**
   * Get the pregnancy profile for this dad (for setup / display).
   */
  getPregnancy: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const rows = await db
      .select()
      .from(pregnancies)
      .where(eq(pregnancies.userId, ctx.user.id))
      .limit(1);

    if (rows.length === 0) return null;

    const row = rows[0]!;
    return {
      id: row.id,
      dueDate: row.dueDate instanceof Date
        ? row.dueDate.toISOString().split("T")[0]!
        : String(row.dueDate),
      babyNickname: row.babyNickname ?? null,
      partnerName: row.partnerName ?? null,
      lmpDate: row.lmpDate instanceof Date
        ? row.lmpDate.toISOString().split("T")[0]!
        : row.lmpDate ? String(row.lmpDate) : null,
      currentWeek: calcCurrentWeek(row.dueDate),
    };
  }),

  /**
   * Save / upsert the pregnancy profile.
   */
  savePregnancy: protectedProcedure
    .input(
      z.object({
        dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
        babyNickname: z.string().max(64).optional(),
        partnerName: z.string().max(128).optional(),
        lmpDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD")
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const existing = await db
        .select()
        .from(pregnancies)
        .where(eq(pregnancies.userId, ctx.user.id))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(pregnancies)
          .set({
            dueDate: new Date(input.dueDate),
            babyNickname: input.babyNickname,
            partnerName: input.partnerName,
            lmpDate: input.lmpDate ? new Date(input.lmpDate) : undefined,
          })
          .where(eq(pregnancies.userId, ctx.user.id));
      } else {
        await db.insert(pregnancies).values({
          userId: ctx.user.id,
          dueDate: new Date(input.dueDate),
          babyNickname: input.babyNickname,
          partnerName: input.partnerName,
          lmpDate: input.lmpDate ? new Date(input.lmpDate) : undefined,
        });
      }

      return { success: true };
    }),
});
