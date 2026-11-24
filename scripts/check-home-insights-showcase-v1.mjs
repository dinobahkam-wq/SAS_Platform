import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync("src/app/page.tsx", "utf8");
const view = readFileSync("src/components/home-insights-showcase.tsx", "utf8");
const css = readFileSync("src/components/home-insights-showcase.css", "utf8");

test("homepage renders the new editorial studies module instead of the old rail", () => {
  assert.match(page, /<HomeInsightsShowcase items=\{insights\} \/>/);
  assert.doesNotMatch(page, /<KnowledgeRail title="أحدث التحليلات والدراسات"/);
  assert.match(page, /getPublishedContent\(\{ section: "research", limit: 12 \}\)/);
  assert.match(page, /getPublishedContent\(\{ section: "analysis", limit: 12 \}\)/);
});
test("featured and secondary cards use real published content and canonical links", () => {
  assert.match(view, /const \[featured, \.\.\.rest\] = items/);
  assert.match(view, /rest\.slice\(0, 2\)/);
  assert.match(view, /item\.cover_url/);
  assert.match(view, /item\.title/);
  assert.match(view, /item\.excerpt/);
  assert.match(view, /encodeURIComponent\(item\.slug\)/);
  assert.match(view, /formatLabel\(item\.format\)/);
});
test("responsive and accessible research layout", () => {
  assert.match(css, /@media \(max-width: 850px\)/);
  assert.match(css, /@media \(max-width: 600px\)/);
  assert.match(css, /@media \(max-width: 360px\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /focus-visible/);
  assert.match(view, /aria-label="أحدث التحليلات والدراسات"/);
});
