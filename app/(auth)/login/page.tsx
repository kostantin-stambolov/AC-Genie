"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.id) {
          router.replace("/home");
          router.refresh();
          return;
        }
        if (data?.isAdmin) {
          router.replace("/admin");
          router.refresh();
        }
      })
      .catch(() => undefined);
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), pin }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      router.push(data.isAdmin ? "/admin" : "/home");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left accent panel – hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0B1F3A] to-[#1e3a5f] flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm">AC</span>
          <span className="text-white font-semibold tracking-wide">American College Prep</span>
        </div>
        <div>
          <p className="text-white/80 text-[18px] leading-relaxed mb-4">
            "Build your castles in the air, then build the foundations under them."
          </p>
          <p className="text-white/50 text-[14px]">— Henry David Thoreau</p>
        </div>
        <p className="text-white/40 text-[12px]">Prepare. Practice. Succeed.</p>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Logo mark – mobile only */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <span className="w-8 h-8 rounded-lg bg-[#0B1F3A] flex items-center justify-center text-white font-bold text-sm">AC</span>
            <span className="text-[#111827] font-semibold">American College Prep</span>
          </div>

          <h1 className="text-[26px] font-semibold text-[#111827] mb-1 tracking-tight">Welcome back</h1>
          <p className="text-[#6B7280] text-[15px] mb-8">Sign in to continue practising</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[12px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[52px] px-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] text-[#111827] text-[15px] placeholder:text-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label htmlFor="pin" className="block text-[12px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5">
                PIN
              </label>
              <input
                id="pin"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
                className="w-full h-[52px] px-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] text-[#111827] text-[15px] placeholder:text-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition"
                placeholder="4–8 digits"
                required
                minLength={4}
                maxLength={8}
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-[14px] text-red-700">{error}</p>
                {error.includes("Too many attempts") && (
                  <Link href="/login/reset" className="text-[14px] text-red-600 underline mt-1 inline-block">
                    Unblock this email →
                  </Link>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] rounded-2xl bg-[#0B1F3A] text-white text-[15px] font-semibold hover:bg-[#122a50] hover:-translate-y-0.5 shadow-md transition-all disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-[15px] text-[#9CA3AF]">
            No account?{" "}
            <a href="/register" className="text-indigo-600 font-medium hover:underline">
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
