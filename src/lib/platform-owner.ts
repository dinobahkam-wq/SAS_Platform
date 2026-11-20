import "server-only";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

export async function currentUserIsOwner() {
  const {supabase} = await requireAdmin();
  const {data,error} = await supabase.rpc("is_platform_owner");
  return !error && data === true;
}

export async function requirePlatformOwner() {
  const admin = await requireAdmin();
  const {data,error} = await admin.supabase.rpc("is_platform_owner");
  if (error || data !== true) redirect("/admin?error=owner-only");
  return admin;
}
