import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const jsx = readFileSync("src/components/home-briefing-showcase.tsx", "utf8");
const css = readFileSync("src/components/home-briefing-showcase.css", "utf8");
const asset = readFileSync("public/17.webp");

test("permanent Mukalla hero art is real WebP and scoped to the flagship card", () => {
  assert.equal(asset.subarray(0, 4).toString("ascii"), "RIFF");
  assert.equal(asset.subarray(8, 12).toString("ascii"), "WEBP");
  assert.match(css, /url\("\/17\.webp"\)/);
  assert.match(css, /\.sas-home-briefing-art-photo/);
  assert.match(css, /grayscale\(100%\)/);
  assert.match(jsx, /className="sas-home-briefing-art"/);
});

test("edition metadata, source-backed counts, summary and archive links remain dynamic", () => {
  assert.match(jsx, /latest\.edition_no/);
  assert.match(jsx, /formatBriefingDateOnly\(latest\.edition_date\)/);
  assert.match(jsx, /briefing\?\.developments\.length/);
  assert.match(jsx, /briefing\?\.executiveSummary\.length/);
  assert.match(jsx, /highlights\.map/);
  assert.match(jsx, /previous\.map/);
  assert.match(jsx, /href=\{href\}/);
  assert.match(css, /@media \(max-width: 850px\)/);
  assert.match(css, /@media \(max-width: 600px\)/);
});


test("homepage previews the first three public developments with their own thumbnails", () => {
  assert.match(jsx, /prioritizeBriefingDevelopments\(briefing\?\.developments \?\? \[\]\)\.slice\(0, 3\)/);
  assert.match(jsx, /item\.image \?/);
  assert.match(jsx, /src=\{item\.image\.url\}/);
  assert.match(jsx, /item\.headline_ar/);
  assert.match(jsx, /item\.summary_ar/);
  assert.match(jsx, /#sas-development-/);
  assert.match(css, /\.sas-home-briefing-story-photo/);
  assert.match(css, /object-fit: cover/);
});
test("new visual hierarchy and motion respect small screens and reduced-motion settings", () => {
  assert.match(css, /@keyframes sasBriefingSheen/);
  assert.match(css, /@keyframes sasBriefingAccent/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /@media \(max-width: 600px\)/);
  assert.match(css, /\.sas-home-briefing-art \{/);
});
