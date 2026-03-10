import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

type CoachPhase = "comprehension" | "outline" | "writing" | "review" | "feedback" | "reflect" | "completed";

const LEGAL_TRANSITIONS: Record<CoachPhase, CoachPhase | null> = {
  comprehension: "outline",
  outline:       "writing",
  writing:       "review",
  review:        "feedback",
  feedback:      "reflect",
  reflect:       "completed",
  completed:     null,
};

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: {
      attemptId?: string;
      phase?: string;
      data?: Record<string, unknown>;
      timingSeconds?: number;
    };
    try { body = await request.json(); }
    catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

    const { attemptId, phase, data, timingSeconds } = body ?? {};
    if (!attemptId || !phase) {
      return NextResponse.json({ error: "Missing attemptId or phase" }, { status: 400 });
    }

    const attempt = await prisma.attempt.findFirst({
      where: { id: attemptId, userId, part: 1, coachingMode: "v2" },
    });
    if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });

    const current = (attempt.coachingPhase ?? "comprehension") as CoachPhase;
    const target = phase as CoachPhase;
    if (LEGAL_TRANSITIONS[current] !== target) {
      return NextResponse.json(
        { error: `Illegal transition: ${current} → ${target}` },
        { status: 422 }
      );
    }

    const updateData: Record<string, unknown> = { coachingPhase: target };

    // Save phase-specific data
    if (current === "comprehension" && data) updateData.comprehensionData = JSON.stringify(data);
    if (current === "outline"       && data) updateData.outlineData       = JSON.stringify(data);
    if (current === "review"        && data) updateData.selfReviewData    = JSON.stringify(data);
    if (current === "reflect"       && data?.reflection) {
      updateData.reflectionText = String(data.reflection);
    }

    // Update phase timings
    if (timingSeconds != null) {
      let timings: Record<string, unknown> = {};
      try { if (attempt.phaseTimings) timings = JSON.parse(attempt.phaseTimings) as Record<string, unknown>; }
      catch { /* ignore */ }
      const now = new Date().toISOString();
      timings[current] = { ...(timings[current] as object ?? {}), completedAt: now, seconds: timingSeconds };
      if (target !== "completed") {
        timings[target] = { startedAt: now };
      }
      updateData.phaseTimings = JSON.stringify(timings);
    }

    if (target === "completed") {
      updateData.status = "completed";
      updateData.completedAt = new Date();
    }

    await prisma.attempt.update({ where: { id: attemptId }, data: updateData });
    return NextResponse.json({ phase: target });
  } catch (err) {
    console.error("POST /api/essay/advance-phase error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
