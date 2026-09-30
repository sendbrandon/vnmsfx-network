'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const code = fs.readFileSync(__dirname + '/conversion-events.js', 'utf8');
const token = 'm_00000000000000000000000000000000';
const campaign = { utm_source: 'vnmsfx_outreach', utm_medium: 'email', utm_campaign: 'vnmsfx_outreach_2026_09', utm_content: token };
const tagged = '/?' + new URLSearchParams(campaign);
const plain = value => JSON.parse(JSON.stringify(value));

function browser(options = {}) {
  const location = new URL(options.url || tagged, 'https://vnmsfx.com');
  const data = options.storage || new Map();
  const sessionStorage = {
    getItem: key => { if (options.blockedStorage) throw Error('blocked'); return data.get(key) || null; },
    setItem: (key, value) => { if (options.blockedStorage) throw Error('blocked'); data.set(key, value); },
    removeItem: key => data.delete(key)
  };
  const listeners = {}, windowListeners = {}, calls = [], anchors = [];
  function anchor(href, attrs = {}) {
    let value = href;
    const a = {
      get href() { return new URL(value, location).href; },
      set href(url) { value = url; },
      getAttribute: key => attrs[key] ?? null,
      hasAttribute: key => Object.hasOwn(attrs, key),
      closest: selector => selector === 'a[href]' ? a : null
    };
    anchors.push(a); return a;
  }
  (options.links || [{ href: 'https://cal.com/vnmsfx/creative-call', attrs: { 'data-direct-cal': '' } }]).forEach(x => anchor(x.href, x.attrs));
  const window = { dataLayer: options.dataLayer || [], gtag: (...args) => calls.push(plain(args)), addEventListener: (name, fn) => windowListeners[name] = fn, ...options.window };
  const document = { querySelectorAll: () => anchors, addEventListener: (name, fn) => listeners[name] = fn };
  const context = vm.createContext({ window, document, navigator: options.navigator || {}, location, sessionStorage, URL, URLSearchParams, WeakMap, Date });
  vm.runInContext(code, context);
  return { window, context, location, data, calls, anchors, anchor, listeners, windowListeners, api: window.vxFunnel,
    click(a = anchors[0], extra = {}) { listeners.click({ type: 'click', button: 0, target: a, ...extra }); },
    navigate(path, event = 'popstate') { const next = new URL(path, location); location.href = next.href; windowListeners[event](); }
  };
}

test('direct creative-call receives standard UTMs and stays a direct link', () => {
  const b = browser(); const url = new URL(b.anchors[0].href);
  assert.equal(url.origin + url.pathname, 'https://cal.com/vnmsfx/creative-call');
  assert.deepEqual(Object.fromEntries(url.searchParams), campaign);
  assert.equal(b.calls.length, 0, 'decoration is not an event');
  b.click();
  assert.equal(b.calls[0][1], 'booking_click');
  assert.equal(b.calls[0][2].utm_content, token);
  assert.equal(b.api.record('teardown_booked'), null, 'a generic browser call cannot declare a verified booking');
});

test('repeated clicks and script evaluation do not duplicate params/listeners', () => {
  const b = browser(); b.click(); b.click(); vm.runInContext(code, b.context); b.click();
  assert.equal(b.calls.length, 3);
  assert.equal(new URL(b.anchors[0].href).searchParams.getAll('utm_content').length, 1);
  assert.deepEqual(b.calls.map(x => x[1]), ['booking_click', 'booking_click', 'booking_click']);
});

test('navigation and reload retain attribution; a new campaign drops old message token', () => {
  const b = browser(); b.navigate('/studio');
  assert.equal(new URL(b.anchors[0].href).searchParams.get('utm_content'), token);
  const reload = browser({ url: '/studio', storage: b.data });
  assert.equal(reload.api.attribution().utm_content, token);
  reload.navigate('/?utm_source=linkedin&utm_medium=social&utm_campaign=autumn');
  assert.deepEqual(plain(reload.api.attribution()), { utm_source: 'linkedin', utm_medium: 'social', utm_campaign: 'autumn' });
  assert.equal(new URL(reload.anchors[0].href).searchParams.has('utm_content'), false);
  reload.navigate(tagged, 'pageshow');
  assert.equal(new URL(reload.anchors[0].href).searchParams.get('utm_content'), token);
});

test('invalid new tags cannot preserve stale campaign identifiers', () => {
  const b = browser(); b.navigate('/?utm_campaign=%3Cscript%3E&utm_content=someone%40example.com');
  assert.deepEqual(plain(b.api.attribution()), {});
  assert.equal(new URL(b.anchors[0].href).search, '');
});

test('only own Cal links are decorated and original direct query/hash is preserved', () => {
  const unsafe = ['https://cal.com.evil.test/vnmsfx/creative-call', 'https://evil.test/?next=cal.com/vnmsfx', 'https://cal.com/other/creative-call', 'http://cal.com/vnmsfx/creative-call', 'https://secret@cal.com/vnmsfx/creative-call', 'mailto:brandon@vnmsfx.com'];
  const links = unsafe.map(href => ({ href }));
  links.push({ href: 'https://cal.com/vnmsfx/creative-call?layout=month_view#calendar', attrs: { 'data-direct-cal': '' } });
  const b = browser({ links });
  unsafe.forEach((url, i) => assert.equal(b.anchors[i].href, url));
  const direct = new URL(b.anchors.at(-1).href);
  assert.equal(direct.searchParams.get('layout'), 'month_view'); assert.equal(direct.hash, '#calendar');
});

test('legacy route preserves exact event slug and safe destination rejects arbitrary redirects', () => {
  const b = browser({ links: [{ href: 'https://cal.com/vnmsfx/creative-call' }] });
  const route = new URL(b.anchors[0].href);
  assert.equal(route.pathname, '/book-teardown');
  assert.equal(route.searchParams.get('to'), 'vnmsfx/creative-call');
  assert.equal(b.api.bookingDestination(route.searchParams.get('to'), b.api.attribution()).pathname, '/vnmsfx/creative-call');
  for (const bad of ['https://evil.test/', '//evil.test', 'vnmsfx/../../other', 'vnmsfx/a?email=private', 'other/30min', 'vnmsfx/a%2fb']) {
    assert.equal(b.api.bookingDestination(bad, {}).href, 'https://cal.com/vnmsfx/30min');
  }
  b.api.refreshLinks(); assert.equal(b.anchors[0].href, route.href);
});

test('newly inserted direct links and middle clicks receive current attribution', () => {
  const b = browser(); const a = b.anchor('https://cal.com/vnmsfx/creative-call', { 'data-direct-cal': '' });
  b.listeners.auxclick({ type: 'auxclick', button: 1, target: a });
  assert.equal(new URL(a.href).searchParams.get('utm_content'), token); assert.equal(b.calls.length, 1);
  b.click(a, { defaultPrevented: true }); assert.equal(b.calls.length, 1);
});

test('blocked session storage does not break navigation or lose in-page attribution', () => {
  const b = browser({ blockedStorage: true }); b.click();
  assert.equal(new URL(b.anchors[0].href).searchParams.get('utm_content'), token);
  assert.equal(b.calls[0][1], 'booking_click');
});

test('unknown and unsafe fields never reach GA4 or stored campaign', () => {
  const b = browser({ url: '/?utm_source=outreach&utm_medium=email&utm_campaign=autumn%26email%3Dx%40example.com&utm_content=Jane%20Doe&ref=https%3A%2F%2Fevil.test&email=private%40example.com' });
  const item = b.api.record('booking_click', { placement: 'homepage', email: 'private@example.com', uid: 'private-booking', source: '<script>', campaign: 'person@example.com' });
  assert.deepEqual(b.calls[0][2], { utm_source: 'outreach', utm_medium: 'email', placement: 'homepage' });
  assert.equal(item.email, undefined); assert.equal(item.uid, undefined);
  assert.deepEqual(plain(b.api.attribution()), { utm_source: 'outreach', utm_medium: 'email' });
  assert.equal(b.api.record('unknown', {}), null);
});

test('URL decoding is done once and outreach content requires a random-format token', () => {
  const b = browser({ url: '/?utm_source=vnmsfx_outreach&utm_medium=email&utm_campaign=vnmsfx_outreach_2026_09&utm_content=recipient_name' });
  assert.equal(b.api.attribution().utm_content, undefined);
  const a = browser({ url: '/?utm_source=%6futreach&utm_content=%2540example.com' });
  assert.equal(a.api.attribution().utm_source, 'outreach'); assert.equal(a.api.attribution().utm_content, undefined);
  const url = a.api.addAttribution(new URL('https://cal.com/vnmsfx/creative-call?ref=old&utm_source=old'), { ref: 'private_ref', utm_source: 'outreach', email: 'private@example.com' });
  assert.equal(url.search, '?utm_source=outreach');
});

test('GPC, DNT, explicit app denial, GA opt-out and denied consent stop new tracking', () => {
  for (const options of [
    { navigator: { globalPrivacyControl: true } }, { navigator: { doNotTrack: '1' } },
    { window: { vxAnalyticsConsent: false } }, { window: { 'ga-disable-G-8LWH9MXX6S': true } },
    { dataLayer: [['consent', 'default', { analytics_storage: 'denied' }]] }
  ]) {
    const storage = new Map([['vx_attr', JSON.stringify(campaign)], ['vx_funnel_events', '[]']]);
    const b = browser({ ...options, storage }); b.click();
    assert.equal(b.calls.length, 0); assert.deepEqual(plain(b.api.attribution()), {});
    assert.equal(b.anchors[0].href, 'https://cal.com/vnmsfx/creative-call'); assert.equal(storage.has('vx_attr'), false);
  }
});

test('revocation removes link tags and stored state; an explicit update can grant again', () => {
  const b = browser(); b.window.dataLayer.push(['consent', 'update', { analytics_storage: 'denied' }]);
  b.windowListeners['vx:consentchange'](); b.click(); assert.equal(b.calls.length, 0);
  assert.equal(new URL(b.anchors[0].href).search, '');
  b.window.dataLayer.push(['consent', 'update', { analytics_storage: 'granted' }]);
  b.windowListeners['vx:consentchange'](); b.click(); assert.equal(b.calls.length, 1);
});

test('confirmation return strips query before all existing analytics and cannot emit booked', () => {
  const html = fs.readFileSync(__dirname + '/../booking-confirmed.html', 'utf8');
  const cleanAt = html.indexOf("history.replaceState({},'',location.pathname)");
  for (const tracker of ['clarity.ms', 'googletagmanager.com', '/_vercel/insights']) assert.ok(cleanAt < html.indexOf(tracker));
  assert.doesNotMatch(html, /record\(['"](?:teardown_booked|booking_success)/);
  assert.match(html, /cannot verify whether a booking was completed/);
  assert.match(html, /name="referrer" content="no-referrer"/);
});

test('homepage mailto draft is measured separately from successful send', () => {
  const code = fs.readFileSync(__dirname + '/../tv/homepage.js', 'utf8');
  assert.match(code, /record\('inquiry_draft_open'/);
  assert.doesNotMatch(code, /record\('brief_submit_success'/);
});


test('a changed fallback href survives pageshow and repeated direct clicks', () => {
  const b = browser({ links: [{ href: 'https://cal.com/vnmsfx/30min', attrs: { 'data-direct-cal': '' } }] });
  b.anchors[0].href = b.api.bookingDestination('vnmsfx/creative-call', b.api.attribution()).href;
  b.windowListeners.pageshow(); b.click(); b.click();
  assert.equal(new URL(b.anchors[0].href).pathname, '/vnmsfx/creative-call');
  assert.equal(new URL(b.anchors[0].href).searchParams.getAll('utm_content').length, 1);
});
