(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const menuButton = $('.menu-toggle'), indexButton = $('.index-toggle');
  const menu = $('#main-menu'), index = $('#film-index');
  const preview = $('#hero-preview'), motionButton = $('#motion-toggle');
  const dialog = $('#film-dialog'), player = $('#film-player'), packDialog = $('#pack-dialog');
  let playerOpener = null, motionWanted = !reduced.matches, heroVisible = true;
  function setPanel(button, panel, open) {
    button.setAttribute('aria-expanded', String(open)); panel.hidden = !open;
    if (button === menuButton) {
      button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      button.firstChild.textContent = open ? 'Close ' : 'Menu ';
      button.querySelector('span').textContent = open ? '×' : '+';
      document.body.classList.toggle('menu-open', open);
      $('#main').inert = open; document.querySelector('footer').inert = open;
      updatePreview();
    }
  }
  function closePanels() {setPanel(menuButton, menu, false); setPanel(indexButton, index, false);}
  [[menuButton, menu], [indexButton, index]].forEach(([button,panel]) => {
    button.addEventListener('click', () => {const open = panel.hidden; closePanels(); setPanel(button,panel,open);if(open && button===menuButton) panel.querySelector('a').focus();});
    panel.addEventListener('click', (e) => {if(e.target.closest('a')) closePanels();});
  });
  document.querySelectorAll('.ticket-nav a[href^="#"]').forEach(link=>link.addEventListener('click',closePanels));
  document.addEventListener('click', e => {if(!e.target.closest('.ticket-nav,.index-control')) closePanels();});
  document.addEventListener('keydown', e => {
    if(e.key === 'Tab' && !menu.hidden) {
      const nodes=[...document.querySelectorAll('.ticket-nav button,.ticket-nav a')].filter(n=>n.getClientRects().length);
      const first=nodes[0], last=nodes[nodes.length-1];
      if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
    }
    if(e.key !== 'Escape' || dialog.open || packDialog.open) return;
    const restore = !menu.hidden ? menuButton : !index.hidden ? indexButton : null;
    closePanels(); if(restore) restore.focus();
  });
  function updatePreview() {
    if(motionWanted && heroVisible && !document.hidden && !dialog.open && !packDialog.open && menu.hidden) {
      if(!preview.getAttribute('src')) preview.src = preview.dataset.previewSrc;
      preview.play().catch(() => {motionButton.textContent = 'Play preview';motionButton.setAttribute('aria-label','Play motion preview');});
    } else preview.pause();
  }
  function updateMotionLabel() {
    const playing = !preview.paused;
    motionButton.textContent = playing ? 'Pause preview' : 'Play preview';
    motionButton.setAttribute('aria-label', playing ? 'Pause motion preview' : 'Play motion preview');
  }
  ['play','pause','ended'].forEach(event => preview.addEventListener(event, updateMotionLabel));
  motionButton.addEventListener('click', () => {motionWanted = preview.paused;updatePreview();});
  document.addEventListener('visibilitychange', updatePreview);
  reduced.addEventListener('change', () => {motionWanted = !reduced.matches;updatePreview();});
  if('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {heroVisible=entries[0].isIntersecting;updatePreview();},{threshold:.12}).observe($('.portrait-stage'));
    const observer = new IntersectionObserver(entries => {entries.forEach(entry => {if(entry.isIntersecting){$('#active-title').textContent=entry.target.dataset.sectionTitle;$('#active-number').textContent=entry.target.dataset.sectionNumber;}});},{rootMargin:'-20% 0px -50% 0px'});
    document.querySelectorAll('[data-section-title]').forEach(el => observer.observe(el));
  } else updatePreview();
  document.querySelectorAll('[data-film]').forEach(link => link.addEventListener('click', e => {
    if(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !dialog.showModal) return;
    e.preventDefault(); closePanels(); playerOpener=link; preview.pause();
    $('#film-dialog-title').textContent=link.dataset.title || 'VNMSFX TV'; $('#direct-film').href=link.href;
    $('.player-error').hidden=true; player.poster=link.dataset.poster || ''; dialog.dataset.orientation=link.dataset.orientation || (link.href.includes('dreamina-film')?'landscape':'portrait'); player.src=link.href;
    dialog.showModal(); document.body.classList.add('modal-open');
    player.play().catch(() => {/* Native controls remain visible when autoplay is blocked. */});
  }));
  function releaseFilm(){player.pause();player.removeAttribute('src');player.load();}
  const closePlayer=()=>{releaseFilm();dialog.close();};
  dialog.addEventListener('cancel',e=>{e.preventDefault();closePlayer();});
  $('#close-player').addEventListener('click', closePlayer);
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closePlayer();});
  dialog.addEventListener('close',()=>{if(player.getAttribute('src')) releaseFilm();document.body.classList.remove('modal-open');playerOpener?.focus({preventScroll:true});updatePreview();});
  player.addEventListener('loadedmetadata',()=>{dialog.dataset.orientation=player.videoHeight>player.videoWidth?'portrait':'landscape';});
  player.addEventListener('error',()=>{if(player.getAttribute('src'))$('.player-error').hidden=false;});
  $('#player-project').addEventListener('click',closePlayer);
  document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
    document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    document.querySelectorAll('.archive-film').forEach(card=>{card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter;});
  }));
  document.querySelectorAll('[data-interest]').forEach(link=>link.addEventListener('click',()=>{$('#interest').value=link.dataset.interest;}));
  $('#brief-form').addEventListener('submit',e=>{
    e.preventDefault(); const interest=$('#interest').value, brief=$('#brief').value.trim();
    const body=`Hi Brandon,\n\nI'm interested in ${interest.toLowerCase()}.\n\n${brief || 'Brand / idea:'}\n\nWhere it will run:\nTiming (if known):\n`;
    location.href=`mailto:brandon@vnmsfx.com?subject=${encodeURIComponent('VNMSFX TV — '+interest)}&body=${encodeURIComponent(body)}`;
  });
  $('#copy-email').addEventListener('click', async()=>{
    try{await navigator.clipboard.writeText('brandon@vnmsfx.com');$('#copy-status').textContent='Email copied.';}
    catch{$('#copy-status').textContent='Select and copy brandon@vnmsfx.com above.';}
  });
  const packages = {
    spotlight: {name:'Product Spotlight',price:49,days:3,summary:'One finished product image, with two alternate layouts of that same image.',math:'3 layouts × 2 sizes = 6 image files.',items:['One main product image','Two alternate layouts using that artwork','Every layout in feed (4:5) and Story/Reel (9:16) sizes','One consolidated minor revision']},
    set: {name:'Product Set',price:99,days:3,summary:'Three distinct product images in one coordinated look, with two alternate layouts of the main image.',math:'3 product images + 2 alternate layouts = 5 layouts. Each in 2 sizes = 10 image files.',items:['Three distinct images of the same supplied product','Two alternate layouts of the main image','Every layout in feed (4:5) and Story/Reel (9:16) sizes','One consolidated minor revision across the set']},
    motion: {name:'Product Set + Motion',price:149,days:5,summary:'The complete Product Set, plus a six-second vertical video made from the main image.',math:'5 layouts × 2 sizes = 10 image files, plus 1 video.',items:['Three distinct product images + two alternate layouts of the main image','Every layout in feed (4:5) and Story/Reel (9:16) sizes','One 6-second vertical video with camera or background movement; product unchanged','One consolidated minor revision across the set; music excluded']}
  };
  // A signed-in account is not a working purchase link. Only verified live bindings expose Buy.
  function checkoutFor(key) {
    const config=window.VNMSFX_CHECKOUT, binding=config?.packages?.[key], pack=packages[key];
    if(config?.enabled!==true || config.account!=='acct_1PwcwWP2E4gRJNvG' || !pack || !binding || binding.verified!==true || binding.mode!=='live' || binding.currency!=='usd' || binding.amount!==pack.price*100 || typeof binding.url!=='string') return null;
    try {
      const url=new URL(binding.url);
      if(url.protocol!=='https:' || url.hostname!=='buy.stripe.com' || url.port || url.username || url.password || url.search || url.hash || !/^\/[A-Za-z0-9]{12,}$/.test(url.pathname)) return null;
      return url.href;
    } catch { return null; }
  }
  let livePacks=0;
  document.querySelectorAll('[data-checkout-key]').forEach(link=>{
    const key=link.dataset.checkoutKey, url=checkoutFor(key);
    if(!url)return;
    link.href=url;link.hidden=false;livePacks++;
    const details=document.querySelector(`[data-pack="${key}"]`);
    details.classList.add('pack-details-link');
  });
  const setupNote=$('.pack-checkout-note').textContent;
  if(livePacks) $('.starter-status').textContent=livePacks===3
    ? 'One-time payment through Stripe. Send your product photo and brief after payment.'
    : 'Packages with a Buy button accept one-time payment through Stripe. Other packages remain available by inquiry.';
  let packOpener=null;
  const keepPair=text=>text.replace(/ (\S+)$/, '\u00a0$1');
  document.querySelectorAll('[data-pack]').forEach(button=>button.addEventListener('click',()=>{
    const pack=packages[button.dataset.pack];if(!pack)return;
    packOpener=button;closePanels();preview.pause();
    $('#pack-dialog-title').textContent=keepPair(pack.name);
    $('#pack-dialog-price').textContent=`$${pack.price} · one-time · USD`;
    $('#pack-dialog-summary').textContent=keepPair(pack.summary);
    $('#pack-dialog-math').textContent=keepPair(pack.math);
    $('#pack-dialog-delivery').textContent=keepPair(`Delivery: ${pack.days} business days after usable assets and your complete brief arrive.`);
    const list=$('#pack-dialog-deliverables');list.replaceChildren(...pack.items.map(item=>{const li=document.createElement('li');li.textContent=keepPair(item);return li;}));
    const subject=`VNMSFX TV — ${pack.name} ($${pack.price})`;
    const body=`Hi Brandon,\n\nI'm interested in ${pack.name} at $${pack.price}.\n\nProduct / website:\nProduct photo link (or I can attach it):\nWhere I want to post it:\nAny approved words or deadline (optional):\n\nPlease confirm suitability, timing and order terms before payment.\n`;
    $('#pack-email').href=`mailto:brandon@vnmsfx.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const checkout=checkoutFor(button.dataset.pack), checkoutLink=$('#pack-checkout');
    checkoutLink.hidden=!checkout;
    if(checkout)checkoutLink.href=checkout;else checkoutLink.removeAttribute('href');
    $('.pack-checkout-note').textContent=checkout
      ? 'Continue to Stripe to pay once for this package. After payment, Stripe shows how to send your product photo and brief to Brandon. No subscription.'
      : setupNote;

    packDialog.showModal();document.body.classList.add('modal-open');
  }));
  $('#close-pack').addEventListener('click',()=>packDialog.close());
  packDialog.addEventListener('click',e=>{if(e.target!==packDialog)return;const r=packDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)packDialog.close();});
  packDialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');packOpener?.focus({preventScroll:true});updatePreview();});
  // Service selection replaces the repeated small-row presentation; copy remains in the DOM.
  document.querySelectorAll('.service-toggle').forEach((button,i)=>{button.setAttribute('aria-expanded',String(i===0));document.getElementById(button.getAttribute('aria-controls')).hidden=i!==0;});
  document.querySelectorAll('.service-toggle').forEach(button=>button.addEventListener('click',()=>{
    document.querySelectorAll('.service-toggle').forEach(other=>{
      const selected=other===button;
      other.setAttribute('aria-expanded',String(selected));
      document.getElementById(other.getAttribute('aria-controls')).hidden=!selected;
    });
  }));
  // Scroll reveals layers using one passive listener; reverse scrolling restores each position.
  // Whole media frames move; the footage itself is never geometrically altered.
  const hero=$('.cinema-hero'), studio=$('.studio-section');
  const chapters=[...document.querySelectorAll('.project-chapter')];
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  let scheduled=false;
  function layers(){
    scheduled=false;
    const motion=!reduced.matches && innerWidth>900;
    const heroRect=hero.getBoundingClientRect(), studioRect=studio.getBoundingClientRect();
    const boxes=chapters.map(el=>({el,box:el.getBoundingClientRect()}));
    hero.style.setProperty('--cinema-y',motion?`${clamp(-heroRect.top*.15,0,90)}px`:'0px');
    studio.style.setProperty('--statement-x',motion?`${clamp((innerHeight*.5-studioRect.top)*.025,-8,8)}px`:'0px');
    boxes.forEach(({el,box},i)=>el.style.setProperty('--chapter-y',motion?`${clamp((innerHeight*.5-box.top-box.height*.5)*.055,-24,24)}px`:'0px'));
  }
  function queueLayers(){if(!scheduled){scheduled=true;requestAnimationFrame(layers);}}
  addEventListener('scroll',queueLayers,{passive:true});
  addEventListener('resize',queueLayers);reduced.addEventListener('change',queueLayers);
  document.fonts?.ready.then(queueLayers);layers();
})();
