"use client";

type Props = { onSelect: (mode: "v1" | "v2") => void };

export function ModeSelector({ onSelect }: Props) {
  return (
    <div className="space-y-3">
      {/* Quick Practice — v1 */}
      <button
        type="button"
        onClick={() => onSelect("v1")}
        className="w-full text-left bg-white rounded-2xl border-2 border-neutral-200 p-5 hover:border-violet-200 hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group"
      >
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-11 h-11 rounded-xl bg-neutral-100 flex items-center justify-center text-xl group-hover:bg-violet-50 transition">
            ⚡
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-neutral-900 text-base">Бързо упражнение</h3>
            </div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-2">Пиши свободно, получи оценка</p>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Започни да пишеш директно. Изпрати есето и получи оценка с подробна обратна връзка.
            </p>
            <p className="text-xs text-neutral-400 mt-2">
              <span className="font-semibold">Подходящо за:</span> Самопроверка или упражнение под времево налягане.
            </p>
          </div>
        </div>
      </button>

      {/* Guided Coaching — v2 */}
      <button
        type="button"
        onClick={() => onSelect("v2")}
        className="w-full text-left bg-white rounded-2xl border-2 border-violet-300 p-5 hover:border-violet-400 hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group relative overflow-hidden"
      >
        <div className="absolute top-3 right-3">
          <span className="text-[11px] font-bold uppercase tracking-widest bg-violet-600 text-white rounded-full px-2.5 py-1">
            Препоръчано
          </span>
        </div>
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center text-xl group-hover:bg-violet-200 transition">
            🧭
          </div>
          <div className="flex-1 min-w-0 pr-20">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-neutral-900 text-base">Насочено обучение</h3>
            </div>
            <p className="text-xs font-semibold text-violet-500 uppercase tracking-widest mb-2">Стъпка по стъпка</p>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Коуч те води през разбирането на темата, планирането, писането с таймер и самопроверката — точно като на реалния изпит.
            </p>
            <p className="text-xs text-neutral-400 mt-2">
              <span className="font-semibold">Подходящо за:</span> Изграждане на реални умения и овладяване на процеса.
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {["💡 Разбери", "📝 Планирай", "✍️ Пиши", "🔍 Провери", "📊 Оценка", "🎯 Размисли"].map((s) => (
                <span key={s} className="text-[11px] font-medium text-violet-700 bg-violet-50 border border-violet-100 rounded-full px-2 py-0.5">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
