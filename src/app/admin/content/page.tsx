import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { formatLabel } from "@/lib/content";
import { adminEditorialProducts, productForContent } from "@/lib/admin-products";
import "./admin-content-products.css";

const statuses = [
  {value:"",label:"كل الحالات"},
  {value:"draft",label:"المسودات"},
  {value:"published",label:"المنشورة"},
  {value:"archived",label:"المؤرشفة"},
];

export default async function ContentIndexPage({
  searchParams,
}: {
  searchParams: Promise<{product?:string;status?:string;created?:string;saved?:string;error?:string}>;
}) {
  const params=await searchParams;
  const {supabase}=await requireAdmin();
  const product=adminEditorialProducts.find(item=>item.id===params.product)?.id??"analysis";
  const status=statuses.some(item=>item.value===params.status)?params.status??"":"";
  let query=supabase.from("content_items")
    .select("id,title,slug,section,format,status,published_at,updated_at,created_at")
    .order("updated_at",{ascending:false}).limit(300);
  if(status) query=query.eq("status",status as "draft"|"published"|"archived");
  const {data,error}=await query;
  const all=data??[];
  const items=all.filter(item=>productForContent(item.section,item.format)===product);

  const link=(nextProduct:string,nextStatus:string)=>
    "/admin/content?"+new URLSearchParams({product:nextProduct,...(nextStatus?{status:nextStatus}:{})}).toString();

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">غرفة التحرير / المنتجات</span>
          <h1>إدارة المواد التحريرية</h1>
          <p>إدارة المحتوى وفق منتجات ساس الجديدة. تُدار الإحاطة اليومية في سجلها المستقل للحفاظ على المراجعات والمصادر.</p>
        </div>
        <Link href="/admin/content/new" className="button button-primary">＋ مادة جديدة</Link>
      </div>
      <nav className="sas-admin-product-switch" aria-label="منتجات التحرير">
        <Link href="/admin/briefings"><strong>الإحاطة اليومية</strong><small>الأعداد والتطورات ← News Studio</small></Link>
        {adminEditorialProducts.map(item=>
          <Link key={item.id} href={link(item.id,status)}
            className={product===item.id?"is-active":""} aria-current={product===item.id?"page":undefined}>
            <strong>{item.label}</strong><small>{item.description}</small>
          </Link>
        )}
      </nav>
      {params.created?<div className="notice notice-success">تم إنشاء المادة بنجاح.</div>:null}
      {params.saved?<div className="notice notice-success">تم حفظ التعديلات.</div>:null}
      {params.error?<div className="notice notice-error">تعذر تنفيذ العملية المطلوبة.</div>:null}
      <div className="toolbar" aria-label="حالة النشر">
        {statuses.map(item=><Link key={item.value} href={link(product,item.value)} className={status===item.value?"active":""}>{item.label}</Link>)}
      </div>
      {product==="legacy"?<div className="sas-admin-legacy-note">هذه مواد من نظام النشر السابق. أبقيناها قابلة للمراجعة دون إظهار تصنيفات الأخبار والرأي القديمة بوصفها أقسامًا رئيسية في المنصة الجديدة.</div>:null}
      {product==="visual"?<div className="sas-admin-legacy-note">يتضمن هذا السجل المواد البصرية المخزنة في قاعدة المحتوى. أما الأدلة التفاعلية المنشأة برمجيًا فتُعرض في <Link href="/visual-knowledge" target="_blank">قسم المعرفة البصرية</Link> ولا يحررها نموذج المقالات.</div>:null}
      <section className="panel">
        <div className="panel-header">
          <h2>{adminEditorialProducts.find(item=>item.id===product)?.label}</h2>
          <span className="pill">{items.length} مادة{all.length===300?" من أحدث 300 سجل":""}</span>
        </div>
        {error?<div className="empty-state" role="alert">تعذر تحميل المواد. تحقق من قاعدة البيانات.</div>:
        items.length?<div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>العنوان</th><th>نوع المادة</th><th>الحالة</th><th>آخر تحديث</th><th>الإجراء</th></tr></thead>
            <tbody>{items.map(item=><tr key={item.id}>
              <td><Link href={"/admin/content/"+item.id} className="table-title">{item.title}</Link><div className="table-subtitle" dir="ltr">{item.slug}</div></td>
              <td>{formatLabel(item.format)}</td>
              <td><span className={`pill ${item.status==="published"?"pill-green":item.status==="archived"?"pill-red":"pill-gold"}`}>{item.status==="published"?"منشور":item.status==="archived"?"مؤرشف":"مسودة"}</span></td>
              <td dir="ltr">{new Date(item.updated_at).toLocaleDateString("en-GB")}</td>
              <td><Link className="button button-quiet button-small" href={"/admin/content/"+item.id}>مراجعة</Link></td>
            </tr>)}</tbody>
          </table>
        </div>:<div className="empty-state">لا توجد مواد في هذا المنتج وحالة النشر المحددة.</div>}
      </section>
    </>
  );
}
