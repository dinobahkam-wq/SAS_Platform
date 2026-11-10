"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { formats, slugify, textToBody } from "@/lib/content";

const allowedSections = ["news", "analysis", "research", "media"] as const;
const allowedStatuses = ["draft", "published", "archived"] as const;

function readContent(formData: FormData) {
  const section = String(formData.get("section") ?? "");
  const format = String(formData.get("format") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const bodyText = String(formData.get("body") ?? "").trim();
  const categoryValue = String(formData.get("category_id") ?? "").trim();
  const coverValue = String(formData.get("cover_asset_id") ?? "").trim();
  const statusValue = String(formData.get("status") ?? "draft");
  const isFeatured = formData.get("is_featured") === "on";
  const sourceIds = [...new Set(formData.getAll("source_ids").map(String).filter(Boolean))];

  if (!allowedSections.includes(section as (typeof allowedSections)[number])) {
    throw new Error("اختر قسمًا صحيحًا للمحتوى.");
  }
  if (!formats.some((item) => item.value === format && item.section === section)) {
    throw new Error("نوع المحتوى لا يتوافق مع القسم المحدد.");
  }
  if (!title) throw new Error("عٶ��q�^