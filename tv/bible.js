/* HARD TO IGNORE. The site page carries the argument; Whop carries the checkout
   and the access. A hardcoded string is not a working link, so the URL is still
   validated at runtime and Buy stays hidden unless it passes. */
(() => {
  'use strict';
  const PRICE_CENTS = 119999;

  // Whop checkout link for HARD TO IGNORE, plan_qb8bKPps5nuYQ, $1,199.99 one-time.
  // The product itself stays hidden on Whop; this direct link is the only way in.
  const CHECKOUT_URL = 'https://whop.com/checkout/plan_qb8bKPps5nuYQ';

  function checkout() {
    if (typeof CHECKOUT_URL !== 'string' || !CHECKOUT_URL) return null;
    try {
      const url = new URL(CHECKOUT_URL);
      if (url.protocol !== 'https:') return null;
      if (url.hostname !== 'whop.com') return null;
      if (url.port || url.username || url.password || url.hash) return null;
      if (!/^\/checkout\/plan_[A-Za-z0-9]{8,}\/?$/.test(url.pathname)) return null;
      return url.href;
    } catch (e) { return null; }
  }

  const url = checkout();
  const buttons = document.querySelectorAll('[data-bible-checkout]');
  const asks = document.querySelectorAll('[data-bible-ask]');

  if (url) {
    buttons.forEach(link => {
      link.href = url;
      link.rel = 'noopener';
      link.hidden = false;
    });
    // With a live link the email route stops being the primary path, but stays available.
    asks.forEach(link => {
      link.textContent = 'Ask a question first ';
      const s = document.createElement('span');
      s.setAttribute('aria-hidden', 'true');
      s.textContent = '↗';
      link.appendChild(s);
    });
  }

  const record = (name, details) => {
    const api = window.vxFunnel || window.VNMSFX_FUNNEL;
    if (api && typeof api.record === 'function') { try { api.record(name, details); } catch (e) {} }
    else if (typeof window.vnmsfxRecord === 'function') { try { window.vnmsfxRecord(name, details); } catch (e) {} }
  };

  record('bible_view', { live: url ? 1 : 0 });
  buttons.forEach(link => link.addEventListener('click', () => record('bible_checkout', { price: PRICE_CENTS })));
})();
