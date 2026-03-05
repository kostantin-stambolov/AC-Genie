"use client";

import { useState } from "react";
import Link from "next/link";

export default function RateLimitResetPage() {
  const [email, setEmail] = useState("");
  const [secret, setSecret] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/rate-limit-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), secret: secret || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "err", text: (data as { error?: string }).error || "Failed" });
        return;
      }
      setMessage({ type: "ok", text: "Unblocked. You can sign in again." });
    } catch {
      setMessage({ type: "err", text: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-10">
          <span className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-sm">AC</span>
          <span className="text-neutral-900 font-semibold">American College Prep</span>
        </div>

        <h1 className="text-2xl font-bold text-neutral-900 mb-1">Unblock login</h1>
        <p className="text-neutral-500 text-sm mb-8">
          Too many login attempts? Enter your email and rescue secret to reset.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="secret" className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
              Rescue secret
            </label>
            <input
              id="secret"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition"
              placeholder="Set in Railway as RATE_LIMIT_RESET_SECRET"
            />
          </div>

          {message && (
            <div className={`rounded-xl px-4 py-3 text-sm ${message.type === "ok" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 active:scale-[0.98] transition disabled:opacity-50"
          >
            {loading ? "Unblocking…" : "Unblock"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          <Link href="/login" className="inline-flex items-center gap-1 text-violet-600 font-medium hover:underline cursor-pointer">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
