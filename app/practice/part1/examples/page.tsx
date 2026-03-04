import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

function getTopicTitle(promptText: string | null): string {
  if (!promptText) return "Essay";
  try {
    const p = JSON.parse(promptText) as { title?: string };
    return typeof p.title === "string" ? p.title : "Essay";
  } catch {
    return "Essay";
  }
}

export default async function Part1ExamplesPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const attempts = await prisma.attempt.findMany({
    where: {
      userId,
      part: 1,
      section: null,
      lastFeedbackAt: { not: null },
    },
    orderBy: { lastFeedbackAt: "desc" },
    take: 20,
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 px-4 py-3">
        <Link href="/home" className="text-sm text-blue-600 hover:underline">
          ← Back to home
        </Link>
      </header>
      <main className="p-4 max-w-lg mx-auto">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">
          Part 1 – Previous examples
        </h1>
        <p className="text-neutral-600 text-sm mb-6">
          View the latest text, each iteration you submitted for feedback, and the suggested essay.
        </p>
        {attempts.length === 0 ? (
          <p className="text-neutral-500 text-sm">No essay feedback yet. Complete at least one feedback round to see it here.</p>
        ) : (
          <ul className="space-y-2">
            {attempts.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/practice/part1/examples/${a.id}`}
                  className="block bg-white rounded-lg border border-neutral-200 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300"
                >
                  <span className="font-medium text-neutral-900">{getTopicTitle(a.promptText)}</span>
                  <span className="text-neutral-500 ml-2">
                    {a.lastFeedbackAt ? new Date(a.lastFeedbackAt).toLocaleString() : "—"}
                  </span>
                  {a.status === "in_progress" && (
                    <span className="ml-2 text-amber-600 text-xs">In progress</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
