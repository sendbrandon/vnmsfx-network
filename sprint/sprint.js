(() => {
  'use strict';

  const dialog = document.getElementById('film-dialog');
  const player = document.getElementById('film-player');
  const title = document.getElementById('film-title');
  const direct = document.getElementById('film-direct');
  const error = document.getElementById('film-error');
  let opener;

  document.querySelectorAll('[data-film]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || typeof dialog.showModal !== 'function') return;
      event.preventDefault();
      opener = link;
      title.textContent = link.dataset.title;
      player.poster = link.dataset.poster;
      player.src = link.href;
      direct.href = link.href;
      error.hidden = true;
      dialog.showModal();
      document.body.classList.add('modal-open');
      player.play().catch(() => { /* Native controls remain available if autoplay is blocked. */ });
    });
  });

  document.getElementById('close-film').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    player.pause();
    player.removeAttribute('src');
    player.load();
    document.body.classList.remove('modal-open');
    opener?.focus({ preventScroll: true });
  });
  player.addEventListener('error', () => { error.hidden = false; });
  document.getElementById('film-to-brief').addEventListener('click', () => {
    dialog.close();
    document.getElementById('start').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    document.getElementById('product').focus({ preventScroll: true });
  });

  const form = document.getElementById('sprint-brief');
  const status = document.getElementById('brief-status');
  const fallback = document.getElementById('brief-fallback');
  let sending = false;

  // Drop rate: arrived from a drop page or a Season Pass email. The browser only
  // carries the request; the server decides by the clock whether the window is open.
  const params = new URLSearchParams(location.search);
  const dropRate = params.get('rate') === 'drop' ? { rate: 'drop', drop: (params.get('drop') || '').slice(0, 60) } : null;
  if (dropRate) {
    const ticket = document.querySelector('.ticket-top strong');
    if (ticket) ticket.innerHTML = '$1,500 <small>USD · DROP RATE</small>';
    const note = document.querySelector('.ticket-top span');
    if (note) note.textContent = 'YOUR CREATIVE SPRINT · SEASON PASS';
    const start = document.querySelector('.start-copy > p:last-child');
    if (start) start.textContent = 'Season Pass drop rate: $1,500 while the drop window is open. Send your brief; I’ll confirm the rate and the plan before you pay.';
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    const data = { name: '', deadline: '' };
    ['email', 'product', 'goal', 'company_website'].forEach(key => {
      data[key] = form.elements[key].value.trim();
    });
    if (dropRate) { data.rate = dropRate.rate; data.drop = dropRate.drop; }
    if (!data.email || !data.product || !data.goal) {
      status.textContent = 'Please add your email, product and what the ad should do.';
      status.dataset.state = 'error';
      return;
    }
    const emailBody = [
      'Hi Brandon,',
      'I’m interested in the $2,000 Creative Sprint.',
      'Email: ' + data.email,
      'Brand / product:\n' + data.product,
      'Audience / goal:\n' + data.goal,
      'Ideal deadline:\n' + (data.deadline || 'To be agreed'),
      'Please confirm the project details and delivery date before I pay.'
    ].join('\n\n');
    document.getElementById('brief-email').href = 'mailto:brandon@vnmsfx.com?subject=' + encodeURIComponent('Creative Sprint — ' + data.product.slice(0, 100)) + '&body=' + encodeURIComponent(emailBody);
    const button = form.querySelector('button[type="submit"]');
    sending = true;
    button.disabled = true;
    button.textContent = 'Sending your brief…';
    status.textContent = '';
    fallback.hidden = true;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch(form.getAttribute('action'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data), signal: controller.signal
      });
      const result = await response.json();
      if (!response.ok || !result.ok || !result.persisted) throw new Error('not-confirmed');
      status.textContent = (result.dropRate
        ? 'Your brief is in at the $1,500 drop rate. '
        : dropRate ? 'Your brief is in. The drop window has closed, so this is at the $2,000 list price — Brandon will confirm. ' : 'Your brief is in. ')
        + 'Brandon will review it and follow up by email to agree the project details and delivery date. No payment or booking has been made.';
      status.dataset.state = 'success';
      status.focus({ preventScroll: true });
      form.reset();
    } catch {
      status.textContent = 'We couldn’t confirm your submission. Your details are still here. Try again or email your brief to Brandon below.';
      status.dataset.state = 'error';
      fallback.hidden = false;
    } finally {
      clearTimeout(timer);
      sending = false;
      button.disabled = false;
      button.textContent = 'Send my brief ↗';
    }
  });
})();
