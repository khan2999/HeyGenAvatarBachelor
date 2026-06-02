import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY not set in .env.local");
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

export const CHAT_MODEL = "gpt-3.5-turbo";

export const SYSTEM_PROMPT = `You are AURA, a friendly AI avatar in a research study on human-AI interaction. Keep responses to 1-2 short sentences max — your text will be spoken aloud. No bullet points or formatting. If user writes German, reply in German. If English, reply in English. Be warm and natural.`;
