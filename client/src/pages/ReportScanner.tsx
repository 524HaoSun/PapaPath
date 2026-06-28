/**
 * ReportScanner — Full camera scan flow for prenatal reports
 * Stages: permission → camera → capture → analyzing → results
 * AI: Multimodal vision analysis for OCR + plain-language explanation
 * Design: Warm Cockpit — DM Serif Display + Inter, warm beige
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  ChevronLeft, Camera, Scan, CheckCircle, AlertCircle,
  RotateCcw, Save, ChevronRight, Info, FlipHorizontal, X,
  Sparkles, FileText, Upload
} from "lucide-react";
import { useCare } from "@/contexts/CareContext";
import SidebarNav from "@/components/SidebarNav";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { trpc } from "@/lib/trpc";

type Stage = "permission" | "camera" | "capture" | "analyzing" | "results";

interface Metric {
  label: string;
  value: string;
  unit: string;
  status: "normal" | "attention" | "concern";
  reference: string;
  note: string;
}

interface AnalysisResult {
  reportType: string;
  summary: string;
  metrics: Metric[];
  recommendations: string[];
  nextSteps: string[];
  disclaimer: string;
}

const ANALYSIS_STEPS = [
  { label: "Identifying report type…",     icon: "🔍" },
  { label: "Extracting key values…",       icon: "📊" },
  { label: "Comparing reference ranges…",  icon: "📋" },
  { label: "Generating health insights…",  icon: "🧠" },
  { label: "Preparing dad's summary…",     icon: "✅" },
];

const statusConfig = {
  normal:    { color: "text-emerald-600", bg: "bg-emerald-50",  border: "border-emerald-200", dot: "bg-emerald-500", label: "Normal" },
  attention: { color: "text-amber-600",   bg: "bg-amber-50",    border: "border-amber-200",   dot: "bg-amber-500",   label: "Watch" },
  concern:   { color: "text-rose-600",    bg: "bg-rose-50",     border: "border-rose-200",    dot: "bg-rose-500",    label: "Review" },
};

export default function ReportScanner() {
  const [, navigate] = useLocation();
  const { addSavedReport, pregnancyWeek } = useCare();

  const [stage, setStage] = useState<Stage>("permission");
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedBase64, setCapturedBase64] = useState<string | null>(null);
  const [capturedMime, setCapturedMime] = useState<string>("image/jpeg");
  const [expandedMetric, setExpandedMetric] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeReport = trpc.reports.analyzeReport.useMutation();

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraError(null);
      setStage("camera");
    } catch (err: unknown) {
      const error = err as { name?: string };
      if (error.name === "NotAllowedError") {
        setCameraError("Camera access denied. Please allow camera access in your browser settings.");
      } else if (error.name === "NotFoundError") {
        setCameraError("No camera device found.");
      } else {
        setCameraError("Unable to access camera. Please try again.");
      }
    }
  }, [facingMode]);

  // Attach stream to video element
  useEffect(() => {
    if (stage === "camera" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [stage]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  // Flip camera
  const flipCamera = useCallback(async () => {
    const newMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: newMode }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
    } catch { toast.error("Unable to switch camera"); }
  }, [facingMode]);

  // Capture photo from camera
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    const base64 = dataUrl.split(",")[1];
    setCapturedImage(dataUrl);
    setCapturedBase64(base64);
    setCapturedMime("image/jpeg");
    stopCamera();
    setStage("capture");
  }, [stopCamera]);

  // Upload image from file
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      setCapturedImage(dataUrl);
      setCapturedBase64(base64);
      setCapturedMime(file.type || "image/jpeg");
      setStage("capture");
    };
    reader.readAsDataURL(file);
  }, []);

  // Start analysis — call AI vision API
  const startAnalysis = useCallback(async () => {
    if (!capturedBase64) return;
    setStage("analyzing");
    setAnalysisStep(0);
    setAnalysisProgress(0);
    setAnalysisError(null);

    // Animate progress steps while waiting for API
    let step = 0;
    const stepInterval = setInterval(() => {
      step = Math.min(step + 1, ANALYSIS_STEPS.length - 1);
      setAnalysisStep(step);
      setAnalysisProgress(Math.round((step / ANALYSIS_STEPS.length) * 80)); // up to 80%
    }, 800);

    try {
      const result = await analyzeReport.mutateAsync({
        imageBase64: capturedBase64,
        mimeType: capturedMime,
        pregnancyWeek: pregnancyWeek ?? undefined,
      });

      clearInterval(stepInterval);
      setAnalysisStep(ANALYSIS_STEPS.length);
      setAnalysisProgress(100);
      setAnalysisResult(result);
      setTimeout(() => setStage("results"), 400);
    } catch (err) {
      clearInterval(stepInterval);
      setAnalysisError("Analysis failed. Please try again. If the problem persists, check your network connection.");
      setStage("capture");
      toast.error("Report analysis failed. Please try again.");
    }
  }, [capturedBase64, capturedMime, analyzeReport, pregnancyWeek]);

  // Save report
  const handleSave = useCallback(() => {
    if (isSaved || !analysisResult) return;
    const normalCount = analysisResult.metrics.filter((m) => m.status === "normal").length;
    const attentionCount = analysisResult.metrics.filter((m) => m.status === "attention").length;
    const concernCount = analysisResult.metrics.filter((m) => m.status === "concern").length;
    const overallStatus = concernCount > 0 ? "concern" : attentionCount > 0 ? "attention" : "normal";

    addSavedReport({
      date: new Date().toLocaleDateString("en-GB", { month: "long", day: "numeric", year: "numeric" }),
      gestationalAge: `Week ${pregnancyWeek}`,
      reportType: analysisResult.reportType,
      overallStatus,
      thumbnail: capturedImage ?? undefined,
      metrics: analysisResult.metrics.map((m) => ({ label: m.label, value: m.value, unit: m.unit, status: m.status })),
    });
    setIsSaved(true);
    toast.success("Report saved to scan history! 🎉");
  }, [isSaved, analysisResult, addSavedReport, capturedImage, pregnancyWeek]);

  // Cleanup on unmount
  useEffect(() => { return () => stopCamera(); }, [stopCamera]);

  const isDarkStage = stage === "camera" || stage === "analyzing" || stage === "capture";

  if (isDarkStage) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex flex-col z-50">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 z-40 flex-shrink-0">
          <button
            onClick={() => { stopCamera(); navigate("/care"); }}
            className="w-9 h-9 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
          <p className="text-[16px] font-bold text-white" style={{ fontFamily: "'DM Serif Display', serif" }}>
            {stage === "analyzing" ? "Analysing…" : "Scan Report"}
          </p>
          {stage === "camera" ? (
            <button onClick={flipCamera} className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
              <FlipHorizontal size={18} className="text-white" />
            </button>
          ) : <div className="w-9 h-9" />}
        </header>

        {/* ── CAMERA STAGE ── */}
        {stage === "camera" && (
          <div className="flex-1 relative overflow-hidden">
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted autoPlay />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-black/50" />
              <div className="absolute" style={{ top: "50%", left: "50%", transform: "translate(-50%, -55%)", width: "85%", maxWidth: 320, aspectRatio: "4/3" }}>
                <div className="absolute inset-0 bg-transparent" style={{ boxShadow: "0 0 0 2000px rgba(0,0,0,0.5)" }} />
                {["top-0 left-0 border-t-2 border-l-2 rounded-tl-lg", "top-0 right-0 border-t-2 border-r-2 rounded-tr-lg", "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg", "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg"].map((cls, i) => (
                  <div key={i} className={`absolute w-8 h-8 border-amber-400 ${cls}`} />
                ))}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute left-0 right-0 h-0.5 bg-amber-400/80" style={{ animation: "scanLine 2s ease-in-out infinite", boxShadow: "0 0 8px rgba(251,191,36,0.8)" }} />
                </div>
              </div>
            </div>
            <div className="absolute bottom-32 left-0 right-0 text-center px-6">
              <p className="text-white font-semibold text-[14px]">Position the report inside the frame</p>
              <p className="text-slate-300 text-[12px] mt-1">Hold steady for best results</p>
            </div>
            <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-8">
              <button onClick={() => { stopCamera(); setStage("permission"); }} className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <X size={20} className="text-white" />
              </button>
              <button onClick={capturePhoto} className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "white", boxShadow: "0 0 0 4px rgba(255,255,255,0.3), 0 4px 20px rgba(0,0,0,0.4)" }}>
                <div className="w-16 h-16 bg-white rounded-full border-4 border-slate-200 flex items-center justify-center">
                  <Camera size={28} className="text-slate-700" />
                </div>
              </button>
              <button onClick={flipCamera} className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <FlipHorizontal size={20} className="text-white" />
              </button>
            </div>
          </div>
        )}

        {/* ── CAPTURE PREVIEW STAGE ── */}
        {stage === "capture" && capturedImage && (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 relative overflow-hidden">
              <img src={capturedImage} alt="Captured report" className="w-full h-full object-contain bg-black" />
              <div className="absolute inset-4 border-2 border-amber-400/60 rounded-2xl pointer-events-none" />
            </div>
            {analysisError && (
              <div className="mx-4 mt-3 bg-rose-900/50 border border-rose-500/50 rounded-xl p-3">
                <p className="text-[12px] text-rose-200 text-center">{analysisError}</p>
              </div>
            )}
            <div className="p-4 space-y-3">
              <p className="text-center text-[14px] text-slate-300">Is the report clear and readable?</p>
              <div className="flex gap-3">
                <button onClick={() => { setCapturedImage(null); startCamera(); }} className="flex-1 bg-white/10 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2">
                  <RotateCcw size={16} /> Retake
                </button>
                <button
                  onClick={startAnalysis}
                  disabled={analyzeReport.isPending}
                  className="flex-1 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, oklch(0.55 0.14 28), oklch(0.52 0.12 40))", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}
                >
                  <Sparkles size={16} /> AI Analysis
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── ANALYZING STAGE ── */}
        {stage === "analyzing" && (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            {capturedImage && (
              <div className="w-32 h-24 rounded-xl overflow-hidden mb-6 border-2 border-amber-400/40">
                <img src={capturedImage} alt="Report" className="w-full h-full object-cover" />
              </div>
            )}
            {/* Circular progress */}
            <div className="relative w-32 h-32 mb-8">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="oklch(0.75 0.15 60)" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - analysisProgress / 100)}`}
                  style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.23,1,0.32,1)" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[28px] font-black text-white" style={{ fontFamily: "'DM Serif Display', serif" }}>
                  {analysisProgress}%
                </span>
              </div>
            </div>
            <p className="text-[13px] text-amber-300 font-semibold mb-6">AI is analysing the report…</p>
            <div className="space-y-3 w-full max-w-[280px]">
              {ANALYSIS_STEPS.map((step, i) => (
                <div key={i} className={`flex items-center gap-3 transition-all duration-300 ${i < analysisStep ? "opacity-100" : i === analysisStep ? "opacity-100" : "opacity-30"}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${i < analysisStep ? "bg-emerald-500" : i === analysisStep ? "bg-amber-500 animate-pulse" : "bg-white/10"}`}>
                    {i < analysisStep ? <CheckCircle size={14} className="text-white" /> : <span className="text-[12px]">{step.icon}</span>}
                  </div>
                  <span className={`text-[13px] font-medium ${i <= analysisStep ? "text-white" : "text-slate-500"}`}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
        <style>{`@keyframes scanLine { 0% { top: 0%; } 50% { top: calc(100% - 2px); } 100% { top: 0%; } }`}</style>
      </div>
    );
  }

  // Permission and Results stages — use Warm Cockpit layout
  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.015 80)", backgroundImage: "radial-gradient(circle at 20% 20%, oklch(0.94 0.03 188 / 0.12) 0%, transparent 50%), radial-gradient(circle at 80% 80%, oklch(0.95 0.04 80 / 0.15) 0%, transparent 50%)" }}>
      <div className="flex min-h-screen">
        <SidebarNav />
        <main className="flex-1 flex flex-col min-w-0">
          <Header className="lg:border-b lg:px-6 lg:py-4" />
          <div className="flex-1 overflow-y-auto pb-20 lg:pb-8" style={{ scrollbarWidth: "thin" }}>

            {/* Sub-page header */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 py-3 flex items-center justify-between">
              <button onClick={() => { stopCamera(); navigate("/care"); }} className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center">
                <ChevronLeft size={20} className="text-slate-700" />
              </button>
              <p className="text-[16px] font-bold text-slate-800" style={{ fontFamily: "'DM Serif Display', serif" }}>
                {stage === "results" ? "AI Analysis Results" : "Scan Report"}
              </p>
              <div className="w-9 h-9" />
            </header>

            {/* ── PERMISSION STAGE ── */}
            {stage === "permission" && (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                {/* AI badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full mb-6" style={{ background: "oklch(0.95 0.04 60 / 0.6)", border: "1px solid oklch(0.85 0.08 60 / 0.4)" }}>
                  <Sparkles size={12} style={{ color: "oklch(0.55 0.14 60)" }} />
                  <span className="text-[11px] font-bold" style={{ color: "oklch(0.45 0.12 60)" }}>AI Multimodal Vision Analysis</span>
                </div>

                <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 border" style={{ background: "oklch(0.95 0.04 60 / 0.4)", borderColor: "oklch(0.85 0.08 60 / 0.4)" }}>
                  <Scan size={44} style={{ color: "oklch(0.55 0.14 60)" }} />
                </div>
                <h2 className="text-[22px] font-black mb-2" style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.22 0.04 240)" }}>
                  Scan Prenatal Report
                </h2>
                <p className="text-[14px] leading-relaxed mb-8 max-w-[280px]" style={{ color: "oklch(0.45 0.04 240)" }}>
                  Photograph or upload a prenatal report. Our AI will extract key indicators and explain them in plain English for dad.
                </p>
                <div className="w-full max-w-sm bg-white rounded-2xl p-4 mb-6 text-left space-y-3 border border-slate-100 shadow-sm">
                  {[
                    { icon: "📋", text: "Blood count & urine test results" },
                    { icon: "🔬", text: "Ultrasound & fetal measurement reports" },
                    { icon: "💊", text: "Prescriptions & medication records" },
                    { icon: "🩺", text: "Antenatal summary & midwife notes" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-[13px] text-slate-600">{item.text}</span>
                    </div>
                  ))}
                </div>
                {cameraError && (
                  <div className="w-full max-w-sm bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-4">
                    <p className="text-[13px] text-rose-600 text-center">{cameraError}</p>
                  </div>
                )}
                <div className="w-full max-w-sm flex flex-col gap-3">
                  <button
                    onClick={startCamera}
                    className="w-full text-white font-bold py-4 rounded-2xl text-[16px] flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, oklch(0.55 0.14 28), oklch(0.52 0.12 40))", boxShadow: "0 4px 20px oklch(0.55 0.14 28 / 0.3)" }}
                  >
                    <Camera size={20} />
                    Take Photo
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full font-bold py-4 rounded-2xl text-[16px] flex items-center justify-center gap-2"
                    style={{ background: "oklch(0.95 0.04 60 / 0.5)", color: "oklch(0.45 0.12 60)", border: "1px solid oklch(0.85 0.08 60 / 0.5)" }}
                  >
                    <Upload size={20} />
                    Upload from Gallery
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </div>
                <p className="text-[11px] text-slate-400 mt-3">Camera is used only for scanning. No data is stored on device.</p>
              </div>
            )}

            {/* ── RESULTS STAGE ── */}
            {stage === "results" && analysisResult && (
              <div className="pb-6">
                {/* Summary header */}
                <div className="px-5 pt-5 pb-4" style={{ background: "linear-gradient(135deg, oklch(0.45 0.12 40) 0%, oklch(0.50 0.14 55) 100%)" }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <FileText size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[16px] font-black text-white" style={{ fontFamily: "'DM Serif Display', serif" }}>{analysisResult.reportType}</p>
                      <p className="text-[12px] text-amber-200">Week {pregnancyWeek} · {new Date().toLocaleDateString("en-GB")}</p>
                    </div>
                  </div>
                  {/* Summary */}
                  <div className="bg-white/15 rounded-xl px-4 py-3 mb-4">
                    <p className="text-[13px] text-white/90 leading-relaxed">{analysisResult.summary}</p>
                  </div>
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: analysisResult.metrics.filter((m) => m.status === "normal").length,    label: "Normal",  color: "bg-emerald-500/20 text-emerald-200" },
                      { value: analysisResult.metrics.filter((m) => m.status === "attention").length, label: "Watch",   color: "bg-amber-500/20 text-amber-200" },
                      { value: analysisResult.metrics.filter((m) => m.status === "concern").length,   label: "Review",  color: "bg-rose-500/20 text-rose-200" },
                    ].map((s, i) => (
                      <div key={i} className={`rounded-xl p-3 text-center ${s.color}`}>
                        <p className="text-[22px] font-black" style={{ fontFamily: "'DM Serif Display', serif" }}>{s.value}</p>
                        <p className="text-[11px] font-semibold">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-4 py-4 space-y-3">
                  {/* Metrics */}
                  {analysisResult.metrics.length > 0 && (
                    <>
                      <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Health Indicators</p>
                      {analysisResult.metrics.map((m, i) => {
                        const cfg = statusConfig[m.status];
                        const isExpanded = expandedMetric === i;
                        return (
                          <button key={i} onClick={() => setExpandedMetric(isExpanded ? null : i)} className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm text-left overflow-hidden active:scale-[0.99] transition-transform">
                            <div className="flex items-center gap-3 p-4">
                              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-[14px] font-bold text-slate-800" style={{ fontFamily: "'DM Serif Display', serif" }}>{m.label}</p>
                                <p className="text-[12px] text-slate-500">Ref: {m.reference}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <p className="text-[16px] font-black text-slate-800" style={{ fontFamily: "'DM Serif Display', serif" }}>
                                    {m.value}<span className="text-[11px] font-normal text-slate-500 ml-0.5">{m.unit}</span>
                                  </p>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                                </div>
                                <ChevronRight size={14} className={`text-slate-300 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                              </div>
                            </div>
                            {isExpanded && (
                              <div className={`px-4 pb-4 pt-0 border-t ${cfg.border} ${cfg.bg}`}>
                                <div className="flex items-start gap-2 mt-3">
                                  <Info size={14} className={`${cfg.color} flex-shrink-0 mt-0.5`} />
                                  <p className={`text-[13px] leading-relaxed ${cfg.color}`}>{m.note}</p>
                                </div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </>
                  )}

                  {/* Recommendations */}
                  {analysisResult.recommendations.length > 0 && (
                    <>
                      <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider pt-1">Tips for Dad</p>
                      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
                        {analysisResult.recommendations.map((r, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <span className="text-xl flex-shrink-0">💡</span>
                            <p className="text-[13px] text-slate-700 leading-relaxed">{r}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Next Steps */}
                  {analysisResult.nextSteps.length > 0 && (
                    <div className="rounded-2xl p-4" style={{ background: "oklch(0.95 0.04 60 / 0.4)", border: "1px solid oklch(0.85 0.08 60 / 0.4)" }}>
                      <p className="text-[14px] font-bold mb-2" style={{ fontFamily: "'DM Serif Display', serif", color: "oklch(0.35 0.10 60)" }}>Next Steps</p>
                      <div className="space-y-2">
                        {analysisResult.nextSteps.map((s, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: "oklch(0.55 0.14 60)" }} />
                            <p className="text-[12px]" style={{ color: "oklch(0.40 0.08 60)" }}>{s}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-500 leading-relaxed">{analysisResult.disclaimer}</p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 pt-1 pb-2">
                    <button
                      onClick={() => { setCapturedImage(null); setCapturedBase64(null); setAnalysisResult(null); setIsSaved(false); setStage("permission"); }}
                      className="flex-1 bg-slate-100 text-slate-700 font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 text-[14px]"
                    >
                      <RotateCcw size={15} /> Scan Another
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaved}
                      className={`flex-1 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-[14px] transition-all ${isSaved ? "bg-emerald-100 text-emerald-700" : "text-white"}`}
                      style={isSaved ? {} : { background: "linear-gradient(135deg, oklch(0.55 0.14 28), oklch(0.52 0.12 40))" }}
                    >
                      {isSaved ? <><CheckCircle size={15} /> Saved</> : <><Save size={15} /> Save Report</>}
                    </button>
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
