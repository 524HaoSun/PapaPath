/**
 * MedicalCardModal — Warm & Cozy Prenatal Medical Card
 * Design: Soft peach-cream palette, illustrated avatar, delicate botanical
 * decorations, refined typography. Feels like a keepsake, not a clinical form.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  X, Heart, Droplets, Calendar, MapPin, Phone,
  User, Baby, Shield, ChevronRight, Edit3, AlertTriangle, Sparkles,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { usePregnancy } from "@/hooks/usePregnancy";
import { getTrimesterName } from "@/lib/pregnancyData";
import { useLocation } from "wouter";

// ─── Blood type badge colours (soft pastels) ──────────────────────────────────
const BLOOD_TYPE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  "A+":  { bg: "#FFF0F0", text: "#C0392B", dot: "#E74C3C" },
  "A-":  { bg: "#FFF0F0", text: "#C0392B", dot: "#E74C3C" },
  "B+":  { bg: "#EFF6FF", text: "#1D4ED8", dot: "#3B82F6" },
  "B-":  { bg: "#EFF6FF", text: "#1D4ED8", dot: "#3B82F6" },
  "AB+": { bg: "#F5F0FF", text: "#7C3AED", dot: "#8B5CF6" },
  "AB-": { bg: "#F5F0FF", text: "#7C3AED", dot: "#8B5CF6" },
  "O+":  { bg: "#F0FFF4", text: "#166534", dot: "#22C55E" },
  "O-":  { bg: "#F0FFF4", text: "#166534", dot: "#22C55E" },
};

// ─── Mom illustrated avatar (warm illustration style) ────────────────────────
const MOM_AVATAR_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663242146660/YgHQKdD9wY2Ut466VSfzNe/mom-avatar-YxsbzasuZxv7aeXqc8ZiJV.webp";

interface MedicalCardModalProps {
  onClose: () => void;
}

export default function MedicalCardModal({ onClose }: MedicalCardModalProps) {
  const [, navigate] = useLocation();
  const [imgError, setImgError] = useState(false);

  const { data: mother, isLoading } = trpc.profile.getMother.useQuery();
  const { currentWeek, dueDateFormatted } = usePregnancy();

  const displayWeek = currentWeek; // now always has a value via usePregnancy demo defaults
  const trimester = getTrimesterName(displayWeek);
  const bloodType = mother?.bloodType ?? "A+";
  const bloodColors = BLOOD_TYPE_COLORS[bloodType] ?? {
    bg: "#F9FAFB", text: "#374151", dot: "#9CA3AF",
  };

  const progressPct = Math.min(Math.round((displayWeek / 40) * 100), 100);

  // QR payload — compact JSON for hospital scanners
  const qrPayload = JSON.stringify({
    name: mother?.name ?? "Sarah Chen",
    dob: mother?.dateOfBirth
      ? new Date(mother.dateOfBirth).toISOString().slice(0, 10)
      : "1993-04-15",
    edd: mother?.estimatedDueDate
      ? new Date(mother.estimatedDueDate).toISOString().slice(0, 10)
      : dueDateFormatted,
    week: displayWeek,
    blood: bloodType,
    hospital: mother?.hospitalName ?? "Royal Women's Hospital",
    allergies: mother?.allergies ?? null,
  });

  const cardId = `MCN-${String(mother?.id ?? 0).padStart(6, "0")}`;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4"
        style={{ background: "rgba(60, 40, 30, 0.45)", backdropFilter: "blur(10px)" }}
        onClick={onClose}
      >
        {/* Card */}
        <motion.div
          key="card"
          initial={{ opacity: 0, y: 50, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.97 }}
          transition={{ duration: 0.38, ease: [0.23, 1, 0.32, 1] }}
          className="w-full max-w-sm mb-4 sm:mb-0 rounded-[28px] overflow-hidden relative"
          style={{
            background: "#FFFAF7",
            boxShadow: "0 40px 100px rgba(180, 100, 60, 0.22), 0 8px 32px rgba(0,0,0,0.12)",
          }}
          onClick={(e) => e.stopPropagation()}
        >

          {/* ══════════════════════════════════════════════════
              TOP SECTION — warm peach-rose gradient header
          ══════════════════════════════════════════════════ */}
          <div
            className="relative overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #FDE8D8 0%, #FDDEC8 30%, #FBD0B8 60%, #F8C4A8 100%)",
              paddingBottom: "28px",
            }}
          >
            {/* Decorative botanical circles */}
            <div
              className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-25"
              style={{ background: "radial-gradient(circle, #F4A070 0%, transparent 70%)" }}
            />
            <div
              className="absolute top-8 -right-6 w-24 h-24 rounded-full opacity-15"
              style={{ background: "radial-gradient(circle, #E8805A 0%, transparent 70%)" }}
            />
            <div
              className="absolute -bottom-4 -left-8 w-32 h-32 rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, #F4C090 0%, transparent 70%)" }}
            />

            {/* Tiny leaf / petal decorations */}
            <svg className="absolute top-4 right-16 opacity-20" width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 4 C20 8, 28 12, 24 20 C20 28, 8 24, 8 16 C8 8, 12 4, 16 4Z" fill="#C0602A"/>
            </svg>
            <svg className="absolute bottom-8 right-4 opacity-15" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" fill="#D4704A"/>
            </svg>
            <svg className="absolute top-12 left-4 opacity-10" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2 L10 7 L15 7 L11 10 L13 15 L8 12 L3 15 L5 10 L1 7 L6 7Z" fill="#C05030"/>
            </svg>

            {/* Header bar */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 relative z-10">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(180, 80, 40, 0.15)" }}
                >
                  <Shield size={12} style={{ color: "#B84A28" }} />
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.14em]"
                  style={{ color: "#B84A28" }}
                >
                  Prenatal Medical Card
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[9px] font-mono px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(180, 80, 40, 0.12)", color: "#B84A28" }}
                >
                  {cardId}
                </span>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
                  style={{ background: "rgba(180, 80, 40, 0.12)" }}
                >
                  <X size={14} style={{ color: "#B84A28" }} />
                </button>
              </div>
            </div>

            {/* Avatar + name section */}
            <div className="flex items-end gap-4 px-5 pt-1 relative z-10">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {/* Outer glow ring */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "conic-gradient(from 0deg, #F4A070, #F8C4A8, #F4A070)",
                    padding: "3px",
                    borderRadius: "50%",
                    transform: "scale(1.12)",
                    opacity: 0.6,
                  }}
                />
                <div
                  className="relative w-[84px] h-[84px] rounded-full overflow-hidden"
                  style={{
                    border: "3px solid rgba(255,255,255,0.9)",
                    boxShadow: "0 6px 20px rgba(180, 80, 40, 0.20)",
                  }}
                >
                  {!imgError ? (
                    <img
                      src={MOM_AVATAR_URL}
                      alt="Mom"
                      className="w-full h-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #FDE8D8, #F8C4A8)" }}
                    >
                      <User size={32} style={{ color: "#C06040" }} />
                    </div>
                  )}
                </div>
                {/* Heart badge */}
                <div
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{
                    background: "white",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  }}
                >
                  <Heart size={12} fill="#E8604A" style={{ color: "#E8604A" }} />
                </div>
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Sparkles size={11} style={{ color: "#C06040", opacity: 0.7 }} />
                  <span className="text-[10px] font-semibold" style={{ color: "#C06040", opacity: 0.8 }}>
                    Expectant Mom
                  </span>
                </div>
                <h2
                  className="text-[22px] font-bold leading-tight"
                  style={{
                    color: "#3D1F10",
                    fontFamily: "'DM Serif Display', 'Georgia', serif",
                    letterSpacing: "-0.3px",
                  }}
                >
                  {isLoading ? "Loading…" : (mother?.name ?? "Sarah Chen")}
                </h2>
                {mother?.dateOfBirth && (
                  <p className="text-[11px] mt-0.5" style={{ color: "#8B4A2A" }}>
                    {new Date(mother.dateOfBirth).toLocaleDateString("en-GB", {
                      day: "2-digit", month: "long", year: "numeric",
                    })}
                  </p>
                )}

                {/* Blood type + week pills */}
                <div className="flex items-center gap-2 mt-2">
                  <div
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
                    style={{
                      background: bloodColors.bg,
                      color: bloodColors.text,
                      border: `1.5px solid ${bloodColors.dot}44`,
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: bloodColors.dot }}
                    />
                    <Droplets size={10} />
                    {bloodType}
                  </div>
                  <div
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                    style={{ background: "rgba(255,255,255,0.65)", color: "#8B4A2A", border: "1px solid rgba(180,80,40,0.2)" }}
                  >
                    <Baby size={10} />
                    Week {displayWeek}
                  </div>
                </div>
              </div>
            </div>

            {/* Trimester ribbon */}
            <div
              className="mx-5 mt-4 rounded-xl px-3 py-2 flex items-center justify-between relative z-10"
              style={{ background: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.8)" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(180,80,40,0.12)" }}
                >
                  <Baby size={14} style={{ color: "#B84A28" }} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#B84A28" }}>
                    {trimester}
                  </p>
                  <p className="text-[11px] font-semibold" style={{ color: "#3D1F10" }}>
                    Week {displayWeek} of 40
                  </p>
                </div>
              </div>
              {/* Mini progress */}
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-bold" style={{ color: "#B84A28" }}>{progressPct}%</span>
                <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(180,80,40,0.15)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #E8804A, #F4A870)" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1], delay: 0.3 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              BODY SECTION — cream white
          ══════════════════════════════════════════════════ */}
          <div className="px-5 pt-4 pb-5 flex flex-col gap-3.5" style={{ background: "#FFFAF7" }}>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <WarmTile
                icon={<Calendar size={12} />}
                label="Due Date"
                value={
                  mother?.estimatedDueDate
                    ? new Date(mother.estimatedDueDate).toLocaleDateString("en-GB", {
                        day: "2-digit", month: "short", year: "numeric",
                      })
                    : dueDateFormatted ?? "Not set"
                }
                hue="peach"
              />
              <WarmTile
                icon={<MapPin size={12} />}
                label="Hospital"
                value={mother?.hospitalName ?? "Royal Women's Hospital"}
                hue="sage"
              />
              <WarmTile
                icon={<Heart size={12} />}
                label="Midwife"
                value={mother?.midwifeName ?? "Midwife Jane"}
                hue="rose"
              />
              <WarmTile
                icon={<Phone size={12} />}
                label="Triage"
                value={mother?.maternityTriageNumber ?? mother?.emergencyContactPhone ?? "000 / 131 450"}
                hue="lavender"
              />
            </div>

            {/* Allergies / conditions */}
            {(mother?.allergies || mother?.existingConditions) && (
              <div
                className="rounded-xl px-3.5 py-2.5 flex items-start gap-2"
                style={{
                  background: "#FFF8F0",
                  border: "1px solid #F4C09080",
                }}
              >
                <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" style={{ color: "#D4804A" }} />
                <div className="min-w-0">
                  {mother?.allergies && (
                    <p className="text-[11px] leading-[1.6]" style={{ color: "#5A3020" }}>
                      <span className="font-bold" style={{ color: "#C06030" }}>Allergies: </span>
                      {mother.allergies}
                    </p>
                  )}
                  {mother?.existingConditions && (
                    <p className="text-[11px] leading-[1.6] mt-0.5" style={{ color: "#5A3020" }}>
                      <span className="font-bold" style={{ color: "#C06030" }}>Conditions: </span>
                      {mother.existingConditions}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* QR + GP + edit */}
            <div className="flex items-end gap-3.5">
              {/* QR code — warm framed */}
              <div
                className="flex-shrink-0 p-2.5 rounded-2xl flex flex-col items-center gap-1"
                style={{
                  background: "white",
                  border: "1.5px solid #F4D0B0",
                  boxShadow: "0 2px 12px rgba(180,80,40,0.08)",
                }}
              >
                <QRCodeSVG
                  value={qrPayload}
                  size={68}
                  level="M"
                  fgColor="#3D1F10"
                  bgColor="white"
                />
                <p className="text-[8px] font-bold tracking-widest uppercase" style={{ color: "#C06040" }}>
                  Scan
                </p>
              </div>

              {/* Right: GP + edit */}
              <div className="flex-1 flex flex-col gap-2.5">
                {mother?.gpName && (
                  <div
                    className="rounded-xl px-3 py-2"
                    style={{ background: "#FFF0E8", border: "1px solid #F4C09060" }}
                  >
                    <p className="text-[9px] font-bold uppercase tracking-wide" style={{ color: "#C06040" }}>
                      GP / OB-GYN
                    </p>
                    <p className="text-[12px] font-semibold mt-0.5" style={{ color: "#3D1F10" }}>
                      {mother.gpName}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => { onClose(); navigate("/settings"); }}
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-[12px] font-semibold transition-all active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #E8804A 0%, #F4A060 100%)",
                    color: "white",
                    boxShadow: "0 3px 12px rgba(220, 100, 50, 0.30)",
                  }}
                >
                  <Edit3 size={12} />
                  Edit Info
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between pt-2"
              style={{ borderTop: "1px dashed #F4C09060" }}
            >
              <div className="flex items-center gap-1">
                <Heart size={9} fill="#E8804A" style={{ color: "#E8804A" }} />
                <span className="text-[9px] font-medium" style={{ color: "#C08060" }}>
                  DadCompanion · Prenatal Care
                </span>
              </div>
              <span className="text-[9px] font-mono" style={{ color: "#C08060" }}>
                {new Date().getFullYear()}
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── WarmTile helper ──────────────────────────────────────────────────────────
const TILE_THEMES = {
  peach:    { bg: "#FFF4EE", border: "#F4C09060", icon: "#D4703A", label: "#D4703A", text: "#3D1F10" },
  sage:     { bg: "#F0F8F4", border: "#90C8A060", icon: "#3A8A5A", label: "#3A8A5A", text: "#1A3A28" },
  rose:     { bg: "#FFF0F4", border: "#F4A0B060", icon: "#C04060", label: "#C04060", text: "#3D1020" },
  lavender: { bg: "#F4F0FF", border: "#B090F060", icon: "#6040C0", label: "#6040C0", text: "#201040" },
};

function WarmTile({
  icon, label, value, hue,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hue: keyof typeof TILE_THEMES;
}) {
  const t = TILE_THEMES[hue];
  return (
    <div
      className="rounded-xl px-3 py-2.5 flex flex-col gap-1"
      style={{ background: t.bg, border: `1px solid ${t.border}` }}
    >
      <div className="flex items-center gap-1.5" style={{ color: t.icon }}>
        {icon}
        <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: t.label }}>
          {label}
        </span>
      </div>
      <p
        className="text-[12px] font-semibold leading-tight"
        style={{ color: t.text }}
      >
        {value}
      </p>
    </div>
  );
}
