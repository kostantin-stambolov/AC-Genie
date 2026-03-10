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
  comprehension: "Understand",
  outline:       "Outline",
  writing:       "Write",
  review:        "Review",
  feedback:      "Score",
  reflect:       "Reflect",
  completed:     "Done",
};
const PHASE_ICONS: Record<CoachPhase, string> = {
  comprehension: "💡",
  outline:       "📝",
  writing:       "✍️",
  review:        "🔍",
  feedback:      "📊",
  reflect:       "🪞",
  completed:     "✅",
};

function PhaseBar({ current }: { current: CoachPhase }) {
  const currentIdx = PHASE_ORDER.indexOf(current);
  return (
    <div className="bg-white border-b border-neutral-100 px-4 py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-1">
        {PHASE_ORDER.map((ph, i) => {
          const done   = i < currentIdx;
          const active = i === currentIdx;
          return (
            <div key={ph} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                  done   ? "bg-violet-600 text-white" :
                  active ? "bg-violet-100 ring-2 ring-violet-500 ring-offset-1 text-violet-700" :
                           "bg-neutral-100 text-neutral-400"
                }`}>
                  {done ? "✓" : PHASE_ICONS[ph]}
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-widest leading-none hidden sm:block ${
                  active ? "text-violet-600" : done ? "text-violet-400" : "text-neutral-300"
                }`}>
                  {PHASE_LABELS[ph]}
                </span>
              </div>
              {i < PHASE_ORDER.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all ${done ? "bg-violet-400" : "bg-neutral-200"}`} />
              )}
            </div>
          );
        })}
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
      <PhaseBar current={phase} />

      {/* Topic banner — visible on every phase */}
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-start gap-2.5">
          <span className="shrink-0 mt-0.5 text-[10px] font-bold text-violet-400 uppercase tracking-widest whitespace-nowrap">Topic</span>
          <span className="text-sm font-semibold text-neutral-700 leading-snug line-clamp-2">{prompt.title}</span>
        </div>
      </div>

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
        {phase === "reflect" && (
          <PhaseReflect
            feedbackData={feedData} phaseTimings={timings} advancing={advancing}
            onAdvance={async (reflection) => {
              await advancePhase("completed", { reflection });
            }}
          />
        )}
      </main>
    </div>
  );
}
