# SuperDesign repository init

Source: the current main working tree, including the live song-credit migration.
Stack: static HTML, vanilla JavaScript, inline vanilla CSS, custom DOM components; no dependency manifest or build step. Netlify serves public/.

# Extractable components

## DirectoryNavigation
- Source: `public/index.html`
- Category: layout
- Description: Sticky text brand and five category anchors.
- Extractable props: activeSection; per-page navigation URLs
- Hardcoded: brand text, category labels/order, CSS; no image logo

## DirectoryFooter
- Source: `public/index.html`
- Category: layout
- Description: Korean/Japanese disclaimers.
- Extractable props: none
- Hardcoded: disclaimer copy and language labels

## ProducerCard
- Source: `public/index.html`
- Category: basic
- Description: Profile, contact links, song credits, and accordion.
- Extractable props: isExpanded; songCount; contact/site visibility
- Hardcoded: layout, chevron SVG, role vocabulary, social icon

## SongCreditRow
- Source: `public/index.html`
- Category: basic
- Description: Song/artist, optional link, and role badges.
- Extractable props: hasLink; role visibility
- Hardcoded: role labels, typography, music-note marker

## CreditRoleBadge
- Source: `public/index.html`
- Category: basic
- Description: Small text badge with bilingual tooltip.
- Extractable props: visible
- Hardcoded: five role names and descriptions

## DirectorySearch
- Source: `public/index.html`
- Category: basic
- Description: Search input, dismiss button, results, and overlay.
- Extractable props: query; isOpen; resultCount
- Hardcoded: multilingual placeholder and empty-state copy

## GenreBadge
- Source: `public/index.html`
- Category: basic
- Description: Turquoise tinted genre label.
- Extractable props: visible
- Hardcoded: padding, palette, type scale
