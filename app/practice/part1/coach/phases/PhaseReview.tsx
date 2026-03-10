"use client";

import { useState, useRef } from "react";
import { ArrowRight } from "@/components/icons";
import type { SelfReviewData, FeedbackData } from "../CoachingFlow";

const CHECKLIST_ITEMS = [
  { key: "q1" as const, label: "Отговарям ли на въпроса, зададен в темата?", category: "Идея", tip: "Прочети отново темата. Какво точно се иска? Увери се, че първият ти параграф отговаря на това." },
  { key: "q2" as const, label: "Ясна ли е позицията/тезата ми?", category: "Идея", tip: "Потърси едно изречение, което изразява основната ти идея. Ако не можеш да го намериш, може би трябва да го добавиш." },
  { key: "q3" as const, label: "Дал/а ли съм поне два подкрепящи аргумента с конкретни примери?", category: "Идея", tip: "Преброй примерите си. Можеш ли да си спомниш конкретен момент от живота ти, който подкрепя точката ти?" },
  { key: "q4" as const, label: "Есето ми има ли ясно начало и край?", category: "Структура", tip: "Провери първия и последния параграф. Усещат ли се като обмислено начало и край, или есето просто започва/спира?" },
  { key: "q5" as const, label: "Свързва ли се заключението ми с началото?", category: "Структура", tip: "Опитай се да отекнеш дума или идея от началото си в заключителното изречение." },
  { key: "q6" as const, label: "Прочетох ли за правописни и граматически грешки?", category: "Език", tip: "Прочети есето наум на глас — грешките често стават очевидни по този начин." },
];

type Props = {
  attemptId: string;
  essayBody: string;
  advancing: boolean;
  onAdvance: (selfReview: SelfReviewData, feedback: FeedbackData, timing: number) => Promise<void>;
};

type ToggleState = Record<string, boolean | null>;

export function PhaseReview({ attemptId, essayBody, advancing, onAdvance }: Props) {
  const [answers, setAnswers] = useState<ToggleState>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startRef = useRef(Date.now());

  const allAnswered = CHECKLIST_ITEMS.every(item => answers[item.key] !== undefined && answers[item.key] !== null);

  function toggle(key: string, val: boolean) {
    setAnswers(prev => ({ ...prev, [key]: val }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/essay/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, essayBody }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
          setError((data as {error?:string}).error ?? "AI оценяването не бе успешно. Моля, опитай отново.");
        return;
      }

      // API returns flat fields: examiner1, examiner2, finalScore, arbitrated, keyTakeaway, feedback, languageErrors
      const d = data as {
        examiner1?: unknown;
        examiner2?: unknown;
        finalScore?: number;
        arbitrated?: boolean;
        keyTakeaway?: string;
        feedback?: string;
        languageErrors?: Array<{ type: string; original: string; correction: string; note?: string }>;
      };

      const feedbackResult: FeedbackData = {
        breakdown: d.examiner1 && d.examiner2 ? {
          examiner1: d.examiner1 as never,
          examiner2: d.examiner2 as never,
          finalScore: d.finalScore ?? 0,
          arbitrated: d.arbitrated ?? false,
          keyTakeaway: d.keyTakeaway,
        } : null,
        feedbackText: d.feedback ?? "",
        languageErrors: d.languageErrors ?? [],
      };

      const selfReview: SelfReviewData = {
        q1: answers.q1 === true, q2: answers.q2 === true, q3: answers.q3 === true,
        q4: answers.q4 === true, q5: answers.q5 === true, q6: answers.q6 === true,
      };

      const timing = Math.round((Date.now() - startRef.current) / 1000);
      await onAdvance(selfReview, feedbackResult, timing);
    } catch { setError("Нещо се обърка. Моля, опитай отново."); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-1">Фаза 4 · Самопроверка</p>
        <h2 className="text-xl font-bold text-neutral-900 mb-1">Прочети есето си и се провери</h2>
        <p className="text-sm text-neutral-500">Прочети внимателно, след това отговори честно. На изпита ти ще бъдеш собственият си редактор.</p>
      </div>

      {/* Read-only essay */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm px-5 py-5 max-h-64 overflow-y-auto">
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Твоето есе (само за четене)</p>
        <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{essayBody}</p>
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 space-y-3">
        <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-1">Контролен списък за самооценка</p>
        {CHECKLIST_ITEMS.map(({ key, label, category, tip }) => {
          const val = answers[key] as boolean | undefined;
          return (
            <div key={key} className="rounded-xl border border-neutral-100 p-3 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${
                      category === "Идея" ? "text-violet-500" : category === "Структура" ? "text-indigo-500" : "text-sky-500"
                    }`}>{category}</span>
                  </div>
                  <p className="text-sm text-neutral-800 leading-snug">{label}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {[true, false].map(v => (
                    <button
                      key={String(v)}
                      type="button"
                      onClick={() => toggle(key, v)}
                      className={`min-w-[44px] h-9 rounded-lg text-sm font-semibold transition cursor-pointer ${
                        val === v
                          ? v ? "bg-emerald-600 text-white" : "bg-red-500 text-white"
                          : "border border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50"
                      }`}
                    >
                      {v ? "Да" : "Не"}
                    </button>
                  ))}
                </div>
              </div>
              {val === false && (
                <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
                  <p className="text-xs text-amber-800 leading-relaxed">💡 {tip}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-600 text-center" role="alert">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!allAnswered || submitting || advancing}
        className="w-full h-12 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
      >
        {submitting || advancing
          ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Анализира есето ти…</>
          : <>Изпрати за AI оценяване <ArrowRight size={16} /></>}
      </button>
      {!allAnswered && (
        <p className="text-xs text-neutral-400 text-center">Отговори на всички въпроси, за да продължиш</p>
      )}
    </div>
  );
}
