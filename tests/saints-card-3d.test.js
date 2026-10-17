const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const cards=require('../assets/saints/character-cards.js');
function runtime(reduce=false){
 const nodes={};
 function node(selector){return nodes[selector]??=( {style:{},attrs:{},events:{},classList:{add(){},remove(){}},setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];},addEventListener(k,fn){this.events[k]=fn;},querySelector:node,setPointerCapture(){},textContent:''} );}
 const host=node('[data-card-viewer]');let pending;
 const window={SaintsCards:cards};
 const context={window,document:{querySelector:s=>s==='[data-card-viewer]'?host:{dataset:{character:'nix'}}},matchMedia:()=>({matches:reduce,addEventListener(){}}),setTimeout:fn=>(pending=fn,1),clearTimeout:()=>{pending=null;}};
 vm.runInNewContext(fs.readFileSync('assets/saints/card-3d.js','utf8'),context);
 return {nodes,window,click:s=>node(s).events.click(),finish:()=>pending?.()};
}
test('switching characters updates both faces and resets the previous reverse view',()=>{
 const r=runtime();r.click('[data-card-back]');
 assert.equal(r.nodes['.crew-card-front'].attrs['aria-hidden'],'true');
 r.window.SaintsCard3D.select('rook');
 assert.match(r.nodes['.crew-card-photo'].src,/rook-portrait-v2.png$/);
 assert.match(r.nodes['img'].src,/02-rook-back-v4.png$/);
 assert.equal(r.nodes['.crew-card-status'].textContent,'Rook · Front');
 assert.equal(r.nodes['.crew-card-rotor'].style.transform,'rotateY(0deg)');
 r.window.SaintsCard3D.select('../unknown');
 assert.equal(r.nodes['.crew-card-status'].textContent,'Rook · Front');
});
test('back and front controls expose only the intended face to assistive technology',()=>{
 const r=runtime();r.click('[data-card-back]');
 assert.equal(r.nodes['.crew-card-back'].attrs['aria-hidden'],'false');
 assert.equal(r.nodes['.crew-card-status'].textContent,'Nix · Back');
 r.click('[data-card-front]');
 assert.equal(r.nodes['.crew-card-back'].attrs['aria-hidden'],'true');
 assert.equal(r.nodes['.crew-card-status'].textContent,'Nix · Front');
});
test('a spin completes on the front and reduced motion turns sides without animation',()=>{
 const r=runtime();r.click('[data-card-spin]');r.finish();
 assert.equal(r.nodes['.crew-card-status'].textContent,'Nix · Front');
 const reduced=runtime(true);reduced.click('[data-card-spin]');
 assert.equal(reduced.nodes['.crew-card-status'].textContent,'Nix · Back');
 assert.equal(reduced.nodes['.crew-card-rotor'].style.transition,'none');
});
test('keyboard and pointer cancellation settle the card on a readable face',()=>{
 const r=runtime(),s=r.nodes['.crew-card-stage'];let prevented=false;
 s.events.keydown({key:'ArrowRight',preventDefault(){prevented=true;}});
 assert.equal(prevented,true);assert.equal(r.nodes['.crew-card-status'].textContent,'Nix · Back');
 s.events.pointerdown({button:0,pointerId:2,clientX:0});
 s.events.pointermove({pointerId:2,clientX:230});s.events.pointercancel({pointerId:2});
 assert.equal(r.nodes['.crew-card-rotor'].style.transform,'rotateY(360deg)');
 assert.equal(r.nodes['.crew-card-status'].textContent,'Nix · Front');
});
