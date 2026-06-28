/**
 * Mom Status Recording Page (/mom-status)
 * Design: Warm Cockpit — dad records mom's daily health status
 *
 * Features:
 * - Energy, mood, nausea, anxiety, pain sliders (1–10)
 * - Sleep hours, water intake, kick count, weight inputs
 * - Symptom checkboxes with severity (mild/moderate/severe)
 * - Notes textarea
 * - Pre-fills from today's existing log
 * - Saves via tRPC momStatus.logToday
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Save, CheckCircle2, Heart, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { usePregnancy } from "@/hooks/usePregnancy";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

// ─── Constants ────────────────────────────────────────────────────────────────

const SYMPTOMS = [
  { code: "nausea", label: "Nausea" },
  { code: "fatigue", label: "Fatigue" },
  { code: "back_pain", label: "Back Pain" },
  { code: "headache", label: "Headache" },
  { code: "heartburn", label: "Heartburn" },
  { code: "swelling", label: "Swelling" },
  { code: "cramps", label: "Cramps" },
  { code: "insomnia", label: "Insomnia" },
  { code: "constipation", label: "Constipation" },
  { code: "mood_swings", label: "Mood Swings" },
  { code: "shortness_of_breath", label: "Shortness of Breath" },
  { code: "braxton_hicks", label: "Braxton Hicks" },
  { code: "pelvic_pressure", label: "Pelvic Pressure" },
  { code: "food_aversion", label: "Food Aversion" },
  { code: "spotting", label: "Spotting" },
];

type Severity = "mild" | "moderate" | "severe";

const SEVERITY_COLORS: Record<Severity, string> = {
  mild: "oklch(0.55 0.10 160)",
  moderate: "oklch(0.60 0.12 60)",
  severe: "oklch(0.55 0.18 25)",
};

const SEVERITY_BG: Record<Severity, string> = {
  mild: "oklch(0.93 0.05 160 / 0.5)",
  moderate: "oklch(0.95 0.06 60 / 0.5)",
  severe: "oklch(0.93 0.06 25 / 0.5)",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SliderField({
  label,
  emoji,
  value,
  onChange,
  lowLabel,
  highLabel,
}: {
  label: string;
  emoji: string;
  value: number;
  onChange: (v: number) => void;
  lowLabel: string;
  highLabel: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{emoji}</span>
          <span className="text-sm font-medium" style={{ color: "oklch(0.28 0.04 240)" }}>
            {label}
          </span>
        </div>
        <span
          className="text-sm font-bold tabular-nums w-8 text-right"
          style={{ color: "oklch(0.35 0.09 188)" }}
        >
          {value}
        </span>
      </div>
      <Slider
        min={1}
        max={10}
        step={1}
        value={[value]}
        onValueChange={([v]) => onChange(v!)}
        className="w-full"
      />
      <div className="flex justify-between text-[10px]" style={{ color: "oklch(0.60 0.03 240)" }}>
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

function NumberInput({
  label,
  emoji,
  value,
  onChange,
  unit,
  min,
  max,
  step,
}: {
  label: string;
  emoji: string;
  value: number | "";
  onChange: (v: number | "") => void;
  unit: string;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-base w-6 text-center flex-shrink-0">{emoji}</span>
      <span className="text-sm font-medium flex-1" style={{ color: "oklch(0.28 0.04 240)" }}>
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min={min}
          max={max}
          step={step ?? 1}
          value={value}
          onChange={(e) => {
            const v = e.target.value === "" ? "" : Number(e.target.value);
            onChange(v);
          }}
          className="w-20 text-right text-sm font-semibold rounded-lg px-2 py-1.5 outline-none focus:ring-2"
          style={{
            background: "oklch(0.97 0.015 80)",
            border: "1px solid oklch(0.88 0.02 80)",
            color: "oklch(0.28 0.04 240)",
          }}
        />
        <span className="text-xs" style={{ color: "oklch(0.60 0.03 240)" }}>
          {unit}
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MomStatusPage() {
  const [, navigate] = useLocation();
  // Form state
  const [energyLevel, setEnergyLevel] = useState(5);
  const [moodScore, setMoodScore] = useState(5);
  const [nauseaLevel, setNauseaLevel] = useState(3);
  const [anxietyScore, setAnxietyScore] = useState(3);
  const [painLevel, setPainLevel] = useState(2);
  const [sleepHours, setSleepHours] = useState<number | "">("");
  const [waterMl, setWaterMl] = useState<number | "">(1500);
  const [kickCount, setKickCount] = useState<number | "">("");
  const [weightKg, setWeightKg] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<Map<string, Severity>>(new Map());

  const [saved, setSaved] = useState(false);

  // Fetch today's existing log for pre-fill
  const { data: todayLog, isLoading: logLoading } = trpc.momStatus.getTodayLog.useQuery(
    undefined,
    { staleTime: 0 }
  );

  // Pre-fill form when today's log loads
  useEffect(() => {
    if (!todayLog) return;
    if (todayLog.energyLevel != null) setEnergyLevel(todayLog.energyLevel);
    if (todayLog.moodScore != null) setMoodScore(todayLog.moodScore);
    if (todayLog.nauseaLevel != null) setNauseaLevel(todayLog.nauseaLevel);
    if (todayLog.anxietyScore != null) setAnxietyScore(todayLog.anxietyScore);
    if (todayLog.painLevel != null) setPainLevel(todayLog.painLevel);
    if (todayLog.sleepHours != null) setSleepHours(Number(todayLog.sleepHours));
    if (todayLog.waterMl != null) setWaterMl(todayLog.waterMl);
    if (todayLog.kickCount != null) setKickCount(todayLog.kickCount);
    if (todayLog.weightKg != null) setWeightKg(Number(todayLog.weightKg));
    if (todayLog.notes) setNotes(todayLog.notes);
    if (todayLog.symptoms) {
      const map = new Map<string, Severity>();
      for (const s of todayLog.symptoms) {
        map.set(s.code, s.severity as Severity);
      }
      setSelectedSymptoms(map);
    }
  }, [todayLog]);

  // Get pregnancy info for week number — SSOT from DB via usePregnancy hook
  const { currentWeek: pregnancyWeek, partnerName, isLoading: pregnancyLoading } = usePregnancy();
  // Use the DB-derived week; if not set yet, use 0 as sentinel (no hardcoded fallback)
  const currentWeek = pregnancyWeek ?? 0;

  const utils = trpc.useUtils();
  const logMutation = trpc.momStatus.logToday.useMutation({
    onSuccess: () => {
      setSaved(true);
      // Invalidate summary cache so homepage refreshes
      utils.momStatus.getSummary.invalidate();
      utils.momStatus.getWeekTrend.invalidate();
      utils.momStatus.getTodayLog.invalidate();
      setTimeout(() => navigate("/"), 1800);
    },
  });

  function toggleSymptom(code: string) {
    setSelectedSymptoms((prev) => {
      const next = new Map(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.set(code, "mild");
      }
      return next;
    });
  }

  function cycleSeverity(code: string) {
    setSelectedSymptoms((prev) => {
      const next = new Map(prev);
      const current = next.get(code);
      if (!current) return next;
      const order: Severity[] = ["mild", "moderate", "severe"];
      const idx = order.indexOf(current);
      next.set(code, order[(idx + 1) % order.length]!);
      return next;
    });
  }

  function handleSave() {
    logMutation.mutate({
      weekNumber: currentWeek,
      energyLevel,
      moodScore,
      nauseaLevel,
      anxietyScore,
      painLevel,
      sleepHours: sleepHours !== "" ? sleepHours : undefined,
      waterMl: waterMl !== "" ? waterMl : undefined,
      kickCount: kickCount !== "" ? kickCount : undefined,
      weightKg: weightKg !== "" ? weightKg : undefined,
      notes: notes.trim() || undefined,
      symptoms: Array.from(selectedSymptoms.entries()).map(([code, severity]) => ({
        code,
        severity,
      })),
    });
  }

  // ─── Saved state ──────────────────────────────────────────────────────────

  if (saved) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "oklch(0.97 0.015 80)" }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col items-center gap-3"
        >
          <CheckCircle2 className="w-14 h-14" style={{ color: "oklch(0.52 0.12 160)" }} />
          <p className="text-lg font-semibold" style={{ color: "oklch(0.28 0.04 240)", fontFamily: "'DM Serif Display', serif" }}>
            Today's log saved!
          </p>
          <p className="text-sm" style={{ color: "oklch(0.55 0.03 240)" }}>
            AI summary will refresh on the homepage.
          </p>
        </motion.div>
      </div>
    );
  }

  // ─── Main form ────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen"
      style={{
        background: "oklch(0.97 0.015 80)",
        backgroundImage:
          "radial-gradient(circle at 20% 20%, oklch(0.94 0.03 188 / 0.12) 0%, transparent 50%), radial-gradient(circle at 80% 80%, oklch(0.95 0.04 80 / 0.15) 0%, transparent 50%)",
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b"
        style={{
          background: "oklch(0.97 0.015 80 / 0.95)",
          backdropFilter: "blur(12px)",
          borderColor: "oklch(0.90 0.02 80)",
        }}
      >
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-xl transition-all active:scale-95"
          style={{ background: "oklch(0.93 0.02 80)" }}
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" style={{ color: "oklch(0.35 0.04 240)" }} />
        </button>
        <div className="flex-1 min-w-0">
          <h1
            className="text-base font-bold leading-tight"
            style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.22 0.04 240)" }}
          >
            Log Mom's Status
          </h1>
          <p className="text-[11px]" style={{ color: "oklch(0.55 0.03 240)" }}>
            Week {currentWeek} · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            {todayLog && (
              <span style={{ color: "oklch(0.52 0.09 188)" }}> · Editing today's log</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Heart className="w-4 h-4" style={{ color: "oklch(0.55 0.18 25)" }} />
          <span className="text-xs font-medium" style={{ color: "oklch(0.55 0.18 25)" }}>
            For {partnerName ?? "Mom"}
          </span>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-5 pb-28 flex flex-col gap-5">
        {logLoading && (
          <div className="flex items-center gap-2 text-sm" style={{ color: "oklch(0.55 0.03 240)" }}>
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading today's log...
          </div>
        )}

        {/* ── Section: How is Mom Feeling? ── */}
        <Section title="How is Mom feeling?" emoji="💫">
          <div className="flex flex-col gap-5">
            <SliderField
              label="Energy Level"
              emoji="⚡"
              value={energyLevel}
              onChange={setEnergyLevel}
              lowLabel="Exhausted"
              highLabel="Full of energy"
            />
            <SliderField
              label="Mood"
              emoji="😊"
              value={moodScore}
              onChange={setMoodScore}
              lowLabel="Very low"
              highLabel="Great"
            />
            <SliderField
              label="Nausea"
              emoji="🤢"
              value={nauseaLevel}
              onChange={setNauseaLevel}
              lowLabel="None"
              highLabel="Severe"
            />
            <SliderField
              label="Anxiety"
              emoji="😰"
              value={anxietyScore}
              onChange={setAnxietyScore}
              lowLabel="Calm"
              highLabel="Very anxious"
            />
            <SliderField
              label="Pain / Discomfort"
              emoji="🩹"
              value={painLevel}
              onChange={setPainLevel}
              lowLabel="None"
              highLabel="Severe"
            />
          </div>
        </Section>

        {/* ── Section: Physical Metrics ── */}
        <Section title="Physical Metrics" emoji="📊">
          <div className="flex flex-col gap-3">
            <NumberInput
              label="Sleep"
              emoji="🌙"
              value={sleepHours}
              onChange={setSleepHours}
              unit="hours"
              min={0}
              max={24}
              step={0.5}
            />
            <NumberInput
              label="Water Intake"
              emoji="💧"
              value={waterMl}
              onChange={setWaterMl}
              unit="ml"
              min={0}
              max={5000}
              step={100}
            />
            <NumberInput
              label="Kick Count"
              emoji="👶"
              value={kickCount}
              onChange={setKickCount}
              unit="kicks"
              min={0}
              max={200}
            />
            <NumberInput
              label="Weight"
              emoji="⚖️"
              value={weightKg}
              onChange={setWeightKg}
              unit="kg"
              min={30}
              max={200}
              step={0.1}
            />
          </div>
        </Section>

        {/* ── Section: Symptoms ── */}
        <Section title="Symptoms Today" emoji="🩺">
          <div className="flex flex-wrap gap-2">
            {SYMPTOMS.map(({ code, label }) => {
              const isSelected = selectedSymptoms.has(code);
              const severity = selectedSymptoms.get(code);
              return (
                <div key={code} className="flex items-center gap-0">
                  <button
                    onClick={() => toggleSymptom(code)}
                    className="px-3 py-1.5 rounded-l-full text-xs font-medium transition-all active:scale-95"
                    style={{
                      background: isSelected
                        ? severity
                          ? SEVERITY_BG[severity]
                          : "oklch(0.92 0.04 188 / 0.5)"
                        : "oklch(0.93 0.015 80)",
                      color: isSelected
                        ? severity
                          ? SEVERITY_COLORS[severity]
                          : "oklch(0.35 0.09 188)"
                        : "oklch(0.50 0.03 240)",
                      border: `1px solid ${isSelected ? (severity ? SEVERITY_COLORS[severity] + "44" : "oklch(0.70 0.06 188)") : "oklch(0.88 0.02 80)"}`,
                      borderRight: "none",
                    }}
                  >
                    {label}
                  </button>
                  {isSelected && severity && (
                    <button
                      onClick={() => cycleSeverity(code)}
                      className="px-2 py-1.5 rounded-r-full text-[10px] font-semibold transition-all active:scale-95 capitalize"
                      style={{
                        background: SEVERITY_BG[severity],
                        color: SEVERITY_COLORS[severity],
                        border: `1px solid ${SEVERITY_COLORS[severity]}44`,
                        borderLeft: "none",
                      }}
                    >
                      {severity}
                    </button>
                  )}
                  {!isSelected && (
                    <div
                      className="w-0 rounded-r-full"
                      style={{
                        border: "1px solid oklch(0.88 0.02 80)",
                        borderLeft: "none",
                        height: "32px",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          {selectedSymptoms.size > 0 && (
            <p className="text-[10px] mt-2" style={{ color: "oklch(0.60 0.03 240)" }}>
              Tap a symptom again to remove it. Tap the severity badge to cycle: mild → moderate → severe.
            </p>
          )}
        </Section>

        {/* ── Section: Notes ── */}
        <Section title="Notes" emoji="📝">
          <Textarea
            placeholder="Anything else to note? How was her day, any concerns, special moments..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="resize-none text-sm"
            rows={4}
            style={{
              background: "oklch(0.99 0.008 80)",
              border: "1px solid oklch(0.88 0.02 80)",
              color: "oklch(0.28 0.04 240)",
            }}
          />
        </Section>
      </div>

      {/* Sticky Save Button */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 py-4 border-t"
        style={{
          background: "oklch(0.97 0.015 80 / 0.97)",
          backdropFilter: "blur(12px)",
          borderColor: "oklch(0.90 0.02 80)",
        }}
      >
        <div className="max-w-lg mx-auto">
          <AnimatePresence>
            {logMutation.isError && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs mb-2 text-center"
                style={{ color: "oklch(0.55 0.18 25)" }}
              >
                Failed to save. Please try again.
              </motion.p>
            )}
          </AnimatePresence>
          <Button
            onClick={handleSave}
            disabled={logMutation.isPending}
            className="w-full h-12 text-sm font-semibold rounded-xl transition-all active:scale-[0.98]"
            style={{
              background: logMutation.isPending
                ? "oklch(0.65 0.06 188)"
                : "oklch(0.45 0.09 188)",
              color: "white",
              boxShadow: "0 4px 16px oklch(0.45 0.09 188 / 0.35)",
            }}
          >
            {logMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Today's Log
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  emoji,
  children,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: "oklch(1 0 0)",
        boxShadow:
          "0 2px 16px oklch(0.22 0.04 240 / 0.06), 0 1px 4px oklch(0.22 0.04 240 / 0.04)",
        border: "1px solid oklch(0.92 0.015 80)",
      }}
    >
      <div
        className="px-4 py-3 border-b flex items-center gap-2"
        style={{ borderColor: "oklch(0.94 0.015 80)" }}
      >
        <span className="text-base">{emoji}</span>
        <h2 className="text-sm font-semibold" style={{ color: "oklch(0.28 0.04 240)" }}>
          {title}
        </h2>
      </div>
      <div className="px-4 py-4">{children}</div>
    </motion.div>
  );
}
