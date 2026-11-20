import type { Metadata } from "next";
import Link from "next/link";
import { PublicFooter, PublicHeader } from "@/components/public-site";
import { normalizeSearchTerm, searchKinds, searchPublicContent } from "@/lib/search-public";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "البحث في ساس",
  description: "ابحث في الإحاطات اليومية والتحليلات والدراسات والمواد البصرية المنشورة في منصة ساس.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const params = await searchParams;
  const q = normalizeSearchTerm(typeof params.q === "string" ? params.q : "");
  const chosen = searchKinds.find(item => item.id === params.type)?.id ?? "all";
  const { results, partialError } = q.length >= 2
    ? await searchPublicContent(q)
    : { results: [], partialError: false };
  const filtered = results.filter(item => chosen === "all" || item.kind === chosen);
  const labels: Record<string, string> = {
    briefing: "الإحاطة اليومية", analysis: "التحليل", research: "الدراسات",
    media: "الفيديو والبرامج", news: "المواد الإخبارية", visual: "المعرفة البصرية",
  };
  return (
    <main className="public-site">
      <PublicHeader />
      <div className="site-container sas-search-page">
        <div className="sas-search-heading">
          <span className="eyebrow">أرشيف المعرفة السياسية</span>
          <h1>البحث في ساس</h1>
          <p>ابحث عن موضوع أو دولة أو مؤسسة أو مفهوم في المواد المنشورة والإحاطات اليومية والمعرفة البصرية.</p>
        </div>
        <form className="sas-search-form" method="GET" action="/search" role="search">
          <label htmlFor="sas-search-query">ما الذي تبحث عنه؟</label>
          <div className="sas-search-input-row">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="10.8" cy="10.8" r="7.1"/><path d="m16 16 5 5"/></svg>
            <input id="sas-search-query" autoFocus type="search" name="q" defaultValue={q} minLength={2} maxLength={90} required placeholder="مثال: حضرموت، اليمن، الدولة، الهدنة..." />
            <button type="submit" className="sas-cta sas-cta--primary">بحث</button>
          </div>
        </form>
        {q.length >= 2 ? (
          <>
            <nav className="sas-search-filters" aria-label="تصفية نتائج البحث">
              {searchKinds.map(item => (
                <Link key={item.id} aria-current={chosen === item.id ? "page" : undefined}
                  href={"/search?" + new URLSearchParams({q, ...(item.id !== "all" ? {type:item.id} : {})}).toString()}
                  className={"sas-search-filter" + (chosen === item.id ? " is-active" : "")}>{item.label}</Link>
              ))}
            </nav>
            <div className="sas-search-summary" role="status">
              <strong>{filtered.length} نتيجة</strong><span>لعبارة «{q}»</span>
              {partialError ? <span>تعذر الوصول إلى بعض مصادر البحث؛ النتائج المعروضة جزئية.</span> : null}
            </div>
            {filtered.length ? (
              <div className="sas-search-results">
                {filtered.map(item => (
                  <article key={item.href} className="sas-search-result">
                    <div className="sas-search-result-meta"><span>{labels[item.kind]}</span>{item.date ? <time dateTime={item.date}>{item.date.slice(0,10)}</time> : null}</div>
                    <h2><Link href={item.href}>{item.title}</Link></h2>
                    <p>{item.description}</p>
                    <Link className="sas-search-result-link sas-text-link" href={item.href}>فتح المادة <span aria-hidden="true">←</span></Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="sas-search-empty">
                <h2>لا توجد نتائج مطابقة في هذا التصنيف</h2>
                <p>جرّب كلمة أقل تحديدًا، أو اختر «جميع النتائج». لا تظهر المسودات والمواد غير المنشورة في البحث.</p>
                <Link href="/search" className="sas-cta sas-cta--secondary">بحث جديد</Link>
              </div>
            )}
          </>
        ) : (
          <div className="sas-search-empty">
            <h2>ابدأ بمصطلح أو اسم</h2>
            <p>البحث متاح في عناوين وأوصاف المواد المنشورة، وتطورات الإحاطات، والمنتجات المعرفية التفاعلية.</p>
            <div className="sas-search-suggestions">
              {["الدولة","حضرموت","اليمن","الهدنة"].map(value => <Link key={value} href={"/search?q="+encodeURIComponent(value)}>{value}</Link>)}
            </div>
          </div>
        )}
      </div>
      <PublicFooter />
    </main>
  );
}
