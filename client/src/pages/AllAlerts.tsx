/**
 * AllAlerts — Risk alerts management + emergency contacts
 * Layout: Warm Cockpit (SidebarNav + Header + BottomNav)
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  ChevronLeft, AlertTriangle, Phone, Heart, Shield,
  Ambulance, ChevronRight, X, RotateCcw, Star,
} from "lucide-react";
import { useCare } from "@/contexts/CareContext";
import SidebarNav from "@/components/SidebarNav";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

const emergencyIconMap: Record<string, React.ElementType> = {
  emergency: Ambulance,
  hospital:  Heart,
  midwife:   Phone,
  other:     Shield,
};

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  red:     { bg: "bg-red-100",     text: "text-red-700",     border: "border-red-200" },
  blue:    { bg: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-200" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  amber:   { bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-200" },
  violet:  { bg: "bg-violet-100",  text: "text-violet-700",  border: "border-violet-200" },
};

export default function AllAlerts() {
  const [, navigate] = useLocation();
  const { riskAlerts, dismissAlert, undismissAlert, emergencyContacts, toggleContactFavorite } = useCare();
  const [activeTab, setActiveTab] = useState<"alerts" | "contacts">("alerts");
  const [showDismissed, setShowDismissed] = useState(false);

  const active = riskAlerts.filter((a) => !a.dismissed);
  const dismissed = riskAlerts.filter((a) => a.dismissed);

  const severityConfig = {
    high:   { border: "border-red-200 bg-red-50",     dot: "bg-red-500",    badge: "bg-red-100 text-red-700",     icon: "🔴" },
    medium: { border: "border-amber-200 bg-amber-50", dot: "bg-amber-500",  badge: "bg-amber-100 text-amber-700", icon: "🟡" },
    low:    { border: "border-blue-200 bg-blue-50",   dot: "bg-blue-400",   badge: "bg-blue-100 text-blue-700",   icon: "🔵" },
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: "oklch(0.97 0.015 80)",
        backgroundImage:
          "radial-gradient(circle at 20% 20%, oklch(0.94 0.03 188 / 0.12) 0%, transparent 50%), radial-gradient(circle at 80% 80%, oklch(0.95 0.04 80 / 0.15) 0%, transparent 50%)",
      }}
    >
      <div className="flex min-h-screen">
        <SidebarNav />
        <main className="flex-1 flex flex-col min-w-0">
          <Header className="lg:border-b lg:px-6 lg:py-4" />
          <div className="flex-1 overflow-y-auto pb-20 lg:pb-8" style={{ scrollbarWidth: "thin" }}>
            {/* Page header */}
            <div className="px-4 pt-4 pb-2 lg:px-6 lg:pt-5">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => navigate("/care")}
                  className="w-9 h-9 rounded-xl flex items-center justify-center press-feedback"
                  style={{ background: "oklch(0.92 0.02 80)" }}
                >
                  <ChevronLeft size={20} style={{ color: "oklch(0.35 0.04 240)" }} />
                </button>
                <h2
                  className="text-xl font-bold"
                  style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.22 0.04 240)" }}
                >
                  Alerts & Contacts
                </h2>
              </div>
              {/* Tab switcher */}
              <div className="flex gap-1 rounded-xl p-1" style={{ background: "oklch(0.92 0.02 80)" }}>
                {(["alerts", "contacts"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="flex-1 py-2 text-[13px] font-semibold rounded-lg press-feedback transition-all capitalize"
                    style={
                      activeTab === tab
                        ? { background: "white", color: "oklch(0.22 0.04 240)", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }
                        : { color: "oklch(0.52 0.03 240)" }
                    }
                  >
                    {tab === "alerts" ? `Risk Alerts (${active.length})` : "Emergency Contacts"}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="px-4 pt-2 pb-6 space-y-3 lg:px-6">
              {/* ── Alerts Tab ── */}
              {activeTab === "alerts" && (
                <div className="space-y-3">
                  {active.length === 0 && (
                    <div className="py-8 text-center">
                      <span className="text-4xl">✅</span>
                      <p className="text-[15px] font-bold mt-3" style={{ color: "oklch(0.22 0.04 240)" }}>All clear!</p>
                      <p className="text-[13px] mt-1" style={{ color: "oklch(0.52 0.03 240)" }}>No active risk alerts right now.</p>
                    </div>
                  )}
                  {active.map((alert) => {
                    const cfg = severityConfig[alert.severity];
                    return (
                      <div key={alert.id} className={`rounded-2xl p-4 border ${cfg.border}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 status-dot-pulse ${cfg.dot}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="text-[14px] font-bold" style={{ color: "oklch(0.22 0.04 240)", fontFamily: "'DM Serif Display', serif" }}>{alert.title}</p>
                              <button
                                onClick={() => { dismissAlert(alert.id); toast.success("Alert dismissed"); }}
                                className="w-6 h-6 bg-white/80 rounded-full flex items-center justify-center flex-shrink-0 press-feedback"
                              >
                                <X size={12} className="text-slate-500" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{alert.severity.toUpperCase()}</span>
                              <span className="text-[11px] text-slate-500">{alert.due}</span>
                              <span className="text-[11px] text-slate-400">· {alert.category}</span>
                            </div>
                            <p className="text-[13px] text-slate-600 leading-relaxed mb-3">{alert.desc}</p>
                            {alert.actionLabel && (
                              <button
                                onClick={() => toast.success(`${alert.actionLabel} — action recorded`)}
                                className="text-[12px] font-bold rounded-xl px-3 py-1.5 border press-feedback"
                                style={{ color: "oklch(0.52 0.09 188)", borderColor: "oklch(0.52 0.09 188 / 0.3)", background: "white" }}
                              >
                                {alert.actionLabel} →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {dismissed.length > 0 && (
                    <button
                      onClick={() => setShowDismissed(!showDismissed)}
                      className="w-full flex items-center justify-between py-3 text-slate-400 press-feedback"
                    >
                      <span className="text-[13px] font-semibold">Dismissed ({dismissed.length})</span>
                      <ChevronRight size={14} className={`transition-transform ${showDismissed ? "rotate-90" : ""}`} />
                    </button>
                  )}
                  {showDismissed && dismissed.map((alert) => (
                    <div key={alert.id} className="rounded-2xl p-4 border border-slate-200 bg-slate-50 opacity-60">
                      <div className="flex items-center justify-between">
                        <p className="text-[13px] font-semibold text-slate-600">{alert.title}</p>
                        <button
                          onClick={() => { undismissAlert(alert.id); toast.info("Alert restored"); }}
                          className="flex items-center gap-1 text-[11px] font-semibold press-feedback"
                          style={{ color: "oklch(0.52 0.09 188)" }}
                        >
                          <RotateCcw size={11} /> Restore
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Contacts Tab ── */}
              {activeTab === "contacts" && (
                <div className="space-y-3">
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-3 flex items-center gap-2">
                    <AlertTriangle size={15} className="text-red-500 flex-shrink-0" />
                    <p className="text-[12px] text-red-700 leading-relaxed">
                      <strong>Emergency:</strong> Call 911 immediately if you experience severe symptoms, heavy bleeding, or loss of fetal movement.
                    </p>
                  </div>
                  {emergencyContacts.map((c) => {
                    const Icon = emergencyIconMap[c.type] ?? Phone;
                    const cfg = colorMap[c.color] ?? colorMap.blue;
                    return (
                      <div key={c.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                          <Icon size={20} className={cfg.text} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-bold" style={{ color: "oklch(0.22 0.04 240)", fontFamily: "'DM Serif Display', serif" }}>{c.label}</p>
                          <p className="text-[13px] text-slate-500">{c.number}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { toggleContactFavorite(c.id); toast.success(c.isFavorite ? "Removed from quick access" : "Added to quick access"); }}
                            className="w-8 h-8 rounded-full flex items-center justify-center press-feedback"
                          >
                            <Star size={16} className={c.isFavorite ? "text-amber-400 fill-amber-400" : "text-slate-300"} />
                          </button>
                          <button
                            onClick={() => {
                              if (c.number === "911") {
                                toast.error("Calling Emergency 911…", { duration: 3000 });
                              } else {
                                toast.success(`Calling ${c.label}…`);
                              }
                            }}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center press-feedback ${cfg.bg}`}
                          >
                            <Phone size={16} className={cfg.text} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
