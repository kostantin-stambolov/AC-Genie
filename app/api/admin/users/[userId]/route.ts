import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminContext } from "@/lib/auth";

type Params = { params: Promise<{ userId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const admin = await getAdminContext();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, createdAt: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const attempts = await prisma.attempt.findMany({
    where: {
      userId,
      part: 1,
    },
    orderBy: {
      startedAt: "desc",
    },
    select: {
      id: true,
      status: true,
      promptText: true,
      coachingMode: true,
      coachingPhase: true,
      startedAt: true,
      completedAt: true,
      lastFeedbackGrade: true,
      lastFeedbackAt: true,
    },
  });

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    },
    attempts: attempts.map((attempt) => ({
      id: attempt.id,
      status: attempt.status,
      promptText: attempt.promptText,
      score: attempt.lastFeedbackGrade,
      coachingMode: attempt.coachingMode ?? "v1",
      coachingPhase: attempt.coachingPhase,
      startedAt: attempt.startedAt.toISOString(),
      completedAt: attempt.completedAt?.toISOString() ?? null,
      lastFeedbackAt: attempt.lastFeedbackAt?.toISOString() ?? null,
    })),
  });
}
