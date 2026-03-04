"use client";

import { useState } from "react";
import type { EssayPrompt } from "@/lib/essay-prompts";

function formatPromptForStorage(p: EssayPrompt): string {
  return JSON.stringify({
    title: p.title,
    instruction: p.instruction,
    body: p.body,
  });
}

export function TopicPicker({ options }: { options: EssayPrompt[] }) {
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
        body: JSON.stringify({
          part: 1,
          promptText: formatPromptForStorage(prompt),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoading(null);
        const msg = (data as { error?: string }).error;
        setError(msg || `Request failed (${res.status})`);
        return;
      }
      const attemptId = (data as { attempt?: { id?: string } }).attempt?.id;
      if (!attemptId) {
        setLoading(null);
        setError("Invalid response from server.");
        return;
      }
      // Full page navigation so we always land on the essay page
      window.location.href = `/practice/part1?attemptId=${attemptId}`;
    } catch (e) {
      setLoading(null);
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </div>
      )}
      <ul className="space-y-3">
      {options.map((prompt) => (
        <li key={prompt.id}>
          <button
            type="button"
            onClick={() => handleSelect(prompt)}
            disabled={loading !== null}
            className="w-full text-left bg-white rounded-xl border border-neutral-200 p-4 hover:border-blue-400 hover:bg-blue-50/50 transition-colors disabled:opacity-60"
          >
            <span className="font-medium text-neutral-900 block mb-1">
              {prompt.title}
            </span>
            <span className="text-sm text-neutral-600 line-clamp-2">
              {prompt.body}
            </span>
            {loading === prompt.id ? (
              <span className="text-sm text-blue-600 mt-2 block">Taking you to Part 1 Essay…</span>
            ) : (
              <span className="text-xs text-neutral-500 mt-2 block">Select to open Part 1 Essay page</span>
            )}
          </button>
        </li>
      ))}
      </ul>
    </div>
  );
}
