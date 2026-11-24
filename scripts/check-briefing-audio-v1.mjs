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

test("independent restricted audio storage and public RPC",()=>{
  assert.match(migration,/sas-briefing-audio/);
  assert.match(migration,/CREATE TABLE IF NOT EXISTS public\.briefing_audio_assets/);
  assert.match(migration,/ENABLE ROW LEVEL SECURITY/);
  assert.match(migration,/status='draft'/);
  assert.match(migration,/private\.has_any_role/);
  const publicSql=read("supabase/migrations/20261124112700_public_briefing_audio_rpc_v1.sql");
  assert.match(publicSql,/get_public_briefing_audio/);
  assert.match(publicSql,/a.status='published'/);
  assert.match(publicSql,/e.current_revision_id/);
});
test("player renders only for the approved edition companion",()=>{
  assert.match(lookup,/get_public_briefing_audio/);
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

test("audio identity and playback icons use SVG instead of music or typography glyphs",()=>{
  const playerCss=read("src/components/briefing-audio-player.css");
  assert.match(player,/function AudioAiMark/);
  assert.match(player,/function PlayStateIcon/);
  assert.match(player,/موجز إخباري بصوت مولّد بالذكاء الاصطناعي/);
  assert.match(player,/aria-label=\{playing \? "إيقاف الإحاطة الصوتية مؤقتًا"/);
  assert.match(playerCss,/sas-briefing-audio__symbol/);
  assert.match(playerCss,/sas-briefing-audio__toggle/);
  assert.match(playerCss,/sas-briefing-audio__download/);
  assert.doesNotMatch(player,/[♫Ⅱ]/);
});

test("edition audio spans the same content width as reference panel",()=>{
  const playerCss=read("src/components/briefing-audio-player.css");
  const base=playerCss.match(/\.sas-briefing-audio\s*\{([^}]+)\}/)?.[1] ?? "";
  assert.match(base,/box-sizing:\s*border-box/);
  assert.match(base,/width:\s*100%/);
  assert.match(base,/max-width:\s*none/);
  assert.match(publicPage,/<BriefingAudioPlayer audio=\{editionAudio\}/);
  assert.match(publicPage,/className="sas-fixed-reference-panel"/);
});
