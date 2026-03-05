import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NavHeader } from "@/components/NavHeader";
import { AlertCircle } from "@/components/icons";
import { MarkCompleteLink } from "./MarkCompleteLink";
import { FeedbackActions } from "./FeedbackActions";

type Props = { searchParams: Promise<{ attemptId?: string }> };

const GRADE_STYLES: Record<number, { bg: string; text: string; ring: string; label: string }> = {
  2: { bg: "bg-red-50",     text: "text-red-700",     ring: "ring-red-200",     label: "Needs work" },
  3: { bg: "bg-orange-50",  text: "text-orange-700",   ring: "ring-orange-200",  label: "Below average" },
  4: { bg: "bg-yellow-50",  text: "text-yellow-700",   ring: "ring-yellow-200",  label: "Average" },
  5: { bg: "bg-blue-50",    text: "text-blue-700",     ring: "ring-blue-200",    label: "Good" },
  6: { bg: "bg-emerald-50", text: "text-emerald-700",  ring: "ring-emerald-200", label: "Excellent" },
};

export default async function Part1FeedbackPage({ searchParams }: Props) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const { attemptId } = await searchParams;
  if (!attemptId) redirect("/home");

  const attempt = await prisma.attempt.findFirst({
    where: { id: attemptId, userId, part: 1, section: null, status: "in_progress" },
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

  const gs = GRADE_STYLES[grade] ?? GRADE_STYLES[4];

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <NavHeader backHref="/home" backLabel="Home" title="Feedback" />
      <main className="max-w-2xl mx-auto px-4 py-10">

        {/* Grade hero */}
        <div className={`rounded-2xl ${gs.bg} ring-1 ${gs.ring} p-6 mb-6 flex items-center gap-5`}>
          <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 ring-2 ${gs.ring} bg-white`}>
            <span className={`text-3xl font-bold ${gs.text}`}>{grade}</span>
            <span className="text-xs text-neutral-400 font-medium">/ 6</span>
          </div>
          <div>
            <p className={`text-base font-bold ${gs.text}`}>{gs.label}</p>
            <p className="text-sm text-neutral-600 mt-0.5">Read your feedback below, then decide what to do next.</p>
          </div>
        </div>

        {/* Feedback text */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 mb-6">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Feedback</p>
          <div className="text-neutral-700 text-[15px] leading-relaxed whitespace-pre-wrap">
            {feedback}
          </div>
        </div>

        {/* Language errors */}
        {languageErrors.length > 0 && (
          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={15} className="text-amber-600 shrink-0" />
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Language, grammar & spelling</p>
            </div>
            <p className="text-sm text-neutral-500 mb-4">
              These errors affected your grade. Correct them in your next attempt.
            </p>
            <ul className="space-y-3">
              {languageErrors.map((err, i) => (
                <li key={i} className="flex flex-col gap-1">
                  <span className="inline-flex w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide bg-amber-100 text-amber-800">
                    {err.type.replace(/_/g, " ")}
                  </span>
                  <div className="text-sm text-neutral-700 flex flex-wrap items-center gap-1.5">
                    <span className="line-through text-neutral-400">{err.original}</span>
                    <span className="text-neutral-300 text-base font-light">›</span>
                    <span className="font-semibold text-neutral-800">{err.correction}</span>
                  </div>
                  {err.note && <span className="text-neutral-400 text-xs">{err.note}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <FeedbackActions attemptId={attemptId} />

        <p className="mt-6 text-center text-sm text-neutral-400">
          <MarkCompleteLink attemptId={attemptId} />
        </p>
      </main>
    </div>
  );
}
