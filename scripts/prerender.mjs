// Prerender the directory into dist/ at release time: the cards and their structured data
// go into dist/index.html so crawlers see them without JavaScript, and browsers still load
// the live feeds and re-render. firebase.json runs this before every deploy; a feed or
// schema error fails the deploy instead of publishing a broken snapshot.
import { cpSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const LOADING = '  <div id="loading">Loading producers…</div>\n</main>';

const escapeText = text => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeAttribute = value => escapeText(value).replace(/"/g, "&quot;");
// JSON inside <script> must not be able to close the element.
const scriptJson = value => JSON.stringify(value)
  .replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026")
  .replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");

class Text {
  constructor(data) { this.data = String(data); }
  get textContent() { return this.data; }
}

// Just enough DOM for renderPage(), serializable to HTML.
class Element {
  constructor(tag) {
    this.tagName = tag;
    this.attributes = new Map();
    this.childNodes = [];
    this.rawHTML = null;
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  appendChild(child) { child.parentNode = this; this.childNodes.push(child); return child; }
  remove() { this.parentNode.childNodes = this.parentNode.childNodes.filter(child => child !== this); }
  addEventListener() {}
  removeEventListener() {}
  set textContent(text) { this.rawHTML = null; this.childNodes = [new Text(text)]; }
  get textContent() { return this.childNodes.map(child => child.textContent).join(""); }
  set innerHTML(html) { this.rawHTML = html; this.childNodes = []; }
  get classList() {
    const classes = () => (this.getAttribute("class") || "").split(/\s+/).filter(Boolean);
    return {
      contains: name => classes().includes(name),
      add: name => { if (!classes().includes(name)) this.setAttribute("class", [...classes(), name].join(" ")); },
      remove: name => this.setAttribute("class", classes().filter(item => item !== name).join(" "))
    };
  }
  querySelectorAll(selector) {
    if (!selector.startsWith(".")) throw new Error(`Unsupported selector ${selector}`);
    const found = [];
    const visit = node => node.childNodes.forEach(child => {
      if (!(child instanceof Element)) return;
      if (child.classList.contains(selector.slice(1))) found.push(child);
      visit(child);
    });
    visit(this);
    return found;
  }
}
for (const [property, attribute] of Object.entries({ id: "id", className: "class", href: "href", target: "target", rel: "rel", title: "title", type: "type" })) {
  Object.defineProperty(Element.prototype, property, {
    get() { return this.getAttribute(attribute) ?? ""; },
    set(value) { this.setAttribute(attribute, value); }
  });
}

function serialize(node) {
  if (node instanceof Text) return escapeText(node.data);
  const attributes = [...node.attributes].map(([name, value]) => ` ${name}="${escapeAttribute(value)}"`).join("");
  return `<${node.tagName}${attributes}>${node.rawHTML ?? node.childNodes.map(serialize).join("")}</${node.tagName}>`;
}

function pageDefinitions(html) {
  const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
    .map(match => match[1]).find(source => source.includes("const SHEET_URL"));
  const end = script?.indexOf("  (async () => {") ?? -1;
  if (end < 0) throw new Error("index.html no longer has the directory script layout the prerender expects");
  return script.slice(0, end);
}

// Returns index.html with the cards and structured data in place, using the page's own code.
export async function prerender(html, fetchFeed, now = new Date()) {
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
  const siteName = html.match(/<meta property="og:site_name" content="([^"]+)">/)?.[1];
  if (!canonical || !siteName || !html.includes(LOADING) || !html.includes("</head>")) {
    throw new Error("index.html no longer has the canonical link, og:site_name, loading placeholder, or </head>");
  }

  const main = new Element("main");
  const controls = Object.fromEntries(["search-input", "search-close", "search-results", "search-overlay"]
    .map(id => [id, new Element("div")]));
  const document = {
    createElement: tag => new Element(tag),
    createTextNode: text => new Text(text),
    getElementById: id => controls[id] ?? null,
    querySelector: selector => selector === "main" ? main : null,
    querySelectorAll: () => [],
    addEventListener() {}
  };
  const context = vm.createContext({
    URL, console, document, fetch: fetchFeed,
    window: { matchMedia: () => ({ matches: false }) },
    IntersectionObserver: class { observe() {} }
  });
  vm.runInContext(pageDefinitions(html), context);
  context.loaded = await vm.runInContext("loadDirectory()", context);
  vm.runInContext("renderPage(loaded[0], loaded[1])", context);
  context.site = { url: canonical, name: siteName };
  const structuredData = vm.runInContext("buildStructuredData(loaded[0], site)", context);

  const sections = main.childNodes.map(serialize).join("\n");
  const profiles = (sections.match(/<div class="card" id="producer-/g) || []).length;
  const output = html
    .replace("</head>", () => `  <script type="application/ld+json" id="directory-ld">${scriptJson(structuredData)}</script>\n</head>`)
    .replace(LOADING, () => [
      '  <div id="loading" hidden></div>',
      `  <!-- Prerendered from the published Sheets at ${now.toISOString()}; the page reloads the live feeds. -->`,
      sections,
      "</main>"
    ].join("\n"));
  return { html: output, profiles };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const { html, profiles } = await prerender(readFileSync(resolve(root, "public/index.html"), "utf8"), fetch);
  rmSync(resolve(root, "dist"), { recursive: true, force: true });
  cpSync(resolve(root, "public"), resolve(root, "dist"), { recursive: true });
  writeFileSync(resolve(root, "dist/index.html"), html);
  console.log(`Prerendered ${profiles} profiles into dist/index.html (${Buffer.byteLength(html)} bytes)`);
}
