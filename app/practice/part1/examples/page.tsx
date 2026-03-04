import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function Part1ExamplesPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const completed = await prisma.attempt.findMany({
    where: { userId, part: 1, section: null, status: "completed" },
    orderBy: { completedAt: "desc" },
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
          Completed essays (content and scoring coming when we add storage).
        </p>
        {completed.length === 0 ? (
          <p className="text-neutral-500 text-sm">No completed essays yet.</p>
        ) : (
          <ul className="space-y-2">
            {completed.map((a) => (
              <li
                key={a.id}
                className="bg-white rounded-lg border border-neutral-200 px-4 py-3 text-sm text-neutral-700"
              >
                Completed {a.completedAt ? new Date(a.completedAt).toLocaleDateString() : "—"}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
