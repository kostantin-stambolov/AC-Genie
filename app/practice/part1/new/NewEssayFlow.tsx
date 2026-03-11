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
          <p className="text-[12px] font-bold text-indigo-500 uppercase tracking-widest mb-1">Стъпка 1 от 2</p>
          <h1 className="text-[26px] font-semibold text-[#111827] mb-2 tracking-tight">Как искаш да тренираш?</h1>
          <p className="text-[#6B7280] text-[15px]">Избери режим на практика, след което избери тема.</p>
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
            className="text-[12px] font-bold text-indigo-400 uppercase tracking-widest hover:text-indigo-600 transition cursor-pointer"
          >
            ← Промени режима
          </button>
          <span className="text-[12px] text-[#9CA3AF] font-bold uppercase tracking-widest">· Стъпка 2 от 2</span>
        </div>
        <h1 className="text-[26px] font-semibold text-[#111827] mb-2 tracking-tight">Избери тема за есето</h1>
        <p className="text-[#6B7280] text-[15px]">
          Три теми са избрани специално за теб. Избери тази, която те вдъхновява най-много.
        </p>
      </div>
      <TopicPicker options={options} coachingMode={mode} />
    </div>
  );
}
