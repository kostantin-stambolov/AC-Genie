import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CompleteEssayForm } from "./CompleteEssayForm";

type Props = { searchParams: Promise<{ attemptId?: string }> };

export default async function Part1Page({ searchParams }: Props) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const { attemptId } = await searchParams;
  if (!attemptId) redirect("/home");

  const attempt = await prisma.attempt.findFirst({
    where: { id: attemptId, userId, part: 1, section: null, status: "in_progress" },
  });
  if (!attempt) redirect("/home");

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 px-4 py-3">
        <a href="/home" className="text-sm text-blue-600 hover:underline">
          ← Back to home
        </a>
      </header>
      <main className="p-4 max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">Part 1 – Essay</h1>
        <p className="text-neutral-600 text-sm mb-6">
          Write your essay below. When you are done, mark it as complete.
        </p>
        <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-6">
          <p className="text-sm text-neutral-500 italic mb-4">
            Essay prompt placeholder. (Real content from Exam Guide / content DB will go here.)
          </p>
          <textarea
            readOnly
            className="w-full min-h-[200px] p-3 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-700 text-sm"
            placeholder="Your essay will be saved here. Dictation / file upload coming later."
          />
        </div>
        <CompleteEssayForm attemptId={attemptId} />
      </main>
    </div>
  );
}
