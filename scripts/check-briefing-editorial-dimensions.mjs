import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const file = (path) => readFileSync(path, "utf8");
const migration = file("supabase/migrations/20261121120000_briefing_editorial_dimensions_v1.sql");
const actions = file("src/app/admin/briefings/editorial/actions.ts");
const view = file("src/lib/briefing-view.ts");
const studio = file("src/lib/briefing-studio-transfer.ts");
const publicBriefing = file("src/lib/public-briefing.ts");

test("metadata migration is additive, constrains enum values and preserves historic published snapshots", () => {
  assert.match(migration, /alter table public\.briefing_developments/);
  for (const field of ["priority_level", "yemen_relevance", "issuer_identity_id", "publisher_identity_id", "editorial_impact_note_ar"]) {
    assert.match(migration, new RegExp("add column "+field+" "));
    assert.match(migration, new RegExp("'"+field+"',d\\."+field));
  }
  assert.doesNotMatch(migration, /update\s+public\.briefing_revisions\s+set\s+published_snapshot/i);
  assert.match(migration, /security invoker/);
});

test("editor actions require admin, check review locks and do not publish", () => {
  assert.match(actions, /await requireAdmin\(\)/);
  assert.match(actions, /briefing_edition_items/);
  assert.match(actions, /briefing_revisions!inner/);
  assert.match(actions, /"in_review", "approved", "published"/);
  assert.doesNotMatch(actions, /\.rpc\(["']publish_briefing_revision/);
});

test("presentation priority and studio metadata are optional for historic revisions", () => {
  assert.match(view, /a\.priority_level \?/);
  assert.match(view, /a\.order - b\.order/);
  for (const field of ["priority_level", "yemen_relevance", "issuer_identity_id", "publisher_identity_id"]) {
    assert.match(publicBriefing, new RegExp(field));
  }
  assert.match(studio, /issuerIdentityId/);
  assert.match(studio, /publisherIdentityId/);
});
