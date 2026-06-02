import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const SUPABASE_URL = "https://cuflhkleiibaqljppnpn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1Zmxoa2xlaWliYXFsanBwbnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNTM5MDUsImV4cCI6MjA5NTcyOTkwNX0._FLxf55eZH7InP-TvM3Vn4H99U6PjeBBmyj-jM3L3Y0";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { language, participant, messageCount, ratingsFlat, openAnswersFlat } = body;

    const [
      s2_q1, s2_q2, s2_q3, s2_q4, s2_q5, s2_q6, s2_q7, s2_q8, s2_q9, s2_q10,
      s3_q1, s3_q2, s3_q3, s3_q4, s3_q5, s3_q6, s3_q7, s3_q8, s3_q9, s3_q10,
      s4_q1, s4_q2, s4_q3, s4_q4, s4_q5, s4_q6, s4_q7, s4_q8, s4_q9, s4_q10,
      s5_q1, s5_q2, s5_q3, s5_q4, s5_q5, s5_q6, s5_q7, s5_q8, s5_q9, s5_q10,
    ] = ratingsFlat;

    const [open_q1, open_q2, open_q3, open_q4, open_q5] = openAnswersFlat;

    const row = {
      language,
      first_name: participant.firstName,
      last_name: participant.lastName,
      occupation: participant.occupation,
      age: participant.age,
      gender: participant.gender,
      message_count: messageCount,
      s2_q1, s2_q2, s2_q3, s2_q4, s2_q5, s2_q6, s2_q7, s2_q8, s2_q9, s2_q10,
      s3_q1, s3_q2, s3_q3, s3_q4, s3_q5, s3_q6, s3_q7, s3_q8, s3_q9, s3_q10,
      s4_q1, s4_q2, s4_q3, s4_q4, s4_q5, s4_q6, s4_q7, s4_q8, s4_q9, s4_q10,
      s5_q1, s5_q2, s5_q3, s5_q4, s5_q5, s5_q6, s5_q7, s5_q8, s5_q9, s5_q10,
      open_q1, open_q2, open_q3, open_q4, open_q5,
    };

    console.log("[Supabase] Saving row:", JSON.stringify(row));

    const res = await fetch(`${SUPABASE_URL}/rest/v1/responses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify(row),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[Supabase] Error:", err);
      return NextResponse.json({ error: err }, { status: res.status });
    }

    console.log("[Supabase] Saved successfully!");
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[Supabase] Exception:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}