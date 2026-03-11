import Link from "next/link";
import { getAuthContext } from "@/lib/auth";
import { StopImpersonatingButton } from "./StopImpersonatingButton";

export async function AdminBanner() {
  const session = await getAuthContext();
  if (!session.isAdmin) return null;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[80] h-10 bg-[#312E81] text-white border-b border-[#4338CA]">
        <div className="h-full px-4 flex items-center justify-between gap-3">
          <p className="text-[13px] font-medium truncate">
            Admin mode
            {session.impersonatedEmail ? ` · Viewing as ${session.impersonatedEmail}` : ""}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/admin"
              className="h-7 px-2.5 rounded-md bg-white/15 hover:bg-white/25 text-[12px] font-semibold inline-flex items-center transition"
            >
              Dashboard
            </Link>
            <StopImpersonatingButton disabled={!session.impersonatedUserId} />
          </div>
        </div>
      </div>
      <div className="h-10" />
    </>
  );
}
