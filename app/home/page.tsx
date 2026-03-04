import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";
import { getHomeState, PART_2_SECTIONS, SECTION_NAMES } from "@/lib/attempts";
import { LogoutButton } from "./LogoutButton";

export default async function HomePage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const state = await getHomeState(userId);

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-900">American College Prep</h1>
        <LogoutButton />
      </header>
      <main className="p-4 max-w-lg mx-auto">
        <p className="text-neutral-600 text-sm mb-6">
          Choose an exam part. Finish any started section before starting a new one.
        </p>

        {/* Part 1: Essay */}
        <section className="mb-8">
          <h2 className="text-base font-semibold text-neutral-900 mb-3">
            Part 1 – Essay
          </h2>
          <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3">
            {state.part1.hasActive ? (
              <>
                <p className="text-sm text-amber-700">
                  You have an essay in progress. Complete it before starting a new one.
                </p>
                <Link
                  href={`/practice/part1?attemptId=${state.part1.activeId}`}
                  className="block w-full h-12 flex items-center justify-center rounded-lg bg-blue-600 text-white font-medium"
                >
                  Continue
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/practice/part1/new"
                  className="block w-full h-12 flex items-center justify-center rounded-lg bg-blue-600 text-white font-medium"
                >
                  Start new essay
                </Link>
                {state.part1.hasCompleted && (
                  <Link
                    href="/practice/part1/examples"
                    className="block w-full h-12 flex items-center justify-center rounded-lg border border-neutral-300 text-neutral-700 font-medium"
                  >
                    See previous examples
                  </Link>
                )}
              </>
            )}
          </div>
        </section>

        {/* Part 2: Test (4 sections) */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-3">
            Part 2 – Test (4 sections)
          </h2>
          <ul className="space-y-3">
            {PART_2_SECTIONS.map((section) => {
              const active = state.part2[section]?.active;
              const completed = state.part2[section]?.completed;
              return (
                <li key={section} className="bg-white rounded-xl border border-neutral-200 p-4">
                  <h3 className="text-sm font-medium text-neutral-900 mb-3">
                    {SECTION_NAMES[section]}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {active ? (
                      <>
                        <p className="text-sm text-amber-700">In progress. Complete to continue.</p>
                        <Link
                          href={`/practice/part2/${section}?attemptId=${active.id}`}
                          className="block w-full h-11 flex items-center justify-center rounded-lg bg-blue-600 text-white font-medium text-sm"
                        >
                          Continue
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href={`/practice/part2/${section}/new`}
                          className="block w-full h-11 flex items-center justify-center rounded-lg bg-blue-600 text-white font-medium text-sm"
                        >
                          Start
                        </Link>
                        {completed && (
                          <Link
                            href={`/practice/part2/${section}/examples`}
                            className="block w-full h-11 flex items-center justify-center rounded-lg border border-neutral-300 text-neutral-700 font-medium text-sm"
                          >
                            Previous examples
                          </Link>
                        )}
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </div>
  );
}
