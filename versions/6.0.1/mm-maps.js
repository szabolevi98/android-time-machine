/* Android 6.0.1 Maps (Google Maps 9.13, app/Maps of MTC20K), the app 'maps'. Maps 9 builds its screens in code, so the
   look follows the APK's drawables and strings: the white search card (ic_qu_menu_grabber, "Search", ic_qu_mic) floating over
   the map, the my-location button (quantum_ic_location_searching_black_24 on a white circle) and the directions FAB
   (ic_qu_fab_circle in #4285f4 with ic_qu_directions_white), the side menu (the account; Your places, Your timeline,
   Offline areas; Traffic, Public transit, Bicycling, Satellite, Google Earth; Tips and tricks; Settings, Help, Send
   feedback). The map itself — the town, its streets, park, river and places, the route times — is the simulator's own
   drawing; it pans by dragging and zooms with the wheel. A place opens its card with Directions; directions draw the
   route from Your location with START. */
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
  function mapSvg(c) {
    const u = ui(c), sat = u.layer === 'satellite';
    const roads = [[0, 200, 1200, 220], [0, 470, 1200, 450], [0, 760, 1200, 740], [180, 0, 200, 1000], [520, 0, 500, 1000], [880, 0, 860, 1000], [0, 0, 1200, 1000]];
    const minor = []; for (let i = 60; i < 1200; i += 85) minor.push(`<line x1="${i}" y1="0" x2="${i + 20}" y2="1000" />`); for (let j = 70; j < 1000; j += 90) minor.push(`<line x1="0" y1="${j}" x2="1200" y2="${j + 15}" />`);
    const place = PLACES.find(p => p.id === u.place);
    const route = u.route && place ? `<polyline points="${ME.x},${ME.y} ${ME.x},${place.y} ${place.x},${place.y}" fill="none" stroke="#4285f4" stroke-width="9" stroke-linejoin="round" opacity=".9"/>` : '';
    const traffic = u.layer === 'traffic' ? roads.slice(0, 6).map(([x1, y1, x2, y2], i) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${['#4caf50', '#ff9800', '#4caf50', '#f44336', '#4caf50', '#ff9800'][i]}" stroke-width="6"/>`).join('') : '';
    return `<svg class="mmmp-svg" viewBox="0 0 1200 1000" style="transform:translate(${u.x}px,${u.y}px) scale(${u.z})">
      <rect width="1200" height="1000" fill="${sat ? '#5b6b4a' : '#ebe7df'}"/><path d="M0 560 C200 520 300 610 460 580 S760 640 1200 600 L1200 660 C900 700 700 690 470 650 S180 600 0 620Z" fill="${sat ? '#2e4a5f' : '#a5c8ee'}"/>
      <rect x="230" y="190" width="160" height="150" rx="14" fill="${sat ? '#3e5a32' : '#c7e3b4'}"/><rect x="760" y="640" width="140" height="110" rx="12" fill="${sat ? '#3e5a32' : '#c7e3b4'}"/>
      <g stroke="${sat ? '#7a7a6a' : '#fff'}" stroke-width="4">${minor.join('')}</g><g stroke="${sat ? '#c9b77a' : '#fff'}" stroke-width="14" stroke-linecap="round">${roads.map(([x1, y1, x2, y2]) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`).join('')}</g>
      <g stroke="${sat ? 'none' : '#f6d27a'}" stroke-width="8" stroke-linecap="round"><line x1="0" y1="470" x2="1200" y2="450"/><line x1="520" y1="0" x2="500" y2="1000"/></g>${traffic}${route}
      ${PLACES.map(p => `<g class="mmmp-poi" data-action="mmmp-place" data-id="${p.id}"><circle cx="${p.x}" cy="${p.y}" r="9" fill="${p.id === u.place ? '#db4437' : '#7b8a99'}" stroke="#fff" stroke-width="3"/><text x="${p.x + 14}" y="${p.y + 5}" font-size="17" fill="${sat ? '#fff' : '#5f6b78'}" font-family="Roboto,sans-serif">${esc(c, p.name)}</text></g>`).join('')}
      ${place ? `<path d="M${place.x} ${place.y - 4} c-14 -18 -24 -28 -24 -42 a24 24 0 0 1 48 0 c0 14 -10 24 -24 42z" fill="#db4437" stroke="#a52714" stroke-width="2"/><circle cx="${place.x}" cy="${place.y - 46}" r="8" fill="#a52714"/>` : ''}
      <circle cx="${ME.x}" cy="${ME.y}" r="34" fill="#4285f4" opacity=".15"/><circle cx="${ME.x}" cy="${ME.y}" r="11" fill="#4285f4" stroke="#fff" stroke-width="4"/></svg>`;
  }
  function render(c) {
    const t = T(), u = ui(c), place = PLACES.find(p => p.id === u.place), searching = u.search !== null;
    const q = (u.search || '').trim().toLowerCase();
    const card = place ? `<div class="mmmp-card"><div class="mmmp-ctext"><b>${esc(c, place.name)}</b><span>${esc(c, place.kind)}</span>${u.route ? `<span class="mmmp-eta">${Math.round(Math.hypot(place.x - ME.x, place.y - ME.y) / 30)} min</span>` : ''}</div>
      ${u.route ? `<button type="button" class="mmmp-start" data-action="mmmp-start"><img src="${A('ic_qu_navigation_white')}" alt=""><span>${esc(c, t.t('START_NAVIGATION'))}</span></button>` : `<button type="button" class="mmmp-dirbtn" data-action="mmmp-route" aria-label="${esc(c, t.t('NAVIGATION'))}"><img src="${A('ic_qu_directions_white')}" alt=""></button>`}</div>` : '';
    const results = searching ? `<div class="mmmp-results">${(q ? PLACES.filter(p => `${p.name} ${p.kind}`.toLowerCase().includes(q)) : PLACES).map(p => `<button type="button" class="mmmp-res" data-action="mmmp-place" data-id="${p.id}"><img src="${A('ic_qu_place')}" alt=""><span><b>${esc(c, p.name)}</b><small>${esc(c, p.kind)}</small></span></button>`).join('')}</div>` : '';
    const box = u.route && place ? `<div class="mmmp-dir"><div class="mmmp-drow"><i class="mmmp-dot me"></i><span>${esc(c, t.t('DIRECTIONS_YOUR_LOCATION'))}</span></div><div class="mmmp-drow"><i class="mmmp-dot to"></i><span>${esc(c, place.name)}</span></div></div>`
      : `<div class="mmmp-box"><button type="button" class="mmmp-ib" data-action="mmmp-menu"><img src="${A('ic_qu_menu_grabber')}" alt=""></button>${searching ? `<input class="mmmp-input" value="${esc(c, u.search)}" placeholder="${esc(c, t.t('SEARCH'))}" autocomplete="off">` : `<button type="button" class="mmmp-hint" data-action="mmmp-search">${esc(c, place ? place.name : t.t('SEARCH'))}</button>`}<button type="button" class="mmmp-ib" data-action="mmmp-voice"><img src="${A('ic_qu_mic')}" alt=""></button></div>`;
    const item = (ic, key, action, on) => `<button type="button" class="mmmp-mi${on ? ' on' : ''}" data-action="${action}"><img src="${A(ic)}" alt=""><span>${esc(c, t.t(key))}</span></button>`;
    const menu = u.menu ? `<div class="mmmp-scrim" data-action="mmmp-menu"></div><div class="mmmp-drawer"><div class="mmmp-acct"><img src="${A('quantum_logo_avatar_circle_blue_color_144')}" alt=""><b>${esc(c, MM.account.name)}</b><small>${esc(c, MM.account.email)}</small></div>
      ${item('ic_qu_savedplace', 'YOUR_PLACES', 'mmmp-missing')}${item('quantum_ic_location_history_black_24', 'YOUR_TIMELINE', 'mmmp-missing')}${item('ic_qu_arrow_right', 'OFFLINE_MAPS_TITLE', 'mmmp-missing')}<i class="mmmp-div"></i>
      ${item('ic_qu_traffic', 'LAYER_TRAFFIC', 'mmmp-traffic', u.layer === 'traffic')}${item('ic_qu_search_transit', 'LAYER_PUBLIC_TRANSIT', 'mmmp-missing')}${item('ic_qu_arrow_right', 'LAYER_BICYCLING', 'mmmp-missing')}${item('ic_qu_satellite', 'LAYER_SATELLITE', 'mmmp-satellite', u.layer === 'satellite')}${item('ic_qu_arrow_right', 'LAYER_GOOGLE_EARTH', 'mmmp-missing')}<i class="mmmp-div"></i>
      <button type="button" class="mmmp-mi text" data-action="mmmp-missing">${esc(c, t.t('TIPS_AND_TRICKS'))}</button><i class="mmmp-div"></i><button type="button" class="mmmp-mi text" data-action="mmmp-missing">${esc(c, t.t('SETTINGS'))}</button><button type="button" class="mmmp-mi text" data-action="mmmp-missing">${esc(c, t.t('HELP'))}</button><button type="button" class="mmmp-mi text" data-action="mmmp-missing">${esc(c, t.t('SEND_FEEDBACK'))}</button></div>` : '';
    return `<div class="mmmp"><div class="mmmp-map">${mapSvg(c)}</div>${box}${results}
      <button type="button" class="mmmp-loc" data-action="mmmp-locate"><img src="${A('quantum_ic_location_searching_black_24')}" alt=""></button>${place ? '' : `<button type="button" class="mmmp-fab" data-action="mmmp-dirsearch" aria-label="${esc(c, t.t('NAVIGATION'))}"><img src="${A('ic_qu_directions_white')}" alt=""></button>`}${card}${menu}</div>`;
  }
  // Pans so that a point of the drawing sits in the middle of the screen (the SVG is 1.6 screens wide).
  function focus(c, p) { const u = ui(c), vp = c.el.viewport.getBoundingClientRect(), s = vp.width * 1.6 / 1200 * u.z; u.x = vp.width / 2 - p.x * s; u.y = vp.height / 2 - p.y * s; }
  MM.register('maps', {
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
        case 'mmmp-start': c.open('missing-maps-navigation'); return true;
        case 'mmmp-locate': focus(c, ME); c.render(); return true;
        case 'mmmp-traffic': u.layer = u.layer === 'traffic' ? '' : 'traffic'; u.menu = false; c.render(); return true;
        case 'mmmp-satellite': u.layer = u.layer === 'satellite' ? '' : 'satellite'; u.menu = false; c.render(); return true;
        case 'mmmp-missing': u.menu = false; c.open('missing-maps-feature'); return true;
      }
      return false;
    }
  });
})();
