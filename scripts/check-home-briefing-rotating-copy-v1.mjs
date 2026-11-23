import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const showcase = readFileSync("src/components/home-briefing-showcase.tsx", "utf8");
const copy = readFileSync("src/components/home-briefing-rotating-copy.tsx", "utf8");
const style = readFileSync("src/components/home-briefing-rotating-copy.css", "utf8");

test("editorial rotating text stays separate from the actual edition headline and development data", () => {
  assert.match(showcase, /<HomeBriefingRotatingCopy \/>/);
  assert.match(showcase, /latest\.edition_date/);
  assert.match(showcase, /item\.headline_ar/);
  assert.match(showcase, /item\.image\.url/);
  assert.match(copy, /رصد يومي للتطورات/);
  assert.match(copy, /وقائع موثقة بمصادرها/);
  assert.match(copy, /قراءة للسياق والتحولات/);
  assert.match(copy, /اليمن أولًا ومحيطه/);
});
test("rotation loops safely without character splitting or width shifts", () => {
  assert.match(copy, /animationDelay: `\$\{index \* 4\}s`/);
  assert.match(style, /animation: sasBriefingPhraseTurn 16s/);
  assert.match(style, /infinite both/);
  assert.match(style, /\.sas-home-briefing-rotating-stage/);
  assert.match(style, /overflow: hidden/);
  assert.match(style, /prefers-reduced-motion: reduce/);
  assert.match(copy, /aria-hidden="true"/);
});
