import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  buildEssayFeedbackSystemPrompt,
  buildEssayFeedbackUserPrompt,
  type LanguageErrorItem,
} from "@/lib/essay-feedback-prompt";

const VALID_TYPES: LanguageErrorItem["type"][] = [
  "spelling",
  "grammar",
  "punctuation",
  "word_choice",
  "style",
];

function normalizeLanguageErrors(raw: unknown): LanguageErrorItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => item && typeof item === "object")
    .map((item) => {
      const type = typeof item.type === "string" && VALID_TYPES.includes(item.type as LanguageErrorItem["type"])
        ? (item.type as LanguageErrorItem["type"])
        : "grammar";
      const original = typeof item.original === "string" ? item.original : "";
      const correction = typeof item.correction === "string" ? item.correction : "";
      const note = typeof item.note === "string" ? item.note : undefined;
      return { type, original, correction, note };
    })
    .filter((e) => e.original !== "" || e.correction !== "");
}

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

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { attemptId?: string; essayBody?: string };
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

    const essayBody =
      typeof body.essayBody === "string" ? body.essayBody : attempt.essayBody ?? "";

    await prisma.attempt.update({
      where: { id: attemptId },
      data: { essayBody },
    });

    const prompt = parsePrompt(attempt.promptText);
    const topicTitle = prompt?.title ?? "Essay";
    const topicInstruction = prompt?.instruction ?? "";
    const topicBody = prompt?.body ?? "";

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Feedback not configured. Set OPENAI_API_KEY." },
        { status: 503 }
      );
    }

    const systemPrompt = buildEssayFeedbackSystemPrompt();
    const userPrompt = buildEssayFeedbackUserPrompt(
      topicTitle,
      topicInstruction,
      topicBody,
      essayBody
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
        temperature: 0.3,
      }),
    });

    if (!completion.ok) {
      const err = await completion.json().catch(() => ({}));
      console.error("OpenAI error:", err);
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

    let grade: number;
    let feedback: string;
    let languageErrors: LanguageErrorItem[];

    try {
      const parsed = JSON.parse(rawContent) as {
        grade?: number;
        feedback?: string;
        languageErrors?: unknown;
        language_errors?: unknown;
      };
      grade = typeof parsed.grade === "number" ? Math.min(6, Math.max(2, Math.round(parsed.grade))) : 4;
      feedback = typeof parsed.feedback === "string" ? parsed.feedback : rawContent || "No feedback generated.";
      languageErrors = normalizeLanguageErrors(parsed.languageErrors ?? parsed.language_errors ?? []);
    } catch {
      grade = 4;
      feedback = rawContent || "Could not parse feedback. Please try again.";
      languageErrors = [];
    }

    const languageErrorsJson = JSON.stringify(languageErrors);
    const now = new Date();

    type HistoryEntry = {
      submittedAt: string;
      essayBody: string;
      grade: number;
      feedbackText: string;
      languageErrors: LanguageErrorItem[];
    };
    const newEntry: HistoryEntry = {
      submittedAt: now.toISOString(),
      essayBody,
      grade,
      feedbackText: feedback,
      languageErrors,
    };
    let history: HistoryEntry[] = [];
    if (attempt.feedbackHistory) {
      try {
        const parsed = JSON.parse(attempt.feedbackHistory) as unknown;
        if (Array.isArray(parsed)) history = parsed;
      } catch {
        history = [];
      }
    }
    history.push(newEntry);
    const feedbackHistoryJson = JSON.stringify(history);

    await prisma.attempt.update({
      where: { id: attemptId },
      data: {
        lastFeedbackGrade: grade,
        lastFeedbackText: feedback,
        lastFeedbackLanguageErrors: languageErrorsJson,
        lastFeedbackAt: now,
        feedbackHistory: feedbackHistoryJson,
      },
    });

    return NextResponse.json({ grade, feedback, languageErrors });
  } catch (err) {
    console.error("POST /api/essay/feedback error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
