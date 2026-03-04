import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
        e != null &&
        typeof e === "object" &&
        "submittedAt" in e &&
        "essayBody" in e &&
        "grade" in e &&
        "feedbackText" in e
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

type Props = { params: Promise<{ attemptId: string }> };

export default async function Part1ExampleDetailPage({ params }: Props) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const { attemptId } = await params;
  const attempt = await prisma.attempt.findFirst({
    where: {
      id: attemptId,
      userId,
      part: 1,
      section: null,
    },
  });

  if (!attempt) redirect("/practice/part1/examples");
  if (!attempt.lastFeedbackAt && !attempt.feedbackHistory) {
    redirect("/practice/part1/examples");
  }

  const topicTitle = getTopicTitle(attempt.promptText);
  const history = parseHistory(attempt.feedbackHistory);

  const iterations: HistoryEntry[] =
    history.length > 0
      ? history
      : attempt.lastFeedbackAt && attempt.essayBody != null
        ? [
            {
              submittedAt: attempt.lastFeedbackAt.toISOString(),
              essayBody: attempt.essayBody,
              grade: attempt.lastFeedbackGrade ?? 0,
              feedbackText: attempt.lastFeedbackText ?? "",
              languageErrors: attempt.lastFeedbackLanguageErrors
                ? (JSON.parse(attempt.lastFeedbackLanguageErrors) as HistoryEntry["languageErrors"])
                : undefined,
            },
          ]
        : [];

  const rewriteParts = parseRewriteParts(attempt.lastRewriteParts);

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 px-4 py-3">
        <Link href="/practice/part1/examples" className="text-sm text-blue-600 hover:underline">
          ← Previous examples
        </Link>
      </header>
      <main className="p-4 max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-neutral-900 mb-1">{topicTitle}</h1>
        <p className="text-neutral-500 text-sm mb-6">
          Walk-through: your submitted text at each step and the suggested essay.
        </p>

        {iterations.map((entry, i) => (
          <section
            key={i}
            className="rounded-xl border border-neutral-200 bg-white p-5 mb-6"
          >
            <h2 className="text-base font-semibold text-neutral-900 mb-2">
              Iteration {i + 1}
              <span className="text-sm font-normal text-neutral-500 ml-2">
                {new Date(entry.submittedAt).toLocaleString()}
              </span>
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">
                  Your text
                </p>
                <div className="text-neutral-800 text-sm leading-relaxed whitespace-pre-wrap bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                  {entry.essayBody || "(No text)"}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">
                  Grade: {entry.grade} / 6
                </p>
                <div className="text-neutral-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {entry.feedbackText}
                </div>
              </div>
              {entry.languageErrors && entry.languageErrors.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">
                    Language, grammar & spelling
                  </p>
                  <ul className="space-y-1 text-sm">
                    {entry.languageErrors.map((err, j) => (
                      <li key={j} className="text-neutral-600">
                        <span className="line-through text-neutral-500">{err.original}</span>
                        {" → "}
                        <span className="font-medium text-neutral-800">{err.correction}</span>
                        {err.note && <span className="text-neutral-500 text-xs ml-1">({err.note})</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        ))}

        {rewriteParts.length > 0 && (
          <section className="rounded-xl border border-blue-200 bg-blue-50/30 p-5 mb-6">
            <h2 className="text-base font-semibold text-neutral-900 mb-2">Suggested essay</h2>
            {attempt.lastRewriteGrade != null && (
              <p className="text-sm text-neutral-600 mb-3">
                Grade: {attempt.lastRewriteGrade} / 6
                {attempt.lastRewriteReason && (
                  <span className="block mt-1 text-neutral-600 font-normal">{attempt.lastRewriteReason}</span>
                )}
              </p>
            )}
            <div className="space-y-4">
              {rewriteParts.map((part, i) => (
                <div key={i}>
                  <span
                    className="block text-xs font-bold uppercase tracking-widest text-blue-800 bg-blue-100 py-1.5 px-3 rounded border border-blue-200 w-fit mb-1"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    {part.label}
                  </span>
                  <div className="text-neutral-800 text-sm leading-relaxed whitespace-pre-wrap">
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
