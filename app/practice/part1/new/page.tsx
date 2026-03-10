import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { getActiveAttempt } from "@/lib/attempts";
import { prisma } from "@/lib/db";
import { pickRandomPrompts } from "@/lib/essay-prompts";
import { NavHeader } from "@/components/NavHeader";
import { NewEssayFlow } from "./NewEssayFlow";

export default async function Part1NewPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const active = await getActiveAttempt(userId, 1, null);
  if (active) {
    // Redirect to the correct flow based on mode
    const attempt = await prisma.attempt.findUnique({ where: { id: active.id } });
    if (attempt?.coachingMode === "v2") {
      redirect(`/practice/part1/coach?attemptId=${active.id}`);
    }
    redirect(`/practice/part1?attemptId=${active.id}`);
  }

  const options = pickRandomPrompts(3);

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <NavHeader backHref="/home" backLabel="Начало" title="Ново есе" />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <NewEssayFlow options={options} />
      </main>
    </div>
  );
}
