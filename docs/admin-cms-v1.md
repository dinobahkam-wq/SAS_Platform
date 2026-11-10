# SAS Platform â€” Admin CMS v1

## Scope

This delivery establishes the first working administrative workspace for SAS Platform. It is an admin-only CMS foundation, not yet the final public publishing website.

## Architecture

- Next.js 16 App Router with server-rendered administrative pages and Server Actions.
- Supabase Auth using cookie-based SSR sessions through `@supabase/ssr`.
- JWT verification with `auth.getClaims()` in the request proxy and protected server layouts.
- Supabase Postgres remains the content system of record.
- GitHub branch `feat/editorial-database-v1` remains the source of truth for application code and migrations.
- No service-role key is used by the web application.

## Implemented routes

- `/login`: email/password sign-in, restricted to active admin users.
- `/admin`: dashboard with live database counts and recent content.
- `/admin/content`: list, section/status filters, create and edit.
- `/admin/sources`: register and browse editorial sources.
- `/admin/categories`: register and browse shared categories.
- `/admin/media`: upload and browse public media assets.

## Content workflow

- Content is created initially as a draft.
- Author relationship is linked to the signed-in administrator when an author profile exists.
- Selected sources are linked before a requested publication status is applied.
- Editing synchronizes source relationships without removing the last source from a published news item.
- A cover image can be selected from the medi¶»§q«^