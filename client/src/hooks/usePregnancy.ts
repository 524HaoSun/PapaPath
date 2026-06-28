/**
 * usePregnancy — Single Source of Truth for pregnancy week data
 *
 * Fetches due date and current week from the database via tRPC.
 * All pages should use this hook instead of hardcoding week numbers.
 *
 * Returns:
 *   currentWeek   — calculated from due date (1–40), defaults to DEMO_WEEK if not set
 *   dueDate       — ISO date string "YYYY-MM-DD", defaults to demo date if not set
 *   dueDateFormatted — human-readable "12 Sep 2025"
 *   babyNickname  — from DB, or demo default
 *   partnerName   — mom's name from DB, or demo default
 *   isLoading     — true while fetching
 *   hasProfile    — true only if user has set a real due date in Settings
 */

import { useMemo } from "react";
import { trpc } from "@/lib/trpc";

function formatDueDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

// ─── Demo defaults (shown when no real pregnancy profile is configured) ────────
// Week 26 of pregnancy, due date ~14 weeks from now
const DEMO_WEEK = 26;
const DEMO_DUE_DATE = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 98); // 14 weeks ≈ week 26 → due in 14 weeks
  return d.toISOString().split("T")[0]!;
})();
const DEMO_BABY_NICKNAME = "Little Bean";
const DEMO_PARTNER_NAME = "Sarah";

export function usePregnancy() {
  const { data, isLoading } = trpc.momStatus.getPregnancy.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
    retry: false,
  });

  // Use real data if available, otherwise fall back to demo defaults
  const hasRealProfile = !!data?.dueDate;
  const currentWeek = data?.currentWeek ?? DEMO_WEEK;
  const dueDate = data?.dueDate ?? DEMO_DUE_DATE;
  const dueDateFormatted = useMemo(() => formatDueDate(dueDate), [dueDate]);
  const babyNickname = data?.babyNickname ?? DEMO_BABY_NICKNAME;
  const partnerName = data?.partnerName ?? DEMO_PARTNER_NAME;
  const hasProfile = hasRealProfile; // only true when user has configured real data

  return {
    currentWeek,
    dueDate,
    dueDateFormatted,
    babyNickname,
    partnerName,
    isLoading,
    hasProfile,
  };
}
