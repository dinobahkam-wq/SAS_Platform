#!/usr/bin/env node
/**
 * Locally narrow a private WordPress REST export to the requested single month.
 * No network calls, no publication, no database writes.
 */
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

export const RANGE={start:'2026-10-11',endExclusive:'2026-11-12'};
export function selectMonth(exported,range=RANGE) {
  if(!exported||!Array.isArray(exported.records)) throw new Error('Expected WordPress inventory records array');
  const selected=exported.records.filter(row=>{
    if(typeof row.published_local!=='string'||!/^\d{4}-\d\d-\d\d/.test(row.published_local)) return false;
    const date=row.published_local.slice(0,10);
    return date>=range.start&&date<range.endExclusive;
  });
  return {
    source:exported.source,
    selection_range:range,
    mode:'PRIVATE_REVIEW_ONLY_NO_DATABASE_WRITES',
    count:selected.length,
    records:selected,
  };
}
async function main(){
  if(process.argv.length!==4) throw new Error('Usage: node scripts/legacy-last-month.mjs <private-source.json> <private-output.json>');
  const data=JSON.parse(await readFile(resolve(process.argv[2]),'utf8'));
  const subset=selectMonth(data);
  await writeFile(resolve(process.argv[3]),JSON.stringify(subset,null,2)+'\n',{flag:'wx',mode:0o600});
  console.log(JSON.stringify({count:subset.count,start:RANGE.start,end_inclusive:'2026-11-11',destination:process.argv[3],db_writes:0}));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)main().catch(err=>{console.error(err.message);process.exitCode=1});
