import { getActiveRiskRules } from "./db";

export type RiskLevel = "normal" | "watch" | "needs_attention" | "urgent" | "emergency";

export interface RiskResult {
  riskLevel: RiskLevel;
  riskCategory: string;
  title: string;
  explanation: string;
  suggestedNextStep: string;
  emergencyGuidance?: string;
  disclaimer: string;
}

export interface HealthInput {
  systolicBp?: number | null;
  diastolicBp?: number | null;
  bloodGlucose?: number | null;
  weight?: number | null;
  swellingLevel?: string | null;
  fetalMovementCount?: number | null;
  sleepQualityScore?: number | null;
  symptoms?: string[];
  stressLevel?: number | null;
  anxietyLevel?: number | null;
}

const DISCLAIMER =
  "This app provides pregnancy support information only. It does not provide medical diagnosis, treatment, or emergency care. Risk alerts are based on the information you entered and are not a diagnosis. For urgent symptoms, contact your midwife, maternity triage, NHS 111, or emergency services.";

const RISK_LEVEL_ORDER: Record<RiskLevel, number> = {
  normal: 0,
  watch: 1,
  needs_attention: 2,
  urgent: 3,
  emergency: 4,
};

function compareRiskLevel(a: RiskLevel, b: RiskLevel): number {
  return RISK_LEVEL_ORDER[a] - RISK_LEVEL_ORDER[b];
}

// Built-in fallback rules (used if DB rules are empty or unavailable)
const FALLBACK_RULES = [
  {
    ruleName: "High Systolic Blood Pressure",
    riskCategory: "blood_pressure",
    riskLevel: "needs_attention" as RiskLevel,
    conditionJson: { field: "systolicBp", operator: "gt", value: 140 },
    explanationTemplate: "The systolic blood pressure reading is higher than the typical safe range during pregnancy.",
    suggestedNextStep: "Contact your midwife, GP, or maternity triage for advice.",
  },
  {
    ruleName: "High Diastolic Blood Pressure",
    riskCategory: "blood_pressure",
    riskLevel: "needs_attention" as RiskLevel,
    conditionJson: { field: "diastolicBp", operator: "gt", value: 90 },
    explanationTemplate: "The diastolic blood pressure reading is higher than the typical safe range during pregnancy.",
    suggestedNextStep: "Contact your midwife, GP, or maternity triage for advice.",
  },
  {
    ruleName: "Very High Blood Pressure",
    riskCategory: "blood_pressure",
    riskLevel: "urgent" as RiskLevel,
    conditionJson: { field: "systolicBp", operator: "gt", value: 160 },
    explanationTemplate: "The blood pressure reading is significantly elevated and may require immediate attention.",
    suggestedNextStep: "Contact maternity triage immediately or call NHS 111.",
  },
  {
    ruleName: "High Blood Glucose",
    riskCategory: "blood_glucose",
    riskLevel: "watch" as RiskLevel,
    conditionJson: { field: "bloodGlucose", operator: "gt", value: 7.8 },
    explanationTemplate: "The blood glucose reading is above the typical post-meal range for pregnancy.",
    suggestedNextStep: "Monitor closely and discuss with your midwife or GP at your next appointment.",
  },
  {
    ruleName: "Very High Blood Glucose",
    riskCategory: "blood_glucose",
    riskLevel: "needs_attention" as RiskLevel,
    conditionJson: { field: "bloodGlucose", operator: "gt", value: 11.0 },
    explanationTemplate: "The blood glucose reading is significantly elevated and may need professional review.",
    suggestedNextStep: "Contact your midwife or GP for advice about gestational diabetes management.",
  },
  {
    ruleName: "Reduced Fetal Movement",
    riskCategory: "fetal_movement",
    riskLevel: "urgent" as RiskLevel,
    conditionJson: { field: "fetalMovementCount", operator: "lt", value: 10 },
    explanationTemplate: "A noticeable reduction in baby movement has been recorded. This should be checked professionally.",
    suggestedNextStep: "Contact maternity triage immediately. Do not wait until your next appointment.",
  },
  {
    ruleName: "Severe Swelling",
    riskCategory: "swelling",
    riskLevel: "needs_attention" as RiskLevel,
    conditionJson: { field: "swellingLevel", operator: "eq", value: "severe" },
    explanationTemplate: "Severe swelling during pregnancy can sometimes indicate a condition that needs professional review.",
    suggestedNextStep: "Contact your midwife or maternity triage for advice.",
  },
  {
    ruleName: "High Stress Level",
    riskCategory: "mood",
    riskLevel: "watch" as RiskLevel,
    conditionJson: { field: "stressLevel", operator: "gte", value: 8 },
    explanationTemplate: "A high stress level has been recorded. Emotional wellbeing is an important part of pregnancy health.",
    suggestedNextStep: "Consider speaking with your midwife about support options. You can also contact your GP.",
  },
];

// Emergency symptoms that always trigger emergency level
const EMERGENCY_SYMPTOMS = ["bleeding", "severe_swelling", "abdominal_pain", "visual_disturbance", "shortness_of_breath"];
const URGENT_SYMPTOMS = ["reduced_fetal_movement", "fever"];

function evaluateCondition(condition: any, input: HealthInput): boolean {
  if (!condition || !condition.field) return false;
  const value = (input as any)[condition.field];
  if (value === null || value === undefined) return false;

  switch (condition.operator) {
    case "gt": return Number(value) > Number(condition.value);
    case "gte": return Number(value) >= Number(condition.value);
    case "lt": return Number(value) < Number(condition.value);
    case "lte": return Number(value) <= Number(condition.value);
    case "eq": return String(value) === String(condition.value);
    default: return false;
  }
}

export async function runRiskEngine(input: HealthInput): Promise<RiskResult> {
  let highestRisk: RiskResult = {
    riskLevel: "normal",
    riskCategory: "general",
    title: "All readings look normal",
    explanation: "Based on the information recorded, everything appears to be within normal ranges. Continue monitoring regularly.",
    suggestedNextStep: "Keep recording daily health data and attend all scheduled appointments.",
    disclaimer: DISCLAIMER,
  };

  // Check emergency symptoms first
  const symptoms = input.symptoms ?? [];
  const hasEmergencySymptom = symptoms.some((s) => EMERGENCY_SYMPTOMS.includes(s));
  const hasUrgentSymptom = symptoms.some((s) => URGENT_SYMPTOMS.includes(s));

  if (hasEmergencySymptom) {
    return {
      riskLevel: "emergency",
      riskCategory: "symptoms",
      title: "Urgent medical help may be needed",
      explanation: "One or more symptoms have been recorded that may require immediate medical attention. Please do not delay seeking help.",
      suggestedNextStep: "Call 999 or go to your nearest emergency department immediately. If unsure, call NHS 111.",
      emergencyGuidance: "Call 999 for life-threatening emergencies. Call NHS 111 for urgent medical advice. Call your maternity triage for pregnancy-specific concerns.",
      disclaimer: DISCLAIMER,
    };
  }

  if (hasUrgentSymptom) {
    highestRisk = {
      riskLevel: "urgent",
      riskCategory: "symptoms",
      title: "Urgent attention recommended",
      explanation: "One or more symptoms have been recorded that should be checked by a healthcare professional without delay.",
      suggestedNextStep: "Contact maternity triage immediately or call NHS 111.",
      emergencyGuidance: "If symptoms worsen rapidly, call 999. Otherwise contact maternity triage or NHS 111 now.",
      disclaimer: DISCLAIMER,
    };
  }

  // Load DB rules, fall back to built-in rules
  let rules: any[] = [];
  try {
    rules = await getActiveRiskRules();
  } catch {
    rules = [];
  }
  if (rules.length === 0) rules = FALLBACK_RULES;

  for (const rule of rules) {
    const condition = rule.conditionJson as any;
    if (evaluateCondition(condition, input)) {
      const ruleLevel = rule.riskLevel as RiskLevel;
      if (compareRiskLevel(ruleLevel, highestRisk.riskLevel) > 0) {
        highestRisk = {
          riskLevel: ruleLevel,
          riskCategory: rule.riskCategory ?? "general",
          title: getRiskTitle(ruleLevel, rule.ruleName),
          explanation: rule.explanationTemplate ?? "A reading outside the normal range has been detected.",
          suggestedNextStep: rule.suggestedNextStep ?? "Contact your midwife or GP for advice.",
          emergencyGuidance: ruleLevel === "emergency" || ruleLevel === "urgent" ? "Call 999 for emergencies. NHS 111 for urgent advice. Maternity triage for pregnancy concerns." : undefined,
          disclaimer: DISCLAIMER,
        };
      }
    }
  }

  return highestRisk;
}

function getRiskTitle(level: RiskLevel, ruleName: string): string {
  switch (level) {
    case "emergency": return "Urgent medical help may be needed";
    case "urgent": return "Urgent attention recommended";
    case "needs_attention": return `${ruleName} — professional review advised`;
    case "watch": return `${ruleName} — worth monitoring`;
    default: return "Reading noted";
  }
}
