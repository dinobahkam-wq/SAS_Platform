import Image from "next/image";
import Link from "next/link";
import type { PublicContentItem } from "@/lib/public-content";
import { formatPublishedDate } from "@/lib/public-content";
import { formatLabel, sectionLabel } from "@/lib/content";

type LeadSource = { source_name: string; source_url: string | null; source_type: string };
type SourceMap = Record<string, LeadSource[]>;

function LeadImage({ item, priority = false }: { item: PublicContentItem; priority?: boolean }) {
  if (!item.cover_url) {
    return <div className="home-lead-image-placeholder" aria-hidden="true"><span>ساس</span></div>;
  }

  return (
    <div className="home-lead-image">
      <Image
        src={item.cover_url}
        alt={item.cover_alt || item.title}
        fill
        unoptimized
        priority={priority}
        sizes="(max-width: 760px) 100vw, (max-width: 1200px) 62vw, 760px"
      />
      <span className="home-lead-image-type">{formatLabel(item.format)}</span>
    </div>
  );
}

function LeadMeta({ item }: { item: PublicContentItem }) {
  return (
    <div className="home-lead-meta">
      <span>{sectionLabel(item.section)}</span>
      <span>{formatLabel(item.format)}</span>
      {item.published_at ? (
        <time dateTime={item.published_at}>{formatPublishedDate(item.published_at)}</time>
      ) : null}
    </div>
  );
}

export function HomepageLead({
  featured,
  supporting,
  sourcesById,
}: {
  featured: PublicContentItem;
  supporting: PublicContentItem[];
  sourcesById: SourceMap;
}) {
  const featuredSource = sourcesById[featured.id]?.[0]?.source_name;

  return (
    <section className="home-lead-section site-container" aria-labelledby="home-lead-title">
      <div className="home-lead-heading">
        <div>
          <span className="eyebrow">أبرز المواد المنشورة</span>
          <h2 id="home-lead-title">في واجهة المشهد</h2>
        </div>
        <Link href="/news">متابعة الأخبار <span aria-hidden="true">←</span></Link>
      </div>

      <div className="home-lead-grid">
        <article className="home-lead-main">
          <Link href={"/content/" + featured.slug} className="home-lead-main-link">
            <LeadImage item={featured} priority />
            <div className="home-lead-main-copy">
              <LeadMeta item={featured} />
              <h3>{featured.title}</h3>
              {featured.excerpt ? <p>{featured.excerpt}</p> : null}
              <div className="home-lead-footer">
                <span>{featuredSource || "منصة ساس"}</span>
                <strong>قراءة المادة <span aria-hidden="true">←</span></strong>
              </div>
            </div>
          </Link>
        </article>

        {supporting.length ? (
          <aside className="home-lead-support" aria-label="مواد إخبارية أخرى">
            {supporting.map((item) => {
              const source = sourcesById[item.id]?.[0]?.source_name;
              return (
                <article className="home-support-item" key={item.id}>
                  <Link href={"/content/" + item.slug} className="home-support-link">
                    <LeadImage item={item} />
                    <div className="home-support-copy">
                      <LeadMeta item={item} />
                      <h3>{item.title}</h3>
                      {item.excerpt ? <p>{item.excerpt}</p> : null}
                      <span className="home-support-source">{source || "منصة ساس"}</span>
                    </div>
                  </Link>
                </article>
              );
            })}
          </aside>
        ) : null}
      </div>
    </section>
  );
}
