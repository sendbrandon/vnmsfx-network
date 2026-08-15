const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const visibleText = (html) => html
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

test('homepage diagram shows four raw sources producing one derived finding', () => {
  const html = read('index.html');
  assert.equal((html.match(/class="source-card /g) || []).length, 4);
  assert.match(html, /Wholesale order #1849 · \$12,400/);
  assert.match(html, /Payment posted · \$7,580/);
  assert.match(html, /Dispute deadline · Friday/);
  assert.match(html, /100 cases delivered · signed/);
  assert.match(html, /SIGHT found/);
  assert.match(html, /\$4,820 short-pay/);
  assert.doesNotMatch(html, /These six logos are examples|mechanism-notes/);
});

test('example-day findings are visible without JavaScript and preventive', () => {
  const html = read('index.html');
  assert.match(html, /\.ai-response\{opacity:1;transform:none\}/);
  assert.match(html, /24 hours left before their ship promise/);
  assert.match(html, /two days from the end of its normal reorder window/);
  assert.doesNotMatch(html, /missed their ship promise|13 days past its normal reorder window/);
});

test('homepage introduces SIGHT inside the existing mobile copy budget', () => {
  const html = read('index.html');
  const match = html.match(/<p class="hero-deck">([\s\S]*?)<\/p>/);
  assert.ok(match, 'homepage hero deck should exist');
  const copy = visibleText(match[1]);
  assert.match(copy, /^Meet SIGHT by VNMSFX, your company AI\./);
  assert.ok(copy.split(/\s+/).length <= 28, 'SIGHT introduction should stay at or below 28 words');
});

test('connection explainer is VNMSFX-owned and platform-neutral in visible copy', () => {
  const html = read('how-it-connects.html');
  const text = visibleText(html);
  assert.match(text, /SIGHT by VNMSFX/);
  assert.match(text, /Meet SIGHT by VNMSFX/);
  assert.match(text, /Ask a normal business question\. SIGHT checks the right tools/);
  assert.match(text, /See Important Gaps Hiding between Tools/);
  assert.match(text, /Act before day 35/);
  assert.doesNotMatch(text, /Claude/i);
  assert.ok((text.match(/\bSIGHT\b/g) || []).length <= 10, 'connection page should explain the name without chanting it');
  assert.match(html, /\.answer\{opacity:1;transform:none\}/);
});

test('SIGHT is placed as one system identity without renaming unrelated pages', () => {
  const home = visibleText(read('index.html'));
  const systems = visibleText(read('systems.html'));
  const sample = visibleText(read('sample-audit.html'));
  const terms = visibleText(read('terms.html'));
  const security = visibleText(read('security.html'));
  const unrelated = ['privacy.html', 'studio.html', 'leak-check.html']
    .map((name) => visibleText(read(name)))
    .join(' ');

  assert.match(home, /Meet SIGHT by VNMSFX, your company AI/);
  assert.match(home, /SIGHT keeps checking the process we audited/);
  assert.match(home, /You own SIGHT/);
  assert.match(systems, /How SIGHT handles it/);
  assert.match(sample, /The Build creates SIGHT to keep watching it/);
  assert.match(terms, /builds SIGHT by VNMSFX, one client-owned AI system/);
  assert.match(security, /SIGHT is the standard VNMSFX system/);
  assert.doesNotMatch(`${home} ${systems} ${sample}`, /Sight AI|Site by VNMSFX/i);
  assert.doesNotMatch(unrelated, /\bSIGHT\b/);
  assert.ok((home.match(/\bSIGHT\b/g) || []).length <= 12, 'homepage should not repeat the name excessively');
  assert.ok((systems.match(/\bSIGHT\b/g) || []).length <= 14, 'systems page should keep the name scannable');
  assert.ok((sample.match(/\bSIGHT\b/g) || []).length <= 12, 'sample page should stay focused on the method');
});

test('machine-readable category copy stays direct without expanding the held offer', () => {
  const home = read('index.html');
  const llms = read('llms.txt');
  assert.match(home, /CPG product brands&mdash;not restaurants/);
  assert.match(llms, /CPG product brands—not restaurants/);
  assert.doesNotMatch(llms, /AI Visibility Audit|\$750/);
});

test('JSON-LD remains valid and the systems comparison stays semantic', () => {
  const home = read('index.html');
  const systems = read('systems.html');
  const blocks = [...home.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(blocks.length, 2);
  blocks.forEach((block) => assert.doesNotThrow(() => JSON.parse(block[1])));
  assert.doesNotMatch(systems, /class="sales-check" role="img"/);
  assert.match(systems, /See how SIGHT reaches the approved tools/);
});
