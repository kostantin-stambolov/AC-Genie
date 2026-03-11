import { NextResponse } from "next/server";
import { clearAdminContextCookie, clearCurrentSession } from "@/lib/auth";

export async function POST() {
  await clearCurrentSession();
  await clearAdminContextCookie();
  return NextResponse.json({ ok: true });
}
