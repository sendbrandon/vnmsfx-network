/* Keep the mobile watch action available only where it adds a useful next step. */
(() => {
  'use strict';
  const bar = document.querySelector('.mobile-watch-bar');
  const hero = document.querySelector('.hero');
  const watch = document.querySelector('#watch');
  const play = document.querySelector('.hero [data-video="episode"]');
  if (!bar || !hero || !watch || !play) return;
  let heroVisible = true, watchVisible = false;
  const update = () => {
    const active = document.activeElement;
    bar.hidden = heroVisible || watchVisible || play.disabled || !!document.fullscreenElement ||
      !!document.querySelector('dialog[open]') || !!active?.closest('form, dialog, [role="dialog"]');
  };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.target === hero) heroVisible = entry.isIntersecting;
        if (entry.target === watch) watchVisible = entry.isIntersecting;
      }
      update();
    }, { rootMargin: '-120px 0px 0px 0px', threshold: 0 });
    observer.observe(hero); observer.observe(watch);
  } else {
    const visible = element => { const box = element.getBoundingClientRect(); return box.bottom > 120 && box.top < window.innerHeight; };
    const measure = () => { heroVisible = visible(hero); watchVisible = visible(watch); update(); };
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure); measure();
  }
  document.addEventListener('focusin', update);
  document.addEventListener('focusout', () => queueMicrotask(update));
  document.addEventListener('fullscreenchange', update);
  const changes = new MutationObserver(update);
  changes.observe(play, { attributes: true, attributeFilter: ['disabled'] });
  document.querySelectorAll('dialog').forEach(dialog => changes.observe(dialog, { attributes: true, attributeFilter: ['open'] }));
  update();
})();
