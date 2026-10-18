/* Android 6.0.1: Google Help and Google Feedback of Google Play services 8.1 (PrebuiltGmsCore, MTC20K), which the apps'
   Help and Send feedback items open.
   - 'help' (com.google.android.gms.googlehelp.helpactivities.HelpActivity, c.open('help', <app>)): the toolbar in the
     asking app's colour (GoogleHelp's theme settings) with "Help" and the gh_main_menu overflow (View in Google Play
     Store, Print…, Clear help history, Version info); gh_help_activity.xml's HelpConsoleScrollView on
     gh_help_console_background #e5e5e5, cards on gh_card_background 8 dp apart: the SearchView card ("Search help"),
     PopularArticlesFragment (gh_section_title "Popular" in gh_cardTitleStyle 14 sp medium #8a000000, then
     gh_help_article.xml rows: gh_article 24 dp, 32 dp before the 16 sp #de000000 title, 12 / 16 dp padding, dividers
     72 dp in), RecentlyViewedFragment once an article was read, and the contact card (Contact us, the Send feedback option
     with gh_feedback and gh_feedback_wait_time). An article opens HelpAnswerFragment; searching lists matching articles
     under gh_help_search_title or gh_no_results_found. The articles are the help center's, so the simulator makes them up
     (docs/data/mm-own.tsv, table help): three per app, describing what the app does.
   - 'feedback' (com.google.android.gms.feedback.FeedbackActivity, ActivityStyle on v21: common.Theme.GoogleSettings with
     colorPrimary material_light_blue_500 #03a9f4, colorPrimaryDark material_light_blue_700 #0288d1): "Feedback" with
     the gf_menu_send action; feedback_ui.xml 20 dp in: the account spinner (the account or Anonymous), "Write your
     feedback", the checked "Include screenshot and logs", the screenshot GoogleHelp took of the app (110 dp high on
     gf_action_bar_fill #00bbd3, "Touch to preview") beside gf_new_policy with its links (system information shows
     the report's fields). Sending with no text says gf_invalid_description_text; otherwise gf_report_being_sent, back
     to the app, then gf_feedback_being_sent. */
(() => {
  'use strict';
  const T = () => MM.text('help');
  const esc = (c, s) => c.safe(s);
  const A = n => `assets/gh-${n}.png`;
  // Which article set an app's Help shows (the media apps share Google Play's).
  const SETS = {calculator: 'calculator', calendar: 'calendar', clock: 'clock', contacts: 'contacts', gmail: 'gmail', messenger: 'messenger', photos: 'photos',
    chrome: 'chrome', drive: 'drive', hangouts: 'hangouts', maps: 'maps', youtube: 'youtube', 'play-store': 'play', 'play-music': 'media', 'play-movies': 'media', 'play-games': 'media', settings: 'settings', 'google-settings': 'settings'};
  const articles = set => [1, 2, 3].map(i => ({id: `${set}_${i}`, title: T().t(`${set}_${i}_t`), body: T().t(`${set}_${i}_b`)}));
  const all = () => [...new Set(Object.values(SETS))].flatMap(articles);
  const label = (c, app) => MM.appLabel ? MM.appLabel(c, app) : app;
  // The asking app's colorPrimary (its task colour) and, for the status bar, that colour darkened as the 700 shades are.
  const dark = hex => '#' + [1, 3, 5].map(i => Math.round(parseInt(hex.slice(i, i + 2), 16) * 0.8).toString(16).padStart(2, '0')).join('');
  const colors = (c, app) => { const p = app === 'settings' ? '#263238' : MM.appsData?.[app]?.color || '#4285f4'; return [p, app === 'settings' ? '#21272b' : dark(p)]; };

  function help(c) {
    const u = c.ui.help, t = T(), [primary] = colors(c, u.app);
    const row = a => `<button type="button" class="mmgh-art" data-action="mmgh-art" data-id="${a.id}"><img src="${A('gh_article')}" alt=""><span>${esc(c, a.title)}</span></button>`;
    const list = rows => rows.map(row).join('<i class="mmgh-div"></i>');
    const bar = `<div class="mmgh-bar" style="background:${primary}"><button type="button" class="mmgh-up" data-action="mmgh-up"><img src="assets/gms-abc_ic_ab_back_mtrl_am_alpha.png" alt=""></button><span>${esc(c, t.t('gh_menu_help'))}</span>${MM.menu.button(c, 'mmgh-over')}</div>`;
    if (u.article) {
      const a = all().find(x => x.id === u.article);
      return `<div class="mmgh">${bar}<div class="mmgh-page white"><div class="mmgh-answer"><h1>${esc(c, a.title)}</h1><p>${esc(c, a.body)}</p></div></div></div>`;
    }
    const search = `<div class="mmgh-card np-gh-gh_card_background mmgh-search"><img src="${A('gh_ic_search_grey_24dp')}" alt=""><input class="mmgh-q" value="${esc(c, u.q)}" placeholder="${esc(c, t.t('gh_default_help_box_string'))}" autocomplete="off">${u.q ? `<button type="button" class="mmgh-clear" data-action="mmgh-clear"><img src="${A('gh_search_clear_normal')}" alt=""></button>` : ''}</div>`;
    if (u.q.trim()) {
      const q = u.q.trim().toLowerCase(), hits = all().filter(a => a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q));
      return `<div class="mmgh">${bar}<div class="mmgh-page">${search}<div class="mmgh-card np-gh-gh_card_background"><div class="mmgh-ctitle">${esc(c, t.t('gh_help_search_title'))}</div>${hits.length ? list(hits) : `<div class="mmgh-none">${esc(c, t.t('gh_no_results_found'))}</div>`}</div></div></div>`;
    }
    const recent = (c.data.helpRecent || []).map(id => all().find(a => a.id === id)).filter(Boolean).slice(0, 5);
    return `<div class="mmgh">${bar}<div class="mmgh-page">${search}
      <div class="mmgh-card np-gh-gh_card_background"><div class="mmgh-ctitle">${esc(c, t.t('gh_popular_articles'))}</div>${list(articles(SETS[u.app] || 'play'))}
      ${recent.length ? `<i class="mmgh-sdiv"></i><div class="mmgh-ctitle">${esc(c, t.t('gh_help_recent_articles_title'))}</div>${list(recent)}` : ''}
      <i class="mmgh-sdiv"></i><button type="button" class="mmgh-browse" data-action="mmgh-browse">${esc(c, t.t('gh_help_browse_all_articles_title'))}</button></div>
      <div class="mmgh-card np-gh-gh_card_background"><div class="mmgh-ctitle">${esc(c, t.t('gh_menu_feedback_and_support'))}</div>
      <button type="button" class="mmgh-art mmgh-contact" data-action="mmgh-feedback"><img src="${A('gh_feedback')}" alt=""><span><b>${esc(c, t.t('gh_menu_send_feedback'))}</b><small>${esc(c, t.t('gh_feedback_wait_time'))}</small></span></button></div></div></div>`;
  }

  MM.register('help', {
    // The window animation's page (mm-core.js): deeper screens open over the ones they came from.
    page: c => MM.page('help', c.ui.help?.browse && 'browse', c.ui.help?.article),
    app: false,
    statusColor: c => colors(c, c.ui.help?.app)[1],
    render(c) {
      if (c.ui.sub !== undefined && c.ui.sub !== null && (!c.ui.help || c.ui.help.opened !== c.ui.sub)) c.ui.help = {app: c.ui.sub || 'play-store', opened: c.ui.sub, q: '', article: '', browse: false, shot: c.ui.thumbs?.[c.ui.sub]?.html || ''};
      return help(c);
    },
    mount(c, root) {
      const f = root.querySelector('.mmgh-q'); if (!f) return;
      f.addEventListener('input', () => { const pos = f.selectionStart; c.ui.help.q = f.value; c.render(); const g = c.el.viewport.querySelector('.mmgh-q'); if (g) { g.focus(); g.setSelectionRange(pos, pos); } });
    },
    back(c) {
      const u = c.ui.help;
      if (u?.article) { u.article = ''; c.render(); return true; }
      if (u?.q) { u.q = ''; c.render(); return true; }
      c.ui.help = null; return false;
    },
    action(name, el, event, c) {
      const u = c.ui.help, t = T();
      switch (name) {
        case 'mmgh-up': if (!this.back(c)) c.back(); return true;
        case 'mmgh-clear': u.q = ''; c.render(); return true;
        case 'mmgh-art': u.article = el.dataset.id; c.data.helpRecent = [el.dataset.id, ...(c.data.helpRecent || []).filter(x => x !== el.dataset.id)].slice(0, 5); c.save(); c.render(); return true;
        // BrowseAllArticlesFragment opens the product's help center in the browser.
        case 'mmgh-browse': c.open('chrome', 'url:https://support.google.com/'); return true;
        case 'mmgh-feedback': c.ui.feedbackShot = u.shot; c.open('feedback', u.app); return true;
        case 'mm-menu': {
          const app = MM.appsData?.[u.app];
          c.menu([
            {label: t.t('gh_menu_play_store'), action: c => c.open('play-store')},
            {label: t.t('gh_menu_print'), action: c => { const a = all().find(x => x.id === u.article); MM.print(c, {name: t.fmt('gh_print_job_name', null, a ? a.title : label(c, u.app)), title: a ? a.title : t.t('gh_menu_help'), lines: a ? [a.body] : articles(SETS[u.app] || 'play').map(x => x.title)}); }},
            {label: t.t('gh_menu_clear_history'), action: c => { c.data.helpRecent = []; c.save(); c.render(); c.toast(t.t('gh_clear_history_announcement')); }},
            {label: t.t('gh_menu_version_info'), action: c => c.dialog({title: label(c, u.app), html: `<div class="mmgh-ver"><p>${esc(c, t.fmt('gh_subtitle_format_for_version_number', null, app?.version || ''))}</p><p class="small">${esc(c, t.t('gh_copyright'))}</p></div>`, buttons: [{label: MM.text('framework').t('ok') || 'OK'}]})}
          ]);
          return true;
        }
      }
      return false;
    }
  });

  // -- Google Feedback ------------------------------------------------------------------------------------------------
  const BUILD = {brand: 'google', device: 'bullhead', product: 'bullhead', model: 'Nexus 5X', id: 'MTC20K', sdk: '23', release: '6.0.1', fingerprint: 'google/bullhead/bullhead:6.0.1/MTC20K/3142008:user/release-keys'};
  function shot(c, html, cls) {
    const vp = c.el.viewport, w = vp.clientWidth || 1, h = vp.clientHeight || 1;
    return `<div class="${cls}" style="aspect-ratio:${w}/${h}"><div class="mmgf-shotin" style="width:${w}px;height:${h}px;--w:${w}">${html}</div></div>`;
  }
  function feedback(c) {
    const u = c.ui.feedback, t = T();
    const bar = `<div class="mmgf-bar"><button type="button" class="mmgh-up" data-action="mmgf-up"><img src="assets/gms-abc_ic_ab_back_mtrl_am_alpha.png" alt=""></button><span>${esc(c, t.t(u.page === 'info' ? 'gf_preview_feedback' : u.page === 'shot' ? 'gf_preview_screenshot' : 'gf_report_feedback'))}</span>${u.page ? '' : `<button type="button" class="mmgf-send" data-action="mmgf-send" aria-label="${esc(c, t.t('gf_action_send'))}"><img src="${A('gf_menu_send')}" alt=""></button>`}</div>`;
    if (u.page === 'info') {
      const app = MM.appsData?.[u.app] || {};
      const rows = [['gf_error_report_type', t.t('gf_error_report_user_initiated')], ['gf_error_report_package_name', app.pkg || 'com.google.android.gms'], ['gf_error_report_package_version_name', app.version || ''],
        ['gf_error_report_time', new Intl.DateTimeFormat(c.locale(), {dateStyle: 'medium', timeStyle: 'medium'}).format(new Date(u.opened))], ['gf_locale', c.locale().replace('-', '_')],
        ['gf_error_report_brand', BUILD.brand], ['gf_error_report_device', BUILD.device], ['gf_error_report_product', BUILD.product], ['gf_error_report_model', BUILD.model],
        ['gf_error_report_build_id', BUILD.id], ['gf_error_report_sdk_version', BUILD.sdk], ['gf_error_report_release', BUILD.release], ['gf_error_report_build_fingerprint', BUILD.fingerprint]];
      return `<div class="mmgf">${bar}<div class="mmgf-page">${rows.map(([k, v]) => `<div class="mmgf-info"><b>${esc(c, t.t(k))}</b><span>${esc(c, v)}</span></div>`).join('')}</div></div>`;
    }
    if (u.page === 'shot') return `<div class="mmgf">${bar}<div class="mmgf-page dark">${shot(c, u.shot, 'mmgf-full')}</div></div>`;
    const link = (key, action) => `<button type="button" class="mmgf-link" data-action="${action}">${esc(c, t.t(key))}</button>`;
    const policy = AndroidStrings.format(esc(c, t.t('gf_new_policy')), link('gf_product_information', 'mmgf-info'), esc(c, t.t('gf_email_address')), link('gf_privacy_policy', 'mmgf-privacy'), link('gf_tos', 'mmgf-tos'));
    return `<div class="mmgf">${bar}<div class="mmgf-page"><div class="mmgf-form">
      <button type="button" class="mmgf-account" data-action="mmgf-account" aria-label="${esc(c, t.t('gf_touch_account_spinner'))}">${esc(c, u.anonymous ? t.t('gf_anonymous') : MM.account.email)}</button>
      <textarea class="mmgf-text" placeholder="${esc(c, t.t('gf_enter_feedback'))}">${esc(c, u.text)}</textarea>
      <button type="button" class="mmgf-check" data-action="mmgf-pii"><i class="mmst-check${u.pii ? ' on' : ''}"></i><span>${esc(c, t.t('gf_include_private_data'))}</span></button>
      <div class="mmgf-preview">${u.pii && u.shot ? `<div class="mmgf-shot" role="button" data-action="mmgf-shot">${shot(c, u.shot, 'mmgf-thumb')}<span>${esc(c, t.t('gf_touch_preview'))}</span></div>` : ''}<p class="mmgf-policy">${policy}</p></div></div></div></div>`;
  }
  MM.register('feedback', {
    app: false,
    statusColor: () => '#0288d1',
    render(c) {
      if (c.ui.sub !== undefined && c.ui.sub !== null && (!c.ui.feedback || c.ui.feedback.opened0 !== c.ui.sub)) {
        c.ui.feedback = {app: c.ui.sub || '', opened0: c.ui.sub, opened: Date.now(), text: '', pii: true, anonymous: false, page: '', shot: c.ui.feedbackShot || c.ui.thumbs?.[c.ui.sub]?.html || ''};
        c.ui.feedbackShot = '';
      }
      return feedback(c);
    },
    mount(c, root) {
      // The screenshot is the app's screen drawn at its own size and scaled into the preview box.
      for (const box of root.querySelectorAll('.mmgf-thumb, .mmgf-full')) { const inner = box.firstElementChild; box.style.setProperty('--k', box.clientWidth / (+inner.style.getPropertyValue('--w') || 1)); }
      const f = root.querySelector('.mmgf-text');
      if (f) f.addEventListener('input', () => { c.ui.feedback.text = f.value; });
    },
    back(c) { const u = c.ui.feedback; if (u?.page) { u.page = ''; c.render(); return true; } c.ui.feedback = null; return false; },
    action(name, el, event, c) {
      const u = c.ui.feedback, t = T();
      switch (name) {
        case 'mmgf-up': if (!this.back(c)) c.back(); return true;
        case 'mmgf-pii': u.pii = !u.pii; c.render(); return true;
        case 'mmgf-shot': u.page = 'shot'; c.render(); return true;
        case 'mmgf-info': u.page = 'info'; c.render(); return true;
        case 'mmgf-privacy': c.open('chrome', 'url:https://www.google.com/policies/privacy/'); return true;
        case 'mmgf-tos': c.open('chrome', 'url:https://www.google.com/policies/terms/'); return true;
        case 'mmgf-account': c.dialog({items: [MM.account.email, t.t('gf_anonymous')].map(s => ({html: esc(c, s)})), onItem: (i, c) => { u.anonymous = i === 1; c.render(); }}); return true;
        case 'mmgf-send':
          if (!u.text.trim()) { c.toast(t.t('gf_invalid_description_text')); return true; }
          c.toast(t.t('gf_report_being_sent'));
          c.ui.feedback = null; c.back();
          setTimeout(() => c.toast(t.t('gf_feedback_being_sent')), 2200);
          return true;
      }
      return false;
    }
  });
})();
