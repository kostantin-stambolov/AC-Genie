"use client";

import { Zap, BookOpen } from "@/components/icons";

type Props = { onSelect: (mode: "v1" | "v2") => void };

export function ModeSelector({ onSelect }: Props) {
  return (
    <div className="space-y-3">
      {/* Quick Practice — v1 */}
      <button
        type="button"
        onClick={() => onSelect("v1")}
        className="w-full text-left bg-white rounded-3xl border-2 border-[#E5E7EB] p-5 hover:border-indigo-200 hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group"
      >
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-11 h-11 rounded-xl bg-[#F3F4F6] flex items-center justify-center group-hover:bg-indigo-50 transition">
            <Zap size={20} className="text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#111827] text-[18px] mb-1">Бързо упражнение</h3>
            <p className="text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2">Пиши свободно, получи оценка</p>
            <p className="text-[15px] text-[#6B7280] leading-relaxed">
              Започни да пишеш директно. Изпрати есето и получи оценка с подробна обратна връзка.
            </p>
            <p className="text-[13px] text-[#9CA3AF] mt-2">
              <span className="font-semibold">Подходящо за:</span> Самопроверка или упражнение под времево налягане.
            </p>
          </div>
        </div>
      </button>

      {/* Guided Coaching — v2 */}
      <button
        type="button"
        onClick={() => onSelect("v2")}
        className="w-full text-left bg-white rounded-3xl border-2 border-indigo-200 p-5 hover:border-indigo-400 hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group relative overflow-hidden"
      >
        <div className="absolute top-3.5 right-3.5">
          <span className="text-[12px] font-semibold bg-[#0B1F3A] text-white rounded-full px-3 py-1">
            Препоръчано
          </span>
        </div>
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition">
            <BookOpen size={20} className="text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0 pr-20">
            <h3 className="font-semibold text-[#111827] text-[18px] mb-1">Насочено обучение</h3>
            <p className="text-[12px] font-semibold text-indigo-500 uppercase tracking-widest mb-2">Стъпка по стъпка</p>
            <p className="text-[15px] text-[#6B7280] leading-relaxed">
              Коуч те води през разбирането на темата, планирането, писането с таймер и самопроверката — точно като на реалния изпит.
            </p>
            <p className="text-[13px] text-[#9CA3AF] mt-2">
              <span className="font-semibold">Подходящо за:</span> Изграждане на реални умения и овладяване на процеса.
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {["Разбери", "Планирай", "Пиши", "Провери", "Оценка", "Размисли"].map((s) => (
                <span key={s} className="text-[12px] font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-2.5 py-0.5">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
