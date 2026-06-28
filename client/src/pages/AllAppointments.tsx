/**
 * AllAppointments — Full appointment list with add, filter, status
 * Layout: Warm Cockpit (SidebarNav + Header + BottomNav)
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  ChevronLeft, Plus, Calendar, Clock, X, ChevronRight,
} from "lucide-react";
import { useCare, Appointment } from "@/contexts/CareContext";
import SidebarNav from "@/components/SidebarNav";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

const typeConfig = {
  routine:      { icon: "🩺", bg: "bg-blue-100",    text: "text-blue-700" },
  test:         { icon: "🧪", bg: "bg-amber-100",   text: "text-amber-700" },
  scan:         { icon: "🔬", bg: "bg-violet-100",  text: "text-violet-700" },
  consultation: { icon: "💬", bg: "bg-emerald-100", text: "text-emerald-700" },
};

const statusFilters = ["All", "Confirmed", "Pending", "Completed", "Cancelled"];

interface FormState {
  title: string; doctor: string; specialty: string; hospital: string;
  address: string; date: string; dateISO: string; time: string;
  duration: string; type: Appointment["type"]; status: Appointment["status"];
  notes: string; checklist: { item: string; done: boolean }[];
  reminder: string; color: string;
}

const defaultNewAppt: FormState = {
  title: "", doctor: "", specialty: "", hospital: "", address: "",
  date: "", dateISO: "", time: "", duration: "30 min", type: "routine",
  status: "pending", notes: "", checklist: [{ item: "Bring insurance card", done: false }],
  reminder: "1 day before", color: "blue",
};

export default function AllAppointments() {
  const [, navigate] = useLocation();
  const { appointments, addAppointment, cancelAppointment } = useCare();
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<FormState>({ ...defaultNewAppt });

  const filtered = appointments.filter((a) =>
    statusFilter === "All" || a.status.toLowerCase() === statusFilter.toLowerCase()
  );

  const handleAdd = () => {
    if (!form.title || !form.doctor || !form.date || !form.time) {
      toast.error("Please fill in all required fields");
      return;
    }
    addAppointment({ ...form });
    toast.success("Appointment added! 🎉");
    setShowAdd(false);
    setForm({ ...defaultNewAppt });
  };

  const upcoming = filtered.filter((a) => a.status === "confirmed" || a.status === "pending");
  const past = filtered.filter((a) => a.status === "completed" || a.status === "cancelled");

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
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={() => navigate("/care")}
                  className="w-9 h-9 rounded-xl flex items-center justify-center press-feedback"
                  style={{ background: "oklch(0.92 0.02 80)" }}
                >
                  <ChevronLeft size={20} style={{ color: "oklch(0.35 0.04 240)" }} />
                </button>
                <h2
                  className="text-xl font-bold flex-1"
                  style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.22 0.04 240)" }}
                >
                  Appointments
                </h2>
                <button
                  onClick={() => setShowAdd(true)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center press-feedback"
                  style={{ background: "oklch(0.52 0.09 188)" }}
                >
                  <Plus size={18} className="text-white" />
                </button>
              </div>
              {/* Status filter chips */}
              <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                {statusFilters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className="flex-shrink-0 text-[12px] font-semibold px-3 py-1.5 rounded-full press-feedback transition-colors"
                    style={
                      statusFilter === f
                        ? { background: "oklch(0.52 0.09 188)", color: "white" }
                        : { background: "white", color: "oklch(0.35 0.04 240)", border: "1px solid oklch(0.88 0.02 80)" }
                    }
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Appointment list */}
            <div className="px-4 pt-3 pb-6 lg:px-6">
              {filtered.length === 0 ? (
                <div className="py-12 text-center">
                  <span className="text-4xl">📅</span>
                  <p className="text-[14px] mt-3" style={{ color: "oklch(0.52 0.03 240)" }}>No {statusFilter.toLowerCase()} appointments</p>
                  <button
                    onClick={() => setShowAdd(true)}
                    className="mt-3 font-semibold text-[13px] press-feedback"
                    style={{ color: "oklch(0.52 0.09 188)" }}
                  >
                    + Add Appointment
                  </button>
                </div>
              ) : (
                <>
                  {upcoming.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[12px] font-bold uppercase tracking-wider mb-2" style={{ color: "oklch(0.62 0.03 240)" }}>Upcoming</p>
                      <div className="space-y-3">
                        {upcoming.map((a) => (
                          <ApptCard key={a.id} appt={a} onTap={() => navigate(`/care/appointment/${a.id}`)} onCancel={() => { cancelAppointment(a.id); toast.error("Appointment cancelled"); }} />
                        ))}
                      </div>
                    </div>
                  )}
                  {past.length > 0 && (
                    <div>
                      <p className="text-[12px] font-bold uppercase tracking-wider mb-2" style={{ color: "oklch(0.62 0.03 240)" }}>Past</p>
                      <div className="space-y-3">
                        {past.map((a) => (
                          <ApptCard key={a.id} appt={a} onTap={() => navigate(`/care/appointment/${a.id}`)} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
      <BottomNav />

      {/* Add Appointment Sheet */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAdd(false)} />
          <div className="relative bg-white rounded-t-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-5 pt-4 pb-3 border-b border-slate-100">
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <p
                  className="text-[18px] font-bold"
                  style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.22 0.04 240)" }}
                >
                  New Appointment
                </p>
                <button onClick={() => setShowAdd(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center press-feedback">
                  <X size={15} className="text-slate-500" />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: "Title *", key: "title", placeholder: "e.g. 28-Week Checkup" },
                { label: "Doctor *", key: "doctor", placeholder: "e.g. Dr. Sarah Chen" },
                { label: "Specialty", key: "specialty", placeholder: "e.g. OB/GYN" },
                { label: "Hospital", key: "hospital", placeholder: "e.g. City Maternity Hospital" },
                { label: "Address", key: "address", placeholder: "Hospital address" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-[12px] font-semibold text-slate-500 mb-1 block">{label}</label>
                  <input
                    value={(form as any)[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full rounded-xl px-3 py-2.5 text-[14px] outline-none"
                    style={{ background: "oklch(0.96 0.01 80)", border: "1px solid oklch(0.88 0.02 80)", color: "oklch(0.22 0.04 240)" }}
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-semibold text-slate-500 mb-1 block">Date *</label>
                  <input
                    type="date"
                    value={form.dateISO}
                    onChange={(e) => {
                      const d = new Date(e.target.value);
                      const formatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                      setForm((f) => ({ ...f, dateISO: e.target.value, date: formatted }));
                    }}
                    className="w-full rounded-xl px-3 py-2.5 text-[14px] outline-none"
                    style={{ background: "oklch(0.96 0.01 80)", border: "1px solid oklch(0.88 0.02 80)", color: "oklch(0.22 0.04 240)" }}
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-slate-500 mb-1 block">Time *</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => {
                      const [h, m] = e.target.value.split(":");
                      const hNum = parseInt(h);
                      const ampm = hNum >= 12 ? "PM" : "AM";
                      const h12 = hNum % 12 || 12;
                      setForm((f) => ({ ...f, time: `${h12}:${m} ${ampm}` }));
                    }}
                    className="w-full rounded-xl px-3 py-2.5 text-[14px] outline-none"
                    style={{ background: "oklch(0.96 0.01 80)", border: "1px solid oklch(0.88 0.02 80)", color: "oklch(0.22 0.04 240)" }}
                  />
                </div>
              </div>
              <div>
                <label className="text-[12px] font-semibold text-slate-500 mb-1 block">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["routine", "test", "scan", "consultation"] as const).map((t) => {
                    const cfg = typeConfig[t];
                    return (
                      <button
                        key={t}
                        onClick={() => setForm((f) => ({ ...f, type: t }))}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold press-feedback transition-colors"
                        style={
                          form.type === t
                            ? { background: "oklch(0.52 0.09 188)", color: "white" }
                            : undefined
                        }
                      >
                        {form.type !== t && <span className={`flex items-center gap-2 ${cfg.bg} ${cfg.text} w-full px-3 py-2 rounded-xl`}><span>{cfg.icon}</span><span className="capitalize">{t}</span></span>}
                        {form.type === t && <><span>{cfg.icon}</span><span className="capitalize">{t}</span></>}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-[12px] font-semibold text-slate-500 mb-1 block">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Any special instructions…"
                  className="w-full rounded-xl px-3 py-2.5 text-[14px] outline-none resize-none"
                  style={{ background: "oklch(0.96 0.01 80)", border: "1px solid oklch(0.88 0.02 80)", color: "oklch(0.22 0.04 240)" }}
                  rows={2}
                />
              </div>
              <button
                onClick={handleAdd}
                className="w-full text-white font-bold py-3.5 rounded-xl press-feedback text-[15px]"
                style={{ background: "oklch(0.52 0.09 188)", boxShadow: "0 4px 12px oklch(0.52 0.09 188 / 0.3)" }}
              >
                Add Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ApptCard({ appt, onTap, onCancel }: { appt: Appointment; onTap: () => void; onCancel?: () => void }) {
  const cfg = typeConfig[appt.type];
  const isCancelled = appt.status === "cancelled";
  return (
    <button
      onClick={onTap}
      className={`w-full bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-slate-100 press-feedback text-left ${isCancelled ? "opacity-60" : ""}`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${cfg.bg}`}>{cfg.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold truncate" style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.22 0.04 240)" }}>{appt.title}</p>
        <p className="text-[12px] text-slate-500 truncate">{appt.doctor}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-1">
            <Calendar size={10} style={{ color: "oklch(0.52 0.09 188)" }} />
            <span className="text-[11px] text-slate-500">{appt.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={10} style={{ color: "oklch(0.52 0.09 188)" }} />
            <span className="text-[11px] text-slate-500">{appt.time}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          appt.status === "confirmed" ? "bg-emerald-100 text-emerald-700" :
          appt.status === "pending" ? "bg-amber-100 text-amber-700" :
          appt.status === "completed" ? "bg-blue-100 text-blue-700" :
          "bg-slate-100 text-slate-500"
        }`}>
          {appt.status}
        </span>
        <ChevronRight size={13} className="text-slate-300" />
      </div>
    </button>
  );
}
