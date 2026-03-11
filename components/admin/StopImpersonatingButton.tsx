"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  disabled?: boolean;
};

export function StopImpersonatingButton({ disabled = false }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleStop() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/impersonate", { method: "DELETE" });
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleStop}
      disabled={disabled || loading}
      className="h-7 px-2.5 rounded-md bg-white/15 hover:bg-white/25 text-[12px] font-semibold inline-flex items-center transition disabled:opacity-60 disabled:cursor-not-allowed"
    >
      Stop
    </button>
  );
}
