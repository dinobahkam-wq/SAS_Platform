"use client";

import { useState } from "react";
import Image from "next/image";
import type { PublicContentItem } from "@/lib/public-content";
import { formatLabel, sectionLabel } from "@/lib/content";

type Props = {
  item: PublicContentItem;
  sourceName: string;
  dateLabel: string;
  onRead: () => void;
};

/**
 * An opt-in trial card. News reading remains separate from flipping the card:
 * "read" opens the existing modal, while the flip button reveals a summary.
 */
export function NewsFlipTrial({ item, sourceName, dateLabel, onRead }: Props) {
  const [flipped, setFlipped] = useState(false);
  const summary = item.excerpt?.trim() || "اطّلع على تفاصيل المادة والمصادر عبر زر قراءة الخبر.";

  return (
    <article className="editorial-tile editorial-tile--flip" aria-label={"بطاقة خبر تجريبية: " + item.title}>
      <div className="sas-flip-stage">
        <div className={"sas-flip-inner" + (flipped ? " is-flipped" : "")}>
          <div className="sas-flip-face sas-flip-front" inert={flipped}>
            <div className="editorial-tile-image">
              {item.cover_url
                ? <Image src={item.cover_url} alt={item.cover_alt || item.title}
                    fill unoptimized sizes="(max-width: 640px) 78vw, 280px" />
                : <span>ساس</span>}
              <span className="editorial-tile-image-label">{formatLabel(item.format)}</span>
            </div>
            <div className="editorial-tile-copy">
              <div className="editorial-tile-meta">
                <time dateTime={item.published_at ?? undefined}>{dateLabel}</time>
                <span className="editorial-tile-category">{sectionLabel(item.section)}</span>
              </div>
              <h3>{item.title}</h3>
              <span className="editorial-tile-source">
                <span>{sourceName}</span>
                <span className="sas-flip-experiment-tag">تجربة</span>
              </span>
              <div className="sas-flip-actions">
                <button type="button" className="sas-flip-read" onClick={onRead}
                  aria-haspopup="dialog" aria-label={"قراءة الخبر: " + item.title}>
                  قراءة الخبر <span aria-hidden="true">←</span>
                </button>
                <button type="button" className="sas-flip-toggle" onClick={() => setFlipped(true)}
                  aria-label={"قلب البطاقة لعرض ملخص: " + item.title}>
                  <span aria-hidden="true">↻</span> الملخص
                </button>
              </div>
            </div>
          </div>
          <div className="sas-flip-face sas-flip-back" inert={!flipped}>
            <span className="sas-flip-back-kicker">ملخص الخبر</span>
            <h3>{item.title}</h3>
            <p>{summary}</p>
            <div className="sas-flip-back-source">
              <span>المصدر</span><strong>{sourceName}</strong>
            </div>
            <div className="sas-flip-actions sas-flip-actions--back">
              <button type="button" className="sas-flip-read" onClick={onRead}
                aria-haspopup="dialog" aria-label={"قراءة الخبر كاملًا: " + item.title}>
                قراءة الخبر <span aria-hidden="true">←</span>
              </button>
              <button type="button" className="sas-flip-toggle" onClick={() => setFlipped(false)}
                aria-label="العودة إلى واجهة البطاقة">
                <span aria-hidden="true">↶</span> العودة
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
