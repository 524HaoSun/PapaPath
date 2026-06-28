/**
 * DadWeeklyPlanCard Component
 * Design: Warm Cockpit — AI-generated weekly action plan for dad
 * Features:
 *  - Live AI tasks when couple is linked (via tRPC momStatus.getSummary)
 *  - Preset fallback when no couple data is available
 *  - Priority task highlight
 *  - Animated checklist items
 */

import { CheckCircle2, ChevronRight, Sparkles, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { type WeekData } from "@/lib/pregnancyData";
import { trpc } from "@/lib/trpc";
import TypewriterText from "@/components/TypewriterText";

const DAD_ILLUSTRATION_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663242146660/YgHQKdD9wY2Ut466VSfzNe/dad-checklist-illustration-nkdCYs5rwKGr7kJuQ7pMFL.webp";

interface DadWeeklyPlanCardProps {
  weekData: WeekData;
}

export default function DadWeeklyPlanCard({ weekData }: DadWeeklyPlanCardProps) {
  const [, navigate] = useLocation();
  const { data: summary, isLoading } = trpc.momStatus.getSummary.useQuery(
    { weekNumber: weekData.week },
    { staleTime: 1000 * 60 * 30, retry: false }
  );

  const tasks: string[] = summary?.dadPlan?.tasks ?? weekData.dadPlan;
  const priorityTask: string | undefined = summary?.dadPlan?.priorityTask;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1], delay: 0.4 }}
      className="flex-1 rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "oklch(1 0 0)",
        boxShadow: "0 2px 16px oklch(0.22 0.04 240 / 0.06), 0 1px 4px oklch(0.22 0.04 240 / 0.04)",
        border: "1px solid oklch(0.92 0.015 80)",
        minWidth: 0,
      }}
    >
      {/* Card header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className="font-semibold text-sm" style={{ color: "oklch(0.22 0.04 240)" }}>
            Dad's Weekly Plan
          </h3>
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{ background: "oklch(0.95 0.04 80)", color: "oklch(0.42 0.10 80)" }}
          >
            <Sparkles className="w-2.5 h-2.5" />
            AI Plan
          </span>
        </div>
        <p className="text-[10px]" style={{ color: "oklch(0.60 0.03 240)" }}>
          Generated from mom &amp; baby data
        </p>
      </div>

      {/* Dad illustration */}
      <div className="flex justify-center px-4 py-1">
        <img
          src={DAD_ILLUSTRATION_URL}
          alt="Dad with checklist"
          className="h-20 w-auto object-contain"
          style={{ borderRadius: "12px" }}
        />
      </div>

      {/* Plan items */}
      <div className="px-4 pb-3 flex flex-col gap-2 flex-1">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full animate-pulse flex-shrink-0" style={{ background: "oklch(0.93 0.01 240)" }} />
                <div className="h-3 rounded-full animate-pulse flex-1" style={{ background: "oklch(0.93 0.01 240)" }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {tasks.map((item, i) => {
              const isPriority = item === priorityTask;
              return (
                <div
                  key={`${weekData.week}-dad-${i}`}
                  className="flex items-start gap-2"
                >
                  {isPriority ? (
                    <Star
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      style={{ color: "oklch(0.65 0.15 60)", fill: "oklch(0.65 0.15 60)" }}
                    />
                  ) : (
                    <CheckCircle2
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      style={{ color: "oklch(0.52 0.09 188)" }}
                    />
                  )}
                  <TypewriterText
                    text={item}
                    speed={25}
                    delay={300 + i * 600}
                    className="text-[11px] leading-snug"
                    style={{
                      color: isPriority ? "oklch(0.30 0.06 240)" : "oklch(0.35 0.04 240)",
                      fontWeight: isPriority ? 600 : 400,
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Priority task strip */}
      {priorityTask && !isLoading && (
        <div
          className="mx-3 px-3 py-2 rounded-xl flex items-center gap-2"
          style={{ background: "oklch(0.95 0.04 80 / 0.6)" }}
        >
          <span className="text-sm">⭐</span>
          <span className="text-[11px] font-semibold" style={{ color: "oklch(0.42 0.10 80)" }}>
            Priority: {priorityTask}
          </span>
        </div>
      )}

      {/* View Full Plan CTA */}
      <button
        onClick={() => navigate("/mum-monitor")}
        className="mx-3 mb-3 mt-2 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold transition-all active:scale-95"
        style={{
          background: "oklch(0.22 0.04 240 / 0.06)",
          color: "oklch(0.42 0.08 240)",
          border: "1px solid oklch(0.85 0.02 240 / 0.5)",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.22 0.04 240 / 0.10)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.22 0.04 240 / 0.06)"; }}
      >
        View Full Plan
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
