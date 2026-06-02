import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are AURA, a friendly AI avatar in a research study on human-AI interaction. Keep responses to 1-2 short sentences max — your text will be spoken aloud by an avatar. No bullet points, no formatting, no markdown. If the user writes in German, reply in German. If English, reply in English. Be warm, natural and conversational.`;

export async function POST(request: NextRequest) {
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { message, conversationHistory = [] } = body;
  if (!message?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GROQ_API_KEY not set" }, { status: 500 });

  try {
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...conversationHistory.slice(-10).map((m: any) => ({ role: m.role, content: m.content })),
        { role: "user", content: message.trim() },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });
    const reply = completion.choices[0]?.message?.content?.trim();
    if (!reply) return NextResponse.json({ error: "Empty response" }, { status: 502 });
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("[Groq]", error?.message);
    return NextResponse.json({ error: `AI error: ${error?.message}` }, { status: 503 });
  }
}