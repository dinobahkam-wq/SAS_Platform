#!/usr/bin/env node
/**
 * Public WordPress REST inventory. Read-only network, local output only.
 * Never imports, publishes, authenticates or modifies WordPress/Supabase.
 */
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const HOST = 'https://www.sas-media.net';
export const AFTER = '2026-09-11T00:00:00';
export const BEFORE = '2026-11-12T00:00:00';
const MAX_PAGES = 25;
const PER_PAGE = 20;
const REQUEST_TIMEOUT_MS = 45000;

export function isExpectedPost(post) {
  return Boolean(post && Number.isSafeInteger(post.id) &&
    typeof post.date === 'string' && typeof post.link === 'string' &&
    typeof post.title?.rendered === 'string' &&
    typeof post.content?.rendered === 'string' &&
    ['publish'].includes(post.status));
}
export function mapPost(post) {
  if (!isExpectedPost(post)) throw new Error('Malformed or non-public WordPress record');
  const sourceLink = new URL(post.link);
  if (!['sas-media.net','www.sas-media.net'].includes(sourceLink.hostname) ||
      !['http:','https:'].includes(sourceLink.protocol))
    throw new Error('Unexpected canonical post link');
  return {
    source_system:'sas_wordpress_public_rest',
    legacy_id:String(post.id),
    legacy_url:post.link,
    slug:typeof post.slug==='string' ? post.slug : null,
    published_local:post.date,
    published_gmt:typeof post.date_gmt==='string' ? post.date_gmt : null,
    modified_gmt:typeof post.modified_gmt==='string' ? post.modified_gmt : null,
    title_html:post.title.rendered,
    excerpt_html:post.excerpt?.rendered ?? '',
    body_html_untrusted:post.content.rendered,
    author_id:post.author ?? null,
    category_ids:post.categories ?? [],
    tag_ids:post.tags ?? [],
    featured_media_id:post.featured_media ?? 0,
    editorial_review:'pending',
    import_status:'NOT_IMPORTED',
  };
}
export function summarize(records, totalReported) {
  const known = ['5816','5762','5788','5599'];
  const ids = new Set(records.map(record=>record.legacy_id));
  return {count:records.length, total_reported:totalReported, id_matches:known.filter(id=>ids.has(id)),
    id_mismatches:known.filter(id=>!ids.has(id)),
    needs_canonical_link_verification:true,
    may_be_incomplete:totalReported !== null && records.length < totalReported};
}
async function fetchPage(page, signal) {
  const url = new URL('/wp-json/wp/v2/posts',HOST);
  for (const [key,value] of Object.entries({
    status:'publish',after:AFTER,before:BEFORE,per_page:String(PER_PAGE),page:String(page),orderby:'date',order:'desc',
    _fields:'id,date,date_gmt,modified_gmt,link,slug,status,title,excerpt,content,author,categories,tags,featured_media'
  })) url.searchParams.set(key,value);
  const response=await fetch(url,{signal,headers:{Accept:'application/json'}});
  if (!response.ok) throw new Error('REST HTTP '+response.status+' on page '+page);
  if (!(response.headers.get('content-type')??'').includes('json')) throw new Error('Expected JSON response');
  const data=await response.json();
  if (!Array.isArray(data)) throw new Error('Expected posts array');
  const total=Number(response.headers.get('x-wp-total'));
  const pages=Number(response.headers.get('x-wp-totalpages'));
  return {data, total:Number.isSafeInteger(total)?total:null, pages:Number.isSafeInteger(pages)&&pages>0?pages:null};
}
export async function collectInventory(fetcher=fetchPage) {
  const records=[], seen=new Set();
  let totalReported=null, pageCount=null;
  for(let page=1;page<=MAX_PAGES;page++){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
    let result;
    try {result=await fetcher(page,controller.signal);}
    catch(error) {
      if (error?.name === 'AbortError') throw new Error('WordPress REST request timed out after '+REQUEST_TIMEOUT_MS+'ms on page '+page+'. Retry with a smaller date window or check the canonical host.');
      throw error;
    } finally {clearTimeout(timer);}
    if(page===1){totalReported=result.total;pageCount=result.pages;}
    for(const raw of result.data){
      const item=mapPost(raw);
      if(seen.has(item.legacy_id)) throw new Error('Duplicate WP ID: '+item.legacy_id);
      seen.add(item.legacy_id);records.push(item);
    }
    if(result.data.length===0 || (pageCount!==null && page>=pageCount) || result.data.length<PER_PAGE) break;
  }
  return {generated_at:new Date().toISOString(),source:HOST,window:{after:AFTER,before:BEFORE},
    read_only:true,editorial_approval_required:true,
    records,summary:{...summarize(records,totalReported),
      page_cap_reached:pageCount!==null&&pageCount>MAX_PAGES}};
}
async function main() {
  if(process.argv.length!==3){console.error('Usage: node scripts/legacy-rest-inventory.mjs <private-output.json>');process.exitCode=2;return;}
  const inventory=await collectInventory();
  await writeFile(resolve(process.argv[2]),JSON.stringify(inventory,null,2)+'\n',{flag:'wx',mode:0o600});
  console.log(JSON.stringify({output:process.argv[2],summary:inventory.summary,body_downloaded_to_local_file_only:true}));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  main().catch(error=>{console.error(error.message);process.exitCode=1;});
}
