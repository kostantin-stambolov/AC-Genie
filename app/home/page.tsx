import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";
import { getHomeState } from "@/lib/attempts";
import { LogoutButton } from "./LogoutButton";
import { ArrowRight } from "@/components/icons";

export default async function HomePage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const state = await getHomeState(userId);

  const hasActive = state.part1.hasActive;
  const hasCompleted = state.part1.hasCompleted;
  const activeMode = state.part1.activeCoachingMode ?? "v1";
  const activePhase = state.part1.activeCoachingPhase;
  const activeHref = activeMode === "v2"
    ? `/practice/part1/coach?attemptId=${state.part1.activeId}`
    : `/practice/part1?attemptId=${state.part1.activeId}`;

  const PHASE_LABELS: Record<string, string> = {
    comprehension: "Фаза 1 от 6: Разбери",
    outline:       "Фаза 2 от 6: Планирай",
    writing:       "Фаза 3 от 6: Пиши",
    review:        "Фаза 4 от 6: Провери",
    feedback:      "Фаза 5 от 6: Оценка",
    reflect:       "Фаза 6 от 6: Размисли",
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      {/* Top nav */}
      <header className="bg-white border-b border-neutral-100 px-5 h-14 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-sm select-none">AC</span>
          <span className="font-semibold text-neutral-900 tracking-tight">American College Prep</span>
        </div>
        <LogoutButton />
      </header>

      <main className="max-w-xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Твоята практика</h1>
          <p className="text-neutral-500 text-sm">Напиши есе, получи обратна връзка и се подобри.</p>
        </div>

        {/* Essay card */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 text-base shrink-0">✍️</div>
            <div>
              <h2 className="font-semibold text-neutral-900 text-base">Есе</h2>
              <p className="text-neutral-500 text-xs">Част 1 от приемния изпит</p>
            </div>
            <div className="ml-auto">
              {hasActive && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  В процес
                </span>
              )}
              {!hasActive && hasCompleted && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Завършено
                </span>
              )}
              {!hasActive && !hasCompleted && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 bg-neutral-100 rounded-full px-2.5 py-1">
                  Не е започнато
                </span>
              )}
            </div>
          </div>

          <div className="px-6 py-5 space-y-3">
            {hasActive ? (
              <>
                {activeMode === "v2" ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-violet-500 bg-violet-50 border border-violet-200 rounded-full px-2.5 py-1">🧭 Насочено обучение</span>
                      {activePhase && PHASE_LABELS[activePhase] && (
                        <span className="text-xs text-neutral-400">{PHASE_LABELS[activePhase]}</span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600">Обучителната ти сесия е в ход. Продължи откъдето спря.</p>
                  </>
                ) : (
                  <p className="text-sm text-neutral-600">Имаш есе в процес. Продължи откъдето спря.</p>
                )}
                <Link
                  href={activeHref}
                  className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 active:scale-[0.98] transition cursor-pointer"
                >
                  {activeMode === "v2" ? <>Продължи сесията <ArrowRight size={16} /></> : <>Продължи писането <ArrowRight size={16} /></>}
                </Link>
                <Link
                  href="/practice/part1/examples"
                  className="flex items-center justify-center w-full h-11 rounded-xl bg-neutral-100 text-neutral-500 text-sm font-medium hover:bg-neutral-200 transition cursor-pointer"
                >
                  Виж предишни опити
                </Link>
              </>
            ) : (
              <>
                {hasCompleted && (
                  <p className="text-sm text-neutral-600">Браво, завърши есе! Напиши ново, за да продължиш да тренираш.</p>
                )}
                {!hasCompleted && (
                  <p className="text-sm text-neutral-600">Избери тема, напиши есе и получи мигновена AI оценка с обратна връзка.</p>
                )}
                <Link
                  href="/practice/part1/new"
                  className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 active:scale-[0.98] transition cursor-pointer"
                >
                  Напиши ново есе <ArrowRight size={16} />
                </Link>
                {hasCompleted && (
                  <Link
                    href="/practice/part1/examples"
                    className="flex items-center justify-center w-full h-11 rounded-xl bg-neutral-100 text-neutral-500 text-sm font-medium hover:bg-neutral-200 transition cursor-pointer"
                  >
                    Виж предишни опити
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
