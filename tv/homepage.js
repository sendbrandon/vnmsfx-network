const REEL_ITEMS=[{"src": "/tv/drops/the-recipient-tease.mp4", "title": "The Recipient · Preview", "poster": "/tv/drops/the-recipient-poster.jpg", "hold": "full"}, {"src": "/tv/hero/night-drive.mp4", "title": "VNMSFX · Night drive", "poster": "/tv/hero/night-drive.jpg", "hold": "full", "source_file": "3134-FINAL-LOGO-1080.mp4"}, {"src": "/tv/hero/race.mp4", "title": "Race", "poster": "/tv/hero/race.jpg", "hold": "full", "source_file": "RACE-1-GRADED.mp4"}, {"src": "/tv/hero/after-dark.mp4", "title": "VNMSFX · After dark", "poster": "/tv/hero/after-dark.jpg", "hold": "full", "source_file": "6922-FINAL-LOGO-1080.mp4"}, {"src": "/tv/stills/office-rivalry-film.mp4", "title": "Office Rivalry — Original Comedy", "poster": "/tv/stills/office-rivalry-poster.jpg", "hold": 8}, {"src": "/tv/recent/he-said-it-was-hot-part-two.mp4", "title": "He Said It Was Hot — Part Two", "poster": "/tv/covers/he-said-it-was-hot-part-two.jpg", "hold": "full"}, {"src": "/tv/spots/cold-brew.mp4", "title": "Visual Confirmed.", "poster": "/tv/spots/cold-brew.jpg", "hold": 8}, {"src": "/tv/spots/midnight-noodles.mp4", "title": "Extraction at Midnight.", "poster": "/tv/spots/midnight-noodles.jpg", "hold": 8}, {"src": "/tv/spots/mullet-technician.mp4", "title": "Grid Restored. Can I Have One?", "poster": "/tv/spots/mullet-technician.jpg", "hold": 8}, {"src": "/tv/spots/spike-paste.mp4", "title": "Deploy the Spikes.", "poster": "/tv/spots/spike-paste.jpg", "hold": 8}, {"src": "/tv/spots/hand-wash.mp4", "title": "Package Is Moving.", "poster": "/tv/spots/hand-wash.jpg", "hold": 8}, {"src": "/tv/spots/fries.mp4", "title": "You’re Up.", "poster": "/tv/spots/fries.jpg", "hold": 8}];
(() => {
  const hero = document.querySelector('.hero-reel');
  const videos = [...hero.querySelectorAll('video')];
  const pause = document.querySelector('#video-pause');
  const caption = document.querySelector('#reel-caption');
  const dialog = document.querySelector('#preview-player');
  const player = document.querySelector('#preview-full-spot');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0, slot = 0, wanted = !reduced.matches, visible = true, changing = false;
  let generation = 0, prepared = -1, returnFocus = null;
  const url = p => new URL(p,location.href).href;
  const allowed = () => wanted && visible && !document.hidden && !dialog.open;
  function label() {
    pause.textContent = wanted ? 'Pause' : 'Play';
    pause.setAttribute('aria-label', wanted ? 'Pause previews' : 'Play previews');
    caption.textContent = `${String(index+1).padStart(2,'0')} / ${REEL_ITEMS[index].title}`;
  }
  function assign(video, n) {
    video.poster = url(REEL_ITEMS[n].poster);
    video.src = url(REEL_ITEMS[n].src);
    video.preload = 'auto'; video.muted = true; video.load();
  }
  function prepare() {
    const n=(index+1)%REEL_ITEMS.length;
    if(prepared!==n && allowed() && !changing){assign(videos[1-slot],n);prepared=n;}
  }
  function sync() {
    if(allowed()){
      const current=videos[slot];
      if(!current.getAttribute('src')) assign(current,index);
      current.play().then(prepare).catch(()=>{wanted=false;label();});
    } else videos.forEach(v=>v.pause());
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
      if(incoming.readyState<2) await new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>{clean();reject(new Error('preview timeout'));},10000);
        function clean(){clearTimeout(timer);['loadeddata','canplay','seeked'].forEach(e=>incoming.removeEventListener(e,ready));incoming.removeEventListener('error',fail);}
        function ready(){if(incoming.readyState>=2){clean();resolve();}} function fail(){clean();reject(new Error('preview unavailable'));}
        ['loadeddata','canplay','seeked'].forEach(e=>incoming.addEventListener(e,ready));incoming.addEventListener('error',fail,{once:true});
      });
      if(token!==generation) return;
      if(allowed()) incoming.play().catch(()=>{wanted=false;label();});
      incoming.classList.add('is-active');outgoing.classList.remove('is-active');
      index=next;slot=1-slot;prepared=-1;label();
      setTimeout(()=>{outgoing.pause();changing=false;prepare();if(!allowed())incoming.pause();},reduced.matches?0:600);
    } catch {
      incoming.pause();changing=false;wanted=false;label();
    }
  }
  videos.forEach(v=>{
    v.addEventListener('loadedmetadata',()=>v.classList.toggle('is-portrait',v.videoHeight>v.videoWidth));
    v.addEventListener('timeupdate',()=>{if(v===videos[slot] && allowed() && !changing && v.currentTime>=(REEL_ITEMS[index].hold==='full'?v.duration-.05:Math.min(REEL_ITEMS[index].hold||8,v.duration)-.55))advance();});
    v.addEventListener('ended',()=>{if(v===videos[slot] && allowed())advance();});
    v.addEventListener('error',()=>{if(v===videos[slot]){wanted=false;label();}});
  });
  pause.addEventListener('click',()=>{wanted=!wanted;sync();});
  document.querySelector('#next-spot').addEventListener('click',()=>advance());
  document.querySelector('#previous-spot').addEventListener('click',()=>advance(-1));
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',()=>{wanted=!reduced.matches;sync();});
  new IntersectionObserver(e=>{visible=e[0].isIntersecting;sync();},{threshold:.15}).observe(hero);
  function openAd(src,title,poster,opener){
    returnFocus=opener;videos.forEach(v=>v.pause());
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
  label();
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