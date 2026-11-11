"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PublicContentItem } from "@/lib/public-content";
import { formatLabel, sectionLabel } from "@/lib/content";

export type RailSource = {
  source_name: string;
  source_url: string | null;
  source_type: string;
};

export type RailSources = Record<string, RailSource[]>;

function displayDate(value: string | null, withTime = false) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  if (withTime) {
    return date.toLocaleString("ar-YE-u-nu-latn", {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Aden",
    });
  }
  return date.toLocaleDateString("ar-YE-u-nu-latn", {
    day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Aden",
  });
}

type DisplayBlock = { type: string; text?: string; items?: string[] };

function getBlocks(body: PublicContentItem["body"]): DisplayBlock[] {
  if (!body || typeof body !== "object" || Array.isArray(body) || !Array.isArray(body.blocks)) return [];
  return body.blocks.flatMap((raw): DisplayBlock[] => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
    const type = typeof raw.type === "string" ? raw.type : "paragraph";
    const text = typeof raw.text === "string" ? raw.text : undefined;
    const items = Array.isArray(raw.items) ? raw.items.filter((item): item is string => typeof item === "string") : undefined;
    return text || items?.length ? [{ type, text, items }] : [];
  });
}

export function EditorialRail({
  title,
  items,
  sourcesById = {},
}: {
  title: string;
  items: PublicContentItem[];
  sourcesById?: RailSources;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<PublicContentItem | null>(null);
  const dialogTitle = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selected && !dialog.open) dialog.showModal();
    if (!selected && dialog.open) dialog.close();
  }, [selected]);

  if (!items.length) return null;

  function scroll(direction: number) {
    const container = scrollRef.current;
    if (!container) return;
    const amount = Math.max(260, Math.round(container.clientWidth * 0.74));
    container.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  const sources = selected ? (sourcesById[selected.id] ?? []) : [];

  return (
    <section className="editorial-rail" aria-label={title}>
      <div className="editorial-rail-heading">
        <h2>{title}</h2>
        <div className="editorial-rail-controls" aria-label={"التنقل في " + title}>
          <button type="button" onClick={() => scroll(1)} aria-label="تمرير إلى اليمين">→</button>
          <button type="button" onClick={() => scroll(-1)} aria-label="تمرير إلى اليسار">←</button>
        </div>
      </div>
      <div className="editorial-rail-track" ref={scrollRef} tabIndex={0} aria-label={"مواد " + title}>
        {items.map((item) => (
          <article className="editorial-tile" key={item.id}>
            <button className="editorial-tile-button" type="button" onClick={() => setSelected(item)}
              aria-haspopup="dialog" aria-label={"قراءة: " + item.title}>
              <div className="editorial-tile-image">
                {item.cover_url ? <Image src={item.cover_url} alt={item.cover_alt || item.title}
                  fill unoptimized sizes="(max-width: 640px) 83vw, 320px" /> : <span>ساس</span>}
              </div>
              <div className="editorial-tile-copy">
                <div className="editorial-tile-meta">
                  <span>{formatLabel(item.format)}</span>
                  <time dateTime={item.published_at ?? undefined}>{displayDate(item.published_at)}</time>
                </div>
                <h3>{item.title}</h3>
                {item.excerpt ? <p>{item.excerpt}</p> : null}
                <span className="editorial-tile-source">{sourcesById[item.id]?.[0]?.source_name ?? "منصة ساس"}</span>
              </div>
            </button>
          </article>
        ))}
      </div>
      <dialog className="editorial-detail" ref={dialogRef} aria-labelledby={dialogTitle}
        onClose={() => setSelected(null)}
        onClick={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
        {selected ? (
          <div className="editorial-detail-inner">
            <div className="editorial-detail-topbar">
              <span>{sectionLabel(selected.section)} / {formatLabel(selected.format)}</span>
              <button type="button" className="editorial-detail-close" onClick={() => setSelected(null)}
                aria-label="إغلاق التفاصيل">×</button>
            </div>
            {selected.cover_url ? (
              <div className="editorial-detail-image">
                <Image src={selected.cover_url} alt={selected.cover_alt || selected.title}
                  fill unoptimized sizes="(max-width: 800px) 100vw, 800px" />
              </div>
            ) : null}
            <div className="editorial-detail-content">
              <h2 id={dialogTitle}>{selected.title}</h2>
              <p className="editorial-detail-date">
                <time dateTime={selected.published_at ?? undefined}>{displayDate(selected.published_at, true)}</time>
              </p>
              {selected.excerpt ? <p className="editorial-detail-excerpt">{selected.excerpt}</p> : null}
              {selected.cover_caption ? <p className="editorial-detail-caption">{selected.cover_caption}</p> : null}
              <div className="editorial-detail-body">
                {getBlocks(selected.body).map((block, index) => {
                  if (block.type === "heading") return <h3 key={index}>{block.text}</h3>;
                  if (block.type === "subheading") return <h4 key={index}>{block.text}</h4>;
                  if (block.type === "quote") return <blockquote key={index}>{block.text}</blockquote>;
                  if (block.type === "list") return <ul key={index}>{block.items?.map((entry, n) => <li key={n}>{entry}</li>)}</ul>;
                  return <p key={index}>{block.text}</p>;
                })}
              </div>
              {sources.length ? (
                <section className="editorial-detail-sources" aria-label="مصادر الخبر">
                  <h3>المصادر والإسناد</h3>
                  {sources.map((source, index) => (
                    <p key={index}>
                      {source.source_url ? <a href={source.source_url} target="_blank" rel="noopener noreferrer">{source.source_name}</a> : source.source_name}
                    </p>
                  ))}
                </section>
              ) : null}
              <Link className="editorial-detail-permalink" href={"/content/" + selected.slug}>
                فتح صفحة المادة الكاملة
              </Link>
            </div>
          </div>
        ) : null}
      </dialog>
    </section>
  );
}
