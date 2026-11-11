import test from 'node:test';
import assert from 'node:assert/strict';
import {mapPost,summarize,collectInventory} from '../scripts/legacy-rest-inventory.mjs';

const post={id:5816,date:'2026-11-02T10:00:00',date_gmt:'2026-11-02T07:00:00',
  link:'https://www.sas-media.net/post/5816',slug:'test',status:'publish',
  title:{rendered:'عنوان'},excerpt:{rendered:'نبذة'},content:{rendered:'<p>متن تجريبي</p>'},
  author:1,categories:[2],tags:[],featured_media:0};
test('extracts source fields without making publishing decisions',()=>{
  const item=mapPost(post);
  assert.equal(item.import_status,'NOT_IMPORTED');
  assert.equal(item.editorial_review,'pending');
  assert.equal(item.body_html_untrusted,'<p>متن تجريبي</p>');
});
test('rejects unrelated canonical host and draft',()=>{
  assert.throws(()=>mapPost({...post,link:'https://example.com/post/5816'}));
  assert.throws(()=>mapPost({...post,status:'draft'}));
});
test('diagnostic separately reports whether historic IDs match REST IDs',()=>{
  assert.deepEqual(summarize([mapPost(post)],1).id_matches,['5816']);
});
test('collector supports bounded synthetic one-page export',async()=>{
  const result=await collectInventory(async()=>({data:[post],total:1,pages:1}));
  assert.equal(result.records.length,1);
  assert.equal(result.summary.total_reported,1);
  assert.equal(result.read_only,true);
});
