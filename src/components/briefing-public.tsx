import Link from "next/link";
import type { BriefingSource } from "@/lib/public-briefing";

const categoryLabels: Record<string, string> = {
  politics: "سياسة",
  security: "أمن",
  economy: "اقتصاد",
  humanitarian: "إنساني",
  diplomacy: "دبلوماسية",
  regional: "إقليمي",
  international: "دولي",
  other: "متنوع",
};

const classLabels: Record<string, string> = {
  fact: "واقعة",
  position: "موقف",
  claim: "ادعاء",
  analysis: "تحليل",
};

const verificationLabels: Record<string, string> = {
  verified: "متحقق",
  attributed: "منسوب إلى مصدر",
  disputed: "متنازع عليه",
  unverified: "لم يتحقق مستقلًا",
  not_applicable: "لا ينطبق",
};

const roleLabels: Record<string, string> = {
  primary: "مصدر أساسي",
  supporting: "مصدر مساند",
  context: "مصدر سياقي",
};

const scopeLabels: Record<string, string> = {
  local: "محلي",
  national: "اليمن",
  regional: "إقليمي",
  international: "دولي",
};

export function briefingCategoryLabel(value: string) {
  return categoryLabels[value] ?? "متنوع";
}

export function briefingClassLabel(value: string) {
  return classLabels[value] ?? "معلومة";
}

export function briefingVerificationLabel(value: string) {
  return verificationLabels[value] ?? "حالة التحقق غير محددة";
}

export function briefingScopeLabel(value: string) {
  return scopeLabels[value] ?? "نطاق غير محدد";
}

export function formatBriefingDate(value: string, withTime = false) {
  if (!value) return "غير محدد";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ar-YE-u-nu-latn", {
    timeZone: "Asia/Aden",
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit", hourCycle: "h23" as const } : {}),
  }).format(date);
}

export function formatBriefingDateOnly(value: string) {
  if (!value) return "غير محدد";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return formatBriefingDate(value);
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
  return new Intl.DateTimeFormat("ar-YE-u-nu-latn", {
    timeZone: "Asia/Aden",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function BriefingSource({
  source,
  compact = false,
}: {
  source: BriefingSource;
  compact?: boolean;
}) {
  const label = source.source_title || source.source_name;
  const sourceDate = source.published_at || source.publication_date;

  return (
    <div className={compact ? "briefing-source briefing-source--compact" : "briefing-source"}>
      <span className="briefing-source-mark" aria-hidden="true">↗</span>
      <div className="briefing-source-copy">
        <div className="briefing-source-heading">
          {source.source_url ? (
            <a href={source.source_url} target="_blank" rel="noopener noreferrer">{label}</a>
          ) : <strong>{label}</strong>}
          <span>{roleLabels[source.source_role] ?? "مصدر"}</span>
        </div>
        {source.organization_name && source.organization_name !== source.source_name ? (
          <small>{source.organization_name}</small>
        ) : null}
        {sourceDate ? <time dateTime={sourceDate}>{formatBriefingDate(sourceDate, sourceDate.includes("T"))}</time> : null}
        {source.source_reference ? <small className="briefing-source-reference">مرجع: {source.source_reference}</small> : null}
        {source.attribution_note ? <small>{source.attribution_note}</small> : null}
        {source.source_excerpt ? <details className="briefing-source-excerpt"><summary>مقتطف من المصدر</summary><p>{source.source_excerpt}</p></details> : null}
      </div>
    </div>
  );
}

export function BriefingTypeTag({ value }: { value: string }) {
  return <span className={"briefing-type-tag briefing-type-tag--" + value}>{briefingClassLabel(value)}</span>;
}

export function BriefingVerification({ value }: { value: string }) {
  return <span className="briefing-verification">{briefingVerificationLabel(value)}</span>;
}

export function BriefingArchiveLink({
  slug,
  title,
  date,
  editionNo,
  featured = false,
}: {
  slug: string;
  title: string;
  date: string;
  editionNo: number;
  featured?: boolean;
}) {
  return (
    <article className={featured ? "briefing-archive-card briefing-archive-card--featured" : "briefing-archive-card"}>
      <div className="briefing-archive-meta">
        <span>العدد {editionNo}</span>
        <time dateTime={date}>{formatBriefingDateOnly(date)}</time>
      </div>
      <h2><Link href={"/briefings/" + slug}>{title}</Link></h2>
      <Link className="briefing-archive-open" href={"/briefings/" + slug}>فتح الإحاطة <span aria-hidden="true">←</span></Link>
    </article>
  );
}
