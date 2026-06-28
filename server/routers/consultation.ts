/**
 * consultation.ts — tRPC router for the Consultation Interpreter feature
 *
 * Provides:
 *   - createSession      — start a new consultation session
 *   - endSession         — mark a session as ended
 *   - getSessions        — list past sessions for the current user
 *   - getMessages        — get all messages for a session
 *   - translate          — translate a message using AI (medical context)
 *   - transcribeAudio    — ASR: base64 audio → text
 *   - synthesizeSpeech   — TTS: text → base64 mp3
 */
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { consultationSessions, consultationMessages } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { mimoChat, mimoASR, mimoTTS, type MiMoTTSVoice } from "../mimo";
import { getDb } from "../db";

// ─── Language display names ───────────────────────────────────────────────────
const LANGUAGE_NAMES: Record<string, string> = {
  zh: "Simplified Chinese",
  en: "English",
  ja: "Japanese",
  ko: "Korean",
  es: "Spanish",
  fr: "French",
  ar: "Arabic",
  hi: "Hindi",
};

// ─── AI medical translation ───────────────────────────────────────────────────
async function translateMedical(
  text: string,
  fromLang: string,
  toLang: string,
  context?: string
): Promise<string> {
  const fromName = LANGUAGE_NAMES[fromLang] ?? fromLang;
  const toName = LANGUAGE_NAMES[toLang] ?? toLang;

  const systemPrompt = `You are a professional medical interpreter specialising in obstetrics and prenatal care.
Your role is to provide accurate, clear translations between ${fromName} and ${toName} for doctor-patient communication.

Translation principles:
- Accurately translate medical terminology, preserving the original term in parentheses where helpful
- Maintain a natural, conversational tone
- Strictly preserve the original meaning — do not add or omit any information
- Use standard medical terminology for pregnancy-related terms
${context ? `- Context: ${context}` : ""}

Output only the translation — do not add any explanation or prefix.`;

  try {
    const result = await mimoChat({
      model: "mimo-v2.5-pro",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Translate the following from ${fromName} to ${toName}:\n\n${text}` },
      ],
      maxTokens: 1024,
      temperature: 0.3,
    });
    return result.content.trim() || text;
  } catch {
    return `[Translation temporarily unavailable] ${text}`;
  }
}

// ─── Router ───────────────────────────────────────────────────────────────────
export const consultationRouter = router({
  /**
   * Start a new consultation session
   */
  createSession: protectedProcedure
    .input(
      z.object({
        title: z.string().max(255).default("Prenatal Consultation"),
        dadLanguage: z.string().max(10).default("zh"),
        doctorLanguage: z.string().max(10).default("en"),
        pregnancyWeek: z.number().int().min(1).max(40).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dbConn = (await getDb())!;
      const [result] = await dbConn.insert(consultationSessions).values({
        userId: ctx.user.id,
        title: input.title,
        dadLanguage: input.dadLanguage,
        doctorLanguage: input.doctorLanguage,
        pregnancyWeek: input.pregnancyWeek,
        status: "active",
      });
      const sessionId = (result as { insertId: number }).insertId;
      return { sessionId };
    }),

  /**
   * End a consultation session
   */
  endSession: protectedProcedure
    .input(z.object({ sessionId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const dbConn = (await getDb())!;
      await dbConn
        .update(consultationSessions)
        .set({ status: "ended", endedAt: new Date() })
        .where(
          and(
            eq(consultationSessions.id, input.sessionId),
            eq(consultationSessions.userId, ctx.user.id)
          )
        );
      return { ok: true };
    }),

  /**
   * Get past sessions for the current user
   */
  getSessions: protectedProcedure
    .input(z.object({ limit: z.number().int().max(20).default(10) }).optional())
    .query(async ({ ctx, input }) => {
      const dbConn = (await getDb())!;
      const sessions = await dbConn
        .select()
        .from(consultationSessions)
        .where(eq(consultationSessions.userId, ctx.user.id))
        .orderBy(desc(consultationSessions.createdAt))
        .limit(input?.limit ?? 10);
      return sessions;
    }),

  /**
   * Get all messages for a session
   */
  getMessages: protectedProcedure
    .input(z.object({ sessionId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const dbConn = (await getDb())!;
      const [session] = await dbConn
        .select()
        .from(consultationSessions)
        .where(
          and(
            eq(consultationSessions.id, input.sessionId),
            eq(consultationSessions.userId, ctx.user.id)
          )
        )
        .limit(1);
      if (!session) throw new Error("Session not found");

      const messages = await dbConn
        .select()
        .from(consultationMessages)
        .where(eq(consultationMessages.sessionId, input.sessionId))
        .orderBy(consultationMessages.createdAt);
      return { session, messages };
    }),

  /**
   * Translate a message and save it to the session
   */
  translate: protectedProcedure
    .input(
      z.object({
        sessionId: z.number().int(),
        speaker: z.enum(["dad", "doctor"]),
        text: z.string().min(1).max(2000),
        inputMethod: z.enum(["text", "voice"]).default("text"),
        pregnancyWeek: z.number().int().optional(),
        fromLanguage: z.string().max(10).optional(),
        toLanguage: z.string().max(10).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dbConn = (await getDb())!;
      const [session] = await dbConn
        .select()
        .from(consultationSessions)
        .where(
          and(
            eq(consultationSessions.id, input.sessionId),
            eq(consultationSessions.userId, ctx.user.id)
          )
        )
        .limit(1);
      if (!session) throw new Error("Session not found");

      const fromLang =
        input.fromLanguage ??
        (input.speaker === "dad" ? session.dadLanguage : session.doctorLanguage);
      const toLang =
        input.toLanguage ??
        (input.speaker === "dad" ? session.doctorLanguage : session.dadLanguage);
      const context = input.pregnancyWeek
        ? `Week ${input.pregnancyWeek} prenatal appointment`
        : "Prenatal consultation";

      const translatedText = await translateMedical(input.text, fromLang, toLang, context);

      const [insertResult] = await dbConn.insert(consultationMessages).values({
        sessionId: input.sessionId,
        speaker: input.speaker,
        originalText: input.text,
        translatedText,
        originalLanguage: fromLang,
        targetLanguage: toLang,
        inputMethod: input.inputMethod,
      });
      const messageId = (insertResult as { insertId: number }).insertId;

      return {
        messageId,
        originalText: input.text,
        translatedText,
        speaker: input.speaker,
        originalLanguage: fromLang,
        targetLanguage: toLang,
      };
    }),

  /**
   * ASR: Transcribe audio to text
   * Accepts base64-encoded audio with MIME type
   */
  transcribeAudio: protectedProcedure
    .input(
      z.object({
        audioBase64: z.string().min(1),
        mimeType: z.string().default("audio/webm"),
        language: z.string().max(10).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await mimoASR({
        audioBase64: input.audioBase64,
        mimeType: input.mimeType,
        language: input.language,
      });
      return { text: result.text };
    }),

  /**
   * TTS: Synthesize speech from text
   * Returns base64-encoded mp3 audio
   */
  synthesizeSpeech: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1).max(1000),
        voice: z.string().default("Mia"),
        format: z.string().default("mp3"),
      })
    )
    .mutation(async ({ input }) => {
      const result = await mimoTTS({
        text: input.text,
        voice: input.voice as MiMoTTSVoice,
        format: input.format,
      });
      return {
        audioBase64: result.audioBase64,
        mimeType: result.mimeType,
      };
    }),
});
