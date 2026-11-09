# Development and database workflow

## Source-of-truth rules

- GitHub is authoritative for application code.
- `supabase/migrations/` in GitHub is authoritative for application database changes.
- The hosted Supabase project is the remote execution target and must be reconciled against the migrations in the checked-out branch.
- A dashboard or ad-hoc SQL change is not complete until its intended effect is represented in a reviewed migration and the remote migration history is reconciled.
- Do not put credentials, database passwords, access tokens, or secret keys in GitHub.

## Branch lifecycle

1. Create a focused branch from `main`.
2. Fetch and check out that branch locally.
3. Implement application code and, when needed, its SQL migration in the same branch.
4. Run local checks and replay the migration chain against the local database.
5. Review the exact SQL diff before any hosted change.
6. Preview remote migration changes.
7. Apply only the reviewed migrations to the intended Supabase project.
8. Verify remote migration history and relevant schema objects.
9. Open a pull request; merge only after code and database checks pass.

Do not develop directly on `main`.

## Supabase CLI baseline

The project baseline is **Supabase CLI 3.1.0**. Keep the CLI version pinned; do not use an unpinned `latest` in local setup or CI.

CLI v3 changes database-command targeting. Commands that should reach the hosted database must explicitly use `--remote`. Do not copy older CLI examples that rely on `--linked` without checking the installed CLI version.

## Safe command sequence

After cloning the repository and installing the pinned CLI:

```bash
supabase --version
supabase login
supabase link --project-ref <PROJECT_REF>
```

Create each migration through the CLI so its timestamp and filename follow the expected format:

```bash
supabase migration new <descriptive_name>
```

Apply and verify the migration chain locally:

```bash
supabase start
supabase db reset
supabase migration list
```

Before applying migrations to the hosted project, inspect the pending change set:

```bash
supabase db push --remote --dry-run
```

Only after reviewing the output and confirming the target project, apply:

```bash
supabase db push --remote
supabase migration list --remote
```

Hosted changes require explicit confirmation. Never bypass that confirmation for routine work.

## Prohibited shortcuts

- Do not use `db reset --remote` as a routine synchronization method; it is destructive.
- Do not use `--force`, migration repair, or history manipulation to make a mismatch disappear.
- Do not apply a schema change directly to the hosted database and leave it undocumented.
- Do not merge a branch while its migrations are missing, untested, or out of sync with the remote history.
- Do not expose `SUPABASE_SECRET_KEY` in browser code or any `NEXT_PUBLIC_*` variable.

## Current database baseline

The initial inspection found no application tables in `public` and no application migrations in the Supabase migration history. Supabase-managed schemas such as `auth`, `storage`, and `realtime` are present and must not be treated as application-owned schema.

No application tables or policies should be created until the platform data model and access model are reviewed.
