# Public Editorial Experience — Stabilization Package 01

**Branch:** `fix/public-editorial-stability-v1`  
**Base:** `feat/public-editorial-experience-v1`  
**Base commit:** `365f486bde8decd3e219ebcdce672bc025f9a495`  
**Status:** Code changes committed to GitHub; local verification pending.

## Scope

This package stabilizes two confirmed implementation details in the public editorial experience without changing database schema, Supabase policies, authentication, or deployment settings.

## Changes

1. The global Arabic fallback/body font now defaults to Thmanyah Sans. Editorial display roles continue to use the semantic System B font tokens. This prevents unclassified interface controls and inherited text from falling back to Tajarib Taweel.
2. News and research content-card headlines now use the approved Tajarib Taweel 900 semantic weight rather than 700.
3. Public feed and public detail queries no longer convert database/API failures into ordinary empty results or a misleading 404. They log the failure and throw an explicit server error; a genuinely empty result remains an empty array, and a genuinely missing slug remains null.

## Verification status

- GitHub source changes: committed on this package branch.
- TypeScript and production build: pending CI on the package branch.
- Local Windows build and responsive visual review: pending synchronization by the operator.
- Supabase schema and RLS: unchanged.
- Vercel deployment: not triggered by this package.
- Font licence confirmation: still required before public production release.

## Known environment facts at review time

- Supabase project `SAS_Platform` is active and healthy.
- Public editorial tables have RLS enabled.
- The content and media tables currently contain no rows; the authors and user_roles tables each contain one row.
- Supabase security advisor reports leaked-password protection disabled (warning).
- Performance advisor reports 12 unused indexes. These are informational at the current low data volume and are not removed in this package.
