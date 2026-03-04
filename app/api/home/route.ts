import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getHomeState, PART_2_SECTIONS, SECTION_NAMES } from "@/lib/attempts";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = await getHomeState(userId);
  const part2List = PART_2_SECTIONS.map((section) => ({
    section,
    name: SECTION_NAMES[section] ?? `Section ${section}`,
    hasActive: !!state.part2[section]?.active,
    activeId: state.part2[section]?.active?.id ?? null,
    hasCompleted: state.part2[section]?.completed ?? false,
  }));

  return NextResponse.json({
    part1: state.part1,
    part2: part2List,
  });
}
