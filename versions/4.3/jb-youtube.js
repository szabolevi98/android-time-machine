/* YouTube 4.5.17 of the Nexus 4 image (JWR66Y): the watch page's watch_menu.xml actions and SettingsActivity, from the
   APK and its code (docs/tools/dex-decompile.py):
   - Add to (ui/dq: add_to_dialog.xml under "Add to", adapter/ap's playlist_chooser_item.xml rows Watch later, Favorites,
     New playlist… with ic_list_watch_later / ic_list_favorite / ic_list_add_new, then the account's playlists); Watch
     later and Favorites refuse a video already in them, New playlist (create_playlist_dialog.xml: Title, Private) takes
     the video; the lists are kept in data.yt4.
   - Share (core/utils/n): ACTION_SEND text/plain with share_subject and the watch URL through the chooser "Share this
     video via"; the image's apps that take text here are Email, Gmail and Messaging.
   - Like / Dislike (ui/eg): the rating is kept and can be changed, toasting rating_like / rating_dislike; Copy URL
     (ui/dl) copies http://www.youtube.com/watch?v=<id> and toasts url_copied; Flag stays YouTube's web page.
   - Settings (preference_headers.xml in xml-v11 on this build): General (general_prefs.xml without Auto Uploads,
     which the code removes; Content localization lists GDataRequestFactory's 38 countries by their names), Connected
     TVs (pairing needs a TV: Google's flow), Search (Clear search history behind "Clear search history?", Never remember
     history, SafeSearch's single-choice "SafeSearch"), About (Google's pages, LicensesActivity's licenses.html, the
     APK's 4.5.17). Preloading and Developer are dropped by onBuildHeaders on a phone without prefetch or a dev build.
   Strings come from stock-strings.js (group youtube); the Holo Light rows and dialogs are the mps- styles. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const lang = ctx => String(ctx.locale || 'en').slice(0, 2);
  const Y = (ctx, key) => { const row = window.StockStrings?.youtube?.[key]; return row ? AndroidStrings.pick(row, lang(ctx), key) : ctx.t(key); };
  // The demo videos' ids in their watch URLs (stock-apps.js VIDEOS).
  const KEYS = {v1: 'Nx4hDq7Lw2E', v2: 'Jb43tPs8Kd0', v3: 'Tl7cYm2Wq5A', v4: 'Ck9dSr3Hb6U'};
  const watchUrl = id => `http://www.youtube.com/watch?v=${KEYS[id] || id}`;
  const store = data => { const s = data.yt4 ||= {}; for (const k of ['later', 'favorites', 'playlists', 'searches']) s[k] ||= []; s.ratings ||= {}; return s; };
  const pref = (data, key, def) => data.yt4Prefs?.[key] ?? def;
  // An earlier Like (stock-apps' data.ytLikes) still counts.
  const rating = (data, id) => store(data).ratings[id] || ((data.ytLikes || []).includes(id) ? 'like' : '');
  const COUNTRIES = ['AR', 'AU', 'BE', 'BR', 'CA', 'CL', 'CO', 'CZ', 'EG', 'FR', 'DE', 'GB', 'HK', 'HU', 'IN', 'IE', 'IL', 'IT', 'JP', 'JO', 'MY', 'MX', 'MA', 'NL', 'NZ', 'PE', 'PH', 'PL', 'RU', 'SA', 'SG', 'ZA', 'KR', 'ES', 'SE', 'TW', 'AE', 'US'];
  function countries(ctx) {
    let names; try { names = new Intl.DisplayNames([ctx.locale || 'en'], {type: 'region'}); } catch { names = null; }
    const collator = new Intl.Collator(ctx.locale || 'en');
    return COUNTRIES.map(code => [code, names?.of(code) || code]).sort((a, b) => collator.compare(a[1], b[1]));
  }
  const homeCountry = ctx => { const region = String(ctx.locale || '').split('-')[1]; return COUNTRIES.includes(region) ? region : 'US'; };
  // [kind, key, title, summary, default, entries]
  const PAGES = {
    general: ctx => [['check', 'default_hq', 'High quality on mobile', 'Start videos in high quality when connected to a mobile network. Startup may take longer.', false],
      ['list', 'subtitles_size', 'Caption font size', 'Sets the font size to use for captions', '2', [['1', 'Small'], ['2', 'Medium'], ['3', 'Large'], ['4', 'Huge']]],
      ['list', 'upload_policy', 'Uploads setting', 'Specify network preferences for uploads', 'wifi', [['wifi', 'Only when on Wi-Fi'], ['any', 'On any network']]],
      ['list', 'country', 'Content localization', 'Prioritize channels and videos from a specific country or region', homeCountry(ctx), countries(ctx), true],
      ['check', 'dev_retention_enabled', 'Improve YouTube', 'Help improve YouTube by sending anonymous usage data', true]],
    tv: () => [['web', 'pair_with_youtube_tv', 'Add a TV', 'Pair this device with your TV'], ['web', 'edit_tvs', 'Edit TVs', 'You can rename or remove your paired TVs at any time']],
    search: () => [['clear', 'clear_history', 'Clear search history', 'Clear previous YouTube searches from showing in the Search box'],
      ['check', 'no_search_history', 'Never remember history', 'Never store YouTube search history', false],
      ['list', 'safe_search', 'SafeSearch filtering', 'Block videos containing restricted content from showing in search results', '1', [['0', "Don't filter"], ['1', 'Moderate'], ['2', 'Strict']], false, 'SafeSearch']],
    about: () => [['web', 'help', 'Help pref', 'Find answers to your YouTube questions here'], ['web', 'feedback', 'Feedback pref', 'Help us make YouTube better'],
      ['web', 'mobile_terms', 'Google Mobile Terms of Service', 'Read Google Mobile Terms of Service'], ['web', 'youtube_terms', 'YouTube Terms of Service', "Read YouTube's Terms of Service"],
      ['web', 'mobile_privacy', 'Google Mobile Privacy Policy', 'Read Google Mobile Privacy Policy'], ['web', 'youtube_privacy', 'YouTube Privacy Policy', "Read YouTube's Privacy Policy"],
      ['licenses', 'open_source_licenses', 'Open source licenses', 'License details for open source software'], ['info', 'version', 'App version', '4.5.17']]
  };
  const HEADERS = [['general', 'General'], ['tv', 'Connected TVs'], ['search', 'Search header'], ['about', 'About']];
  const row = (ctx, page, key) => PAGES[page](ctx).find(r => r[1] === key);
  // The bar of SettingsActivity: the up caret, ic_logo_wide and the title (displayOptions 12 added to the style's).
  const bar = (ctx, title) => `<header class="sa-bar sa-yt-bar dark"><button class="sa-up" data-action="back" aria-label="YouTube"><img class="sa-caret" src="assets/ic_ab_back_holo_dark.png" alt=""><img class="sa-yt-logo" src="assets/yt4-ic_logo_wide.png" alt="YouTube"></button><span class="sa-title"><b>${e(title)}</b></span></header>`;
  function settings(ctx) {
    const {ui, data} = ctx, page = ui.yt4Page || '';
    if (page === 'licenses') return `<div class="app-view sa-app sa-youtube yt4-licenses">${bar(ctx, Y(ctx, 'Open source licenses'))}<iframe src="assets/yt4-licenses.html" title="${e(Y(ctx, 'Open source licenses'))}"></iframe></div>`;
    const rows = page ? PAGES[page](ctx).map(([kind, key, title, summary, def]) => {
      const info = kind === 'info', box = kind === 'check' ? `<i class="mps-check${pref(data, key, def) ? ' on' : ''}"></i>` : '';
      return `<button class="mps-row${info ? ' mps-info disabled' : ''}" data-action="${info ? '' : `yt4-pref-${kind}`}" data-id="${key}"${info ? ' disabled' : ''}${kind === 'check' ? ` role="checkbox" aria-checked="${!!pref(data, key, def)}"` : ''}><span><b>${e(Y(ctx, title))}</b><small>${e(info ? summary : Y(ctx, summary))}</small></span>${box}</button>`;
    }) : HEADERS.map(([id, title]) => `<button class="mps-row yt4-header" data-action="yt4-page" data-id="${id}"><span><b>${e(Y(ctx, title))}</b></span></button>`);
    return `<div class="app-view sa-app sa-youtube mps yt4-prefs">${bar(ctx, page ? Y(ctx, HEADERS.find(h => h[0] === page)[1]) : Y(ctx, 'Settings'))}<div class="sa-scroll mps-list">${rows.join('')}</div>${dialog(ctx)}</div>`;
  }
  function dialog(ctx) {
    const {ui, data} = ctx, d = ui.yt4Dialog; if (!d) return '';
    const shell = (title, body, buttons) => `<button type="button" class="mps-scrim" data-action="yt4-cancel" aria-label="${e(Y(ctx, 'Cancel'))}"></button><div class="mps-dialog yt4-dialog" role="dialog"${title ? ` aria-label="${e(title)}"` : ''}>${title ? `<h3>${e(title)}</h3>` : ''}${body}${buttons ? `<div class="mps-buttons">${buttons}</div>` : ''}</div>`;
    const cancel = `<button type="button" data-action="yt4-cancel">${e(Y(ctx, 'Cancel'))}</button>`;
    const radios = (items, current, action) => `<div class="mps-choices">${items.map(([value, label]) => `<button type="button" data-action="${action}" data-id="${e(value)}" role="radio" aria-checked="${value === current}"><span>${e(label)}</span><i class="mps-radio${value === current ? ' on' : ''}"></i></button>`).join('')}</div>`;
    if (d.kind === 'addto') {
      const rows = [['later', Y(ctx, 'Watch later'), 'watch_later'], ['favorites', Y(ctx, 'Favorites'), 'favorite'], ['new', Y(ctx, 'New playlist…'), 'add_new'], ...store(data).playlists.map(p => [`pl:${p.id}`, p.name, ''])];
      return shell(Y(ctx, 'Add to dialog'), `<div class="mps-choices yt4-chooser">${rows.map(([id, label, img]) => `<button type="button" data-action="yt4-addto-pick" data-id="${e(id)}"><span>${e(label)}</span>${img ? `<img src="assets/yt4-ic_list_${img}.png" alt="">` : ''}</button>`).join('')}</div>`, '');
    }
    if (d.kind === 'newlist') return shell(Y(ctx, 'New playlist'), `<input data-yt4-newlist maxlength="50" placeholder="${e(Y(ctx, 'Playlist title'))}" autocomplete="off"><label class="yt4-private"><input type="checkbox" data-yt4-private><span>${e(Y(ctx, 'Playlist private'))}</span></label>`, `${cancel}<button type="button" data-action="yt4-newlist-ok">${e(Y(ctx, 'OK'))}</button>`);
    if (d.kind === 'share') return `<button type="button" class="nwp-scrim" data-action="yt4-cancel" aria-label="${e(Y(ctx, 'Cancel'))}"></button><div class="nwp-dialog yt4-share" role="dialog" aria-label="${e(Y(ctx, 'Share this video via'))}"><h3>${e(Y(ctx, 'Share this video via'))}</h3><div class="nwp-choices">${[['email', 'Email'], ['gmail', 'Gmail'], ['messaging', 'Messaging']].map(([app, name]) => `<button type="button" data-action="yt4-share-to" data-id="${app}"><img src="assets/${app}.png" alt=""><span>${e(ctx.t(name))}</span></button>`).join('')}</div></div>`;
    if (d.kind === 'clear') return shell('', `<p>${e(Y(ctx, 'Clear search history?'))}</p>`, `${cancel}<button type="button" data-action="yt4-clear-ok">${e(Y(ctx, 'OK'))}</button>`);
    if (d.kind === 'list') {
      const [, key, title, , def, entries, raw, dialogTitle] = row(ctx, d.page, d.key);
      return shell(Y(ctx, dialogTitle || title), radios(entries.map(([value, label]) => [value, raw ? label : Y(ctx, label)]), String(pref(data, key, def)), 'yt4-pref-pick'), dialogTitle ? '' : cancel);
    }
    return '';
  }
  // ctx: {ui, data, t, locale, save, render, toast, share(app, subject, text), video(id), closeOverlay}.
  function handle(action, id, ctx) {
    const {ui, data} = ctx, s = store(data), v = ui.ytVideo || 'v1', toast = key => ctx.toast(Y(ctx, key));
    switch (action) {
      case 'yt4-rate': ctx.closeOverlay(); s.ratings[v] = id; data.ytLikes = (data.ytLikes || []).filter(x => x !== v); ctx.save(); ctx.render(); toast(id === 'like' ? 'You like this video' : 'You dislike this video'); return true;
      case 'yt4-copy': ctx.closeOverlay(); navigator.clipboard?.writeText(watchUrl(v)).catch(() => {}); toast('URL copied'); return true;
      case 'yt4-addto': ui.yt4Dialog = {kind: 'addto'}; ctx.render(); return true;
      case 'yt4-addto-pick':
        if (id === 'new') { ui.yt4Dialog = {kind: 'newlist'}; ctx.render(); ctx.focus('[data-yt4-newlist]'); return true; }
        ui.yt4Dialog = null;
        if (id === 'later' || id === 'favorites') {
          const dup = s[id].includes(v); if (!dup) s[id].unshift(v);
          ctx.save(); ctx.render(); toast(id === 'later' ? (dup ? 'Video is already in your Watch Later playlist' : 'Video added to Watch Later playlist') : (dup ? 'Video is already in your favorites' : 'Video added to favorites')); return true;
        }
        { const pl = s.playlists.find(p => `pl:${p.id}` === id); if (pl) { pl.videos.push(v); ctx.save(); ctx.toast(AndroidStrings.format(Y(ctx, 'Video added to %1$s playlist'), pl.name)); } }
        ctx.render(); return true;
      case 'yt4-newlist-ok': {
        const name = document.querySelector('#viewport [data-yt4-newlist]')?.value.trim() || '', priv = !!document.querySelector('#viewport [data-yt4-private]')?.checked;
        ui.yt4Dialog = null; if (!name) { ctx.render(); return true; }
        const pl = {id: String(Date.now()), name: name.slice(0, 50), private: priv, videos: [v]}; s.playlists.push(pl); ctx.save(); ctx.render();
        ctx.toast(AndroidStrings.format(Y(ctx, 'Video added to %1$s playlist'), pl.name)); return true;
      }
      case 'yt4-share': ui.yt4Dialog = {kind: 'share'}; ctx.render(); return true;
      case 'yt4-share-to': { ui.yt4Dialog = null; const title = ctx.video(v)?.title || ''; ctx.share(id, AndroidStrings.format(Y(ctx, 'Watch "%1$s" on YouTube'), title), watchUrl(v)); return true; }
      case 'yt4-cancel': ui.yt4Dialog = null; ctx.render(); return true;
      case 'yt4-settings': ctx.closeOverlay(); ui.yt4Back = ui.sub; ui.sub = 'settings'; ui.yt4Page = ''; ui.yt4Dialog = null; ctx.render(); return true;
      case 'yt4-page': ui.yt4Page = id; ctx.render(); return true;
      case 'yt4-pref-check': { const r = row(ctx, ui.yt4Page, id); (data.yt4Prefs ||= {})[id] = !pref(data, id, r[4]); ctx.save(); ctx.render(); return true; }
      case 'yt4-pref-list': ui.yt4Dialog = {kind: 'list', page: ui.yt4Page, key: id}; ctx.render(); return true;
      case 'yt4-pref-pick': (data.yt4Prefs ||= {})[ui.yt4Dialog.key] = id; ui.yt4Dialog = null; ctx.save(); ctx.render(); return true;
      case 'yt4-pref-clear': ui.yt4Dialog = {kind: 'clear'}; ctx.render(); return true;
      case 'yt4-clear-ok': s.searches = []; ui.yt4Dialog = null; ctx.save(); ctx.render(); return true;
      case 'yt4-pref-licenses': ui.yt4Page = 'licenses'; ctx.render(); return true;
      case 'yt4-pref-web': ctx.unsupported(); return true;
    }
    return false;
  }
  // Back: a dialog, then a settings page to the headers, then out of Settings.
  function back(ctx) {
    const {ui} = ctx;
    if (ui.yt4Dialog) { ui.yt4Dialog = null; ctx.render(); return true; }
    if (ui.sub !== 'settings') return false;
    if (ui.yt4Page) ui.yt4Page = ui.yt4Page === 'licenses' ? 'about' : ''; else { ui.sub = ui.yt4Back || ''; ui.yt4Back = ''; }
    ctx.render(); return true;
  }
  // A search is kept for the suggestions unless Never remember history is on.
  function searched(query, data) { if (pref(data, 'no_search_history', false)) return; const s = store(data); s.searches = [query, ...s.searches.filter(x => x !== query)].slice(0, 20); }
  window.JBYouTube = {settings, dialog, handle, back, searched, rating};
})();
