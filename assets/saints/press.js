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
