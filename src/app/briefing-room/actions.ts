"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireBriefingAdmin, requireBriefingStaff } from "@/lib/briefing-auth";

function textField(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function yemenTimestamp(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value)) return null;
  return `${value.length === 16 ? value + ":00" : value}+03:00`;
}

export async function createEditionAction(formData: FormData) {
  const { supabase } = await requireBriefingStaff();
  const editionDate = textField(formData, "edition_date");
  const editionType = textField(formData, "edition_type") || "daily";
  const title = textField(formData, "title_ar");
  const analysis = textField(formData, "analysis_ar");
  const methodology = textField(formData, "methodology_ar");
  const coverage = textField(formData, "coverage_note_ar");
  const windowStart = yemenTimestamp(textField(formData, "window_start"));
  const windowEnd = yemenTimestamp(textField(formData, "window_end"));
  const suppliedSlug = textField(formData, "slug").toLowerCase();
  const slug = suppliedSlug || (editionType === "daily"
    ? `daily-briefing-${editionDate}`
    : `special-briefing-${editionDate}-${randomUUID().slice(0, 8)}`);

  if (!editionDate || !title || !analysis || !methodology || !coverage || !windowStart || !windowEnd || windowStart >= windowEnd) {
    redirect("/briefing-room/new?error=validation");
  }

  const { data, error } = await supabase.rpc("create_briefing_edition", {
    p_slug: slug,
    p_edition_date: editionDate,
    p_edition_type: editionType,
    p_title_ar: title,
    p_analysis_ar: analysis,
    p_methodology_ar: methodology,
    p_coverage_note_ar: coverage,
    p_window_start: windowStart,
    p_window_end: windowEnd,
  });

  if (error || !data || typeof data !== "object" || !("edition_id" in data)) {
    redirect("/briefing-room/new?error=save");
  }
  const result = data as { edition_id: string };
  redirect(`/briefing-room/${result.edition_id}?created=1`);
}

export async function saveRevisionAction(formData: FormData) {
  const { supabase } = await requireBriefingStaff();
  const revisionId = textField(formData, "revision_id");
  const editionId = textField(formData, "edition_id");
  const windowStart = yemenTimestamp(textField(formData, "window_start"));
  const windowEnd = yemenTimestamp(textField(formData, "window_end"));
  if (!revisionId || !editionId || !windowStart || !windowEnd || windowStart >= windowEnd) {
    redirect(`/briefing-room/${editionId}?error=revision-validation`);
  }
  const { error } = await supabase.from("briefing_revisions").update({
    title_ar: textField(formData, "title_ar"),
    analysis_ar: textField(formData, "analysis_ar"),
    methodology_ar: textField(formData, "methodology_ar"),
    coverage_note_ar: textField(formData, "coverage_note_ar"),
    window_start: windowStart,
    window_end: windowEnd,
  }).eq("id", revisionId).eq("status", "draft");
  if (error) redirect(`/briefing-room/${editionId}?error=revision-save`);
  revalidatePath(`/briefing-room/${editionId}`);
  redirect(`/briefing-room/${editionId}?saved=1`);
}

export async function createDevelopmentAction(formData: FormData) {
  const { supabase, userId } = await requireBriefingStaff();
  const editionId = textField(formData, "edition_id");
  const headline = textField(formData, "headline_ar");
  const summary = textField(formData, "summary_ar");
  const occurredOn = textField(formData, "occurred_on");
  if (!editionId || !headline || !summary) redirect(`/briefing-room/${editionId}?error=development-validation`);

  const { error } = await supabase.from("briefing_developments").insert({
    headline_ar: headline,
    summary_ar: summary,
    category: textField(formData, "category"),
    information_class: textField(formData, "information_class"),
    verification_status: textField(formData, "verification_status") || "unverified",
    verification_note_ar: textField(formData, "verification_note_ar") || null,
    occurred_on: occurredOn || null,
    time_precision: occurredOn ? "date_only" : "unknown",
    location_text: textField(formData, "location_text") || null,
    geographic_scope: textField(formData, "geographic_scope") || "national",
    status: "draft",
    created_by: userId,
  });
  if (error) redirect(`/briefing-room/${editionId}?error=development-save`);
  revalidatePath(`/briefing-room/${editionId}`);
  redirect(`/briefing-room/${editionId}?development-created=1`);
}

export async function linkDevelopmentSourceAction(formData: FormData) {
  const { supabase, userId } = await requireBriefingStaff();
  const editionId = textField(formData, "edition_id");
  const developmentId = textField(formData, "development_id");
  const sourceId = textField(formData, "source_id");
  if (!editionId || !developmentId || !sourceId) redirect(`/briefing-room/${editionId}?error=source-validation`);

  const { error } = await supabase.from("briefing_development_sources").insert({
    development_id: developmentId,
    source_id: sourceId,
    source_role: textField(formData, "source_role") || "supporting",
    display_publicly: formData.get("display_publicly") === "on",
    source_excerpt: textField(formData, "source_excerpt") || null,
    attribution_note: textField(formData, "attribution_note") || null,
    created_by: userId,
  });
  if (error) redirect(`/briefing-room/${editionId}?error=source-link`);
  revalidatePath(`/briefing-room/${editionId}`);
  redirect(`/briefing-room/${editionId}?source-linked=1`);
}

export async function markDevelopmentReadyAction(formData: FormData) {
  const { supabase } = await requireBriefingStaff();
  const editionId = textField(formData, "edition_id");
  const developmentId = textField(formData, "development_id");
  const { data: links, error: linksError } = await supabase
    .from("briefing_development_sources")
    .select("source_id,display_publicly")
    .eq("development_id", developmentId);
  if (linksError || !links?.length) redirect(`/briefing-room/${editionId}?error=source-required`);

  const publicIds = links.filter((link) => link.display_publicly).map((link) => link.source_id);
  const { data: sources } = publicIds.length
    ? await supabase.from("content_sources").select("id,is_active,source_url,source_reference").in("id", publicIds)
    : { data: [] };
  const hasTraceablePublicSource = (sources ?? []).some((source) =>
    source.is_active && Boolean(source.source_url?.trim() || source.source_reference?.trim())
  );
  if (!hasTraceablePublicSource) redirect(`/briefing-room/${editionId}?error=public-source-required`);

  const { error } = await supabase.from("briefing_developments")
    .update({ status: "ready" }).eq("id", developmentId);
  if (error) redirect(`/briefing-room/${editionId}?error=development-ready`);
  revalidatePath(`/briefing-room/${editionId}`);
  redirect(`/briefing-room/${editionId}?development-ready=1`);
}

export async function addEditionItemAction(formData: FormData) {
  const { supabase } = await requireBriefingStaff();
  const editionId = textField(formData, "edition_id");
  const revisionId = textField(formData, "revision_id");
  const developmentId = textField(formData, "development_id");
  const section = textField(formData, "display_section");
  const summaryText = textField(formData, "summary_text_ar");
  const order = Number(textField(formData, "display_order"));
  if (!editionId || !revisionId || !developmentId || !Number.isInteger(order) || order < 0
    || (section === "executive_summary" && !summaryText)) {
    redirect(`/briefing-room/${editionId}?error=item-validation`);
  }
  const { error } = await supabase.from("briefing_edition_items").insert({
    revision_id: revisionId,
    development_id: developmentId,
    display_section: section,
    display_order: order,
    summary_text_ar: summaryText || null,
    headline_override_ar: textField(formData, "headline_override_ar") || null,
    what_changed_ar: textField(formData, "what_changed_ar") || null,
    why_it_matters_ar: textField(formData, "why_it_matters_ar") || null,
    context_ar: textField(formData, "context_ar") || null,
  });
  if (error) redirect(`/briefing-room/${editionId}?error=item-save`);
  revalidatePath(`/briefing-room/${editionId}`);
  redirect(`/briefing-room/${editionId}?item-added=1`);
}

export async function submitRevisionAction(formData: FormData) {
  const { supabase } = await requireBriefingStaff();
  const editionId = textField(formData, "edition_id");
  const revisionId = textField(formData, "revision_id");
  const { error } = await supabase.rpc("submit_briefing_revision", { p_revision_id: revisionId });
  if (error) redirect(`/briefing-room/${editionId}?error=submit`);
  revalidatePath("/briefing-room");
  revalidatePath("/briefing-room/review");
  redirect(`/briefing-room/${editionId}?submitted=1`);
}

export async function approveRevisionAction(formData: FormData) {
  const { supabase } = await requireBriefingAdmin();
  const editionId = textField(formData, "edition_id");
  const revisionId = textField(formData, "revision_id");
  const { error } = await supabase.rpc("approve_briefing_revision", { p_revision_id: revisionId });
  if (error) redirect(`/briefing-room/${editionId}?error=approve`);
  revalidatePath("/briefing-room");
  revalidatePath("/briefing-room/review");
  redirect(`/briefing-room/${editionId}?approved=1`);
}

export async function returnRevisionAction(formData: FormData) {
  const { supabase } = await requireBriefingAdmin();
  const editionId = textField(formData, "edition_id");
  const revisionId = textField(formData, "revision_id");
  const note = textField(formData, "note_ar");
  if (!note) redirect(`/briefing-room/${editionId}?error=return-note`);
  const { error } = await supabase.rpc("return_briefing_revision", { p_revision_id: revisionId, p_note_ar: note });
  if (error) redirect(`/briefing-room/${editionId}?error=return`);
  revalidatePath("/briefing-room");
  revalidatePath("/briefing-room/review");
  redirect(`/briefing-room/${editionId}?returned=1`);
}

export async function publishRevisionAction(formData: FormData) {
  const { supabase } = await requireBriefingAdmin();
  const editionId = textField(formData, "edition_id");
  const revisionId = textField(formData, "revision_id");
  const { error } = await supabase.rpc("publish_briefing_revision", { p_revision_id: revisionId });
  if (error) redirect(`/briefing-room/${editionId}?error=publish`);
  revalidatePath("/briefing-room");
  revalidatePath("/briefing-room/review");
  redirect(`/briefing-room/${editionId}?published=1`);
}

export async function createCorrectionAction(formData: FormData) {
  const { supabase } = await requireBriefingStaff();
  const editionId = textField(formData, "edition_id");
  const reason = textField(formData, "change_reason_ar");
  if (!reason) redirect(`/briefing-room/${editionId}?error=correction-reason`);
  const { error } = await supabase.rpc("create_briefing_correction", {
    p_edition_id: editionId,
    p_change_reason_ar: reason,
  });
  if (error) redirect(`/briefing-room/${editionId}?error=correction`);
  revalidatePath("/briefing-room");
  redirect(`/briefing-room/${editionId}?correction-created=1`);
}
