/**
 * BadgeWall Component
 * Design: Warm Cockpit — displays all badges with locked/unlocked states
 * Features: grid layout, rarity glow on unlocked, progress to next badge
 */

import { motion, AnimatePresence } from "framer-motion";
import { X, Lock } from "lucide-react";
import { type CheckInStats, BADGES, getUnlockedBadges, getNextBadge, RARITY_LABELS, RARITY_COLORS } from "@/lib/badgeSystem";

interface BadgeWallProps {
  stats: CheckInStats;
  isOpen: boolean;
  onClose: () => void;
}

function BadgeItem({ badge, unlocked, index }: { badge: typeof BADGES[0]; unlocked: boolean; index: number }) {
  const rarityStyle = RARITY_COLORS[badge.rarity];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all"
      style={{
        background: unlocked ? badge.bgColor : "oklch(0.95 0.005 240)",
        border: unlocked ? `1.5px solid ${badge.color}` : "1.5px solid oklch(0.88 0.005 240)",
        opacity: unlocked ? 1 : 0.55,
        boxShadow: unlocked ? `0 4px 20px ${badge.glowColor}` : "none",
        cursor: "default",
      }}
    >
      {/* Emoji orb */}
      <div className="relative">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{
            background: unlocked ? "white" : "oklch(0.90 0.005 240)",
            boxShadow: unlocked ? `0 2px 12px ${badge.glowColor}` : "none",
          }}
        >
          {unlocked ? badge.emoji : <Lock className="w-4 h-4" style={{ color: "oklch(0.65 0.01 240)" }} />}
        </div>
        {/* Rarity dot */}
        {unlocked && (
          <div
            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white"
            style={{ background: badge.color }}
          />
        )}
      </div>

      {/* Title */}
      <div className="text-center">
        <div
          className="text-[11px] font-bold leading-tight"
          style={{ color: unlocked ? "oklch(0.22 0.04 240)" : "oklch(0.55 0.01 240)" }}
        >
          {badge.title}
        </div>
        <div
          className="text-[10px] mt-0.5"
          style={{ color: unlocked ? badge.color : "oklch(0.65 0.01 240)" }}
        >
          {badge.subtitle}
        </div>
      </div>

      {/* Rarity chip */}
      <div
        className="px-2 py-0.5 rounded-full text-[9px] font-bold"
        style={{
          background: unlocked ? rarityStyle.bg : "oklch(0.90 0.005 240)",
          color: unlocked ? rarityStyle.text : "oklch(0.60 0.01 240)",
        }}
      >
        {RARITY_LABELS[badge.rarity]}
      </div>

      {/* Requirement hint when locked */}
      {!unlocked && (
        <div className="text-[9px] text-center leading-tight" style={{ color: "oklch(0.60 0.01 240)" }}>
          {badge.requirement}
        </div>
      )}
    </motion.div>
  );
}

export default function BadgeWall({ stats, isOpen, onClose }: BadgeWallProps) {
  const unlocked = getUnlockedBadges(stats);
  const nextBadge = getNextBadge(stats);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: "oklch(0.10 0.02 240 / 0.6)", backdropFilter: "blur(6px)" }}
          />

          {/* Sheet */}
          <motion.div
            className="relative z-10 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden"
            style={{
              background: "oklch(0.98 0.01 80)",
              maxHeight: "85vh",
            }}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: "oklch(0.85 0.01 240)" }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3">
              <div>
                <h2
                  className="text-lg font-bold"
                  style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.22 0.04 240)" }}
                >
                  My Badges
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "oklch(0.52 0.03 240)" }}>
                  {unlocked.length} / {BADGES.length} unlocked &nbsp;·&nbsp; {stats.streak}-day streak
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{ background: "oklch(0.92 0.01 240)" }}
              >
                <X className="w-4 h-4" style={{ color: "oklch(0.40 0.03 240)" }} />
              </button>
            </div>

            {/* Stats bar */}
            <div className="mx-5 mb-4 p-3 rounded-2xl flex items-center gap-4"
              style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.92 0.015 80)" }}
            >
              <div className="text-center flex-1">
                <div className="text-xl font-bold" style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.52 0.09 188)" }}>
                  {stats.streak}
                </div>
                <div className="text-[10px]" style={{ color: "oklch(0.55 0.03 240)" }}>Day Streak 🔥</div>
              </div>
              <div className="w-px h-8" style={{ background: "oklch(0.90 0.01 240)" }} />
              <div className="text-center flex-1">
                <div className="text-xl font-bold" style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.60 0.17 25)" }}>
                  {stats.totalDays}
                </div>
                <div className="text-[10px]" style={{ color: "oklch(0.55 0.03 240)" }}>Total Days ⭐</div>
              </div>
              <div className="w-px h-8" style={{ background: "oklch(0.90 0.01 240)" }} />
              <div className="text-center flex-1">
                <div className="text-xl font-bold" style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.65 0.18 50)" }}>
                  {unlocked.length}
                </div>
                <div className="text-[10px]" style={{ color: "oklch(0.55 0.03 240)" }}>Badges 🏆</div>
              </div>
            </div>

            {/* Next badge hint */}
            {nextBadge && (
              <div
                className="mx-5 mb-4 px-4 py-2.5 rounded-xl flex items-center gap-3"
                style={{ background: nextBadge.bgColor, border: `1px dashed ${nextBadge.color}` }}
              >
                <span className="text-xl">{nextBadge.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold" style={{ color: "oklch(0.22 0.04 240)" }}>
                    Next: {nextBadge.title}
                  </div>
                  <div className="text-[10px] truncate" style={{ color: nextBadge.color }}>
                    {nextBadge.requirement}
                  </div>
                </div>
                <div className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: nextBadge.color, color: "white" }}>
                  Goal
                </div>
              </div>
            )}

            {/* Badge grid */}
            <div className="overflow-y-auto px-5 pb-6" style={{ maxHeight: "calc(85vh - 220px)" }}>
              <div className="grid grid-cols-3 gap-3">
                {BADGES.map((badge, i) => (
                  <BadgeItem
                    key={badge.id}
                    badge={badge}
                    unlocked={stats.unlockedBadgeIds.includes(badge.id)}
                    index={i}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
