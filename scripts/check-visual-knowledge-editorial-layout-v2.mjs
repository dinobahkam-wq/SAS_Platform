import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const card = read("src/components/visual-knowledge-feature.tsx");
const css = read("src/components/visual-knowledge-feature.css");
const home = read("src/app/page.tsx");
const visual = read("src/app/visual-knowledge/page.tsx");

test("homepage and knowledge archive use one featured and one supporting card, not stacked clones", () => {
  assert.match(card, /export function VisualKnowledgeShowcase/);
  assert.match(card, /<CivicKnowledgeFeature\s*\/>/);
  assert.match(card, /<VisualKnowledgeFeature\s*\/>/);
  assert.match(card, /sas-visual-showcase-supporting/);
  assert.match(home, /<VisualKnowledgeShowcase\s*\/>/);
  assert.match(visual, /<VisualKnowledgeShowcase\s*\/>/);
  assert.doesNotMatch(home, /<CivicKnowledgeFeature\s+compact/);
  assert.doesNotMatch(home, /<VisualKnowledgeFeature\s+compact/);
  assert.match(home, /EditorialRail/);
  assert.match(visual, /EditorialRail/);
});

test("both original public knowledge links remain usable and headings distinct", () => {
  assert.match(card, /\/visual-knowledge\/state-and-government/);
  assert.match(card, /\/visual-knowledge\/yemen-crisis-timeline/);
  assert.match(card, /استكشاف الدليل/);
  assert.match(card, /استعراض المحطات/);
  assert.match(card, /<h3><Link href=\{item\.href\}/);
  assert.match(card, /className="sas-visual-feature-action"/);
});

test("civic cover conveys actual state elements, not misleading institutional hierarchy", () => {
  assert.match(card, /sas-vk-civic-hub/);
  for (const term of ["السكان","الإقليم","السلطة العامة","السيادة"]) {
    assert.ok(card.includes(term), "Missing state element: " + term);
  }
  assert.match(card, /sas-vk-civic-grid/);
  assert.doesNotMatch(card, /sas-civics-map-stems|sas-civics-map-nodes/);
});

test("timeline cover shows historical markers and editorial annotations", () => {
  for (const year of ["2014","2018","2022"]) assert.ok(card.includes(year));
  assert.match(card, /sas-vk-timeline-track/);
  assert.match(card, /sas-vk-timeline-label/);
  assert.match(card, /8 محطات موثقة/);
});

test("responsive layout keeps only one large feature and uses SAS fonts", () => {
  assert.match(css, /\.sas-visual-showcase\s*\{/);
  assert.match(css, /grid-template-columns:minmax\(0,1\.63fr\) minmax\(290px,\.87fr\)/);
  assert.match(css, /sas-visual-feature--lead/);
  assert.match(css, /sas-visual-feature--supporting/);
  for (const width of ["1150px","760px","540px"]) assert.ok(css.includes("@media(max-width:"+width+")"));
  assert.match(css, /Tajarib Taweel/);
  assert.match(css, /Thmanyah Sans/);
  assert.match(css, /focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
});
