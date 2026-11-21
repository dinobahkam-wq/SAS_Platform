import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=p=>readFileSync(p,"utf8");
const page=read("src/app/page.tsx");
const css=read("src/app/home-editorial-trial.css");
const layout=read("src/app/layout.tsx");
test("trial uses original SAS products and slogan without importing Thmanyah assets",()=>{
  assert.match(page,/className="public-site sas-editorial-home"/);
  for(const t of ["مِن الخَبر","الإحاطة اليومية","التحليل والدراسات","المعرفة البصرية","الفيديو والبرامج"])assert.ok(page.includes(t),t);
  assert.match(css,/\/syuwan\.jfif/);
  assert.doesNotMatch(css,/thmanyah\.com|banner-lg\.jpg|\/ثمانية_files\//);
});
test("visual experiment is isolated to the home page and responsive",()=>{
  assert.match(layout,/import "\.\/home-editorial-trial\.css"/);
  assert.ok(layout.indexOf('import "./mukalla-home-hero.css"')<layout.indexOf('import "./home-editorial-trial.css"'));
  assert.match(css,/\.public-site\.sas-editorial-home/);
  assert.match(css,/@media \(max-width: 760px\)/);
  assert.match(css,/@media \(max-width: 1024px\)/);
  assert.match(css,/html\[data-theme="dark"\]/);
  assert.match(css,/prefers-reduced-motion/);
});
