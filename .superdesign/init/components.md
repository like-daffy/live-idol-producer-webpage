# SuperDesign repository init

Source: the current main working tree, including the live song-credit migration.
Stack: static HTML, vanilla JavaScript, inline vanilla CSS, custom DOM components; no dependency manifest or build step. Netlify serves public/.

# Shared UI primitives

All implementations are in public/index.html. Global CSS is in theme.md. Each function below is complete, including nested event handlers.

## Role definitions and chevron

```js
const CREDIT_ROLES = [
    { name: "Produce", description: "작곡·편곡·음악 프로듀싱 / 作曲・編曲・音楽プロデュース" },
    { name: "Mix & Mastering", description: "믹싱·마스터링 / ミックス・マスタリング" },
    { name: "Vocal Director", description: "보컬 디렉팅 / ボーカルディレクション" },
    { name: "Bass", description: "베이스 연주 / ベース演奏" },
    { name: "Drum", description: "드럼 연주 / ドラム演奏" }
  ];
  const CHEVRON_SVG = `<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="2,4 6,8 10,4"/></svg>`;
```

## CreditRoles
Source: public/index.html, buildCreditRoles

Small text badges; input: array of selected role names.

```js
function buildCreditRoles(roles) {
    const wrap = document.createElement("span");
    wrap.className = "credit-roles";
    roles.forEach(name => {
      const badge = document.createElement("span");
      badge.className = "credit-role";
      badge.textContent = name;
      badge.title = CREDIT_ROLES.find(role => role.name === name).description;
      wrap.appendChild(badge);
    });
    return wrap;
  }
```

## TrackRow
Source: public/index.html, buildTrackRow

Song, artist, optional listening link, and role badges; input: one joined song credit.

```js
function buildTrackRow(t) {
    const row = document.createElement("div");
    row.className = "card-track";
    const info = document.createElement("span");
    info.className = "track-info";
    if (t.trackUrl) {
      const a = document.createElement("a");
      a.href = t.trackUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = t.trackTitle;
      info.appendChild(a);
    } else {
      info.appendChild(document.createTextNode(t.trackTitle));
    }
    if (t.trackArtist) {
      info.appendChild(document.createTextNode(` - ${t.trackArtist}`));
    }
    if (t.roles.length) info.appendChild(buildCreditRoles(t.roles));
    row.appendChild(info);
    return row;
  }
```

## ProducerCard
Source: public/index.html, buildCard

Profile, contacts, featured songs, and accordion; inputs: profile and its credits.

```js
function buildCard(p, tracks) {
    const card = document.createElement("div");
    card.className = "card";

    // Left column: genre badge, name, idol name
    const left = document.createElement("div");
    left.className = "card-left";

    if (p.mainGenre) {
      const badge = document.createElement("span");
      badge.className = "card-genre";
      badge.textContent = p.mainGenre;
      left.appendChild(badge);
    }

    const name = document.createElement("h3");
    name.className = "card-name";
    name.textContent = p.name;
    left.appendChild(name);

    if (p.idolName) {
      const idol = document.createElement("div");
      idol.className = "card-idol";
      idol.textContent = p.idolName;
      left.appendChild(idol);
    }

    card.appendChild(left);

    // Right column: comment, tracks, footer links
    const right = document.createElement("div");
    right.className = "card-right";

    if (p.comment) {
      const comment = document.createElement("p");
      comment.className = "card-comment";
      comment.textContent = p.comment;
      right.appendChild(comment);
    }

    const featured = tracks.filter(t => t.featured);
    const extra    = tracks.filter(t => !t.featured);
    const showAccordion = tracks.length >= 3 && extra.length > 0;

    if (tracks.length) {
      const wrap = document.createElement("div");

      // Featured tracks — always visible
      const featuredEl = document.createElement("div");
      featuredEl.className = "card-tracks";
      featured.forEach(t => featuredEl.appendChild(buildTrackRow(t)));
      wrap.appendChild(featuredEl);

      if (showAccordion) {
        // Extra tracks — hidden until expanded
        const extraEl = document.createElement("div");
        extraEl.className = "card-tracks-extra";
        extra.forEach(t => extraEl.appendChild(buildTrackRow(t)));
        wrap.appendChild(extraEl);

        const btn = document.createElement("button");
        btn.className = "accordion-btn";
        btn.innerHTML = `${CHEVRON_SVG}더보기 (+${extra.length}곡)`;
        btn.addEventListener("click", () => {
          const isOpen = extraEl.classList.toggle("open");
          btn.classList.toggle("open", isOpen);
          btn.innerHTML = isOpen
            ? `${CHEVRON_SVG}접기`
            : `${CHEVRON_SVG}더보기 (+${extra.length}곡)`;
        });
        wrap.appendChild(btn);
      } else {
        extra.forEach(t => featuredEl.appendChild(buildTrackRow(t)));
      }

      right.appendChild(wrap);
    }

    if (p.contactX || p.officialPage) {
      const footer = document.createElement("div");
      footer.className = "card-footer";

      if (p.contactX) {
        const handle = xHandle(p.contactX);
        const xLink = document.createElement("a");
        xLink.href = `https://x.com/${handle}`;
        xLink.target = "_blank";
        xLink.rel = "noopener noreferrer";
        const icon = document.createElement("img");
        icon.src = "/Twitter-X.svg";
        icon.alt = "X";
        icon.className = "x-icon";
        xLink.appendChild(icon);
        xLink.appendChild(document.createTextNode(`@${handle}`));
        footer.appendChild(xLink);
      }

      if (p.officialPage) {
        const oLink = document.createElement("a");
        oLink.href = p.officialPage;
        oLink.target = "_blank";
        oLink.rel = "noopener noreferrer";
        oLink.className = "official-link";
        try {
          oLink.textContent = new URL(p.officialPage).hostname.replace(/^www\./, "");
        } catch {
          oLink.textContent = p.officialPage;
        }
        footer.appendChild(oLink);
      }

      right.appendChild(footer);
    }

    card.appendChild(right);
    return card;
  }
```

## DirectorySearch
Source: public/index.html, setupSearch

Search results and overlay; inputs: categorized profiles and ID-keyed song credits.

```js
function setupSearch(grouped, trackMap) {
    const searchData = [];
    CATEGORY_ORDER.forEach(cat => {
      (grouped[cat] || []).forEach(p => {
        (trackMap[p.producerId] || []).forEach(t => {
          searchData.push({
            producerName:   p.name,
            trackTitle:     t.trackTitle,
            trackTitleAlt:  t.trackTitleAlt  || "",
            trackArtist:    t.trackArtist    || "",
            trackArtistAlt: t.trackArtistAlt || "",
            trackUrl:       t.trackUrl       || "",
            roles:          t.roles,
            roleSearchText: t.roles.map(name => {
              const role = CREDIT_ROLES.find(role => role.name === name);
              return `${name} ${role.description}`;
            }).join(" ").toLowerCase()
          });
        });
      });
    });

    const input   = document.getElementById("search-input");
    const closeBtn = document.getElementById("search-close");
    const results  = document.getElementById("search-results");
    const overlay  = document.getElementById("search-overlay");

    function closeSearch() {
      input.value = "";
      closeBtn.classList.remove("visible");
      results.classList.remove("active");
      results.innerHTML = "";
      overlay.classList.remove("active");
    }

    function runSearch(raw) {
      const q = raw.trim().toLowerCase();
      if (!q) { closeSearch(); return; }

      const matches = searchData.filter(item =>
        item.producerName.toLowerCase().includes(q)   ||
        item.trackTitle.toLowerCase().includes(q)     ||
        item.trackTitleAlt.toLowerCase().includes(q)  ||
        item.trackArtist.toLowerCase().includes(q)    ||
        item.trackArtistAlt.toLowerCase().includes(q) ||
        item.roleSearchText.includes(q)
      );

      results.innerHTML = "";
      if (matches.length === 0) {
        const empty = document.createElement("div");
        empty.className = "search-no-results";
        empty.textContent = "검색 결과가 없습니다. / 検索結果がありません。";
        results.appendChild(empty);
      } else {
        matches.forEach(item => {
          const row = document.createElement("div");
          row.className = "search-result-item";

          const prod = document.createElement("span");
          prod.className = "search-res-producer";
          prod.textContent = item.producerName;
          row.appendChild(prod);

          const sep1 = document.createElement("span");
          sep1.className = "search-res-sep";
          sep1.textContent = "—";
          row.appendChild(sep1);

          const track = document.createElement("span");
          track.className = "search-res-track";
          if (item.trackUrl) {
            const a = document.createElement("a");
            a.href = item.trackUrl;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            a.textContent = item.trackTitle;
            track.appendChild(a);
          } else {
            track.textContent = item.trackTitle;
          }
          row.appendChild(track);

          if (item.trackArtist) {
            const sep2 = document.createElement("span");
            sep2.className = "search-res-sep";
            sep2.textContent = "—";
            row.appendChild(sep2);

            const artist = document.createElement("span");
            artist.className = "search-res-artist";
            artist.textContent = item.trackArtist;
            row.appendChild(artist);
          }

          if (item.roles.length) row.appendChild(buildCreditRoles(item.roles));

          results.appendChild(row);
        });
      }

      results.classList.add("active");
      overlay.classList.add("active");
      closeBtn.classList.add("visible");
    }

    input.removeEventListener("input", input._searchHandler);
    input._searchHandler = () => runSearch(input.value);
    input.addEventListener("input", input._searchHandler);

    closeBtn.onclick = closeSearch;
    overlay.onclick  = closeSearch;
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeSearch(); });
  }
```

## Search input and loading state

```html
<main>
  <div id="search-wrap">
    <div class="search-bar-row">
      <input id="search-input" type="search" placeholder="프로듀서명, 곡명, 아티스트명, 참여 역할로 검색… / 名前・曲名・アーティスト名・参加役割で検索…" autocomplete="off" spellcheck="false">
      <button id="search-close" type="button" aria-label="검색 닫기">✕</button>
    </div>
    <div id="search-results"></div>
  </div>
  <div id="loading">Loading producers…</div>
</main>
```
