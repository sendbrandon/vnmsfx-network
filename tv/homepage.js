const REEL_ITEMS=[{"src": "/tv/hero/hero.mp4", "title": "VNMSFX · Selected work", "poster": "/tv/hero/hero.jpg", "hold": "full", "source_file": "kling 5611 + 970 + 640, cut and graded 2026-09-21"}];
(() => {
  const hero = document.querySelector('.hero-reel');
  const videos = [...hero.querySelectorAll('video')];
  const pause = document.querySelector('#video-pause');
  const caption = document.querySelector('#reel-caption');
  const dialog = document.querySelector('#preview-player');
  const player = document.querySelector('#preview-full-spot');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const media = hero.querySelector('.hero-media');
  const cover = document.createElement('img');
  cover.className = 'hero-poster'; cover.alt = '';
  media.append(cover);
  const SINGLE = REEL_ITEMS.length === 1;
  // One clip loops natively; two alternate with the built-in crossfade. Neither is
  // an index worth stepping through, so the arrows only appear above that.
  const BROWSABLE = REEL_ITEMS.length > 2;
  let index = 0, slot = 0, wanted = !reduced.matches, visible = true, changing = false;
  let generation = 0, playRequest = 0, prepared = -1, returnFocus = null;
  const url = p => new URL(p,location.href).href;
  const allowed = () => wanted && visible && !document.hidden && !dialog.open;
  function label() {
    pause.textContent = wanted ? 'Pause' : 'Play';
    pause.setAttribute('aria-label', wanted ? 'Pause previews' : 'Play previews');
    caption.textContent = !BROWSABLE ? REEL_ITEMS[index].title : `${String(index+1).padStart(2,'0')} / ${REEL_ITEMS[index].title}`;
  }
  function assign(video, n) {
    video.classList.remove('has-frame');
    video.poster = url(REEL_ITEMS[n].poster);
    video.muted = true; video.defaultMuted = true; video.playsInline = true;
    video.setAttribute('muted',''); video.setAttribute('playsinline','');
    video.loop = SINGLE;
    video.src = url(REEL_ITEMS[n].src);
    video.preload = 'auto'; video.load();
  }
  // Keep an independent still above the video until a decoded frame is ready.
  // A native video poster can disappear as soon as play() is requested on iOS.
  function showCover(n = index) {
    cover.src = url(REEL_ITEMS[n].poster); cover.classList.remove('is-hidden');
  }
  function frameReady(video, playing) {
    return new Promise((resolve,reject)=>{
      let callback;
      const timer = setTimeout(()=>finish(new Error('preview timeout')),12000);
      const events = ['loadeddata','playing','timeupdate','seeked'];
      function finish(error) {
        clearTimeout(timer); events.forEach(e=>video.removeEventListener(e,check));
        video.removeEventListener('error',fail);
        if(callback !== undefined) video.cancelVideoFrameCallback?.(callback);
        error ? reject(error) : resolve();
      }
      function check() {
        if(video.readyState >= 2 && (!playing || (!video.paused && video.currentTime > .02))) finish();
      }
      function fail() { finish(new Error('preview unavailable')); }
      events.forEach(e=>video.addEventListener(e,check));
      video.addEventListener('error',fail);
      if(playing && video.requestVideoFrameCallback) callback = video.requestVideoFrameCallback(()=>finish());
      check();
    });
  }
  function prepare() {
    if(SINGLE) return;   // nothing to pre-buffer; a second copy would double the download
    const n=(index+1)%REEL_ITEMS.length;
    if(prepared!==n && allowed() && !changing){assign(videos[1-slot],n);prepared=n;}
  }
  function sync() {
    const request = ++playRequest;
    if(allowed()){
      const current=videos[slot];
      if(!current.getAttribute('src')) assign(current,index);
      if(current.paused) showCover();
      // Invoke play immediately so a tap retains the browser's user activation.
      current.play().then(()=>frameReady(current,true)).then(()=>{
        if(request!==playRequest || current!==videos[slot] || !allowed()) return;
        current.classList.add('has-frame'); cover.classList.add('is-hidden'); prepare();
      }).catch(error=>{
        // Scrolling away or closing the tab can interrupt play; that is not a user pause.
        if(request!==playRequest || !allowed() || error.name==='AbortError') return;
        wanted=false; current.pause(); showCover(); label();
      });
    } else {
      ++generation; changing=false;
      videos.forEach(v=>v.pause());
    }
    label();
  }
  async function advance(step=1) {
    if(changing) return;
    changing=true;
    const token=++generation, next=(index+step+REEL_ITEMS.length)%REEL_ITEMS.length;
    const outgoing=videos[slot], incoming=videos[1-slot];
    if(prepared!==next) assign(incoming,next);
    if(incoming.currentTime>.02) incoming.currentTime=0;
    try {
      if(allowed()) {
        await incoming.play();
        await frameReady(incoming,true);
      } else await frameReady(incoming,false);
      if(token!==generation) { if(incoming!==videos[slot]) incoming.pause(); return; }
      if(wanted && !allowed()) { incoming.pause(); changing=false; return; }
      incoming.classList.add('has-frame');
      incoming.classList.add('is-active');outgoing.classList.remove('is-active');
      index=next;slot=1-slot;prepared=-1;label();
      if(allowed()) cover.classList.add('is-hidden'); else showCover();
      setTimeout(()=>{if(token!==generation)return;outgoing.pause();changing=false;prepare();if(!allowed())incoming.pause();},0);   // hard cut: nothing to wait for, so the outgoing clip stops at once
    } catch(error) {
      if(token!==generation) return;
      incoming.pause();changing=false;
      if(error.name==='AbortError' || !allowed()) return;
      // Do not replace the working frame with a failed or blocked next video.
      wanted=false; outgoing.pause(); showCover(); label();
    }
  }
  videos.forEach(v=>{
    v.addEventListener('loadedmetadata',()=>v.classList.toggle('is-portrait',v.videoHeight>v.videoWidth));
    v.addEventListener('timeupdate',()=>{if(!SINGLE && v===videos[slot] && allowed() && !changing && v.currentTime>=(REEL_ITEMS[index].hold==='full'?v.duration-.05:Math.min(REEL_ITEMS[index].hold||8,v.duration)-.55))advance();});
    v.addEventListener('ended',()=>{if(!SINGLE && v===videos[slot] && allowed())advance();});
    v.addEventListener('error',()=>{if(v===videos[slot]){wanted=false;showCover();label();}});
  });
  pause.addEventListener('click',()=>{wanted=!wanted;sync();});
  // With one film there is nowhere to step to, so the arrows are removed rather than left inert.
  if(!BROWSABLE){ document.querySelector('#next-spot').remove(); document.querySelector('#previous-spot').remove(); }
  else {
    document.querySelector('#next-spot').addEventListener('click',()=>advance());
    document.querySelector('#previous-spot').addEventListener('click',()=>advance(-1));
  }
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',()=>{wanted=!reduced.matches;sync();});
  new IntersectionObserver(e=>{const next=e[0].isIntersecting;if(visible!==next){visible=next;sync();}},{threshold:.15}).observe(hero);
  function openAd(src,title,poster,opener){
    returnFocus=opener;++playRequest;++generation;changing=false;videos.forEach(v=>v.pause());
    dialog.dataset.clientShape=opener?.dataset.playerShape||'';
    document.querySelector('#player-title').textContent=title;
    document.querySelector('#direct-spot').href=src;
    player.poster=poster;player.src=src;dialog.showModal();
    player.play().catch(()=>{});
  }
  document.querySelectorAll('[data-film]').forEach(a=>a.addEventListener('click',e=>{
    if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    e.preventDefault();openAd(a.href,a.dataset.title,a.dataset.poster,a);
  }));
  document.querySelector('#close-spot').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{player.pause();player.removeAttribute('src');player.load();returnFocus?.focus({preventScroll:true});sync();});
  showCover(); sync();
})();

(() => {
  const rungs = {
    pilot: {name:'One finished ad. See how I work.', price:'$2,000', unit:'USD', proof:'Made the same way as the 5× Easter campaign.', lead:'A real 15-second commercial you can run, not a sample. Idea, direction, production, editing, sound and music licensing. Most clients start here.', lines:['A 30-minute call and written creative direction for approval.','Two alternate openings and two campaign images.','One round of feedback on the ad, within the approved direction.'], note:'First-time client? <a href="/drops/the-recipient#pass">Join the free Season Pass</a> and save $500 on your first eligible 15-second commercial: <strong>$1,500 instead of $2,000.</strong> Book a Launch Pack within 30 days and the pilot fee comes off.', cta:'Start a Pilot ↗'},
    launch: {name:'One idea. Five ads to test.', price:'$7,500', unit:'USD', proof:'Made the same way as the 5× Easter campaign.', lead:'For a launch or a paid-social push. Five versions go out and the results pick the winner, not a hunch.', lines:['One 15-second hero commercial.','Four cutdowns and test versions with different openings.','Vertical and square, ready for Meta, TikTok and YouTube.','Two rounds of feedback.'], note:'Keep it going: add three months of Monthly and save $3,000.', cta:'Start a Launch Pack ↗'},
    monthly: {name:'New ads before the old ones burn out.', price:'from $5,000', unit:'/ month', lead:'For brands running ads every month. Fresh versions land before the last ones fade, and we look at the numbers together.', lines:['Starter, $5,000: six new versions a month.','Growth, $8,000: ten versions in two drops.','Scale, $12,000: sixteen versions, plus a 30-second hero every quarter.','A results review every month. Three months to start, then month to month.'], note:'Run the Pilot first. If it beats the ad you’re running now, the $2,000 comes off month one.', cta:'Start Monthly ↗'},
    hero: {name:'The one your whole campaign hangs on.', price:'from $18,000', unit:'quoted after your brief', proof:'Made the same way as the Dreamina film: 60,000 views in 12 hours.', lead:'A 30 or 60-second film for the big launch, connected TV or the brand story, cut into every length you’ll need.', lines:['One 30 or 60-second hero commercial.','The 15-second version and six cutdowns.','Licensed music and full sound design.','Three rounds of feedback.'], note:'You approve the idea and the look before I produce a frame. Scope and price in writing first.', cta:'Discuss a Hero Campaign ↗'},
    agencies: {name:'Your client. Your name. My production.', price:'$5,000 to $15,000', unit:'per project', lead:'Overflow AI production when the calendar’s full. Fixed scope, fixed price, under NDA.', lines:['Spots to your brief, in your client’s look.','Scope and price fixed before work starts.','Two rounds of feedback.','Agency Bench: five prepaid projects, $45,000, used within six months.'], note:'NDA and no-poach, both directions. Standard.', cta:'Talk about agency work ↗'}
  };
  const HASHES = {'#pilot':'pilot', '#launch-pack':'launch', '#monthly':'monthly', '#hero':'hero', '#agencies':'agencies'};
  const el = id => document.querySelector(id);
  const select = el('#brief-length');
  const buttons = [...document.querySelectorAll('[data-rung]')];
  function showRung(key, syncForm) {
    const rung = rungs[key]; if (!rung) return;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.rung === key)));
    el('#package-name').textContent = rung.name;
    const price = el('#package-price');
    price.textContent = rung.price;
    if (rung.unit) { const unit = document.createElement('span'); unit.textContent = ' ' + rung.unit; price.append(unit); }
    const proof = el('#package-proof');
    proof.textContent = rung.proof || ''; proof.hidden = !rung.proof;
    el('#package-lead').textContent = rung.lead;
    el('#package-inclusions').replaceChildren(...rung.lines.map(line => { const item = document.createElement('li'); item.textContent = line; return item; }));
    const note = el('#package-discount');
    note.innerHTML = rung.note; note.hidden = false;   // static site copy only, never user input
    el('#package-inquiry').textContent = rung.cta;
    if (syncForm) select.value = key;
  }
  buttons.forEach(button => button.addEventListener('click', () => showRung(button.dataset.rung, true)));
  el('#package-inquiry').addEventListener('click', () => { const selected = buttons.find(button => button.getAttribute('aria-pressed') === 'true'); select.value = selected ? selected.dataset.rung : 'unsure'; });
  select.addEventListener('change', () => {
    if (rungs[select.value]) showRung(select.value, false);
    else {
      buttons.forEach(button => button.setAttribute('aria-pressed','false'));
      el('#package-name').textContent = 'Tell me what you need.';
      el('#package-price').textContent = 'Quoted after your brief';
      el('#package-proof').hidden = true;
      el('#package-lead').textContent = 'Send the brief and I’ll point you to the right one.';
      el('#package-inclusions').replaceChildren();
      el('#package-discount').hidden = true;
      el('#package-inquiry').textContent = 'Discuss your commercial ↗';
    }
  });
  // Deep links from outreach land on a specific rung: /#pilot, /#launch-pack, /#monthly, /#hero, /#agencies.
  function fromHash() {
    const key = HASHES[location.hash]; if (!key) return false;
    showRung(key, true);
    el('#commercial-options').scrollIntoView({block:'start'});
    return true;
  }
  window.addEventListener('hashchange', fromHash);
  if (!fromHash()) showRung('launch', false);
  el('#preview-brief').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const need = select.options[select.selectedIndex].textContent;
    const body = `Brand / product: ${values.get('brand')}\nReply email: ${values.get('email')}\nWhat you need: ${need}\nLaunch date: ${values.get('deadline') || 'To be agreed'}\n\nProject brief:\n${values.get('message')}`;
    window.location.href = `mailto:brandon@vnmsfx.com?subject=${encodeURIComponent('Commercial inquiry — '+values.get('brand'))}&body=${encodeURIComponent(body)}`;
  });
})();

(()=>{const $=s=>document.querySelector(s), reduced=matchMedia('(prefers-reduced-motion: reduce)'), dialog=$('#preview-player'), packDialog=null, menu={hidden:true}, menuButton=$('#video-pause');  const marquee=$('#spots-marquee'), spotsTrack=$('#spots-track');
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
})();