import type { Metadata } from "next";
import Image from "next/image";
import { BrandLogo } from "@/components/brand-logo";
import { notFound } from "next/navigation";
import {
  ContentBody,
  PublicFooter,
  PublicHeader,
} from "@/components/public-site";
import {
  bodyToBlocks,
  formatPublishedDate,
  getPublishedAuthors,
  getPublishedContentBySlug,
  getPublishedSources,
  getPublicCategory,
} from "@/lib/public-content";
import { formatLabel, sectionLabel } from "@/lib/content";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublishedContentBySlug(slug);
  if (!item) return { title: "المادة غير موجودة" };

  return {
    title: item.seo_title || item.title,
    description: item.seo_description || item.excerpt || undefined,
    openGraph: {
      title: item.seo_title || item.title,
      description: item.seo_description || item.excerpt || undefined,
      type: "article",
      images: item.cover_url ? [{ url: item.cover_url, alt: item.cover_alt || item.title }] : [],
    },
  };
}

function readingMinutes(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}

export default async function PublicContentPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getPublishedContentBySlug(slug);
  if (!item) notFound();

  const [sources, authors, category] = await Promise.all([
    getPublishedSources(item.id),
    getPublishedAuthors(item.id),
    getPublicCategory(item.category_id),
  ]);
  const blocks = bodyToBlocks(item.body);
  const bodyText = blocks.map((block) => block.text || (block.items || []).join(" ")).join(" ");
  const isAnalysis = item.section === "analysis";
  const isResearch = item.section === "research";

  return (
    <main className="public-site">
      <PublicHeader />
      <div className={"article-page article-page--" + item.section}>
        <div className="article-breadcrumb">
          <a href="/">الرئيسية</a><span>/</span><a href={"/" + item.section}>{sectionLabel(item.section)}</a>
        </div>

        {isResearch ? (
          <header className="research-public-cover">
            <div className="research-public-brand">
              <BrandLogo variant="full" />
              <span className="research-public-label">دراسات وأبحاث</span>
            </div>
            <div className="research-public-rule" />
            <span className="article-kicker">{category?.name || formatLabel(item.format)}</span>
            <h1>{item.title}</h1>
            {item.excerpt ? <p className="article-deck">{item.excerpt}</p> : null}
            <div className="research-public-meta">
              <div><span>إعداد</span><strong>{authors.length ? authors.map((author) => author.display_name).join("، ") : "وحدة الدراسات والأبحاث"}</strong></div>
              <div><span>النطاق</span><strong>اليمن والمحيط الإقليمي</strong></div>
              <div><span>التصنيف</span><strong>{formatLabel(item.format)}</strong></div>
              <div><span>تاريخ النشر</span><strong>{formatPublishedDate(item.published_at)}</strong></div>
            </div>
          </header>
        ) : (
          <header className={"article-header" + (isAnalysis ? " article-header--analysis" : " article-header--news")}>
            <div className="article-header-main">
              <div className="article-kicker-row">
                <span className="article-kicker">{category?.name || sectionLabel(item.section)}</span>
                <span className="article-format">{formatLabel(item.format)}</span>
              </div>
              <h1>{item.title}</h1>
              {item.excerpt ? <p className="article-deck">{item.excerpt}</p> : null}
              <div className="article-byline">
                <span>{authors.length ? authors.map((author) => author.display_name).join("، ") : "منصة ساس"}</span>
                {item.published_at ? <time dateTime={item.published_at}>{formatPublishedDate(item.published_at)}</time> : null}
                <span>زمن القراءة: {readingMinutes(bodyText)} دقائق</span>
              </div>
            </div>
            <aside className="article-data-card">
              <span>بيانات المادة</span>
              <strong>{sectionLabel(item.section)}</strong>
              <p>{formatLabel(item.format)}</p>
              {item.published_at ? <time dateTime={item.published_at}>{formatPublishedDate(item.published_at)}</time> : null}
            </aside>
          </header>
        )}

        {item.cover_url ? (
          <figure className="article-cover-image">
            <Image src={item.cover_url} alt={item.cover_alt || item.title} fill unoptimized sizes="(max-width: 900px) 100vw, 1100px" />
            {item.cover_caption ? <figcaption>{item.cover_caption}</figcaption> : null}
          </figure>
        ) : null}

        <div className={"article-content-layout" + (isResearch ? " article-content-layout--research" : "")}>
          <article className="article-content">
            <ContentBody body={item.body} />
            {sources.length ? (
              <section className="article-sources">
                <h2>المصادر والإحالات</h2>
                <ol>
                  {sources.map((source) => (
                    <li key={source.id}>
                      {source.source_url ? (
                        <a href={source.source_url} target="_blank" rel="noreferrer">{source.source_name}</a>
                      ) : <span>{source.source_name}</span>}
                      {source.organization_name ? <small>{source.organization_name}</small> : null}
                      {source.attribution_text ? <p>{source.attribution_text}</p> : null}
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}
          </article>
          <aside className="article-sidebar">
            <div className="article-sidebar-card">
              <span>في هذه المادة</span>
              <strong>{item.title}</strong>
              <p>{item.excerpt || "مادة منشورة ضمن " + sectionLabel(item.section)}</p>
            </div>
            <a href={"/" + item.section} className="article-back-link">المزيد في {sectionLabel(item.section)} ←</a>
          </aside>
        </div>
      </div>
      <PublicFooter />
    </main>
  );
}
