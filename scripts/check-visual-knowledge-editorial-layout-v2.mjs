import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
const read = (p) => readFileSync(new URL("../" + p, import.meta.url), "utf8");
const home = read("src/app/page.tsx");
const landing = read("src/app/visual-knowledge/page.tsx");
const view = read("src/components/visual-knowledge-editorial.tsx");
const css = read("src/components/visual-knowledge-editorial.css");
const retiredCivic = read("src/app/visual-knowledge/state-and-government/page.tsx");
const retiredTimeline = read("src/app/visual-knowledge/yemen-crisis-timeline/page.tsx");
test("home and archive render published media rather than legacy showcase", () => {
  assert.match(home, /<VisualKnowledgeEditorial items=\{visual\}/);
  assert.match(landing, /<VisualKnowledgeEditorial items=\{items\} standalone/);
  assert.doesNotMatch(home, /<VisualKnowledgeShowcase/);
  assert.doesNotMatch(landing, /<VisualKnowledgeShowcase/);
  assert.match(home, /"infographic", "photo_gallery"/);
  assert.match(landing, /item.format === "infographic"/);
});
test("lead cover and optional secondary items use CMS links and media", () => {
  assert.match(view, /const \[lead, \.\.\.remaining\] = items/);
  assert.match(view, /item.cover_url/);
  assert.match(view, /item.title/);
  assert.match(view, /item.excerpt/);
  assert.match(view, /encodeURIComponent\(item.slug\)/);
  assert.match(css, /\.sas-vke-lead/);
  assert.match(css, /\.sas-vke-related-card/);
  assert.match(css, /object-fit:contain/);
});
test("the two historic interactive prototypes are unpublished but source code is retained", () => {
  assert.match(retiredCivic, /notFound\(\)/);
  assert.match(retiredTimeline, /notFound\(\)/);
  assert.match(css, /@media\(max-width:760px\)/);
  assert.match(css, /@media\(max-width:420px\)/);
  assert.match(css, /prefers-reduced-motion/);
});

test("the primary image action opens the actual stored image, not the article", () => {
  assert.match(view, /href=\{lead\.cover_url\}/);
  assert.match(view, /عرض الصورة/);
  assert.match(view, /target="_blank" rel="noopener noreferrer"/);
  assert.match(view, /aria-label=\{"عرض الصورة بالحجم الكامل: " \+ lead\.title\}/);
  assert.match(css, /padding-inline: clamp\(32px, 4\.1vw, 68px\)/);
  assert.match(css, /margin-bottom: clamp\(28px, 3vw, 44px\)/);
});
