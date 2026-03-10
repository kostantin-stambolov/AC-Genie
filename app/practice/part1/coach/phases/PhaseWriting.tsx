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
      <div className="sticky top-14 z-10 bg-[#F0F2F5] pb-2 pt-0">
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
              className="text-[13px] font-semibold text-[#6B7280] bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 hover:bg-[#F3F4F6] transition cursor-pointer"
            >
              {outlineOpen ? "Скрий плана" : "Покажи плана"}
            </button>
          </div>
        </div>
      </div>

      {/* Time's up notification */}
      {timeUp && (
        <div className="bg-amber-50 rounded-3xl border border-amber-200 px-5 py-4">
          <p className="text-[15px] font-semibold text-amber-800 mb-1">⏰ Времето изтече!</p>
          <p className="text-[15px] text-amber-700">На реалния изпит сега ще преминеш към самопроверка. Нека го направим.</p>
          <button
            type="button" onClick={handleDone} disabled={advancing}
            className="mt-3 h-[52px] px-6 rounded-2xl bg-[#0B1F3A] text-white text-[15px] font-semibold hover:bg-[#122a50] shadow-md transition cursor-pointer disabled:opacity-50"
          >
            Към самопроверката →
          </button>
        </div>
      )}

      {/* Outline reference */}
      {outlineOpen && outline && (
        <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] px-5 py-4">
          <p className="text-[12px] font-bold text-indigo-500 uppercase tracking-widest mb-3">Твоят план (само за четене)</p>
          <div className="space-y-2">
            {[
              { l: "Начало",      v: outline.opening },
              { l: "Аргумент 1",  v: outline.arg1 },
              { l: "Аргумент 2",  v: outline.arg2 },
              { l: "Заключение",  v: outline.closing },
            ].map(({ l, v }) => v ? (
              <div key={l} className="flex gap-2">
                <span className="shrink-0 text-[12px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5 w-20">{l}</span>
                <span className="text-[15px] text-[#6B7280] leading-relaxed">{v}</span>
              </div>
            ) : null)}
          </div>
        </div>
      )}

      {/* Phase header */}
      <div>
                <h2 className="text-[22px] font-semibold text-[#111827] mb-1 tracking-tight">Напиши есето си</h2>
        <p className="text-[15px] text-[#6B7280]">Концентрирай се. Без AI помощ тук — това е твоето писане, с твоите сили.</p>
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
            className="text-[15px] text-[#9CA3AF] hover:text-[#6B7280] transition cursor-pointer disabled:opacity-50 underline underline-offset-2"
          >
            Приключих с писането →
          </button>
        </div>
      )}
    </div>
  );
}
