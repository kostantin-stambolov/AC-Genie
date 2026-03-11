"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SessionPayload = {
  user: { id: string } | null;
  isAdmin?: boolean;
  adminEmail?: string | null;
  impersonatedUserId?: string | null;
  impersonatedEmail?: string | null;
};

export function AdminBanner() {
  const router = useRouter();
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data: SessionPayload) => {
        if (isMounted) setSession(data);
      })
      .catch(() => undefined);
    return () => {
      isMounted = false;
    };
  }, []);

  if (!session?.isAdmin) return null;

  async function stopImpersonating() {
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
    <>
      <div className="fixed top-0 inset-x-0 z-[60] h-10 bg-[#312E81] text-white border-b border-[#4338CA]">
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
            <button
              type="button"
              onClick={stopImpersonating}
              disabled={loading || !session.impersonatedUserId}
              className="h-7 px-2.5 rounded-md bg-white/15 hover:bg-white/25 text-[12px] font-semibold inline-flex items-center transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Stop
            </button>
          </div>
        </div>
      </div>
      <div className="h-10" />
    </>
  );
}
