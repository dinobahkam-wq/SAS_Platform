import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read = path => readFileSync(path,"utf8");
const migration = read("supabase/migrations/20261124111500_briefing_audio_companion_v1.sql");
const home = read("src/app/page.tsx");
const showcase = read("src/components/home-briefing-showcase.tsx");
const publicPage = read("src/app/briefings/[slug]/page.tsx");
const lookup = read("src/lib/briefing-audio.ts");
const player = read("src/components/briefing-audio-player.tsx");
const upload = read("src/app/admin/briefings/audio/actions.ts");
const admin = read("src/app/admin/briefings/audio/[slug]/page.tsx");
const form = read("src/app/admin/briefings/audio/briefing-audio-upload-form.tsx");

test("independent restricted audio storage and separate edition assets",()=>{
  assert.match(migration,/sas-briefing-audio/);
  assert.match(migration,/CREATE TABLE IF NOT EXISTS public\.briefing_audio_assets/);
  assert.match(migration,/ENABLE ROW LEVEL SECURITY/);
  assert.match(migration,/sas_audio_public_published/);
  assert.match(migration,/current_revision_id=revision_id/);
  assert.match(migration,/status='draft'/);
  assert.match(migration,/private\.has_any_role/);
});
test("audio renders only when current revision has a published asset",()=>{
  assert.match(lookup,/\.eq\("revision_id", edition\.current_revision_id\)/);
  assert.match(lookup,/\.eq\("status", "published"\)/);
  assert.match(home,/getPublishedBriefingAudio/);
  assert.match(home,/audio=\{briefingAudio\}/);
  assert.match(showcase,/audio \? <BriefingAudioPlayer audio=\{audio\} compact \/> : null/);
  assert.match(publicPage,/editionAudio \? <BriefingAudioPlayer/);
});
test("review gate keeps uploads as drafts until explicit publication",()=>{
  assert.match(upload,/status:"draft"/);
  assert.match(upload,/async function publishBriefingAudio/);
  assert.match(upload,/\.eq\("status","draft"\)/);
  assert.match(upload,/file\.slice\(0,12\)/);
  assert.match(form,/onLoadedMetadata/);
  assert.match(form,/action=\{uploadBriefingAudio\}/);
  assert.match(admin,/action=\{publishBriefingAudio\}/);
});
test("playback is user-initiated and keyboard accessible",()=>{
  assert.match(player,/player\.play\(\)/);
  assert.match(player,/aria-label="موضع الاستماع"/);
  assert.match(player,/aria-label="سرعة تشغيل التسجيل"/);
  assert.match(player,/aria-label="مستوى الصوت"/);
  assert.match(player,/preload="metadata"/);
  assert.doesNotMatch(player,/autoPlay/);
});
