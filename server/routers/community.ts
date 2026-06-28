/**
 * Community Router — Dad Community AI Chat
 * Provides a tRPC procedure for the AI pregnancy Q&A chatbot.
 * Uses MiMo mimo-v2.5-pro for chat completions.
 */
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { mimoChat } from "../mimo";

const SYSTEM_PROMPT = `You are "Dad AI" — a warm, knowledgeable, and supportive AI companion designed specifically for expectant dads.
Your role is to help dads understand pregnancy, support their partners, and prepare for the arrival of their new baby.

Guidelines:
- Be warm, encouraging, and empathetic — dads are often overlooked during pregnancy; make them feel valued
- Give practical, actionable advice that dads can use today
- Use clear, accessible language and avoid excessive medical jargon
- For medical questions, always recommend consulting a qualified healthcare professional
- Keep responses concise and complete, aiming for 150–250 words
- Use formatting (bullet points, bold key terms) where it improves readability
- Encourage dad's involvement and curiosity

Topics you excel at: emotional support for partners, practical birth preparation, understanding pregnancy stages, labour preparation, newborn care basics, postpartum support, dad's mental health

Important: You are not a medical professional. For health concerns, always recommend seeking professional medical advice.`;

export const communityRouter = router({
  /**
   * AI Chat — send a message and get a response from the Dad AI
   * Uses publicProcedure so unauthenticated users can also chat
   */
  aiChat: publicProcedure
    .input(
      z.object({
        messages: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string(),
            })
          )
          .min(1)
          .max(50),
        pregnancyWeek: z.number().int().min(1).max(40).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { messages, pregnancyWeek } = input;

      let systemContent = SYSTEM_PROMPT;
      if (pregnancyWeek) {
        systemContent += `\n\nCurrent context: The user's partner is at week ${pregnancyWeek} of pregnancy. Please tailor your advice to this stage where relevant.`;
      }

      const mimoMessages = [
        { role: "system" as const, content: systemContent },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      const result = await mimoChat({
        model: "mimo-v2.5-pro",
        messages: mimoMessages,
        maxTokens: 1024,
        temperature: 0.7,
      });

      return { content: result.content || "Sorry, I'm unable to respond right now. Please try again." };
    }),
});
