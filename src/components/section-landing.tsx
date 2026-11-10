import Link from "next/link";
import type { PublicContentItem } from "@/lib/public-content";
import {
  ContentCard,
  EmptyContent,
  PublicFooter,
  PublicHeader,
} from "@/components/public-site";

export function SectionLanding({
  title,
  eyebrow,
  description,
  items,
}: {
  title: string;
  eyebrow: string;
  description: string;
  items: PublicContentItem[];
}) {
  const [lead, ...rest] = items;

  return (
    <main className="public-site">
      <PublicHeader />
      <section className="section-landing-intro site-container">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <Link href="/" className="section-back-link">العودة إلى الرئيسية</Link>
      </section>

      <section className="section-landing-content site-container">
        {lead ? (
          <div className="section-lead-layout">
            <ContentCard item={lead} variant="feature" />
            <div className="section-lead-list">
              {rest.slice(0, 4).map((item) => <ContentCard item={item} variant="compact" key={item.id} />)}
            </div>
          </div>
        ) : <EmptyContent />}

        {rest.length > 4 ? (
          <div className="content-card-grid">
            {rest.slice(4).map((item) => <ContentCard item={item} key={item.id} />)}
          </div>
        ) : null}
      </section>
      <PublicFooter />
    </main>
  );
}
