import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PART_2_SECTIONS, SECTION_NAMES } from "@/lib/attempts";
import { CompleteSectionForm } from "./CompleteSectionForm";
import { NavHeader } from "@/components/NavHeader";

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

  const name = SECTION_NAMES[section] ?? `Раздел ${section}`;

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <NavHeader backHref="/home" backLabel="Начало" title={name} />
      <main className="max-w-xl mx-auto px-4 py-10 space-y-6">
        <div>
          <p className="text-[12px] font-bold text-indigo-500 uppercase tracking-widest mb-1">Част 2</p>
          <h1 className="text-[26px] font-semibold text-[#111827] tracking-tight">{name}</h1>
          <p className="text-[#4B5563] text-[15px] mt-1">Упражни се върху въпросите, след което отбележи раздела като завършен.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6">
          <p className="text-[15px] text-[#9CA3AF] italic">
            Съдържанието на раздела ще се зареди тук (PDF или структурирани въпроси).
          </p>
        </div>

        <CompleteSectionForm attemptId={attemptId} />
      </main>
    </div>
  );
}
