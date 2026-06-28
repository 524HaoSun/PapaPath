/**
 * reports.ts — tRPC router for medical report scanning
 *
 * Uses AI multimodal model to:
 *   1. OCR and understand the report image
 *   2. Extract key metrics with values, units, and reference ranges
 *   3. Generate plain-language explanations for expectant fathers
 *
 * Procedure:
 *   - analyzeReport: accepts base64 image, returns structured analysis
 */
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { mimoVision } from "../mimo";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ReportMetric {
  label: string;
  value: string;
  unit: string;
  status: "normal" | "attention" | "concern";
  reference: string;
  note: string;
}

export interface ReportAnalysis {
  reportType: string;
  summary: string;
  metrics: ReportMetric[];
  recommendations: string[];
  nextSteps: string[];
  disclaimer: string;
}

// ─── Prompt ───────────────────────────────────────────────────────────────────
const ANALYSIS_PROMPT = `You are a professional obstetric medical report assistant, specialising in helping expectant fathers understand their partner's prenatal reports.

Please carefully analyse this medical report image, extract all key metrics, and explain them in plain, accessible language for the dad-to-be.

Return the result strictly in the following JSON format (no additional text):

{
  "reportType": "Type of report (e.g. Full Blood Count, Urinalysis, Ultrasound, Comprehensive Prenatal Report)",
  "summary": "A concise 1–2 sentence summary of the overall report, in a warm and encouraging tone",
  "metrics": [
    {
      "label": "Metric name",
      "value": "Measured value",
      "unit": "Unit",
      "status": "normal/attention/concern",
      "reference": "Reference range",
      "note": "Plain-language explanation of what this metric means for mum and baby (1–2 sentences, avoid medical jargon)"
    }
  ],
  "recommendations": [
    "Specific advice for the dad (e.g. diet, lifestyle, things to watch out for)"
  ],
  "nextSteps": [
    "Suggested next actions (e.g. follow-up timing, things to mention to the doctor)"
  ],
  "disclaimer": "Note: This analysis is for reference only. Please consult your healthcare provider for a formal diagnosis."
}

Important:
- The status field must be exactly one of: "normal", "attention", or "concern"
- If the image is unclear or cannot be identified as a medical report, return an empty metrics array and explain in the summary
- Use a warm, encouraging tone so the dad feels reassured rather than anxious
- All text must be in English`;

// ─── Router ───────────────────────────────────────────────────────────────────
export const reportsRouter = router({
  /**
   * Analyze a medical report image using AI vision model
   * Accepts base64-encoded image, returns structured analysis
   */
  analyzeReport: publicProcedure
    .input(
      z.object({
        imageBase64: z.string().min(100),
        mimeType: z.string().default("image/jpeg"),
        pregnancyWeek: z.number().int().min(1).max(42).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const prompt = input.pregnancyWeek
        ? `${ANALYSIS_PROMPT}\n\nCurrent pregnancy week: Week ${input.pregnancyWeek}. Please consider the normal reference ranges for this gestational age in your analysis.`
        : ANALYSIS_PROMPT;

      const result = await mimoVision({
        prompt,
        imageBase64: input.imageBase64,
        mimeType: input.mimeType as "image/jpeg" | "image/png" | "image/webp",
        maxTokens: 2048,
      });

      let analysis: ReportAnalysis;
      try {
        const jsonMatch = result.content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found in response");
        analysis = JSON.parse(jsonMatch[0]) as ReportAnalysis;

        if (analysis.metrics) {
          analysis.metrics = analysis.metrics.map((m) => ({
            ...m,
            status: (["normal", "attention", "concern"].includes(m.status)
              ? m.status
              : "normal") as "normal" | "attention" | "concern",
          }));
        }
      } catch {
        analysis = {
          reportType: "Medical Report",
          summary: "The report was received, but automatic parsing encountered an issue. Please review the raw analysis below alongside your doctor's advice.",
          metrics: [],
          recommendations: [result.content.slice(0, 500)],
          nextSteps: ["Please bring this report to your doctor to confirm the specific values."],
          disclaimer: "Note: This analysis is for reference only. Please consult your healthcare provider for a formal diagnosis.",
        };
      }

      return analysis;
    }),
});
