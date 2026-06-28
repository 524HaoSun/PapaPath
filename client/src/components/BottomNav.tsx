/**
 * BottomNav Component
 * Design: Warm Cockpit — mobile bottom navigation bar
 * 4 tabs: Home, Dad Community, Mom Status, Medical Support
 */

import { Home, Users, Heart, ShieldPlus } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const navItems = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "community", label: "Community", icon: Users, path: "/community" },
  { id: "mom", label: "Mum Monitor", icon: Heart, path: "/mum-monitor" },
  { id: "medical", label: "Medical", icon: ShieldPlus, path: "/care" },
];

export default function BottomNav() {
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
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 pb-safe"
      style={{
        background: "oklch(1 0 0 / 0.95)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid oklch(0.90 0.015 80)",
        height: "64px",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.path !== null && (item.path === "/" ? location === "/" : location.startsWith(item.path));
        return (
          <button
            key={item.id}
            onClick={() => handleNavItem(item)}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all active:scale-95"
            style={{
              color: isActive
                ? "oklch(0.52 0.09 188)"
                : "oklch(0.60 0.03 240)",
            }}
          >
            <div
              className="relative flex items-center justify-center"
              style={{
                width: "36px",
                height: "28px",
              }}
            >
              {isActive && (
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "oklch(0.92 0.04 188)",
                    borderRadius: "10px",
                  }}
                />
              )}
              <Icon
                className="w-5 h-5 relative z-10"
                strokeWidth={isActive ? 2.2 : 1.8}
              />
            </div>
            <span
              className="text-[9px] leading-none font-medium whitespace-nowrap"
              style={{
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
