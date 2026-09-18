(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const body = document.body;
  const stage = $('#stage'), countdown = $('#countdown'), label = $('#countdown-label'), releaseLine = $('#release-line');
  const rateLine = $('#rate-line'), rateCountdown = $('#rate-countdown');
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
    tease.pause(); tease.hidden = true;
    film.src = body.dataset.film; film.poster = body.dataset.poster; film.hidden = false;
    eyebrow.textContent = 'HOW WE MAKE BLOCKBUSTER ADS · DROP 01 · OUT NOW';
    label.textContent = 'OUT NOW'; countdown.textContent = '00:00:00'; countdown.hidden = true;
    releaseLine.textContent = 'Released Monday, September 21 · 12:00 PM ET';
    actions.innerHTML = '<button class="button-acid" type="button" id="play-film">Play with sound <span aria-hidden="true">↗</span></button><a class="button-dark" href="/creative-sprint?rate=drop&drop=' + body.dataset.drop + '">Start a Sprint at $1,500 <span aria-hidden="true">↗</span></a>';
    $('#play-film').addEventListener('click', () => { film.muted = false; film.play().catch(() => {}); film.scrollIntoView({ block: 'center' }); });
  }
  function tick() {
    const now = Date.now();
    if (now >= t.release) goLive(); else countdown.textContent = clock(t.release - now);
    if (now < t.close && now >= t.liveFrom) {
      rateCountdown.textContent = clock(t.close - now);
    } else {
      rateLine.classList.add('is-closed');
      rateLine.innerHTML = '<strong>Drop rate closed</strong> · $2,000 until the next countdown.';
      const after = $('#pass-after-rate'), cta = $('#pass-after-cta');
      if (after) after.textContent = 'The drop rate opens with the next countdown — you\'ll be first to know.';
      if (cta) cta.hidden = true;
    }
  }
  tick(); setInterval(tick, 1000);

  // The tease loop is muted and inline, so autoplay is allowed; nudge it anyway,
  // and again on the first touch for browsers that hold muted video until a gesture.
  const nudge = () => { if (!live && tease.paused) tease.play().catch(() => {}); };
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
    status.textContent = 'Adding you…'; button.disabled = true;
    const payload = { email: form.email.value.trim(), firstName: form.firstName.value.trim(), brand: form.brand.value.trim(), company_website: form.company_website.value, drop: body.dataset.drop, page: location.pathname, source: new URLSearchParams(location.search).get('utm_source') || document.referrer.replace(/^https?:\/\//, '').split('/')[0] || 'direct' };
    try {
      const r = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.ok) throw new Error(d.error || 'Something went wrong.');
      status.textContent = d.duplicate ? 'You were already on the list — nothing changed.' : '';
      form.querySelectorAll('input, button').forEach((el) => { el.disabled = true; });
      after.hidden = false; after.focus?.();
      if (window.vnmsfxRecord) window.vnmsfxRecord('season_pass_join');
    } catch (err) {
      status.textContent = err.message + ' Or email brandon@vnmsfx.com and I\'ll add you by hand.'; button.disabled = false;
    }
  });
})();
