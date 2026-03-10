import Link from "next/link";
import { ChevronLeft } from "./icons";

type Props = {
  backHref: string;
  backLabel?: string;
  title?: string;
};

/**
 * Shared page header for all inner screens.
 * Shows a back button with a proper icon on the left and an optional title.
 */
export function NavHeader({ backHref, backLabel = "Назад", title }: Props) {
  return (
    <header className="bg-white border-b border-neutral-100 px-4 h-14 flex items-center gap-3 sticky top-0 z-20">
      <Link
        href={backHref}
        className="flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-900 active:opacity-70 transition cursor-pointer select-none -ml-1 px-2 py-2 rounded-lg hover:bg-neutral-100"
      >
        <ChevronLeft size={18} className="shrink-0" />
        <span>{backLabel}</span>
      </Link>

      {title && (
        <>
          <span className="text-neutral-200 text-lg leading-none select-none">|</span>
          <span className="text-sm font-semibold text-neutral-900 truncate">{title}</span>
        </>
      )}
    </header>
  );
}
