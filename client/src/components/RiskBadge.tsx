import { AlertTriangle, CheckCircle, Info, ShieldAlert, Siren } from "lucide-react";

type RiskLevel = "normal" | "watch" | "needs_attention" | "urgent" | "emergency";

const config: Record<RiskLevel, { label: string; icon: any; className: string; bgClass: string }> = {
  normal: { label: "Normal", icon: CheckCircle, className: "risk-normal", bgClass: "risk-bg-normal" },
  watch: { label: "Watch", icon: Info, className: "risk-watch", bgClass: "risk-bg-watch" },
  needs_attention: { label: "Needs Attention", icon: AlertTriangle, className: "risk-attention", bgClass: "risk-bg-attention" },
  urgent: { label: "Urgent", icon: ShieldAlert, className: "risk-urgent", bgClass: "risk-bg-urgent" },
  emergency: { label: "Emergency", icon: Siren, className: "risk-emergency", bgClass: "risk-bg-emergency" },
};

export function RiskBadge({ level, showLabel = true }: { level: RiskLevel; showLabel?: boolean }) {
  const c = config[level] ?? config.normal;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${c.className} ${c.bgClass}`}>
      <Icon className="w-3.5 h-3.5" />
      {showLabel && c.label}
    </span>
  );
}

export function RiskCard({ level, title, explanation, suggestedNextStep, emergencyGuidance, disclaimer }: {
  level: RiskLevel; title: string; explanation: string; suggestedNextStep: string; emergencyGuidance?: string; disclaimer?: string;
}) {
  const c = config[level] ?? config.normal;
  const Icon = c.icon;
  return (
    <div className={`rounded-xl border p-4 space-y-3 ${c.bgClass}`}>
      <div className={`flex items-center gap-2 font-semibold ${c.className}`}>
        <Icon className="w-5 h-5 shrink-0" />
        <span>{title}</span>
      </div>
      <p className="text-sm text-foreground/80">{explanation}</p>
      <div className="text-sm">
        <span className="font-medium text-foreground">Suggested next step: </span>
        <span className="text-foreground/80">{suggestedNextStep}</span>
      </div>
      {emergencyGuidance && (
        <div className="text-sm bg-background/60 rounded-lg p-3 border border-border">
          <span className="font-medium text-foreground">Emergency contacts: </span>
          <span className="text-foreground/80">{emergencyGuidance}</span>
        </div>
      )}
      {disclaimer && <p className="disclaimer-banner">{disclaimer}</p>}
    </div>
  );
}
