import { NextRequest, NextResponse } from "next/server";
import { clearLoginRateLimit } from "@/lib/auth";

/**
 * Clears the "too many attempts" block for an email.
 * In production, requires RATE_LIMIT_RESET_SECRET in env and in the request.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const secret = typeof body.secret === "string" ? body.secret : "";

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const expectedSecret = process.env.RATE_LIMIT_RESET_SECRET;
    if (process.env.NODE_ENV === "production") {
      if (!expectedSecret || secret !== expectedSecret) {
        return NextResponse.json({ error: "Invalid or missing secret" }, { status: 403 });
      }
    }

    clearLoginRateLimit(email);
    return NextResponse.json({ ok: true, message: "Rate limit cleared. You can try logging in again." });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
