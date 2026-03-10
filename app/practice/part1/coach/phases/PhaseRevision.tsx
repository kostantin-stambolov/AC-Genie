"use client";

import { useState, useCallback } from "react";
import { ArrowRight } from "@/components/icons";
import type { FeedbackData, ExaminerScore } from "../CoachingFlow";

type Props = {
  attemptId: string;
  essayBody: string;
  feedbackData: FeedbackData | null;
  revisionFeedback: FeedbackData | null;
  advancing: boolean;
  onRevisionFeedback: (data: FeedbackData) => void;
  onAdvance: () => Promise<void>;
};

type WeakDimension = "ideaContent" | "structure" | "language";

function avgScore(e1: ExaminerScore, e2: ExaminerScore, dim: WeakDimension): number {
  return (e1[dim] + e2[dim]) / 2;
}

function getWeakDimension(e1: ExaminerScore, e2: ExaminerScore): WeakDimension {
  const idea = avgScore(e1, e2, "ideaContent") / 10;
  const struct = avgScore(e1, e2, "structure") / 4;
  const lang = avgScore(e1, e2, "language") / 6;
  if (idea <= struct && idea <= lang) return "ideaContent";
  if (struct <= idea && struct <= lang) return "structure";
  return "language";
}

function getFirstNParagraphs(text: string, n: number): string {
  return text.split(/\n\n/).slice(0, n).join("\n\n");
}
function getLastNParagraphs(text: string, n: number): string {
  const parts = text.split(/\n\n/);
  return parts.slice(Math.max(0, parts.length - n)).join("\n\n");
}

function ScoreCompare({ label, before, after, max }: { label: string; before: number; after: number; max: number }) {
  const improved = after > before;
  const same = after === before;
  return (
    <div className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
      <span className="text-sm text-neutral-700">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-neutral-400">{before.toFixed(1)}/{max}</span>
        <span className="text-neutral-300">→</span>
        <span className={`text-sm font-bold ${improved ? "text-emerald-600" : same ? "text-neutral-500" : "text-red-500"}`}>
          {after.toFixed(1)}/{max}
        </span>
        {improved && <span className="text-emerald-500 text-xs font-bold">↑</span>}
      </div>
    </div>
  );
}

export function PhaseRevision({
  attemptId, essayBody, feedbackData, revisionFeedback, advancing,
  onRevisionFeedback, onAdvance,
}: Props) {
  const bd = feedbackData?.breakdown;
  const [body, setBody] = useState(() => {
    if (!bd) return essayBody;
    const dim = getWeakDimension(bd.examiner1, bd.examiner2);
    if (dim === "ideaContent") return getFirstNParagraphs(essayBody, 2);
    if (dim === "structure")   return getLastNParagraphs(essayBody, 1);
    return essayBody;
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = useCallback(async (newBody: string) => {
    await fetch(`/api/attempts/${attemptId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ essayBody: newBody }),
    });
  }, [attemptId]);

  if (!bd) {
    return (
      <div className="space-y-4">
        <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">Phase 6 · Improve</p>
        <p className="text-sm text-neutral-500">No feedback data to build a revision task from.</p>
        <button type="button" onClick={onAdvance} disabled={advancing} className="w-full h-12 rounded-xl bg-violet-600 text-white text-sm font-semibold cursor-pointer disabled:opacity-50">
          Finish session
        </button>
      </div>
    );
  }

  const { examiner1: e1, examiner2: e2, finalScore: beforeScore } = bd;
  const dim = getWeakDimension(e1, e2);

  const TASKS: Record<WeakDimension, { title: string; instruction: string; warning?: string }> = {
    ideaContent: {
      title: "Strengthen your argument",
      instruction: "Your weakest area is Idea & Content. Rewrite your opening two paragraphs so that your thesis sentence starts with 'I believe that…' or 'In my opinion…'. Then make sure your first example is specific and clearly connected to your thesis.",
    },
    structure: {
      title: "Improve your structure",
      instruction: "Your weakest area is Structure. Rewrite your conclusion (last paragraph) so that it echoes your opening sentence. If your essay doesn't have clear paragraph breaks, add them now to separate your introduction, arguments, and conclusion.",
    },
    language: {
      title: "Fix language errors",
      instruction: "Your weakest area is Language. Use the error list from the previous phase to fix as many errors as you can in the full essay. Focus on spelling first — those are the easiest points to recover.",
    },
  };
  const task = TASKS[dim];

  const langErrors = feedbackData?.languageErrors ?? [];

  async function handleSubmitRevision() {
    setSubmitting(true);
    setError(null);
    try {
      // Merge the revised section back into full essay if it was only a partial edit
      let finalBody = body;
      if (dim === "ideaContent") {
        const parts = essayBody.split(/\n\n/);
        const newParts = body.split(/\n\n/);
        finalBody = [...newParts, ...parts.slice(2)].join("\n\n");
      } else if (dim === "structure") {
        const parts = essayBody.split(/\n\n/);
        const newParts = body.split(/\n\n/);
        finalBody = [...parts.slice(0, Math.max(0, parts.length - 1)), ...newParts].join("\n\n");
      }

      await handleSave(finalBody);

      const res = await fetch("/api/essay/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, essayBody: finalBody }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError((data as {error?:string}).error ?? "Scoring failed"); return; }

      const d = data as {
        scoreBreakdown?: { examiner1?: unknown; examiner2?: unknown; finalScore?: number; arbitrated?: boolean; keyTakeaway?: string };
        feedbackText?: string;
        languageErrors?: Array<{ type: string; original: string; correction: string; note?: string }>;
      };
      const revFeed: FeedbackData = {
        breakdown: d.scoreBreakdown ? {
          examiner1: d.scoreBreakdown.examiner1 as ExaminerScore,
          examiner2: d.scoreBreakdown.examiner2 as ExaminerScore,
          finalScore: d.scoreBreakdown.finalScore ?? 0,
          arbitrated: d.scoreBreakdown.arbitrated ?? false,
          keyTakeaway: d.scoreBreakdown.keyTakeaway,
        } : null,
        feedbackText: d.feedbackText ?? "",
        languageErrors: d.languageErrors ?? [],
      };
      onRevisionFeedback(revFeed);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setSubmitting(false); }
  }

  const afterBd = revisionFeedback?.breakdown;
  const avgBefore = (e: typeof e1, dim: WeakDimension) => e[dim];
  const avgDimBefore = (e1[dim] + e2[dim]) / 2;
  const avgDimAfter  = afterBd ? (afterBd.examiner1[dim] + afterBd.examiner2[dim]) / 2 : null;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-1">Phase 6 · Improve</p>
        <h2 className="text-xl font-bold text-neutral-900 mb-1">Targeted revision</h2>
        <p className="text-sm text-neutral-500">One focused task based on your weakest area.</p>
      </div>

      {/* Task card */}
      <div className="bg-violet-50 rounded-2xl border border-violet-200 px-5 py-5">
        <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-2">Your revision task</p>
        <h3 className="font-bold text-violet-900 text-base mb-2">{task.title}</h3>
        <p className="text-sm text-violet-800 leading-relaxed">{task.instruction}</p>
      </div>

      {/* Language error list for reference when dim = language */}
      {dim === "language" && langErrors.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm px-5 py-4">
          <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-3">Errors to fix</p>
          <div className="space-y-2">
            {langErrors.map((err, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="text-red-500 line-through">{err.original}</span>
                <span className="text-neutral-400">→</span>
                <span className="text-emerald-600 font-semibold">{err.correction}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor */}
      {!afterBd && (
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-neutral-100 bg-neutral-50/60">
            <p className="text-xs text-neutral-500 font-medium">
              {dim === "language" ? "Full essay" : dim === "structure" ? "Your conclusion" : "Opening paragraphs"}
              {" "}· Edit below
            </p>
          </div>
          <textarea
            value={body}
            onChange={e => {
              setBody(e.target.value);
              if (e.target.value.length % 80 === 0) handleSave(e.target.value);
            }}
            rows={10}
            className="w-full p-5 text-neutral-800 text-[15px] leading-relaxed placeholder:text-neutral-300 focus:outline-none resize-none block"
          />
        </div>
      )}

      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      {/* Submit revision */}
      {!afterBd && (
        <button
          type="button" onClick={handleSubmitRevision} disabled={submitting || !body.trim()}
          className="w-full h-12 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
        >
          {submitting
            ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Scoring revision…</>
            : <>Submit revision <ArrowRight size={16} /></>}
        </button>
      )}

      {/* Before/after comparison */}
      {afterBd && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm px-5 py-5">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-3">Before vs. after</p>
            <ScoreCompare label="Final score" before={beforeScore} after={afterBd.finalScore} max={20} />
            <ScoreCompare label="Idea & Content (avg)" before={(e1.ideaContent + e2.ideaContent)/2} after={(afterBd.examiner1.ideaContent + afterBd.examiner2.ideaContent)/2} max={10} />
            <ScoreCompare label="Structure (avg)"      before={(e1.structure + e2.structure)/2}     after={(afterBd.examiner1.structure + afterBd.examiner2.structure)/2}     max={4} />
            <ScoreCompare label="Language (avg)"       before={(e1.language + e2.language)/2}       after={(afterBd.examiner1.language + afterBd.examiner2.language)/2}       max={6} />
          </div>

          <div className="bg-violet-50 rounded-2xl border border-violet-200 px-5 py-4">
            <p className="text-sm font-semibold text-violet-900 leading-relaxed">
              🎉 Session complete! Your score went from <strong>{beforeScore}/20</strong> to <strong>{afterBd.finalScore}/20</strong>. Keep practising!
            </p>
          </div>

          <button
            type="button" onClick={onAdvance} disabled={advancing}
            className="w-full h-12 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 active:scale-[0.98] transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {advancing
              ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Finishing…</>
              : "Done — back to home"}
          </button>
        </div>
      )}
    </div>
  );
}
