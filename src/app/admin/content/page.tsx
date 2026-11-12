import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { formatLabel, sectionLabel } from "@/lib/content";

const statuses = [
  { value: "", label: "كل الحالات" },
  { value: "draft", label: "مسودات" },
  { value: "published", label: "منشور" },
  { value: "archived", label: "أرشيف" },
];

export default async function ContentIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; status?: string; created?: string; saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireAdmin();

  let query = supabase
    .from("content_items")
    .select("id,title,slug,section,format,status,published_at,updated_at,created_at")
    .order("updated_at", { ascending: false })
    .limit(100);

  if (["news", "analysis", "research", "media"].includes(params.section ?? "")) {
    query = query.eq("section", params.section as "news" | "analysis" | "research" | "media");
  }
  if (["draft", "published", "archived"].includes(params.status ?? "")) {
    query = query.eq("status", params.status as "draft" | "published" | "archived");
  }

  const { data: items, error } = await query;
  const sectionFilters = [
    { value: "", label: "كل الأقسام" },
    { value: "news", label: "الأخبار" },
    { value: "analysis", label: "التحليل والرأي" },
    { value: "research", label: "الدراسات" },
    { value: "media", label: "البرامج والوسائط" },
  ];

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">غرفة التحرير</span>
          <h1>إدارة المحتوى</h1>
          <p>إنشاء المواد التحريرية ومراجعة حالتها وربطها بمصادرها.</p>
        </div>
        <Link href="/admin/content/new" className="button button-primary">＋ مادة جديدة</Link>
      </div>

      {params.created ? <div className="notice notice-success">تم إنشاء المادة بنجاح.</div> : null}
      {params.saved ? <div className="notice notice-success">تم حفظ التعديلات.</div> : null}
      {params.error ? <div className="notice notice-error">تعذر تنفيذ العملية المطلوبة.</div> : null}

      <div className="toolbar">
        {sectionFilters.map((filter) => (
          <Link
            key={filter.value}
            href={`/admin/content?${new URLSearchParams({ ...(filter.value ? { section: filter.value } : {}), ...(params.status ? { status: params.status } : {}) }).toString()}`}
            className={(params.section ?? "") === filter.value ? "active" : ""}
          >{filter.label}</Link>
        ))}
      </div>
      <div className="toolbar">
        {statuses.map((filter) => (
          <Link
            key={filter.value}
            href={`/admin/content?${new URLSearchParams({ ...(params.section ? { section: params.section } : {}), ...(filter.value ? { status: filter.value } : {}) }).toString()}`}
            className={(params.status ?? "") === filter.value ? "active" : ""}
          >{filter.label}</Link>
        ))}
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>سجل المواد التحريرية</h2>
          <span className="pill">{items?.length ?? 0} مادة</span>
        </div>
        {error ? <div className="empty-state">تعذر تحميل المحتوى. تحقق من اتصال قاعدة البيانات.</div> : items?.length ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>العنوان</th><th>القسم</th><th>النوع</th><th>الحالة</th><th>آخر تحديث</th><th /></tr></thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td><Link href={`/admin/content/${item.id}`} className="table-title">{item.title}</Link><div className="table-subtitle" dir="ltr">{item.slug}</div></td>
                    <td>{sectionLabel(item.section)}</td>
                    <td>{formatLabel(item.format)}</td>
                    <td><span className={`pill ${item.status === "published" ? "pill-green" : item.status === "archived" ? "pill-red" : "pill-gold"}`}>{item.status === "published" ? "منشور" : item.status === "archived" ? "مؤرشف" : "مسودة"}</span></td>
                    <td dir="ltr">{new Date(item.updated_at).toLocaleDateString("en-GB")}</td>
                    <td><Link href={`/admin/content/${item.id}`} className="button button-quiet button-small">تحرير</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="empty-state">لا توجد مواد في هذا العرض حتى الآن.<br />ابدأ بإنشاء أول مادة تحريرية.</div>}
      </section>
    </>
  );
}
