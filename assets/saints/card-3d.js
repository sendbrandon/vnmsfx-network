/* Two-sided collectible viewer. Original portraits and card backs remain unchanged. */
(function(){
  'use strict';
  const host=document.querySelector('[data-card-viewer]');
  if(!host||!window.SaintsCards)return;
  const rotor=host.querySelector('.crew-card-rotor');
  const stage=host.querySelector('.crew-card-stage');
  const front=host.querySelector('.crew-card-front');
  const back=host.querySelector('.crew-card-back');
  const status=host.querySelector('.crew-card-status');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const quotes={nix:'he used to take orders. now he’s the fucking problem.',rook:'she makes powerful men feel powerless.',brick:'the gorilla has a conscience. that complicates things.',vernon:'he has an army because he can’t handle an argument.'};
  const names={nix:'Nix',rook:'Rook',brick:'Brick',vernon:'Vernon Voss'};
  const ids={nix:'01',rook:'02',brick:'03',vernon:'04'};
  let angle=0,drag=null,timer=null,key='nix';
  function render(animate=true){
    rotor.style.transition=animate&&!reduced.matches?'transform 700ms cubic-bezier(.22,.7,.25,1)':'none';
    rotor.style.transform='rotateY('+angle+'deg)';
    const isBack=((angle%360)+360)%360>90&&((angle%360)+360)%360<270;
    front.setAttribute('aria-hidden',String(isBack));back.setAttribute('aria-hidden',String(!isBack));
    const label=names[key]+' · '+(isBack?'Back':'Front');
    if(status.textContent!==label)status.textContent=label;
  }
  function stop(){clearTimeout(timer);timer=null;host.removeAttribute('data-spinning');}
  function select(character){
    if(!Object.hasOwn(names,character))return;
    stop();drag=null;key=character;angle=0;
    host.querySelector('.crew-card-photo').src='/assets/saints/cast-headshots/v2/'+key+'-portrait-v2.png';
    host.querySelector('.crew-card-name').textContent=names[key];
    host.querySelector('.crew-card-number').textContent=ids[key]+' / 04';
    host.querySelector('.crew-card-quote').textContent=quotes[key];
    back.querySelector('img').src=window.SaintsCards.asset(key,'back').href;
    back.querySelector('img').alt=names[key]+' collectible card back';
    stage.setAttribute('aria-label',names[key]+' two-sided collectible card. Use arrow keys to rotate.');
    render(false);
  }
  host.querySelector('[data-card-front]').addEventListener('click',()=>{stop();angle=Math.round(angle/360)*360;render();});
  host.querySelector('[data-card-back]').addEventListener('click',()=>{stop();angle=Math.round((angle-180)/360)*360+180;render();});
  host.querySelector('[data-card-spin]').addEventListener('click',()=>{
    stop();if(reduced.matches){angle+=180;render(false);return;}
    host.setAttribute('data-spinning','');angle=Math.ceil(angle/360)*360+360;
    rotor.style.transition='transform 2200ms cubic-bezier(.35,.05,.2,1)';rotor.style.transform='rotateY('+angle+'deg)';
    timer=setTimeout(()=>{host.removeAttribute('data-spinning');render(false);timer=null;},2250);
  });
  stage.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();stop();angle=e.key==='Home'?0:e.key==='End'?180:angle+(e.key==='ArrowLeft'?-180:180);render();});
  stage.addEventListener('pointerdown',e=>{if(e.button!==0)return;stop();drag={id:e.pointerId,x:e.clientX,angle};stage.setPointerCapture(e.pointerId);stage.classList.add('dragging');});
  stage.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;angle=drag.angle+(e.clientX-drag.x)*.75;render(false);});
  function end(e){if(!drag||drag.id!==e.pointerId)return;drag=null;stage.classList.remove('dragging');angle=Math.round(angle/180)*180;render();}
  stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);stage.addEventListener('lostpointercapture',end);
  reduced.addEventListener('change',()=>{stop();angle=Math.round(angle/180)*180;render(false);});
  window.SaintsCard3D=Object.freeze({select});select(document.querySelector('[data-character][aria-selected="true"]')?.dataset.character||'nix');
})();
