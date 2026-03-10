import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  buildOutlineCheckSystemPrompt,
  buildOutlineCheckUserPrompt,
} from "@/lib/coaching-prompts";

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: { attemptId?: string; opening?: string; arg1?: string; arg2?: string; closing?: string };
    try { body = await request.json(); }
    catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

    const { attemptId, opening, arg1, arg2, closing } = body ?? {};
    if (!attemptId) return NextResponse.json({ error: "Missing attemptId" }, { status: 400 });

    const attempt = await prisma.attempt.findFirst({ where: { id: attemptId, userId, part: 1 } });
    if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });

    // Extract thesis from comprehensionData
    let thesis = "";
    try {
      if (attempt.comprehensionData) {
        const cd = JSON.parse(attempt.comprehensionData) as { q2?: string };
        thesis = cd.q2 ?? "";
      }
    } catch { /* use empty */ }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "AI not configured" }, { status: 503 });

    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: buildOutlineCheckSystemPrompt() },
          { role: "user", content: buildOutlineCheckUserPrompt(thesis, opening ?? "", arg1 ?? "", arg2 ?? "", closing ?? "") },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!completion.ok) {
      const err = await completion.json().catch(() => ({}));
      return NextResponse.json({ error: (err as {error?:{message?:string}})?.error?.message ?? "AI error" }, { status: 502 });
    }

    const data = (await completion.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const raw = data?.choices?.[0]?.message?.content?.trim() ?? "{}";

    try {
      const result = JSON.parse(raw) as {
        argumentsSupported?: boolean;
        argumentsDifferent?: boolean;
        suggestion?: string;
      };
      return NextResponse.json({
        argumentsSupported: result.argumentsSupported ?? true,
        argumentsDifferent: result.argumentsDifferent ?? true,
        suggestion: result.suggestion ?? "",
      });
    } catch {
      return NextResponse.json({ error: "Could not parse AI response" }, { status: 502 });
    }
  } catch (err) {
    console.error("POST /api/essay/outline-check error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
