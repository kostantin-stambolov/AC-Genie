import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";
import { getActiveAttempt } from "@/lib/attempts";
import { pickRandomPrompts } from "@/lib/essay-prompts";
import { TopicPicker } from "./TopicPicker";

export default async function Part1NewPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  // If they already have an essay in progress, send them to it
  const active = await getActiveAttempt(userId, 1, null);
  if (active) redirect(`/practice/part1?attemptId=${active.id}`);

  const options = pickRandomPrompts(3);

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 px-4 py-3">
        <Link href="/home" className="text-sm text-blue-600 hover:underline">
          ← Back to home
        </Link>
      </header>
      <main className="p-4 max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">
          Part 1 – Essay topic
        </h1>
        <p className="text-neutral-600 text-sm mb-6">
          Three essay topic suggestions are shown below. Select one to go to the Part 1 Essay page and write your essay.
        </p>
        <TopicPicker options={options} />
      </main>
    </div>
  );
}
