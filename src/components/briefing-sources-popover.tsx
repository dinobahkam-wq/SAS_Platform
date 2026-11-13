"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { BriefingSource } from "@/lib/public-briefing";

function formatSourceDate(value: string) {
  const date = new Date(value.length === 10 ? value + "T12:00:00+03:00" : value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ar-YE-u-nu-latn", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Aden",
  }).format(date);
}

const sourceRoles: Record<string, string> = {
  primary: "مصدر أصلي",
  supporting: "مصدر مساند",
  context: "مصدر سياقي",
};

/** Non-modal source disclosure. One button per development, never a bulky source card. */
export function BriefingSourcesPopover({
  sources,
  label = "المراجع",
}: {
  sources: BriefingSource[];
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        ref.current?.querySelector<HTMLButtonElement>(".briefing-reference-trigger")?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!sources.length) return null;

  return (
    <div className="briefing-reference-wrap" ref={ref}>
      <button
        type="button"
        className="briefing-reference-trigger"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`${label}: ${sources.length} ${sources.length === 1 ? "مصدر" : "مصادر"}؛ عرض التفاصيل`}
        onClick={() => setOpen((value) => !value)}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M8 6.5H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2M12 4.5h7.5V12M19.5 4.5l-9 9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>{label}</span>
        <span className="briefing-reference-counter">{sources.length}</span>
      </button>

      {open ? (
        <div className="briefing-reference-popover" id={id} role="dialog" aria-modal="false" aria-label="تفاصيل مصادر التطور">
          <div className="briefing-reference-popover-head">
            <strong>المصادر والإحالات</strong>
            <button type="button" aria-label="إغلاق المراجع" className="briefing-reference-close" onClick={() => setOpen(false)}>×</button>
          </div>
          <div className="briefing-reference-popover-body">
            {sources.map((source, index) => (
              <article className="briefing-reference-entry" key={source.source_url || source.source_reference || index}>
                <div className="briefing-reference-entry-top">
                  <span className="briefing-reference-number">{String(index + 1).padStart(2, "0")}</span>
                  <span>{sourceRoles[source.source_role] ?? "مصدر"}</span>
                </div>
                <strong className="briefing-reference-title">{source.source_title || source.source_name}</strong>
                <span className="briefing-reference-publisher">{source.source_name}</span>
                {(source.published_at || source.publication_date) ? (
                  <time dateTime={source.published_at || source.publication_date || undefined}>
                    {formatSourceDate(source.published_at || source.publication_date || "")}
                  </time>
                ) : null}
                {source.source_reference ? <span className="briefing-reference-id">مرجع: {source.source_reference}</span> : null}
                {source.source_excerpt ? <p className="briefing-reference-excerpt">{source.source_excerpt}</p> : null}
                {source.source_url ? (
                  <a className="briefing-reference-open-link" href={source.source_url} target="_blank" rel="noopener noreferrer">
                    فتح المصدر الأصلي <span aria-hidden="true">↗</span>
                  </a>
                ) : <span className="briefing-reference-unlinked">الرابط غير متاح؛ راجع البيانات المرجعية أعلاه.</span>}
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
