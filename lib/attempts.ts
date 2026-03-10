import { prisma } from "./db";

export const PART_1 = 1; // Essay
export const PART_2 = 2; // Test
export const SECTION_NAMES: Record<number, string> = {
  1: "Section 1",
  2: "Section 2",
  3: "Section 3",
  4: "Section 4",
};
// Exam structure: Part 1 = Essay (section null). Part 2 = 4 sections (1-4).
export const PART_2_SECTIONS = [1, 2, 3, 4];

export type AttemptStatus = "in_progress" | "completed";

export async function getActiveAttempt(
  userId: string,
  part: number,
  section: number | null
) {
  return prisma.attempt.findFirst({
    where: { userId, part, section, status: "in_progress" },
    orderBy: { startedAt: "desc" },
  });
}

export async function getCompletedAttempts(
  userId: string,
  part: number,
  section: number | null
) {
  return prisma.attempt.findMany({
    where: { userId, part, section, status: "completed" },
    orderBy: { completedAt: "desc" },
    take: 20,
  });
}

export async function startAttempt(
  userId: string,
  part: number,
  section: number | null,
  promptText?: string | null,
  coachingMode?: "v1" | "v2"
) {
  const existing = await getActiveAttempt(userId, part, section);
  if (existing) return existing; // already in progress – reuse
  const mode = coachingMode ?? "v1";
  return prisma.attempt.create({
    data: {
      userId,
      part,
      section,
      status: "in_progress",
      ...(part === PART_1 && promptText != null && { promptText }),
      ...(part === PART_1 && { coachingMode: mode }),
      ...(part === PART_1 && mode === "v2" && { coachingPhase: "comprehension" }),
    },
  });
}

export async function completeAttempt(attemptId: string, userId: string) {
  return prisma.attempt.updateMany({
    where: { id: attemptId, userId },
    data: { status: "completed", completedAt: new Date() },
  });
}

export async function getHomeState(userId: string) {
  const [part1Active, part1Completed, part2Attempts] = await Promise.all([
    getActiveAttempt(userId, PART_1, null),
    prisma.attempt.findMany({
      where: { userId, part: PART_1, status: "completed" },
      orderBy: { completedAt: "desc" },
      take: 1,
    }),
    prisma.attempt.findMany({
      where: { userId, part: PART_2 },
      orderBy: [{ section: "asc" }, { startedAt: "desc" }],
    }),
  ]);

  const part2BySection: Record<
    number,
    { active: typeof part2Attempts[0] | null; completed: boolean }
  > = { 1: { active: null, completed: false }, 2: { active: null, completed: false }, 3: { active: null, completed: false }, 4: { active: null, completed: false } };

  for (const a of part2Attempts) {
    if (a.section == null) continue;
    if (!part2BySection[a.section]) part2BySection[a.section] = { active: null, completed: false };
    if (a.status === "in_progress") part2BySection[a.section].active = a;
    if (a.status === "completed") part2BySection[a.section].completed = true;
  }

  return {
    part1: {
      hasActive: !!part1Active,
      activeId: part1Active?.id ?? null,
      hasCompleted: part1Completed.length > 0,
      activeCoachingMode: part1Active?.coachingMode ?? "v1",
      activeCoachingPhase: part1Active?.coachingPhase ?? null,
    },
    part2: part2BySection,
  };
}
