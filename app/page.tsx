import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth";

export default async function RootPage() {
  const context = await getAuthContext();
  if (context.effectiveUserId) redirect("/home");
  if (context.isAdmin) redirect("/admin");
  redirect("/login");
}
