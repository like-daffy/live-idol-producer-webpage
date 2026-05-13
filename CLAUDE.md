# Chika Idol Producer Directory — CLAUDE.md

## Project Overview

Static single-page website that fetches producer data from a Google Sheets TSV and renders it as a categorized directory with GNB navigation. No backend — all data loaded client-side at runtime.

Single deliverable: one self-contained `public/index.html` with all CSS and JS inline.

---

## Directory Structure

```
live-idol-producer-webpage/
├── CLAUDE.md                        ← this file
├── netlify.toml                     ← Netlify publish config (publish = "public")
├── .gitignore
├── public/
│   └── index.html                   ← THE webpage (build target)
├── data/
│   └── producers-sample.tsv         ← sample data; upload to Google Drive/Sheets
└── docs/
    └── chika-idol-producer-webpage.md  ← original build spec reference
```

**Edit rules:**
- All webpage work goes in `public/index.html`
- Never put build artifacts or auto-generated files in `data/` or `docs/`
- `data/producers-sample.tsv` is the canonical column reference — keep it in sync if schema changes

---

## Language & Character Support

**All text, labels, and user-facing strings must support Korean (한국어) and Japanese (日本語).**

- Use `<meta charset="UTF-8">` (required)
- Font stack must include CJK-compatible fonts: `'Noto Sans KR', 'Noto Sans JP', sans-serif`
- Producer names, idol names, comments, and genre badges may contain Korean or Japanese characters — never strip or truncate multibyte characters
- Section headings and GNB labels may be localized to Korean or Japanese if the sheet data uses those languages
- Do not hardcode ASCII-only assumptions anywhere (e.g., `@` stripping for contactX must still work with full-width `＠`)

---

## Tech Stack

- HTML + CSS + Vanilla JS (no framework)
- Google Sheets TSV as data source (`fetch()` on page load)
- Deploy target: **Netlify** (personal account, via Git auto-deploy)

---

## Data Source

### Sheet Column Structure

| Column | Key | Notes |
|--------|-----|-------|
| A | `category` | Must match category names exactly |
| B | `name` | Producer name (may be Korean/Japanese) |
| C | `contactX` | X (Twitter) handle e.g. `@username` |
| D | `mainGenre` | Main music genre (may be Korean/Japanese) |
| E | `idolName` | Idol unit name — may be empty; may be Korean/Japanese |
| F | `officialPage` | Full URL to official site — may be empty; rendered as clickable link |
| G | `comment` | Free text — may contain commas, Korean, or Japanese |

### Category Values (exact spelling required in Sheet)

```
Find actively
Chika Idol Active
Subculture
Hybrid
Overseas
```

### TSV URL (published)

```
https://docs.google.com/spreadsheets/d/e/2PACX-1vQJ8sJFqWDWb5kQsEVkSfeLr-NgsWpbxPR4Wxe-bTpCQeXtignl4qDiEy7azvFbVJ9w9cA8pLzW4au3/pub?gid=1615162975&single=true&output=tsv
```

Generated via **File → Share → Publish to web → Tab-separated values**. Use this form, not the `/export?format=tsv` URL — the published URL works without authentication.

---

## Data Fetching & Parsing

```js
const SHEET_URL = "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=tsv&gid=0";

const CATEGORY_ORDER = [
  "Find actively",
  "Chika Idol Active",
  "Subculture",
  "Hybrid",
  "Overseas"
];

async function fetchProducers() {
  const res = await fetch(SHEET_URL);
  const tsv = await res.text();
  const [, ...rows] = tsv.trim().split("\n");

  const producers = rows
    .map(row => {
      const cols = row.split("\t").map(c => c.trim());
      return {
        category:  cols[0] || "",
        name:      cols[1] || "",
        contactX:  cols[2] || "",
        mainGenre: cols[3] || "",
        idolName:  cols[4] || "",
        comment:   cols[5] || ""
      };
    })
    .filter(p => p.name);

  const grouped = {};
  CATEGORY_ORDER.forEach(cat => {
    grouped[cat] = producers.filter(p => p.category === cat);
  });

  return grouped;
}
```

---

## Page Structure

```
index.html
│
├── <header>
│   └── <nav>  ← GNB with 5 category links
│
├── <main>
│   ├── #find-actively
│   ├── #chika-idol-active
│   ├── #subculture
│   ├── #hybrid
│   └── #overseas
│
└── <footer>
```

### GNB Menu Items & Section IDs

| Menu Label | Section ID |
|------------|------------|
| Find actively | `#find-actively` |
| Chika Idol Active | `#chika-idol-active` |
| Subculture | `#subculture` |
| Hybrid | `#hybrid` |
| Overseas | `#overseas` |

- GNB clicking must **smooth-scroll** to the corresponding section
- Active GNB item updates on scroll via `IntersectionObserver`

---

## Producer Card Layout

```
┌──────────────────────────────────┐
│  [Genre badge]                   │
│                                  │
│  Producer Name          ← h3    │
│  Idol Name (if exists)  ← sub   │
│                                  │
│  Comment text           ← p     │
│                                  │
│  [@handle → X link]     ← footer│
└──────────────────────────────────┘
```

### Field Display Rules

- `idolName` — only show if not empty
- `contactX` — render as clickable link: `https://x.com/USERNAME` (strip the `@` or `＠` prefix)
- `comment` — body text; preserve line breaks
- `mainGenre` — small badge/tag at top of card
- Cards in a responsive grid: 2–3 columns desktop, 1 column mobile
- Sections with 0 producers are hidden entirely

---

## Design Spec

### Mood
Clean, minimal, modern. White base with plenty of whitespace. Inspired by contemporary K-Pop agency sites — polished and approachable, not dark or grungy.

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#ffffff` | Page background |
| `--surface` | `#f8f9fa` | Card background |
| `--border` | `#e9ecef` | Card border, dividers |
| `--text-primary` | `#1a1a2e` | Headings, names |
| `--text-secondary` | `#6c757d` | Subtitles, metadata |
| `--accent` | `#00e5ff` | Active GNB link, badge background, hover states |
| `--accent-dark` | `#00b8cc` | Accent hover/pressed |
| `--link` | `#00b8cc` | contactX link color |

### Typography
- **Font import**: `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Noto+Sans+JP:wght@300;400;500;700&display=swap`
- **Font stack**: `'Noto Sans KR', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, sans-serif`
- **Page title / GNB brand**: `700`, `1.1rem`
- **Section headings**: `700`, `1.4rem`, `--text-primary`
- **Card producer name (h3)**: `500`, `1rem`
- **Card idol name**: `300`, `0.85rem`, `--text-secondary`
- **Comment body**: `400`, `0.875rem`, line-height `1.6`
- **Genre badge**: `500`, `0.7rem`, uppercase, letter-spacing `0.05em`

### Layout
- **GNB**: sticky top, white background, `border-bottom: 1px solid var(--border)`, height `56px`
- **Max content width**: `1100px`, centered
- **Section padding**: `64px 0`
- **Card grid**: `repeat(auto-fill, minmax(280px, 1fr))`, gap `20px`
- **Card**: `border-radius: 12px`, `border: 1px solid var(--border)`, `box-shadow: 0 2px 8px rgba(0,0,0,0.04)`, padding `20px`
- **Card hover**: `box-shadow: 0 4px 16px rgba(0,229,255,0.12)`, `border-color: var(--accent)`, transition `0.2s ease`
- **Genre badge**: `background: rgba(0,229,255,0.12)`, `color: var(--accent-dark)`, `border-radius: 4px`, `padding: 2px 8px`

### Mobile breakpoint
At `≤ 640px`: single-column grid, GNB collapses to horizontal scroll.

---

## Loading & Error States

```html
<div id="loading">Loading producers...</div>
```

```js
try {
  const data = await fetchProducers();
  renderPage(data);
} catch (err) {
  document.getElementById("loading").textContent =
    "Failed to load data. Please check the sheet is published.";
}
```

---

## Deployment — Netlify (personal account)

`netlify.toml` sets `publish = "public"` so Netlify serves `public/index.html` as the site root.

### First deploy (connect repo)

1. Push this repo to GitHub
2. Go to app.netlify.com → **Add new site → Import an existing project**
3. Connect GitHub → select this repo → Netlify auto-detects `netlify.toml`
4. Click **Deploy site** — done

### Subsequent deploys

Push to the connected branch — Netlify rebuilds automatically.

### Quick one-off (Netlify Drop)

Drag-and-drop the `public/` folder to [app.netlify.com/drop](https://app.netlify.com/drop) for an instant preview URL without Git setup.

---

## Data Setup — Google Sheets

### First-time setup

1. Go to [sheets.new](https://sheets.new) to create a new spreadsheet
2. Import `data/producers-sample.tsv`: **File → Import → Upload** the TSV file
3. In the import dialog choose **Tab** as separator and **Replace current sheet**
4. **Share the sheet**: **Share → General access → Anyone with the link → Viewer**
5. **Publish as TSV**: **File → Share → Publish to web → Sheet1 → Tab-separated values → Publish**
6. Copy the published TSV URL (format: `https://docs.google.com/spreadsheets/d/SHEET_ID/pub?...`)
   - Or use the export URL: `https://docs.google.com/spreadsheets/d/SHEET_ID/export?format=tsv&gid=0`
7. Replace `YOUR_SHEET_ID` in `public/index.html` with the actual sheet ID

### Content Updates

Edit the Google Sheet only — no redeployment needed. The page fetches fresh data on every load.

- Add producer: new row with correct category spelling
- Remove producer: delete the row
- Edit producer: change cell values
