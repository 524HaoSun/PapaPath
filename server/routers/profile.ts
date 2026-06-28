import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const profileRouter = router({
  getFather: protectedProcedure.query(({ ctx }) => db.getFatherProfile(ctx.user.id)),

  upsertFather: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      age: z.number().optional(),
      location: z.string().optional(),
      firstTimeDad: z.boolean().optional(),
      notificationPreferences: z.any().optional(),
    }))
    .mutation(({ ctx, input }) => db.upsertFatherProfile(ctx.user.id, input)),

  getMother: protectedProcedure.query(({ ctx }) => db.getMotherProfile(ctx.user.id)),

  upsertMother: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      estimatedDueDate: z.date().optional(),
      pregnancyStartDate: z.date().optional(),
      bloodType: z.string().optional(),
      allergies: z.string().optional(),
      existingConditions: z.string().optional(),
      currentMedications: z.string().optional(),
      hospitalName: z.string().optional(),
      gpName: z.string().optional(),
      midwifeName: z.string().optional(),
      maternityTriageNumber: z.string().optional(),
      emergencyContactName: z.string().optional(),
      emergencyContactPhone: z.string().optional(),
      consentStatus: z.boolean().optional(),
    }))
    .mutation(({ ctx, input }) => db.upsertMotherProfile(ctx.user.id, input)),
});
