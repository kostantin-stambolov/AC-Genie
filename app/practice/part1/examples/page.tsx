import { redirect } from "next/navigation";
import Link from "next/link";
import type { Attempt } from "@prisma/client";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NavHeader } from "@/components/NavHeader";
import { ChevronRight, ArrowRight } from "@/components/icons";
import { resolveStoredPrompt } from "@/lib/essay-prompts";

function getTopicTitle(promptText: string | null): string {
  return resolveStoredPrompt(promptText)?.title ?? "Есе";
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
    <div className="min-h-screen bg-[#F0F2F5]">
      <NavHeader backHref="/home" backLabel="Начало" title="Предишни опити" />
      <main className="max-w-xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-[26px] font-semibold text-[#111827] mb-1 tracking-tight">Предишни опити</h1>
          <p className="text-[#6B7280] text-[15px]">Всеки запис показва черновиците на есето ти, кръговете с обратна връзка и примерното есе.</p>
        </div>

        {attempts.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-8 text-center">
            <p className="text-3xl mb-3">📝</p>
            <p className="font-semibold text-[#111827] text-[18px] mb-1">Все още няма нищо</p>
            <p className="text-[#6B7280] text-[15px] mb-5">Изпрати поне едно есе за обратна връзка, за да видиш историята си.</p>
            <Link
              href="/practice/part1/new"
              className="inline-flex items-center gap-1.5 h-[52px] px-6 rounded-2xl bg-[#0B1F3A] text-white text-[15px] font-semibold hover:bg-[#122a50] hover:-translate-y-0.5 shadow-md transition-all cursor-pointer"
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
                  className="flex items-center gap-4 bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-5 py-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] active:scale-[0.99] transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 text-base select-none">
                    ✍️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#111827] text-[15px] truncate">{getTopicTitle(a.promptText)}</p>
                    <p className="text-[13px] text-[#9CA3AF] mt-0.5">{formatDate(a.lastFeedbackAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {a.status === "in_progress" && (
                      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        В процес
                      </span>
                    )}
                    {a.status === "completed" && (
                      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                        Завършено
                      </span>
                    )}
                    <ChevronRight size={18} className="text-[#E5E7EB] group-hover:text-indigo-500 transition" />
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
