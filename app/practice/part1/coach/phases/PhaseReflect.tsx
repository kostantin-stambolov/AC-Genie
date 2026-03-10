"use client";

import { useState } from "react";
import {
  getWeakestDimension,
  DIMENSION_LABELS,
  DIMENSION_MODEL_OBSERVATIONS,
  DIMENSION_REFLECTION_PLACEHOLDERS,
} from "@/lib/coaching-utils";
import type { FeedbackData, PhaseTimingsData } from "../CoachingFlow";

type Props = {
  feedbackData: FeedbackData | null;
  phaseTimings: PhaseTimingsData;
  advancing: boolean;
  onAdvance: (reflection: string) => Promise<void>;
};

function formatSeconds(s?: number): string {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  return m === 0 ? `${s}s` : `${m} min`;
}

export function PhaseReflect({ feedbackData, phaseTimings, advancing, onAdvance }: Props) {
  const [reflection, setReflection] = useState("");
  const [done, setDone]             = useState(false);

  const bd = feedbackData?.breakdown;
  if (!bd) {
    return (
      <div className="space-y-4">
        <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">Phase 6 · Reflect</p>
        <p className="text-sm text-neutral-500">No scoring data available.</p>
        <button
          type="button" onClick={() => onAdvance("")} disabled={advancing}
          className="w-full h-12 rounded-xl bg-violet-600 text-white text-sm font-semibold cursor-pointer disabled:opacity-50"
        >
          Finish session
        </button>
      </div>
    );
  }

  const { examiner1: e1, examiner2: e2, finalScore } = bd;
  const score40  = e1.total + e2.total;
  const weakest  = getWeakestDimension(e1, e2);
  const dimLabel = DIMENSION_LABELS[weakest];
  const avgValue = weakest === "ideaContent"
    ? (e1.ideaContent + e2.ideaContent) / 2
    : weakest === "structure"
    ? (e1.structure + e2.structure) / 2
    : (e1.language + e2.language) / 2;
  const dimMax   = weakest === "ideaContent" ? 10 : weakest === "structure" ? 4 : 6;

  // Pick note from the examiner who scored the weakest dimension lower
  const e1dim = weakest === "ideaContent" ? e1.ideaContent : weakest === "structure" ? e1.structure : e1.language;
  const e2dim = weakest === "ideaContent" ? e2.ideaContent : weakest === "structure" ? e2.structure : e2.language;
  const relevantNote = (e1dim <= e2dim ? e1.notes : e2.notes) || "";

  async function handleFinish() {
    await onAdvance(reflection);
    setDone(true);
  }

  if (done) {
    const timingRows = [
      { key: "comprehension", label: "Understanding" },
      { key: "outline",       label: "Outlining" },
      { key: "writing",       label: "Writing" },
      { key: "review",        label: "Self-review" },
    ];
    const totalSecs = timingRows.reduce((sum, r) => sum + (phaseTimings[r.key]?.seconds ?? 0), 0);

    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm px-6 py-6">
          <p className="text-2xl mb-3">🎯</p>
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Session complete!</h2>

          <div className="mb-4">
            <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-1">Your score</p>
            <p className="text-3xl font-black text-neutral-900">{score40}<span className="text-lg font-semibold text-neutral-300">/40</span></p>
          </div>

          <div className="mb-4">
            <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-2">Time breakdown</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {timingRows.map(({ key, label }) => (
                phaseTimings[key]?.seconds
                  ? <span key={key} className="text-xs text-neutral-500">{label}: <strong>{formatSeconds(phaseTimings[key]?.seconds)}</strong></span>
                  : null
              ))}
              {totalSecs > 0 && (
                <span className="text-xs text-neutral-500">Total: <strong>{formatSeconds(totalSecs)}</strong></span>
              )}
            </div>
          </div>

          {reflection.trim() && (
            <div className="mb-4">
              <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-1">Your focus for next time</p>
              <p className="text-sm text-neutral-700 leading-relaxed italic">"{reflection}"</p>
            </div>
          )}

          <p className="text-xs text-neutral-400 leading-relaxed">
            Today you practiced: understanding the prompt, outlining, timed writing, self-review, and reflecting on your weakest area. Keep going — exam day is March 22.
          </p>
        </div>

        <button
          type="button"
          onClick={() => { window.location.href = "/home"; }}
          className="w-full h-12 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 active:scale-[0.98] transition cursor-pointer"
        >
          Done — back to home
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-1">Phase 6 · Reflect</p>
        <h2 className="text-xl font-bold text-neutral-900 mb-1">What will you do differently next time?</h2>
        <p className="text-sm text-neutral-500">One quick reflection closes the loop and makes the practice stick.</p>
      </div>

      {/* Weakest area card */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
        <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-3">
          Your weakest area: {dimLabel} (avg {avgValue.toFixed(1)} / {dimMax})
        </p>

        {relevantNote && (
          <div className="rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-3 mb-4">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Your examiners noted</p>
            <p className="text-sm text-neutral-700 leading-relaxed italic">"{relevantNote}"</p>
          </div>
        )}

        <p className="text-sm text-neutral-600 leading-relaxed">
          In the model essay, you saw how <strong>{DIMENSION_MODEL_OBSERVATIONS[weakest]}</strong>.
        </p>
      </div>

      {/* Reflection textarea */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm px-5 py-5">
        <label className="block text-sm font-semibold text-neutral-800 mb-3">
          Write one thing you'll focus on in your next essay:
        </label>
        <textarea
          value={reflection}
          onChange={e => setReflection(e.target.value)}
          rows={3}
          placeholder={DIMENSION_REFLECTION_PLACEHOLDERS[weakest]}
          className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
        />
      </div>

      <button
        type="button"
        onClick={handleFinish}
        disabled={advancing}
        className="w-full h-12 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 active:scale-[0.98] transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
      >
        {advancing
          ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</>
          : "Finish session →"}
      </button>
    </div>
  );
}
