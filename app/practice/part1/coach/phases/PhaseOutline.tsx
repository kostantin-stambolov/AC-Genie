"use client";

import { useState, useRef } from "react";
import { ArrowRight } from "@/components/icons";
import type { OutlineData } from "../CoachingFlow";

type CheckResult = { argumentsSupported: boolean; argumentsDifferent: boolean; suggestion: string };

type Props = {
  attemptId: string;
  thesis: string;
  advancing: boolean;
  onAdvance: (data: OutlineData, timing: number) => Promise<void>;
};

const TIPS: Record<string, string> = {
  opening: "A strong opening introduces your topic and states your position clearly. Try: \"In this essay, I will argue that…\" or open with a short story that leads into your thesis.",
  arg1: "Your first argument should directly support your thesis. Include a specific example from your own life or something you've observed.",
  arg2: "Your second argument should be a DIFFERENT point — not a repeat of the first. Think: what else supports your thesis?",
  closing: "A strong ending echoes your first sentence. If you opened with a question, answer it here. If you opened with a personal moment, refer back to it.",
};

export function PhaseOutline({ attemptId, thesis, advancing, onAdvance }: Props) {
  const [opening, setOpening] = useState("");
  const [arg1, setArg1]       = useState("");
  const [arg2, setArg2]       = useState("");
  const [closing, setClosing] = useState("");
  const [showTip, setShowTip] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const startRef = useRef(Date.now());

  const canAdvance = opening.trim().length > 3 && arg1.trim().length > 3 && arg2.trim().length > 3 && closing.trim().length > 3;

  async function handleAdvance() {
    if (!canAdvance) return;
    setChecking(true);
    setError(null);
    try {
      const res = await fetch("/api/essay/outline-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, opening, arg1, arg2, closing }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setCheckResult(data as CheckResult);
    } catch { /* silent — don't block progress */ }
    finally { setChecking(false); }

    const timing = Math.round((Date.now() - startRef.current) / 1000);
    await onAdvance({ opening, arg1, arg2, closing, aiCheck: checkResult as unknown as Record<string, unknown> }, timing);
  }

  const showWarning = checkResult && (!checkResult.argumentsSupported || !checkResult.argumentsDifferent);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-1">Phase 2 · Outline</p>
        <h2 className="text-xl font-bold text-neutral-900 mb-1">Plan your essay structure</h2>
        <p className="text-sm text-neutral-500">Don't write full sentences — just note your key points. This is your map.</p>
      </div>

      {/* Thesis reminder */}
      {thesis && (
        <div className="bg-violet-50 rounded-2xl border border-violet-200 px-4 py-3">
          <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-1">Your thesis</p>
          <p className="text-sm font-semibold text-violet-900 leading-snug">"{thesis}"</p>
        </div>
      )}

      {/* Outline fields */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 space-y-4">
        {[
          { key: "opening", label: "Opening (1 sentence)", placeholder: "How will you introduce your topic and state your position?", value: opening, set: setOpening },
          { key: "arg1",    label: "Argument 1 (1–2 sentences)", placeholder: "First supporting point + what example will you use?", value: arg1, set: setArg1 },
          { key: "arg2",    label: "Argument 2 (1–2 sentences)", placeholder: "Second supporting point or example?", value: arg2, set: setArg2 },
          { key: "closing", label: "Closing (1 sentence)", placeholder: "How will you end? Try to connect back to your opening.", value: closing, set: setClosing },
        ].map(({ key, label, placeholder, value, set }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-neutral-800">{label}</label>
              <button type="button" onClick={() => setShowTip(showTip === key ? null : key)} className="text-[11px] text-violet-500 font-medium hover:underline cursor-pointer">
                {showTip === key ? "Hide tip" : "Need help?"}
              </button>
            </div>
            {showTip === key && (
              <p className="text-xs text-violet-700 bg-violet-50 border border-violet-100 rounded-lg px-3 py-2 mb-2 leading-relaxed">{TIPS[key]}</p>
            )}
            <textarea
              value={value} onChange={e => set(e.target.value)} placeholder={placeholder} rows={2}
              className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
            />
          </div>
        ))}
      </div>

      {showWarning && checkResult?.suggestion && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
          <p className="text-xs font-semibold text-amber-700 mb-1">One thing to consider</p>
          <p className="text-sm text-amber-800 leading-relaxed">{checkResult.suggestion}</p>
        </div>
      )}

      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      <button
        type="button"
        onClick={handleAdvance}
        disabled={!canAdvance || advancing || checking}
        className="w-full h-12 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
      >
        {checking || advancing
          ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{checking ? "Checking…" : "Saving…"}</>
          : <>Move to writing <ArrowRight size={16} /></>}
      </button>
    </div>
  );
}
