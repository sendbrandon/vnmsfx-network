const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const cards = require('../assets/saints/character-cards');
const pageSource = read('assets/saints/cast.js');
const people = JSON.parse(pageSource.match(/const people=(.*);\nconst trackSaints=/)[1]);
const manifest = JSON.parse(read('assets/saints/collectibles/v4/manifest.json'));

for(const [character,prefix] of Object.entries({nix:'01-nix',rook:'02-rook',brick:'03-brick',vernon:'04-vernon'})){
  for(const kind of ['front','back','wallpaper']){
    test(character+' '+kind+' is a real, correctly sized, checksum-verified PNG',()=>{
      const file=cards.asset(character,kind);
      assert.equal(file.filename,prefix+'-'+kind+'-v4.png');
      assert.equal(file.format,'png');assert.equal(file.character,character);
      assert.ok(file.href.startsWith('/assets/saints/collectibles/v4/'));
      const data=fs.readFileSync(path.join(root,file.href));
      assert.equal(data.subarray(1,4).toString(),'PNG');
      const dimensions=[data.readUInt32BE(16),data.readUInt32BE(20)];
      assert.deepEqual(dimensions,kind==='wallpaper'?[1080,1920]:[1200,1800]);
      const entry=manifest.files.find(row=>file.href.endsWith('/'+row.path));
      assert.ok(entry,'download is included in the asset manifest');
      assert.equal(data.length,entry.bytes);
      assert.equal(crypto.createHash('sha256').update(data).digest('hex'),entry.sha256);
    });
  }
}

for(const kind of ['print_pdf','collection_zip'])test(kind+' resolves to the verified final package',()=>{
  const file=cards.collection(kind);
  assert.equal(file.character,'all');assert.equal(file.format,kind==='print_pdf'?'pdf':'zip');
  const data=fs.readFileSync(path.join(root,file.href));
  assert.ok(data.length>100);
  assert.ok(kind==='print_pdf'?data.subarray(0,5).toString()==='%PDF-':data[0]===0x50&&data[1]===0x4b);
  const entry=manifest.files.find(row=>file.href.endsWith('/'+row.path));
  assert.ok(entry);assert.equal(data.length,entry.bytes);
  assert.equal(crypto.createHash('sha256').update(data).digest('hex'),entry.sha256);
});

test('catalog rejects arbitrary filenames, paths, characters and prototype names',()=>{
  for(const key of ['__proto__','constructor','toString','../../private','https://evil.test',null,undefined]){
    assert.equal(cards.asset(key,'front'),null);assert.equal(cards.asset('nix',key),null);assert.equal(cards.collection(key),null);
  }
  assert.equal(Object.isFrozen(cards.asset('nix','front')),true);
  assert.doesNotMatch(read('assets/saints/character-cards.js'),/fetch\(|localStorage|sessionStorage|canvas|createObjectURL|buildCard/);
});

class Element {
  constructor(id=''){this.id=id;this.dataset={};this.attributes={};this.listeners={};this.style={setProperty(){}};this.classList={toggle(){},add(){}};this.textContent='';this.children=[];this.hidden=false;this.tabIndex=-1;this.href='';this.open=false;}
  addEventListener(event,fn){(this.listeners[event] ||= []).push(fn);}
  async emit(event,detail={}){await Promise.all((this.listeners[event]||[]).map(fn=>fn({preventDefault(){},...detail})));}
  setAttribute(key,val){this.attributes[key]=String(val);}
  removeAttribute(key){delete this.attributes[key];}
  getAttribute(key){return this.attributes[key];}
  append(node){this.children.push(node);}
  replaceChildren(...nodes){this.children=nodes;}
  focus(){this.focused=true;}
  after(){}
  closest(selector){return selector==='.hero'&&this.hero?this:null;}
  animate(){this.animated=true;}
}
function pageRuntime({missingCatalog=false,reduced=true,search=''}={}){
  const selectors=['#download-character','#character-status','#character-card-note','#character-formats','#dossier','#portrait','.portrait','.dossier-copy','.character-more','.characters','#character-name','#character-role','#character-deck','#character-bio','#back-to-free','#plan-dialog','header','[data-watch-placement="character"]'];
  const nodes=Object.fromEntries(selectors.map(key=>[key,new Element(key)]));
  const tabs=['nix','rook','brick','vernon'].map(key=>{const el=new Element('tab-'+key);el.dataset.character=key;return el;});
  tabs[0].tabIndex=0;tabs[0].setAttribute('aria-selected','true');
  const assetLinks=['front','back','wallpaper','print_pdf','collection_zip'].map(kind=>{const el=kind==='front'?nodes['#download-character']:new Element(kind);el.dataset.assetKind=kind;return el;});
  const hero=new Element();hero.dataset.video='episode';hero.hero=true;
  const episode=new Element();episode.dataset.video='episode';
  const events=[];
  const document={querySelector:selector=>nodes[selector],querySelectorAll:selector=>selector==='[data-character]'?tabs:selector==='[data-video]'?[hero,episode]:selector==='[data-asset-kind]'?assetLinks:[],getElementById:id=>nodes['#'+id],createElement:()=>new Element(),createTextNode:text=>({textContent:text}),documentElement:new Element()};
  const window={SaintsCards:missingCatalog?undefined:cards,SaintsAnalytics:{track:(name,fields)=>events.push({name,...fields}),watchUrl:video=>'/saints-watch?video='+video+'&utm_source=instagram'}};
  const context={window,document,location:{hostname:'localhost',search,href:''},matchMedia:()=>({matches:reduced}),URLSearchParams,fetch:()=>Promise.reject(Error('offline'))};
  vm.runInNewContext(pageSource,context);
  return {nodes,tabs,events,assetLinks,hero,episode,context};
}

test('initial default is not a choice event; explicit default selection counts once',async()=>{
  const r=pageRuntime();assert.equal(r.events.filter(e=>e.name==='character_select').length,0);
  await r.tabs[0].emit('click');await r.tabs[0].emit('click');
  assert.equal(r.events.filter(e=>e.name==='character_select').length,1);
});

test('all four tabs update every character link, preserve collection links and support keyboard navigation',async()=>{
  const r=pageRuntime();
  for(let i=0;i<r.tabs.length;i++){
    await r.tabs[i].emit('click');const key=r.tabs[i].dataset.character;
    assert.equal(r.nodes['#character-name'].textContent,people[key].name);
    assert.equal(r.nodes['#dossier'].getAttribute('aria-labelledby'),'tab-'+key);
    assert.equal(r.tabs.filter(tab=>tab.tabIndex===0).length,1);
    assert.equal(r.nodes['.character-more'].open,false);
    for(const link of r.assetLinks){
      const file=cards.asset(key,link.dataset.assetKind)||cards.collection(link.dataset.assetKind);
      assert.equal(link.href,file.href);assert.equal(link.download,file.filename);
      assert.equal(link.dataset.assetCharacter,file.character);
    }
  }
  await r.tabs[3].emit('keydown',{key:'ArrowRight'});assert.equal(r.tabs[0].focused,true);
  await r.tabs[0].emit('keydown',{key:'End'});assert.equal(r.tabs[3].tabIndex,0);
  await r.tabs[3].emit('keydown',{key:'Home'});assert.equal(r.tabs[0].tabIndex,0);
  assert.equal(r.nodes['.dossier-copy'].animated,undefined);
});

test('download events describe the exact selected file request, never a confirmed save',async()=>{
  const r=pageRuntime();await r.tabs[1].emit('click');
  for(const link of r.assetLinks)await link.emit('click');
  assert.deepEqual(r.events.filter(e=>e.name==='asset_download_clicked'),[
    {name:'asset_download_clicked',character:'rook',asset:'front',format:'png'},
    {name:'asset_download_clicked',character:'rook',asset:'back',format:'png'},
    {name:'asset_download_clicked',character:'rook',asset:'wallpaper',format:'png'},
    {name:'asset_download_clicked',character:'all',asset:'print_pdf',format:'pdf'},
    {name:'asset_download_clicked',character:'all',asset:'collection_zip',format:'zip'}
  ]);
  assert.match(r.nodes['#character-status'].textContent,/requested/);
  await r.tabs[2].emit('click');await r.assetLinks[0].emit('click');
  assert.equal(r.events.at(-1).character,'brick');
});

test('missing catalog hides potentially mismatched downloads while leaving browsing and watch available',async()=>{
  const r=pageRuntime({missingCatalog:true});
  assert.equal(r.nodes['#download-character'].hidden,true);
  assert.equal(r.nodes['#character-formats'].hidden,true);
  await r.tabs[2].emit('click');assert.equal(r.nodes['#character-name'].textContent,'BRICK');
  assert.match(r.nodes['#character-status'].textContent,/Reload to restore/);
  assert.equal(r.nodes['[data-watch-placement="character"]'].hidden,false);
});

test('cast watch navigation uses sanitized attribution and remains independent of download state',async()=>{
  const r=pageRuntime();await r.nodes['[data-watch-placement="character"]'].emit('click');
  assert.equal(r.nodes['[data-watch-placement="character"]'].href,'/saints-watch?video=episode&utm_source=instagram');
  assert.ok(r.events.some(e=>e.name==='click_watch'&&e.placement==='character'));
});

test('default artwork downloads, press and below-player next step exist without JavaScript',()=>{
  const html=read('saints-cast.html'),watch=read('saints-watch.html');
  assert.equal((html.match(/id="characters"/g)||[]).length,1);
  assert.match(html,/id="dossier" role="tabpanel" aria-labelledby="tab-nix" tabindex="0"/);
  assert.match(html,/Free character artwork · No sign-up/);
  assert.match(html,/id="character-status"[^>]*role="status"[^>]*aria-live="polite"/);
  for(const kind of ['front','back','wallpaper','print_pdf','collection_zip']){
    const file=cards.asset('nix',kind)||cards.collection(kind);
    assert.ok(html.includes('href="'+file.href+'" download="'+file.filename+'"'));
  }
  assert.match(html,/<a class="footer-press" href="\/saints-press">Press /);
  assert.match(watch,/<\/main><section class="watch-followup" aria-labelledby="watch-followup-title">/);
  assert.match(watch,/id="watch-characters" href="\/saints-of-bad-luck#characters"/);
  assert.doesNotMatch(watch.match(/<section class="watch-followup"[\s\S]*?<\/section>/)[0],/\shidden(?:[\s=>])|subscribe|sign.?up/i);
  assert.match(read('assets/saints/watch.css'),/#cinema:fullscreen\{height:100%;min-height:0\}/);
});


test('new download and follow-up links can wrap at narrow widths and enlarged text',()=>{
  assert.match(read('assets/saints/page.css'), /\.characters \.character-download\{[^}]*max-width:100%;white-space:normal/);
  assert.match(read('assets/saints/page.css'), /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(read('assets/saints/watch.css'), /\.watch-followup a\{[^}]*max-width:100%;[^}]*white-space:normal/);
});


test('landing separates name-only cast links from character descriptions and keeps real episode inventory',()=>{
  const landing=read('saints-of-bad-luck.html'),cast=read('saints-cast.html');
  assert.doesNotMatch(landing,/id="dossier"|id="character-bio"|id="download-character"/);
  assert.match(landing,/<a href="\/saints-cast">Cast<\/a>/);
  for(const key of ['nix','rook','brick','vernon'])assert.ok(landing.includes('/saints-cast?character='+key+'#characters'));
  assert.equal((landing.match(/class="episode (?:featured|next) reveal"/g)||[]).length,2);
  assert.match(landing,/<dt>Genre<\/dt><dd>Action · Sci-Fi · Dark Comedy<\/dd>/);
  assert.match(landing,/<dt>Season<\/dt><dd>1<\/dd>/);
  assert.match(landing,/<dt>Rating<\/dt><dd>Mature<\/dd>/);
  const clips=landing.match(/<section class="section clips-section"[\s\S]*?<\/section>/)[0];
  assert.match(clips,/href="\/saints-watch\?video=depot-gate"/);assert.match(clips,/href="\/saints-watch\?video=come-home"/);assert.match(clips,/>CLIP</);assert.doesNotMatch(clips,/<button|<video|<iframe|data-video/);
  const clipPage=read('saints-clips/depot-gate.html');assert.match(clipPage,/http-equiv="refresh"/);assert.match(clipPage,/saints-watch\?video=depot-gate/);assert.doesNotMatch(clipPage,/EPISODE 0|data-plan|purchase=|<script/);
  assert.match(cast,/<h1>Meet the cast\.<\/h1>/);
  assert.ok(read('scripts/dev-saints.js').includes("'/saints-cast.html'"));
});


test('cast deep links select a matching dossier and reject unknown keys',()=>{
  for(const key of ['nix','rook','brick','vernon']){
    const r=pageRuntime({search:'?character='+key});
    assert.equal(r.nodes['#character-name'].textContent,people[key].name);
    assert.equal(r.assetLinks[0].dataset.assetCharacter,key);
  }
  const r=pageRuntime({search:'?character=constructor'});
  assert.equal(r.tabs[0].getAttribute('aria-selected'),'true');
  assert.equal(r.assetLinks[0].dataset.assetCharacter,'nix');
  assert.equal(r.events.filter(e=>e.name==='character_select').length,0);
});
