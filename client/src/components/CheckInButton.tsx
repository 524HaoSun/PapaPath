/**
 * CheckInButton Component
 * Design: Warm Cockpit — minimal calendar icon in header; all feedback lives inside a post-check-in modal
 * Features: single icon button, check-in result sheet (streak + newly unlocked badges), badge wall access
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck, CalendarPlus, X, Flame, Trophy, ChevronRight } from "lucide-react";
import {
  loadStats,
  performCheckIn,
  type CheckInStats,
  type Badge,
  BADGES,
  getNextBadge,
} from "@/lib/badgeSystem";
import BadgeWall from "@/components/BadgeWall";

// Confetti particle — bursts from centre of the result sheet
function ConfettiParticle({ index, total }: { index: number; total: number }) {
  const colors = [
    "oklch(0.60 0.17 25)",
    "oklch(0.52 0.09 188)",
    "oklch(0.72 0.15 80)",
    "oklch(0.65 0.12 150)",
    "oklch(0.68 0.20 55)",
  ];
  const color = colors[index % colors.length];
  const angle = (index / total) * 360;
  const dist = 70 + Math.random() * 50;
  const x = Math.cos((angle * Math.PI) / 180) * dist;
  const y = Math.sin((angle * Math.PI) / 180) * dist;
  const size = 5 + Math.random() * 5;

  return (
    <motion.div
      className="absolute rounded-sm pointer-events-none"
      style={{
        width: size,
        height: size,
        background: color,
        top: "30%",
        left: "50%",
        marginLeft: -size / 2,
        marginTop: -size / 2,
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
      animate={{ x, y, opacity: 0, scale: 0, rotate: Math.random() * 540 }}
      transition={{ duration: 1.0, ease: "easeOut", delay: index * 0.018 }}
    />
  );
}

// Post check-in result modal (bottom sheet on mobile, centred modal on desktop)
interface CheckInResultProps {
  isOpen: boolean;
  stats: CheckInStats;
  newlyUnlocked: Badge[];
  alreadyCheckedIn: boolean;
  onClose: () => void;
  onViewBadges: () => void;
}

function CheckInResult({ isOpen, stats, newlyUnlocked, alreadyCheckedIn, onClose, onViewBadges }: CheckInResultProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const nextBadge = getNextBadge(stats);

  useEffect(() => {
    if (isOpen && !alreadyCheckedIn) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 1200);
      return () => clearTimeout(t);
    }
  }, [isOpen, alreadyCheckedIn]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: "oklch(0.10 0.02 240 / 0.55)", backdropFilter: "blur(6px)" }}
          />

          {/* Sheet */}
          <motion.div
            className="relative z-10 w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden"
            style={{
              background: "oklch(0.99 0.012 80)",
              boxShadow: "0 -8px 48px oklch(0.22 0.04 240 / 0.15), 0 0 0 1px oklch(0.90 0.02 80)",
            }}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Confetti */}
            {showConfetti &&
              Array.from({ length: 20 }).map((_, i) => (
                <ConfettiParticle key={i} index={i} total={20} />
              ))}

            {/* Handle */}
            <div className="flex justify-center pt-3 pb-0">
              <div className="w-10 h-1 rounded-full" style={{ background: "oklch(0.85 0.01 240)" }} />
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-all"
              style={{ background: "oklch(0.92 0.01 240)" }}
            >
              <X className="w-3.5 h-3.5" style={{ color: "oklch(0.40 0.03 240)" }} />
            </button>

            <div className="px-6 pt-4 pb-6">
              {/* Headline */}
              <div className="text-center mb-5">
                {alreadyCheckedIn ? (
                  <>
                    <div className="text-3xl mb-2">✅</div>
                    <h2
                      className="text-lg font-bold"
                      style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.22 0.04 240)" }}
                    >
                      Already checked in today!
                    </h2>
                    <p className="text-sm mt-1" style={{ color: "oklch(0.52 0.03 240)" }}>
                      Come back tomorrow to keep your streak going.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-3xl mb-2">🎉</div>
                    <h2
                      className="text-lg font-bold"
                      style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.22 0.04 240)" }}
                    >
                      Check-in complete!
                    </h2>
                    <p className="text-sm mt-1" style={{ color: "oklch(0.52 0.03 240)" }}>
                      Keep showing up — your baby feels your love.
                    </p>
                  </>
                )}
              </div>

              {/* Stats row */}
              <div
                className="flex items-center gap-0 rounded-2xl overflow-hidden mb-4"
                style={{ border: "1px solid oklch(0.90 0.02 80)" }}
              >
                <div className="flex-1 flex flex-col items-center py-3" style={{ background: "oklch(0.96 0.03 25 / 0.3)" }}>
                  <div className="flex items-center gap-1 text-xl font-bold" style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.52 0.14 25)" }}>
                    <Flame className="w-4 h-4" />
                    {stats.streak}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: "oklch(0.55 0.03 240)" }}>Day Streak</div>
                </div>
                <div className="w-px self-stretch" style={{ background: "oklch(0.90 0.02 80)" }} />
                <div className="flex-1 flex flex-col items-center py-3" style={{ background: "oklch(0.96 0.04 80 / 0.3)" }}>
                  <div className="text-xl font-bold" style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.60 0.15 80)" }}>
                    {stats.totalDays}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: "oklch(0.55 0.03 240)" }}>Total Days</div>
                </div>
                <div className="w-px self-stretch" style={{ background: "oklch(0.90 0.02 80)" }} />
                <div className="flex-1 flex flex-col items-center py-3" style={{ background: "oklch(0.95 0.05 50 / 0.3)" }}>
                  <div className="flex items-center gap-1 text-xl font-bold" style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.55 0.17 50)" }}>
                    <Trophy className="w-4 h-4" />
                    {stats.unlockedBadgeIds.length}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: "oklch(0.55 0.03 240)" }}>Badges</div>
                </div>
              </div>

              {/* Newly unlocked badges */}
              {newlyUnlocked.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-semibold mb-2 tracking-wide uppercase" style={{ color: "oklch(0.52 0.09 188)" }}>
                    🏅 New Badge{newlyUnlocked.length > 1 ? "s" : ""} Unlocked!
                  </div>
                  <div className="flex flex-col gap-2">
                    {newlyUnlocked.map((badge) => (
                      <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 24 }}
                        className="flex items-center gap-3 p-3 rounded-xl"
                        style={{
                          background: badge.bgColor,
                          border: `1.5px solid ${badge.color}`,
                          boxShadow: `0 2px 12px ${badge.glowColor}`,
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                          style={{ background: "white", boxShadow: `0 2px 8px ${badge.glowColor}` }}
                        >
                          {badge.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm" style={{ color: "oklch(0.22 0.04 240)" }}>
                            {badge.title}
                          </div>
                          <div className="text-[11px] truncate" style={{ color: badge.color }}>
                            {badge.description}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next badge hint */}
              {nextBadge && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4"
                  style={{ background: "oklch(0.95 0.01 240)", border: "1px dashed oklch(0.80 0.02 240)" }}
                >
                  <span className="text-base opacity-50">{nextBadge.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium" style={{ color: "oklch(0.40 0.03 240)" }}>
                      Next: <span className="font-semibold">{nextBadge.title}</span>
                    </div>
                    <div className="text-[10px]" style={{ color: "oklch(0.60 0.02 240)" }}>
                      {nextBadge.requirement}
                    </div>
                  </div>
                </div>
              )}

              {/* View all badges button */}
              <button
                onClick={() => { onClose(); setTimeout(onViewBadges, 200); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-98"
                style={{
                  background: "oklch(0.52 0.09 188)",
                  color: "white",
                  boxShadow: "0 3px 12px oklch(0.52 0.09 188 / 0.3)",
                }}
              >
                <Trophy className="w-4 h-4" />
                View all badges
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface CheckInButtonProps {
  className?: string;
}

export default function CheckInButton({ className = "" }: CheckInButtonProps) {
  const [stats, setStats] = useState<CheckInStats>({
    streak: 0,
    totalDays: 0,
    lastCheckIn: null,
    checkedInToday: false,
    unlockedBadgeIds: [],
  });
  const [showResult, setShowResult] = useState(false);
  const [lastNewlyUnlocked, setLastNewlyUnlocked] = useState<Badge[]>([]);
  const [lastAlreadyCheckedIn, setLastAlreadyCheckedIn] = useState(false);
  const [showBadgeWall, setShowBadgeWall] = useState(false);

  useEffect(() => {
    setStats(loadStats());
  }, []);

  const handlePress = () => {
    if (stats.checkedInToday) {
      setLastAlreadyCheckedIn(true);
      setLastNewlyUnlocked([]);
      setShowResult(true);
      return;
    }
    const result = performCheckIn();
    setStats(result.stats);
    setLastAlreadyCheckedIn(false);
    setLastNewlyUnlocked(result.newlyUnlocked);
    setShowResult(true);
  };

  const isChecked = stats.checkedInToday;

  return (
    <>
      {/* Single icon button — minimal footprint in header */}
      <motion.button
        className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-all ${className}`}
        style={{
          background: isChecked ? "oklch(0.52 0.09 188)" : "oklch(0.97 0.015 80)",
          border: isChecked
            ? "1.5px solid oklch(0.52 0.09 188)"
            : "1.5px solid oklch(0.52 0.09 188 / 0.35)",
          boxShadow: isChecked
            ? "0 2px 10px oklch(0.52 0.09 188 / 0.35)"
            : "0 1px 4px oklch(0.22 0.04 240 / 0.08)",
          color: isChecked ? "white" : "oklch(0.52 0.09 188)",
        }}
        whileTap={{ scale: 0.88 }}
        onClick={handlePress}
        title={isChecked ? "Checked in today" : "Daily check-in"}
      >
        <AnimatePresence mode="wait">
          {isChecked ? (
            <motion.span
              key="done"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
            >
              <CalendarCheck className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
            </motion.span>
          ) : (
            <motion.span
              key="todo"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <CalendarPlus className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Streak dot indicator */}
        {stats.streak > 1 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
            style={{ background: "oklch(0.60 0.17 25)", color: "white", border: "1.5px solid white" }}
          >
            {stats.streak > 99 ? "99" : stats.streak}
          </motion.div>
        )}
      </motion.button>

      {/* Post check-in result sheet */}
      <CheckInResult
        isOpen={showResult}
        stats={stats}
        newlyUnlocked={lastNewlyUnlocked}
        alreadyCheckedIn={lastAlreadyCheckedIn}
        onClose={() => setShowResult(false)}
        onViewBadges={() => setShowBadgeWall(true)}
      />

      {/* Badge wall */}
      <BadgeWall
        stats={stats}
        isOpen={showBadgeWall}
        onClose={() => setShowBadgeWall(false)}
      />
    </>
  );
}
