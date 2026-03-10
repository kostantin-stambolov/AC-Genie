"use client";

import { useState, useRef } from "react";
import { ArrowRight } from "@/components/icons";
import type { PromptData, ComprehensionData } from "../CoachingFlow";

type CheckResult = {
  promptUnderstood: boolean; promptNote: string;
  thesisSpecific: boolean;   thesisSuggestion: string;
  exampleRelevant: boolean;  exampleNote: string;
  encouragement: string;
};

type Props = {
  attemptId: string;
  prompt: PromptData;
  advancing: boolean;
  onAdvance: (data: ComprehensionData, timing: number) => Promise<void>;
};

function StatusPill({ ok, note }: { ok: boolean; note?: string }) {
  if (ok) return <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">✓ Добре</span>;
  return (
    <div className="mt-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5">
      <p className="text-xs font-semibold text-amber-700 mb-1">Предложение</p>
      <p className="text-sm text-amber-800 leading-relaxed">{note}</p>
    </div>
  );
}

export function PhaseComprehension({ attemptId, prompt, advancing, onAdvance }: Props) {
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [checkCount, setCheckCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const startRef = useRef(Date.now());

  const canCheck = q1.trim().length > 5 && q2.trim().length > 5 && q3.trim().length > 5;
  const allPass = checkResult?.promptUnderstood && checkResult.thesisSpecific && checkResult.exampleRelevant;
  const canAdvance = checkResult !== null && (allPass || checkCount >= 2);

  async function handleCheck() {
    setChecking(true);
    setError(null);
    try {
      const res = await fetch("/api/essay/comprehension-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, q1, q2, q3 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError((data as {error?:string}).error ?? "Check failed"); return; }
      setCheckResult(data as CheckResult);
      setCheckCount(c => c + 1);
          } catch { setError("Нещо се обърка. Моля, опитай отново."); }
    finally { setChecking(false); }
  }

  async function handleAdvance() {
    const timing = Math.round((Date.now() - startRef.current) / 1000);
    await onAdvance({ q1, q2, q3, aiCheck: checkResult as unknown as Record<string, unknown> }, timing);
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-1">Фаза 1 · Разбери темата</p>
        <h2 className="text-xl font-bold text-neutral-900 mb-1">Прочети внимателно и отговори на три въпроса</h2>
        <p className="text-sm text-neutral-500">Преди да напишеш и дума, увери се, че разбираш точно какво се иска от теб.</p>
      </div>

      {/* Prompt display */}
      <div className="bg-white rounded-2xl border border-violet-100 shadow-sm px-5 py-5">
        <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-3">Твоята тема</p>
        <h3 className="font-bold text-neutral-900 text-base mb-2">{prompt.title}</h3>
        {prompt.body && <p className="text-neutral-700 text-sm leading-relaxed mb-2 whitespace-pre-wrap">{prompt.body}</p>}
        {prompt.instruction && <p className="text-neutral-500 text-sm leading-relaxed italic">{prompt.instruction}</p>}
      </div>

      {/* Three questions */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 space-y-5">
        <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">Твоите отговори</p>

        {[
          { label: "1. Какво се иска от теб в тази тема?", value: q1, set: setQ1, placeholder: "напр. Да изразя позиция дали нещо видимо или невидимо е по-важно…", check: checkResult ? { ok: checkResult.promptUnderstood, note: checkResult.promptNote } : null },
          { label: "2. Каква е твоята позиция или основна идея?", value: q2, set: setQ2, placeholder: "напр. Вярвам, че приятелството е най-важно, защото оформя кои ставаме…", check: checkResult ? { ok: checkResult.thesisSpecific, note: checkResult.thesisSuggestion } : null },
          { label: "3. Какъв личен опит или пример може да подкрепи идеята ти?", value: q3, set: setQ3, placeholder: "напр. Когато приятелят ми ми помогна след като се провалих на изпит…", check: checkResult ? { ok: checkResult.exampleRelevant, note: checkResult.exampleNote } : null },
        ].map(({ label, value, set, placeholder, check }) => (
          <div key={label}>
            <label className="block text-sm font-semibold text-neutral-800 mb-2">{label}</label>
            <textarea
              value={value} onChange={e => set(e.target.value)}
              placeholder={placeholder} rows={2}
              className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
            />
            {check && <div className="mt-1.5"><StatusPill ok={check.ok} note={check.note || undefined} /></div>}
          </div>
        ))}

        {checkResult?.encouragement && (
          <div className="rounded-xl bg-violet-50 border border-violet-100 px-4 py-3">
            <p className="text-sm text-violet-800 leading-relaxed">💬 {checkResult.encouragement}</p>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600 text-center" role="alert">{error}</p>}

      <div className="flex flex-col gap-3">
        {!canAdvance && (
          <button
            type="button"
            onClick={handleCheck}
            disabled={!canCheck || checking}
            className="w-full h-12 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {checking ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Проверява…</> : "Провери разбирането ми"}
          </button>
        )}
        {canAdvance && (
          <button
            type="button"
            onClick={handleAdvance}
            disabled={advancing}
            className="w-full h-12 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 active:scale-[0.98] transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {advancing ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Записва…</> : <>Към планирането <ArrowRight size={16} /></>}
          </button>
        )}
        {!canAdvance && checkCount >= 1 && !allPass && (
          <button
            type="button"
            onClick={handleAdvance}
            disabled={advancing}
            className="w-full h-11 rounded-xl border border-neutral-200 bg-white text-neutral-600 text-sm font-medium hover:bg-neutral-50 transition cursor-pointer"
          >
            Продължи въпреки това →
          </button>
        )}
      </div>
    </div>
  );
}
