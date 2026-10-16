(function () {
  'use strict';
  const film = document.querySelector('#film');
  const cinema = document.querySelector('#cinema');
  const message = document.querySelector('#watch-message');
  const nextEpisode = document.querySelector('#next-episode');
  if (!film || !cinema || cinema.dataset.watchInitialized) return;
  cinema.dataset.watchInitialized = 'true';
  const characterLink = document.querySelector('#watch-characters');
  if (characterLink && window.SaintsAnalytics?.charactersUrl) {
    characterLink.href = window.SaintsAnalytics.charactersUrl();
    characterLink.addEventListener('click', () => { characterLink.href = window.SaintsAnalytics.charactersUrl(); });
  }

  // Fixed public clip catalog: never accept a media URL from the query string.
  const clips = Object.freeze({
    'depot-gate': { title: 'The Depot Gate', src: '/assets/saints/clips/depot-gate/the-depot-gate-web-v1.mp4', poster: '/assets/saints/clips/depot-gate/the-depot-gate-poster-v1.jpg' },
    'come-home': { title: 'Road Fight · Come Home', src: '/assets/saints/clips/come-home/come-home-web-v1.mp4', poster: '/assets/saints/clips/come-home/come-home-poster-v3.jpg' }
  });
  const requestedVideo = new URLSearchParams(location.search).get('video');
  const clip = Object.prototype.hasOwnProperty.call(clips, requestedVideo) ? clips[requestedVideo] : null;
  const trailer = requestedVideo === 'trailer';
  const video = clip ? requestedVideo : trailer ? 'trailer' : 'episode';
  document.querySelector('#watch-title').textContent = clip ? 'Clip · ' + clip.title : trailer ? 'Saints of Bad Luck · Trailer' : 'Episode 1 · Get Her Back';
  if (clip) {
    const back = document.querySelector('.watch-toolbar a');
    if (back) { back.href = '/saints-of-bad-luck#clips'; back.textContent = '← Clips'; }
    film.poster = clip.poster;
  }
  let hideTimer;
  let progressTimer;
  let youtubePlayer;
  let youtubePlaying = false;
  let usingYouTube = false;
  let pageActive = true;
  let started = false;
  const milestones = new Set();

  function track(name) {
    try {
      if (window.SaintsAnalytics) window.SaintsAnalytics.track(name, { video, player: usingYouTube ? 'youtube' : 'native' });
    } catch (error) { /* Playback never depends on analytics. */ }
  }

  function controls() {
    document.body.classList.add('show-controls');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => document.body.classList.remove('show-controls'), 2600);
  }

  function playing() {
    message.hidden = true;
    nextEpisode.hidden = true;
    document.body.classList.add('playing');
    controls();
    if (!started) {
      started = true;
      track('video_start');
    }
  }

  function progress(position, duration) {
    if (!started || !Number.isFinite(position) || !Number.isFinite(duration) || duration <= 0 || position < 0) return;
    // These are playhead milestones, not proof that every preceding second was watched.
    [25, 50, 75].forEach(percent => {
      if (position / duration >= percent / 100 && !milestones.has(percent)) {
        milestones.add(percent);
        track('video_' + percent);
      }
    });
  }

  function ended() {
    document.body.classList.remove('playing');
    if (started && !milestones.has('complete')) {
      milestones.add('complete');
      track('video_complete');
    }
    if (!trailer && !clip && nextEpisode.hidden) {
      nextEpisode.hidden = false;
      document.querySelector('#next-title').focus();
    }
  }

  function stopProgress() {
    clearInterval(progressTimer);
    progressTimer = undefined;
  }

  function sampleYouTube() {
    if (!youtubePlayer || !youtubePlaying || !pageActive) return;
    try { progress(youtubePlayer.getCurrentTime(), youtubePlayer.getDuration()); } catch (error) { /* API may be unavailable. */ }
  }

  function startProgress() {
    stopProgress();
    if (!pageActive || !youtubePlaying) return;
    sampleYouTube();
    progressTimer = setInterval(sampleYouTube, 1000);
  }

  function youtubeState(event) {
    // Official YouTube PlayerState values: ENDED=0, PLAYING=1, PAUSED=2, BUFFERING=3.
    youtubePlaying = event.data === 1;
    if (youtubePlaying) {
      playing();
      startProgress();
    } else {
      stopProgress();
      document.body.classList.remove('playing');
      if (event.data === 0) ended();
    }
  }

  function connectYouTube(frame) {
    let connected = false;
    function connect() {
      if (connected || !window.YT || typeof window.YT.Player !== 'function') return;
      connected = true;
      try {
        youtubePlayer = new window.YT.Player(frame, {
          events: {
            onReady(event) {
              youtubePlayer = event.target;
              try { youtubeState({ data: youtubePlayer.getPlayerState() }); } catch (error) { /* Keep native iframe controls. */ }
            },
            onStateChange: youtubeState,
            onError() {
              youtubePlaying = false;
              stopProgress();
              document.body.classList.remove('playing');
              message.textContent = 'If the film cannot play, please go back and try again.';
              message.hidden = false;
            }
          }
        });
      } catch (error) { /* The existing iframe remains usable without the API. */ }
    }
    if (window.YT && typeof window.YT.Player === 'function') {
      connect();
      return;
    }
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      try { if (typeof previousReady === 'function') previousReady(); } finally { connect(); }
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      // Failure intentionally leaves the ordinary privacy-enhanced embed usable.
      document.head.append(script);
    }
  }

  cinema.addEventListener('pointermove', controls);
  cinema.addEventListener('pointerdown', controls);
  document.addEventListener('keydown', controls);
  film.addEventListener('playing', () => { if (!usingYouTube) playing(); });
  film.addEventListener('pause', () => { if (!usingYouTube) document.body.classList.remove('playing'); });
  film.addEventListener('timeupdate', () => {
    if (!usingYouTube && pageActive && !film.paused && !film.seeking) progress(film.currentTime, film.duration);
  });
  film.addEventListener('ended', () => { if (!usingYouTube) ended(); });
  film.addEventListener('loadedmetadata', () => {
    if (usingYouTube) return;
    message.hidden = true;
    film.play().catch(() => {
      message.textContent = 'Press play to begin.';
      message.hidden = false;
    });
  });
  film.addEventListener('error', () => {
    if (usingYouTube) return;
    message.textContent = 'The film could not load. Please go back and try again.';
    message.hidden = false;
  });

  document.querySelector('#fullscreen').addEventListener('click', async () => {
    try {
      const frame = document.querySelector('#youtube-film');
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (usingYouTube && cinema.requestFullscreen) await cinema.requestFullscreen();
      else if (frame && frame.requestFullscreen) await frame.requestFullscreen();
      else if (!usingYouTube && film.webkitEnterFullscreen) film.webkitEnterFullscreen();
      else if (cinema.requestFullscreen) await cinema.requestFullscreen();
      else throw Error('Fullscreen unavailable');
    } catch (error) {
      message.textContent = 'Use the video player’s full-screen control.';
      message.hidden = false;
    }
  });

  document.querySelector('#replay').addEventListener('click', () => {
    nextEpisode.hidden = true;
    if (usingYouTube) {
      try {
        youtubePlayer.seekTo(0, true);
        youtubePlayer.playVideo();
      } catch (error) {
        message.textContent = 'Use the video player’s replay control.';
        message.hidden = false;
      }
    } else {
      film.currentTime = 0;
      film.play().catch(() => {
        message.textContent = 'Press play to begin.';
        message.hidden = false;
      });
    }
  });

  window.addEventListener('pagehide', () => {
    pageActive = false;
    stopProgress();
    clearTimeout(hideTimer);
  });
  window.addEventListener('pageshow', () => {
    pageActive = true;
    if (usingYouTube && youtubePlayer) {
      try { youtubeState({ data: youtubePlayer.getPlayerState() }); } catch (error) { /* No invented state. */ }
    }
  });

  (async () => {
    try {
      if (clip) { film.src = clip.src; return; }
      if (!trailer) {
        // A failed or invalid optional YouTube configuration must not block native playback.
        const config = await fetch('/assets/saints/press-video.json', { cache: 'no-store' })
          .then(response => response.ok ? response.json() : {}).catch(() => ({}));
        if (/^[A-Za-z0-9_-]{11}$/.test(config && config.youtubeId || '')) {
          const frame = document.createElement('iframe');
          frame.id = 'youtube-film';
          frame.title = 'Saints of Bad Luck — Get Her Back';
          const source = new URL('https://www.youtube-nocookie.com/embed/' + config.youtubeId);
          source.searchParams.set('rel', '0');
          source.searchParams.set('playsinline', '1');
          source.searchParams.set('enablejsapi', '1');
          if (/^https?:$/.test(location.protocol)) source.searchParams.set('origin', location.origin);
          frame.src = source.href;
          frame.allow = 'fullscreen; picture-in-picture; encrypted-media';
          frame.allowFullscreen = true;
          frame.referrerPolicy = 'strict-origin-when-cross-origin';
          frame.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0';
          usingYouTube = true;
          film.hidden = true;
          cinema.prepend(frame);
          message.hidden = true;
          controls();
          connectYouTube(frame);
          return;
        }
      }
      if (trailer) film.src = '/assets/saints/trailer.mp4';
      else if (['localhost', '127.0.0.1'].includes(location.hostname)) film.src = '/assets/saints/episode-01-opening-2.mp4';
      else {
        const response = await fetch('/api/saints?action=playback', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ episode: 'saints-01' })
        });
        const data = await response.json();
        if (!response.ok) throw Error(data.error);
        window.SaintsPlayback.attach(film, data.url);
      }
    } catch (error) {
      message.textContent = error.message || 'Streaming is temporarily unavailable.';
      message.hidden = false;
    }
  })();
})();
