/* Google Earth's working parts in the versions whose Earth is a stock app screen (stock-apps.js: 4.0.4's Earth 6.1,
   4.3's 7.1.1, 4.4.4's 7.1.3, 5.1.1's 8.0.1): the globe (earth-globe.js) behind each version's own Earth chrome, Search,
   My location, Reset to north, Share and Settings. 2.3.6's Earth 2.0.1 lives in gb-google-apps.js on the same globe.
   Settings is the APK's res/xml/settings.xml (xml-v11 for 6.1 and 7.1.1) as a stack in ui.earthPrefs, values in
   data.earthPrefs; a list stores the entry index. The texts are the APK's (stock-strings.js, group earth). Rows whose
   page is Google's (Terms of service, Privacy Policy) keep the simulator's generic limit; Maps Engine's Sign Out is
   disabled in the XML itself. Earth 6.1–7.1.3's Settings has no theme of its own (Holo dark, rendered with the
   version's mps- rows and .mps-dark); 8.0.1's is Theme.Earth.ActionBar (AppCompat Light). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const S = (ctx, key) => { const row = window.StockStrings?.earth?.[key]; return row ? AndroidStrings.pick(row, String(ctx.lang || 'en').slice(0, 2), key) : ctx.t(key); };
  const view = {lon: -100, lat: 25, zoom: 1, heading: 0, spin: true};
  // The APKs' versions (PackageManager versionName / versionCode) for About Google Earth.
  const BUILDS = {'6.1': ['6.1', '38'], '7.1.1': ['7.1.1.1682'], '7.1.3': ['7.1.3.1255'], '8.0.1': ['8.0.1.2311']};
  const value = (ctx, key, def) => ctx.data.earthPrefs?.[key] ?? def;
  const cat = title => ({kind: 'cat', title});
  const check = (ctx, key, title, on, off, def) => ({kind: 'check', key, title: S(ctx, title), summary: S(ctx, value(ctx, key, def) ? on : off), def});
  // A list's default is the entry whose value is the XML's defaultValue: only Image Quality's "0" is one (the cache
  // sizes' 0 / 1 and the text scale's 1 match no entry value, so those lists start with nothing chosen).
  const list = (ctx, key, title, summary, prefix, def = null) => ({kind: 'list', key, title: S(ctx, title), summary: S(ctx, summary), def, options: [0, 1, 2].map(i => S(ctx, `@${prefix}:${i}`))});
  const clear = ctx => ({key: 'clear', title: S(ctx, 'Clear Data Cache'), summary: S(ctx, 'Resets the persistent cache.')});
  const cacheSize = ctx => list(ctx, 'data_cache_size', 'Data Cache Size', 'Maximum size of the persistent cache.', 'cache_size');
  const textScale = ctx => list(ctx, 'text_scale', 'Text & Icon Size', 'Size of the screen labels and icons.', 'text_scale');
  const quality = ctx => list(ctx, 'image_quality', 'Image Quality', 'Higher quality will result in slower speed on some devices.', 'image_quality', 0);
  const imagery = ctx => check(ctx, 'imagery_visibility', 'Imagery Visibility', 'Base imagery is visible', 'Base imagery is not visible', true);
  const https = ctx => check(ctx, 'use_https', 'Use HTTPS', 'Always', 'When Signed In', false);
  const location = ctx => ({key: 'google_location', title: S(ctx, 'Google location settings')});
  const databases = ctx => ({key: 'databases', title: S(ctx, 'Databases'), summary: S(ctx, 'Controls which database to connect to')});
  const about = ctx => [cat(S(ctx, 'About')), {key: 'about', title: S(ctx, 'About Google Earth')}];
  const legal = ctx => [{key: 'terms', title: S(ctx, 'Terms of service'), remote: true}, {key: 'privacy', title: S(ctx, 'Privacy Policy'), remote: true}];
  const SETTINGS = {
    '6.1': ctx => [cat(S(ctx, 'Settings')), clear(ctx), cacheSize(ctx), textScale(ctx), check(ctx, 'use_terrain', 'Show Terrain', 'Use elevation data to show the view in 3D', "Don't show the terrain surface", true), databases(ctx), ...about(ctx)],
    '7.1.1': ctx => [cat(S(ctx, 'Settings')), clear(ctx), cacheSize(ctx), textScale(ctx), quality(ctx), imagery(ctx), https(ctx), location(ctx), databases(ctx),
      cat(S(ctx, 'Maps Engine')), {kind: 'info', title: S(ctx, 'Account'), summary: ctx.account}, {key: 'signout', title: S(ctx, 'Sign Out'), disabled: true}, ...about(ctx), ...legal(ctx)],
    '7.1.3': ctx => [cat(S(ctx, 'Settings')), {kind: 'info', title: S(ctx, 'Switch Account'), summary: ctx.account}, clear(ctx), cacheSize(ctx), textScale(ctx), quality(ctx),
      check(ctx, 'use_sensors', 'Use Hardware Sensors', 'Use compass and accelerometer to control the view', 'Use touchscreen to control the view', false), imagery(ctx), https(ctx), location(ctx), databases(ctx), ...about(ctx), ...legal(ctx)],
    '8.0.1': ctx => [cat(S(ctx, 'Settings')), clear(ctx), cacheSize(ctx), location(ctx), ...about(ctx)]
  };
  const active = ui => !!ui.earthPrefs;
  const LAYERS = ['Places', 'Businesses', 'Panoramio Photos', 'Wikipedia', 'Borders and Labels', '3D Buildings'];
  const rows = ctx => SETTINGS[ctx.earth](ctx);
  function row(ctx, r) {
    if (r.kind === 'cat') return `<div class="mps-cat">${e(r.title)}</div>`;
    const on = r.kind === 'check' && !!value(ctx, r.key, r.def);
    const action = r.kind === 'info' ? '' : r.remote ? 'sa-unsupported' : r.kind === 'check' ? 'eps-check' : r.kind === 'list' ? 'eps-list' : 'eps-act';
    const attrs = `${action ? ` data-action="${action}"` : ''}${r.key ? ` data-id="${e(r.key)}"` : ''}${r.kind === 'check' ? ` role="checkbox" aria-checked="${on}"` : ''}${r.disabled ? ' disabled' : ''}`;
    return `<button class="mps-row${r.kind === 'info' ? ' mps-info' : ''}${r.disabled ? ' disabled' : ''}"${attrs}><span><b>${e(r.title)}</b>${r.summary ? `<small>${e(r.summary)}</small>` : ''}</span>${r.kind === 'check' ? `<i class="mps-check${on ? ' on' : ''}" role="presentation"></i>` : ''}</button>`;
  }
  // ListPreference's radio list, Databases (database_title over the one default database), About Google Earth (about_info)
  // and Share's chooser.
  function dialog(ctx) {
    const d = ctx.ui.epsDialog; if (!d) return '';
    const shell = (title, body, buttons = '') => `<button class="mps-scrim" data-action="eps-cancel" aria-label="${e(ctx.t('Cancel'))}"></button><div class="mps-dialog" role="dialog" aria-label="${e(title)}"><h3>${e(title)}</h3>${body}${buttons ? `<div class="mps-buttons">${buttons}</div>` : ''}</div>`;
    const radio = (id, label, on) => `<button data-action="eps-pick" data-id="${e(id)}" role="radio" aria-checked="${on}"><span>${e(label)}</span><i class="mps-radio${on ? ' on' : ''}"></i></button>`;
    if (d.kind === 'list') { const r = rows(ctx).find(x => x.key === d.key); if (!r) return ''; const cur = value(ctx, r.key, r.def); return shell(r.title, `<div class="mps-choices">${r.options.map((label, i) => radio(`${r.key}:${i}`, label, cur === i)).join('')}</div>`, `<button data-action="eps-cancel">${e(ctx.t('Cancel'))}</button>`); }
    if (d.kind === 'databases') return shell(S(ctx, 'Databases'), `<p>${e(S(ctx, 'Please select the Google Earth Database you wish to connect to.'))}</p><div class="mps-choices">${radio('databases:0', S(ctx, 'Default Database'), true)}</div>`, `<button data-action="eps-cancel">${e(ctx.t('Cancel'))}</button>`);
    if (d.kind === 'about') { const [name, code] = BUILDS[ctx.earth]; return shell(S(ctx, 'About Google Earth'), `<p>${AndroidStrings.format(e(S(ctx, 'About info')), name, code || '').replace(/&lt;br&gt;/g, '<br>').replace(/&lt;(\/?)b&gt;/g, '<$1b>')}</p>`, `<button data-action="eps-cancel">${e(ctx.t('OK'))}</button>`); }
    // Earth 6.1's layer menu: the layers' data came from Google's servers, so the choice is kept but nothing is drawn.
    if (d.kind === 'layers') return shell(S(ctx, 'Layers'), `<div class="mps-choices">${LAYERS.map(l => { const on = (ctx.data.earthLayers || ['Borders and Labels']).includes(l); return `<button data-action="earth-layer" data-id="${e(l)}" role="checkbox" aria-checked="${on}"><span>${e(ctx.t(l))}</span><i class="mps-check${on ? ' on' : ''}"></i></button>`; }).join('')}</div>`, `<button data-action="eps-cancel">${e(ctx.t('OK'))}</button>`);
    if (d.kind === 'share') return shell(S(ctx, 'Share'), `<div class="mps-choices">${ctx.shareTargets.map(([app, name]) => `<button data-action="earth-share-to" data-id="${e(app)}"><img src="assets/${e(app)}.png" alt=""><span>${e(ctx.t(name))}</span></button>`).join('')}</div>`);
    return '';
  }
  function render(ctx) {
    const title = S(ctx, 'Settings');
    return `<div class="app-view sa-app mps mps-earth${ctx.dark ? ' mps-dark' : ''}">${ctx.bar(title)}<div class="sa-scroll mps-list">${rows(ctx).map(r => row(ctx, r)).join('')}</div>${dialog(ctx)}</div>`;
  }
  // The search card under the globe's bar, the place name and the share chooser over the globe.
  function overlay(ctx) { return ctx && ['share', 'layers'].includes(ctx.ui.epsDialog?.kind) ? dialog(ctx) : ''; }
  const canvas = () => '<canvas class="sa-earth-canvas"></canvas>';
  function mount(root, ctx) {
    const c = root.querySelector('.sa-earth-canvas');
    if (c) EarthGlobe.mount(c, view, {imagery: value(ctx, 'imagery_visibility', true), marker: ctx.ui.earthMyLoc ? {...EarthGlobe.HOME, src: ctx.dot, size: 22} : null});
  }
  // A place from the search field: the globe flies there, or the APK's "Not Found: %s".
  function search(query, ctx) {
    const q = String(query || '').trim().slice(0, 60); if (!q) return;
    const hit = EarthGlobe.find(q);
    if (!hit) { ctx.toast(AndroidStrings.format(S(ctx, 'Not Found: %s'), q)); return; }
    ctx.ui.earthQuery = q; ctx.ui.earthMyLoc = false; EarthGlobe.flyTo(view, hit);
  }
  // The shared text: the place (or the view's centre) and a Maps link to it.
  function shareText(ctx) {
    const lat = view.lat.toFixed(5), lon = view.lon.toFixed(5);
    return `${ctx.ui.earthQuery ? ctx.ui.earthQuery + '\n' : ''}http://maps.google.com/maps?ll=${lat},${lon}`;
  }
  // ctx: {ui, data, t, lang, save, render, toast, bar(title), account, earth (version), dark, dot (blue dot image),
  // shareTargets [[app, label]], share(app, text, subject), openLocation()}.
  function handle(action, id, ctx) {
    const {ui, data} = ctx, prefs = () => (data.earthPrefs ||= {});
    switch (action) {
      case 'earth-search-open': ui.earthSearching = true; ctx.render(); document.querySelector('#viewport .sa-earth-field input, #viewport .ea8-field input')?.focus(); return true;
      case 'earth-search-close': ui.earthSearching = false; break;
      case 'earth-settings': ui.earthPrefs = true; ui.epsDialog = null; ui.earthDrawer = false; break;
      case 'earth-myloc': ui.earthMyLoc = true; ui.earthQuery = ''; EarthGlobe.myLocation(view); break;
      case 'earth-north': EarthGlobe.north(view); return true;
      case 'earth-clear': ui.earthQuery = ''; ui.earthMyLoc = false; break;
      // One app that takes the text opens at once; more show the chooser.
      case 'earth-share': if (ctx.shareTargets.length === 1) { ctx.share(ctx.shareTargets[0][0], shareText(ctx), S(ctx, 'Earth')); return true; } ui.epsDialog = {kind: 'share'}; break;
      case 'earth-layers': ui.epsDialog = {kind: 'layers'}; ui.earthDrawer = false; break;
      case 'earth-layer': { const l = data.earthLayers ||= ['Borders and Labels'], i = l.indexOf(id); if (i >= 0) l.splice(i, 1); else l.push(id); ctx.save(); break; }
      case 'earth-share-to': ui.epsDialog = null; ctx.share(id, shareText(ctx), S(ctx, 'Earth')); return true;
      case 'eps-check': { const r = rows(ctx).find(x => x.key === id); if (!r) return true; prefs()[id] = !value(ctx, id, r.def); ctx.save(); break; }
      case 'eps-list': ui.epsDialog = {kind: 'list', key: id}; break;
      case 'eps-pick': { const [key, i] = String(id).split(':'); if (key !== 'databases') { prefs()[key] = Number(i); ctx.save(); } ui.epsDialog = null; break; }
      case 'eps-cancel': ui.epsDialog = null; break;
      case 'eps-act':
        if (id === 'clear') { ctx.toast(S(ctx, 'Clearing data cache')); return true; }
        if (id === 'google_location') { ui.earthPrefs = false; ctx.openLocation(); return true; }
        if (id === 'databases' || id === 'about') ui.epsDialog = {kind: id};
        break;
      default: return false;
    }
    ctx.render();
    return true;
  }
  // Back: a dialog, then Settings, then the search field's query.
  function back(ui) {
    if (ui.epsDialog) { ui.epsDialog = null; return true; }
    if (ui.earthPrefs) { ui.earthPrefs = false; return true; }
    return false;
  }
  // A fresh start: the spinning globe without a place.
  function open(ui) { Object.assign(ui, {earthPrefs: false, epsDialog: null, earthQuery: '', earthMyLoc: false, earthSearching: false}); view.spin = true; }
  window.EarthApp = {render, overlay, canvas, mount, search, handle, back, open, active, view, text: S};
})();
