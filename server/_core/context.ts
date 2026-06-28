import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

// Demo user injected when no session is present — allows full app access without login
const DEMO_USER: User = {
  id: 30030,
  openId: "demo-user-papapath",
  name: "Alex (Demo Dad)",
  email: "alex@papapath.demo",
  loginMethod: "demo",
  role: "user",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
  lastSignedIn: new Date("2026-01-01T00:00:00Z"),
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  // Fall back to demo user so the app is fully accessible without login
  if (!user) {
    user = DEMO_USER;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
