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
          <div className="flex items-center shrink-0">
            <StopImpersonatingButton disabled={!session.impersonatedUserId} />
          </div>
        </div>
      </div>
      <div className="h-10" />
    </>
  );
}
