/**
 * Settings — Partner profile setup + app preferences
 * Saves to both momStatus.savePregnancy (homepage) and profile.upsertMother (Mum Monitor)
 * Layout: Warm Cockpit (SidebarNav + Header + BottomNav)
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  ChevronLeft, Baby, Heart, Calendar, User, Bell, Save,
  CheckCircle2, AlertCircle, Stethoscope, Phone, Hospital, BellOff
} from "lucide-react";
import Header from "@/components/Header";
import SidebarNav from "@/components/SidebarNav";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User2 } from "lucide-react";

// ─── Notification toggle ────────────────────────────────────────────────────
function NotifToggle({ label, desc }: { label: string; desc: string }) {
  const [enabled, setEnabled] = useState(false);
  return (
    <button
      onClick={() => setEnabled(v => !v)}
      className="w-full flex items-center justify-between py-2.5 press-feedback"
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${enabled ? 'bg-teal-100' : 'bg-slate-100'}`}>
          {enabled ? <Bell size={15} className="text-teal-600" /> : <BellOff size={15} className="text-slate-400" />}
        </div>
        <div className="text-left">
          <p className="text-[14px] font-semibold" style={{ color: 'oklch(0.22 0.04 240)' }}>{label}</p>
          <p className="text-[12px]" style={{ color: 'oklch(0.52 0.03 240)' }}>{desc}</p>
        </div>
      </div>
      <div
        className="w-11 h-6 rounded-full relative transition-colors flex-shrink-0"
        style={{ background: enabled ? 'oklch(0.52 0.09 188)' : 'oklch(0.85 0.02 240)' }}
      >
        <div
          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
          style={{ left: enabled ? '22px' : '2px' }}
        />
      </div>
    </button>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({ icon: Icon, title, children }: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/80 rounded-2xl border border-white/60 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100/80">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "oklch(0.94 0.02 188)" }}>
          <Icon size={16} style={{ color: "oklch(0.45 0.09 188)" }} />
        </div>
        <p className="text-[14px] font-bold" style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.22 0.04 240)" }}>
          {title}
        </p>
      </div>
      <div className="p-4 space-y-3">
        {children}
      </div>
    </div>
  );
}

// ─── Field ───────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: "oklch(0.52 0.03 240)" }}>
        {label}
      </Label>
      {children}
    </div>
  );
}

const inputCls = "h-10 rounded-xl border-slate-200 bg-slate-50/50 text-[14px] focus:ring-2 focus:ring-teal-300/50 focus:border-teal-400";

export default function Settings() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  // ── Load existing data ──────────────────────────────────────────────────────
  const { data: pregnancy, isLoading: loadingPreg } = trpc.momStatus.getPregnancy.useQuery(undefined);
  const { data: mother, isLoading: loadingMother } = trpc.profile.getMother.useQuery(undefined);
  const { data: father, isLoading: loadingFather } = trpc.profile.getFather.useQuery(undefined);

  // ── Form state — Dad profile ─────────────────────────────────────────────────
  const [dadName, setDadName] = useState("");

  // ── Form state — Pregnancy basics ───────────────────────────────────────────
  const [dueDate, setDueDate] = useState("");
  const [babyNickname, setBabyNickname] = useState("");
  const [partnerName, setPartnerName] = useState("");

  // ── Form state — Partner medical profile ────────────────────────────────────
  const [bloodType, setBloodType] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [gpName, setGpName] = useState("");
  const [midwifeName, setMidwifeName] = useState("");
  const [triageNumber, setTriageNumber] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  // ── Populate from server ─────────────────────────────────────────────────────
  const [initialised, setInitialised] = useState(false);
  useEffect(() => {
    if (initialised) return;
    if (loadingPreg || loadingMother || loadingFather) return;
    setInitialised(true);
    if (father) {
      setDadName(father.name ?? "");
    }
    if (pregnancy) {
      setDueDate(pregnancy.dueDate ?? "");
      setBabyNickname(pregnancy.babyNickname ?? "");
      setPartnerName(pregnancy.partnerName ?? "");
    }
    if (mother) {
      setBloodType(mother.bloodType ?? "");
      setHospitalName(mother.hospitalName ?? "");
      setGpName(mother.gpName ?? "");
      setMidwifeName(mother.midwifeName ?? "");
      setTriageNumber(mother.maternityTriageNumber ?? "");
      setEmergencyName(mother.emergencyContactName ?? "");
      setEmergencyPhone(mother.emergencyContactPhone ?? "");
    }
  }, [pregnancy, mother, loadingPreg, loadingMother, initialised]);

  // ── Mutations ────────────────────────────────────────────────────────────────
  const savePregnancy = trpc.momStatus.savePregnancy.useMutation({
    onSuccess: () => {
      utils.momStatus.getPregnancy.invalidate();
      utils.momStatus.getSummary.invalidate();
    },
    onError: (e) => toast.error(`Pregnancy profile: ${e.message}`),
  });

  const upsertMother = trpc.profile.upsertMother.useMutation({
    onSuccess: () => {
      utils.profile.getMother.invalidate();
    },
    onError: (e) => toast.error(`Partner profile: ${e.message}`),
  });

  const upsertFather = trpc.profile.upsertFather.useMutation({
    onSuccess: () => utils.profile.getFather.invalidate(),
    onError: (e) => toast.error(`Dad profile: ${e.message}`),
  });

  async function handleSave() {
    if (!dueDate) {
      toast.error("Please enter the due date first.");
      return;
    }

    // 0. Save dad name
    if (dadName) {
      await upsertFather.mutateAsync({ name: dadName });
    }

    // 1. Save pregnancy basics (homepage)
    await savePregnancy.mutateAsync({
      dueDate,
      babyNickname: babyNickname || undefined,
      partnerName: partnerName || undefined,
    });

    // 2. Save / create mother profile (Mum Monitor)
    await upsertMother.mutateAsync({
      name: partnerName || undefined,
      estimatedDueDate: new Date(dueDate),
      bloodType: bloodType || undefined,
      hospitalName: hospitalName || undefined,
      gpName: gpName || undefined,
      midwifeName: midwifeName || undefined,
      maternityTriageNumber: triageNumber || undefined,
      emergencyContactName: emergencyName || undefined,
      emergencyContactPhone: emergencyPhone || undefined,
    });

    toast.success(
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold">Profile saved ✓</span>
        <span className="text-xs text-muted-foreground">You can now log today's health data in Mum Monitor.</span>
      </div>
    );
  }

  const isSaving = savePregnancy.isPending || upsertMother.isPending || upsertFather.isPending;
  const isLoading = loadingPreg || loadingMother || loadingFather;
  const profileComplete = !!pregnancy?.dueDate && !!mother;

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
              <button
                onClick={() => navigate("/")}
                className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center press-feedback"
              >
                <ChevronLeft size={20} className="text-slate-700" />
              </button>
              <p className="text-[17px] font-bold text-slate-800" style={{ fontFamily: "'DM Serif Display', serif" }}>
                Settings
              </p>
              <div className="w-9 h-9" />
            </header>

            {/* User card */}
            <div className="mx-4 lg:mx-6 mt-4 bg-white/80 rounded-2xl p-4 border border-white/60 shadow-sm flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                {user?.name?.charAt(0) ?? "D"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold truncate" style={{ color: "oklch(0.22 0.04 240)" }}>
                  {user?.name ?? "Dad"}
                </p>
                <p className="text-[12px]" style={{ color: "oklch(0.52 0.03 240)" }}>
                  {user?.email ?? "Expectant Father"}
                </p>
              </div>
              {/* Profile completeness badge */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                profileComplete
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}>
                {profileComplete
                  ? <><CheckCircle2 size={12} /> Profile set</>
                  : <><AlertCircle size={12} /> Setup needed</>
                }
              </div>
            </div>

            {/* Form */}
            {isLoading ? (
              <div className="mx-4 lg:mx-6 mt-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 rounded-2xl bg-white/60 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="px-4 lg:px-6 pt-4 flex flex-col gap-4 pb-6">

                {/* ── Dad Profile ── */}
                <Section icon={User2} title="Your Profile">
                  <Field label="Your Name">
                    <Input
                      className={inputCls}
                      placeholder="e.g. James"
                      value={dadName}
                      onChange={(e) => setDadName(e.target.value)}
                    />
                  </Field>
                </Section>

                {/* ── Pregnancy Basics ── */}
                <Section icon={Baby} title="Pregnancy Basics">
                  <Field label="Partner's Name">
                    <Input
                      className={inputCls}
                      placeholder="e.g. Sarah"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                    />
                  </Field>
                  <Field label="Estimated Due Date *">
                    <Input
                      className={inputCls}
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                    <p className="text-[11px]" style={{ color: "oklch(0.6 0.02 240)" }}>
                      Required — used to calculate the current pregnancy week across the app.
                    </p>
                  </Field>
                  <Field label="Baby's Nickname">
                    <Input
                      className={inputCls}
                      placeholder="e.g. Peanut, Bumblebee…"
                      value={babyNickname}
                      onChange={(e) => setBabyNickname(e.target.value)}
                    />
                  </Field>
                </Section>

                {/* ── Medical Profile ── */}
                <Section icon={Heart} title="Partner's Medical Profile">
                  <p className="text-[12px]" style={{ color: "oklch(0.52 0.03 240)" }}>
                    This information enables health logging and risk monitoring in Mum Monitor.
                  </p>
                  <Field label="Blood Type">
                    <Input
                      className={inputCls}
                      placeholder="e.g. A+, O−"
                      value={bloodType}
                      onChange={(e) => setBloodType(e.target.value)}
                    />
                  </Field>
                </Section>

                {/* ── Care Team ── */}
                <Section icon={Stethoscope} title="Care Team">
                  <Field label="Hospital / Maternity Unit">
                    <Input
                      className={inputCls}
                      placeholder="e.g. St Mary's Hospital"
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                    />
                  </Field>
                  <Field label="GP / Doctor Name">
                    <Input
                      className={inputCls}
                      placeholder="e.g. Dr. Smith"
                      value={gpName}
                      onChange={(e) => setGpName(e.target.value)}
                    />
                  </Field>
                  <Field label="Midwife Name">
                    <Input
                      className={inputCls}
                      placeholder="e.g. Midwife Johnson"
                      value={midwifeName}
                      onChange={(e) => setMidwifeName(e.target.value)}
                    />
                  </Field>
                  <Field label="Maternity Triage Number">
                    <Input
                      className={inputCls}
                      placeholder="e.g. 0800 123 456"
                      value={triageNumber}
                      onChange={(e) => setTriageNumber(e.target.value)}
                    />
                  </Field>
                </Section>

                {/* ── Emergency Contact ── */}
                <Section icon={Phone} title="Emergency Contact">
                  <Field label="Contact Name">
                    <Input
                      className={inputCls}
                      placeholder="e.g. Mum, Sister Jane"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                    />
                  </Field>
                  <Field label="Contact Phone">
                    <Input
                      className={inputCls}
                      placeholder="e.g. +44 7700 900000"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                    />
                  </Field>
                </Section>

                {/* ── Save button ── */}
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !dueDate}
                  className="w-full h-12 rounded-2xl text-[15px] font-bold press-feedback"
                  style={{
                    background: "oklch(0.52 0.09 188)",
                    color: "white",
                  }}
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Saving…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save size={18} />
                      Save Profile
                    </span>
                  )}
                </Button>

                {/* ── Notification settings ── */}
                <Section icon={Bell} title="Notifications">
                  {[
                    { key: "daily", label: "Daily reminders", desc: "Log health data and check-in prompts" },
                    { key: "appt", label: "Appointment alerts", desc: "Reminders 24h and 1h before appointments" },
                    { key: "tips", label: "Weekly tips", desc: "Pregnancy insights tailored to your week" },
                  ].map(({ key, label, desc }) => (
                    <NotifToggle key={key} label={label} desc={desc} />
                  ))}
                </Section>

              </div>
            )}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
