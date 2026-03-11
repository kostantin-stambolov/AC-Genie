"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EssayEditor } from "./EssayEditor";
import { ArrowRight } from "@/components/icons";

type Props = {
  attemptId: string;
  initialBody: string;
};

export function EssayFeedbackSection({ attemptId, initialBody }: Props) {
  const router = useRouter();
  const [currentBody, setCurrentBody] = useState(initialBody);
  const [loading, setLoading] = useState(false);
  const [abandoning, setAbandoning] = useState(false);
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

  const handleAbandon = useCallback(async () => {
    setAbandoning(true);
    try {
      await fetch("/api/attempts/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId }),
      });
    } finally {
      router.push("/home");
    }
  }, [attemptId, router]);

  const isEmpty = !currentBody.trim();
  const busy = loading || abandoning;

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

      <div className="pt-2 space-y-3">
        <button
          type="button"
          onClick={handleSubmitFeedback}
          disabled={busy || isEmpty}
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

        <button
          type="button"
          onClick={handleAbandon}
          disabled={busy}
          className="w-full h-[44px] rounded-2xl bg-[#F3F4F6] text-[#6B7280] text-[15px] font-normal hover:bg-[#E5E7EB] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
        >
          {abandoning ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-[#9CA3AF] border-t-transparent rounded-full animate-spin" />
              Записва…
            </>
          ) : (
            "Откажи и се върни към началото"
          )}
        </button>

        {error && (
          <p className="mt-1 text-[14px] text-red-600 text-center" role="alert">{error}</p>
        )}
      </div>
    </div>
  );
}
