/**
 * WordPress WXR import preview. Runs only in the administrator's browser:
 * the legacy site may not offer a usable REST endpoint.
 * All imported text is review-only; no original HTML is rendered as HTML.
 */
export type LegacyEditorialType = "opinion" | "analysis" | "podcast" | "skip";
export type LegacyBodyBlock = { type: "paragraph" | "heading" | "subheading" | "quote" | "list"; text?: string; items?: string[] };
export type LegacyImportPost = {
  legacyId: number;
  originalUrl: string;
  originalDate: string;
  title: string;
  slug: string;
  excerpt: string;
  uploader: string;
  taxonomy: string[];
  editorialType: Exclude<LegacyEditorialType, "skip">;
  blocks: LegacyBodyBlock[];
  mediaLinks: string[];
};

export type LegacyPreview = LegacyImportPost & { suggestedType: LegacyEditorialType; selected: boolean };

const XMLNS_WP = "http://wordpress.org/export/1.2/";
const XMLNS_DC = "http://purl.org/dc/elements/1.1/";
const XMLNS_CONTENT = "http://purl.org/rss/1.0/modules/content/";

function directText(parent: Element, localName: string, namespace?: string): string {
  const matching = Array.from(parent.children).find((child) =>
    child.localName === localName && (!namespace || child.namespaceURI === namespace));
  return matching?.textContent?.trim() ?? "";
}

function isLegacyUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    return url.protocol === "https:" || url.protocol === "http:" ?
      /^(?:www\.)?sas-media\.net$/i.test(url.hostname) : false;
  } catch {
    return false;
  }
}

function plain(value: string): string {
  return value.replace(/\u00a0/g, " ").replace(/[\t\r ]+/g, " ").replace(/\n\s*\n/g, "\n").trim();
}

export function parseLegacyBody(html: string): { blocks: LegacyBodyBlock[]; mediaLinks: string[] } {
  const document = new DOMParser().parseFromString(html, "text/html");
  document.querySelectorAll("script,style,form,iframe,object,embed,noscript").forEach((element) => element.remove());
  const blocks: LegacyBodyBlock[] = [];
  const visited = new Set<Element>();

  const nodes = document.body.querySelectorAll("h1,h2,h3,h4,p,blockquote,ul,ol");
  for (const node of nodes) {
    if (node.closest("li") || node.closest("blockquote") && node.tagName !== "BLOCKQUOTE") continue;
    if (node.closest("ul,ol") && !["UL","OL"].includes(node.tagName)) continue;
    if (visited.has(node)) continue;
    visited.add(node);
    const type = node.tagName;
    if (type === "UL" || type === "OL") {
      const items = Array.from(node.children)
        .filter((child) => child.tagName === "LI")
        .map((child) => plain(child.textContent ?? "")).filter(Boolean);
      if (items.length) blocks.push({ type: "list", items });
    } else {
      const text = plain(node.textContent ?? "");
      if (!text) continue;
      const kind: LegacyBodyBlock["type"] = type === "BLOCKQUOTE" ? "quote"
        : type === "H1" || type === "H2" ? "heading"
        : type === "H3" || type === "H4" ? "subheading" : "paragraph";
      blocks.push({ type: kind, text });
    }
  }

  // Some legacy editors used only <div>s or plain text. Preserve such posts as paragraphs.
  if (!blocks.length && plain(document.body.textContent ?? "")) {
    blocks.push({ type: "paragraph", text: plain(document.body.textContent ?? "") });
  }
  const mediaLinks = Array.from(document.querySelectorAll("img[src],audio[src],video[src],source[src],a[href]"))
    .map((element) => element.getAttribute(element.tagName === "A" ? "href" : "src") ?? "")
    .filter((url) => /^https?:\/\//.test(url))
    .filter((url) => /\.(?:png|jpe?g|webp|gif|pdf|mp3|mp4|wav)(?:\?|$)/i.test(url))
    .slice(0, 60);

  return { blocks, mediaLinks: [...new Set(mediaLinks)] };
}

export function suggestLegacyType(title: string, categories: string[]): LegacyEditorialType {
  const combined = [title, ...categories].join(" ").toLowerCase();
  if (/بودكاست|podcast|حلقة صوتية|الحلقة/.test(combined)) return "podcast";
  if (/تحليل|تحليلات|قراءة سياسية|political.analysis|دراسة تحليلية/.test(combined)) return "analysis";
  if (/مقال|مقالات|رأي|آراء|كتاب|كتّاب|اتجاهات|وجهة نظر|opinion/.test(combined)) return "opinion";
  return "skip";
}

export function parseWordPressExport(xml: string): LegacyPreview[] {
  if (xml.length > 22 * 1024 * 1024) throw new Error("ملف التصدير أكبر من 20MB. قسمه إلى ملفات أصغر.");
  const document = new DOMParser().parseFromString(xml, "application/xml");
  if (document.querySelector("parsererror") || !document.documentElement || document.documentElement.nodeName !== "rss") {
    throw new Error("هذا ليس ملف WordPress XML صالحًا.");
  }
  const items = Array.from(document.getElementsByTagName("item"));
  if (!items.length) throw new Error("ملف WordPress لا يحتوي على مقالات.");
  const entries: LegacyPreview[] = [];
  for (const item of items) {
    const postType = directText(item, "post_type", XMLNS_WP);
    const status = directText(item, "status", XMLNS_WP);
    if (postType !== "post" || status !== "publish") continue;
    const legacyId = Number(directText(item, "post_id", XMLNS_WP));
    const originalUrl = directText(item, "link");
    const title = directText(item, "title");
    const html = directText(item, "encoded", XMLNS_CONTENT);
    if (!Number.isSafeInteger(legacyId) || legacyId < 1 || !isLegacyUrl(originalUrl) || !title || !html.trim()) continue;
    const originalDate = directText(item, "post_date", XMLNS_WP);
    const uploader = directText(item, "creator", XMLNS_DC);
    const taxonomy = Array.from(item.children).filter((child) => child.localName === "category")
      .map((child) => child.textContent?.trim() ?? "").filter(Boolean);
    const suggestedType = suggestLegacyType(title, taxonomy);
    const { blocks, mediaLinks } = parseLegacyBody(html);
    const excerpt = blocks.find((block) => block.type === "paragraph")?.text?.slice(0, 300) ?? "";
    entries.push({
      legacyId, originalUrl, originalDate, title: title.slice(0, 240),
      slug: "sas-legacy-wp-" + legacyId,
      excerpt, uploader, taxonomy, editorialType: suggestedType === "skip" ? "opinion" : suggestedType,
      suggestedType, selected: suggestedType !== "skip", blocks, mediaLinks,
    });
  }
  const priority: Record<LegacyEditorialType, number> = { analysis: 0, opinion: 1, podcast: 2, skip: 3 };
  return entries.sort((a,b) => priority[a.suggestedType] - priority[b.suggestedType] || a.originalDate.localeCompare(b.originalDate));
}
