import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NavHeader } from "@/components/NavHeader";
import { Sparkles } from "@/components/icons";

type LanguageError = { type: string; original: string; correction: string; note?: string };

type ExaminerScore = {
  ideaContent: number;
  structure: number;
  language: number;
  total: number;
  notes?: string;
};

type ScoreBreakdown = {
  examiner1: ExaminerScore;
  examiner2: ExaminerScore;
  finalScore: number;
  arbitrated: boolean;
};

type HistoryEntryV2 = {
  version: 2;
  submittedAt: string;
  essayBody: string;
  finalScore: number;
  scoreBreakdown: ScoreBreakdown;
  feedbackText: string;
  languageErrors?: LanguageError[];
};

type HistoryEntryV1 = {
  version?: 1;
  submittedAt: string;
  essayBody: string;
  grade: number;
  feedbackText: string;
  languageErrors?: LanguageError[];
};

type HistoryEntry = HistoryEntryV1 | HistoryEntryV2;

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
        "submittedAt" in e && "essayBody" in e && "feedbackText" in e
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

function finalScoreStyle(score: number): string {
  if (score >= 16) return "bg-emerald-100 text-emerald-800 ring-emerald-200";
  if (score >= 12) return "bg-amber-100 text-amber-800 ring-amber-200";
  if (score >= 8)  return "bg-orange-100 text-orange-800 ring-orange-200";
  return "bg-red-100 text-red-800 ring-red-200";
}

function rewriteScoreStyle(total: number): string {
  if (total >= 18) return "bg-emerald-100 text-emerald-800 ring-emerald-200";
  if (total >= 15) return "bg-blue-100 text-blue-800 ring-blue-200";
  if (total >= 12) return "bg-yellow-100 text-yellow-800 ring-yellow-200";
  return "bg-orange-100 text-orange-800 ring-orange-200";
}

function avgToDisplay(avg: number): string {
  return Number.isInteger(avg) ? String(avg) : avg.toFixed(1);
}

function SubScoreBars({ examiner1, examiner2 }: { examiner1: ExaminerScore; examiner2: ExaminerScore }) {
  const bars = [
    { label: "Idea & Content", avg: (examiner1.ideaContent + examiner2.ideaContent) / 2, max: 10, color: "bg-violet-400" },
    { label: "Structure",      avg: (examiner1.structure   + examiner2.structure)   / 2, max: 4,  color: "bg-blue-400" },
    { label: "Language",       avg: (examiner1.language    + examiner2.language)    / 2, max: 6,  color: "bg-teal-400" },
  ];
  return (
    <div className="space-y-2 mt-3">
      {bars.map((b) => (
        <div key={b.label}>
          <div className="flex justify-between items-baseline mb-0.5">
            <span className="text-[11px] font-medium text-neutral-500">{b.label}</span>
            <span className="text-[11px] text-neutral-400">{avgToDisplay(b.avg)} / {b.max}</span>
          </div>
          <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
            <div className={`h-full rounded-full ${b.color}`} style={{ width: `${(b.avg / b.max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

type PhaseTimings = Record<string, { startedAt?: string; completedAt?: string; seconds?: number }>;

function formatSeconds(s?: number): string {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m === 0) return `${sec}s`;
  return sec === 0 ? `${m} min` : `${m} min ${sec}s`;
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
  const isV2Attempt = attempt.coachingMode === "v2";
  let phaseTimings: PhaseTimings | null = null;
  try {
    if (attempt.phaseTimings) phaseTimings = JSON.parse(attempt.phaseTimings) as PhaseTimings;
  } catch { /* ignore */ }

  const iterations: HistoryEntry[] =
    history.length > 0
      ? history
      : attempt.lastFeedbackAt && attempt.essayBody != null
        ? [{
            version: 1 as const,
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
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs font-semibold text-violet-500 uppercase tracking-wider">Essay history</p>
            {isV2Attempt ? (
              <span className="text-[10px] font-bold uppercase tracking-widest bg-violet-100 text-violet-700 border border-violet-200 rounded-full px-2 py-0.5">🧭 Guided Coaching</span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-widest bg-neutral-100 text-neutral-500 rounded-full px-2 py-0.5">⚡ Quick Practice</span>
            )}
          </div>
          <h1 className="text-xl font-bold text-neutral-900 leading-snug">{topicTitle}</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Your submitted drafts and feedback for each round.
          </p>
        </div>

        {/* Time breakdown for v2 */}
        {isV2Attempt && phaseTimings && (
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm px-5 py-4 mb-5">
            <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-3">Time breakdown</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "comprehension", label: "Understanding prompt" },
                { key: "outline",       label: "Outlining" },
                { key: "writing",       label: "Writing" },
                { key: "review",        label: "Self-review" },
                { key: "revision",      label: "Revision" },
              ].map(({ key, label }) => (
                phaseTimings[key] ? (
                  <div key={key} className="flex items-center justify-between bg-neutral-50 rounded-xl px-3 py-2">
                    <span className="text-xs text-neutral-600">{label}</span>
                    <span className="text-xs font-bold text-neutral-700">{formatSeconds(phaseTimings[key]?.seconds)}</span>
                  </div>
                ) : null
              ))}
            </div>
          </div>
        )}

        {iterations.map((entry, i) => {
          const isV2 = (entry as HistoryEntryV2).version === 2;

          if (isV2) {
            const v2 = entry as HistoryEntryV2;
            const gs = finalScoreStyle(v2.finalScore);
            return (
              <section key={i} className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 mb-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h2 className="text-sm font-bold text-neutral-700 uppercase tracking-wider">Draft {i + 1}</h2>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-0.5 ring-1 ${gs}`}>
                      {v2.finalScore} / 20
                    </span>
                    <span className="text-xs text-neutral-400">
                      {new Date(v2.submittedAt).toLocaleString(undefined, {
                        month: "short", day: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* Sub-score bars */}
                {v2.scoreBreakdown?.examiner1 && v2.scoreBreakdown?.examiner2 && (
                  <div className="mb-4">
                    <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">Sub-scores (averaged)</p>
                    <SubScoreBars examiner1={v2.scoreBreakdown.examiner1} examiner2={v2.scoreBreakdown.examiner2} />
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Your text</p>
                  <div className="text-neutral-700 text-sm leading-relaxed whitespace-pre-wrap bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                    {v2.essayBody || "(No text)"}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Feedback</p>
                  <div className="text-neutral-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {v2.feedbackText}
                  </div>
                </div>

                {v2.languageErrors && v2.languageErrors.length > 0 && (
                  <div className="border-t border-amber-100 pt-4">
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">Language corrections</p>
                    <ul className="space-y-2">
                      {v2.languageErrors.map((err, j) => (
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
          }

          // Version 1 (old scoring): show with legacy label
          const v1 = entry as HistoryEntryV1;
          return (
            <section key={i} className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 mb-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-sm font-bold text-neutral-700 uppercase tracking-wider">Draft {i + 1}</h2>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-0.5 ring-1 bg-neutral-100 text-neutral-600 ring-neutral-200">
                    Grade {v1.grade}/6 (old scoring)
                  </span>
                  <span className="text-xs text-neutral-400">
                    {new Date(v1.submittedAt).toLocaleString(undefined, {
                      month: "short", day: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Your text</p>
                <div className="text-neutral-700 text-sm leading-relaxed whitespace-pre-wrap bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                  {v1.essayBody || "(No text)"}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Feedback</p>
                <div className="text-neutral-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {v1.feedbackText}
                </div>
              </div>

              {v1.languageErrors && v1.languageErrors.length > 0 && (
                <div className="border-t border-amber-100 pt-4">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">Language corrections</p>
                  <ul className="space-y-2">
                    {v1.languageErrors.map((err, j) => (
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
              <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 mb-5 ${rewriteScoreStyle(attempt.lastRewriteGrade)}`}>
                Score: {attempt.lastRewriteGrade} / 20
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
