/**
 * BabyThisWeekCard Component
 * Design: Warm Cockpit — baby development insights card
 * Features: 3 development insight items with emoji icons, drill-in arrow, dynamic per week
 */

import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { type WeekData } from "@/lib/pregnancyData";

const INSIGHT_COLORS = [
  { color: "oklch(0.52 0.09 188)", bg: "oklch(0.92 0.04 188)" },
  { color: "oklch(0.60 0.17 25)",  bg: "oklch(0.93 0.06 25)" },
  { color: "oklch(0.62 0.10 80)",  bg: "oklch(0.95 0.04 80)" },
];

interface BabyThisWeekCardProps {
  weekData: WeekData;
}

export default function BabyThisWeekCard({ weekData }: BabyThisWeekCardProps) {
  const [, navigate] = useLocation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
      className="mx-4 lg:mx-0 rounded-2xl p-4"
      style={{
        background: "oklch(1 0 0)",
        boxShadow:
          "0 2px 16px oklch(0.22 0.04 240 / 0.06), 0 1px 4px oklch(0.22 0.04 240 / 0.04)",
        border: "1px solid oklch(0.92 0.015 80)",
      }}
    >
      {/* Card header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-base"
            style={{ background: "oklch(0.92 0.04 188)" }}
          >
            🍼
          </div>
          <h3
            className="font-semibold text-base"
            style={{ color: "oklch(0.22 0.04 240)", fontFamily: "'DM Sans', sans-serif" }}
          >
            Baby This Week
          </h3>
        </div>

        <button
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95"
          style={{
            background: "oklch(0.52 0.09 188)",
            boxShadow: "0 2px 8px oklch(0.52 0.09 188 / 0.3)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.46 0.09 188)";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.52 0.09 188)";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
          }}
          onClick={() => navigate("/mum-monitor")}
          title="View health history"
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Insights grid */}
      <div className="grid grid-cols-3 gap-3">
        <AnimatePresence mode="wait">
          {weekData.babyInsights.map((insight, index) => {
            const palette = INSIGHT_COLORS[index % INSIGHT_COLORS.length];
            return (
              <motion.div
                key={`${weekData.week}-${insight.label}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.3,
                  ease: [0.23, 1, 0.32, 1],
                  delay: index * 0.06,
                }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-all hover:-translate-y-0.5"
                style={{ background: palette.bg }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xl"
                  style={{ background: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
                >
                  {insight.icon}
                </div>
                <span
                  className="text-[11px] font-medium leading-tight text-center break-words w-full"
                  style={{ color: "oklch(0.30 0.04 240)" }}
                >
                  {insight.label}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
