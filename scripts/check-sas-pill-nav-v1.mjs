import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = path => readFileSync(path, "utf8");
const navigation = read("src/components/sas-pill-nav.tsx");
const css = read("src/components/sas-pill-nav.css");
const header = read("src/components/public-site.tsx");
const briefing = read("src/components/briefing-edition-body.tsx");

test("global header uses page-aware navigational links", () => {
  assert.match(header, /<SasHeaderPillNav\s*\/>/);
  assert.match(navigation, /usePathname\(\)/);
  for (const route of ["/briefings","/insights","/visual-knowledge","/programs"]) {
    assert.ok(navigation.includes('href: "' + route + '"'));
  }
  assert.match(navigation, /aria-current=\{active \? "page" : undefined\}/);
  assert.match(navigation, /<Link key=/);
});
test("daily briefing still filters real developments and counts by category", () => {
  assert.match(briefing, /<SasPillNav/);
  assert.match(briefing, /variant="briefing"/);
  assert.match(briefing, /onChange=\{\(key\) => setActiveTab\(key as Tab\)\}/);
  assert.match(briefing, /matchesTab\(development, tab.key\)/);
  assert.match(briefing, /const filtered = ordered.filter\(\(development\) => matchesTab\(development, activeTab\)\)/);
  assert.match(navigation, /aria-pressed=\{active\}/);
  assert.match(navigation, /item.count.toLocaleString\("en-US"\)/);
});
test("motion is RTL-aware and accessible on phones and in dark mode", () => {
  assert.match(css, /direction: rtl/);
  assert.match(css, /\.sas-pill-nav__indicator/);
  assert.match(css, /cubic-bezier\(\.22, 1, \.36, 1\)/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /html\[data-theme="dark"\]/);
  assert.match(navigation, /ResizeObserver/);
  assert.match(navigation, /onFocus:/);
  assert.match(navigation, /onBlur:/);
});

test("primary product navigation keeps all four visible at narrow widths without changing briefing tabs", () => {
  const headerCss = read("src/app/unified-glass-header.css");
  assert.match(navigation, /className="sas-product-nav"/);
  assert.match(navigation, /className="sas-product-nav__list"/);
  assert.match(headerCss, /width: max-content/);
  assert.match(headerCss, /@media \(max-width: 760px\)/);
  assert.match(headerCss, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(headerCss, /white-space: normal/);
  assert.doesNotMatch(headerCss, /\.sas-product-nav\s*\{[^}]*overflow-x:\s*auto/);
  assert.match(headerCss, /position: relative/);
  assert.match(navigation, /variant: "header" \| "briefing"/);
});
