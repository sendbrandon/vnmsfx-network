'use strict';
(async()=>{
 const film=document.querySelector('#press-film'),placeholder=document.querySelector('#playback-placeholder'),status=document.querySelector('#playback-status');
 try{
  const configResponse=await fetch('/assets/saints/press-video.json',{cache:'no-store'});
  if(!configResponse.ok)throw Error('config');
  const config=await configResponse.json();
  if(config.youtubeId&&/^[A-Za-z0-9_-]{11}$/.test(config.youtubeId)){
   const frame=document.createElement('iframe');frame.title='Saints of Bad Luck — Get Her Back';frame.src=`https://www.youtube-nocookie.com/embed/${config.youtubeId}?rel=0`;frame.allow='fullscreen; picture-in-picture; encrypted-media';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';document.querySelector('#youtube-player').append(frame);document.querySelector('#youtube-player').hidden=false;placeholder.hidden=true;return;
  }
  const readiness=await fetch('/api/saints');if(!readiness.ok)throw Error('unavailable');
  if(!(await readiness.json()).playbackReady)throw Error('unavailable');
  const response=await fetch('/api/saints?action=playback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({episode:'saints-01'})});
  const playback=await response.json();if(!response.ok||!playback.url)throw Error('unavailable');
  film.hidden=false;placeholder.hidden=true;window.SaintsPlayback.attach(film,playback.url);
  film.addEventListener('error',()=>{film.hidden=true;placeholder.hidden=false;status.textContent='Playback is temporarily unavailable. Please email Brandon for a viewing link.'});
 }catch{status.textContent='Viewing link coming soon. Contact Brandon below for access.'}
})();
