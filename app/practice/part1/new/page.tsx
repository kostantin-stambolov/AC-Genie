import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { startAttempt } from "@/lib/attempts";

export default async function Part1NewPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const attempt = await startAttempt(userId, 1, null);
  redirect(`/practice/part1?attemptId=${attempt.id}`);
}
