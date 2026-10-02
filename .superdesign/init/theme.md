# SuperDesign repository init

Source: the current main working tree, including the live song-credit migration.
Stack: static HTML, vanilla JavaScript, inline vanilla CSS, custom DOM components; no dependency manifest or build step. Netlify serves public/.

# Part 1 — Compact token summary

- Palette: --bg #ffffff; --surface #f8f9fa; --border #e9ecef; --text-primary #1a1a2e; --text-secondary #6c757d; --accent #00e5ff; --accent-dark and --link #00b8cc. No dark theme.
- Fonts: Noto Sans KR, Noto Sans JP, -apple-system, BlinkMacSystemFont, sans-serif; weights 300/400/500/700 from Google Fonts; body 16px, line-height 1.6.
- Type: brand 1.05rem/700; section title 1.4rem/700; name 1rem/500; idol 0.85rem/300; comment 0.875rem; track 0.8rem; genre 0.7rem; role 0.68rem; disclaimer 0.78rem.
- Layout: max-width 1100px, desktop gutters 24px, sticky header 56px; section top spacing 64px; one-column card list with 16px gaps; card padding 20px 24px, gap 24px, profile column 240px.
- Observed spacing: 2/4/6/8/10/12/14/16/20/24/32/48/64/80px; no framework scale.
- Radii: role/genre 4px, nav 6px, search 10px, card 12px. Song text and role badges wrap.
- Shadows: card 0 2px 8px rgba(0,0,0,0.04); hover 0 4px 16px rgba(0,229,255,0.12); results 0 8px 32px rgba(0,0,0,0.12).
- Mobile breakpoint 640px: 16px gutters, vertical cards, 48px sections, hidden text brand, horizontally scrollable navigation.
- Search: input height 44px, result max-height 60vh, overlay rgba(0,0,0,0.4); z-index overlay 85/results 95/header 100.
- Brand is text. Twitter-X.svg is a social icon, not a product logo. No photographic imagery is supplied.

# Part 2 — Raw source

## CSS variables

```css
:root {
      --bg: #ffffff;
      --surface: #f8f9fa;
      --border: #e9ecef;
      --text-primary: #1a1a2e;
      --text-secondary: #6c757d;
      --accent: #00e5ff;
      --accent-dark: #00b8cc;
      --link: #00b8cc;
    }
```

## Complete inline stylesheet: public/index.html

```css
:root {
      --bg: #ffffff;
      --surface: #f8f9fa;
      --border: #e9ecef;
      --text-primary: #1a1a2e;
      --text-secondary: #6c757d;
      --accent: #00e5ff;
      --accent-dark: #00b8cc;
      --link: #00b8cc;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Noto Sans KR', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text-primary);
      font-size: 16px;
      line-height: 1.6;
    }

    /* ── GNB ── */
    header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--bg);
      border-bottom: 1px solid var(--border);
      height: 56px;
    }

    .gnb-inner {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 24px;
      height: 100%;
      display: flex;
      align-items: center;
      gap: 32px;
    }

    .gnb-brand {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-primary);
      white-space: nowrap;
      text-decoration: none;
      flex-shrink: 0;
    }

    nav {
      display: flex;
      align-items: center;
      gap: 4px;
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    nav::-webkit-scrollbar { display: none; }

    nav a {
      text-decoration: none;
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 400;
      padding: 6px 12px;
      border-radius: 6px;
      white-space: nowrap;
      transition: color 0.15s, background 0.15s;
    }
    nav a:hover { color: var(--text-primary); background: var(--surface); }
    nav a.active {
      color: var(--accent-dark);
      font-weight: 500;
      background: rgba(0, 229, 255, 0.1);
    }

    /* ── Main ── */
    main {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 24px 80px;
    }

    /* ── Loading / Error ── */
    #loading {
      text-align: center;
      padding: 80px 0;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    /* ── Sections ── */
    .category-section {
      padding: 64px 0 0;
    }

    .category-section h2 {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 2px solid var(--border);
    }

    /* ── Card Grid ── */
    .card-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }

    /* ── Producer Card ── */
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: row;
      gap: 24px;
      transition: box-shadow 0.2s ease, border-color 0.2s ease;
    }
    .card:hover {
      box-shadow: 0 4px 16px rgba(0, 229, 255, 0.12);
      border-color: var(--accent);
    }

    .card-left {
      flex: 0 0 240px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .card-right {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 0;
    }

    .card-genre {
      display: inline-block;
      background: rgba(0, 229, 255, 0.12);
      color: var(--accent-dark);
      border-radius: 4px;
      padding: 2px 8px;
      font-size: 0.7rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      align-self: flex-start;
    }

    .card-name {
      font-size: 1rem;
      font-weight: 500;
      color: var(--text-primary);
      line-height: 1.3;
    }

    .card-idol {
      font-size: 0.85rem;
      font-weight: 300;
      color: var(--text-secondary);
    }

    .card-comment {
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.6;
      flex: 1;
      white-space: pre-wrap;
    }

    .card-tracks {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .card-track {
      display: flex;
      align-items: baseline;
      gap: 6px;
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .card-track::before {
      content: "♪";
      color: var(--accent-dark);
      flex-shrink: 0;
    }

    .card-track a {
      color: var(--text-secondary);
      text-decoration: none;
      transition: color 0.15s;
    }
    .card-track a:hover { color: var(--accent-dark); text-decoration: underline; }

    .track-info, .credit-roles {
      display: inline-flex;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 4px 6px;
      min-width: 0;
    }

    .credit-role {
      display: inline-block;
      padding: 1px 6px;
      border: 1px solid var(--border);
      border-radius: 4px;
      background: var(--surface);
      color: var(--text-secondary);
      font-size: 0.68rem;
      line-height: 1.5;
      white-space: nowrap;
    }

    .card-footer {
      margin-top: auto;
      padding-top: 10px;
      border-top: 1px solid var(--border);
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
    }

    .card-footer a {
      color: var(--link);
      font-size: 0.825rem;
      text-decoration: none;
      font-weight: 400;
      transition: color 0.15s;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
    .card-footer a:hover { color: var(--accent-dark); text-decoration: underline; }

    .x-icon {
      width: 13px;
      height: 13px;
      flex-shrink: 0;
    }

    .card-footer .official-link::before {
      content: "🔗 ";
      font-style: normal;
    }

    /* ── Footer ── */
    footer {
      margin-top: 80px;
      border-top: 1px solid var(--border);
      background: var(--surface);
    }

    .footer-inner {
      max-width: 1100px;
      margin: 0 auto;
      padding: 32px 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .disclaimer {
      font-size: 0.78rem;
      color: var(--text-secondary);
      line-height: 1.7;
    }

    .disclaimer + .disclaimer {
      padding-top: 10px;
      border-top: 1px dashed var(--border);
    }

    .disclaimer-lang {
      display: inline-block;
      font-size: 0.68rem;
      font-weight: 500;
      color: var(--accent-dark);
      background: rgba(0, 229, 255, 0.1);
      border-radius: 3px;
      padding: 1px 6px;
      margin-bottom: 4px;
      letter-spacing: 0.04em;
    }

    /* ── Accordion ── */
    .accordion-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--accent-dark);
      font-size: 0.78rem;
      font-family: inherit;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 0;
      margin-top: 2px;
      transition: color 0.15s;
    }
    .accordion-btn:hover { color: var(--accent); }
    .accordion-btn svg {
      width: 12px;
      height: 12px;
      transition: transform 0.2s ease;
      flex-shrink: 0;
    }
    .accordion-btn.open svg { transform: rotate(180deg); }

    .card-tracks-extra {
      display: none;
      flex-direction: column;
      gap: 4px;
    }
    .card-tracks-extra.open { display: flex; }

    /* ── Search ── */
    #search-wrap {
      position: relative;
      padding: 14px 0 10px;
    }

    .search-bar-row {
      position: relative;
      display: flex;
      align-items: center;
    }

    #search-input {
      width: 100%;
      height: 44px;
      padding: 0 44px 0 16px;
      border: 1.5px solid var(--border);
      border-radius: 10px;
      font-size: 0.9rem;
      font-family: inherit;
      background: var(--surface);
      color: var(--text-primary);
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    #search-input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(0, 229, 255, 0.12);
    }
    #search-input::placeholder { color: var(--text-secondary); opacity: 1; }

    #search-close {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-secondary);
      font-size: 1rem;
      line-height: 1;
      padding: 4px 6px;
      border-radius: 4px;
      transition: color 0.15s, background 0.15s;
    }
    #search-close.visible { display: flex; align-items: center; justify-content: center; }
    #search-close:hover { color: var(--text-primary); background: var(--border); }

    #search-results {
      display: none;
      position: absolute;
      top: calc(100% - 6px);
      left: 0;
      right: 0;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      z-index: 95;
      max-height: 60vh;
      overflow-y: auto;
    }
    #search-results.active { display: block; }

    .search-result-item {
      padding: 10px 16px;
      border-bottom: 1px solid var(--border);
      font-size: 0.875rem;
      display: flex;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 6px;
      transition: background 0.1s;
    }
    .search-result-item:last-child { border-bottom: none; }
    .search-result-item:hover { background: var(--surface); }

    .search-res-producer {
      font-weight: 500;
      color: var(--text-primary);
    }
    .search-res-sep {
      color: var(--border);
      flex-shrink: 0;
    }
    .search-res-track { color: var(--text-secondary); }
    .search-res-track a {
      color: var(--link);
      text-decoration: none;
      transition: color 0.15s;
    }
    .search-res-track a:hover { color: var(--accent-dark); text-decoration: underline; }
    .search-res-artist {
      color: var(--text-secondary);
      font-size: 0.825rem;
    }

    .search-no-results {
      padding: 20px 16px;
      color: var(--text-secondary);
      font-size: 0.875rem;
      text-align: center;
    }

    #search-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 85;
    }
    #search-overlay.active { display: block; }

    /* ── Mobile ── */
    @media (max-width: 640px) {
      .gnb-brand { display: none; }
      .gnb-inner { padding: 0 16px; gap: 16px; }
      main { padding: 0 16px 60px; }
      .category-section { padding: 48px 0 0; }
      .card { flex-direction: column; gap: 12px; }
      .card-left { flex: none; }
      .footer-inner { padding: 24px 16px; }
    }
```

No Tailwind config, globals.css, theme provider, CSS modules, or external local stylesheets exist.
