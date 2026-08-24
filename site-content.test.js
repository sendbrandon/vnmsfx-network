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
  assert.match(copy, /^Hidden problems cost you money\./);
  assert.ok(copy.split(/\s+/).length <= 28, 'hero deck should stay at or below 28 words');
  assert.match(html, /<h2 class="say wide">Meet SIGHT\.<\/h2>/);
  assert.match(html, /SIGHT is the AI system I build for you/);
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

  assert.match(home, /Meet SIGHT\./);
  assert.match(home, /SIGHT is the AI system I build for you/);
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

test('machine-readable category copy stays direct and the released audit stays consistent', () => {
  const home = read('index.html');
  const llms = read('llms.txt');
  assert.match(home, /CPG product brands&mdash;not restaurants/);
  assert.match(llms, /CPG product brands—not restaurants/);
  // Brandon released the AI Visibility Audit for the site 2026-08-15 ($750 confirmed) and
  // ordered the page built 2026-08-17. The old guard forbade it here while the offer was held;
  // the guard now checks the released offer is stated consistently instead of absent.
  assert.match(llms, /The AI Visibility Audit \(\$750\)/);
  assert.match(llms, /https:\/\/vnmsfx\.com\/ai-visibility-audit/);
  assert.match(llms, /no promise of future AI rankings/);
  assert.match(llms, /credits in full toward a Leak Audit signed and paid within 60 calendar days/);
});

test('AI Visibility Audit page states the OFFER.md v2.4 unit without over-promising', () => {
  const html = read('ai-visibility-audit.html');
  const text = visibleText(html);
  // The unit facts: price, clock, counts.
  assert.match(text, /\$750/);
  assert.match(text, /3 business days|three business days/i);
  assert.match(text, /25 buyer questions/);
  assert.match(text, /3 named assistants|three named AI assistants/);
  assert.match(text, /75 screenshotted answers|75 answers/);
  // The credit rule, both directions of the 60-day clock.
  assert.match(text, /credits in full toward the \$2,500/);
  assert.match(text, /60 calendar days/);
  // The boundaries the offer requires stated on any public surface.
  assert.match(text, /No promise of future AI rankings, recommendations, mentions, traffic or revenue/);
  assert.match(text, /a later re-run is a new engagement, not a defect/);
  assert.match(text, /no found-nothing refund/i);
  assert.match(text, /public information only/i);
  // The demonstration is invented and says so.
  assert.match(text, /invented to show the method/);
  assert.match(text, /Uncle Ott/);
  // The CTA is a direct request, not a checkout; no payment surface exists for this page.
  // (The shared attribution snippet's selector may name Stripe; an actual link may not.)
  assert.match(html, /mailto:brandon@vnmsfx\.com\?subject=AI%20Visibility%20Audit/);
  assert.doesNotMatch(html, /href="https:\/\/buy\.stripe\.com/);
  // Front-rung page: SIGHT belongs two rungs later and stays off it.
  assert.doesNotMatch(text, /\bSIGHT\b/);
  // Visible without JavaScript: staged hiding only applies under the JS-added armed class.
  assert.match(html, /\.avdemo\.is-armed \.ai-answer/);
  assert.doesNotMatch(html, /\.ai-answer\{opacity:0/);
  // The wrong cells pulse, the grid is touchable, and reduced-motion kills both.
  assert.match(html, /wrongpulse/);
  assert.match(html, /gridtip/);
  assert.match(html, /Touch or hover any cell/);
  assert.match(html, /\.cells b\.wr,\.gridwrap\.is-run \.cells b,\.gridwrap\.is-run \.cells b\.wr\{animation:none\}/);
  // Its JSON-LD parses and carries the price.
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(blocks.length, 1);
  const ld = JSON.parse(blocks[0][1]);
  assert.equal(ld.offers.price, '750');
  // Grid tallies stay arithmetically honest: 41+9+17+8 = 75.
  assert.match(html, /Correct &middot; 41/);
  assert.match(html, /Wrong &middot; 9/);
  assert.match(html, /Brand absent &middot; 17/);
  assert.match(html, /Rival recommended &middot; 8/);
  const cellRows = [...html.matchAll(/<div class="cells"[^>]*>([\s\S]*?)<\/div>/g)];
  assert.equal(cellRows.length, 3);
  const all = cellRows.map((m) => m[1]).join('');
  const count = (cls) => (all.match(new RegExp(`class="${cls}"`, 'g')) || []).length;
  assert.equal(count('c'), 41);
  assert.equal(count('wr'), 9);
  assert.equal(count('a'), 17);
  assert.equal(count('rv'), 8);
});

test('the signal fixes hold: a face on the money page, a visual audit link, the bio early', () => {
  const home = read('index.html');
  const audit = read('ai-visibility-audit.html');

  // 1. A human appears on the page that asks for money.
  assert.match(audit, /class="runby"/);
  assert.match(audit, /assets\/brandon\.jpg/);
  assert.match(audit, /Brandon Adams runs it\./);

  // 2. The homepage audit link is a visual card, not a bare text line.
  assert.match(home, /class="auditcard"/);
  assert.doesNotMatch(home, /<p class="syslink"><a href="\/ai-visibility-audit">/);
  const cells = home.match(/<span class="ac-grid"[^>]*>([\s\S]*?)<\/span>/);
  assert.ok(cells, 'audit card should carry its score strip');
  assert.equal((cells[1].match(/<b /g) || []).length, 25, 'strip is one full 25-question row');
  // colours must beat the base cell rule, the specificity trap that greyed this out once
  assert.match(home, /\.ac-grid b\.c\{background:var\(--volt\)\}/);

  // 3. The bio runs early and the section numbering stayed in order.
  const order = [...home.matchAll(/<span class="chip [rgy]">(\d\d)<\/span>([^<]+)</g)]
    .map((m) => `${m[1]} ${m[2].trim()}`);
  assert.deepEqual(order, [
    '01 The problem',
    '02 Who builds it',
    '03 How it works',
    '04 The method in practice',
    '05 What you get',
    '06 Example day',
    '07 Ownership',
    '08 Pricing',
    '09 Questions',
  ]);
  // the alternating tint band must still alternate, or two same-colour zones collide
  const sections = [...home.matchAll(/<section(\s[^>]*)?>/g)].map((m) => (m[1] || ''));
  const tinted = sections.map((a) => a.includes('tint'));
  assert.deepEqual(tinted, [true, false, true, false, true, false, true, false, true]);
});

test('AI Visibility Audit page is wired into the site, not an orphan', () => {
  const home = read('index.html');
  const sitemap = read('sitemap.xml');
  assert.match(home, /href="\/ai-visibility-audit"/);
  assert.match(sitemap, /<loc>https:\/\/vnmsfx\.com\/ai-visibility-audit<\/loc>/);
  // The page carries the same site-wide Apollo tracker as every other page.
  const page = read('ai-visibility-audit.html');
  assert.match(page, /66eda3fd04a18c066ea397ad/);

  // Its share card is the audit card, not the generic logo lockup — the image
  // that appears wherever the link is pasted (Slack, iMessage, LinkedIn).
  assert.match(page, /property="og:image" content="https:\/\/vnmsfx\.com\/og-audit\.jpg"/);
  assert.match(page, /name="twitter:image" content="https:\/\/vnmsfx\.com\/og-audit\.jpg"/);
  assert.doesNotMatch(page, /content="https:\/\/vnmsfx\.com\/og\.jpg"/);
  assert.ok(fs.existsSync(path.join(root, 'og-audit.jpg')), 'og-audit.jpg must ship with the page');
  // the alt text must describe the card, since the card is not the site's default image
  assert.match(page, /og:image:alt" content="AI Visibility Audit\./);
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

test('Leak Check has one honest 11-total / 10-scored contract', () => {
  const html = read('leak-check.html');
  const text = visibleText(html);
  assert.match(text, /Eleven quick questions/);
  assert.match(html, /<b>5 minutes<\/b>&nbsp;· result before email/);
  assert.match(html, /<span id="total">11<\/span>/);
  assert.match(html, /var SURVEY_VERSION='v4-2026-08-24'/);
  assert.match(html, /answers:answers\.slice\(1\)/);
  assert.doesNotMatch(html, /<span id="total">10<\/span>/);
  assert.doesNotMatch(html, /\btopTheme\(/, 'the failure-path typo must not return');
});

test('homepage makes the operational check a first-choice path and separates public AI visibility', () => {
  const html = read('index.html');
  const nav = html.match(/<span class="pills" id="navmenu">([\s\S]*?)<\/span>/);
  const hero = html.match(/<div class="hero-actions">([\s\S]*?)<\/div>/);
  assert.ok(nav && hero);
  assert.match(nav[1], /href="\/leak-check">5-Minute Check/);
  assert.match(hero[1], /href="\/leak-check"><span>5 minutes &middot; result before email/);
  const problemStart = html.indexOf('<section class="tint" id="leak">');
  const nextSection = html.indexOf('<section>', problemStart);
  const audit = html.indexOf('class="auditcard"');
  const pricing = html.indexOf('<section id="pricing">');
  assert.ok(audit > pricing, 'the AI audit must sit in its separate pricing block');
  assert.ok(audit > nextSection, 'the AI audit must not remain in the operational problem section');
  assert.match(html, /A separate public-visibility offer/);
  assert.match(html, /This is not an operations check\./);
  assert.match(html, /Not ready to talk\? Take the 5-minute check\. See your result before email/);
});

test('Hobby-safe funnel milestones and booking routes are wired on every analytics page', () => {
  const events = read('assets/conversion-events.js');
  [
    'leak_check_start',
    'leak_check_complete',
    'leak_check_email_submit',
    'teardown_click',
    'teardown_booked',
  ].forEach((name) => assert.match(events, new RegExp(`['"]${name}['"]`)));
  assert.match(events, /\/book-teardown/);
  assert.match(events, /Object\.assign\(\{\}, saved, found\)/);

  const pages = fs.readdirSync(root).filter((name) => name.endsWith('.html'));
  const analyticsPages = pages.filter((name) => /\/_vercel\/insights\/script\.js/.test(read(name)));
  analyticsPages.forEach((name) => {
    assert.match(read(name), /assets\/conversion-events\.js/, `${name} should load the shared funnel state`);
  });

  const click = read('book-teardown.html');
  assert.match(click, /record\('teardown_click'/);
  assert.match(click, /location\.replace\(destination\.toString\(\)\)/);
  const booked = read('booking-confirmed.html');
  assert.match(booked, /query\.get\('uid'\)/);
  assert.match(booked, /record\('teardown_booked'/);
  assert.match(booked, /history\.replaceState\(\{\},'',location\.pathname\)/);
  assert.match(read('privacy.html'), /current Vercel plan counts page views but not custom events/);
});
