/* VNMSFX first-party, tab-scoped campaign attribution.
 * No names, email addresses, form contents or booking details belong here.
 * A calendar click is intent only. Cal's booking record is the source of truth.
 */
(function () {
  'use strict';
  if (window.vxFunnel) return;

  var ATTR_KEY = 'vx_attr';
  var EVENT_KEY = 'vx_funnel_events';
  var ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref'];
  var EVENT_NAMES = [
    'leak_check_start', 'leak_check_complete', 'leak_check_email_submit',
    'teardown_click', 'booking_click', 'inquiry_draft_open',
    'handoff_play', 'handoff_over', 'handoff_share', 'season_pass_join',
    'sprint_view', 'sprint_click', 'brief_submit_success', 'work_play'
  ];
  var originalLinks = new WeakMap();
  var currentAttribution = {};
  var lastQuery = null;

  function permitted() {
    if (window.vxAnalyticsConsent === false || window['ga-disable-G-8LWH9MXX6S']) return false;
    if (navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || window.doNotTrack === '1') return false;
    // Respect the latest explicit Google consent command; never grant consent here.
    var consent;
    (window.dataLayer || []).forEach(function (entry) {
      if (entry && entry[0] === 'consent' && entry[2] && entry[2].analytics_storage) {
        consent = entry[2].analytics_storage;
      }
    });
    return consent !== 'denied';
  }

  function read(key, fallback) {
    try {
      var value = JSON.parse(sessionStorage.getItem(key) || 'null');
      return value && typeof value === 'object' ? value : fallback;
    } catch (e) { return fallback; }
  }

  function write(key, value) {
    try { sessionStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  function forget() {
    currentAttribution = {};
    try { sessionStorage.removeItem(ATTR_KEY); sessionStorage.removeItem(EVENT_KEY); } catch (e) {}
  }

  // Campaign slugs only. Reject, rather than truncate, free text, addresses,
  // URLs, control characters and encoded payloads. Never hash personal data.
  function clean(value, maximum) {
    return typeof value === 'string' && value.length <= (maximum || 120) && /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(value) ? value : '';
  }

  function sanitize(values) {
    var safe = {};
    if (!values || typeof values !== 'object' || Array.isArray(values)) return safe;
    ATTR_KEYS.forEach(function (key) {
      var value = clean(values[key]);
      // Outreach content is a random per-message token, not a recipient name.
      if (key === 'utm_content' && values.utm_source === 'vnmsfx_outreach' && !/^m_[a-f0-9]{32}$/.test(value)) value = '';
      if (value) safe[key] = value;
    });
    return safe;
  }

  function captureAttribution() {
    if (!permitted()) { forget(); lastQuery = location.search; return {}; }
    if (lastQuery === location.search) return currentAttribution;
    lastQuery = location.search;
    var query = new URLSearchParams(location.search), found = {}, hasCampaign = false;
    ATTR_KEYS.forEach(function (key) {
      if (query.has(key)) { hasCampaign = true; found[key] = query.get(key); }
    });
    // A new tagged landing replaces the campaign as a unit; do not attach a
    // previous recipient token to a newer campaign or an invalid tagged URL.
    currentAttribution = sanitize(hasCampaign ? found : read(ATTR_KEY, currentAttribution));
    write(ATTR_KEY, currentAttribution);
    return currentAttribution;
  }

  function attribution() { return Object.assign({}, captureAttribution()); }

  function placement(anchor) {
    var explicit = clean(anchor.getAttribute('data-event-placement'), 60);
    if (explicit) return explicit;
    if (anchor.closest('nav')) return 'navigation';
    if (anchor.closest('.hero-actions')) return 'homepage_hero';
    if (anchor.closest('.result-actions')) return 'leak_check_result';
    if (anchor.closest('#pricing')) return 'pricing';
    if (anchor.closest('.close')) return 'closing_cta';
    return clean(location.pathname.replace(/^\/+|\/+$/g, ''), 60) || 'homepage';
  }

  function record(name, details) {
    if (!permitted()) { forget(); return null; }
    if (EVENT_NAMES.indexOf(name) === -1) return null;
    var safe = Object.assign({}, attribution());
    details = details && typeof details === 'object' ? details : {};
    ['placement', 'source', 'campaign'].forEach(function (key) {
      var value = clean(details[key]);
      if (value) safe[key] = value;
    });
    var item = Object.assign({ event: name, at: new Date().toISOString(), page: location.pathname.slice(0, 120) }, safe);
    var stored = read(EVENT_KEY, []);
    if (!Array.isArray(stored)) stored = [];
    stored.push(item);
    write(EVENT_KEY, stored.slice(-30));
    // Use exactly the same allowlist for GA4 as for local state. Never forward
    // the raw details object (which may contain form fields or provider data).
    if (typeof window.gtag === 'function') {
      try { window.gtag('event', name, safe); } catch (e) {}
    }
    return item;
  }

  function events() {
    if (!permitted()) { forget(); return []; }
    var stored = read(EVENT_KEY, []);
    return Array.isArray(stored) ? stored.slice() : [];
  }

  function addAttribution(url, values) {
    var safe = permitted() ? sanitize(values) : {};
    ATTR_KEYS.forEach(function (key) {
      url.searchParams.delete(key);
      // Cal automatically stores the standard five UTMs, not arbitrary ref/vx_* fields.
      if (safe[key] && (url.origin === location.origin || key !== 'ref')) url.searchParams.set(key, safe[key]);
    });
    return url;
  }

  function bookingDestination(path, values) {
    var allowed = typeof path === 'string' && /^vnmsfx\/[a-zA-Z0-9_-]+$/.test(path);
    return addAttribution(new URL('https://cal.com/' + (allowed ? path : 'vnmsfx/30min')), values);
  }

  function decorate(anchor, values) {
    try {
      var cached = originalLinks.get(anchor);
      // Keep our own decoration idempotent, but honor a genuine href update
      // (for example the booking route selecting its fallback destination).
      var original = cached && cached.decorated === anchor.href ? cached.original : anchor.href;
      var url = new URL(original, location.origin);
      var cal = url.origin === 'https://cal.com' && /^\/vnmsfx\/[a-zA-Z0-9_-]+\/?$/.test(url.pathname);
      var routed = url.origin === location.origin && /^\/book-teardown(?:\.html)?$/.test(url.pathname);
      if (!cal && !routed) return null;
      if (url.username || url.password) return null;
      if (cal && anchor.hasAttribute('data-direct-cal')) {
        anchor.href = addAttribution(url, values).toString();
        originalLinks.set(anchor, { original: original, decorated: anchor.href });
        return 'direct';
      }
      var route = routed ? url : new URL('/book-teardown', location.origin);
      if (cal) route.searchParams.set('to', url.pathname.replace(/^\/+|\/+$/g, ''));
      route.searchParams.set('placement', placement(anchor));
      addAttribution(route, values);
      anchor.href = route.pathname + route.search + route.hash;
      originalLinks.set(anchor, { original: original, decorated: anchor.href });
      return 'routed';
    } catch (e) { return null; }
  }

  function refreshLinks() {
    var values = attribution();
    Array.prototype.forEach.call(document.querySelectorAll('a[href]'), function (anchor) { decorate(anchor, values); });
  }

  captureAttribution();
  refreshLinks();
  // Delegation also covers newly inserted links and changed campaign/navigation state.
  function onClick(event) {
    if (event.defaultPrevented || (event.type === 'auxclick' && event.button !== 1)) return;
    var anchor = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (anchor && decorate(anchor, attribution()) === 'direct') record('booking_click', { placement: placement(anchor) });
  }
  document.addEventListener('click', onClick);
  document.addEventListener('auxclick', onClick);
  window.addEventListener('pageshow', refreshLinks);
  window.addEventListener('popstate', refreshLinks);
  window.addEventListener('vx:consentchange', function () { lastQuery = null; refreshLinks(); });
  window.vnmsfxRecord = record;
  window.vxFunnel = {
    names: EVENT_NAMES.slice(), record: record, events: events,
    attribution: attribution, addAttribution: addAttribution,
    bookingDestination: bookingDestination, refreshLinks: refreshLinks
  };
})();
