const root='/assets/saints/';
const people={"nix":{"name":"NIX","role":"THE ONE GOING BACK","deck":"He used to work for Vernon. Now he’s getting Rook back.","bio":"Vernon’s former employee. Rook’s would-be rescuer. His past puts him on both sides of the fight.","age":"Unrevealed"},"rook":{"name":"ROOK","role":"NOBODY’S PROPERTY","deck":"Vernon has her locked up. He still can’t shut her up.","bio":"A captive who refuses to cooperate. Vernon can lock the door. He cannot make her obedient.","age":"Unrevealed"},"brick":{"name":"BRICK","role":"THE ONE BESIDE YOU","deck":"Nix goes back for Rook. Brick goes with him.","bio":"A gorilla in camouflage. Nix goes after Rook; Brick stands beside him when it turns ugly.","age":"Unrevealed"},"vernon":{"name":"VERNON VOSS","role":"THE MAN BEHIND THE DOORS","deck":"An army of robots. An ego that bruises easily.","bio":"Commands the robots. Holds Rook captive. Expects obedience—and takes defiance personally.","age":"75"}};
const trackSaints=(name,fields)=>window.SaintsAnalytics?.track(name,fields);
const characterWatch=document.querySelector('[data-watch-placement="character"]');
characterWatch.href=window.SaintsAnalytics?.watchUrl('episode')||characterWatch.href;
characterWatch.addEventListener('click',()=>{characterWatch.href=window.SaintsAnalytics?.watchUrl('episode')||characterWatch.href;trackSaints('click_watch',{placement:'character',video:'episode'});});
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
  document.querySelector('#portrait').src=root+'film-finish/v2/'+key+'-cast-film-v2.png';
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

// Fixed cast keys only; unknown query values retain the default Nix dossier.
const requestedCharacter=new URLSearchParams(location.search).get('character');
const requestedTab=tabs.find(tab=>tab.dataset.character===requestedCharacter);
if(requestedTab)selectPerson(requestedTab);
