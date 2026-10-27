/* Android 6.0.1 YouTube (YouTube 10.28.60, app/YouTube of MTC20K), the app 'youtube', on the demo account. The videos,
   channels and their pictures are the simulator's own (scenes from mm-media.js); nothing plays real video.
   - The toolbar in color_brand_primary #e62117 (the status bar theme_main_color_primary_dark #ba1b12) with
     action_bar_logo_release, search (ic_menu_search_mtrl_alpha) and the overflow; toolbar_tabs_bar.xml's AppTabsBar of
     image tabs (ic_tab_home, ic_tab_subscriptions, ic_tab_account: white when active, #99000000 otherwise).
   - video_feed_item.xml cards (card_frame, 12 dp below): the 16:9 thumbnail with the duration, the 18 sp #333333 title
     (12 dp in, 40 dp from the end for contextual_menu_anchor), the 14 sp #757575 author_and_views line.
   - The watch page: the 16:9 player with play / pause and the time bar, the title, age_and_views, like / dislike / share /
     add to (ic_like, ic_dislike, ic_share, ic_overflow_addtoplaylist), the channel row with SUBSCRIBE, and the next
     videos as compact_video_item.xml rows (the 128 dp thumbnail, 14 sp #333333 title, 12 sp #999999 author and
     details).
   - Search (action_bar_search_view.xml): the bar turns white with ic_arrow_back_black, the "Search YouTube" field
     (search_hint, ThemeOverlay.YouTube.ActionBar.Title.Search) and ic_search_clear; under it search_suggestion_entry.xml
     rows (56 dp white, ic_query_suggestion, the 16 sp #999999 text 20 dp in, ic_edit_suggestion at the end): the past
     searches, then the titles that start with the words typed. A search lists compact_video_item rows or
     no_results_found.
   - The account tab: History (channel_watch_history: the videos watched, newest first, or no_watch_history_found),
     Watch later (channel_watch_later), Settings (the app's preference_headers, mm-appprefs.js) and Help (Google's help).
   - Add to (add_to_dialog.xml: playlist_add_to_entry.xml rows of a 40 dp icon and the title): Watch later
     (watch_later_done, or watch_later_duplicate), the account's own playlists, and "New playlist…" (the
     create_playlist_dialog_title dialog: create_playlist_name, the create_playlist_private box; create_playlist_done). */
(() => {
  'use strict';
  const T = () => MM.text('youtube');
  const A = n => `assets/yt-${n}.png`;
  const H = 36e5, D = 864e5;
  const VIDEOS = [
    {id: 1, title: 'Sunrise trail run through the hills', ch: 'Northbound Outdoors', views: 182331, age: 2 * D, len: 412, seed: 11},
    {id: 2, title: 'The fluffiest pancakes you will ever make', ch: 'Kitchen Table', views: 1203980, age: 5 * D, len: 523, seed: 42},
    {id: 3, title: 'Build a tiny robot from spare parts', ch: 'Tin Gear Lab', views: 88412, age: 9 * H, len: 735, seed: 77},
    {id: 4, title: 'Rain on the lake — two hours of calm', ch: 'Quiet Room', views: 3410221, age: 21 * D, len: 7200, seed: 23},
    {id: 5, title: 'A city wakes up: time-lapse', ch: 'Metro Minds', views: 56120, age: 3 * H, len: 198, seed: 5},
    {id: 6, title: 'Ten things to try on your new phone', ch: 'Pocket Tips Weekly', views: 402777, age: 6 * D, len: 611, seed: 64}
  ];
  const ui = c => c.ui.youtube || (c.ui.youtube = {tab: 0, watch: 0, playing: false, pos: 0, started: 0});
  const subs = c => c.data.ytSubs || (c.data.ytSubs = []);
  const yt = c => c.data.yt || (c.data.yt = {history: [], searches: [], later: [], playlists: []});
  const compact = (c, x) => `<button type="button" class="mmyt-compact" data-action="mmyt-watch" data-id="${x.id}">${thumb(x, 'small')}<span class="mmyt-ctext"><b>${esc(c, x.title)}</b><small>${esc(c, x.ch)}</small><small>${esc(c, T().plural('age_and_views', x.views, null, ago(c, x.age), num(c, x.views)))}</small></span></button>`;
  const matches = (v, q) => { const words = q.toLowerCase().split(/\s+/).filter(Boolean); return words.length && words.every(w => v.title.toLowerCase().split(/[^\p{L}\p{N}]+/u).some(x => x.startsWith(w)) || v.ch.toLowerCase().includes(w)); };
  function searchPage(c) {
    const t = T(), u = ui(c), s = u.search, q = s.q.trim();
    const bar = `<div class="mmyt-sbar"><button type="button" class="mmyt-btn" data-action="mmyt-sback" aria-label="${esc(c, c.t('Back'))}"><img src="${A('ic_arrow_back_black')}" alt=""></button><input class="mmyt-sfield" type="text" value="${esc(c, s.q)}" placeholder="${esc(c, t.t('search_hint'))}" spellcheck="false" autocomplete="off">${s.q ? `<button type="button" class="mmyt-btn" data-action="mmyt-sclear" aria-label="${esc(c, t.t('action_bar_search_clear'))}"><img src="${A('ic_search_clear')}" alt=""></button>` : ''}</div>`;
    if (s.done) {
      const list = VIDEOS.filter(v => matches(v, s.done));
      return `<div class="mmyt mmyt-search">${bar}<div class="mmyt-page mmyt-results">${list.length ? list.map(v => compact(c, v)).join('') : `<div class="mmyt-none">${esc(c, t.t('no_results_found'))}</div>`}</div></div>`;
    }
    const past = yt(c).searches.filter(x => !q || x.toLowerCase().startsWith(q.toLowerCase()));
    const sugg = q ? VIDEOS.filter(v => matches(v, q)).map(v => v.title.toLowerCase()).filter(x => !past.includes(x)) : [];
    const row = (text, past) => `<div class="mmyt-sugg${past ? ' past' : ''}"><img src="${A('ic_query_suggestion')}" alt=""><button type="button" data-action="mmyt-sgo" data-q="${esc(c, text)}">${esc(c, text)}</button><button type="button" class="mmyt-sedit" data-action="mmyt-sedit" data-q="${esc(c, text)}" aria-label="${esc(c, AndroidStrings.format(t.t('accessibility_search_edit_suggestion'), text))}"><img src="${A('ic_edit_suggestion')}" alt=""></button></div>`;
    return `<div class="mmyt mmyt-search">${bar}<div class="mmyt-page mmyt-suggs">${[...past.slice(0, 6).map(x => row(x, true)), ...sugg.slice(0, 6).map(x => row(x, false))].join('')}</div></div>`;
  }
  // History and Watch later: the toolbar with the back arrow and the list.
  function listPage(c, title, ids, empty) {
    const list = ids.map(id => VIDEOS.find(v => v.id === id)).filter(Boolean);
    return `<div class="mmyt"><div class="mmyt-head"><div class="mmyt-bar1 sub"><button type="button" class="mmyt-btn" data-action="mmyt-up" aria-label="${esc(c, c.t('Back'))}"><img src="${A('quantum_ic_arrow_back_white_24')}" alt=""></button><span class="mmyt-title">${esc(c, title)}</span></div></div>
      <div class="mmyt-page mmyt-results">${list.length ? list.map(v => compact(c, v)).join('') : `<div class="mmyt-none">${esc(c, empty)}</div>`}</div></div>`;
  }
  function addTo(c, v) {
    const t = T(), data = yt(c);
    const items = [{html: `<span class="mmyt-addrow"><img src="${A('ic_drawer_watch_later_normal')}" alt=""><span>${esc(c, t.t('channel_watch_later'))}</span></span>`, run: c => { if (data.later.includes(v.id)) { c.toast(t.t('watch_later_duplicate')); return; } data.later.unshift(v.id); c.save(); c.toast(t.t('watch_later_done')); }},
      ...data.playlists.map(p => ({html: `<span class="mmyt-addrow"><img src="${A(p.private ? 'ic_playlist_lock' : 'ic_playlist_save')}" alt=""><span>${esc(c, p.title)}</span></span>`, run: c => { if (!p.videos.includes(v.id)) { p.videos.push(v.id); c.save(); } c.toast(AndroidStrings.format(t.t('menu_add_to_playlist') || '%1$s', p.title)); }})),
      {html: `<span class="mmyt-addrow"><i></i><span>${esc(c, t.t('create_playlist_entry'))}</span></span>`, run: c => newPlaylist(c, v)}];
    c.dialog({title: t.t('menu_add_to'), items: items.map(x => ({html: x.html})), onItem: i => items[i].run(c)});
  }
  function newPlaylist(c, v) {
    const t = T();
    c.dialog({title: t.t('create_playlist_dialog_title'), html: `<div class="mmyt-newpl"><input type="text" class="mmyt-plname" placeholder="${esc(c, t.t('create_playlist_name'))}"><label><input type="checkbox" class="mmyt-plpriv" checked> ${esc(c, t.t('create_playlist_private'))}</label></div>`,
      buttons: [{label: t.t('framework/cancel')}, {label: t.t('framework/ok'), action: c => {
        const name = c.el.overlay.querySelector('.mmyt-plname')?.value.trim(); if (!name) return;
        yt(c).playlists.push({title: name, private: !!c.el.overlay.querySelector('.mmyt-plpriv')?.checked, videos: [v.id]}); c.save(); c.toast(t.t('create_playlist_done'));
      }}]});
    setTimeout(() => c.el.overlay.querySelector('.mmyt-plname')?.focus(), 50);
  }
  const esc = (c, s) => c.safe(s);
  const dur = s => { const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = s % 60; return h ? `${h}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}` : `${m}:${String(x).padStart(2, '0')}`; };
  function ago(c, ms) {
    const t = T(), [k, n] = ms < H ? ['minutes_ago', Math.max(1, Math.floor(ms / 6e4))] : ms < D ? ['hours_ago', Math.floor(ms / H)] : ms < 7 * D ? ['days_ago', Math.floor(ms / D)] : ['weeks_ago', Math.floor(ms / (7 * D))];
    return t.plural(k, n, null, n);
  }
  const num = (c, n) => n.toLocaleString(c.locale());
  const thumb = (v, cls) => `<span class="mmyt-thumb ${cls}">${MM.media.svg({id: `yt${v.id}`, seed: v.seed, time: Date.now() - v.age}, 'mmyt-svg', 16 / 9)}<small>${dur(v.len)}</small></span>`;
  function feed(c) {
    const t = T();
    return `<div class="mmyt-feed">${VIDEOS.map(v => `<button type="button" class="mmyt-card" data-action="mmyt-watch" data-id="${v.id}">${thumb(v, 'big')}<span class="mmyt-ctitle">${esc(c, v.title)}</span><span class="mmyt-cmeta">${esc(c, t.plural('author_and_views', v.views, null, v.ch, num(c, v.views)))}</span><img class="mmyt-anchor" src="${A('contextual_menu_anchor_normal')}" alt=""></button>`).join('')}</div>`;
  }
  function subsPage(c) {
    const list = VIDEOS.filter(v => subs(c).includes(v.ch));
    return list.length ? `<div class="mmyt-feed">${list.map(v => `<button type="button" class="mmyt-card" data-action="mmyt-watch" data-id="${v.id}">${thumb(v, 'big')}<span class="mmyt-ctitle">${esc(c, v.title)}</span><span class="mmyt-cmeta">${esc(c, T().plural('author_and_views', v.views, null, v.ch, num(c, v.views)))}</span></button>`).join('')}</div>` : `<div class="mmyt-empty"><img src="${A('ic_tab_subscriptions')}" alt=""></div>`;
  }
  function account(c) {
    const t = T();
    return `<div class="mmyt-acct"><div class="mmyt-ahead"><img src="assets/gm-avatar_placeholder.png" alt=""><b>${esc(c, MM.account.name)}</b><small>${esc(c, MM.account.email)}</small></div>
      <button type="button" class="mmyt-arow" data-action="mmyt-screen" data-s="history">${esc(c, t.t('channel_watch_history'))}</button><button type="button" class="mmyt-arow" data-action="mmyt-screen" data-s="later">${esc(c, t.t('channel_watch_later'))}</button>${yt(c).playlists.map((p, i) => `<button type="button" class="mmyt-arow" data-action="mmyt-screen" data-s="pl:${i}">${esc(c, p.title)}</button>`).join('')}<button type="button" class="mmyt-arow" data-action="mmyt-settings">${esc(c, t.t('settings'))}</button><button type="button" class="mmyt-arow" data-action="mmyt-help">${esc(c, t.t('menu_help'))}</button></div>`;
  }
  function watch(c, v) {
    const t = T(), u = ui(c), pos = position(u), subbed = subs(c).includes(v.ch);
    const next = VIDEOS.filter(x => x.id !== v.id);
    return `<div class="mmyt mmyt-watch"><div class="mmyt-player" data-action="mmyt-toggle">${MM.media.svg({id: `ytp${v.id}`, seed: v.seed, time: Date.now() - v.age}, 'mmyt-psvg', 16 / 9)}
      <span class="mmyt-ctl"><img src="${A(u.playing ? 'ic_media_pause' : 'ic_media_play')}" alt=""></span><span class="mmyt-time">${dur(Math.floor(pos))} / ${dur(v.len)}</span><i class="mmyt-bar"><i style="width:${(pos / v.len * 100).toFixed(2)}%"></i></i>
      <button type="button" class="mmyt-mini" data-action="mmyt-close"><img src="${A('ic_miniplayer')}" alt=""></button></div>
      <div class="mmyt-wpage"><div class="mmyt-info"><h1>${esc(c, v.title)}</h1><span>${esc(c, t.plural('age_and_views', v.views, null, ago(c, v.age), num(c, v.views)))}</span>
        <div class="mmyt-acts"><button type="button" data-action="mmyt-like"><img src="${A('ic_like')}" alt=""><small>${num(c, Math.round(v.views / 37))}</small></button><button type="button" data-action="mmyt-like"><img src="${A('ic_dislike')}" alt=""><small>${num(c, Math.round(v.views / 900))}</small></button><button type="button" data-action="mmyt-share" aria-label="${esc(c, t.t('menu_share'))}"><img src="${A('ic_share')}" alt=""></button><button type="button" data-action="mmyt-addto" aria-label="${esc(c, t.t('accessibility_addto'))}"><img src="${A('ic_overflow_addtoplaylist')}" alt=""></button></div></div>
        <div class="mmyt-chan"><span class="mmpp-tile round mmyt-cav" style="background:${MM.people.COLORS[v.seed % 14]}"><b>${v.ch[0]}</b></span><b>${esc(c, v.ch)}</b><button type="button" class="mmyt-sub${subbed ? ' on' : ''}" data-action="mmyt-sub" data-ch="${esc(c, v.ch)}">${esc(c, t.t(subbed ? 'subscribed' : 'subscribe'))}</button></div>
        ${next.map(x => `<button type="button" class="mmyt-compact" data-action="mmyt-watch" data-id="${x.id}">${thumb(x, 'small')}<span class="mmyt-ctext"><b>${esc(c, x.title)}</b><small>${esc(c, x.ch)}</small><small>${esc(c, t.plural('age_and_views', x.views, null, ago(c, x.age), num(c, x.views)))}</small></span></button>`).join('')}</div></div>`;
  }
  const position = u => Math.min(VIDEOS.find(v => v.id === u.watch)?.len || 0, u.pos + (u.playing ? (Date.now() - u.started) / 1000 : 0));
  function render(c) {
    const t = T(), u = ui(c);
    if (u.watch) { const v = VIDEOS.find(x => x.id === u.watch); if (v) return watch(c, v); }
    if (u.search) return searchPage(c);
    if (u.screen === 'history') return listPage(c, t.t('channel_watch_history'), yt(c).history, t.t('no_watch_history_found'));
    if (u.screen === 'later') return listPage(c, t.t('channel_watch_later'), yt(c).later, t.t('no_results_found'));
    if (u.screen?.startsWith('pl:')) { const p = yt(c).playlists[+u.screen.slice(3)]; if (p) return listPage(c, p.title, p.videos, t.t('no_results_found')); }
    const tabs = ['ic_tab_home', 'ic_tab_subscriptions', 'ic_tab_account'];
    return `<div class="mmyt"><div class="mmyt-head"><div class="mmyt-bar1"><img class="mmyt-logo" src="${A('action_bar_logo_release')}" alt="YouTube"><i class="mmyt-flex"></i><button type="button" class="mmyt-btn" data-action="mmyt-search" aria-label="${esc(c, t.t('search_hint'))}"><img src="${A('ic_menu_search_mtrl_alpha')}" alt=""></button><button type="button" class="mmyt-btn" data-action="mmyt-menu"><img src="${A('abc_ic_menu_moreoverflow_mtrl_alpha')}" alt=""></button></div>
      <div class="mmyt-tabs">${tabs.map((ic, i) => `<button type="button" class="${u.tab === i ? 'on' : ''}" data-action="mmyt-tab" data-tab="${i}"><img src="${A(ic)}" alt=""></button>`).join('')}<i class="mmyt-under" style="transform:translateX(${u.tab * 100}%)"></i></div></div>
      <div class="mmyt-page">${[feed, subsPage, account][u.tab](c)}</div></div>`;
  }
  let timer = 0;
  function tick(c) {
    clearInterval(timer);
    timer = setInterval(() => {
      const u = ui(c); if (!u.playing || c.ui.view !== 'youtube') { clearInterval(timer); return; }
      const v = VIDEOS.find(x => x.id === u.watch), pos = position(u), root = c.el.viewport;
      if (pos >= v.len) { u.pos = v.len; u.playing = false; c.render(); return; }
      const bar = root.querySelector('.mmyt-bar i'), time = root.querySelector('.mmyt-time');
      if (bar) bar.style.width = `${(pos / v.len * 100).toFixed(2)}%`; if (time) time.textContent = `${dur(Math.floor(pos))} / ${dur(v.len)}`;
    }, 500);
  }
  // A search: kept at the top of the past searches, the results listed.
  function go(c, q) { const u = ui(c), d = yt(c); u.search.q = q; u.search.done = q; if (!MM.appPref(c,'youtube','pause_search_history',false)) d.searches = [q.toLowerCase(), ...d.searches.filter(x => x !== q.toLowerCase())].slice(0, 20); c.save(); c.render(); }
  MM.register('youtube', {
    // The window animation's page (mm-core.js): deeper screens open over the ones they came from.
    page: c => { const u = c.ui.youtube || {}; return MM.page('youtube', u.screen, u.search && 'search', u.search?.done && 'results', u.watch && 'watch'); },
    mount(c, root) {
      const f = root.querySelector('.mmyt-sfield'), u = ui(c); if (!f) return;
      f.addEventListener('input', () => { u.search.q = f.value; const pos = f.selectionStart; c.render(); const g = c.el.viewport.querySelector('.mmyt-sfield'); g?.focus(); g?.setSelectionRange(pos, pos); });
      f.addEventListener('keydown', e => { if (e.key === 'Enter' && f.value.trim()) { e.preventDefault(); go(c, f.value.trim()); } });
      if (!u.search.done) setTimeout(() => f.focus(), 30);
    },
    statusColor: c => ui(c).watch ? '#000' : '#ba1b12',
    render,
    back(c) {
      const u = ui(c);
      if (u.watch) { u.pos = position(u); u.playing = false; u.watch = 0; c.render(); return true; }
      if (u.search) { if (u.search.done) u.search.done = ''; else u.search = null; c.render(); return true; }
      if (u.screen) { u.screen = ''; c.render(); return true; }
      if (u.tab) { u.tab = 0; c.render(); return true; }
      return false;
    },
    action(name, el, event, c) {
      const u = ui(c), t = T();
      switch (name) {
        case 'mmyt-tab': u.tab = +el.dataset.tab; c.render(); return true;
        case 'mmyt-watch': { const h = yt(c); if (!MM.appPref(c,'youtube','pause_watch_history',false)) h.history = [+el.dataset.id, ...h.history.filter(x => x !== +el.dataset.id)].slice(0, 50); c.save(); }
          u.watch = +el.dataset.id; u.pos = 0; u.playing = true; u.started = Date.now(); c.render(); c.el.viewport.querySelector('.mmyt-wpage')?.scrollTo(0, 0); tick(c); return true;
        case 'mmyt-toggle': if (event?.target?.closest('.mmyt-mini')) return false; if (u.playing) { u.pos = position(u); u.playing = false; } else { u.playing = true; u.started = Date.now(); tick(c); } c.render(); return true;
        case 'mmyt-close': u.pos = position(u); u.playing = false; u.watch = 0; c.render(); return true;
        case 'mmyt-sub': { const ch = el.dataset.ch, list = subs(c); c.data.ytSubs = list.includes(ch) ? list.filter(x => x !== ch) : [...list, ch]; c.save(); c.render(); return true; }
        case 'mmyt-like': el.classList.toggle('on'); return true;
        case 'mmyt-search': u.search = {q: '', done: ''}; c.render(); return true;
        case 'mmyt-sback': c.back(); return true;
        case 'mmyt-sclear': u.search.q = ''; u.search.done = ''; c.render(); return true;
        case 'mmyt-sgo': go(c, el.dataset.q); return true;
        case 'mmyt-sedit': u.search.q = `${el.dataset.q} `; u.search.done = ''; c.render(); return true;
        case 'mmyt-screen': u.screen = el.dataset.s; c.render(); return true;
        case 'mmyt-up': c.back(); return true;
        case 'mmyt-settings': MM.openPrefs(c, 'youtube', 'preference_headers', t.t('settings')); return true;
        case 'mmyt-help': c.open('help', 'youtube'); return true;
        case 'mmyt-menu': c.menu([{label: t.t('settings'), action: c => MM.openPrefs(c, 'youtube', 'preference_headers', t.t('settings'))}, {label: t.t('menu_help'), action: c => c.open('help', 'youtube')}]); return true;
        // The watch page's share: share_subject and share_text (title: URL) through the chooser; the URL is made up like the videos.
        case 'mmyt-share': { const v = VIDEOS.find(x => x.id === ui(c).watch); if (!v) return true; const link = `https://youtu.be/mm601v${v.seed}`;
          MM.share(c, {title: t.t('menu_share'), subject: AndroidStrings.format(t.t('share_subject'), v.title), text: AndroidStrings.format(t.t('share_text'), v.title, link)}); return true; }
        case 'mmyt-addto': { const v = VIDEOS.find(x => x.id === u.watch); if (v) addTo(c, v); return true; }
      }
      return false;
    }
  });
  const oldPrefsClick=MM.appPrefsHooks.youtube.click;
  MM.appPrefsHooks.youtube.click=(c,key,node)=>{
    if(!['clear_watch_history','clear_search_history'].includes(key))return oldPrefsClick?.(c,key,node)||false;
    const watch=key==='clear_watch_history',title=T().t(watch?'pref_clear_watch_history_title':'pref_clear_search_history_title');
    c.dialog({title,...(watch?{message:T().t('confirm_clear_watch_history')}:{}),buttons:[{label:MM.text('framework').t('cancel')},{label:MM.text('framework').t('ok'),action:c=>{yt(c)[watch?'history':'searches']=[];c.save();c.render();}}]});return true;
  };
})();
