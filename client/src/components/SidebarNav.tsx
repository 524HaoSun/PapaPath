/**
 * SidebarNav Component
 * Design: Warm Cockpit — desktop left sidebar navigation
 * 4 sections: Home, Dad Community, Mom Status, Medical Support
 */

import { Home, Users, Heart, ShieldPlus, Baby } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { usePregnancy } from "@/hooks/usePregnancy";
import { getTrimesterName } from "@/lib/pregnancyData";

const navItems = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "community", label: "Dad Community", icon: Users, path: "/community" },
  { id: "mom", label: "Mum Monitor", icon: Heart, path: "/mum-monitor" },
  { id: "medical", label: "Medical Support", icon: ShieldPlus, path: "/care" },
];

function SidebarWeekFooter() {
  const { currentWeek, isLoading } = usePregnancy();
  const week = currentWeek ?? 0;
  const pct = Math.round((week / 40) * 100);
  const trimester = week > 0 ? getTrimesterName(week) : "";

  return (
    <div className="px-6 py-4 border-t" style={{ borderColor: "oklch(0.90 0.018 80)" }}>
      <p className="text-[10px]" style={{ color: "oklch(0.70 0.02 240)" }}>
        {isLoading
          ? "Loading..."
          : week > 0
          ? `Week ${week} of 40 · ${trimester}`
          : "Set due date in Settings"}
      </p>
      <div
        className="mt-1.5 h-1 rounded-full overflow-hidden"
        style={{ background: "oklch(0.90 0.018 80)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: "oklch(0.52 0.09 188)",
          }}
        />
      </div>
    </div>
  );
}

export default function SidebarNav() {
  const [location, navigate] = useLocation();

  const handleNavItem = (item: typeof navItems[number]) => {
    if (item.path) {
      navigate(item.path);
    } else {
      toast(`${item.label} — coming soon`, {
        description: "This feature is under development.",
        duration: 2000,
      });
    }
  };

  return (
    <aside
      className="hidden lg:flex flex-col w-64 min-h-screen sticky top-0 shrink-0"
      style={{
        background: "oklch(0.99 0.008 80)",
        borderRight: "1px solid oklch(0.90 0.018 80)",
      }}
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-6 py-6 border-b" style={{ borderColor: "oklch(0.90 0.018 80)" }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "oklch(0.52 0.09 188)" }}
        >
          <Baby className="w-5 h-5 text-white" />
        </div>
        <div>
          <div
            className="text-sm font-bold leading-tight"
            style={{ color: "oklch(0.22 0.04 240)", fontFamily: "'DM Serif Display', serif" }}
          >
            DadCompanion
          </div>
          <div className="text-[10px]" style={{ color: "oklch(0.60 0.03 240)" }}>
            AI Pregnancy Guide
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path !== null && (item.path === "/" ? location === "/" : location.startsWith(item.path));
          return (
            <button
              key={item.id}
              onClick={() => handleNavItem(item)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left w-full transition-all active:scale-98"
              style={{
                background: isActive
                  ? "oklch(0.92 0.04 188)"
                  : "transparent",
                color: isActive
                  ? "oklch(0.30 0.09 188)"
                  : "oklch(0.52 0.03 240)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "oklch(0.94 0.025 80)";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "oklch(0.30 0.04 240)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "oklch(0.52 0.03 240)";
                }
              }}
            >
              <Icon
                className="w-5 h-5 flex-shrink-0"
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              <span
                className="text-sm"
                style={{ fontWeight: isActive ? 600 : 400 }}
              >
                {item.label}
              </span>
              {isActive && (
                <div
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ background: "oklch(0.52 0.09 188)" }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom: pregnancy progress */}
      <SidebarWeekFooter />
    </aside>
  );
}
