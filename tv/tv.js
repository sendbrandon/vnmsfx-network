(() => {
  const videos = Array.from(document.querySelectorAll('video'));
  videos.forEach(video => {
    video.addEventListener('play', () => {
      videos.forEach(other => { if (other !== video) other.pause(); });
    });
    video.addEventListener('error', () => {
      const notice = video.parentElement.querySelector('.video-error');
      if (notice) notice.hidden = false;
    });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) videos.forEach(video => video.pause());
  });
  const firstPlay = document.querySelector('[data-play-first]');
  if (firstPlay && videos[0]) firstPlay.addEventListener('click', () => {
    videos[0].play().catch(() => { videos[0].focus(); });
  });
})();
