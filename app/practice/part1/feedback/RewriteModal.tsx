"use client";

import { useState, useCallback, useEffect } from "react";
import { Sparkles } from "@/components/icons";

type Part = { label: string; text: string };

type RewriteScore = {
  ideaContent: number;
  structure: number;
  language: number;
  total: number;
};

type RewriteResult = {
  parts: Part[];
  score: RewriteScore;
  scoreReason: string;
};

type Props = {
  attemptId: string;
  open: boolean;
  onClose: () => void;
};

function totalScoreStyle(total: number): string {
  if (total >= 18) return "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200";
  if (total >= 15) return "bg-blue-50 text-blue-800 ring-1 ring-blue-200";
  if (total >= 12) return "bg-yellow-50 text-yellow-800 ring-1 ring-yellow-200";
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
      const raw = data as { parts?: Part[]; score?: RewriteScore; scoreReason?: string };
      const parts = Array.isArray(raw.parts) ? raw.parts : [];
      const score: RewriteScore = raw.score && typeof raw.score === "object"
        ? {
            ideaContent: typeof raw.score.ideaContent === "number" ? raw.score.ideaContent : 7,
            structure:   typeof raw.score.structure   === "number" ? raw.score.structure   : 3,
            language:    typeof raw.score.language    === "number" ? raw.score.language    : 5,
            total:       typeof raw.score.total       === "number" ? raw.score.total       : 15,
          }
        : { ideaContent: 7, structure: 3, language: 5, total: 15 };
      const scoreReason = typeof raw.scoreReason === "string" ? raw.scoreReason : "";
      setResult({ parts, score, scoreReason });
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
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col sm:max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F4F6] shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-500" />
            <h2 id="rewrite-modal-title" className="text-[18px] font-semibold text-[#111827]">
              Примерно есе
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#111827] transition text-[15px] cursor-pointer"
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
              <div className="w-12 h-12 border-[3px] border-indigo-100 border-t-[#0B1F3A] rounded-full animate-spin" />
              <p className="text-[#6B7280] text-[15px] font-medium">Генерира примерно есе…</p>
              <p className="text-[#9CA3AF] text-[13px]">Обикновено отнема няколко секунди</p>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-4">
              <p className="text-red-700 text-[15px]">{error}</p>
              <button
                type="button"
                onClick={fetchRewrite}
                className="mt-3 text-[15px] text-red-600 font-medium underline"
              >
                Опитай отново
              </button>
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div className="space-y-6">
              <p className="text-[15px] text-[#6B7280] leading-relaxed">
                Добре структурирано примерно есе по твоята тема. Етикетите показват структурата на есето.
              </p>

              {/* Essay parts */}
              {result.parts.map((part, i) => (
                <div key={i}>
                  <span className="inline-block text-[12px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-xl py-1.5 px-3 mb-2">
                    {part.label}
                  </span>
                  <p className="text-[#111827] text-[15px] leading-relaxed whitespace-pre-wrap">
                    {part.text}
                  </p>
                </div>
              ))}

              {/* Score section */}
              <div className="border-t border-[#F3F4F6] pt-5 mt-2">
                <div className={`inline-flex items-center gap-2.5 rounded-2xl px-4 py-2.5 mb-4 ${totalScoreStyle(result.score.total)}`}>
                  <span className="text-2xl font-bold">{result.score.total}</span>
                  <span className="text-[15px] font-medium opacity-70">/ 20</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: "Идея и съдържание", value: result.score.ideaContent, max: 10 },
                    { label: "Структура",         value: result.score.structure,   max: 4  },
                    { label: "Език",              value: result.score.language,    max: 6  },
                  ].map((sub) => (
                    <div key={sub.label} className="bg-[#F9FAFB] rounded-2xl p-3 text-center">
                      <p className="text-[12px] text-[#9CA3AF] font-medium mb-1 leading-tight">{sub.label}</p>
                      <p className="text-[18px] font-semibold text-[#111827]">{sub.value}<span className="text-[13px] font-normal text-[#9CA3AF]">/{sub.max}</span></p>
                    </div>
                  ))}
                </div>
                <p className="text-[12px] font-bold text-[#9CA3AF] mb-1">Защо тази оценка</p>
                <p className="text-[#6B7280] text-[15px] leading-relaxed">{result.scoreReason}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F3F4F6] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-[50px] rounded-2xl bg-[#F3F4F6] text-[#6B7280] text-[15px] font-normal hover:bg-[#E5E7EB] transition cursor-pointer"
          >
            Затвори
          </button>
        </div>
      </div>
    </div>
  );
}
