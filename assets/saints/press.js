'use strict';
const fullscreen=document.querySelector('#press-fullscreen');
fullscreen.addEventListener('click',async()=>{const film=document.querySelector('#press-film'),frame=document.querySelector('#youtube-player iframe');try{if(frame)await frame.requestFullscreen();else if(film.webkitEnterFullscreen)film.webkitEnterFullscreen();else await film.requestFullscreen();}catch{document.querySelector('#playback-status').textContent='Use the player’s full-screen control.';}});
(async()=>{
 const film=document.querySelector('#press-film'),placeholder=document.querySelector('#playback-placeholder'),status=document.querySelector('#playback-status');
 try{
  const configResponse=await fetch('/assets/saints/press-video.json',{cache:'no-store'});
  if(!configResponse.ok)throw Error('config');
  const config=await configResponse.json();
  if(config.youtubeId&&/^[A-Za-z0-9_-]{11}$/.test(config.youtubeId)){
   const frame=document.createElement('iframe');frame.title='Saints of Bad Luck — Get Her Back';frame.src=`https://www.youtube-nocookie.com/embed/${config.youtubeId}?rel=0`;frame.allow='fullscreen; picture-in-picture; encrypted-media';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';document.querySelector('#youtube-player').append(frame);document.querySelector('#youtube-player').hidden=false;placeholder.hidden=true;fullscreen.disabled=false;return;
  }
  const readiness=await fetch('/api/saints');if(!readiness.ok)throw Error('unavailable');
  if(!(await readiness.json()).playbackReady)throw Error('unavailable');
  const response=await fetch('/api/saints?action=playback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({episode:'saints-01'})});
  const playback=await response.json();if(!response.ok||!playback.url)throw Error('unavailable');
  film.hidden=false;placeholder.hidden=true;fullscreen.disabled=false;window.SaintsPlayback.attach(film,playback.url);
  film.addEventListener('error',()=>{film.hidden=true;placeholder.hidden=false;fullscreen.disabled=true;status.textContent='Playback is temporarily unavailable. Please try again shortly.'});
 }catch{status.textContent='The film player is not connected yet. Please check back shortly.'}
})();

// Reveal only supporting content; never animate or obscure the film player.
if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&'IntersectionObserver' in window){
 const reveal=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('press-enter');reveal.unobserve(entry.target);}}},{threshold:.12});
 document.querySelectorAll('.intro>div,.intro>aside,.artwork>div,.artwork>a').forEach(el=>reveal.observe(el));
}


// Press hero: muted autoplay loop, no sound control. Reduced motion: hold the poster, show controls.
(()=>{const v=document.querySelector('.hero-video');if(!v)return;if(matchMedia('(prefers-reduced-motion: reduce)').matches){v.removeAttribute('autoplay');v.pause();v.controls=true;}})();
// Keep the hero playing whenever it is on screen (browsers pause muted autoplay off-screen or in background tabs).
(()=>{const v=document.querySelector('.hero-video');if(!v||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 let onScreen=true;const go=()=>{if(onScreen&&document.visibilityState==='visible'&&v.paused)v.play().catch(()=>{});};
 if('IntersectionObserver' in window)new IntersectionObserver(e=>{onScreen=e[0].isIntersecting;onScreen?go():v.pause();},{threshold:.2}).observe(v);
 document.addEventListener('visibilitychange',go);v.addEventListener('canplay',go,{once:true});go();
})();
// Full-bleed 9:16 on any screen: the crop keeps each character's face (measured from the cut) at ~44% of the window height,
// easing through the dissolves, so the framing holds from phones to ultra-wide monitors.
(()=>{const v=document.querySelector('.hero-video');if(!v)return;
 const keys=[[0,.25],[4.54,.25],[5.04,.355],[9.08,.355],[9.58,.235],[99,.235]];  // [seconds, face centre as a fraction of video height]: Nix, Rook, Brick
 const faceAt=t=>{for(let i=1;i<keys.length;i++){const[a,fa]=keys[i-1],[b,fb]=keys[i];if(t<=b){const u=Math.min(1,Math.max(0,(t-a)/(b-a))),e=u*u*(3-2*u);return fa+(fb-fa)*e;}}return keys[keys.length-1][1];};
 let last='';const tick=()=>{const W=v.clientWidth,H=v.clientHeight,vh=W*16/9;let y=50;
  if(vh>H+1){const top=faceAt(v.currentTime)*vh-.44*H;y=Math.min(100,Math.max(0,top/(vh-H)*100));}
  const pos=`50% ${y.toFixed(1)}%`;if(pos!==last){v.style.objectPosition=pos;last=pos;}requestAnimationFrame(tick);};requestAnimationFrame(tick);
})();
