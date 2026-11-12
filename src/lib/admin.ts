import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  const userId = typeof claims?.sub === "string" ? claims.sub : null;

  if (claimsError || !userId) {
    redirect("/login");
  }

  const { data: role, error: roleError } = await supabase
    .from("user_roles")
    .select("role, is_active")
    .eq("user_id", userId)
    .maybeSingle();

  if (roleError || !role || role.role !== "admin" || !role.is_active) {
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
    email: typeof claims?.email === "string" ? claims.email : "",
    displayName: author?.display_name ?? "مدير المنصة",
  };
}
