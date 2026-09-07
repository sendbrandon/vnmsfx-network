(() => {
  const videos = Array.from(document.querySelectorAll('video'));
  videos.forEach(video => {
    video.addEventListener('play', () => {
      const next = video.parentElement.querySelector('.next-clip');
      if (next) next.hidden = true;
      videos.forEach(other => {
        if (other === video) return;
        other.pause();
        // Abort paused downloads so a long viewing session cannot exhaust media connections.
        // With preload="none", load() resets the short clip without downloading it again.
        if (other.readyState > 0 || other.networkState === HTMLMediaElement.NETWORK_LOADING) other.load();
      });
    });
    video.addEventListener('ended', () => {
      const next = video.parentElement.querySelector('.next-clip');
      if (next) next.hidden = false;
    });
    video.addEventListener('error', () => {
      const notice = video.parentElement.querySelector('.video-error');
      if (notice) notice.hidden = false;
    });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) videos.forEach(video => video.pause());
  });
  document.querySelectorAll('[data-play-clip]').forEach(link => {
    link.addEventListener('click', () => {
      const target = document.getElementById(link.dataset.playClip);
      const video = target && target.querySelector('video');
      if (video) video.play().catch(error => {
        // A newer click may have interrupted this play request. Do not pull the
        // visitor back to the old player after they have chosen another route.
        if (error.name !== 'AbortError' && document.activeElement === link) video.focus({ preventScroll: true });
      });
    });
  });
  const copy = document.querySelector('[data-copy-email]');
  const address = document.getElementById('brief-email');
  const status = document.querySelector('.copy-status');
  if (copy && address && status) {
    copy.hidden = false;
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(address.textContent.trim());
        status.textContent = 'Email address copied.';
      } catch (error) {
        status.textContent = 'Copy is unavailable here. Select the email address above, or tap Email Brandon.';
      }
    });
  }
})();
