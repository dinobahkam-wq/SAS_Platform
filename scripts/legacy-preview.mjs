#!/usr/bin/env node
/**
 * SAS legacy content preview only. No network and no database writes.
 * Input: reviewed plain-text JSON { articles: [...] }.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const formats = {
  news: new Set(['news_brief','news_report','official_statement']),
  analysis: new Set(['analysis','opinion','interview']),
  research: new Set(['research_paper','policy_brief','study_report']),
  media: new Set(['video','podcast','interview','infographic','photo_gallery']),
};

export function slugify(value) {
  return value.normalize('NFKC').trim().toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '');
}
function validDatetime(value) {
  return typeof value === 'string'
    && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/.test(value)
    && !Number.isNaN(Date.parse(value));
}
function validSourceUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'www.sas-media.net'
      && /^\/post\/\d+\/?$/.test(url.pathname);
  } catch { return false; }
}
function blocksFromPlainText(value) {
  return value.replace(/\r\n/g, '\n').split(/\n\s*\n/)
    .map(s => s.trim()).filter(Boolean)
    .map(text => ({ type: 'paragraph', text }));
}
export function makePreview(input) {
  if (!input || !Array.isArray(input.articles)) {
    throw new Error('Expected JSON object with articles array');
  }
  const preview = [], blocked = [], warnings = [], ids = new Set(), slugs = new Set();
  for (const item of input.articles) {
    const id = String(item?.legacy_id ?? '').trim();
    const reasons = [];
    if (!/^\d+$/.test(id) || ids.has(id)) reasons.push('Invalid or duplicate legacy ID');
    ids.add(id);
    if (!validSourceUrl(item?.legacy_url)) reasons.push('Invalid legacy URL');
    if (!formats[item?.section]?.has(item?.format)) reasons.push('Invalid section and format');
    if (item?.disposition !== 'candidate' || item?.editorial_review !== 'approved_for_draft')
      reasons.push('Editorial approval for draft required');
    if (!validDatetime(item?.published_at)) reasons.push('Original time requires ISO 8601 offset');
    if (typeof item?.title !== 'string' || !item.title.trim() || item.title.length > 240)
      reasons.push('Invalid title');
    const slug = typeof item?.title === 'string' ? slugify(item.title) : '';
    if (!slug || slugs.has(slug)) reasons.push('Empty or duplicate slug');
    slugs.add(slug);
    if (typeof item?.body_text !== 'string' || item.body_text.trim().length < 80)
      reasons.push('Complete plain-text body required');
    else if (/<\/?(?:p|div|script|img|h[1-6]|a|br)\b/i.test(item.body_text))
      reasons.push('Raw HTML needs a reviewed converter');
    if (item?.section === 'news' && (!item.source_name || !item.source_url))
      reasons.push('News attribution required');
    if (item?.cover_url && item?.cover_rights !== 'cleared')
      warnings.push({legacy_id:id,issue:'Image omitted: rights not verified'});
    if (reasons.length) { blocked.push({legacy_id:id,reasons}); continue; }
    preview.push({
      legacy: {source_system:'sas_media_legacy_public_site', id,
        url:item.legacy_url, original_published_at:item.published_at},
      draft: {
        section:item.section, format:item.format, title:item.title.trim(), slug,
        excerpt:typeof item.excerpt === 'string' ? item.excerpt.trim() || null : null,
        body:{version:1,blocks:blocksFromPlainText(item.body_text.trim())},
        status:'draft', published_at:null, cover_asset_id:null,
        category_id:null, is_featured:false,
      },
      attribution_for_review: {
        source_name:item.source_name || null, source_url:item.source_url || null,
        author:item.author || null, cover_url:item.cover_url || null,
        cover_rights:item.cover_rights || 'unknown',
      },
    });
  }
  return {schema_version:1, mode:'PREVIEW_ONLY_NO_DATABASE_WRITES',
    counts:{input:input.articles.length,ready:preview.length,blocked:blocked.length},
    preview, blocked, warnings};
}
async function main() {
  if (process.argv.length !== 4 || process.argv[2] === '--help') {
    console.error('Usage: node scripts/legacy-preview.mjs <reviewed.json> <output.json>');
    process.exitCode = 2; return;
  }
  const input = JSON.parse(await readFile(resolve(process.argv[2]),'utf8'));
  const output = makePreview(input);
  await writeFile(resolve(process.argv[3]),JSON.stringify(output,null,2)+'\n',{flag:'wx'});
  console.log('Preview only: '+output.counts.ready+' drafts ready, '+output.counts.blocked+' blocked. No database writes.');
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error=>{console.error(error.message);process.exitCode=1;});
}
