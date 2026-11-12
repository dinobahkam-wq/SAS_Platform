# SAS Platform — Editorial Database Implementation v1.0

**Project:** SAS_Platform  
**Supabase ref:** `budsfbyrdpjkobqstpyr`  
**Branch:** `feat/editorial-database-v1`  
**Implementation date:** 2026-11-10

## Deployment record

The initial editorial schema has been applied to the empty SAS_Platform Supabase project through the Supabase management connection. No existing project was deleted or replaced.

| Remote version | Migration |
|---|---|
| 20261110083540 | create_editorial_core |
| 20261110083708 | create_editorial_policies |
| 20261110083721 | create_editorial_storage |
| 20261110083803 | optimize_editorial_policies_and_indexes |
| 20261110083917 | tighten_anonymous_editorial_privileges |

## Created data model

Ten public tables:
- content_items
- authors
- content_authors
- categories
- tags
- content_tags
- media_assets
- content_sources
- content_source_links
- user_roles

The private schema contains authorization and trigger helper functions. All ten public tables have RLS enabled.

## Implemented controls

- Four sections and their approved format allowlists.
- Draft, published, and archived statuses.
- Published content is publicly readable; drafts and archives are not publicly readable.
- Authors can manage their own drafts; editors can manage drafts and publish them; only admins can modify already-published content.
- News publication requires at least one linked source.
- The final source link cannot be removed from a published news item.
- Public media bucket `sas-public-media`, with 10 MiB maximum and JPEG, PNG, WebP, and AVIF MIME allowlist.
- Anonymous roles have read-only privileges on public editorial tables; no anonymous write privileges.
- Storage uploads are restricted to authenticated editorial staff; replacement and deletion are admin-only.

## Verification

- Supabase migration history reports all five versions above.
- Ten public tables exist and all ten have RLS enabled.
- News-source publication and last-source protection trigger tests passed.
- Anonymous RLS test returned zero visible draft records.
- Anonymous privileges: SELECT allowed for public content; INSERT/UPDATE denied; user_roles SELECT denied.
- Storage bucket configuration matches the approved MIME and size limits.
- Supabase Security Advisor: no findings.
- Performance Advisor: no unindexed foreign-key findings and no multiple-permissive-policy findings. Remaining unused-index notices are expected on an empty database and should be re-evaluated after real query traffic.

## Operational caveats

1. No Auth users exist yet. The first platform administrator must be created in Supabase Auth and assigned the `admin` role through a trusted administrative operation. There is deliberately no self-service role escalation.
2. The 2560 px longest-edge image limit must also be enforced by the Next.js upload pipeline; Storage enforces MIME types and the 10 MiB file-size limit, not image dimensions.
3. The bucket is public by design. Any uploaded object in it is publicly retrievable if its URL is known, including an asset uploaded for a draft. Embargoed or confidential media must use a separate private staging bucket before production use.
4. Docker is not installed on the developer machine. Remote verification was performed through Supabase tools; a local Docker-based migration replay and authenticated-role integration tests remain to be completed before the next production release.
5. GitHub branch contents must be reconciled with the local Next.js working tree before pulling these migration files into the developer machine.
