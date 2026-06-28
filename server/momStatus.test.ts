import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

// ─── Mock the database to avoid real DB calls in unit tests ──────────────────

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

// ─── Context helpers ──────────────────────────────────────────────────────────

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

function createAuthContext(userId = 1): TrpcContext {
  const user: User = {
    id: userId,
    openId: "test-open-id",
    email: "test@example.com",
    name: "Test Dad",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("momStatus.getSummary", () => {
  it("returns preset data for unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.momStatus.getSummary({ weekNumber: 15 });

    expect(result).toBeDefined();
    expect(result.weekNumber).toBe(15);
    expect(result.dataSource).toBe("preset");
    expect(result.momStatus).toBeDefined();
    expect(result.momStatus.items).toBeInstanceOf(Array);
    expect(result.momStatus.items.length).toBeGreaterThan(0);
    expect(result.momStatus.careFocus).toBeTruthy();
    expect(result.dadPlan).toBeDefined();
    expect(result.dadPlan.tasks).toBeInstanceOf(Array);
    expect(result.dadPlan.tasks.length).toBeGreaterThan(0);
  });

  it("returns preset data for week 1 (early pregnancy)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.momStatus.getSummary({ weekNumber: 1 });

    expect(result.weekNumber).toBe(1);
    expect(result.dataSource).toBe("preset");
    expect(result.momStatus.items.length).toBeGreaterThan(0);
  });

  it("returns preset data for week 40 (full term)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.momStatus.getSummary({ weekNumber: 40 });

    expect(result.weekNumber).toBe(40);
    expect(result.dataSource).toBe("preset");
    expect(result.momStatus.items.length).toBeGreaterThan(0);
  });

  it("returns null dueDate and babyNickname for unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.momStatus.getSummary({ weekNumber: 20 });

    expect(result.dueDate).toBeNull();
    expect(result.babyNickname).toBeNull();
  });

  it("returns preset data for authenticated user with no DB (DB returns null)", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.momStatus.getSummary({ weekNumber: 20 });

    expect(result.weekNumber).toBe(20);
    expect(result.dataSource).toBe("preset");
    expect(result.momStatus.items.length).toBeGreaterThan(0);
  });
});

describe("momStatus.getWeekTrend", () => {
  it("returns empty array when DB is unavailable", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.momStatus.getWeekTrend();

    expect(result).toEqual([]);
  });
});

describe("momStatus.getTodayLog", () => {
  it("returns null when DB is unavailable", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.momStatus.getTodayLog();

    expect(result).toBeNull();
  });
});

describe("momStatus.getPregnancy", () => {
  it("returns null when DB is unavailable", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.momStatus.getPregnancy();

    expect(result).toBeNull();
  });
});

describe("momStatus.logToday", () => {
  it("throws when DB is unavailable", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.momStatus.logToday({
        weekNumber: 15,
        energyLevel: 7,
        moodScore: 8,
        nauseaLevel: 3,
      })
    ).rejects.toThrow("Database unavailable");
  });
});

describe("momStatus.savePregnancy", () => {
  it("throws when DB is unavailable", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.momStatus.savePregnancy({
        dueDate: "2025-09-15",
        babyNickname: "Peanut",
        partnerName: "Sarah",
      })
    ).rejects.toThrow("Database unavailable");
  });

  it("rejects invalid due date format", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.momStatus.savePregnancy({
        dueDate: "not-a-date",
      })
    ).rejects.toThrow();
  });
});
