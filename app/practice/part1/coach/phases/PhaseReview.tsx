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
                <h2 className="text-[22px] font-semibold text-[#111827] mb-1 tracking-tight">Прочети есето си и се провери</h2>
        <p className="text-[15px] text-[#6B7280]">Прочети внимателно, след това отговори честно. На изпита ти ще бъдеш собственият си редактор.</p>
      </div>

      {/* Read-only essay */}
      <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] px-5 py-5 max-h-64 overflow-y-auto">
        <p className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-3">Твоето есе (само за четене)</p>
        <p className="text-[15px] text-[#6B7280] leading-relaxed whitespace-pre-wrap">{essayBody}</p>
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 space-y-3">
        <p className="text-[12px] font-bold text-indigo-500 uppercase tracking-widest mb-1">Контролен списък за самооценка</p>
        {CHECKLIST_ITEMS.map(({ key, label, category, tip }) => {
          const val = answers[key] as boolean | undefined;
          return (
            <div key={key} className="rounded-2xl border border-[#F3F4F6] p-3 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[12px] font-bold uppercase tracking-widest ${
                      category === "Идея" ? "text-indigo-500" : category === "Структура" ? "text-sky-500" : "text-emerald-500"
                    }`}>{category}</span>
                  </div>
                  <p className="text-[15px] text-[#111827] leading-snug">{label}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {[true, false].map(v => (
                    <button
                      key={String(v)}
                      type="button"
                      onClick={() => toggle(key, v)}
                      className={`min-w-[44px] h-9 rounded-xl text-[15px] font-semibold transition cursor-pointer ${
                        val === v
                          ? v ? "bg-emerald-600 text-white" : "bg-red-500 text-white"
                          : "border border-[#E5E7EB] bg-white text-[#9CA3AF] hover:bg-[#F3F4F6]"
                      }`}
                    >
                      {v ? "Да" : "Не"}
                    </button>
                  ))}
                </div>
              </div>
              {val === false && (
                <div className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-2">
                  <p className="text-[13px] text-amber-800 leading-relaxed">💡 {tip}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="text-[15px] text-red-600 text-center" role="alert">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!allAnswered || submitting || advancing}
        className="w-full h-[52px] rounded-2xl bg-[#0B1F3A] text-white text-[15px] font-semibold hover:bg-[#122a50] hover:-translate-y-0.5 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
      >
        {submitting || advancing
          ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Анализира есето ти…</>
          : <>Изпрати за AI оценяване <ArrowRight size={16} /></>}
      </button>
      {!allAnswered && (
        <p className="text-[13px] text-[#9CA3AF] text-center">Отговори на всички въпроси, за да продължиш</p>
      )}
    </div>
  );
}
