"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  userId: string;
  label?: string;
  className?: string;
};

export function ImpersonateButton({ userId, label = "Impersonate", className }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        setLoading(false);
        return;
      }
      router.push("/home");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={
        className ??
        "inline-flex items-center justify-center h-9 px-3 rounded-lg bg-[#312E81] text-white text-[13px] font-semibold hover:bg-[#3730A3] transition disabled:opacity-50 cursor-pointer"
      }
    >
      {loading ? "Starting..." : label}
    </button>
  );
}
