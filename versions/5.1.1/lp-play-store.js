/* TODO */
'use strict';
LP.define('play-store', ({
  appNames, dp, i18n, openApp, overlayRoot, placeShortcut, render, renderOverlay, renderStatus, safe, save, screen,
  storeAppsSync, storeContext, toast, ui, viewport
}, lp) => {
  // Installed from the store: the app joins the launcher and, with the store's shortcut setting on, the home screen.
  function storeInstalled(id) { const r = StoreHost.runtime(id); if (!r) return; storeAppsSync(); if (jbPlayContext().prefs.shortcuts) placeShortcut(r, appNames[r]); }
  // Uninstalled (the store or Settings › Apps): the app, its icons and its data go.
  function storeUninstall(id) {
    lp.data.marketInstalled = (lp.data.marketInstalled || []).filter(x => x !== id);
    const r = StoreHost.runtime(id); if (!r) return;
    StoreHost.module(r).clearData?.(storeContext());
    lp.data.homePages = lp.data.homePages.map(page => page.map(x => x === r ? null : x));
    if (Array.isArray(lp.data.dock)) lp.data.dock = lp.data.dock.map(x => x === r ? null : x);
    for (const f of Object.values(lp.data.folders || {})) if (Array.isArray(f.items)) f.items = f.items.filter(x => x !== r);
    ui.recent = (ui.recent || []).filter(x => x !== r);
    if (ui.view === r) { ui.view = 'home'; ui.sub = ''; }
    storeAppsSync();
  }
  /* Google Play Store 5.2.13: ui.market holds the page, section, tab and selection, ui.marketHistory the back stack;
     downloads run on a timer with a notification while they last and "Successfully installed." afterwards. */
  function jbPlayContext() {
    const m = ui.market || {page: 'home'};
    return {lang: i18n.language, locale: i18n.locale(), t: key => i18n.t(key), ...m, installed: lp.data.marketInstalled || [], everInstalled: lp.data.marketEverInstalled || [], downloading: ui.marketDownload?.id || '', phase: ui.marketDownload?.phase || '', progress: ui.marketDownload?.progress || 0, plussed: lp.data.marketPlus || [], autoUpdate: lp.data.marketAuto || [], wishlist: lp.data.marketWishlist || [], rated: lp.data.marketRated || {}, prefs: {notify: true, shortcuts: true, autoMode: 'wifi', auth: 'session', ...(lp.data.marketPrefs || {})}, rateDraft: ui.marketRateDraft, filterDraft: ui.marketFilterDraft, account: 'demo@android.local', permOpen: ui.marketPermOpen || '', permView: !!ui.marketPermView, searching: !!ui.marketSearching, editValue: ui.marketEdit || '', history: lp.data.marketSearches || [], target: ui.marketTarget, popTop: ui.marketPopTop};
  }
  function jbPlayGo(next) { (ui.marketHistory ||= []).push({...(ui.market || {page: 'home'}), scroll: viewport.querySelector('.jbp-scroll')?.scrollTop || 0}); ui.market = {...(ui.market || {}), ...next}; ui.overlay = ''; ui.marketSearching = false; render(); }
  function jbPlayKeepScroll() { const top = viewport.querySelector('.jbp-scroll')?.scrollTop || 0; render(); const list = viewport.querySelector('.jbp-scroll'); if (list) list.scrollTop = top; }
  function jbPlayDownload(id) {
    const item = JBPlay.find(id); if (!item) return;
    clearInterval(ui.marketTimer); ui.marketDownload = {id, phase: 'downloading', progress: 0};
    lp.data.notifications = lp.data.notifications.filter(n => n.kind !== 'market-dl');
    lp.data.notifications.unshift({id: Date.now(), title: item.name, detail: JBPlay.text(i18n.language, 'Downloading…'), kind: 'market-dl'});
    save(); render(); renderStatus();
    ui.marketTimer = setInterval(() => {
      const d = ui.marketDownload; if (!d) { clearInterval(ui.marketTimer); return; }
      if (d.phase === 'downloading') { d.progress = Math.min(1, d.progress + .12); if (d.progress >= 1) d.phase = 'installing'; }
      else { clearInterval(ui.marketTimer); ui.marketDownload = null; lp.data.marketInstalled = [...new Set([...(lp.data.marketInstalled || []), id])]; storeInstalled(id); lp.data.marketEverInstalled = [...new Set([...(lp.data.marketEverInstalled || []), id])]; lp.data.notifications = lp.data.notifications.filter(n => n.kind !== 'market-dl'); if ((lp.data.marketPrefs?.notify) !== false) lp.data.notifications.unshift({id: Date.now(), title: item.name, detail: JBPlay.text(i18n.language, 'Successfully installed.'), kind: 'market'}); save(); renderStatus(); }
      if (ui.view === 'play-store' && !ui.marketSearching) jbPlayKeepScroll();
    }, 350);
  }
  function navigatePlay(next) {
    ui.playHistory.push({...ui.play,scrollTop:viewport.querySelector('.play-content')?.scrollTop || 0});
    ui.play = {...ui.play,...next}; ui.overlay = ''; render();
  }
  // Play Store 5.2 details: the toolbar floats clear over the hero and takes the corpus colour once the hero has scrolled
  // under it (FinskyHeaderListLayout).
  document.addEventListener('scroll', event => {
    const list = event.target; if (!list?.matches?.('.lpp-detail .jbp-scroll')) return;
    const bar = list.parentElement.querySelector('.lpp-bar.overlay'), hero = list.querySelector('.lpp-hero');
    if (bar && hero) bar.classList.toggle('solid', list.scrollTop > hero.offsetHeight - bar.offsetHeight);
  }, true);
  Object.assign(lp, {jbPlayContext, storeUninstall});
  // lp:code
  return {
    // lp:hooks
    pointerup(event, dx, dy) {
      // Play Store 4.8: a swipe from the left edge of a top-level page opens the drawer, a swipe to the left closes it.
      if (ui.view === 'play-store' && Math.abs(dx) > dp(55) && Math.abs(dx) > Math.abs(dy) * 1.5) {
        const left = (lp.pointerStart.x - screen.getBoundingClientRect().left) / (screen.getBoundingClientRect().width / screen.offsetWidth);
        if (!ui.overlay && dx > 0 && left < 20 && ['home', 'my-apps', 'wishlist'].includes(ui.market?.page || 'home')) { ui.overlay = 'jbp-drawer'; renderOverlay(); lp.suppressClickUntil = Date.now() + 350; lp.pointerStart = null; return true; }
        if (ui.overlay === 'jbp-drawer' && dx < 0) { ui.overlay = ''; renderOverlay(); lp.suppressClickUntil = Date.now() + 350; lp.pointerStart = null; return true; }
      }
      if (ui.view === 'play-store' && (ui.market?.page === 'section' || ui.market?.page === 'my-apps') && !ui.overlay && lp.pointerStart.target.closest('.jbp-scroll') && Math.abs(dx) > dp(66) && Math.abs(dx) > Math.abs(dy) * 1.5) { const tabs = [...viewport.querySelectorAll('.jbp-tabs button')], i = tabs.findIndex(b => b.classList.contains('on')), next = tabs[i + (dx < 0 ? 1 : -1)]; if (next) next.click(); lp.suppressClickUntil = Date.now() + 350; lp.pointerStart = null; return true; }
      // lp:pointerup
      return false;
    },
    input(event) {
      if (event.target.closest('.jbp-bar.searching')) { ui.marketEdit = event.target.value; const view = viewport.querySelector('.jbp'); view?.querySelector('.jbp-suggest')?.remove(); const tmp = document.createElement('div'); tmp.innerHTML = JBPlay.render(jbPlayContext()); const sug = tmp.querySelector('.jbp-suggest'); if (sug && view) view.append(sug); return true; }
      if (event.target.matches('[data-jbp-auto]')) { const id = event.target.dataset.jbpAuto, list = lp.data.marketAuto || []; lp.data.marketAuto = event.target.checked ? [...new Set([...list, id])] : list.filter(x => x !== id); save(); return true; }
      // lp:input
      return false;
    },
    clearData() {
      delete lp.data.playRatings;
      // lp:clearData
      return false;
    },
    overlay(name, root) {
      if (ui.overlay.startsWith('jbp-')) {
        overlayRoot.innerHTML = JBPlay.dialog(ui.overlay.slice(4), jbPlayContext());
        return true;
      }
      // lp:overlay
      return false;
    },
    back() {
      if (ui.view === 'play-store' && ui.marketSearching) { ui.marketSearching = false; render(); return true; }
      if (ui.view === 'play-store' && ui.marketHistory?.length) { const prev = ui.marketHistory.pop(); ui.market = prev; render(); const list = viewport.querySelector('.jbp-scroll'); if (list) list.scrollTop = prev.scroll || 0; return true; }
      // lp:back
      return false;
    },
    opening(app, resume) {
      if (app === 'play-store' && !resume) { ui.play = ICSPlayStore.initial(); ui.playHistory = []; ui.market = {page: 'home'}; ui.marketHistory = []; ui.marketSearching = false; }
      // lp:opening
      return false;
    },
    render() {
      return JBPlay.render(jbPlayContext());
      // lp:render
    },
    overlays: {
      'play-menu'() {
        // The action bar overflow: a Holo Light popup below the overflow button (Play 5.2: a Material popup over it).
        overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="jbp-menu" role="menu">${JBPlay.menu(jbPlayContext()).map(item => `<button data-action="${item.action}"${item.checked !== undefined ? ` role="menuitemcheckbox" aria-checked="${item.checked}"` : ''}>${safe(item.title)}${item.checked !== undefined ? `<i class="lpp-check${item.checked ? ' on' : ''}"></i>` : ''}</button>`).join('')}</div>`;
      },
      // lp:overlays
    },
    click(action, button, event) {
      const {id, app, url} = button.dataset;
      switch (action) {
        case 'market': openApp('play-store'); break;
        case 'play-menu': case 'jbp-menu': ui.overlay = 'play-menu'; renderOverlay(); break;
        case 'jbp-section': jbPlayGo({page: 'section', section: id, tab: button.dataset.tab || 'Home'}); break;
        case 'jbp-tab': if (id) { ui.market.tab = id; render(); viewport.querySelector('.jbp-tabs button.on')?.scrollIntoView({inline: 'center', block: 'nearest'}); } break;
        case 'jbp-detail': jbPlayGo({page: 'detail', selected: id, expanded: false}); break;
        case 'jbp-card-menu': { const rect = button.getBoundingClientRect(), box = screen.getBoundingClientRect(); ui.marketTarget = id; ui.marketPopTop = Math.round((rect.bottom - box.top) / (box.height / screen.offsetHeight)) - 26; ui.overlay = 'jbp-card'; renderOverlay(); break; }
        case 'jbp-wish': { const list = lp.data.marketWishlist || [], had = list.includes(id); lp.data.marketWishlist = had ? list.filter(x => x !== id) : [...list, id]; save(); ui.overlay = ''; renderOverlay(); jbPlayKeepScroll(); break; }
        case 'jbp-buy': { const item = JBPlay.find(id); ui.overlay = ''; renderOverlay(); if (item && item.price !== 'FREE') { toast(JBPlay.text(i18n.language, 'Unavailable')); break; } ui.marketTarget = id; ui.marketPermOpen = ''; ui.marketPermView = false; ui.overlay = 'jbp-perms'; renderOverlay(); break; }
        case 'jbp-accept': ui.overlay = ''; renderOverlay(); jbPlayDownload(id); break;
        case 'jbp-cancel': clearInterval(ui.marketTimer); ui.marketDownload = null; lp.data.notifications = lp.data.notifications.filter(n => n.kind !== 'market-dl'); save(); renderStatus(); render(); break;
        case 'jbp-open': { const item = JBPlay.find(id); if (item?.app) openApp(item.app); else if (StoreHost.runtime(id)) { storeAppsSync(); openApp(StoreHost.runtime(id)); } else toast(JBPlay.text(i18n.language, 'Unavailable')); break; }
        case 'jbp-uninstall': ui.overlay = ''; renderOverlay(); storeUninstall(id); save(); render(); break;
        case 'jbp-uninstall-ask': ui.marketTarget = id; ui.overlay = 'jbp-uninstall'; renderOverlay(); break;
        case 'jbp-archive': lp.data.marketEverInstalled = (lp.data.marketEverInstalled || []).filter(x => x !== id); save(); jbPlayKeepScroll(); break;
        case 'jbp-rate-dialog': ui.marketTarget = id; ui.marketRateDraft = button.dataset.stars ? Number(button.dataset.stars) : undefined; ui.overlay = 'jbp-rate'; renderOverlay(); break;
        case 'jbp-rate-pick': ui.marketRateDraft = Number(id); renderOverlay(); break;
        case 'jbp-rate-ok': lp.data.marketRated = {...(lp.data.marketRated || {}), [id]: ui.marketRateDraft ?? (lp.data.marketRated || {})[id] ?? 0}; save(); ui.overlay = ''; renderOverlay(); jbPlayKeepScroll(); break;
        case 'jbp-content-filter': ui.marketFilterDraft = undefined; ui.overlay = 'jbp-filter'; renderOverlay(); break;
        case 'jbp-filter-pick': { const levels = ['Everyone', 'Low maturity', 'Medium maturity', 'High maturity', 'Show all apps'], cur = ui.marketFilterDraft || jbPlayContext().prefs.filter || levels; let next = cur.includes(id) ? cur.filter(x => x !== id && (id !== 'Show all apps' ? x !== 'Show all apps' : true)) : [...cur, id]; if (id === 'Show all apps') next = cur.includes(id) ? [] : levels; else if (levels.slice(0, 4).every(l => next.includes(l))) next = levels; ui.marketFilterDraft = next; renderOverlay(); break; }
        case 'jbp-filter-ok': lp.data.marketPrefs = {...jbPlayContext().prefs, filter: ui.marketFilterDraft || jbPlayContext().prefs.filter}; save(); ui.overlay = ''; renderOverlay(); break;
        case 'lpp-auth': ui.overlay = 'jbp-auth'; renderOverlay(); break;
        case 'lpp-auth-pick': lp.data.marketPrefs = {...jbPlayContext().prefs, auth: id}; save(); ui.overlay = ''; renderOverlay(); jbPlayKeepScroll(); break;
        case 'lpp-auto-item': { const sel = ui.market?.selected, list = lp.data.marketAuto || []; if (sel) lp.data.marketAuto = list.includes(sel) ? list.filter(x => x !== sel) : [...list, sel]; save(); ui.overlay = ''; renderOverlay(); break; }
        case 'jbp-noop': break;
        case 'jbp-plus': { const list = lp.data.marketPlus || []; lp.data.marketPlus = list.includes(id) ? list.filter(x => x !== id) : [...list, id]; save(); jbPlayKeepScroll(); break; }
        case 'jbp-my-apps': jbPlayGo({page: 'my-apps', tab: 'INSTALLED'}); break;
        case 'jbp-wishlist': jbPlayGo({page: 'wishlist'}); break;
        case 'jbp-settings': jbPlayGo({page: 'settings'}); break;
        // Share on the details page: the chooser, then the target's compose screen with the link (play-store.js).
        case 'jbp-share': ui.marketTarget = id || ui.market?.selected; ui.overlay = 'jbp-share'; renderOverlay(); break;
        case 'jbp-share-to': { const [app, itemId] = String(id).split('|'), item = JBPlay.find(itemId); ui.overlay = ''; renderOverlay(); if (item) lp.driveShareText(app, JBPlay.shareLink(item), JBPlay.fmt(JBPlay.text(i18n.language, 'Check out "%1$s"'), item.name)); break; }
        case 'jbp-dev-email': { const item = JBPlay.find(id); if (!item) break; openApp('gmail'); lp.composeEmail(null, false, JBPlay.developerEmail(item)); const d = lp.mailbox().find(m => m.id === ui.emailId); if (d) d.subject = item.name; save(); render(); break; }
        case 'lpp-readmore': ui.market = {...(ui.market || {}), expanded: true}; jbPlayKeepScroll(); break;
        case 'jbp-unavailable': ui.overlay = ''; renderOverlay(); toast(JBPlay.text(i18n.language, 'Unavailable')); break;
        case 'jbp-pref': { const base = jbPlayContext().prefs; lp.data.marketPrefs = {...base, [id]: !base[id]}; save(); jbPlayKeepScroll(); break; }
        case 'jbp-auto-update': ui.overlay = 'jbp-auto'; renderOverlay(); break;
        case 'jbp-auto-pick': lp.data.marketPrefs = {...jbPlayContext().prefs, autoMode: id}; save(); ui.overlay = ''; renderOverlay(); jbPlayKeepScroll(); break;
        case 'jbp-clear-history': lp.data.marketSearches = []; save(); break;
        // Play Store 4.8: the navigation drawer, the permissions note on the home page, the grouped permission rows and
        // "Permission details", and the Require password list.
        case 'kkp-drawer': ui.overlay = 'jbp-drawer'; renderOverlay(); break;
        case 'kkp-home': ui.marketHistory = []; ui.market = {page: 'home'}; ui.overlay = ''; ui.marketSearching = false; render(); break;
        case 'kkp-perm': ui.marketPermOpen = ui.marketPermOpen === id ? '' : id; renderOverlay(); break;
        case 'kkp-perm-details': ui.marketTarget = id; ui.marketPermOpen = ''; ui.marketPermView = true; ui.overlay = 'jbp-perms'; renderOverlay(); break;
        case 'jbp-search': ui.marketSearching = true; ui.marketEdit = ''; render(); viewport.querySelector('.jbp-bar input')?.focus(); break;
        case 'jbp-search-run': lp.data.marketSearches = [id, ...(lp.data.marketSearches || []).filter(q => q !== id)].slice(0, 10); save(); jbPlayGo({page: 'search', query: id}); break;
        case 'play-search': navigatePlay({page:'search',category:'',query:''}); viewport.querySelector('.play-search input')?.focus(); break;
        case 'play-tab': ui.play = {...ICSPlayStore.initial(),tab:id}; ui.playHistory = []; render(); break;
        case 'play-category': navigatePlay({page:'list',category:id,query:''}); break;
        case 'play-detail': navigatePlay({page:'detail',selected:id,preview:0}); break;
        case 'play-preview': navigatePlay({page:'preview',selected:id,preview:Number(button.dataset.preview || 0)}); break;
        case 'play-preview-step': ui.play.preview = (ui.play.preview + Number(id) + 3) % 3; render(); break;
        case 'play-open': { const entry = ICSPlayStore.catalog.find(item => item.id === id); if (entry?.app) openApp(entry.app); break; }
        case 'play-rate': { const top = viewport.querySelector('.play-content').scrollTop; lp.data.playRatings ||= {}; lp.data.playRatings[ui.play.selected] = Number(id); save(); render(); viewport.querySelector('.play-content').scrollTop = top; break; }
        // lp:cases
        default: return false;
      }
      return true;
    },
    submit(name, values, event, form) {
      if (form.dataset.form === 'jbp-search') { const q = String(values.get('query') || '').trim(); if (!q) return; lp.data.marketSearches = [q, ...(lp.data.marketSearches || []).filter(x => x !== q)].slice(0, 10); save(); jbPlayGo({page: 'search', query: q}); return; }
      if (form.dataset.form === 'play-search') { ui.play.query = String(values.get('query') || '').trim(); render(); return; }
      // lp:submit
      switch (name) {
        // lp:scases
        default: return false;
      }
      return true;
    }
  };
});
