import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  buildRewriteSystemPrompt,
  buildRewriteUserPrompt,
} from "@/lib/essay-rewrite-prompt";

function parsePrompt(promptText: string | null): {
  title: string;
  instruction: string;
  body: string;
} | null {
  if (!promptText) return null;
  try {
    const p = JSON.parse(promptText) as {
      title?: string;
      instruction?: string;
      body?: string;
    };
    return {
      title: p.title ?? "Essay",
      instruction: p.instruction ?? "",
      body: p.body ?? "",
    };
  } catch {
    return null;
  }
}

export type RewritePart = { label: string; text: string };

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { attemptId?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const attemptId = typeof body?.attemptId === "string" ? body.attemptId : "";
    if (!attemptId) {
      return NextResponse.json({ error: "Missing attemptId" }, { status: 400 });
    }

    const attempt = await prisma.attempt.findFirst({
      where: {
        id: attemptId,
        userId,
        part: 1,
        section: null,
        status: "in_progress",
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    const prompt = parsePrompt(attempt.promptText);
    const topicTitle = prompt?.title ?? "Essay";
    const topicInstruction = prompt?.instruction ?? "";
    const topicBody = prompt?.body ?? "";
    const studentDraft = attempt.essayBody ?? "";
    const feedback = attempt.lastFeedbackText ?? "";

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Rewrite not configured. Set OPENAI_API_KEY." },
        { status: 503 }
      );
    }

    const systemPrompt = buildRewriteSystemPrompt();
    const userPrompt = buildRewriteUserPrompt(
      topicTitle,
      topicInstruction,
      topicBody,
      studentDraft,
      feedback
    );

    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
      }),
    });

    if (!completion.ok) {
      const err = await completion.json().catch(() => ({}));
      return NextResponse.json(
        { error: (err as { error?: { message?: string } })?.error?.message ?? "AI request failed" },
        { status: 502 }
      );
    }

    const data = (await completion.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    let rawContent = data?.choices?.[0]?.message?.content?.trim() ?? "";
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) rawContent = jsonMatch[0];

    let parts: RewritePart[];
    let grade: number;
    let gradeReason: string;
    try {
      const parsed = JSON.parse(rawContent) as {
        parts?: Array<{ label?: string; text?: string }>;
        grade?: number;
        gradeReason?: string;
      };
      const raw = parsed?.parts;
      if (Array.isArray(raw) && raw.length > 0) {
        parts = raw.map((p) => ({
          label: typeof p.label === "string" ? p.label : "Section",
          text: typeof p.text === "string" ? p.text : "",
        }));
      } else {
        parts = [{ label: "Essay", text: rawContent || "Could not generate rewrite." }];
      }
      const g = parsed?.grade;
      grade = typeof g === "number" ? Math.min(6, Math.max(2, Math.round(g))) : 5;
      gradeReason = typeof parsed?.gradeReason === "string" ? parsed.gradeReason : "No explanation provided.";
    } catch {
      parts = [{ label: "Essay", text: rawContent || "Could not parse rewrite." }];
      grade = 5;
      gradeReason = "No explanation provided.";
    }

    const now = new Date();
    await prisma.attempt.update({
      where: { id: attemptId },
      data: {
        lastRewriteParts: JSON.stringify(parts),
        lastRewriteGrade: grade,
        lastRewriteReason: gradeReason,
        lastRewriteAt: now,
      },
    });

    return NextResponse.json({ parts, grade, gradeReason });
  } catch (err) {
    console.error("POST /api/essay/rewrite error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
