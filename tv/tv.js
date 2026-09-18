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
    if(e.key !== 'Escape' || dialog.open || packDialog?.open) return;
    const restore = !menu.hidden ? menuButton : !index.hidden ? indexButton : null;
    closePanels(); if(restore) restore.focus();
  });
  function updatePreview() {
    if(motionWanted && heroVisible && !document.hidden && !dialog.open && !packDialog?.open && menu.hidden) {
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
  // The identity film starts on request so the supplied reference image stays visible.
  const identityVideos = [$('#identity-boardroom')].filter(Boolean);
  function pauseIdentity(){identityVideos.forEach(video => video.pause());}
  identityVideos.forEach(video => {
    video.addEventListener('play', () => {
      preview.pause();
      identityVideos.forEach(other => {if(other !== video) other.pause();});
    });
    if('IntersectionObserver' in window){
      new IntersectionObserver(entries => {if(!entries[0].isIntersecting) video.pause();}, {threshold:.1}).observe(video);
    }
  });
  document.addEventListener('visibilitychange', () => {if(document.hidden) pauseIdentity();});
  document.querySelectorAll('[data-film],[data-pack],.menu-toggle').forEach(control => control.addEventListener('click', pauseIdentity));
  // Blockbuster ads: the strip advances on its own and rotates cards to the end, so no card is
  // duplicated and at most a viewport's worth of muted previews decode at once. Hover, focus,
  // an open dialog or a hidden tab all pause it; reduced motion turns it into a native scroller.
  const marquee=$('#spots-marquee'), spotsTrack=$('#spots-track');
  if(marquee && spotsTrack){
    const spotVideos=[...spotsTrack.querySelectorAll('video')];
    let offset=0, last=0, raf=0, held=false, inView=false;
    const speed=42; // px per second
    const gap=()=>parseFloat(getComputedStyle(spotsTrack).gap)||0;
    const autoplay=()=>!reduced.matches;
    function loadNear(){
      const bounds=marquee.getBoundingClientRect();
      spotVideos.forEach(video=>{
        const r=video.getBoundingClientRect();
        const near=r.right>bounds.left-r.width && r.left<bounds.right+r.width;
        if(near && !video.getAttribute('src')){video.src=video.dataset.src;}
        const shouldPlay=near && inView && autoplay() && !document.hidden && !dialog.open && !packDialog?.open && menu.hidden;
        if(shouldPlay){if(video.paused) video.play().catch(()=>{});}
        else if(!video.paused) video.pause();
      });
    }
    function step(now){
      raf=0;
      if(!inView || held || !autoplay() || document.hidden || dialog.open || packDialog?.open || !menu.hidden){last=0;return;}
      if(last){offset+=(now-last)/1000*speed;}
      last=now;
      const first=spotsTrack.firstElementChild;
      const w=first.getBoundingClientRect().width+gap();
      if(offset>=w){offset-=w;spotsTrack.appendChild(first);}
      spotsTrack.style.transform=`translate3d(${-offset}px,0,0)`;
      raf=requestAnimationFrame(step);
    }
    function run(){ if(!raf && autoplay()) raf=requestAnimationFrame(step); loadNear(); }
    function setStatic(){
      const isStatic=!autoplay();
      marquee.classList.toggle('is-static',isStatic);
      if(isStatic){offset=0;spotsTrack.style.transform='';spotVideos.forEach(v=>v.pause());}
      else run();
    }
    ['mouseenter','focusin','touchstart','pointerdown'].forEach(ev=>marquee.addEventListener(ev,()=>{held=true;},{passive:true}));
    ['mouseleave','focusout','touchend','touchcancel','pointerup','pointercancel'].forEach(ev=>marquee.addEventListener(ev,()=>{held=false;run();},{passive:true}));
    if('IntersectionObserver' in window){
      new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;run();},{threshold:.05}).observe(marquee);
    } else {inView=true;run();}
    setInterval(loadNear,400);
    document.addEventListener('visibilitychange',run);
    dialog.addEventListener('close',run);packDialog?.addEventListener('close',run);
    menuButton.addEventListener('click',()=>setTimeout(run,0));
    reduced.addEventListener('change',setStatic);
    setStatic();
  }
  // Native horizontal scrolling keeps touch and vertical page scrolling available.
  const archive=$('#archive-gallery'), archiveControls=$('.archive-controls');
  const archivePrev=$('#archive-prev'), archiveNext=$('#archive-next');
  function updateArchiveControls(){
    const max=archive.scrollWidth-archive.clientWidth;
    archiveControls.hidden=max<=2;
    archivePrev.disabled=archive.scrollLeft<=2;
    archiveNext.disabled=archive.scrollLeft>=max-2;
  }
  function stepArchive(direction){
    const card=archive.querySelector('.archive-film:not([hidden])');
    if(!card)return;
    const step=card.getBoundingClientRect().width+parseFloat(getComputedStyle(archive).columnGap);
    archive.scrollBy({left:direction*step,behavior:reduced.matches?'instant':'smooth'});
  }
  archivePrev.addEventListener('click',()=>stepArchive(-1));
  archiveNext.addEventListener('click',()=>stepArchive(1));
  archive.addEventListener('scroll',updateArchiveControls,{passive:true});
  addEventListener('resize',updateArchiveControls);
  document.fonts?.ready.then(updateArchiveControls);
  updateArchiveControls();
  document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
    document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    document.querySelectorAll('.archive-film').forEach(card=>{card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter;});
    archive.scrollTo({left:0,behavior:'instant'});requestAnimationFrame(updateArchiveControls);
  }));
  // Next-drop bar: live clock to the release; the bar removes itself once the drop is out.
  const dropBar=$('.next-drop-bar');
  if(dropBar){const release=Date.parse(dropBar.dataset.release), clockEl=dropBar.querySelector('[data-next-drop-clock]');
    const pad=n=>String(n).padStart(2,'0');
    const tickBar=()=>{const ms=release-Date.now(); if(ms<=0){dropBar.remove();return;} const s=Math.floor(ms/1000); clockEl.textContent=pad(Math.floor(s/3600))+':'+pad(Math.floor(s%3600/60))+':'+pad(s%60);};
    tickBar(); setInterval(tickBar,1000);}
  document.querySelectorAll('[data-interest]').forEach(link=>link.addEventListener('click',()=>{$('#interest').value=link.dataset.interest;}));
  const passForm=$('#tv-pass-form');
  if(passForm){passForm.addEventListener('submit',async e=>{
    e.preventDefault(); const status=$('#tv-pass-status'), after=$('#tv-pass-after'), button=passForm.querySelector('button[type=submit]');
    status.textContent='Adding you…'; button.disabled=true;
    const payload={email:passForm.email.value.trim(), firstName:passForm.firstName.value.trim(), brand:passForm.brand.value.trim(), company_website:passForm.company_website.value, drop:'the-recipient', page:'/tv', source:new URLSearchParams(location.search).get('utm_source')||document.referrer.replace(/^https?:\/\//,'').split('/')[0]||'direct'};
    try{const r=await fetch(passForm.action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); const d=await r.json().catch(()=>({}));
      if(!r.ok||!d.ok) throw new Error(d.error||'Something went wrong.');
      status.textContent=''; const mail=$('#tv-pass-after-mail'); if(mail) mail.textContent=((d) => d.duplicate ? 'You were already on the list — nothing changed.' : d.welcomeSent ? 'Welcome email is on its way.' : 'You’re saved. The welcome email didn’t go out — I’ll send it by hand.')(d); passForm.querySelectorAll('input, button').forEach(el=>{el.disabled=true;}); after.hidden=false; after.focus?.();
      if(!d.duplicate&&window.vxFunnel) window.vxFunnel.record('season_pass_join',{drop:'the-recipient',page:'/tv'});
    }catch(err){status.textContent=err.message+' Or email brandon@vnmsfx.com and I\'ll add you by hand.'; button.disabled=false;}
  });}
  $('#brief-form').addEventListener('submit',e=>{
    e.preventDefault(); const interest=$('#interest').value, brief=$('#brief').value.trim();
    const body=`Hi Brandon,\n\nI'm interested in ${interest.toLowerCase()}.\n\n${brief || 'Brand / idea:'}\n\nWhere it will run:\nTiming (if known):\n`;
    location.href=`mailto:brandon@vnmsfx.com?subject=${encodeURIComponent('VNMSFX TV — '+interest)}&body=${encodeURIComponent(body)}`;
  });
  $('#copy-email').addEventListener('click', async()=>{
    try{await navigator.clipboard.writeText('brandon@vnmsfx.com');$('#copy-status').textContent='Email copied.';}
    catch{$('#copy-status').textContent='Select and copy brandon@vnmsfx.com above.';}
  });
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
