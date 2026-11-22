import Image from "next/image";
import Link from "next/link";
import { formatLabel } from "@/lib/content";
import { formatPublishedDate, type PublicContentItem } from "@/lib/public-content";
import "./visual-knowledge-editorial.css";

function VisualCover({ item, compact = false }: { item: PublicContentItem; compact?: boolean }) {
  return (
    <div className={compact ? "sas-vke-small-cover" : "sas-vke-cover"}>
      {item.cover_url ? (
        <Image
          src={item.cover_url}
          alt={item.cover_alt || item.title}
          fill unoptimized
          sizes={compact ? "(max-width: 600px) 32vw, 160px" : "(max-width: 600px) 40vw, 390px"}
        />
      ) : (
        <div className="sas-vke-cover-fallback" aria-hidden="true">
          <span>منصة ساس</span><strong>{formatLabel(item.format)}</strong>
        </div>
      )}
    </div>
  );
}

/** Only media items published by the editorial CMS; the two retired prototype routes are not listed. */
export function VisualKnowledgeEditorial({ items, standalone = false }: {
  items: PublicContentItem[];
  standalone?: boolean;
}) {
  if (!items.length) return (
    <p className="sas-vke-empty">ستظهر هنا مواد المعرفة البصرية بعد نشرها.</p>
  );
  const [lead, ...remaining] = items;
  const related = remaining.slice(0, standalone ? 6 : 2);
  const url = (item: PublicContentItem) => "/content/" + encodeURIComponent(item.slug);

  return (
    <div className={"sas-vke" + (standalone ? " sas-vke--standalone" : "")}>
      <article className="sas-vke-lead">
        <div className="sas-vke-copy">
          <div className="sas-vke-bylines">
            <span className="sas-vke-type">{formatLabel(lead.format)}</span>
            {lead.published_at ? (
              <time dateTime={lead.published_at}>{formatPublishedDate(lead.published_at)}</time>
            ) : null}
          </div>
          <h3><Link href={url(lead)}>{lead.title}</Link></h3>
          {lead.excerpt ? <p>{lead.excerpt}</p> : null}
          {lead.cover_url ? (
            <a className="sas-vke-primary sas-cta sas-cta--primary" href={lead.cover_url}
              target="_blank" rel="noopener noreferrer"
              aria-label={"عرض الصورة بالحجم الكامل: " + lead.title}>
              عرض الصورة <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <Link className="sas-vke-primary sas-cta sas-cta--primary" href={url(lead)}>
              قراءة المادة <span aria-hidden="true">←</span>
            </Link>
          )}
        </div>
        {lead.cover_url ? (
          <a className="sas-vke-art" href={lead.cover_url} target="_blank" rel="noopener noreferrer"
            aria-label={"عرض الصورة بالحجم الكامل: " + lead.title}>
            <VisualCover item={lead} />
          </a>
        ) : (
          <Link className="sas-vke-art" href={url(lead)} aria-label={"قراءة " + lead.title}>
            <VisualCover item={lead} />
          </Link>
        )}
      </article>

      {related.length ? (
        <div className="sas-vke-related" aria-label="مواد بصرية أخرى">
          {related.map(item => (
            <article className="sas-vke-related-card" key={item.id}>
              <Link href={url(item)} className="sas-vke-related-link">
                <VisualCover item={item} compact />
                <div className="sas-vke-related-copy">
                  <span>{formatLabel(item.format)}</span>
                  <h4>{item.title}</h4>
                  {item.excerpt ? <p>{item.excerpt}</p> : null}
                </div>
              </Link>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
