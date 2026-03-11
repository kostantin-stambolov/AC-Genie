"use client";

import { useState, useCallback } from "react";
import { EssayEditor } from "./EssayEditor";
import { ArrowRight } from "@/components/icons";

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

  const isEmpty = !currentBody.trim();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[12px] font-bold text-indigo-500 uppercase tracking-widest mb-3">Твоето есе</p>
        <EssayEditor
          attemptId={attemptId}
          initialBody={initialBody}
          onBodyChange={setCurrentBody}
        />
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={handleSubmitFeedback}
          disabled={loading || isEmpty}
          className="w-full h-[52px] rounded-2xl bg-[#0B1F3A] text-white text-[15px] font-semibold hover:bg-[#122a50] hover:-translate-y-0.5 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Анализира есето ти…
            </>
          ) : (
            <>Изпрати за обратна връзка <ArrowRight size={16} /></>
          )}
        </button>
        {isEmpty && !loading && (
          <p className="mt-2 text-[12px] text-[#9CA3AF] text-center">Напиши нещо, преди да изпратиш</p>
        )}
        {error && (
          <p className="mt-3 text-[14px] text-red-600 text-center" role="alert">{error}</p>
        )}
      </div>
    </div>
  );
}
