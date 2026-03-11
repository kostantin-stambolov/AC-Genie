import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  verifyPin,
  createSession,
  setSessionCookie,
  isRateLimited,
  recordLoginAttempt,
  clearLoginRateLimit,
  isAdminCredentials,
  setAdminContextCookie,
  clearAdminContextCookie,
  clearCurrentSession,
} from "@/lib/auth";

const PIN_MIN = 4;
const PIN_MAX = 8;
const EMAIL_MAX = 255;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function validatePin(pin: string): boolean {
  return /^\d+$/.test(pin) && pin.length >= PIN_MIN && pin.length <= PIN_MAX;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email : "";
    const pin = typeof body.pin === "string" ? body.pin : "";

    const normalizedEmail = normalizeEmail(email);
    const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
    const isAdminEmail = !!adminEmail && normalizedEmail === adminEmail;
    if (!normalizedEmail || normalizedEmail.length > EMAIL_MAX) {
      return NextResponse.json(
        { error: "Invalid email" },
        { status: 400 }
      );
    }
    if (!isAdminEmail && !validatePin(pin)) {
      return NextResponse.json(
        { error: "PIN must be 4–8 digits" },
        { status: 400 }
      );
    }

    if (isRateLimited(normalizedEmail)) {
      return NextResponse.json(
        { error: "Too many attempts. Try again later." },
        { status: 429 }
      );
    }

    if (isAdminCredentials(normalizedEmail, pin)) {
      clearLoginRateLimit(normalizedEmail);
      await clearCurrentSession();
      await setAdminContextCookie({
        isAdmin: true,
        adminEmail: normalizedEmail,
        impersonatedUserId: null,
        impersonatedEmail: null,
        issuedAt: Date.now(),
      });
      return NextResponse.json({ ok: true, isAdmin: true });
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      recordLoginAttempt(normalizedEmail);
      return NextResponse.json(
        { error: "Invalid email or PIN" },
        { status: 401 }
      );
    }

    const valid = await verifyPin(pin, user.pinHash);
    if (!valid) {
      recordLoginAttempt(normalizedEmail);
      return NextResponse.json(
        { error: "Invalid email or PIN" },
        { status: 401 }
      );
    }

    clearLoginRateLimit(normalizedEmail);
    await clearAdminContextCookie();
    const token = await createSession(user.id);
    await setSessionCookie(token);

    return NextResponse.json({ ok: true, isAdmin: false });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
