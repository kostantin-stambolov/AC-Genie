"use client";

import { useState } from "react";
import { PhaseComprehension } from "./phases/PhaseComprehension";
import { PhaseOutline }       from "./phases/PhaseOutline";
import { PhaseWriting }       from "./phases/PhaseWriting";
import { PhaseReview }        from "./phases/PhaseReview";
import { PhaseFeedback }      from "./phases/PhaseFeedback";
import { PhaseReflect }       from "./phases/PhaseReflect";

export type CoachPhase = "comprehension" | "outline" | "writing" | "review" | "feedback" | "reflect" | "completed";

export type PromptData        = { title: string; instruction: string; body: string };
export type ComprehensionData = { q1: string; q2: string; q3: string; aiCheck?: Record<string, unknown> };
export type OutlineData       = { opening: string; arg1: string; arg2: string; closing: string; aiCheck?: Record<string, unknown> };
export type SelfReviewData    = { q1: boolean; q2: boolean; q3: boolean; q4: boolean; q5: boolean; q6: boolean };
export type PhaseTimingsData  = Record<string, { startedAt?: string; completedAt?: string; seconds?: number; timerExpired?: boolean }>;
export type ExaminerScore     = { ideaContent: number; structure: number; language: number; total: number; notes?: string };
export type FeedbackData      = {
  breakdown: { examiner1: ExaminerScore; examiner2: ExaminerScore; finalScore: number; arbitrated: boolean; keyTakeaway?: string } | null;
  feedbackText: string;
  languageErrors: Array<{ type: string; original: string; correction: string; note?: string }>;
};

type Props = {
  attemptId: string;
  initialPhase: CoachPhase;
  prompt: PromptData;
  essayBody: string;
  comprehensionData: ComprehensionData | null;
  outlineData: OutlineData | null;
  selfReviewData: SelfReviewData | null;
  phaseTimings: PhaseTimingsData | null;
  existingFeedback: FeedbackData | null;
};

const PHASE_ORDER: CoachPhase[] = ["comprehension", "outline", "writing", "review", "feedback", "reflect"];
const PHASE_LABELS: Record<CoachPhase, string> = {
  comprehension: "Разбери",
  outline:       "Планирай",
  writing:       "Пиши",
  review:        "Провери",
  feedback:      "Оценка",
  reflect:       "Размисли",
  completed:     "Готово",
};
const PHASE_FULL_LABELS: Record<CoachPhase, string> = {
  comprehension: "Разбери темата",
  outline:       "Планирай есето",
  writing:       "Пиши есето",
  review:        "Провери есето",
  feedback:      "Оценка",
  reflect:       "Размисли",
  completed:     "Готово",
};

function PhaseBar({ current, topic }: { current: CoachPhase; topic: string }) {
  const effectivePhase = current === "completed" ? "reflect" : current;
  const currentIdx = PHASE_ORDER.indexOf(effectivePhase);
  const phaseNumber = currentIdx + 1;
  const total = PHASE_ORDER.length;

  const r = 16;
  const cx = 20;
  const cy = 20;
  const circumference = 2 * Math.PI * r;
  const progress = phaseNumber / total;
  const dashoffset = circumference * (1 - progress);

  return (
    <div className="bg-[#F0F2F5] px-4 pt-4 pb-2">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] px-4 py-3 flex items-center gap-3">
          {/* Circular progress */}
          <div className="shrink-0 relative w-10 h-10">
            <svg width="40" height="40" className="-rotate-90">
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E5E7EB" strokeWidth="3" />
              <circle
                cx={cx} cy={cy} r={r} fill="none"
                stroke="#0B1F3A" strokeWidth="3"
                strokeDasharray={circumference}
                strokeDashoffset={dashoffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold text-[#0B1F3A]">
              {phaseNumber}
            </span>
          </div>

          {/* Topic (main title) + phase name + counter */}
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-bold text-[#111827] leading-tight line-clamp-2">{topic}</p>
            <p className="text-[12px] text-[#9CA3AF] mt-0.5">{PHASE_FULL_LABELS[current]} · {phaseNumber} от {total}</p>
          </div>

          {/* Dot progress */}
          <div className="flex items-center gap-1.5 shrink-0">
            {PHASE_ORDER.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i < currentIdx
                    ? "w-2 h-2 bg-[#0B1F3A]"
                    : i === currentIdx
                    ? "w-2.5 h-2.5 bg-[#0B1F3A]"
                    : "w-2 h-2 bg-[#D1D5DB]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CoachingFlow({
  attemptId, initialPhase, prompt, essayBody,
  comprehensionData, outlineData, selfReviewData, phaseTimings, existingFeedback,
}: Props) {
  const [phase, setPhase]         = useState<CoachPhase>(initialPhase);
  const [compData, setCompData]   = useState<ComprehensionData | null>(comprehensionData);
  const [outData, setOutData]     = useState<OutlineData | null>(outlineData);
  const [timings, setTimings]     = useState<PhaseTimingsData>(phaseTimings ?? {});
  const [feedData, setFeedData]   = useState<FeedbackData | null>(existingFeedback);
  const [advancing, setAdvancing] = useState(false);
  const [essay, setEssay]         = useState(essayBody);

  async function advancePhase(
    nextPhase: CoachPhase,
    data?: Record<string, unknown>,
    timing?: number
  ) {
    setAdvancing(true);
    try {
      await fetch("/api/essay/advance-phase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, phase: nextPhase, data, timingSeconds: timing }),
      });
      setPhase(nextPhase);
    } finally {
      setAdvancing(false);
    }
  }

  return (
    <div>
      <PhaseBar current={phase} topic={prompt.title} />



      <main className="max-w-2xl mx-auto px-4 py-8">
        {phase === "comprehension" && (
          <PhaseComprehension
            attemptId={attemptId} prompt={prompt} advancing={advancing}
            onAdvance={async (data, timing) => {
              setCompData(data as ComprehensionData);
              await advancePhase("outline", data, timing);
            }}
          />
        )}
        {phase === "outline" && (
          <PhaseOutline
            attemptId={attemptId} thesis={compData?.q2 ?? ""} advancing={advancing}
            onAdvance={async (data, timing) => {
              setOutData(data as OutlineData);
              await advancePhase("writing", data, timing);
            }}
          />
        )}
        {phase === "writing" && (
          <PhaseWriting
            attemptId={attemptId} outline={outData} initialEssay={essay}
            phaseTimings={timings} advancing={advancing}
            onEssayChange={setEssay}
            onAdvance={async (timing) => {
              const newTimings = { ...timings };
              if (newTimings.writing) newTimings.writing.seconds = timing;
              setTimings(newTimings);
              await advancePhase("review", undefined, timing);
            }}
          />
        )}
        {phase === "review" && (
          <PhaseReview
            attemptId={attemptId} essayBody={essay} advancing={advancing}
            onAdvance={async (selfReview, feedbackResult, timing) => {
              setFeedData(feedbackResult);
              await advancePhase("feedback", selfReview as unknown as Record<string, unknown>, timing);
            }}
          />
        )}
        {phase === "feedback" && (
          <PhaseFeedback
            attemptId={attemptId} feedbackData={feedData} advancing={advancing}
            onAdvance={async () => await advancePhase("reflect")}
          />
        )}
        {(phase === "reflect" || phase === "completed") && (
          <PhaseReflect
            feedbackData={feedData} phaseTimings={timings} advancing={advancing}
            initialDone={phase === "completed"}
            onAdvance={async (reflection) => {
              await advancePhase("completed", { reflection });
            }}
          />
        )}
      </main>
    </div>
  );
}
