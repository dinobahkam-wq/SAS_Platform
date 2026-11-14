import assert from "node:assert/strict";
import { test } from "node:test";
import { briefingEditionOverview, briefingEditorialSignals, prioritizeBriefingDevelopments } from "../src/lib/briefing-view.ts";

function development(order, geographic_scope, information_class = "fact", what_changed_ar = null) {
  return { order, geographic_scope, information_class, what_changed_ar };
}

test("prioritizes Yemen then regional then international without mutating source", () => {
  const items = [
    development(0, "international"),
    development(1, "local"),
    development(2, "regional"),
    development(3, "national"),
    development(4, "international"),
  ];
  const sorted = prioritizeBriefingDevelopments(items);
  assert.deepEqual(sorted.map((item) => item.order), [1, 3, 2, 0, 4]);
  assert.deepEqual(items.map((item) => item.order), [0, 1, 2, 3, 4]);
});

test("counts existing evidence only; no inferred changes", () => {
  const overview = briefingEditionOverview([
    development(0, "national", "position", null),
    development(1, "regional", "fact", "تغير مثبت"),
    development(2, "international", "claim", " "),
  ]);
  assert.deepEqual(overview, {
    total: 3, yemen: 1, regional: 1, international: 1, positions: 1, changes: 1,
  });
  assert.equal(briefingEditionOverview([]).changes, 0);
});

test("editorial signals include only authored positions and documented changes", () => {
  const items = [
    { ...development(0, "international", "position"), headline_ar: "موقف دولي", sources: [{ source_role: "primary", source_name: "جهة أصلية" }] },
    { ...development(1, "national", "position"), headline_ar: "موقف يمني", sources: [] },
    { ...development(2, "national", "fact", "انتقال موثق"), headline_ar: "تطور محلي", sources: [] },
    { ...development(3, "regional", "claim", " "), headline_ar: "ادعاء إقليمي", sources: [] },
  ];
  const snapshot = structuredClone(items);
  const signals = briefingEditorialSignals(items);
  assert.deepEqual(signals.positions.map((position) => position.headline), ["موقف يمني", "موقف دولي"]);
  assert.equal(signals.positions[1].source, "جهة أصلية");
  assert.deepEqual(signals.changes, [{ headline: "تطور محلي", change: "انتقال موثق" }]);
  assert.deepEqual(items, snapshot);
  assert.deepEqual(briefingEditorialSignals([], 3), { positions: [], changes: [] });
});

test("signal limit is bounded and cannot create extra records", () => {
  const inputs = Array.from({ length: 9 }, (_, index) => ({
    ...development(index, "national", "position", "تغير موثق"),
    headline_ar: "موقف رقم " + index,
    sources: [],
  }));
  const signals = briefingEditorialSignals(inputs, 99);
  assert.equal(signals.positions.length, 6);
  assert.equal(signals.changes.length, 6);
  assert.equal(briefingEditorialSignals(inputs, 0).positions.length, 0);
});
