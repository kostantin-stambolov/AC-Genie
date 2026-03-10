"use client";

import { useState } from "react";
import type { EssayPrompt } from "@/lib/essay-prompts";
import { ModeSelector } from "./ModeSelector";
import { TopicPicker } from "./TopicPicker";

export function NewEssayFlow({ options }: { options: EssayPrompt[] }) {
  const [mode, setMode] = useState<"v1" | "v2" | null>(null);

  if (!mode) {
    return (
      <div>
        <div className="mb-8">
          <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-1">Step 1 of 2</p>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">How do you want to practise?</h1>
          <p className="text-neutral-500 text-sm">Choose your practice mode, then pick a topic.</p>
        </div>
        <ModeSelector onSelect={setMode} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <button
            type="button"
            onClick={() => setMode(null)}
            className="text-[10px] font-bold text-violet-400 uppercase tracking-widest hover:text-violet-600 transition cursor-pointer"
          >
            ← Change mode
          </button>
          <span className="text-[10px] text-neutral-300 font-bold uppercase tracking-widest">· Step 2 of 2</span>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Choose your essay topic</h1>
        <p className="text-neutral-500 text-sm">
          Three topics have been generated for you. Pick the one that speaks to you most.
        </p>
      </div>
      <TopicPicker options={options} coachingMode={mode} />
    </div>
  );
}
