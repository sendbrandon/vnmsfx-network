/* Private workshop inquiry: prepares a draft; it never sends or books. */
(() => {
  'use strict';
  const form = document.querySelector('#workshop-brief');
  const session = document.querySelector('#workshop-session');
  const draft = document.querySelector('#workshop-draft');
  const draftText = document.querySelector('#workshop-draft-text');
  const mailto = document.querySelector('#workshop-mailto');
  const copyStatus = document.querySelector('#workshop-copy-status');
  form.hidden = false;

  document.querySelectorAll('[data-session]').forEach(link => {
    link.addEventListener('click', () => {
      session.value = link.dataset.session;
      draft.hidden = true;
    });
  });
  form.addEventListener('input', () => { draft.hidden = true; });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const text = name => String(values.get(name) || '').trim();
    if (!text('brand') || !text('goal')) {
      const missing = form.elements.namedItem(!text('brand') ? 'brand' : 'goal');
      missing.setCustomValidity('Please add a short description.');
      missing.reportValidity();
      missing.addEventListener('input', () => missing.setCustomValidity(''), {once: true});
      return;
    }
    const subject = `VNMSFX workshop inquiry — ${text('brand')}`;
    const body = [
      `Brand / agency: ${text('brand')}`,
      `Reply email: ${text('email')}`,
      `Team size: ${text('team')}`,
      `Session: ${text('session')}`,
      '', 'What we want to make / where we need help:', text('goal'),
      '', `Timing / other details: ${text('details') || 'To be agreed'}`
    ].join('\n');
    mailto.href = `mailto:brandon@vnmsfx.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    draftText.value = `To: brandon@vnmsfx.com\nSubject: ${subject}\n\n${body}`;
    copyStatus.textContent = '';
    draft.hidden = false;
    draft.focus({preventScroll: true});
    draft.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest'});
  });
  document.querySelector('#workshop-copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(draftText.value);
      copyStatus.textContent = 'Copied. Paste this into an email to Brandon.';
    } catch {
      draftText.focus();
      draftText.select();
      copyStatus.textContent = 'Select and copy the text above, then paste it into your email.';
    }
  });
})();

/* Keep the poster until a video frame is playing; autoplay failure stays visible. */
(() => {
  'use strict';
  const video = document.querySelector('#workshop-reel');
  const control = document.querySelector('#workshop-motion');
  const hero = document.querySelector('.ws-hero');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let wantsPlay = !reduced.matches;
  let visible = true;
  let pendingPlay = false;
  control.hidden = false;

  function showState() {
    const playing = !video.paused && !video.ended;
    control.textContent = playing ? 'Pause preview' : 'Play preview';
    control.setAttribute('aria-label', playing ? 'Pause background preview' : 'Play background preview');
  }
  async function play() {
    if (pendingPlay || !video.paused) return;
    pendingPlay = true;
    if (!video.src) video.src = video.dataset.src;
    if (video.error) video.load();
    video.muted = true;
    video.defaultMuted = true;
    try {
      await video.play();
      if (!wantsPlay || !visible || document.hidden) video.pause();
    } catch {
      video.classList.remove('is-playing');
    } finally { pendingPlay = false; }
    showState();
  }
  function pause() { video.pause(); showState(); }
  function sync() {
    if (wantsPlay && visible && !document.hidden) play();
    else pause();
  }
  control.addEventListener('click', () => { wantsPlay = video.paused; sync(); });
  video.addEventListener('playing', () => { video.classList.add('is-playing'); showState(); });
  video.addEventListener('pause', showState);
  video.addEventListener('error', () => { video.classList.remove('is-playing'); wantsPlay = false; showState(); });
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', () => { wantsPlay = !reduced.matches; sync(); });
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    sync();
  }, {threshold: 0.05});
  observer.observe(hero);
  showState();
})();
