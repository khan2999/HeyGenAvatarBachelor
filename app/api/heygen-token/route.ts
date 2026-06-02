import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  const apiKey = process.env.LIVEAVATAR_API_KEY || "60a7d965-1a6d-4909-8ba3-d5e2e2ffb2f4";
  const avatarId = process.env.LIVEAVATAR_AVATAR_ID || "64b526e4-741c-43b6-a918-4e40f3261c7a";

  try {
    // Step 1: Get session token
    const tokenRes = await fetch("https://api.liveavatar.com/v1/sessions/token", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-KEY": apiKey },
      body: JSON.stringify({
        avatar_id: avatarId,
        mode: "FULL",
        avatar_persona: {
          language: "en",
          context: "You are AURA, a friendly and professional AI avatar participating in a research study on human-AI interaction. Keep your responses short, warm and natural — 1 to 2 sentences only.",
        },
      }),
    });

    const data = await tokenRes.json();
    console.log("[LiveAvatar] Token response:", JSON.stringify(data));

    if (!tokenRes.ok) {
      return NextResponse.json({ error: `LiveAvatar error ${tokenRes.status}: ${JSON.stringify(data)}` }, { status: tokenRes.status });
    }

    const token = data?.data?.session_token;
    if (!token) {
      return NextResponse.json({ error: "No session_token in response: " + JSON.stringify(data) }, { status: 502 });
    }

    return NextResponse.json({ token });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }
}