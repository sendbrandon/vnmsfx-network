const root='/assets/saints/';
// Production configuration: use a hosted, full-quality Opening 2 URL before publishing.
const media={episode:root+'episode-01-opening-2.mp4',trailer:root+'trailer.mp4'};
const people={"nix":{"name":"NIX","role":"THE ONE GOING BACK","deck":"He used to work for Vernon. Now he’s getting Rook back.","bio":"Nix’s past puts him on both sides of this fight. Rook has been taken, and walking away is not an option.","age":"Unrevealed"},"rook":{"name":"ROOK","role":"NOBODY’S PROPERTY","deck":"Vernon has her locked up. He still can’t shut her up.","bio":"Rook refuses to cooperate with the man holding her. Nix and Brick are coming for her. She is not making captivity easy for anyone.","age":"Unrevealed"},"brick":{"name":"BRICK","role":"THE ONE BESIDE YOU","deck":"Nix goes back for Rook. Brick goes with him.","bio":"A gorilla in camouflage, standing beside Nix when things turn ugly. His loyalty becomes a choice with real consequences.","age":"Unrevealed"},"vernon":{"name":"VERNON VOSS","role":"THE MAN BEHIND THE DOORS","deck":"An army of robots. An ego that bruises easily.","bio":"Vernon holds Rook, commands the guards, and expects obedience. Defy him and it becomes personal. Scuff his floor and it becomes a crisis.","age":"75"}};
const terms={monthly:{price:'$7.99',unit:'/ month',copy:'Billed monthly. Renews automatically. Cancel before renewal.',saving:'$3.97 less than buying four episodes separately.'},six:{price:'$39.99',unit:'/ 6 months',copy:'Billed $39.99 every six months. Renews automatically.',saving:'Save $7.95 (17%) versus six monthly payments.'},annual:{price:'$69.99',unit:'/ year',copy:'Billed $69.99 yearly. Renews automatically.',saving:'Save $25.89 (27%) versus twelve monthly payments.'}};let term='monthly';
const trackSaints=(name,fields)=>window.SaintsAnalytics?.track(name,fields);
trackSaints('view_landing');
document.querySelectorAll('[data-video]').forEach(b=>b.addEventListener('click',()=>{trackSaints('click_watch',{placement:b.closest('.hero')?'hero':'episode',video:b.dataset.video});location.href=window.SaintsAnalytics?.watchUrl(b.dataset.video)||'/saints-watch?video='+encodeURIComponent(b.dataset.video)}));
const characterWatch=document.querySelector('[data-watch-placement="character"]');
characterWatch.href=window.SaintsAnalytics?.watchUrl('episode')||characterWatch.href;
characterWatch.addEventListener('click',()=>{characterWatch.href=window.SaintsAnalytics?.watchUrl('episode')||characterWatch.href;trackSaints('click_watch',{placement:'character',video:'episode'});});
document.querySelectorAll('dialog .close').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
const tabs=[...document.querySelectorAll('[data-character]')];
let selectedCharacter='nix';
let hasSelectedCharacter=false;
const cardsReady=!!window.SaintsCards;
const assetLinks=[...document.querySelectorAll('[data-asset-kind]')];
const downloadButton=document.querySelector('#download-character');
const characterStatus=document.querySelector('#character-status');
const displayName=key=>key==='vernon'?'Vernon':key.charAt(0).toUpperCase()+key.slice(1);
function updateDownloadLinks(){
  if(!cardsReady)return;
  assetLinks.forEach(link=>{
    const kind=link.dataset.assetKind;
    const file=window.SaintsCards.asset(selectedCharacter,kind)||window.SaintsCards.collection(kind);
    if(!file)return;
    link.href=file.href;link.download=file.filename;
    link.dataset.assetCharacter=file.character;
    link.dataset.assetFormat=file.format;
    const label=kind==='front'?'Get '+displayName(selectedCharacter)+'’s crew card ':file.label+' ';
    link.replaceChildren(document.createTextNode(label));
    const suffix=document.createElement('span');
    if(kind==='front')suffix.setAttribute('aria-hidden','true');
    suffix.textContent=kind==='front'?'↓':file.format.toUpperCase();link.append(suffix);
  });
}
function selectPerson(b){
  const key=b.dataset.character,p=people[key];
  if(!p||(key===selectedCharacter&&hasSelectedCharacter))return;
  hasSelectedCharacter=true;
  selectedCharacter=key;
  const washes={nix:'124,99,72',rook:'116,126,130',brick:'91,112,113',vernon:'132,113,94'};
  document.querySelector('.characters').style.setProperty('--portrait-wash',washes[key]);
  document.querySelector('.character-more').open=false;
  tabs.forEach(t=>{t.setAttribute('aria-selected',String(t===b));t.tabIndex=t===b?0:-1});
  document.querySelector('#dossier').setAttribute('aria-labelledby',b.id);
  document.querySelector('#portrait').src=root+'stills/'+(key==='nix'?'nix-episode02.png':key+'-hero.png');
  document.querySelector('#portrait').alt=p.name+' character portrait';
  document.querySelector('.portrait').classList.toggle('vernon',key==='vernon');
  for(const [id,val]of Object.entries({'character-name':p.name,'character-role':p.role,'character-deck':p.deck,'character-bio':p.bio}))document.getElementById(id).textContent=val;
  updateDownloadLinks();
  characterStatus.textContent=displayName(key)+(cardsReady?' selected.':' selected. Reload to restore card downloads.');
  trackSaints('character_select',{character:key});
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&typeof document.querySelector('.dossier-copy').animate==='function'){
    document.querySelector('.dossier-copy').animate([{opacity:.5},{opacity:1}],{duration:180,easing:'ease-out'});
  }
}
tabs.forEach((b,i)=>{b.addEventListener('click',()=>selectPerson(b));b.addEventListener('keydown',e=>{let j;if(e.key==='ArrowRight')j=(i+1)%tabs.length;if(e.key==='ArrowLeft')j=(i+tabs.length-1)%tabs.length;if(e.key==='Home')j=0;if(e.key==='End')j=tabs.length-1;if(j!==undefined){e.preventDefault();tabs[j].focus();selectPerson(tabs[j]);}})});
if(cardsReady){
  updateDownloadLinks();
  assetLinks.forEach(link=>link.addEventListener('click',()=>{
    trackSaints('asset_download_clicked',{character:link.dataset.assetCharacter,asset:link.dataset.assetKind,format:link.dataset.assetFormat});
    characterStatus.textContent='Download requested. Your browser handles saving the file.';
  }));
}else{
  downloadButton.hidden=true;
  document.querySelector('#character-formats').hidden=true;
  document.querySelector('#character-card-note').hidden=true;
  characterStatus.textContent='Card links could not load. Reload this page to try again.';
}
document.querySelectorAll('[data-term]').forEach(b=>b.addEventListener('click',()=>{term=b.dataset.term;document.querySelectorAll('[data-term]').forEach(t=>t.setAttribute('aria-pressed',String(t===b)));const p=terms[term];document.querySelector('#member-price').innerHTML=p.price+'<span>'+p.unit+'</span>';document.querySelector('#billing-copy').textContent=p.copy;document.querySelector('#saving').textContent=p.saving;}));
document.querySelectorAll('[data-plan]').forEach(b=>b.addEventListener('click',()=>{const ep=b.dataset.plan==='episode';document.querySelector('#plan-title').textContent=ep?'Preorder Episode 2 · $2.99':terms[term].price+' '+terms[term].unit;document.querySelector('#plan-description').textContent=ep?'Get Episode 2 in your library when it releases. Release date to be announced. Preorder checkout is being connected; no order or payment is accepted yet.':terms[term].copy+' Cancel through your library; access continues until the end of your paid period.';document.querySelector('#plan-dialog').showModal();}));document.querySelector('#back-to-free').addEventListener('click',()=>document.querySelector('#plan-dialog').close());
const reduced=matchMedia('(prefers-reduced-motion: reduce)');if(!reduced.matches&&'IntersectionObserver'in window){document.documentElement.classList.add('js-motion');const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}

fetch('/api/saints?action=config').then(r=>r.json()).then(c=>{if(c.salesEnabled){if(c.membershipsEnabled)document.querySelector('.membership .pill').textContent='MEMBERSHIP';document.querySelectorAll('[data-plan]').forEach(b=>{const episode=b.dataset.plan==='episode';if(episode?(!c.preordersEnabled&&!c.episode2Released):!c.membershipsEnabled)return;const n=b.cloneNode(true);n.disabled=false;n.removeAttribute('aria-disabled');n.textContent=episode?(c.episode2Released?'Buy Episode 2 — $2.99 ↗':'Preorder Episode 2 — $2.99 ↗'):'Join membership ↗';b.replaceWith(n);n.addEventListener('click',()=>{location.href='/saints-library?purchase='+encodeURIComponent(n.dataset.plan==='episode'?'saints-02':term)});});}}).catch(()=>{});

// Never advertise working public playback until the streaming connection exists.
if(!['localhost','127.0.0.1'].includes(location.hostname)){
const freeButtons=[...document.querySelectorAll('[data-video="episode"]')];
function playbackAvailability(ready){document.querySelector('header .small-cta').textContent=ready?'Watch free ↗':'Episodes ↗';document.querySelector('#watch .section-heading>p').textContent=ready?'The full episode. Five minutes. No account needed.':'Five minutes. Free when streaming opens. No sign-up required.';freeButtons.forEach(b=>{b.disabled=!ready;if(!b.classList.contains('episode-image'))b.textContent=ready?'Play Episode 1':'Free premiere · coming soon';else{b.setAttribute('aria-label',ready?'Watch Episode 1 free':'Episode 1 — streaming coming soon');b.querySelector('.pill').textContent=ready?'FREE TO WATCH':'COMING SOON';}});}
freeButtons.forEach(b=>{b.disabled=true;if(!b.classList.contains('episode-image'))b.textContent='Checking playback…';});Promise.all([fetch('/assets/saints/press-video.json',{cache:'no-store'}).then(r=>r.json()).catch(()=>({})),fetch('/api/saints?action=config').then(r=>r.json()).catch(()=>({}))]).then(([video,c])=>playbackAvailability(/^[A-Za-z0-9_-]{11}$/.test(video.youtubeId||'')||!!c.playbackReady));
}

// Section shortcuts keep mobile browsing direct without hiding either episode.
const mobileNav=document.createElement('nav');mobileNav.className='mobile-sections';mobileNav.setAttribute('aria-label','Browse this show');mobileNav.innerHTML='<a href="#watch">Episodes</a><a href="#characters">Characters</a><a href="#access">Keep watching</a>';document.querySelector('header').after(mobileNav);
if('IntersectionObserver' in window){const sections=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)document.querySelectorAll('.mobile-sections a, header nav a').forEach(a=>a.setAttribute('aria-current',String(a.hash==='#'+e.target.id)))})},{rootMargin:'-110px 0px -45% 0px',threshold:0});['watch','characters','access'].forEach(id=>sections.observe(document.getElementById(id)));}
