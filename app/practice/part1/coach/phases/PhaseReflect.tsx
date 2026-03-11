"use client";

import { DictateButton } from "@/components/DictateButton";
import { useState } from "react";
import {
  getWeakestDimension,
  DIMENSION_LABELS,
  DIMENSION_MODEL_OBSERVATIONS,
  DIMENSION_REFLECTION_PLACEHOLDERS,
} from "@/lib/coaching-utils";
import type { FeedbackData, PhaseTimingsData } from "../CoachingFlow";

type Props = {
  feedbackData: FeedbackData | null;
  phaseTimings: PhaseTimingsData;
  advancing: boolean;
  initialDone?: boolean;
  onAdvance: (reflection: string) => Promise<void>;
};

function formatSeconds(s?: number): string {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  return m === 0 ? `${s}s` : `${m} min`;
}

export function PhaseReflect({ feedbackData, phaseTimings, advancing, initialDone, onAdvance }: Props) {
  const [reflection, setReflection] = useState("");
  const [done, setDone]             = useState(initialDone ?? false);

  const bd = feedbackData?.breakdown;
  if (!bd) {
    return (
      <div className="space-y-4">
                <p className="text-[15px] text-[#6B7280]">Няма налични данни за оценяване.</p>
        <button
          type="button" onClick={() => onAdvance("")} disabled={advancing}
          className="w-full h-[52px] rounded-2xl bg-[#0B1F3A] text-white text-[15px] font-semibold hover:bg-[#122a50] shadow-md cursor-pointer disabled:opacity-50"
        >
          Приключи сесията
        </button>
      </div>
    );
  }

  const { examiner1: e1, examiner2: e2, finalScore } = bd;
  const weakest  = getWeakestDimension(e1, e2);
  const dimLabel = DIMENSION_LABELS[weakest];
  const avgValue = weakest === "ideaContent"
    ? (e1.ideaContent + e2.ideaContent) / 2
    : weakest === "structure"
    ? (e1.structure + e2.structure) / 2
    : (e1.language + e2.language) / 2;
  const dimMax   = weakest === "ideaContent" ? 10 : weakest === "structure" ? 4 : 6;

  const e1dim = weakest === "ideaContent" ? e1.ideaContent : weakest === "structure" ? e1.structure : e1.language;
  const e2dim = weakest === "ideaContent" ? e2.ideaContent : weakest === "structure" ? e2.structure : e2.language;
  const relevantNote = (e1dim <= e2dim ? e1.notes : e2.notes) || "";

  async function handleFinish() {
    await onAdvance(reflection);
    setDone(true);
  }

  if (done) {
    const timingRows = [
      { key: "comprehension", label: "Разбиране" },
      { key: "outline",       label: "Планиране" },
      { key: "writing",       label: "Писане" },
      { key: "review",        label: "Самопроверка" },
    ];
    const totalSecs = timingRows.reduce((sum, r) => sum + (phaseTimings[r.key]?.seconds ?? 0), 0);

    return (
      <div className="space-y-5">
        <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] px-6 py-6">
          <p className="text-3xl mb-3">🎯</p>
          <h2 className="text-[22px] font-semibold text-[#111827] mb-4 tracking-tight">Сесията е завършена!</h2>

          <div className="mb-5">
            <p className="text-[12px] font-bold text-indigo-500 mb-1">Твоят резултат</p>
            <p className="text-4xl font-bold text-[#111827]">{finalScore}<span className="text-[22px] font-semibold text-[#D1D5DB]">/20</span></p>
            <p className="text-[13px] text-[#9CA3AF] mt-0.5">Средно от Проверяващ 1 ({e1.total}) + Проверяващ 2 ({e2.total})</p>
          </div>

          <div className="mb-5">
            <p className="text-[12px] font-bold text-indigo-500 mb-2">Времеразпределение</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {timingRows.map(({ key, label }) => (
                phaseTimings[key]?.seconds
                  ? <span key={key} className="text-[13px] text-[#9CA3AF]">{label}: <strong className="text-[#6B7280]">{formatSeconds(phaseTimings[key]?.seconds)}</strong></span>
                  : null
              ))}
              {totalSecs > 0 && (
                <span className="text-[13px] text-[#9CA3AF]">Общо: <strong className="text-[#6B7280]">{formatSeconds(totalSecs)}</strong></span>
              )}
            </div>
          </div>

          {reflection.trim() && (
            <div className="mb-5">
              <p className="text-[12px] font-bold text-indigo-500 mb-1">Твоят фокус за следващия път</p>
              <p className="text-[15px] text-[#6B7280] leading-relaxed italic">"{reflection}"</p>
            </div>
          )}

          <p className="text-[13px] text-[#9CA3AF] leading-relaxed">
            Днес тренира: разбиране на темата, планиране, писане с таймер, самопроверка и размисъл върху най-слабата ти област. Продължавай — денят на изпита наближава.
          </p>
        </div>

        <button
          type="button"
          onClick={() => { window.location.href = "/home"; }}
          className="w-full h-[52px] rounded-2xl bg-[#0B1F3A] text-white text-[15px] font-semibold hover:bg-[#122a50] hover:-translate-y-0.5 shadow-md transition-all cursor-pointer"
        >
          Готово — към началото
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
                <h2 className="text-[22px] font-semibold text-[#111827] mb-1 tracking-tight">Какво ще направиш по-различно следващия път?</h2>
        <p className="text-[15px] text-[#6B7280]">Един бърз размисъл затваря кръга и прави практиката по-ефективна.</p>
      </div>

      {/* Weakest area card */}
      <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5">
        <p className="text-[12px] font-bold text-orange-500 mb-3">
          Твоята най-слаба област: {dimLabel} (средно {avgValue.toFixed(1)} / {dimMax})
        </p>

        {relevantNote && (
          <div className="rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] px-4 py-3 mb-4">
            <p className="text-[12px] font-bold text-[#9CA3AF] mb-1">Твоите проверяващи отбелязаха</p>
            <p className="text-[15px] text-[#6B7280] leading-relaxed italic">"{relevantNote}"</p>
          </div>
        )}

        <p className="text-[15px] text-[#6B7280] leading-relaxed">
          В примерното есе видя как <strong className="text-[#111827]">{DIMENSION_MODEL_OBSERVATIONS[weakest]}</strong>.
        </p>
      </div>

      {/* Reflection textarea */}
      <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] px-5 py-5">
        <div className="flex items-center justify-between mb-3">
          <label className="text-[15px] font-semibold text-[#111827]">
            Напиши едно нещо, върху което ще се фокусираш в следващото есе:
          </label>
          <DictateButton onTranscribed={(text) => setReflection(v => v ? v + " " + text : text)} />
        </div>
        <textarea
          value={reflection}
          onChange={e => setReflection(e.target.value)}
          rows={3}
          placeholder={DIMENSION_REFLECTION_PLACEHOLDERS[weakest]}
          className="w-full rounded-2xl border border-[#E5E7EB] px-3 py-2.5 text-[15px] text-[#111827] placeholder:text-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
        />
      </div>

      <button
        type="button"
        onClick={handleFinish}
        disabled={advancing}
        className="w-full h-[52px] rounded-2xl bg-[#0B1F3A] text-white text-[15px] font-semibold hover:bg-[#122a50] hover:-translate-y-0.5 shadow-md transition-all disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
      >
        {advancing
          ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Записва…</>
          : "Приключи сесията →"}
      </button>
    </div>
  );
}
