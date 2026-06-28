/**
 * BadgeUnlockModal Component
 * Design: Warm Cockpit — full-screen celebration overlay when a badge is unlocked
 * Features: particle burst, badge reveal animation, rarity glow, dismiss on click
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Badge, RARITY_LABELS, RARITY_COLORS } from "@/lib/badgeSystem";

// Floating particle for celebration
function Particle({ index, total }: { index: number; total: number }) {
  const angle = (index / total) * 360;
  const distance = 80 + Math.random() * 60;
  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance;
  const colors = [
    "oklch(0.60 0.17 25)",
    "oklch(0.52 0.09 188)",
    "oklch(0.72 0.15 80)",
    "oklch(0.65 0.18 50)",
    "oklch(0.55 0.14 145)",
  ];
  const color = colors[index % colors.length];
  const size = 6 + Math.random() * 6;

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        background: color,
        top: "50%",
        left: "50%",
        marginTop: -size / 2,
        marginLeft: -size / 2,
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x,
        y: y - 20,
        opacity: 0,
        scale: 0,
        rotate: Math.random() * 720,
      }}
      transition={{
        duration: 1.2,
        ease: "easeOut",
        delay: 0.3 + index * 0.015,
      }}
    />
  );
}

// Sparkle star
function Sparkle({ delay, x, y }: { delay: number; x: string; y: string }) {
  return (
    <motion.div
      className="absolute pointer-events-none text-2xl"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0, rotate: -30 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1.2, 0],
        rotate: [-30, 30],
      }}
      transition={{ duration: 1.5, delay, repeat: Infinity, repeatDelay: 2 }}
    >
      ✨
    </motion.div>
  );
}

interface BadgeUnlockModalProps {
  badge: Badge | null;
  onClose: () => void;
}

export default function BadgeUnlockModal({ badge, onClose }: BadgeUnlockModalProps) {
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (badge) {
      setShowParticles(true);
      const t = setTimeout(() => setShowParticles(false), 1800);
      return () => clearTimeout(t);
    }
  }, [badge]);

  const rarityStyle = badge ? RARITY_COLORS[badge.rarity] : null;

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ background: "oklch(0.10 0.02 240 / 0.75)", backdropFilter: "blur(8px)" }}
          />

          {/* Card */}
          <motion.div
            className="relative z-10 flex flex-col items-center text-center px-8 py-10 rounded-3xl mx-4"
            style={{
              background: "oklch(1 0 0)",
              boxShadow: `0 0 80px ${badge.glowColor}, 0 24px 64px oklch(0.10 0.02 240 / 0.3)`,
              border: `2px solid ${badge.color}`,
              maxWidth: 360,
              width: "100%",
            }}
            initial={{ scale: 0.6, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.1 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Particles */}
            {showParticles &&
              Array.from({ length: 24 }).map((_, i) => (
                <Particle key={i} index={i} total={24} />
              ))}

            {/* Sparkles */}
            <Sparkle delay={0.5} x="10%" y="15%" />
            <Sparkle delay={1.0} x="80%" y="10%" />
            <Sparkle delay={1.5} x="85%" y="75%" />

            {/* "Badge Unlocked!" header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xs font-bold tracking-widest uppercase mb-4"
              style={{ color: badge.color }}
            >
              🎉 Badge Unlocked!
            </motion.div>

            {/* Rarity chip */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, type: "spring", stiffness: 400 }}
              className="px-3 py-1 rounded-full text-[11px] font-bold mb-5"
              style={{
                background: rarityStyle?.bg,
                color: rarityStyle?.text,
                border: `1px solid ${badge.color}`,
              }}
            >
              {RARITY_LABELS[badge.rarity]}
            </motion.div>

            {/* Badge emoji orb */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="relative mb-5"
            >
              {/* Glow ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${badge.glowColor} 0%, transparent 70%)`,
                  transform: "scale(1.6)",
                }}
                animate={{ scale: [1.5, 1.8, 1.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-5xl relative"
                style={{
                  background: badge.bgColor,
                  boxShadow: `0 0 32px ${badge.glowColor}, 0 4px 16px oklch(0.10 0.02 240 / 0.15)`,
                  border: `3px solid ${badge.color}`,
                }}
              >
                {badge.emoji}
              </div>
            </motion.div>

            {/* Badge title */}
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "1.6rem",
                color: "oklch(0.22 0.04 240)",
                lineHeight: 1.1,
              }}
            >
              {badge.title}
            </motion.h2>

            {/* Badge subtitle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm font-medium mt-1 mb-3"
              style={{ color: badge.color }}
            >
              {badge.subtitle}
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="text-sm leading-relaxed mb-6"
              style={{ color: "oklch(0.45 0.03 240)" }}
            >
              {badge.description}
            </motion.p>

            {/* Dismiss button */}
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              whileTap={{ scale: 0.96 }}
              onClick={onClose}
              className="px-8 py-2.5 rounded-full text-sm font-semibold transition-all"
              style={{
                background: badge.color,
                color: "white",
                boxShadow: `0 4px 16px ${badge.glowColor}`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              }}
            >
              Awesome! 🎊
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
