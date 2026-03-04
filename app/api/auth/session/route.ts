import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user: { id: userId } });
  // Do not expose email or PIN to client
}
