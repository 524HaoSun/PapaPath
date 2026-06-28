import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { runRiskEngine } from "../riskEngine";
import * as gami from "../gamification";

// ─── Demo data (shown when no real records exist) ─────────────────────────────
const DEMO_HEALTH_RECORDS = (() => {
  const today = new Date();
  const seed: [number,number,number,number,number,number,number,number,number][] = [
    [108,70,4.6,61.2,8, 4,1550,8,7],
    [110,71,4.7,61.4,9, 3,1600,8,7],
    [109,70,4.5,61.5,9, 4,1700,7,6],
    [111,72,4.8,61.7,10,3,1650,7,6],
    [110,71,4.6,61.9,10,4,1800,7,6],
    [112,73,4.9,62.0,11,4,1750,6,6],
    [111,72,4.7,62.2,11,3,1600,6,5],
    [113,73,5.0,62.3,12,4,1900,6,5],
    [112,72,4.8,62.5,12,4,1850,6,5],
    [114,74,5.1,62.6,13,3,1700,7,6],
    [113,73,4.9,62.8,13,4,1950,5,5],
    [115,74,4.8,63.0,14,4,2000,5,5],
    [114,73,4.7,63.1,14,5,2100,5,4],
    [116,75,5.0,63.3,15,4,1900,5,4],
    [115,74,4.8,63.4,15,4,2000,5,4],
    [117,75,5.2,63.6,16,3,1800,6,5],
    [116,74,5.0,63.7,16,4,2050,5,4],
    [118,76,5.1,63.9,17,4,2100,5,4],
    [117,75,4.9,64.0,17,5,2200,4,4],
    [119,76,5.0,64.2,18,4,2000,4,3],
    [118,75,4.8,64.3,18,5,2150,4,3],
    [120,77,5.1,64.5,19,4,2100,4,3],
    [119,76,4.9,64.6,19,5,2200,5,4],
    [121,77,5.0,64.8,20,4,2000,4,3],
    [120,76,4.8,65.0,20,5,2250,3,3],
    [122,78,5.2,65.1,21,4,2100,4,3],
    [121,77,5.0,65.3,21,5,2200,4,3],
    [123,78,5.1,65.4,22,5,2300,3,3],
  ];
  const moodSets = [
    ["Hopeful","Tired"],["Calm","Energetic"],["Anxious","Tired"],
    ["Happy","Calm"],["Tired"],["Hopeful","Calm"],["Energetic"],
    ["Calm"],["Emotional","Hopeful"],["Happy","Energetic"],
  ];
  const notesMap: Record<number,string> = {
    2: "She had a tough morning with nausea but felt better by afternoon.",
    6: "She mentioned feeling more tired than usual today. Made her a warm bath.",
    10: "Glucose was slightly higher — reminded her to avoid sugary snacks.",
    14: "Baby was very active tonight! We both felt the kicks.",
    18: "BP a little high — encouraged her to rest and called the midwife.",
    22: "Great day — she said she felt the most energetic this week.",
    26: "Counted 21 fetal movements in an hour. Midwife said that's excellent.",
    27: "She's been sleeping better. New pillow arrangement really helped.",
  };
  return seed.map(([sys,dia,gluc,wt,fetal,sleep,water,stress,anxiety], i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (27 - i));
    const week = 22 + Math.floor(i / 4);
    return {
      id: -(i + 1), // negative IDs to distinguish from real records
      motherProfileId: 0,
      recordedByUserId: 0,
      recordDate: d,
      pregnancyWeek: week,
      systolicBp: sys,
      diastolicBp: dia,
      bloodGlucose: String(gluc.toFixed(1)),
      weight: String(wt.toFixed(1)),
      swellingLevel: (i < 8 ? "none" : i < 18 ? "mild" : i < 24 ? "none" : "mild") as "none"|"mild"|"moderate"|"severe",
      fetalMovementCount: fetal,
      sleepQualityScore: sleep,
      waterIntakeMl: water,
      folicAcidTaken: true,
      dhaTaken: i % 2 === 0,
      ironTaken: true,
      calciumTaken: i % 3 !== 0,
      dietBalanceScore: null,
      moodTags: moodSets[i % moodSets.length],
      stressLevel: stress,
      anxietyLevel: anxiety,
      fatherNotes: notesMap[i] ?? null,
      symptoms: i === 9 ? ["headache"] : i === 17 ? ["dizziness"] : [],
      freeTextNotes: null,
      createdAt: d,
      updatedAt: d,
    };
  });
})();

export const healthRouter = router({
  create: protectedProcedure
    .input(z.object({
      systolicBp: z.number().optional(),
      diastolicBp: z.number().optional(),
      bloodGlucose: z.number().optional(),
      weight: z.number().optional(),
      swellingLevel: z.enum(["none", "mild", "moderate", "severe"]).optional(),
      fetalMovementCount: z.number().optional(),
      sleepQualityScore: z.number().min(1).max(5).optional(),
      waterIntakeMl: z.number().optional(),
      folicAcidTaken: z.boolean().optional(),
      dhaTaken: z.boolean().optional(),
      ironTaken: z.boolean().optional(),
      calciumTaken: z.boolean().optional(),
      dietBalanceScore: z.number().min(1).max(5).optional(),
      moodTags: z.array(z.string()).optional(),
      stressLevel: z.number().min(1).max(10).optional(),
      anxietyLevel: z.number().min(1).max(10).optional(),
      fatherNotes: z.string().optional(),
      symptoms: z.array(z.string()).optional(),
      freeTextNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      let mother = await db.getMotherProfile(ctx.user.id);
      if (!mother) {
        // Auto-create a minimal mother profile so Log Today works as soon as
        // the user has set a due date in Settings (via momStatus.savePregnancy).
        // If they haven't set a due date yet, we still block with a clear message.
        const { getDb } = await import('../db');
        const { pregnancies } = await import('../../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        const dbConn = await getDb();
        const pregRows = dbConn
          ? await dbConn.select().from(pregnancies).where(eq(pregnancies.userId, ctx.user.id)).limit(1)
          : [];
        const preg = pregRows[0];
        if (!preg?.dueDate) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Please set your partner's due date in Settings first." });
        }
        mother = await db.upsertMotherProfile(ctx.user.id, {
          name: preg.partnerName ?? undefined,
          estimatedDueDate: new Date(preg.dueDate),
        });
        if (!mother) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Could not create partner profile." });
      }

      let currentWeek = mother.currentPregnancyWeek ?? 1;
      if (mother.estimatedDueDate) {
        const dueDate = new Date(mother.estimatedDueDate);
        const daysRemaining = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        currentWeek = Math.max(1, Math.min(40, 40 - Math.floor(daysRemaining / 7)));
      }

      const record = await db.createHealthRecord({
        motherProfileId: mother.id,
        recordedByUserId: ctx.user.id,
        pregnancyWeek: currentWeek,
        ...input,
        // decimal columns in schema are stored as strings in drizzle mysql
        bloodGlucose: input.bloodGlucose != null ? String(input.bloodGlucose) : undefined,
        weight: input.weight != null ? String(input.weight) : undefined,
        moodTags: input.moodTags ?? [],
        symptoms: input.symptoms ?? [],
      });

      // Run risk engine
      const riskResult = await runRiskEngine({
        systolicBp: input.systolicBp,
        diastolicBp: input.diastolicBp,
        bloodGlucose: input.bloodGlucose,
        swellingLevel: input.swellingLevel,
        fetalMovementCount: input.fetalMovementCount,
        symptoms: input.symptoms ?? [],
        stressLevel: input.stressLevel,
        anxietyLevel: input.anxietyLevel,
      });

      let riskAlert = null;
      if (riskResult.riskLevel !== "normal") {
        riskAlert = await db.createRiskAlert({
          motherProfileId: mother.id,
          healthRecordId: record?.id,
          riskLevel: riskResult.riskLevel,
          riskCategory: riskResult.riskCategory,
          title: riskResult.title,
          explanation: riskResult.explanation,
          suggestedNextStep: riskResult.suggestedNextStep,
          emergencyGuidance: riskResult.emergencyGuidance,
        });
      }

      return { record, riskResult, riskAlert };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    // Always return demo data as the base (28 days of realistic progression).
    // Real records submitted by the user are appended on top so they appear
    // in the chart and Recent Entries list alongside the demo data.
    const mother = await db.getMotherProfile(ctx.user.id);
    if (!mother) return DEMO_HEALTH_RECORDS;
    const realRecords = await db.getHealthRecords(mother.id);
    if (realRecords.length === 0) return DEMO_HEALTH_RECORDS;
    // Merge: demo records first (oldest), then real records (newest)
    // Cast demo records to match the real record type shape
    return [...(DEMO_HEALTH_RECORDS as typeof realRecords), ...realRecords];
  }),

  latest: protectedProcedure.query(async ({ ctx }) => {
    const mother = await db.getMotherProfile(ctx.user.id);
    if (!mother) return null;
    return db.getLatestHealthRecord(mother.id);
  }),

  trends: protectedProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      const mother = await db.getMotherProfile(ctx.user.id);
      if (!mother) return [];
      return db.getHealthTrends(mother.id, input.days);
    }),

  checkRisk: protectedProcedure
    .input(z.object({
      systolicBp: z.number().optional(),
      diastolicBp: z.number().optional(),
      bloodGlucose: z.number().optional(),
      swellingLevel: z.string().optional(),
      fetalMovementCount: z.number().optional(),
      symptoms: z.array(z.string()).optional(),
      stressLevel: z.number().optional(),
      anxietyLevel: z.number().optional(),
    }))
    .mutation(({ input }) => runRiskEngine(input)),

  riskHistory: protectedProcedure.query(async ({ ctx }) => {
    const mother = await db.getMotherProfile(ctx.user.id);
    if (!mother) return [];
    return db.getRiskAlertHistory(mother.id);
  }),
});
