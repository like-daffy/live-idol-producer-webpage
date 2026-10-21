import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { prerender } from "../scripts/prerender.mjs";

const html = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const sampleFeeds = Object.fromEntries([
  ["1615162975", "producers"], ["2138418263", "songs"], ["2138418264", "credits"]
].map(([gid, name]) => [gid, readFileSync(new URL(`../data/${name}-sample.tsv`, import.meta.url), "utf8")]));
const feedsFetch = feeds => async url => ({ ok: true, status: 200, text: async () => feeds[new URL(url).searchParams.get("gid")] });
const structuredData = output =>
  JSON.parse(output.match(/<script type="application\/ld\+json" id="directory-ld">([^<]*)<\/script>/)[1]);

test("prerender puts every sample card into the HTML, with structured data naming the same profiles", async () => {
  // A third, unfeatured credit gives 田中たかし an accordion.
  const credits = `${sampleFeeds["2138418264"].trimEnd()}\ns0002\t달빛 아래서\t루나걸즈\tp003\t田中たかし\tTRUE\tFALSE\tFALSE\tFALSE\tFALSE\tFALSE\t\t""\n`;
  const { html: output, profiles } = await prerender(html, feedsFetch({ ...sampleFeeds, "2138418264": credits }));
  const cards = [...output.matchAll(/<div class="card" id="producer-([^"]+)">/g)].map(match => match[1]);
  const names = [...output.matchAll(/<h3 class="card-name">([^<]*)<\/h3>/g)].map(match => match[1]);
  assert.equal(profiles, 11);
  assert.equal(cards.length, 11);
  assert.match(output, /<div id="loading" hidden><\/div>/);
  assert.doesNotMatch(output, /Loading producers…/);
  assert.equal((output.match(/<\/main>/g) || []).length, 1);
  assert.match(output, /<span class="credit-role" title="[^"]+">Vocal Director<\/span>/);
  const extra = output.slice(output.indexOf('<div class="card-tracks-extra" id="tracks-p003">'), output.indexOf('<button type="button" class="accordion-btn"'));
  assert.deepEqual([...extra.matchAll(/rel="noopener noreferrer">([^<]+)<\/a>/g)].map(match => match[1]), ["夜明けのメロディ", "달빛 아래서"]);
  assert.match(output, /<button type="button" class="accordion-btn" aria-expanded="false" aria-controls="tracks-p003"><svg [^>]*>.*?<\/svg>더보기 \(\+2곡\)<\/button>/);

  const list = structuredData(output)["@graph"][1].mainEntity;
  assert.equal(list.numberOfItems, 11);
  assert.deepEqual(list.itemListElement.map(item => item.name), names);
  assert.deepEqual(list.itemListElement.map(item => item.url),
    cards.map(id => `https://live-idol-producer.web.app/#producer-${id}`));
});

test("prerender escapes Sheet text in HTML and in the structured data script", async () => {
  const hostile = '<img src=x onerror=alert(1)> & "q" $& $\' </script>';
  const lines = sampleFeeds["1615162975"].split("\n");
  const headers = lines[0].split("\t");
  const cells = lines[1].split("\t");
  cells[headers.indexOf("name")] = hostile;
  cells[headers.indexOf("comment")] = hostile;
  lines[1] = cells.join("\t");
  const { html: output } = await prerender(html, feedsFetch({ ...sampleFeeds, "1615162975": lines.join("\n") }));

  assert.doesNotMatch(output, /<img src=x/);
  assert.ok(output.includes('<h3 class="card-name">&lt;img src=x onerror=alert(1)&gt; &amp; "q" $&amp; $\' &lt;/script&gt;</h3>'));
  assert.equal((output.match(/<\/script>/g) || []).length, (html.match(/<\/script>/g) || []).length + 1);
  assert.equal(structuredData(output)["@graph"][1].mainEntity.itemListElement[0].name, hostile);
  assert.match(output, /<div id="loading" hidden><\/div>/);
});

test("prerender fails instead of publishing a snapshot with missing columns or broken references", async () => {
  const renamed = sampleFeeds["2138418264"].replace("producerId", "producerID");
  await assert.rejects(prerender(html, feedsFetch({ ...sampleFeeds, "2138418264": renamed })), /Missing required Sheet columns/);

  const lines = sampleFeeds["2138418264"].split("\n");
  const column = lines[0].split("\t").indexOf("producerId");
  const cells = lines[1].split("\t");
  cells[column] = "p999";
  lines[1] = cells.join("\t");
  await assert.rejects(prerender(html, feedsFetch({ ...sampleFeeds, "2138418264": lines.join("\n") })), /Unknown credit producerId/);

  await assert.rejects(prerender(html.replace("Loading producers…", "Loading…"), feedsFetch(sampleFeeds)), /loading placeholder/);
});
