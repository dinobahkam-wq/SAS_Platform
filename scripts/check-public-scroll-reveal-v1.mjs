import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const layout = readFileSync("src/app/layout.tsx", "utf8");
const reveal = readFileSync("src/components/sas-public-scroll-reveal.tsx", "utf8");

test("sitewide reveal mounts through root layout, without editing the CMS", () => {
  assert.match(layout, /<SasPublicScrollReveal \/>/);
  assert.match(reveal, /\.public-site, \.briefing-public-site/);
  assert.doesNotMatch(reveal, /\.admin-shell|\.admin-layout|\.admin-page/);
});
test("homepage, article, visual gallery, archives and daily briefings have targeted motion", () => {
  for (const selector of [
    ".home-section", ".sas-home-briefing-feature", ".sas-insight-feature",
    ".sas-vkg-card", ".briefing-archive-card", ".briefing-edition-header",
    ".briefing-development", ".article-header", ".article-content-layout",
    ".sas-search-result", ".section-landing-intro",
  ]) assert.ok(reveal.includes(selector), "missing selector: " + selector);
});
test("animations never require hidden SSR content or external dependencies", () => {
  assert.match(reveal, /IntersectionObserver/);
  assert.match(reveal, /MutationObserver/);
  assert.match(reveal, /element\.animate\(/);
  assert.match(reveal, /usePathname\(\)/);
  assert.match(reveal, /prefers-reduced-motion: reduce/);
  assert.match(reveal, /requestAnimationFrame/);
  assert.match(reveal, /animation\.cancel\(\)/);
  assert.doesNotMatch(reveal, /gsap|style\.visibility\s*=\s*["']hidden/);
});
