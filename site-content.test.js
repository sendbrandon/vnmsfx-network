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
  assert.match(html, /VNMSFX found/);
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

test('connection explainer is VNMSFX-owned and platform-neutral in visible copy', () => {
  const html = read('how-it-connects.html');
  const text = visibleText(html);
  assert.match(text, /Your VNMSFX system/);
  assert.match(text, /Your company AI checks the right tools/);
  assert.match(text, /Act before day 35/);
  assert.doesNotMatch(text, /Claude/i);
  assert.match(html, /\.answer\{opacity:1;transform:none\}/);
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
  assert.match(systems, /See how your company AI reaches the approved tools/);
});
