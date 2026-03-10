import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  buildComprehensionCheckSystemPrompt,
  buildComprehensionCheckUserPrompt,
} from "@/lib/coaching-prompts";

function parsePrompt(promptText: string | null) {
  if (!promptText) return null;
  try {
    const p = JSON.parse(promptText) as { title?: string; instruction?: string; body?: string };
    return { title: p.title ?? "", body: p.body ?? "", instruction: p.instruction ?? "" };
  } catch { return null; }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: { attemptId?: string; q1?: string; q2?: string; q3?: string };
    try { body = await request.json(); }
    catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

    const { attemptId, q1, q2, q3 } = body ?? {};
    if (!attemptId) return NextResponse.json({ error: "Missing attemptId" }, { status: 400 });

    const attempt = await prisma.attempt.findFirst({ where: { id: attemptId, userId, part: 1 } });
    if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });

    const prompt = parsePrompt(attempt.promptText);
    if (!prompt) return NextResponse.json({ error: "No prompt loaded" }, { status: 422 });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "AI not configured" }, { status: 503 });

    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: buildComprehensionCheckSystemPrompt() },
          { role: "user", content: buildComprehensionCheckUserPrompt(
            prompt.title, prompt.body, prompt.instruction,
            q1 ?? "", q2 ?? "", q3 ?? ""
          )},
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
        promptUnderstood?: boolean;
        promptNote?: string;
        thesisSpecific?: boolean;
        thesisSuggestion?: string;
        exampleRelevant?: boolean;
        exampleNote?: string;
        encouragement?: string;
      };
      return NextResponse.json({
        promptUnderstood: result.promptUnderstood ?? true,
        promptNote: result.promptNote ?? "",
        thesisSpecific: result.thesisSpecific ?? true,
        thesisSuggestion: result.thesisSuggestion ?? "",
        exampleRelevant: result.exampleRelevant ?? true,
        exampleNote: result.exampleNote ?? "",
        encouragement: result.encouragement ?? "Keep going — you're on the right track!",
      });
    } catch {
      return NextResponse.json({ error: "Could not parse AI response" }, { status: 502 });
    }
  } catch (err) {
    console.error("POST /api/essay/comprehension-check error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
