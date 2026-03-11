import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import type { ReactNode } from "react";

type Action = {
  label: string;
  href: string;
  primary?: boolean;
};

type Props = {
  icon: ReactNode;
  iconBg?: string;
  title: string;
  subtitle: string;
  badge?: ReactNode;
  description: string;
  actions: Action[];
  activeContent?: ReactNode;
  isActive?: boolean;
};

export function ModuleCard({
  icon, iconBg = "bg-indigo-50", title, subtitle, badge,
  description, actions, activeContent, isActive,
}: Props) {
  return (
    <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
      {/* Card header */}
      <div className="px-6 py-5 border-b border-[#F3F4F6] flex items-center gap-4">
        <div className={`w-11 h-11 rounded-2xl ${iconBg} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-[#111827] text-[18px] leading-tight">{title}</h2>
          <p className="text-[#9CA3AF] text-[13px] mt-0.5">{subtitle}</p>
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      {/* Card body */}
      <div className="px-6 py-5 space-y-3">
        {isActive ? activeContent : (
          <>
            <p className="text-[15px] text-[#4B5563]">{description}</p>
            {actions.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className={
                  a.primary
                    ? "flex items-center justify-center gap-2 w-full h-[52px] rounded-2xl bg-[#0B1F3A] text-white text-[15px] font-semibold hover:bg-[#122a50] hover:-translate-y-0.5 shadow-md transition-all cursor-pointer"
                    : "flex items-center justify-center w-full h-[50px] rounded-2xl bg-[#F3F4F6] text-[#6B7280] text-[15px] font-normal hover:bg-[#E5E7EB] transition cursor-pointer"
                }
              >
                {a.label}
                {a.primary && <ArrowRight size={16} />}
              </Link>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
