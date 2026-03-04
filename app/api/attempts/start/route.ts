import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { startAttempt, PART_1, PART_2, PART_2_SECTIONS } from "@/lib/attempts";

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const part = Number(body.part);
  const section = body.section != null ? Number(body.section) : null;

  if (part !== PART_1 && part !== PART_2) {
    return NextResponse.json({ error: "Invalid part" }, { status: 400 });
  }
  if (part === PART_2 && (section == null || !PART_2_SECTIONS.includes(section))) {
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  }
  if (part === PART_1 && section != null) {
    return NextResponse.json({ error: "Part 1 has no section" }, { status: 400 });
  }

  const attempt = await startAttempt(userId, part, part === PART_1 ? null : section);
  return NextResponse.json({ attempt: { id: attempt.id, part, section } });
}
