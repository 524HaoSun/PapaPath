/**
 * ConsultationInterpreter — Full-screen bilingual translation panel
 *
 * Design: Split-screen (Dad left / Doctor right), voice + text input,
 * quick phrases, conversation history, language selector.
 *
 * AI: Real-time medical translation, voice input, and text-to-speech
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, MicOff, Send, Globe, ChevronDown, History, Trash2, Copy, Check, Volume2, VolumeX } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { usePregnancy } from "@/hooks/usePregnancy";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: number | string;
  speaker: "dad" | "doctor";
  originalText: string;
  translatedText: string;
  originalLanguage: string;
  targetLanguage: string;
  inputMethod: "text" | "voice";
  createdAt?: Date;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const LANGUAGES: Language[] = [
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
];

const QUICK_PHRASES: Record<string, { dad: string[]; doctor: string[] }> = {
  zh: {
    dad: [
      "She's been feeling dizzy",
      "There's some abdominal pain",
      "Baby is moving less",
      "What is this test for?",
      "What should we watch for?",
      "When is the next visit?",
    ],
    doctor: [
      "Everything looks normal",
      "We need to run some tests",
      "Please come back in 2 weeks",
      "Take this medication daily",
      "Rest and stay hydrated",
      "Any concerns, call us",
    ],
  },
  en: {
    dad: [
      "She's been feeling dizzy",
      "There's some abdominal pain",
      "Baby is moving less",
      "What is this test for?",
      "What should we watch for?",
      "When is the next visit?",
    ],
    doctor: [
      "Everything looks normal",
      "We need to run some tests",
      "Please come back in 2 weeks",
      "Take this medication daily",
      "Rest and stay hydrated",
      "Any concerns, call us",
    ],
  },
};

function getQuickPhrases(lang: string, speaker: "dad" | "doctor"): string[] {
  return QUICK_PHRASES[lang]?.[speaker] ?? QUICK_PHRASES["en"][speaker];
}

// ─── Language Selector ────────────────────────────────────────────────────────
function LanguageSelector({
  value,
  onChange,
  label,
  accent,
}: {
  value: string;
  onChange: (code: string) => void;
  label: string;
  accent: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = LANGUAGES.find((l) => l.code === value) ?? LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all"
        style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}44` }}
      >
        <span>{selected.flag}</span>
        <span>{selected.nativeName}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
            className="absolute top-full mt-1 left-0 z-50 bg-white rounded-2xl shadow-xl border border-border/30 overflow-hidden min-w-[160px]"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { onChange(lang.code); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] hover:bg-muted/60 transition-colors text-left"
                style={{ fontWeight: lang.code === value ? 700 : 400 }}
              >
                <span className="text-base">{lang.flag}</span>
                <div>
                  <p className="font-semibold text-foreground">{lang.nativeName}</p>
                  <p className="text-[10px] text-muted-foreground">{lang.name}</p>
                </div>
                {lang.code === value && <Check size={12} className="ml-auto" style={{ color: accent }} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({
  msg,
  isNew,
  onSpeak,
  isSpeaking,
}: {
  msg: Message;
  isNew?: boolean;
  onSpeak: (text: string, lang: string) => void;
  isSpeaking: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const isDad = msg.speaker === "dad";
  const dadAccent = "oklch(0.55 0.14 28)";
  const doctorAccent = "oklch(0.48 0.12 220)";
  const accent = isDad ? dadAccent : doctorAccent;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${msg.originalText}\n→ ${msg.translatedText}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={isNew ? { opacity: 0, y: 12, scale: 0.97 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      className={`flex gap-2 ${isDad ? "flex-row" : "flex-row-reverse"}`}
    >
      {/* Speaker avatar */}
      <div
        className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-white mt-0.5"
        style={{ background: accent }}
      >
        {isDad ? "D" : "Dr"}
      </div>

      {/* Bubble */}
      <div className={`flex-1 max-w-[85%] ${isDad ? "" : "flex flex-col items-end"}`}>
        <div
          className="rounded-2xl px-3 py-2.5 relative group"
          style={{
            background: isDad ? "oklch(0.97 0.03 28 / 0.6)" : "oklch(0.96 0.03 220 / 0.6)",
            border: `1px solid ${accent}33`,
          }}
        >
          {/* Original text */}
          <p className="text-[13px] font-semibold leading-[1.5]" style={{ color: "oklch(0.22 0.04 240)" }}>
            {msg.originalText}
          </p>
          {/* Translation */}
          <div className="mt-1.5 pt-1.5 border-t" style={{ borderColor: `${accent}25` }}>
            <div className="flex items-start gap-1.5">
              <p className="flex-1 text-[11px] leading-[1.5]" style={{ color: "oklch(0.45 0.04 240)" }}>
                → {msg.translatedText}
              </p>
              {/* TTS play button */}
              <button
                onClick={() => onSpeak(msg.translatedText, msg.targetLanguage)}
                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all hover:opacity-80"
                style={{ background: `${accent}20`, color: accent }}
                title="Read aloud"
              >
                {isSpeaking ? <VolumeX size={10} /> : <Volume2 size={10} />}
              </button>
            </div>
          </div>
          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-black/5"
          >
            {copied ? <Check size={11} style={{ color: accent }} /> : <Copy size={11} className="text-muted-foreground" />}
          </button>
        </div>
        {/* Input method badge */}
          {msg.inputMethod === "voice" && (
            <span className="text-[9px] mt-0.5 px-1.5 py-0.5 rounded-full" style={{ background: `${accent}18`, color: accent }}>
              🎤 Voice
            </span>
          )}
      </div>
    </motion.div>
  );
}

// ─── Voice Recorder Modal ─────────────────────────────────────────────────────
// Inspired by Google Translate Live / SayHi: large press-and-hold button,
// real-time volume waveform, countdown ring, clear processing state.
function VoiceRecorderModal({
  accent,
  language,
  onResult,
  onClose,
}: {
  accent: string;
  language: string;
  onResult: (text: string) => void;
  onClose: () => void;
}) {
  const MAX_SECONDS = 30;
  const MIN_MS = 600; // minimum recording length to avoid empty audio

  type Phase = "idle" | "recording" | "processing" | "error";
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0); // seconds
  const [volume, setVolume] = useState(0);   // 0–1
  const [errorMsg, setErrorMsg] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const mimeTypeRef = useRef<string>("audio/webm");

  const transcribeAudio = trpc.consultation.transcribeAudio.useMutation();

  // Poll analyser for real-time volume
  const startVolumeMonitor = (stream: MediaStream) => {
    try {
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      analyserRef.current = analyser;
      const buf = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(buf);
        const avg = buf.reduce((a, b) => a + b, 0) / buf.length;
        setVolume(Math.min(avg / 80, 1));
        animFrameRef.current = requestAnimationFrame(tick);
      };
      animFrameRef.current = requestAnimationFrame(tick);
    } catch {
      // AudioContext not available — skip volume monitor
    }
  };

  const stopVolumeMonitor = () => {
    cancelAnimationFrame(animFrameRef.current);
    setVolume(0);
  };

  const startRecording = async () => {
    setErrorMsg("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 },
      });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";
      mimeTypeRef.current = mimeType;

      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        stopVolumeMonitor();
        if (timerRef.current) clearInterval(timerRef.current);

        const duration = Date.now() - startTimeRef.current;
        if (duration < MIN_MS || audioChunksRef.current.length === 0) {
          setPhase("error");
          setErrorMsg("Recording too short — please hold the button and speak clearly.");
          return;
        }

        setPhase("processing");
        const blob = new Blob(audioChunksRef.current, { type: mimeTypeRef.current });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(",")[1];
          if (!base64) {
            setPhase("error");
            setErrorMsg("Recording data is empty — please try again.");
            return;
          }
          try {
            const result = await transcribeAudio.mutateAsync({
              audioBase64: base64,
              mimeType: mimeTypeRef.current.split(";")[0],
              language,
            });
            if (result.text?.trim()) {
              onResult(result.text.trim());
              onClose();
            } else {
              setPhase("error");
              setErrorMsg("Could not recognise speech — please speak more clearly and try again.");
            }
          } catch {
            setPhase("error");
            setErrorMsg("Recognition failed — please check your connection and try again.");
          }
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(100); // collect chunks every 100ms
      startTimeRef.current = Date.now();
      setElapsed(0);
      setPhase("recording");
      startVolumeMonitor(stream);

      // Elapsed timer
      timerRef.current = setInterval(() => {
        setElapsed((s) => {
          if (s + 1 >= MAX_SECONDS) {
            stopRecording();
            return MAX_SECONDS;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      setPhase("error");
      setErrorMsg("Cannot access microphone — please allow microphone permission and try again.");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const circumference = 2 * Math.PI * 44; // r=44
  const progress = elapsed / MAX_SECONDS;
  const strokeDashoffset = circumference * (1 - progress);

  // Waveform bars (7 bars, volume-driven heights)
  const bars = Array.from({ length: 7 }, (_, i) => {
    const center = 3;
    const distFromCenter = Math.abs(i - center);
    const base = 0.15;
    const peak = volume * (1 - distFromCenter * 0.15);
    return Math.max(base, peak);
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "rgba(10,12,20,0.82)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget && phase !== "recording") onClose(); }}
    >
      {/* Card */}
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        className="flex flex-col items-center gap-6 px-8 py-10 rounded-3xl w-[280px]"
        style={{ background: "oklch(0.14 0.03 240)", border: "1px solid oklch(0.25 0.04 240)" }}
      >
        {/* Status label */}
        <p className="text-[13px] font-semibold tracking-wide" style={{ color: "oklch(0.70 0.04 240)" }}>
          {phase === "idle" && "Tap to start speaking"}
          {phase === "recording" && "Listening…"}
          {phase === "processing" && "Recognising speech…"}
          {phase === "error" && "Try again"}
        </p>

        {/* Big mic button with countdown ring */}
        <div className="relative flex items-center justify-center">
          {/* SVG countdown ring */}
          <svg width="100" height="100" className="absolute" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="50" cy="50" r="44" fill="none" stroke="oklch(0.25 0.04 240)" strokeWidth="3" />
            {phase === "recording" && (
              <circle
                cx="50" cy="50" r="44"
                fill="none"
                stroke={accent}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: "stroke-dashoffset 0.9s linear" }}
              />
            )}
          </svg>

          {/* Ripple rings when recording */}
          {phase === "recording" && (
            <>
              {[1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{ width: 80 + volume * 40, height: 80 + volume * 40, border: `1.5px solid ${accent}`, opacity: 0.3 / i }}
                  animate={{ scale: [1, 1.3 + volume * 0.4], opacity: [0.3 / i, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.4, ease: "easeOut" }}
                />
              ))}
            </>
          )}

          {/* Core button */}
          <button
            onPointerDown={() => { if (phase === "idle" || phase === "error") startRecording(); }}
            onPointerUp={() => { if (phase === "recording") stopRecording(); }}
            onPointerLeave={() => { if (phase === "recording") stopRecording(); }}
            disabled={phase === "processing"}
            className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-transform active:scale-95"
            style={{
              background: phase === "recording"
                ? accent
                : phase === "error"
                ? "oklch(0.45 0.12 25)"
                : "oklch(0.22 0.04 240)",
              boxShadow: phase === "recording" ? `0 0 0 ${8 + volume * 16}px ${accent}22` : "none",
              transition: "box-shadow 0.08s ease-out, background 0.2s",
            }}
          >
            {phase === "processing" ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-7 h-7 border-[3px] border-white/30 border-t-white rounded-full"
              />
            ) : (
              <Mic size={28} className="text-white" />
            )}
          </button>
        </div>

        {/* Waveform bars (volume visualiser) */}
        <div className="flex items-center justify-center gap-1" style={{ height: 32 }}>
          {bars.map((h, i) => (
            <motion.div
              key={i}
              className="rounded-full"
              style={{ width: 4, background: phase === "recording" ? accent : "oklch(0.30 0.03 240)" }}
              animate={{ height: phase === "recording" ? `${Math.max(6, h * 32)}px` : "6px" }}
              transition={{ duration: 0.08, ease: "easeOut" }}
            />
          ))}
        </div>

        {/* Timer / error message */}
        {phase === "recording" && (
          <p className="text-[12px] tabular-nums" style={{ color: "oklch(0.60 0.03 240)" }}>
            {elapsed}s / {MAX_SECONDS}s
          </p>
        )}
        {phase === "error" && (
          <p className="text-[11px] text-center leading-relaxed" style={{ color: "oklch(0.70 0.10 25)" }}>
            {errorMsg}
          </p>
        )}

        {/* Instruction */}
        {phase === "idle" && (
          <p className="text-[11px] text-center" style={{ color: "oklch(0.45 0.03 240)" }}>
            Hold the button while speaking,<br />release to send for recognition
          </p>
        )}

        {/* Cancel button */}
        {phase !== "processing" && (
          <button
            onClick={onClose}
            className="text-[12px] px-5 py-2 rounded-full press-feedback"
            style={{ background: "oklch(0.20 0.03 240)", color: "oklch(0.55 0.03 240)" }}
          >
            Cancel
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Input Panel ──────────────────────────────────────────────────────────────
function InputPanel({
  speaker,
  language,
  onLanguageChange,
  onSend,
  isTranslating,
  accent,
  label,
  sessionId,
}: {
  speaker: "dad" | "doctor";
  language: string;
  onLanguageChange: (code: string) => void;
  onSend: (text: string, method: "text" | "voice") => void;
  isTranslating: boolean;
  accent: string;
  label: string;
  sessionId: number | null;
}) {
  const [text, setText] = useState("");
  const [showPhrases, setShowPhrases] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const langObj = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];
  const quickPhrases = getQuickPhrases(language, speaker);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || isTranslating || !sessionId) return;
    onSend(trimmed, "text");
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [text, isTranslating, sessionId, onSend]);

  const handleVoiceResult = useCallback((recognisedText: string) => {
    onSend(recognisedText, "voice");
  }, [onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
  };

  return (
    <>
    <AnimatePresence>
      {showVoiceModal && (
        <VoiceRecorderModal
          accent={accent}
          language={language}
          onResult={handleVoiceResult}
          onClose={() => setShowVoiceModal(false)}
        />
      )}
    </AnimatePresence>

    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b" style={{ borderColor: `${accent}20` }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: accent }}>
            {speaker === "dad" ? "D" : "Dr"}
          </div>
          <span className="text-[13px] font-bold" style={{ color: "oklch(0.22 0.04 240)" }}>{label}</span>
        </div>
        <LanguageSelector value={language} onChange={onLanguageChange} label={label} accent={accent} />
      </div>

      {/* Quick phrases */}
      <div className="px-3 pt-2">
        <button
          onClick={() => setShowPhrases(!showPhrases)}
          className="text-[11px] font-semibold flex items-center gap-1 mb-1.5"
          style={{ color: accent }}
        >
          Quick phrases <ChevronDown size={11} className={`transition-transform ${showPhrases ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {showPhrases && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-1.5 pb-2">
                {quickPhrases.map((phrase, i) => (
                  <button
                    key={i}
                    onClick={() => { setText(phrase); setShowPhrases(false); textareaRef.current?.focus(); }}
                    className="text-[11px] px-2.5 py-1 rounded-full transition-all hover:opacity-80 active:scale-95"
                    style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}
                  >
                    {phrase}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Text input */}
      <div className="flex-1 px-3 pb-3 flex flex-col gap-2">
        <div
          className="flex-1 rounded-xl border overflow-hidden flex flex-col"
          style={{ borderColor: `${accent}30`, background: `${accent}08` }}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={`Type in ${langObj.name}…`}
            disabled={!sessionId || isTranslating}
            rows={3}
            className="flex-1 w-full px-3 py-2.5 text-[13px] bg-transparent resize-none outline-none placeholder:text-muted-foreground/50 leading-[1.6]"
            style={{ color: "oklch(0.22 0.04 240)", minHeight: "72px", maxHeight: "100px" }}
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Voice button — opens full-screen recorder modal */}
          <button
            onClick={() => setShowVoiceModal(true)}
            disabled={!sessionId || isTranslating}
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-40"
            style={{
              background: `${accent}18`,
              color: accent,
              border: `1.5px solid ${accent}30`,
            }}
            title="Voice Input"
          >
            <Mic size={18} />
          </button>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!text.trim() || !sessionId || isTranslating}
            className="flex-1 h-10 rounded-xl flex items-center justify-center gap-2 text-[13px] font-bold text-white transition-all active:scale-95 disabled:opacity-40"
            style={{ background: isTranslating ? `${accent}80` : accent }}
          >
            {isTranslating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                />
                Translating…
              </>
            ) : (
              <>
                <Send size={14} />
                Translate & Send
              </>
            )}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface ConsultationInterpreterProps {
  onClose: () => void;
}

export default function ConsultationInterpreter({ onClose }: ConsultationInterpreterProps) {
  const { currentWeek } = usePregnancy();
  const displayWeek = currentWeek ?? 15;

  const [sessionId, setSessionId] = useState<number | null>(null);
  const [dadLanguage, setDadLanguage] = useState("zh");
  const [doctorLanguage, setDoctorLanguage] = useState("en");
  const [messages, setMessages] = useState<Message[]>([]);
  const [translatingFor, setTranslatingFor] = useState<"dad" | "doctor" | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const createSession = trpc.consultation.createSession.useMutation();
  const endSessionMutation = trpc.consultation.endSession.useMutation();
  const translateMutation = trpc.consultation.translate.useMutation();
  const synthesizeSpeech = trpc.consultation.synthesizeSpeech.useMutation();
  const { data: sessionsData } = trpc.consultation.getSessions.useQuery(undefined, { enabled: showHistory });

  // Auto-create session on mount
  useEffect(() => {
    createSession.mutateAsync({
      title: `Week ${displayWeek} Antenatal Consultation`,
      dadLanguage,
      doctorLanguage,
      pregnancyWeek: displayWeek,
    }).then((res) => {
      setSessionId(res.sessionId);
    }).catch(() => {
      toast.error("Unable to create session. Please log in first.");
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTranslate = useCallback(async (speaker: "dad" | "doctor", text: string, method: "text" | "voice") => {
    if (!sessionId) return;
    setTranslatingFor(speaker);
    try {
      const fromLang = speaker === "dad" ? dadLanguage : doctorLanguage;
      const toLang = speaker === "dad" ? doctorLanguage : dadLanguage;
      const result = await translateMutation.mutateAsync({
        sessionId,
        speaker,
        text,
        inputMethod: method,
        pregnancyWeek: displayWeek,
        fromLanguage: fromLang,
        toLanguage: toLang,
      });
      setMessages((prev) => [
        ...prev,
        {
          id: result.messageId,
          speaker,
          originalText: result.originalText,
          translatedText: result.translatedText,
          originalLanguage: result.originalLanguage,
          targetLanguage: result.targetLanguage,
          inputMethod: method,
          createdAt: new Date(),
        },
      ]);
    } catch {
      toast.error("Translation failed. Please try again.");
    } finally {
      setTranslatingFor(null);
    }
  }, [sessionId, translateMutation, displayWeek, dadLanguage, doctorLanguage]);

  // TTS: play translated text
  const handleSpeak = useCallback(async (text: string, lang: string, msgId: string | number) => {
    // Stop current playback if same message
    if (speakingMsgId === msgId) {
      audioRef.current?.pause();
      setSpeakingMsgId(null);
      return;
    }

    // Stop any ongoing playback
    audioRef.current?.pause();

    setSpeakingMsgId(msgId);
    try {
      // Pick a voice based on language
      const voice = lang === "zh" ? "Jasmine" : lang === "ja" ? "Mia" : lang === "ko" ? "Chloe" : "Milo";
      const result = await synthesizeSpeech.mutateAsync({ text, voice, format: "mp3" });

      const audioSrc = `data:${result.mimeType};base64,${result.audioBase64}`;
      const audio = new Audio(audioSrc);
      audioRef.current = audio;
      audio.onended = () => setSpeakingMsgId(null);
      audio.onerror = () => { setSpeakingMsgId(null); toast.error("Audio playback failed."); };
      await audio.play();
    } catch {
      setSpeakingMsgId(null);
      toast.error("Text-to-speech failed. Please try again.");
    }
  }, [speakingMsgId, synthesizeSpeech]);

  const handleEndSession = async () => {
    if (!sessionId) return;
    await endSessionMutation.mutateAsync({ sessionId });
    setSessionEnded(true);
    toast.success("Session saved to history.");
  };

  const handleClearMessages = () => {
    setMessages([]);
    toast.success("Conversation cleared.");
  };

  const dadAccent = "oklch(0.55 0.14 28)";
  const doctorAccent = "oklch(0.48 0.12 220)";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "oklch(0.97 0.015 80)" }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{
          background: "linear-gradient(135deg, oklch(0.55 0.14 28) 0%, oklch(0.52 0.12 40) 50%, oklch(0.48 0.10 60) 100%)",
          borderColor: "transparent",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <Globe size={16} className="text-white" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-white leading-tight">Consultation Interpreter</p>
            <p className="text-[11px] text-white/70">Week {displayWeek} · Real-time AI Medical Translation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={handleClearMessages}
              className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
            >
              <Trash2 size={14} className="text-white" />
            </button>
          )}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
          >
            <History size={14} className="text-white" />
          </button>
          {!sessionEnded && sessionId && (
            <button
              onClick={handleEndSession}
              className="px-3 py-1.5 rounded-xl bg-white/20 text-white text-[11px] font-bold hover:bg-white/30 transition-colors"
            >
              Save & End
            </button>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
          >
            <X size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* ── History Panel ── */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border/30 bg-white/60"
          >
            <div className="px-4 py-3">
              <p className="text-[12px] font-bold text-muted-foreground mb-2">Past Consultations</p>
              {!sessionsData || sessionsData.length === 0 ? (
                <p className="text-[12px] text-muted-foreground">No history yet</p>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                  {sessionsData.map((s) => (
                    <div
                      key={s.id}
                      className="flex-shrink-0 px-3 py-2 rounded-xl text-[11px] bg-white border border-border/30 shadow-sm"
                    >
                      <p className="font-semibold text-foreground">{s.title}</p>
                      <p className="text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</p>
                      <p className="text-muted-foreground">{s.status === "ended" ? "✓ Saved" : "In progress"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Session ended banner ── */}
      {sessionEnded && (
        <div className="px-4 py-2 text-center text-[12px] font-semibold" style={{ background: "oklch(0.92 0.08 150 / 0.4)", color: "oklch(0.38 0.10 150)" }}>
          ✓ Session saved to history
        </div>
      )}

      {/* ── Main content: split screen ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Dad */}
        <div
          className="flex-1 flex flex-col border-r"
          style={{ borderColor: "oklch(0.88 0.04 28 / 0.4)", background: "oklch(0.98 0.02 28 / 0.5)" }}
        >
          <InputPanel
            speaker="dad"
            language={dadLanguage}
            onLanguageChange={setDadLanguage}
            onSend={(text, method) => handleTranslate("dad", text, method)}
            isTranslating={translatingFor === "dad"}
            accent={dadAccent}
            label="Dad"
            sessionId={sessionId}
          />
        </div>

        {/* Right: Doctor */}
        <div
          className="flex-1 flex flex-col"
          style={{ background: "oklch(0.97 0.02 220 / 0.5)" }}
        >
          <InputPanel
            speaker="doctor"
            language={doctorLanguage}
            onLanguageChange={setDoctorLanguage}
            onSend={(text, method) => handleTranslate("doctor", text, method)}
            isTranslating={translatingFor === "doctor"}
            accent={doctorAccent}
            label="Doctor"
            sessionId={sessionId}
          />
        </div>
      </div>

      {/* ── Conversation history ── */}
      {messages.length > 0 && (
        <div
          className="border-t flex flex-col"
          style={{ borderColor: "oklch(0.88 0.04 240 / 0.3)", maxHeight: "45vh" }}
        >
          <div className="px-4 py-2 flex items-center justify-between border-b" style={{ borderColor: "oklch(0.88 0.04 240 / 0.2)" }}>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Conversation · {messages.length} message{messages.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3" style={{ scrollbarWidth: "thin" }}>
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isNew={i === messages.length - 1}
                onSpeak={(text, lang) => handleSpeak(text, lang, msg.id)}
                isSpeaking={speakingMsgId === msg.id}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {messages.length === 0 && !createSession.isPending && (
        <div className="px-6 py-4 text-center border-t" style={{ borderColor: "oklch(0.88 0.04 240 / 0.2)" }}>
          <p className="text-[12px] text-muted-foreground">
            💬 Type or speak in your language — AI instantly translates for the other person. Tap 🔊 to hear the translation aloud.
          </p>
        </div>
      )}

      {/* ── Loading state ── */}
      {createSession.isPending && (
        <div className="px-6 py-4 text-center border-t" style={{ borderColor: "oklch(0.88 0.04 240 / 0.2)" }}>
          <p className="text-[12px] text-muted-foreground">Starting session…</p>
        </div>
      )}
    </motion.div>
  );
}
