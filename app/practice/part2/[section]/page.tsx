import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PART_2_SECTIONS, SECTION_NAMES } from "@/lib/attempts";
import { CompleteSectionForm } from "./CompleteSectionForm";

type Props = {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ attemptId?: string }>;
};

export default async function Part2SectionPage({ params, searchParams }: Props) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const { section: sectionParam } = await params;
  const section = Number(sectionParam);
  if (!PART_2_SECTIONS.includes(section)) notFound();

  const { attemptId } = await searchParams;
  if (!attemptId) redirect("/home");

  const attempt = await prisma.attempt.findFirst({
    where: { id: attemptId, userId, part: 2, section, status: "in_progress" },
  });
  if (!attempt) redirect("/home");

  const name = SECTION_NAMES[section] ?? `Section ${section}`;

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 px-4 py-3">
        <Link href="/home" className="text-sm text-blue-600 hover:underline">
          ← Back to home
        </Link>
      </header>
      <main className="p-4 max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">
          Part 2 – {name}
        </h1>
        <p className="text-neutral-600 text-sm mb-6">
          Practice questions will appear here. When you finish, mark as complete.
        </p>
        <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-6">
          <p className="text-sm text-neutral-500 italic">
            Content placeholder. (PDF or structured questions will load here.)
          </p>
        </div>
        <CompleteSectionForm attemptId={attemptId} />
      </main>
    </div>
  );
}
