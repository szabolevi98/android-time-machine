/* Android 6.0.1 Google app (Velvet 5.3.27, priv-app/Velvet of MTC20K): the app 'search' (the Google icon and the home
   screen's search bar) and the Google Now page left of the home screen (MM.google.nowPage, drawn by mm-launcher.js).
   - The Now page: the context header picture of the time of day (context_header_bg_dawn / daylight / dusk / twilight)
     with the 48 dp search plate (text_search_plate_height, 2 dp corners, 16 dp in: ic_searchbox_google and the mic)
     at its foot, then the cards on #eeeeee (card_padding 16 dp). A new account first gets the opt-in card
     (now_opt_in_card_title, now_opt_in_card_description, the optin_minicard pictures, "Yes, I'm in" / "No, thanks");
     once in, first_run_welcome's card with "OK, got it" and the simulator's own cards (the weather, the next event
     from Calendar).
   - Search: the plate opens to a text field ("Search", type_or_tap_mic); a query shows the Google results of the
     offline web (mm-web.js) under it. Voice: the voice plate with "Speak now" and the red mic. */
(() => {
  'use strict';
  const T = () => MM.text('google');
  const esc = (c, s) => c.safe(s);
  const ui = c => c.ui.google || (c.ui.google = {mode: '', q: '', result: ''});
  const header = () => { const h = new Date().getHours(); return h < 6 || h >= 21 ? 'twilight' : h < 9 ? 'dawn' : h < 18 ? 'daylight' : 'dusk'; };
  function cards(c) {
    const t = T(), s = c.data.now || 'new';
    if (s === 'new') return `<div class="mmgg-card optin"><div class="mmgg-minis"><img src="assets/vv-optin_minicard_ic_weather.png" alt=""><img src="assets/vv-optin_minicard_ic_train.png" alt=""><img src="assets/vv-optin_minicard_ic_flight.png" alt=""></div>
      <b>${esc(c, t.t('now_opt_in_card_title'))}</b><p>${esc(c, t.t('now_opt_in_card_description'))}</p><div class="mmgg-btns"><button type="button" data-action="mmgg-optout">${esc(c, t.t('opt_in_not_now_button'))}</button><button type="button" class="pri" data-action="mmgg-optin">${esc(c, t.t('opt_in_agree_button'))}</button></div></div>`;
    if (s === 'off') return '';
    const next = (c.data.events || MM.defaults.events || []).filter(e => e.date >= new Date().toISOString().slice(0, 10)).sort((a, b) => (a.date + (a.start || '')).localeCompare(b.date + (b.start || '')))[0];
    const welcome = c.data.nowWelcomed ? '' : `<div class="mmgg-card"><p>${t.t('first_run_welcome')}</p><div class="mmgg-btns"><button type="button" class="pri" data-action="mmgg-welcomed">${esc(c, t.t('first_run_done'))}</button></div></div>`;
    const weather = `<div class="mmgg-card weather"><span class="mmgg-temp">18°</span><span class="mmgg-wtxt"><b>Riverside</b><small>Partly cloudy</small></span><img src="assets/vv-optin_minicard_ic_weather.png" alt=""></div>`;
    const when = next ? (() => { const [y, m, d] = next.date.split('-').map(Number), [hh, mm] = (next.start || '0:0').split(':').map(Number); const dt = new Date(y, m - 1, d, hh, mm); return new Intl.DateTimeFormat(c.locale(), {weekday: 'long', ...(next.start ? {hour: 'numeric', minute: '2-digit'} : {})}).format(dt); })() : '';
    const ev = next ? `<div class="mmgg-card"><small>${esc(c, when)}</small><b>${esc(c, next.title)}</b></div>` : '';
    return welcome + weather + ev;
  }
  function plate(c, open = false) {
    const t = T(), u = ui(c);
    return `<div class="mmgg-plate${open ? ' open' : ''}">${open ? `<button type="button" class="mmgg-back" data-action="mmgg-close"><img src="assets/gm-ic_arrow_back_wht_24dp.png" alt=""></button><form class="mmgg-form" data-form="mmgg-search"><input class="mmgg-input" name="q" value="${esc(c, u.q)}" placeholder="${esc(c, t.t('type_or_tap_mic'))}" autocomplete="off"></form>`
      : `<button type="button" class="mmgg-hit" data-action="mmgg-open"><img src="assets/gel-ic_searchbox_google.png" alt="Google"></button>`}<button type="button" class="mmgg-mic" data-action="mmgg-voice"><i></i></button></div>`;
  }
  function nowPage(c) {
    return `<div class="mmgg-now"><div class="mmgg-head" style="background-image:url('assets/vv-context_header_bg_${header()}.jpg')">${plate(c)}</div><div class="mmgg-cards">${cards(c)}</div></div>`;
  }
  function render(c) {
    const t = T(), u = ui(c);
    if (u.mode === 'voice') return `<div class="mmgg mmgg-voice"><div class="mmgg-vplate"><span>${esc(c, t.t('speak_now'))}</span><button type="button" class="mmgg-vmic" data-action="mmgg-close"><i></i></button></div></div>`;
    if (u.mode === 'search') {
      const p = u.result ? MM.web.page(u.result) : null;
      return `<div class="mmgg mmgg-search">${plate(c, true)}<div class="mmgg-results">${p ? `<div class="mmwb">${p.html}</div>` : ''}</div></div>`;
    }
    return `<div class="mmgg">${nowPage(c)}</div>`;
  }
  function action(name, el, event, c) {
    const u = ui(c);
    switch (name) {
      case 'mmgg-optin': c.data.now = 'on'; c.save(); c.render(); return true;
      case 'mmgg-optout': c.data.now = 'off'; c.save(); c.render(); return true;
      case 'mmgg-welcomed': c.data.nowWelcomed = true; c.save(); c.render(); return true;
      case 'mmgg-open': u.mode = 'search'; u.q = ''; u.result = ''; if (c.ui.view !== 'search') c.open('search'); else c.render(); return true;
      case 'mmgg-voice': u.mode = 'voice'; if (c.ui.view !== 'search') c.open('search'); else c.render(); return true;
      case 'mmgg-close': u.mode = ''; c.back(); return true;
      case 'mmcr-go': u.result = el.dataset.url; c.render(); return true;
    }
    return false;
  }
  MM.google = {nowPage, action};
  MM.register('search', {
    statusColor: c => ui(c).mode ? '#9e9e9e' : 'rgba(0,0,0,.2)',
    render,
    mount(c, root) { const i = root.querySelector('.mmgg-input'); if (i && document.activeElement !== i) i.focus(); },
    submit(form, event, c) {
      const u = ui(c), q = (form.elements.q?.value || '').trim(); if (!q) return;
      if (form.dataset.form === 'mmcr-search' || form.dataset.form === 'mmgg-search') { u.q = q; u.result = `${MM.web.GOOGLE}search?q=${encodeURIComponent(q).split('%20').join('+')}`; c.render(); }
    },
    back(c) { const u = ui(c); if (u.result) { u.result = ''; c.render(); return true; } if (u.mode) { u.mode = ''; return false; } return false; },
    action
  });
  // The home screen's search bar and mic open the app in the matching mode.
  MM.googleOpen = (c, voice) => { const u = ui(c); u.mode = voice ? 'voice' : 'search'; u.q = ''; u.result = ''; c.open('search'); };
})();
/* Now on Tap (Velvet's assist layer, held Home): assist_layer.xml's #9e000000 scrim over the screen and, at the foot,
   screen_assist_opt_in.xml on #f2f2f2 (the 16 sp bold title, the 14 sp body, LEARN MORE, Not now / Turn on in
   #4285f4) until it is turned on; then screen_assist_spinner.xml's 96 dp module and the result card, which on the
   simulator's screens is no_results_found_status ("Couldn't find a close match."), with the way to Google Now. */
(() => {
  'use strict';
  const T = () => MM.text('google');
  const esc = (c, s) => c.safe(s);
  const show = c => { c.ui.assistLoading = !!c.data.nowOnTap; c.overlay('assist'); if (c.data.nowOnTap) setTimeout(() => { c.ui.assistLoading = false; if (c.ui.overlay === 'assist') c.overlay('assist'); }, 900); };
  MM.register('assist', {
    app: false,
    show,
    render(c) {
      const t = T();
      const body = !c.data.nowOnTap
        ? `<div class="mmot-optin"><b>${esc(c, t.t('assist_optin_title'))}</b><p>${esc(c, t.t('assist_optin_body'))}</p><span class="mmot-learn">${esc(c, t.t('assist_optin_learn_more_text'))}</span><div class="mmot-btns"><button type="button" data-action="mmot-no">${esc(c, t.t('assist_optin_decline'))}</button><button type="button" class="yes" data-action="mmot-yes">${esc(c, t.t('assist_optin_accept'))}</button></div></div>`
        : c.ui.assistLoading ? `<div class="mmot-spin"><i></i></div>` : `<div class="mmot-card"><p>${esc(c, t.t('no_results_found_status'))}</p><button type="button" data-action="mmot-now">${esc(c, t.t('assist_layer_to_now'))}</button></div>`;
      return `<div class="mmot"><div class="mmot-scrim" data-action="mmot-close"></div><div class="mmot-panel">${body}</div></div>`;
    },
    action(name, el, event, c) {
      if (name === 'mmot-close' || name === 'mmot-no') { c.closeOverlay(); return true; }
      if (name === 'mmot-yes') { c.data.nowOnTap = true; c.save(); show(c); return true; }
      // assist_layer_to_now: the Google app on its Now page.
      if (name === 'mmot-now') { c.ui.google = {mode: '', q: '', result: ''}; c.open('search'); return true; }
      return false;
    }
  });
})();
/* The Google app's settings (com.google.android.velvet.ui.settings.SettingsActivity, Theme.Settings), the screen
   'home-settings': the launcher's Settings button and the app's own menu open it. Theme.Gsa.ActionBar: the toolbar in
   qp_blue #4285f4 (status bar qp_blue_dark #356ac3) with ic_arrow_back and search_settings; the headers of
   preferences_launcher.xml (Home screen: App suggestions and Allow rotation, both switches; GEL shows them while it is
   the home app) then preferences_headers.xml (Search & Now: Accounts & privacy, Search language, Voice, Phone search,
   Now cards, About; the Dogfood ones are hidden in release builds). Category titles are qp_preference_header (14 sp
   bold qp_blue), titles qp_preference (16 sp qp_text_b1 #de000000). App suggestions turns the apps list's predicted
   row on and off; rotation is kept but the simulator stays upright. */
(() => {
  'use strict';
  const T = () => MM.text('google');
  const esc = (c, s) => c.safe(s);
  const LAUNCHER = [['launcherPredictions', 'homescreen_settings_show_predictions', true], ['launcherRotation', 'allow_rotation_title', false]];
  const SEARCH = [['accounts', 'account_settings'], ['language', 'search_language'], ['voice', 'voice_settings'], ['sources', 'search_sources'], ['cards', 'now_cards'], ['about', 'about']];
  MM.register('home-settings', {
    statusColor: () => '#356ac3',
    render(c) {
      const t = T(), on = ([key, , def]) => c.data[key] ?? def;
      const sw = row => `<button type="button" class="mmgs-row" data-action="mmgs-switch" data-key="${row[0]}"><span>${esc(c, t.t(row[1]))}</span><i class="mmw-switch${on(row) ? ' on' : ''}"><i class="mmw-thumb"></i></i></button>`;
      const link = ([id, key]) => `<button type="button" class="mmgs-row" data-action="mmgs-open" data-id="${id}"><span>${esc(c, t.t(key))}</span></button>`;
      return `<div class="mmgs"><div class="mmgs-bar"><button type="button" class="mmgs-up" data-action="mmgs-up"><img src="assets/vv-ic_arrow_back.png" alt=""></button><span>${esc(c, t.t('search_settings'))}</span></div>
        <div class="mmgs-list"><div class="mmgs-cat">${esc(c, t.t('homescreen_settings_header_category'))}</div>${LAUNCHER.map(sw).join('')}<div class="mmgs-cat">${esc(c, t.t('header_category_search_and_now'))}</div>${SEARCH.map(link).join('')}</div></div>`;
    },
    action(name, el, event, c) {
      if (name === 'mmgs-up') { c.back(); return true; }
      if (name === 'mmgs-switch') { const row = LAUNCHER.find(r => r[0] === el.dataset.key); c.data[row[0]] = !(c.data[row[0]] ?? row[2]); c.save(); c.render(); return true; }
      if (name === 'mmgs-open') { c.open(`missing-google-settings-${el.dataset.id}`); return true; }
      return false;
    }
  });
})();
/* Google Play services 8.1's Google Settings (com.google.android.gms.app.settings.GoogleSettingsActivity, the screen
   'google-settings', from Settings' Google entry): common.Theme.GoogleSettings on v23, the toolbar in
   material_blue_grey_900 #263238 (status bar material_blue_grey_950 #21272b), common_google_settings. The rows are the
   ones its code adds for this image, in its order: Account (Sign-in & security, Personal info & privacy, Account
   preferences; Google+'s privacy row needs the Google+ app) and Services (Ads, Connected apps, Fit, Location, Nearby,
   Play Games for Play Games 3.2, Data management, Search & Now, Security, and Android Pay's row since the Android Pay
   app is installed; Maps' location, networking and Smart Lock for Passwords are off in this image). Category titles in
   the AppCompat accent #009688, rows 16 sp. */
(() => {
  'use strict';
  const T = () => MM.text('gms');
  const ACCOUNT = [['security', 'accountsettings_security_settings_title'], ['privacy', 'accountsettings_privacy_settings_title'], ['preferences', 'accountsettings_preferences_settings_title']];
  const SERVICES = [['ads', 'common_ads_settings_title'], ['apps', 'common_connected_apps_settings_title'], ['fit', 'common_fitness_settings_title'], ['location', 'common_location_settings_title'], ['nearby', 'common_nearby_settings_title'], ['games', 'common_games_settings_title'], ['data', 'common_google_settings_data_management_title'], ['now', 'common_search_and_now_settings_title'], ['security', 'common_security_settings_title'], ['pay', 'common_wallet_settings_title']];
  MM.register('google-settings', {
    statusColor: () => '#21272b',
    render(c) {
      const t = T(), row = ([id, key]) => `<button type="button" class="mmgs-row" data-action="mmgx-open" data-id="${id}"><span>${c.safe(t.t(key))}</span></button>`;
      return `<div class="mmgs mmgx"><div class="mmgs-bar"><button type="button" class="mmgs-up" data-action="mmgx-up"><img src="assets/gms-abc_ic_ab_back_mtrl_am_alpha.png" alt=""></button><span>${c.safe(t.t('common_google_settings'))}</span></div>
        <div class="mmgs-list"><div class="mmgs-cat">${c.safe(t.t('common_google_settings_account'))}</div>${ACCOUNT.map(row).join('')}<div class="mmgs-cat">${c.safe(t.t('common_google_settings_services'))}</div>${SERVICES.map(row).join('')}</div></div>`;
    },
    action(name, el, event, c) {
      if (name === 'mmgx-up') { c.back(); return true; }
      // Android Pay's row opens the Android Pay app; the others are Play services' own pages, not built yet.
      if (name === 'mmgx-open') { c.open(el.dataset.id === 'pay' ? 'android-pay' : `missing-gms-${el.dataset.id}`); return true; }
      return false;
    }
  });
})();
