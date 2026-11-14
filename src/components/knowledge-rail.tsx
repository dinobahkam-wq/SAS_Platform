import Image from "next/image";
import Link from "next/link";
import type { PublicContentItem } from "@/lib/public-content";
import { formatPublishedDate } from "@/lib/public-content";
import { formatLabel } from "@/lib/content";

export function KnowledgeRail({ title, items }: { title: string; items: PublicContentItem[] }) {
  if (!items.length) return null;
  return (
    <section className="knowledge-rail" aria-label={title}>
      <div className="knowledge-rail-head">
        <h2>{title}</h2>
        <span>{items.length.toLocaleString("en-US")} {items.length === 1 ? "مادة" : "مواد"}</span>
      </div>
      <div className="knowledge-rail-grid">
        {items.map((item) => (
          <article className={"knowledge-card knowledge-card--" + item.section} key={item.id}>
            <Link className="knowledge-card-link" href={"/content/" + item.slug} aria-label={"قراءة " + item.title}>
              <div className="knowledge-card-cover">
                {item.cover_url ? (
                  <Image src={item.cover_url} alt={item.cover_alt || item.title} fill unoptimized sizes="(max-width: 700px) 80vw, 340px" />
                ) : (
                  <div className="knowledge-card-placeholder" aria-hidden="true">
                    <span>منصة ساس</span><strong>{formatLabel(item.format)}</strong><i />
                  </div>
                )}
                <span className="knowledge-card-type">{formatLabel(item.format)}</span>
              </div>
              <div className="knowledge-card-copy">
                <span className="knowledge-card-date">{formatPublishedDate(item.published_at)}</span>
                <h3>{item.title}</h3>
                {item.excerpt ? <p>{item.excerpt}</p> : null}
                <span className="knowledge-card-open">اقرأ المادة الكاملة <span aria-hidden="true">←</span></span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
