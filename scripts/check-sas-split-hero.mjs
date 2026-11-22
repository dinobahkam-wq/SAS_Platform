import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync, existsSync} from "node:fs";
const read=(path)=>readFileSync(path,"utf8");
const page=read("src/app/page.tsx");
const layout=read("src/app/layout.tsx");
const css=read("src/app/sas-split-hero.css");
const rotator=read("src/components/sas-hero-rotator.tsx");
test("the single hero card has a separate decorative left image and a semantic right copy column",()=>{
  assert.match(page,/sas-mukalla-hero sas-split-hero site-container/);
  assert.match(page,/<div className="sas-hero-visual" aria-hidden="true" \/>/);
  assert.ok(page.indexOf('className="sas-hero-visual"')<page.indexOf('className="home-intro-copy"'));
  assert.match(page,/مِن الخَبر، <em>إِلى المعرِفَة<\/em>/);
  assert.match(page,/استعرض الإحاطة اليومية/);
  assert.match(page,/التحليل والدراسات/);
  assert.ok(existsSync("public/sa.webp.png"));
  assert.match(css,/url\("\/sa\.webp\.png"\)/);
  assert.match(css,/inset: 0 auto 0 0;/);
  assert.match(css,/width: 59%/);
  assert.match(css,/\.sas-hero-visual::after/);
  assert.match(css,/linear-gradient\(to right/);
  assert.match(css,/--hero-card-paper/);
});
test("split styles load after original backgrounds and remain strictly scoped to hero",()=>{
  assert.ok(layout.indexOf('import "./mukalla-home-hero.css"')<layout.indexOf('import "./sas-split-hero.css"'));
  assert.match(css,/\.public-site \.home-brand-hero\.sas-mukalla-hero\.sas-split-hero/);
  assert.match(css,/\.home-brand-hero\.sas-split-hero::before/);
  assert.match(css,/content: none/);
  assert.match(css,/background: var\(--hero-card-paper\) !important/);
});
test("mobile composition places image above content and fades vertically into the same card",()=>{
  assert.match(css,/@media \(max-width: 760px\)/);
  assert.match(css,/\.sas-hero-visual \{[\s\S]*?position: relative;/);
  assert.match(css,/linear-gradient\(to bottom/);
  assert.match(css,/height: clamp\(215px, 58vw, 320px\)/);
  assert.match(css,/@media \(max-width: 390px\)/);
  assert.match(css,/html\[data-theme="dark"\]/);
  assert.match(css,/prefers-reduced-motion/);
  assert.match(css,/@media print/);
});

test("rotator uses the approved first frame and the five optional editorial frames",()=>{
  assert.match(rotator,/\/sa\.webp\.png/);
  for(let i=12;i<=16;i++) assert.ok(rotator.includes(`/${i}.webp`));
  assert.match(rotator,/Promise\.all/);
  assert.match(rotator,/img\.onerror/);
  assert.match(rotator,/6500/);
  assert.match(rotator,/prefers-reduced-motion/);
  assert.match(css,/\.sas-hero-rotator-frame\.is-active/);
  assert.match(css,/opacity 1100ms ease-in-out/);
});
