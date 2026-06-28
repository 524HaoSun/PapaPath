/**
 * Home Page
 * Design: Warm Cockpit — main homepage assembling all components
 * Mobile: single-column scroll with bottom nav (no status bar simulation)
 * Desktop: 3-column cockpit layout (sidebar | main | right panel)
 * State: currentWeek from DB (SSOT via usePregnancy), selectedWeek allows manual browsing
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/_core/hooks/useAuth";
import { usePregnancy } from "@/hooks/usePregnancy";
import Header from "@/components/Header";
import HeroWeekCard from "@/components/HeroWeekCard";
import BabyThisWeekCard from "@/components/BabyThisWeekCard";
import MomStatusCard from "@/components/MomStatusCard";
import DadWeeklyPlanCard from "@/components/DadWeeklyPlanCard";
import BottomNav from "@/components/BottomNav";
import SidebarNav from "@/components/SidebarNav";
import DesktopRightPanel from "@/components/DesktopRightPanel";
import { getWeekData, getTrimesterName } from "@/lib/pregnancyData";

export default function Home() {
  const { user } = useAuth();
  const { currentWeek, dueDateFormatted, isLoading: pregnancyLoading } = usePregnancy();

  // selectedWeek allows manual browsing; initialised from DB once loaded
  // Default to DEMO_WEEK (26) so the page is immediately populated before data loads
  const [selectedWeek, setSelectedWeek] = useState<number>(26);
  const [initialised, setInitialised] = useState(false);

  useEffect(() => {
    if (!pregnancyLoading && !initialised) {
      if (currentWeek !== null) {
        setSelectedWeek(currentWeek);
      }
      setInitialised(true);
    }
  }, [pregnancyLoading, currentWeek, initialised]);

  const weekData = getWeekData(selectedWeek);

  const dueDateDisplay = dueDateFormatted ?? "Not set"; // usePregnancy always provides a demo default

  return (
    <div
      className="min-h-screen"
      style={{
        background: "oklch(0.97 0.015 80)",
        backgroundImage:
          "radial-gradient(circle at 20% 20%, oklch(0.94 0.03 188 / 0.12) 0%, transparent 50%), radial-gradient(circle at 80% 80%, oklch(0.95 0.04 80 / 0.15) 0%, transparent 50%)",
      }}
    >
      {/* ── Desktop 3-column layout ── */}
      <div className="flex min-h-screen">
        {/* Left: Sidebar (desktop only) */}
        <SidebarNav />

        {/* Center: Main content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Header — Medical Card + check-in icon built in */}
          <Header className="lg:border-b lg:px-6 lg:py-4" />

          {/* Scrollable content area */}
          <div
            className="flex-1 overflow-y-auto pb-20 lg:pb-8"
            style={{ scrollbarWidth: "thin" }}
          >
            {/* Desktop page title */}
            <div className="hidden lg:block px-6 pt-5 pb-2">
              <h2
                className="text-2xl font-bold"
                style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.22 0.04 240)" }}
              >
                Your Pregnancy Dashboard
              </h2>
              <motion.p
                key={selectedWeek}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm mt-1"
                style={{ color: "oklch(0.52 0.03 240)" }}
              >
                Week {selectedWeek} &nbsp;·&nbsp; {getTrimesterName(selectedWeek)} &nbsp;·&nbsp; Due {dueDateDisplay}
              </motion.p>
            </div>

            {/* Card stack */}
            <div className="flex flex-col gap-4 pt-3 lg:gap-5 lg:px-6 lg:pt-2">
              {/* Hero Week Card — interactive progress bar */}
              <HeroWeekCard
                selectedWeek={selectedWeek}
                onWeekSelect={setSelectedWeek}
                dueDate={dueDateDisplay}
              />

              {/* Baby This Week */}
              <BabyThisWeekCard weekData={weekData} />

              {/* AI Cards: side-by-side on mobile, hidden on xl (shown in right panel) */}
              <div className="xl:hidden flex flex-col gap-3 mx-4 sm:flex-row lg:mx-0">
                <MomStatusCard weekData={weekData} />
                <DadWeeklyPlanCard weekData={weekData} />
              </div>

              {/* Bottom spacer for mobile nav */}
              <div className="h-4 lg:hidden" />
            </div>
          </div>
        </main>

        {/* Right: AI Assistant Panel (xl desktop only) */}
        <DesktopRightPanel weekData={weekData} />
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
