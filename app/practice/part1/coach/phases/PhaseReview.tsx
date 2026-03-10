"use client";

import { useState, useRef } from "react";
import { ArrowRight } from "@/components/icons";
import type { SelfReviewData, FeedbackData } from "../CoachingFlow";

const CHECKLIST_ITEMS = [
  { key: "q1" as const, label: "Am I answering the question the prompt asked?", category: "Idea", tip: "Re-read the prompt. What exactly is it asking? Make sure your first paragraph responds to that." },
  { key: "q2" as const, label: "Is it clear what my position/thesis is?", category: "Idea", tip: "Look for one sentence that states your main idea. If you can't find it, you may need to add one." },
  { key: "q3" as const, label: "Did I give at least two supporting arguments with specific examples?", category: "Idea", tip: "Count your examples. Can you recall a specific moment from your life that supports your point?" },
  { key: "q4" as const, label: "Does my essay have a clear beginning and ending?", category: "Structure", tip: "Check your first and last paragraphs. Do they feel like a deliberate beginning and ending, or does the essay just start/stop?" },
  { key: "q5" as const, label: "Does my conclusion connect back to my opening?", category: "Structure", tip: "Try to echo a word or idea from your opening in your closing sentence." },
  { key: "q6" as const, label: "Did I re-read for spelling and grammar mistakes?", category: "Language", tip: "Read your essay out loud in your head — errors often become obvious that way." },
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
        setError((data as {error?:string}).error ?? "AI scoring failed. Please try again.");
        return;
      }

      // Build FeedbackData from API response
      const d = data as {
        scoreBreakdown?: { examiner1?: unknown; examiner2?: unknown; finalScore?: number; arbitrated?: boolean; keyTakeaway?: string };
        feedbackText?: string;
        languageErrors?: Array<{ type: string; original: string; correction: string; note?: string }>;
      };

      const feedbackResult: FeedbackData = {
        breakdown: d.scoreBreakdown ? {
          examiner1: d.scoreBreakdown.examiner1 as never,
          examiner2: d.scoreBreakdown.examiner2 as never,
          finalScore: d.scoreBreakdown.finalScore ?? 0,
          arbitrated: d.scoreBreakdown.arbitrated ?? false,
          keyTakeaway: d.scoreBreakdown.keyTakeaway,
        } : null,
        feedbackText: d.feedbackText ?? "",
        languageErrors: d.languageErrors ?? [],
      };

      const selfReview: SelfReviewData = {
        q1: answers.q1 === true, q2: answers.q2 === true, q3: answers.q3 === true,
        q4: answers.q4 === true, q5: answers.q5 === true, q6: answers.q6 === true,
      };

      const timing = Math.round((Date.now() - startRef.current) / 1000);
      await onAdvance(selfReview, feedbackResult, timing);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-1">Phase 4 · Self-Review</p>
        <h2 className="text-xl font-bold text-neutral-900 mb-1">Read your essay and check yourself</h2>
        <p className="text-sm text-neutral-500">Read your essay carefully, then answer honestly. On exam day, you'll be your own editor.</p>
      </div>

      {/* Read-only essay */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm px-5 py-5 max-h-64 overflow-y-auto">
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Your essay (read-only)</p>
        <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{essayBody}</p>
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 space-y-3">
        <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-1">Self-assessment checklist</p>
        {CHECKLIST_ITEMS.map(({ key, label, category, tip }) => {
          const val = answers[key] as boolean | undefined;
          return (
            <div key={key} className="rounded-xl border border-neutral-100 p-3 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${
                      category === "Idea" ? "text-violet-500" : category === "Structure" ? "text-indigo-500" : "text-sky-500"
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
                      {v ? "Yes" : "No"}
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
          ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Analysing your essay…</>
          : <>Submit for AI assessment <ArrowRight size={16} /></>}
      </button>
      {!allAnswered && (
        <p className="text-xs text-neutral-400 text-center">Answer all checklist items to continue</p>
      )}
    </div>
  );
}
