import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { formatLabel, sectionLabel } from "@/lib/content";

export default async function AdminDashboardPage() {
  const { supabase, displayName } = await requireAdmin();

  const [all, drafts, published, sources, categories, recent] = await Promise.all([
    supabase.from("content_items").select("id", { count: "exact", head: true }),
    supabase.from("content_items").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("content_items").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("content_sources").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("content_items").select("id,title,section,format,status,updated_at").order("updated_at", { ascending: false }).limit(6),
  ]);

  const stats = [
    { label: "إجمالي المواد", value: all.count ?? 0 },
    { label: "المسودات", value: drafts.count ?? 0 },
    { label: "المواد المنشورة", value: published.count ?? 0 },
    { label: "المصادر المسجلة", value: sources.count ?? 0 },
  ];

  return (
    <>
      <div className="page-heading">
        <div><span className="eyebrow">لوحة القيادة</span><h1>مرحبًا، {displayName}</h1><p>هذه مساحة إدارة المحتوى والتحرير لمنصة ساس. جميع الأرقام تُقرأ مباشرة من قاعدة البيانات.</p></div>
        <Link href="/admin/content/new" className="button button-primary">＋ إنشاء مادة</Link>
      </div>

      <div className="stat-grid">
        {stats.map((stat) => <article className="stat-card" key={stat.label}><span>{stat.label}</span><strong>{stat.value.toLocaleString("en-US")}</strong></article>)}
      </div>

      <div className="admin-grid">
        <section className="panel">
          <div className="panel-header"><h2>آخر المواد تحديثًا</h2><Link href="/admin/content" className="table-title">عرض الكل ←</Link></div>
          {recent.error ? <div className="empty-state">تعذر تحميل المواد.</div> : recent.data?.length ? (
            <div className="table-wrap"><table className="data-table">
              <thead><tr><th>العنوان</th><th>القسم</th><th>الحالة</th><th>آخر تحديث</th></tr></thead>
              <tbody>{recent.data.map((item) => <tr key={item.id}>
                <td><Link href={`/admin/content/${item.id}`} className="table-title">{item.title}</Link><div className="table-subtitle">{formatLabel(item.format)}</div></td>
                <td>{sectionLabel(item.section)}</td>
                <td><span className={`pill ${item.status === "published" ? "pill-green" : "pill-gold"}`}>{item.status === "published" ? "منشور" : item.status === "archived" ? "مؤرشف" : "مسودة"}</span></td>
                <td dir="ltr">{new Date(item.updated_at).toLocaleDateString("en-GB")}</td>
              </tr>)}</tbody>
            </table></div>
          ) : <div className="empty-state">لم تُنشأ مواد تحريرية بعد. ابدأ بإضافة أول خبر أو دراسة.</div>}
        </section>

        <section className="panel">
          <div className="panel-header"><h2>اختصارات التشغيل</h2></div>
          <div className="panel-body form-stack">
            <Link href="/admin/content/new" className="button button-secondary">＋ إنشاء مادة تحريرية</Link>
            <Link href="/admin/sources" className="button button-secondary">◎ تسجيل مصدر جديد</Link>
            <Link href="/admin/categories" className="button button-secondary">▦ تنظيم التصنيفات</Link>
            <Link href="/admin/media" className="button button-secondary">▧ إضافة صورة إلى المكتبة</Link>
            <div className="notice" style={{ background: "#f4f7f3", color: "#53645a", marginTop: 8 }}>
              <strong>حالة البنية</strong><br />
              Supabase Auth وPostgres وStorage متصلة. صلاحية هذه المساحة مقصورة على مدير المنصة.
            </div>
            <div className="helper-text">عدد التصنيفات النشطة: {categories.count ?? 0}</div>
          </div>
        </section>
      </div>
    </>
  );
}
