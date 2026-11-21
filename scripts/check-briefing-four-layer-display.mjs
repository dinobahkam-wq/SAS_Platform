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

test("fixed reference board comes before priorities and chronological ledger", () => {
  assert.match(page, /briefing-edition-header/);
  const indicators=page.indexOf('className="sas-fixed-reference-panel"');
  const body=page.indexOf("<BriefingEditionBody");
  assert.ok(indicators>0 && indicators<body);
  assert.doesNotMatch(page, /<details className="sas-briefing-supplement">/);
  const priority=bodySource.indexOf('id="sas-priorities-title"');
  const ledger=bodySource.indexOf('id="briefing-developments-title"');
  assert.ok(priority>0 && priority<ledger);
  assert.doesNotMatch(bodySource, /sas-scene-title|executiveSummary/);
  assert.match(bodySource, /لا توجد في هذا العدد درجات أولوية مسجلة/);
  assert.match(bodySource, /id=\{\`sas-development-/);
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

test("historic snapshots remain immutable; indicators remain fixed also in print", () => {
  assert.match(page, /<BriefingEditionBody/);
  assert.match(page, /className="sas-fixed-reference-panel"/);
  assert.doesNotMatch(page, /supabase\.from\(|published_snapshot|\.update\(/);
  assert.match(reference,/لا تُحذف هذه الحقول أو/);
  assert.doesNotMatch(printPage,/المشهد في دقيقة|executiveSummary/);
  assert.match(printPage,/مؤشرات العدد والبيانات المرجعية/);
  assert.ok(printPage.indexOf('className="sas-print-reference"') < printPage.indexOf('className="sas-print-priorities"'));
  assert.match(printPage,/أهم التطورات/);
});

test("priority entries show multiple source/issuer logos while numbering remains stable under filters", () => {
  assert.match(body, /function developmentIdentityMarks/);
  assert.match(body, /issuer_identity_id/);
  assert.match(body, /publisher_identity_id/);
  assert.match(body, /development\.sources/);
  assert.match(body, /new Set<string>/);
  assert.match(body, /<BriefingIdentityMarks development=\{development\} compact\/>/);
  assert.match(body, /String\(development\.order \+ 1\)/);
});
