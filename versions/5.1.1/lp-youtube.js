/* YouTube 10.03.5's SettingsActivity on the Nexus 6 image (LMY48Y), from the APK's res/xml preferences and its code
   (cut out of the OAT file: docs/tools/oat2dex.py, docs/tools/dex-decompile.py). Theme.YouTube.Settings: the
   #f5f5f5 action bar with the up arrow and the #333 title over the #fefefe window, Material Light rows (the mps- styles).
   preference_headers.xml: General, Connected TVs, Privacy, Captions, About (onBuildHeaders drops Offline where it is not
   offered, Dogfood and Developer on a release build).
   - General (general_prefs.xml): Limit mobile data usage, Uploads, Content location (the countries of the code's list by
     name), Notifications, Safety mode (the InnerTube check box, which replaces SafeSearch filtering on this build).
   - Connected TVs: pairing needs a TV (Google's flow).
   - Privacy (privacy_prefs.xml): Clear watch history ("Are you sure you want to clear your watch history?"), Clear search
     history ("Clear search history?"), Pause search history.
   - Captions (subtitles_prefs.xml with pref_subtitles_preference.xml's "Captions will look like this" over it): Text size
     and Subtitles style; Custom Options only for the Custom style (updateCustomOptions): Font family, Text / Edge /
     Background / Window color and the opacities. The lists are the code's enums (cyr, cyq, cyk, cyi, cyj, cyo) with
     their defaults; Edge color needs an edge type, an opacity needs its colour (updateEdgeColorPreference …).
   - About: Google's pages, LicensesActivity's licenses.html, the APK's 10.03.5 and the "YouTube, a Google company" footer.
   Strings come from stock-strings.js (group youtube). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const Y = (ctx, key) => { const row = window.StockStrings?.youtube?.[key]; return row ? AndroidStrings.pick(row, String(ctx.locale || 'en').slice(0, 2), key) : ctx.t(key); };
  const pref = (data, key, def) => data.yt10Prefs?.[key] ?? def;
  const COUNTRIES = ['AR', 'AU', 'BE', 'BR', 'CA', 'CL', 'CO', 'CZ', 'EG', 'FR', 'DE', 'GB', 'HK', 'HU', 'IN', 'IE', 'IL', 'IT', 'JP', 'JO', 'MY', 'MX', 'MA', 'NL', 'NZ', 'PE', 'PH', 'PL', 'RU', 'SA', 'SG', 'ZA', 'KR', 'ES', 'SE', 'TW', 'AE', 'US'];
  function countries(ctx) {
    let names; try { names = new Intl.DisplayNames([ctx.locale || 'en'], {type: 'region'}); } catch { names = null; }
    const collator = new Intl.Collator(ctx.locale || 'en');
    return COUNTRIES.map(code => [code, names?.of(code) || code]).sort((a, b) => collator.compare(a[1], b[1]));
  }
  const homeCountry = ctx => { const region = String(ctx.locale || '').split('-')[1]; return COUNTRIES.includes(region) ? region : 'US'; };
  // Captions: cyr (scale), cyq (style), cyk (font), cyi (colours, ARGB), cyj (edge), cyo (opacity).
  const SCALES = [['0.25', 'Very small'], ['0.5', 'Small'], ['1.0', 'Normal'], ['1.5', 'Large'], ['2.0', 'Very large']];
  const STYLES = [['0', 'White on black'], ['1', 'Black on white'], ['2', 'Yellow on black'], ['3', 'Yellow on blue'], ['4', 'Custom']];
  const FONTS = [['0', 'Monospaced Serif'], ['1', 'Proportional Serif'], ['2', 'Monospaced Sans-Serif'], ['3', 'Proportional Sans-Serif'], ['4', 'Casual'], ['5', 'Cursive'], ['6', 'Small Capitals']];
  const COLORS = [['0', 'None'], ['-1', 'White'], ['-16777216', 'Black'], ['-65536', 'Red'], ['-256', 'Yellow'], ['-16711936', 'Green'], ['-16711681', 'Cyan'], ['-16776961', 'Blue'], ['-65281', 'Magenta']];
  const EDGES = [['0', 'None'], ['1', 'Uniform'], ['2', 'Drop shadow'], ['3', 'Raised'], ['4', 'Depressed']];
  const OPACITIES = [25, 50, 75, 100].map(n => [String(n), n]);
  const css = argb => { const n = Number(argb) >>> 0; return `#${(n & 0xffffff).toString(16).padStart(6, '0')}`; };
  // [kind, key, title, summary, default, entries, entries are names, dialog title]
  const PAGES = {
    general: ctx => [['check', 'limit_mobile_data_usage', 'Limit mobile data usage', 'Only stream HD video on Wi-Fi', false],
      ['list', 'upload_policy', 'Uploads setting', 'Specify network preferences for uploads', 'wifi', [['wifi', 'Only when on Wi-Fi'], ['any', 'On any network']]],
      ['list', 'country', 'Content location', 'Change content shown to you based on country', homeCountry(ctx), countries(ctx), true],
      ['check', 'video_notifications_enabled', 'Notifications', 'Receive notifications', true],
      ['check', 'innertube_safety_mode_enabled', 'Safety mode', 'Safety mode summary', false]],
    tv: () => [['web', 'pair_with_youtube_tv', 'Add a TV', 'Pair this device with your TV'], ['web', 'edit_tvs', 'Edit TVs', 'You can rename or remove your paired TVs at any time']],
    privacy: () => [['clear', 'clear_watch_history', 'Clear watch history', "Clear this account's watch history from all devices."],
      ['clear', 'clear_search_history', 'Clear search history', 'Clear previous YouTube searches from showing in the Search box'],
      ['check', 'no_search_history', 'Pause search history', 'Pause search history on this device', false]],
    captions: ctx => {
      const custom = pref(ctx.data, 'subtitles_style', '0') === '4', rows = [['cat', 'Standard Options'],
        ['list', 'subtitles_scale', 'Text size', '', '1.0', SCALES], ['list', 'subtitles_style', 'Subtitles style', '', '0', STYLES]];
      if (!custom) return rows;
      const off = (key, def) => pref(ctx.data, key, def) === '0';
      return [...rows, ['cat', 'Custom Options'], ['list', 'subtitles_font', 'Font family', '', '3', FONTS],
        ['color', 'subtitles_text_color', 'Text color', '', '-1', COLORS.slice(1)], ['list', 'subtitles_text_opacity', 'Text opacity', '', '100', OPACITIES, true],
        ['list', 'subtitles_edge_type', 'Edge type', '', '0', EDGES], ['color', 'subtitles_edge_color', 'Edge color', '', '-16777216', COLORS.slice(1), false, '', off('subtitles_edge_type', '0')],
        ['color', 'subtitles_background_color', 'Background color', '', '-16777216', COLORS], ['list', 'subtitles_background_opacity', 'Background opacity', '', '100', OPACITIES, true, '', off('subtitles_background_color', '-16777216')],
        ['color', 'subtitles_window_color', 'Window color', '', '0', COLORS], ['list', 'subtitles_window_opacity', 'Window opacity', '', '100', OPACITIES, true, '', off('subtitles_window_color', '0')]];
    },
    about: () => [['web', 'help', 'Help pref', 'Find answers to your YouTube questions here'], ['web', 'feedback', 'Send feedback', 'Help us make YouTube better'],
      ['web', 'youtube_terms', 'YouTube Terms of Service', "Read YouTube's Terms of Service"], ['web', 'mobile_privacy', 'Google Privacy Policy', 'Read Mobile Privacy Policy'],
      ['licenses', 'open_source_licenses', 'Open source licenses', 'License details for open source software'], ['info', 'version', 'App version', '10.03.5'],
      ['footer', 'youtube_a_google_company_footer', 'YouTube, a Google company']]
  };
  const HEADERS = [['general', 'General'], ['tv', 'Connected TVs'], ['privacy', 'Privacy'], ['captions', 'Captions'], ['about', 'About']];
  const row = (ctx, page, key) => PAGES[page](ctx).find(r => r[1] === key);
  const label = (ctx, r, value) => { const hit = r[5].find(([v]) => v === String(value)); return !hit ? '' : r[6] ? (typeof hit[1] === 'number' ? AndroidStrings.format(Y(ctx, '%1$d%%'), hit[1]) : hit[1]) : Y(ctx, hit[1]); };
  const bar = (ctx, title) => `<header class="yt10-bar yt10-search yt10-prefsbar"><button class="yt10-back" data-action="back" aria-label="${e(ctx.t('Navigate up'))}"></button><b>${e(title)}</b></header>`;
  // pref_subtitles_preference.xml: the sample line drawn with the chosen style (a preset or the custom options).
  function preview(ctx) {
    const {data} = ctx, p = (key, def) => pref(data, key, def), style = p('subtitles_style', '0');
    const preset = {0: ['-1', '-16777216'], 1: ['-16777216', '-1'], 2: ['-256', '-16777216'], 3: ['-256', '-16776961']}[style];
    const custom = style === '4', fg = preset ? preset[0] : p('subtitles_text_color', '-1'), bg = preset ? preset[1] : p('subtitles_background_color', '-16777216');
    const alpha = key => custom ? Number(p(key, '100')) / 100 : 1, edge = custom ? p('subtitles_edge_type', '0') : '0', ec = css(p('subtitles_edge_color', '-16777216'));
    const shadow = {1: `0 0 2px ${ec},0 0 2px ${ec}`, 2: `2px 2px 2px ${ec}`, 3: `-1px -1px 0 #fff8,1px 1px 0 ${ec}`, 4: `1px 1px 0 #fff8,-1px -1px 0 ${ec}`}[edge] || 'none';
    const font = {0: '"Courier New",serif', 1: 'serif', 2: 'monospace', 3: 'sans-serif', 4: '"Comic Sans MS",cursive', 5: 'cursive', 6: 'sans-serif'}[custom ? p('subtitles_font', '3') : '3'];
    const window = custom && p('subtitles_window_color', '0') !== '0' ? `background:${css(p('subtitles_window_color', '0'))};opacity:1;` : '';
    const span = `color:${css(fg)};opacity:${alpha('subtitles_text_opacity')};text-shadow:${shadow};font-family:${font};${custom && p('subtitles_font', '3') === '6' ? 'font-variant:small-caps;' : ''}background:${bg === '0' ? 'none' : `rgba(${[16, 8, 0].map(s => (Number(bg) >>> s) & 255).join(',')},${alpha('subtitles_background_opacity')})`}`;
    return `<div class="yt10-preview"><span class="yt10-window" style="${window}--yt10-scale:${p('subtitles_scale', '1.0')}"><span style="${span}">${e(Y(ctx, 'Captions will look like this'))}</span></span></div>`;
  }
  function settings(ctx) {
    const {ui, data} = ctx, page = ui.yt10Page || '';
    if (page === 'licenses') return `<div class="app-view sa-app sa-youtube sa-yt10 yt10-licenses">${bar(ctx, Y(ctx, 'Open source licenses'))}<iframe src="assets/yt10-licenses.html" title="${e(Y(ctx, 'Open source licenses'))}"></iframe></div>`;
    const rows = page ? PAGES[page](ctx).map(r => {
      const [kind, key, title, summary, def, entries, , , disabled] = r;
      if (kind === 'cat') return `<h4 class="yt10-category">${e(Y(ctx, key))}</h4>`;
      if (kind === 'footer') return `<p class="yt10-footer">${e(Y(ctx, title))}</p>`;
      // App version is a plain row on this build (about_prefs.xml sets no enabled="false").
      const info = kind === 'info', off = disabled, box = kind === 'check' ? `<i class="mps-check${pref(data, key, def) ? ' on' : ''}"></i>` : '';
      const sum = info ? summary : summary ? Y(ctx, summary) : entries ? label(ctx, r, pref(data, key, def)) : '';
      const action = off || info ? '' : kind === 'color' ? 'yt10-pref-list' : `yt10-pref-${kind}`;
      return `<button class="mps-row${info ? ' mps-info' : ''}${off ? ' disabled' : ''}" data-action="${action}" data-id="${key}"${off ? ' disabled' : ''}${kind === 'check' ? ` role="checkbox" aria-checked="${!!pref(data, key, def)}"` : ''}><span><b>${e(Y(ctx, title))}</b>${sum ? `<small>${e(sum)}</small>` : ''}</span>${box}</button>`;
    }) : HEADERS.map(([id, title]) => `<button class="mps-row yt10-header" data-action="yt10-page" data-id="${id}"><span><b>${e(Y(ctx, title))}</b></span></button>`);
    return `<div class="app-view sa-app sa-youtube sa-yt10 mps yt10-prefs">${bar(ctx, page ? Y(ctx, HEADERS.find(h => h[0] === page)[1]) : Y(ctx, 'Settings'))}${page === 'captions' ? preview(ctx) : ''}<div class="sa-scroll mps-list">${rows.join('')}</div>${dialog(ctx)}</div>`;
  }
  function dialog(ctx) {
    const {ui, data} = ctx, d = ui.yt10Dialog; if (!d) return '';
    const shell = (title, body, buttons) => `<button type="button" class="mps-scrim" data-action="yt10-cancel" aria-label="${e(Y(ctx, 'Cancel'))}"></button><div class="mps-dialog" role="dialog"${title ? ` aria-label="${e(title)}"` : ''}>${title ? `<h3>${e(title)}</h3>` : ''}${body}${buttons ? `<div class="mps-buttons">${buttons}</div>` : ''}</div>`;
    const cancel = `<button type="button" data-action="yt10-cancel">${e(Y(ctx, 'Cancel'))}</button>`;
    if (d.kind === 'clear') return shell('', `<p>${e(Y(ctx, d.key === 'clear_watch_history' ? 'Are you sure you want to clear your watch history?' : 'Clear search history?'))}</p>`, `${cancel}<button type="button" data-action="yt10-clear-ok">${e(Y(ctx, 'OK'))}</button>`);
    if (d.kind === 'list') {
      const r = row(ctx, d.page, d.key), [kind, key, title, , def, entries] = r, current = String(pref(data, key, def));
      // SubtitlesColorListPreference shows each colour's swatch beside its name.
      return shell(Y(ctx, title), `<div class="mps-choices">${entries.map(([value]) => `<button type="button" data-action="yt10-pref-pick" data-id="${e(value)}" role="radio" aria-checked="${value === current}"><span>${e(label(ctx, r, value))}</span>${kind === 'color' ? `<i class="yt10-swatch${value === '0' ? ' none' : ''}" style="background:${value === '0' ? 'transparent' : css(value)}"></i>` : ''}<i class="mps-radio${value === current ? ' on' : ''}"></i></button>`).join('')}</div>`, cancel);
    }
    return '';
  }
  // ctx: {ui, data, t, locale, save, render, closeOverlay, unsupported}.
  function handle(action, id, ctx) {
    const {ui, data} = ctx;
    switch (action) {
      case 'yt10-settings': ctx.closeOverlay(); ui.yt10Back = ui.sub; ui.sub = 'settings'; ui.yt10Page = ''; ui.yt10Dialog = null; ctx.render(); return true;
      case 'yt10-page': ui.yt10Page = id; ctx.render(); return true;
      case 'yt10-pref-check': { const r = row(ctx, ui.yt10Page, id); (data.yt10Prefs ||= {})[id] = !pref(data, id, r[4]); ctx.save(); ctx.render(); return true; }
      case 'yt10-pref-list': ui.yt10Dialog = {kind: 'list', page: ui.yt10Page, key: id}; ctx.render(); return true;
      case 'yt10-pref-pick': (data.yt10Prefs ||= {})[ui.yt10Dialog.key] = id; ui.yt10Dialog = null; ctx.save(); ctx.render(); return true;
      case 'yt10-pref-clear': ui.yt10Dialog = {kind: 'clear', key: id}; ctx.render(); return true;
      case 'yt10-clear-ok': if (ui.yt10Dialog?.key === 'clear_watch_history') data.yt10History = []; else data.yt10Searches = []; ui.yt10Dialog = null; ctx.save(); ctx.render(); return true;
      case 'yt10-pref-licenses': ui.yt10Page = 'licenses'; ctx.render(); return true;
      case 'yt10-pref-web': ctx.unsupported(); return true;
      case 'yt10-cancel': ui.yt10Dialog = null; ctx.render(); return true;
    }
    return false;
  }
  function back(ctx) {
    const {ui} = ctx;
    if (ui.yt10Dialog) { ui.yt10Dialog = null; ctx.render(); return true; }
    if (ui.sub !== 'settings') return false;
    if (ui.yt10Page) ui.yt10Page = ui.yt10Page === 'licenses' ? 'about' : ''; else { ui.sub = ui.yt10Back || ''; ui.yt10Back = ''; }
    ctx.render(); return true;
  }
  // The searches and the watched videos kept for Privacy's clears (Pause search history keeps no search).
  function searched(query, data) { if (pref(data, 'no_search_history', false)) return; data.yt10Searches = [query, ...(data.yt10Searches || []).filter(x => x !== query)].slice(0, 20); }
  function watched(id, data) { data.yt10History = [id, ...(data.yt10History || []).filter(x => x !== id)].slice(0, 50); }
  window.LPYouTube = {settings, handle, back, searched, watched};
})();
