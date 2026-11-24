import Image from "next/image";
import Link from "next/link";
import type { PublicContentItem } from "@/lib/public-content";
import "./programs-catalog.css";

/** The external destination is authored and validated in the editorial form. */
function videoDestination(item: PublicContentItem): string | null {
  const body = item.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const url = typeof body.external_video_url === "string" ? body.external_video_url : null;
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) return null;
    return parsed.toString();
  } catch { return null; }
}

function formatDate(value: string | null): string {
  if (!value) return "";
  return new Intl.DateTimeFormat("ar-YE-u-nu-latn", {
    timeZone: "Asia/Aden", year: "numeric", month: "long", day: "numeric"
  }).format(new Date(value));
}

export function ProgramsCatalog({ items }: { items: PublicContentItem[] }) {
  return (
    <section className="sas-video-catalog" aria-label="مكتبة الفيديو والبرامج">
      <div className="sas-video-catalog__grid">
        {items.map(item => {
          const destination = videoDestination(item);
          // Legacy media without a dedicated destination retains its detail page.
          const href = destination || "/content/" + item.slug;
          return (
            <article key={item.id} className="sas-video-card">
              <a href={href} className="sas-video-card__link"
                {...(destination ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                aria-label={"مشاهدة: " + item.title}>
                <div className="sas-video-card__poster">
                  {item.cover_url
                    ? <Image src={item.cover_url} alt={item.cover_alt || item.title}
                        fill unoptimized sizes="(max-width: 540px) 45vw, (max-width: 900px) 33vw, 280px" />
                    : <div className="sas-video-card__placeholder" aria-hidden="true">ساس</div>}
                  <span className="sas-video-card__play" aria-hidden="true">
                    <svg width="23" height="23" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5.8a1.4 1.4 0 0 1 2.1-1.2l9.2 6a1.7 1.7 0 0 1 0 2.8l-9.2 6a1.4 1.4 0 0 1-2.1-1.2V5.8Z"/>
                    </svg>
                  </span>
                </div>
                <div className="sas-video-card__text">
                  <h2>{item.title}</h2>
                  {item.excerpt ? <p>{item.excerpt}</p> : null}
                  {item.published_at ? <time dateTime={item.published_at}>{formatDate(item.published_at)}</time> : null}
                </div>
              </a>
            </article>
          );
        })}
      </div>
      {!items.length ? <p className="sas-video-catalog__empty">لا توجد حلقات منشورة حاليًا.</p> : null}
    </section>
  );
}
