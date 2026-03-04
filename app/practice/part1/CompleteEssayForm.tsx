"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CompleteEssayForm({ attemptId }: { attemptId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleComplete() {
    setLoading(true);
    try {
      const res = await fetch("/api/attempts/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId }),
      });
      if (!res.ok) return;
      router.push("/home");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleComplete}
      disabled={loading}
      className="w-full h-12 rounded-lg bg-green-600 text-white font-medium disabled:opacity-50"
    >
      {loading ? "Saving…" : "Mark as complete"}
    </button>
  );
}
