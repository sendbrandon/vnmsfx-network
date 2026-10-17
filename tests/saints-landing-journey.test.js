const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function fixture(){
 const hero={},watch={},play={disabled:false},bar={hidden:true};let dialogOpen=false,intersection,mutation;
 const events={};const document={activeElement:null,fullscreenElement:null,
  querySelector:s=>({'.mobile-watch-bar':bar,'.hero':hero,'#watch':watch,'.hero [data-video="episode"]':play}[s]??(s==='dialog[open]'&&dialogOpen?{}:null)),
  querySelectorAll:()=>[{}],addEventListener:(name,fn)=>events[name]=fn};
 const window={IntersectionObserver:true};
 vm.runInNewContext(fs.readFileSync('assets/saints/landing-experience.js','utf8'),{document,window,queueMicrotask:fn=>fn(),
  IntersectionObserver:class{constructor(fn){intersection=fn;}observe(){}},MutationObserver:class{constructor(fn){mutation=fn;}observe(){}}});
 return {bar,play,document,events,intersect:(h,w)=>intersection([{target:hero,isIntersecting:h},{target:watch,isIntersecting:w}]),change:()=>mutation(),dialog:v=>{dialogOpen=v;mutation();}};
}
test('mobile watch prompt appears only away from hero and available episode controls',()=>{
 const f=fixture();assert.equal(f.bar.hidden,true);
 f.intersect(false,true);assert.equal(f.bar.hidden,true);
 f.intersect(false,false);assert.equal(f.bar.hidden,false);
 f.play.disabled=true;f.change();assert.equal(f.bar.hidden,true);
 f.play.disabled=false;f.change();assert.equal(f.bar.hidden,false);
 f.intersect(true,false);assert.equal(f.bar.hidden,true);
});
test('forms, dialogs and fullscreen suppress the watch prompt and restore it afterwards',()=>{
 const f=fixture();f.intersect(false,false);
 f.dialog(true);assert.equal(f.bar.hidden,true);f.dialog(false);assert.equal(f.bar.hidden,false);
 f.document.activeElement={closest:()=>({})};f.events.focusin();assert.equal(f.bar.hidden,true);
 f.document.activeElement=null;f.events.focusout();assert.equal(f.bar.hidden,false);
 f.document.fullscreenElement={};f.events.fullscreenchange();assert.equal(f.bar.hidden,true);
 f.document.fullscreenElement=null;f.events.fullscreenchange();assert.equal(f.bar.hidden,false);
});
