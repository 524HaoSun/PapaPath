/**
 * AppointmentDetail — Full appointment management with checklist, status, cancel
 * Design: Warm Cockpit — DM Serif Display + Inter, warm beige
 */
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import {
  ChevronLeft, Calendar, Clock, MapPin, User, FileText,
  Bell, CheckCircle, AlertCircle, Trash2, Edit3,
  Navigation, Phone, ChevronRight, Check, X, Plus
} from "lucide-react";
import { useCare } from "@/contexts/CareContext";
import SidebarNav from "@/components/SidebarNav";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

const typeConfig = {
  routine:      { icon: "🩺", bg: "bg-blue-100",    text: "text-blue-700",    label: "Routine Checkup" },
  test:         { icon: "🧪", bg: "bg-amber-100",   text: "text-amber-700",   label: "Lab Test" },
  scan:         { icon: "🔬", bg: "bg-violet-100",  text: "text-violet-700",  label: "Ultrasound Scan" },
  consultation: { icon: "💬", bg: "bg-emerald-100", text: "text-emerald-700", label: "Consultation" },
};

const reminderOptions = ["30 min before", "1 hour before", "3 hours before", "1 day before", "2 days before", "3 days before"];

export default function AppointmentDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { appointments, updateAppointment, cancelAppointment, toggleChecklistItem } = useCare();

  const appt = appointments.find((a) => a.id === Number(id));

  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(appt?.notes ?? "");
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [newCheckItem, setNewCheckItem] = useState("");
  const [addingItem, setAddingItem] = useState(false);

  const warmBg = {
    background: "oklch(0.97 0.015 80)",
    backgroundImage:
      "radial-gradient(circle at 20% 20%, oklch(0.94 0.03 188 / 0.12) 0%, transparent 50%), radial-gradient(circle at 80% 80%, oklch(0.95 0.04 80 / 0.15) 0%, transparent 50%)",
  };

  if (!appt) {
    return (
      <div className="min-h-screen" style={warmBg}>
        <div className="flex min-h-screen">
          <SidebarNav />
          <main className="flex-1 flex flex-col min-w-0">
            <Header className="lg:border-b lg:px-6 lg:py-4" />
            <div className="flex-1 overflow-y-auto pb-20 lg:pb-8" style={{ scrollbarWidth: "thin" }}>
              <div className="text-center p-8">
                <span className="text-4xl">📅</span>
                <p className="text-[16px] font-bold text-slate-700 mt-3">Appointment not found</p>
                <button onClick={() => navigate("/care/appointments")} className="mt-4 text-blue-600 font-semibold press-feedback">
                  View all appointments
                </button>
              </div>
            </div>
          </main>
        </div>
        <BottomNav />
      </div>
    );
  }

  const cfg = typeConfig[appt.type];
  const isCancelled = appt.status === "cancelled";
  const isCompleted = appt.status === "completed";
  const checkedCount = appt.checklist.filter((i) => i.done).length;

  const handleSaveNotes = () => {
    updateAppointment(appt.id, { notes: notesValue });
    setEditingNotes(false);
    toast.success("Notes saved");
  };

  const handleSetReminder = (reminder: string) => {
    updateAppointment(appt.id, { reminder });
    setShowReminderPicker(false);
    toast.success(`Reminder set: ${reminder}`);
  };

  const handleCancel = () => {
    cancelAppointment(appt.id);
    setShowCancelConfirm(false);
    toast.error("Appointment cancelled");
    setTimeout(() => navigate("/care/appointments"), 1200);
  };

  const handleMarkComplete = () => {
    updateAppointment(appt.id, { status: "completed" });
    toast.success("Appointment marked as completed! 🎉");
  };

  const handleAddCheckItem = () => {
    if (!newCheckItem.trim()) return;
    const updated = [...appt.checklist, { item: newCheckItem.trim(), done: false }];
    updateAppointment(appt.id, { checklist: updated });
    setNewCheckItem("");
    setAddingItem(false);
    toast.success("Item added to checklist");
  };

  return (
    <div className="min-h-screen" style={warmBg}>
      <div className="flex min-h-screen">
        <SidebarNav />
        <main className="flex-1 flex flex-col min-w-0">
          <Header className="lg:border-b lg:px-6 lg:py-4" />
          <div className="flex-1 overflow-y-auto pb-20 lg:pb-8" style={{ scrollbarWidth: "thin" }}>

            {/* Sub-page header */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 py-3 flex items-center justify-between">
              <button onClick={() => navigate("/care/appointments")} className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center press-feedback">
                <ChevronLeft size={20} className="text-slate-700" />
              </button>
              <p className="text-[16px] font-bold text-slate-800" style={{ fontFamily: "'DM Serif Display', serif" }}>Appointment</p>
              {!isCancelled && !isCompleted && (
                <button
                  onClick={handleMarkComplete}
                  className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center press-feedback"
                  title="Mark as completed"
                >
                  <Check size={17} className="text-emerald-600" />
                </button>
              )}
              {(isCancelled || isCompleted) && <div className="w-9 h-9" />}
            </header>

            <div className="pb-8 p-4 space-y-4">
              {/* Title Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-semibold mb-3 ${cfg.bg} ${cfg.text}`}>
                  <span>{cfg.icon}</span>
                  {cfg.label}
                </div>
                <h1 className="text-[22px] font-black text-slate-800 mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
                  {appt.title}
                </h1>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    appt.status === "confirmed" ? "bg-emerald-500 status-dot-pulse" :
                    appt.status === "pending" ? "bg-amber-500 status-dot-pulse" :
                    appt.status === "completed" ? "bg-blue-500" : "bg-slate-400"
                  }`} />
                  <span className={`text-[13px] font-semibold capitalize ${
                    appt.status === "confirmed" ? "text-emerald-600" :
                    appt.status === "pending" ? "text-amber-600" :
                    appt.status === "completed" ? "text-blue-600" : "text-slate-500"
                  }`}>
                    {appt.status}
                  </span>
                </div>
              </div>

              {/* Date & Time */}
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <p className="text-[14px] font-bold text-slate-800 mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>Date & Time</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-xl p-3 flex items-center gap-2">
                    <Calendar size={16} className="text-blue-600" />
                    <div>
                      <p className="text-[11px] text-slate-500">Date</p>
                      <p className="text-[13px] font-bold text-slate-800">{appt.date}</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 flex items-center gap-2">
                    <Clock size={16} className="text-blue-600" />
                    <div>
                      <p className="text-[11px] text-slate-500">Time</p>
                      <p className="text-[13px] font-bold text-slate-800">{appt.time}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-slate-500">
                  <Clock size={12} />
                  <span className="text-[12px]">Duration: {appt.duration}</span>
                </div>
              </div>

              {/* Doctor & Location */}
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
                <p className="text-[14px] font-bold text-slate-800" style={{ fontFamily: "'DM Serif Display', serif" }}>Doctor & Location</p>
                <div className="w-full flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <User size={18} className="text-blue-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-[14px] font-semibold text-slate-800">{appt.doctor}</p>
                    <p className="text-[12px] text-slate-500">{appt.specialty}</p>
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(appt.hospital + ' ' + appt.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 press-feedback"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <MapPin size={18} className="text-blue-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-[14px] font-semibold text-slate-800">{appt.hospital}</p>
                    <p className="text-[12px] text-slate-500">{appt.address}</p>
                  </div>
                  <Navigation size={14} className="text-blue-500" />
                </a>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText size={15} className="text-blue-500" />
                    <p className="text-[14px] font-bold text-slate-800" style={{ fontFamily: "'DM Serif Display', serif" }}>Notes</p>
                  </div>
                  {!editingNotes && !isCancelled && (
                    <button onClick={() => { setEditingNotes(true); setNotesValue(appt.notes); }} className="text-[12px] text-blue-600 font-semibold press-feedback flex items-center gap-1">
                      <Edit3 size={12} /> Edit
                    </button>
                  )}
                </div>
                {editingNotes ? (
                  <div>
                    <textarea
                      autoFocus
                      value={notesValue}
                      onChange={(e) => setNotesValue(e.target.value)}
                      className="w-full text-[13px] text-slate-700 bg-slate-50 rounded-xl p-3 outline-none border border-blue-200 resize-none leading-relaxed"
                      rows={3}
                      placeholder="Add notes for this appointment…"
                    />
                    <div className="flex gap-2 mt-2">
                      <button onClick={handleSaveNotes} className="flex-1 bg-blue-600 text-white text-[13px] font-semibold py-2 rounded-xl press-feedback">Save</button>
                      <button onClick={() => setEditingNotes(false)} className="flex-1 bg-slate-100 text-slate-600 text-[13px] font-semibold py-2 rounded-xl press-feedback">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className={`${appt.notes ? "bg-amber-50 border border-amber-100" : "bg-slate-50"} rounded-xl p-3`}>
                    {appt.notes ? (
                      <div className="flex items-start gap-2">
                        <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-[13px] text-amber-800 leading-relaxed">{appt.notes}</p>
                      </div>
                    ) : (
                      <p className="text-[13px] text-slate-400 italic">No notes added yet. Tap Edit to add.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Checklist */}
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[14px] font-bold text-slate-800" style={{ fontFamily: "'DM Serif Display', serif" }}>Preparation Checklist</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{checkedCount}/{appt.checklist.length} completed</p>
                  </div>
                  {!isCancelled && (
                    <button onClick={() => setAddingItem(true)} className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center press-feedback">
                      <Plus size={14} className="text-blue-600" />
                    </button>
                  )}
                </div>
                {/* Progress bar */}
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${appt.checklist.length ? (checkedCount / appt.checklist.length) * 100 : 0}%` }}
                  />
                </div>
                <div className="space-y-0">
                  {appt.checklist.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => { if (!isCancelled) toggleChecklistItem(appt.id, i); }}
                      className="w-full flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0 press-feedback text-left"
                      disabled={isCancelled}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${item.done ? "bg-emerald-500" : "border-2 border-slate-200"}`}>
                        {item.done && <Check size={11} className="text-white" />}
                      </div>
                      <span className={`text-[13px] transition-colors ${item.done ? "text-slate-400 line-through" : "text-slate-700"}`}>
                        {item.item}
                      </span>
                    </button>
                  ))}
                </div>
                {addingItem && (
                  <div className="mt-3 flex gap-2">
                    <input
                      autoFocus
                      value={newCheckItem}
                      onChange={(e) => setNewCheckItem(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleAddCheckItem(); if (e.key === "Escape") setAddingItem(false); }}
                      placeholder="Add checklist item…"
                      className="flex-1 text-[13px] bg-slate-50 border border-blue-200 rounded-xl px-3 py-2 outline-none"
                    />
                    <button onClick={handleAddCheckItem} className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center press-feedback">
                      <Check size={15} className="text-white" />
                    </button>
                    <button onClick={() => { setAddingItem(false); setNewCheckItem(""); }} className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center press-feedback">
                      <X size={15} className="text-slate-500" />
                    </button>
                  </div>
                )}
              </div>

              {/* Reminder */}
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <button
                  onClick={() => !isCancelled && setShowReminderPicker(!showReminderPicker)}
                  className="w-full flex items-center justify-between press-feedback"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Bell size={18} className="text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-[14px] font-semibold text-slate-800">Reminder</p>
                      <p className="text-[12px] text-slate-500">{appt.reminder}</p>
                    </div>
                  </div>
                  {!isCancelled && <ChevronRight size={16} className={`text-slate-300 transition-transform ${showReminderPicker ? "rotate-90" : ""}`} />}
                </button>
                {showReminderPicker && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {reminderOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleSetReminder(opt)}
                        className={`py-2 px-3 rounded-xl text-[12px] font-semibold press-feedback transition-colors ${
                          appt.reminder === opt ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              {!isCancelled && !isCompleted && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 text-red-500 text-[14px] font-semibold py-3 rounded-xl border border-red-100 bg-red-50 press-feedback"
                >
                  <Trash2 size={16} />
                  Cancel Appointment
                </button>
              )}
              {isCancelled && (
                <div className="bg-slate-100 rounded-2xl p-4 text-center">
                  <p className="text-[14px] font-semibold text-slate-500">This appointment has been cancelled.</p>
                  <button onClick={() => navigate("/care/appointments")} className="mt-2 text-[13px] text-blue-600 font-semibold press-feedback">
                    View all appointments →
                  </button>
                </div>
              )}
            </div>

            {/* Cancel Confirm Modal */}
            {showCancelConfirm && (
              <div className="fixed inset-0 z-50 flex items-end justify-center">
                <div className="absolute inset-0 bg-black/40" onClick={() => setShowCancelConfirm(false)} />
                <div className="relative bg-white rounded-t-3xl p-6 w-full">
                  <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
                  <div className="text-center mb-5">
                    <span className="text-4xl">⚠️</span>
                    <h3 className="text-[18px] font-black text-slate-800 mt-3" style={{ fontFamily: "'DM Serif Display', serif" }}>Cancel Appointment?</h3>
                    <p className="text-[13px] text-slate-500 mt-2">This will cancel your {appt.title} on {appt.date}. This action cannot be undone.</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setShowCancelConfirm(false)} className="flex-1 bg-slate-100 text-slate-700 font-semibold py-3 rounded-xl press-feedback">Keep It</button>
                    <button onClick={handleCancel} className="flex-1 bg-red-500 text-white font-semibold py-3 rounded-xl press-feedback">Yes, Cancel</button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
