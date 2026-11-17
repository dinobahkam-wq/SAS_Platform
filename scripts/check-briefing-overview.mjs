import assert from "node:assert/strict";
import { test } from "node:test";
import { briefingEditionOverview, prioritizeBriefingDevelopments } from "../src/lib/briefing-view.ts";

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
