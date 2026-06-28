/**
 * CareHospital — Main Care & Hospital page
 * Layout: Warm Cockpit (SidebarNav + Header + BottomNav) — same as Home/MumMonitor
 * All functional content preserved from original
 */
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import ConsultationInterpreter from "@/components/ConsultationInterpreter";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  ChevronRight, MapPin, Clock,
  Calendar, Scan, Star, Heart, Activity,
  Search, X, AlertTriangle, Phone, Ambulance,
  Shield, Baby, Sparkles, Settings2,
} from "lucide-react";
import { useCare } from "@/contexts/CareContext";
import { usePregnancy } from "@/hooks/usePregnancy";
import { getWeekData, getTrimesterName, getFetusImage } from "@/lib/pregnancyData";
import Header from "@/components/Header";
import SidebarNav from "@/components/SidebarNav";
import BottomNav from "@/components/BottomNav";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  blue:    { bg: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-200" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  violet:  { bg: "bg-violet-100",  text: "text-violet-700",  border: "border-violet-200" },
  rose:    { bg: "bg-rose-100",    text: "text-rose-700",    border: "border-rose-200" },
  amber:   { bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-200" },
  red:     { bg: "bg-red-100",     text: "text-red-700",     border: "border-red-200" },
};

const apptTypeConfig = {
  routine:      { icon: "🩺", bg: "bg-blue-100",   text: "text-blue-700" },
  test:         { icon: "🧪", bg: "bg-amber-100",  text: "text-amber-700" },
  scan:         { icon: "🔬", bg: "bg-violet-100", text: "text-violet-700" },
  consultation: { icon: "💬", bg: "bg-emerald-100",text: "text-emerald-700" },
};

const emergencyIconMap: Record<string, React.ElementType> = {
  emergency: Ambulance,
  hospital:  Heart,
  midwife:   Phone,
  other:     Shield,
};

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-base font-bold" style={{ color: "oklch(0.22 0.04 240)" }}>
        {title}
      </h2>
      {onSeeAll && (
        <button onClick={onSeeAll} className="text-[13px] font-semibold text-primary press-feedback flex items-center gap-0.5">
          See all <ChevronRight size={13} />
        </button>
      )}
    </div>
  );
}

export default function CareHospital() {
  const [, navigate] = useLocation();
  const {
    pregnancyWeek, dueDate,
    hospitals, toggleHospitalFavorite,
    appointments,
    riskAlerts,
    emergencyContacts,
  } = useCare();

  // SSOT: use usePregnancy directly for richer week data
  const { currentWeek, dueDateFormatted, hasProfile, isLoading: pregnancyLoading } = usePregnancy();
  const displayWeek = currentWeek ?? 15;
  const weekData = getWeekData(displayWeek);
  const trimesterName = getTrimesterName(displayWeek);
  const progressPct = Math.round((displayWeek / 40) * 100);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showInterpreter, setShowInterpreter] = useState(false);

  const activeAlerts = riskAlerts.filter((a) => !a.dismissed);
  const upcomingAppts = appointments
    .filter((a) => a.status !== "cancelled" && a.status !== "completed")
    .slice(0, 3);
  const favoriteContacts = emergencyContacts.filter((c) => c.isFavorite);

  const filteredHospitals = searchQuery
    ? hospitals.filter(
        (h) =>
          h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : hospitals;

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
        {/* Left: Sidebar (desktop only) */}
        <SidebarNav />

        {/* Center: Main content */}
        <main className="flex-1 flex flex-col min-w-0">
          <Header className="lg:border-b lg:px-6 lg:py-4" />

          {/* Search bar (inline, below header when active) */}
          {showSearch && (
            <div className="px-4 py-2 border-b border-border/40 bg-background/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
                <Search size={15} className="text-muted-foreground flex-shrink-0" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search hospitals, doctors…"
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")}>
                    <X size={13} className="text-muted-foreground" />
                  </button>
                )}
                <button
                  onClick={() => { setShowSearch(false); setSearchQuery(""); }}
                  className="text-[13px] font-semibold text-primary ml-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto pb-20 lg:pb-8" style={{ scrollbarWidth: "thin" }}>

            {/* Desktop page title */}
            <div className="hidden lg:flex items-center justify-between px-6 pt-5 pb-2">
              <div>
                <h2
                  className="text-2xl font-bold"
                  style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.22 0.04 240)" }}
                >
                  Medical Support
                </h2>
                <p className="text-sm mt-1" style={{ color: "oklch(0.52 0.03 240)" }}>
                  Week {pregnancyWeek} &nbsp;·&nbsp; Due {dueDate}
                </p>
              </div>
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="w-9 h-9 bg-white/70 border border-border/40 rounded-xl flex items-center justify-center hover:bg-white transition-colors"
              >
                <Search size={16} className="text-muted-foreground" />
              </button>
            </div>

            <div className="flex flex-col gap-5 pt-3 lg:px-6 lg:pt-2">

              {/* ── Pregnancy Week Card (SSOT) ── */}
              <div className="mx-4 lg:mx-0">
                {/* No profile set — prompt to configure */}
                {!pregnancyLoading && !hasProfile && (
                  <button
                    onClick={() => navigate("/settings")}
                    className="w-full rounded-2xl p-4 flex items-center gap-3 press-feedback"
                    style={{
                      background: "linear-gradient(120deg, oklch(0.95 0.03 188 / 0.4), oklch(0.96 0.04 80 / 0.35))",
                      border: "1.5px dashed oklch(0.70 0.07 188 / 0.6)",
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "oklch(0.90 0.06 188 / 0.5)" }}>
                      <Settings2 size={18} style={{ color: "oklch(0.45 0.09 188)" }} />
                    </div>
                    <div className="text-left">
                      <p className="text-[13px] font-bold" style={{ color: "oklch(0.28 0.04 240)" }}>Set your due date</p>
                      <p className="text-[12px]" style={{ color: "oklch(0.52 0.04 240)" }}>Tap to configure in Settings → pregnancy info</p>
                    </div>
                    <ChevronRight size={16} className="ml-auto flex-shrink-0" style={{ color: "oklch(0.55 0.06 188)" }} />
                  </button>
                )}

                {/* Profile set — show rich week card */}
                {(pregnancyLoading || hasProfile) && (
                  <div
                    className="rounded-2xl overflow-hidden relative"
                    style={{
                      background: "linear-gradient(135deg, oklch(0.94 0.05 188 / 0.3) 0%, oklch(0.96 0.04 220 / 0.25) 50%, oklch(0.95 0.04 80 / 0.2) 100%)",
                      border: "1px solid oklch(0.85 0.06 188 / 0.35)",
                      boxShadow: "0 4px 20px oklch(0.70 0.08 188 / 0.12)",
                    }}
                  >
                    {/* Top row: label + trimester badge */}
                    <div className="flex items-center justify-between px-4 pt-4 pb-0">
                      <div className="flex items-center gap-2">
                        <Baby size={14} style={{ color: "oklch(0.45 0.09 188)" }} />
                        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "oklch(0.45 0.09 188)" }}>
                          Pregnancy Week
                        </span>
                      </div>
                      <span
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                        style={{ background: "oklch(0.88 0.08 188 / 0.5)", color: "oklch(0.38 0.09 188)" }}
                      >
                        {trimesterName}
                      </span>
                    </div>

                    {/* Main content row */}
                    <div className="flex items-stretch gap-3 px-4 pt-3 pb-4">
                      {/* Left: week number + progress */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        {/* Big week number */}
                        <div className="flex items-baseline gap-1.5">
                          <motion.span
                            key={displayWeek}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            className="text-[52px] font-black leading-none"
                            style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.22 0.04 240)" }}
                          >
                            {pregnancyLoading ? "—" : displayWeek}
                          </motion.span>
                          <div className="flex flex-col">
                            <span className="text-[14px] font-bold leading-tight" style={{ color: "oklch(0.42 0.04 240)" }}>weeks</span>
                            <span className="text-[11px]" style={{ color: "oklch(0.55 0.04 240)" }}>of 40</span>
                          </div>
                        </div>

                        {/* Baby size */}
                        <div className="mt-2">
                          <p className="text-[11px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: "oklch(0.55 0.06 188)" }}>
                            Baby is the size of
                          </p>
                          <p className="text-[15px] font-bold capitalize" style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.22 0.04 240)" }}>
                            {weekData.fetusSize}
                          </p>
                        </div>

                        {/* Due date */}
                        <div className="mt-2.5 flex items-center gap-1.5">
                          <Calendar size={12} style={{ color: "oklch(0.55 0.06 188)" }} />
                          <span className="text-[12px] font-semibold" style={{ color: "oklch(0.42 0.04 240)" }}>
                            Due {dueDateFormatted ?? dueDate ?? "—"}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-semibold" style={{ color: "oklch(0.55 0.04 240)" }}>Journey progress</span>
                            <span className="text-[11px] font-bold" style={{ color: "oklch(0.45 0.09 188)" }}>{progressPct}%</span>
                          </div>
                          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "oklch(0.88 0.06 188 / 0.35)" }}>
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: "linear-gradient(90deg, oklch(0.55 0.12 188), oklch(0.62 0.10 220))" }}
                              initial={{ width: "0%" }}
                              animate={{ width: `${progressPct}%` }}
                              transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
                            />
                          </div>
                          {/* Week markers */}
                          <div className="flex justify-between mt-1">
                            {[0, 13, 27, 40].map((marker) => (
                              <div key={marker} className="flex flex-col items-center">
                                <div
                                  className="w-0.5 h-1.5 rounded-full"
                                  style={{ background: displayWeek >= marker ? "oklch(0.55 0.12 188)" : "oklch(0.80 0.04 240)" }}
                                />
                                <span className="text-[9px] mt-0.5" style={{ color: "oklch(0.60 0.03 240)" }}>{marker}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: fetus image + insights */}
                      <div className="flex flex-col items-center gap-2 w-[100px] flex-shrink-0">
                        {/* Fetus image */}
                        <div
                          className="w-[88px] h-[88px] rounded-2xl overflow-hidden flex items-center justify-center"
                          style={{ background: "oklch(0.90 0.05 188 / 0.35)", border: "1px solid oklch(0.82 0.07 188 / 0.4)" }}
                        >
                          <img
                            src={weekData.fetusImage}
                            alt={`Week ${displayWeek} fetus`}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Baby insights pills */}
                        <div className="flex flex-col gap-1 w-full">
                          {weekData.babyInsights.slice(0, 2).map((insight, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-1 rounded-lg px-2 py-1"
                              style={{ background: "oklch(0.92 0.04 188 / 0.4)" }}
                            >
                              <span className="text-[11px]">{insight.icon}</span>
                              <span className="text-[9px] font-semibold leading-tight" style={{ color: "oklch(0.32 0.04 240)" }}>
                                {insight.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom: week description */}
                    <div
                      className="px-4 py-3 border-t"
                      style={{ borderColor: "oklch(0.85 0.05 188 / 0.3)", background: "oklch(0.97 0.02 188 / 0.3)" }}
                    >
                      <div className="flex items-start gap-2">
                        <Sparkles size={12} className="flex-shrink-0 mt-0.5" style={{ color: "oklch(0.55 0.10 80)" }} />
                        <p className="text-[11px] leading-[1.6]" style={{ color: "oklch(0.38 0.04 240)" }}>
                          {weekData.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>



              {/* ── Nearby Hospitals ── */}
              <div>
                <div className="mx-4 lg:mx-0">
                  <SectionHeader title="Nearby Hospitals" onSeeAll={() => navigate("/care/hospitals")} />
                </div>
                {searchQuery && filteredHospitals.length === 0 ? (
                  <div className="mx-4 py-8 text-center">
                    <p className="text-sm text-muted-foreground">No hospitals match "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="flex gap-3 px-4 lg:px-0 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                    {(searchQuery ? filteredHospitals : hospitals).slice(0, 4).map((h) => (
                      <div
                        key={h.id}
                        onClick={() => navigate(`/care/hospital/${h.id}`)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && navigate(`/care/hospital/${h.id}`)}
                        className="flex-shrink-0 w-[210px] bg-white/80 rounded-2xl overflow-hidden shadow-sm border border-white/60 press-feedback text-left hover:bg-white transition-colors cursor-pointer"
                      >
                        <div className="h-[100px] overflow-hidden relative">
                          <img src={h.image} alt={h.name} className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-0.5 flex items-center gap-1">
                            <MapPin size={10} className="text-primary" />
                            <span className="text-[11px] font-bold" style={{ color: "oklch(0.22 0.04 240)" }}>{h.distance}</span>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleHospitalFavorite(h.id); toast.success(h.isFavorite ? "Removed from favorites" : "Added to favorites"); }}
                            className="absolute top-2 left-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center"
                          >
                            <Heart size={13} className={h.isFavorite ? "text-red-500 fill-red-500" : "text-muted-foreground"} />
                          </button>
                        </div>
                        <div className="p-3">
                          <p className="text-[13px] font-bold leading-tight" style={{ color: "oklch(0.22 0.04 240)" }}>{h.name}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{h.type}</p>
                          <div className="flex items-center gap-1 mt-1.5">
                            <Star size={11} className="text-amber-400 fill-amber-400" />
                            <span className="text-[12px] font-semibold" style={{ color: "oklch(0.22 0.04 240)" }}>{h.rating}</span>
                            <span className="text-[11px] text-muted-foreground">({h.reviews})</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {h.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${colorMap[h.color]?.bg ?? "bg-blue-100"} ${colorMap[h.color]?.text ?? "text-blue-700"}`}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Risk Alerts ── */}
              {activeAlerts.length > 0 && (
                <div className="mx-4 lg:mx-0">
                  <SectionHeader title="Risk Alerts" onSeeAll={() => navigate("/care/alerts")} />
                  {activeAlerts.slice(0, 2).map((alert) => {
                    const severityConfig = {
                      high:   { border: "border-red-200 bg-red-50/80",    dot: "bg-red-500",    badge: "bg-red-100 text-red-700" },
                      medium: { border: "border-amber-200 bg-amber-50/80", dot: "bg-amber-500", badge: "bg-amber-100 text-amber-700" },
                      low:    { border: "border-blue-200 bg-blue-50/80",   dot: "bg-blue-400",  badge: "bg-blue-100 text-blue-700" },
                    };
                    const cfg = severityConfig[alert.severity];
                    return (
                      <button
                        key={alert.id}
                        onClick={() => navigate("/care/alerts")}
                        className={`w-full rounded-2xl p-4 border mb-3 text-left press-feedback ${cfg.border}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[13px] font-bold truncate" style={{ color: "oklch(0.22 0.04 240)" }}>{alert.title}</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.badge}`}>{alert.due}</span>
                            </div>
                            <p className="text-[12px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{alert.desc}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── Upcoming Appointments ── */}
              <div className="mx-4 lg:mx-0">
                <SectionHeader title="Upcoming Appointments" onSeeAll={() => navigate("/care/appointments")} />
                {upcomingAppts.length === 0 ? (
                  <div className="bg-white/70 rounded-2xl p-6 text-center border border-white/60 shadow-sm">
                    <span className="text-3xl">📅</span>
                    <p className="text-sm font-semibold text-muted-foreground mt-2">No upcoming appointments</p>
                    <button onClick={() => navigate("/care/appointments")} className="mt-3 text-[13px] font-semibold text-primary press-feedback">
                      + Add Appointment
                    </button>
                  </div>
                ) : (
                  upcomingAppts.map((a) => {
                    const cfg = apptTypeConfig[a.type];
                    return (
                      <button
                        key={a.id}
                        onClick={() => navigate(`/care/appointment/${a.id}`)}
                        className="w-full bg-white/70 rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-white/60 press-feedback text-left mb-3 hover:bg-white/90 transition-colors"
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${cfg.bg}`}>
                          {cfg.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-bold truncate" style={{ color: "oklch(0.22 0.04 240)" }}>{a.title}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{a.doctor} · {a.hospital}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <div className="flex items-center gap-1">
                              <Calendar size={11} className="text-primary" />
                              <span className="text-[11px] font-semibold" style={{ color: "oklch(0.42 0.04 240)" }}>{a.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={11} className="text-primary" />
                              <span className="text-[11px] font-semibold" style={{ color: "oklch(0.42 0.04 240)" }}>{a.time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.status === "confirmed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                            {a.status}
                          </span>
                          <ChevronRight size={14} className="text-muted-foreground/50" />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* ── Emergency Contacts ── */}
              <div className="mx-4 lg:mx-0">
                <SectionHeader title="Emergency Contacts" onSeeAll={() => navigate("/care/alerts")} />
                <div className="grid grid-cols-2 gap-3">
                  {favoriteContacts.map((c) => {
                    const Icon = emergencyIconMap[c.type] ?? Phone;
                    const cfg = colorMap[c.color] ?? colorMap.blue;
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          if (c.number === "911") {
                            toast.error("Calling Emergency 911…", { duration: 3000 });
                          } else {
                            toast.success(`Calling ${c.label}…`);
                          }
                        }}
                        className="bg-white/70 rounded-2xl p-3 flex items-center gap-2 shadow-sm border border-white/60 press-feedback text-left hover:bg-white/90 transition-colors"
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                          <Icon size={16} className={cfg.text} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold truncate" style={{ color: "oklch(0.22 0.04 240)" }}>{c.label}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{c.number}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Triage Guide Banner ── */}
              <div className="mx-4 lg:mx-0">
                <button
                  onClick={() => navigate("/care/triage")}
                  className="w-full rounded-2xl p-4 relative overflow-hidden press-feedback text-left"
                  style={{ background: "linear-gradient(135deg, oklch(0.38 0.09 188) 0%, oklch(0.52 0.09 188) 100%)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Activity size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[15px] font-bold text-white" style={{ fontFamily: "'DM Serif Display', serif" }}>When to Go to Hospital</p>
                      <p className="text-[12px] text-white/80 mt-0.5">Know the warning signs that need immediate attention.</p>
                    </div>
                    <ChevronRight size={18} className="text-white/70 flex-shrink-0" />
                  </div>
                </button>
              </div>

              {/* ── Consultation Interpreter Entry Card ── */}
              <div className="mx-4 lg:mx-0">
                <button
                  onClick={() => setShowInterpreter(true)}
                  className="w-full rounded-2xl overflow-hidden press-feedback"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.95 0.04 80 / 0.6) 0%, oklch(0.93 0.05 60 / 0.55) 50%, oklch(0.94 0.04 40 / 0.5) 100%)",
                    border: "1.5px solid oklch(0.82 0.07 60 / 0.5)",
                    boxShadow: "0 4px 16px oklch(0.75 0.08 60 / 0.15)",
                  }}
                >
                  <div className="flex items-center gap-4 px-4 py-4">
                    {/* Icon cluster */}
                    <div className="flex-shrink-0 relative">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                        style={{ background: "oklch(0.88 0.08 60 / 0.6)", border: "1px solid oklch(0.78 0.09 60 / 0.4)" }}
                      >
                        🌐
                      </div>
                      <div
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[13px]"
                        style={{ background: "oklch(0.85 0.07 40 / 0.8)", border: "1px solid oklch(0.78 0.08 40 / 0.5)" }}
                      >
                        💬
                      </div>
                    </div>
                    {/* Text */}
                    <div className="flex-1 text-left">
                      <p className="text-[15px] font-bold leading-tight" style={{ color: "oklch(0.28 0.06 40)", fontFamily: "'DM Serif Display', serif" }}>Consultation Interpreter</p>
                      <p className="text-[12px] mt-0.5 leading-[1.5]" style={{ color: "oklch(0.42 0.05 40)" }}>
                        Real-time bilingual translation for doctor visits
                      </p>
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {["🇨🇳 Chinese", "🇬🇧 English", "🇯🇵 Japanese", "🇰🇷 Korean"].map((lang) => (
                          <span
                            key={lang}
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{ background: "oklch(0.88 0.06 60 / 0.7)", color: "oklch(0.35 0.07 40)" }}
                          >
                            {lang}
                          </span>
                        ))}
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: "oklch(0.88 0.06 60 / 0.7)", color: "oklch(0.35 0.07 40)" }}
                        >+4 more</span>
                      </div>
                    </div>
                    {/* Arrow */}
                    <div
                      className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: "oklch(0.85 0.07 60 / 0.6)" }}
                    >
                      <ChevronRight size={16} style={{ color: "oklch(0.38 0.08 40)" }} />
                    </div>
                  </div>
                  {/* Bottom strip */}
                                    <div className="px-4 py-2 flex items-center gap-1.5 flex-wrap"
                    style={{ background: "oklch(0.88 0.06 60 / 0.35)", borderTop: "1px solid oklch(0.82 0.07 60 / 0.3)" }}
                  >
                    <span className="text-[10px] whitespace-nowrap" style={{ color: "oklch(0.42 0.06 40)" }}>🎤 Voice</span>
                    <span className="text-[10px]" style={{ color: "oklch(0.65 0.04 40)" }}>·</span>
                    <span className="text-[10px] whitespace-nowrap" style={{ color: "oklch(0.42 0.06 40)" }}>⚡ Instant translation</span>
                    <span className="text-[10px]" style={{ color: "oklch(0.65 0.04 40)" }}>·</span>
                    <span className="text-[10px] whitespace-nowrap" style={{ color: "oklch(0.42 0.06 40)" }}>📋 Save history</span>
                  </div>
                </button>
              </div>

              {/* ── Saved Reports ── */}
              <div className="mx-4 lg:mx-0">
                <SectionHeader title="Scan History" onSeeAll={() => navigate("/care/reports")} />
                <button
                  onClick={() => navigate("/care/scan")}
                  className="w-full bg-white/70 rounded-2xl p-4 border border-dashed border-primary/30 flex items-center justify-center gap-3 press-feedback hover:bg-white/90 transition-colors"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Scan size={20} className="text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-[14px] font-bold text-primary">Scan a New Report</p>
                    <p className="text-[12px] text-muted-foreground">Point camera at prenatal report</p>
                  </div>
                </button>
              </div>

              {/* Bottom spacer for mobile nav */}
              <div className="h-4 lg:hidden" />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />

      {/* ── Consultation Interpreter Overlay ── */}
      <AnimatePresence>
        {showInterpreter && (
          <ConsultationInterpreter onClose={() => setShowInterpreter(false)} />
        )}
      </AnimatePresence>

      {/* Floating Scan FAB — only on mobile */}
      <button
        onClick={() => navigate("/care/scan")}
        className="fixed z-40 w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center press-feedback lg:hidden"
        style={{
          bottom: "80px",
          right: "16px",
          background: "oklch(0.52 0.09 188)",
          boxShadow: "0 4px 20px oklch(0.52 0.09 188 / 0.4)",
        }}
        aria-label="Scan prenatal report"
      >
        <Scan size={24} className="text-white" />
      </button>
    </div>
  );
}
