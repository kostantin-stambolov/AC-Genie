import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";

export async function GET() {
  const context = await getAuthContext();
  return NextResponse.json({
    user: context.effectiveUserId ? { id: context.effectiveUserId } : null,
    isAdmin: context.isAdmin,
    adminEmail: context.adminEmail,
    impersonatedUserId: context.impersonatedUserId,
    impersonatedEmail: context.impersonatedEmail,
  });
}
