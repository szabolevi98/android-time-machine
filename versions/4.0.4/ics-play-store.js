/* Google Play Store 3.4.7 (the IMM76I image's Phonesky.apk), moved out of simulator.js (docs/plans/engine-migration.md).
   ics-play.js draws its pages and dialogs; this module is the app around them: the pages and their back stack, the
   tabs' fling, search with its history, an item's install (Accept & download: a download notification, then
   "Successfully installed."; the store apps that work join the launcher, store-apps/legacy-host.js), +1, My apps,
   Settings with content filtering and its PIN. The older Play Store screens' play-* actions stay here as well, and the
   home screen's Play Store widget opens its item here. */
(() => {
  'use strict';
  function api(c) {
    const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
    /* Google Play Store 3.4.7: ui.market holds the page, section, tab and selection, ui.marketHistory the back stack; downloads
       run on a timer with a notification while they last and "Successfully installed." afterwards. */
    function icsPlayContext() {
      const m = ui.market || {page: 'home'};
      return {lang: i18n.language, locale: i18n.locale(), ...m, installed: data.marketInstalled || [], everInstalled: data.marketEverInstalled || [], downloading: ui.marketDownload?.id || '', phase: ui.marketDownload?.phase || '', progress: ui.marketDownload?.progress || 0, plussed: data.marketPlus || [], autoUpdate: data.marketAuto || [], prefs: {notify: true, autoUpdate: false, wifiOnly: false, widgets: true, pin: false, admob: true, ...(data.marketPrefs || {})}, unlocked: !!ui.icspUnlocked, pinStep: ui.icspPinStep, pinWrong: !!ui.icspPinWrong, filterDraft: ui.icspFilterDraft, searching: !!ui.marketSearching, editValue: ui.marketEdit || '', history: data.marketSearches || [], reviewSort: ui.reviewSort || 'helpful', reviewLatest: !!ui.reviewLatest, reviewDevice: !!ui.reviewDevice};
    }
    function icsPlayGo(next) { (ui.marketHistory ||= []).push({...(ui.market || {page: 'home'}), scroll: viewport.querySelector('.icsp-scroll')?.scrollTop || 0}); ui.market = {...(ui.market || {}), ...next}; ui.overlay = ''; ui.marketSearching = false; render(); }
    function icsPlayDownload(id) {
      const item = ICSPlay.find(id); if (!item) return;
      clearInterval(ui.marketTimer); ui.marketDownload = {id, phase: 'downloading', progress: 0};
      data.notifications = data.notifications.filter(n => n.kind !== 'market-dl');
      data.notifications.unshift({id: Date.now(), title: item.name, detail: ICSPlay.text(i18n.language, 'Downloading…'), kind: 'market-dl'});
      save(); render(); renderStatus();
      ui.marketTimer = setInterval(() => {
        const data = c.data, d = ui.marketDownload; if (!d) { clearInterval(ui.marketTimer); return; }
        if (d.phase === 'downloading') { d.progress = Math.min(1, d.progress + .12); if (d.progress >= 1) d.phase = 'installing'; }
        else { clearInterval(ui.marketTimer); ui.marketDownload = null; data.marketInstalled = [...new Set([...(data.marketInstalled || []), id])]; c.storeInstalled(id); data.marketEverInstalled = [...new Set([...(data.marketEverInstalled || []), id])]; data.notifications = data.notifications.filter(n => n.kind !== 'market-dl'); if ((data.marketPrefs?.notify) !== false) data.notifications.unshift({id: Date.now(), title: item.name, detail: ICSPlay.text(i18n.language, 'Successfully installed.'), kind: 'market'}); save(); renderStatus(); }
        if (ui.view === 'play-store') { const bar = viewport.querySelector('.icsp-progress b'); if (bar && ui.marketDownload?.phase === 'downloading') bar.style.width = `${Math.round(ui.marketDownload.progress * 100)}%`; else render(); }
      }, 350);
    }
    function navigatePlay(next) {
      ui.playHistory.push({...ui.play,scrollTop:viewport.querySelector('.play-content')?.scrollTop || 0});
      ui.play = {...ui.play,...next}; ui.overlay = ''; render();
    }

    return {icsPlayContext, icsPlayGo, icsPlayDownload, navigatePlay};
  }

  ICS.register('play-store', {
    scroller: '.icsp-scroll',
    init(c) { c.icsPlayContext = () => api(c).icsPlayContext(); c.icsPlayGo = next => api(c).icsPlayGo(next); },
    open(c, resume) { const {ui} = c; if (!resume) { ui.play = ICSPlayStore.initial(); ui.playHistory = []; ui.market = {page: 'home'}; ui.marketHistory = []; ui.marketSearching = false; } },
    render(c) { return ICSPlay.render(api(c).icsPlayContext()); },
    overlay(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      const {icsPlayContext} = api(c);
      if (ui.overlay === 'play-menu') {
        // The action bar overflow: a Holo popup anchored below the overflow button.
        return `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu">${ICSPlay.menu(icsPlayContext()).map(item => `<button data-action="${item.action}">${safe(item.title)}</button>`).join('')}</div>`;
      }
      if (ui.overlay?.startsWith('icsp-')) {
        return ICSPlay.dialog(ui.overlay.slice(5), icsPlayContext());
      }
    },
    action(action, button, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      const {icsPlayContext, icsPlayGo, icsPlayDownload, navigatePlay} = api(c), {id} = button.dataset;
      switch (action) {
        case 'market': openApp('play-store'); break;
        case 'play-menu': case 'icsp-menu': ui.overlay = 'play-menu'; renderOverlay(); break;
        case 'icsp-section': icsPlayGo({page: 'section', section: id, tab: 'FEATURED'}); break;
        case 'icsp-tab': if (id) { ui.market.tab = id; render(); } break;
        case 'icsp-detail': icsPlayGo({page: 'detail', selected: id}); break;
        case 'widget-play-item': openApp('play-store'); icsPlayGo({page: 'detail', selected: id}); break;
        case 'icsp-buy': { const item = ICSPlay.find(id); if (item && item.price !== 'FREE') { toast(ICSPlay.text(i18n.language, 'Unavailable')); break; } icsPlayGo({page: 'permissions', selected: id}); break; }
        case 'icsp-accept': ui.market = ui.marketHistory.pop() || {page: 'detail', selected: id}; icsPlayDownload(id); break;
        case 'icsp-cancel': clearInterval(ui.marketTimer); ui.marketDownload = null; data.notifications = data.notifications.filter(n => n.kind !== 'market-dl'); save(); renderStatus(); render(); break;
        case 'icsp-open': { const item = ICSPlay.find(id); if (item?.app) openApp(item.app); else if (StoreHost.runtime(id)) { c.storeAppsSync(); openApp(StoreHost.runtime(id)); } else toast(ICSPlay.text(i18n.language, 'Unavailable')); break; }
        case 'icsp-uninstall': ui.overlay = ''; renderOverlay(); c.storeUninstall(id); save(); render(); break;
        case 'icsp-uninstall-ask': ui.overlay = 'icsp-uninstall'; renderOverlay(); break;
        case 'icsp-plus': { const list = data.marketPlus || []; data.marketPlus = list.includes(id) ? list.filter(x => x !== id) : [...list, id]; save(); const top = viewport.querySelector('.icsp-scroll')?.scrollTop || 0; render(); const list2 = viewport.querySelector('.icsp-scroll'); if (list2) list2.scrollTop = top; break; }
        case 'icsp-my-apps': icsPlayGo({page: 'my-apps', tab: 'INSTALLED'}); break;
        case 'icsp-settings': icsPlayGo({page: 'settings'}); break;
        case 'icsp-unavailable': ui.overlay = ''; renderOverlay(); toast(ICSPlay.text(i18n.language, 'Unavailable')); break;
        case 'icsp-pref': { const base = icsPlayContext().prefs; data.marketPrefs = {...base, [id]: !base[id]}; save(); const top = viewport.querySelector('.icsp-scroll')?.scrollTop || 0; render(); const list = viewport.querySelector('.icsp-scroll'); if (list) list.scrollTop = top; break; }
        // Content filtering and the PIN (ics-play.js's PinEntryDialog): a new PIN is typed twice; with a PIN the user
        // controls stay locked until Unlock settings, and editing it can remove it.
        case 'icsp-filter': ui.icspFilterDraft = undefined; ui.overlay = 'icsp-filter'; renderOverlay(); break;
        case 'icsp-filter-pick': { const levels = ICSPlay.LEVELS, cur = ui.icspFilterDraft || icsPlayContext().prefs.filter || levels; let next = cur.includes(id) ? cur.filter(x => x !== id && (id === 'Show all apps' || x !== 'Show all apps')) : [...cur, id]; if (id === 'Show all apps') next = cur.includes(id) ? [] : [...levels]; else if (levels.slice(0, 4).every(l => next.includes(l))) next = [...levels]; ui.icspFilterDraft = next; renderOverlay(); break; }
        case 'icsp-filter-ok': data.marketPrefs = {...icsPlayContext().prefs, filter: ui.icspFilterDraft || icsPlayContext().prefs.filter || ICSPlay.LEVELS}; save(); ui.overlay = ''; renderOverlay(); render(); break;
        case 'icsp-unlock': case 'icsp-pin': ui.icspPinNext = action; ui.icspPinStep = action === 'icsp-unlock' ? 'settings' : data.marketPrefs?.pinCode ? 'edit' : 'create'; ui.icspPinWrong = false; ui.overlay = 'icsp-pin'; renderOverlay(); overlayRoot.querySelector('[data-icsp-pin]')?.focus(); break;
        case 'icsp-pin-remove': { const p = {...icsPlayContext().prefs}; delete p.pinCode; p.pin = false; data.marketPrefs = p; save(); ui.overlay = ''; renderOverlay(); render(); break; }
        case 'icsp-pin-ok': {
          const value = String(overlayRoot.querySelector('[data-icsp-pin]')?.value || '').trim(), prefs = icsPlayContext().prefs, step = ui.icspPinStep;
          const again = wrong => { ui.icspPinWrong = wrong; renderOverlay(); overlayRoot.querySelector('[data-icsp-pin]')?.focus(); };
          if (!/^\d+$/.test(value)) { again(!!value); break; }
          if (step === 'settings') { if (value !== prefs.pinCode) { again(true); break; } ui.icspUnlocked = true; ui.overlay = ''; renderOverlay(); render(); break; }
          if (step === 'create' || step === 'edit') { ui.icspPinNew = value; ui.icspPinStep = 'confirm'; again(false); break; }
          if (value !== ui.icspPinNew) { ui.icspPinStep = data.marketPrefs?.pinCode ? 'edit' : 'create'; again(true); break; }
          data.marketPrefs = {...prefs, pinCode: value}; ui.icspUnlocked = false; save(); ui.overlay = ''; renderOverlay(); render(); break;
        }
        case 'icsp-clear-history': data.marketSearches = []; save(); break;
        case 'icsp-search': ui.marketSearching = true; ui.marketEdit = ''; render(); viewport.querySelector('.icsp-bar input')?.focus(); break;
        case 'icsp-search-run': data.marketSearches = [id, ...(data.marketSearches || []).filter(q => q !== id)].slice(0, 10); save(); icsPlayGo({page: 'search', query: id}); break;
        case 'play-search': navigatePlay({page:'search',category:'',query:''}); viewport.querySelector('.play-search input')?.focus(); break;
        case 'play-tab': ui.play = {...ICSPlayStore.initial(),tab:id}; ui.playHistory = []; render(); break;
        case 'play-category': navigatePlay({page:'list',category:id,query:''}); break;
        case 'play-detail': navigatePlay({page:'detail',selected:id,preview:0}); break;
        case 'play-preview': navigatePlay({page:'preview',selected:id,preview:Number(button.dataset.preview || 0)}); break;
        case 'play-preview-step': ui.play.preview = (ui.play.preview + Number(id) + 3) % 3; render(); break;
        case 'play-open': { const entry = ICSPlayStore.catalog.find(item => item.id === id); if (entry?.app) openApp(entry.app); break; }
        case 'play-rate': { const top = viewport.querySelector('.play-content').scrollTop; data.playRatings ||= {}; data.playRatings[ui.play.selected] = Number(id); save(); render(); viewport.querySelector('.play-content').scrollTop = top; break; }
        default: return false;
      }
      return true;
    },
    submit(form, values, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      const {icsPlayGo} = api(c);
      if (form.dataset.form === 'icsp-search') { const q = String(values.get('query') || '').trim(); if (!q) return true; data.marketSearches = [q, ...(data.marketSearches || []).filter(x => x !== q)].slice(0, 10); save(); icsPlayGo({page: 'search', query: q}); return true; }
      if (form.dataset.form === 'play-search') { ui.play.query = String(values.get('query') || '').trim(); render(); return true; }
    },
    input(event, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      const {icsPlayContext} = api(c);
      // SearchView: the suggestion dropdown follows the query without re-rendering the field.
      if (event.target.closest('.icsp-bar.searching')) { ui.marketEdit = event.target.value; const view = viewport.querySelector('.icsp'); view?.querySelector('.icsp-suggest')?.remove(); const html = ICSPlay.render(icsPlayContext()); const tmp = document.createElement('div'); tmp.innerHTML = html; const sug = tmp.querySelector('.icsp-suggest'); if (sug && view) view.append(sug); return true; }
      if (event.target.matches('[data-icsp-auto]')) { const id = event.target.dataset.icspAuto, list = data.marketAuto || []; data.marketAuto = event.target.checked ? [...new Set([...list, id])] : list.filter(x => x !== id); save(); return true; }
    },
    back(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      if (ui.overlay) return false;
      if (ui.view === 'play-store' && ui.marketSearching) { ui.marketSearching = false; render(); return true; }
      if (ui.view === 'play-store' && ui.marketHistory?.length) { const prev = ui.marketHistory.pop(); ui.market = prev; render(); const list = viewport.querySelector('.icsp-scroll'); if (list) list.scrollTop = prev.scroll || 0; return true; }
      return false;
    },
    pointerup(event, p, dx, dy, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      // The ViewPager tab strip and pages follow a horizontal fling.
      if (ui.view === 'play-store' && (ui.market?.page === 'section' || ui.market?.page === 'my-apps') && !ui.overlay && p.target.closest('.icsp-scroll,.icsp-tabs') && Math.abs(dx) > dp(71) && Math.abs(dx) > Math.abs(dy) * 1.5) { const next = viewport.querySelector(`.icsp-tabs button:${dx < 0 ? 'last' : 'first'}-child`); if (next && !next.disabled) { ui.market.tab = next.dataset.id; render(); } c.suppressClick(350); return true; }
    },
    clearData(c) { delete c.data.playRatings; }
  });
})();
