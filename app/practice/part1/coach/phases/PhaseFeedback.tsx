"use client";

import { ArrowRight } from "@/components/icons";
import type { FeedbackData, SelfReviewData, ExaminerScore } from "../CoachingFlow";

type Props = {
  feedbackData: FeedbackData | null;
  selfReviewData: SelfReviewData | null;
  advancing: boolean;
  onAdvance: () => Promise<void>;
};

function scoreColor(s: number): string {
  if (s >= 16) return "text-emerald-600";
  if (s >= 12) return "text-amber-600";
  return "text-red-500";
}

function SubScoreBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-semibold text-neutral-600">{label}</span>
        <span className="text-xs font-bold text-neutral-700">{value}/{max}</span>
      </div>
      <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ExaminerCard({ n, score, color }: { n: number; score: ExaminerScore; color: string }) {
  return (
    <div className={`bg-white rounded-2xl border ${n === 1 ? "border-violet-100" : "border-indigo-100"} shadow-sm p-4`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Examiner {n}</p>
        <span className={`text-lg font-bold ${color}`}>{score.total}/20</span>
      </div>
      <div className="space-y-2.5">
        <SubScoreBar label="Idea & Content" value={score.ideaContent} max={10} color={n===1?"bg-violet-400":"bg-indigo-400"} />
        <SubScoreBar label="Structure"      value={score.structure}   max={4}  color={n===1?"bg-violet-400":"bg-indigo-400"} />
        <SubScoreBar label="Language"       value={score.language}    max={6}  color={n===1?"bg-violet-400":"bg-indigo-400"} />
      </div>
      {score.notes && <p className="mt-3 text-xs text-neutral-500 leading-relaxed">{score.notes}</p>}
    </div>
  );
}

// Self-review comparison logic
function selfReviewMismatch(
  selfData: SelfReviewData,
  e1: ExaminerScore, e2: ExaminerScore
): Array<{ question: string; note: string }> {
  const avgIdea = (e1.ideaContent + e2.ideaContent) / 2;
  const avgStructure = (e1.structure + e2.structure) / 2;
  const avgLang = (e1.language + e2.language) / 2;
  const mismatches: Array<{ question: string; note: string }> = [];

  if (selfData.q1 && avgIdea < 5)
    mismatches.push({ question: "\"Am I answering the prompt?\"", note: "You felt confident here, but the Idea & Content score suggests the response to the prompt could be more direct." });
  if (selfData.q2 && avgIdea < 5)
    mismatches.push({ question: "\"Is my thesis clear?\"", note: "You thought your thesis was clear, but the examiners found the main position hard to identify. Try stating it more explicitly." });
  if (selfData.q3 && avgIdea < 6)
    mismatches.push({ question: "\"Did I give two arguments with examples?\"", note: "You checked yes, but the content score indicates the examples may need to be more specific or better connected to your argument." });
  if ((selfData.q4 || selfData.q5) && avgStructure < 2)
    mismatches.push({ question: "\"Does my structure work?\"", note: "You felt your structure was strong, but the structure score (avg " + avgStructure.toFixed(1) + "/4) suggests the beginning or ending could be clearer." });
  if (selfData.q6 && avgLang < 3)
    mismatches.push({ question: "\"Did I re-read for errors?\"", note: "You re-read for errors, but the language score shows there are still issues to fix. Use the error list below as a guide." });
  return mismatches;
}

function LanguageErrorCard({ err }: { err: { type: string; original: string; correction: string; note?: string } }) {
  const typeColors: Record<string, string> = {
    spelling: "bg-red-100 text-red-700 border-red-200",
    grammar: "bg-orange-100 text-orange-700 border-orange-200",
    punctuation: "bg-blue-100 text-blue-700 border-blue-200",
    "word choice": "bg-violet-100 text-violet-700 border-violet-200",
  };
  const cls = typeColors[err.type?.toLowerCase()] ?? "bg-neutral-100 text-neutral-700 border-neutral-200";
  return (
    <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
      <div className="px-4 py-2 border-b border-neutral-100 flex items-center gap-2">
        <span className={`text-[10px] font-bold uppercase tracking-widest border rounded-full px-2.5 py-0.5 ${cls}`}>{err.type}</span>
      </div>
      <div className="px-4 py-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-1">You wrote</p>
          <p className="text-sm font-medium text-red-700 line-through leading-snug">{err.original}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-1">Should be</p>
          <p className="text-sm font-bold text-emerald-700 leading-snug">{err.correction}</p>
        </div>
      </div>
      {err.note && (
        <div className="px-4 pb-3">
          <p className="text-xs text-neutral-500 leading-relaxed">💡 {err.note}</p>
        </div>
      )}
    </div>
  );
}

export function PhaseFeedback({ feedbackData, selfReviewData, advancing, onAdvance }: Props) {
  if (!feedbackData?.breakdown) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-neutral-500">No feedback data yet.</p>
        <button type="button" onClick={onAdvance} disabled={advancing} className="h-12 px-6 rounded-xl bg-violet-600 text-white text-sm font-semibold cursor-pointer disabled:opacity-50">
          Continue to revision →
        </button>
      </div>
    );
  }

  const { examiner1, examiner2, finalScore, arbitrated, keyTakeaway } = feedbackData.breakdown;
  const e1 = examiner1; const e2 = examiner2;

  const avgIdea      = (e1.ideaContent + e2.ideaContent) / 2;
  const avgStructure = (e1.structure   + e2.structure)   / 2;
  const avgLang      = (e1.language    + e2.language)     / 2;

  const paragraphs = feedbackData.feedbackText
    ? feedbackData.feedbackText.split(/\n\n/).filter(Boolean)
    : [];

  const mismatches = selfReviewData ? selfReviewMismatch(selfReviewData, e1, e2) : [];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-1">Phase 5 · Score</p>
        <h2 className="text-xl font-bold text-neutral-900">Your AI assessment</h2>
      </div>

      {/* Self-review comparison */}
      {mismatches.length > 0 && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-3">Self-review vs. AI score</p>
          <p className="text-xs text-amber-700 mb-3">You said "yes" to these, but the scores suggest there's room to grow:</p>
          <div className="space-y-3">
            {mismatches.map((m, i) => (
              <div key={i} className="bg-white rounded-xl border border-amber-100 px-4 py-3">
                <p className="text-xs font-semibold text-amber-800 mb-1">{m.question}</p>
                <p className="text-xs text-amber-700 leading-relaxed">{m.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final score hero */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
        <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-3">Your score</p>
        <div className="flex items-end gap-2 mb-4">
          <span className={`text-5xl font-black leading-none ${scoreColor(finalScore)}`}>{finalScore}</span>
          <span className="text-2xl font-semibold text-neutral-300 mb-1">/20</span>
          {arbitrated && (
            <span className="ml-auto text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-200 rounded-full px-2.5 py-1 uppercase tracking-widest">Arbitrated</span>
          )}
        </div>
        <div className="space-y-3">
          <SubScoreBar label="Idea & Content (avg)" value={Math.round(avgIdea * 10) / 10} max={10} color="bg-violet-400" />
          <SubScoreBar label="Structure (avg)"      value={Math.round(avgStructure * 10) / 10} max={4}  color="bg-indigo-400" />
          <SubScoreBar label="Language (avg)"       value={Math.round(avgLang * 10) / 10}      max={6}  color="bg-sky-400" />
        </div>
      </div>

      {/* Key takeaway */}
      {keyTakeaway && (
        <div className="bg-violet-50 rounded-2xl border border-violet-200 px-5 py-4 flex gap-3 items-start">
          <span className="text-violet-500 text-xl shrink-0">🎯</span>
          <div>
            <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-1">Key takeaway</p>
            <p className="text-sm font-semibold text-violet-900 leading-relaxed">{keyTakeaway}</p>
          </div>
        </div>
      )}

      {/* Examiner cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ExaminerCard n={1} score={e1} color={scoreColor(e1.total)} />
        <ExaminerCard n={2} score={e2} color={scoreColor(e2.total)} />
      </div>

      {/* Feedback text */}
      {paragraphs.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm px-5 py-5">
          <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-4">Feedback</p>
          <div className="space-y-4 text-sm text-neutral-700 leading-relaxed">
            {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      )}

      {/* Language errors */}
      {feedbackData.languageErrors.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm px-5 py-5">
          <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-4">Language & spelling ({feedbackData.languageErrors.length})</p>
          <div className="space-y-3">
            {feedbackData.languageErrors.map((err, i) => <LanguageErrorCard key={i} err={err} />)}
          </div>
        </div>
      )}

      <button
        type="button" onClick={onAdvance} disabled={advancing}
        className="w-full h-12 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 active:scale-[0.98] transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
      >
        {advancing
          ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</>
          : <>Continue to targeted revision <ArrowRight size={16} /></>}
      </button>
    </div>
  );
}
