/**
 * TriageGuide — When to go to hospital guide
 * Design: Warm Cockpit — DM Serif Display + Inter, warm beige palette
 * Urgency levels use warm icon-forward cards, no blood-red backgrounds
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  ChevronLeft, Phone, ChevronDown, ChevronUp,
  Siren, AlertCircle, Eye, CheckCircle2, PhoneCall,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCare } from "@/contexts/CareContext";
import SidebarNav from "@/components/SidebarNav";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

// ─── Category config — warm palette, no blood-red ────────────────────────────

const categories = [
  {
    id: "emergency",
    level: "CALL 911 NOW",
    // Warm deep rose — urgent but not clinical blood-red
    headerBg: "linear-gradient(135deg, oklch(0.62 0.14 20) 0%, oklch(0.58 0.13 30) 100%)",
    headerText: "oklch(1 0 0)",
    badgeBg: "oklch(0.72 0.12 20 / 0.3)",
    bodyBg: "oklch(0.97 0.02 20 / 0.6)",
    bodyBorder: "oklch(0.85 0.07 20 / 0.5)",
    dotColor: "oklch(0.58 0.14 20)",
    Icon: Siren,
    iconBg: "oklch(0.72 0.10 20 / 0.35)",
    iconColor: "oklch(1 0 0)",
    title: "Go to Emergency Immediately",
    subtitle: "Call 911 or go to the nearest ER right now",
    callLabel: "Call 911 Now",
    callBg: "linear-gradient(135deg, oklch(0.60 0.14 20), oklch(0.55 0.12 30))",
    symptoms: [
      "Heavy vaginal bleeding (soaking more than 1 pad per hour)",
      "Severe abdominal pain or cramping",
      "No fetal movement for more than 2 hours",
      "Signs of preeclampsia: severe headache + vision changes + swelling",
      "Difficulty breathing or chest pain",
      "High fever (above 39°C / 102°F)",
      "Seizures or loss of consciousness",
      "Suspected cord prolapse",
      "Trauma or injury to abdomen",
    ],
  },
  {
    id: "urgent",
    level: "CONTACT YOUR DOCTOR TODAY",
    // Warm amber-orange
    headerBg: "linear-gradient(135deg, oklch(0.68 0.13 55) 0%, oklch(0.65 0.12 65) 100%)",
    headerText: "oklch(1 0 0)",
    badgeBg: "oklch(0.78 0.10 55 / 0.3)",
    bodyBg: "oklch(0.97 0.03 65 / 0.6)",
    bodyBorder: "oklch(0.85 0.07 65 / 0.5)",
    dotColor: "oklch(0.65 0.13 55)",
    Icon: AlertCircle,
    iconBg: "oklch(0.78 0.09 55 / 0.35)",
    iconColor: "oklch(1 0 0)",
    title: "Contact Your Doctor Today",
    subtitle: "Call within a few hours — don't wait until tomorrow",
    callLabel: "Call Doctor",
    callBg: "linear-gradient(135deg, oklch(0.66 0.13 55), oklch(0.62 0.11 65))",
    symptoms: [
      "Moderate vaginal bleeding or spotting",
      "Regular contractions before 37 weeks",
      "Decreased fetal movement (less than 10 kicks in 2 hours)",
      "Persistent headache not relieved by paracetamol",
      "Sudden swelling of face, hands, or feet",
      "Burning or pain when urinating",
      "Fever above 38°C (100.4°F)",
      "Vomiting so severe you can't keep fluids down",
      "Fluid leaking from vagina (possible water breaking)",
    ],
  },
  {
    id: "monitor",
    level: "MONITOR AT HOME",
    // Soft teal-blue
    headerBg: "linear-gradient(135deg, oklch(0.55 0.10 210) 0%, oklch(0.52 0.09 220) 100%)",
    headerText: "oklch(1 0 0)",
    badgeBg: "oklch(0.72 0.08 210 / 0.3)",
    bodyBg: "oklch(0.97 0.02 210 / 0.6)",
    bodyBorder: "oklch(0.85 0.06 210 / 0.5)",
    dotColor: "oklch(0.55 0.10 210)",
    Icon: Eye,
    iconBg: "oklch(0.75 0.07 210 / 0.35)",
    iconColor: "oklch(1 0 0)",
    title: "Monitor and Call if Worsens",
    subtitle: "These are common but should be watched carefully",
    callLabel: null,
    callBg: null,
    symptoms: [
      "Mild swelling in feet and ankles (normal in later pregnancy)",
      "Occasional Braxton Hicks contractions",
      "Mild back pain",
      "Heartburn or indigestion",
      "Fatigue and tiredness",
      "Mild nausea (if not vomiting)",
      "Frequent urination",
      "Light spotting after intercourse",
    ],
  },
  {
    id: "normal",
    level: "NORMAL PRE-NATAL",
    // Sage green — calm and reassuring
    headerBg: "linear-gradient(135deg, oklch(0.55 0.09 155) 0%, oklch(0.52 0.08 165) 100%)",
    headerText: "oklch(1 0 0)",
    badgeBg: "oklch(0.72 0.07 155 / 0.3)",
    bodyBg: "oklch(0.97 0.02 155 / 0.6)",
    bodyBorder: "oklch(0.85 0.06 155 / 0.5)",
    dotColor: "oklch(0.55 0.09 155)",
    Icon: CheckCircle2,
    iconBg: "oklch(0.75 0.07 155 / 0.35)",
    iconColor: "oklch(1 0 0)",
    title: "Normal Pregnancy Symptoms",
    subtitle: "These are expected and don't require immediate attention",
    callLabel: null,
    callBg: null,
    symptoms: [
      "Morning sickness (first trimester)",
      "Breast tenderness and changes",
      "Increased vaginal discharge (clear/white, no odor)",
      "Mild round ligament pain",
      "Constipation",
      "Mood changes",
      "Increased appetite",
      "Skin changes (stretch marks, linea nigra)",
    ],
  },
];

export default function TriageGuide() {
  const [, navigate] = useLocation();
  const { emergencyContacts } = useCare();
  const [expanded, setExpanded] = useState<string | null>("emergency");

  const hospitalContact = emergencyContacts.find((c) => c.type === "hospital");

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
            <header
              className="sticky top-0 z-40 backdrop-blur-sm border-b px-4 py-3 flex items-center justify-between"
              style={{ background: "oklch(0.97 0.015 80 / 0.95)", borderColor: "oklch(0.88 0.04 80 / 0.6)" }}
            >
              <button
                onClick={() => navigate("/care")}
                className="w-9 h-9 rounded-xl flex items-center justify-center press-feedback"
                style={{ background: "oklch(0.92 0.04 80 / 0.6)" }}
              >
                <ChevronLeft size={20} style={{ color: "oklch(0.32 0.05 240)" }} />
              </button>
              <p
                className="text-[17px] font-bold"
                style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.22 0.04 240)" }}
              >
                When to Go to Hospital
              </p>
              <div className="w-9 h-9" />
            </header>

            <div className="pb-6 px-4 pt-4 lg:px-6 max-w-2xl mx-auto">

              {/* Quick call strip — warm tones */}
              <div className="flex gap-2.5 mb-5">
                <button
                  onClick={() => toast.error("Calling Emergency 911…", { duration: 3000 })}
                  className="flex-1 rounded-2xl py-3.5 flex items-center justify-center gap-2 press-feedback font-bold text-[13px] text-white"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.60 0.14 20), oklch(0.55 0.12 30))",
                    boxShadow: "0 4px 14px oklch(0.60 0.14 20 / 0.30)",
                  }}
                >
                  <Siren size={15} /> 911 Emergency
                </button>
                <button
                  onClick={() => toast.success(`Calling ${hospitalContact?.label ?? "Hospital"}…`)}
                  className="flex-1 rounded-2xl py-3.5 flex items-center justify-center gap-2 press-feedback font-bold text-[13px] text-white"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.52 0.09 188), oklch(0.48 0.08 200))",
                    boxShadow: "0 4px 14px oklch(0.52 0.09 188 / 0.25)",
                  }}
                >
                  <PhoneCall size={15} /> Call Hospital
                </button>
              </div>

              {/* Intro card */}
              <div
                className="rounded-2xl p-4 mb-5"
                style={{
                  background: "oklch(0.96 0.03 80 / 0.7)",
                  border: "1px solid oklch(0.88 0.05 80 / 0.6)",
                  boxShadow: "0 2px 10px oklch(0.80 0.06 80 / 0.10)",
                }}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "oklch(0.88 0.07 80 / 0.6)" }}
                  >
                    <span className="text-base">📋</span>
                  </div>
                  <p
                    className="text-[14px] font-bold"
                    style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.22 0.04 240)" }}
                  >
                    Quick Reference Guide
                  </p>
                </div>
                <p className="text-[13px] leading-relaxed" style={{ color: "oklch(0.42 0.04 240)" }}>
                  This guide helps you decide when to seek medical care during pregnancy. When in doubt,{" "}
                  <strong style={{ color: "oklch(0.32 0.04 240)" }}>always call your doctor or midwife</strong>{" "}
                  — it's better to check than to wait.
                </p>
              </div>

              {/* Category cards */}
              <div className="space-y-3">
                {categories.map((cat) => {
                  const isOpen = expanded === cat.id;
                  const Icon = cat.Icon;
                  return (
                    <div
                      key={cat.id}
                      className="rounded-2xl overflow-hidden"
                      style={{
                        border: `1.5px solid ${cat.bodyBorder}`,
                        boxShadow: isOpen ? "0 4px 20px oklch(0.70 0.06 80 / 0.12)" : "0 2px 8px oklch(0.80 0.04 80 / 0.08)",
                      }}
                    >
                      {/* Header row */}
                      <button
                        onClick={() => setExpanded(isOpen ? null : cat.id)}
                        className="w-full flex items-center gap-3.5 px-4 py-4 press-feedback text-left"
                        style={{ background: cat.headerBg }}
                      >
                        {/* Icon container */}
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: cat.iconBg }}
                        >
                          <Icon size={20} style={{ color: cat.iconColor }} />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <span
                            className="text-[10px] font-black uppercase tracking-widest block"
                            style={{ color: `${cat.headerText}cc` }}
                          >
                            {cat.level}
                          </span>
                          <p
                            className="text-[15px] font-bold leading-tight mt-0.5"
                            style={{ fontFamily: "'DM Serif Display', serif", color: cat.headerText }}
                          >
                            {cat.title}
                          </p>
                          <p className="text-[11px] mt-0.5 leading-snug" style={{ color: `${cat.headerText}b3` }}>
                            {cat.subtitle}
                          </p>
                        </div>

                        {/* Chevron */}
                        <div
                          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ background: cat.badgeBg }}
                        >
                          {isOpen
                            ? <ChevronUp size={14} style={{ color: cat.headerText }} />
                            : <ChevronDown size={14} style={{ color: cat.headerText }} />
                          }
                        </div>
                      </button>

                      {/* Expandable symptom list */}
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key="body"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                            style={{ overflow: "hidden" }}
                          >
                            <div
                              className="px-4 pb-4 pt-3"
                              style={{ background: cat.bodyBg }}
                            >
                              <div className="space-y-0">
                                {cat.symptoms.map((s, i) => (
                                  <div
                                    key={i}
                                    className="flex items-start gap-3 py-2.5"
                                    style={{
                                      borderBottom: i < cat.symptoms.length - 1
                                        ? `1px solid ${cat.bodyBorder}`
                                        : "none",
                                    }}
                                  >
                                    {/* Dot */}
                                    <div
                                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                                      style={{ background: cat.dotColor }}
                                    />
                                    <p
                                      className="text-[13px] leading-relaxed"
                                      style={{ color: "oklch(0.32 0.04 240)" }}
                                    >
                                      {s}
                                    </p>
                                  </div>
                                ))}
                              </div>

                              {/* CTA button for emergency / urgent */}
                              {cat.callLabel && cat.callBg && (
                                <button
                                  onClick={() => {
                                    if (cat.id === "emergency") {
                                      toast.error("Calling Emergency 911…", { duration: 3000 });
                                    } else {
                                      toast.success("Calling your doctor…");
                                    }
                                  }}
                                  className="w-full mt-4 text-white font-bold py-3.5 rounded-xl press-feedback flex items-center justify-center gap-2 text-[14px]"
                                  style={{
                                    background: cat.callBg,
                                    boxShadow: `0 4px 14px ${cat.dotColor}40`,
                                  }}
                                >
                                  <Phone size={16} /> {cat.callLabel}
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Disclaimer */}
              <div
                className="mt-5 rounded-2xl p-4"
                style={{
                  background: "oklch(0.95 0.02 80 / 0.6)",
                  border: "1px solid oklch(0.88 0.04 80 / 0.5)",
                }}
              >
                <p className="text-[11px] leading-relaxed text-center" style={{ color: "oklch(0.52 0.04 240)" }}>
                  This guide is for informational purposes only and does not replace professional medical advice.
                  Always consult your healthcare provider for personalized guidance.
                </p>
              </div>
            </div>

          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
