import { redirect, notFound } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { startAttempt, PART_2_SECTIONS } from "@/lib/attempts";

type Props = { params: Promise<{ section: string }> };

export default async function Part2SectionNewPage({ params }: Props) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const { section: sectionParam } = await params;
  const section = Number(sectionParam);
  if (!PART_2_SECTIONS.includes(section)) notFound();

  const attempt = await startAttempt(userId, 2, section);
  redirect(`/practice/part2/${section}?attemptId=${attempt.id}`);
}
