import Image from "next/image";
import Link from "next/link";
import { formatLabel } from "@/lib/content";
import { formatPublishedDate, type PublicContentItem } from "@/lib/public-content";
import "./home-insights-showcase.css";

const destination = (item: PublicContentItem) => "/content/" + encodeURIComponent(item.slug);

function Cover({ item, featured = false }: { item: PublicContentItem; featured?: boolean }) {
  return (
    <div className={featured ? "sas-insight-feature-cover" : "sas-insight-small-cover"}>
      {item.cover_url ? (
        <Image
          src={item.cover_url}
          alt={item.cover_alt || item.title}
          fill
          unoptimized
          sizes={featured ? "(max-width: 760px) 40vw, 250px" : "(max-width: 760px) 27vw, 150px"}
        />
      ) : (
        <div className="sas-insight-cover-placeholder" aria-hidden="true">
          <span>ساس</span>
          <span>{formatLabel(item.format)}</span>
        </div>
      )}
    </div>
  );
}

/** Homepage-only presentation; no fabricated articles, headlines or imagery. */
export function HomeInsightsShowcase({ items }: { items: PublicContentItem[] }) {
  if (!items.length) return null;
  const [featured, ...rest] = items;
  const secondary = rest.slice(0, 2);

  return (
    <section className="sas-home-insights" aria-label="أحدث التحليلات والدراسات">
      <header className="sas-home-insights-head">
        <div className="sas-home-insights-heading">
          <span className="sas-home-insights-eyebrow"><span aria-hidden="true" className="sas-home-insights-symbol">◈</span> التحليل والدراسات</span>
          <h2>أحدث التحليلات والدراسات</h2>
          <p>تحليلات معمّقة وأوراق بحثية وتقارير موقف لفهم تطورات المشهد السياسي وسياقاته.</p>
        </div>
        <Link className="sas-home-insights-view-all" href="/insights">
          عرض جميع المواد <span aria-hidden="true">←</span>
        </Link>
      </header>

      <div className={secondary.length ? "sas-home-insights-grid" : "sas-home-insights-grid sas-home-insights-grid--single"}>
        <article className="sas-insight-feature">
          <div className="sas-insight-feature-text">
            <div className="sas-insight-feature-top">
              <span className="sas-insight-tag">{formatLabel(featured.format)}</span>
              {featured.published_at ? <time dateTime={featured.published_at}>{formatPublishedDate(featured.published_at)}</time> : null}
            </div>
            <h3><Link href={destination(featured)}>{featured.title}</Link></h3>
            {featured.excerpt ? <p>{featured.excerpt}</p> : null}
            <Link className="sas-insight-feature-action" href={destination(featured)}>
              قراءة المادة كاملة <span aria-hidden="true">←</span>
            </Link>
          </div>
          <Cover item={featured} featured />
        </article>

        {secondary.length > 0 ? (
          <div className="sas-home-insights-secondary">
            {secondary.map(item => (
              <article className="sas-insight-small" key={item.id}>
                <Link href={destination(item)} className="sas-insight-small-link" aria-label={"قراءة " + item.title}>
                  <Cover item={item} />
                  <div className="sas-insight-small-copy">
                    <div className="sas-insight-small-meta">
                      <span className="sas-insight-tag">{formatLabel(item.format)}</span>
                      {item.published_at ? <time dateTime={item.published_at}>{formatPublishedDate(item.published_at)}</time> : null}
                    </div>
                    <h3>{item.title}</h3>
                    {item.excerpt ? <p>{item.excerpt}</p> : null}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : null}
      </div>
      <Link href="/insights" className="sas-home-insights-mobile-all">عرض جميع المواد <span aria-hidden="true">←</span></Link>
    </section>
  );
}
