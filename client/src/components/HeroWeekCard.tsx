/**
 * HeroWeekCard Component
 * Design: Warm Cockpit — the centerpiece milestone card
 * Features: Week/Day display, fetus orb visualization, interactive progress tracker,
 *           trimester info, week switching via clicking progress dots
 */

import { CalendarDays, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getWeekData, getTrimesterName } from "@/lib/pregnancyData";

const TOTAL_WEEKS = 40;

interface WeekProgressTrackerProps {
  currentWeek: number;
  onWeekSelect: (week: number) => void;
}

function WeekProgressTracker({ currentWeek, onWeekSelect }: WeekProgressTrackerProps) {
  const dots = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1);

  return (
    <div className="mt-4">
      {/* Clickable dot progress bar */}
      <div className="flex items-center gap-0.5 overflow-hidden cursor-pointer group">
        {dots.map((week) => {
          const isPast = week < currentWeek;
          const isActive = week === currentWeek;
          return (
            <motion.div
              key={week}
              className="flex-1 h-1.5 rounded-full transition-all"
              style={{
                background: isActive
                  ? "oklch(0.60 0.17 25)"
                  : isPast
                  ? "oklch(0.60 0.17 25 / 0.45)"
                  : "oklch(0.85 0.02 80)",
                transform: isActive ? "scaleY(1.8)" : "scaleY(1)",
                cursor: "pointer",
              }}
              whileHover={{ scaleY: 2, background: isActive ? "oklch(0.55 0.17 25)" : isPast ? "oklch(0.55 0.17 25 / 0.6)" : "oklch(0.75 0.06 188)" }}
              onClick={() => onWeekSelect(week)}
              title={`Week ${week}`}
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px]" style={{ color: "oklch(0.52 0.03 240)" }}>
          Week 1
        </span>
        <motion.span
          key={currentWeek}
          initial={{ scale: 1.3, color: "oklch(0.60 0.17 25)" }}
          animate={{ scale: 1, color: "oklch(0.60 0.17 25)" }}
          className="text-[10px] font-bold"
        >
          {currentWeek}
        </motion.span>
        <span className="text-[10px]" style={{ color: "oklch(0.52 0.03 240)" }}>
          Week 40
        </span>
      </div>
    </div>
  );
}

interface HeroWeekCardProps {
  selectedWeek: number;
  onWeekSelect: (week: number) => void;
  dueDate?: string;
}

export default function HeroWeekCard({ selectedWeek, onWeekSelect, dueDate }: HeroWeekCardProps) {
  const weekData = getWeekData(selectedWeek);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
      className="mx-4 lg:mx-0 rounded-3xl overflow-hidden relative"
      style={{
        background:
          "linear-gradient(145deg, oklch(0.96 0.022 75) 0%, oklch(0.93 0.032 90) 40%, oklch(0.95 0.028 110) 100%)",
        boxShadow:
          "0 8px 32px oklch(0.22 0.04 240 / 0.10), 0 2px 8px oklch(0.22 0.04 240 / 0.06)",
        border: "1px solid oklch(0.90 0.025 80)",
      }}
    >
      {/* Top section: text + orb */}
      <div className="flex items-start justify-between p-5 pb-2">
        {/* Left text */}
        <div className="flex-1 pr-2">
          {/* Milestone label */}
          <div className="flex items-center gap-1.5 mb-2">
            <Star
              className="w-3.5 h-3.5 fill-current"
              style={{ color: "oklch(0.72 0.15 80)" }}
            />
            <span
              className="text-[10px] font-semibold tracking-widest uppercase"
              style={{ color: "oklch(0.52 0.09 188)" }}
            >
              This Week's Milestone
            </span>
          </div>

          {/* Week number — animates on change */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`week-${selectedWeek}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className="leading-none mb-1"
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "clamp(2.5rem, 8vw, 3.5rem)",
                color: "oklch(0.22 0.04 240)",
                lineHeight: 1,
              }}
            >
              Week {selectedWeek}
            </motion.div>
          </AnimatePresence>

          {/* Day */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`day-${selectedWeek}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-base font-medium mb-3"
              style={{ color: "oklch(0.52 0.03 240)" }}
            >
              Day {weekData.day} &nbsp;·&nbsp; Size of a {weekData.fetusSize}
            </motion.div>
          </AnimatePresence>

          {/* Body copy */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`desc-${selectedWeek}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="text-sm leading-relaxed"
              style={{ color: "oklch(0.35 0.04 240)" }}
            >
              {weekData.description}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Right: Fetus orb — changes image on week change */}
        <div className="relative flex-shrink-0">
          {/* Glow ring behind orb */}
          <div
            className="absolute inset-0 rounded-full orb-pulse"
            style={{
              background: "radial-gradient(circle, oklch(0.52 0.09 188 / 0.15) 0%, transparent 70%)",
              transform: "scale(1.3)",
            }}
          />
          <div
            className="w-28 h-28 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden relative"
            style={{
              boxShadow: "0 0 32px 8px oklch(0.52 0.09 188 / 0.25), inset 0 0 20px oklch(0.70 0.12 80 / 0.1)",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={weekData.fetusImage}
                src={weekData.fetusImage}
                alt={`Baby at week ${selectedWeek}`}
                className="w-full h-full object-cover absolute inset-0"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                style={{ mixBlendMode: "multiply" }}
              />
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Progress tracker */}
      <div className="px-5 pb-4">
        <WeekProgressTracker currentWeek={selectedWeek} onWeekSelect={onWeekSelect} />
      </div>

      {/* Divider */}
      <div
        className="mx-5 mb-0"
        style={{ height: "1px", background: "oklch(0.85 0.02 80)" }}
      />

      {/* Footer info row */}
      <div className="flex items-center justify-between px-5 py-3 gap-2">
        <div className="flex items-center gap-1.5">
          <CalendarDays
            className="w-3.5 h-3.5"
            style={{ color: "oklch(0.52 0.09 188)" }}
          />
          <span className="text-xs truncate" style={{ color: "oklch(0.40 0.04 240)" }}>
            Stage:{" "}
            <span className="font-medium">{getTrimesterName(selectedWeek)}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <CalendarDays
            className="w-3.5 h-3.5"
            style={{ color: "oklch(0.52 0.09 188)" }}
          />
          <span className="text-xs truncate" style={{ color: "oklch(0.40 0.04 240)" }}>
            Due: <span className="font-medium">{dueDate ?? "Settings"}</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
