import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { completeAttempt } from "@/lib/attempts";

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const attemptId = typeof body.attemptId === "string" ? body.attemptId : "";
  if (!attemptId) {
    return NextResponse.json({ error: "Missing attemptId" }, { status: 400 });
  }

  await completeAttempt(attemptId, userId);
  return NextResponse.json({ ok: true });
}
