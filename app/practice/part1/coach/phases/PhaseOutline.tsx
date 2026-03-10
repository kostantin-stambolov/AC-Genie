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
  opening: "Силното начало въвежда темата и ясно заявява позицията ти. Опитай: „В това есе ще твърдя, че…" или започни с кратка история, която води към тезата ти.",
  arg1: "Първият ти аргумент трябва директно да подкрепя тезата. Включи конкретен пример от живота ти или нещо, което си наблюдавал/а.",
  arg2: "Вторият ти аргумент трябва да е РАЗЛИЧНА точка — не повторение на първата. Помисли: какво друго подкрепя тезата ти?",
  closing: "Силният край отеква първото изречение. Ако си започнал/а с въпрос, отговори тук. Ако си открил/а с личен момент, върни се към него.",
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
        <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-1">Фаза 2 · Планиране</p>
        <h2 className="text-xl font-bold text-neutral-900 mb-1">Планирай структурата на есето</h2>
        <p className="text-sm text-neutral-500">Не пиши цели изречения — само отбележи ключовите си точки. Това е твоята карта.</p>
      </div>

      {/* Thesis reminder */}
      {thesis && (
        <div className="bg-violet-50 rounded-2xl border border-violet-200 px-4 py-3">
          <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-1">Твоята теза</p>
          <p className="text-sm font-semibold text-violet-900 leading-snug">"{thesis}"</p>
        </div>
      )}

      {/* Outline fields */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 space-y-4">
        {[
          { key: "opening", label: "Начало (1 изречение)", placeholder: "Как ще въведеш темата и ще заявиш позицията си?", value: opening, set: setOpening },
          { key: "arg1",    label: "Аргумент 1 (1–2 изречения)", placeholder: "Първа подкрепяща точка + какъв пример ще използваш?", value: arg1, set: setArg1 },
          { key: "arg2",    label: "Аргумент 2 (1–2 изречения)", placeholder: "Втора подкрепяща точка или пример?", value: arg2, set: setArg2 },
          { key: "closing", label: "Заключение (1 изречение)", placeholder: "Как ще завършиш? Опитай се да се върнеш към началото.", value: closing, set: setClosing },
        ].map(({ key, label, placeholder, value, set }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-neutral-800">{label}</label>
              <button type="button" onClick={() => setShowTip(showTip === key ? null : key)} className="text-[11px] text-violet-500 font-medium hover:underline cursor-pointer">
                {showTip === key ? "Скрий съвета" : "Нужна помощ?"}
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
          <p className="text-xs font-semibold text-amber-700 mb-1">Нещо за обмисляне</p>
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
          ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{checking ? "Проверява…" : "Записва…"}</>
          : <>Към писането <ArrowRight size={16} /></>}
      </button>
    </div>
  );
}
