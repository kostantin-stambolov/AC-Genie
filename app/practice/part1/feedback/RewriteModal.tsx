"use client";

import { useState, useCallback, useEffect } from "react";
import { Sparkles } from "@/components/icons";

type Part = { label: string; text: string };

type RewriteResult = {
  parts: Part[];
  grade: number;
  gradeReason: string;
};

type Props = {
  attemptId: string;
  open: boolean;
  onClose: () => void;
};

function gradeColor(g: number): string {
  if (g >= 6) return "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200";
  if (g >= 5) return "bg-blue-50 text-blue-800 ring-1 ring-blue-200";
  if (g >= 4) return "bg-yellow-50 text-yellow-800 ring-1 ring-yellow-200";
  return "bg-orange-50 text-orange-800 ring-1 ring-orange-200";
}

export function RewriteModal({ attemptId, open, onClose }: Props) {
  const [result, setResult] = useState<RewriteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRewrite = useCallback(async () => {
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/essay/rewrite", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error || `Request failed (${res.status})`);
        return;
      }
      const raw = data as { parts?: Part[]; grade?: number; gradeReason?: string };
      const parts = Array.isArray(raw.parts) ? raw.parts : [];
      const grade = typeof raw.grade === "number" ? raw.grade : 5;
      const gradeReason = typeof raw.gradeReason === "string" ? raw.gradeReason : "";
      setResult({ parts, grade, gradeReason });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    if (open) fetchRewrite();
  }, [open, fetchRewrite]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rewrite-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col sm:max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-violet-500" />
            <h2 id="rewrite-modal-title" className="text-base font-bold text-neutral-900">
              Model essay
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition text-sm cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-12 h-12 border-[3px] border-violet-200 border-t-violet-600 rounded-full animate-spin" />
              <p className="text-neutral-500 text-sm font-medium">Generating model essay…</p>
              <p className="text-neutral-400 text-xs">This usually takes a few seconds</p>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4">
              <p className="text-red-700 text-sm">{error}</p>
              <button
                type="button"
                onClick={fetchRewrite}
                className="mt-3 text-sm text-red-600 font-medium underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div className="space-y-6">
              <p className="text-sm text-neutral-500 leading-relaxed">
                A well-structured model essay on your topic. Labels mark the essay structure.
              </p>

              {/* Essay parts */}
              {result.parts.map((part, i) => (
                <div key={i}>
                  <span
                    className="inline-block text-xs font-bold uppercase tracking-widest text-violet-700 bg-violet-50 border border-violet-200 rounded-lg py-1.5 px-3 mb-2"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    {part.label}
                  </span>
                  <p className="text-neutral-800 text-[15px] leading-relaxed whitespace-pre-wrap">
                    {part.text}
                  </p>
                </div>
              ))}

              {/* Grade section */}
              <div className="border-t border-neutral-100 pt-5 mt-2">
                <div className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 mb-3 ${gradeColor(result.grade)}`}>
                  <span
                    className="text-xl font-bold"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    {result.grade}
                  </span>
                  <span className="text-sm font-medium opacity-70">/ 6</span>
                </div>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Why this grade</p>
                <p className="text-neutral-700 text-[15px] leading-relaxed">{result.gradeReason}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-11 rounded-xl border border-neutral-200 text-neutral-700 text-sm font-semibold hover:bg-neutral-50 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
