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
| F | `comment` | Free text — may contain commas, Korean, or Japanese |

### Category Values (exact spelling required in Sheet)

```
Find actively
Chika Idol Active
Subculture
Hybrid
Overseas
```

### TSV URL format

```
https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=tsv&gid=0
```

Use TSV (tab-separated) — not CSV — to safely handle commas in comments.

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

## Design Direction

Dark editorial aesthetic inspired by Japanese underground music culture. Monochrome base with a single accent color (neon pink or electric blue). Clean sans-serif typography with CJK font support. Subtle card borders. Mobile-first responsive layout.

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
