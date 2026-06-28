/**
 * Header Component
 * Design: Warm Cockpit — top bar with avatar/greeting on left, Medical Card + check-in icon on right
 * Medical Card is always the primary visible CTA; check-in is a compact icon next to it
 */

import { useState } from "react";
import { Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CheckInButton from "@/components/CheckInButton";
import { usePregnancy } from "@/hooks/usePregnancy";
import MedicalCardModal from "@/components/MedicalCardModal";

const DAD_AVATAR_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663242146660/YgHQKdD9wY2Ut466VSfzNe/dad-avatar-YxsbzasuZxv7aeXqc8ZiJV.webp";

interface HeaderProps {
  className?: string;
}

export default function Header({ className = "" }: HeaderProps) {
  const [showMedicalCard, setShowMedicalCard] = useState(false);
  const { currentWeek, isLoading: pregnancyLoading } = usePregnancy();

  const weekSubtitle = pregnancyLoading
    ? "Loading..."
    : currentWeek !== null
    ? `Week ${currentWeek} · Supporting mom & baby`
    : "Set due date in Settings";

  return (
    <>
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className={`flex items-center justify-between px-4 py-3 ${className}`}
    >
      {/* Left: Avatar + Greeting */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative flex-shrink-0">
          <img
            src={DAD_AVATAR_URL}
            alt="Dad avatar"
            className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-md"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
        </div>
        <div className="min-w-0">
          <h1
            className="text-[17px] font-semibold leading-tight truncate"
            style={{ color: "oklch(0.22 0.04 240)", fontFamily: "'DM Sans', sans-serif" }}
          >
            Good evening, Dad
          </h1>
          <p className="text-xs leading-tight truncate" style={{ color: "oklch(0.52 0.03 240)" }}>
            {weekSubtitle}
          </p>
        </div>
      </div>

      {/* Right: Medical Card (primary) + Check-in icon (secondary) */}
      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
        {/* Medical Card — always visible, always first */}
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95"
          style={{
            background: "oklch(0.97 0.015 80)",
            color: "oklch(0.60 0.17 25)",
            border: "1.5px solid oklch(0.60 0.17 25 / 0.3)",
            boxShadow: "0 1px 4px oklch(0.60 0.17 25 / 0.12)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.93 0.06 25)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.97 0.015 80)";
          }}
          onClick={() => setShowMedicalCard(true)}
        >
          <Shield className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Medical Card</span>
          <span className="xs:hidden">Card</span>
        </button>

        {/* Check-in icon — compact, secondary */}
        <CheckInButton />
      </div>
    </motion.header>

    {/* Medical Card Modal */}
    <AnimatePresence>
      {showMedicalCard && (
        <MedicalCardModal onClose={() => setShowMedicalCard(false)} />
      )}
    </AnimatePresence>
  </>
  );
}
