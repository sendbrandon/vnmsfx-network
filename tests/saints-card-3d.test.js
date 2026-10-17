const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const cards=require('../assets/saints/character-cards.js');
function runtime(reduce=false){
 const nodes={},frames=new Map();let now=0,next=0;
 function node(selector){return nodes[selector]??={style:{setProperty(k,v){this[k]=v;}},attrs:{},events:{},classList:{add(){},remove(){}},setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,fn){this.events[k]=fn;},querySelector:node,setPointerCapture(){},contains(){return false;},textContent:''};}
 const host=node('[data-card-viewer]'),window={SaintsCards:cards};
 const motion={matches:reduce,addEventListener(k,fn){this.change=fn;}};
 const document={hidden:false,events:{},addEventListener(k,fn){this.events[k]=fn;},querySelector:s=>s==='[data-card-viewer]'?host:{dataset:{character:'nix'}}};
 vm.runInNewContext(fs.readFileSync('assets/saints/card-3d.js','utf8'),{window,document,matchMedia:()=>motion,performance:{now:()=>now},requestAnimationFrame:fn=>(frames.set(++next,fn),next),cancelAnimationFrame:id=>frames.delete(id)});
 function advance(ms){for(let left=ms;left>0;left-=16){now+=Math.min(16,left);const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(now));}}
 const pose=()=>{const s=node('.crew-card-rotor').style.transform;return {yaw:Number(s.match(/rotateY\(([-.\d]+)/)[1]),pitch:Number(s.match(/rotateX\(([-.\d]+)/)[1])};};
 return {nodes,window,document,motion,host,pose,advance,frames,click:s=>node(s).events.click()};
}
test('switching characters updates paired original assets and resets both axes',()=>{
 const r=runtime();r.click('[data-card-back]');r.advance(2200);
 assert.equal(r.nodes['.crew-card-status'].textContent,'Nix · Back');
 r.window.SaintsCard3D.select('rook');
 assert.match(r.nodes['.crew-card-photo'].src,/rook-portrait-v2.png$/);
 assert.match(r.nodes.img.src,/02-rook-back-v4.png$/);
 assert.deepEqual(r.pose(),{yaw:0,pitch:0});
 r.window.SaintsCard3D.select('../unknown');assert.equal(r.nodes['.crew-card-status'].textContent,'Rook · Front');
});
test('front and back controls settle on a readable face with correct accessibility visibility',()=>{
 const r=runtime();r.click('[data-card-back]');r.advance(2200);
 assert.equal(r.nodes['.crew-card-front'].attrs['aria-hidden'],'true');
 assert.equal(r.nodes['.crew-card-back'].attrs['aria-hidden'],'false');
 r.click('[data-card-front]');r.advance(2200);
 assert.equal(r.nodes['.crew-card-status'].textContent,'Nix · Front');assert.equal(r.pose().pitch,0);
});
test('idle rotates through 360 degrees and a grab stops it without jumping',()=>{
 const r=runtime();r.advance(17000);assert.ok(r.pose().yaw>360);
 const before=r.pose();r.nodes['.crew-card-stage'].events.pointerdown({button:0,pointerId:1,clientX:0,clientY:0,timeStamp:17000});
 r.advance(500);assert.deepEqual(r.pose(),before);
});
test('drag supports both axes, flick momentum and a friction stop into a readable view',()=>{
 const r=runtime(),s=r.nodes['.crew-card-stage'];
 s.events.pointerdown({button:0,pointerId:2,clientX:0,clientY:0,timeStamp:0});
 s.events.pointermove({pointerId:2,clientX:140,clientY:80,timeStamp:100});
 assert.ok(r.pose().yaw>0);assert.ok(r.pose().pitch<0);
 const before=r.pose().yaw;s.events.pointerup({type:'pointerup',pointerId:2,timeStamp:110});r.advance(160);
 assert.ok(r.pose().yaw>before);r.advance(3000);assert.ok(Math.abs(r.pose().pitch)<.1);
});
test('pause stops idle; reduced motion disables animation but preserves side controls',()=>{
 const r=runtime();r.advance(1500);r.click('[data-card-spin]');const before=r.pose();r.advance(3000);assert.deepEqual(r.pose(),before);
 r.host.events.focusin();r.host.events.pointerenter();r.click('[data-card-spin]');r.advance(1000);assert.ok(r.pose().yaw>before.yaw);
 const reduced=runtime(true);assert.equal(reduced.nodes['[data-card-spin]'].disabled,true);assert.equal(reduced.frames.size,0);
 reduced.click('[data-card-back]');assert.equal(reduced.nodes['.crew-card-status'].textContent,'Nix · Back');assert.equal(reduced.frames.size,0);
});
test('keyboard tilt, pointer cancellation and hidden documents do not leave runaway motion',()=>{
 const r=runtime(),s=r.nodes['.crew-card-stage'];let prevented=false;
 s.events.keydown({key:'ArrowUp',preventDefault(){prevented=true;}});r.advance(2000);assert.ok(r.pose().pitch<0);assert.ok(prevented);
 s.events.pointerdown({button:0,pointerId:2,clientX:0,clientY:0,timeStamp:2000});s.events.pointercancel({type:'pointercancel',pointerId:2,timeStamp:2020});r.advance(2000);assert.ok(Math.abs(r.pose().pitch)<.1);
 r.document.hidden=true;r.document.events.visibilitychange();assert.equal(r.frames.size,0);
 const pose=r.pose();r.advance(30000);assert.deepEqual(r.pose(),pose);
});
