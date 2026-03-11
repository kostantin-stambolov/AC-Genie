import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAdminContext, getSessionUserId } from "@/lib/auth";
import { ImpersonateButton } from "@/components/admin/ImpersonateButton";

type Params = { params: Promise<{ userId: string }> };

export default async function AdminUserPage({ params }: Params) {
  const admin = await getAdminContext();
  if (!admin) {
    const userId = await getSessionUserId();
    if (userId) redirect("/home");
    redirect("/login");
  }

  const { userId } = await params;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      createdAt: true,
      attempts: {
        where: { part: 1 },
        orderBy: { startedAt: "desc" },
        select: {
          id: true,
          promptText: true,
          status: true,
          coachingMode: true,
          coachingPhase: true,
          startedAt: true,
          completedAt: true,
          lastFeedbackGrade: true,
        },
      },
    },
  });

  if (!user) notFound();

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <header className="bg-white border-b border-[#E5E7EB] px-5 h-14 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-[14px] font-medium text-[#4B5563] hover:text-[#111827]">
            Back
          </Link>
          <span className="text-[#E5E7EB]">|</span>
          <span className="font-semibold text-[#111827]">Student Detail</span>
        </div>
        <ImpersonateButton userId={user.id} label="Browse as student" />
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 mb-5">
          <h1 className="text-[22px] font-semibold text-[#111827]">{user.email}</h1>
          <p className="text-[14px] text-[#4B5563] mt-1">
            Registered: {user.createdAt.toLocaleString()}
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr className="text-[12px] text-[#4B5563]">
                  <th className="px-4 py-3 font-semibold">Started</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Mode</th>
                  <th className="px-4 py-3 font-semibold">Phase</th>
                  <th className="px-4 py-3 font-semibold">Score</th>
                  <th className="px-4 py-3 font-semibold">Prompt</th>
                </tr>
              </thead>
              <tbody>
                {user.attempts.map((attempt) => (
                  <tr key={attempt.id} className="border-b border-[#F3F4F6] last:border-b-0">
                    <td className="px-4 py-3 text-[14px] text-[#111827]">{attempt.startedAt.toLocaleString()}</td>
                    <td className="px-4 py-3 text-[14px] text-[#111827]">{attempt.status}</td>
                    <td className="px-4 py-3 text-[14px] text-[#111827]">{attempt.coachingMode ?? "v1"}</td>
                    <td className="px-4 py-3 text-[14px] text-[#111827]">{attempt.coachingPhase ?? "—"}</td>
                    <td className="px-4 py-3 text-[14px] text-[#111827]">{attempt.lastFeedbackGrade ?? "—"}</td>
                    <td className="px-4 py-3 text-[14px] text-[#4B5563] max-w-[380px] truncate">
                      {attempt.promptText ?? "—"}
                    </td>
                  </tr>
                ))}
                {user.attempts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[14px] text-[#4B5563]">
                      No essay attempts yet.
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
