/**
 * MomStatusCard Component
 * Design: Warm Cockpit — AI-powered mom status insights card
 * Features:
 *  - Live AI summary when dad has logged data (via tRPC momStatus.getSummary)
 *  - Preset fallback when no data logged yet
 *  - Data freshness indicator (live / yesterday / preset)
 *  - 7-day trend mini-sparkline (energy, mood)
 *  - "Log Today" CTA when no today's log exists
 *  - Animated status items
 */

import { Sparkles, Wifi, WifiOff, Clock, PlusCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { type WeekData } from "@/lib/pregnancyData";
import { trpc } from "@/lib/trpc";
import { useMemo, useState } from "react";
import TypewriterText from "@/components/TypewriterText";

const MOM_ILLUSTRATION_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663242146660/YgHQKdD9wY2Ut466VSfzNe/pregnant-mom-illustration-4h4Xka7ytWcvoK3AWJUu2T.webp";

const STATUS_ICONS = ["⚡", "🔧", "🌙", "💧", "😊"];

interface MomStatusCardProps {
  weekData: WeekData;
}

type DataSource = "live" | "yesterday" | "preset";

function FreshnessIndicator({ source }: { source: DataSource }) {
  if (source === "live") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-medium" style={{ color: "oklch(0.45 0.12 160)" }}>
        <Wifi className="w-2.5 h-2.5" />
        Live data
      </span>
    );
  }
  if (source === "yesterday") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-medium" style={{ color: "oklch(0.55 0.10 60)" }}>
        <Clock className="w-2.5 h-2.5" />
        Yesterday's data
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-medium" style={{ color: "oklch(0.60 0.03 240)" }}>
      <WifiOff className="w-2.5 h-2.5" />
      Weekly estimate
    </span>
  );
}

/** Tiny sparkline rendered as an inline SVG */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 60;
  const h = 20;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function MomStatusCard({ weekData }: MomStatusCardProps) {
  const [, navigate] = useLocation();
  // Try to fetch live AI summary — falls back to preset if no data logged
  const { data: summary, isLoading } = trpc.momStatus.getSummary.useQuery(
    { weekNumber: weekData.week },
    {
      staleTime: 1000 * 60 * 30, // 30 min
      retry: false,
    }
  );

  // 7-day trend data
  const { data: trendData } = trpc.momStatus.getWeekTrend.useQuery(
    undefined,
    { staleTime: 1000 * 60 * 30, retry: false }
  );

  // Check if today has a log
  const { data: todayLog } = trpc.momStatus.getTodayLog.useQuery(
    undefined,
    { staleTime: 0, retry: false }
  );

  const hasTodayLog = !!todayLog;

  const energyValues = useMemo(
    () => (trendData ?? []).map((d: { energyLevel: number | null }) => d.energyLevel ?? 5),
    [trendData]
  );
  const moodValues = useMemo(
    () => (trendData ?? []).map((d: { moodScore: number | null }) => d.moodScore ?? 5),
    [trendData]
  );

  const statusItems: string[] = summary?.momStatus?.items ?? weekData.momStatus;
  const careFocus: string = summary?.momStatus?.careFocus ?? `Rest & emotional support`;
  const dataSource: DataSource = (summary?.dataSource as DataSource) ?? "preset";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1], delay: 0.3 }}
      className="flex-1 rounded-2xl overflow-hidden flex flex-col cursor-pointer"
      style={{
        background: "oklch(1 0 0)",
        boxShadow: "0 2px 16px oklch(0.22 0.04 240 / 0.06), 0 1px 4px oklch(0.22 0.04 240 / 0.04)",
        border: "1px solid oklch(0.92 0.015 80)",
        minWidth: 0,
      }}
      onClick={() => navigate("/mom-status")}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate("/mom-status")}
    >
      {/* Card header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className="font-semibold text-sm" style={{ color: "oklch(0.22 0.04 240)" }}>
            Mom Status
          </h3>
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{ background: "oklch(0.92 0.04 188)", color: "oklch(0.30 0.07 188)" }}
          >
            <Sparkles className="w-2.5 h-2.5" />
            AI Insight
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[10px]" style={{ color: "oklch(0.60 0.03 240)" }}>
            {"Based on your daily logs"}
          </p>
          {!isLoading && <FreshnessIndicator source={dataSource} />}
        </div>
      </div>

      {/* Mom illustration + sparklines */}
      <div className="flex flex-col items-center px-4 py-1">
        <img
          src={MOM_ILLUSTRATION_URL}
          alt="Pregnant mom"
          className="h-20 w-auto object-contain"
          style={{ borderRadius: "12px" }}
        />
        {trendData && trendData.length >= 2 && (
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1">
              <span className="text-[9px]" style={{ color: "oklch(0.60 0.03 240)" }}>Energy</span>
              <Sparkline values={energyValues} color="oklch(0.52 0.09 188)" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px]" style={{ color: "oklch(0.60 0.03 240)" }}>Mood</span>
              <Sparkline values={moodValues} color="oklch(0.62 0.12 60)" />
            </div>
          </div>
        )}
      </div>

      {/* Status items */}
      <div className="px-4 pb-2 flex flex-col gap-1.5 flex-1">
        {isLoading ? (
          <div className="flex flex-col gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-3 rounded-full animate-pulse"
                style={{ background: "oklch(0.93 0.01 240)", width: `${70 + i * 10}%` }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {statusItems.map((item, i) => (
              <div
                key={`${weekData.week}-${i}-${item.slice(0, 10)}`}
                className="flex items-start gap-2"
              >
                <span className="text-xs mt-0.5 flex-shrink-0">
                  {STATUS_ICONS[i % STATUS_ICONS.length]}
                </span>
                <TypewriterText
                  text={item}
                  speed={25}
                  delay={300 + i * 600}
                  className="text-[11px] leading-snug"
                  style={{ color: "oklch(0.35 0.04 240)" }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Care focus strip */}
      <div
        className="mx-3 mb-2 px-3 py-2 rounded-xl flex items-center gap-2"
        style={{ background: "oklch(0.93 0.06 25 / 0.5)" }}
      >
        <span className="text-sm">❤️</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={careFocus}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-[11px] font-semibold"
            style={{ color: "oklch(0.45 0.12 25)" }}
          >
            Care focus: {careFocus}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Log Today CTA — shown when authenticated but no today's log */}
      {!hasTodayLog && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="mx-3 mb-3 px-3 py-2 rounded-xl flex items-center gap-2"
          style={{
            background: "oklch(0.92 0.04 188 / 0.4)",
            border: "1px dashed oklch(0.60 0.07 188)",
          }}
        >
          <PlusCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "oklch(0.40 0.09 188)" }} />
          <span className="text-[11px] font-medium" style={{ color: "oklch(0.35 0.09 188)" }}>
            Log today's status for a personalized AI summary
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
