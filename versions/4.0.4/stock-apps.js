/* Three Google apps of the Galaxy Nexus image (IMM76I, spring 2012) as working screens with their APKs' drawables and
   texts (stock-strings.js): Maps 6.4.0 with Latitude (map_view_default.xml's bar, the feature switcher, layers, my
   location; Directions through maps-route.js), Earth 6.1 (Theme.Earth's overlay bar over a turning globe) and News &
   Weather 1.3.04 (GenieWidget: Weather, Top Stories and topics, its settings and story view). Content is offline and
   made up. */
(() => {
  'use strict';
  const S = (ctx, app, key) => { const row = window.StockStrings?.[app]?.[key]; return row ? AndroidStrings.pick(row, String(ctx.locale || 'en').slice(0, 2), key) : ctx.t(key); };
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const ICON = {
    search: '<svg viewBox="0 0 24 24"><path d="M10 3a7 7 0 0 1 5.6 11.2l5.6 5.6-1.4 1.4-5.6-5.6A7 7 0 1 1 10 3zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" fill="currentColor"/></svg>',
    overflow: '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="19" r="2" fill="currentColor"/></svg>',
    mic: '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    locate: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill="currentColor"/><circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 1v3.5M12 19.5V23M1 12h3.5M19.5 12H23" stroke="currentColor" stroke-width="1.8"/></svg>',
    directions: '<svg viewBox="0 0 24 24"><path d="M12 2 22 12 12 22 2 12zm1 7V7l-4 4v4h2v-3h2v2l3-3z" fill="currentColor"/></svg>',
    add: '<svg viewBox="0 0 24 24"><path d="M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7z" fill="currentColor"/></svg>',
    list: '<svg viewBox="0 0 24 24"><path d="M4 6h2v2H4zm4 0h12v2H8zm-4 5h2v2H4zm4 0h12v2H8zm-4 5h2v2H4zm4 0h12v2H8z" fill="currentColor"/></svg>',
    camera: '<svg viewBox="0 0 24 24"><path d="M9 4 7.2 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3.2L15 4zm3 13a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" fill="currentColor"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M9 3h6l1 2h4v2H4V5h4zM6 8h12l-1 13H7z" fill="currentColor"/></svg>',
    folder: '<svg viewBox="0 0 24 24"><path d="M3 5h7l2 2h9v12H3z" fill="currentColor"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/></svg>',
    like: '<svg viewBox="0 0 24 24"><path d="M2 10h4v11H2zm6 11V10l5-8 1.2.6c.6.4.9 1.1.7 1.8L14 9h6a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 18.6 21z" fill="currentColor"/></svg>',
    share: '<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3" fill="currentColor"/><circle cx="6" cy="12" r="3" fill="currentColor"/><circle cx="18" cy="19" r="3" fill="currentColor"/><path d="m6 12 12-7M6 12l12 7" stroke="currentColor" stroke-width="1.6"/></svg>',
    chevron: '<svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>'
  };
  const btn = (action, label, icon, id = '') => `<button class="sa-btn" data-action="${action}"${id ? ` data-id="${e(id)}"` : ''} aria-label="${e(label)}">${ICON[icon]}</button>`;
  // Action buttons with the apps' own drawables (assets/<prefix>-*.png).
  const img = (action, label, src, cls = '') => `<button class="sa-btn${cls ? ' ' + cls : ''}" data-action="${action}" aria-label="${e(label)}"><img src="assets/${src}" alt=""></button>`;
  function bar(ctx, {title, subtitle = '', up = false, icon, actions = '', cls = ''}) {
    return `<header class="sa-bar${cls}"><button class="sa-up" data-action="${up ? 'back' : 'home'}" aria-label="${e(ctx.t(up ? 'Back' : 'Home'))}">${up ? `<img class="sa-caret" src="assets/${/dark/.test(cls) ? 'ic_ab_back_holo_dark.png' : 'ic_ab_back_holo_light.png'}" alt="">` : ''}<img src="assets/${icon}" alt=""></button><span class="sa-title"><b>${e(title)}</b>${subtitle ? `<small>${e(subtitle)}</small>` : ''}</span>${actions}</header>`;
  }
  const thumb = (seed, label = '') => {
    const p = [['#2b5876', '#f4d06f'], ['#6d2e46', '#f6a5c0'], ['#1e5128', '#d8e9a8'], ['#22313f', '#ff8c42'], ['#4a3b8f', '#9bd1f2'], ['#7a1f1f', '#ffd166']][seed % 6];
    return `<svg class="sa-thumb" viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="160" height="90" fill="${p[0]}"/><circle cx="${40 + seed * 17 % 80}" cy="38" r="22" fill="${p[1]}" opacity=".85"/><path d="M0 70 Q40 ${44 + seed % 3 * 6} 80 66 T160 60 V90 H0Z" fill="${p[1]}" opacity=".45"/>${label ? `<text x="8" y="82" font-family="Arial" font-size="11" fill="#fff">${e(label)}</text>` : ''}</svg>`;
  };


  // ---- Maps 6.4.0 (with Latitude): the drawn map ----
  function mapSvg(ctx) {
    const pin = ctx.ui.mapsQuery ? '<g transform="translate(222 190)"><path d="M0-34a14 14 0 0 0-14 14c0 11 14 26 14 26s14-15 14-26A14 14 0 0 0 0-34z" fill="#db4437"/><circle cy="-20" r="5" fill="#fff"/></g>' : '';
    return `<svg class="sa-map" viewBox="0 0 360 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="360" height="600" fill="#ece8df"/><path d="M-10 430c80-20 120 10 200-10s140-60 180-50v240H-10z" fill="#a9cdee"/><rect x="30" y="80" width="110" height="90" fill="#cde5b4"/><rect x="230" y="300" width="90" height="70" fill="#cde5b4"/><g stroke="#fff" stroke-width="7" fill="none"><path d="M-10 200H370M-10 330H370M90 -10V620M260 -10V620"/></g><g stroke="#f7d36b" stroke-width="10" fill="none"><path d="M-10 260C80 250 140 280 200 240S320 200 370 210"/><path d="M180 -10C170 120 200 200 190 300S160 460 170 620"/></g><g stroke="#fff" stroke-width="3" fill="none"><path d="M-10 120H370M-10 380H370M40 -10V620M150 -10V620M320 -10V620"/></g><text x="50" y="130" font-family="Arial" font-size="12" fill="#5b8a46">${e(ctx.t('City Park'))}</text><text x="210" y="470" font-family="Arial" font-size="12" fill="#4a77a8" font-style="italic">${e(ctx.t('Bay'))}</text>${window.MapsRoute?.svg(ctx) || pin}${ctx.latitude ? latPins(ctx) : ''}<circle cx="180" cy="300" r="22" fill="#4285f4" opacity=".18"/><circle cx="180" cy="300" r="8" fill="#4285f4" stroke="#fff" stroke-width="3"/></svg>`;
  }
  // Maps 6.4.0 (IMM76I): res/menu/map_view_default.xml puts Search, Directions, Places and Layers in the bar
  // (ic_menu_* at 320 dpi) and Clear map, Settings and Help in the overflow; the Maps title opens
  // the feature switcher (FEATURE_SWITCHER_*: Map, Local, Latitude, GPS navigation, Traffic); the map carries the
  // my-location button (btn_myl_normal) and the zoom controls (btn_zoom_up / _down_normal). Layers toggles the map's
  // Traffic / Satellite / Terrain / Bicycling look.
  /* Latitude (LatitudeActivity, a translucent trampoline into MapsActivity): the same map under map_view_latitude.xml,
     whose bar holds the prev / next friend arrows (ic_menu_prev_normal / ic_menu_next_normal, 240 dpi v14) and whose
     never items fill the overflow (Clear map, Directions, Layers, Settings, Help). Its "list" item has no icon and
     takes its title from Maps' server-side text bundle, so it is left out. The friends are server data, so they are
     made up (2.3.6 Latitude's): their pins on the map, and the bar's arrows step through me and them, the one on show
     in the card (name, where, how long ago). The title opens the same feature switcher. */
  const LAT_FRIENDS = [{name: 'Alex Morgan', place: 'City Park', x: 88, y: 140, minutes: 4}, {name: 'Sam Rivera', place: 'Market St', x: 118, y: 232, minutes: 12}, {name: 'Taylor Lee', place: 'Harbor Rd', x: 268, y: 405, minutes: 38}, {name: 'Mom', place: 'Elm St', x: 300, y: 150, minutes: 95}];
  const latPins = ctx => LAT_FRIENDS.map((f, i) => `<g class="sa-lat-pin${ctx.ui.latIndex === i + 1 ? ' on' : ''}" transform="translate(${f.x} ${f.y})"><circle r="${ctx.ui.latIndex === i + 1 ? 15 : 12}" fill="${['#e8710a', '#0f9d58', '#ab47bc', '#db4437'][i]}" stroke="#fff" stroke-width="3"/><text y="5" text-anchor="middle" font-family="Arial" font-size="13" font-weight="bold" fill="#fff">${e(f.name[0])}</text></g>`).join('');
  function latCard(ctx) {
    const i = ctx.ui.latIndex; if (i == null || i < 0) return '';
    const f = i ? LAT_FRIENDS[i - 1] : null, ago = n => n < 60 ? AndroidStrings.format(ctx.t('%d min ago'), n) : AndroidStrings.format(ctx.t('%d hours ago'), Math.round(n / 60));
    return `<div class="sa-maps-card sa-lat-card"><b>${e(f ? f.name : ctx.t('Me'))}</b><small>${e(f ? `${f.place} · ${ago(f.minutes)}` : ctx.t('My Location'))}</small></div>`;
  }
  function maps(ctx) {
    // Settings (and My Places / Your places): maps-prefs.js.
    if (window.MapsPrefs?.active(ctx.ui)) return MapsPrefs.render({...ctx, account: 'icecream.demo@gmail.com', bar: title => bar(ctx, {title, up: true, icon: 'maps.png'})});
    // The tiles the map shows are in the cache (Cache settings' Clear cache); kept with the next save.
    ctx.data.mapsCache = true;
    // Directions: the input panel and the route list of maps-route.js.
    if (window.MapsRoute?.has(ctx.ui)) return MapsRoute.render({...ctx, bar: o => bar(ctx, o)});
    const q = ctx.ui.mapsQuery || '', searching = ctx.ui.mapsSearching || q, mp = key => S(ctx, 'maps', key), layer = ctx.data.mapsLayer || '';
    const lat = ctx.latitude;
    const actions = lat ? img('maps-lat-step', 'Previous', 'mp6-ic_menu_prev_normal.png').replace('data-action="maps-lat-step"', 'data-action="maps-lat-step" data-id="-1"') + img('maps-lat-step', 'Next', 'mp6-ic_menu_next_normal.png').replace('data-action="maps-lat-step"', 'data-action="maps-lat-step" data-id="1"') + btn('sa-menu', ctx.t('More options'), 'overflow')
      : img('maps-search-open', mp('Search'), 'mp6-ic_menu_search.png') + img('mr-open', mp('Directions'), 'mp6-ic_menu_directions.png') + img('maps-places', mp('Local'), 'mp6-ic_menu_places.png') + img('maps-layers', mp('Layers'), 'mp6-ic_menu_layers.png') + btn('sa-menu', ctx.t('More options'), 'overflow');
    const head = bar(ctx, {title: mp(lat ? 'Latitude' : 'Maps'), icon: lat ? 'latitude.png' : 'maps.png', actions}).replace('<span class="sa-title">', '<span class="sa-title sa-maps6-switcher" data-action="maps-switcher" role="button">');
    return `<div class="app-view sa-app sa-maps sa-maps6">${head}<div class="sa-maps6-map${layer ? ' layer-' + layer : ''}">${mapSvg(ctx)}${window.MapsRoute?.banner(ctx) || ''}${lat ? latCard(ctx) : ''}<button class="sa-maps6-myl" data-action="maps-locate" aria-label="My Location"><img src="assets/mp6-btn_myl_normal.png" alt=""></button><span class="sa-maps6-zoom"><button data-action="maps-zoom" data-id="1" aria-label="+"><img src="assets/mp6-btn_zoom_up_normal.png" alt=""></button><button data-action="maps-zoom" data-id="-1" aria-label="-"><img src="assets/mp6-btn_zoom_down_normal.png" alt=""></button></span></div>${searching ? `<form class="sa-maps6-search" data-form="maps-search"><input name="query" autocomplete="off" placeholder="${e(mp('Search Maps'))}" aria-label="${e(mp('Search Maps'))}" value="${e(q)}"></form>` : ''}${q ? `<div class="sa-maps-card"><b>${e(q)}</b><small>${e(ctx.t('0.8 mi · 4 min drive'))}</small>${img('mr-open', mp('Directions'), 'mp6-ic_menu_directions.png').replace('data-action="mr-open"', `data-action="mr-open" data-id="${e(q)}"`)}</div>` : ''}</div>`;
  }


  // ---- Drive (2013): My Drive ----
  const kindColor = {folder: '#8f8f8f', doc: '#4285f4', sheet: '#0f9d58', pdf: '#db4437', slides: '#f4b400'};

  // ---- Keep (2013): the quick note bar and coloured cards; notes are kept in data.keepNotes ----
  const KEEP_COLORS = ['#fff', '#f7f0a3', '#c6e5f5', '#c9f0b9', '#f8c8c0'];

  // ---- YouTube (2013): What to Watch and a player ----

  // ---- Google+ (2013): the Home stream ----

  // ---- Earth 6.1 (IMM76I): Theme.Earth's overlay ActionBar on header_bar_bg_80_percent_black with menu-v11/main.xml's
  // four always-shown actions (Search, Layers, North up, My Location); the rest of the menu is in the overflow. ----
  function earthBar(ctx) {
    const ea = key => S(ctx, 'earth', key), icon = (action, label, src) => `<button class="sa-btn" data-action="${action}" aria-label="${e(label)}"><img src="assets/${src}" alt=""></button>`;
    return `<header class="sa-earth6-bar"><button class="sa-up" data-action="home" aria-label="${e(ea('Earth'))}"><img src="assets/earth.png" alt=""></button><span class="sa-title"><b>${ctx.ui.earthSearching ? '' : e(ctx.ui.earthQuery || ea('Earth'))}</b></span>${ctx.ui.earthSearching ? `<form class="sa-earth-field" data-form="earth-search"><input name="query" autocomplete="off" aria-label="${e(ea('Search'))}"></form>` : icon('earth-search-open', ea('Search'), 'ea6-ic_menu_search.png')}${icon('earth-layers', ea('Layers'), 'ea6-ic_menu_layers.png')}${icon('earth-north', ctx.t('North up'), 'ea6-ic_menu_northup.png')}${icon('earth-myloc', ea('My Location'), 'ea6-ic_menu_mylocation.png')}<button class="sa-btn" data-action="sa-menu" aria-label="${e(ctx.t('More options'))}"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button></header>`;
  }
  function earth(ctx) {
    if (window.EarthApp.active(ctx.ui)) return window.EarthApp.render({...ctx.earthCtx, bar: title => bar(ctx, {title, up: true, icon: 'earth.png', cls: ' dark'})});
    return `<div class="app-view sa-app sa-earth"><div class="sa-stars"></div>${window.EarthApp.canvas()}${earthBar(ctx)}${window.EarthApp.overlay(ctx.earthCtx)}</div>`;
  }

  // ---- News & Weather (2013, Holo dark): Weather, Top Stories and topics ----
  const STORIES = {
    'Top Stories': [['Android 4.0.4 rolls out to the Galaxy Nexus', 'Tech Daily', '2 hours ago'], ['City marathon draws record crowd', 'Metro News', '4 hours ago'], ['Researchers map the ocean floor in 3D', 'Science Today', '6 hours ago']],
    'Technology': [['Android Market becomes Google Play', 'Gadget Weekly', '1 hour ago'], ['Smart watches: the next big thing?', 'Droid Corner', '3 hours ago']],
    'Sports': [['Underdogs win the cup final', 'Sports Desk', '5 hours ago']]
  };
  // News & Weather 1.3.04 (GenieWidget.apk, IMM76I): no action bar (Theme.NoTitleBar), then 1.3.11's layouts:
  // tab_view_container_layout.xml's 52 dp tabs (12 sp, a 6 dp #33b5e5 bottom when selected), news_item_layout.xml rows
  // (80 dp, 16 sp bold white title, 14 sp #bfbfbf snippet, the 70 dp picture) on #1a1a1a, weather_current_view.xml in
  // bg_weather_panel_app with the APK's ic_weather_* icons and The Weather Channel's logo, weather_forecast_layout.xml.
  function news(ctx) {
    const n = key => S(ctx, 'news', key), NP = window.NewsPrefs, standard = ['Top Stories', 'Technology', 'Sports'];
    // NewsContent and Preferences take the application's default theme (Theme.Holo for targetSdkVersion 11): a dark
    // action bar; Share story sits in the story's overflow.
    const newsBar = title => bar(ctx, {title, up: true, icon: 'news-weather.png', cls: ' dark', actions: btn('sa-menu', ctx.t('More options'), 'overflow')});
    if (ctx.ui.newsSub === 'settings') return NP.render({data: ctx.data, ui: ctx.ui, lang: ctx.lang, locale: ctx.locale, N: n, t: ctx.t, standard, topic: name => ctx.t(name), version: '1.3.04', bar: title => bar(ctx, {title, up: true, icon: 'news-weather.png', cls: ' dark'})});
    const [storyTab, storyIndex] = String(ctx.ui.newsStory || '').split(':'), story = ctx.ui.newsSub === 'story' && STORIES[storyTab]?.[Number(storyIndex)];
    if (story) return `<div class="app-view sa-app sa-news nw-story-view">${newsBar(story[0])}<div class="sa-scroll">${NP.story({title: story[0], source: story[1], time: ctx.t(story[2]), picture: Number(storyIndex) === 0 ? `<span class="nwp-picture">${thumb(2)}</span>` : ''})}</div></div>`;
    const metric = NP.metric(ctx.data, ctx.lang), deg = c => `${metric ? c : Math.round(c * 9 / 5 + 32)}°`;
    const tabs = ['Weather', ...NP.topics(ctx.data, standard)], tab = tabs.includes(ctx.ui.newsTab) ? ctx.ui.newsTab : tabs[1] || 'Weather';
    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], forecast = [[21, 13, 'partly_cloudy'], [23, 14, 'sunny'], [19, 12, 'cloudy'], [20, 11, 'chance_of_rain']];
    const body = tab === 'Weather'
      ? `<div class="nw-weather"><div class="nw-city"><b>${e(NP.city(ctx.data, 'Mountain View'))}</b><button data-action="sa-unsupported" aria-label="Info"><img src="assets/nw-weather_info_btn.png" alt=""></button></div><i class="nw-divider"></i><div class="nw-today"><img class="nw-twc" src="assets/nw-ic_weather_weather_channel.png" alt="The Weather Channel"><div class="nw-now"><img src="assets/nw-ic_weather_partly_cloudy_xl.png" alt=""><b>${deg(21)}</b></div><div class="nw-range"><span>${deg(21)}</span><span class="lo">${deg(13)}</span><p>${e(ctx.t('Partly cloudy'))}</p><small>${e(AndroidStrings.format(n('Humidity: %s%%'), 60))}</small><small>${e(AndroidStrings.format(n('Wind: %1$s %2$s'), metric ? '13' : '8', n(metric ? 'km/h' : 'mph')))}</small></div></div><i class="nw-divider"></i><div class="nw-forecast">${forecast.map(([hi, lo, icon], i) => `<div><span>${e(n(DAYS[new Date(ctx.now.getTime() + i * 864e5).getDay()]))}</span><img src="assets/nw-ic_weather_${icon}_s.png" alt=""><b>${deg(hi)}</b><small>${deg(lo)}</small></div>`).join('')}</div></div>`
      : STORIES[tab] ? `<div class="nw-list">${STORIES[tab].map(([title, source, time], i) => `<button class="nw-item${i === 0 ? ' pic' : ''}" data-action="news-story" data-id="${e(tab)}:${i}"><span><b>${e(title)}</b><small>${e(source)} - ${e(ctx.t(time))}</small></span>${i === 0 ? `<span class="nw-pic">${thumb(i + 2)}</span>` : ''}</button>`).join('')}</div>` : `<p class="nw-unavailable">${e(n("News isn't available right now."))}</p>`;
    return `<div class="app-view sa-app sa-news"><nav class="nw-tabs">${tabs.map(id => `<button class="${id === tab ? 'on' : ''}" data-action="news-tab" data-id="${e(id)}"${id === 'Weather' || standard.includes(id) ? '' : ' data-no-translate'}>${e(id === 'Weather' ? n('Weather') : standard.includes(id) ? ctx.t(id) : id)}</button>`).join('')}</nav><div class="sa-scroll">${body}</div></div>`;
  }

  const APPS = {maps, latitude: ctx => maps({...ctx, latitude: true}), earth, 'news-weather': news};
  function render(app, ctx) { return (APPS[app] || maps)(ctx); }
  // The overflow of the screen on show. GenieWidget 1.3.04 (IMM76I) res/menu/main_menu.xml: Refresh and Settings have no showAsAction, so both sit in the overflow.
  function menu(view, ctx) {
    if (view === 'latitude' && ctx.ui?.mapsMenu !== 'switcher') return [{action: 'maps-clear', title: S(ctx, 'maps', 'Clear map')}, {action: 'mr-open', title: S(ctx, 'maps', 'Directions')}, {action: 'maps-layers', title: S(ctx, 'maps', 'Layers')}, {action: 'mps-settings', id: 'settings', title: S(ctx, 'maps', 'Settings')}, {action: 'sa-unsupported', title: S(ctx, 'maps', 'Help')}];
    if (view === 'maps' || view === 'latitude') {
      const mp = key => S(ctx, 'maps', key);
      if (ctx.ui?.mapsMenu === 'switcher') return [{action: 'maps-feature', id: 'map', title: mp('Map')}, {action: 'maps-feature', id: 'local', title: `${mp('Local')} — ${mp('Find restaurants, bars & more')}`}, {action: 'maps-feature', id: 'latitude', title: `${mp('Latitude')} — ${mp('Find family & friends')}`}, {action: 'maps-feature', id: 'navigation', title: mp('GPS navigation')}, {action: 'maps-feature', id: 'traffic', title: mp('Traffic')}];
      if (ctx.ui?.mapsMenu === 'layers') return [['traffic', 'Traffic'], ['satellite', 'Satellite'], ['terrain', 'Terrain'], ['bicycling', 'Bicycling']].map(([id, key]) => ({action: 'maps-layer', id, title: mp(key)})).concat([{action: 'maps-layer', id: '', title: mp('Clear map')}]);
      return [{action: 'maps-clear', title: mp('Clear map')}, {action: 'mps-settings', id: 'settings', title: mp('Settings')}, {action: 'sa-unsupported', title: mp('Help')}];
    }
    if (view === 'earth') { const ea = key => S(ctx, 'earth', key); return [['Settings', 'earth-settings'], ['Help'], ['Terms Of Service']].map(([key, action = 'sa-unsupported']) => ({action, title: ea(key)})); }
    // main_menu.xml (Refresh, Settings), webview_menu.xml on a story (Share story), none on the settings.
    if (view === 'news-weather') { const n = key => S(ctx, 'news', key); return ctx.ui?.newsSub === 'settings' ? [] : ctx.ui?.newsSub === 'story' ? [{action: 'news-share', title: n('Share story')}] : [{action: 'sa-news-refresh', title: n('Refresh')}, {action: 'news-settings', title: n('Settings')}]; }
    return [];
  }
  window.StockApps = {mapSvg, render, menu, LAT_FRIENDS};
})();
