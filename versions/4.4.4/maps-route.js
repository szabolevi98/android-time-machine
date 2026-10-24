/* Google Maps 7.5.0 (hammerhead KTU84P) directions and navigation, written by docs/tools/maps7-route.py from
   docs/templates/maps7-route.template.js. The Directions button of the omnibox opens directions_phonestart_page.xml:
   - the floating bar with Back and the travel modes (ic_directions_car / _transit / _bicycling / _walking, _active when chosen), the white DirectionsPanel with
     directions_input_panel.xml (ic_directions_form_dots and the start / end icons in the 54 dp column, the two 17 sp
     waypoint boxes in the 108 dp block, ic_directions_form_swap) and the 48 dp options row (ic_setting, Route options);
   - the trip cards (directions_drivingtrip_card.xml / directions_trip_content.xml on new_card: the 21 sp duration, the
     grey distance, "via …", the 110 dp map and the blue "Start navigation" footer with ic_start);
   - Route options (directions_options_page.xml): the check boxes and CANCEL / DONE;
   - the step list (directions_drivingdetails_page.xml: duration, distance, the path and Start; the steps of
     directions_details_listitem.xml with the turn arrows);
   - navigation: navigation_stepdescription_content.xml on da_header_green_p (the turn and its distance, the road),
     the map under the chevron, navigation_footer.xml (Close navigation, the time and distance left, the menu).
   Texts are the image's own (DA_STEP_*, DIRECTIONS_*, DA_MINUTES …); the route follows the simulator's drawn streets. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const LANGS = ['hu', 'de', 'fr', 'es'];
  const LP = false;
  const MODES = LP ? [['drive', 'ic_omni_box_car'], ['transit', 'ic_omni_box_transit'], ['bike', 'ic_omni_box_bicycling'], ['walk', 'ic_omni_box_walking']]
    : [['drive', 'ic_directions_car'], ['transit', 'ic_directions_transit'], ['bike', 'ic_directions_bicycling'], ['walk', 'ic_directions_walking']];
  const STREETS = ['Market St', 'River St', 'Park Ave', 'Bay Rd'];
  const ME = {x: 180, y: 300};
  const A = name => `assets/mp7r-${name}.png`;
  function S(ctx, key) {
    const row = window.StockStrings?.maps?.[key];
    return row ? AndroidStrings.pick(row, String(ctx.locale || 'en').slice(0, 2), key) : ctx.t(key);
  }
  const fmt = (pattern, ...args) => AndroidStrings.format(pattern, ...args);
  function distance(ctx, km) {
    // Maps' Distance units (maps-prefs.js), else the language's.
    if (window.MapsPrefs ? MapsPrefs.imperial(ctx.data, S(ctx, 'imperial') === 'imperial') : S(ctx, 'imperial') === 'imperial') { const mi = km * .621; return mi < .1 ? fmt(S(ctx, '%s ft'), Math.round(mi * 5280 / 50) * 50) : fmt(S(ctx, '%s mi'), mi.toFixed(1)); }
    return km < 1 ? fmt(S(ctx, '%s m'), Math.round(km * 100) * 10) : fmt(S(ctx, '%s km'), km.toFixed(1));
  }
  // DA_MINUTES / DA_HOURS, joined by DA_TIME_FORMAT_HOURS_AND_MINUTES.
  function duration(ctx, min) {
    const m = n => fmt(S(ctx, AndroidStrings.quantity(n) === 'one' ? '%d minute' : '%d minutes'), n), h = n => fmt(S(ctx, AndroidStrings.quantity(n) === 'one' ? '%d hour' : '%d hours'), n);
    return min < 60 ? m(min) : fmt(S(ctx, '%1$s  %2$s'), h(Math.floor(min / 60)), m(min % 60));
  }
  function place(ctx, text) {
    if (!text) return null;
    if (text === ctx.ui.mapsQuery) return {name: text, x: 222, y: 190};
    const h = [...text].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
    return {name: text, x: 50 + h % 260, y: 130 + (h >> 8) % 140};
  }
  const avoid = data => ({highways: false, tolls: false, ferries: false, ...(data.mapsAvoid || {})});
  // The route along the grid (avoiding highways takes the other corner and longer).
  function route(ctx, r) {
    const to = place(ctx, r.to); if (!to) return null;
    const opts = r.avoid ?? avoid(ctx.data || {}), mode = r.mode || 'drive', alt = mode === 'drive' && opts.highways;
    const path = alt ? [ME, {x: to.x, y: ME.y}, to] : [ME, {x: ME.x, y: to.y}, to];
    const km = Math.max(.2, (Math.abs(to.x - ME.x) + Math.abs(to.y - ME.y)) / 110 * (alt ? 1.15 : 1));
    const speed = {drive: alt ? 22 : 30, transit: 20, bike: 15, walk: 5}[mode] || 30;
    const min = Math.max(1, Math.round(km / speed * 60) + (mode === 'drive' ? 2 + (opts.tolls ? 2 : 0) : mode === 'transit' ? 6 : 0));
    const first = STREETS[to.name.length % STREETS.length], second = STREETS[(to.name.length + 1) % STREETS.length];
    const east = to.x > ME.x, north = to.y < ME.y, heading = alt ? (east ? 'east' : 'west') : (north ? 'north' : 'south');
    const turn = alt ? (east === north ? 'left' : 'right') : (north === east ? 'right' : 'left');
    const steps = [
      {icon: 'depart', text: fmt(S(ctx, 'Head %1$s on %2$s'), S(ctx, heading), first), km: km * .55, road: first},
      {icon: turn, text: fmt(S(ctx, turn === 'right' ? 'Turn right onto %1$s' : 'Turn left onto %1$s'), second), km: km * .4, road: second},
      {icon: 'straight', text: fmt(S(ctx, 'Continue onto %1$s'), second), km: km * .05, road: second},
      {icon: 'arrive', text: S(ctx, 'Your destination is on the right.'), km: 0, road: to.name}];
    return {to, path, km, min, steps, via: alt ? second : first, mode};
  }
  // Turn arrows: Maps 7.5's da_turn_* (the right ones mirrored for left); Maps 9.3 draws its own, so plain arrows here.
  function arrow(kind, cls = '') {
    if (!LP) return `<img class="${cls}${kind === 'left' ? ' flip' : ''}" src="${A({depart: 'da_turn_depart', right: 'da_turn_right', left: 'da_turn_right', straight: 'da_turn_straight', arrive: 'da_turn_arrive'}[kind])}" alt="">`;
    const d = {depart: 'M12 21V5M6 11l6-6 6 6', straight: 'M12 21V5M6 11l6-6 6 6', right: 'M7 21V12h11M13 7l5 5-5 5', left: 'M17 21V12H6M11 7l-5 5 5 5', arrive: 'M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z'}[kind];
    return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="${kind === 'arrive' ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  const state = ui => ui.mapsRoute;
  const has = ui => ['start', 'details'].includes(state(ui)?.screen);
  const myLocation = ctx => S(ctx, 'My Location');

  // ---- Pages -------------------------------------------------------------------------------------------------------
  function render(ctx) {
    const {ui, data} = ctx, r = state(ui), mode = r.mode || 'drive', rt = route(ctx, r);
    if (r.screen === 'details' && rt) {
      const head = `<div class="m7r-sheethead"><div><b>${e(duration(ctx, rt.min))}</b><span>${e(distance(ctx, rt.km))}</span><small>${e(fmt(S(ctx, 'Via %1$s'), rt.via))}</small></div><button class="m7r-startbtn" data-action="mr-navigate"${mode === 'drive' || mode === 'walk' ? '' : ' disabled'}><img src="${A(LP ? 'ic_qu_navigation' : 'ic_start')}" alt=""><span>${e(S(ctx, 'Start'))}</span></button></div>`;
      const steps = rt.steps.map(st => `<div class="m7r-step"><span class="m7r-stepicon">${arrow(st.icon)}</span><span><b>${e(st.text)}</b>${st.km ? `<small>${e(distance(ctx, st.km))}</small>` : ''}</span></div>`).join('');
      return `<div class="app-view sa-app m7r m7r-details">${bar(ctx, mode)}${head}<div class="sa-scroll m7r-steps">${steps}</div></div>`;
    }
    const a = avoid(data), notes = mode === 'drive' ? ['highways', 'tolls', ...(LP ? ['ferries'] : [])].filter(k => a[k]).map(k => S(ctx, {highways: 'Avoid highways', tolls: 'Avoid tolls', ferries: 'Avoid ferries'}[k])) : [];
    const input = `<div class="m7r-panel"><div class="m7r-waypoints"><span class="m7r-icons"><img class="m7r-dots" src="${A('ic_directions_form_dots')}" alt=""><img src="${A(r.from === undefined || r.from === myLocation(ctx) ? 'ic_directions_form_startpoint' : 'ic_directions_form_destination_notselected')}" alt=""><img src="${A(r.to ? 'ic_directions_form_destination' : 'ic_directions_form_destination_notselected')}" alt=""></span><form class="m7r-boxes" data-form="mr-go"><input name="from" value="${e(r.from ?? myLocation(ctx))}" placeholder="${e(S(ctx, 'Choose starting point...'))}" autocomplete="off" spellcheck="false"><input name="to" value="${e(r.to || '')}" placeholder="${e(S(ctx, 'Choose destination...'))}" autocomplete="off" spellcheck="false"><button type="submit" hidden></button></form><button class="m7r-swap" data-action="mr-swap" aria-label="${e(S(ctx, 'Swap start and destination'))}"><img src="${A('ic_directions_form_swap')}" alt=""></button></div>${mode === 'drive' ? `<button class="m7r-option" data-action="mr-options"><img src="${A('ic_setting')}" alt=""><span>${e(notes.length ? notes.join(', ') : S(ctx, 'Route options'))}</span></button>` : ''}</div>`;
    const card = rt ? `<div class="m7r-card"><button class="m7r-summary" data-action="mr-details"><span class="m7r-trip"><b>${e(duration(ctx, rt.min))}</b><span>${e(distance(ctx, rt.km))}</span></span><small>${e(fmt(S(ctx, 'Via %1$s'), rt.via))}</small><span class="m7r-mini">${ctx.mapSvg ? `<svg viewBox="${miniBox(rt)}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${ctx.mapSvg}${routeSvg(rt)}</svg>` : ''}</span></button>${mode === 'drive' || mode === 'walk' ? `<i class="m7r-divider"></i><button class="m7r-startnav" data-action="mr-navigate"><img src="${A(LP ? 'ic_start_footer' : 'ic_start')}" alt=""><span>${e(S(ctx, 'Start navigation'))}</span></button>` : ''}</div>` : '';
    const dialog = r.options ? optionsDialog(ctx) : '';
    return `<div class="app-view sa-app m7r m7r-start">${bar(ctx, mode)}${input}<div class="sa-scroll m7r-cards">${card}</div>${dialog}</div>`;
  }
  // The floating bar: Back and the travel modes.
  function bar(ctx, mode) {
    const tabs = MODES.map(([id, img]) => `<button class="m7r-mode${mode === id ? ' on' : ''}" data-action="mr-mode" data-id="${id}" role="tab" aria-selected="${mode === id}"><img src="${A(LP || mode !== id ? img : `${img}_active`)}" alt=""></button>`).join('');
    return `<div class="m7r-bar"><button class="m7r-back" data-action="back" aria-label="${e(ctx.t('Back'))}"><img src="${A(LP ? 'ic_qu_appbar_back' : 'ic_nav_back')}" alt=""></button><span class="m7r-modes" role="tablist">${tabs}</span></div>`;
  }
  // directions_options_page.xml: the RouteOptionsView's right-side check boxes, CANCEL / DONE.
  function optionsDialog(ctx) {
    const d = state(ctx.ui).options, keys = [['highways', 'Avoid highways'], ['tolls', 'Avoid tolls'], ...(LP ? [['ferries', 'Avoid ferries']] : [])];
    return `<button class="m7r-scrim" data-action="mr-options-cancel" aria-label="${e(S(ctx, 'Cancel'))}"></button><div class="m7r-dialog" role="dialog" aria-label="${e(S(ctx, 'Route Options'))}"><h3>${e(S(ctx, 'Route Options'))}</h3>${keys.map(([id, key]) => `<button class="m7r-check" data-action="mr-options-toggle" data-id="${id}" role="checkbox" aria-checked="${!!d[id]}"><span>${e(S(ctx, key))}</span><i></i></button>`).join('')}<div class="m7r-dialogbtns"><button data-action="mr-options-cancel">${e(S(ctx, 'Cancel'))}</button><button data-action="mr-options-done">${e(S(ctx, 'Done'))}</button></div></div>`;
  }
  // The card's map frames the whole route in its 110 dp strip.
  function miniBox(rt) {
    const cx = (ME.x + rt.to.x) / 2, cy = (ME.y + rt.to.y) / 2, h = Math.max(Math.abs(rt.to.y - ME.y) + 50, (Math.abs(rt.to.x - ME.x) + 60) / 3.1, 80), w = h * 3.1;
    return `${cx - w / 2} ${cy - h / 2} ${w} ${h}`;
  }
  const routeSvg = rt => `<path d="${rt.path.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join('')}" fill="none" stroke="#4285f4" stroke-opacity=".85" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${ME.x}" cy="${ME.y}" r="6" fill="#fff" stroke="#4285f4" stroke-width="3"/><g transform="translate(${rt.to.x} ${rt.to.y})"><path d="M0-30a12 12 0 0 0-12 12c0 9 12 22 12 22s12-13 12-22A12 12 0 0 0 0-30z" fill="#db4437"/><circle cy="-18" r="4.5" fill="#fff"/></g>`;

  // ---- Navigation ----------------------------------------------------------------------------------------------------
  function along(path, t) {
    const segs = path.slice(1).map((q, i) => ({a: path[i], b: q, len: Math.hypot(q.x - path[i].x, q.y - path[i].y)})), total = segs.reduce((s, g) => s + g.len, 0) || 1;
    let left = t * total;
    for (const g of segs) { if (left <= g.len) { const k = g.len ? left / g.len : 0; return {x: g.a.x + (g.b.x - g.a.x) * k, y: g.a.y + (g.b.y - g.a.y) * k, deg: Math.atan2(g.b.x - g.a.x, g.a.y - g.b.y) * 180 / Math.PI}; } left -= g.len; }
    const g = segs.at(-1); return {...path.at(-1), deg: g ? Math.atan2(g.b.x - g.a.x, g.a.y - g.b.y) * 180 / Math.PI : 0};
  }
  function nav(ctx) {
    const run = ctx.ui.navRun; if (!run) return '';
    const rt = route(ctx, {to: run.name, mode: run.mode}); if (!rt) return '';
    const p = Math.min(1, run.progress || 0), done = p >= 1, i = Math.min(rt.steps.length - 1, Math.floor(p * (rt.steps.length - 1)) + (p > 0 ? 0 : 0));
    const step = rt.steps[Math.min(rt.steps.length - 1, i + 1)] || rt.steps.at(-1), at = along(rt.path, p);
    const left = rt.km * (1 - p), min = Math.max(0, Math.ceil(rt.min * (1 - p)));
    const map = `<svg viewBox="0 0 360 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${(ctx.mapSvg || '').replace(/<circle cx="180" cy="300"[^>]*\/>/g, '')}${routeSvg(rt).replace(/<circle[^>]*\/>/, '')}<g transform="translate(${at.x} ${at.y}) rotate(${at.deg})">${LP ? `<image href="${A('chevron_navigation_disc')}" x="-20" y="-20" width="40" height="40"/><image href="${A('chevron_navigation_chevron')}" x="-20" y="-20" width="40" height="40"/>` : `<image href="${A('chevron_navigation')}" x="-22" y="-22" width="44" height="44"/>`}</g></svg>`;
    return `<div class="app-view sa-app m7r m7r-nav"><div class="m7r-navhead"><span class="m7r-turn">${arrow(done ? 'arrive' : step.icon)}<b>${e(done ? '' : distance(ctx, left / Math.max(1, rt.steps.length - 1)))}</b></span><i></i><span class="m7r-roads"><b>${e(done ? S(ctx, 'You have arrived.') : step.road)}</b><small>${e(done ? rt.to.name : step.text)}</small></span></div><div class="m7r-navmap">${map}</div><div class="m7r-navfoot"><button data-action="mr-nav-close" aria-label="${e(S(ctx, 'Close navigation'))}"><img src="${A(LP ? 'ic_qu_nav_closebtn_day' : 'ic_navigation_cancel')}" alt=""></button><span>${e(done ? '' : fmt(S(ctx, '%1$s (%2$s) to destination'), duration(ctx, min), distance(ctx, left)))}</span><button data-action="mr-nav-menu" aria-label="${e(S(ctx, 'Navigation menu'))}"><img src="${A(LP ? 'ic_qu_nav_overflow_day' : 'ic_setting')}" alt=""></button></div></div>`;
  }
  let navTimer = 0;
  function startNav(ctx, run) {
    ctx.ui.navRun = {...run, started: Date.now(), progress: 0};
    clearTimeout(navTimer);
    const tick = () => {
      const r = ctx.ui.navRun; if (!r) return;
      r.progress = Math.min(1, (Date.now() - r.started) / 40000);
      if (!ctx.ui.overlay && ctx.ui.view === 'maps') ctx.render();
      if (r.progress < 1) navTimer = setTimeout(tick, 1000);
    };
    navTimer = setTimeout(tick, 1000);
  }
  function stopNav(ctx) { clearTimeout(navTimer); ctx.ui.navRun = null; }

  // ---- Actions -------------------------------------------------------------------------------------------------------
  function open(ctx, to = '') { ctx.ui.mapsRoute = {screen: 'start', mode: ctx.ui.mapsRoute?.mode || 'drive', to: to || '', from: undefined}; ctx.render(); }
  function keep(ctx) { const r = state(ctx.ui), form = ctx.root?.querySelector('.m7r-boxes'); if (r && form) { r.from = form.querySelector('[name=from]').value; r.to = form.querySelector('[name=to]').value.trim(); } }
  function handle(action, id, ctx) {
    const {ui, data} = ctx, r = state(ui);
    switch (action) {
      case 'mr-open': open(ctx, id || ''); ctx.focus?.(id ? '' : '.m7r-boxes [name=to]'); return true;
      case 'mr-mode': keep(ctx); r.mode = id; ctx.render(); return true;
      case 'mr-swap': keep(ctx); { const from = r.from ?? myLocation(ctx); r.from = r.to || ''; r.to = from; } ctx.render(); return true;
      case 'mr-options': keep(ctx); r.options = {...avoid(data)}; ctx.render(); return true;
      case 'mr-options-toggle': r.options[id] = !r.options[id]; ctx.render(); return true;
      case 'mr-options-cancel': r.options = null; ctx.render(); return true;
      case 'mr-options-done': data.mapsAvoid = r.options; r.options = null; ctx.save(); ctx.render(); return true;
      case 'mr-details': keep(ctx); r.screen = 'details'; ctx.render(); return true;
      case 'mr-navigate': {
        if (r?.screen === 'start') keep(ctx);
        const rt = r && route(ctx, r); if (!rt) return true;
        startNav(ctx, {name: rt.to.name, mode: r.mode === 'walk' ? 'walk' : 'drive'}); ctx.render(); return true;
      }
      case 'mr-nav-close': stopNav(ctx); ctx.render(); return true;
      case 'mr-nav-menu': ctx.unsupported(); return true;
    }
    return false;
  }
  function submit(values, ctx) { const r = state(ctx.ui); r.from = String(values.get('from') || ''); r.to = String(values.get('to') || '').trim(); ctx.render(); }
  function back(ctx) {
    if (ctx.ui.navRun) { stopNav(ctx); ctx.render(); return true; }
    const r = state(ctx.ui); if (!r) return false;
    if (r.options) { r.options = null; ctx.render(); return true; }
    if (r.screen === 'details') { r.screen = 'start'; ctx.render(); return true; }
    ctx.ui.mapsRoute = null; ctx.render(); return true;
  }
  window.MapsRoute = {has, render, nav, handle, submit, back, open, route, startNav, stopNav, S};
})();
