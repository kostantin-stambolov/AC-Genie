"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      When you are done,{" "}
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="text-blue-600 hover:underline font-medium disabled:opacity-50"
      >
        mark as complete
      </button>
      .
    </>
  );
}
