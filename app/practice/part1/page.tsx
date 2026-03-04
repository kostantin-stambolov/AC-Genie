import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EssayFeedbackSection } from "./EssayFeedbackSection";

type Props = { searchParams: Promise<{ attemptId?: string }> };

function parsePrompt(promptText: string | null): { title: string; instruction: string; body: string } | null {
  if (!promptText) return null;
  try {
    const p = JSON.parse(promptText) as { title?: string; instruction?: string; body?: string };
    return {
      title: p.title ?? "Essay",
      instruction: p.instruction ?? "",
      body: p.body ?? "",
    };
  } catch {
    return { title: "Essay", instruction: promptText, body: "" };
  }
}

export default async function Part1Page({ searchParams }: Props) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const { attemptId } = await searchParams;
  if (!attemptId) redirect("/home");

  const attempt = await prisma.attempt.findFirst({
    where: { id: attemptId, userId, part: 1, section: null, status: "in_progress" },
  });
  if (!attempt) redirect("/home");

  const prompt = parsePrompt(attempt.promptText);

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 px-4 py-3">
        <Link href="/home" className="text-sm text-blue-600 hover:underline">
          ← Back to home
        </Link>
      </header>
      <main className="p-4 max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">Part 1 – Essay</h1>
        <p className="text-neutral-600 text-sm mb-6">
          Write your essay below. You can type, dictate, or upload an audio file. Then click Submit for feedback.
        </p>

        {/* Essay topic / prompt */}
        <section className="mb-6" aria-label="Essay topic">
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Your topic</h2>
          {prompt ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <h3 className="text-sm font-semibold text-neutral-800 mb-2">{prompt.title}</h3>
              {prompt.body && (
                <p className="text-sm text-neutral-700 whitespace-pre-wrap mb-3">{prompt.body}</p>
              )}
              <p className="text-sm text-neutral-600 whitespace-pre-wrap">{prompt.instruction}</p>
            </div>
          ) : (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-sm text-amber-800">
              No topic loaded. Go back to home and start a new essay to choose a topic.
            </div>
          )}
        </section>

        {/* Essay input + Submit for feedback (only button) */}
        <EssayFeedbackSection
          attemptId={attemptId}
          initialBody={attempt.essayBody ?? ""}
        />
      </main>
    </div>
  );
}
