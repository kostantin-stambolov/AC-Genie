"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowRight, CheckCircle, AlertCircle, Sparkles } from "@/components/icons";
import { DictateButton } from "@/components/DictateButton";
import type { PromptData, ComprehensionData } from "../CoachingFlow";

type CheckResult = {
  promptUnderstood: boolean; promptNote: string;
  thesisSpecific: boolean;   thesisSuggestion: string;
  exampleRelevant: boolean;  exampleNote: string;
  encouragement: string;
};

type QuestionFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  onTranscribed: (text: string) => void;
  check: { ok: boolean; note?: string } | null;
};

function QuestionField({ label, value, placeholder, onChange, onTranscribed, check }: QuestionFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea to fit content
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.max(80, el.scrollHeight) + "px";
  }, [value]);

  const borderClass = check
    ? check.ok
      ? "border-emerald-400 ring-1 ring-emerald-200"
      : "border-amber-400 ring-1 ring-amber-200"
    : "border-[#E5E7EB] focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-indigo-400";

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-[15px] font-semibold text-[#111827]">{label}</label>
        <DictateButton onTranscribed={onTranscribed} />
      </div>

      <div className={`rounded-2xl border-2 overflow-hidden transition-all ${borderClass}`}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-4 py-3 text-[15px] text-[#111827] placeholder:text-[#D1D5DB] focus:outline-none resize-none bg-white block overflow-hidden"
        />

        {check && (
          <>
            <div className={`border-t ${check.ok ? "border-emerald-200" : "border-amber-200"}`} />
            <div className={`px-4 py-3 ${check.ok ? "bg-emerald-50/60" : "bg-amber-50/40"}`}>
              <div className="flex items-start gap-2.5">
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  check.ok ? "bg-emerald-100" : "bg-amber-100"
                }`}>
                  {check.ok
                    ? <CheckCircle size={14} className="text-emerald-600" />
                    : <AlertCircle size={14} className="text-amber-600" />
                  }
                </div>

                {/* Bubble */}
                <div className="flex-1 min-w-0">
                  <p className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${
                    check.ok ? "text-emerald-600" : "text-amber-600"
                  }`}>Наставник</p>
                  <div className={`rounded-2xl rounded-tl-sm px-3 py-2 inline-block ${
                    check.ok
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    <p className="text-[14px] leading-relaxed">
                      {check.ok ? "Добре — отговорът е ясен и конкретен." : check.note}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

type Props = {
  attemptId: string;
  prompt: PromptData;
  advancing: boolean;
  onAdvance: (data: ComprehensionData, timing: number) => Promise<void>;
};

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

  const append = useCallback((set: React.Dispatch<React.SetStateAction<string>>) =>
    (text: string) => set(v => v ? v + " " + text : text), []);

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
        <h2 className="text-[22px] font-semibold text-[#111827] mb-1 tracking-tight">Прочети внимателно и отговори на три въпроса</h2>
        <p className="text-[15px] text-[#6B7280]">Преди да напишеш и дума, увери се, че разбираш точно какво се иска от теб.</p>
      </div>

      {/* Prompt display */}
      <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] px-5 py-5">
        <p className="text-[12px] font-bold text-indigo-500 uppercase tracking-widest mb-3">Твоята тема</p>
        <h3 className="font-semibold text-[#111827] text-[18px] mb-2">{prompt.title}</h3>
        {prompt.body && <p className="text-[#6B7280] text-[15px] leading-relaxed mb-2 whitespace-pre-wrap">{prompt.body}</p>}
        {prompt.instruction && <p className="text-[#9CA3AF] text-[15px] leading-relaxed italic">{prompt.instruction}</p>}
      </div>

      {/* Three questions */}
      <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 space-y-5">
        <p className="text-[12px] font-bold text-indigo-500 uppercase tracking-widest">Твоите отговори</p>

        <QuestionField
          label="1. Какво се иска от теб в тази тема?"
          value={q1} onChange={setQ1} onTranscribed={append(setQ1)}
          placeholder="напр. Да изразя позиция дали нещо видимо или невидимо е по-важно…"
          check={checkResult ? { ok: checkResult.promptUnderstood, note: checkResult.promptNote || undefined } : null}
        />

        <QuestionField
          label="2. Каква е твоята позиция или основна идея?"
          value={q2} onChange={setQ2} onTranscribed={append(setQ2)}
          placeholder="напр. Вярвам, че приятелството е най-важно, защото оформя кои ставаме…"
          check={checkResult ? { ok: checkResult.thesisSpecific, note: checkResult.thesisSuggestion || undefined } : null}
        />

        <QuestionField
          label="3. Какъв личен опит или пример може да подкрепи идеята ти?"
          value={q3} onChange={setQ3} onTranscribed={append(setQ3)}
          placeholder="напр. Когато приятелят ми ми помогна след като се провалих на изпит…"
          check={checkResult ? { ok: checkResult.exampleRelevant, note: checkResult.exampleNote || undefined } : null}
        />

        {checkResult?.encouragement && (
          <div className="flex items-start gap-2.5 pt-1">
            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles size={14} className="text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider mb-1 text-indigo-500">Наставник</p>
              <div className="rounded-2xl rounded-tl-sm px-3 py-2 inline-block bg-indigo-100">
                <p className="text-[14px] text-indigo-800 leading-relaxed">{checkResult.encouragement}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-[15px] text-red-600 text-center" role="alert">{error}</p>}

      <div className="flex flex-col gap-3">
        {!canAdvance && (
          <button
            type="button"
            onClick={handleCheck}
            disabled={!canCheck || checking}
            className="w-full h-[52px] rounded-2xl bg-[#0B1F3A] text-white text-[15px] font-semibold hover:bg-[#122a50] hover:-translate-y-0.5 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
          >
            {checking ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Проверява…</> : "Провери разбирането ми"}
          </button>
        )}
        {canAdvance && (
          <button
            type="button"
            onClick={handleAdvance}
            disabled={advancing}
            className="w-full h-[52px] rounded-2xl bg-[#0B1F3A] text-white text-[15px] font-semibold hover:bg-[#122a50] hover:-translate-y-0.5 shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {advancing ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Записва…</> : <>Към планирането <ArrowRight size={16} /></>}
          </button>
        )}
        {!canAdvance && checkCount >= 1 && !allPass && (
          <button
            type="button"
            onClick={handleAdvance}
            disabled={advancing}
            className="w-full h-[50px] rounded-2xl bg-[#F3F4F6] text-[#6B7280] text-[15px] font-normal hover:bg-[#E5E7EB] transition cursor-pointer"
          >
            Продължи въпреки това →
          </button>
        )}
      </div>
    </div>
  );
}
