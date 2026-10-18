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
