/**
 * DesktopRightPanel Component
 * Design: Warm Cockpit — desktop right assistant panel
 * Features: Medical Card shortcut, Mom Status, Dad's Weekly Plan (dynamic per week)
 */

import { Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import MomStatusCard from "@/components/MomStatusCard";
import DadWeeklyPlanCard from "@/components/DadWeeklyPlanCard";
import MedicalCardModal from "@/components/MedicalCardModal";
import { type WeekData } from "@/lib/pregnancyData";

interface DesktopRightPanelProps {
  weekData: WeekData;
}

export default function DesktopRightPanel({ weekData }: DesktopRightPanelProps) {
  const [showMedicalCard, setShowMedicalCard] = useState(false);
  return (
    <>
    <aside
      className="hidden xl:flex flex-col w-80 shrink-0 gap-4 pt-6 pb-6 pr-6 overflow-y-auto"
      style={{ maxHeight: "100vh", position: "sticky", top: 0 }}
    >
      {/* Medical Card shortcut */}
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all active:scale-98"
        style={{
          background: "linear-gradient(135deg, oklch(0.60 0.17 25) 0%, oklch(0.52 0.14 20) 100%)",
          boxShadow: "0 4px 16px oklch(0.60 0.17 25 / 0.25)",
          color: "white",
        }}
        onClick={() => setShowMedicalCard(true)}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 8px 24px oklch(0.60 0.17 25 / 0.35)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 4px 16px oklch(0.60 0.17 25 / 0.25)";
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.2)" }}
        >
          <Shield className="w-5 h-5" />
        </div>
        <div className="text-left">
          <div className="text-sm font-semibold">Medical Card</div>
          <div className="text-xs opacity-80">View health records &amp; alerts</div>
        </div>
      </motion.button>

      {/* Mom Status — reuses the shared card component */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
      >
        <MomStatusCard weekData={weekData} />
      </motion.div>

      {/* Dad's Weekly Plan — reuses the shared card component */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1], delay: 0.3 }}
      >
        <DadWeeklyPlanCard weekData={weekData} />
      </motion.div>
    </aside>

    {/* Medical Card Modal */}
    <AnimatePresence>
      {showMedicalCard && (
        <MedicalCardModal onClose={() => setShowMedicalCard(false)} />
      )}
    </AnimatePresence>
  </>
  );
}
