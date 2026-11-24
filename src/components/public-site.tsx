import "./site-search-cta.css";
import "./sas-metallic-logo.css";
import Image from "next/image";
import Link from "next/link";
import {
  bodyToBlocks,
  formatPublishedDate,
  type PublicContentItem,
} from "@/lib/public-content";
import { formatLabel, sectionLabel } from "@/lib/content";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeControl } from "@/components/theme-control";
import { SasHeaderPillNav } from "@/components/sas-pill-nav";
import { SasHeaderScrollState } from "@/components/sas-header-scroll-state";

const navigation = [
  { href: "/briefings", label: "الإحاطة اليومية" },
  { href: "/insights", label: "التحليل والدراسات" },
  { href: "/visual-knowledge", label: "المعرفة البصرية" },
  { href: "/programs", label: "الفيديو والبرامج" },
];

export function PublicHeader() {
  return (
    <header className="site-header sas-unified-header" data-scrolled="false">
      <SasHeaderScrollState />
      <div className="site-header-inner">
        <Link href="/" className="site-brand" aria-label="منصة ساس">
          <span className="sas-metallic-logo"><BrandLogo variant="color" priority /></span>
        </Link>
        <SasHeaderPillNav />
        <div className="site-header-actions">
          <Link href="/search" className="sas-header-search" aria-label="البحث في منصة ساس" title="البحث في الإحاطات والمواد">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="10.8" cy="10.8" r="7.1"/><path d="m16 16 5 5"/></svg>
            <span>بحث</span>
          </Link>
          <ThemeControl />
          <Link href="/login" className="site-admin-link">دخول الإدارة</Link>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <BrandLogo variant="full" />
          <p className="site-footer-official-name">منصة ساس للإعلام والدراسات</p>
        </div>
        <div className="site-footer-links">
          {navigation.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
        </div>
        <span>© منصة ساس للإعلام والدراسات</span>
      </div>
    </footer>
  );
}

export function ContentImage({
  item,
  priority = false,
}: {
  item: PublicContentItem;
  priority?: boolean;
}) {
  if (!item.cover_url) {
    return <div className="content-image-placeholder" aria-hidden="true"><span>ساس</span></div>;
  }

  return (
    <div className="content-image">
      <Image
        src={item.cover_url}
        alt={item.cover_alt || item.title}
        fill
        unoptimized
        priority={priority}
        sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 760px"
      />
    </div>
  );
}

export function ContentMeta({ item }: { item: PublicContentItem }) {
  return (
    <div className="content-meta">
      <span>{sectionLabel(item.section)}</span>
      <span>{formatLabel(item.format)}</span>
      {item.published_at ? <time dateTime={item.published_at}>{formatPublishedDate(item.published_at)}</time> : null}
    </div>
  );
}

export function ContentCard({
  item,
  variant = "standard",
}: {
  item: PublicContentItem;
  variant?: "standard" | "compact" | "feature";
}) {
  return (
    <article className={"content-card content-card--" + variant + " content-card--" + item.section}>
      <Link href={"/content/" + item.slug} className="content-card-link">
        {variant !== "compact" ? <ContentImage item={item} /> : null}
        <div className="content-card-copy">
          <ContentMeta item={item} />
          <h3>{item.title}</h3>
          {item.excerpt ? <p>{item.excerpt}</p> : null}
          <span className="content-card-more sas-text-link">قراءة المادة <span aria-hidden="true">←</span></span>
        </div>
      </Link>
    </article>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel = "عرض جميع المواد",
}: {
  eyebrow: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="site-section-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {href ? <Link href={href} className="sas-text-link">{linkLabel} <span aria-hidden="true">←</span></Link> : null}
    </div>
  );
}

export function EmptyContent({ message = "لا توجد مواد منشورة في هذا القسم حتى الآن." }: { message?: string }) {
  return <div className="public-empty-state"><BrandLogo variant="full" className="public-empty-state-logo" /><p>{message}</p></div>;
}

export function ContentBody({ body }: { body: PublicContentItem["body"] }) {
  const blocks = bodyToBlocks(body);
  if (!blocks.length) return <div className="public-empty-state"><p>لا يتوفر متن منشور لهذه المادة.</p></div>;

  return (
    <div className="public-article-body">
      {blocks.map((block, index) => {
        if (block.type === "heading") return <h2 key={index}>{block.text}</h2>;
        if (block.type === "subheading") return <h3 key={index}>{block.text}</h3>;
        if (block.type === "quote") return <blockquote key={index}>{block.text}</blockquote>;
        if (block.type === "list" && block.items?.length) {
          return <ul key={index}>{block.items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}</ul>;
        }
        return <p key={index}>{block.text}</p>;
      })}
    </div>
  );
}
