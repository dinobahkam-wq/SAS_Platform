import "server-only";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type { Json, Tables } from "@/types/database.types";

type ContentRow = Pick<
  Tables<"content_items">,
  | "id"
  | "title"
  | "slug"
  | "section"
  | "format"
  | "excerpt"
  | "body"
  | "published_at"
  | "is_featured"
  | "cover_asset_id"
  | "category_id"
  | "seo_title"
  | "seo_description"
>;

type AssetRow = Pick<
  Tables<"media_assets">,
  "id" | "bucket_id" | "object_path" | "alt_text" | "caption"
>;

export type PublicContentItem = ContentRow & {
  cover_url: string | null;
  cover_alt: string | null;
  cover_caption: string | null;
};

export type PublicSource = Pick<
  Tables<"content_sources">,
  "id" | "source_name" | "organization_name" | "source_url" | "source_type"
> & {
  source_role: string;
  attribution_text: string | null;
};

export type PublicAuthor = Pick<
  Tables<"authors">,
  "id" | "display_name" | "slug" | "bio"
> & {
  contribution_label: string | null;
};

export type BodyBlock = {
  type: string;
  text?: string;
  items?: string[];
};

type ContentOptions = {
  section?: "news" | "analysis" | "research" | "media";
  limit?: number;
  featured?: boolean;
};

function reportPublicDataError(scope: string, error: unknown) {
  console.error("[SAS public content] " + scope, error);
}

async function attachCovers(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rows: ContentRow[],
): Promise<PublicContentItem[]> {
  const assetIds = [...new Set(rows.map((row) => row.cover_asset_id).filter((id): id is string => Boolean(id)))];
  let assets: AssetRow[] = [];

  if (assetIds.length) {
    const { data, error } = await supabase
      .from("media_assets")
      .select("id,bucket_id,object_path,alt_text,caption")
      .in("id", assetIds);
    if (error) reportPublicDataError("cover assets", error);
    assets = data ?? [];
  }

  const assetMap = new Map(assets.map((asset) => [asset.id, asset]));

  return rows.map((row) => {
    const asset = row.cover_asset_id ? assetMap.get(row.cover_asset_id) : undefined;
    const coverUrl = asset
      ? supabase.storage.from(asset.bucket_id).getPublicUrl(asset.object_path).data.publicUrl
      : null;

    return {
      ...row,
      cover_url: coverUrl,
      cover_alt: asset?.alt_text ?? null,
      cover_caption: asset?.caption ?? null,
    };
  });
}

export async function getPublishedContent(options: ContentOptions = {}): Promise<PublicContentItem[]> {
  try {
    const supabase = await createClient();
    const limit = Math.min(Math.max(options.limit ?? 12, 1), 48);

    let query = supabase
      .from("content_items")
      .select(
        "id,title,slug,section,format,excerpt,body,published_at,is_featured,cover_asset_id,category_id,seo_title,seo_description",
      )
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);

    if (options.section) query = query.eq("section", options.section);
    if (options.featured !== undefined) query = query.eq("is_featured", options.featured);

    const { data, error } = await query;
    if (error) throw error;
    if (!data) return [];

    return attachCovers(supabase, data);
  } catch (error) {
    reportPublicDataError("content feed initialization", error);
    throw new Error("تعذر تحميل المواد المنشورة حاليًا.", { cause: error });
  }
}

export const getPublishedContentBySlug = cache(async (slug: string): Promise<PublicContentItem | null> => {
  try {
    // Accept percent-encoded Arabic URLs and normalize canonical Unicode form.
    let normalizedSlug = slug.normalize("NFC");
    if (normalizedSlug.includes("%")) {
      try { normalizedSlug = decodeURIComponent(normalizedSlug).normalize("NFC"); }
      catch { /* Preserve literal percent signs in valid slugs. */ }
    }
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("content_items")
      .select(
        "id,title,slug,section,format,excerpt,body,published_at,is_featured,cover_asset_id,category_id,seo_title,seo_description",
      )
      .eq("slug", normalizedSlug)
      .eq("status", "published")
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      console.info("[SAS content route] no published item for slug:", normalizedSlug);
      return null;
    }
    const [item] = await attachCovers(supabase, [data]);
    return item ?? null;
  } catch (error) {
    reportPublicDataError("content detail initialization", error);
    throw new Error("تعذر تحميل المادة المنشورة حاليًا.", { cause: error });
  }
});

export async function getPublishedSources(contentId: string): Promise<PublicSource[]> {
  try {
    const supabase = await createClient();
    const { data: links, error: linksError } = await supabase
      .from("content_source_links")
      .select("source_id,source_role,attribution_text,display_order")
      .eq("content_id", contentId)
      .order("display_order", { ascending: true });

    if (linksError) {
      reportPublicDataError("content source links", linksError);
      return [];
    }
    if (!links?.length) return [];

    const sourceIds = links.map((link) => link.source_id);
    const { data: sources, error } = await supabase
      .from("content_sources")
      .select("id,source_name,organization_name,source_url,source_type")
      .in("id", sourceIds);

    if (error) {
      reportPublicDataError("content sources", error);
      return [];
    }
    if (!sources) return [];

    const sourceMap = new Map(sources.map((source) => [source.id, source]));
    return links.flatMap((link) => {
      const source = sourceMap.get(link.source_id);
      return source
        ? [{ ...source, source_role: link.source_role, attribution_text: link.attribution_text }]
        : [];
    });
  } catch (error) {
    reportPublicDataError("source attribution", error);
    return [];
  }
}

export async function getPublishedAuthors(contentId: string): Promise<PublicAuthor[]> {
  try {
    const supabase = await createClient();
    const { data: links, error: linksError } = await supabase
      .from("content_authors")
      .select("author_id,contribution_label,author_order")
      .eq("content_id", contentId)
      .order("author_order", { ascending: true });

    if (linksError) {
      reportPublicDataError("content author links", linksError);
      return [];
    }
    if (!links?.length) return [];

    const authorIds = links.map((link) => link.author_id);
    const { data: authors, error } = await supabase
      .from("authors")
      .select("id,display_name,slug,bio")
      .in("id", authorIds)
      .eq("is_active", true);

    if (error) {
      reportPublicDataError("content authors", error);
      return [];
    }
    if (!authors) return [];

    const authorMap = new Map(authors.map((author) => [author.id, author]));
    return links.flatMap((link) => {
      const author = authorMap.get(link.author_id);
      return author ? [{ ...author, contribution_label: link.contribution_label }] : [];
    });
  } catch (error) {
    reportPublicDataError("author attribution", error);
    return [];
  }
}

export async function getPublicCategory(categoryId: string | null) {
  if (!categoryId) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("name,slug")
      .eq("id", categoryId)
      .eq("is_active", true)
      .maybeSingle();

    if (error) reportPublicDataError("content category query", error);
    return data;
  } catch (error) {
    reportPublicDataError("content category", error);
    return null;
  }
}

export function bodyToBlocks(value: Json | null): BodyBlock[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const rawBlocks = value.blocks;
  if (!Array.isArray(rawBlocks)) return [];

  return rawBlocks.flatMap((block): BodyBlock[] => {
    if (!block || typeof block !== "object" || Array.isArray(block)) return [];

    const type = typeof block.type === "string" ? block.type : "paragraph";
    const text = typeof block.text === "string" ? block.text : undefined;
    const items = Array.isArray(block.items)
      ? block.items.filter((item): item is string => typeof item === "string")
      : undefined;

    if (!text && !items?.length) return [];
    return [{ type, text, items }];
  });
}

export function formatPublishedDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("ar-YE-u-nu-latn", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Aden",
  });
}

/** Batch-load source labels and links for public editorial rails. */
export async function getPublishedRailSources(contentIds: string[]) {
  const output: Record<string, Array<{ source_name: string; source_url: string | null; source_type: string }>> = {};
  if (!contentIds.length) return output;

  const supabase = await createClient();
  const { data: links, error: linksError } = await supabase
    .from("content_source_links")
    .select("content_id,source_id,display_order")
    .in("content_id", contentIds)
    .order("display_order", { ascending: true });

  if (linksError) {
    reportPublicDataError("rail source links", linksError);
    return output;
  }
  if (!links?.length) return output;

  const sourceIds = [...new Set(links.map((link) => link.source_id))];
  const { data: sources, error: sourcesError } = await supabase
    .from("content_sources")
    .select("id,source_name,source_url,source_type")
    .in("id", sourceIds);

  if (sourcesError) {
    reportPublicDataError("rail source details", sourcesError);
    return output;
  }
  const byId = new Map((sources ?? []).map((source) => [source.id, source]));
  for (const link of links) {
    const source = byId.get(link.source_id);
    if (!source) continue;
    (output[link.content_id] ??= []).push({
      source_name: source.source_name,
      source_url: source.source_url,
      source_type: source.source_type,
    });
  }
  return output;
}
