# Chika Idol Producer Directory — Claude Code Build Instructions

## Project Overview

Build a **static single-page website** that fetches producer data from a Google Sheets CSV and renders it as a categorized directory with GNB navigation. No backend required — all data is loaded client-side at runtime.

---

## Tech Stack

- **HTML + CSS + Vanilla JS** (single `index.html` file, no framework needed)
- **Google Sheets CSV** as the data source (fetched via `fetch()` on page load)
- Deploy target: GitHub Pages, Netlify, or Vercel (static hosting)

---

## Data Source Setup

### Sheet Column Structure

| Column | Key | Notes |
|--------|-----|-------|
| A | `category` | Must match category names exactly (see below) |
| B | `name` | Producer name |
| C | `contactX` | X (Twitter) handle e.g. `@username` |
| D | `mainGenre` | Main music genre |
| E | `idolName` | Idol unit name — may be empty |
| F | `comment` | Free text comment — may contain commas |

### Category Values (exact spelling required in Sheet)

```
Find actively
Chika Idol Active
Subculture
Hybrid
Overseas
```

### Published CSV URL

Replace `YOUR_SHEET_ID` with your actual Google Sheets ID:

```
https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=tsv&gid=0
```

> Use **TSV** (tab-separated) instead of CSV to safely handle commas in the Comment field.

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

  const [, ...rows] = tsv.trim().split("\n"); // skip header row

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
    .filter(p => p.name); // remove blank rows

  // Group by category in defined order
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
│   ├── #find-actively       ← section
│   ├── #chika-idol-active   ← section
│   ├── #subculture          ← section
│   ├── #hybrid              ← section
│   └── #overseas            ← section
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

GNB clicking should **smooth-scroll** to the corresponding section.

The **active GNB item** should update as the user scrolls using `IntersectionObserver`.

---

## Producer Card Layout

Each producer is displayed as a card. Cards are arranged in a **responsive grid** (2–3 columns on desktop, 1 column on mobile).

### Card Fields

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

- `idolName` — only show this line if the value is **not empty**
- `contactX` — render as a clickable link: `https://x.com/USERNAME` (strip the `@` prefix)
- `comment` — show as body text; allow line breaks
- `mainGenre` — show as a small badge/tag at the top of the card

---

## Section Display Order

Sections must render in this exact order, top to bottom on the page:

1. Find actively
2. Chika Idol Active
3. Subculture
4. Hybrid
5. Overseas

Each section has:
- A section heading (the category name)
- The producer card grid below it
- If the category has 0 producers, **hide the section entirely** (do not show an empty section)

---

## Design Direction

> Ask Claude to pick a fitting aesthetic. Suggested prompt addition:

```
Use a dark, editorial aesthetic inspired by Japanese underground music culture.
Monochrome base with a single accent color (e.g. neon pink or electric blue).
Clean sans-serif typography. Subtle card borders. Mobile-first responsive layout.
```

Feel free to replace this with your own style preference.

---

## Loading State

While the fetch is in progress, show a **loading indicator** in the main content area. Hide it once data is rendered.

```html
<div id="loading">Loading producers...</div>
```

---

## Error Handling

If the fetch fails (network error, sheet not published, etc.), show a user-friendly error message:

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

## Full Prompt Template for Claude Code

Copy and paste this as your starting prompt in Claude Code:

```
Build a single-file static webpage (index.html) for a Chika Idol Producer Directory.

DATA SOURCE:
Fetch producer data from this TSV URL on page load:
[PASTE YOUR TSV URL HERE]

COLUMNS (tab-separated, row 1 is header):
category | name | contactX | mainGenre | idolName | comment

CATEGORIES (render sections in this exact order):
1. Find actively
2. Chika Idol Active
3. Subculture
4. Hybrid
5. Overseas

PAGE STRUCTURE:
- Sticky GNB at top with one menu item per category
- GNB smooth-scrolls to section on click
- Active GNB item updates on scroll (IntersectionObserver)
- Each category is a section with a heading + card grid
- Hide sections that have 0 producers

PRODUCER CARD:
- mainGenre as a small badge/tag
- Producer name as heading
- idolName as subheading (hide if empty)
- comment as body text
- contactX as a link to https://x.com/USERNAME (strip @ prefix)

LOADING & ERROR:
- Show loading text while fetching
- Show error message if fetch fails

DESIGN:
[DESCRIBE YOUR PREFERRED VISUAL STYLE HERE]
Use a responsive grid (2-3 columns desktop, 1 column mobile).

Output a single self-contained index.html file with all CSS and JS inline.
```

---

## Deployment (After Claude Code Builds the File)

### GitHub Pages (free)

```bash
git init
git add index.html
git commit -m "initial"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
# then enable GitHub Pages in repo Settings → Pages → main branch
```

### Netlify Drop (fastest)

1. Go to [netlify.com/drop](https://app.netlify.com/drop)
2. Drag and drop your `index.html`
3. Done — live URL in seconds

---

## Updating Content

Once deployed, **you only need to edit the Google Sheet** — no redeployment needed. The page fetches fresh data every time it loads.

To add a new producer: add a row to the Sheet with the correct category name spelling.
To remove: delete the row.
To edit: change the cell values.
