"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { allVisualAssets } from "@/lib/visual-identities";

export type EditorialSaveState = { ok: boolean; message: string };
const allowedPriority = new Set(["", "critical", "high", "standard"]);
const allowedRelevance = new Set(["", "direct", "regional", "strategic"]);
const allowedIdentity = new Set(allVisualAssets.map((item) => item.id));
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function saveBriefingEditorialMetadata(
  _previous: EditorialSaveState,
  form: FormData,
): Promise<EditorialSaveState> {
  const { supabase, userId } = await requireAdmin();
  const id = String(form.get("id") ?? "");
  const priority = String(form.get("priority") ?? "");
  const relevance = String(form.get("relevance") ?? "");
  const issuer = String(form.get("issuer") ?? "");
  const publisher = String(form.get("publisher") ?? "");
  const note = String(form.get("note") ?? "").trim();

  if (!uuidPattern.test(id)) return { ok: false, message: "معرّف التطور غير صالح." };
  if (!allowedPriority.has(priority) || !allowedRelevance.has(relevance))
    return { ok: false, message: "قيمة الأولوية أو نوع الارتباط غير معتمدة." };
  if ((issuer && !allowedIdentity.has(issuer)) || (publisher && !allowedIdentity.has(publisher)))
    return { ok: false, message: "يجب اختيار هوية موجودة في المكتبة المعتمدة." };
  if (note.length > 1800) return { ok: false, message: "الملاحظة التحريرية طويلة جداً." };
  if (relevance && !note)
    return { ok: false, message: "اذكر مسار التأثير في اليمن ودليله قبل اعتماد تصنيف الارتباط." };

  const { data: record, error: readError } = await supabase.from("briefing_developments")
    .select("id,status").eq("id", id).maybeSingle();
  if (readError || !record) return { ok: false, message: "تعذر قراءة التطور أو التحقق من صلاحياته." };
  if (record.status === "archived") return { ok: false, message: "التطور مؤرشف ولا يقبل التعديل." };

  const { data: protectedItems, error: lockError } = await supabase.from("briefing_edition_items")
    .select("revision_id,briefing_revisions!inner(status)")
    .eq("development_id", id)
    .in("briefing_revisions.status", ["in_review", "approved", "published"])
    .limit(1);
  // Lock awareness is advisory here; database triggers remain the final enforcement.
  if (lockError) return { ok: false, message: "تعذر التحقق من حالة المراجعات المرتبطة. لم يُحفظ شيء." };
  if (protectedItems?.length) return { ok: false, message: "التطور مرتبط بمراجعة محمية؛ أنشئ تصحيحاً تحريرياً بدلاً من تعديلها مباشرة." };

  const { error } = await supabase.from("briefing_developments").update({
    priority_level: priority || null,
    yemen_relevance: relevance || null,
    issuer_identity_id: issuer || null,
    publisher_identity_id: publisher || null,
    editorial_impact_note_ar: note || null,
    updated_by: userId,
  }).eq("id", id);
  if (error) {
    console.error("[sas briefing editorial metadata]", error.code);
    return { ok: false, message: "تعذر حفظ البيانات. تأكد من تطبيق ترحيل قاعدة البيانات وعدم قفل التطور." };
  }
  revalidatePath("/admin/briefings/editorial");
  return { ok: true, message: "حُفظت التصنيفات في سجل التطور. لا تؤدي هذه العملية إلى نشر الإحاطة." };
}
