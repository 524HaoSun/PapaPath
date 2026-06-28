/**
 * MiMo AI helper — Xiaomi MiMo API integration
 *
 * Available models (confirmed via /v1/models):
 *   mimo-v2.5         — text + vision (image_url with base64 data URL)
 *   mimo-v2.5-pro     — stronger text reasoning
 *   mimo-v2.5-asr     — speech-to-text (input_audio content, data URL format)
 *   mimo-v2.5-tts     — text-to-speech (assistant role, modalities:['audio'])
 *   mimo-v2-omni      — older multimodal (v2)
 *
 * TTS voices: mimo_default, Bingtang, Jasmine, Soda, Birch, Mia, Chloe, Milo, Dean
 */
import { ENV } from "./_core/env";

const BASE_URL = ENV.mimoApiUrl.replace(/\/+$/, "");
const API_KEY = ENV.mimoApiKey;

function authHeaders() {
  return {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  };
}

// ─── Chat Completion (text + optional vision) ───────────────────────────────

export type MiMoContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export interface MiMoMessage {
  role: "system" | "user" | "assistant";
  content: string | MiMoContentPart[];
}

export interface MiMoChatOptions {
  /** Default: "mimo-v2.5-pro" for text, "mimo-v2.5" for vision */
  model?: string;
  messages: MiMoMessage[];
  maxTokens?: number;
  temperature?: number;
}

export interface MiMoChatResult {
  content: string;
  model: string;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

export async function mimoChat(opts: MiMoChatOptions): Promise<MiMoChatResult> {
  const model = opts.model ?? "mimo-v2.5-pro";
  const resp = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      model,
      messages: opts.messages,
      max_tokens: opts.maxTokens ?? 1024,
      temperature: opts.temperature ?? 0.7,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`MiMo chat error ${resp.status}: ${err}`);
  }

  const data = (await resp.json()) as {
    choices: Array<{ message: { content: string; reasoning_content?: string } }>;
    model: string;
    usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  };

  const choice = data.choices[0]?.message;
  const content = choice?.content || choice?.reasoning_content || "";

  return { content, model: data.model, usage: data.usage };
}

// ─── Vision (medical report / image analysis) ───────────────────────────────

export interface MiMoVisionOptions {
  /** Prompt / question about the image */
  prompt: string;
  /** Base64-encoded image data (without data URL prefix) */
  imageBase64: string;
  /** MIME type: image/jpeg, image/png, image/webp */
  mimeType?: string;
  maxTokens?: number;
}

export async function mimoVision(opts: MiMoVisionOptions): Promise<MiMoChatResult> {
  const mimeType = opts.mimeType ?? "image/jpeg";
  const dataUrl = `data:${mimeType};base64,${opts.imageBase64}`;

  return mimoChat({
    model: "mimo-v2.5",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: opts.prompt },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ],
    maxTokens: opts.maxTokens ?? 2048,
    temperature: 0.3,
  });
}

// ─── ASR (Speech-to-Text) ───────────────────────────────────────────────────
// Uses mimo-v2.5-asr via chat/completions with input_audio content type.
// Audio must be provided as a data URL: data:<mime>;base64,<data>
// The model does NOT accept a text part alongside audio.

export interface MiMoASROptions {
  /** Base64-encoded audio data (without data URL prefix) */
  audioBase64: string;
  /** MIME type: audio/webm, audio/wav, audio/mp3, audio/ogg, audio/mp4 */
  mimeType?: string;
  /** Language hint, e.g. "zh", "en" — passed as language param if supported */
  language?: string;
}

export interface MiMoASRResult {
  text: string;
  language?: string;
}

export async function mimoASR(opts: MiMoASROptions): Promise<MiMoASRResult> {
  const mimeType = opts.mimeType ?? "audio/webm";
  const dataUrl = `data:${mimeType};base64,${opts.audioBase64}`;

  const body: Record<string, unknown> = {
    model: "mimo-v2.5-asr",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "input_audio",
            input_audio: { data: dataUrl, format: mimeType.split("/")[1] ?? "webm" },
          },
        ],
      },
    ],
    max_tokens: 512,
  };

  if (opts.language) {
    body.language = opts.language;
  }

  const resp = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`MiMo ASR error ${resp.status}: ${err}`);
  }

  const data = (await resp.json()) as {
    choices: Array<{ message: { content: string; reasoning_content?: string } }>;
  };

  const choice = data.choices[0]?.message;
  const text = (choice?.content || choice?.reasoning_content || "").trim();

  return { text, language: opts.language };
}

// ─── TTS (Text-to-Speech) ───────────────────────────────────────────────────
// Uses mimo-v2.5-tts via chat/completions.
// Requires: assistant role message, modalities:['audio'], audio.voice + format.
// Returns base64 mp3 in choices[0].message.audio.data

export type MiMoTTSVoice =
  | "mimo_default"
  | "Bingtang"  // Chinese female, literal: "iced sugar"
  | "Jasmine"   // Chinese female, warm
  | "Soda"      // Chinese female
  | "Birch"     // Chinese female
  | "Mia"
  | "Chloe"
  | "Milo"
  | "Dean";

export interface MiMoTTSOptions {
  text: string;
  /** Voice name — default: "Jasmine" (warm female, good for medical context) */
  voice?: MiMoTTSVoice;
  /** Audio format: mp3 | wav | pcm */
  format?: string;
}

export interface MiMoTTSResult {
  /** Base64-encoded audio data */
  audioBase64: string;
  /** MIME type of the audio */
  mimeType: string;
}

export async function mimoTTS(opts: MiMoTTSOptions): Promise<MiMoTTSResult> {
  const format = opts.format ?? "mp3";
  const voice = opts.voice ?? "Jasmine"; // warm female voice

  const resp = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      model: "mimo-v2.5-tts",
      messages: [{ role: "assistant", content: opts.text }],
      modalities: ["audio"],
      audio: { voice, format },
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`MiMo TTS error ${resp.status}: ${err}`);
  }

  const data = (await resp.json()) as {
    choices: Array<{
      message: {
        audio?: { id: string; data: string; expires_at: number; transcript: string };
      };
    }>;
  };

  const audioData = data.choices[0]?.message?.audio;
  if (!audioData?.data) {
    throw new Error("MiMo TTS: no audio data in response");
  }

  const mimeType = format === "mp3" ? "audio/mpeg" : `audio/${format}`;
  return { audioBase64: audioData.data, mimeType };
}

// ─── Connectivity test ──────────────────────────────────────────────────────

export async function mimoHealthCheck(): Promise<boolean> {
  try {
    const result = await mimoChat({
      model: "mimo-v2.5",
      messages: [{ role: "user", content: "ping" }],
      maxTokens: 5,
    });
    return result.content.length >= 0;
  } catch {
    return false;
  }
}
