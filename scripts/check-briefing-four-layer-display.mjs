import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = path => readFileSync(path,"utf8");
const bodySource = read("src/components/briefing-edition-body.tsx");
const body = bodySource;
const page = read("src/app/briefings/[slug]/page.tsx");
const styles = read("src/components/sas-identity.css");
const printPage = read("src/app/briefings/[slug]/print/page.tsx");
const printStyles = read("src/app/briefings/[slug]/print/print.css");
const reference = read("docs/SAS_DAILY_BRIEFING_EDITORIAL_STANDARD_v1_3_AMENDMENT.md");

test("fixed indicators precede the only numbered developments ledger", () => {
 assert.match(page,/briefing-edition-header/);
 assert.ok(page.indexOf('className="sas-fixed-reference-panel"') < page.indexOf("<BriefingEditionBody"));
 assert.doesNotMatch(page,/<details className="sas-briefing-supplement">/);
 assert.match(body,/id="briefing-developments-title"/);
 assert.doesNotMatch(body,/sas-priorities-title|sas-priority-layer|sas-scene-title|executiveSummary/);
 assert.match(body,/02 · السجل التفصيلي/);
 assert.match(body,/String\(development\.order \+ 1\)/);
});
test("remove all standalone interpretation fields from public and print displays without deleting stored data", () => {
  assert.doesNotMatch(body, /السياق والدلالة|development\.context_ar|development\.why_it_matters_ar|development\.what_changed_ar/);
  assert.doesNotMatch(printPage, /development\.context_ar|development\.why_it_matters_ar|development\.what_changed_ar|revision\.analysis_ar/);
  assert.doesNotMatch(page, /revision\.analysis_ar/);
  const parser = read("src/lib/public-briefing.ts");
  for (const preserved of ["analysis_ar","context_ar","why_it_matters_ar","what_changed_ar"]) assert.match(parser,new RegExp(preserved));
});

test("color precedence uses explicitly recorded critical first, then official, regional and international", () => {
  const critical = body.indexOf('if (development.priority_level === "critical") return "critical"');
  const official = body.indexOf('if (isOfficialStatement(development)) return "official"');
  const regional = body.indexOf('if (development.geographic_scope === "regional") return "regional"');
  const international = body.indexOf('issuer?.kind === "international"');
  assert.ok(critical >= 0 && critical < official && official < regional && regional < international);
  for(const tone of ["critical","official","regional","international","neutral"]) assert.match(styles,new RegExp("sas-tone-"+tone));
  for (const value of ["#fff1f0","#eaf6ee","#fff3d6","#eaf2ff"]) assert.ok(styles.toLowerCase().includes(value));
  assert.match(styles,/sas-tone-bg/);
  assert.match(styles,/data-theme="dark"/);
  assert.match(printStyles,/print-color-adjust:exact/);
});

test("historic snapshots stay immutable; print shows no separate highlights", () => {
 assert.match(page,/<BriefingEditionBody/);
 assert.doesNotMatch(page,/published_snapshot|\.update\(/);
 assert.match(reference,/لا تُحذف هذه الحقول أو/);
 assert.doesNotMatch(printPage,/sas-print-priorities|المشهد في دقيقة|<h2>أهم التطورات<\/h2>/);
 assert.ok(printPage.indexOf('className="sas-print-reference"') < printPage.indexOf('className="briefing-print-developments"'));
});
test("visual registry has first-party SPA logo distinct from Saudi government emblem",()=>{
 const identities=read("src/lib/visual-identities.ts");
 assert.match(identities,/id:"sa-spa"/);
 assert.match(identities,/WAS_saudi_press_agency\.png/);
 assert.doesNotMatch(identities,/kind:"government".+aliases:\[[^\]]*وكالة الأنباء السعودية/);
});
test("development entries support multiple source/issuer logos and stable numbers", () => {
  assert.match(body, /function developmentIdentityMarks/);
  assert.match(body, /issuer_identity_id/);
  assert.match(body, /publisher_identity_id/);
  assert.match(body, /development\.sources/);
  assert.match(body, /new Set<string>/);
  assert.match(body, /<BriefingIdentityMarks development=\{development\}\/>/);
  assert.match(body, /String\(development\.order \+ 1\)/);
});
