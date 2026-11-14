"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  const [scrollState, setScrollState] = useState({ previous: false, next: items.length > 1 });
  const dialogTitle = useId();

  useEffect(() => {
    const track = scrollRef.current;
    if (!track) return;

    const update = () => {
      const max = Math.max(0, track.scrollWidth - track.clientWidth);
      // RTL scrollLeft is negative in current Chromium/Firefox implementations.
      const progress = Math.max(0, Math.min(max, Math.abs(track.scrollLeft)));
      const nextState = { previous: progress > 3, next: progress < max - 3 };
      setScrollState((current) =>
        current.previous === nextState.previous && current.next === nextState.next
          ? current : nextState
      );
    };
    update();
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      track.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items.length]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selected && !dialog.open) dialog.showModal();
    if (!selected && dialog.open) dialog.close();
  }, [selected]);

  if (!items.length) return null;

  function scroll(direction: "previous" | "next") {
    const container = scrollRef.current;
    if (!container) return;
    const card = container.querySelector<HTMLElement>(".editorial-tile");
    const amount = card ? card.getBoundingClientRect().width + 14 : Math.max(230, container.clientWidth * 0.6);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    container.scrollBy({
      left: direction === "next" ? -amount : amount,
      behavior: reduced ? "auto" : "smooth",
    });
  }

  const sources = selected ? (sourcesById[selected.id] ?? []) : [];

  return (
    <section className="editorial-rail" aria-label={title}>
      <div className="editorial-rail-heading">
        <h2>{title}</h2>
        <div className="editorial-rail-actions">
          <span className="editorial-rail-count">{items.length.toLocaleString("en-US")} {items.length === 1 ? "مادة" : "مواد"}</span>
          <div className="editorial-rail-controls" aria-label={"التنقل في " + title}>
            <button type="button" onClick={() => scroll("previous")} disabled={!scrollState.previous} aria-label="العودة إلى المواد السابقة">→</button>
            <button type="button" onClick={() => scroll("next")} disabled={!scrollState.next} aria-label="عرض المواد التالية">←</button>
          </div>
        </div>
      </div>
      <div className="editorial-rail-track" ref={scrollRef} tabIndex={0} role="region" aria-label={"قائمة قابلة للتمرير: " + title}>
        {items.map((item) => (
          <article className="editorial-tile" key={item.id}>
            <button className="editorial-tile-button" type="button" onClick={() => setSelected(item)}
              aria-haspopup="dialog" aria-label={"قراءة: " + item.title}>
              <div className="editorial-tile-image">
                {item.cover_url ? <Image src={item.cover_url} alt={item.cover_alt || item.title}
                  fill unoptimized sizes="(max-width: 640px) 78vw, 280px" /> : <span>ساس</span>}
                <span className="editorial-tile-image-label">{formatLabel(item.format)}</span>
              </div>
              <div className="editorial-tile-copy">
                <div className="editorial-tile-meta">
                  <time dateTime={item.published_at ?? undefined}>{displayDate(item.published_at)}</time>
                  <span className="editorial-tile-category">{sectionLabel(item.section)}</span>
                </div>
                <h3>{item.title}</h3>
                {item.excerpt ? <p>{item.excerpt}</p> : null}
                <span className="editorial-tile-source">
                  <span>{sourcesById[item.id]?.[0]?.source_name?.includes("أرشيف") ? "أرشيف ساس" : (sourcesById[item.id]?.[0]?.source_name ?? "منصة ساس")}</span>
                  <span className="editorial-tile-read">قراءة المادة <span aria-hidden="true">←</span></span>
                </span>
              </div>
            </button>
          </article>
        ))}
      </div>
      {mounted ? createPortal(<dialog className="editorial-detail editorial-detail--floating" ref={dialogRef} aria-labelledby={dialogTitle}
        onClose={() => setSelected(null)}
        onClick={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
        {selected ? (
          <div className="editorial-detail-inner">
            <div className="editorial-detail-topbar">
              <span>{sectionLabel(selected.section)} / {formatLabel(selected.format)}</span>
              <button type="button" className="editorial-detail-close" onClick={() => setSelected(null)}
                aria-label="إغلاق التفاصيل">×</button>
            </div>
            <div className="editorial-detail-heading">
              <div className="editorial-detail-heading-meta">
                <span>{formatLabel(selected.format)}</span>
                <time dateTime={selected.published_at ?? undefined}>{displayDate(selected.published_at, true)}</time>
              </div>
              <h2 id={dialogTitle}>{selected.title}</h2>
              {selected.excerpt ? <p className="editorial-detail-excerpt">{selected.excerpt}</p> : null}
            </div>
            {selected.cover_url ? (
              <figure className="editorial-detail-figure">
                <div className="editorial-detail-image">
                  <Image src={selected.cover_url} alt={selected.cover_alt || selected.title}
                    fill unoptimized sizes="(max-width: 800px) 100vw, 800px" />
                </div>
                {selected.cover_caption ? <figcaption className="editorial-detail-caption">{selected.cover_caption}</figcaption> : null}
              </figure>
            ) : null}
            <div className="editorial-detail-content">
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
      </dialog>, document.body) : null}
    </section>
  );
}
