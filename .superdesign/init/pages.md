# SuperDesign repository init

Source: the current main working tree, including the live song-credit migration.
Stack: static HTML, vanilla JavaScript, inline vanilla CSS, custom DOM components; no dependency manifest or build step. Netlify serves public/.

# / — Live-Idol Producer Directory

Entry: public/index.html

```text
Dependencies:
- public/index.html
  - inline CSS (same file)
  - inline JavaScript (same file)
    - parseTSV / fetchRows
    - fetchProducers (permanent producerId)
    - fetchTracks (songId joins, role booleans, featured)
    - buildCard
      - buildTrackRow
        - buildCreditRoles
      - xHandle
      - CHEVRON_SVG
    - setupSearch
      - buildCreditRoles
    - renderPage
      - setupSearch
      - buildCard
      - setupIntersectionObserver
  - public/Twitter-X.svg (contact icon)
  - public/favicon.ico (favicon)
```

External dependencies: Google Fonts (Noto Sans KR/JP) and published Google Sheets TSV (producers gid 1615162975, songs gid 2138418263, credits gid 2138418264).

There are no local JS imports. netlify.toml sets the static publish root; sample TSVs and documentation are not runtime dependencies.

The page shows five producer categories; names, genres, affiliations, comments, contacts; featured songs and expandable extra credits; role badges; multilingual person/song/artist/role search; bilingual disclaimers.

Roles are exactly Produce, Mix & Mastering, Vocal Director, Bass, Drum. Produce includes composing and arranging. Lyricist is excluded. Preserve permanent ID joins, featured semantics, all CJK text, loading/error states, and links through redesigns. Empty checkbox template rows export FALSE and must be ignored.

Candidate context: public/index.html (budget with line ranges for the stylesheet and actual card/search/shell rendering), .superdesign/init/theme.md (compact token summary first), docs/song-credits.md (data semantics). Keep actual implementations; do not replace the UI source with prose.
