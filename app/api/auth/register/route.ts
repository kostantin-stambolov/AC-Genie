import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPin, createSession, setSessionCookie, clearAdminContextCookie } from "@/lib/auth";

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
    if (!normalizedEmail || normalizedEmail.length > EMAIL_MAX) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (!validatePin(pin)) {
      return NextResponse.json(
        { error: "PIN must be 4–8 digits" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const pinHash = await hashPin(pin);
    const user = await prisma.user.create({
      data: { email: normalizedEmail, pinHash },
    });

    const token = await createSession(user.id);
    await setSessionCookie(token);
    await clearAdminContextCookie();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/auth/register error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Something went wrong. Please try again." : message },
      { status: 500 }
    );
  }
}
