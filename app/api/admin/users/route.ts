import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminContext } from "@/lib/auth";

type SortKey =
  | "email"
  | "registeredAt"
  | "totalAttempts"
  | "completedAttempts"
  | "latestScore"
  | "bestScore";

type StudentRow = {
  id: string;
  email: string;
  registeredAt: string;
  totalAttempts: number;
  completedAttempts: number;
  latestScore: number | null;
  bestScore: number | null;
};

function toNumberOrNull(value: number | null | undefined): number | null {
  return typeof value === "number" ? value : null;
}

function compareNullableNumber(a: number | null, b: number | null): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return a - b;
}

export async function GET(request: NextRequest) {
  const admin = await getAdminContext();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const search = request.nextUrl.searchParams.get("search")?.trim().toLowerCase() ?? "";
  const sort = (request.nextUrl.searchParams.get("sort") ?? "registeredAt") as SortKey;
  const direction = request.nextUrl.searchParams.get("direction") === "asc" ? "asc" : "desc";

  const users = await prisma.user.findMany({
    where: search
      ? {
          email: {
            contains: search,
          },
        }
      : undefined,
    include: {
      attempts: {
        where: {
          part: 1,
        },
        orderBy: {
          startedAt: "desc",
        },
        select: {
          id: true,
          status: true,
          startedAt: true,
          completedAt: true,
          lastFeedbackGrade: true,
        },
      },
    },
  });

  const rows: StudentRow[] = users.map((user) => {
    const totalAttempts = user.attempts.length;
    const completedAttempts = user.attempts.filter((a) => a.status === "completed").length;
    const completedWithScore = user.attempts.filter(
      (a) => a.status === "completed" && typeof a.lastFeedbackGrade === "number"
    );
    const latestCompleted = [...completedWithScore].sort(
      (a, b) =>
        (b.completedAt?.getTime() ?? b.startedAt.getTime()) -
        (a.completedAt?.getTime() ?? a.startedAt.getTime())
    )[0];
    const latestScore = toNumberOrNull(latestCompleted?.lastFeedbackGrade);
    const bestScore =
      completedWithScore.length > 0
        ? Math.max(...completedWithScore.map((a) => a.lastFeedbackGrade ?? 0))
        : null;

    return {
      id: user.id,
      email: user.email,
      registeredAt: user.createdAt.toISOString(),
      totalAttempts,
      completedAttempts,
      latestScore,
      bestScore,
    };
  });

  rows.sort((a, b) => {
    let cmp = 0;
    if (sort === "email") cmp = a.email.localeCompare(b.email);
    if (sort === "registeredAt") cmp = new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime();
    if (sort === "totalAttempts") cmp = a.totalAttempts - b.totalAttempts;
    if (sort === "completedAttempts") cmp = a.completedAttempts - b.completedAttempts;
    if (sort === "latestScore") cmp = compareNullableNumber(a.latestScore, b.latestScore);
    if (sort === "bestScore") cmp = compareNullableNumber(a.bestScore, b.bestScore);
    return direction === "asc" ? cmp : -cmp;
  });

  const [totalUsers, totalCompletedEssays, completedLast7Days] = await Promise.all([
    prisma.user.count(),
    prisma.attempt.count({
      where: {
        part: 1,
        status: "completed",
      },
    }),
    prisma.attempt.count({
      where: {
        part: 1,
        status: "completed",
        completedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  const latestScores = rows.map((r) => r.latestScore).filter((score): score is number => score != null);
  const avgLatestScore =
    latestScores.length > 0
      ? Number((latestScores.reduce((acc, score) => acc + score, 0) / latestScores.length).toFixed(1))
      : null;

  return NextResponse.json({
    stats: {
      totalUsers,
      totalCompletedEssays,
      completedLast7Days,
      avgLatestScore,
    },
    users: rows,
  });
}
