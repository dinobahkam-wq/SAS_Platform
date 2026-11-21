import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const source=(path)=>readFileSync(path,"utf8");

test("canonical standard is linked from every agent entrypoint",()=>{
 const master=source("docs/SAS_DAILY_BRIEFING_EDITORIAL_STANDARD_CURRENT.md");
 for(const p of ["AGENTS.md","docs/project-memory/README.md"]) {
   assert.match(source(p),/SAS_DAILY_BRIEFING_EDITORIAL_STANDARD_CURRENT\.md/);
 }
 for(const phrase of ["قسمين","الاسم الرسمي","أسعار","مصدر","الصرف","الذهب","تصحيح","Vercel"]){
   assert.match(master,new RegExp(phrase,"i"),phrase);
 }
});

test("official agency logo is the publishing logo, never the government logo",()=>{
 const assets=source("src/lib/visual-identities.ts");
 const spa=assets.match(/\{ id:"sa-spa",[^\n]+/);
 const government=assets.match(/\{ id:"sa-government",[^\n]+/);
 assert.ok(spa);
 assert.ok(government);
 assert.match(spa[0],/name:"وكالة الأنباء السعودية \(واس\)"/);
 assert.match(spa[0],/WAS_saudi_press_agency\.png/);
 assert.doesNotMatch(government[0],/وكالة الأنباء السعودية|واس/);
 assert.ok(existsSync("public/icons/WAS_saudi_press_agency.png"));
 assert.match(assets,/id:"ye-saba-official"/);
 assert.doesNotMatch(assets.match(/\{ id:"ye-saba-official",[^\n]+/)?.[0]??"",/saba\.ye/);
});

test("the only public content sections are always-visible indicators then development ledger",()=>{
 const page=source("src/app/briefings/[slug]/page.tsx");
 const list=source("src/components/briefing-edition-body.tsx");
 const print=source("src/app/briefings/[slug]/print/page.tsx");
 assert.match(page,/className="sas-fixed-reference-panel"/);
 assert.match(page,/<BriefingIntelligencePanel/);
 assert.match(page,/<BriefingEditionBody/);
 assert.doesNotMatch(page,/<details className="sas-briefing-supplement">/);
 assert.doesNotMatch(list,/sas-priorities-title|<h2[^>]*>أهم التطورات/);
 assert.doesNotMatch(print,/sas-print-priorities|<h2>أهم التطورات<\/h2>/);
 assert.match(list,/id="briefing-developments-title"/);
 assert.match(list,/String\(development\.order \+ 1\)/);
});

test("Nov 21 metrics are integrated, historical, sourced and not stale fallback",()=>{
 const context=JSON.parse(source("src/data/briefings/2026-11-21.context.json"));
 const loader=source("src/lib/briefing-dated-context.ts");
 assert.match(loader,/2026-11-21/);
 assert.deepEqual(context.market.map(x=>x.id),["brent","gold"]);
 assert.equal(context.exchange_rates.rates.length,4);
 const expected=new Set(["صنعاء:USD","صنعاء:SAR","عدن:USD","عدن:SAR"]);
 assert.deepEqual(new Set(context.exchange_rates.rates.map(x=>x.city+":"+x.code)),expected);
 assert.ok(context.market.every(x=>x.as_of_date==="2026-11-20" && /^https:\/\//.test(x.source_url)));
});
