import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const header = read("src/components/public-site.tsx");
const search = read("src/lib/search-public.ts");
const route = read("src/app/search/page.tsx");
const css = read("src/components/site-search-cta.css");
const home = read("src/app/page.tsx");
const briefing = read("src/components/home-briefing-showcase.tsx");
const visual = read("src/components/visual-knowledge-feature.tsx");

test("public header search is linked, labeled, and remains next to theme control", () => {
  assert.match(header, /href="\/search" className="sas-header-search"/);
  assert.match(header, /aria-label="البحث في منصة ساس"/);
  assert.match(header, /<ThemeControl\s*\/>/);
  assert.match(header, /site-search-cta\.css/);
});

test("server search exposes published content only, uses safe field filters, and includes briefing plus visual knowledge", () => {
  assert.match(search, /\.eq\("status", "published"\)/);
  assert.match(search, /\.ilike\("title", pattern\)/);
  assert.match(search, /\.ilike\("excerpt", pattern\)/);
  assert.match(search, /getPublicBriefingArchive/);
  assert.match(search, /getPublicBriefing/);
  assert.match(search, /\/visual-knowledge\/state-and-government/);
  assert.match(search, /\/visual-knowledge\/yemen-crisis-timeline/);
  assert.match(search, /partialError/);
  assert.doesNotMatch(search, /\.eq\("status", "draft"\)/);
});

test("search page is usable with form, category filters, result and empty states", () => {
  assert.match(route, /role="search"/);
  assert.match(route, /method="GET" action="\/search"/);
  assert.match(route, /name="q"/);
  assert.match(route, /aria-label="تصفية نتائج البحث"/);
  assert.match(route, /role="status"/);
  assert.match(route, /sas-search-results/);
  assert.match(route, /sas-search-empty/);
  assert.match(route, /partialError/);
});

test("global CTAs share variants, keyboard focus, RTL arrows and reduced motion support", () => {
  assert.match(home, /sas-cta--primary/);
  assert.match(home, /sas-cta--secondary/);
  assert.match(briefing, /sas-home-briefing-primary-link sas-cta sas-cta--primary/);
  assert.match(visual, /sas-visual-feature-action sas-cta/);
  assert.match(visual, /M19 12H5m7 7-7-7 7-7/);
  assert.match(briefing, /M19 12H5m7 7-7-7 7-7/);
  assert.match(css, /\.sas-cta--primary/);
  assert.match(css, /\.sas-cta--secondary/);
  assert.match(css, /focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /max-width:660px/);
});
