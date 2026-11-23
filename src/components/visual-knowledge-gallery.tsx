"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatLabel } from "@/lib/content";
import type { PublicContentItem } from "@/lib/public-content";
import "./visual-knowledge-gallery.css";

const options = [
  { value: "all", label: "الكل" },
  { value: "infographic", label: "إنفوغراف" },
  { value: "photo_gallery", label: "معارض الصور" },
] as const;

function dateText(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" :
    date.toLocaleDateString("ar-YE-u-nu-latn", {
      day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Aden",
    });
}

/** A filterable gallery of published artifacts — no manufactured examples. */
export function VisualKnowledgeGallery({ items }: { items: PublicContentItem[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const available = options.filter(option => option.value === "all" || items.some(item => item.format === option.value));
  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ar");
    return items.filter(item => (filter === "all" || item.format === filter)
      && (!normalized || [item.title, item.excerpt || "", formatLabel(item.format)]
        .some(value => value.toLocaleLowerCase("ar").includes(normalized))))
      .sort((a,b) => sort === "newest"
        ? (b.published_at || "").localeCompare(a.published_at || "")
        : (a.published_at || "").localeCompare(b.published_at || ""));
  }, [items, query, filter, sort]);

  return (
    <section className="sas-vkg" aria-label="معرض المعرفة البصرية">
      <div className="sas-vkg-tools">
        <label className="sas-vkg-search">
          <span className="sas-vkg-search-symbol" aria-hidden="true">⌕</span>
          <span className="sas-vkg-sr-only">البحث في المعرض</span>
          <input type="search" value={query} onChange={event => setQuery(event.target.value)}
            placeholder="ابحث في المعرض..." aria-label="البحث في المعرض" />
        </label>
        <div className="sas-vkg-filters" role="group" aria-label="تصفية حسب نوع المادة">
          {available.map(option => (
            <button key={option.value} type="button"
              className={filter === option.value ? "is-active" : ""}
              aria-pressed={filter === option.value} onClick={() => setFilter(option.value)}>
              {option.label}
            </button>
          ))}
        </div>
        <label className="sas-vkg-sort">
          <span>الترتيب</span>
          <select value={sort} onChange={event => setSort(event.target.value as "newest" | "oldest")}>
            <option value="newest">الأحدث أولاً</option>
            <option value="oldest">الأقدم أولاً</option>
          </select>
        </label>
      </div>

      <div className="sas-vkg-meta" role="status" aria-live="polite">
        {results.length.toLocaleString("en-US")} {results.length === 1 ? "مادة" : "مواد"}
      </div>
      {results.length ? (
        <div className="sas-vkg-grid">
          {results.map(item => {
            const article = "/content/" + encodeURIComponent(item.slug);
            const target = item.cover_url || article;
            const external = Boolean(item.cover_url);
            return (
              <article className="sas-vkg-card" key={item.id}>
                <a href={target} className="sas-vkg-artwork"
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  aria-label={(external ? "عرض الصورة بالحجم الكامل: " : "قراءة المادة: ") + item.title}>
                  {item.cover_url ? (
                    <Image src={item.cover_url} alt={item.cover_alt || item.title}
                      fill unoptimized sizes="(max-width: 600px) 90vw, (max-width: 1000px) 45vw, 30vw" />
                  ) : (
                    <div className="sas-vkg-empty-image" aria-hidden="true">
                      <span>ساس</span>
                      <span>{formatLabel(item.format)}</span>
                    </div>
                  )}
                  <span className="sas-vkg-artwork-open" aria-hidden="true">↗</span>
                </a>
                <div className="sas-vkg-card-body">
                  <div className="sas-vkg-card-meta">
                    <span className="sas-vkg-tag">{formatLabel(item.format)}</span>
                    {item.published_at ? <time dateTime={item.published_at}>{dateText(item.published_at)}</time> : null}
                  </div>
                  <h2><Link href={article}>{item.title}</Link></h2>
                  {item.excerpt ? <p>{item.excerpt}</p> : null}
                  <a className="sas-vkg-view-image" href={target}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}>
                    {external ? "عرض الصورة" : "قراءة المادة"} <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="sas-vkg-no-results">
          <strong>{items.length ? "لا توجد نتائج مطابقة." : "لم تُنشر مواد بصرية بعد."}</strong>
          {items.length ? <button type="button" onClick={() => {setQuery("");setFilter("all");setSort("newest");}}>إعادة عرض الكل</button> : null}
        </div>
      )}
    </section>
  );
}
