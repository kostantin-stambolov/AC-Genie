import Link from "next/link";
import { ChevronLeft } from "./icons";

type Props = {
  backHref: string;
  backLabel?: string;
  title?: string;
};

export function NavHeader({ backHref, backLabel = "Назад", title }: Props) {
  return (
    <header className="bg-white border-b border-[#E5E7EB] px-4 h-14 flex items-center gap-3 sticky top-0 z-20">
      <Link
        href={backHref}
        className="flex items-center gap-1 text-[14px] font-medium text-[#6B7280] hover:text-[#111827] active:opacity-70 transition cursor-pointer select-none -ml-1 px-2 py-2 rounded-xl hover:bg-[#F3F4F6]"
      >
        <ChevronLeft size={18} className="shrink-0" />
        <span>{backLabel}</span>
      </Link>

      {title && (
        <>
          <span className="text-[#E5E7EB] text-lg leading-none select-none">|</span>
          <span className="text-[15px] font-semibold text-[#111827] truncate">{title}</span>
        </>
      )}
    </header>
  );
}
