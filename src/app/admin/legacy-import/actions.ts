"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import type { Json } from "@/types/database.types";
import type { LegacyImportPost } from "@/lib/legacy-wordpress-export";

export type LegacyImportOutcome = {
  imported: Array<{ title: string; id: string }>;
  skipped: Array<{ title: string; reason: string }>;
  failed: Array<{ title: string; reason: string }>;
};

function validate(raw: LegacyImportPost) {
  if (!raw || !Number.isSafeInteger(raw.legacyId) || raw.legacyId < 1) throw Error("معرف WordPress غير صالح.");
  if (!["opinion","analysis","podcast"].includes(raw.editorialType)) throw Error("نوع المادة غير مسموح.");
  if (raw.slug !== "sas-legacy-wp-" + raw.legacyId) throw Error("الرابط الداخلي غير مطابق.");
  const source = new URL(raw.originalUrl);
  if (!["https:","http:"].includes(source.protocol) || !/^(?:www\.)?sas-media\.net$/i.test(source.hostname))
    throw Error("رابط المصدر ليس تابعًا لموقع ساس القديم.");
  const title = raw.title?.trim();
  if (!title || title.length > 240) throw Error("عنوان غير صالح.");
  const date = raw.originalDate?.slice(0,10);
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) throw Error("تاريخ أصلي غير صالح.");
  if (!Array.isArray(raw.blocks) || !raw.blocks.length || raw.blocks.length > 250) throw Error("المتن غير متاح أو يتجاوز عدد الفقرات المسموح.");
  const allowed = ["paragraph","heading","subheading","quote","list"];
  let size = 0;
  const blocks = raw.blocks.map((item) => {
    if (!item || !allowed.includes(item.type)) throw Error("نوع فقرة غير صالح.");
    if (item.type === "list") {
      if (!Array.isArray(item.items) || item.items.length > 50 || !item.items.every((x) => typeof x === "string" && x.length <= 20000))
        throw Error("قائمة غير صالحة.");
      size += item.items.join("").length;
      return { type: "list", items: item.items.map((x) => x.trim()) };
    }
    if (typeof item.text !== "string" || !item.text.trim() || item.text.length > 20000) throw Error("فقرة غير صالحة.");
    size += item.text.length;
    return { type: item.type, text: item.text.trim() };
  });
  if (size < 80 || size > 400000) throw Error("المادة غير مكتملة أو كبيرة جدًا.");
  const mediaLinks = Array.isArray(raw.mediaLinks) ? raw.mediaLinks.filter((v) => typeof v === "string" && /^https?:\/\//.test(v)).slice(0,60) : [];
  const body = {version:1,blocks,migration:{
    source:"wordpress_wxr",original_id:raw.legacyId,original_url:source.href,
    original_date:raw.originalDate.slice(0,25),
    account_uploader_not_verified_author:String(raw.uploader??"").slice(0,150),
    original_categories:Array.isArray(raw.taxonomy)?raw.taxonomy.filter((v)=>typeof v==="string").slice(0,15):[],
    media_to_review:mediaLinks,
  }} as Json;
  return {
    title,slug:raw.slug,date,body,
    format:raw.editorialType,
    section:raw.editorialType === "podcast" ? "media" as const : "analysis" as const,
    excerpt:String(raw.excerpt??"").slice(0,500)||null,
    originalUrl:source.href,
    wpId:raw.legacyId,
  };
}

/** Import complete original articles only, never publish, never overwrite. */
export async function importLegacyDrafts(items: LegacyImportPost[]): Promise<LegacyImportOutcome> {
  const { supabase, userId } = await requireAdmin();
  if (!Array.isArray(items) || items.length < 1 || items.length > 10)
    throw Error("يمكن نقل 1 إلى 10 مواد في الدفعة الواحدة.");
  const result:LegacyImportOutcome={imported:[],skipped:[],failed:[]};
  const seen=new Set<string>();

  for (const raw of items) {
    const label=String(raw?.title??"مادة غير معروفة").slice(0,160);
    try {
      const item=validate(raw);
      if (seen.has(item.slug)) {result.skipped.push({title:label,reason:"مكرر في الدفعة"});continue;}
      seen.add(item.slug);
      const {data:exists,error:readError}=await supabase.from("content_items").select("id").eq("slug",item.slug).maybeSingle();
      if(readError)throw Error("تعذر التحقق من التكرارات.");
      if(exists){result.skipped.push({title:label,reason:"موجود سابقًا"});continue;}

      // Preserve the original publication DAY; WordPress export timezone may vary.
      const {data:created,error:saveError}=await supabase.from("content_items").insert({
        title:item.title,slug:item.slug,format:item.format,section:item.section,
        excerpt:item.excerpt,body:item.body,status:"draft",is_featured:false,
        published_at:item.date+"T12:00:00+03:00",created_by:userId,updated_by:userId,
      }).select("id").single();
      if(saveError||!created)throw Error("تعذر إنشاء المسودة: "+(saveError?.message??""));

      const {data:sourceExisting,error:sourceReadError}=await supabase.from("content_sources")
        .select("id").eq("source_url",item.originalUrl).limit(1).maybeSingle();
      if(sourceReadError)throw Error("حُفظت المسودة لكن تعذر فحص مصدرها.");
      let sourceId=sourceExisting?.id;
      if(!sourceId){
        const {data:source,error:sourceError}=await supabase.from("content_sources").insert({
          source_type:"other",source_name:"أرشيف ساس — النسخة الأصلية",
          source_url:item.originalUrl,source_reference:"WP:"+item.wpId,
          publication_date:item.date,created_by:userId,
          attribution_note:"رابط أرشيفي للمادة الأصلية، وليس تحققًا مستقلًا من مضمونها.",
        }).select("id").single();
        if(sourceError||!source)throw Error("حُفظت المسودة لكن تعذر إضافة رابطها الأصلي.");
        sourceId=source.id;
      }
      const {error:linkError}=await supabase.from("content_source_links").insert({
        content_id:created.id,source_id:sourceId,source_role:"reference",
        display_order:0,attribution_text:"أصل المادة في ساس القديم",
      });
      if(linkError)throw Error("حُفظت المسودة لكن تعذر ربط مصدرها.");
      result.imported.push({title:label,id:created.id});
    }catch(error){
      result.failed.push({title:label,reason:error instanceof Error?error.message:"خطأ غير معروف"});
    }
  }
  revalidatePath("/admin/content");
  return result;
}
