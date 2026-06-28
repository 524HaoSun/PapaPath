import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import * as gami from "../gamification";

export const gamificationRouter = router({
  getProfile: protectedProcedure.query(({ ctx }) =>
    gami.getOrCreateGameProfile(ctx.user.id)
  ),

  getLevels: publicProcedure.query(() => gami.LEVELS),

  getTodaysMissions: protectedProcedure
    .input(z.object({ pregnancyWeek: z.number().optional() }))
    .query(({ ctx, input }) =>
      gami.getTodaysMissions(ctx.user.id, input.pregnancyWeek)
    ),

  completeMission: protectedProcedure
    .input(z.object({ missionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await gami.recordActivity(ctx.user.id);
      return gami.completeMission(ctx.user.id, input.missionId);
    }),

  awardXp: protectedProcedure
    .input(z.object({
      amount: z.number(),
      reason: z.string(),
      actionType: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await gami.recordActivity(ctx.user.id);
      return gami.awardXp(ctx.user.id, input.amount, input.reason, input.actionType);
    }),

  recordActivity: protectedProcedure.mutation(({ ctx }) =>
    gami.recordActivity(ctx.user.id)
  ),

  getXpHistory: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(({ ctx, input }) => gami.getXpHistory(ctx.user.id, input.limit)),
});
