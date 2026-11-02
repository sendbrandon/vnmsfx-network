'use strict';
(() => {
  // One place for episode files. mux = public Mux playback ID (adaptive HLS from the v37 master).
  // src = local CRF 18 copy, played only if Mux can't be reached.
  const EPISODES = {
    'tron-ep01': {mux: 'kk01Sicqhl9p5G9YNu01e5hjb3W01etT9yV02Ue7mNIsG3s', src: '/assets/originals/tron/ep01/episode-mobile.mp4', poster: '/assets/originals/tron/ep01/poster.jpg', title: 'TRON Mountain Town · High Noon Standup · Ep. 01 “Assembled in America”'}
  };
  // HLS.js (vendored, ~380 KB) loads only when someone presses play. Like the Saints player,
  // prefer it over native HLS, which Chrome reports but fails on; Safari falls back to native.
  let hls, hlsReady;
  const loadHls = () => hlsReady || (hlsReady = new Promise(resolve => {
    const s = Object.assign(document.createElement('script'), {src: '/assets/originals/hls.light.min.js', onload: () => resolve(window.Hls), onerror: () => resolve(null)});
    document.head.append(s);
  }));
  const attach = async (video, ep) => {
    const local = () => { hls?.destroy(); hls = null; video.dataset.stream = ep.src; video.src = ep.src; video.play().catch(() => {}); };
    if (!ep.mux) { if (video.dataset.stream !== ep.src) local(); return; }
    const url = `https://stream.mux.com/${ep.mux}.m3u8`;
    if (video.dataset.stream === url) return;
    video.dataset.stream = url;
    const Hls = await loadHls();
    if (Hls && Hls.isSupported()) {
      hls?.destroy(); hls = new Hls({capLevelToPlayerSize: true});
      hls.on(Hls.Events.ERROR, (_, d) => { if (d.fatal) local(); });
      hls.loadSource(url); hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) video.src = url;
    else local();
  };
  const motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const joined = () => { try { return localStorage.getItem('vo-joined') === '1'; } catch { return false; } };

  // Reduced motion: keep the hero on its poster frame.
  const loop = document.querySelector('.drop-loop');
  if (loop && matchMedia('(prefers-reduced-motion: reduce)').matches) { loop.removeAttribute('autoplay'); loop.pause(); }

  const player = document.getElementById('player');
  const video = document.getElementById('player-video');
  const endcard = player.querySelector('.endcard');
  document.querySelectorAll('[data-play]').forEach(el => el.addEventListener('click', async () => {
    const ep = EPISODES[el.dataset.play];
    if (!ep) return;
    document.getElementById('player-title').textContent = ep.title;
    video.poster = ep.poster;
    endcard.hidden = true;
    player.showModal();
    await attach(video, ep);
    video.currentTime = video.ended ? 0 : video.currentTime;
    video.play().catch(() => {});
  }));
  // The ask arrives at the end of the episode, when the viewer has just enjoyed it.
  video.addEventListener('ended', () => { if (!joined()) { endcard.hidden = false; endcard.querySelector('input[type=email]').focus({preventScroll: true}); } });
  player.querySelector('[data-replay]').addEventListener('click', () => { endcard.hidden = true; video.currentTime = 0; video.play().catch(() => {}); });
  const close = () => { video.pause(); if (player.open) player.close(); };
  player.querySelector('[data-close]').addEventListener('click', close);
  player.addEventListener('click', e => { if (e.target === player) close(); });
  player.addEventListener('close', () => video.pause());

  const quests = [...document.querySelectorAll('.quest')];
  const empty = document.querySelector('.empty');
  document.querySelectorAll('[data-filter]').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    const f = btn.dataset.filter;
    const keep = q => f === 'all' || q.dataset.genre === f;
    const apply = () => {
      let shown = 0;
      quests.forEach(q => { q.hidden = !keep(q); if (!q.hidden) { shown++; q.classList.add('out'); requestAnimationFrame(() => requestAnimationFrame(() => q.classList.remove('out'))); } });
      empty.hidden = shown > 0;
    };
    // Cards fade out before the grid reflows, then the survivors fade back in.
    if (!motion) return apply();
    quests.forEach(q => { if (!keep(q)) q.classList.add('out'); });
    setTimeout(apply, 280);
  }));

  // Mobile dock appears once the hero ask is off screen, and hides at the tiers.
  const dock = document.querySelector('.dock');
  const hero = document.querySelector('.signup.inline');
  const join = document.getElementById('join');
  if (dock && 'IntersectionObserver' in window) {
    dock.hidden = false;
    const seen = {hero: true, join: false};
    const update = () => dock.classList.toggle('show', !seen.hero && !seen.join && !joined());
    new IntersectionObserver(es => { es.forEach(e => { seen[e.target === hero ? 'hero' : 'join'] = e.isIntersecting; }); update(); }).observe(hero);
    new IntersectionObserver(es => { es.forEach(e => { seen.join = e.isIntersecting; }); update(); }, {rootMargin: '0px 0px -30% 0px'}).observe(join);
  }

  const DONE = {free: 'You’re on the list. The next one comes to you first.', vip: 'Reserved. You’ll hear from Brandon before VIP opens. Nothing was charged.'};
  document.querySelectorAll('form[data-signup]').forEach(form => {
    const status = form.querySelector('.status');
    const say = (text, kind) => { status.textContent = text; status.className = 'status ' + (kind || ''); };
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const tier = form.dataset.tier;
      const email = form.email.value.trim();
      const boxes = form.querySelectorAll('input[name=shows]');
      const shows = boxes.length ? [...boxes].filter(i => i.checked).map(i => i.value) : ['saints', 'satire', 'horror'];
      if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(email)) { say('That email doesn’t look right.', 'err'); form.email.focus(); return; }
      if (!shows.length) { say('Pick at least one.', 'err'); return; }
      const button = form.querySelector('button[type=submit]');
      button.disabled = true; say(tier === 'vip' ? 'Reserving…' : 'Adding you…');
      try {
        const res = await fetch('/api/originals-subscribe', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({email, shows, tier, source: form.dataset.source, company_website: form.company_website.value})});
        const body = await res.json().catch(() => ({}));
        if (res.ok && body.ok) {
          say(body.duplicate ? (tier === 'vip' ? 'You already have a VIP spot reserved.' : 'You’re already on the list.') : DONE[tier], 'ok');
          form.email.value = '';
          if (tier === 'free') { try { localStorage.setItem('vo-joined', '1'); } catch {} dock?.classList.remove('show'); }
        } else say(body.error || 'Something went wrong. Try again, or email brandon@vnmsfx.com.', 'err');
      } catch { say('Couldn’t reach the server. Try again, or email brandon@vnmsfx.com.', 'err'); }
      button.disabled = false;
    });
  });

  // Hero slate: the loop is cut from 0:24 of the film, so the timecode reads true.
  const tc = document.querySelector('.tc');
  if (tc && loop) {
    const pad = n => String(n).padStart(2, '0');
    const tick = () => { const t = 24 + (loop.currentTime || 0); tc.textContent = `00:00:${pad(Math.floor(t))}:${pad(Math.floor((t % 1) * 24))}`; requestAnimationFrame(tick); };
    if (motion) requestAnimationFrame(tick);
  }

  // Hover preview: the TRON card plays its loop under the cursor (mouse only).
  if (finePointer) document.querySelectorAll('.quest-art[data-play]').forEach(card => {
    const ep = EPISODES[card.dataset.play];
    let v;
    card.addEventListener('mouseenter', () => {
      if (!v) { v = Object.assign(document.createElement('video'), {muted: true, loop: true, playsInline: true, className: 'preview', src: loop ? loop.currentSrc : ep.src}); v.setAttribute('aria-hidden', 'true'); card.querySelector('img').after(v); }
      v.play().then(() => v.classList.add('on')).catch(() => {});
    });
    card.addEventListener('mouseleave', () => { if (v) { v.classList.remove('on'); v.pause(); } });
  });

  if (!motion) return;
  document.documentElement.classList.add('mo');

  // Reveals: blocks below the fold rise in once, staggered within their section.
  // The hero is never animated: the first screen and its ask are there on first paint.
  const rise = ['.manifesto .lede', '.section-label', '.side-head', '.show-h', '.quest-copy', '.flagship-copy', '.join-head', '.tier', '.join .center'];
  const groups = new Map();
  document.querySelectorAll(rise.join(',')).forEach(el => {
    const sec = el.closest('section') || document.body;
    const i = (groups.get(sec) || 0); groups.set(sec, i + 1);
    el.dataset.rv = ''; el.style.setProperty('--d', Math.min(i, 6) * 0.08 + 's');
  });
  document.querySelectorAll('.quest-art, .flagship-art').forEach(el => el.classList.add('shutter'));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), {rootMargin: '0px 0px -12% 0px'});
  document.querySelectorAll('[data-rv], .shutter').forEach(el => io.observe(el));

  // Manifesto: words light up as it scrolls through the middle of the screen.
  const big = document.querySelector('.big');
  const words = [];
  const wrap = node => {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part.trim()) { frag.append(part); return; }
          const s = document.createElement('span'); s.className = 'w'; s.textContent = part; words.push(s); frag.append(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') wrap(n);
    });
  };
  wrap(big);

  // Header tucks away on the way down, returns on the way up; hairline shows reading progress.
  const bar = document.querySelector('.bar');
  const media = document.querySelector('.drop-media');
  let lastY = scrollY, ticking = false;
  const frame = () => {
    ticking = false;
    const y = scrollY, vh = innerHeight, max = document.documentElement.scrollHeight - vh;
    bar.classList.toggle('scrolled', y > 10);
    bar.classList.toggle('tuck', y > lastY && y > 320 && !document.querySelector('dialog[open]'));
    lastY = y;
    bar.style.setProperty('--read', max > 0 ? (y / max).toFixed(4) : 0);
    // Hero settles: the loop eases from a slight push-in back to frame as it scrolls away.
    const r = media.getBoundingClientRect();
    if (r.bottom > 0) media.style.setProperty('--hp', Math.min(1, Math.max(0, -r.top / r.height)).toFixed(3));
    const b = big.getBoundingClientRect();
    if (b.top < vh && b.bottom > 0) {
      const p = Math.min(1, Math.max(0, (vh * 0.85 - b.top) / (vh * 0.55)));
      words.forEach((w, i) => w.style.setProperty('--o', Math.min(1, Math.max(0.16, p * words.length - i + 0.16)).toFixed(2)));
    }
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, {passive: true});
  addEventListener('resize', frame);
  frame();

  // Magnetic play buttons: a few pixels of pull toward the cursor (mouse only).
  if (finePointer) document.querySelectorAll('.drop-play, .quest-art .play, .pill-cta').forEach(el => {
    el.classList.add('magnet');
    const host = el.closest('.quest-art, .drop-media') || el;
    host.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      const pull = Math.max(0, 1 - Math.hypot(dx, dy) / 260);
      el.style.transform = `translate(${(dx * pull * 0.18).toFixed(1)}px, ${(dy * pull * 0.18).toFixed(1)}px)`;
    });
    host.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
})();
