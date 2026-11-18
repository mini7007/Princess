import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const memories = new Map<string, number[]>();

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const recent = (memories.get(ip) || []).filter((time) => now - time < 60_000);
  if (recent.length >= 3) {
    return NextResponse.json({ error: "Please wait a moment before sending another message." }, { status: 429 });
  }

  const body = await request.json().catch(() => null) as { message?: string; mood?: string } | null;
  const message = body?.message?.trim() || "";
  const mood = body?.mood?.trim().slice(0, 80) || null;
  if (message.length > 2000) {
    return NextResponse.json({ error: "Your message is too long." }, { status: 400 });
  }
  if (!message) {
    return NextResponse.json({ error: "Please write a little message first." }, { status: 400 });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Private message storage is not configured." }, { status: 503 });
  }

  const supabase = createClient(url, key);
  const { error } = await supabase.from("princess_day_messages").insert({
    message,
    mood,
    status: "unread",
  });
  if (error) {
    console.error("Princess Day message insert failed:", error.message);
    return NextResponse.json({ error: "We could not save your message." }, { status: 500 });
  }

  recent.push(now);
  memories.set(ip, recent);

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "Bacha's Little Kingdom <onboarding@resend.dev>",
        to: ["mohan5050390@gmail.com"],
        subject: "Your Princess left you a little message 👑",
        text: `${mood ? `Mood: ${mood}\n\n` : ""}${message}`,
      });
    } catch (error) {
      console.error("Princess Day email notification failed:", error);
    }
  }

  return NextResponse.json({ ok: true });
}
