"use client";

import { useState, useCallback, useEffect } from "react";

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rewrite-modal-title"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h2 id="rewrite-modal-title" className="text-lg font-semibold text-neutral-900">
            Model essay — structure
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-neutral-600">Generating model essay…</p>
            </div>
          )}
          {error && (
            <p className="text-red-600 text-sm" role="alert">
              {error}
            </p>
          )}
          {result && !loading && (
            <div className="space-y-6">
              <p className="text-sm text-neutral-600">
                Below is an example of a well-structured essay on your topic. Labels show the structure.
              </p>
              {result.parts.map((part, i) => (
                <div key={i} className="space-y-2">
                  <span
                    className="block text-xs font-bold uppercase tracking-widest text-blue-800 bg-blue-50 py-1.5 px-3 rounded border border-blue-200"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    {part.label}
                  </span>
                  <div className="text-neutral-800 text-[15px] leading-relaxed whitespace-pre-wrap">
                    {part.text}
                  </div>
                </div>
              ))}

              <div className="pt-4 mt-6 border-t border-neutral-200 space-y-2">
                <span
                  className="block text-xs font-bold uppercase tracking-widest text-green-800 bg-green-50 py-1.5 px-3 rounded border border-green-200 w-fit"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  Grade
                </span>
                <p className="text-lg font-semibold text-neutral-900">
                  {result.grade} / 6
                </p>
                <p className="text-sm font-medium text-neutral-600 mt-1">Why this grade</p>
                <p className="text-neutral-700 text-[15px] leading-relaxed">
                  {result.gradeReason}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
