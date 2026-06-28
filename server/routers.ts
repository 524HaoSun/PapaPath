import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { momStatusRouter } from "./routers/momStatus";
import { healthRouter } from "./routers/health";
import { profileRouter } from "./routers/profile";
import { gamificationRouter } from "./routers/gamification";
import { communityRouter } from "./routers/community";
import { consultationRouter } from "./routers/consultation";
import { reportsRouter } from "./routers/reports";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  momStatus: momStatusRouter,
  health: healthRouter,
  profile: profileRouter,
  gamification: gamificationRouter,
  community: communityRouter,
  consultation: consultationRouter,
  reports: reportsRouter,
});

export type AppRouter = typeof appRouter;
