# SAS Platform

SAS Platform is the digital information and research platform for structured political knowledge, events, issues, sources, documents, maps, and editorial products.

## Planned application stack

- **Web application:** Next.js and TypeScript
- **Data platform:** Supabase (PostgreSQL, Auth, Storage, and Edge Functions when required)
- **Deployment:** Vercel
- **Version control:** GitHub

## Engineering principles

1. GitHub is the source of truth for application code and database migration files.
2. Every application database change must be represented by a reviewed, ordered SQL migration under `supabase/migrations/`.
3. The hosted Supabase project is an execution and verification target, not an undocumented schema-authoring source.
4. No migration is considered complete until its application status is reconciled with the remote Supabase migration history.
5. Never commit credentials, access tokens, database passwords, or service-role keys.
6. Keep Supabase-managed schemas (such as `auth`, `storage`, and `realtime`) separate from application-owned schema changes.

## Development workflow

- Work on a feature or maintenance branch; do not develop directly on `main`.
- Pull the branch from GitHub before local work.
- Make code and migration changes together where applicable.
- Test locally before opening a pull request.
- Review the migration files and remote migration history before merging.
- Merge only after code checks and database reconciliation pass.

See [Development Workflow](docs/development-workflow.md) for the operational rules.

## Current application scope

The repository contains the initial editorial database and protected CMS foundation, plus the first public editorial experience:

- Public homepage and section pages for news, analysis, research, and media.
- Public content detail pages backed by published Supabase records.
- Shared production components using the approved System B typography.
- Protected admin workspace for content, sources, categories, and media.
- Main cover-image selection from the media library.

See [Public Editorial Experience v1](docs/public-editorial-experience-v1.md) for the public rendering rules, typography mapping, route structure, and current release boundaries.

## Local development

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. Run `npm install`.
4. Run `npm run dev`.

Use `npm run typecheck` and `npm run build` before opening or updating a pull request.
