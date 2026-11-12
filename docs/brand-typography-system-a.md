# SAS Platform — Typography System A

## Decision

Approved direction: **System A — Tajarib Taweel + Thmanyah Sans**.

The system separates editorial expression from functional communication:

- **Tajarib Taweel** is the editorial display face for prominent headlines and publication titles.
- **Thmanyah Sans** is the functional face for body copy, interface labels, navigation, cards, metadata, tables, and operational headings.

## Usage matrix

| Context | Typeface | Initial weight |
|---|---|---:|
| Public landing-page hero headline | Tajarib Taweel | 500 |
| Article title | Tajarib Taweel | 500 |
| Research/report title | Tajarib Taweel | 500 |
| Functional section headings | Thmanyah Sans | 700 |
| Article subheadings | Thmanyah Sans | 700 |
| Body copy and summaries | Thmanyah Sans | 400 |
| Navigation, buttons, metadata | Thmanyah Sans | 500 |
| Tables and data labels | Thmanyah Sans | 400–500 |

## Implementation tokens

- `--font-display`: Tajarib Taweel
- `--font-body`: Thmanyah Sans
- `--font-interface`: Thmanyah Sans

Existing licensed local font files are reused from `public/fonts/`. No external font CDN is introduced.

## Editorial template review

The internal route `/brand-preview/editorial` tests:

1. A long headline across multiple lines.
2. An editorial article with deck, metadata, body paragraphs, subheadings, and quotation.
3. A research report with title, metadata, executive summary, key themes, and a table.

All content on the specimen route is explicitly marked as design-only and must not be treated as published research or reporting.

## Design constraints

- Do not use Tajarib Taweel for dense body copy, navigation, or repeated operational labels.
- Do not use Thmanyah Sans bold for every editorial headline; preserve the display face's distinctive role.
- Keep reading line-height generous and constrain long-form text width.
- Preserve RTL layout and responsive behavior.
- Keep this typography system consistent across public content templates and the admin interface.

## Acceptance checks

- Arabic text renders using the local font files at all declared weights.
- Long headlines wrap without clipping at desktop and mobile widths.
- Article body and report text remain comfortable to read.
- Functional headings remain visually distinct from editorial titles.
- No changes to Supabase schema or migrations are required for this design phase.
