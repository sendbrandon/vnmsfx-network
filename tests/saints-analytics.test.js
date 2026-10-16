const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const analyticsCode = fs.readFileSync(path.join(__dirname, '../assets/saints/analytics.js'), 'utf8');
const watchCode = fs.readFileSync(path.join(__dirname, '../assets/saints/watch.js'), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));

function analyticsFixture(options = {}) {
  const events = [];
  const location = {
    pathname: options.pathname || '/saints-of-bad-luck',
    search: options.search || ''
  };
  Object.defineProperty(location, 'href', { get() { throw Error('Do not read a full URL'); } });
  const window = {
    location, navigator: options.navigator || {},
    CustomEvent: class CustomEvent { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    dispatchEvent(event) { events.push(plain(event.detail)); return true; }
  };
  for (const key of ['localStorage', 'sessionStorage']) {
    Object.defineProperty(window, key, { get() { throw Error('Do not use browser storage'); } });
  }
  window.fetch = window.gtag = window.va = window.vnmsfxRecord = () => { throw Error('Do not collect or forward'); };
  const context = vm.createContext({ window, URLSearchParams });
  vm.runInContext(analyticsCode, context);
  return { window, events, context, api: window.SaintsAnalytics };
}

test('landing events are strictly projected and downloads represent activation, not saved files', () => {
  const f = analyticsFixture();
  assert.equal(f.api.track('view_landing', { email: 'private@example.test' }), true);
  assert.equal(f.api.track('character_select', { character: 'rook', user_id: 'secret' }), true);
  assert.equal(f.api.track('asset_download_clicked', { character: 'nix', asset: 'back', format: 'png', filename: 'private' }), true);
  assert.equal(f.api.track('asset_download_clicked', { character: 'brick', asset: 'wallpaper', format: 'png' }), true);
  assert.equal(f.api.track('click_watch', { placement: 'character', video: 'episode', href: 'private' }), true);
  assert.deepEqual(f.events, [
    { event: 'view_landing', page: 'landing' },
    { event: 'character_select', page: 'landing', character: 'rook' },
    { event: 'asset_download_clicked', page: 'landing', character: 'nix', asset: 'back', format: 'png' },
    { event: 'asset_download_clicked', page: 'landing', character: 'brick', asset: 'wallpaper', format: 'png' },
    { event: 'click_watch', page: 'landing', placement: 'character', video: 'episode' }
  ]);
});

test('unknown events, incomplete payloads, inherited fields and invalid enum values are rejected', () => {
  const f = analyticsFixture();
  for (const name of ['anything', '__proto__', 'constructor', 'toString', null]) assert.equal(f.api.track(name), false);
  assert.equal(f.api.track('character_select', { character: 'someone@example.test' }), false);
  assert.equal(f.api.track('character_select', Object.create({ character: 'nix' })), false);
  assert.equal(f.api.track('asset_download_clicked', { character: 'rook' }), false);
  assert.equal(f.api.track('asset_download_clicked', { character: 'rook', asset: 'front', format: 'exe' }), false);
  assert.equal(f.api.track('click_watch', { placement: 'unknown', video: 'episode' }), false);
  assert.equal(f.api.track('click_watch', { placement: 'hero', video: 'secret' }), false);
  assert.deepEqual(f.events, []);
});

test('only finite approved campaign enums survive into events and same-site watch URLs', () => {
  const f = analyticsFixture({ search: '?utm_source=INSTAGRAM&utm_medium=social&utm_campaign=saints_of_bad_luck&utm_content=rook&utm_term=email%40example.test&email=private&ref=https%3A%2F%2Fprivate.test' });
  f.api.track('view_landing');
  const expected = { utm_source: 'instagram', utm_medium: 'social', utm_campaign: 'saints_of_bad_luck', utm_content: 'rook' };
  assert.deepEqual(f.events[0], { event: 'view_landing', page: 'landing', ...expected });
  const url = new URL(f.api.watchUrl('trailer'), 'https://vnmsfx.com');
  assert.equal(url.pathname, '/saints-watch');
  assert.deepEqual(Object.fromEntries(url.searchParams), { video: 'trailer', ...expected });
  assert.equal(url.origin, 'https://vnmsfx.com');
});

test('unknown, overlength, duplicated and personally identifying UTMs are omitted', () => {
  const f = analyticsFixture({ search: '?utm_source=instagram&utm_source=youtube&utm_medium=person%40example.test&utm_campaign=' + 'a'.repeat(1000) + '&utm_content=https%3A%2F%2Fprivate.test' });
  f.api.track('view_landing');
  assert.deepEqual(f.events, [{ event: 'view_landing', page: 'landing' }]);
  assert.equal(f.api.watchUrl('https://evil.test'), '/saints-watch?video=episode');
});

for (const navigator of [{ doNotTrack: '1' }, { doNotTrack: 'yes' }, { msDoNotTrack: '1' }, { globalPrivacyControl: true }]) {
  test('privacy signal suppresses local dispatch and UTM propagation: ' + JSON.stringify(navigator), () => {
    const f = analyticsFixture({ navigator, search: '?utm_source=youtube' });
    assert.equal(f.api.track('view_landing'), false);
    assert.equal(f.api.watchUrl('episode'), '/saints-watch?video=episode');
    assert.deepEqual(f.events, []);
  });
}

test('privacy choice is checked at dispatch time and legacy window DNT is honored', () => {
  const f = analyticsFixture();
  f.window.doNotTrack = '1';
  assert.equal(f.api.track('character_select', { character: 'nix' }), false);
  f.window.doNotTrack = '0';
  assert.equal(f.api.track('character_select', { character: 'nix' }), true);
  f.window.navigator.globalPrivacyControl = true;
  assert.equal(f.api.track('character_select', { character: 'rook' }), false);
  assert.equal(f.events.length, 1);
});

test('initialization and landing views are repeat-safe, including reentrant listeners', () => {
  const f = analyticsFixture();
  vm.runInContext(analyticsCode, f.context);
  assert.equal(f.window.SaintsAnalytics, f.api);
  let reentrant;
  f.window.dispatchEvent = () => { reentrant = f.api.track('view_landing'); return true; };
  assert.equal(f.api.track('view_landing'), true);
  assert.equal(reentrant, false);
  assert.equal(f.api.track('view_landing'), false);
});

test('unsupported event APIs, hostile getters and dispatch failures cannot break browsing', () => {
  const f = analyticsFixture();
  f.window.dispatchEvent = () => { throw Error('observer failure'); };
  assert.equal(f.api.track('view_landing'), false);
  f.window.dispatchEvent = event => { assert.equal(Object.isFrozen(event.detail), true); return true; };
  assert.equal(f.api.track('view_landing'), true);
  const fields = { get character() { throw Error('hostile payload'); } };
  assert.equal(f.api.track('character_select', fields), false);
  f.window.CustomEvent = undefined;
  assert.equal(f.api.track('character_select', { character: 'nix' }), false);
});

test('events cannot leak path strings or run outside the two public Saints routes', () => {
  const unrelated = analyticsFixture({ pathname: '/saints-library/private-member' });
  assert.equal(unrelated.api.track('view_landing'), false);
  const landing = analyticsFixture({ pathname: '/saints-of-bad-luck.html' });
  assert.equal(landing.api.track('video_start', { video: 'episode', player: 'native' }), false);
  const watch = analyticsFixture({ pathname: '/saints-watch.html' });
  assert.equal(watch.api.track('view_landing'), false);
  for (const name of ['video_start', 'video_25', 'video_50', 'video_75', 'video_complete']) {
    assert.equal(watch.api.track(name, { video: 'episode', player: 'youtube', position: 123, url: 'private' }), true);
  }
  assert.equal(watch.events.length, 5);
  assert.deepEqual(Object.keys(watch.events[0]), ['event', 'page', 'video', 'player']);
});

class Element {
  constructor(tag = 'div') {
    this.tagName = tag;
    this.dataset = {};
    this.hidden = false;
    this.listeners = {};
    this.style = {};
    this.children = [];
    this.classList = { values: new Set(), add(name) { this.values.add(name); }, remove(name) { this.values.delete(name); } };
    this.currentTime = 0;
    this.duration = 100;
    this.paused = true;
    this.seeking = false;
    this.playCalls = 0;
    this.focusCalls = 0;
  }
  addEventListener(name, callback) { (this.listeners[name] ||= []).push(callback); }
  emit(name, details = {}) { for (const callback of this.listeners[name] || []) callback({ type: name, target: this, ...details }); }
  append(element) { this.children.push(element); }
  prepend(element) { this.children.unshift(element); }
  focus() { this.focusCalls++; }
  play() { this.playCalls++; return this.rejectPlay ? Promise.reject(Error('autoplay blocked')) : Promise.resolve(); }
}

async function watchFixture(options = {}) {
  const ids = {};
  for (const id of ['film', 'cinema', 'watch-message', 'next-episode', 'watch-title', 'next-title', 'fullscreen', 'replay']) ids[id] = new Element();
  ids['next-episode'].hidden = true;
  const body = new Element('body');
  const head = new Element('head');
  const document = new Element('document');
  Object.assign(document, {
    body, head,
    querySelector(selector) {
      if (selector === '#youtube-film') return ids.cinema.children.find(element => element.id === 'youtube-film') || null;
      if (selector.startsWith('#')) return ids[selector.slice(1)] || null;
      if (selector.startsWith('script')) return head.children.find(element => element.src === 'https://www.youtube.com/iframe_api') || null;
      return null;
    },
    createElement(tag) { return new Element(tag); }
  });
  const window = new Element('window');
  const location = new URL(options.url || 'https://vnmsfx.com/saints-watch?video=episode');
  window.location = location;
  if (options.previousReady) window.onYouTubeIframeAPIReady = options.previousReady;
  window.navigator = options.navigator || {};
  const events = [];
  window.CustomEvent = class CustomEvent { constructor(type, args) { this.type = type; this.detail = args.detail; } };
  window.dispatchEvent = event => { events.push(plain(event.detail)); return true; };
  const attachments = [];
  window.SaintsPlayback = { attach: (...args) => attachments.push(args) };
  const timers = new Map();
  const timeouts = new Map();
  let timerId = 0;
  let player;
  function installYT() {
    window.YT = { Player: function (frame, config) {
      player = {
        frame, config, state: -1, position: 0, duration: 100, seeks: [], playCalls: 0,
        getPlayerState() { return this.state; },
        getCurrentTime() { return this.position; },
        getDuration() { return this.duration; },
        seekTo(...args) { this.seeks.push(args); this.position = args[0]; },
        playVideo() { this.playCalls++; },
        stateChange(state) { this.state = state; config.events.onStateChange({ data: state, target: this }); },
        ready() { config.events.onReady({ target: this }); }
      };
      return player;
    } };
  }
  if (options.youtube) installYT();
  const requests = [];
  const fetch = async (url, request) => {
    requests.push({ url, request });
    if (url.includes('press-video')) {
      if (options.configFailure) throw Error('config offline');
      return { ok: options.configStatus !== false, json: async () => options.config || {} };
    }
    if (options.playbackFailure) throw Error('playback offline');
    return { ok: true, json: async () => ({ url: 'https://stream.example.test/film.m3u8' }) };
  };
  const context = vm.createContext({
    window, document, location, URL, URLSearchParams, fetch,
    setTimeout(fn) { const id = ++timerId; timeouts.set(id, fn); return id; },
    clearTimeout(id) { timeouts.delete(id); },
    setInterval(fn) { const id = ++timerId; timers.set(id, fn); return id; },
    clearInterval(id) { timers.delete(id); }
  });
  if (!options.noAnalytics) vm.runInContext(analyticsCode, context);
  vm.runInContext(watchCode, context);
  await new Promise(resolve => setImmediate(resolve));
  return {
    ids, window, document, events, attachments, requests, context, timers, timeouts, installYT,
    get player() { return player; },
    tick() { for (const callback of [...timers.values()]) callback(); },
    names() { return events.map(event => event.event); }
  };
}

function nativePlay(f) { f.ids.film.paused = false; f.ids.film.emit('playing'); }
function nativeTime(f, time) { f.ids.film.currentTime = time; f.ids.film.emit('timeupdate'); }

test('native playback starts only on playing and emits each milestone/completion once across replay', async () => {
  const f = await watchFixture({ url: 'http://localhost/saints-watch?video=episode' });
  assert.equal(f.ids.film.src, '/assets/saints/episode-01-opening-2.mp4');
  f.ids.film.emit('loadedmetadata');
  f.ids.film.emit('play');
  nativeTime(f, 30);
  assert.deepEqual(f.names(), []);
  nativePlay(f);
  for (const time of [24, 25, 25, 50, 75, 100]) nativeTime(f, time);
  assert.deepEqual(f.names(), ['video_start', 'video_25', 'video_50', 'video_75']);
  f.ids.film.emit('ended');
  f.ids.film.emit('ended');
  assert.equal(f.ids['next-episode'].hidden, false);
  assert.equal(f.ids['next-title'].focusCalls, 1);
  f.ids.replay.emit('click');
  assert.equal(f.ids.film.currentTime, 0);
  assert.equal(f.ids['next-episode'].hidden, true);
  nativePlay(f);
  nativeTime(f, 100);
  f.ids.film.emit('ended');
  assert.deepEqual(f.names(), ['video_start', 'video_25', 'video_50', 'video_75', 'video_complete']);
  assert.equal(f.events.every(event => event.player === 'native' && event.video === 'episode'), true);
});

test('native paused/seeking, invalid duration and unknown completion do not invent progress', async () => {
  const f = await watchFixture({ url: 'https://vnmsfx.com/saints-watch?video=trailer' });
  f.ids.film.emit('ended');
  assert.deepEqual(f.names(), []);
  nativePlay(f);
  f.ids.film.paused = true;
  nativeTime(f, 80);
  f.ids.film.paused = false;
  f.ids.film.seeking = true;
  nativeTime(f, 80);
  f.ids.film.seeking = false;
  for (const duration of [0, NaN, Infinity, -1]) { f.ids.film.duration = duration; nativeTime(f, 80); }
  f.ids.film.duration = 100;
  nativeTime(f, NaN);
  assert.deepEqual(f.names(), ['video_start']);
  nativeTime(f, 80);
  assert.deepEqual(f.names(), ['video_start', 'video_25', 'video_50', 'video_75']);
  f.ids.film.emit('ended');
  assert.equal(f.ids['next-episode'].hidden, true, 'trailer has no episode end card');
  assert.equal(f.events.every(event => event.video === 'trailer'), true);
});

test('native autoplay rejection keeps a usable play prompt without a start event', async () => {
  const f = await watchFixture({ url: 'https://vnmsfx.com/saints-watch?video=trailer' });
  f.ids.film.rejectPlay = true;
  f.ids.film.emit('loadedmetadata');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(f.ids['watch-message'].textContent, 'Press play to begin.');
  assert.equal(f.ids['watch-message'].hidden, false);
  assert.deepEqual(f.names(), []);
  assert.equal(f.requests.length, 0, 'trailer does not request episode configuration');
});

test('YouTube uses the configured privacy-enhanced iframe and real API playback state', async () => {
  const f = await watchFixture({ youtube: true, config: { youtubeId: 'nHrWDMSD9Wg' } });
  const frame = f.document.querySelector('#youtube-film');
  const source = new URL(frame.src);
  assert.equal(source.origin, 'https://www.youtube-nocookie.com');
  assert.equal(source.pathname, '/embed/nHrWDMSD9Wg');
  assert.equal(source.searchParams.get('enablejsapi'), '1');
  assert.equal(source.searchParams.get('origin'), 'https://vnmsfx.com');
  assert.equal(f.ids.film.hidden, true);
  f.player.ready();
  f.ids.film.emit('playing');
  assert.deepEqual(f.names(), []);
  f.player.stateChange(1);
  f.player.stateChange(1);
  assert.equal(f.timers.size, 1);
  f.player.position = 25; f.tick();
  f.player.stateChange(2);
  assert.equal(f.timers.size, 0);
  f.player.position = 50; f.tick();
  assert.deepEqual(f.names(), ['video_start', 'video_25']);
  f.player.stateChange(3);
  f.player.stateChange(1);
  f.player.position = 75; f.tick();
  f.player.position = 100; f.tick();
  assert.equal(f.names().includes('video_complete'), false);
  f.player.stateChange(0);
  assert.deepEqual(f.names(), ['video_start', 'video_25', 'video_50', 'video_75', 'video_complete']);
  assert.equal(f.events.every(event => event.player === 'youtube'), true);
  assert.equal(f.timers.size, 0);
  assert.equal(f.ids['next-episode'].hidden, false);
  f.ids.replay.emit('click');
  assert.deepEqual(f.player.seeks, [[0, true]]);
  assert.equal(f.player.playCalls, 1);
  assert.equal(f.ids.film.playCalls, 0, 'YouTube replay must not start hidden native video');
  f.player.stateChange(1); f.player.position = 100; f.tick(); f.player.stateChange(0);
  assert.equal(f.events.length, 5);
});

test('YouTube API can arrive late without replacing ordinary playback or previous callback', async () => {
  let previousCalls = 0;
  const f = await watchFixture({ config: { youtubeId: 'nHrWDMSD9Wg' }, previousReady() { previousCalls++; } });
  assert.equal(f.document.head.children.length, 1);
  assert.equal(f.document.head.children[0].src, 'https://www.youtube.com/iframe_api');
  assert.equal(f.player, undefined);
  f.document.head.children[0].emit('error'); // A blocked API leaves the already-created iframe alone.
  assert.equal(f.document.querySelector('#youtube-film').allowFullscreen, true);
  assert.deepEqual(f.events, []);
  f.installYT();
  f.window.onYouTubeIframeAPIReady();
  f.window.onYouTubeIframeAPIReady();
  assert.equal(previousCalls, 2);
  f.player.state = 1;
  f.player.ready();
  assert.deepEqual(f.names(), ['video_start']);
  assert.equal(f.timers.size, 1);
});

test('failed optional config falls back to existing native streaming without inventing events', async () => {
  const f = await watchFixture({ configFailure: true });
  assert.equal(f.attachments.length, 1);
  assert.equal(f.attachments[0][0], f.ids.film);
  assert.equal(f.requests.length, 2);
  assert.deepEqual(JSON.parse(f.requests[1].request.body), { episode: 'saints-01' });
  assert.equal(f.requests[1].request.method, 'POST');
  assert.deepEqual(f.events, []);
});

test('invalid YouTube IDs cannot inject a URL and native network errors stay visible', async () => {
  const f = await watchFixture({ config: { youtubeId: 'https://evil.test/anything' }, playbackFailure: true });
  assert.equal(f.document.querySelector('#youtube-film'), null);
  assert.equal(f.ids['watch-message'].hidden, false);
  assert.equal(f.ids['watch-message'].textContent, 'playback offline');
  assert.deepEqual(f.events, []);
});

test('pagehide stops polling, pageshow resumes observed playback, repeat initialization is harmless', async () => {
  const f = await watchFixture({ youtube: true, config: { youtubeId: 'nHrWDMSD9Wg' } });
  f.player.stateChange(1);
  f.window.emit('pagehide');
  assert.equal(f.timers.size, 0);
  assert.equal(f.timeouts.size, 0);
  f.player.position = 60;
  f.tick();
  assert.deepEqual(f.names(), ['video_start']);
  f.window.emit('pageshow');
  assert.equal(f.timers.size, 1);
  assert.deepEqual(f.names(), ['video_start', 'video_25', 'video_50']);
  const requests = f.requests.length;
  vm.runInContext(watchCode, f.context);
  assert.equal(f.requests.length, requests);
  assert.equal(f.ids.replay.listeners.click.length, 1);
});

test('privacy signals and absent analytics never block video controls, endcard or replay', async () => {
  for (const options of [{ navigator: { globalPrivacyControl: true } }, { noAnalytics: true }]) {
    const f = await watchFixture({ ...options, youtube: true, config: { youtubeId: 'nHrWDMSD9Wg' } });
    f.player.stateChange(1); f.player.position = 100; f.tick(); f.player.stateChange(0);
    assert.deepEqual(f.events, []);
    assert.equal(f.ids['next-episode'].hidden, false);
    f.ids.replay.emit('click');
    assert.equal(f.player.playCalls, 1);
  }
});

test('YouTube errors stop timers without reporting completion or hiding the usable frame', async () => {
  const f = await watchFixture({ youtube: true, config: { youtubeId: 'nHrWDMSD9Wg' } });
  f.player.stateChange(1);
  f.player.config.events.onError({ data: 150 });
  assert.equal(f.timers.size, 0);
  assert.deepEqual(f.names(), ['video_start']);
  assert.equal(f.ids['watch-message'].hidden, false);
  assert.ok(f.document.querySelector('#youtube-film'));
});

test('watch HTML loads local analytics before playback instrumentation', () => {
  const html = fs.readFileSync(path.join(__dirname, '../saints-watch.html'), 'utf8');
  assert.ok(html.indexOf('/assets/saints/analytics.js') < html.indexOf('/assets/saints/watch.js'));
  assert.equal((html.match(/\/assets\/saints\/analytics.js/g) || []).length, 1);
});


test('the custom YouTube fullscreen button includes the endcard when container fullscreen is supported', async () => {
  const f = await watchFixture({ youtube: true, config: { youtubeId: 'nHrWDMSD9Wg' } });
  let containerCalls = 0;
  let iframeCalls = 0;
  f.ids.cinema.requestFullscreen = async () => { containerCalls++; };
  f.document.querySelector('#youtube-film').requestFullscreen = async () => { iframeCalls++; };
  f.ids.fullscreen.emit('click');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(containerCalls, 1);
  assert.equal(iframeCalls, 0);
});

test('planned campaign labels are retained without allowing arbitrary campaign text', () => {
  for (const medium of ['dm', 'bio', 'story', 'editorial', 'screening']) {
    const f = analyticsFixture({ search: '?utm_source=instagram&utm_medium=' + medium + '&utm_campaign=saints_dec4' });
    f.api.track('view_landing');
    assert.equal(f.events[0].utm_campaign, 'saints_dec4');
    assert.equal(f.events[0].utm_medium, medium);
    assert.match(f.api.watchUrl('episode'), /utm_campaign=saints_dec4/);
  }
});


test('all explicitly planned public outlet and creative slugs survive the bounded dictionary', () => {
  const sources = ['creativebloq', 'thedaringcreatives', 'forbes', 'filmfactual', 'variety', 'curiousrefuge', 'brothers_saga', 'brooklynscifi', 'aicca', 'theoreticallymedia', 'morehorror', 'gossipgoblin'];
  const contents = ['campaign_poster', 'founder_quote', 'scene_breakdown', 'crew_card', 'reel_01', 'reel_02', 'screening_01', 'screening_02', 'screening_03'];
  for (const source of sources) for (const content of contents) {
    const f = analyticsFixture({ search: '?utm_source=' + source + '&utm_medium=profile&utm_campaign=saints_dec4&utm_content=' + content });
    const link = new URL(f.api.watchUrl('episode'), 'https://vnmsfx.com');
    assert.equal(link.searchParams.get('utm_source'), source);
    assert.equal(link.searchParams.get('utm_content'), content);
    assert.equal(link.searchParams.get('utm_medium'), 'profile');
    f.api.track('view_landing');
    assert.equal(f.events[0].utm_source, source);
    assert.equal(f.events[0].utm_content, content);
  }
});

test('permanent watch-to-character link preserves only approved campaign enums', () => {
  const f = analyticsFixture({pathname:'/saints-watch',search:'?video=episode&utm_source=instagram&utm_campaign=saints_dec4&email=private@example.test'});
  assert.equal(f.api.charactersUrl(), '/saints-of-bad-luck?utm_source=instagram&utm_campaign=saints_dec4#characters');
  f.window.navigator.globalPrivacyControl = true;
  assert.equal(f.api.charactersUrl(), '/saints-of-bad-luck#characters');
});


test('download schema distinguishes selected artwork from whole-collection files', () => {
  const f = analyticsFixture();
  for (const asset of ['front','back','wallpaper']) assert.equal(f.api.track('asset_download_clicked',{character:'nix',asset,format:'png'}),true);
  assert.equal(f.api.track('asset_download_clicked',{character:'all',asset:'print_pdf',format:'pdf'}),true);
  assert.equal(f.api.track('asset_download_clicked',{character:'all',asset:'collection_zip',format:'zip'}),true);
  for (const fields of [
    {character:'all',asset:'front',format:'png'},
    {character:'nix',asset:'print_pdf',format:'pdf'},
    {character:'all',asset:'collection_zip',format:'pdf'},
    {character:'rook',asset:'wallpaper',format:'svg'}
  ]) assert.equal(f.api.track('asset_download_clicked',fields),false);
});

for (const [slug, title, source] of [
  ['depot-gate', 'The Depot Gate', '/assets/saints/clips/depot-gate/the-depot-gate-web-v1.mp4'],
  ['come-home', 'Road Fight · Come Home', '/assets/saints/clips/come-home/come-home-web-v1.mp4']
]) {
  test('public clip ' + slug + ' uses the cinema player without episode auth, YouTube or purchase end card', async () => {
    const f = await watchFixture({ url: 'https://vnmsfx.com/saints-watch?video=' + slug, config: { youtubeId: 'nHrWDMSD9Wg' } });
    assert.equal(f.ids.film.src, source);
    assert.equal(f.ids['watch-title'].textContent, 'Clip · ' + title);
    assert.equal(f.requests.length, 0, 'public clip must not request episode playback or episode YouTube configuration');
    assert.equal(f.attachments.length, 0);
    nativePlay(f); nativeTime(f, 50); f.ids.film.emit('ended');
    assert.equal(f.ids['next-episode'].hidden, true);
    assert.equal(f.events.every(event => event.video === slug && event.player === 'native'), true);
    assert.deepEqual(f.names(), ['video_start', 'video_25', 'video_50', 'video_complete']);
  });
}
