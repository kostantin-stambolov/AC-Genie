import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthContext } from "@/lib/auth";
import { getHomeState } from "@/lib/attempts";
import { LogoutButton } from "./LogoutButton";
import { ArrowRight, FileText } from "@/components/icons";
import { ModuleCard } from "@/components/ModuleCard";

export default async function HomePage() {
  const auth = await getAuthContext();
  const userId = auth.effectiveUserId;
  if (!userId) {
    if (auth.isAdmin) redirect("/admin");
    redirect("/login");
  }

  const state = await getHomeState(userId);

  const hasActive   = state.part1.hasActive;
  const activeMode  = state.part1.activeCoachingMode ?? "v1";
  const activePhase = state.part1.activeCoachingPhase;
  const activeHref  = activeMode === "v2"
    ? `/practice/part1/coach?attemptId=${state.part1.activeId}`
    : `/practice/part1?attemptId=${state.part1.activeId}`;

  const PHASE_LABELS: Record<string, string> = {
    comprehension: "Фаза 1 от 6: Разбери",
    outline:       "Фаза 2 от 6: Планирай",
    writing:       "Фаза 3 от 6: Пиши",
    review:        "Фаза 4 от 6: Провери",
    feedback:      "Фаза 5 от 6: Оценка",
    reflect:       "Фаза 6 от 6: Размисли",
  };

  const activeBadge = hasActive ? (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
      В процес
    </span>
  ) : null;

  const activeContent = hasActive ? (
    <>
      {activeMode === "v2" ? (
        <>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-2.5 py-1">Насочено обучение</span>
            {activePhase && PHASE_LABELS[activePhase] && (
              <span className="text-[13px] text-[#9CA3AF]">{PHASE_LABELS[activePhase]}</span>
            )}
          </div>
          <p className="text-[15px] text-[#4B5563]">Обучителната ти сесия е в ход. Продължи откъдето спря.</p>
        </>
      ) : (
        <p className="text-[15px] text-[#4B5563]">Имаш есе в процес. Продължи откъдето спря.</p>
      )}
      <Link
        href={activeHref}
        className="flex items-center justify-center gap-2 w-full h-[52px] rounded-2xl bg-[#0B1F3A] text-white text-[15px] font-semibold hover:bg-[#122a50] hover:-translate-y-0.5 shadow-md transition-all cursor-pointer"
      >
        {activeMode === "v2" ? <>Продължи сесията <ArrowRight size={16} /></> : <>Продължи писането <ArrowRight size={16} /></>}
      </Link>
      <Link
        href="/practice/part1/examples"
        className="flex items-center justify-center w-full h-[50px] rounded-2xl bg-[#F3F4F6] text-[#6B7280] text-[15px] font-normal hover:bg-[#E5E7EB] transition cursor-pointer"
      >
        Виж предишни опити
      </Link>
    </>
  ) : null;

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* Top nav */}
      <header className="bg-white border-b border-[#E5E7EB] px-5 h-14 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-[#0B1F3A] flex items-center justify-center text-white font-bold text-sm select-none">AC</span>
          <span className="font-semibold text-[#111827] tracking-tight">American College Prep</span>
        </div>
        <LogoutButton />
      </header>

      <main className="max-w-xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-[26px] font-semibold text-[#111827] mb-1 tracking-tight">Твоята практика</h1>
          <p className="text-[#4B5563] text-[15px]">Избери модул, за да се подготвиш за приемния изпит.</p>
        </div>

        <ModuleCard
          icon={<FileText size={22} className="text-indigo-600" />}
          iconBg="bg-indigo-50"
          title="Есе"
          subtitle="Приемен изпит — Част 1"
          badge={activeBadge}
          description="Напиши есе и получи честна оценка по критериите на АКС — с конкретни насоки как да се подобриш преди истинския изпит."
          actions={[
            { label: "Напиши ново есе", href: "/practice/part1/new", primary: true },
            { label: "Виж предишни опити", href: "/practice/part1/examples" },
          ]}
          isActive={hasActive}
          activeContent={activeContent}
        />
      </main>
    </div>
  );
}
