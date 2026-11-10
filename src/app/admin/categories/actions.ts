"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/content";

export async function createCategory(formData: FormData) {
  const { supabase } = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugInput || name);

  if (!name || !slug) redirect("/admin/categories?error=validation");

  const { error } = await supabase.from("categories").insert({
    name,
    slug,
    description: description || null,
    display_order: Number(formData.get("display_order") ?? 0) || 0,
  });

  if (error) redirect("/admin/categories?error=save");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/content/new");
  redirect("/admin/categories?created=1");
}
