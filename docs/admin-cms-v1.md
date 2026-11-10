# SAS Platform — Admin CMS v1

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
- Database trigger rules remain authoritative: a news item cannot be published without at least one source.
- Body text is stored as a versioned JSONB paragraph-block structure. A rich-text editor is intentionally deferred.

## Security

- All administrative routes require a verified Supabase JWT and an active `admin` row in `public.user_roles`.
- Authorization is checked on the server, not merely in client navigation.
- All writes use the request-scoped authenticated Supabase client and remain subject to RLS.
- Only the publishable key is used in the browser and server application.
- Media uploads accept JPEG, PNG, WebP, and AVIF, with a 10 MiB maximum. The client checks the longest edge against 2560 px; database/Storage policies still enforce the authoritative MIME and byte-size limits.
- The public media bucket is public by design. Do not upload embargoed or confidential files.

## Required local configuration

Copy `.env.example` to `.env.local` and fill in the project URL and publishable key from Supabase Project Connect / API Keys. Never commit `.env.local`.

## Known limitations / next work

- The lockfile must be regenerated with `npm install` after pulling the dependency additions.
- No local build can be claimed until dependencies are installed on the developer workstation.
- Rich text, image embedding within article body, tag management, author management, preview, audit log, and public content rendering are next iterations.
- The first version is deliberately admin-only, matching the current operating decision.
