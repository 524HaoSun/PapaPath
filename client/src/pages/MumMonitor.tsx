import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import { PageHeader } from "@/components/PageHeader";
import { RiskBadge, RiskCard } from "@/components/RiskBadge";
import SidebarNav from "@/components/SidebarNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { usePregnancy } from "@/hooks/usePregnancy";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import { Activity, AlertTriangle, CheckCircle2, Droplets, Heart, Moon, Plus, Stethoscope, TrendingUp, Weight, X } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const MOOD_TAGS = ["Happy", "Tired", "Anxious", "Calm", "Nauseous", "Energetic", "Emotional", "Uncomfortable", "Hopeful", "Overwhelmed"];
const SYMPTOMS = [
  { id: "headache", label: "Headache" },
  { id: "bleeding", label: "Bleeding" },
  { id: "severe_swelling", label: "Severe Swelling" },
  { id: "abdominal_pain", label: "Abdominal Pain" },
  { id: "reduced_fetal_movement", label: "Reduced Fetal Movement" },
  { id: "dizziness", label: "Dizziness" },
  { id: "nausea", label: "Nausea" },
  { id: "fever", label: "Fever" },
  { id: "visual_disturbance", label: "Visual Disturbance" },
  { id: "shortness_of_breath", label: "Shortness of Breath" },
];

// ─── Demo risk alerts for preview when no real alerts exist ────────────────────
const DEMO_RISK_ALERTS = [
  {
    id: 1,
    riskLevel: "watch",
    title: "Mild Swelling Noted (Week 23)",
    explanation: "Mild ankle swelling was recorded on Day 8. This is common in the second trimester due to increased blood volume and pressure on pelvic veins. It is generally harmless but worth monitoring.",
    suggestedNextStep: "Encourage her to elevate her feet when resting, stay hydrated, and avoid standing for long periods. Log swelling level daily to track any changes.",
    emergencyGuidance: undefined,
    recordedAt: (() => { const d = new Date(); d.setDate(d.getDate() - 20); return d.toISOString(); })(),
  },
  {
    id: 2,
    riskLevel: "needs_attention",
    title: "Headache Reported — Monitor Blood Pressure (Week 24)",
    explanation: "A headache was reported on Day 10 alongside a blood pressure reading of 114/74 mmHg. While BP is within normal range, persistent headaches during pregnancy can occasionally signal early pre-eclampsia, especially when combined with visual changes or upper abdominal pain.",
    suggestedNextStep: "Re-check blood pressure within 4 hours. If it rises above 140/90 mmHg or headache persists for more than 2 hours, contact your midwife or go to the maternity assessment unit.",
    emergencyGuidance: "If she develops sudden severe headache, blurred vision, or upper abdominal pain — call 999 or go to A&E immediately.",
    recordedAt: (() => { const d = new Date(); d.setDate(d.getDate() - 18); return d.toISOString(); })(),
  },
  {
    id: 3,
    riskLevel: "watch",
    title: "Blood Glucose Slightly Elevated (Week 24)",
    explanation: "Fasting glucose was recorded at 5.1 mmol/L on Day 10, which sits at the upper boundary of the normal fasting threshold for gestational diabetes screening. A single elevated reading is not diagnostic but warrants attention.",
    suggestedNextStep: "Reduce refined carbohydrates and sugary drinks for the next few days. Log glucose readings consistently. If fasting glucose exceeds 5.1 mmol/L on two or more occasions, discuss a formal Oral Glucose Tolerance Test (OGTT) with your midwife.",
    emergencyGuidance: undefined,
    recordedAt: (() => { const d = new Date(); d.setDate(d.getDate() - 18); return d.toISOString(); })(),
  },
  {
    id: 4,
    riskLevel: "needs_attention",
    title: "Dizziness Reported — Possible Postural Hypotension (Week 25)",
    explanation: "Dizziness was reported on Day 17. This is common in pregnancy due to the growing uterus compressing the inferior vena cava, particularly when standing up quickly or lying flat on the back. However, dizziness can also indicate low blood pressure, anaemia, or dehydration.",
    suggestedNextStep: "Advise her to rise slowly from sitting or lying positions, sleep on her left side, and drink at least 2 litres of water daily. Check her iron supplement routine. If dizziness is accompanied by fainting, chest pain, or shortness of breath, seek medical attention promptly.",
    emergencyGuidance: "If she faints, has difficulty breathing, or experiences chest pain — call 999 immediately.",
    recordedAt: (() => { const d = new Date(); d.setDate(d.getDate() - 10); return d.toISOString(); })(),
  },
  {
    id: 5,
    riskLevel: "watch",
    title: "Blood Pressure Trending Upward (Week 26)",
    explanation: "Over the past 7 days, systolic BP has risen from 117 to 122 mmHg. While still within the normal range, a consistent upward trend in the third trimester can be an early indicator of pregnancy-induced hypertension. Monitoring frequency should increase.",
    suggestedNextStep: "Log blood pressure every day for the next 7 days. Ensure she is resting adequately and reducing salt intake. Share the trend chart with her midwife at the next antenatal appointment.",
    emergencyGuidance: undefined,
    recordedAt: (() => { const d = new Date(); d.setDate(d.getDate() - 5); return d.toISOString(); })(),
  },
];

// ─── Demo data for preview when no real records exist ───────────────────────
// 28 days covering weeks 22–28 of pregnancy — realistic clinical progression
const DEMO_RECORDS = (() => {
  const today = new Date();
  // Seed data: each entry is [systolic, diastolic, glucose, weight, fetalMoves, sleep, water, stress, anxiety]
  // Designed to show realistic trends: BP slowly rising, weight steadily increasing,
  // fetal movement increasing as baby grows, stress decreasing as dad gains confidence.
  const seed: [number,number,number,number,number,number,number,number,number][] = [
    [108,70,4.6,61.2,8, 4,1550,8,7],  // Day 1  — Week 22
    [110,71,4.7,61.4,9, 3,1600,8,7],
    [109,70,4.5,61.5,9, 4,1700,7,6],
    [111,72,4.8,61.7,10,3,1650,7,6],
    [110,71,4.6,61.9,10,4,1800,7,6],  // Day 5  — Week 23
    [112,73,4.9,62.0,11,4,1750,6,6],
    [111,72,4.7,62.2,11,3,1600,6,5],
    [113,73,5.0,62.3,12,4,1900,6,5],
    [112,72,4.8,62.5,12,4,1850,6,5],
    [114,74,5.1,62.6,13,3,1700,7,6],  // Day 10 — Week 24 (slight glucose spike)
    [113,73,4.9,62.8,13,4,1950,5,5],
    [115,74,4.8,63.0,14,4,2000,5,5],
    [114,73,4.7,63.1,14,5,2100,5,4],
    [116,75,5.0,63.3,15,4,1900,5,4],
    [115,74,4.8,63.4,15,4,2000,5,4],  // Day 15 — Week 25
    [117,75,5.2,63.6,16,3,1800,6,5],  // mild BP uptick
    [116,74,5.0,63.7,16,4,2050,5,4],
    [118,76,5.1,63.9,17,4,2100,5,4],
    [117,75,4.9,64.0,17,5,2200,4,4],
    [119,76,5.0,64.2,18,4,2000,4,3],  // Day 20 — Week 26
    [118,75,4.8,64.3,18,5,2150,4,3],
    [120,77,5.1,64.5,19,4,2100,4,3],
    [119,76,4.9,64.6,19,5,2200,5,4],
    [121,77,5.0,64.8,20,4,2000,4,3],
    [120,76,4.8,65.0,20,5,2250,3,3],  // Day 25 — Week 27
    [122,78,5.2,65.1,21,4,2100,4,3],
    [121,77,5.0,65.3,21,5,2200,4,3],
    [123,78,5.1,65.4,22,5,2300,3,3],  // Day 28 — Week 28
  ];
  const moodSets = [
    ["Hopeful", "Tired"], ["Calm", "Energetic"], ["Anxious", "Tired"],
    ["Happy", "Calm"], ["Tired"], ["Hopeful", "Calm"], ["Energetic"],
    ["Calm"], ["Emotional", "Hopeful"], ["Happy", "Energetic"],
  ];
  const fatherNotesMap: Record<number, string> = {
    2:  "She had a tough morning with nausea but felt better by afternoon.",
    6:  "She mentioned feeling more tired than usual today. Made her a warm bath.",
    10: "Glucose was slightly higher — reminded her to avoid sugary snacks.",
    14: "Baby was very active tonight! We both felt the kicks.",
    18: "BP a little high — encouraged her to rest and called the midwife.",
    22: "Great day — she said she felt the most energetic this week.",
    26: "Counted 21 fetal movements in an hour. Midwife said that’s excellent.",
    27: "She’s been sleeping better. New pillow arrangement really helped.",
  };
  return seed.map(([sys, dia, gluc, wt, fetal, sleep, water, stress, anxiety], i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (27 - i));
    const week = 22 + Math.floor(i / 4);
    return {
      id: i + 1,
      recordDate: d.toISOString(),
      pregnancyWeek: week,
      systolicBp: sys,
      diastolicBp: dia,
      bloodGlucose: gluc.toFixed(1),
      weight: wt.toFixed(1),
      fetalMovementCount: fetal,
      sleepQualityScore: sleep,
      waterIntakeMl: water,
      stressLevel: stress,
      anxietyLevel: anxiety,
      moodTags: moodSets[i % moodSets.length],
      folicAcidTaken: true,
      dhaTaken: i % 2 === 0,
      ironTaken: true,
      calciumTaken: i % 3 !== 0,
      swellingLevel: i < 8 ? "none" : i < 18 ? "mild" : i < 24 ? "none" : "mild",
      symptoms: i === 9 ? ["headache"] : i === 17 ? ["dizziness"] : [],
      fatherNotes: fatherNotesMap[i] ?? null,
    };
  });
})();

// ─── Health History Charts Component ────────────────────────────────────────
function HealthHistoryCharts({ records }: { records: any[] }) {
  // Prepare chart data — newest last, max 28 entries
  const chartData = [...records]
    .sort((a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime())
    .slice(-28)
    .map((r) => ({
      date: new Date(r.recordDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      systolic: r.systolicBp ?? null,
      diastolic: r.diastolicBp ?? null,
      glucose: r.bloodGlucose ?? null,
      weight: r.weight ?? null,
      fetal: r.fetalMovementCount ?? null,
      sleep: r.sleepQualityScore ?? null,
      stress: r.stressLevel ?? null,
      anxiety: r.anxietyLevel ?? null,
      water: r.waterIntakeMl ? Math.round(r.waterIntakeMl / 100) / 10 : null, // convert to L
    }));
  const hasBp = chartData.some((d) => d.systolic !== null);
  const hasGlucose = chartData.some((d) => d.glucose !== null);
  const hasWeight = chartData.some((d) => d.weight !== null);
  const hasFetal = chartData.some((d) => d.fetal !== null);
  const hasMood = chartData.some((d) => d.stress !== null);
  const hasSleep = chartData.some((d) => d.sleep !== null);
  // Latest values for summary strip
  const latest = chartData[chartData.length - 1];
  const prev = chartData.length > 1 ? chartData[chartData.length - 2] : null;
  function MetricCard({ label, value, unit, prevVal, icon, colorClass, bgClass, higherIsBetter = false }: {
    label: string; value: number | null; unit: string; prevVal: number | null;
    icon: React.ReactNode; colorClass: string; bgClass: string; higherIsBetter?: boolean;
  }) {
    const diff = value !== null && prevVal !== null ? value - prevVal : null;
    const improved = diff === null ? null : (higherIsBetter ? diff > 0 : diff < 0);
    const trendColor = diff === null || diff === 0 ? "text-muted-foreground" : improved ? "text-emerald-600" : "text-red-500";
    const trendBg = diff === null || diff === 0 ? "bg-muted/40" : improved ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-red-50 dark:bg-red-950/30";
    return (
      <div className={`rounded-2xl p-4 ${bgClass} flex flex-col gap-2`}>
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-semibold ${colorClass} opacity-80`}>{label}</span>
          <span className={`w-7 h-7 rounded-xl flex items-center justify-center ${bgClass.replace('50','100').replace('950/30','900/40')}`}>
            {icon}
          </span>
        </div>
        {value === null ? (
          <span className="text-2xl font-bold text-muted-foreground">—</span>
        ) : (
          <div className="flex items-end gap-2">
            <span className={`text-2xl font-bold ${colorClass}`}>{value}</span>
            <span className={`text-[11px] text-muted-foreground mb-0.5`}>{unit}</span>
          </div>
        )}
        {diff !== null && (
          <span className={`self-start text-[11px] font-semibold px-2 py-0.5 rounded-full ${trendColor} ${trendBg}`}>
            {diff > 0 ? `▲ +${diff.toFixed(1)}` : diff < 0 ? `▼ ${diff.toFixed(1)}` : `→ 0`}
          </span>
        )}
      </div>
    );
  }
  const tooltipStyle = { backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" };
  const axisStyle = { fontSize: 10, fill: "hsl(var(--muted-foreground))" };
  // Show every 3rd tick when data is dense (28 days), every tick when sparse
  const xInterval = chartData.length > 14 ? 3 : 1;
  return (
    <div className="space-y-5">
      {/* Summary strip */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Latest Reading</h3>
          {latest && (
            <span className="ml-auto text-[11px] text-muted-foreground">
              {new Date(records[records.length - 1]?.recordDate ?? Date.now()).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>
        {/* Blood Pressure — full width */}
        {hasBp && (
          <div className="rounded-2xl p-4 bg-blue-50 dark:bg-blue-950/30 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 opacity-80">Blood Pressure</span>
              <span className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <Activity className="w-4 h-4 text-blue-600 dark:text-blue-300" />
              </span>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {latest?.systolic ?? "—"}<span className="text-xl font-semibold text-blue-500">/{latest?.diastolic ?? "—"}</span>
              </span>
              <span className="text-[12px] text-muted-foreground mb-1">mmHg</span>
              {prev?.systolic !== null && prev?.systolic !== undefined && latest?.systolic !== null && (
                <span className={`ml-auto self-start text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  (latest.systolic - prev.systolic) < 0
                    ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
                    : (latest.systolic - prev.systolic) > 0
                    ? "text-red-500 bg-red-50 dark:bg-red-950/30"
                    : "text-muted-foreground bg-muted/40"
                }`}>
                  {(latest.systolic - prev.systolic) > 0 ? `▲ +${(latest.systolic - prev.systolic)}` : (latest.systolic - prev.systolic) < 0 ? `▼ ${(latest.systolic - prev.systolic)}` : "→ 0"} sys
                </span>
              )}
            </div>
          </div>
        )}
        {/* 2-col grid for remaining metrics */}
        <div className="grid grid-cols-2 gap-3">
          {hasGlucose && (
            <MetricCard label="Glucose" value={latest?.glucose ?? null} unit="mmol/L" prevVal={prev?.glucose ?? null}
              icon={<Droplets className="w-4 h-4 text-amber-600 dark:text-amber-300" />}
              colorClass="text-amber-700 dark:text-amber-300" bgClass="bg-amber-50 dark:bg-amber-950/30" />
          )}
          {hasWeight && (
            <MetricCard label="Weight" value={latest?.weight ?? null} unit="kg" prevVal={prev?.weight ?? null}
              icon={<Weight className="w-4 h-4 text-purple-600 dark:text-purple-300" />}
              colorClass="text-purple-700 dark:text-purple-300" bgClass="bg-purple-50 dark:bg-purple-950/30" />
          )}
          {hasFetal && (
            <MetricCard label="Fetal Moves" value={latest?.fetal ?? null} unit="/day" prevVal={prev?.fetal ?? null}
              icon={<Heart className="w-4 h-4 text-pink-600 dark:text-pink-300" />}
              colorClass="text-pink-700 dark:text-pink-300" bgClass="bg-pink-50 dark:bg-pink-950/30" higherIsBetter />
          )}
          {hasSleep && (
            <MetricCard label="Sleep" value={latest?.sleep ?? null} unit="/ 5" prevVal={prev?.sleep ?? null}
              icon={<Moon className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />}
              colorClass="text-indigo-700 dark:text-indigo-300" bgClass="bg-indigo-50 dark:bg-indigo-950/30" higherIsBetter />
          )}
        </div>
      </div>
      {/* Blood Pressure chart */}
      {hasBp && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Activity className="w-4 h-4 text-primary" />Blood Pressure Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={axisStyle} interval={xInterval} />
                <YAxis domain={[60, 160]} tick={axisStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="systolic" name="Systolic" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} connectNulls />
                <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="#93c5fd" strokeWidth={2} dot={{ r: 2 }} connectNulls />
                {/* Reference lines for normal range */}
              </LineChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-muted-foreground mt-1">Normal range: 90–120 / 60–80 mmHg. Consult your midwife if readings are consistently above 140/90.</p>
          </CardContent>
        </Card>
      )}
      {/* Blood Glucose chart */}
      {hasGlucose && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Droplets className="w-4 h-4 text-amber-500" />Blood Glucose Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="glucoseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={axisStyle} interval={xInterval} />
                <YAxis domain={[3, 10]} tick={axisStyle} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v} mmol/L`, "Glucose"]} />
                <Area type="monotone" dataKey="glucose" name="Glucose" stroke="#f59e0b" fill="url(#glucoseGrad)" strokeWidth={2} dot={{ r: 2 }} connectNulls />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-muted-foreground mt-1">Target: fasting &lt;5.1 mmol/L, 1hr post-meal &lt;7.8 mmol/L (gestational diabetes thresholds).</p>
          </CardContent>
        </Card>
      )}
      {/* Weight chart */}
      {hasWeight && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Weight className="w-4 h-4 text-purple-500" />Weight Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={axisStyle} interval={xInterval} />
                <YAxis tick={axisStyle} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v} kg`, "Weight"]} />
                <Area type="monotone" dataKey="weight" name="Weight" stroke="#a855f7" fill="url(#weightGrad)" strokeWidth={2} dot={{ r: 2 }} connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      {/* Fetal movement chart */}
      {hasFetal && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Heart className="w-4 h-4 text-pink-500" />Fetal Movement Count</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={axisStyle} interval={xInterval} />
                <YAxis tick={axisStyle} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v} movements`, "Fetal Moves"]} />
                <Bar dataKey="fetal" name="Fetal Moves" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-muted-foreground mt-1">Aim for 10+ movements in 2 hours. Contact maternity triage if movements reduce significantly.</p>
          </CardContent>
        </Card>
      )}
      {/* Sleep & Mood chart */}
      {(hasSleep || hasMood) && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Moon className="w-4 h-4 text-indigo-500" />Sleep & Emotional Wellbeing</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={axisStyle} interval={xInterval} />
                <YAxis domain={[0, 10]} tick={axisStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {hasSleep && <Line type="monotone" dataKey="sleep" name="Sleep (×2)" stroke="#6366f1" strokeWidth={2} dot={{ r: 2 }} connectNulls />}
                {hasMood && <Line type="monotone" dataKey="stress" name="Stress" stroke="#f97316" strokeWidth={2} dot={{ r: 2 }} connectNulls />}
                {hasMood && <Line type="monotone" dataKey="anxiety" name="Anxiety" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 2 }} connectNulls />}
              </LineChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-muted-foreground mt-1">Sleep quality is scored 1–5 (shown on a 0–10 axis for comparison). Stress and anxiety are scored 1–10.</p>
          </CardContent>
        </Card>
      )}
      {/* Recent entries log */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Entries</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[...records].sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()).slice(0, 28).map((rec) => (
            <div key={rec.id} className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
              <div className="w-14 shrink-0">
                <p className="text-[10px] font-semibold text-primary">{new Date(rec.recordDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
                {rec.pregnancyWeek && <p className="text-[9px] text-muted-foreground">Wk {rec.pregnancyWeek}</p>}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                  {rec.systolicBp && <span className="text-xs text-foreground">BP: <strong>{rec.systolicBp}/{rec.diastolicBp}</strong></span>}
                  {rec.bloodGlucose && <span className="text-xs text-foreground">Glc: <strong>{rec.bloodGlucose}</strong></span>}
                  {rec.weight && <span className="text-xs text-foreground">Wt: <strong>{rec.weight}kg</strong></span>}
                  {rec.fetalMovementCount != null && <span className="text-xs text-foreground">FM: <strong>{rec.fetalMovementCount}</strong></span>}
                  {rec.sleepQualityScore && <span className="text-xs text-foreground">Sleep: <strong>{rec.sleepQualityScore}/5</strong></span>}
                </div>
                {rec.moodTags != null && Array.isArray(rec.moodTags) && (rec.moodTags as string[]).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(rec.moodTags as string[]).map((tag: string) => <span key={tag} className="text-[9px] bg-secondary px-1.5 py-0.5 rounded-full">{tag}</span>)}
                  </div>
                )}
                {rec.fatherNotes && <p className="text-[10px] text-muted-foreground mt-0.5 italic">"{rec.fatherNotes}"</p>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function MumMonitor() {
  const utils = trpc.useUtils();
  // SSOT: get current pregnancy week from DB via shared hook
  const { currentWeek: pregnancyCurrentWeek } = usePregnancy();
  const { data: records, isLoading } = trpc.health.list.useQuery(undefined);
  const { data: riskHistory } = trpc.health.riskHistory.useQuery(undefined);
  const { data: mother } = trpc.profile.getMother.useQuery(undefined);
  const awardXp = trpc.gamification.awardXp.useMutation({
    onSuccess: () => {
      utils.gamification.getProfile.invalidate();
      utils.gamification.getTodaysMissions.invalidate();
    },
  });
  const createRecord = trpc.health.create.useMutation({
    onSuccess: (data) => {
      utils.health.list.invalidate();
      utils.health.riskHistory.invalidate();
      utils.momStatus.getSummary.invalidate();
      // Award XP for logging health
      awardXp.mutate({ amount: 30, reason: "Logged health record", actionType: "log_health" });
      toast.success(
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold">Health record saved ✓</span>
          <span className="text-xs text-muted-foreground">+30 XP earned!</span>
        </div>
      );
      if (data.riskResult.riskLevel !== "normal") {
        toast.warning(`Risk alert: ${data.riskResult.title}`, { duration: 6000 });
      }
      resetForm();
    },
    onError: () => toast.error("Failed to save record"),
  });
  // Form state
  const [systolicBp, setSystolicBp] = useState("");
  const [diastolicBp, setDiastolicBp] = useState("");
  const [bloodGlucose, setBloodGlucose] = useState("");
  const [weight, setWeight] = useState("");
  const [swellingLevel, setSwellingLevel] = useState<string>("");
  const [fetalMovement, setFetalMovement] = useState("");
  const [sleepScore, setSleepScore] = useState([3]);
  const [waterIntake, setWaterIntake] = useState("");
  const [folicAcid, setFolicAcid] = useState(false);
  const [dha, setDha] = useState(false);
  const [iron, setIron] = useState(false);
  const [calcium, setCalcium] = useState(false);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [stressLevel, setStressLevel] = useState([5]);
  const [anxietyLevel, setAnxietyLevel] = useState([5]);
  const [fatherNotes, setFatherNotes] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [riskResult, setRiskResult] = useState<any>(null);
  // Underlying conditions — persisted on mother profile
  const [conditionInput, setConditionInput] = useState("");
  const [conditions, setConditions] = useState<string[]>(() =>
    mother?.existingConditions
      ? mother.existingConditions.split(",").map((s) => s.trim()).filter(Boolean)
      : []
  );
  // Sync conditions from server when mother profile loads
  const [conditionsInitialised, setConditionsInitialised] = useState(false);
  if (mother?.existingConditions && !conditionsInitialised) {
    setConditionsInitialised(true);
    const parsed = mother.existingConditions.split(",").map((s) => s.trim()).filter(Boolean);
    if (conditions.length === 0 && parsed.length > 0) setConditions(parsed);
  }
  const upsertMotherConditions = trpc.profile.upsertMother.useMutation({
    onSuccess: () => { utils.profile.getMother.invalidate(); toast.success("Conditions saved"); },
    onError: () => toast.error("Failed to save conditions"),
  });
  function addCondition() {
    const trimmed = conditionInput.trim();
    if (!trimmed) return;
    if (conditions.map((c) => c.toLowerCase()).includes(trimmed.toLowerCase())) {
      toast.info("Already in the list"); return;
    }
    setConditions((prev) => [...prev, trimmed]);
    setConditionInput("");
  }
  function removeCondition(c: string) {
    setConditions((prev) => prev.filter((x) => x !== c));
  }
  function saveConditions() {
    upsertMotherConditions.mutate({ existingConditions: conditions.join(", ") });
  }
  const checkRisk = trpc.health.checkRisk.useMutation({
    onSuccess: (data) => setRiskResult(data),
  });
  function resetForm() {
    setSystolicBp(""); setDiastolicBp(""); setBloodGlucose(""); setWeight("");
    setSwellingLevel(""); setFetalMovement(""); setSleepScore([3]); setWaterIntake("");
    setFolicAcid(false); setDha(false); setIron(false); setCalcium(false);
    setSelectedMoods([]); setStressLevel([5]); setAnxietyLevel([5]);
    setFatherNotes(""); setSelectedSymptoms([]); setRiskResult(null);
  }
  function handleSubmit() {
    createRecord.mutate({
      systolicBp: systolicBp ? parseInt(systolicBp) : undefined,
      diastolicBp: diastolicBp ? parseInt(diastolicBp) : undefined,
      bloodGlucose: bloodGlucose ? parseFloat(bloodGlucose) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      swellingLevel: swellingLevel as any || undefined,
      fetalMovementCount: fetalMovement ? parseInt(fetalMovement) : undefined,
      sleepQualityScore: sleepScore[0],
      waterIntakeMl: waterIntake ? parseInt(waterIntake) : undefined,
      folicAcidTaken: folicAcid, dhaTaken: dha, ironTaken: iron, calciumTaken: calcium,
      moodTags: selectedMoods, stressLevel: stressLevel[0], anxietyLevel: anxietyLevel[0],
      fatherNotes: fatherNotes || undefined, symptoms: selectedSymptoms,
    });
  }
  function handleCheckRisk() {
    checkRisk.mutate({
      systolicBp: systolicBp ? parseInt(systolicBp) : undefined,
      diastolicBp: diastolicBp ? parseInt(diastolicBp) : undefined,
      bloodGlucose: bloodGlucose ? parseFloat(bloodGlucose) : undefined,
      swellingLevel: swellingLevel || undefined,
      fetalMovementCount: fetalMovement ? parseInt(fetalMovement) : undefined,
      symptoms: selectedSymptoms, stressLevel: stressLevel[0], anxietyLevel: anxietyLevel[0],
    });
  }
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
          <div className="flex-1 overflow-y-auto pb-20 lg:pb-8 px-4 pt-4 lg:px-6 lg:pt-6" style={{ scrollbarWidth: "thin" }}>
    <div className="space-y-6">
      <PageHeader title="Mum Monitor" subtitle="Track health indicators and get risk guidance" />
      <Tabs defaultValue="history">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="history" className="text-[12px]">History</TabsTrigger>
          <TabsTrigger value="log" className="text-[12px]">Log Today</TabsTrigger>
          <TabsTrigger value="risk" className="text-[12px]">Alerts</TabsTrigger>
        </TabsList>
        {/* ─── History Tab ─────────────────────────────────────────────────── */}
        <TabsContent value="history" className="mt-5">
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />)}</div>
          ) : (
            <>
              {(!records || records.length === 0) && (
                <div className="mb-4 px-3 py-2 rounded-xl text-[11px] font-medium" style={{ background: "oklch(0.94 0.04 80 / 0.6)", color: "oklch(0.45 0.08 60)" }}>
                  📊 Showing sample data — start logging to see your own trends.
                </div>
              )}
              <HealthHistoryCharts records={records && records.length > 0 ? records : DEMO_RECORDS} />
            </>
          )}
        </TabsContent>
        {/* ─── Log Today Tab ───────────────────────────────────────────────── */}
        <TabsContent value="log" className="mt-5">
          <div className="space-y-5">
          {!mother && (
            <Card className="border-blue-100 bg-blue-50/50">
              <CardContent className="p-4 text-sm text-blue-800">
                <span className="font-medium">Tip:</span> Set a due date in{" "}
                <Link href="/settings"><span className="underline font-medium">Settings</span></Link>{" "}
                to get week-accurate logging. You can still log today without it.
              </CardContent>
            </Card>
          )}
          {/* Underlying Conditions */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-primary" />Mum's Underlying Conditions
                </CardTitle>
                <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Saved to profile</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">Record any pre-existing or pregnancy-related conditions (e.g. gestational diabetes, hypertension, anaemia). These are saved to her medical profile and visible in Care &amp; Hospital.</p>
              {/* Common condition quick-add chips */}
              <div>
                <Label className="text-xs mb-2 block">Quick-add common conditions</Label>
                <div className="flex flex-wrap gap-1.5">
                  {["Gestational Diabetes", "Hypertension", "Anaemia", "Hypothyroidism", "Asthma", "Anxiety / Depression", "Placenta Praevia", "Pre-eclampsia", "PCOS", "Epilepsy"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        if (conditions.map((x) => x.toLowerCase()).includes(c.toLowerCase())) {
                          removeCondition(c);
                        } else {
                          setConditions((prev) => [...prev, c]);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                        conditions.map((x) => x.toLowerCase()).includes(c.toLowerCase())
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              {/* Custom condition input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Type a condition and press Add..."
                  value={conditionInput}
                  onChange={(e) => setConditionInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCondition(); } }}
                  className="text-sm"
                />
                <Button type="button" variant="outline" size="sm" onClick={addCondition} className="shrink-0">Add</Button>
              </div>
              {/* Active conditions list */}
              {conditions.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Current conditions ({conditions.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {conditions.map((c) => (
                      <span key={c} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                        {c}
                        <button type="button" onClick={() => removeCondition(c)} className="ml-0.5 hover:text-rose-600">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={saveConditions}
                disabled={upsertMotherConditions.isPending || !mother}
                className="w-full gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {upsertMotherConditions.isPending ? "Saving..." : "Save Conditions to Profile"}
              </Button>
            </CardContent>
          </Card>
          {/* Physiological indicators */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Activity className="w-4 h-4 text-primary" />Physiological Indicators</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Systolic BP</Label>
                  <Input placeholder="e.g. 120" value={systolicBp} onChange={(e) => setSystolicBp(e.target.value)} type="number" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Diastolic BP</Label>
                  <Input placeholder="e.g. 80" value={diastolicBp} onChange={(e) => setDiastolicBp(e.target.value)} type="number" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Glucose (mmol/L)</Label>
                  <Input placeholder="e.g. 5.5" value={bloodGlucose} onChange={(e) => setBloodGlucose(e.target.value)} type="number" step="0.1" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Weight (kg)</Label>
                  <Input placeholder="e.g. 68.5" value={weight} onChange={(e) => setWeight(e.target.value)} type="number" step="0.1" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Fetal Movements</Label>
                  <Input placeholder="e.g. 15" value={fetalMovement} onChange={(e) => setFetalMovement(e.target.value)} type="number" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Water Intake (ml)</Label>
                  <Input placeholder="e.g. 2000" value={waterIntake} onChange={(e) => setWaterIntake(e.target.value)} type="number" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Swelling Level</Label>
                <Select value={swellingLevel} onValueChange={setSwellingLevel}>
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Sleep Quality: {sleepScore[0]}/5</Label>
                <Slider min={1} max={5} step={1} value={sleepScore} onValueChange={setSleepScore} className="w-full" />
                <div className="flex justify-between text-[10px] text-muted-foreground"><span>Poor</span><span>Excellent</span></div>
              </div>
            </CardContent>
          </Card>
          {/* Supplements */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" />Daily Supplements</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Folic Acid", value: folicAcid, set: setFolicAcid },
                  { label: "DHA / Omega-3", value: dha, set: setDha },
                  { label: "Iron", value: iron, set: setIron },
                  { label: "Calcium", value: calcium, set: setCalcium },
                ].map(({ label, value, set }) => (
                  <button
                    key={label}
                    onClick={() => set(!value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-smooth ${value ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-card border-border text-muted-foreground hover:bg-secondary"}`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${value ? "text-emerald-600" : "text-muted-foreground/40"}`} />
                    {label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* Mood */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Heart className="w-4 h-4 text-primary" />Mood & Emotional State</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs mb-2 block">How is she feeling today?</Label>
                <div className="flex flex-wrap gap-2">
                  {MOOD_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedMoods((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-smooth ${selectedMoods.includes(tag) ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:bg-secondary"}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Stress Level: {stressLevel[0]}/10</Label>
                <Slider min={1} max={10} step={1} value={stressLevel} onValueChange={setStressLevel} />
                <div className="flex justify-between text-[10px] text-muted-foreground"><span>Very Low</span><span>Very High</span></div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Anxiety Level: {anxietyLevel[0]}/10</Label>
                <Slider min={1} max={10} step={1} value={anxietyLevel} onValueChange={setAnxietyLevel} />
                <div className="flex justify-between text-[10px] text-muted-foreground"><span>Very Low</span><span>Very High</span></div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Dad's private notes</Label>
                <textarea
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Anything you noticed today that you want to remember..."
                  value={fatherNotes}
                  onChange={(e) => setFatherNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          {/* Symptoms */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-primary" />Symptom Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {SYMPTOMS.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setSelectedSymptoms((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id])}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-smooth text-left ${selectedSymptoms.includes(id) ? "bg-red-50 border-red-300 text-red-800" : "bg-card border-border text-muted-foreground hover:bg-secondary"}`}
                  >
                    <div className={`w-3 h-3 rounded-sm border shrink-0 flex items-center justify-center ${selectedSymptoms.includes(id) ? "bg-red-500 border-red-500" : "border-muted-foreground/40"}`}>
                      {selectedSymptoms.includes(id) && <span className="text-white text-[8px]">✓</span>}
                    </div>
                    {label}
                  </button>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={handleCheckRisk} disabled={checkRisk.isPending} className="w-full gap-2">
                <AlertTriangle className="w-4 h-4" />
                {checkRisk.isPending ? "Checking..." : "Check Risk Level"}
              </Button>
              {riskResult && (
                <RiskCard
                  level={riskResult.riskLevel}
                  title={riskResult.title}
                  explanation={riskResult.explanation}
                  suggestedNextStep={riskResult.suggestedNextStep}
                  emergencyGuidance={riskResult.emergencyGuidance}
                  disclaimer={riskResult.disclaimer}
                />
              )}
            </CardContent>
          </Card>
            <p className="disclaimer-banner">
              Health records are for monitoring and support only. They do not replace professional medical assessment. If you are concerned, contact your midwife, GP, or maternity triage.
            </p>
            <Button onClick={handleSubmit} disabled={createRecord.isPending || !mother} className="w-full gap-2" size="lg">
              <Plus className="w-4 h-4" />
              {createRecord.isPending ? "Saving..." : "Save Health Record"}
            </Button>
          </div>{/* end left column space-y-5 */}
        </TabsContent>{/* end log tab */}
        {/* ─── Risk Alerts Tab ─────────────────────────────────────────────────── */}
        <TabsContent value="risk" className="space-y-4 mt-5">
          <p className="disclaimer-banner">
            Risk alerts are generated from the data you enter and are not a medical diagnosis. Always consult your midwife or GP for professional advice.
          </p>
          {/* Show real alerts if available, otherwise show demo alerts */}
          {(!riskHistory || riskHistory.length === 0) && (
            <div className="mb-4 px-3 py-2 rounded-xl text-[11px] font-medium" style={{ background: "oklch(0.94 0.04 80 / 0.6)", color: "oklch(0.45 0.08 60)" }}>
              🚨 Showing sample alerts — start logging health data to generate your own risk assessments.
            </div>
          )}
          {(riskHistory && riskHistory.length > 0 ? riskHistory : DEMO_RISK_ALERTS).map((alert) => (
            <div key={alert.id} className="space-y-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] text-muted-foreground">
                  {new Date("recordedAt" in alert ? (alert.recordedAt as string) : Date.now()).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <RiskCard
                level={(alert.riskLevel as any) ?? "watch"}
                title={alert.title ?? "Risk Alert"}
                explanation={alert.explanation ?? ""}
                suggestedNextStep={alert.suggestedNextStep ?? "Contact your midwife."}
                emergencyGuidance={alert.emergencyGuidance ?? undefined}
              />
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
