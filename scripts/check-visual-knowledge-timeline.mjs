import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { timelineCategories, yemenTimeline } from "../src/data/visual-knowledge/yemen-crisis-timeline.ts";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("eight chronological, distinct and date-precise sourced Yemen events", () => {
  assert.equal(yemenTimeline.length, 8);
  assert.equal(new Set(yemenTimeline.map((item) => item.id)).size, 8);
  assert.deepEqual(yemenTimeline.map((item) => item.year), ["2014", "2015", "2016", "2017", "2018", "2019", "2022", "2022"]);
  for (const [i, event] of yemenTimeline.entries()) {
    assert.match(event.date, /^\d{4}-\d{2}(?:-\d{2})?$/);
    assert.equal(event.year, event.date.slice(0, 4));
    assert.ok(event.dateLabel.length > 5);
    assert.ok(timelineCategories[event.category]);
    for (const key of ["title", "place", "description", "change", "significance"]) assert.ok(event[key].trim().length >= 5);
    assert.ok(event.sources.length > 0);
    for (const source of event.sources) {
      assert.match(source.url, /^https:\/\//);
      assert.ok(source.title.trim() && source.organization.trim());
      assert.ok(!source.url.includes("example.com"));
    }
    if (i) assert.ok(yemenTimeline[i - 1].date <= event.date);
  }
  const bank = yemenTimeline.find((item) => item.id === "central-bank-2016");
  assert.equal(bank.date, "2016-09");
  assert.equal(bank.dateLabel, "سبتمبر 2016");
});

test("interactive page and section have complete navigation and data boundary", () => {
  const ui = read("src/components/yemen-crisis-timeline.tsx");
  const route = read("src/app/visual-knowledge/yemen-crisis-timeline/page.tsx");
  const landing = read("src/app/visual-knowledge/page.tsx");
  const home = read("src/app/page.tsx");
  assert.match(ui, /useState<CategoryFilter>/);
  assert.match(ui, /aria-pressed=/);
  assert.match(ui, /setSelected/);
  assert.match(ui, /selectOffset/);
  assert.match(ui, /event\.sources\.map/);
  assert.match(ui, /event\.change/);
  assert.match(ui, /event\.significance/);
  assert.match(ui, /قراءة تحريرية لساس/);
  assert.match(ui, /href=\{source\.url\}/);
  assert.match(route, /notFound\(\)/);
  assert.match(landing, /VisualKnowledgeGallery/);
  assert.match(home, /VisualKnowledgePortal/);
  assert.match(route, /notFound/);
});

test("styles are scoped and designed for RTL, small screens and keyboard access", () => {
  const css = read("src/components/yemen-timeline.css");
  assert.match(css, /\.sastl-dashboard/);
  assert.match(css, /direction:rtl/);
  assert.match(css, /Tajarib Taweel/);
  assert.match(css, /Thmanyah Sans/);
  assert.match(css, /max-width:660px/);
  assert.match(css, /focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
});
