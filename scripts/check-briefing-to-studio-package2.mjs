import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createBriefingStudioTransfer } from "../src/lib/briefing-studio-transfer.ts";

const repo = (file) => readFileSync(new URL("../" + file, import.meta.url), "utf8");

function example() {
  return {
    edition: { slug: "daily-briefing-2026-11-14", edition_no: 3, edition_date: "2026-11-14", edition_type: "daily", status: "active" },
    revision: { revision_no: 2, published_at: "2026-11-14T20:00:00Z" },
    developments: [
      {
        order: 0, headline_ar: "تطور منسوب إلى جهة رسمية", summary_ar: "أعلنت الجهة عن موقف ولم يُتحقق مستقلًا من النتائج.",
        category: "security", information_class: "claim", verification_status: "attributed",
        verification_note_ar: "نقل عن بيان رسمي", occurred_on: "2026-11-13",
        occurred_at: null, location_text: "تعز", sources: [
          { source_name: "وسيلة إعلام", source_url: "https://example.com/report", source_role: "supporting", source_title: null, attribution_note: null },
          { source_name: "الجهة الأصلية", source_url: "https://example.com/statement", source_role: "primary", source_title: "البيان الرسمي", attribution_note: "ادعاء منسوب" },
        ],
      },
      {
        order: 4, headline_ar: "تطور آخر", summary_ar: "تقرير إنساني",
        category: "humanitarian", information_class: "fact", verification_status: "verified",
        verification_note_ar: null, occurred_on: null, occurred_at: null, location_text: null, sources: [],
      },
    ],
  };
}

test("prefill is derived only from published snapshot and retains all source references", () => {
  const input = example();
  const untouched = structuredClone(input);
  const result = createBriefingStudioTransfer(input, 0, 2);
  assert.ok(result);
  assert.equal(result.prefill.headline, input.developments[0].headline_ar);
  assert.equal(result.prefill.summary, input.developments[0].summary_ar);
  assert.equal(result.prefill.sourceName, "الجهة الأصلية");
  assert.equal(result.prefill.sourceUrl, "https://example.com/statement");
  assert.equal(result.prefill.date, "2026/11/13");
  assert.equal(result.prefill.design.format, "square");
  assert.equal(result.origin.informationClass, "claim");
  assert.equal(result.origin.verificationStatus, "attributed");
  assert.equal(result.origin.revisionNo, 2);
  assert.equal(result.origin.sources.length, 2);
  assert.equal(result.origin.dateBasis, "event");
  assert.deepEqual(input, untouched);
});

test("date fallback is explicitly labelled as edition date, not event date", () => {
  const result = createBriefingStudioTransfer(example(), 4, 2);
  assert.ok(result);
  assert.equal(result.prefill.date, "2026/11/14");
  assert.equal(result.origin.eventDate, null);
  assert.equal(result.origin.dateBasis, "edition");
  assert.deepEqual(result.origin.sources, []);
});

test("stale, invalid, missing, withdrawn and unpublished editions are rejected", () => {
  const base = example();
  for (const order of [-1, 1, 2.5, Number.NaN]) {
    assert.equal(createBriefingStudioTransfer(base, order, 2), null);
  }
  for (const revision of [1, 0, 3, Number.NaN]) {
    assert.equal(createBriefingStudioTransfer(base, 0, revision), null);
  }
  const withdrawn = example(); withdrawn.edition.status = "withdrawn";
  assert.equal(createBriefingStudioTransfer(withdrawn, 0, 2), null);
  const unpublished = example(); unpublished.revision.published_at = "";
  assert.equal(createBriefingStudioTransfer(unpublished, 0, 2), null);
});

test("the handoff is permission-gated and URL carries identifiers only", () => {
  const route = repo("src/app/admin/news-studio/briefing/[slug]/[order]/page.tsx");
  const publicPage = repo("src/app/briefings/[slug]/page.tsx");
  const ledger = repo("src/components/briefing-edition-body.tsx");
  const studio = repo("src/app/admin/news-studio/page.tsx");
  const permission = repo("src/lib/briefing-studio-permission.ts");
  assert.match(route, /await requireAdmin\(\)/);
  assert.match(route, /createBriefingStudioTransfer\(briefing, order, expectedRevision\)/);
  assert.match(route, /briefing\.revision\.revision_no !== expectedRevision/);
  assert.match(publicPage, /canUseNewsStudio\(\)/);
  assert.match(permission, /auth\.getClaims\(\)/);
  assert.match(permission, /\.from\("user_roles"\)/);
  assert.match(permission, /membership\?\.role === "admin"/);
  assert.match(ledger, /studioEdition \?/);
  assert.match(ledger, /encodeURIComponent\(studioEdition\.slug\)/);
  assert.match(ledger, /\?revision=\$\{studioEdition\.revisionNo\}/);
  assert.doesNotMatch(ledger, /encodeURIComponent\(development\.headline_ar\)/);
  assert.match(studio, /applyImportedNews\(initialImport\)/);
  assert.match(studio, /briefingOrigin\.verificationStatus/);
  assert.match(studio, /receivedBriefingRef/);
});
