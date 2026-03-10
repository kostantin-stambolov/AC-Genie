"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "@/components/icons";

export function LogoutButton() {
  const router = useRouter();
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex items-center gap-1.5 text-[14px] font-medium text-[#9CA3AF] hover:text-[#111827] transition cursor-pointer px-2 py-2 rounded-xl hover:bg-[#F3F4F6] -mr-2"
      aria-label="Sign out"
    >
      <LogOut size={16} />
      <span className="hidden sm:inline">Изход</span>
    </button>
  );
}
