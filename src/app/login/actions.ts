"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=missing");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    redirect("/login?error=credentials");
  }

  const { data: role, error: roleError } = await supabase
    .from("user_roles")
    .select("role, is_active")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (roleError || !role || role.role !== "admin" || !role.is_active) {
    await supabase.auth.signOut();
    redirect("/login?error=unauthorized");
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
