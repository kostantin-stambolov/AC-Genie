"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { EssayEditor } from "@/app/practice/part1/EssayEditor";
import type { OutlineData, PhaseTimingsData } from "../CoachingFlow";

type Props = {
  attemptId: string;
  outline: OutlineData | null;
  initialEssay: string;
  phaseTimings: PhaseTimingsData;
  advancing: boolean;
  onEssayChange: (body: string) => void;
  onAdvance: (timing: number) => Promise<void>;
};

export function PhaseWriting({ attemptId, outline, initialEssay, phaseTimings, advancing, onEssayChange, onAdvance }: Props) {
  const [timeUp, setTimeUp]       = useState(false);
  const [outlineOpen, setOutlineOpen] = useState(true);
  const [elapsed, setElapsed]     = useState(0);
  const startRef = useRef(Date.now());

  // Calculate how much time has already elapsed for this phase
  const storedElapsed = (() => {
    const timing = phaseTimings?.writing;
    if (!timing?.startedAt) return 0;
    const ms = Date.now() - new Date(timing.startedAt).getTime();
    return Math.min(1200, Math.max(0, Math.floor(ms / 1000)));
  })();

  const [initialElapsed] = useState(storedElapsed);

  useEffect(() => {
    // Auto-collapse outline after 60s
    const t = setTimeout(() => setOutlineOpen(false), 60000);
    return () => clearTimeout(t);
  }, []);

  const handleTick = useCallback((secs: number) => {
    setElapsed(secs);
  }, []);

  async function handleDone() {
    const totalElapsed = initialElapsed + elapsed;
    await onAdvance(totalElapsed);
  }

  return (
    <div className="space-y-4">
      {/* Sticky timer bar */}
      <div className="sticky top-14 z-10 bg-[#f7f8fa] pb-2 pt-0">
        <div className="flex items-center justify-between gap-3">
          <CountdownTimer
            durationSeconds={1200}
            initialElapsedSeconds={initialElapsed}
            onTimeUp={() => setTimeUp(true)}
            onTick={handleTick}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOutlineOpen(o => !o)}
              className="text-xs font-semibold text-neutral-500 bg-white border border-neutral-200 rounded-xl px-3 py-2 hover:bg-neutral-50 transition cursor-pointer"
            >
              {outlineOpen ? "Hide outline" : "Show outline"}
            </button>
          </div>
        </div>
      </div>

      {/* Time's up notification */}
      {timeUp && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 px-5 py-4">
          <p className="text-sm font-semibold text-amber-800 mb-1">⏰ Time's up!</p>
          <p className="text-sm text-amber-700">In the real exam, you'd now move to review. Let's do that.</p>
          <button
            type="button" onClick={handleDone} disabled={advancing}
            className="mt-3 h-10 px-5 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition cursor-pointer disabled:opacity-50"
          >
            Go to review →
          </button>
        </div>
      )}

      {/* Outline reference */}
      {outlineOpen && outline && (
        <div className="bg-white rounded-2xl border border-violet-100 shadow-sm px-5 py-4">
          <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-3">Your outline (read-only)</p>
          <div className="space-y-2 text-sm">
            {[
              { l: "Opening",     v: outline.opening },
              { l: "Argument 1",  v: outline.arg1 },
              { l: "Argument 2",  v: outline.arg2 },
              { l: "Closing",     v: outline.closing },
            ].map(({ l, v }) => v ? (
              <div key={l} className="flex gap-2">
                <span className="shrink-0 text-[10px] font-bold text-violet-400 uppercase tracking-widest mt-0.5 w-20">{l}</span>
                <span className="text-neutral-700 leading-relaxed">{v}</span>
              </div>
            ) : null)}
          </div>
        </div>
      )}

      {/* Phase header */}
      <div>
        <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-1">Phase 3 · Write</p>
        <h2 className="text-xl font-bold text-neutral-900 mb-1">Write your essay</h2>
        <p className="text-sm text-neutral-500">Focus. No AI help here — this is your writing, under your own steam.</p>
      </div>

      <EssayEditor
        attemptId={attemptId}
        initialBody={initialEssay}
        onBodyChange={onEssayChange}
      />

      {!timeUp && (
        <div className="flex justify-end">
          <button
            type="button" onClick={handleDone} disabled={advancing}
            className="text-sm text-neutral-400 hover:text-neutral-700 transition cursor-pointer disabled:opacity-50 underline underline-offset-2"
          >
            I'm done writing →
          </button>
        </div>
      )}
    </div>
  );
}
