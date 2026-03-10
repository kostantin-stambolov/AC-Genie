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

function score40Color(s40: number) {
  if (s40 >= 32) return { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", label: "Competitive score" };
  if (s40 >= 24) return { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-800",   label: "Solid foundation, room to grow" };
  if (s40 >= 16) return { bg: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-800",  label: "Keep practising" };
  return          { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-800",    label: "Focus on the basics first" };
}

function SubBar({
  label, value, max, isWeakest,
}: { label: string; value: number; max: number; isWeakest: boolean }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className={`text-xs font-semibold ${isWeakest ? "text-red-600" : "text-neutral-600"}`}>
          {label}
          {isWeakest && (
            <span className="ml-1.5 text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 rounded-full px-1.5 py-0.5">
              ← weakest
            </span>
          )}
        </span>
        <span className="text-xs font-bold text-neutral-700">{value}/{max}</span>
      </div>
      <div className="h-2 rounded-full bg-neutral-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isWeakest ? "bg-red-400" : "bg-violet-400"}`}
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
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4 flex-1">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Examiner {n}</p>
        <span className="text-lg font-black text-neutral-800">{score.total}<span className="text-sm font-semibold text-neutral-300">/20</span></span>
      </div>
      <div className="space-y-2.5">
        <SubBar label="Idea & Content" value={score.ideaContent} max={10} isWeakest={weakest === "ideaContent"} />
        <SubBar label="Structure"      value={score.structure}   max={4}  isWeakest={weakest === "structure"} />
        <SubBar label="Language"       value={score.language}    max={6}  isWeakest={weakest === "language"} />
      </div>
      {score.notes && (
        <p className="mt-3 text-xs text-neutral-500 leading-relaxed italic">"{score.notes}"</p>
      )}
    </div>
  );
}

// ── Language error card ────────────────────────────────────────────────────────

function LangErrorCard({ err }: { err: { type: string; original: string; correction: string; note?: string } }) {
  const typeColors: Record<string, string> = {
    spelling:     "bg-red-100 text-red-700 border-red-200",
    grammar:      "bg-orange-100 text-orange-700 border-orange-200",
    punctuation:  "bg-blue-100 text-blue-700 border-blue-200",
    word_choice:  "bg-violet-100 text-violet-700 border-violet-200",
  };
  const cls = typeColors[err.type?.toLowerCase()] ?? "bg-neutral-100 text-neutral-700 border-neutral-200";
  return (
    <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
      <div className="px-4 py-2 border-b border-neutral-100 flex items-center gap-2">
        <span className={`text-[10px] font-bold uppercase tracking-widest border rounded-full px-2.5 py-0.5 ${cls}`}>{err.type?.replace("_", " ")}</span>
      </div>
      <div className="px-4 py-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-1">You wrote</p>
          <p className="text-sm font-medium text-red-700 line-through">{err.original}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-1">Should be</p>
          <p className="text-sm font-bold text-emerald-700">{err.correction}</p>
        </div>
      </div>
      {err.note && <div className="px-4 pb-3"><p className="text-xs text-neutral-500 leading-relaxed">💡 {err.note}</p></div>}
    </div>
  );
}

// ── Model essay with annotations ───────────────────────────────────────────────

function AnnotationNote({ text }: { text: string }) {
  return (
    <div className="my-3 rounded-xl bg-violet-50 border border-violet-200 px-4 py-3 flex gap-2">
      <span className="text-violet-500 shrink-0 mt-0.5">✦</span>
      <p className="text-xs font-medium text-violet-800 leading-relaxed">{text.replace(/^✦\s*/, "")}</p>
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
    <div className="bg-white rounded-2xl border border-violet-100 shadow-sm px-5 py-5">
      <div className="mb-4">
        <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-1">📝 Model essay</p>
        <p className="text-sm text-neutral-500 leading-snug">
          See how a well-structured response handles this prompt. Pay attention to the highlighted observations — they address your weakest area.
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
                <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-violet-700 bg-violet-50 border border-violet-200 rounded-lg py-1 px-3 mb-2">
                  {part.label}
                </span>
                <p className="text-neutral-700 text-[15px] leading-relaxed whitespace-pre-wrap">{part.text}</p>
              </div>
              {isBody && afterBody.map((a, j) => <AnnotationNote key={`after-${j}`} text={a.text} />)}
            </div>
          );
        })}
      </div>

      {/* Model essay score */}
      <div className="mt-6 pt-4 border-t border-violet-100">
        <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-3">Model essay score (single examiner)</p>
        <div className="flex items-end gap-1.5 mb-3">
          <span className="text-3xl font-black text-emerald-600">{score.total}</span>
          <span className="text-lg font-semibold text-neutral-300 mb-0.5">/20</span>
        </div>
        <div className="space-y-2 mb-3">
          {[
            { l: "Idea & Content", v: score.ideaContent, m: 10 },
            { l: "Structure",      v: score.structure,   m: 4 },
            { l: "Language",       v: score.language,    m: 6 },
          ].map(({ l, v, m }) => (
            <div key={l}>
              <div className="flex justify-between mb-0.5">
                <span className="text-xs text-neutral-500">{l}</span>
                <span className="text-xs font-semibold text-neutral-600">{v}/{m}</span>
              </div>
              <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-400" style={{ width: `${(v / m) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-neutral-500 leading-relaxed">
          This model essay scores approximately <strong>{score.total}/20</strong> from a single examiner. Your essay averaged <strong>{studentFinalScore}/20</strong>.
          {gap > 0 && ` That's a ${gap}-point gap — that's what consistent practice closes.`}
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
        if (!res.ok) { setRwErr("Could not generate model essay."); return; }
        setRewrite(data as RewriteData);
      } catch {
        if (!cancelled) setRwErr("Could not load model essay.");
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
        <p className="text-neutral-500">Feedback data is unavailable.</p>
        <button type="button" onClick={onAdvance} disabled={advancing} className="h-12 px-6 rounded-xl bg-violet-600 text-white text-sm font-semibold cursor-pointer disabled:opacity-50">
          Continue →
        </button>
      </div>
    );
  }

  const { examiner1: e1, examiner2: e2, finalScore, arbitrated, keyTakeaway } = feedbackData.breakdown;
  const score40 = e1.total + e2.total;
  const col = score40Color(score40);
  const weakest = getWeakestDimension(e1, e2);
  const pct40 = Math.round((score40 / 40) * 100);

  const paragraphs = feedbackData.feedbackText
    ? feedbackData.feedbackText.split(/\n\n/).filter(Boolean)
    : [];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-1">Phase 5 · Score</p>
        <h2 className="text-xl font-bold text-neutral-900">Your assessment</h2>
      </div>

      {/* ── Section A: Examiner Cards ───────────────────────────────────────── */}

      {/* Two examiner cards side by side */}
      <div className="flex flex-col sm:flex-row gap-3">
        <ExaminerCard n={1} score={e1} weakest={weakest} />
        <ExaminerCard n={2} score={e2} weakest={weakest} />
      </div>

      {/* Combined / Arbitrated result */}
      {arbitrated ? (
        <div className={`rounded-2xl border ${col.border} ${col.bg} px-5 py-5`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">⚖️ Arbitrated</p>
            <span className={`text-3xl font-black ${col.text}`}>{score40}<span className="text-base font-semibold text-neutral-300 ml-0.5">/40</span></span>
          </div>
          <p className={`text-sm ${col.text} leading-relaxed mb-1`}>Examiners disagreed by 4+ points. In the real exam, an arbitrator would re-score your essay and their single score is doubled.</p>
          <p className={`text-sm font-semibold ${col.text}`}>Arbitrator score: {finalScore} × 2 = {score40} / 40</p>
        </div>
      ) : (
        <div className={`rounded-2xl border ${col.border} ${col.bg} px-5 py-5`}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-0.5">Final score</p>
              <p className={`text-xs font-semibold ${col.text}`}>{col.label}</p>
            </div>
            <span className={`text-4xl font-black ${col.text}`}>{score40}<span className="text-lg font-semibold text-neutral-300 ml-0.5">/40</span></span>
          </div>
          <p className={`text-xs ${col.text} mb-2`}>Examiner 1: {e1.total} + Examiner 2: {e2.total} = {score40} / 40</p>
          <div className="h-2.5 rounded-full bg-neutral-200 overflow-hidden">
            <div className={`h-full rounded-full ${score40 >= 32 ? "bg-emerald-500" : score40 >= 24 ? "bg-amber-500" : score40 >= 16 ? "bg-orange-500" : "bg-red-500"}`} style={{ width: `${pct40}%` }} />
          </div>
        </div>
      )}

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

      {/* ── Section B: Feedback + Language errors ──────────────────────────── */}

      {paragraphs.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm px-5 py-5">
          <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-4">Feedback</p>
          <div className="space-y-4 text-sm text-neutral-700 leading-relaxed">
            {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      )}

      {feedbackData.languageErrors.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm px-5 py-5">
          <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-4">
            Language & spelling ({feedbackData.languageErrors.length})
          </p>
          <div className="space-y-3">
            {feedbackData.languageErrors.map((err, i) => <LangErrorCard key={i} err={err} />)}
          </div>
        </div>
      )}

      {/* ── Section C: Model Essay ─────────────────────────────────────────── */}

      {rewriteLoading && (
        <div className="bg-white rounded-2xl border border-violet-100 shadow-sm px-5 py-8">
          <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-4">📝 Model essay</p>
          <div className="space-y-3 animate-pulse">
            <div className="h-3 bg-neutral-100 rounded-full w-3/4" />
            <div className="h-3 bg-neutral-100 rounded-full w-full" />
            <div className="h-3 bg-neutral-100 rounded-full w-5/6" />
            <div className="h-3 bg-neutral-100 rounded-full w-full" />
            <div className="h-3 bg-neutral-100 rounded-full w-2/3" />
          </div>
          <p className="mt-4 text-xs text-neutral-400 text-center">Generating model essay…</p>
        </div>
      )}

      {!rewriteLoading && rewriteError && (
        <div className="bg-neutral-50 rounded-2xl border border-neutral-200 px-5 py-5 text-center">
          <p className="text-sm text-neutral-500">{rewriteError}</p>
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
        className="w-full h-12 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 active:scale-[0.98] transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
      >
        {advancing
          ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</>
          : <>Continue to reflection <ArrowRight size={16} /></>}
      </button>
    </div>
  );
}
