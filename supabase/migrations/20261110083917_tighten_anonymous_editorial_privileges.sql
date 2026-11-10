revoke all on public.content_items,public.authors,public.categories,public.tags,
  public.media_assets,public.content_sources,public.content_authors,
  public.content_tags,public.content_source_links,public.user_roles from anon;
grant select on public.content_items,public.authors,public.categories,public.tags,
  public.media_assets,public.content_sources,public.content_authors,
  public.content_tags,public.content_source_links to anon;
