import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NavHeader } from "@/components/NavHeader";
import { CoachingFlow } from "./CoachingFlow";
import { resolveStoredPrompt } from "@/lib/essay-prompts";

type Props = { searchParams: Promise<{ attemptId?: string }> };

function parseJson<T>(s: string | null): T | null {
  if (!s) return null;
  try { return JSON.parse(s) as T; } catch { return null; }
}

export default async function CoachPage({ searchParams }: Props) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const { attemptId } = await searchParams;
  if (!attemptId) redirect("/home");

  const attempt = await prisma.attempt.findFirst({
    where: { id: attemptId, userId, part: 1, coachingMode: "v2" },
  });
  if (!attempt) redirect("/home");
  if (attempt.status === "completed") redirect("/practice/part1/examples");

  const prompt = resolveStoredPrompt(attempt.promptText);
  if (!prompt) redirect("/home");

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <NavHeader backHref="/home" backLabel="Начало" title="Обучителна сесия" />
      <CoachingFlow
        attemptId={attemptId}
        initialPhase={(attempt.coachingPhase ?? "comprehension") as never}
        prompt={prompt}
        essayBody={attempt.essayBody ?? ""}
        comprehensionData={parseJson(attempt.comprehensionData)}
        outlineData={parseJson(attempt.outlineData)}
        selfReviewData={parseJson(attempt.selfReviewData)}
        phaseTimings={parseJson(attempt.phaseTimings)}
        existingFeedback={
          attempt.lastFeedbackScoreBreakdown
            ? {
                breakdown: parseJson(attempt.lastFeedbackScoreBreakdown),
                feedbackText: attempt.lastFeedbackText ?? "",
                languageErrors: parseJson(attempt.lastFeedbackLanguageErrors) ?? [],
              }
            : null
        }
      />
    </div>
  );
}
