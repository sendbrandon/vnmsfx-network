const REEL_ITEMS=[{"src": "/tv/hero/hero.mp4", "title": "VNMSFX · Original film", "poster": "/tv/hero/hero.jpg", "hold": "full", "source_file": "kling_20260920_VIDEO_give_me_a__5611_0.mp4"}];
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
  let index = 0, slot = 0, wanted = !reduced.matches, visible = true, changing = false;
  let generation = 0, playRequest = 0, prepared = -1, returnFocus = null;
  const url = p => new URL(p,location.href).href;
  const allowed = () => wanted && visible && !document.hidden && !dialog.open;
  function label() {
    pause.textContent = wanted ? 'Pause' : 'Play';
    pause.setAttribute('aria-label', wanted ? 'Pause previews' : 'Play previews');
    caption.textContent = SINGLE ? REEL_ITEMS[index].title : `${String(index+1).padStart(2,'0')} / ${REEL_ITEMS[index].title}`;
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
      setTimeout(()=>{if(token!==generation)return;outgoing.pause();changing=false;prepare();if(!allowed())incoming.pause();},reduced.matches?0:600);
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
  if(SINGLE){ document.querySelector('#next-spot').remove(); document.querySelector('#previous-spot').remove(); }
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
  const options = {
    '15': {name:'One 15-second commercial', price:'$2,000', usd:true, lines:['A 30-minute call and written creative direction for approval.','Two alternate openings and two campaign images.','One round of feedback on the ad, within the approved direction.'], cta:'Start a 15-second project ↗'},
    '30': {name:'One 30-second commercial', price:'Quoted after brief review', lines:['Two rounds of feedback on the ad, within the approved direction.','Versions, images and final formats agreed in your project scope.'], cta:'Start a 30-second project ↗'},
    '60': {name:'One 60-second commercial', price:'Quoted after brief review', lines:['Three rounds of feedback on the ad, within the approved direction.','Versions, images and final formats agreed in your project scope.'], cta:'Start a 60-second project ↗'},
    'custom': {name:'A longer or custom commercial', price:'Quoted after brief review', lines:['Length, deliverables and revisions agreed for your project.'], cta:'Discuss a custom commercial ↗'}
  };
  const select = document.querySelector('#brief-length');
  const buttons = [...document.querySelectorAll('[data-duration]')];
  function showPackage(key, syncForm) {
    const option = options[key]; if (!option) return;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.duration === key)));
    document.querySelector('#package-name').textContent = option.name;
    const price = document.querySelector('#package-price');
    price.textContent = option.price;
    if (option.usd) { const unit = document.createElement('span'); unit.textContent = ' USD'; price.append(unit); }
    const list = document.querySelector('#package-inclusions');
    list.replaceChildren(...option.lines.map(line => { const item = document.createElement('li'); item.textContent = line; return item; }));
    document.querySelector('#package-discount').hidden = key !== '15';
    document.querySelector('#package-inquiry').textContent = option.cta;
    if (syncForm) select.value = key;
  }
  buttons.forEach(button => button.addEventListener('click', () => showPackage(button.dataset.duration, true)));
  document.querySelector('#package-inquiry').addEventListener('click', () => { const selected = buttons.find(button => button.getAttribute('aria-pressed') === 'true'); select.value = selected ? selected.dataset.duration : 'unsure'; });
  select.addEventListener('change', () => {
    if (options[select.value]) showPackage(select.value, false);
    else {
      buttons.forEach(button => button.setAttribute('aria-pressed','false'));
      document.querySelector('#package-name').textContent = 'Commercial length to be agreed';
      document.querySelector('#package-price').textContent = 'Quoted after brief review';
      document.querySelector('#package-inclusions').replaceChildren();
      document.querySelector('#package-discount').hidden = true;
      document.querySelector('#package-inquiry').textContent = 'Discuss your commercial ↗';
    }
  });
  document.querySelector('#preview-brief').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const length = select.options[select.selectedIndex].textContent;
    const body = `Brand / product: ${values.get('brand')}\nReply email: ${values.get('email')}\nPreferred length: ${length}\nLaunch date: ${values.get('deadline') || 'To be agreed'}\n\nProject brief:\n${values.get('message')}`;
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