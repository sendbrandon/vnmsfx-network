/* Interactive coated-card presentation. Source portraits and card backs are unchanged. */
(function(){
  'use strict';
  const host=document.querySelector('[data-card-viewer]');
  if(!host||!window.SaintsCards)return;
  const $=s=>host.querySelector(s),rotor=$('.crew-card-rotor'),stage=$('.crew-card-stage');
  const front=$('.crew-card-front'),back=$('.crew-card-back'),status=$('.crew-card-status'),spin=$('[data-card-spin]');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const quotes={nix:'he used to take orders. now he’s the fucking problem.',rook:'she makes powerful men feel powerless.',brick:'the gorilla has a conscience. that complicates things.',vernon:'he has an army because he can’t handle an argument.'};
  const names={nix:'Nix',rook:'Rook',brick:'Brick',vernon:'Vernon Voss'},ids={nix:'01',rook:'02',brick:'03',vernon:'04'};
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  let key='nix',yaw=0,pitch=0,vy=0,vp=0,lift=0,drag=null,mode='hold',targetY=0,targetP=0;
  let auto=!reduced.matches,hover=false,focus=false,visible=typeof IntersectionObserver==='undefined',frameId=0,last=0,dwell=0,elapsed=0,idlePhase=0,idleBase=0;
  function render(){
    rotor.style.transform='translate3d(0,'+(-lift*9).toFixed(2)+'px,'+(lift*24).toFixed(2)+'px) rotateX('+pitch.toFixed(3)+'deg) rotateY('+yaw.toFixed(3)+'deg)';
    const facing=Math.cos(yaw*Math.PI/180)*Math.cos(pitch*Math.PI/180)>=0;
    front.setAttribute('aria-hidden',String(!facing));back.setAttribute('aria-hidden',String(facing));
    const label=names[key]+' · '+(facing?'Front':'Back');if(status.textContent!==label)status.textContent=label;
    // The reflection follows surface orientation; only a small printed relief is used.
    stage.style.setProperty('--light-x',(50+Math.sin(yaw*Math.PI/180)*36).toFixed(2)+'%');
    stage.style.setProperty('--light-y',(35+pitch*.45).toFixed(2)+'%');
    stage.style.setProperty('--sheen',(.035+Math.abs(Math.sin(yaw*Math.PI/180))*.09).toFixed(3));
    stage.style.setProperty('--shadow-x',(Math.sin(yaw*Math.PI/180)*15).toFixed(2)+'px');
    stage.style.setProperty('--shadow-scale',(1-lift*.12-Math.abs(Math.sin(yaw*Math.PI/180))*.2).toFixed(3));
    stage.style.setProperty('--shadow-blur',(14+lift*11).toFixed(2)+'px');
    stage.style.setProperty('--relief-x',(Math.sin(yaw*Math.PI/180)*1.2).toFixed(2)+'px');
    stage.style.setProperty('--relief-y',(-pitch*.025).toFixed(2)+'px');
    const spinLabel=reduced.matches?'Motion reduced':auto?'Pause rotation':'Resume rotation';
    if(spin.textContent!==spinLabel)spin.textContent=spinLabel;
    spin.disabled=reduced.matches;spin.setAttribute('aria-pressed',String(auto&&!reduced.matches));
  }
  function wake(){if(!frameId&&visible&&!document.hidden&&!reduced.matches){last=performance.now();frameId=requestAnimationFrame(tick);}}
  function settle(y= Math.round(yaw/180)*180,p=0){targetY=y;targetP=p;vy=vp=0;mode='settle';dwell=0;
    if(reduced.matches){yaw=y;pitch=p;mode='hold';render();}else wake();}
  function startIdle(){
    idleBase=Math.round(yaw/360)*360;
    const phase=Math.asin(clamp((yaw-idleBase)/20,-1,1));
    idlePhase=Math.cos(idlePhase)<0?Math.PI-phase:phase;mode='idle';
  }
  function tick(now){
    frameId=0;if(!visible||document.hidden||reduced.matches)return;
    const dt=clamp((now-last)/1000,0,.04);last=now;elapsed+=dt;
    lift+=(Number(!!drag)-lift)*(1-Math.exp(-dt*13));
    if(mode==='idle'){
      if(!auto||hover||focus){mode='hold';dwell=0;}else{idlePhase+=dt*1.25;yaw=idleBase+20*Math.sin(idlePhase);pitch+=(-7+Math.sin(elapsed*.65)*1.5-pitch)*(1-Math.exp(-dt*3));}
    }else if(mode==='coast'){
      yaw+=vy*dt;pitch=clamp(pitch+vp*dt,-70,70);const friction=Math.exp(-dt*4.2);vy*=friction;vp*=friction;
      if(Math.abs(vy)+Math.abs(vp)<7)settle();
    }else if(mode==='settle'){
      vy+=((targetY-yaw)*85-vy*19)*dt;vp+=((targetP-pitch)*85-vp*19)*dt;
      yaw+=vy*dt;pitch+=vp*dt;
      if(Math.abs(targetY-yaw)+Math.abs(targetP-pitch)+Math.abs(vy)+Math.abs(vp)<.12){yaw=targetY;pitch=targetP;vy=vp=0;mode='hold';dwell=0;}
    }else if(mode==='hold'&&auto&&!hover&&!focus&&!drag){dwell+=dt;if(dwell>3.5&&Math.abs(yaw-Math.round(yaw/360)*360)<=20){startIdle();}}
    render();
    if(mode!=='hold'||(auto&&!hover&&!focus)||lift>.002)wake();
  }
  function select(character){
    if(!Object.hasOwn(names,character))return;
    drag=null;stage.classList.remove('dragging');key=character;yaw=pitch=vy=vp=lift=0;mode='hold';dwell=2.7;idlePhase=idleBase=0;
    $('.crew-card-photo').src='/assets/saints/cast-headshots/v2/'+key+'-portrait-v2.png';
    $('.crew-card-name').textContent=key==='vernon'?'Vernon':names[key];$('.crew-card-number').textContent=ids[key]+' / 04';$('.crew-card-quote').textContent=quotes[key];
    back.querySelector('img').src=window.SaintsCards.asset(key,'back').href;back.querySelector('img').alt=names[key]+' collectible card back';
    stage.setAttribute('aria-label',names[key]+' two-sided card. Drag in any direction, or use arrow keys to turn and tilt.');render();wake();
  }
  $('[data-card-front]').addEventListener('click',()=>settle(Math.round(yaw/360)*360));
  $('[data-card-back]').addEventListener('click',()=>settle(Math.round((yaw-180)/360)*360+180));
  spin.addEventListener('click',()=>{if(reduced.matches)return;auto=!auto;if(auto){hover=false;focus=false;}if(auto){if(Math.abs(yaw-Math.round(yaw/360)*360)>20)settle(Math.round(yaw/360)*360);else startIdle();}else mode='hold';dwell=0;render();wake();});
  host.addEventListener('pointerenter',()=>{hover=true;if(mode==='idle')mode='hold';render();});
  host.addEventListener('pointerleave',()=>{hover=false;dwell=0;wake();});
  host.addEventListener('focusin',()=>{focus=true;if(mode==='idle')mode='hold';});
  host.addEventListener('focusout',e=>{focus=host.contains(e.relatedTarget);if(!focus){dwell=0;wake();}});
  stage.addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))return;e.preventDefault();
    const y=e.key==='Home'?Math.round(yaw/360)*360:e.key==='End'?Math.round((yaw-180)/360)*360+180:yaw+(e.key==='ArrowLeft'?-30:e.key==='ArrowRight'?30:0);
    const p=e.key==='Home'||e.key==='End'?0:clamp(pitch+(e.key==='ArrowUp'?-20:e.key==='ArrowDown'?20:0),-70,70);settle(y,p);
  });
  stage.addEventListener('pointerdown',e=>{if(e.button!==0)return;mode='drag';vy=vp=0;drag={id:e.pointerId,x:e.clientX,y:e.clientY,t:e.timeStamp};stage.setPointerCapture(e.pointerId);stage.classList.add('dragging');wake();});
  stage.addEventListener('pointermove',e=>{
    if(!drag||drag.id!==e.pointerId)return;
    const dt=Math.max((e.timeStamp-drag.t)/1000,.008),dy=(e.clientX-drag.x)*.55,dp=-(e.clientY-drag.y)*.4;
    yaw+=dy;pitch=clamp(pitch+dp,-70,70);vy=clamp(vy*.35+dy/dt*.65,-650,650);vp=clamp(vp*.35+dp/dt*.65,-240,240);
    drag={id:e.pointerId,x:e.clientX,y:e.clientY,t:e.timeStamp};render();
  });
  function release(e){if(!drag||drag.id!==e.pointerId)return;const cancelled=e.type==='pointercancel'||e.type==='lostpointercapture';
    if(cancelled||e.timeStamp-drag.t>100)vy=vp=0;drag=null;stage.classList.remove('dragging');
    if(reduced.matches){mode='hold';lift=0;render();}else if(cancelled||Math.abs(vy)+Math.abs(vp)<7)settle();else{mode='coast';wake();}
  }
  stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('lostpointercapture',release);
  reduced.addEventListener('change',()=>{cancelAnimationFrame(frameId);frameId=0;drag=null;stage.classList.remove('dragging');auto=!reduced.matches;lift=0;settle();render();wake();});
  document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(frameId);frameId=0;wake();});
  if(typeof IntersectionObserver!=='undefined'){const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible){cancelAnimationFrame(frameId);frameId=0;}else wake();},{threshold:.1});observer.observe(stage);}
  window.SaintsCard3D=Object.freeze({select});select(document.querySelector('[data-character][aria-selected="true"]')?.dataset.character||'nix');
})();
