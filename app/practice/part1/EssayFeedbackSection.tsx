"use client";

import { useState, useCallback } from "react";
import { EssayEditor } from "./EssayEditor";

type Props = {
  attemptId: string;
  initialBody: string;
};

export function EssayFeedbackSection({ attemptId, initialBody }: Props) {
  const [currentBody, setCurrentBody] = useState(initialBody);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitFeedback = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/essay/feedback", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, essayBody: currentBody }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error || `Request failed (${res.status})`);
        return;
      }
      window.location.href = `/practice/part1/feedback?attemptId=${attemptId}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [attemptId, currentBody]);

  return (
    <div className="space-y-6">
      <section aria-label="Essay input">
        <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
          Your essay
        </h2>
        <EssayEditor
          attemptId={attemptId}
          initialBody={initialBody}
          onBodyChange={setCurrentBody}
        />
      </section>

      <div>
        <button
          type="button"
          onClick={handleSubmitFeedback}
          disabled={loading}
          className="w-full h-12 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Analyzing…" : "Submit for feedback"}
        </button>
        {error && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
