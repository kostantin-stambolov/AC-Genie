import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { getActiveAttempt } from "@/lib/attempts";
import { pickRandomPrompts } from "@/lib/essay-prompts";
import { NavHeader } from "@/components/NavHeader";
import { TopicPicker } from "./TopicPicker";

export default async function Part1NewPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const active = await getActiveAttempt(userId, 1, null);
  if (active) redirect(`/practice/part1?attemptId=${active.id}`);

  const options = pickRandomPrompts(3);

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <NavHeader backHref="/home" backLabel="Home" title="Choose a topic" />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Choose your essay topic</h1>
          <p className="text-neutral-500 text-sm">Three topics have been generated for you. Pick the one that speaks to you most.</p>
        </div>
        <TopicPicker options={options} />
      </main>
    </div>
  );
}
