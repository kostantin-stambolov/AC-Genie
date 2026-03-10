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
    comprehension: "Phase 1 of 6: Understand",
    outline:       "Phase 2 of 6: Outline",
    writing:       "Phase 3 of 6: Write",
    review:        "Phase 4 of 6: Review",
    feedback:      "Phase 5 of 6: Score",
    revision:      "Phase 6 of 6: Improve",
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
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Your practice</h1>
          <p className="text-neutral-500 text-sm">Work through the essay, get feedback, and improve.</p>
        </div>

        {/* Essay card */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 text-base shrink-0">✍️</div>
            <div>
              <h2 className="font-semibold text-neutral-900 text-base">Essay</h2>
              <p className="text-neutral-500 text-xs">Part 1 of the admission exam</p>
            </div>
            <div className="ml-auto">
              {hasActive && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  In progress
                </span>
              )}
              {!hasActive && hasCompleted && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Completed
                </span>
              )}
              {!hasActive && !hasCompleted && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 bg-neutral-100 rounded-full px-2.5 py-1">
                  Not started
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
                      <span className="text-xs font-bold text-violet-500 bg-violet-50 border border-violet-200 rounded-full px-2.5 py-1">🧭 Guided Coaching</span>
                      {activePhase && PHASE_LABELS[activePhase] && (
                        <span className="text-xs text-neutral-400">{PHASE_LABELS[activePhase]}</span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600">Your coaching session is in progress. Pick up where you left off.</p>
                  </>
                ) : (
                  <p className="text-sm text-neutral-600">You have an essay in progress. Continue where you left off.</p>
                )}
                <Link
                  href={activeHref}
                  className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 active:scale-[0.98] transition cursor-pointer"
                >
                  {activeMode === "v2" ? <>Continue coaching session <ArrowRight size={16} /></> : <>Continue writing <ArrowRight size={16} /></>}
                </Link>
                <Link
                  href="/practice/part1/examples"
                  className="flex items-center justify-center w-full h-11 rounded-xl bg-neutral-100 text-neutral-500 text-sm font-medium hover:bg-neutral-200 transition cursor-pointer"
                >
                  See previous attempts
                </Link>
              </>
            ) : (
              <>
                {hasCompleted && (
                  <p className="text-sm text-neutral-600">Great work finishing an essay. Start a new one to keep practising.</p>
                )}
                {!hasCompleted && (
                  <p className="text-sm text-neutral-600">Pick one of three topics, write your essay, and get instant AI feedback with a grade.</p>
                )}
                <Link
                  href="/practice/part1/new"
                  className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 active:scale-[0.98] transition cursor-pointer"
                >
                  Start new essay <ArrowRight size={16} />
                </Link>
                {hasCompleted && (
                  <Link
                    href="/practice/part1/examples"
                    className="flex items-center justify-center w-full h-11 rounded-xl bg-neutral-100 text-neutral-500 text-sm font-medium hover:bg-neutral-200 transition cursor-pointer"
                  >
                    See previous attempts
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
