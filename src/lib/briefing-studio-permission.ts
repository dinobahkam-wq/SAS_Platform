import "server-only";

import { createClient } from "@/lib/supabase/server";

/** Visibility only. The /admin route enforces authorization independently. */
export async function canUseNewsStudio(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;
    if (error || !userId) return false;

    const { data: membership, error: membershipError } = await supabase
      .from("user_roles")
      .select("role, is_active")
      .eq("user_id", userId)
      .maybeSingle();

    return !membershipError && membership?.role === "admin" && membership.is_active === true;
  } catch {
    return false;
  }
}
