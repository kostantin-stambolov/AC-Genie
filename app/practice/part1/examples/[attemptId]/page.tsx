import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NavHeader } from "@/components/NavHeader";
import { Sparkles } from "@/components/icons";
import { resolveStoredPrompt } from "@/lib/essay-prompts";

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
  return resolveStoredPrompt(promptText)?.title ?? "Есе";
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
  if (total >= 15) return "bg-indigo-100 text-indigo-800 ring-indigo-200";
  if (total >= 12) return "bg-yellow-100 text-yellow-800 ring-yellow-200";
  return "bg-orange-100 text-orange-800 ring-orange-200";
}

function avgToDisplay(avg: number): string {
  return Number.isInteger(avg) ? String(avg) : avg.toFixed(1);
}

function SubScoreBars({ examiner1, examiner2 }: { examiner1: ExaminerScore; examiner2: ExaminerScore }) {
  const bars = [
    { label: "Идея и съдържание", avg: (examiner1.ideaContent + examiner2.ideaContent) / 2, max: 10, color: "bg-indigo-500" },
    { label: "Структура",         avg: (examiner1.structure   + examiner2.structure)   / 2, max: 4,  color: "bg-sky-400" },
    { label: "Език",              avg: (examiner1.language    + examiner2.language)    / 2, max: 6,  color: "bg-emerald-400" },
  ];
  return (
    <div className="space-y-2 mt-3">
      {bars.map((b) => (
        <div key={b.label}>
          <div className="flex justify-between items-baseline mb-0.5">
            <span className="text-[11px] font-medium text-[#6B7280]">{b.label}</span>
            <span className="text-[11px] text-[#9CA3AF]">{avgToDisplay(b.avg)} / {b.max}</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
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
    <div className="min-h-screen bg-[#F0F2F5]">
      <NavHeader backHref="/practice/part1/examples" backLabel="Опити" />
      <main className="max-w-2xl mx-auto px-4 py-10">

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[12px] font-bold text-indigo-500 uppercase tracking-widest">История на есето</p>
            {isV2Attempt ? (
              <span className="text-[12px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full px-2 py-0.5">Насочено обучение</span>
            ) : (
              <span className="text-[12px] font-semibold bg-[#F3F4F6] text-[#6B7280] rounded-full px-2 py-0.5">Бързо упражнение</span>
            )}
          </div>
          <h1 className="text-[22px] font-semibold text-[#111827] leading-snug tracking-tight">{topicTitle}</h1>
          <p className="text-[#6B7280] text-[15px] mt-1">
            Изпратените ти черновики и обратна връзка за всеки кръг.
          </p>
        </div>

        {/* Time breakdown for v2 */}
        {isV2Attempt && phaseTimings && (
          <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] px-5 py-4 mb-5">
            <p className="text-[12px] font-bold text-indigo-500 uppercase tracking-widest mb-3">Времеразпределение</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "comprehension", label: "Разбиране на темата" },
                { key: "outline",       label: "Планиране" },
                { key: "writing",       label: "Писане" },
                { key: "review",        label: "Самопроверка" },
                { key: "revision",      label: "Редакция" },
              ].map(({ key, label }) => (
                phaseTimings[key] ? (
                  <div key={key} className="flex items-center justify-between bg-[#F9FAFB] rounded-xl px-3 py-2">
                    <span className="text-[15px] text-[#6B7280]">{label}</span>
                    <span className="text-[13px] font-bold text-[#111827]">{formatSeconds(phaseTimings[key]?.seconds)}</span>
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
              <section key={i} className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6 mb-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h2 className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-widest">Черновик {i + 1}</h2>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-[13px] font-semibold rounded-full px-2.5 py-0.5 ring-1 ${gs}`}>
                      {v2.finalScore} / 20
                    </span>
                    <span className="text-[13px] text-[#9CA3AF]">
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
                    <p className="text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-1">Частични оценки (средно)</p>
                    <SubScoreBars examiner1={v2.scoreBreakdown.examiner1} examiner2={v2.scoreBreakdown.examiner2} />
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2">Твоят текст</p>
                  <div className="text-[#6B7280] text-[15px] leading-relaxed whitespace-pre-wrap bg-[#F9FAFB] rounded-2xl p-4">
                    {v2.essayBody || "(Няма текст)"}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2">Обратна връзка</p>
                  <div className="text-[#6B7280] text-[15px] leading-relaxed whitespace-pre-wrap">
                    {v2.feedbackText}
                  </div>
                </div>

                {v2.languageErrors && v2.languageErrors.length > 0 && (
                  <div className="border-t border-amber-100 pt-4">
                    <p className="text-[12px] font-semibold text-amber-700 uppercase tracking-widest mb-2">Езикови корекции</p>
                    <ul className="space-y-2">
                      {v2.languageErrors.map((err, j) => (
                        <li key={j} className="text-[15px] flex flex-wrap items-center gap-1.5">
                          <span className="inline-block rounded-full px-2 py-0.5 text-[12px] font-semibold bg-amber-100 text-amber-800 uppercase">
                            {err.type.replace(/_/g, " ")}
                          </span>
                          <span className="line-through text-[#9CA3AF]">{err.original}</span>
                          <span className="text-[#E5E7EB] text-[15px] font-light">›</span>
                          <span className="font-semibold text-[#111827]">{err.correction}</span>
                          {err.note && <span className="text-[#9CA3AF] text-[13px] ml-1">({err.note})</span>}
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
            <section key={i} className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6 mb-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-widest">Черновик {i + 1}</h2>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[13px] font-semibold rounded-full px-2.5 py-0.5 ring-1 bg-[#F3F4F6] text-[#6B7280] ring-[#E5E7EB]">
                    Оценка {v1.grade}/6 (стара система)
                  </span>
                  <span className="text-[13px] text-[#9CA3AF]">
                    {new Date(v1.submittedAt).toLocaleString(undefined, {
                      month: "short", day: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2">Твоят текст</p>
                <div className="text-[#6B7280] text-[15px] leading-relaxed whitespace-pre-wrap bg-[#F9FAFB] rounded-2xl p-4">
                  {v1.essayBody || "(Няма текст)"}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2">Обратна връзка</p>
                <div className="text-[#6B7280] text-[15px] leading-relaxed whitespace-pre-wrap">
                  {v1.feedbackText}
                </div>
              </div>

              {v1.languageErrors && v1.languageErrors.length > 0 && (
                <div className="border-t border-amber-100 pt-4">
                  <p className="text-[12px] font-semibold text-amber-700 uppercase tracking-widest mb-2">Езикови корекции</p>
                  <ul className="space-y-2">
                    {v1.languageErrors.map((err, j) => (
                      <li key={j} className="text-[15px] flex flex-wrap items-center gap-1.5">
                        <span className="inline-block rounded-full px-2 py-0.5 text-[12px] font-semibold bg-amber-100 text-amber-800 uppercase">
                          {err.type.replace(/_/g, " ")}
                        </span>
                        <span className="line-through text-[#9CA3AF]">{err.original}</span>
                        <span className="text-[#E5E7EB] text-[15px] font-light">›</span>
                        <span className="font-semibold text-[#111827]">{err.correction}</span>
                        {err.note && <span className="text-[#9CA3AF] text-[13px] ml-1">({err.note})</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          );
        })}

        {rewriteParts.length > 0 && (
          <section className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-indigo-500" />
              <h2 className="text-[12px] font-bold text-indigo-600 uppercase tracking-widest">Примерно есе</h2>
            </div>
            {attempt.lastRewriteGrade != null && (
              <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold ring-1 mb-5 ${rewriteScoreStyle(attempt.lastRewriteGrade)}`}>
                Оценка: {attempt.lastRewriteGrade} / 20
                {attempt.lastRewriteReason && (
                  <span className="font-normal opacity-80 ml-1">{attempt.lastRewriteReason}</span>
                )}
              </div>
            )}
            <div className="space-y-5">
              {rewriteParts.map((part, i) => (
                <div key={i}>
                  <span className="inline-block text-[12px] font-bold uppercase tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-xl py-1 px-3 mb-2">
                    {part.label}
                  </span>
                  <div className="text-[#6B7280] text-[15px] leading-relaxed whitespace-pre-wrap">
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
