import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  buildEssayFeedbackSystemPrompt,
  buildEssayFeedbackUserPrompt,
  type LanguageErrorItem,
  type ExaminerScore,
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

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(v)));
}

function normalizeExaminerScore(
  raw: Record<string, unknown> | undefined,
  fallback: ExaminerScore
): ExaminerScore {
  if (!raw || typeof raw !== "object") return fallback;
  const ideaContent = clamp(typeof raw.ideaContent === "number" ? raw.ideaContent : fallback.ideaContent, 0, 10);
  const structure = clamp(typeof raw.structure === "number" ? raw.structure : fallback.structure, 0, 4);
  const language = clamp(typeof raw.language === "number" ? raw.language : fallback.language, 0, 6);
  const total = ideaContent + structure + language;
  const notes = typeof raw.notes === "string" ? raw.notes : "";
  return { ideaContent, structure, language, total, notes };
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
        temperature: 0.5,
        response_format: { type: "json_object" },
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

    const fallbackExaminer: ExaminerScore = { ideaContent: 5, structure: 2, language: 3, total: 10, notes: "" };

    let examiner1: ExaminerScore;
    let examiner2: ExaminerScore;
    let finalScore: number;
    let arbitrated: boolean;
    let keyTakeaway: string;
    let feedback: string;
    let languageErrors: LanguageErrorItem[];

    try {
      const parsed = JSON.parse(rawContent) as {
        examiner1?: Record<string, unknown>;
        examiner2?: Record<string, unknown>;
        finalScore?: number;
        arbitrated?: boolean;
        keyTakeaway?: string;
        feedback?: string;
        languageErrors?: unknown;
        language_errors?: unknown;
      };

      examiner1 = normalizeExaminerScore(parsed.examiner1, fallbackExaminer);
      examiner2 = normalizeExaminerScore(parsed.examiner2, fallbackExaminer);

      // finalScore = average of both examiners, out of 20
      const diff = Math.abs(examiner1.total - examiner2.total);
      arbitrated = diff >= 4;
      finalScore = Math.round((examiner1.total + examiner2.total) / 2);

      keyTakeaway = typeof parsed.keyTakeaway === "string" && parsed.keyTakeaway.trim().length > 0
        ? parsed.keyTakeaway.trim()
        : "";
      feedback = typeof parsed.feedback === "string" && parsed.feedback.trim().length > 0
        ? parsed.feedback
        : "No feedback generated. Please try again.";
      languageErrors = normalizeLanguageErrors(parsed.languageErrors ?? parsed.language_errors ?? []);

      // Server-side variance enforcement: if examiners returned identical scores, nudge examiner2
      if (examiner1.total === examiner2.total) {
        const nudge = examiner2.ideaContent > 0 ? -1 : 1;
        examiner2 = {
          ...examiner2,
          ideaContent: clamp(examiner2.ideaContent + nudge, 0, 10),
          total: 0,
          notes: examiner2.notes,
        };
        examiner2.total = examiner2.ideaContent + examiner2.structure + examiner2.language;
        // Recompute after nudge
        const diff2 = Math.abs(examiner1.total - examiner2.total);
        arbitrated = diff2 >= 4;
        finalScore = Math.round((examiner1.total + examiner2.total) / 2);
      }
    } catch {
      examiner1 = fallbackExaminer;
      examiner2 = { ...fallbackExaminer, ideaContent: 4, total: 9, notes: "" };
      finalScore = Math.round((fallbackExaminer.total + 9) / 2);
      arbitrated = false;
      keyTakeaway = "";
      feedback = "Could not parse feedback. Please try again.";
      languageErrors = [];
    }

    const languageErrorsJson = JSON.stringify(languageErrors);
    const now = new Date();

    const scoreBreakdown = { examiner1, examiner2, finalScore, arbitrated, keyTakeaway };

    type HistoryEntryV2 = {
      version: 2;
      submittedAt: string;
      essayBody: string;
      finalScore: number;
      scoreBreakdown: typeof scoreBreakdown;
      feedbackText: string;
      languageErrors: LanguageErrorItem[];
    };

    type HistoryEntryV1 = {
      version?: 1;
      submittedAt: string;
      essayBody: string;
      grade: number;
      feedbackText: string;
      languageErrors?: LanguageErrorItem[];
    };

    type HistoryEntry = HistoryEntryV1 | HistoryEntryV2;

    const newEntry: HistoryEntryV2 = {
      version: 2,
      submittedAt: now.toISOString(),
      essayBody,
      finalScore,
      scoreBreakdown,
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
        lastFeedbackGrade: finalScore,
        lastFeedbackScoreBreakdown: JSON.stringify(scoreBreakdown),
        lastFeedbackText: feedback,
        lastFeedbackLanguageErrors: languageErrorsJson,
        lastFeedbackAt: now,
        feedbackHistory: feedbackHistoryJson,
      },
    });

    return NextResponse.json({ examiner1, examiner2, finalScore, arbitrated, keyTakeaway, feedback, languageErrors });
  } catch (err) {
    console.error("POST /api/essay/feedback error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
