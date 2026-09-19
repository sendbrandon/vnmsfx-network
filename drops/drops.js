(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const body = document.body;
  const stage = $('#stage'), countdown = $('#countdown'), label = $('#countdown-label'), releaseLine = $('#release-line');
  const tease = $('#tease'), film = $('#film'), actions = $('#stage-actions'), eyebrow = $('#stage-eyebrow');
  const t = { release: Date.parse(body.dataset.release), close: Date.parse(body.dataset.close), early: Date.parse(body.dataset.early), liveFrom: Date.parse(body.dataset.liveFrom) };
  const pad = (n) => String(n).padStart(2, '0');
  function clock(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return (h >= 100 ? h : pad(h)) + ':' + pad(m) + ':' + pad(sec);
  }
  let live = false;
  function goLive() {
    if (live) return; live = true;
    stage.classList.add('is-live');
    // Same stage as the countdown: the spot runs full-bleed and muted under the copy.
    // "Play with sound" opens it in the player dialog at its real aspect.
    tease.hidden = false; tease.loop = true; tease.muted = true; tease.poster = body.dataset.poster;
    if (tease.getAttribute('src') !== body.dataset.film) { tease.innerHTML = ''; tease.src = body.dataset.film; tease.load(); }
    tease.play().catch(() => {});
    eyebrow.textContent = body.dataset.liveEyebrow || 'VNMSFX / WATCH NOW';
    label.textContent = 'OUT NOW'; countdown.textContent = '00:00:00'; countdown.hidden = true;
    releaseLine.textContent = body.dataset.releasedLine || 'Released Monday, September 21 · 12:00 PM ET';
    $('.stage-deck').textContent = body.dataset.drop === 'the-recipient' && !body.dataset.noRate ? 'Watch The Recipient. Join the free Season Pass for future ads 24 hours early and a look at how I make them.' : 'Frozen fries get a classified extraction. Watch the ad, then join for early access to the next one.';
    const earlyLine = $('#early-line'); if (earlyLine) earlyLine.hidden = true;
    actions.innerHTML = '<button class="button-acid" type="button" id="play-film">Watch with sound <span aria-hidden="true">↗</span></button><a class="button-dark" href="#pass">Join free <span aria-hidden="true">↗</span></a>';
    $('#play-film').addEventListener('click', () => {
      const dialog = $('#film-dialog'), player = $('#film-player');
      if (!dialog || !dialog.showModal) { film.hidden = false; film.src = body.dataset.film; film.muted = false; film.play().catch(() => {}); return; }
      $('#film-dialog-title').textContent = document.title.split(' — ')[0]; player.poster = body.dataset.poster || ''; player.src = body.dataset.film;
      dialog.showModal(); player.muted = false; player.play().catch(() => {});
    });
  }
  function tick() {
    const now = Date.now();
    if (now >= t.release) goLive(); else countdown.textContent = clock(t.release - now);

  }
  tick(); setInterval(tick, 1000);

  // The tease loop is muted and inline, so autoplay is allowed; nudge it anyway,
  // and again on the first touch for browsers that hold muted video until a gesture.
  const nudge = () => { if (tease.paused && !tease.hidden) tease.play().catch(() => {}); };
  nudge(); document.addEventListener('visibilitychange', nudge);
  ['pointerdown', 'touchstart', 'keydown'].forEach((ev) => document.addEventListener(ev, nudge, { once: true, passive: true }));

  // Teaser cards open full-screen; each has its own URL for sharing.
  const cardDialog = $('#card-dialog'), cardFull = $('#card-full');
  document.querySelectorAll('[data-card]').forEach((a) => a.addEventListener('click', (e) => {
    if (!cardDialog.showModal) return; e.preventDefault();
    cardFull.src = a.href; cardFull.alt = a.querySelector('img').alt; cardDialog.showModal();
  }));
  $('#close-card').addEventListener('click', () => cardDialog.close());
  cardDialog.addEventListener('click', (e) => { if (e.target === cardDialog) cardDialog.close(); });

  // The last drop plays in the same dialog pattern as /tv.
  const filmDialog = $('#film-dialog'), player = $('#film-player');
  // Only anchors: <body> also carries data-film for the release flip, and matching it
  // made every click on the page (including CLOSE) open this dialog.
  document.querySelectorAll('a[data-film]').forEach((a) => a.addEventListener('click', (e) => {
    if (!filmDialog.showModal) return; e.preventDefault();
    $('#film-dialog-title').textContent = a.dataset.title || ''; player.poster = a.dataset.poster || ''; player.src = a.href;
    filmDialog.showModal(); player.play().catch(() => {});
  }));
  const closePlayer = () => { if (filmDialog.open) filmDialog.close(); };
  filmDialog.addEventListener('close', () => { player.pause(); player.removeAttribute('src'); player.load(); });
  $('#close-player').addEventListener('click', closePlayer);
  filmDialog.addEventListener('click', (e) => { if (e.target === filmDialog) closePlayer(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closePlayer(); if (cardDialog.open) cardDialog.close(); } });

  // Season Pass: store first, then the welcome email — the API owns both.
  const form = $('#pass-form'), status = $('#pass-status'), after = $('#pass-after');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const button = form.querySelector('button[type=submit]');
    status.textContent = 'Joining…'; button.disabled = true;
    const payload = { email: form.email.value.trim(), firstName: form.firstName.value.trim(), brand: form.brand.value.trim(), company_website: form.company_website.value, drop: body.dataset.drop, page: location.pathname, source: new URLSearchParams(location.search).get('utm_source') || document.referrer.replace(/^https?:\/\//, '').split('/')[0] || 'direct' };
    try {
      const r = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.ok) throw new Error(d.error || 'Something went wrong.');
      status.textContent = ''; const mail = $('#pass-after-mail'); if (mail) mail.textContent = ((d) => d.duplicate ? 'You’re already on the list. You’re all set.' : d.welcomeSent ? 'Check your inbox for your welcome email.' : 'You’re saved. The welcome email didn’t go out — I’ll send it by hand.')(d);
      form.querySelectorAll('input, button').forEach((el) => { el.disabled = true; });
      after.hidden = false; after.focus?.();
      if (!d.duplicate && window.vxFunnel) window.vxFunnel.record('season_pass_join', { drop: body.dataset.drop, page: location.pathname });
    } catch (err) {
      status.textContent = err.message + ' Or email brandon@vnmsfx.com and I\'ll add you by hand.'; button.disabled = false;
    }
  });
})();
