import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MarkCompleteLink } from "./MarkCompleteLink";
import { FeedbackActions } from "./FeedbackActions";

type Props = { searchParams: Promise<{ attemptId?: string }> };

export default async function Part1FeedbackPage({ searchParams }: Props) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const { attemptId } = await searchParams;
  if (!attemptId) redirect("/home");

  const attempt = await prisma.attempt.findFirst({
    where: {
      id: attemptId,
      userId,
      part: 1,
      section: null,
      status: "in_progress",
    },
  });

  if (!attempt) redirect("/home");
  if (attempt.lastFeedbackGrade == null && !attempt.lastFeedbackText) {
    redirect(`/practice/part1?attemptId=${attemptId}`);
  }

  const grade = attempt.lastFeedbackGrade ?? 0;
  const feedback = attempt.lastFeedbackText ?? "";
  let languageErrors: Array<{ type: string; original: string; correction: string; note?: string }> = [];
  if (attempt.lastFeedbackLanguageErrors) {
    try {
      const parsed = JSON.parse(attempt.lastFeedbackLanguageErrors) as unknown;
      if (Array.isArray(parsed)) {
        languageErrors = parsed.filter(
          (e): e is { type: string; original: string; correction: string; note?: string } =>
            e && typeof e === "object" && "original" in e && "correction" in e
        );
      }
    } catch {
      languageErrors = [];
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 px-4 py-3">
        <Link href="/home" className="text-sm text-blue-600 hover:underline">
          ← Back to home
        </Link>
      </header>
      <main className="p-4 max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">
          Part 1 – Feedback
        </h1>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 mb-6">
          <p className="text-2xl font-semibold text-neutral-900 mb-4">
            Grade: {grade} <span className="text-base font-normal text-neutral-500">/ 6</span>
          </p>
          <div className="prose prose-sm max-w-none text-neutral-700 whitespace-pre-wrap">
            {feedback}
          </div>
        </div>

        {languageErrors.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-6 mb-6">
            <h2 className="text-base font-semibold text-neutral-900 mb-2">
              Language, grammar & spelling
            </h2>
            <p className="text-sm text-neutral-600 mb-4">
              The grade reflects these errors. Correct them to improve your score.
            </p>
            <ul className="space-y-3">
              {languageErrors.map((err, i) => (
                <li key={i} className="flex flex-col gap-1 text-sm">
                  <span className="inline-flex w-fit rounded px-2 py-0.5 text-xs font-medium uppercase tracking-wide bg-amber-200 text-amber-900">
                    {err.type.replace("_", " ")}
                  </span>
                  <span className="text-neutral-700">
                    <span className="line-through text-neutral-500">{err.original}</span>
                    {" → "}
                    <span className="font-medium text-neutral-800">{err.correction}</span>
                  </span>
                  {err.note && (
                    <span className="text-neutral-500 text-xs">{err.note}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <FeedbackActions attemptId={attemptId} />

        <p className="mt-6 text-center text-sm text-neutral-500">
          <MarkCompleteLink attemptId={attemptId} />
        </p>
      </main>
    </div>
  );
}
