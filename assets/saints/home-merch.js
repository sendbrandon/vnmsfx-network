/* View-only presentation: the collection's artwork and checkout stay untouched. */
'use strict';
for (const card of document.querySelectorAll('.hoodie-shop-card[data-character]')) {
  const stage = card.querySelector('.hoodie-stage');
  const images = { back: card.querySelector('.hoodie-back'), front: card.querySelector('.hoodie-front') };
  const buttons = [...card.querySelectorAll('[data-merch-view]')];
  let selected = 'back', hovering = false, focused = false, revision = 0;
  async function render() {
    const view = hovering || focused ? 'front' : selected;
    const ticket = ++revision;
    try { await images[view].decode(); } catch { return; }
    if (ticket !== revision) return;
    card.dataset.view = view;
    for (const [key, image] of Object.entries(images)) image.setAttribute('aria-hidden', String(key !== view));
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.merchView === view));
  }
  for (const button of buttons) button.addEventListener('click', () => { selected = button.dataset.merchView; render(); });
  stage.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovering = true; render(); } });
  stage.addEventListener('pointerleave', () => { hovering = false; render(); });
  stage.addEventListener('focus', () => { focused = true; render(); });
  stage.addEventListener('blur', () => { focused = false; render(); });
}
