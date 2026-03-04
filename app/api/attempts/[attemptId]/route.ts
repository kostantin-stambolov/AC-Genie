import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ attemptId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { attemptId } = await params;
  if (!attemptId) return NextResponse.json({ error: "Missing attemptId" }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const essayBody = typeof body.essayBody === "string" ? body.essayBody : undefined;

  if (essayBody === undefined) {
    return NextResponse.json({ error: "Missing essayBody" }, { status: 400 });
  }

  const updated = await prisma.attempt.updateMany({
    where: { id: attemptId, userId, part: 1, status: "in_progress" },
    data: { essayBody },
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "Attempt not found or not writable" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
