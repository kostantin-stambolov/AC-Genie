import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { startAttempt, PART_1, PART_2, PART_2_SECTIONS } from "@/lib/attempts";

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { part?: unknown; section?: unknown; promptText?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const part = Number(body?.part);
    const section = body?.section != null ? Number(body.section) : null;
    const promptText = typeof body?.promptText === "string" ? body.promptText : undefined;

    if (part !== PART_1 && part !== PART_2) {
      return NextResponse.json({ error: "Invalid part" }, { status: 400 });
    }
    if (part === PART_2 && (section == null || !PART_2_SECTIONS.includes(section))) {
      return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }
    if (part === PART_1 && section != null) {
      return NextResponse.json({ error: "Part 1 has no section" }, { status: 400 });
    }

    const attempt = await startAttempt(
      userId,
      part,
      part === PART_1 ? null : section,
      part === PART_1 ? promptText : undefined
    );
    return NextResponse.json({ attempt: { id: attempt.id, part, section } });
  } catch (err) {
    console.error("POST /api/attempts/start error:", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? message : "Request failed (500)" },
      { status: 500 }
    );
  }
}
