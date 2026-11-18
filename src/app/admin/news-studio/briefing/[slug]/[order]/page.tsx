import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Studio from "@/app/admin/news-studio/page";
import { BriefingStudioHandoffProvider } from "@/components/briefing-studio-handoff-context";
import { requireAdmin } from "@/lib/admin";
import { briefingCategoryLabel } from "@/components/briefing-public";
import { getPublicBriefing } from "@/lib/public-briefing";
import { createBriefingStudioTransfer } from "@/lib/briefing-studio-transfer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "تحويل تطور إلى استوديو ساس",
  robots: { index: false, follow: false },
};

export default async function BriefingStudioPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; order: string }>;
  searchParams: Promise<{ revision?: string | string[] }>;
}) {
  // An independent guard in addition to the /admin layout.
  await requireAdmin();

  const { slug, order: orderText } = await params;
  const { revision: revisionQuery } = await searchParams;
  const expectedRevision = typeof revisionQuery === "string" ? Number(revisionQuery) : NaN;
  const order = /^\d+$/.test(orderText) ? Number(orderText) : NaN;
  if (!slug || slug.length > 200 || !Number.isSafeInteger(order)
      || !Number.isSafeInteger(expectedRevision) || expectedRevision < 1) {
    notFound();
  }

  const briefing = await getPublicBriefing(slug);
  if (!briefing) notFound();

  if (briefing.revision.revision_no !== expectedRevision) {
    return (
      <section className="admin-panel" aria-labelledby="briefing-stale-title">
        <h1 id="briefing-stale-title">تغير إصدار الإحاطة</h1>
        <p>نُشرت مراجعة أحدث منذ فتح رابط التحويل. أعد فتح التطور من النسخة المنشورة لتجنب إنتاج صورة من بيانات قديمة.</p>
        <Link href={"/briefings/" + encodeURIComponent(slug)}>فتح الإحاطة المحدثة</Link>
      </section>
    );
  }

  const transfer = createBriefingStudioTransfer(briefing, order, expectedRevision);
  if (!transfer) notFound();

  return (
    <BriefingStudioHandoffProvider transfer={{
      ...transfer,
      prefill: {
        ...transfer.prefill,
        category: briefingCategoryLabel(transfer.prefill.category),
      },
    }}>
      <Studio />
    </BriefingStudioHandoffProvider>
  );
}
