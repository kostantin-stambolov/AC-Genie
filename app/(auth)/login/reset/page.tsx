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
      setMessage({ type: "ok", text: "Unblocked. You can try signing in again." });
    } catch {
      setMessage({ type: "err", text: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-neutral-50">
      <main className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-neutral-900 mb-1">Unblock login</h1>
        <p className="text-neutral-600 text-sm mb-4">
          If you see &quot;Too many attempts&quot;, enter your email and rescue secret below.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-neutral-300 bg-white text-neutral-900"
              required
            />
          </div>
          <div>
            <label htmlFor="secret" className="block text-sm font-medium text-neutral-700 mb-1">
              Rescue secret
            </label>
            <input
              id="secret"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-neutral-300 bg-white text-neutral-900"
              placeholder="Set in Railway as RATE_LIMIT_RESET_SECRET"
            />
          </div>
          {message && (
            <p className={`text-sm ${message.type === "ok" ? "text-green-700" : "text-red-600"}`}>
              {message.text}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg bg-blue-600 text-white font-medium disabled:opacity-50"
          >
            {loading ? "Unblocking…" : "Unblock"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-neutral-500">
          <Link href="/login" className="text-blue-600 hover:underline">
            ← Back to sign in
          </Link>
        </p>
      </main>
    </div>
  );
}
