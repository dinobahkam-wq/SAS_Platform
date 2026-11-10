# SAS Platform — Public Editorial Experience v1

**Status:** Implementation branch, stacked on the approved System B specimen branch  
**Date:** 2026-11-10  
**Scope:** Public website presentation and connection to the existing editorial CMS

## 1. Product decision

The production public interface adopts System B as demonstrated in the approved editorial product specimen. The specimen routes remain internal design references; public pages use production components and live Supabase records.

The public platform is an editorial and knowledge interface, not a generic news-feed template. Its four content sections remain:

- News and current affairs (\`news\`)
- Analysis and opinion (\`analysis\`)
- Research and studies (\`research\`)
- Programs and media (\`media\`)

## 2. Approved typography mapping

| Use | Typeface | Weight |
|---|---|---:|
| News headlines and research-cover titles | Tajarib Taweel | 900 |
| Analysis and opinion article titles | Thmanyah Serif Display | 700 |
| Main editorial subheadings | Thmanyah Serif Display | 500 |
| Secondary subheadings | Tajarib Taweel | 500 |
| Body copy, excerpts, metadata, interface labels | Thmanyah Sans | 400 |

The implementation uses the locally bundled font assets already present in \`public/fonts/\`. Public production remains subject to confirming the applicable font-serving licence and retaining any required written permission.

## 3. Production routes

| Route | Purpose |
|---|---|
| \`/\` | Editorial homepage with the latest published content across all sections |
| \`/news\` | News listing |
| \`/analysis\` | Analysis and opinion listing |
| \`/research\` | Research and studies listing |
| \`/media\` | Programs and media listing |
| \`/content/[slug]\` | Public detail page for a published item |
| \`/login\` | Existing staff sign-in |
| \`/admin\` | Existing protected editorial workspace |

The internal typography and product specimen routes remain noindex design-review pages and are not used as production content pages.

## 4. Data and rendering

- \`src/lib/public-content.ts\` is the server-only public data-access layer.
- Public queries explicitly request \`status = published\`; Supabase RLS remains the authoritative access boundary.
- The homepage reads a single bounded feed and partitions it into the four editorial sections.
- Section pages read the selected section and render a lead item plus supporting items.
- Detail pages resolve a published item by slug and render its title, excerpt, body, publication date, category, linked authors, and linked sources when available.
- Cover image metadata is read from \`media_assets\`; public URLs are generated from the configured Supabase Storage bucket.
- Body rendering supports paragraph, heading, subheading, quote, and list blocks. The current CMS form still writes paragraph blocks only.

## 5. CMS integration

The existing editorial workflow and server-side authorization are retained. The content form now allows an editor to select a main image from the existing media library. The selected \`cover_asset_id\` is saved with the content record and used by public cards and detail pages.

The public pages do not expose drafts or archived content. Public media metadata is read only when permitted by the existing RLS policy for media attached to published content.

No service-role key is introduced into the public application. No database schema migration is required for this release.

## 6. Editorial display rules

- A news item is not automatically labelled “urgent” or “breaking”; the current schema has no dedicated urgency field.
- Featured placement is controlled by the existing \`is_featured\` flag.
- Source attribution is displayed on the detail page when source links exist. The database continues to enforce the mandatory source link for publishing news.
- Missing cover images use a neutral SAS placeholder; the interface does not invent imagery.
- Empty sections display an explicit empty state rather than fabricated sample content.

## 7. Current boundaries and next iterations

1. The CMS body editor remains a paragraph-based textarea. A visual rich-text editor and structured heading/quote/list authoring are deferred.
2. There is no dedicated breaking-news priority or live-update timeline field.
3. Public search, pagination, tag landing pages, author profiles, and related-content recommendations are not included in this release.
4. Media records support image assets; video and podcast playback/embedding require a later media-specific implementation.
5. The media library currently exposes a selectable cover asset, but the content form does not yet provide inline image placement within the article body.
6. Responsive behavior and production build must be verified on the Vercel preview before the branch is merged.

## 8. Release checks

- Run \`npm run typecheck\`.
- Run \`npm run build\`.
- Verify homepage and all four section routes with both populated and empty datasets.
- Verify a published news item with at least one linked source.
- Verify drafts and archived items return no public detail page.
- Verify cover image display and alt text from Supabase Storage.
- Verify admin-only routes remain protected.
- Confirm font licensing before public production deployment.

