/**
 * AllReports — Saved prenatal report scan history
 * Design: Warm Cockpit — DM Serif Display + Inter, warm beige
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, Scan, ChevronRight, CheckCircle, AlertCircle, XCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCare } from "@/contexts/CareContext";
import SidebarNav from "@/components/SidebarNav";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

const statusConfig = {
  normal:    { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-100", label: "Normal" },
  attention: { icon: AlertCircle, color: "text-amber-500",   bg: "bg-amber-100",   label: "Attention" },
  concern:   { icon: XCircle,     color: "text-red-500",     bg: "bg-red-100",     label: "Concern" },
};

type SavedReport = ReturnType<typeof useCare>["savedReports"][0];

function ReportDetailModal({ report, onClose }: { report: SavedReport; onClose: () => void }) {
  const cfg = statusConfig[report.overallStatus];
  const Icon = cfg.icon;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

        {/* Sheet */}
        <motion.div
          className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.bg}`}>
                <Icon size={20} className={cfg.color} />
              </div>
              <div>
                <p className="text-[15px] font-bold text-slate-800" style={{ fontFamily: "'DM Serif Display', serif" }}>{report.reportType}</p>
                <p className="text-[12px] text-slate-500">{report.gestationalAge} · {report.date}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center press-feedback">
              <X size={16} className="text-slate-600" />
            </button>
          </div>

          {/* Summary badge */}
          <div className="px-5 py-3 flex-shrink-0" style={{ background: "oklch(0.97 0.015 80)" }}>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold ${cfg.bg} ${cfg.color}`}>
              <Icon size={13} />
              Overall: {cfg.label}
            </div>

          </div>

          {/* Metrics list */}
          <div className="flex-1 overflow-y-auto px-5 py-3" style={{ scrollbarWidth: "thin" }}>
            <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
              {report.metrics.length} Metrics Analysed
            </p>
            <div className="space-y-2">
              {report.metrics.map((m, i) => {
                const mCfg = statusConfig[m.status as keyof typeof statusConfig] ?? statusConfig.normal;
                const MIcon = mCfg.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-2.5"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${mCfg.bg}`}>
                      <MIcon size={14} className={mCfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-slate-800">{m.label}</p>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{m.unit}</p>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                      <span className="text-[13px] font-bold text-slate-700">{m.value} {m.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-slate-100 flex-shrink-0">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-semibold text-[14px] text-white press-feedback"
              style={{ background: "oklch(0.52 0.09 188)", boxShadow: "0 4px 12px oklch(0.52 0.09 188 / 0.35)" }}
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function AllReports() {
  const [, navigate] = useLocation();
  const { savedReports } = useCare();
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);

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

            {/* Sub-page header */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 py-3 flex items-center justify-between">
              <button onClick={() => navigate("/care")} className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center press-feedback">
                <ChevronLeft size={20} className="text-slate-700" />
              </button>
              <p className="text-[17px] font-bold text-slate-800" style={{ fontFamily: "'DM Serif Display', serif" }}>Scan History</p>
              <button
                onClick={() => navigate("/care/scan")}
                className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center press-feedback"
              >
                <Scan size={17} className="text-white" />
              </button>
            </header>

            <div className="pb-6 px-4 pt-4">
              {savedReports.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Scan size={36} className="text-blue-500" />
                  </div>
                  <p className="text-[17px] font-bold text-slate-700" style={{ fontFamily: "'DM Serif Display', serif" }}>No reports yet</p>
                  <p className="text-[13px] text-slate-500 mt-2 max-w-[220px] mx-auto leading-relaxed">
                    Scan your prenatal reports to get AI-powered analysis and insights.
                  </p>
                  <button
                    onClick={() => navigate("/care/scan")}
                    className="mt-5 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl press-feedback text-[14px]"
                    style={{ boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}
                  >
                    Scan First Report
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedReports.map((r) => {
                    const cfg = statusConfig[r.overallStatus];
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={r.id}
                        onClick={() => setSelectedReport(r)}
                        className="w-full bg-white rounded-2xl p-4 border border-slate-100 shadow-sm press-feedback text-left flex items-center gap-3"
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                          <Icon size={22} className={cfg.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-bold text-slate-800" style={{ fontFamily: "'DM Serif Display', serif" }}>{r.reportType}</p>
                          <p className="text-[12px] text-slate-500">{r.gestationalAge} · {r.date}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                            <span className="text-[11px] text-slate-400">{r.metrics.length} metrics analysed</span>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
      <BottomNav />

      {/* Report detail modal */}
      {selectedReport && (
        <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />
      )}
    </div>
  );
}
