import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  clearCurrentSession,
  createSession,
  getAdminContext,
  setAdminContextCookie,
  setSessionCookie,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const admin = await getAdminContext();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const userId = typeof body.userId === "string" ? body.userId : "";
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await clearCurrentSession();
  const token = await createSession(target.id);
  await setSessionCookie(token);
  await setAdminContextCookie({
    ...admin,
    impersonatedUserId: target.id,
    impersonatedEmail: target.email,
    issuedAt: Date.now(),
  });

  return NextResponse.json({
    ok: true,
    impersonatedUserId: target.id,
    impersonatedEmail: target.email,
  });
}

export async function DELETE() {
  const admin = await getAdminContext();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await clearCurrentSession();
  await setAdminContextCookie({
    ...admin,
    impersonatedUserId: null,
    impersonatedEmail: null,
    issuedAt: Date.now(),
  });

  return NextResponse.json({ ok: true });
}
