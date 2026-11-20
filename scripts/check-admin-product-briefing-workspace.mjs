import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { productForContent, adminEditorialProducts, newEditorialFormats } from "../src/lib/admin-products.ts";

const read = path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const sidebar=read("src/components/admin-shell.tsx");
const dashboard=read("src/app/admin/page.tsx");
const content=read("src/app/admin/content/page.tsx");
const form=read("src/components/content-form.tsx");
const archive=read("src/app/admin/briefings/page.tsx");
const detail=read("src/app/admin/briefings/[slug]/page.tsx");
const transfer=read("src/app/admin/news-studio/briefing/[slug]/[order]/page.tsx");
const runner=read("scripts/verify-briefing-release.ps1");

test("editorial mapping reflects current SAS products without destructive schema changes",()=>{
  assert.deepEqual(adminEditorialProducts.map(x=>x.id),["analysis","visual","programs","legacy"]);
  assert.equal(productForContent("news","news_brief"),"legacy");
  assert.equal(productForContent("analysis","opinion"),"legacy");
  assert.equal(productForContent("analysis","analysis"),"analysis");
  assert.equal(productForContent("research","policy_brief"),"analysis");
  assert.equal(productForContent("media","infographic"),"visual");
  assert.equal(productForContent("media","photo_gallery"),"visual");
  assert.equal(productForContent("media","video"),"programs");
  assert.equal(productForContent("media","podcast"),"programs");
  assert.ok(!newEditorialFormats.some(x=>x.section==="news"||x.format==="opinion"));
});

test("sidebar and dashboard prioritize four products and News Studio",()=>{
  assert.match(sidebar,/href: "\/admin\/briefings"/);
  assert.match(sidebar,/href: "\/admin\/content\?product=analysis"/);
  assert.match(sidebar,/href: "\/admin\/content\?product=visual"/);
  assert.match(sidebar,/href: "\/admin\/content\?product=programs"/);
  assert.match(sidebar,/href: "\/admin\/news-studio"/);
  assert.match(sidebar,/supportNavigation/);
  assert.match(dashboard,/الإحاطة اليومية/);
  assert.match(dashboard,/التحليل والدراسات/);
  assert.match(dashboard,/المعرفة البصرية/);
  assert.match(dashboard,/الفيديو والبرامج/);
  assert.match(dashboard,/getPublicBriefingArchive/);
  assert.match(dashboard,/count:"exact"/);
});

test("legacy CMS is retained only as archive and forms no longer suggest obsolete content types",()=>{
  assert.match(content,/productForContent/);
  assert.match(content,/product==="legacy"/);
  assert.match(content,/href="\/admin\/briefings"/);
  assert.doesNotMatch(content,/label: "الأخبار"/);
  assert.doesNotMatch(content,/label: "التحليل والرأي"/);
  assert.match(form,/newEditorialFormats/);
  assert.match(form,/initial\?\.section==="news"/);
  assert.match(form,/useState/);
  assert.match(form,/setActiveFormat/);
});

test("briefing management requires admin and uses published snapshot rather than content_items",()=>{
  assert.match(archive,/await requireAdmin\(\)/);
  assert.match(archive,/getPublicBriefingArchive\(50\)/);
  assert.match(detail,/await requireAdmin\(\)/);
  assert.match(detail,/getPublicBriefing\(slug\)/);
  assert.match(detail,/prioritizeBriefingDevelopments/);
  assert.match(detail,/\.map\(item=>/);
  assert.match(detail,/href=\{transferUrl\}/);
  assert.match(detail,/revision\.revision_no/);
  assert.match(detail,/item\.order/);
  assert.match(detail,/item\.sources/);
  assert.match(detail,/searchParams/);
  assert.match(transfer,/await requireAdmin\(\)/);
  assert.match(transfer,/createBriefingStudioTransfer/);
  assert.match(transfer,/briefing\.revision\.revision_no !== expectedRevision/);
  assert.doesNotMatch(detail,/\.from\("content_items"\)/);
});

test("new admin regression runs inside the release gate",()=>{
  assert.match(runner,/check-admin-product-briefing-workspace\.mjs/);
  assert.match(runner,/feat\/admin-product-workspace-briefing-studio-v1/);
});
