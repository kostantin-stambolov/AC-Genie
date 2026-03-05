import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NavHeader } from "@/components/NavHeader";
import { Sparkles } from "@/components/icons";

type HistoryEntry = {
  submittedAt: string;
  essayBody: string;
  grade: number;
  feedbackText: string;
  languageErrors?: Array<{ type: string; original: string; correction: string; note?: string }>;
};

type RewritePart = { label: string; text: string };

function getTopicTitle(promptText: string | null): string {
  if (!promptText) return "Essay";
  try {
    const p = JSON.parse(promptText) as { title?: string };
    return typeof p.title === "string" ? p.title : "Essay";
  } catch {
    return "Essay";
  }
}

function parseHistory(feedbackHistory: string | null): HistoryEntry[] {
  if (!feedbackHistory) return [];
  try {
    const parsed = JSON.parse(feedbackHistory) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is HistoryEntry =>
        e != null && typeof e === "object" &&
        "submittedAt" in e && "essayBody" in e && "grade" in e && "feedbackText" in e
    );
  } catch {
    return [];
  }
}

function parseRewriteParts(json: string | null): RewritePart[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((e): e is RewritePart => e != null && typeof e === "object" && "label" in e && "text" in e)
      .map((e) => ({ label: String(e.label), text: String(e.text) }));
  } catch {
    return [];
  }
}

function gradeStyle(g: number) {
  if (g >= 6) return "bg-emerald-100 text-emerald-800 ring-emerald-200";
  if (g >= 5) return "bg-blue-100 text-blue-800 ring-blue-200";
  if (g >= 4) return "bg-yellow-100 text-yellow-800 ring-yellow-200";
  if (g >= 3) return "bg-orange-100 text-orange-800 ring-orange-200";
  return "bg-red-100 text-red-800 ring-red-200";
}

type Props = { params: Promise<{ attemptId: string }> };

export default async function Part1ExampleDetailPage({ params }: Props) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const { attemptId } = await params;
  const attempt = await prisma.attempt.findFirst({
    where: { id: attemptId, userId, part: 1, section: null },
  });

  if (!attempt) redirect("/practice/part1/examples");
  if (!attempt.lastFeedbackAt && !attempt.feedbackHistory) redirect("/practice/part1/examples");

  const topicTitle = getTopicTitle(attempt.promptText);
  const history = parseHistory(attempt.feedbackHistory);

  const iterations: HistoryEntry[] =
    history.length > 0
      ? history
      : attempt.lastFeedbackAt && attempt.essayBody != null
        ? [{
            submittedAt: attempt.lastFeedbackAt.toISOString(),
            essayBody: attempt.essayBody,
            grade: attempt.lastFeedbackGrade ?? 0,
            feedbackText: attempt.lastFeedbackText ?? "",
            languageErrors: attempt.lastFeedbackLanguageErrors
              ? (JSON.parse(attempt.lastFeedbackLanguageErrors) as HistoryEntry["languageErrors"])
              : undefined,
          }]
        : [];

  const rewriteParts = parseRewriteParts(attempt.lastRewriteParts);

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <NavHeader backHref="/practice/part1/examples" backLabel="Attempts" />
      <main className="max-w-2xl mx-auto px-4 py-10">

        <div className="mb-8">
          <p className="text-xs font-semibold text-violet-500 uppercase tracking-wider mb-1">Essay history</p>
          <h1 className="text-xl font-bold text-neutral-900 leading-snug">{topicTitle}</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Your submitted drafts and feedback for each round.
          </p>
        </div>

        {iterations.map((entry, i) => {
          const gs = gradeStyle(entry.grade);
          return (
            <section key={i} className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 mb-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-sm font-bold text-neutral-700 uppercase tracking-wider">Draft {i + 1}</h2>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-0.5 ring-1 ${gs}`}>
                    {entry.grade} / 6
                  </span>
                  <span className="text-xs text-neutral-400">
                    {new Date(entry.submittedAt).toLocaleString(undefined, {
                      month: "short", day: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Your text</p>
                <div className="text-neutral-700 text-sm leading-relaxed whitespace-pre-wrap bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                  {entry.essayBody || "(No text)"}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Feedback</p>
                <div className="text-neutral-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {entry.feedbackText}
                </div>
              </div>

              {entry.languageErrors && entry.languageErrors.length > 0 && (
                <div className="border-t border-amber-100 pt-4">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">Language corrections</p>
                  <ul className="space-y-2">
                    {entry.languageErrors.map((err, j) => (
                      <li key={j} className="text-sm flex flex-wrap items-center gap-1.5">
                        <span className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold bg-amber-100 text-amber-800 uppercase">
                          {err.type.replace(/_/g, " ")}
                        </span>
                        <span className="line-through text-neutral-400">{err.original}</span>
                        <span className="text-neutral-300 text-base font-light">›</span>
                        <span className="font-semibold text-neutral-800">{err.correction}</span>
                        {err.note && <span className="text-neutral-400 text-xs ml-1">({err.note})</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          );
        })}

        {rewriteParts.length > 0 && (
          <section className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-violet-500" />
              <h2 className="text-sm font-bold text-violet-800 uppercase tracking-wider">Model essay</h2>
            </div>
            {attempt.lastRewriteGrade != null && (
              <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 mb-5 ${gradeStyle(attempt.lastRewriteGrade)}`}>
                Grade: {attempt.lastRewriteGrade} / 6
                {attempt.lastRewriteReason && (
                  <span className="font-normal opacity-80 ml-1">{attempt.lastRewriteReason}</span>
                )}
              </div>
            )}
            <div className="space-y-5">
              {rewriteParts.map((part, i) => (
                <div key={i}>
                  <span
                    className="inline-block text-xs font-bold uppercase tracking-widest text-violet-700 bg-violet-50 border border-violet-200 rounded-lg py-1 px-3 mb-2"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    {part.label}
                  </span>
                  <div className="text-neutral-700 text-[15px] leading-relaxed whitespace-pre-wrap">
                    {part.text}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
