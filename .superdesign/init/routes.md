# SuperDesign repository init

Source: the current main working tree, including the live song-credit migration.
Stack: static HTML, vanilla JavaScript, inline vanilla CSS, custom DOM components; no dependency manifest or build step. Netlify serves public/.

# Routes

| URL | Source | Content |
| --- | --- | --- |
| / | public/index.html | Main directory; shared header/main/footer |
| /#find-actively | public/index.html | 적극 모집 프로듀서 |
| /#chika-idol-active | public/index.html | 라이브아이돌 프로듀서 |
| /#subculture | public/index.html | 서브컬처 프로듀서 |
| /#hybrid | public/index.html | 하이브리드 장르 프로듀서 |
| /#overseas | public/index.html | 해외 프로듀서 |
| /google32a9d5bfd74c8735.html | public/google32a9d5bfd74c8735.html | Verification file; not a product UI |

No framework router exists. Anchors scroll smoothly; IntersectionObserver updates active navigation. Empty categories are hidden.

## Complete navigation markup

```html
<header>
  <div class="gnb-inner">
    <a class="gnb-brand" href="#">라이브아이돌 프로듀서</a>
    <nav id="gnb-nav">
      <a href="#find-actively" data-section="find-actively">적극 모집 프로듀서</a>
      <a href="#chika-idol-active" data-section="chika-idol-active">라이브아이돌 프로듀서</a>
      <a href="#subculture" data-section="subculture">서브컬처 프로듀서</a>
      <a href="#hybrid" data-section="hybrid">하이브리드 장르 프로듀서</a>
      <a href="#overseas" data-section="overseas">해외 프로듀서</a>
    </nav>
  </div>
</header>
```

## Page rendering

```js
function renderPage(grouped, trackMap) {
    const main = document.querySelector("main");
    const loading = document.getElementById("loading");
    if (loading) loading.remove();
    main.querySelectorAll(".category-section").forEach(s => s.remove());

    setupSearch(grouped, trackMap);

    const sections = [];

    CATEGORY_ORDER.forEach(cat => {
      const items = grouped[cat] || [];
      if (!items.length) return;

      const section = document.createElement("section");
      section.className = "category-section";
      section.id = SECTION_IDS[cat];

      const heading = document.createElement("h2");
      heading.textContent = CATEGORY_LABELS[cat] || cat;
      section.appendChild(heading);

      const grid = document.createElement("div");
      grid.className = "card-grid";
      items.forEach(p => grid.appendChild(buildCard(p, trackMap[p.producerId] || [])));
      section.appendChild(grid);

      main.appendChild(section);
      sections.push(section);
    });

    setupIntersectionObserver(sections);
  }
```

## Navigation behavior

```js
function setupIntersectionObserver(sections) {
    const navLinks = document.querySelectorAll("#gnb-nav a[data-section]");

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(a => {
            a.classList.toggle("active", a.dataset.section === entry.target.id);
          });
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px", threshold: 0 });

    sections.forEach(s => observer.observe(s));

    navLinks.forEach(a => {
      a.addEventListener("click", e => {
        e.preventDefault();
        const target = document.getElementById(a.dataset.section);
        if (target) target.scrollIntoView({ behavior: "smooth" });
      });
    });
  }
```
