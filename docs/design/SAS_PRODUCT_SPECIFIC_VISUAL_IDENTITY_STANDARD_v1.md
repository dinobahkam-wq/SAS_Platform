# SAS — Product-Specific Visual Identity Principle
Version: 1.0 (proposed design standard)
Date: 2026-11-23
Status: Product-specific identity framework proposed; Visual Knowledge homepage portal and gallery layout approved 2026-11-23
Applies to: Homepage, product landing pages, content viewers, CMS previews

## Governing principle
Every SAS product shall use a recognizable sub-identity whose composition follows its **definition, audience, informational unit, interaction model, and trust requirements**. This sub-identity remains nested in the SAS master brand; it must not fragment the parent brand.

Do not apply the same generic article-card layout to every product. Product function, not decoration, determines visual form.

## Invariants across all products
- SAS brand mark and coherent teal/neutral palette
- Arabic RTL, Latin numerals, Tajarib/Thmanyah typography
- Authentic sources and provenance; no invented images or numerical claims
- Consistent navigation, accessibility, contrast, focus states and responsive behavior
- Explicit distinctions between published facts, analysis and illustrative reconstruction
- Keyboard navigation, reduced motion preference, alternative text and sensible mobile layout

## Distinct product identities

| Product | Primary job | Dominant unit | Interface | Motion |
|---|---|---|---|---|
| Daily briefing | Structured, sourced situational awareness | Evidence-backed development | Dense scan-friendly numbered entries, metadata, citations | Minimal utility only |
| Analysis & studies | Extended interpretation and argument | Research paper / analytical piece | Typographic hierarchy, cover, abstract, author/sources | Near-static |
| Visual knowledge | Understand relations, processes, timelines and geography at a glance | Visual object (card/map/infographic/diagram) | Gallery-first covers, visual workspace, controls and full-image viewer | Purposeful explanatory transitions |
| Video & programs | View / listen to an editorial program | Episode | Media poster, duration, presenter, player | Media-led |

## Visual Knowledge — approved direction to prototype
**Editorial concept:** Visual Knowledge Atlas / Gallery & Explorer
**Design premise:** the image, map, chart or diagram IS the primary content; surrounding text is orientation, controls and attribution.

### Homepage module — APPROVED 2026-11-23
- **No publication cards or specific visual items appear on the homepage in this section.**
- A dedicated visual atlas portal communicates product purpose through original vector/abstract illustrations of maps, charts and knowledge cards, not simulated published news.
- One primary action: “استكشف المعرض”, pointing to /visual-knowledge.
- Keep SAS identity, RTL, fonts and functional contrast; distinct cartographic background and layered illustration.
- On phones, the illustration precedes introductory text and action without horizontal overflow.

### Section landing page — APPROVED 2026-11-23
- Gallery-first display of actual published media assets from Supabase, NOT a lead article / text editorial module.
- Search, sort by publication date and type filters. Only display filters represented by actual published formats; extend taxonomy when new formats are supported by the CMS.
- Grid responsive: 3 columns desktop, 2 tablet, 1 mobile, preserving image aspect ratios with object-fit: contain.
- Cover opens the original image; article title opens its canonical contextual detail page.
- Type, date and concise caption appear below artworks. No manufactured illustrative posts or placeholder article records.
- Keep original files unchanged; publishing metadata and any future cover-versus-artwork split are separate editorial workflows.
- The gallery may paginate as content grows beyond the current server feed ceiling; do not imply exhaustive history once there are more than the API limit.

### Single visual item viewer
- **Visual stage:** image-fit by default, zoom (when useful), open original, download/share if permissions allow, source and update date.
- Full single-screen communication is an editorial content requirement, NOT a ban on browser scrolling at small sizes; on phones allow zoom/pan or responsive alternative to preserve legibility.
- The item must be comprehensible as a visual independent of long article prose; attribution and context may live below/alongside in a collapsible panel.
- For maps/charts, interaction should reveal information not merely animate decoration.
- Separate cover/thumbnail from original full-resolution asset. The cover should have a distinct design and brief title; the main artwork remains complete, unaltered.
- Support source/status labels: verified source, analysis, conceptual illustration, historical reconstruction, last updated.

## Media model / CMS considerations (future phase)
- content format (infographic, visual_card, interactive_map, diagram, timeline, chart)
- cover_asset_id separate from primary_visual_asset_id
- cover_alt, visual_alt and optional long_description
- source references, temporal currency, geographic scope, editorial review state
- optional thumbnail crop / mobile alternative / aspect ratio metadata
Do not migrate existing schema until the actual editorial workflow and backwards-compatibility plan are agreed.

## Acceptance checks
1. A user understands the subject and output form from the preview in <=5 seconds (qualitative usability check).
2. Visual dominates composition, and the CTA matches the medium.
3. Mobile text is legible, with an explicit full-resolution path.
4. Source/date/status can be found without guessing; image origin and usage rights are recorded in CMS.
5. No layout shifts, overflow, distorted crops, or hover-only essential actions.
6. The four product sections are visibly distinct but identifiably SAS.

## External inspiration (patterns, not licenses)
- Reuters Graphics: https://reutersagency.com/content/content-types/graphics/
- Financial Times Visual Vocabulary: https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md
- Our World in Data Grapher: https://ourworldindata.org/redesigning-our-interactive-data-visualizations
- Datawrapper responsive visualization: https://www.datawrapper.de/academy/how-to-change-the-size-of-your-visualizations
- The Pudding resources: https://pudding.cool/resources/

## Decision boundary
The Visual Knowledge portal and gallery interface are approved for development branch implementation. Further design system changes, publishing, database schema changes and production deployment require separate approval.