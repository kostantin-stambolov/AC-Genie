import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAdminContext, getSessionUserId } from "@/lib/auth";
import { ImpersonateButton } from "@/components/admin/ImpersonateButton";

type SortKey =
  | "email"
  | "registeredAt"
  | "totalAttempts"
  | "completedAttempts"
  | "latestScore"
  | "bestScore";

type AdminPageProps = {
  searchParams: Promise<{
    search?: string;
    sort?: string;
    direction?: string;
  }>;
};

function compareNullableNumber(a: number | null, b: number | null): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return a - b;
}

function toggleDirection(currentSort: string, currentDirection: string, nextSort: string): "asc" | "desc" {
  if (currentSort !== nextSort) return "desc";
  return currentDirection === "desc" ? "asc" : "desc";
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const admin = await getAdminContext();
  if (!admin) {
    const userId = await getSessionUserId();
    if (userId) redirect("/home");
    redirect("/login");
  }

  const params = await searchParams;
  const search = (params.search ?? "").trim().toLowerCase();
  const sort = (params.sort ?? "registeredAt") as SortKey;
  const direction = params.direction === "asc" ? "asc" : "desc";

  const users = await prisma.user.findMany({
    where: search
      ? {
          email: {
            contains: search,
          },
        }
      : undefined,
    include: {
      attempts: {
        where: {
          part: 1,
        },
        orderBy: { startedAt: "desc" },
        select: {
          status: true,
          startedAt: true,
          completedAt: true,
          lastFeedbackGrade: true,
        },
      },
    },
  });

  const rows = users.map((user) => {
    const totalAttempts = user.attempts.length;
    const completedAttempts = user.attempts.filter((a) => a.status === "completed").length;
    const completedWithScore = user.attempts.filter(
      (a) => a.status === "completed" && typeof a.lastFeedbackGrade === "number"
    );
    const latestCompleted = [...completedWithScore].sort(
      (a, b) =>
        (b.completedAt?.getTime() ?? b.startedAt.getTime()) -
        (a.completedAt?.getTime() ?? a.startedAt.getTime())
    )[0];
    const latestScore = latestCompleted?.lastFeedbackGrade ?? null;
    const bestScore =
      completedWithScore.length > 0
        ? Math.max(...completedWithScore.map((a) => a.lastFeedbackGrade ?? 0))
        : null;
    return {
      id: user.id,
      email: user.email,
      registeredAt: user.createdAt,
      totalAttempts,
      completedAttempts,
      latestScore,
      bestScore,
    };
  });

  rows.sort((a, b) => {
    let cmp = 0;
    if (sort === "email") cmp = a.email.localeCompare(b.email);
    if (sort === "registeredAt") cmp = a.registeredAt.getTime() - b.registeredAt.getTime();
    if (sort === "totalAttempts") cmp = a.totalAttempts - b.totalAttempts;
    if (sort === "completedAttempts") cmp = a.completedAttempts - b.completedAttempts;
    if (sort === "latestScore") cmp = compareNullableNumber(a.latestScore, b.latestScore);
    if (sort === "bestScore") cmp = compareNullableNumber(a.bestScore, b.bestScore);
    return direction === "asc" ? cmp : -cmp;
  });
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [totalUsers, totalCompletedEssays, completedLast7Days] = await Promise.all([
    prisma.user.count(),
    prisma.attempt.count({ where: { part: 1, status: "completed" } }),
    prisma.attempt.count({
      where: {
        part: 1,
        status: "completed",
        completedAt: { gte: sevenDaysAgo },
      },
    }),
  ]);

  const latestScores = rows.map((r) => r.latestScore).filter((score): score is number => score != null);
  const avgLatestScore =
    latestScores.length > 0
      ? Number((latestScores.reduce((acc, score) => acc + score, 0) / latestScores.length).toFixed(1))
      : null;

  const headerLink = (key: SortKey, label: string) => {
    const nextDirection = toggleDirection(sort, direction, key);
    const arrow = sort === key ? (direction === "asc" ? " ↑" : " ↓") : "";
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    query.set("sort", key);
    query.set("direction", nextDirection);
    return (
      <Link href={`/admin?${query.toString()}`} className="hover:underline">
        {label}
        {arrow}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <header className="bg-white border-b border-[#E5E7EB] px-5 h-14 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-[#0B1F3A] flex items-center justify-center text-white font-bold text-sm select-none">
            AC
          </span>
          <span className="font-semibold text-[#111827] tracking-tight">Admin Dashboard</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <p className="text-[12px] text-[#6B7280]">Total users</p>
            <p className="text-[24px] font-semibold text-[#111827]">{totalUsers}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <p className="text-[12px] text-[#6B7280]">Essays completed</p>
            <p className="text-[24px] font-semibold text-[#111827]">{totalCompletedEssays}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <p className="text-[12px] text-[#6B7280]">Completed (7d)</p>
            <p className="text-[24px] font-semibold text-[#111827]">{completedLast7Days}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <p className="text-[12px] text-[#6B7280]">Avg latest score</p>
            <p className="text-[24px] font-semibold text-[#111827]">{avgLatestScore ?? "—"}</p>
          </div>
        </div>

        <form action="/admin" method="get" className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search by email"
              className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] bg-white text-[14px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="submit"
              className="h-10 px-4 rounded-lg bg-[#0B1F3A] text-white text-[14px] font-semibold hover:bg-[#122a50] transition cursor-pointer"
            >
              Filter
            </button>
          </div>
        </form>

        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr className="text-[12px] text-[#4B5563]">
                  <th className="px-4 py-3 font-semibold">{headerLink("email", "Email")}</th>
                  <th className="px-4 py-3 font-semibold">{headerLink("registeredAt", "Registered")}</th>
                  <th className="px-4 py-3 font-semibold">{headerLink("totalAttempts", "Started")}</th>
                  <th className="px-4 py-3 font-semibold">{headerLink("completedAttempts", "Completed")}</th>
                  <th className="px-4 py-3 font-semibold">{headerLink("latestScore", "Latest score")}</th>
                  <th className="px-4 py-3 font-semibold">{headerLink("bestScore", "Best score")}</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-[#F3F4F6] last:border-b-0">
                    <td className="px-4 py-3 text-[14px] text-[#111827]">
                      <Link href={`/admin/users/${row.id}`} className="underline-offset-2 hover:underline">
                        {row.email}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[14px] text-[#4B5563]">{row.registeredAt.toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-[14px] text-[#111827]">{row.totalAttempts}</td>
                    <td className="px-4 py-3 text-[14px] text-[#111827]">{row.completedAttempts}</td>
                    <td className="px-4 py-3 text-[14px] text-[#111827]">{row.latestScore ?? "—"}</td>
                    <td className="px-4 py-3 text-[14px] text-[#111827]">{row.bestScore ?? "—"}</td>
                    <td className="px-4 py-3">
                      <ImpersonateButton userId={row.id} />
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-[14px] text-[#4B5563]">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
