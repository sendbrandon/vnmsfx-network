/* THE HANDOFF — one-tap timing game for the Recipient drop.
 *
 * No libraries, no build step, no accounts, no endpoint. The game is a hook for
 * the Season Pass: it earns twenty seconds and a share, the pass converts.
 *
 * window.VNMSFXHandoff.create(root) mounts a game into an element and returns
 * { start, teardown }. Both the dialog on /drops/the-recipient and the
 * standalone /drops/handoff page use the same instance code.
 */
(() => {
  'use strict';

  const BASE = '/tv/drops/handoff/';
  const SCENES = [
    { src: BASE + '1-cargo-ramp.jpg', eyebrow: 'PACKAGE IS INBOUND.', alt: 'A figure on the ramp of a cargo plane.' },
    { src: BASE + '2-back-seat.jpg', eyebrow: 'THE RECIPIENT HAS NOT BEEN TOLD.', alt: 'A courier in the back seat of a moving car.' },
    { src: BASE + '3-bathroom-handoff.jpg', eyebrow: 'THE HANDOFF.', alt: 'Two hands meeting over a bathroom counter.' }
  ];
  const LOGO = BASE + 'logo-white.svg';
  const SHARE_URL = 'https://vnmsfx.com/drops/handoff';
  const BEST_KEY = 'vnmsfx_handoff_best';

  const PERIOD_START = 1600, PERIOD_FACTOR = 0.93, PERIOD_FLOOR = 550;
  const ZONE_START = 0.22, ZONE_FACTOR = 0.9, ZONE_FLOOR = 0.06;
  const ZONE_MARGIN = 0.08;   // the zone never touches the outer 8% of the bar
  const BAR_SPAN = 0.84;      // of the viewport width
  const REPEAT_MS = 150;

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const HIT_FLASH = reduced ? 60 : 120, MISS_FLASH = reduced ? 90 : 180, ADVANCE_MS = 350;

  const clamp = (n, lo, hi) => (n < lo ? lo : n > hi ? hi : n);
  const plural = (n) => (n === 1 ? '1 CLEAN HANDOFF.' : n + ' CLEAN HANDOFFS.');

  function record(name) {
    try {
      if (typeof window.vnmsfxRecord === 'function') window.vnmsfxRecord(name);
      else if (window.vxFunnel && typeof window.vxFunnel.record === 'function') window.vxFunnel.record(name);
    } catch (e) {}
  }

  function readBest() {
    try {
      const raw = parseInt(localStorage.getItem(BEST_KEY) || '0', 10);
      return Number.isFinite(raw) && raw > 0 ? raw : 0;
    } catch (e) { return 0; }
  }
  function writeBest(score) {
    try { localStorage.setItem(BEST_KEY, String(score)); } catch (e) {}
  }

  // ?s=7 on a share link puts "BEAT 7." under the title. Nothing else trusts it.
  function challengeScore() {
    const raw = new URLSearchParams(location.search).get('s');
    if (!raw || !/^\d{1,2}$/.test(raw)) return 0;
    const n = parseInt(raw, 10);
    return n >= 1 && n <= 99 ? n : 0;
  }

  const loadImage = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image: ' + src));
    img.src = src;
  });

  let assets = null;
  function loadAssets() {
    if (!assets) {
      assets = Promise.all([
        Promise.all(SCENES.map((s) => loadImage(s.src))),
        loadImage(LOGO).catch(() => null),
        document.fonts && document.fonts.load ? Promise.all([
          document.fonts.load('400 80px Anton'),
          document.fonts.load('400 24px "Space Mono"')
        ]).catch(() => null) : Promise.resolve(null)
      ]).then(([stills, logo]) => ({ stills, logo }));
    }
    return assets;
  }

  function coverRect(iw, ih, w, h) {
    const scale = Math.max(w / iw, h / ih);
    const dw = iw * scale, dh = ih * scale;
    return { x: (w - dw) / 2, y: (h - dh) / 2, w: dw, h: dh };
  }

  const MARKUP = [
    '<canvas class="handoff-canvas" role="img" aria-label="A marker sweeping across a bar over a still from the spot."></canvas>',
    '<p class="handoff-eyebrow" data-hud-eyebrow hidden></p>',
    '<p class="handoff-round" data-hud-round hidden></p>',
    '<div class="handoff-screen" data-screen-title>',
    '  <h2 class="handoff-title">THE HANDOFF<span class="acid">.</span></h2>',
    '  <p class="handoff-beat" data-beat hidden></p>',
    '  <p class="handoff-instruction">TAP WHEN IT&rsquo;S CLEAR.</p>',
    '  <button class="button-acid" type="button" data-play disabled>PLAY <span aria-hidden="true">&#8599;</span></button>',
    '</div>',
    '<div class="handoff-screen" data-screen-over hidden>',
    '  <h2 class="handoff-score" data-score>0 CLEAN HANDOFFS<span class="acid">.</span></h2>',
    '  <p class="handoff-told">THE RECIPIENT HAS BEEN TOLD.</p>',
    '  <p class="handoff-best" data-best></p>',
    '  <div class="handoff-actions">',
    '    <button class="button-acid" type="button" data-share>SHARE YOUR SCORE <span aria-hidden="true">&#8599;</span></button>',
    '    <button class="button-dark" type="button" data-again>PLAY AGAIN</button>',
    '  </div>',
    '  <div class="handoff-pass">',
    '    <p class="eyebrow">GET THE SAUCE</p>',
    '    <p>How this spot was made, drop by drop. Free Season Pass &mdash; you also get every spot 24 hours early.</p>',
    '    <a class="button-acid" data-pass href="/drops/the-recipient#pass">Join the Season Pass <span aria-hidden="true">&#8599;</span></a>',
    '  </div>',
    '</div>',
    '<p class="handoff-live" data-live role="status" aria-live="polite"></p>',
    '<p class="handoff-toast" data-toast hidden>LINK COPIED</p>'
  ].join('');

  function create(root, options) {
    options = options || {};
    root.classList.add('handoff');
    if (!root.hasAttribute('tabindex')) root.tabIndex = -1;
    root.innerHTML = MARKUP;

    const canvas = root.querySelector('.handoff-canvas');
    const ctx = canvas.getContext('2d');
    const hudEyebrow = root.querySelector('[data-hud-eyebrow]');
    const hudRound = root.querySelector('[data-hud-round]');
    const titleScreen = root.querySelector('[data-screen-title]');
    const overScreen = root.querySelector('[data-screen-over]');
    const beatLine = root.querySelector('[data-beat]');
    const playBtn = root.querySelector('[data-play]');
    const againBtn = root.querySelector('[data-again]');
    const shareBtn = root.querySelector('[data-share]');
    const passLink = root.querySelector('[data-pass]');
    const scoreEl = root.querySelector('[data-score]');
    const bestEl = root.querySelector('[data-best]');
    const liveEl = root.querySelector('[data-live]');
    const toastEl = root.querySelector('[data-toast]');

    const beat = challengeScore();
    if (beat) { beatLine.textContent = 'BEAT ' + beat + '.'; beatLine.hidden = false; }

    let stills = [], logo = null, ready = false;
    let state = 'title';                 // title | play | over
    let raf = 0, frames = 0;
    let round = 1, score = 0;
    let period = PERIOD_START, zoneWidth = ZONE_START, zoneCentre = 0.5;
    let sweepStart = 0, locked = false, lastInput = 0;
    let flash = null;                    // { until, colour, from }
    let size = { w: 0, h: 0, dpr: 1 };
    let shareFiles = null;
    const timers = new Set();
    const wait = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
    const clearTimers = () => { timers.forEach(clearTimeout); timers.clear(); };

    /* ---- layout -------------------------------------------------------- */
    // Sizes are read once per resize; never per frame.
    function measure() {
      const rect = root.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      size = { w: Math.max(1, Math.round(rect.width)), h: Math.max(1, Math.round(rect.height)), dpr };
      canvas.style.width = size.w + 'px';
      canvas.style.height = size.h + 'px';
      canvas.width = Math.round(size.w * dpr);
      canvas.height = Math.round(size.h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now());
    }
    function barBox() {
      const w = size.w * BAR_SPAN;
      return { x: (size.w - w) / 2, w, y: Math.round(size.h * 0.78), h: 16 };
    }

    /* ---- the sweep ----------------------------------------------------- */
    // Triangle wave, driven by elapsed milliseconds — never by frame count, so a
    // 60 Hz and a 120 Hz phone play identically.
    function markerAt(now) {
      const phase = ((now - sweepStart) % period) / period;
      return phase < 0.5 ? phase * 2 : 2 - phase * 2;
    }
    function scene() { return SCENES[(round - 1) % SCENES.length]; }
    function still() { return stills[(round - 1) % stills.length]; }

    function placeZone() {
      const half = zoneWidth / 2;
      const lo = ZONE_MARGIN + half, hi = 1 - ZONE_MARGIN - half;
      zoneCentre = lo >= hi ? 0.5 : lo + Math.random() * (hi - lo);
    }

    function startRound() {
      hudEyebrow.textContent = scene().eyebrow;
      hudEyebrow.hidden = false;
      hudRound.textContent = 'ROUND ' + String(round).padStart(2, '0');
      hudRound.hidden = false;
      canvas.setAttribute('aria-label', scene().alt + ' Tap when the marker is inside the clean zone.');
      placeZone();
      sweepStart = performance.now();
      locked = false;
    }

    /* ---- drawing ------------------------------------------------------- */
    function draw(now) {
      const { w, h } = size;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);

      const img = state === 'title' ? stills[0] : still();
      if (img) {
        const r = coverRect(img.naturalWidth, img.naturalHeight, w, h);
        ctx.drawImage(img, r.x, r.y, r.w, r.h);
      }

      // The shade: readable type on any frame, heavier behind the screens.
      const shade = ctx.createLinearGradient(0, 0, 0, h);
      const top = state === 'play' ? 0.35 : 0.55;
      shade.addColorStop(0, 'rgba(0,0,0,' + top + ')');
      shade.addColorStop(0.55, 'rgba(0,0,0,' + (top + 0.1) + ')');
      shade.addColorStop(1, 'rgba(16,16,16,0.95)');
      ctx.fillStyle = shade;
      ctx.fillRect(0, 0, w, h);

      if (state === 'play') {
        const bar = barBox();
        ctx.fillStyle = 'rgba(255,255,255,0.16)';
        ctx.fillRect(bar.x, bar.y, bar.w, bar.h);
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 1;
        ctx.strokeRect(bar.x + 0.5, bar.y + 0.5, bar.w - 1, bar.h - 1);

        if (!locked) {
          const zw = bar.w * zoneWidth;
          ctx.fillStyle = '#d9ff5d';
          ctx.fillRect(bar.x + bar.w * zoneCentre - zw / 2, bar.y, zw, bar.h);
        }

        const mx = bar.x + bar.w * markerAt(now);
        ctx.fillStyle = '#fff';
        ctx.fillRect(mx - 2, bar.y - 12, 4, bar.h + 24);
        ctx.beginPath();
        ctx.moveTo(mx - 9, bar.y - 14);
        ctx.lineTo(mx + 9, bar.y - 14);
        ctx.lineTo(mx, bar.y - 2);
        ctx.closePath();
        ctx.fill();
      }

      if (flash) {
        const left = flash.until - now;
        if (left <= 0) flash = null;
        else {
          ctx.globalAlpha = clamp(left / flash.from, 0, 1) * flash.peak;
          ctx.fillStyle = flash.colour;
          ctx.fillRect(0, 0, w, h);
          ctx.globalAlpha = 1;
        }
      }
    }

    function loop(now) {
      frames += 1;
      draw(now);
      raf = requestAnimationFrame(loop);
    }
    function runLoop() { if (!raf) raf = requestAnimationFrame(loop); }
    function stopLoop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

    /* ---- input --------------------------------------------------------- */
    // Hit tested from the timestamp of the input, not the next frame: a fast tap
    // must not read as late.
    function tap(now) {
      if (state !== 'play' || locked) return;
      if (now - lastInput < REPEAT_MS) return;
      lastInput = now;
      const pos = markerAt(now);
      const half = zoneWidth / 2;
      if (pos >= zoneCentre - half && pos <= zoneCentre + half) hit(now);
      else miss(now);
    }

    function hit(now) {
      locked = true;
      score += 1;
      flash = { until: now + HIT_FLASH, from: HIT_FLASH, colour: '#d9ff5d', peak: 0.55 };
      liveEl.textContent = 'Clean handoff. ' + score + '.';
      wait(() => {
        round += 1;
        period = Math.max(PERIOD_FLOOR, period * PERIOD_FACTOR);
        zoneWidth = Math.max(ZONE_FLOOR, zoneWidth * ZONE_FACTOR);
        startRound();
      }, ADVANCE_MS);
    }

    function miss(now) {
      locked = true;
      flash = { until: now + MISS_FLASH, from: MISS_FLASH, colour: '#fff', peak: 1 };
      try { navigator.vibrate && navigator.vibrate(30); } catch (e) {}
      wait(gameOver, MISS_FLASH + 120);
    }

    /* ---- screens ------------------------------------------------------- */
    function showTitle() {
      state = 'title';
      clearTimers();
      flash = null;
      locked = true;
      hudEyebrow.hidden = true;
      hudRound.hidden = true;
      overScreen.hidden = true;
      titleScreen.hidden = false;
      canvas.setAttribute('aria-label', SCENES[0].alt + ' Press play to start The Handoff.');
      runLoop();
    }

    function startGame() {
      if (!ready) return;
      state = 'play';
      titleScreen.hidden = true;
      overScreen.hidden = true;
      shareFiles = null;
      round = 1; score = 0;
      period = PERIOD_START; zoneWidth = ZONE_START;
      lastInput = 0;
      startRound();
      runLoop();
      root.focus({ preventScroll: true });
      record('handoff_play');
    }

    function gameOver() {
      state = 'over';
      locked = true;
      const best = Math.max(readBest(), score);
      writeBest(best);
      scoreEl.innerHTML = plural(score).replace(/\.$/, '<span class="acid">.</span>');
      bestEl.textContent = best ? 'PERSONAL BEST ' + plural(best).replace('.', '') : 'NO PERSONAL BEST YET.';
      hudEyebrow.hidden = true;
      hudRound.hidden = true;
      overScreen.hidden = false;
      liveEl.textContent = 'The recipient has been told. ' + plural(score) + ' Personal best ' + best + '.';
      againBtn.focus({ preventScroll: true });
      record('handoff_over');
      // Pre-render both cards now: navigator.share must be called synchronously
      // inside the tap, and an awaited toBlob loses the user gesture.
      renderShare(score).then((files) => { shareFiles = files; }).catch(() => { shareFiles = null; });
      draw(performance.now());
    }

    /* ---- share card ----------------------------------------------------- */
    // Everything drawn is same-origin, so the canvas stays exportable.
    function paintCard(w, h, img) {
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const g = c.getContext('2d');
      g.fillStyle = '#101010';
      g.fillRect(0, 0, w, h);
      if (img) {
        const r = coverRect(img.naturalWidth, img.naturalHeight, w, h);
        g.drawImage(img, r.x, r.y, r.w, r.h);
      }
      g.fillStyle = 'rgba(0,0,0,0.45)';
      g.fillRect(0, 0, w, h);
      const grad = g.createLinearGradient(0, h * 0.35, 0, h);
      grad.addColorStop(0, 'rgba(16,16,16,0)');
      grad.addColorStop(1, 'rgba(16,16,16,0.96)');
      g.fillStyle = grad;
      g.fillRect(0, h * 0.35, w, h * 0.65);

      const pad = Math.round(w * 0.08);
      const unit = w / 1080;

      if (logo) {
        const lw = Math.round(230 * unit);
        const lh = Math.round(lw * (logo.naturalHeight / logo.naturalWidth));
        g.drawImage(logo, w - pad - lw, pad, lw, lh);
      }

      g.textBaseline = 'alphabetic';
      g.fillStyle = '#d9ff5d';
      g.font = Math.round(26 * unit) + 'px "Space Mono", monospace';
      const eyebrowY = h - Math.round(h * (h === w ? 0.30 : 0.26));
      g.fillText('THE HANDOFF', pad, eyebrowY);

      g.fillStyle = '#fff';
      const big = Math.round((h === w ? 200 : 260) * unit);
      g.font = big + 'px Anton, "Arial Narrow", sans-serif';
      const line = String(score);
      g.fillText(line, pad, eyebrowY + big * 0.92);
      const numberWidth = g.measureText(line).width;
      g.font = Math.round(big * 0.34) + 'px Anton, "Arial Narrow", sans-serif';
      g.fillText(score === 1 ? 'CLEAN HANDOFF' : 'CLEAN HANDOFFS', pad + numberWidth + Math.round(24 * unit), eyebrowY + big * 0.92);
      g.fillStyle = '#d9ff5d';
      g.fillText('.', pad + numberWidth + Math.round(24 * unit) + g.measureText(score === 1 ? 'CLEAN HANDOFF' : 'CLEAN HANDOFFS').width, eyebrowY + big * 0.92);

      g.font = Math.round(26 * unit) + 'px "Space Mono", monospace';
      g.fillStyle = '#fff';
      g.fillText('PACKAGE IS INBOUND.', pad, eyebrowY + big * 0.92 + Math.round(64 * unit));
      g.fillStyle = '#d9ff5d';
      g.fillText('VNMSFX.COM/DROPS/HANDOFF', pad, eyebrowY + big * 0.92 + Math.round(110 * unit));
      return c;
    }

    const toBlob = (c) => new Promise((resolve) => c.toBlob(resolve, 'image/jpeg', 0.9));

    async function renderShare(value) {
      const img = still();
      const story = await toBlob(paintCard(1080, 1920, img));
      const feed = await toBlob(paintCard(1080, 1080, img));
      if (!story || !feed) throw new Error('export failed');
      const name = 'the-handoff-' + value + '.jpg';
      return {
        story: new File([story], name, { type: 'image/jpeg' }),
        feed: new File([feed], name, { type: 'image/jpeg' })
      };
    }

    function toast(text) {
      toastEl.textContent = text;
      toastEl.hidden = false;
      wait(() => { toastEl.hidden = true; }, 2200);
    }

    function shareLink() { return SHARE_URL + '?s=' + score; }
    function shareText() {
      return 'I made ' + (score === 1 ? '1 clean handoff' : score + ' clean handoffs') +
        '. Package is inbound. Beat it: vnmsfx.com/drops/handoff?s=' + score;
    }

    function fallbackShare() {
      const file = shareFiles && shareFiles.feed;
      if (file) {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url; a.download = file.name;
        document.body.appendChild(a); a.click(); a.remove();
        wait(() => URL.revokeObjectURL(url), 4000);
      }
      const link = shareLink();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(() => toast('LINK COPIED'), () => toast(link));
      } else {
        toast(link);
      }
    }

    function onShare() {
      record('handoff_share');
      const file = shareFiles && shareFiles.story;
      const payload = { title: 'THE HANDOFF', text: shareText(), url: shareLink() };
      if (file && navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
        navigator.share(Object.assign({ files: [file] }, payload)).catch((err) => {
          if (err && err.name === 'AbortError') return;
          fallbackShare();
        });
        return;
      }
      fallbackShare();
    }

    /* ---- wiring --------------------------------------------------------- */
    const onPointerDown = (e) => {
      if (e.target.closest('button, a')) return;   // real controls keep their own behaviour
      e.preventDefault();
      if (state === 'title') { if (ready) startGame(); return; }
      if (state === 'play') tap(performance.now());
    };
    const onKeyDown = (e) => {
      // Bound to the document so keys reach the game wherever focus landed, but
      // dead while the element is not rendered (the dialog is closed).
      if (!mounted || !root.getClientRects().length) return;
      if (e.key !== ' ' && e.key !== 'Spacebar' && e.key !== 'Enter') return;
      // A focused button or link keeps its own keyboard behaviour.
      if (e.target.closest && e.target.closest('button, a')) return;
      if (e.key === ' ' || e.key === 'Spacebar') e.preventDefault();   // Space must never scroll
      if (state === 'title') { if (ready) startGame(); return; }
      if (state === 'play') tap(performance.now());
    };
    const onResize = () => measure();
    const onVisibility = () => {
      if (document.hidden) { stopLoop(); return; }
      if (state === 'play' && !locked) sweepStart = performance.now();  // resume without a jump
      if (mounted) runLoop();
    };

    let mounted = true;
    root.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    playBtn.addEventListener('click', () => startGame());
    againBtn.addEventListener('click', () => startGame());
    shareBtn.addEventListener('click', onShare);
    if (typeof options.onPass === 'function') {
      passLink.addEventListener('click', (e) => options.onPass(e));
    }
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    document.addEventListener('visibilitychange', onVisibility);

    measure();
    showTitle();
    loadAssets().then((loaded) => {
      if (!mounted) return;
      stills = loaded.stills;
      logo = loaded.logo;
      ready = true;
      playBtn.disabled = false;
      draw(performance.now());
    }).catch(() => {
      liveEl.textContent = 'The game could not load its images.';
    });

    return {
      element: root,
      start() { if (mounted) { measure(); showTitle(); } },
      frames() { return frames; },
      running() { return raf !== 0; },
      teardown() {
        mounted = false;
        stopLoop();
        clearTimers();
        root.removeEventListener('pointerdown', onPointerDown);
        document.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('orientationchange', onResize);
        document.removeEventListener('visibilitychange', onVisibility);
        shareFiles = null;
        state = 'title';
      }
    };
  }

  /* ---- mounting ------------------------------------------------------- */
  // The drop page: a full-screen dialog. Teardown happens in the dialog's close
  // event so every path — CLOSE, Esc, backdrop — stops the loop.
  function mountDialog() {
    const dialog = document.querySelector('dialog#handoff-dialog');
    const stage = dialog && dialog.querySelector('#handoff-stage');
    // Scoped to buttons on purpose: <body> carries seven data-* attributes and a
    // bare [data-*] selector once made every click on this page open a dialog.
    const openers = document.querySelectorAll('button[data-handoff-open]');
    if (!dialog || !stage || !dialog.showModal || !openers.length) return;

    let game = null;
    const close = () => { if (dialog.open) dialog.close(); };

    openers.forEach((button) => button.addEventListener('click', () => {
      dialog.showModal();
      game = create(stage, {
        onPass(e) {
          // Already on the drop page: close the game and go to the form.
          e.preventDefault();
          close();
          const pass = document.querySelector('#pass');
          if (pass) pass.scrollIntoView({ block: 'start' });
          location.hash = '#pass';
        }
      });
      stage.focus({ preventScroll: true });
    }));

    dialog.addEventListener('close', () => {
      if (game) { game.teardown(); game = null; }
      stage.innerHTML = '';
    });
    dialog.addEventListener('cancel', () => { /* Esc: let the close event tear down */ });
    dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
    const closeButton = dialog.querySelector('#close-handoff');
    if (closeButton) closeButton.addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && dialog.open) close(); });
  }

  // The standalone page: the game is the page, no dialog.
  function mountStandalone() {
    const stage = document.querySelector('[data-handoff-standalone]');
    if (stage) create(stage);
  }

  function init() { mountDialog(); mountStandalone(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.VNMSFXHandoff = { create, preload: loadAssets };
})();
