import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireBriefingStaff() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  const userId = typeof claims?.sub === "string" ? claims.sub : null;

  if (claimsError || !userId) redirect("/login");

  const { data: role, error: roleError } = await supabase
    .from("user_roles")
    .select("role,is_active")
    .eq("user_id", userId)
    .maybeSingle();

  if (roleError || !role || !role.is_active || !["admin", "editor"].includes(role.role)) {
    redirect("/login?error=unauthorized");
  }

  const { data: author } = await supabase
    .from("authors")
    .select("display_name")
    .eq("auth_user_id", userId)
    .maybeSingle();

  return {
    supabase,
    userId,
    role: role.role as "admin" | "editor",
    email: typeof claims?.email === "string" ? claims.email : "",
    displayName: author?.display_name ?? (role.role === "admin" ? "مدير المنصة" : "محرر ساس"),
  };
}

export async function requireBriefingAdmin() {
  const staff = await requireBriefingStaff();
  if (staff.role !== "admin") redirect("/briefing-room?error=admin-only");
  return staff;
}
