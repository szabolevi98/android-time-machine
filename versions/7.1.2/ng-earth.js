/* Google Earth 9.0.4.2 (installed from Play: _aosp/angler/playapps/GoogleEarth.apk, not part of N2G48C; see
   docs/sources.md). main.xml / common.xml: the EarthView under a transparent Toolbar with the drawer button and
   default_toolbar.xml (Search, Voyager, I'm Feeling Lucky and Create Postcard always shown; My Location and Share Link in
   the overflow), the Google logo at the bottom start, nav_controls.xml at the bottom end (Street View's pegman, the 2D /
   3D button, the compass), search_input_view.xml with the search results, and navigation_menu.xml in the drawer
   (Search, Voyager, My Places, Map Style; Settings, Send Feedback, Help) under the account header.
   The globe is earth-globe.js (NASA Blue Marble, kept locally). Search and I'm Feeling Lucky fly to a place of its list,
   My Location to the demo phone; the compass turns the heading back; Map Style's choice and 2D / 3D are kept but the
   globe has only its imagery; Settings is the APK's settings.xml (ng-appprefs). Voyager's stories, postcards, Street
   View, My Places' KML files and Google's help and feedback pages keep the simulator's limit. */
(() => {
  'use strict';
  const T = () => NG.text('earth'), t = k => T().t(k);
  const U = c => c.ui.earth ||= {search: false, query: '', drawer: false, panel: '', place: '', myloc: false};
  const D = c => (c.data.earth9 ||= {style: 0, three: false});
  const view = {lon: -100, lat: 25, zoom: 1, heading: 0, spin: true};
  const VERSION = '9.0.4.2';
  // Map Style's base layers came from Google's servers: the simulator's own names for Earth 9's three.
  const STYLES = ['Clean', 'Exploration', 'Everything'];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[ch]));
  const icon = (action, label, src, extra = '') => `<button type="button" class="ngea-btn" data-action="${action}" aria-label="${esc(label)}"${extra}><img src="assets/ea9-${src}.png" alt=""></button>`;
  const refuse = c => c.toast(c.t('This feature is not part of the simulator.'));
  // The search results: the places whose name starts with (or contains) the query.
  function results(c, q) {
    const s = String(q || '').trim().toLowerCase(); if (!s) return [];
    const seen = new Set(), out = [];
    for (const [names, lon, lat, zoom] of EarthGlobe.PLACES) {
      const name = names.find(n => n.startsWith(s)) || names.find(n => n.includes(s)); if (!name) continue;
      const key = `${lon},${lat}`; if (seen.has(key)) continue; seen.add(key);
      out.push({name: name.replace(/\b\p{L}/gu, ch => ch.toUpperCase()), lon, lat, zoom});
    }
    return out.slice(0, 8);
  }
  function render(c) {
    const u = U(c), d = D(c), e = s => c.safe(s);
    const bar = u.search
      ? `<div class="ngea-searchbar"><button type="button" class="ngea-btn" data-action="ngea-search-back" aria-label="${e(t('btn_back'))}"><img src="assets/ea9-quantum_ic_arrow_back_white_24.png" alt=""></button><input class="ngea-input" autocomplete="off" value="${e(u.query)}" placeholder="${e(t('search_hint'))}" aria-label="${e(t('search_hint'))}">${u.query ? `<button type="button" class="ngea-btn" data-action="ngea-search-clear" aria-label="${e(t('search_clear'))}"><img src="assets/ea9-quantum_ic_clear_white_24.png" alt=""></button>` : `<button type="button" class="ngea-btn" data-action="ngea-voice" aria-label="Voice search"><img src="assets/ea9-quantum_ic_keyboard_voice_white_24.png" alt=""></button>`}</div>`
      : `<header class="ngea-bar">${icon('ngea-drawer', t('menu_nav_drawer'), 'quantum_ic_menu_white_24')}<span class="ngea-fill"></span>${icon('ngea-search', t('search_id'), 'quantum_ic_search_white_24')}${icon('ngea-voyager', t('menu_explore'), 'voyager_white')}${icon('ngea-lucky', t('menu_im_feeling_lucky'), 'quantum_ic_casino_white_24', ' style="--rot:20deg"')}${icon('ngea-postcard', t('menu_postcard'), 'quantum_ic_photo_camera_white_24')}${NG.menu.button(c, 'ngea-more')}</header>`;
    const list = u.search && u.query.trim() ? (() => { const r = results(c, u.query); return `<div class="ngea-results">${r.length ? r.map((p, i) => `<button type="button" class="ngea-result" data-action="ngea-go" data-index="${i}"><img src="assets/ea9-quantum_ic_place_grey600_24.png" alt=""><span>${e(p.name)}</span></button>`).join('') : `<p class="ngea-empty">${e(t('search_no_results'))}</p>`}</div>`; })() : '';
    const card = u.place && !u.search ? `<div class="ngea-card"><b>${e(u.place)}</b></div>` : '';
    const nav = `<div class="ngea-nav"><button type="button" class="ngea-round" data-action="ngea-pegman" aria-label="${e(t('menu_street_view'))}"><img src="assets/ea9-pegman.png" alt=""></button><button type="button" class="ngea-round ngea-3d" data-action="ngea-3d">${e(t(d.three ? 'g_2d' : 'g_3d'))}</button><button type="button" class="ngea-round" data-action="ngea-north" aria-label="${e(t('menu_compass'))}"><img class="ngea-compass" src="assets/ea9-ic_compass.png" alt=""></button></div>`;
    const drawer = u.drawer ? `<div class="ngea-scrim" data-action="ngea-drawer"></div><nav class="ngea-drawer"><div class="ngea-account"><img src="assets/ea9-avatar_placeholder.png" alt=""><small>${e(NG.account?.email || '')}</small></div>${[
      ['ngea-search', 'quantum_ic_search_grey600_24', 'search_id'], ['ngea-voyager', 'voyager_white', 'menu_explore'], ['ngea-places', 'quantum_ic_turned_in_grey600_24', 'msg_my_places'], ['ngea-style', 'quantum_ic_layers_grey600_24', 'layers_map_style']
    ].map(([a, i, k]) => `<button type="button" data-action="${a}"><img src="assets/ea9-${i}.png" alt=""${i === 'voyager_white' ? ' class="tint"' : ''}><span>${e(t(k))}</span></button>`).join('')}<hr>${[
      ['ngea-settings', 'quantum_ic_settings_grey600_24', 'menu_settings'], ['ngea-feedback', 'quantum_ic_feedback_grey600_24', 'menu_send_feedback'], ['ngea-help', 'quantum_ic_help_grey600_24', 'menu_help']
    ].map(([a, i, k]) => `<button type="button" data-action="${a}"><img src="assets/ea9-${i}.png" alt=""><span>${e(t(k))}</span></button>`).join('')}</nav>` : '';
    const panel = u.panel === 'places' ? `<div class="ngea-panel"><header>${icon('ngea-panel-close', t('btn_back'), 'quantum_ic_arrow_back_white_24')}<b>${e(t('msg_my_places'))}</b></header><p>${e(t('my_places_no_places_added'))}</p></div>`
      : u.panel === 'style' ? `<div class="ngea-panel"><header>${icon('ngea-panel-close', t('btn_back'), 'quantum_ic_arrow_back_white_24')}<b>${e(t('layers_map_style'))}</b></header>${STYLES.map((s, i) => `<button type="button" class="ngea-style${d.style === i ? ' on' : ''}" data-action="ngea-style-set" data-index="${i}" role="radio" aria-checked="${d.style === i}"><span>${e(c.t(s))}</span></button>`).join('')}</div>` : '';
    return `<div class="ngea"><canvas class="ngea-globe"></canvas><img class="ngea-logo" src="assets/ea9-googlelogo_white_color.png" alt="Google">${nav}${card}${bar}${list}${panel}${drawer}</div>`;
  }
  function mount(c, root) {
    const u = U(c), canvas = root.querySelector('.ngea-globe');
    if (canvas) EarthGlobe.mount(canvas, view, {marker: u.myloc ? {...EarthGlobe.HOME, src: 'assets/ea9-quantum_ic_place_googblue_48.png', size: 32} : null});
    const input = root.querySelector('.ngea-input');
    if (input) {
      input.addEventListener('input', () => { u.query = input.value; const at = input.selectionStart; c.render(); const f = c.el.viewport.querySelector('.ngea-input'); if (f) { f.focus(); f.setSelectionRange(at, at); } });
      input.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); const r = results(c, u.query); if (r[0]) go(c, r[0]); else c.toast(AndroidStrings.format(t('search_not_found'), u.query.trim())); } });
      if (u.focus) { u.focus = false; requestAnimationFrame(() => input.focus()); }
    }
  }
  function go(c, p) { const u = U(c); Object.assign(u, {search: false, place: p.name, myloc: false}); EarthGlobe.flyTo(view, p); c.render(); }
  // The overflow: default_toolbar.xml's ifRoom items, which do not fit beside the four always-shown ones.
  const overflow = c => [{label: t('menu_current_location'), action: c => { const u = U(c); Object.assign(u, {myloc: true, place: ''}); EarthGlobe.myLocation(view); c.render(); }},
    {label: t('menu_share'), action: c => NG.share(c, {title: t('menu_share'), subject: t('app_name'), text: `https://earth.google.com/web/@${view.lat.toFixed(5)},${view.lon.toFixed(5)},0a,${Math.round(8000000 / view.zoom)}d`})}];
  function action(name, el, ev, c) {
    if (name === 'ng-menu') { c.menu(overflow(c), el); return true; }
    if (!name.startsWith('ngea-')) return false;
    const u = U(c), d = D(c);
    switch (name.slice(5)) {
      case 'drawer': u.drawer = !u.drawer; break;
      case 'search': Object.assign(u, {search: true, drawer: false, panel: '', focus: true}); break;
      case 'search-back': u.search = false; break;
      case 'search-clear': u.query = ''; u.focus = true; break;
      case 'go': go(c, results(c, u.query)[+el.dataset.index]); return true;
      case 'lucky': { const all = EarthGlobe.PLACES, [names, lon, lat, zoom] = all[Math.floor(Math.random() * all.length)]; go(c, {name: names[0].replace(/\b\p{L}/gu, ch => ch.toUpperCase()), lon, lat, zoom}); return true; }
      case 'north': EarthGlobe.north(view); return true;
      case '3d': d.three = !d.three; c.save(); break;
      case 'places': u.drawer = false; u.panel = 'places'; break;
      case 'style': u.drawer = false; u.panel = 'style'; break;
      case 'style-set': d.style = +el.dataset.index; c.save(); break;
      case 'panel-close': u.panel = ''; break;
      case 'settings': u.drawer = false; c.render(); NG.openPrefs(c, 'earth', 'settings', t('menu_settings')); return true;
      case 'voyager': case 'postcard': case 'pegman': case 'feedback': case 'help': case 'voice': u.drawer = false; c.render(); refuse(c); return true;
      default: return false;
    }
    c.render(); return true;
  }
  NG.register('earth', {
    render, mount, action,
    statusColor: () => 'rgba(0,0,0,.2)', underStatus: () => true,
    back(c) {
      const u = U(c);
      if (u.drawer) { u.drawer = false; c.render(); return true; }
      if (u.panel) { u.panel = ''; c.render(); return true; }
      if (u.search) { u.search = false; c.render(); return true; }
      return false;
    }
  });
  // Settings: the version and the region (the phone's country) as the summaries; Google location settings opens the
  // system's location page; Clear data cache has nothing to clear.
  NG.appPrefsHooks.earth = {
    summary(c, key) {
      if (key === 'earth.settings.About') return VERSION;
      if (key === 'earth.settings.Region') return AndroidStrings.format(NG.text('appprefs').t('GoogleEarth/settings_region_summary'), new Intl.DisplayNames([c.lang || 'en'], {type: 'region'}).of('US'));
    },
    click(c, key) {
      if (key === 'earth.settings.GoogleLocation') { c.open('settings', 'xml:location_settings'); return true; }
      if (key === 'earth.settings.Clear' || key === 'earth.settings.About' || key === 'earth.settings.Region') return true;
      return false;
    }
  };
})();
