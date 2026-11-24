import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const showcase=readFileSync("src/components/home-briefing-showcase.tsx","utf8");
const layout=readFileSync("src/components/home-briefing-showcase.css","utf8");
const ticker=readFileSync("src/components/home-briefing-rotating-copy.tsx","utf8");
const css=readFileSync("src/components/home-briefing-rotating-copy.css","utf8");

test("published edition headlines are displayed in a full-width footer rather than the narrow main column",()=>{
  assert.match(showcase,/const tickerHeadlines = prioritizeBriefingDevelopments\(briefing\?\.developments \?\? \[\]\)/);
  assert.match(showcase,/title: item\.headline_ar/);
  assert.match(showcase,/#sas-development-/);
  assert.match(showcase,/className="sas-home-briefing-ticker-footer"/);
  assert.match(showcase,/<HomeBriefingRotatingCopy headlines=\{tickerHeadlines\} \/>/);
  assert.match(layout,/\.sas-home-briefing-feature > \.sas-home-briefing-ticker-footer/);
  assert.match(layout,/grid-column:1 \/ -1/);
  assert.match(layout,/grid-row:4/);
  assert.match(ticker,/أهم الأنباء/);
});
test("full news headline remains readable in multiline without clipping or ellipses",()=>{
  assert.match(css,/white-space:normal/);
  assert.match(css,/overflow-wrap:anywhere/);
  assert.doesNotMatch(css,/text-overflow:ellipsis/);
  assert.doesNotMatch(css,/white-space:nowrap;\s*padding:8px 16px/);
  assert.match(ticker,/dimensions\.width/);
  assert.match(ticker,/dimensions\.height/);
  assert.match(ticker,/Math\.ceil\(rect\.height\) \+ 16/);
  assert.match(ticker,/ResizeObserver/);
});
test("turquoise capsule transitions quickly with content-sized reading intervals",()=>{
  assert.match(css,/transition:width \.48s/);
  assert.match(css,/height \.48s/);
  assert.match(ticker,/readingDuration\(active\.title\)/);
  assert.match(ticker,/onMouseEnter=\{\(\) => setPaused\(true\)\}/);
  assert.match(ticker,/onFocusCapture/);
  assert.match(ticker,/prefers-reduced-motion: reduce/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(css,/@media\(max-width:600px\)/);
});
