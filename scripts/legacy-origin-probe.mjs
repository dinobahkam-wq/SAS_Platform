#!/usr/bin/env node
/**
 * Read-only CMS origin probe. Only checks public URLs; does not authenticate,
 * crawl articles, download media, or modify the source website.
 */
const hosts = ['https://sas-media.net', 'https://www.sas-media.net'];
const paths = ['/', '/robots.txt', '/sitemap.xml', '/wp-json/', '/wp-json/wp/v2/posts?per_page=1', '/post/5816'];
const timeout = 10000;
const allow = new Set(['sas-media.net','www.sas-media.net']);

async function probe(url) {
  const target = new URL(url);
  if (!allow.has(target.hostname)) throw new Error('Unexpected host');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      method:'GET', redirect:'manual', signal:controller.signal,
      headers:{ 'User-Agent':'SAS-Migration-ReadOnly-Diagnostic/1.0', 'Accept':'text/html,application/json,text/plain,application/xml,*/*' }
    });
    const type = res.headers.get('content-type')?.split(';')[0] ?? null;
    const rawRedirect = res.headers.get('location');
    let redirect = null;
    if (rawRedirect) {
      const next = new URL(rawRedirect, url);
      redirect = allow.has(next.hostname) ? next.origin + next.pathname : 'external-host-redacted';
    }
    await res.body?.cancel();
    return { url, status:res.status, content_type:type, redirect };
  } catch (error) {
    return {url, error:error instanceof Error ? error.name : 'RequestError'};
  } finally {
    clearTimeout(timer);
  }
}
const results=[];
for (const host of hosts) for (const path of paths) {
  const url = host+path;
  const result = await probe(url);
  results.push(result);
  console.log(JSON.stringify(result));
}
console.log(JSON.stringify({checked:results.length,read_only:true,articles_downloaded:0,authentication_used:false}));
