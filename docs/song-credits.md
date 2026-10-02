# Song credits

The website reads three published Google Sheets tabs. Song information is entered once; each contributor has a separate credit row.

## producers

Keep the existing columns and append `producerId`:

`category, name, contactX, mainGenre, idolName, officialPage, comment, producerId`

An ID such as `p001` is permanent. A display-name change does not change the ID. Assign each new person or team an unused ID; never reuse an old ID.

## songs

`songId, trackTitle, trackTitleAlt, trackArtist, trackArtistAlt, trackUrl`

One row describes one song/recording. A new recording, remix, or different SE gets a new permanent ID such as `s0001`. Keep artist names free of participation notes. Titles alone are not unique identifiers.

## credits

| Column | Input |
| --- | --- |
| songId | Choose an existing song ID |
| trackTitle | Automatic lookup; do not edit |
| trackArtist | Automatic lookup; do not edit |
| producerId | Choose an existing producer ID |
| producerName | Automatic lookup; do not edit |
| Produce | Checkbox: composing, arranging, or music production |
| Mix & Mastering | Checkbox: mixing and/or mastering |
| Vocal Director | Checkbox: vocal direction |
| Bass | Checkbox: participation as bassist |
| Drum | Checkbox: participation as drummer |
| featured | Checkbox: representative work for this contributor |
| creditNote | Additional details or participation outside the five roles |
| creditSourceUrl | Official source supporting the credit, when available |

Use one row per `songId + producerId`. Select every applicable role. All roles may be unchecked when the contribution falls outside these categories. Lyricist credits are not managed on this page.

The website shows the exact five role names and searches their English names plus Korean/Japanese descriptions. `Mix & Mastering` covers mixing and/or mastering; the specific work remains in `creditNote`. Notes and credit source URLs are for sheet management and are not rendered on the website.

## Adding and editing data

1. Add the person/team to `producers` if needed and assign a permanent `producerId`.
2. Add the song to `songs` if needed and assign a permanent `songId`.
3. Add a row to `credits`, choose the two IDs, and check the roles and `featured` as appropriate.
4. Enter additional details and a credit source if available.

Columns B, C, and E in `credits` contain automatic lookup formulas, filled through row 1326. Add new credits in the prepared blank rows. When expanding beyond that grid, copy the lookup formulas and validation from an existing credit row. Use the header filters to filter or sort the credits.

Changing titles, artists, links, or contributor display names updates every related credit. Every listed row-1 header is required, with exact spelling and capitalization, including lookup and optional metadata columns. Optional cell values may remain blank. Missing or renamed headers cause a loading error. Column order may change because the website reads headers rather than positions.

Use HTTP/HTTPS addresses for `officialPage` and `trackUrl`. Addresses without a scheme, such as `soundcloud.com/blkflagz`, open with HTTPS. Invalid addresses, relative paths, other schemes, and URLs containing credentials are not rendered as links. Profiles remain searchable by name even before credits are added.

## 2026-10-02 migration

The live workbook is [Live-Idol Producer Information](https://docs.google.com/spreadsheets/d/1fYYGT9Y4mjm_U5_popmqVIWhixAmxCQ7dJI0Tgt4A7o/edit).

- 52 contributors received permanent IDs.
- 353 original rows became 317 song records and 351 contributor credits.
- Composing/arranging and existing general production credits were classified as `Produce`, using the user's description of the existing data.
- Explicit mixing/mastering, bass, and recording-direction notes were mapped to the corresponding roles. Recording direction was classified as `Vocal Director`; recording engineering alone was not.
- Eight guitar contributions remain in `creditNote` with no role selected.
- Duplicate LeA / ROAR! and Mewzica / Tomorrow! credits were combined. Mewzica's conflicting featured values retain TRUE, with an explanatory note.
- Ambiguous `SE` entries for different contributors were kept as separate recordings.
- Contributor names were matched after trimming and case normalization during migration, including `toki` to the existing `Toki` profile. Runtime matching uses IDs.

The original rows remain in the visible `songs_legacy_20261002` tab (gid `2138418262`). The previous deployed code can still read that feed.

| Active tab | Published gid |
| --- | --- |
| producers | 1615162975 |
| songs | 2138418263 |
| credits | 2138418264 |

The historical specification in `docs/chika-idol-producer-webpage.md` predates this schema. This guide and the sample TSV headers define the current data structure.

## Sample files

- `data/producers-sample.tsv`: profiles with permanent IDs.
- `data/songs-sample.tsv`: song metadata.
- `data/credits-sample.tsv`: credits with the five boolean role columns.

The sample credit display columns contain readable example values. In the live sheet they are generated by lookup formulas.
