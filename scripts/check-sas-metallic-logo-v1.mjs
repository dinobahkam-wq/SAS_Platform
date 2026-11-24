import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const header = readFileSync("src/components/public-site.tsx", "utf8");
const brand = readFileSync("src/components/brand-logo.tsx", "utf8");
const style = readFileSync("src/components/sas-metallic-logo.css", "utf8");

test("metallic reflection is limited to the existing transparent full-color SAS header logo", () => {
  assert.match(header, /<span className="sas-metallic-logo"><BrandLogo variant="color" priority \/><\/span>/);
  assert.match(brand, /sas%20color%20logo%20for%20the%20white%20background\.png/);
  assert.match(style, /mask-image: url\("\/brand\/logos\/sas%20color%20logo%20for%20the%20white%20background\.png"\)/);
  assert.match(style, /mask-size: cover/);
  assert.match(style, /background-position: 0% 50%/);
});

test("effect remains visual-only, accessible and respects reduced motion", () => {
  assert.match(header, /<Link href="\/" className="site-brand" aria-label="منصة ساس">/);
  assert.match(style, /pointer-events: none/);
  assert.match(style, /:focus-visible/);
  assert.match(style, /prefers-reduced-motion: reduce/);
  assert.match(style, /@media print/);
  assert.doesNotMatch(style, /webgl|requestAnimationFrame/);
});
