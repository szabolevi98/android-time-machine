/* The reading parts of Currents 2.1 and Play Magazines 2.0 (4.3) and Play Newsstand 3.x (4.4.4, 5.1.1): a story or a
   magazine article opens in a reader page, Save For Later / Bookmark for Later keeps it (data.newsSaved[app]), Search
   filters the phone's stories by title and source, the drawer's Saved / Bookmarks and empty sections show their lists
   or the APK's empty captions, On device only (Magazines, Newsstand) leaves only what is kept, and Settings is the
   APK's settings XML (settings_currents.xml, preference_magazines.xml, Newsstand's settings.xml) on the version's mps-
   rows; Newsstand's Article text size sets the reader's text. The articles are short made-up demo pieces like News &
   Weather's (owner decision 2026-10-26); the frames, menus and settings texts are the APKs'. Subscriptions, the
   store, accounts and Google's web pages keep the simulator's limit. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // The demo stories: 2013 for Currents and Magazines, 2014 for Newsstand (4.4.4 and 5.1.1 show the same Read Now).
  const ARTICLES = {
    c1: {source: 'Tech Daily', color: '#e53935', title: 'Phones get thinner, batteries get smarter', body: ['This season’s phones lose another millimetre, but the bigger change is inside: chargers and batteries now talk to each other, so a quick top-up no longer wears the cell out as fast.', 'Screens moved to 1080p on the larger models, and the cameras finally keep up in dim rooms. Most makers kept the headphone jack and the microSD slot where they were.', 'The verdict after a week: the gains are quiet, but you notice them at ten in the evening when the battery still shows a third.']},
    c2: {source: 'Trail & Summit', color: '#43a047', title: 'Five day hikes for late summer', body: ['August afternoons get hot above the tree line, so start early and pick routes with shade on the way back down.', 'Our five favourites range from a two-hour loop round a quiet lake to a full day on the ridge with views over three valleys. All of them have parking before nine and water on the way.', 'Pack a light shell anyway: the weather turns quickly in the hills, even when the morning looks perfect.']},
    c3: {source: 'Weekend Kitchen', color: '#fb8c00', title: 'One pan, three dinners', body: ['Roast a tray of chicken thighs, peppers and onions on Sunday and you are most of the way to three weeknight dinners.', 'Monday: warm tortillas, the sliced chicken and a spoon of yoghurt. Tuesday: the vegetables blended with stock into a quick soup. Wednesday: everything left over tossed through pasta with lemon and parsley.', 'The trick is to season lightly the first time, so each dinner can go its own way.']},
    g1: {source: 'Gadget Weekly', color: '#c62828', title: 'Hands-on with this summer’s tablets', body: ['Seven inches is the size to beat this year: light enough for one hand, big enough for a magazine page.', 'We spent a week with the new models on the train, on the sofa and in bed. Sharper screens make the biggest difference for reading; speakers are still an afterthought.']},
    g2: {source: 'Gadget Weekly', color: '#ad1457', title: 'Smart watches: worth the wait?', body: ['A watch that shows who is calling sounds small until your phone is in a coat pocket on a cold day.', 'The first models are promising but thick, and battery life is measured in days, not weeks. We would wait for the second round.']},
    t1: {source: 'Trail & Summit', color: '#2e7d32', title: 'Packing light for three days', body: ['A three-day trip fits in a 35-litre pack if you plan meals that share the same pot and leave the spare shoes at home.', 'Our list, tested on two trips this summer, comes in under nine kilos with food and water.']},
    k1: {source: 'Weekend Kitchen', color: '#ef6c00', title: 'Tomatoes, four ways', body: ['August is tomato month. Slow-roast the small ones, grate the big ones into a quick sauce and keep the best for salad with nothing but salt and oil.', 'Our fourth way is a cold soup that takes ten minutes and keeps for two days.']},
    n1: {source: 'Gadget Weekly', color: '#15a0c8', title: 'Material design comes to more apps', body: ['Bold colours, cards and shadows that show what sits on top of what: the new design language is spreading from the system to the apps we use every day.', 'The changes are more than a new coat of paint. Buttons move to where thumbs reach, and animations explain where a screen came from and where it went.', 'Not every app has made the switch yet, but by the end of the year most of the big ones will look like they belong together.']},
    n2: {source: 'Trail & Summit', color: '#4285f4', title: 'A weekend of trails above the city', body: ['You do not have to drive for hours to find quiet paths. Three trailheads are a short bus ride from the centre, and each has a loop for a free afternoon.', 'Saturday: the ridge path with the long view over the bay. Sunday: a slower walk through the old oak woods, finishing at a café that opens early.', 'Bring layers, a full bottle of water and a map that works without signal.']},
    n3: {source: 'Weekend Kitchen', color: '#ef851c', title: 'Five autumn soups in thirty minutes', body: ['When the evenings get shorter, a pot of soup is the easiest dinner there is. All five of ours are on the table in half an hour.', 'Start with roasted squash and ginger, then leek and potato, a spiced lentil, a quick minestrone and a creamy mushroom that tastes like it took all afternoon.', 'Each one freezes well, so make a double batch on Sunday.']}
  };
  const ISSUES = {mag1: {title: 'Gadget Weekly', issue: 'July 2013', color: '#c62828', articles: ['g1', 'c1']}, mag2: {title: 'Trail & Summit', issue: 'Summer 2013', color: '#2e7d32', articles: ['t1', 'c2']}, mag3: {title: 'Weekend Kitchen', issue: 'August 2013', color: '#ef6c00', articles: ['k1', 'c3']}, mag4: {title: 'Gadget Weekly', issue: 'June 2013', color: '#ad1457', articles: ['g2']}};
  const STORIES = {currents: ['c1', 'c2', 'c3'], 'play-magazines': ['g1', 'g2', 't1', 'k1', 'c1', 'c2', 'c3'], newsstand: ['n1', 'n2', 'n3']};
  const saved = (ctx) => (ctx.data.newsSaved || {})[ctx.app] || [];
  const isSaved = (ctx, id) => saved(ctx).includes(id);
  const value = (ctx, key, def) => ctx.data.newsPrefs?.[ctx.app]?.[key] ?? def;
  const onDevice = ctx => !!ctx.data.newsOnDevice?.[ctx.app];
  // The APK's words for keeping an article: Currents / Magazines save for later, Newsstand bookmarks.
  const WORDS = {currents: ['Save For Later', 'Remove From Saved', 'Saved', 'This section has no content.'], 'play-magazines': ['Save For Later', 'Remove From Saved', 'Saved', 'This section has no content.'], newsstand: ['Bookmark for Later', 'Remove from Bookmarks', 'Bookmarks', 'No articles bookmarked']};
  const words = ctx => WORDS[ctx.app];
  // The reader page.
  function article(ctx, id) {
    const a = ARTICLES[id], [save, unsave] = words(ctx), on = isSaved(ctx, id);
    const size = ctx.app === 'newsstand' ? ['small', 'normal', 'large'][value(ctx, 'articleTextSize', 1)] : 'normal';
    const actions = `<button class="nr-act" data-action="nr-save" data-id="${e(id)}">${e(ctx.S(on ? unsave : save))}</button><button class="nr-act" data-action="nr-share" data-id="${e(id)}">${e(ctx.S('Share'))}</button>`;
    return `<div class="app-view nr nr-${e(ctx.app)}">${ctx.bar({title: a.source, up: true, actions})}<div class="nr-scroll"><article class="nr-article nr-${size}"><div class="nr-art" style="background:${a.color}"></div><small style="color:${a.color}">${e(a.source)}</small><h1>${e(a.title)}</h1>${a.body.map(p => `<p>${e(p)}</p>`).join('')}</article></div></div>`;
  }
  const row = (ctx, id) => { const a = ARTICLES[id]; return `<button class="nr-row" data-action="nr-open" data-id="${e(id)}"><i style="background:${a.color}"></i><span><small>${e(a.source)}</small><b>${e(a.title)}</b></span></button>`; };
  const empty = text => `<p class="nr-empty">${e(text)}</p>`;
  // A list: the search results, Saved / Bookmarks, an empty section or a magazine issue's contents.
  function list(ctx, title, ids, emptyText, extra = '') {
    return `<div class="app-view nr nr-${e(ctx.app)}">${ctx.bar({title, up: true})}${extra}<div class="nr-scroll">${ids.length ? ids.map(id => row(ctx, id)).join('') : empty(emptyText)}</div></div>`;
  }
  function search(ctx) {
    const q = String(ctx.ui.nrQuery || '').trim().toLowerCase();
    const hits = q ? STORIES[ctx.app].filter(id => `${ARTICLES[id].title} ${ARTICLES[id].source}`.toLowerCase().includes(q)) : [];
    const field = `<form class="nr-search" data-form="nr-search"><input name="q" autocomplete="off" value="${e(ctx.ui.nrQuery || '')}" placeholder="${e(ctx.S('@search_hint'))}" aria-label="${e(ctx.S('@search_hint'))}"></form>`;
    return `<div class="app-view nr nr-${e(ctx.app)}">${ctx.bar({title: '', up: true, actions: field})}<div class="nr-scroll">${q ? hits.length ? hits.map(id => row(ctx, id)).join('') : empty(ctx.S('No results found')) : ''}</div></div>`;
  }
  // The APKs' settings.
  function rows(ctx) {
    const S = ctx.S, cat = title => ({kind: 'cat', title}), check = (key, title, summary = '') => ({kind: 'check', key, title: S(title), summary: summary && S(summary), def: false}), info = (title, summary) => ({kind: 'info', title: S(title), summary}), remote = (title, summary = '') => ({remote: true, title: S(title), summary: summary && S(summary)});
    if (ctx.profile === 'currents') return [info('Google account', ctx.account), remote('Translation'), cat(S('PRESENTATION')), check('showReadPosts', "Hide articles I've already read"), check('showPickOfTheWeek', 'Show Pick of the Week'), cat(S('BACKGROUND SYNC')), check('enableSync', 'Enable background sync'), check('wifiOnly', 'Download over Wi-Fi only'), check('onlyIfCharging', 'Only if charging'), remote('Include images for offline reading')];
    if (ctx.profile === 'magazines') return [info('Account', ctx.account), check('automaticallyDownload', 'Automatically download', 'Download all purchases and subscriptions without asking'), check('wifiOnly', 'Download over Wi-Fi only', "To reduce carrier data charges, don't download over mobile networks."), check('notification', 'Show notifications', 'Notify when a new issue is available or downloaded'), check('statusBar', 'Status bar', 'Show/hide device status bar')];
    const size = {kind: 'list', key: 'articleTextSize', title: S('Article text size'), options: [0, 1, 2].map(i => S(`@text_size:${i}`)), def: 1};
    size.summary = size.options[value(ctx, 'articleTextSize', 1)];
    const kk = ctx.profile === 'newsstand-kk';
    return [cat(S('GENERAL')), ...(kk ? [info('Google account', ctx.account)] : []), size, check('showNotifications', 'Show notifications', 'Notify when a new magazine issue is available'),
      ...(kk ? [remote('Report abuse', 'Report any content you deem inappropriate'), remote('Report a content problem', 'Report any content that is broken or wrong'), remote('Send feedback')] : []),
      cat(S('DOWNLOADING')), check('downloadViaWifiOnly', 'Download via Wi-Fi only', "To reduce carrier data charges, don't download over mobile networks"), check('downloadWhileChargingOnly', 'Download while charging only', 'To reduce battery usage, download only when charging'),
      ...(kk ? [check('keepReadNowOnDevice', 'Keep Read Now on device', 'Download Read Now articles to read offline')] : []), check('useExternalStorage', 'Store content on SD card'),
      cat(S('ABOUT')), remote('Open Source Licenses', 'Legal information about licenses'), remote('Terms of Service'), remote('Privacy Policy'), ...(kk ? [remote('Usage Policy', 'Google Play Newsstand is for personal and non-commercial use only.')] : [])];
  }
  function settings(ctx) {
    const r = (x, i) => {
      if (x.kind === 'cat') return `<div class="mps-cat">${e(x.title)}</div>`;
      if (x.kind === 'info') return `<div class="mps-row mps-info"><span><b>${e(x.title)}</b>${x.summary ? `<small>${e(x.summary)}</small>` : ''}</span></div>`;
      const on = x.kind === 'check' && value(ctx, x.key, x.def);
      return `<button class="mps-row" data-action="${x.remote ? ctx.unavailable : 'nr-pref'}" data-id="${e(x.key || i)}"${x.kind === 'check' ? ` role="checkbox" aria-checked="${on}"` : ''}><span><b>${e(x.title)}</b>${x.summary ? `<small>${e(x.summary)}</small>` : ''}</span>${x.kind === 'check' ? `<i class="mps-check${on ? ' on' : ''}" role="presentation"></i>` : ''}</button>`;
    };
    const d = ctx.ui.nrDialog;
    const dlg = d === 'articleTextSize' ? (() => { const x = rows(ctx).find(y => y.key === d); return `<button class="mps-scrim" data-action="nr-cancel" aria-label="${e(ctx.t('Cancel'))}"></button><div class="mps-dialog" role="dialog"><h3>${e(x.title)}</h3><div class="mps-choices">${x.options.map((o, i) => `<button data-action="nr-pick" data-id="${i}" role="radio" aria-checked="${value(ctx, d, 1) === i}"><span>${e(o)}</span><i class="mps-radio${value(ctx, d, 1) === i ? ' on' : ''}"></i></button>`).join('')}</div><div class="mps-buttons"><button data-action="nr-cancel">${e(ctx.t('Cancel'))}</button></div></div>`; })() : '';
    return `<div class="app-view sa-app mps nr-prefs">${ctx.bar({title: ctx.S('Settings'), up: true})}<div class="sa-scroll mps-list">${rows(ctx).map(r).join('')}</div>${dlg}</div>`;
  }
  // The screen when one of these is open, else null (the version draws its home).
  function render(ctx) {
    const {ui} = ctx;
    if (ui.nrApp !== ctx.app) return null;
    if (ui.nrPrefs) return settings(ctx);
    if (ui.nrArticle && ARTICLES[ui.nrArticle]) return article(ctx, ui.nrArticle);
    if (ui.nrSearch) return search(ctx);
    if (ui.nrIssue && ISSUES[ui.nrIssue]) { const m = ISSUES[ui.nrIssue]; return list(ctx, `${m.title} · ${m.issue}`, m.articles, ''); }
    if (ui.nrSection === 'saved') return list(ctx, ctx.S(words(ctx)[2]), saved(ctx), ctx.S(words(ctx)[3]));
    if (ui.nrSection) return list(ctx, ctx.S(ui.nrSection), [], ctx.S(ctx.emptyFor?.[ui.nrSection] || 'This section has no content.'));
    return null;
  }
  // The home's items when On device only is on: only what is kept.
  const visible = (ctx, ids) => onDevice(ctx) ? ids.filter(id => isSaved(ctx, id)) : ids;
  // ctx: {app, profile, ui, data, t, S, account, bar({title, up, actions}), save, render, toast, share(text, subject),
  // unavailable (the version's refusal action), emptyFor ({section: caption key})}.
  function handle(action, id, ctx) {
    const {ui, data} = ctx, enter = () => { ui.nrApp = ctx.app; };
    switch (action) {
      case 'nr-open': enter(); ui.nrArticle = id; break;
      case 'nr-issue': enter(); ui.nrIssue = id; break;
      case 'nr-section': enter(); ui.nrSection = id; break;
      case 'nr-search': enter(); ui.nrSearch = true; ui.nrQuery = ''; ctx.render(); document.querySelector('#viewport .nr-search input')?.focus(); return true;
      case 'nr-settings': enter(); ui.nrPrefs = true; break;
      case 'nr-save': {
        const list = ((data.newsSaved ||= {})[ctx.app] ||= []), i = list.indexOf(id), [, , where] = words(ctx);
        if (i >= 0) list.splice(i, 1); else list.unshift(id);
        ctx.save();
        if (ctx.app === 'newsstand') ctx.toast(ctx.S(i >= 0 ? 'Removed from Bookmarks' : 'Added to Bookmarks'));
        else if (i < 0) ctx.toast(AndroidStrings.format(ctx.S('Article can now be found in %1$s'), ctx.S(where)));
        break;
      }
      case 'nr-share': { const a = ARTICLES[id]; ctx.share(`${a.title}\n${a.source}`, a.title); return true; }
      // Sync now (Currents) shows its progress text; Refresh (Magazines) redraws the shelf.
      case 'nr-refresh': if (ctx.app === 'currents') ctx.toast(ctx.S('Refreshing…')); break;
      case 'nr-ondevice': (data.newsOnDevice ||= {})[ctx.app] = !onDevice(ctx); ctx.save(); break;
      case 'nr-pref': { const x = rows(ctx).find(y => y.key === id); if (!x) return true; if (x.kind === 'list') ui.nrDialog = id; else { ((data.newsPrefs ||= {})[ctx.app] ||= {})[id] = !value(ctx, id, x.def); ctx.save(); } break; }
      case 'nr-pick': ((data.newsPrefs ||= {})[ctx.app] ||= {})[ui.nrDialog] = Number(id); ui.nrDialog = ''; ctx.save(); break;
      case 'nr-cancel': ui.nrDialog = ''; break;
      default: return false;
    }
    ctx.render();
    return true;
  }
  function submit(form, values, ctx) { if (form !== 'nr-search') return false; ctx.ui.nrQuery = String(values.get('q') || ''); ctx.render(); document.querySelector('#viewport .nr-search input')?.blur(); return true; }
  // The search field filters while it is typed.
  function input(target, ctx) {
    if (!target.closest?.('.nr-search')) return false;
    ctx.ui.nrQuery = target.value;
    const at = target.selectionStart; ctx.render();
    const f = document.querySelector('#viewport .nr-search input'); if (f) { f.focus(); f.setSelectionRange(at, at); }
    return true;
  }
  // Back: a dialog, Settings, the article, the search, an issue or a section.
  function back(ui) {
    if (!ui.nrApp) return false;
    if (ui.nrDialog) ui.nrDialog = '';
    else if (ui.nrPrefs) ui.nrPrefs = false;
    else if (ui.nrArticle) ui.nrArticle = '';
    else if (ui.nrSearch) ui.nrSearch = false;
    else if (ui.nrIssue) ui.nrIssue = '';
    else if (ui.nrSection) ui.nrSection = '';
    else return false;
    if (!ui.nrPrefs && !ui.nrArticle && !ui.nrSearch && !ui.nrIssue && !ui.nrSection) ui.nrApp = '';
    return true;
  }
  const open = ui => Object.assign(ui, {nrApp: '', nrArticle: '', nrSearch: false, nrQuery: '', nrIssue: '', nrSection: '', nrPrefs: false, nrDialog: ''});
  window.NewsReader = {render, handle, submit, input, back, open, visible, onDevice, ARTICLES, ISSUES, STORIES};
})();
