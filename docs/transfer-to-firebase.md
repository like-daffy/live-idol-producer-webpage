# Netlify to Firebase Hosting migration plan

Prepared: 2026-10-21. Status: implemented on 2026-10-21 (UTC). Firebase Hosting serves the directory at `https://live-idol-producer.web.app/`, and the Netlify address forwards there with a permanent 301. The Search Console steps and the observation checks remain; see section 7. No Google Sheet, DNS record, or Netlify dashboard setting was changed.

Move the existing `public/` directory to **Firebase Hosting (classic)** in a separate Firebase project. Keep Google Sheets as the source of producer, song, and credit data. Reuse the explicit project selection, local checks, and manual deployment workflow from `chord-to-midi-web`.

## 1. Evidence and current architecture

The repositories and Firebase history were inspected on the preparation date:

| Item | Finding | Evidence |
| --- | --- | --- |
| Directory checkout | `/Users/chanbaek/Develop-Projects/live-idol-producer-webpage`, HEAD `c197b0a`; clean before this plan | Local Git status and history |
| Existing deployment configuration | Netlify publishes `public/`; no build command | [netlify.toml](../netlify.toml) |
| Application | One HTML page with inline CSS and JavaScript; no package manifest, framework build, backend, or client-side pathname router | [public/index.html](../public/index.html) |
| Current public address recorded in source | `https://live-idol-producer-list.netlify.app/` | [robots.txt](../public/robots.txt), [sitemap.xml](../public/sitemap.xml) |
| Data | Browser fetches three public TSV feeds and joins permanent IDs | [song-credits.md](song-credits.md), `public/index.html` |
| External resources | Published Google Sheets, Google Fonts, and outbound producer/song links | `public/index.html` |
| Existing deployment workflow | Repository instructions say the connected GitHub branch deploys on push; Sheets edits appear independently | [CLAUDE.md](../CLAUDE.md); dashboard configuration still needs confirmation |
| Regression baseline | `node --test tests/directory.test.mjs`: **7 passed, 0 failed**, on Node `v24.21.0` | Local run on 2026-10-21 |
| Firebase reference checkout | `/Users/chanbaek/Develop-Projects/chord-to-midi-web`, HEAD `70066b9` | Local Git history and deployment documentation |

This is a hosting migration. There is no Netlify database, login system, or server code in the tracked application to transfer. Check the Netlify dashboard for settings or integrations outside Git before treating the inventory as complete.

Preserve these feeds exactly:

| Sheet tab | Published gid | Identity |
| --- | --- | --- |
| `producers` | `1615162975` | Permanent `producerId` |
| `songs` | `2138418263` | Permanent `songId` |
| `credits` | `2138418264` | `songId` + `producerId` |

Keep the current published URL base, headers, five role names, and TSV parser. The legacy tab `songs_legacy_20261002` is not a migration destination. Do not copy the sample TSV files into the deployed data path or import the workbook into Firestore. Live record counts must be measured at migration time, since editors can update the Sheet without a code release.

### Lessons from the Chord-to-MIDI Firebase work

| History or current configuration | Application to this migration |
| --- | --- |
| On 2026-10-06, an access error came from a default alias pointing to unavailable `chord-to-midi-staging`. Commit `7ed0c3d` on 2026-10-07 changed the default to `chord-to-midi`. | Check the CLI account, accessible projects, aliases, and Hosting site before deployment. Use an explicit project ID on every project-scoped command. |
| Current [`.firebaserc`](../../chord-to-midi-web/.firebaserc) maps `default` and `production` to `chord-to-midi`; it still lists a separate staging alias. | Aliases select projects; they do not create them. Create only aliases for verified projects here. |
| The earlier setup included Hosting provisioning and custom-domain verification. | Record project creation, Hosting release, certificate readiness, and live-site validation as separate results. |
| The 2026-10-08 owner decision uses local checks and manual deployments, with no GitHub Actions. | Recommend the same workflow here. A push will not deploy Firebase unless automation is deliberately added later. |
| [Deployment notes](../../chord-to-midi-web/docs/deploy.md) record a Hosting release from `5122eb1` on 2026-10-20, recorded by documentation commit `70066b9`. | Record the source commit and Hosting release/version for this migration too. This is repository-recorded history, not a fresh production verification. |
| Its [Firebase configuration](../../chord-to-midi-web/firebase.json) publishes `dist/` and includes Functions, Firestore, API rewrites, and application-specific headers. | Adapt the deployment process to this site's `public/` folder. Its payment, login, database, and build configuration does not apply here. |
| `firebase-tools` is pinned to `15.32.1` in its Functions development dependencies; the installed CLI package has that version. | Use that inspected version for the initial runbook, with a compatible Node version. No Firebase browser SDK is needed for this site. |

The historical alias incident was checked against both earlier session records and the actual Git change. Existing deployment decisions are also recorded in [Chord-to-MIDI decisions](../../chord-to-midi-web/docs/decisions.md) and its [local validation plan](../../chord-to-midi-web/docs/plans/local-validation.md).

## 2. Target and decisions to record

Recommended architecture:

```text
Visitor -> canonical URL -> Firebase Hosting -> public/index.html
                                             -> browser fetches existing Sheets TSV feeds

Old Netlify URL -> HTTP redirect -> canonical URL
```

| Decision | Recommendation | State |
| --- | --- | --- |
| Firebase account | Reuse the account that manages Chord-to-MIDI, after checking CLI access | `sochan@cultureand.tech` with firebase-tools 15.32.1, reauthenticated 2026-10-21 |
| Firebase project | Separate project for this directory; candidate ID `live-idol-producer` | `live-idol-producer` (number 166929680633), created 2026-10-21 under organization `270947685721`, the same parent as `chord-to-midi` |
| Hosting site | Use the new project's default Hosting site initially | `live-idol-producer` (default site) |
| Canonical URL | Use `https://<actual-site-id>.web.app/` initially, unless an owned custom domain is selected before cutover | `https://live-idol-producer.web.app/`; no custom domain |
| Plan | Start with Spark if the site's measured usage fits its quotas | Spark (no billing account). Netlify's Oct 13–Nov 12 period showed 217 requests and under one bandwidth credit |
| Releases | Local verification followed by an explicit manual Hosting deployment | Adopted; commands in [CLAUDE.md](../CLAUDE.md) |

Classic Hosting supports static files and Firebase-provided HTTPS hostnames. Firebase App Hosting is unnecessary for this application. See the [Hosting quickstart](https://firebase.google.com/docs/hosting/quickstart).

The existing `live-idol-producer-list.netlify.app` hostname is a Netlify-managed address. Plan to retain that site for forwarding old URLs; it is not an owned domain whose DNS can be pointed at Firebase. Choose the final destination before changing the sitemap or publishing redirects.

A separate project keeps the directory's releases and quotas independent of Chord-to-MIDI. Hosting quotas apply across sites and channels in a project. At the preparation date, Firebase documents 10 GB of no-cost Hosting storage and 10 GB/month of no-cost transfer; exceeding non-Blaze transfer limits can disable serving after a grace period. Measure traffic before choosing a plan. If Blaze becomes necessary, configure budget alerts and remember that alerts do not cap charges. See [Hosting quotas and usage](https://firebase.google.com/docs/hosting/usage-quotas-pricing).

If sharing the `chord-to-midi` project is deliberately chosen instead, revise this runbook first: create a distinct Hosting site, map a named deploy target such as `directory`, set `hosting.target`, and scope live deploys to `--only hosting:directory`. The default-site configuration below is for the separate-project option and must not be deployed to `chord-to-midi`.

## 3. Planned repository changes

| File | Planned change | Timing |
| --- | --- | --- |
| `firebase.json` | Add Hosting configuration for `public/` | Local preparation |
| `.firebaserc` | Map `default` and `production` to the verified new project | After project selection |
| `.gitignore` | Ignore `.firebase/`, `firebase-debug.log`, and `firebase-debug.*.log` | Local preparation |
| `public/index.html` | Add canonical and `og:url` metadata using the chosen production origin | Before final preview; preserve UI and data loading |
| `public/robots.txt` | Replace the Netlify sitemap origin with the chosen production origin | Before final preview |
| `public/sitemap.xml` | Replace the homepage origin with the chosen production origin | Before final preview |
| `public/google32a9d5bfd74c8735.html` | Preserve; confirm which verification file the new Search Console property requires | Preview and cutover |
| `netlify.toml` | Retain publication settings; add reviewed forwarding rules later | Only after Firebase live checks pass |
| `CLAUDE.md` | Describe manual Firebase releases, existing Sheets updates, and retained Netlify redirects | Implementation documentation |
| This plan | Fill in selected IDs, canonical URL, release evidence, and completion state | Throughout implementation |

Do not introduce a framework, build pipeline, Firebase Auth, Firestore, Cloud Functions, Cloud Storage, Analytics, or App Check for this transfer. There is no Firebase service used by the browser that requires a Firebase SDK or web-app configuration. The Sheets publication permissions continue to control public data access.

### Proposed `firebase.json`

```json
{
  "hosting": {
    "public": "public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "headers": [
      {
        "source": "**",
        "headers": [
          { "key": "Cache-Control", "value": "no-cache" },
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
        ]
      }
    ]
  },
  "emulators": {
    "hosting": { "host": "127.0.0.1", "port": 5051 },
    "ui": { "enabled": false }
  }
}
```

Publish only `public/`, keeping repository instructions, tests, samples, and tooling outside the served root. No catch-all rewrite is needed: the current page uses section/card anchors, not application pathname routes. Missing paths should return 404. Omit `cleanUrls` so the Google verification file retains its exact `.html` URL. See [Hosting configuration and response precedence](https://firebase.google.com/docs/hosting/full-config).

Use conservative cache revalidation initially because assets have stable filenames. Do not copy Chord-to-MIDI's immutable asset rules or CSP: this page has inline scripts/styles and depends on Google Fonts and redirected Sheets requests. Any later CSP requires its own browser validation. These headers also cannot fix CORS restrictions on a response served by Google Sheets.

### `.firebaserc`

Both aliases name the verified project:

```json
{
  "projects": {
    "default": "live-idol-producer",
    "production": "live-idol-producer"
  }
}
```

## 4. Implementation sequence

The setup and deployment commands below are for the future implementation. Creating this plan involved read-only inspection and the existing local regression suite, not Firebase CLI setup or deployment. `npx` uses the pinned CLI without requiring an application package manifest; it may download the package. Run commands from this repository, not the Chord-to-MIDI checkout.

### Phase A — establish the rollback baseline

1. Record the Netlify site name/ID, connected repository and production branch, current published deploy ID/source commit, domain aliases, build settings, and any dashboard-only redirects, headers, forms, functions, or environment dependencies. Verify the current public page in a browser.
2. Retain the current deploy and a local copy of its published files/configuration outside `public/`. Record any custom-domain DNS records and TTLs. Confirm that the old Netlify deploy can be republished.
3. Capture the three public feeds and their counts/ID relationships at the same time for comparison. Keep the existing Sheet intact; use a short editorial pause during the final comparison or account for intervening edits.
4. Record representative profile/song searches, role badges, category navigation, and desktop/mobile screenshots. Test the actual old origin's data loading and error behavior.
5. Before pushing migration metadata or redirect changes to a branch Netlify watches, pause automatic production publishing or otherwise isolate the work. Verify the dashboard state; a local edit or an unpushed commit does not change Netlify.

**Exit condition:** known-good source, deploy, data snapshot, and old-site publishing procedure are recorded.

### Phase B — verify the account and provision the separate project

```sh
cd /Users/chanbaek/Develop-Projects/live-idol-producer-webpage
node --version
npx --yes firebase-tools@15.32.1 --version
npx --yes firebase-tools@15.32.1 login:list
npx --yes firebase-tools@15.32.1 projects:list
```

Use `login` or `login --reauth` only if authentication needs it. Check aliases and the selected account before diagnosing an error as an IAM problem.

Create or select the directory's separate project in the Firebase console. Record its exact project ID, then open Hosting and provision its default site if necessary. Analytics and billable backend services are unnecessary. These are implementation actions, not tasks completed by this document.

Set these shell variables to the verified values:

```sh
LIVE_IDOL_PROJECT_ID='live-idol-producer'
LIVE_IDOL_SITE_ID='live-idol-producer'
LIVE_IDOL_ORIGIN='https://live-idol-producer.web.app'

npx --yes firebase-tools@15.32.1 hosting:sites:list \
  --project "$LIVE_IDOL_PROJECT_ID"
```

Check that the site belongs to the selected directory project. For the default Hosting site the site ID normally equals the project ID; use the returned value rather than assuming it. Keep `LIVE_IDOL_ORIGIN` without a trailing slash for the URL examples below.

**Exit condition:** account access, project ID, Hosting site ID, plan, and canonical hostname are recorded and distinguishable from Chord-to-MIDI.

### Phase C — prepare and check locally

1. Add the configuration from section 3 and update the metadata with the chosen origin. Keep all three published feed URLs unchanged.
2. Prefer writing the small configuration files explicitly. If using `firebase init hosting`, choose the verified project, public directory `public`, no single-page rewrite, no GitHub deployment setup, and **do not overwrite the existing `public/index.html`**. Review generated files before continuing.
3. Run the existing tests and inspect the diff. There is no `npm run build` step.

```sh
node --test tests/directory.test.mjs
git diff --check
git diff -- public/index.html public/robots.txt public/sitemap.xml .gitignore
git status --short
npx --yes firebase-tools@15.32.1 emulators:start \
  --only hosting --project "$LIVE_IDOL_PROJECT_ID"
```

Open `http://127.0.0.1:5051/`. The Hosting emulator serves the local files, but the page still fetches the real public Sheets feeds. A passing emulator check does not establish deployed CORS behavior. This Hosting-only workflow does not need the Auth/Firestore/Functions emulator stack from Chord-to-MIDI.

**Exit condition:** tests pass; new configuration is reviewed; local rendering and static-file responses match the baseline.

### Phase D — deploy and validate a Firebase preview

```sh
npx --yes firebase-tools@15.32.1 hosting:channel:deploy netlify-migration \
  --expires 7d --no-authorized-domains --project "$LIVE_IDOL_PROJECT_ID"
```

The inspected CLI supports `--no-authorized-domains`; use it because this site has no Firebase Authentication integration. Record the returned URL and version, then run the acceptance matrix below on that URL. Preview channels are public and temporary, and this page still reads the live Sheet. See [Firebase preview deployments](https://firebase.google.com/docs/hosting/test-preview-deploy).

Keep preview URLs out of the sitemap, canonical metadata, and public announcements. If any temporary indexing restriction is introduced during implementation, remove it and validate the final configuration before production. In particular, do not promote a configuration with an accidental production `noindex` header.

If code or hosting configuration changes, deploy the preview again and repeat affected checks. Record the exact final source commit and confirm the files remain unchanged between validation and publication.

**Exit condition:** the Firebase-hosted page passes the matrix, including real browser fetches from all three Sheets feeds.

### Phase E — publish Firebase live and verify it

With the final preview approved for publication, promote that tested channel to the same site's live channel:

```sh
npx --yes firebase-tools@15.32.1 hosting:clone \
  "$LIVE_IDOL_SITE_ID:netlify-migration" "$LIVE_IDOL_SITE_ID:live" \
  --project "$LIVE_IDOL_PROJECT_ID"
```

Check both site IDs carefully: cloning identifies the source and destination by site ID; the `--project` flag is not a substitute for checking those IDs. Confirm that nobody has replaced the preview version since validation. Within one site, cloning publishes the same tested version. See [channel promotion and release management](https://firebase.google.com/docs/hosting/manage-hosting-resources).

For later ordinary releases from verified local files, the separate-project deployment command is:

```sh
npx --yes firebase-tools@15.32.1 deploy \
  --only hosting --project "$LIVE_IDOL_PROJECT_ID"
```

Verify the Firebase live URL and canonical origin separately if they differ. Record source commit, site ID, live release/version, deployed time, and browser/HTTP results. Keep Netlify serving its known-good page until the destination is ready.

**Exit condition:** the destination works publicly over HTTPS; a successful CLI message alone is insufficient.

### Phase F — move visitors and search indexing

For the current Netlify hostname, retain the Netlify site and publish a forwarding release only after Phase E passes. Put rules in root `netlify.toml`, so a Netlify `_redirects` file is not accidentally shipped as a public Firebase asset.

Start with a short observation period using `302`, then change to `301` after verifying the destination, redirects, and rollback readiness. Commit `01f5c5e` published these rules with the verified destination, and `fda6349` later changed the forwarding `status` to `301`:

```toml
[build]
  publish = "public"

# Preserve old Search Console file verification while forwarding the site.
[[redirects]]
  from = "/google32a9d5bfd74c8735.html"
  to = "/google32a9d5bfd74c8735.html"
  status = 200
  force = true

# The site moved to Firebase Hosting. Keep 302 during the observation period, then 301.
[[redirects]]
  from = "https://live-idol-producer-list.netlify.app/*"
  to = "https://live-idol-producer.web.app/:splat"
  status = 302
  force = true
```

The first rule must serve the existing verification file with 200; test it on the actual Netlify release. Adapt verification exceptions if Search Console requires another filename. The forced forwarding rule overrides existing page files, and `:splat` preserves the path. Publish the redirect release explicitly while automatic publishing is paused, then inspect live responses. See [Netlify redirect configuration](https://docs.netlify.com/manage/routing/redirects/overview/).

Netlify forwards query parameters for these 301/302 redirects. Test a URL with a query string and test fragment links in a browser; fragments are not sent to the server. Cover any additional HTTP or custom-domain aliases found in Phase A. See [Netlify redirect options](https://docs.netlify.com/manage/routing/redirects/redirect-options/).

If an owned custom domain is already serving traffic on Netlify, use Firebase's **Advanced Setup** to prepare ownership and TLS before moving traffic. Preserve the old DNS records; use the exact records Firebase supplies, without copying Chord-to-MIDI's DNS values. Change only relevant web records, preserving mail and unrelated verification records. Verify HTTPS and the dashboard's Connected state before forwarding users to that domain. See [Firebase custom-domain migration](https://firebase.google.com/docs/hosting/custom-domain).

For search indexing, verify the new Search Console property; the old HTML file's presence alone does not establish verification for a new property. Check the canonical/`og:url`, robots sitemap reference, and sitemap URL against the final origin. Once permanent redirects work, submit the new sitemap and use Change of Address where supported for the old and new properties. Keep old verification valid. Update the owner's published profile links after cutover. Google recommends keeping migration redirects for at least a year; retain the Netlify address longer where useful for existing links. See [Google's site-move guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes).

**Exit condition:** old links reach the working canonical site, search metadata is consistent, and the Netlify redirect release is recorded.

## 5. Acceptance matrix

Run on the local server, final Firebase preview, and Firebase live origin where applicable. Repeat redirect checks after the Netlify forwarding release and again after switching from 302 to 301.

| Area | Required evidence |
| --- | --- |
| Local regression suite | All seven existing tests pass; record Node version and source commit |
| Homepage | `/` returns 200 and renders the actual directory, not a Firebase welcome page or a persistent loading message |
| Static files | `/favicon.ico`, `/Twitter-X.svg`, `/robots.txt`, `/sitemap.xml`, and the Google verification file return the expected content and types |
| Unknown paths | A deliberately nonexistent URL returns 404, not the homepage with 200 |
| Real data | All three TSV requests succeed from the Firebase browser origin without login, CORS, mixed-content, or unexpected HTML-response errors |
| Data parity | Same-time snapshots match producer/song/credit counts and permanent-ID relationships across old and new origins; explain legitimate intervening Sheet edits |
| Cards and roles | Preserve featured songs, accordion behavior, contact links, and exactly `Produce`, `Mix & Mastering`, `Vocal Director`, `Bass`, `Drum` |
| Search/navigation | Names without credits remain searchable; Korean/Japanese/alternate title and role searches work; result/category navigation closes search and reaches the matching card/section |
| Appearance | Light/dark/system themes, CJK fonts, wrapping, sticky navigation, and reduced-motion behavior match baseline at phone, tablet, and desktop widths |
| Browser storage | Theme preferences work on the new origin. Old `ld-theme` localStorage does not transfer across origins; first visit uses the existing system-default behavior |
| Failure behavior | A blocked/invalid feed in browser request interception produces the existing loading error; never corrupt the live Sheet to test this |
| Metadata | Canonical/`og:url`, robots sitemap reference, and sitemap use the final production hostname; no preview URL or accidental `noindex` remains |
| Response headers | Expected cache/security headers are present; HTML changes are visible after a normal refresh |
| Old URLs | Old homepage, existing asset paths, and query-bearing URLs reach the same destination path; verification exception remains 200; no loops |
| Anchor behavior | Test `/#find-actively` and a real `/#producer-...` link after a cold load and through the redirect; compare with the old site's behavior because cards render asynchronously |
| Release identity | Recorded source commit corresponds to the tested preview and published Hosting version; no other Firebase project/site was targeted |

Examples for inspecting responses after setting `LIVE_IDOL_ORIGIN`:

```sh
curl -sS -D - -o /dev/null "$LIVE_IDOL_ORIGIN/"
curl -sS -D - -o /dev/null "$LIVE_IDOL_ORIGIN/sitemap.xml"
curl -sS -D - -o /dev/null "$LIVE_IDOL_ORIGIN/migration-check-not-found"
curl -sS -D - -o /dev/null \
  'https://live-idol-producer-list.netlify.app/?migration-check=1'
curl -sS -D - -o /dev/null \
  'https://live-idol-producer-list.netlify.app/google32a9d5bfd74c8735.html'
```

Inspect `Location` before following redirects, then verify the final URL separately. HTTP checks do not replace browser checks of Sheets loading, search, storage, or fragment navigation. Record any pre-existing cold-load anchor limitation separately instead of claiming the hosting transfer fixes it.

## 6. Rollback and observation

| Failure point | Recovery |
| --- | --- |
| Local or preview failure | Leave Netlify unchanged; fix configuration/code and revalidate the preview |
| First Firebase live release fails before forwarding | Keep Netlify as the public destination and repair Firebase. A new Firebase site may not yet have an earlier live version to roll back to |
| Later Firebase content/configuration regression | Select a retained known-good release in Firebase Hosting's release history and roll back; repeat live checks |
| Netlify forwarding points to a broken destination | During the 302 trial, republish the retained Netlify deploy or remove the forwarding rule and publish that change; verify the old origin again |
| Owned-domain DNS migration fails | Restore the recorded previous web records while keeping both deployments available; allow for DNS caches and recheck TLS |
| Sheet publication/schema fails | Diagnose the shared feed. A Hosting rollback does not restore Sheet contents or fix an unavailable public feed |

Firebase's release history supports rollback to a retained version through the release's menu. Retain the migration baseline and first stable Firebase release. See [Firebase rollback instructions](https://firebase.google.com/docs/hosting/manage-hosting-resources#rollback).

After a 301 is issued, some clients may keep using the new destination even if Netlify is restored. Prefer repairing or restoring content at the Firebase destination. Do not redirect Firebase back to Netlify while Netlify, or a cached permanent redirect, sends users to Firebase; that creates a loop.

Suggested observation schedule: check immediately after each release, again the next day, and after one week. Keep the temporary redirect trial brief, such as 24–48 hours with normal traffic, before publishing the permanent redirect. Monitor Hosting usage, HTTPS, feed loading, redirect errors, and Search Console indexing. These intervals are operational recommendations, not verified service guarantees.

After stability is established, leave Netlify automatic production publishing disabled or detach its Git integration while preserving the published redirect site. Record how to maintain that redirect. Do not delete the Netlify site or rename its hostname while old links depend on it.

## 7. Execution record

Times are UTC on 2026-10-21 unless noted.

| Milestone | Status / value |
| --- | --- |
| Repository and related Firebase history reviewed | Complete, 2026-10-21 |
| Existing local regression tests | Complete, 7/7 passed on Node `v24.21.0`, again at `e38407d` |
| Final directory Firebase project / site IDs | `live-idol-producer` / `live-idol-producer` (section 2) |
| Canonical origin | `https://live-idol-producer.web.app` |
| Current Netlify deploy / branch / aliases / rollback artifact | Site `live-idol-producer-list` (ID `1a7356ba-0698-4811-a784-a3c10240a1da`) deploys `main` of `like-daffy/live-idol-producer-webpage` with auto publishing on, no build command, and no custom domain or alias. Before the move it published deploy `6abfb81e1e7f0170c9eef137` (`main@c197b0a`), whose files equal `c197b0a`; Netlify adds a three-line comment to `/` on the main hostname only. Rollback: publish that deploy from its page, or revert on `main` and push. Netlify deletes deploys after 90 days, so the first route lasts only until about the end of 2026 |
| Migration source commit | `e38407d` (Hosting configuration and metadata) |
| Firebase configuration and local Hosting checks | Complete: tests 7/7, `git diff --check` clean, and the Hosting emulator matched the Netlify baseline except for the intended canonical and `og:url` |
| Preview URL / tested version / acceptance results | `https://live-idol-producer--netlify-migration-x68ubkik.web.app` (expires 2026-10-28 14:55), version `5e9483cbee1074dd`, released 14:55:36. Matrix passed and matched Netlify at the same time (14:56). The channel adds `x-robots-tag: noindex`; the version's own configuration has only the three headers in section 3 |
| Firebase live release / version / HTTPS and browser checks | Release `1792594681779000` at 14:58:01, cloned from the preview: version `5e9483cbee1074dd`. `web.app` and `firebaseapp.com` answer 200 over HTTPS without `noindex`; files equal `e38407d`; matrix passed and matched Netlify at the same time (14:58) |
| Custom-domain DNS and certificate checks, if applicable | Not applicable: no custom domain |
| Netlify forwarding release / 302 checks / 301 checks | Netlify published `main@e38407d` (the page with the new metadata) as deploy `6ad8d597706812307d08aae3` at 15:09. The 302 release followed as deploy `6ad8d8fae2159cdcafcf0c25` (`main@01f5c5e`) at 15:24. Checks at 15:24: every path answers 302 to the same URL on Firebase, query strings included (also a percent-encoded Korean one). Destinations answer 200 (404 for an unknown path) without another redirect. HTTP answers 301 to HTTPS, then 302. The verification file answers 200 with its content. A browser keeps fragments across the redirect. The deploy permalink of `6abfb81e1e7f0170c9eef137` still serves `c197b0a`. The owner approved the 301 at 16:43, earlier than the suggested 24–48 hour trial, after the live matrix passed again. The 301 release is deploy `6ad8ec4fb7702e110969d15b` (`main@fda6349`), live at 16:46. Checks at 16:46 gave the same results with 301 in place of 302, including HTTP answering 301 to HTTPS and then 301. Netlify sends the redirects with `cache-control: public,max-age=0,must-revalidate` |
| Search Console verification / sitemap / address change | Pending: needs the owner's Search Console account |
| Observation results / ongoing release instructions | Release instructions in [CLAUDE.md](../CLAUDE.md). Next-day and one-week checks pending |

With the 301 in place, repair or roll back at the Firebase destination (Hosting release history) rather than on Netlify; clients that saw the 301 may keep going to Firebase (section 6). Publishing deploy `6ad8d597706812307d08aae3` (the page with the new metadata) or the pre-migration `6abfb81e1e7f0170c9eef137` from Netlify's deploy list would stop the forwarding for other visitors.

The live checks used a headless browser against each origin: all 58 cards (8/6/26/2/16 by category) with 358 credits, role badges, the accordion, Korean, Japanese, and alternate-name searches, result and category navigation, light/dark/system themes with blocked storage, reduced motion, phone/tablet/desktop layouts, and the loading error for a blocked, HTML, or HTTP 500 feed (request interception only). Other findings:

- From each Firebase origin, the browser's Sheets requests succeed: the published URL redirects with `Access-Control-Allow-Origin` set to the page's origin, and the final response allows `*`.
- Existing behavior on both origins: a cold load of `/#overseas` or `/#producer-…` does not scroll to the target, because cards render after the feeds load. `/#find-actively` is already in view.
- A GitHub webhook incident delayed the Netlify deploy of `e38407d` by about ten minutes (published 15:09). The forwarding commit was pushed only after that, so the late build could not replace the forwarding release.
- Feed snapshots, HTTP and browser reports, screenshots, and a copy of the published Netlify files are kept in the git-ignored `.local-checks/` folder of the working copy that ran the migration, not in the repository.

### Remaining steps

1. Check again the next day and after one week: the directory loads at `https://live-idol-producer.web.app/`, old links answer 301 to the same path, and Hosting usage stays within Spark.
2. In the Search Console account that verified the Netlify property, add the URL-prefix property `https://live-idol-producer.web.app/`. Verify it with the HTML file that Firebase already serves at `/google32a9d5bfd74c8735.html`; if Search Console asks for another file, release that file first. Submit `https://live-idol-producer.web.app/sitemap.xml`, then use Change of Address from the old property where it is supported.
3. Update the owner's published profile links to `https://live-idol-producer.web.app/`.
4. Keep the Netlify site and hostname while old links depend on them. Every commit on `main` must keep the forwarding rules, because each push republishes Netlify; automatic publishing can stay on. The preview channel expires by itself on 2026-10-28.

Report local validation, commit, push, Firebase preview, Firebase live release, Netlify forwarding, and search-indexing work separately. Completion means the directory works at the chosen Firebase origin, existing URLs forward correctly, and the owner has a repeatable release and rollback procedure.
