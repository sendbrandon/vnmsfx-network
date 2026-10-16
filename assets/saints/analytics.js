/* Saints interaction events are local only. See docs/SAINTS-ANALYTICS.md. */
(function () {
  'use strict';
  if (window.SaintsAnalytics) return;

  const characters = ['nix', 'rook', 'brick', 'vernon'];
  const videos = ['episode', 'trailer', 'depot-gate', 'come-home'];
  const playback = { video: videos, player: ['youtube', 'native'] };
  const schemas = {
    view_landing: {},
    character_select: { character: characters },
    asset_download_clicked: { character: [...characters, 'all'], asset: ['front', 'back', 'wallpaper', 'print_pdf', 'collection_zip'], format: ['png', 'pdf', 'zip'] },
    click_watch: { placement: ['hero', 'episode', 'character'], video: videos },
    video_start: playback,
    video_25: playback,
    video_50: playback,
    video_75: playback,
    video_complete: playback
  };
  // Single attribution dictionary: explicitly review new public slugs here before using them in campaign links.
  const campaigns = {
    utm_source: ['instagram', 'tiktok', 'youtube', 'facebook', 'x', 'threads', 'bluesky', 'reddit', 'newsletter', 'email', 'linkedin', 'vnmsfx', 'creativebloq', 'thedaringcreatives', 'forbes', 'filmfactual', 'variety', 'curiousrefuge', 'brothers_saga', 'brooklynscifi', 'aicca', 'theoreticallymedia', 'morehorror', 'gossipgoblin'],
    utm_medium: ['social', 'organic_social', 'paid_social', 'video', 'email', 'referral', 'dm', 'bio', 'story', 'editorial', 'screening', 'profile'],
    utm_campaign: ['saints', 'saints_of_bad_luck', 'saints_dec4', 'episode_1', 'character_cards'],
    utm_content: ['nix', 'rook', 'brick', 'vernon', 'trailer', 'episode_1', 'hero', 'character_card', 'campaign_poster', 'founder_quote', 'scene_breakdown', 'crew_card', 'reel_01', 'reel_02', 'screening_01', 'screening_02', 'screening_03']
  };
  let landingViewed = false;

  function optedOut() {
    const nav = window.navigator || {};
    const dnt = [nav.doNotTrack, nav.msDoNotTrack, window.doNotTrack];
    return nav.globalPrivacyControl === true || dnt.some(value => value === '1' || value === 1 || value === 'yes');
  }

  function attribution() {
    // Exact, bounded enums only. Arbitrary campaign strings can contain personal data.
    const values = {};
    const query = new URLSearchParams(window.location.search);
    Object.keys(campaigns).forEach(key => {
      const entries = query.getAll(key);
      if (entries.length !== 1 || entries[0].length > 32) return;
      const value = entries[0].toLowerCase();
      if (campaigns[key].includes(value)) values[key] = value;
    });
    return values;
  }

  function track(name, fields) {
    try {
      if (optedOut() || !Object.prototype.hasOwnProperty.call(schemas, name)) return false;
      const path = window.location.pathname;
      const page = /^\/saints-of-bad-luck(?:\.html)?\/?$/.test(path) ? 'landing'
        : /^\/saints-watch(?:\.html)?\/?$/.test(path) ? 'watch' : null;
      if (!page || (name.startsWith('video_') ? page !== 'watch' : page !== 'landing')) return false;
      if (name === 'view_landing' && landingViewed) return false;
      fields = fields && typeof fields === 'object' ? fields : {};
      const detail = { event: name, page };
      for (const [key, allowed] of Object.entries(schemas[name])) {
        if (!Object.prototype.hasOwnProperty.call(fields, key) || !allowed.includes(fields[key])) return false;
        detail[key] = fields[key];
      }
      if (name === 'asset_download_clicked') {
        const perCharacter = ['front', 'back', 'wallpaper'].includes(detail.asset);
        if (perCharacter ? detail.character === 'all' || detail.format !== 'png' : detail.character !== 'all' || detail.format !== (detail.asset === 'print_pdf' ? 'pdf' : 'zip')) return false;
      }
      Object.assign(detail, attribution());
      if (typeof window.CustomEvent !== 'function' || typeof window.dispatchEvent !== 'function') return false;
      // Mark before dispatch so reentrant listeners cannot duplicate the landing view.
      const previousLandingViewed = landingViewed;
      if (name === 'view_landing') landingViewed = true;
      try {
        window.dispatchEvent(new window.CustomEvent('saints:analytics', { detail: Object.freeze(detail) }));
      } catch (error) {
        landingViewed = previousLandingViewed;
        return false;
      }
      return true; // Dispatched locally, not confirmation of collection or delivery.
    } catch (error) {
      return false; // Analytics must never interrupt browsing or playback.
    }
  }

  function watchUrl(video) {
    // Carry only approved campaign enums to this site's watch route; never persist them.
    const query = new URLSearchParams({ video: videos.includes(video) ? video : 'episode' });
    try {
      if (!optedOut()) Object.entries(attribution()).forEach(([key, value]) => query.set(key, value));
    } catch (error) { /* A plain watch URL remains usable. */ }
    return '/saints-watch?' + query.toString();
  }

  function charactersUrl() {
    const query = new URLSearchParams();
    try {
      if (!optedOut()) Object.entries(attribution()).forEach(([key, value]) => query.set(key, value));
    } catch (error) { /* The direct character anchor remains available. */ }
    return '/saints-of-bad-luck' + (query.size ? '?' + query.toString() : '') + '#characters';
  }

  window.SaintsAnalytics = Object.freeze({ track, watchUrl, charactersUrl });
})();
