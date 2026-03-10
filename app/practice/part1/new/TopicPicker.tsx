"use client";

import { useState } from "react";
import type { EssayPrompt } from "@/lib/essay-prompts";
import { ChevronRight } from "@/components/icons";

function formatPromptForStorage(p: EssayPrompt): string {
  return JSON.stringify({ title: p.title, instruction: p.instruction, body: p.body });
}

const TOPIC_COLORS = [
  { border: "border-violet-200", badge: "bg-violet-100 text-violet-700", dot: "bg-violet-400" },
  { border: "border-indigo-200", badge: "bg-indigo-100 text-indigo-700", dot: "bg-indigo-400" },
  { border: "border-sky-200",    badge: "bg-sky-100 text-sky-700",       dot: "bg-sky-400" },
];

type Props = { options: EssayPrompt[]; coachingMode?: "v1" | "v2" };

export function TopicPicker({ options, coachingMode = "v1" }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSelect(prompt: EssayPrompt) {
    setError(null);
    setLoading(prompt.id);
    try {
      const res = await fetch("/api/attempts/start", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ part: 1, promptText: formatPromptForStorage(prompt), coachingMode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoading(null);
        setError((data as { error?: string }).error || `Request failed (${res.status})`);
        return;
      }
      const attemptId = (data as { attempt?: { id?: string } }).attempt?.id;
      if (!attemptId) {
        setLoading(null);
                    setError("Невалиден отговор от сървъра.");
        return;
      }
      window.location.href = coachingMode === "v2"
        ? `/practice/part1/coach?attemptId=${attemptId}`
        : `/practice/part1?attemptId=${attemptId}`;
    } catch (e) {
      setLoading(null);
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}
      <ul className="space-y-3">
        {options.map((prompt, idx) => {
          const color = TOPIC_COLORS[idx % TOPIC_COLORS.length];
          const isLoading = loading === prompt.id;
          const isDisabled = loading !== null;
          return (
            <li key={prompt.id}>
              <button
                type="button"
                onClick={() => handleSelect(prompt)}
                disabled={isDisabled}
                className={`w-full text-left bg-white rounded-2xl border-2 ${color.border} p-5 hover:shadow-md active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer group`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-0.5 ${color.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
                        Тема {idx + 1}
                      </span>
                    </div>
                    <h3 className="font-semibold text-neutral-900 text-base mb-1.5 leading-snug">{prompt.title}</h3>
                    <p className="text-sm text-neutral-500 line-clamp-2 leading-relaxed">{prompt.body}</p>
                  </div>
                  <div className="shrink-0 mt-1">
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ChevronRight size={20} className="text-neutral-300 group-hover:text-violet-500 transition" />
                    )}
                  </div>
                </div>
                {isLoading && (
                  <p className="text-xs text-violet-600 mt-3 font-medium">
                    {coachingMode === "v2" ? "Отваря обучителна сесия…" : "Отваря есето…"}
                  </p>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
