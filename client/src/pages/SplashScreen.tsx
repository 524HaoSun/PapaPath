import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

const COUPLE_IMG = "/manus-storage/papapath-couple_680d541c.png";

const TEAM_AVATARS = [
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663736995811/JK3usPDEUoWvJFsGYMHKPM/team-avatar-1-XmMubzreHFWg5ZWTdYEfZA.webp",
    name: "Zac",
    role: "Design Lead",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663736995811/JK3usPDEUoWvJFsGYMHKPM/team-avatar-2-CBD9A5oSbdTiGx9P3DFmns.webp",
    name: "Leo",
    role: "UI Designer",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663736995811/JK3usPDEUoWvJFsGYMHKPM/team-avatar-3-Ty58SseNvK8zctBABgpn2L.webp",
    name: "Kai",
    role: "UX Designer",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663736995811/JK3usPDEUoWvJFsGYMHKPM/team-avatar-4-7QpiLzSG8RqfgosfaPDLfN.webp",
    name: "Max",
    role: "Illustrator",
  },
];

// Decorative SVG leaf branch
function LeafBranch({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      width="60"
      height="40"
      viewBox="0 0 60 40"
      fill="none"
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
    >
      <path d="M5 35 Q20 20 30 10" stroke="#b8a87a" strokeWidth="1.2" fill="none" />
      <ellipse cx="18" cy="24" rx="5" ry="3" fill="#c8b88a" opacity="0.7" transform="rotate(-30 18 24)" />
      <ellipse cx="25" cy="16" rx="4" ry="2.5" fill="#b8a87a" opacity="0.6" transform="rotate(-45 25 16)" />
      <ellipse cx="10" cy="30" rx="4" ry="2.5" fill="#c8b88a" opacity="0.5" transform="rotate(-15 10 30)" />
    </svg>
  );
}

// PapaPath logo mark SVG
function LogoMark() {
  return (
    <div className="relative flex items-center justify-center">
      <svg width="80" height="90" viewBox="0 0 80 90" fill="none">
        <path
          d="M10 85 L10 40 Q10 10 40 10 Q70 10 70 40 L70 85"
          stroke="#c8a87a"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M18 85 L18 42 Q18 18 40 18 Q62 18 62 42 L62 85"
          stroke="#e8c89a"
          strokeWidth="0.8"
          fill="none"
          opacity="0.5"
        />
        <ellipse cx="40" cy="38" rx="7" ry="7" fill="#3a5a3a" />
        <path d="M33 45 Q30 58 32 70 L48 70 Q50 58 47 45 Z" fill="#3a5a3a" />
        <ellipse cx="44" cy="60" rx="8" ry="7" fill="#3a5a3a" />
        <circle cx="44" cy="60" r="3.5" fill="#d4784a" />
        <path d="M44 45 Q52 38 48 32 Q42 36 44 45 Z" fill="#5a8a5a" />
      </svg>
    </div>
  );
}

export default function SplashScreen() {
  const [, navigate] = useLocation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleGetStarted = () => {
    sessionStorage.setItem("splash_seen", "1");
    navigate("/");
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #f5e8d8 0%, #fdf6ee 40%, #f8f0e4 100%)",
        fontFamily: "'DM Serif Display', Georgia, serif",
      }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-30 pointer-events-none"
        style={{ background: "radial-gradient(circle, #d4c4a8 0%, transparent 70%)", transform: "translate(30%, -30%)" }}
      />
      <div
        className="absolute top-20 left-0 w-32 h-32 rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #c8b898 0%, transparent 70%)", transform: "translate(-40%, 0)" }}
      />

      {/* ── Logo + Title ── */}
      <AnimatePresence>
        {ready && (
          <motion.div
            className="flex flex-col items-center pt-12 pb-2 px-6 z-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="flex items-center gap-1 mb-1">
              <LeafBranch />
              <LogoMark />
              <LeafBranch flip />
            </div>

            <div className="flex items-end gap-0 mt-1">
              <span className="text-5xl font-bold tracking-tight" style={{ color: "#2d4a2d" }}>
                Papa
              </span>
              <span className="text-5xl font-bold tracking-tight" style={{ color: "#c8784a" }}>
                Path
              </span>
              <span className="text-2xl mb-1 ml-0.5">🌱</span>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <div className="h-px w-10 rounded-full" style={{ background: "#c8a87a" }} />
              <p className="text-sm tracking-wide" style={{ color: "#7a6a5a", fontFamily: "Georgia, serif" }}>
                Steady dad, happy mum.
              </p>
              <div className="h-px w-10 rounded-full" style={{ background: "#c8a87a" }} />
            </div>
            <span className="text-sm mt-1" style={{ color: "#d4784a" }}>♥</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero couple image ── */}
      <motion.div
        className="relative z-10 flex items-end justify-center mt-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: ready ? 1 : 0, scale: ready ? 1 : 0.95 }}
        transition={{ delay: 0.3, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Soft oval platform */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
          style={{ width: 260, height: 80, background: "rgba(255,255,255,0.55)", filter: "blur(3px)" }}
        />
        <img
          src={COUPLE_IMG}
          alt="Expectant couple"
          className="relative z-10 object-cover object-top rounded-3xl shadow-xl"
          style={{ width: 230, height: 290, objectPosition: "center top" }}
        />
      </motion.div>

      {/* ── Get started button ── */}
      <motion.div
        className="w-full max-w-sm px-6 pt-6 pb-4 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 20 }}
        transition={{ delay: 0.7, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        <button
          onClick={handleGetStarted}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-full text-white text-lg font-semibold shadow-lg active:scale-[0.97] transition-transform"
          style={{
            background: "linear-gradient(135deg, #3a5a3a 0%, #4a7a4a 100%)",
            fontFamily: "Georgia, serif",
            letterSpacing: "0.02em",
          }}
        >
          Get started
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>

      {/* ── Design team ── */}
      <motion.div
        className="w-full max-w-sm px-6 pb-10 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px flex-1" style={{ background: "#d4c4a8" }} />
          <span className="text-xs flex items-center gap-1" style={{ color: "#9a8a6a", fontFamily: "Georgia, serif" }}>
            🌿 Design team 🌿
          </span>
          <div className="h-px flex-1" style={{ background: "#d4c4a8" }} />
        </div>

        <div className="grid grid-cols-4 gap-3">
          {TEAM_AVATARS.map((member, i) => (
            <motion.div
              key={member.name}
              className="flex flex-col items-center gap-1.5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 12 }}
              transition={{ delay: 1.0 + i * 0.08, duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
            >
              {/* Avatar circle */}
              <div
                className="rounded-full overflow-hidden shadow-md"
                style={{
                  width: 64,
                  height: 64,
                  border: "2.5px solid rgba(200,168,122,0.55)",
                  boxShadow: "0 3px 12px rgba(60,40,20,0.13)",
                }}
              >
                <img
                  src={member.src}
                  alt={member.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>

            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
