# Live-Idol Producer Directory

## Project

Static single-page directory using HTML, CSS, and vanilla JavaScript. Google Sheets TSV feeds load in the browser at runtime; there is no backend or build step.

All webpage work goes in `public/index.html`, with inline CSS and JavaScript. Netlify publishes `public/` via `netlify.toml`.

## Data and schema

Read [docs/song-credits.md](docs/song-credits.md) before changing the data model.

The live workbook has three active tabs:

- `producers`: profiles and permanent `producerId` values.
- `songs`: one row per song/recording with a permanent `songId`.
- `credits`: one row per contributor/song with five role checkboxes and a contributor-specific `featured` checkbox.

The five roles are exactly: `Produce`, `Mix & Mastering`, `Vocal Director`, `Bass`, `Drum`. Produce includes composing and arranging. Lyricist credits are not managed here. Do not infer a person's role on a song from their general profile or services.

Use IDs to join data; display names and titles may change. Read TSV fields by header, including quoted tabs/newlines and CJK text. Every header documented in the schema is required; optional cell values may be blank. Missing columns and broken ID references must surface a loading error instead of silently dropping credits.

Keep all three sample files in sync with schema changes:

- `data/producers-sample.tsv`
- `data/songs-sample.tsv`
- `data/credits-sample.tsv`

Never put build artifacts or auto-generated files in `data/` or `docs/`.

`songs_legacy_20261002` retains the pre-migration data. It is not the new code's data source.

## Published data

Use the existing published TSV URL base in `public/index.html`, with:

- producers: gid `1615162975`
- songs: gid `2138418263`
- credits: gid `2138418264`

Published feeds must work without authentication. Coordinate live schema changes with the website reader and preserve the data.

## Categories

Use these exact values and order:

1. Find actively
2. Chika Idol Active
3. Subculture
4. Hybrid
5. Overseas

Sections with no profiles are hidden. Navigation closes search before scrolling and updates the active link through IntersectionObserver. Respect reduced-motion preferences.

## Display and interaction

- Cards show genre, name, optional idol name/comment, representative songs, and contact/site links.
- Each song shows its clean artist name and the contributor's selected role badges.
- Featured tracks remain visible. Other tracks use an accordion when there are at least three tracks; smaller lists show all tracks.
- Search indexes profiles independently of credits and matches names, titles/alternate titles, artists/alternate names, and participation roles. Producer result links close search and scroll to the matching card.
- Keep credit management notes and credit source URLs in the sheet.
- Preserve contact handles including full-width `＠`. Open external links with `noopener noreferrer`.
- Normalize scheme-less site/song URLs to HTTPS and validate HTTP/HTTPS URLs before rendering links.

Run `node --test tests/directory.test.mjs` for URL, profile search, schema, navigation, and TSV regression checks.

## Language and design

Support Korean and Japanese throughout. Use UTF-8 and the existing CJK-compatible `Noto Sans KR` / `Noto Sans JP` font stack. Preserve multibyte text.

Use the approved SuperDesign white/cyan light and deep charcoal/cyan dark themes. All surfaces, forms, text, links, badges, and icons must follow the selected theme. Default to system appearance, initialize before paint, and remember explicit choices with `ld-theme` in localStorage. Storage failures must not break the page or allow OS changes to override a user's selection during the session.

Keep sticky navigation and single-column profile cards. At 1023px and below, use a brand/theme-control row with independently scrolling category navigation below. At 640px and below, stack the card columns. Keep the 44px theme control visible, and let long CJK text, song titles, contact URLs, and role badges wrap. Respect reduced-motion preferences and sticky-header anchor offsets.

## Deployment

Netlify deploys the connected GitHub branch on push. A local code edit alone does not update the deployed HTML. Content edits in published Sheets feeds appear without redeploying.

The original specification in `docs/chika-idol-producer-webpage.md` is historical; the current schema is in `docs/song-credits.md`.
