import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read = p => readFileSync(p,"utf8");
const page=read("src/app/page.tsx");
const layout=read("src/app/layout.tsx");
const css=read("src/app/mukalla-home-hero.css");
test("homepage uses the approved Seiyun palace image from the repository without replacing the branded slogan",()=>{
  assert.match(page,/home-brand-hero sas-mukalla-hero/);
  assert.match(page,/مِن الخَبر، <em>إِلى المعرِفَة<\/em>/);
  assert.match(css,/url\("\/syuwan\.jfif"\)/);
  const img=readFileSync("public/syuwan.jfif");
  assert.ok(img.length > 25_000, "approved asset must be checked in");
  assert.equal(img[0],0xff);
  assert.equal(img[1],0xd8);
});
test("dedicated hero CSS is loaded last; city image remains decorative beneath semantic text",()=>{
  assert.ok(layout.indexOf('import "./mobile-polish.css"') < layout.indexOf('import "./mukalla-home-hero.css"'));
  assert.match(css,/\.home-brand-hero\.sas-mukalla-hero::before/);
  assert.match(css,/z-index: 0/);
  assert.match(css,/\.home-intro-copy \{[\s\S]*?z-index: 2/);
  assert.match(css,/@media \(max-width: 760px\)/);
  assert.match(css,/@media \(max-width: 390px\)/);
  assert.match(css,/html\[data-theme="dark"\]/);
  assert.match(css,/@media print/);
  assert.doesNotMatch(page,/<img src="\/Mukalla.webp"/);
});
test("mobile positioning preserves readable CTAs and reduced motion",()=>{
  assert.match(css,/background-position: 48% 45%/);
  assert.match(css,/mask-image: linear-gradient/);
  assert.match(css,/animation: none/);
  assert.match(css,/\.home-compact-actions/);
  assert.match(page,/استعرض الإحاطة اليومية/);
  assert.match(page,/التحليل والدراسات/);
});
