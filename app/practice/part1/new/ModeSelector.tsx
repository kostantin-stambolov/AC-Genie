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
              <h3 className="font-bold text-neutral-900 text-base">Quick Practice</h3>
            </div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-2">Write freely, get scored</p>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Jump straight into writing. Submit when ready and get your score with detailed feedback.
            </p>
            <p className="text-xs text-neutral-400 mt-2">
              <span className="font-semibold">Best for:</span> Testing yourself or practising under time pressure.
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
            Recommended
          </span>
        </div>
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center text-xl group-hover:bg-violet-200 transition">
            🧭
          </div>
          <div className="flex-1 min-w-0 pr-20">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-neutral-900 text-base">Guided Coaching</h3>
            </div>
            <p className="text-xs font-semibold text-violet-500 uppercase tracking-widest mb-2">Step-by-step coaching</p>
            <p className="text-sm text-neutral-600 leading-relaxed">
              A coach walks you through understanding the prompt, planning, writing under time, and reviewing — just like the real exam.
            </p>
            <p className="text-xs text-neutral-400 mt-2">
              <span className="font-semibold">Best for:</span> Building real skills and learning the process.
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {["💡 Understand", "📝 Outline", "✍️ Write", "🔍 Review", "📊 Score", "🎯 Improve"].map((s) => (
                <span key={s} className="text-[11px] font-medium text-violet-700 bg-violet-50 border border-violet-100 rounded-full px-2 py-0.5">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
