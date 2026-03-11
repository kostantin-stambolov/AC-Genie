"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "@/components/icons";
import {
  getWeakestDimension,
  DIMENSION_LABELS,
  DIMENSION_ANNOTATION_NOTES,
  type WeakestDimension,
} from "@/lib/coaching-utils";
import type { FeedbackData, ExaminerScore } from "../CoachingFlow";

type RewriteScore = { ideaContent: number; structure: number; language: number; total: number };
type RewritePart  = { label: string; text: string };
type RewriteData  = { parts: RewritePart[]; score: RewriteScore; scoreReason: string };

type Props = {
  attemptId: string;
  feedbackData: FeedbackData | null;
  advancing: boolean;
  onAdvance: () => Promise<void>;
};

// ── Score helpers ──────────────────────────────────────────────────────────────

function scoreColor(s: number) {
  if (s >= 16) return { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", label: "Конкурентна оценка" };
  if (s >= 12) return { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-800",   label: "Добра основа, има какво да се подобри" };
  if (s >= 8)  return { bg: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-800",  label: "Продължавай да тренираш" };
  return        { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-800",    label: "Фокусирай се първо върху основите" };
}

function SubBar({
  label, value, max, isWeakest,
}: { label: string; value: number; max: number; isWeakest: boolean }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className={`text-[13px] font-semibold ${isWeakest ? "text-red-600" : "text-[#6B7280]"}`}>
          {label}
          {isWeakest && (
            <span className="ml-1.5 text-[12px] font-bold text-red-500 bg-red-50 border border-red-200 rounded-full px-1.5 py-0.5">
              ← най-слаб
            </span>
          )}
        </span>
        <span className="text-[13px] font-bold text-[#111827]">{value}/{max}</span>
      </div>
      <div className="h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isWeakest ? "bg-red-400" : "bg-indigo-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ExaminerCard({
  n, score, weakest,
}: { n: number; score: ExaminerScore; weakest: WeakestDimension }) {
  return (
    <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-4 flex-1">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] font-bold uppercase tracking-widest text-[#9CA3AF]">Проверяващ {n}</p>
        <span className="text-[18px] font-bold text-[#111827]">{score.total}<span className="text-[13px] font-semibold text-[#9CA3AF]">/20</span></span>
      </div>
      <div className="space-y-2.5">
        <SubBar label="Идея и съдържание" value={score.ideaContent} max={10} isWeakest={weakest === "ideaContent"} />
        <SubBar label="Структура"          value={score.structure}   max={4}  isWeakest={weakest === "structure"} />
        <SubBar label="Език"               value={score.language}    max={6}  isWeakest={weakest === "language"} />
      </div>
      {score.notes && (
        <p className="mt-3 text-[13px] text-[#9CA3AF] leading-relaxed italic">"{score.notes}"</p>
      )}
    </div>
  );
}

// ── Language error card ────────────────────────────────────────────────────────

function LangErrorCard({ err }: { err: { type: string; original: string; correction: string; note?: string } }) {
  const typeColors: Record<string, string> = {
    spelling:     "bg-red-100 text-red-700 border-red-200",
    grammar:      "bg-orange-100 text-orange-700 border-orange-200",
    punctuation:  "bg-sky-100 text-sky-700 border-sky-200",
    word_choice:  "bg-indigo-50 text-indigo-700 border-indigo-100",
  };
  const cls = typeColors[err.type?.toLowerCase()] ?? "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]";
  return (
    <div className="bg-white rounded-2xl border border-[#F3F4F6] overflow-hidden">
      <div className="px-4 py-2 border-b border-[#F3F4F6] flex items-center gap-2">
        <span className={`text-[12px] font-bold uppercase tracking-widest border rounded-full px-2.5 py-0.5 ${cls}`}>{err.type?.replace("_", " ")}</span>
      </div>
      <div className="px-4 py-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-widest text-red-400 mb-1">Написал/а си</p>
          <p className="text-[15px] font-medium text-red-700 line-through">{err.original}</p>
        </div>
        <div>
          <p className="text-[12px] font-bold uppercase tracking-widest text-emerald-500 mb-1">Трябва да бъде</p>
          <p className="text-[15px] font-bold text-emerald-700">{err.correction}</p>
        </div>
      </div>
      {err.note && <div className="px-4 pb-3"><p className="text-[13px] text-[#9CA3AF] leading-relaxed">💡 {err.note}</p></div>}
    </div>
  );
}

// ── Model essay with annotations ───────────────────────────────────────────────

function AnnotationNote({ text }: { text: string }) {
  return (
    <div className="my-3 rounded-2xl bg-indigo-50 border border-indigo-100 px-4 py-3 flex gap-2">
      <span className="text-indigo-500 shrink-0 mt-0.5">✦</span>
      <p className="text-[13px] font-medium text-indigo-800 leading-relaxed">{text.replace(/^✦\s*/, "")}</p>
    </div>
  );
}

function ModelEssaySection({
  parts, score, studentFinalScore, weakest,
}: {
  parts: RewritePart[];
  score: RewriteScore;
  studentFinalScore: number;
  weakest: WeakestDimension;
}) {
  const annotations = DIMENSION_ANNOTATION_NOTES[weakest];
  const topAnnotations  = annotations.filter(a => a.position === "top");
  const beforeBody      = annotations.filter(a => a.position === "before" && a.partLabel === "Body");
  const afterBody       = annotations.filter(a => a.position === "after"  && a.partLabel === "Body");
  const gap = studentFinalScore - score.total;

  return (
    <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] px-5 py-5">
      <div className="mb-4">
        <p className="text-[12px] font-bold text-indigo-500 uppercase tracking-widest mb-1">Примерно есе</p>
        <p className="text-[15px] text-[#6B7280] leading-snug">
          Виж как добре структуриран отговор обработва тази тема. Обърни внимание на маркираните наблюдения — те касаят твоята най-слаба област.
        </p>
      </div>

      {topAnnotations.map((a, i) => <AnnotationNote key={i} text={a.text} />)}

      <div className="space-y-5 mt-3">
        {parts.map((part, i) => {
          const isBody = part.label.toLowerCase().includes("body") || part.label.toLowerCase().includes("argument") || i === 1;
          return (
            <div key={i}>
              {isBody && beforeBody.map((a, j) => <AnnotationNote key={`before-${j}`} text={a.text} />)}
              <div>
                <span className="inline-block text-[12px] font-bold uppercase tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-xl py-1 px-3 mb-2">
                  {part.label}
                </span>
                <p className="text-[#6B7280] text-[15px] leading-relaxed whitespace-pre-wrap">{part.text}</p>
              </div>
              {isBody && afterBody.map((a, j) => <AnnotationNote key={`after-${j}`} text={a.text} />)}
            </div>
          );
        })}
      </div>

      {/* Model essay score */}
      <div className="mt-6 pt-4 border-t border-[#F3F4F6]">
        <p className="text-[12px] font-bold text-indigo-500 uppercase tracking-widest mb-3">Оценка на примерното есе (един проверяващ)</p>
        <div className="flex items-end gap-1.5 mb-3">
          <span className="text-3xl font-bold text-emerald-600">{score.total}</span>
          <span className="text-[18px] font-semibold text-[#D1D5DB] mb-0.5">/20</span>
        </div>
        <div className="space-y-2 mb-3">
          {[
            { l: "Идея и съдържание", v: score.ideaContent, m: 10 },
            { l: "Структура",         v: score.structure,   m: 4 },
            { l: "Език",              v: score.language,    m: 6 },
          ].map(({ l, v, m }) => (
            <div key={l}>
              <div className="flex justify-between mb-0.5">
                <span className="text-[13px] text-[#9CA3AF]">{l}</span>
                <span className="text-[13px] font-semibold text-[#6B7280]">{v}/{m}</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
                <div className="h-full rounded-full bg-emerald-400" style={{ width: `${(v / m) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <p className="text-[13px] text-[#9CA3AF] leading-relaxed">
          Примерното есе получава приблизително <strong>{score.total}/20</strong> от един проверяващ. Твоето есе средно получи <strong>{studentFinalScore}/20</strong>.
          {gap > 0 && ` Разлика от ${gap} точки — именно това се затваря с редовна практика.`}
        </p>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function PhaseFeedback({ attemptId, feedbackData, advancing, onAdvance }: Props) {
  const [rewrite, setRewrite]       = useState<RewriteData | null>(null);
  const [rewriteLoading, setRwLoad] = useState(true);
  const [rewriteError, setRwErr]    = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchRewrite() {
      try {
        const res = await fetch("/api/essay/rewrite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attemptId }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
          if (!res.ok) { setRwErr("Не можа да се генерира примерно есе."); return; }
        setRewrite(data as RewriteData);
      } catch {
        if (!cancelled) setRwErr("Не можа да се зареди примерното есе.");
      } finally {
        if (!cancelled) setRwLoad(false);
      }
    }
    fetchRewrite();
    return () => { cancelled = true; };
  }, [attemptId]);

  if (!feedbackData?.breakdown) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-[#6B7280] text-[15px]">Данните за обратна връзка не са налични.</p>
        <button type="button" onClick={onAdvance} disabled={advancing} className="h-[52px] px-6 rounded-2xl bg-[#0B1F3A] text-white text-[15px] font-semibold hover:bg-[#122a50] shadow-md cursor-pointer disabled:opacity-50">
          Продължи →
        </button>
      </div>
    );
  }

  const { examiner1: e1, examiner2: e2, finalScore, arbitrated, keyTakeaway } = feedbackData.breakdown;
  const col = scoreColor(finalScore);
  const weakest = getWeakestDimension(e1, e2);
  const pct20 = Math.round((finalScore / 20) * 100);

  const paragraphs = feedbackData.feedbackText
    ? feedbackData.feedbackText.split(/\n\n/).filter(Boolean)
    : [];

  return (
    <div className="space-y-5">
      <div>
                <h2 className="text-[22px] font-semibold text-[#111827] tracking-tight">Твоята оценка</h2>
      </div>

      {/* ── Section A: Examiner Cards ───────────────────────────────────────── */}

      {/* Two examiner cards side by side */}
      <div className="flex flex-col sm:flex-row gap-3">
        <ExaminerCard n={1} score={e1} weakest={weakest} />
        <ExaminerCard n={2} score={e2} weakest={weakest} />
      </div>

      {/* Combined / Arbitrated result */}
      {arbitrated ? (
        <div className={`rounded-3xl border ${col.border} ${col.bg} px-5 py-5`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] font-bold text-amber-700 uppercase tracking-widest">⚖️ Арбитраж</p>
            <span className={`text-3xl font-bold ${col.text}`}>{finalScore}<span className="text-[15px] font-semibold text-[#D1D5DB] ml-0.5">/20</span></span>
          </div>
          <p className={`text-[15px] ${col.text} leading-relaxed mb-1`}>Проверяващите се различиха с 4+ точки. На реалния изпит арбитратор би преоценил есето ти.</p>
          <p className={`text-[15px] font-semibold ${col.text}`}>Арбитражна средна: {finalScore} / 20</p>
        </div>
      ) : (
        <div className={`rounded-3xl border ${col.border} ${col.bg} px-5 py-5`}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-0.5">Краен резултат</p>
              <p className={`text-[13px] font-semibold ${col.text}`}>{col.label}</p>
            </div>
            <span className={`text-4xl font-bold ${col.text}`}>{finalScore}<span className="text-[18px] font-semibold text-[#D1D5DB] ml-0.5">/20</span></span>
          </div>
          <p className={`text-[13px] ${col.text} mb-2`}>Проверяващ 1: {e1.total}/20 · Проверяващ 2: {e2.total}/20 · Средно: {finalScore}/20</p>
          <div className="h-2.5 rounded-full bg-white/50 overflow-hidden">
            <div className={`h-full rounded-full ${finalScore >= 16 ? "bg-emerald-500" : finalScore >= 12 ? "bg-amber-500" : finalScore >= 8 ? "bg-orange-500" : "bg-red-500"}`} style={{ width: `${pct20}%` }} />
          </div>
        </div>
      )}

      {/* Key takeaway */}
      {keyTakeaway && (
        <div className="bg-indigo-50 rounded-3xl border border-indigo-100 px-5 py-4 flex gap-3 items-start">
          <span className="w-5 h-5 text-indigo-500 shrink-0"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><circle cx="10" cy="10" r="8"/><circle cx="10" cy="10" r="4"/><circle cx="10" cy="10" r="1" fill="currentColor" stroke="none"/></svg></span>
          <div>
            <p className="text-[12px] font-bold text-indigo-500 uppercase tracking-widest mb-1">Основен извод</p>
            <p className="text-[15px] font-semibold text-[#111827] leading-relaxed">{keyTakeaway}</p>
          </div>
        </div>
      )}

      {/* ── Section B: Feedback + Language errors ──────────────────────────── */}

      {paragraphs.length > 0 && (
        <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] px-5 py-5">
          <p className="text-[12px] font-bold text-indigo-500 uppercase tracking-widest mb-4">Обратна връзка</p>
          <div className="space-y-4 text-[15px] text-[#6B7280] leading-relaxed">
            {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      )}

      {feedbackData.languageErrors.length > 0 && (
        <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] px-5 py-5">
          <p className="text-[12px] font-bold text-indigo-500 uppercase tracking-widest mb-4">
            Езикови грешки и правопис ({feedbackData.languageErrors.length})
          </p>
          <div className="space-y-3">
            {feedbackData.languageErrors.map((err, i) => <LangErrorCard key={i} err={err} />)}
          </div>
        </div>
      )}

      {/* ── Section C: Model Essay ─────────────────────────────────────────── */}

      {rewriteLoading && (
        <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] px-5 py-8">
          <p className="text-[12px] font-bold text-indigo-500 uppercase tracking-widest mb-4">Примерно есе</p>
          <div className="space-y-3 animate-pulse">
            <div className="h-3 bg-[#F3F4F6] rounded-full w-3/4" />
            <div className="h-3 bg-[#F3F4F6] rounded-full w-full" />
            <div className="h-3 bg-[#F3F4F6] rounded-full w-5/6" />
            <div className="h-3 bg-[#F3F4F6] rounded-full w-full" />
            <div className="h-3 bg-[#F3F4F6] rounded-full w-2/3" />
          </div>
          <p className="mt-4 text-[13px] text-[#9CA3AF] text-center">Генерира примерно есе…</p>
        </div>
      )}

      {!rewriteLoading && rewriteError && (
        <div className="bg-[#F9FAFB] rounded-3xl border border-[#E5E7EB] px-5 py-5 text-center">
          <p className="text-[15px] text-[#9CA3AF]">{rewriteError}</p>
        </div>
      )}

      {!rewriteLoading && rewrite && (
        <ModelEssaySection
          parts={rewrite.parts}
          score={rewrite.score}
          studentFinalScore={finalScore}
          weakest={weakest}
        />
      )}

      {/* ── Advance button ─────────────────────────────────────────────────── */}

      <button
        type="button" onClick={onAdvance} disabled={advancing}
        className="w-full h-[52px] rounded-2xl bg-[#0B1F3A] text-white text-[15px] font-semibold hover:bg-[#122a50] hover:-translate-y-0.5 shadow-md transition-all disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
      >
        {advancing
          ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Записва…</>
          : <>Продължи към размисъла <ArrowRight size={16} /></>}
      </button>
    </div>
  );
}
