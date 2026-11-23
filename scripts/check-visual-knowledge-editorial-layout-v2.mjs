import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const home = read("src/app/page.tsx");
const landing = read("src/app/visual-knowledge/page.tsx");
const gateway = read("src/components/visual-knowledge-portal.tsx");
const gatewayStyle = read("src/components/visual-knowledge-portal.css");
const gallery = read("src/components/visual-knowledge-gallery.tsx");
const galleryStyle = read("src/components/visual-knowledge-gallery.css");
const retiredCivic = read("src/app/visual-knowledge/state-and-government/page.tsx");
const retiredTimeline = read("src/app/visual-knowledge/yemen-crisis-timeline/page.tsx");

test("homepage is a product gateway without individual visual publications", () => {
  assert.match(home, /<VisualKnowledgePortal \/>/);
  assert.doesNotMatch(home, /<VisualKnowledgeEditorial/);
  assert.doesNotMatch(home, /<VisualKnowledgeGallery/);
  assert.doesNotMatch(home, /const visual = media.filter/);
  assert.match(gateway, /href="\/visual-knowledge"/);
  assert.match(gateway, /استكشف المعرض/);
  assert.doesNotMatch(gateway, /item.cover_url|item.title|published_at/);
  assert.match(gatewayStyle, /\.sas-vkp-illustration-card--map/);
  assert.match(gatewayStyle, /\.sas-vkp-illustration-card--chart/);
});

test("visual section is a published-only gallery with dynamic search filtering and sorting", () => {
  assert.match(landing, /<VisualKnowledgeGallery items=\{items\}/);
  assert.match(landing, /getPublishedContent\(\{ section: "media", limit: 48 \}\)/);
  assert.match(landing, /item.format === "infographic"/);
  assert.match(gallery, /useMemo/);
  assert.match(gallery, /type="search"/);
  assert.match(gallery, /aria-pressed=\{filter === option.value\}/);
  assert.match(gallery, /setSort/);
  assert.match(gallery, /results.map\(item =>/);
  assert.match(gallery, /encodeURIComponent\(item.slug\)/);
  assert.match(gallery, /item.cover_url/);
  assert.match(gallery, /عرض الصورة/);
  assert.match(gallery, /noopener noreferrer/);
});

test("gallery responsive accessibility and legacy unpublished routes", () => {
  assert.match(galleryStyle, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(galleryStyle, /@media\(max-width:650px\)/);
  assert.match(galleryStyle, /prefers-reduced-motion/);
  assert.match(galleryStyle, /focus-visible/);
  assert.match(gatewayStyle, /@media\(max-width:760px\)/);
  assert.match(retiredCivic, /notFound\(\)/);
  assert.match(retiredTimeline, /notFound\(\)/);
});
