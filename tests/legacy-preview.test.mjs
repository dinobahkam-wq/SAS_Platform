import test from 'node:test';
import assert from 'node:assert/strict';
import { makePreview } from '../scripts/legacy-preview.mjs';

const good = {
  legacy_id:'123', legacy_url:'https://www.sas-media.net/post/123',
  title:'خبر افتراضي للاختبار فقط', section:'news', format:'news_report',
  disposition:'candidate', editorial_review:'approved_for_draft',
  published_at:'2026-11-01T10:00:00+03:00',
  body_text:'هذه مادة افتراضية وضعت فقط لغرض اختبار تحويل النصوص إلى مسودات دون نشرها في الموقع. '.repeat(3),
  source_name:'مصدر اختبار', source_url:'https://example.org/source',
};
test('valid content creates an unpublished draft',()=>{
  const r=makePreview({articles:[good]});
  assert.equal(r.counts.ready,1);
  assert.equal(r.preview[0].draft.status,'draft');
  assert.equal(r.preview[0].draft.published_at,null);
  assert.equal(r.preview[0].legacy.original_published_at,good.published_at);
});
test('rejects duplicated legacy ids',()=>{
  const r=makePreview({articles:[good,{...good,title:'اختبار آخر'}]});
  assert.equal(r.counts.blocked,1);
});
test('never previews unreviewed or excluded content',()=>{
  const r=makePreview({articles:[{...good,disposition:'exclude'}]});
  assert.equal(r.counts.ready,0);
});
test('rejects raw HTML and outside URLs',()=>{
  const r=makePreview({articles:[{...good,legacy_url:'https://example.com/post/123',body_text:'<p>'+good.body_text+'</p>'}]});
  assert.equal(r.counts.blocked,1);
  assert.ok(r.blocked[0].reasons.includes('Raw HTML needs a reviewed converter'));
});
test('never assigns cover asset without a media import',()=>{
  const r=makePreview({articles:[{...good,cover_url:'https://example.org/photo.jpg'}]});
  assert.equal(r.preview[0].draft.cover_asset_id,null);
  assert.equal(r.warnings.length,1);
});
