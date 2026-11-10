# SAS Editorial Products — System B Specimen

## Purpose
An internal, non-production review of the proposed System B typography hierarchy across three distinct editorial products: breaking news, an opinion/analysis article, and a strategic research report.

Route: `/brand-preview/editorial-ab/products`

## Typography hierarchy under test

| Role | Typeface | Weight |
|---|---|---:|
| Primary / urgent headline | Tajarib Taweel | 900 |
| Article and research product title | Thmanyah Serif Display | 700 |
| Main internal heading (H4) | Thmanyah Serif Display | 500 |
| Secondary internal heading (H5) | Tajarib Taweel | 500 |
| Body, deck, metadata, interface labels | Thmanyah Sans | 400 |

## Product specimens

1. **Breaking news:** tests rapid scanning, headline authority, and separation of the urgent label, category, source, timestamp, summary, and follow-up context. The main headline uses Tajarib 900.
2. **Opinion article:** tests long-form reading, title/deck distinction, internal heading hierarchy, body rhythm, quotation treatment, and supplementary metadata. The article title uses Serif Display 700; H4 uses Serif Display 500; H5 uses Tajarib 500.
3. **Strategic research report:** tests the formal cover title, report metadata, executive summary, internal headings, and report outline. The cover title uses Serif Display 700; internal heading levels follow the same H4/H5 roles.

## Scope and safeguards

- Internal visual specimen only. Production typography tokens, public templates, and the admin interface remain unchanged.
- All headlines, sources, timestamps, and report details are fictional layout copy. They are not published news, official statements, or factual claims.
- The page metadata sets `robots: noindex, nofollow`.
- No database, Supabase migration, or storage changes are required.
- The implementation references the font assets already in the repository. Public production use remains subject to the applicable font licences.
