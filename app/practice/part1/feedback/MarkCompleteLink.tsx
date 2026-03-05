"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "@/components/icons";

export function MarkCompleteLink({ attemptId }: { attemptId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/attempts/complete", {
        method: "POST",
        credentials: "same-origin",
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
    <>
      Happy with this version?{" "}
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-1 text-violet-600 hover:underline font-semibold disabled:opacity-50 cursor-pointer"
      >
        <CheckCircle size={14} />
        {loading ? "Saving…" : "Mark as complete"}
      </button>
    </>
  );
}
