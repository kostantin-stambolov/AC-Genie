import { redirect, notFound } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PART_2_SECTIONS, SECTION_NAMES } from "@/lib/attempts";
import { NavHeader } from "@/components/NavHeader";

type Props = { params: Promise<{ section: string }> };

export default async function Part2SectionExamplesPage({ params }: Props) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const { section: sectionParam } = await params;
  const section = Number(sectionParam);
  if (!PART_2_SECTIONS.includes(section)) notFound();

  const completed = await prisma.attempt.findMany({
    where: { userId, part: 2, section, status: "completed" },
    orderBy: { completedAt: "desc" },
    take: 20,
  });

  const name = SECTION_NAMES[section] ?? `Раздел ${section}`;

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <NavHeader backHref="/home" backLabel="Начало" title={`${name} – Предишни опити`} />
      <main className="max-w-xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-[26px] font-semibold text-[#111827] mb-1 tracking-tight">{name} – Предишни опити</h1>
          <p className="text-[#4B5563] text-[15px]">Завършени опити за този раздел.</p>
        </div>

        {completed.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-8 text-center">
            <p className="font-semibold text-[#111827] text-[18px] mb-1">Все още няма нищо</p>
            <p className="text-[#6B7280] text-[15px]">Завърши поне един опит, за да видиш историята си.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {completed.map((a) => (
              <li
                key={a.id}
                className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-5 py-4 text-[15px] text-[#4B5563]"
              >
                Завършено на {a.completedAt ? new Date(a.completedAt).toLocaleDateString("bg-BG") : "—"}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
