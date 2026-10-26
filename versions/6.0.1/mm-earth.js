/* Google Earth 8.0.4.2346 (installed from Play: _aosp/bullhead/playapps/GoogleEarth.apk, not part of MTC20K; see
   docs/sources.md). The layout is 5.1.1's Earth 8.0.1 (common.xml): the AppCompat Toolbar on actionbar_gradient with
   the drawer toggle and the title, menu/main.xml's Search, My location and Share (Clear map and the overflow once a
   search is shown), the compass (button_compass under ic_compass) and Street View's pegman, and the drawer: the
   account, Maps Gallery, Google+ Photos, Layers, then Settings, Feedback, Help and Tutorial.
   The globe is earth-globe.js (NASA Blue Marble, kept locally): Search flies to a place of its list ("Not Found: %s"
   otherwise), My location to the demo phone with the APK's blue dot, the compass turns the heading back, Share sends a
   Maps link, Layers keeps its choice; Settings is the APK's settings.xml (mm-appprefs). Maps Gallery, Google+ Photos,
   Street View and Google's help pages keep the simulator's limit. */
(() => {
  'use strict';
  const T = () => MM.text('earth'), t = k => T().t(k);
  const U = c => c.ui.earth ||= {search: false, query: '', drawer: false, myloc: false};
  const view = {lon: -100, lat: 25, zoom: 1, heading: 0, spin: true};
  const LAYERS = ['Places', 'Businesses', 'Panoramio Photos', 'Wikipedia', 'Borders and Labels', '3D Buildings'];
  const refuse = c => c.toast(c.t('This feature is not part of the simulator.'));
  const img = (c, action, label, src) => `<button type="button" class="mmea-btn" data-action="${action}" aria-label="${c.safe(label)}"><img src="assets/ea84-${src}.png" alt=""></button>`;
  function render(c) {
    const u = U(c), e = s => c.safe(s);
    const search = u.search ? `<form class="mmea-field" data-form="mmea-search"><input name="query" autocomplete="off" placeholder="${e(t('search_hint'))}" aria-label="${e(t('search_id'))}"></form>` : img(c, 'mmea-search', t('search_id'), 'ic_menu_search');
    const actions = u.query ? `${img(c, 'mmea-clear', t('menu_clear'), 'ic_menu_clear_map')}${MM.menu.button(c, 'mmea-more')}` : `${img(c, 'mmea-myloc', t('my_location'), 'ic_menu_mylocation')}${img(c, 'mmea-share', t('menu_share'), 'ic_share_alt_white_24dp')}`;
    const drawer = u.drawer ? `<div class="mmea-scrim" data-action="mmea-drawer"></div><nav class="mmea-drawer"><div class="mmea-account"><img src="assets/ea84-avatar_placeholder.png" alt=""><b>Nexus 5X</b><small>${e(MM.account?.email || '')}</small></div>${[['mmea-unavailable', 'menu_gallery'], ['mmea-unavailable', 'menu_tour_from_album'], ['mmea-layers', 'menu_layer']].map(([a, k]) => `<button type="button" data-action="${a}">${e(t(k))}</button>`).join('')}<hr>${[['mmea-settings', 'menu_settings'], ['mmea-unavailable', 'menu_feedback'], ['mmea-unavailable', 'menu_help'], ['mmea-unavailable', 'menu_tutorial']].map(([a, k]) => `<button type="button" data-action="${a}">${e(t(k))}</button>`).join('')}</nav>` : '';
    return `<div class="mmea"><canvas class="mmea-globe"></canvas><header class="mmea-bar"><button type="button" class="mmea-toggle" data-action="mmea-drawer" aria-label="${e(t('menu_layer'))}"><i></i><i></i><i></i></button><b>${u.search ? '' : e(u.query || t('app_name'))}</b>${search}${actions}</header><button type="button" class="mmea-compass" data-action="mmea-north" aria-label="${e(t('menu_north_up'))}"><img src="assets/ea84-button_compass.png" alt=""><img src="assets/ea84-ic_compass.png" alt=""></button><button type="button" class="mmea-pegman" data-action="mmea-unavailable" aria-label="${e(t('menu_streetview'))}"><img src="assets/ea84-pegman.png" alt=""></button>${drawer}</div>`;
  }
  function mount(c, root) {
    const u = U(c), canvas = root.querySelector('.mmea-globe');
    if (canvas) EarthGlobe.mount(canvas, view, {marker: u.myloc ? {...EarthGlobe.HOME, src: 'assets/ea84-bluedot.png', size: 22} : null});
    if (u.search) requestAnimationFrame(() => root.querySelector('.mmea-field input')?.focus());
  }
  const share = c => MM.share(c, {title: t('menu_share'), subject: t('app_name'), text: `${U(c).query ? U(c).query + '\n' : ''}http://maps.google.com/maps?ll=${view.lat.toFixed(5)},${view.lon.toFixed(5)}`});
  const myLocation = c => { Object.assign(U(c), {myloc: true, query: ''}); EarthGlobe.myLocation(view); c.render(); };
  // Layers: Earth 8's layer list came from Google's servers; the choice is kept, the globe draws only the imagery.
  function layers(c) {
    const on = c.data.earthLayers || ['Borders and Labels'];
    c.dialog({title: t('menu_layer'), items: LAYERS.map(l => ({html: `<span>${c.safe(c.t(l))}</span><i class="mmea-check${on.includes(l) ? ' on' : ''}"></i>`})), keepOpen: true,
      onItem: (i, c) => { const list = c.data.earthLayers ||= ['Borders and Labels'], k = list.indexOf(LAYERS[i]); if (k >= 0) list.splice(k, 1); else list.push(LAYERS[i]); c.save(); layers(c); },
      buttons: [{label: MM.text('framework').t('ok')}]});
  }
  function action(name, el, ev, c) {
    if (name === 'mm-menu') { c.menu([{label: t('my_location'), action: myLocation}, {label: t('menu_share'), action: share}], el); return true; }
    if (!name.startsWith('mmea-')) return false;
    const u = U(c);
    switch (name.slice(5)) {
      case 'drawer': u.drawer = !u.drawer; break;
      case 'search': u.search = true; break;
      case 'clear': u.query = ''; u.myloc = false; break;
      case 'myloc': myLocation(c); return true;
      case 'share': share(c); return true;
      case 'north': EarthGlobe.north(view); return true;
      case 'layers': u.drawer = false; c.render(); layers(c); return true;
      case 'settings': u.drawer = false; c.render(); MM.openPrefs(c, 'earth', 'settings', t('menu_settings')); return true;
      case 'unavailable': u.drawer = false; c.render(); refuse(c); return true;
      default: return false;
    }
    c.render(); return true;
  }
  // The search field: a place of earth-globe.js's list, else the APK's "Not Found: %s".
  function submit(form, ev, c) {
    if (form.dataset.form !== 'mmea-search') return false;
    const u = U(c), q = String(new FormData(form).get('query') || '').trim().slice(0, 60);
    u.search = false;
    const hit = q && EarthGlobe.find(q);
    if (hit) { u.query = q; u.myloc = false; EarthGlobe.flyTo(view, hit); } else if (q) c.toast(AndroidStrings.format(t('search_not_found'), q));
    c.render(); return true;
  }
  MM.register('earth', {
    render, mount, action, submit,
    statusColor: () => 'rgba(0,0,0,.2)',
    back(c) {
      const u = U(c);
      if (u.drawer) { u.drawer = false; c.render(); return true; }
      if (u.search) { u.search = false; c.render(); return true; }
      return false;
    }
  });
  // Settings: Clear Data Cache's progress text; About Google Earth (about_info with the version); Google location
  // settings opens the system's location page.
  MM.appPrefsHooks = MM.appPrefsHooks || {};
  MM.appPrefsHooks.earth = {
    click(c, key) {
      if (key === 'settings.clear') { c.toast(MM.text('appprefs').t('GoogleEarth/msg_clear_cache')); return true; }
      if (key === 'settings.about') { c.dialog({title: MM.text('appprefs').t('GoogleEarth/settings_about_item'), message: AndroidStrings.format(MM.text('appprefs').t('GoogleEarth/about_info'), '8.0.4.2346'), buttons: [{label: MM.text('framework').t('ok')}]}); return true; }
      if (key === 'settings.google_location') { c.open('settings', 'xml:location_settings'); return true; }
      return false;
    }
  };
})();
