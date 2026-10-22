/* Package data and process lifetime. AppStorageSettings.clearApplicationUserData / forceStopPackage stop the
   package's work, then clear its private state. Provider records (SMS, contacts, calendar, MediaStore/Documents)
   and the demo services' remote records belong to their providers, not to the app's private preferences. */
(() => {
  'use strict';
  const policies = {
    calculator: {ui: ['calc']},
    calendar: {data: ['calendarOobe'], ui: ['calendar', 'goal']},
    chrome: {data: ['chrome'], ui: ['chrome', 'chromeSite']},
    'device-policy': {},
    drive: {data: ['drive'], ui: ['drive']},
    camera: {data: ['camera'], ui: ['camera']},
    hangouts: {ui: ['hangouts']},
    maps: {ui: ['maps']},
    'play-music': {data: ['music'], ui: ['music', 'musicPreview'], prefs: ['music']},
    photos: {data: ['photoLibrary'], ui: ['photos']},
    'play-games': {ui: ['games']},
    messenger: {ui: ['messenger']},
    clock: {ui: ['clock', 'clockCities'], prefs: ['clocksaver']},
    gmail: {data: ['gmailSetup', 'gmailSearches', 'gmailTeaserGone'], ui: ['gmail']},
    'project-fi': {ui: ['fi']},
    'play-movies': {data: ['movies'], ui: ['movies'], prefs: ['movies']},
    'android-pay': {data: ['pay'], ui: ['pay']},
    youtube: {ui: ['youtube']},
    documents: {ui: ['documents']},
    contacts: {data: ['contactsFilter', 'contactsTab', 'contactsUngrouped'], ui: ['contacts']},
    phone: {data: ['lastDialed', 'frequentsCleared'], ui: ['phone', 'call', 'heldCall'], prefs: ['dialer']},
    'play-store': {ui: ['play'], prefs: ['play']},
    search: {data: ['google'], ui: ['google'], prefs: ['google']},
    settings: {protected: true}
  };
  const aliases = {'files': 'documents', 'downloads': 'documents', now: 'search', 'calendar-goal': 'calendar',
    'clock-cities': 'clock', 'clock-settings': 'clock', 'music-preview': 'play-music', 'emergency-dialer': 'phone'};
  const owner = id => aliases[id] || id;
  const pkg = id => NG.appsData?.[owner(id)]?.pkg || owner(id);
  const related = id => Object.keys(NG.appsData || {}).filter(k => pkg(k) === pkg(id));
  const policy = id => policies[owner(id)] || {};
  const timers = new Map();
  NG.appTasks = {
    later(c, id, fn, delay) {
      const key = pkg(id), pending = timers.get(key) || new Set(); timers.set(key, pending);
      const timer = setTimeout(() => { pending.delete(timer); if (!NG.appData.stopped(c, id)) fn(); }, delay);
      pending.add(timer); return timer;
    },
    cancel(id) { const pending = timers.get(pkg(id)); for (const timer of pending || []) clearTimeout(timer); timers.delete(pkg(id)); }
  };
  const stopped = (c, id) => (c.data.settings.stoppedApps || []).some(x => pkg(x) === pkg(id));
  function stop(c, id) {
    id = owner(id); const ids = new Set([id, ...related(id)]), s = c.data.settings;
    NG.appTasks.cancel(id);
    NG.module(id)?.stop?.(c);
    // Service clocks must stop as well as the activity. Their models stay for Force stop and are reset by Clear data.
    if (id === 'play-music' && c.data.music) { c.data.music.playing = false; c.data.music.last = Date.now(); }
    if (id === 'play-store' && c.data.playStore) c.data.playStore.jobs = {};
    for (const key of policy(id).ui || []) { c.ui[key]?.listeners?.abort?.(); delete c.ui[key]; }
    s.stoppedApps = [...new Set([...(s.stoppedApps || []), ...ids])];
    c.data.recentApps = (c.data.recentApps || []).filter(x => !ids.has(owner(x)));
    c.ui.recent = (c.ui.recent || []).filter(x => !ids.has(owner(x.view || x)));
    c.ui.history = (c.ui.history || []).filter(x => !ids.has(owner(x.view)));
    if (c.ui.appPrefs?.stack?.some(x => (policy(id).prefs || [id]).includes(x.app))) {
      delete c.ui.appPrefs;
      c.ui.history = c.ui.history.filter(x => x.view !== 'app-prefs');
    }
    for (const key of Object.keys(c.ui.thumbs || {})) if (ids.has(owner(key))) delete c.ui.thumbs[key];
    // A stopped task must not survive as the passive split-screen snapshot.
    const split = c.ui.split;
    if (split && [split.a, split.b].some(side => side && ids.has(owner(side.view)))) c.ui.split = null;
    c.data.notifications = (c.data.notifications || []).filter(n => !ids.has(owner(n.app)));
    c.save(); c.renderStatus?.();
  }
  function opened(c, view) {
    let id = owner(view);
    if (view === 'app-prefs') {
      const pref = c.ui.appPrefs?.stack?.at(-1)?.app;
      id = Object.keys(policies).find(k => (policies[k].prefs || [k]).includes(pref)) || id;
    }
    if (!NG.appsData?.[id]) return;
    const s = c.data.settings, wasStopped = stopped(c, id);
    s.stoppedApps = (s.stoppedApps || []).filter(x => pkg(x) !== pkg(id));
    for (const key of related(id)) if (s.appCleared?.[key]) s.appCleared[key] = {data: false, cache: false};
    if (wasStopped) NG.module(id)?.resume?.(c);
    c.save();
  }
  function clearCache(c, id) {
    if (owner(id) === 'drive') NG.driveModel?.clearCache(c);
    const s = c.data.settings;
    for (const key of [owner(id), ...related(id)]) ((s.appCleared ||= {})[key] ||= {}).cache = true;
    c.save();
  }
  function clear(c, id) {
    id = owner(id); const p = policy(id);
    if (p.protected) return false;
    stop(c, id);
    for (const key of p.data || []) {
      if (NG.defaults[key] !== undefined) c.data[key] = JSON.parse(JSON.stringify(NG.defaults[key]));
      else delete c.data[key];
    }
    for (const pref of p.prefs || [id]) if (c.data.appPrefs) delete c.data.appPrefs[pref];
    // Data outside each package's private sandbox is deliberately retained.
    if (id === 'documents' && c.data.documents) {
      const nodes = c.data.documents.nodes;
      c.data.documents = {...JSON.parse(JSON.stringify(NG.defaults.documents)), nodes};
    }
    if (id === 'clock') c.data.clock = {alarms: []};
    if (id === 'drive') c.data.driveFiles = (c.data.driveFiles || []).filter(f => !(f.uploadReadyAt > Date.now())).map(f => {
      const out = {...f}; delete out.offline; delete out.previewCached; return out;
    });
    if (id === 'chrome') NG.module('chrome')?.clearData?.(c);
    if (id === 'hangouts' && c.data.hangouts) {
      const old = c.data.hangouts; delete c.data.hangouts;
      const fresh = NG.hangoutsModel.state(c);
      for (const k of ['threads', 'nextThread', 'nextMessage', 'blocked']) fresh[k] = old[k];
    }
    if (id === 'maps' && c.data.maps) { c.data.maps.searches = []; c.data.maps.areas = []; c.data.maps.visits = []; c.data.maps.historyEnabled = false; }
    if (id === 'play-games' && c.data.games) { c.data.games.tutorial = false; c.data.games.gotIt = false; c.data.games.searches = []; }
    if (id === 'youtube' && c.data.youtube) c.data.youtube.searches = [];
    if (id === 'play-store' && c.data.playStore) for (const k of ['searches', 'contentPin', 'contentEnabled', 'contentLevel']) delete c.data.playStore[k];
    if (c.ui.appPrefs?.stack?.some(x => (p.prefs || [id]).includes(x.app))) delete c.ui.appPrefs;
    const s = c.data.settings;
    for (const key of [id, ...related(id)]) {
      if (s.perms) delete s.perms[key];
      (s.appCleared ||= {})[key] = {data: true, cache: true};
    }
    c.save(); c.renderStatus?.(); return true;
  }
  NG.appData = {owner, stopped, stop, opened, clear, clearCache, canClear: id => !policy(id).protected};
})();
