/* VNMSFX first-party funnel state.
 *
 * Vercel Web Analytics remains the page-view counter. The current Hobby plan
 * does not accept custom events, so the milestones below are kept in this tab,
 * copied into a submitted Leak Check, and represented by the dedicated
 * /book-teardown and /booking-confirmed page routes where applicable.
 *
 * No name, email, phone number or booking details are written here.
 */
(function () {
  'use strict';

  var ATTR_KEY = 'vx_attr';
  var EVENT_KEY = 'vx_funnel_events';
  var ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref'];
  var EVENT_NAMES = [
    'leak_check_start',
    'leak_check_complete',
    'leak_check_email_submit',
    'teardown_click',
    'teardown_booked'
  ];

  function read(key, fallback) {
    try {
      var value = JSON.parse(sessionStorage.getItem(key) || 'null');
      return value && typeof value === 'object' ? value : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    try { sessionStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  function clean(value, maximum) {
    return String(value == null ? '' : value).slice(0, maximum || 120);
  }

  function captureAttribution() {
    var saved = read(ATTR_KEY, {});
    var query = new URLSearchParams(location.search);
    var found = {};
    ATTR_KEYS.forEach(function (key) {
      var value = query.get(key);
      if (value) found[key] = clean(value);
    });
    var merged = Object.assign({}, saved, found);
    if (Object.keys(merged).length) write(ATTR_KEY, merged);
    return merged;
  }

  function placement(anchor) {
    if (anchor.getAttribute('data-event-placement')) return clean(anchor.getAttribute('data-event-placement'), 60);
    if (anchor.closest('nav')) return 'navigation';
    if (anchor.closest('.hero-actions')) return 'homepage_hero';
    if (anchor.closest('.result-actions')) return 'leak_check_result';
    if (anchor.closest('#pricing')) return 'pricing';
    if (anchor.closest('.close')) return 'closing_cta';
    return clean(location.pathname.replace(/^\/+|\/+$/g, '') || 'homepage', 60);
  }

  function record(name, details) {
    if (EVENT_NAMES.indexOf(name) === -1) return null;
    var item = {
      event: name,
      at: new Date().toISOString(),
      page: clean(location.pathname || '/', 120)
    };
    details = details && typeof details === 'object' ? details : {};
    Object.keys(details).forEach(function (key) {
      if (['placement', 'source', 'campaign'].indexOf(key) !== -1 && details[key] != null) {
        item[key] = clean(details[key], 120);
      }
    });
    var events = read(EVENT_KEY, []);
    if (!Array.isArray(events)) events = [];
    events.push(item);
    write(EVENT_KEY, events.slice(-30));
    return item;
  }

  function events() {
    var stored = read(EVENT_KEY, []);
    return Array.isArray(stored) ? stored.slice() : [];
  }

  function attribution() {
    return Object.assign({}, read(ATTR_KEY, {}));
  }

  function addAttribution(url, values) {
    ATTR_KEYS.forEach(function (key) {
      if (values[key] && !url.searchParams.has(key)) url.searchParams.set(key, values[key]);
    });
    return url;
  }

  function routeTeardownLinks(values) {
    Array.prototype.forEach.call(document.querySelectorAll('a[href*="cal.com/vnmsfx"]:not([data-direct-cal])'), function (anchor) {
      try {
        var direct = addAttribution(new URL(anchor.href), values);
        var route = new URL('/book-teardown', location.origin);
        addAttribution(route, values);
        route.searchParams.set('placement', placement(anchor));
        route.searchParams.set('to', direct.pathname.replace(/^\//, '') || 'vnmsfx/30min');
        anchor.href = route.pathname + route.search;
      } catch (e) {}
    });
  }

  var currentAttribution = captureAttribution();
  routeTeardownLinks(currentAttribution);

  window.vxFunnel = {
    names: EVENT_NAMES.slice(),
    record: record,
    events: events,
    attribution: attribution,
    addAttribution: addAttribution
  };
})();
