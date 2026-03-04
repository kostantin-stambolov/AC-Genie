import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB (Whisper limit)

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("audio");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No audio file" }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large (max 25 MB)" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[transcribe] OPENAI_API_KEY is not set at runtime. Add it in Railway Variables and redeploy.");
    return NextResponse.json(
      { error: "Transcription not configured. Add OPENAI_API_KEY in Railway → Variables, then redeploy the service so the app loads the new variable." },
      { status: 503 }
    );
  }

  try {
    const form = new FormData();
    form.append("file", file, file.name || "audio.webm");
    form.append("model", "whisper-1");

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = (data as { error?: { message?: string } })?.error?.message || res.statusText;
      return NextResponse.json({ error: err }, { status: res.status });
    }
    const text = (data as { text?: string })?.text ?? "";
    return NextResponse.json({ text });
  } catch (e) {
    console.error("Transcribe error:", e);
    return NextResponse.json(
      { error: "Transcription failed." },
      { status: 500 }
    );
  }
}
