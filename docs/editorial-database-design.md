# SAS Platform — Editorial Database Design

**Status:** Approved design baseline — implementation may proceed to migration drafting  
**Version:** 1.0  
**Date:** 2026-11-10  
**Project:** `SAS_Platform`  
**Supabase project ref:** `budsfbyrdpjkobqstpyr`

---

## 1. Decisions received

The following product decisions were explicitly selected:

| Decision | Selected option |
|---|---|
| Content architecture | Unified |
| Publishing workflow | Simple |
| Authors | Hybrid |
| Category scope | Global across all four sections |
| Editing published content | Platform manager only |
| Archived item public URL | Not accessible; return 404 |
| Media bucket | Public bucket |
| Multiple authors | Supported equally; display order only |
| News sourcing | At least one attributable source per news item; may be an official statement/document, agency, or SAS field correspondent |
| Image formats | JPEG, PNG, WebP, AVIF |
| Image limits | 10 MB maximum; longest edge 2560 px (initial configurable defaults) |

Interpretation:

- One central content table will represent all editorial items.
- The first release will not implement a mandatory editorial-review stage.
- Authors may be internal or external; an author profile does not require a login account.
- Categories are global and reusable across all four editorial sections; categories are not owned by a single section.
- Once an item is published, only the platform manager (`admin` role) may edit it. Authors and editors cannot modify published items.
- Archived items are not publicly accessible by their direct URL; public requests return HTTP 404.
- The initial editorial media bucket is public. Public object reads are therefore available to anyone with the object URL; uploads and mutations remain restricted to authorized staff.
- Content supports multiple authors on equal footing. `author_order` controls display order only and does not imply a primary author.
- The document is a design proposal. It does not create or modify database objects.

## 2. Product scope

The first release supports four public editorial sections:

1. News and current affairs
2. Analysis and opinion
3. Studies and research
4. Programs and multimedia

The following capabilities are deliberately out of scope for the initial database migration:

- A structured political knowledge base, issue files, event graphs, and entity relationships.
- Interactive control maps.
- Paid researcher access and subscriptions.
- A full editorial approval/review workflow.
- Advanced version comparison and collaborative editing.
- Video-file hosting inside Supabase Storage.

The schema should avoid decisions that prevent these capabilities from being added later.

## 3. Recommended architecture

Use a unified editorial model with a central `content_items` table and normalized supporting tables.

The four sections are represented by a constrained `section` value on each content item, rather than four independent content tables.

A separate `format` field describes the presentation format within a section. This avoids confusing an editorial section with a media format. For example, a multimedia item may be a video, podcast episode, or interview; a research item may be a report or policy paper.

### 3.1 Core tables

| Table | Purpose | Initial release |
|---|---|---|
| `content_items` | Central editorial record | Yes |
| `authors` | Internal and external author profiles | Yes |
| `content_authors` | Many-to-many author attribution and ordering | Yes |
| `categories` | Editorial categories | Yes |
| `tags` | Reusable subject tags | Yes |
| `content_tags` | Many-to-many content/tag relation | Yes |
| `media_assets` | Metadata and Storage object references | Yes |
| `content_sources` | Reusable source records and attribution | Yes |
| `content_source_links` | Many-to-many content/source relation | Yes |
| `user_roles` | Application roles for authenticated staff | Yes |

The exact set of tables, columns, constraints, and indexes must be confirmed during schema review before migration authoring.


### 3.3 Section and format allowlist

The database should validate that each `format` is permitted for its selected `section`. Use stable machine values; labels shown in the CMS may be Arabic.

| Section | Initial allowed formats |
|---|---|
| `news` | `news_brief`, `news_report`, `official_statement` |
| `analysis` | `analysis`, `opinion`, `interview` |
| `research` | `research_paper`, `policy_brief`, `study_report` |
| `media` | `video`, `podcast`, `interview`, `infographic`, `photo_gallery` |

Treat this list as the version 1.0 allowlist. Add new formats through a reviewed schema migration or a controlled reference-data update, not arbitrary free text.

### 3.2 Central content record

Proposed fields for `content_items`:

| Field | Type direction | Purpose |
|---|---|---|
| `id` | UUID, primary key | Stable content identifier |
| `section` | Constrained text/enum | `news`, `analysis`, `research`, `media` |
| `format` | Constrained text | Article, report, video, podcast, interview, etc. |
| `title` | Text, required | Editorial headline |
| `slug` | Text, unique, required | Stable public URL segment |
| `excerpt` | Text, nullable | Short summary/deck |
| `body` | JSONB, nullable | Structured rich-text document |
| `status` | Constrained text | `draft`, `published`, `archived` |
| `cover_asset_id` | UUID, nullable FK | Main image or cover |
| `category_id` | UUID, nullable FK | Primary category |
| `is_featured` | Boolean | Editorial prominence |
| `published_at` | Timestamptz, nullable | Publication timestamp |
| `created_by` | UUID, nullable FK to auth.users | Staff account that created the record |
| `updated_by` | UUID, nullable FK to auth.users | Staff account that last updated it |
| `seo_title` | Text, nullable | Search title |
| `seo_description` | Text, nullable | Search description |
| `created_at` | Timestamptz | Creation timestamp |
| `updated_at` | Timestamptz | Last update timestamp |

Recommendations:

- Store rich content as editor-neutral structured JSON, with a documented TipTap-compatible document schema in the application layer. Do not store arbitrary executable HTML.
- Keep section and format separate. Define allowed format values during implementation and validate them in the database.
- Use a unique slug constraint. If localized or multi-site publishing is introduced later, revisit the uniqueness scope before implementation.
- Require `published_at` when status is `published`; set it consistently when publishing. Re-publication behavior must be explicitly implemented.
- Use UTC-aware `timestamptz` values and render them in the user's or site's chosen timezone.
- Keep the content body nullable for drafts that have only metadata, but require a non-empty body before publication.
- Do not add a separate table for each section.

## 4. Authors and staff identity

The hybrid author model separates public attribution from authentication.

### 4.1 `authors`

An author profile represents the public identity displayed on the website. It can exist without an account.

Proposed fields:

- `id` UUID primary key
- `display_name` required
- `slug` unique
- `bio` nullable
- `avatar_asset_id` nullable
- `auth_user_id` nullable unique FK to `auth.users`
- `is_active`
- `created_at`, `updated_at`

A nullable `auth_user_id` allows an internal staff member to be linked to an author profile while external contributors remain attribution-only records.

### 4.2 `content_authors`

Join table supporting multiple authors per item and multiple items per author.

Proposed fields:

- `content_id` FK to `content_items`
- `author_id` FK to `authors`
- `author_order` integer
- `contribution_label` nullable (e.g. author, presenter, guest)
- Composite primary key or equivalent uniqueness on content and author.

This avoids embedding author names in content rows and supports multiple equal co-authors and presenter/guest attribution. `author_order` determines display order only; it does not designate a primary author.

## 5. Simple publishing workflow

The selected workflow is intentionally simpler than a newsroom approval pipeline.

### Statuses

| Status | Meaning | Publicly visible |
|---|---|---|
| `draft` | Work in progress | No |
| `published` | Approved for public display by an authorized publisher | Yes |
| `archived` | Retained but removed from normal public listings | No, by default |

There is no mandatory `in_review` state in version 1. An archived item is not publicly accessible by direct URL; public page requests for archived items return HTTP 404.

### Roles

Initial application roles:

- `admin`: full platform administration.
- `editor`: manage and publish editorial content, categories, tags, sources, and media metadata; may edit drafts but cannot edit an item after it is published.
- `author`: create content and edit their own drafts, subject to policy; cannot edit published items.
- `admin` (platform manager): may edit published items and has full platform administration privileges.

External author profiles do not receive a login role unless an account is deliberately created and linked.

### Authorization principles

- Public/anonymous users may read only published content and public supporting metadata.
- Authenticated authors may create drafts and update only content they are authorized to manage.
- Editors and administrators may publish or archive content according to their assigned permissions.
- Only the platform manager (`admin`) may modify content after it has been published. Editors and authors must request a manager's change.
- Never trust a role or user ID supplied by the browser; derive identity from the authenticated Supabase session and enforce authorization with Row Level Security (RLS).
- Use server-side privileged credentials only in trusted server contexts. Never expose a Supabase secret/service-role key in browser code.
- Define and test RLS policies before enabling public reads or staff writes.

The exact relationship between `created_by`, the linked author profile, and ownership of a draft must be enforced consistently in application logic and RLS.

## 6. Categories and tags

Use separate concepts:

- `categories`: curated editorial classification, typically hierarchical or section-aware.
- `tags`: flexible subject descriptors.
- `content_tags`: many-to-many relationship.

A content item may have one category in version 1 and multiple tags. Categories are global and reusable across all four sections; the category table should not require a section association. Category hierarchy should be implemented only if the editorial team confirms that nested navigation is required; otherwise begin with a flat global category list.

## 7. Media and file storage

Do not store binary image or video data in PostgreSQL.

### `media_assets`

Store metadata and a stable reference to the Storage object:

- `id` UUID primary key
- `bucket_id`
- `object_path`
- `file_name`
- `mime_type`
- `file_size`
- `width`, `height` where applicable
- `alt_text`
- `caption`
- `credit` / rights attribution
- `uploaded_by` nullable FK to `auth.users`
- `created_at`

The bucket and object path together identify the file. Do not store expiring signed URLs as canonical media references.

### Initial storage recommendation

- Use Supabase Storage for images and ordinary editorial attachments.
- Use optimized WebP/AVIF derivatives for public web delivery where practical.
- Keep large video files on a dedicated video platform and store embed/provider metadata in the content record or a future media-detail table.
- Use a public bucket for editorial assets intended for public delivery, as selected.
- A public bucket permits unauthenticated reads of every object in that bucket when its URL is known; Storage RLS does not make public objects private.
- Restrict uploads, updates, and deletes to authorized staff.
- Do not place confidential, embargoed, or otherwise restricted files in the public bucket. If pre-publication assets must remain confidential, introduce a separate private staging bucket and move/copy approved assets to the public bucket on publication.
- For version 1.0, accept JPEG, PNG, WebP, and AVIF images; use a 10 MB maximum file size and 2560 px maximum longest edge as initial configurable defaults. Validate MIME type and actual file content, not only the filename extension. These limits may be tuned after observing actual upload patterns and storage usage.

## 8. Sources and attribution

News and research content need traceable sourcing.

Use:

- `content_sources`: canonical source records (name, URL, source type, publisher/organization, and optional notes).
- `content_source_links`: relation between a content item and one or more sources, including attribution text, source role, and ordering.

This supports multiple sources per article and reuse of a source across multiple items. It does not, by itself, constitute a full fact-checking or evidence-management system.

### 8.1 Mandatory source attribution for news

Every item in the `news` section must have at least one linked source before it can be published. A source does not have to be an external website URL. Supported source types include:

- Official statement or official document.
- News agency or media organization.
- SAS field correspondent / reporter.
- Direct field observation or interview documented by SAS, with an attributable correspondent or record.

The source record should capture, as applicable, source type, source name or correspondent, source URL or document reference (nullable when not applicable), publication/issue date, and an attribution note. The publication rule must reject a news item with no source link. Other sections may use sources when relevant but are not subject to this mandatory minimum in version 1.0.


## 9. Indexes and data integrity

Initial index candidates:

- Unique index on `content_items.slug`.
- Composite index on `content_items(status, published_at desc)` for public feeds.
- Index on `content_items(section, status, published_at desc)`.
- Indexes on foreign keys and join-table lookup columns.
- Unique indexes on author and category slugs.
- Unique constraint on each content/tag pair and content/author pair.
- Index on `media_assets(bucket_id, object_path)`, with uniqueness if object paths are not intended to be reused.

Avoid adding speculative indexes before query patterns are known. Review query plans after representative content volume exists.

Use foreign-key delete behavior deliberately:
- Prefer restrict or soft deactivation for authors, categories, and sources that have historical attribution.
- Avoid cascading deletion of published content or referenced media.
- Decide whether a media asset can be deleted while referenced by content; default should be to prevent accidental orphaning.

## 10. RLS and security model

RLS is mandatory for application tables exposed through Supabase APIs.

Policy design must cover:

- Anonymous read of published content only.
- Staff read of drafts according to role and ownership.
- Author insert/update limited to authorized draft records.
- Editor/admin publishing and archival privileges.
- Public read of only active categories, tags, author profiles, and published media metadata as appropriate.
- No anonymous writes to editorial tables.
- Storage upload/update/delete limited to authorized staff.
- No broad policy based solely on a client-provided role field.

The role lookup mechanism must avoid recursive RLS dependencies. A carefully secured helper function or a narrowly scoped role lookup policy may be used after implementation review.

## 11. Operational and implementation boundaries

- PostgreSQL is the source of truth for structured editorial records.
- Supabase Storage holds file objects; PostgreSQL holds metadata and object references.
- Next.js server components and server-side routes may read public content and perform authorized staff operations.
- The browser must never receive secret/service-role credentials.
- All schema changes must be represented by ordered SQL migrations committed to GitHub.
- Do not edit the hosted production schema manually without a corresponding reviewed migration.
- Test migrations and RLS locally before applying them to the hosted production project.
- Keep `auth`, `storage`, `realtime`, and other Supabase-managed schemas separate from application-owned objects.

## 12. Deferred capabilities

Do not create these tables in the first migration unless a later approved requirement makes them necessary:

- Political issues, files, events, actors, organizations, and entity relationships.
- Knowledge graph edges and event timelines.
- Editorial review assignments and multi-stage approvals.
- Detailed revision snapshots and collaborative editing.
- Analytics events and audience metrics.
- Paid accounts, subscriptions, and researcher entitlements.
- Advanced localization and multi-language content variants.

The initial design should leave room for these capabilities without prematurely implementing them.

## 13. Open questions before migration approval

The following implementation details remain technical configuration tasks rather than unresolved product decisions:

1. Implement and validate the section-to-format allowlist described below.
2. Enforce the initial image defaults (JPEG, PNG, WebP, AVIF; 10 MB maximum; 2560 px maximum longest edge) in upload validation and document any operational adjustment.
3. Implement the mandatory source attribution rule for news items and validate it at publication time.

## 14. Approval gate

This document records the approved version 1.0 product and technical design baseline. It authorizes drafting and local testing of migrations, but it is not permission to apply a migration to the hosted production database.

Before the first migration:

1. Review the exact table and column definitions against this approved baseline.
2. Review RLS policies and Storage policies, including the implications of a public media bucket.
3. Create the SQL migration on a feature branch.
4. Test it locally, including positive and negative authorization tests and the news-source publication constraint.
5. Inspect the remote dry-run and target project identity.
6. Apply to the hosted project only after explicit approval.
