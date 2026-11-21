import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {YEMEN_MAP,yemenMapPoint} from "../src/lib/briefing-geo.ts";
const read=path=>readFileSync(path,"utf8");
const migration=read("supabase/migrations/20261121112935_briefing_geography_registry_v1.sql");
const publicPage=read("src/app/briefings/[slug]/page.tsx");
const printPage=read("src/app/briefings/[slug]/print/page.tsx");
const parser=read("src/lib/public-briefing.ts");
const reader=read("src/components/briefing-edition-body.tsx");
const admin=read("src/app/admin/briefings/editorial/actions.ts");
const studio=read("src/lib/briefing-studio-transfer.ts");
const places=read("src/app/admin/places/actions.ts");

test("geographic registry has staff-only RLS, provenance, hierarchy and coordinate constraints",()=>{
  assert.match(migration,/create table public\.briefing_places/);
  assert.match(migration,/enable row level security/);
  assert.match(migration,/revoke all on public\.briefing_places from public,anon,authenticated/);
  assert.match(migration,/briefing_places_staff_read/);
  assert.match(migration,/briefing_places_admin_insert/);
  assert.match(migration,/briefing_places_admin_update/);
  assert.match(migration,/briefing_places_coordinate_pair/);
  assert.match(migration,/briefing_places_parent_type/);
  assert.match(migration,/source_url text not null/);
  assert.match(migration,/add column place_slug text references public\.briefing_places/);
});
test("new snapshots contain a checked place; old published snapshots remain unchanged",()=>{
  assert.match(migration,/'place',\(/);
  assert.match(migration,/p\.slug=d\.place_slug and p\.is_active=true/);
  assert.doesNotMatch(migration,/update\s+public\.briefing_revisions\s+set\s+published_snapshot/i);
  assert.match(parser,/place: parsePlace\(row\.place\)/);
  assert.doesNotMatch(parser,/parsePlace\(row\.location_text\)/);
  assert.match(reader,/<BriefingLocationMark place=\{development\.place\}/);
  assert.match(studio,/placeSlug: development\.place\?\.slug/);
});
test("editorial location selection is explicit, verified and lock-aware",()=>{
  assert.match(admin,/form\.get\("place_slug"\)/);
  assert.match(admin,/from\("briefing_places"\)/);
  assert.match(admin,/briefing_edition_items/);
  assert.match(admin,/place_slug: placeSlug \|\| null/);
  assert.match(places,/await requireAdmin\(\)/);
  assert.match(places,/source_name\.length/);
  assert.match(places,/new URL\(source_url\)/);
});
test("cartography uses only approximate points and respects the Yemen outline",()=>{
  assert.match(YEMEN_MAP.path,/^M/);
  assert.ok(YEMEN_MAP.path.length>200);
  assert.equal(yemenMapPoint(91,45),null);
  assert.equal(yemenMapPoint(15,100),null);
  const mukalla=yemenMapPoint(14.542,49.124);
  assert.ok(mukalla && mukalla.x>0 && mukalla.x<172 && mukalla.y>0 && mukalla.y<110);
});
test("methodology content is hidden, not erased from stored revision",()=>{
  assert.doesNotMatch(publicPage,/revision\.methodology_ar|briefing-methodology-section/);
  assert.doesNotMatch(printPage,/revision\.methodology_ar|briefing-print-methodology/);
  assert.match(parser,/methodology_ar: text\(revision\.methodology_ar\)/);
  assert.doesNotMatch(migration,/drop column methodology_ar/i);
});
