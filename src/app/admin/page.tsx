import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { getPublicBriefingArchive } from "@/lib/public-briefing";
import { productForContent } from "@/lib/admin-products";
import { formatLabel } from "@/lib/content";
import "./content/admin-content-products.css";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const {supabase,displayName}=await requireAdmin();
  const [materials, sources, editions, publishedCount, draftCount] = await Promise.all([
    supabase.from("content_items").select("id,title,section,format,status,updated_at").order("updated_at",{ascending:false}).limit(30),
    supabase.from("content_sources").select("id",{count:"exact",head:true}),
    getPublicBriefingArchive(50).catch(()=>null),
    supabase.from("content_items").select("id",{count:"exact",head:true}).eq("status","published"),
    supabase.from("content_items").select("id",{count:"exact",head:true}).eq("status","draft"),
  ]);
  const items=materials.data??[];
  const statistics=[
    {label:"أعداد الإحاطة المتاحة",value:editions?.length??"—"},
    {label:"المواد المنشورة",value:publishedCount.count??"—"},
    {label:"المسودات التحريرية",value:draftCount.count??"—"},
    {label:"المصادر المسجلة",value:sources.count??"—"},
  ];
  const products=[
    {num:"01",title:"الإحاطة اليومية",description:"تصفح الأعداد والتطورات المنشورة وتحويل أي سجل إلى بطاقة في News Studio.",href:"/admin/briefings",action:"فتح سجل الإحاطات"},
    {num:"02",title:"التحليل والدراسات",description:"إدارة التحليلات والأوراق البحثية والتقديرات السياسية ضمن قسم واحد.",href:"/admin/content?product=analysis",action:"إدارة التحليلات والدراسات"},
    {num:"03",title:"المعرفة البصرية",description:"إدارة المواد البصرية في قاعدة المحتوى ومراجعة المنتجات التفاعلية.",href:"/admin/content?product=visual",action:"فتح المعرفة البصرية"},
    {num:"04",title:"الفيديو والبرامج",description:"إدارة الفيديوهات والبودكاست واللقاءات والمقاطع المرئية.",href:"/admin/content?product=programs",action:"فتح الفيديو والبرامج"},
  ];
  return (
    <>
      <div className="page-heading">
        <div><span className="eyebrow">غرفة التحرير / لوحة التشغيل</span>
          <h1>مرحبًا، {displayName}</h1>
          <p>إدارة منتجات ساس الأربعة من مكان واحد. الأعداد اليومية محفوظة في سجل منفصل عن مواد الموقع الاعتيادية.</p>
        </div>
        <Link href="/admin/news-studio" className="button button-primary">فتح News Studio</Link>
      </div>
      {(!editions||materials.error||sources.error||publishedCount.error||draftCount.error)?<div className="notice notice-error">بعض إحصاءات لوحة التشغيل غير متاحة الآن؛ قد تكون الأرقام الظاهرة جزئية.</div>:null}
      <div className="stat-grid">{statistics.map(item=><article key={item.label} className="stat-card">
        <span>{item.label}</span><strong>{typeof item.value==="number"?item.value.toLocaleString("en-US"):item.value}</strong>
      </article>)}</div>
      <section className="sas-admin-home-products" aria-label="منتجات ساس التحريرية">
        {products.map(item=><article key={item.num}>
          <span className="sas-admin-product-number">{item.num} / SAS</span>
          <h2>{item.title}</h2>
          <p>{item.description}</p>
          <Link href={item.href} className="button button-secondary">{item.action} ←</Link>
        </article>)}
      </section>
      <div className="admin-grid">
        <section className="panel">
          <div className="panel-header"><h2>آخر المواد المحفوظة</h2><Link href="/admin/content?product=analysis" className="table-title">إدارة المواد ←</Link></div>
          {items.length?<div className="table-wrap"><table className="data-table">
            <thead><tr><th>العنوان</th><th>المنتج</th><th>الحالة</th></tr></thead>
            <tbody>{items.slice(0,8).map(item=><tr key={item.id}>
              <td><Link href={"/admin/content/"+item.id} className="table-title">{item.title}</Link><div className="table-subtitle">{formatLabel(item.format)}</div></td>
              <td>{({analysis:"التحليل والدراسات",visual:"المعرفة البصرية",programs:"الفيديو والبرامج",legacy:"أرشيف قديم"} as const)[productForContent(item.section,item.format)]}</td>
              <td>{item.status==="published"?"منشور":item.status==="archived"?"مؤرشف":"مسودة"}</td>
            </tr>)}</tbody>
          </table></div>:<div className="empty-state">لا توجد مواد محفوظة.</div>}
        </section>
        <section className="panel">
          <div className="panel-header"><h2>أدوات التشغيل المساندة</h2></div>
          <div className="panel-body form-stack">
            <Link className="button button-secondary" href="/admin/briefings">تصفح تطورات الإحاطة</Link>
            <Link className="button button-secondary" href="/admin/content/new">إنشاء مادة جديدة</Link>
            <Link className="button button-secondary" href="/admin/sources">إدارة المصادر</Link>
            <Link className="button button-secondary" href="/admin/media">مكتبة الوسائط</Link>
            <Link className="button button-quiet" href="/admin/content?product=legacy">أرشيف المواد السابقة</Link>
            <p className="helper-text">الصلاحيات الحالية لهذه اللوحة محصورة بدور المدير النشط. لا تعرض بيانات الإحاطة غير المنشورة.</p>
          </div>
        </section>
      </div>
    </>
  );
}
