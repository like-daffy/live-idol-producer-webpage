# Live-Idol Producer Directory design system

## Product and architecture

Help Korean and Japanese live-idol artists find music collaborators by producer profile, genre, representative songs, and actual participation credits. A single static route `/` with five category anchors; no framework or backend. The browser joins three published Google Sheets feeds by permanent IDs. Directory discovery, multilingual search, featured songs, extra-song accordions, listening links, and contact links are the core jobs.

Categories stay in this order: Find actively, Chika Idol Active, Subculture, Hybrid, Overseas. Preserve Korean category labels and Japanese/Korean text. The roles are exactly Produce (compose and arrangement included), Mix & Mastering, Vocal Director, Bass, Drum. Lyricist is excluded. Role badges represent each person's credits on a song. Do not invent capabilities, availability claims, album art, statistics, contact information, or data filters.

## Historical source baseline — canvas version 1

Before the approved theme feature, the page had no dark theme. The values below describe the original canvas version 1 for historical reproduction only. Current implementation and future refinements use the approved theme section below.

Colors: background #ffffff, surface #f8f9fa, border #e9ecef, primary text #1a1a2e, secondary #6c757d, accent #00e5ff, accent-dark/link #00b8cc. Font: Noto Sans KR, Noto Sans JP, system sans-serif. Body 16px/1.6. Original type: brand 1.05rem/700, section 1.4rem/700, profile 1rem/500, comment .875rem, song .8rem, role .68rem.

Sticky header 56px. Centered 1100px container with 24px gutters. Search 44px tall just below the header; no hero. Five category sections with 64px top spacing. Full-width horizontal cards in a single column, 16px gap; cards 20px 24px padding, 12px radius, 24px internal gap, left profile column 240px, right songs/description/contact. At <=640px cards stack, gutters become 16px, brand is hidden and navigation scrolls horizontally. Featured songs stay visible, additional songs expand. Footer has the complete original KR/JP disclaimers. Text brand only; no product logo or photos. Twitter-X.svg is an exact social icon, not a brand asset.

## Approved light/dark design — current implementation

One coherent responsive design with a working light/dark switch. Keep the original white-and-cyan identity, make spacing and hierarchy modern, and add a deep charcoal/navy-and-cyan dark concept. This is a useful directory, not a marketing landing page.

Light tokens: page #ffffff, inset surface #f6fafb, card #ffffff, border #dfe9ed, text #14252d, muted #566b76, cyan accent #00e5ff, accessible cyan text/link #007f91, cyan tint #e6fafd, focus #009fb6. Dark tokens: page #091319, inset surface #0f1e26, card #12232d, border #263d48, text #edf8fb, muted #a3bac5, cyan accent #00e5ff, cyan text/link #58deee, cyan tint #143640, focus #58deee. Use cyan for active navigation, genre tags, links, focus indicators and restrained details. No purple, pink, decorative gradients or glow-heavy effects. Native color-scheme must follow the selected theme; all text, forms, search results, overlays, dividers, accordions, footer, and the X icon must work in both themes.

Typography stays Noto Sans KR / Noto Sans JP / system. Body 16px; card names around 18px/700; section headings 22-24px/700; body/song text 14px, secondary text 13-14px, role labels 11-12px. Maintain readable CJK line spacing. Modern cards use restrained borders, 12-16px radii, 20-24px padding, minimal shadows. Spacing scale 4/8/12/16/20/24/32/40/48/64px. Keep centered 1100px desktop content and single-column horizontal profile rows; avoid a dense card grid.

The theme control must remain visible on every viewport, with a 44px minimum hit area, keyboard support, a bilingual accessible label and visible focus. Use a simple sun/moon control; default to system appearance when no preference is stored, remember explicit selection using localStorage, initialize before paint, handle unavailable storage, and follow OS changes only while no explicit selection exists. Preserve input, search state, scroll and expanded accordions while switching. A CSS theme change is preferable to rerendering the directory.

## Responsive behavior

Desktop >=1024px: horizontal header with text brand, category navigation and theme control; horizontal profile cards. Tablet 641-1023px: a brand/control first row and horizontally scrollable category navigation below; narrower profile column (180-200px), comfortable song space, no page-level horizontal overflow. Mobile <=640px: compact brand/control top row, independently scrolling navigation, vertically stacked cards, 16px outer gutters, 16-20px card padding. Do not hide the theme switch. Support widths 320, 375, 390, 768, 1024 and 1440px. Long names, song titles, URLs and role sets wrap inside min-width:0 containers. Search results fit the viewport and scroll. Touch controls are >=44px where practical; use a 16px search input to avoid mobile zoom. Account for sticky-header anchor offsets.

## Motion and semantics

Use subtle 150-200ms color/border/accordion transitions only. Respect prefers-reduced-motion. Provide visible focus in both modes, semantic headings/navigation/buttons, sufficient text contrast, aria-expanded on accordions, and accessible search labels. Preserve loading/error states and the exact complete bilingual footer copy. No new pages or unrelated product features. Implementation remains inline CSS and vanilla JavaScript in public/index.html after design approval.
