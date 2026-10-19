/* Android 6.0.1 Maps (Google Maps 9.13, app/Maps of MTC20K), the app 'maps'. Maps 9 builds its screens in code, so the
   look follows the APK's drawables and strings: the white search card (ic_qu_menu_grabber, "Search", ic_qu_mic) floating over
   the map, the my-location button (quantum_ic_location_searching_black_24 on a white circle) and the directions FAB
   (ic_qu_fab_circle in #4285f4 with ic_qu_directions_white), the side menu (the account; Your places, Your timeline,
   Offline areas; Traffic, Public transit, Bicycling, Satellite, Google Earth; Tips and tricks; Settings, Help, Send
   feedback). The map itself — the town, its streets, park, river and places, the route times — is the simulator's own
   drawing; it pans by dragging and zooms with the wheel. A place opens its card with Directions; directions draw the
   route from Your location with START.
   - Navigation (START): the guidance banner in #0f9d58 with the step (DA_STEP_DEPART_ON with the DA_DIRECTION_*, then
     DA_STEP_TURN_RIGHT_ONTO / _LEFT_ONTO, DA_DESTINATION_REACHED) and its distance (DA_DISTANCE_FORMAT_METERS_ABBREVIATED),
     the map following the route, and the foot with the time left (plurals DA_MINUTES_ABBREVIATED), the distance and
     ARRIVE_AT_TIME, with DA_EXIT_NAVIGATION; the street names are the simulator's town's.
   - The side menu's pages: Your places (Labeled: Home / Work, SET_HOME_LOCATION / SET_WORK_LOCATION; SAVED_PLACES: the
     places starred on their card), Your timeline (TIMELINE, LOCATION_HISTORY_TURN_ON, then LOCATION_HISTORY_LETS_GO),
     Offline areas (OFFLINE_MAPS_HELP_TEXT, the saved areas; OFFLINE_CACHE_START_SELECTION_BUTTON_IN_MENU selects one on
     the map: OFFLINE_CACHE_SELECT_AREA_TITLE, _HELP, _SIZE_STRING, OFFLINE_DOWNLOAD, OFFLINE_NAME_AREA_TITLE, then
     OFFLINE_CACHE_SAVING / OFFLINE_CACHE_SAVED); the Public transit and Bicycling layers drawn on the town; Google
     Earth is not installed (GOOGLE_EARTH_NOT_AVAILABLE); Tips and tricks and Help open Google's help, Settings the
     app's settings XML, Send feedback the feedback screen. */
(() => {
  'use strict';
  const T = () => MM.text('maps');
  const A = n => `assets/mp-${n}.png`;
  const PLACES = [{id: 'park', name: 'Riverside Park', kind: 'Park', x: 300, y: 260}, {id: 'station', name: 'Central Station', kind: 'Train station', x: 620, y: 520},
    {id: 'cafe', name: 'Corner Café', kind: 'Café', x: 470, y: 380}, {id: 'library', name: 'City Library', kind: 'Library', x: 700, y: 300},
    {id: 'market', name: 'Harbor Market', kind: 'Market', x: 260, y: 640}, {id: 'museum', name: 'Hilltop Museum', kind: 'Museum', x: 820, y: 700}];
  const ME = {x: 520, y: 470};
  const ui = c => c.ui.maps || (c.ui.maps = {x: null, y: null, z: 1, place: '', route: false, menu: false, search: null, layer: ''});
  const esc = (c, s) => c.safe(s);
  const mdata = c => c.data.maps || (c.data.maps = {home: '', work: '', saved: [], history: false, areas: []});
  function mapSvg(c) {
    const u = ui(c), sat = u.layer === 'satellite';
    const roads = [[0, 200, 1200, 220], [0, 470, 1200, 450], [0, 760, 1200, 740], [180, 0, 200, 1000], [520, 0, 500, 1000], [880, 0, 860, 1000], [0, 0, 1200, 1000]];
    const minor = []; for (let i = 60; i < 1200; i += 85) minor.push(`<line x1="${i}" y1="0" x2="${i + 20}" y2="1000" />`); for (let j = 70; j < 1000; j += 90) minor.push(`<line x1="0" y1="${j}" x2="1200" y2="${j + 15}" />`);
    const place = PLACES.find(p => p.id === u.place);
    // Navigating, the blue dot moves along the route a step at a time.
    const me = u.nav && place ? [ME, {x: ME.x, y: place.y}, place][Math.min(2, u.nav.step)] : ME;
    const route = u.route && place ? `<polyline points="${ME.x},${ME.y} ${ME.x},${place.y} ${place.x},${place.y}" fill="none" stroke="#4285f4" stroke-width="9" stroke-linejoin="round" opacity=".9"/>` : '';
    const transit = u.layer === 'transit' ? `<g fill="none" stroke-width="7" stroke-linecap="round"><polyline points="0,300 520,300 520,1000" stroke="#e53935"/><polyline points="1200,560 620,520 620,0" stroke="#1e88e5"/><polyline points="0,820 860,760 860,0" stroke="#43a047"/></g>${[[520, 300], [620, 520], [860, 760]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10" fill="#fff" stroke="#424242" stroke-width="4"/>`).join('')}` : '';
    const bike = u.layer === 'bike' ? `<g fill="none" stroke="#2e7d32" stroke-width="6" stroke-dasharray="14 10" stroke-linecap="round"><path d="M0 590 C200 550 300 640 460 610 S760 670 1200 630"/><line x1="180" y1="0" x2="200" y2="1000"/><line x1="880" y1="0" x2="860" y2="1000"/></g>` : '';
    const traffic = u.layer === 'traffic' ? roads.slice(0, 6).map(([x1, y1, x2, y2], i) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${['#4caf50', '#ff9800', '#4caf50', '#f44336', '#4caf50', '#ff9800'][i]}" stroke-width="6"/>`).join('') : '';
    return `<svg class="mmmp-svg" viewBox="0 0 1200 1000" style="transform:translate(${u.x}px,${u.y}px) scale(${u.z})">
      <rect width="1200" height="1000" fill="${sat ? '#5b6b4a' : '#ebe7df'}"/><path d="M0 560 C200 520 300 610 460 580 S760 640 1200 600 L1200 660 C900 700 700 690 470 650 S180 600 0 620Z" fill="${sat ? '#2e4a5f' : '#a5c8ee'}"/>
      <rect x="230" y="190" width="160" height="150" rx="14" fill="${sat ? '#3e5a32' : '#c7e3b4'}"/><rect x="760" y="640" width="140" height="110" rx="12" fill="${sat ? '#3e5a32' : '#c7e3b4'}"/>
      <g stroke="${sat ? '#7a7a6a' : '#fff'}" stroke-width="4">${minor.join('')}</g><g stroke="${sat ? '#c9b77a' : '#fff'}" stroke-width="14" stroke-linecap="round">${roads.map(([x1, y1, x2, y2]) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`).join('')}</g>
      <g stroke="${sat ? 'none' : '#f6d27a'}" stroke-width="8" stroke-linecap="round"><line x1="0" y1="470" x2="1200" y2="450"/><line x1="520" y1="0" x2="500" y2="1000"/></g>${traffic}${transit}${bike}${route}
      ${PLACES.map(p => `<g class="mmmp-poi" data-action="mmmp-place" data-id="${p.id}"><circle cx="${p.x}" cy="${p.y}" r="9" fill="${p.id === u.place ? '#db4437' : '#7b8a99'}" stroke="#fff" stroke-width="3"/><text x="${p.x + 14}" y="${p.y + 5}" font-size="17" fill="${sat ? '#fff' : '#5f6b78'}" font-family="Roboto,sans-serif">${esc(c, p.name)}</text></g>`).join('')}
      ${place ? `<path d="M${place.x} ${place.y - 4} c-14 -18 -24 -28 -24 -42 a24 24 0 0 1 48 0 c0 14 -10 24 -24 42z" fill="#db4437" stroke="#a52714" stroke-width="2"/><circle cx="${place.x}" cy="${place.y - 46}" r="8" fill="#a52714"/>` : ''}
      <circle cx="${me.x}" cy="${me.y}" r="34" fill="#4285f4" opacity=".15"/><circle cx="${me.x}" cy="${me.y}" r="11" fill="#4285f4" stroke="#fff" stroke-width="4"/></svg>`;
  }
  // Navigation along the drawn route: north on the avenue, then onto the cross street, then the destination.
  const STREETS = ['Station Avenue', 'Harbor Street', 'Park Lane', 'River Road'];
  function navSteps(c, place) {
    const t = T(), up = place.y < ME.y, street = STREETS[PLACES.indexOf(place) % STREETS.length];
    const right = (place.x > ME.x) === up;
    return [{text: AndroidStrings.format(t.t('DA_STEP_DEPART_ON'), t.t(up ? 'DA_DIRECTION_NORTH' : 'DA_DIRECTION_SOUTH'), 'Main Street'), m: Math.round(Math.abs(place.y - ME.y) * 1.2)},
      {text: AndroidStrings.format(t.t(right ? 'DA_STEP_TURN_RIGHT_ONTO' : 'DA_STEP_TURN_LEFT_ONTO'), street), m: Math.round(Math.abs(place.x - ME.x) * 1.2)},
      {text: t.t('DA_DESTINATION_REACHED'), m: 0}];
  }
  function navUi(c, place) {
    const t = T(), u = ui(c), steps = navSteps(c, place), i = Math.min(u.nav.step, steps.length - 1), s = steps[i];
    const left = steps.slice(i).reduce((a, x) => a + x.m, 0), mins = Math.max(1, Math.round(left / 250));
    const arrive = new Intl.DateTimeFormat(c.locale(), {hour: 'numeric', minute: '2-digit'}).format(new Date(Date.now() + mins * 60000));
    const dist = m => m >= 1000 ? AndroidStrings.format(t.t('DA_DISTANCE_FORMAT_KILOMETERS_ABBREVIATED'), (m / 1000).toLocaleString(c.locale(), {maximumFractionDigits: 1})) : AndroidStrings.format(t.t('DA_DISTANCE_FORMAT_METERS_ABBREVIATED'), m);
    return `<div class="mmmp-nav"><img src="${A('ic_qu_navigation_white')}" alt=""><span>${s.m ? `<b>${esc(c, dist(s.m))}</b>` : ''}<span>${esc(c, s.text)}</span></span></div>
      <div class="mmmp-navfoot"><button type="button" class="mmmp-navx" data-action="mmmp-navexit" aria-label="${esc(c, t.t('DA_EXIT_NAVIGATION'))}">✕</button><span><b>${esc(c, t.plural('DA_MINUTES_ABBREVIATED', mins, null, mins))}</b><small>${esc(c, `${dist(left)} · ${AndroidStrings.format(t.t('ARRIVE_AT_TIME'), arrive)}`)}</small></span></div>`;
  }
  // The side menu's pages over the map.
  function pageUi(c) {
    const t = T(), u = ui(c), d = mdata(c), head = title => `<div class="mmmp-pbar"><button type="button" class="mmmp-ib" data-action="mmmp-pback"><img src="assets/gm-ic_arrow_back_24dp.png" alt=""></button><span>${esc(c, title)}</span></div>`;
    const row = (act, title, sub = '', extra = '') => `<button type="button" class="mmmp-prow" data-action="${act}"${extra}><b>${esc(c, title)}</b>${sub ? `<small>${esc(c, sub)}</small>` : ''}</button>`;
    if (u.page === 'places') return `<div class="mmmp-page">${head(t.t('YOUR_PLACES'))}<div class="mmmp-plist">
      ${row('mmmp-label" data-k="home', t.t('HOME_LOCATION'), d.home || t.t('SET_HOME_LOCATION'))}${row('mmmp-label" data-k="work', t.t('WORK_LOCATION'), d.work || t.t('SET_WORK_LOCATION'))}
      <div class="mmmp-pcat">${esc(c, t.t('SAVED_PLACES'))}</div>${d.saved.map(id => { const p = PLACES.find(x => x.id === id); return p ? row('mmmp-place" data-id="' + p.id, p.name, p.kind) : ''; }).join('')}</div></div>`;
    if (u.page === 'timeline') return `<div class="mmmp-page">${head(t.t('YOUR_TIMELINE'))}<div class="mmmp-pempty"><b>${esc(c, t.t('TIMELINE'))}</b>${d.history ? `<span>${esc(c, new Intl.DateTimeFormat(c.locale(), {weekday: 'long', month: 'long', day: 'numeric'}).format(new Date()))}</span><button type="button" data-action="mmmp-pback">${esc(c, t.t('LOCATION_HISTORY_LETS_GO'))}</button>` : `<button type="button" data-action="mmmp-history">${esc(c, t.t('LOCATION_HISTORY_TURN_ON'))}</button>`}</div></div>`;
    if (u.page === 'offline') return `<div class="mmmp-page">${head(t.t('OFFLINE_MAPS_TITLE'))}<div class="mmmp-plist"><p class="mmmp-ptext">${esc(c, t.t('OFFLINE_MAPS_HELP_TEXT'))}</p>
      ${d.areas.map((a, i) => row('mmmp-noop', a.name, t.t(a.done ? 'OFFLINE_CACHE_SAVED' : 'OFFLINE_CACHE_SAVING'))).join('')}<button type="button" class="mmmp-pbtn" data-action="mmmp-offselect">${esc(c, t.t('OFFLINE_CACHE_START_SELECTION_BUTTON_IN_MENU'))}</button></div></div>`;
    return '';
  }
  function offlineSelect(c) {
    const t = T();
    return `<div class="mmmp-offsel"><div class="mmmp-offtop"><b>${esc(c, t.t('OFFLINE_CACHE_SELECT_AREA_TITLE'))}</b><span>${esc(c, t.t('OFFLINE_CACHE_SELECT_AREA_HELP'))}</span></div><i class="mmmp-offframe"></i>
      <div class="mmmp-offfoot"><span>${esc(c, t.t('OFFLINE_CACHE_SELECT_AREA_SIZE_STRING'))}</span><button type="button" data-action="mmmp-offcancel">${esc(c, MM.text('framework').t('cancel'))}</button><button type="button" class="dl" data-action="mmmp-offdl">${esc(c, t.t('OFFLINE_DOWNLOAD'))}</button></div></div>`;
  }
  function render(c) {
    const t = T(), u = ui(c), place = PLACES.find(p => p.id === u.place), searching = u.search !== null;
    if (u.page) return pageUi(c);
    const q = (u.search || '').trim().toLowerCase();
    const card = place ? `<div class="mmmp-card"><button type="button" class="mmmp-star${mdata(c).saved.includes(place.id) ? ' on' : ''}" data-action="mmmp-star" aria-label="${esc(c, t.t('SAVED_PLACES'))}">★</button><div class="mmmp-ctext"><b>${esc(c, place.name)}</b><span>${esc(c, place.kind)}</span>${u.route ? `<span class="mmmp-eta">${Math.round(Math.hypot(place.x - ME.x, place.y - ME.y) / 30)} min</span>` : ''}</div>
      ${u.route ? `<button type="button" class="mmmp-start" data-action="mmmp-start"><img src="${A('ic_qu_navigation_white')}" alt=""><span>${esc(c, t.t('START_NAVIGATION'))}</span></button>` : `<button type="button" class="mmmp-dirbtn" data-action="mmmp-route" aria-label="${esc(c, t.t('NAVIGATION'))}"><img src="${A('ic_qu_directions_white')}" alt=""></button>`}</div>` : '';
    const results = searching ? `<div class="mmmp-results">${(q ? PLACES.filter(p => `${p.name} ${p.kind}`.toLowerCase().includes(q)) : PLACES).map(p => `<button type="button" class="mmmp-res" data-action="mmmp-place" data-id="${p.id}"><img src="${A('ic_qu_place')}" alt=""><span><b>${esc(c, p.name)}</b><small>${esc(c, p.kind)}</small></span></button>`).join('')}</div>` : '';
    const box = u.route && place ? `<div class="mmmp-dir"><div class="mmmp-drow"><i class="mmmp-dot me"></i><span>${esc(c, t.t('DIRECTIONS_YOUR_LOCATION'))}</span></div><div class="mmmp-drow"><i class="mmmp-dot to"></i><span>${esc(c, place.name)}</span></div></div>`
      : `<div class="mmmp-box"><button type="button" class="mmmp-ib" data-action="mmmp-menu"><img src="${A('ic_qu_menu_grabber')}" alt=""></button>${searching ? `<input class="mmmp-input" value="${esc(c, u.search)}" placeholder="${esc(c, t.t('SEARCH'))}" autocomplete="off">` : `<button type="button" class="mmmp-hint" data-action="mmmp-search">${esc(c, place ? place.name : t.t('SEARCH'))}</button>`}<button type="button" class="mmmp-ib" data-action="mmmp-voice"><img src="${A('ic_qu_mic')}" alt=""></button></div>`;
    const item = (ic, key, action, on) => `<button type="button" class="mmmp-mi${on ? ' on' : ''}" data-action="${action}"><img src="${A(ic)}" alt=""><span>${esc(c, t.t(key))}</span></button>`;
    const menu = u.menu ? `<div class="mmmp-scrim" data-action="mmmp-menu"></div><div class="mmmp-drawer"><div class="mmmp-acct"><img src="${A('quantum_logo_avatar_circle_blue_color_144')}" alt=""><b>${esc(c, MM.account.name)}</b><small>${esc(c, MM.account.email)}</small></div>
      ${item('ic_qu_savedplace', 'YOUR_PLACES', 'mmmp-page" data-p="places')}${item('quantum_ic_location_history_black_24', 'YOUR_TIMELINE', 'mmmp-page" data-p="timeline')}${item('ic_qu_arrow_right', 'OFFLINE_MAPS_TITLE', 'mmmp-page" data-p="offline')}<i class="mmmp-div"></i>
      ${item('ic_qu_traffic', 'LAYER_TRAFFIC', 'mmmp-traffic', u.layer === 'traffic')}${item('ic_qu_search_transit', 'LAYER_PUBLIC_TRANSIT', 'mmmp-transit', u.layer === 'transit')}${item('ic_qu_arrow_right', 'LAYER_BICYCLING', 'mmmp-bike', u.layer === 'bike')}${item('ic_qu_satellite', 'LAYER_SATELLITE', 'mmmp-satellite', u.layer === 'satellite')}${item('ic_qu_arrow_right', 'LAYER_GOOGLE_EARTH', 'mmmp-earth')}<i class="mmmp-div"></i>
      <button type="button" class="mmmp-mi text" data-action="mmmp-help">${esc(c, t.t('TIPS_AND_TRICKS'))}</button><i class="mmmp-div"></i><button type="button" class="mmmp-mi text" data-action="mmmp-settings">${esc(c, t.t('SETTINGS'))}</button><button type="button" class="mmmp-mi text" data-action="mmmp-help">${esc(c, t.t('HELP'))}</button><button type="button" class="mmmp-mi text" data-action="mmmp-feedback">${esc(c, t.t('SEND_FEEDBACK'))}</button></div>` : '';
    if (u.nav && place) return `<div class="mmmp nav"><div class="mmmp-map">${mapSvg(c)}</div>${navUi(c, place)}</div>`;
    if (u.offsel) return `<div class="mmmp"><div class="mmmp-map">${mapSvg(c)}</div>${offlineSelect(c)}</div>`;
    return `<div class="mmmp"><div class="mmmp-map">${mapSvg(c)}</div>${box}${results}
      <button type="button" class="mmmp-loc" data-action="mmmp-locate"><img src="${A('quantum_ic_location_searching_black_24')}" alt=""></button>${place ? '' : `<button type="button" class="mmmp-fab" data-action="mmmp-dirsearch" aria-label="${esc(c, t.t('NAVIGATION'))}"><img src="${A('ic_qu_directions_white')}" alt=""></button>`}${card}${menu}</div>`;
  }
  // Pans so that a point of the drawing sits in the middle of the screen (the SVG is 1.6 screens wide).
  function focus(c, p) { const u = ui(c), vp = c.el.viewport.getBoundingClientRect(), s = vp.width * 1.6 / 1200 * u.z; u.x = vp.width / 2 - p.x * s; u.y = vp.height / 2 - p.y * s; }
  MM.register('maps', {
    page: c => { const u = c.ui.maps || {}; return MM.page('maps', u.page); },
    statusColor: () => 'rgba(0,0,0,.2)',
    render,
    mount(c, root) {
      const u = ui(c), map = root.querySelector('.mmmp-map'), svg = root.querySelector('.mmmp-svg');
      if (u.x === null) { focus(c, ME); if (svg) svg.style.transform = `translate(${u.x}px,${u.y}px) scale(${u.z})`; }
      let drag = null;
      map?.addEventListener('pointerdown', e => { drag = {x: e.clientX, y: e.clientY, ux: u.x, uy: u.y, moved: false}; });
      map?.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true; u.x = drag.ux + dx; u.y = drag.uy + dy; svg.style.transform = `translate(${u.x}px,${u.y}px) scale(${u.z})`; });
      map?.addEventListener('pointerup', e => { if (drag?.moved) e.stopPropagation(); setTimeout(() => { drag = null; }, 0); }, true);
      map?.addEventListener('click', e => { if (drag?.moved) { e.stopPropagation(); e.preventDefault(); } }, true);
      map?.addEventListener('wheel', e => { e.preventDefault(); u.z = Math.max(.6, Math.min(2.5, u.z * (e.deltaY < 0 ? 1.15 : 1 / 1.15))); svg.style.transform = `translate(${u.x}px,${u.y}px) scale(${u.z})`; }, {passive: false});
      const input = root.querySelector('.mmmp-input');
      if (input) { input.addEventListener('input', () => { u.search = input.value; const pos = input.selectionStart; c.render(); const i2 = c.el.viewport.querySelector('.mmmp-input'); i2?.focus(); i2?.setSelectionRange(pos, pos); }); if (document.activeElement !== input) input.focus(); }
    },
    back(c) {
      const u = ui(c);
      if (u.menu) { u.menu = false; c.render(); return true; }
      if (u.nav) { clearTimeout(u.nav.timer); u.nav = null; u.z = 1; c.render(); return true; }
      if (u.offsel) { u.offsel = false; u.page = 'offline'; c.render(); return true; }
      if (u.page) { u.page = ''; c.render(); return true; }
      if (u.search !== null) { u.search = null; c.render(); return true; }
      if (u.route) { u.route = false; c.render(); return true; }
      if (u.place) { u.place = ''; c.render(); return true; }
      return false;
    },
    action(name, el, event, c) {
      const u = ui(c);
      switch (name) {
        case 'mmmp-menu': u.menu = !u.menu; c.render(); return true;
        case 'mmmp-search': u.search = ''; c.render(); return true;
        case 'mmmp-voice': MM.googleOpen(c, true); return true;
        case 'mmmp-place': { const p = PLACES.find(x => x.id === el.dataset.id); u.place = p.id; u.search = null; u.route = false; focus(c, p); c.render(); return true; }
        case 'mmmp-route': { const p = PLACES.find(x => x.id === u.place); u.route = true; focus(c, {x: (p.x + ME.x) / 2, y: (p.y + ME.y) / 2}); c.render(); return true; }
        case 'mmmp-dirsearch': u.search = ''; c.render(); return true;
        case 'mmmp-start': {
          const p = PLACES.find(x => x.id === u.place); if (!p) return true;
          u.nav = {step: 0}; u.z = 1.8; focus(c, ME); c.render();
          const steps = navSteps(c, p), next = () => { if (!u.nav || c.ui.view !== 'maps') return; u.nav.step++; focus(c, u.nav.step === 1 ? {x: ME.x, y: p.y} : p); c.render(); if (u.nav.step < steps.length - 1) u.nav.timer = setTimeout(next, 6000); };
          u.nav.timer = setTimeout(next, 6000);
          return true;
        }
        case 'mmmp-navexit': clearTimeout(u.nav?.timer); u.nav = null; u.z = 1; c.render(); return true;
        case 'mmmp-page': u.menu = false; u.page = el.dataset.p; c.render(); return true;
        case 'mmmp-pback': c.back(); return true;
        case 'mmmp-transit': u.layer = u.layer === 'transit' ? '' : 'transit'; u.menu = false; c.render(); return true;
        case 'mmmp-bike': u.layer = u.layer === 'bike' ? '' : 'bike'; u.menu = false; c.render(); return true;
        case 'mmmp-earth': u.menu = false; c.render(); c.toast(T().t('GOOGLE_EARTH_NOT_AVAILABLE')); return true;
        case 'mmmp-help': u.menu = false; c.render(); c.open('help', 'maps'); return true;
        case 'mmmp-feedback': u.menu = false; c.render(); c.open('feedback', 'maps'); return true;
        case 'mmmp-settings': u.menu = false; c.render(); MM.openPrefs(c, 'maps', 'settings', T().t('SETTINGS')); return true;
        case 'mmmp-history': mdata(c).history = true; c.save(); c.render(); return true;
        case 'mmmp-star': { const d = mdata(c); d.saved = d.saved.includes(u.place) ? d.saved.filter(x => x !== u.place) : [...d.saved, u.place]; c.save(); c.render(); return true; }
        case 'mmmp-label': {
          const k = el.dataset.k, d = mdata(c), t = T();
          c.dialog({title: t.t(k === 'home' ? 'SET_HOME_LOCATION' : 'SET_WORK_LOCATION'), html: `<div class="mmpf-edit"><input type="text" class="mmmp-addr" value="${esc(c, d[k])}" autocomplete="off"></div>`,
            buttons: [{label: MM.text('framework').t('cancel')}, {label: MM.text('framework').t('ok'), action: c => { d[k] = c.el.overlay.querySelector('.mmmp-addr')?.value.trim() || ''; c.save(); c.render(); }}]});
          setTimeout(() => c.el.overlay.querySelector('.mmmp-addr')?.focus(), 50);
          return true;
        }
        case 'mmmp-offselect': u.page = ''; u.offsel = true; c.render(); return true;
        case 'mmmp-offcancel': u.offsel = false; u.page = 'offline'; c.render(); return true;
        case 'mmmp-offdl': {
          const t = T(), d = mdata(c);
          c.dialog({title: t.t('OFFLINE_NAME_AREA_TITLE'), html: `<div class="mmpf-edit"><input type="text" class="mmmp-addr" value="${esc(c, PLACES[0].name)}" autocomplete="off"></div>`,
            buttons: [{label: MM.text('framework').t('cancel')}, {label: MM.text('framework').t('ok'), action: c => {
              const area = {name: c.el.overlay.querySelector('.mmmp-addr')?.value.trim() || PLACES[0].name, done: false}; d.areas.push(area); c.save();
              u.offsel = false; u.page = 'offline'; c.render();
              setTimeout(() => { area.done = true; c.save(); if (c.ui.view === 'maps') c.render(); c.toast(t.t('OFFLINE_DOWNLOAD_SUCCEEDED')); }, 5000);
            }}]});
          return true;
        }
        case 'mmmp-noop': return true;
        case 'mmmp-locate': focus(c, ME); c.render(); return true;
        case 'mmmp-traffic': u.layer = u.layer === 'traffic' ? '' : 'traffic'; u.menu = false; c.render(); return true;
        case 'mmmp-satellite': u.layer = u.layer === 'satellite' ? '' : 'satellite'; u.menu = false; c.render(); return true;
      }
      return false;
    }
  });
})();
