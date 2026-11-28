/* The ICS image's Maps family and its other Google apps drawn by stock-apps.js and ics-extra-apps.js: Maps (with
   maps-route.js's directions and maps-prefs.js's settings), Latitude, Navigation, Places, Earth (earth-app.js), News &
   Weather (news-prefs.js), Messenger (plus-messenger.js) and Movie Studio (movie-studio.js), moved out of simulator.js
   (docs/plans/engine-migration.md). One module for the eight screens, as their old code was one block: the action bar
   overflow and the Maps menus, layers and search, Navigation's drive with Type destination and Exit navigation, News'
   settings, story and Share, each app's own controls, forms and Back, a fresh start's reset; News & Weather has no
   action bar, so the navigation bar shows the legacy menu key. */
(() => {
  'use strict';
  function api(c) {
    const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
    // A picked destination drives there as Type destination does; a Places find opens on the map.
    function extraContext() {
      return {ui, data, render, focus: selector => requestAnimationFrame(() => viewport.querySelector(selector)?.focus()),
        go(to) { const rt = MapsRoute.route(mrContext(), {to, mode: 'drive', avoid: data.mapsAvoid || {}}); MapsRoute.startNav(mrContext(), {name: to, km: rt.km, min: rt.min, mode: 'drive'}); render(); },
        openMap(query) { openApp('maps'); ui.mapsQuery = query; render(); }};
    }
    // Maps 6 directions and Navigation's drive (maps-route.js).
    function mrContext() {
      return {ui, data, t: key => i18n.t(key), locale: i18n.locale(), root: viewport, save, render,
        focus: selector => requestAnimationFrame(() => viewport.querySelector(selector)?.focus()),
        unsupported: () => toast(i18n.t('This feature is not part of the simulator.')),
        mapSvg: StockApps.mapSvg({ui: {...ui, mapsRoute: null, mapsQuery: ''}, data, t: key => i18n.t(key), locale: i18n.locale()}).replace(/^<svg[^>]*>|<\/svg>$/g, ''),
        navigate: run => { ui.mapsRoute = ui.mapsRoute ? {...ui.mapsRoute, screen: 'map'} : null; openApp('navigation'); MapsRoute.startNav(mrContext(), run); render(); }};
    }
    // Maps' settings screens (maps-prefs.js): the shell's save / render and opening another app's page.
    const mapsPrefsContext = () => ({ui, data, t: key => i18n.t(key), lang: i18n.language, locale: i18n.locale(), save, render, renderOverlay, open: (app, sub) => { openApp(app); if (sub) { ui.sub = sub; render(); } }});
    // Movie Studio (movie-studio.js): the projects and the editor shell.
    const movieContext = () => ({ui, data, t: key => i18n.t(key), S: key => JBExtraApps.text('studio', key), save, render, toast: message => toast(message), refuse: () => toast(i18n.t('This feature is not part of the simulator.')), thumb: i => StockApps.thumb(i), addIcon: 'assets/ms-ic_menu_add_clip_normal.png'});
    // Google+ Messenger (plus-messenger.js): Google+ 2.4's conversations, New conversation and settings.
    const messengerContext = () => ({ui, data, t: key => i18n.t(key), S: key => JBExtraApps.text('gplus', key), contacts: data.contacts, now: deviceDate(), locale: i18n.locale(), save, render, toast: message => toast(message), avatar: 'assets/msg-default_avatar.png', photoIcon: 'assets/gpm-ic_send_photo_holo_light.png', sendIcon: 'assets/gpm-ic_send_holo_light.png', version: '2.4', listMenu: ['Settings', 'Send feedback', 'Help'], me: i18n.t('Me')});
    // Earth (earth-app.js): Earth 6.1's settings, search, My location and Share.
    const earthContext = () => ({ui, data, t: key => i18n.t(key), lang: i18n.language, save, render, toast: message => toast(message), earth: '6.1', account: 'icecream.demo@gmail.com', dark: true, dot: 'assets/ea6-bluedot.png', shareTargets: [['messaging', 'Messaging']], share: (app, text, subject) => { ui.overlay = ''; renderOverlay(); openApp(app); ui.sub = 'new'; Object.assign(c.messageDraft(), {body: text, updated: Date.now()}); save(); render(); }, openLocation: () => { openApp('settings'); toast(i18n.t('This feature is not part of the simulator.')); }});

    return {extraContext, mrContext, mapsPrefsContext, movieContext, messengerContext, earthContext};
  }

  const ALL = ['maps', 'latitude', 'navigation', 'local', 'earth', 'news-weather', 'messenger', 'movie-studio'];
  const spec = {
    launch(c, resume, app) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      if (app === 'movie-studio' && !resume) MovieStudio.open(ui);
      if (app === 'messenger' && !resume) PlusMessenger.open(ui);
      if (app === 'earth' && !resume) EarthApp.open(ui);
      if (app === 'news-weather' && !resume) { ui.newsSub = ''; ui.nwpScreen = ''; ui.nwpDialog = ''; }
    },
    render(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      const {mrContext, movieContext, messengerContext, earthContext} = api(c);
      if (['maps', 'latitude', 'earth', 'news-weather'].includes(ui.view)) return StockApps.render(ui.view, {earthCtx: ui.view === 'earth' ? earthContext() : null, ui, data, t: key => i18n.t(key), lang: i18n.language, locale: i18n.locale(), now: deviceDate()});
      if (ui.view === 'navigation' && ui.navRun) return MapsRoute.nav(mrContext()); return JBExtraApps.render(ui.view, {studio: ui.view === 'movie-studio' ? movieContext() : null, messenger: ui.view === 'messenger' ? messengerContext() : null, ui, t: key => i18n.t(key), contacts: data.contacts, data});
    },
    mount(c, root) { if (c.ui.view === 'earth') EarthApp.mount(c.viewport, api(c).earthContext()); },
    legacyMenu(c) { return c.ui.view === 'news-weather' && !c.ui.newsSub; },
    overlay(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      const {mrContext, movieContext, messengerContext} = api(c);
      if (ui.overlay === 'jbx-menu') {
        return `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu">${(ui.view === 'messenger' ? PlusMessenger.menu(messengerContext()) : ui.view === 'movie-studio' ? MovieStudio.menu(movieContext()) : JBExtraApps.menu(ui.view, key => i18n.t(key))).map(item => `<button data-action="${item.action}">${safe(item.title)}</button>`).join('')}</div>`;
      }
      if (ui.overlay === 'mr-type') {
        // Navigation's Type destination: the address field with OK / Cancel.
        const S = key => MapsRoute.S(mrContext(), key), title = JBExtraApps.text ? JBExtraApps.text('navigation', 'Type destination') : 'Type destination';
        return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog" data-form="mr-type" role="dialog" aria-label="${safe(title)}" data-no-translate><h3>${safe(title)}</h3><input class="settings-dialog-input" name="to" autocomplete="off" spellcheck="false" style="display:block;width:calc(100% - calc(28.2353 * var(--dp)));margin:calc(4.7059 * var(--dp)) calc(14.1177 * var(--dp)) calc(14.1177 * var(--dp));padding:calc(7.0589 * var(--dp));font:inherit"><div class="settings-dialog-actions"><button type="button" data-action="close-overlay">${safe(S('Cancel'))}</button><button type="button" data-action="mr-type-ok">${safe(S('OK'))}</button></div></form>`;
      }
      if (ui.overlay === 'mr-exit') {
        const S = key => MapsRoute.S(mrContext(), key);
        return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${safe(S('Exit navigation?'))}" data-no-translate><h3>${safe(S('Exit navigation?'))}</h3><div class="settings-dialog-actions"><button data-action="close-overlay">${safe(S('Cancel'))}</button><button data-action="mr-exit-ok">${safe(S('OK'))}</button></div></div>`;
      }
      if (ui.overlay === 'sa-menu') {
        // The Google apps' action bar overflow (StockApps.menu: their menu XML's overflow items).
        return `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu">${StockApps.menu(ui.view, {ui, data, t: key => i18n.t(key), locale: i18n.locale(), now: deviceDate()}).map(item => `<button data-action="${item.action}"${item.id != null ? ` data-id="${safe(item.id)}"` : ''}>${safe(item.title)}</button>`).join('')}</div>`;
      }
    },
    // Navigation's and Places' controls work before the lock check, as they did.
    early(action, button, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      const {extraContext, mrContext} = api(c), {id} = button.dataset;
      if (action.startsWith('mr-') && window.MapsRoute && MapsRoute.handle(action, id, mrContext())) return true;
      // Navigation's Contacts / Starred places pickers and Places' search and categories (ics-extra-apps.js).
      if (action.startsWith('xa-') && JBExtraApps.handle(action, id, extraContext())) return true;
      if (action === 'mr-type-dest') { ui.overlay = 'mr-type'; renderOverlay(); overlayRoot.querySelector('input')?.focus(); return true; }
      if (action === 'mr-type-ok') { const to = overlayRoot.querySelector('input')?.value.trim(); ui.overlay = ''; renderOverlay(); if (to) { const rt = MapsRoute.route(mrContext(), {to, mode: 'drive', avoid: data.mapsAvoid || {}}); MapsRoute.startNav(mrContext(), {name: to, km: rt.km, min: rt.min, mode: 'drive'}); render(); } return true; }
      if (action === 'mr-exit-ok') { ui.overlay = ''; renderOverlay(); MapsRoute.stopNav(mrContext()); render(); return true; }
    },
    action(action, button, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      const {mapsPrefsContext, movieContext, messengerContext, earthContext} = api(c), {id} = button.dataset;
      // Maps, Earth, News & Weather and the simple extras.
      if (['maps', 'latitude', 'earth', 'news-weather', 'messenger', 'navigation', 'local', 'movie-studio'].includes(ui.view)) {
        if (ui.view === 'earth' && /^(earth|eps)-/.test(action)) { if (ui.overlay) { ui.overlay = ''; renderOverlay(); } if (EarthApp.handle(action, id, earthContext())) return true; }
        if (ui.view === 'messenger' && action.startsWith('gpm-')) { if (ui.overlay) { ui.overlay = ''; renderOverlay(); } if (PlusMessenger.handle(action, id, messengerContext())) return true; }
        if (ui.view === 'movie-studio' && action.startsWith('mst-')) { if (ui.overlay) { ui.overlay = ''; renderOverlay(); } if (MovieStudio.handle(action, id, movieContext())) return true; }
        if (action.startsWith('mps-') && window.MapsPrefs?.handle(action, id, mapsPrefsContext())) return true;
        if (action === 'jbx-menu') { ui.overlay = 'jbx-menu'; renderOverlay(); return true; }
        if (action === 'sa-unsupported' || action === 'kkx-unavailable') { ui.overlay = ''; renderOverlay(); toast(i18n.t('This feature is not part of the simulator.')); return true; }
        if (action === 'maps-switcher' || action === 'maps-layers') { ui.mapsMenu = action === 'maps-switcher' ? 'switcher' : 'layers'; ui.overlay = 'sa-menu'; renderOverlay(); return true; }
        if (action === 'maps-places') { openApp('local'); return true; }
        if (action === 'maps-feature') { ui.overlay = ''; ui.mapsMenu = ''; renderOverlay(); if (id === 'local' || id === 'navigation' || id === 'latitude' && ui.view !== 'latitude') openApp(id); else if (id === 'map' && ui.view === 'latitude') openApp('maps'); else if (id !== 'latitude') { data.mapsLayer = id === 'traffic' ? 'traffic' : ''; save(); render(); } return true; }
        // Latitude's arrows: me, then each friend, round again (StockApps.LAT_FRIENDS).
        if (action === 'maps-lat-step') { const n = StockApps.LAT_FRIENDS.length + 1; ui.latIndex = ((ui.latIndex ?? (Number(id) > 0 ? -1 : 0)) + Number(id) + n) % n; render(); return true; }
        if (action === 'maps-layer') { ui.overlay = ''; ui.mapsMenu = ''; renderOverlay(); data.mapsLayer = data.mapsLayer === id ? '' : id; save(); render(); return true; }
        if (action === 'maps-clear') { ui.overlay = ''; renderOverlay(); ui.mapsQuery = ''; ui.mapsSearching = false; data.mapsLayer = ''; save(); render(); return true; }
        if (action === 'maps-zoom') { const map = viewport.querySelector('.sa-maps6-map .sa-map'); if (map) { ui.mapsZoom = Math.max(1, Math.min(3, (ui.mapsZoom || 1) * (Number(id) > 0 ? 1.4 : 1 / 1.4))); map.style.transform = `scale(${ui.mapsZoom})`; } return true; }
        if (action === 'maps-locate') { ui.mapsQuery = ''; ui.mapsSearching = false; render(); return true; }
        if (action === 'maps-search-open') { ui.mapsSearching = true; render(); viewport.querySelector('.sa-maps6-search input')?.focus(); return true; }
        if (action === 'news-tab') { ui.newsTab = id; render(); return true; }
        if (action === 'sa-menu') { ui.mapsMenu = ''; ui.overlay = 'sa-menu'; renderOverlay(); return true; }
        // News & Weather: Refresh records the time the refresh status shows; Settings, the story page and Share story.
        if (action === 'sa-news-refresh') { ui.overlay = ''; renderOverlay(); NewsPrefs.refresh(data, deviceDate().getTime()); save(); render(); toast(AndroidStrings.pick(window.StockStrings?.news?.['Updating news topics…'], i18n.language, 'Updating news topics…')); return true; }
        if (action === 'news-settings') { ui.overlay = ''; renderOverlay(); ui.newsSub = 'settings'; ui.nwpScreen = 'root'; ui.nwpDialog = ''; render(); return true; }
        if (action === 'news-story') { ui.newsSub = 'story'; ui.newsStory = id; render(); return true; }
        if (action === 'news-share') { ui.overlay = ''; renderOverlay(); const title = viewport.querySelector('.nwp-story h2')?.textContent || ''; openApp('messaging'); ui.sub = 'new'; c.messageDraft().body = title; save(); render(); return true; }
        if (action.startsWith('nwp-')) { NewsPrefs.handle(action, id, {ui, data, lang: i18n.language, save, render, input: () => viewport.querySelector('[data-nwp-input]')?.value, unsupported: () => toast(i18n.t('This feature is not part of the simulator.'))}); return true; }
      }
      // NewsActivity (Theme.NoTitleBar, targetSdkVersion 11) has no action bar, so PhoneWindow asks for the menu key.
      if (action === 'legacy-menu' && ui.view==='news-weather') { ui.overlay='sa-menu';renderOverlay(); return true; }
    },
    submit(form, values, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      const {extraContext, mrContext, messengerContext, earthContext} = api(c);
      if (PlusMessenger.submit(form.dataset.form, values, messengerContext())) return true;
      if (JBExtraApps.submit(form.dataset.form, values, extraContext())) return true;
      if (form.dataset.form === 'mr-type') { overlayRoot.querySelector('[data-action="mr-type-ok"]')?.click(); return true; }
      if (form.dataset.form === 'mr-go') { MapsRoute.submit(values, mrContext()); return true; }
      if (form.dataset.form === 'maps-search') { ui.mapsQuery = String(values.get('query') || '').trim().slice(0, 60); window.MapsPrefs?.remember(data, ui.mapsQuery); save(); render(); return true; }
      if (form.dataset.form === 'earth-search') { ui.earthSearching = false; EarthApp.search(new FormData(form).get('query'), earthContext()); render(); return true; }
    },
    input(event, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      const {messengerContext} = api(c);
      if (PlusMessenger.input(event.target, messengerContext())) return true;
    },
    back(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      const {mrContext} = api(c);
      if (ui.view === 'earth' && !ui.overlay && EarthApp.back(ui)) { render(); return true; }
      if (ui.view === 'messenger' && !ui.overlay && PlusMessenger.back(ui)) { render(); return true; }
      if (ui.view === 'movie-studio' && !ui.overlay && MovieStudio.back(ui)) { render(); return true; }
      if ((ui.view === 'maps' || ui.view === 'latitude') && !ui.overlay && window.MapsPrefs?.back(ui)) { render(); return true; }
      if (ui.view === 'maps' && !ui.overlay && ui.mapsRoute && MapsRoute.back(mrContext())) return true;
      if (ui.view === 'navigation' && !ui.overlay && ui.navRun) { ui.overlay = 'mr-exit'; renderOverlay(); return true; }
      if (!ui.overlay && JBExtraApps.back(ui)) { render(); return true; }
      // News & Weather: a settings dialog or nested screen, then the settings or the story page.
      if (ui.view === 'news-weather' && ui.newsSub && !ui.overlay) { if (!(ui.newsSub === 'settings' && NewsPrefs.back(ui))) { ui.newsSub = ''; ui.nwpScreen = ''; } render(); return true; }
      return false;
    },
  };
  for (const id of ALL) ICS.register(id, spec);
})();
