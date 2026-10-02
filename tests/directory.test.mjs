import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const html = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map(match => match[1]).find(source => source.includes("const SHEET_URL"));
new vm.Script(script);
const definitions = script.slice(0, script.indexOf("  (async () => {"));
const sampleFeeds = Object.fromEntries([
  ["1615162975", "producers"], ["2138418263", "songs"], ["2138418264", "credits"]
].map(([gid, name]) => [gid, readFileSync(new URL(`../data/${name}-sample.tsv`, import.meta.url), "utf8")]));

class Element {
  constructor(tag) {
    this.tag = tag;
    this.children = [];
    this.events = {};
    this.attributes = {};
    this.className = "";
    this.value = "";
    this._text = "";
  }
  appendChild(child) { child.parent = this; this.children.push(child); return child; }
  remove() { this.parent.children = this.parent.children.filter(child => child !== this); }
  setAttribute(name, value) { this.attributes[name] = value; }
  set textContent(value) { this._text = value; this.children = []; }
  get textContent() { return this._text + this.children.map(child => child.textContent).join(""); }
  set innerHTML(value) { this._html = value; this._text = ""; this.children = []; }
  get innerHTML() { return this._html || ""; }
  addEventListener(name, callback) { this.events[name] = callback; }
  removeEventListener(name) { delete this.events[name]; }
  fire(name) {
    const event = { preventDefault() {} };
    this.events[name]?.(event);
    this[`on${name}`]?.(event);
  }
  scrollIntoView(options) { this.scrolled = options; this.onScroll?.(); }
  querySelectorAll(selector) {
    return descendants(this).slice(1).filter(node => selector.startsWith(".")
      ? node.classList.contains(selector.slice(1)) : node.tag === selector);
  }
  get classList() {
    const owner = this;
    return {
      contains(name) { return owner.className.split(/\s+/).includes(name); },
      add(name) { if (!this.contains(name)) owner.className += ` ${name}`; },
      remove(name) { owner.className = owner.className.split(/\s+/).filter(item => item !== name).join(" "); },
      toggle(name, force) {
        const next = force ?? !this.contains(name);
        next ? this.add(name) : this.remove(name);
        return next;
      }
    };
  }
}
const descendants = node => [node, ...node.children.flatMap(descendants)];

function harness({ feeds = { ...sampleFeeds }, reducedMotion = false } = {}) {
  const controls = Object.fromEntries(["search-input", "search-close", "search-results", "search-overlay"]
    .map(id => [id, new Element("div")]));
  const main = new Element("main");
  const navLinks = ["find-actively", "chika-idol-active", "subculture", "hybrid", "overseas"].map(id => {
    const link = new Element("a");
    link.dataset = { section: id };
    return link;
  });
  const document = {
    createElement: tag => new Element(tag),
    createTextNode: text => { const node = new Element("#text"); node.textContent = text; return node; },
    getElementById: id => controls[id] || descendants(main).find(node => node.id === id),
    querySelector: selector => selector === "main" ? main : null,
    querySelectorAll: selector => selector === "#gnb-nav a[data-section]" ? navLinks : [],
    addEventListener() {}
  };
  const context = vm.createContext({
    URL, console, document,
    window: { matchMedia: () => ({ matches: reducedMotion }) },
    IntersectionObserver: class { observe() {} },
    fetch: async url => ({ ok: true, text: async () => feeds[new URL(url).searchParams.get("gid")] })
  });
  vm.runInContext(definitions, context);
  return {
    controls, main, navLinks, document, context,
    evaluate: source => vm.runInContext(source, context),
    search(query) {
      controls["search-input"].value = query;
      controls["search-input"].fire("input");
      return controls["search-results"];
    }
  };
}

async function loadSamples(options) {
  const app = harness(options);
  app.context.grouped = await app.evaluate("fetchProducers()");
  app.context.tracks = await app.evaluate("fetchTracks()");
  return app;
}

test("official websites normalize scheme-less addresses and reject invalid or unsafe links", async () => {
  const app = await loadSamples();
  const profile = Object.values(app.context.grouped).flat()[0];
  for (const [raw, expected] of [
    ["soundcloud.com/blkflagz", "https://soundcloud.com/blkflagz"],
    [" //soundcloud.com/blkflagz ", "https://soundcloud.com/blkflagz"],
    ["https://www.example.com/profile?q=cyan#bio", "https://www.example.com/profile?q=cyan#bio"],
    ["http://example.com/profile", "http://example.com/profile"],
    ["example.com:8080/profile", "https://example.com:8080/profile"]
  ]) {
    app.context.profile = { ...profile, officialPage: raw };
    const card = app.evaluate("buildCard(profile, [])");
    const link = descendants(card).find(node => node.classList.contains("official-link"));
    assert.equal(link?.href, expected, raw);
    assert.equal(link.textContent, new URL(expected).hostname.replace(/^www\./, ""));
    assert.equal(link.target, "_blank");
    assert.equal(link.rel, "noopener noreferrer");
  }
  for (const raw of ["", "javascript:alert(1)", "data:text/html,<script>", "ftp://example.com/file", "/contact", "../contact", "not a url", "https://", "https://user:secret@example.com", "https://example.com\\evil", "https://example.com\n/path"]) {
    app.context.profile = { ...profile, officialPage: raw };
    const card = app.evaluate("buildCard(profile, [])");
    assert.equal(descendants(card).filter(node => node.classList.contains("official-link")).length, 0, raw);
  }
});

test("all seven sample profiles without credits can be found and opened", async () => {
  const app = await loadSamples();
  app.evaluate("renderPage(grouped, tracks)");
  const uncredited = Object.values(app.context.grouped).flat().filter(profile => !app.context.tracks[profile.producerId]);
  assert.equal(uncredited.length, 7);
  assert.ok(uncredited.some(profile => profile.name === "Jenny Park"));
  for (const profile of uncredited) {
    const results = app.search(profile.name);
    assert.equal(results.children.length, 1, profile.name);
    const link = descendants(results).find(node => node.tag === "a" && node.textContent === profile.name);
    assert.ok(link, profile.name);
    assert.equal(results.querySelectorAll(".search-res-track").length, 0, "profiles must not show empty song entries");
    const card = app.document.getElementById(link.href.slice(1));
    assert.ok(card?.textContent.includes(profile.name));
    card.onScroll = () => assert.equal(app.controls["search-overlay"].classList.contains("active"), false);
    link.fire("click");
    assert.equal(card.scrolled?.behavior, "smooth");
    assert.equal(app.controls["search-input"].value, "");
    assert.equal(results.classList.contains("active"), false);
  }
});

test("every documented header is required, including trackUrl and profile/credit metadata", async () => {
  const schemas = [
    ["1615162975", "fetchProducers()", ["category", "name", "contactX", "mainGenre", "idolName", "officialPage", "comment", "producerId"]],
    ["2138418263", "fetchTracks()", ["songId", "trackTitle", "trackTitleAlt", "trackArtist", "trackArtistAlt", "trackUrl"]],
    ["2138418264", "fetchTracks()", ["songId", "trackTitle", "trackArtist", "producerId", "producerName", "Produce", "Mix & Mastering", "Vocal Director", "Bass", "Drum", "featured", "creditNote", "creditSourceUrl"]]
  ];
  for (const [gid, call, required] of schemas) {
    for (const header of required) {
      const lines = sampleFeeds[gid].split("\n");
      const headers = lines[0].split("\t");
      headers[headers.indexOf(header)] = `${header}_renamed`;
      lines[0] = headers.join("\t");
      const app = harness({ feeds: { ...sampleFeeds, [gid]: lines.join("\n") } });
      await assert.rejects(app.evaluate(call), /Missing required Sheet columns/, `${gid}: ${header}`);
    }
  }
  const renamed = sampleFeeds["2138418263"].replace("trackUrl", "trackURL");
  await assert.rejects(harness({ feeds: { ...sampleFeeds, "2138418263": renamed } }).evaluate("fetchTracks()"), /trackUrl/);
});

test("optional cells may be blank and column order may change", async () => {
  const feeds = Object.fromEntries(Object.entries(sampleFeeds).map(([gid, body]) => [gid,
    body.split("\n").map(line => line.split("\t").reverse().join("\t")).join("\n")
  ]));
  const app = await loadSamples({ feeds });
  assert.equal(Object.values(app.context.grouped).flat().length, 11);
  assert.equal(Object.values(app.context.tracks).flat().length, 5);
  assert.equal(app.context.tracks.p004[0].trackUrl, "");
  assert.deepEqual(Array.from(app.context.tracks.p002[0].roles), ["Produce", "Vocal Director"]);

  const identifiers = {
    "1615162975": ["category", "name", "producerId"],
    "2138418263": ["songId", "trackTitle"],
    "2138418264": ["songId", "producerId"]
  };
  const blankFeeds = Object.fromEntries(Object.entries(sampleFeeds).map(([gid, body]) => {
    const [header, ...rows] = body.split("\n");
    const headers = header.split("\t");
    const blankRows = rows.map(row => row.split("\t").map((cell, index) =>
      identifiers[gid].includes(headers[index]) ? cell : ""
    ).join("\t"));
    return [gid, [header, ...blankRows].join("\n")];
  }));
  const blankApp = await loadSamples({ feeds: blankFeeds });
  assert.equal(Object.values(blankApp.context.grouped).flat().length, 11);
  assert.equal(Object.values(blankApp.context.tracks).flat().length, 5);
  assert.deepEqual(Array.from(blankApp.context.tracks.p002[0].roles), []);
  assert.equal(blankApp.context.tracks.p002[0].trackArtist, "");
});

test("category navigation closes search before scrolling, including reduced motion", async () => {
  for (const reducedMotion of [false, true]) {
    const app = await loadSamples({ reducedMotion });
    app.evaluate("renderPage(grouped, tracks)");
    const results = app.search("Bass");
    assert.ok(results.textContent.includes("Bass"));
    assert.ok(app.controls["search-overlay"].classList.contains("active"));
    const section = app.document.getElementById("hybrid");
    section.onScroll = () => {
      assert.equal(app.controls["search-overlay"].classList.contains("active"), false);
      assert.equal(results.classList.contains("active"), false);
      assert.equal(app.controls["search-close"].classList.contains("visible"), false);
      assert.equal(app.controls["search-input"].value, "");
    };
    app.navLinks.find(link => link.dataset.section === "hybrid").fire("click");
    assert.equal(section.scrolled.behavior, reducedMotion ? "auto" : "smooth");
  }
});

test("song links, alternate titles/artists, and multilingual role search still work", async () => {
  const app = await loadSamples();
  app.context.tracks.p003[0].trackUrl = "youtu.be/example1";
  app.context.tracks.p003[0].trackTitleAlt = "Daybreak melody";
  app.context.tracks.p003[0].trackArtistAlt = "Starlight idols";
  app.evaluate("setupSearch(grouped, tracks)");
  for (const query of ["Daybreak", "Starlight", "믹싱", "ミックス"]) {
    const results = app.search(query);
    assert.equal(results.children.length, 1, query);
    assert.ok(results.textContent.includes("田中たかし"));
    assert.equal(results.querySelectorAll(".search-res-track")[0].children[0].href, "https://youtu.be/example1");
  }
  app.context.track = app.context.tracks.p003[0];
  assert.equal(app.evaluate("buildTrackRow(track)").querySelectorAll("a")[0].href, "https://youtu.be/example1");
  app.context.track.trackUrl = "javascript:alert(1)";
  assert.equal(app.evaluate("buildTrackRow(track)").querySelectorAll("a").length, 0);
  app.evaluate("setupSearch(grouped, tracks)");
  assert.equal(app.search("Daybreak").querySelectorAll("a").filter(link => link.target === "_blank").length, 0);
});

test("TSV parser preserves quoted tabs, newlines, quotation marks, and CJK text", () => {
  const app = harness();
  app.context.tsv = '\uFEFFname\tnote\r\n"한국어 日本語"\t"first\tfield\nsecond ""quoted"" line"\r\n';
  const rows = app.evaluate('parseTSV(tsv, ["name", "note"])');
  assert.equal(rows[0].name, "한국어 日本語");
  assert.equal(rows[0].note, 'first\tfield\nsecond "quoted" line');
});
