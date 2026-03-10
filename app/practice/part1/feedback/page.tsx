import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NavHeader } from "@/components/NavHeader";
import { AlertCircle } from "@/components/icons";
import { MarkCompleteLink } from "./MarkCompleteLink";
import { FeedbackActions } from "./FeedbackActions";
import type { ExaminerScore } from "@/lib/essay-feedback-prompt";

type Props = { searchParams: Promise<{ attemptId?: string }> };

type ScoreBreakdown = {
  examiner1: ExaminerScore;
  examiner2: ExaminerScore;
  finalScore: number;
  arbitrated: boolean;
  keyTakeaway?: string;
};

function scoreColor(score: number, max: number): { chip: string; text: string; label: string } {
  const pct = score / max;
  if (pct >= 0.8)  return { chip: "bg-emerald-100 ring-1 ring-emerald-200", text: "text-emerald-700", label: "Силен" };
  if (pct >= 0.6)  return { chip: "bg-amber-100 ring-1 ring-amber-200",     text: "text-amber-700",   label: "Добър" };
  if (pct >= 0.4)  return { chip: "bg-orange-100 ring-1 ring-orange-200",   text: "text-orange-700",  label: "Развиващ се" };
  return               { chip: "bg-red-100 ring-1 ring-red-200",         text: "text-red-700",     label: "Нужна е работа" };
}

function finalScoreLabel(score: number): string {
  if (score >= 16) return "Силен — конкурентен за АКС";
  if (score >= 12) return "Добър — има какво да се подобри";
  if (score >= 8)  return "Развиващ се — нужна е сериозна работа";
  return "Под прага — продължавай да тренираш";
}

function parseScoreBreakdown(json: string | null): ScoreBreakdown | null {
  if (!json) return null;
  try { return JSON.parse(json) as ScoreBreakdown; } catch { return null; }
}

function safeFeedback(raw: string): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as { feedback?: string };
      if (typeof parsed.feedback === "string" && parsed.feedback.trim().length > 10) {
        return parsed.feedback.trim();
      }
    } catch { /* fall through */ }
    return "Feedback could not be displayed. Please resubmit your essay to generate new feedback.";
  }
  return trimmed;
}

function SubScoreBars({ e1, e2 }: { e1: ExaminerScore; e2: ExaminerScore }) {
  const bars = [
    { label: "Идея и съдържание", avg: (e1.ideaContent + e2.ideaContent) / 2, max: 10, fill: "bg-violet-500" },
    { label: "Структура",         avg: (e1.structure   + e2.structure)   / 2, max: 4,  fill: "bg-indigo-400" },
    { label: "Език",              avg: (e1.language    + e2.language)    / 2, max: 6,  fill: "bg-sky-400" },
  ];
  const fmt = (v: number) => Number.isInteger(v) ? String(v) : v.toFixed(1);
  return (
    <div className="space-y-3">
      {bars.map((b) => (
        <div key={b.label}>
          <div className="flex justify-between mb-1">
            <span className="text-xs font-medium text-neutral-500">{b.label}</span>
            <span className="text-xs font-semibold text-neutral-600">{fmt(b.avg)} / {b.max}</span>
          </div>
          <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
            <div className={`h-full rounded-full ${b.fill}`} style={{ width: `${(b.avg / b.max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

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

  const feedback = safeFeedback(attempt.lastFeedbackText ?? "");
  const breakdown = parseScoreBreakdown(attempt.lastFeedbackScoreBreakdown);
  const finalScore   = breakdown?.finalScore ?? attempt.lastFeedbackGrade ?? 0;
  const arbitrated   = breakdown?.arbitrated ?? false;
  const keyTakeaway  = breakdown?.keyTakeaway ?? "";
  const e1 = breakdown?.examiner1;
  const e2 = breakdown?.examiner2;

  let languageErrors: Array<{ type: string; original: string; correction: string; note?: string }> = [];
  if (attempt.lastFeedbackLanguageErrors) {
    try {
      const p = JSON.parse(attempt.lastFeedbackLanguageErrors) as unknown;
      if (Array.isArray(p)) {
        languageErrors = p.filter(
          (e): e is { type: string; original: string; correction: string; note?: string } =>
            e && typeof e === "object" && "original" in e && "correction" in e
        );
      }
    } catch { /* empty */ }
  }

  const sc = scoreColor(finalScore, 40);

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <NavHeader backHref="/home" backLabel="Начало" title="Обратна връзка" />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">

        {/* ── Score overview card ── */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="px-6 pt-5 pb-4 border-b border-neutral-100">
            <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-3">Твоят резултат</p>
            <div className="flex items-center gap-4">
              <div className={`rounded-2xl px-5 py-3 flex flex-col items-center shrink-0 ${sc.chip}`}>
              <span className={`text-4xl font-bold leading-none ${sc.text}`}>{finalScore}</span>
              <span className={`text-xs font-semibold mt-1 ${sc.text} opacity-60`}>/ 20</span>
              </div>
              <div>
                <p className="text-base font-bold text-neutral-900 leading-snug">{finalScoreLabel(finalScore)}</p>
                <p className="text-sm text-neutral-500 mt-0.5">Средна оценка на двама независими проверяващи (по 20 т.).</p>
                {arbitrated && (
                  <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                    <AlertCircle size={12} /> Приложен арбитраж
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sub-score bars */}
          {e1 && e2 && (
            <div className="px-6 py-4">
              <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-3">Частични оценки (средно)</p>
              <SubScoreBars e1={e1} e2={e2} />
            </div>
          )}
        </div>

        {/* ── Arbitration notice ── */}
        {arbitrated && (
          <div className="bg-amber-50 rounded-2xl border border-amber-200 px-5 py-4">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">Какво е арбитраж?</p>
            <p className="text-sm text-amber-800 leading-relaxed">
              Двамата проверяващи се различават с 4+ точки. На изпита това задейства трети проверяващ, чиято оценка
              се удвоява за крайния резултат. Постоянното представяне и по трите критерия е ключово за стабилен резултат.
            </p>
          </div>
        )}

        {/* ── Examiner cards ── */}
        {e1 && e2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {([{ label: "Examiner 1", e: e1 }, { label: "Examiner 2", e: e2 }] as const).map(({ label, e }) => {
              const c = scoreColor(e.total, 20);
              return (
                <div key={label} className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
                  <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-3">{label}</p>
                  <div className="space-y-2 mb-4">
                    {[
                      { name: "Идея и съдържание", val: e.ideaContent, max: 10 },
                      { name: "Структура",         val: e.structure,   max: 4  },
                      { name: "Език",              val: e.language,    max: 6  },
                    ].map((row) => (
                      <div key={row.name} className="flex justify-between items-center">
                        <span className="text-sm text-neutral-600">{row.name}</span>
                        <span className="text-sm font-semibold text-neutral-800">{row.val}<span className="text-neutral-400 font-normal">/{row.max}</span></span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-neutral-100 pt-3 flex justify-between items-center">
                    <span className="text-xs text-neutral-400 font-medium">Общо</span>
                    <span className={`text-xl font-bold ${c.text}`}>{e.total}<span className="text-sm font-normal text-neutral-400"> / 20</span></span>
                  </div>
                  {e.notes && (
                    <p className="mt-2.5 text-xs text-neutral-500 italic leading-relaxed border-t border-neutral-50 pt-2.5">{e.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Key takeaway ── */}
        {keyTakeaway && (
          <div className="bg-violet-50 rounded-2xl border border-violet-200 px-5 py-4 flex gap-3 items-start">
            <div className="shrink-0 w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center mt-0.5">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest mb-1">Най-важното за подобряване</p>
              <p className="text-sm font-semibold text-violet-900 leading-snug">{keyTakeaway}</p>
            </div>
          </div>
        )}

        {/* ── Feedback text ── */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm px-6 py-5">
          <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-4">Обратна връзка</p>
          <div className="space-y-4">
            {feedback.split(/\n\n+/).map((para, i) => (
              <p key={i} className="text-neutral-700 text-[15px] leading-relaxed">{para.trim()}</p>
            ))}
          </div>
        </div>

        {/* ── Language errors ── */}
        {languageErrors.length > 0 && (
          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm px-6 py-5">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={14} className="text-amber-500 shrink-0" />
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                Езикови и правописни грешки ({languageErrors.length})
              </p>
            </div>
            <p className="text-sm text-neutral-500 mb-5">
              Поправи ги в следващия черновик — всяка от тях влияе директно на оценката ти.
            </p>
            <ul className="space-y-3">
              {languageErrors.map((err, i) => {
                const typeStyles: Record<string, { badge: string; border: string }> = {
                  spelling:    { badge: "bg-red-100 text-red-700",    border: "border-red-100" },
                  grammar:     { badge: "bg-orange-100 text-orange-700", border: "border-orange-100" },
                  punctuation: { badge: "bg-blue-100 text-blue-700",  border: "border-blue-100" },
                  word_choice: { badge: "bg-violet-100 text-violet-700", border: "border-violet-100" },
                  style:       { badge: "bg-neutral-100 text-neutral-600", border: "border-neutral-100" },
                };
                const ts = typeStyles[err.type] ?? typeStyles.style;
                return (
                  <li key={i} className={`rounded-xl border ${ts.border} overflow-hidden`}>
                    {/* Header row */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-50 border-b border-neutral-100">
                      <span className={`text-[11px] font-bold uppercase tracking-widest rounded-full px-2.5 py-0.5 ${ts.badge}`}>
                        {err.type.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-neutral-400">Грешка {i + 1}</span>
                    </div>
                    {/* Before / After */}
                    <div className="grid grid-cols-2 divide-x divide-neutral-100">
                      <div className="px-4 py-3">
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Написал/а си</p>
                        <p className="text-sm font-medium text-red-600 line-through">{err.original}</p>
                      </div>
                      <div className="px-4 py-3">
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Трябва да бъде</p>
                        <p className="text-sm font-semibold text-emerald-700">{err.correction}</p>
                      </div>
                    </div>
                    {/* Explanation */}
                    {err.note && (
                      <div className="px-4 py-2.5 bg-neutral-50 border-t border-neutral-100 flex items-start gap-2">
                        <span className="text-neutral-400 text-xs mt-px shrink-0">💡</span>
                        <p className="text-xs text-neutral-600 leading-relaxed">{err.note}</p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* ── Actions ── */}
        <FeedbackActions attemptId={attemptId} />

        <p className="text-center text-sm text-neutral-400 pb-4">
          <MarkCompleteLink attemptId={attemptId} />
        </p>

      </main>
    </div>
  );
}
