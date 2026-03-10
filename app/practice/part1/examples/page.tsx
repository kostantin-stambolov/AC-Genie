import { redirect } from "next/navigation";
import Link from "next/link";
import type { Attempt } from "@prisma/client";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NavHeader } from "@/components/NavHeader";
import { ChevronRight, ArrowRight } from "@/components/icons";

function getTopicTitle(promptText: string | null): string {
  if (!promptText) return "Essay";
  try {
    const p = JSON.parse(promptText) as { title?: string };
    return typeof p.title === "string" ? p.title : "Essay";
  } catch {
    return "Essay";
  }
}

function formatDate(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleString(undefined, {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default async function Part1ExamplesPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const attempts = await prisma.attempt.findMany({
    where: { userId, part: 1, section: null, lastFeedbackAt: { not: null } },
    orderBy: { lastFeedbackAt: "desc" },
    take: 20,
  });

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <NavHeader backHref="/home" backLabel="Начало" title="Предишни опити" />
      <main className="max-w-xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Предишни опити</h1>
          <p className="text-neutral-500 text-sm">Всеки запис показва черновиките на есето ти, кръговете с обратна връзка и примерното есе.</p>
        </div>

        {attempts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8 text-center">
            <p className="text-3xl mb-3">📝</p>
            <p className="font-semibold text-neutral-800 mb-1">Все още няма нищо</p>
            <p className="text-neutral-500 text-sm mb-5">Изпрати поне едно есе за обратна връзка, за да видиш историята си.</p>
            <Link
              href="/practice/part1/new"
              className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition cursor-pointer"
            >
              Напиши есе <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {attempts.map((a: Attempt) => (
              <li key={a.id}>
                <Link
                  href={`/practice/part1/examples/${a.id}`}
                  className="flex items-center gap-4 bg-white rounded-2xl border border-neutral-100 shadow-sm px-5 py-4 hover:border-violet-200 hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0 text-base select-none">
                    ✍️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-900 text-sm truncate">{getTopicTitle(a.promptText)}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{formatDate(a.lastFeedbackAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {a.status === "in_progress" && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        В процес
                      </span>
                    )}
                    {a.status === "completed" && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                        Завършено
                      </span>
                    )}
                    <ChevronRight size={18} className="text-neutral-300 group-hover:text-violet-500 transition" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
