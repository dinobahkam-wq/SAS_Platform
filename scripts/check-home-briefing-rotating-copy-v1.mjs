import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const showcase = readFileSync("src/components/home-briefing-showcase.tsx","utf8");
const ticker = readFileSync("src/components/home-briefing-rotating-copy.tsx","utf8");
const css = readFileSync("src/components/home-briefing-rotating-copy.css","utf8");

test("news ticker draws headlines and links from the published edition only", () => {
  assert.match(showcase, /const tickerHeadlines = prioritizeBriefingDevelopments\(briefing\?\.developments \?\? \[\]\)/);
  assert.match(showcase, /title: item\.headline_ar/);
  assert.match(showcase, /#sas-development-/);
  assert.match(showcase, /<HomeBriefingRotatingCopy headlines=\{tickerHeadlines\} \/>/);
  assert.match(ticker, /headlines: BriefingTickerHeadline\[\]/);
  assert.match(ticker, /أهم الأنباء/);
  assert.doesNotMatch(ticker, /رصد يومي للتطورات|وقائع موثقة بمصادرها|قراءة للسياق والتحولات/);
});
test("highlight capsule expands and shrinks to measured Arabic headline text", () => {
  assert.match(ticker, /getBoundingClientRect\(\)\.width/);
  assert.match(ticker, /ResizeObserver/);
  assert.match(ticker, /measuredWidth \+ 28/);
  assert.match(css, /transition:width/);
  assert.match(css, /text-overflow:ellipsis/);
  assert.match(css, /@media\(max-width:600px\)/);
  assert.match(ticker, /INTERVAL_MS = 4800/);
  assert.match(ticker, /prefers-reduced-motion: reduce/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});
