/* Chrome 40 on Android 5.1.1 (chrome.js draws it), moved out of simulator.js
   (docs/plans/engine-migration.md; the code moved unchanged).
   - tabs and their sessions, the omnibox, pages, Find in page, the menu, bookmarks, history and Recent tabs
   - Add to homescreen, Print, Share; Chrome's settings and Clear browsing data; Back; Clear data
   - the AOSP Browser's menu and buttons the image has no app for */
'use strict';
LP.define('chrome', ({
  chromeText, clone, i18n, openApp, overlayRoot, render, renderOverlay, safe, save, syncBrowserState, toast, ui,
  viewport
}, lp) => {
  function normalizeAddress(raw) {
    const value = raw.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
    if (!value) return 'www.google.com';
    if (value.startsWith('search:') || value.startsWith('chrome://')) return value;
    if (value.includes(' ') || !value.includes('.')) return ui.browserOwner === 'chrome' ? ChromeApp.searchUrl(value, {data: lp.data, locale: i18n.locale()}) : `search:${value}`;
    return value.toLowerCase();
  }
  function saveBrowserState() {
    syncBrowserState();
    if (ui.browserOwner === 'chrome') {
      // Incognito tabs are not stored.
      const tabs = ui.browserSession.tabs.filter(tab => !tab.incognito), current = ICSBrowserSession.current(ui.browserSession);
      lp.data.chromeSession = clone({tabs: tabs.length ? tabs : [{history: [ChromeApp.NTP], index: 0}], active: Math.max(0, tabs.indexOf(current))});
    } else lp.data.browserSession = clone(ui.browserSession);
    save();
  }
  const restoreChrome = () => ICSBrowserSession.restore(lp.data.chromeSession, [ChromeApp.NTP]);
  function useBrowserSession(owner) {
    if (ui.browserOwner === owner) return;
    ui.browserSessions[ui.browserOwner] = ui.browserSession;
    ui.browserSession = ui.browserSessions[owner] || (owner === 'chrome' ? restoreChrome() : ICSBrowserSession.restore(lp.data.browserSession, lp.data.browserHistory));
    ui.browserOwner = owner; ui.browserFind = undefined; syncBrowserState();
  }
  function chromeTitle(url) { return url === ChromeApp.NTP ? i18n.t('New tab') : url === ChromeApp.HISTORY ? i18n.t('History') : browserTitle(url); }
  function renderChrome() {
    const session = ui.browserSession, tab = ICSBrowserSession.current(session);
    return ChromeApp.render({ui, data: lp.data, t: key => i18n.t(key), locale: i18n.locale(), page: renderWebsite, title: chromeTitle, url: ui.browserUrl, incognito: !!tab.incognito, tabs: session.tabs.map(item => ({url: item.history[item.index], incognito: !!item.incognito})), active: session.active});
  }
  function chromeNewTab(incognito) {
    if (!ICSBrowserSession.add(ui.browserSession)) { toast('Tab limit reached'); return; }
    const tab = ICSBrowserSession.current(ui.browserSession);
    tab.history = [ChromeApp.NTP]; tab.index = 0; if (incognito) tab.incognito = true;
    ui.sub = ''; ui.overlay = ''; ui.browserFind = undefined; renderOverlay(); saveBrowserState(); render();
  }
  function chromeSection(id) {
    const incognito = !!ICSBrowserSession.current(ui.browserSession).incognito;
    ui[incognito ? 'chromeNtpIncognito' : 'chromeNtp'] = id; ui.overlay = ''; renderOverlay();
    if (ui.browserUrl !== ChromeApp.NTP) navigateBrowser(ChromeApp.NTP); else render();
  }
  function navigateBrowser(url) {
    const normalized = normalizeAddress(url);
    ICSBrowserSession.navigate(ui.browserSession,normalized);
    if (!normalized.startsWith('chrome://') && !(ui.browserOwner === 'chrome' && ICSBrowserSession.current(ui.browserSession).incognito)) lp.data.browserHistory = [...lp.data.browserHistory,normalized].slice(-50);
    ui.sub = ''; ui.overlay = ''; ui.browserFind = undefined; saveBrowserState(); render();
  }
  function browserBack() { ICSBrowserSession.move(ui.browserSession,-1); saveBrowserState(); render(); }
  function browserForward() { ICSBrowserSession.move(ui.browserSession,1); ui.overlay = ''; saveBrowserState(); render(); }
  function browserLink(url, title, subtitle = '') { return `<div class="web-result"><a href="#" data-action="browser-link" data-url="${safe(url)}"><strong>${safe(title)}</strong></a><small>${safe(url)}</small><p>${safe(subtitle)}</p></div>`; }
  function renderWebsite(url) {
    if (url === 'www.google.com') return `<div class="google-logo"><span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span></div><form class="search-form" data-form="web-search"><input name="query" aria-label="Search the web" placeholder="Search the web" required><button type="submit">Search</button></form><div class="browser-tiles">${[['www.android.com','Android'],['en.wikipedia.org/wiki/Android','Wikipedia'],['news.example','News'],['retro.example','2015 Web']].map(item => `<button data-action="browser-link" data-url="${item[0]}">${item[1]}</button>`).join('')}</div><p style="font-size:calc(12.1413 * var(--dp));color:#888;margin-top:calc(26.4901 * var(--dp))">Offline demo pages · 2015</p>`;
    const engineHit = window.ChromeApp?.searchResult(url);
    if (url.startsWith('search:') || engineHit) {
      const term = engineHit ? engineHit.term : url.slice(7);
      return `${engineHit ? `<p class="web-engine">${safe(engineHit.name)}</p>` : ''}<h2>Search results</h2><p>Results for <strong>${safe(term)}</strong></p>${browserLink('www.android.com', 'Android – Discover Android 5.1, Lollipop', 'Lollipop brings Material design, heads-up notifications, a new Overview and Smart Lock.')}${browserLink('en.wikipedia.org/wiki/Android', 'Android (operating system) – Wikipedia', 'An overview of the Android mobile operating system.')}${browserLink('news.example', 'Tech News', `Stories related to ${term}.`)}`;
    }
    if (url.includes('android.com')) return `<h2 style="color:#79b93f">android</h2><h3>Android 5.1, Lollipop</h3><p>Material design brings bold colour, responsive motion and depth to every screen. Notifications reach you on the lock screen and as heads-up alerts, Overview keeps your recent apps and tabs in a stack of cards, and Smart Lock keeps your phone unlocked near a trusted device.</p><div style="background:#00bcd4;color:white;padding:calc(27.5939 * var(--dp));text-align:center;font-size:calc(41.9427 * var(--dp))">🍭<br><small style="font-size:calc(18.7638 * var(--dp))">Lollipop</small></div>${browserLink('en.wikipedia.org/wiki/Android','Learn about Android','The story of Android.')}`;
    if (url.includes('wikipedia.org')) return `<h2>Android (operating system)</h2><p><small>From Wikipedia, the free encyclopedia</small></p><hr><p>Android is a mobile operating system based on a modified version of the Linux kernel. Android 4.0, known as Ice Cream Sandwich, introduced the Holo interface and virtual navigation buttons; versions 4.1–4.3, Jelly Bean, added Project Butter, Google Now and expandable notifications; Android 4.4, KitKat, was tuned to run on devices with 512 MB of RAM; Android 5.0, Lollipop, introduced Material design, the ART runtime and 64-bit support, and 5.1 added multiple SIM cards and Device Protection.</p><h3>Versions</h3><p>Gingerbread · Ice Cream Sandwich · Jelly Bean · KitKat · Lollipop</p>${browserLink('www.android.com','Official Android website')}`;
    const newsPage = window.StockApps?.newsPage(url); if (newsPage) return newsPage;
    if (url === 'news.example/nexus-6' || url === 'retro.example/lollipop') return `<article class="web-offline-article"><h2>${url.startsWith('news')?'A day with the Nexus 6':'A closer look at Lollipop'}</h2><time>November 3, 2014 · Demo archive</time><p>The phone has a 6-inch Quad HD screen, front-facing stereo speakers and a Turbo Charger that adds six hours of use in fifteen minutes. Open the app drawer to discover the Lollipop experience.</p><h3>Everyday essentials</h3><p>Contacts, messages and the browser share a simple visual language. Swipe between home screens, arrange your favorite apps, and pull down the notification shade.</p><h3>Make it yours</h3><p>Choose a wallpaper, add an analog clock and keep your favorite contacts close. This small offline archive is a fictional snapshot of the early smartphone era.</p>${browserLink('news.example','Back to Tech News')}${browserLink('retro.example/lollipop','Explore Lollipop')}</article>`;
    if (url.includes('news.example')) return `<h2>Tech News</h2><p style="color:#777">Thursday, October 22, 2015</p><hr><h3>Android 5.1.1 security update arrives on the Nexus 6</h3><p>Build LMY48Y brings the November security patches to Google's Nexus devices.</p><h3>Apps in your pocket</h3><p>Material design apps are arriving on Google Play every week.</p>${browserLink('news.example/nexus-6','Read the Nexus 6 story')}${browserLink('retro.example','Visit the 2015 Web')}`;
    if (url.includes('retro.example')) return `<h2>Welcome to the 2015 Web</h2><p>A little time capsule from the Material design era.</p><ul><li>Share photos</li><li>Check your email</li><li>Customize your phone</li></ul>${browserLink('retro.example/lollipop','Explore Lollipop')}${browserLink('maps.example','Open the sample map')}${browserLink('www.google.com','Back to Google')}`;
    if (url.includes('maps.example')) return `<h2>Maps</h2><div style="height:calc(253.8632 * var(--dp));background:repeating-linear-gradient(35deg,#e2ead9,#e2ead9 calc(19.8676 * var(--dp)),#c7dfd7 calc(19.8676 * var(--dp)),#c7dfd7 calc(26.4901 * var(--dp)));display:grid;place-items:center;color:#426a68">San Francisco · Demo map</div><p>Map data is a local illustration.</p>`;
    return `<h2>Webpage unavailable</h2><p>The simulator browses a small collection of offline example pages.</p>${browserLink('www.google.com','Go to Google')}`;
  }
  function browserTitle(url) {
    return url === 'www.google.com' ? 'Google' : url.startsWith('search:') ? url.slice(7) : url.replace(/^www\./,'');
  }
  function highlightBrowserText() {
    const root=viewport.querySelector('.browser-page'), query=ui.browserFind.toLocaleLowerCase();
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT), nodes=[]; let node;
    while((node=walker.nextNode())) nodes.push(node);
    let count=0;
    for(const text of nodes) {
      let value=text.nodeValue, offset=0, index=value.toLocaleLowerCase().indexOf(query); if(index<0)continue;
      const fragment=document.createDocumentFragment();
      while(index>=0) { fragment.append(document.createTextNode(value.slice(offset,index)));const mark=document.createElement('mark');mark.textContent=value.slice(index,index+query.length);fragment.append(mark);count++;offset=index+query.length;index=value.toLocaleLowerCase().indexOf(query,offset); }
      fragment.append(document.createTextNode(value.slice(offset)));text.replaceWith(fragment);
    }
    viewport.querySelector('.web-find-count').textContent=`${count} ${i18n.t('matches')}`;
    root.querySelector('mark')?.scrollIntoView({block:'nearest'});
  }
  Object.assign(lp, {navigateBrowser});
  return {
    input(event) {
      if (event.target.matches?.('[data-chr-seek]')) { const ctx = {ui, data: lp.data, locale: i18n.locale()}; ChromeApp.prefSeek(event.target.value, ctx); ChromeApp.seekPaint(viewport, ctx); save(); return true; }
      return false;
    },
    clearData(c, id) {
      if(id==='chrome'){delete lp.data.chromeSession;delete ui.browserSessions.chrome;if(ui.browserOwner==='chrome'){ui.browserSession=restoreChrome();syncBrowserState();}save();}
      return false;
    },
    back() {
      if (['browser', 'chrome'].includes(ui.view) && (ui.chromeClear || ui.chromeList || ui.chromePrefMenu || ui.chromeConfirm) && !ui.chromeClear?.busy) { ui.chromeClear = null; ui.chromeList = ''; ui.chromePrefMenu = false; ui.chromeConfirm = ''; render(); return true; }
      if (['browser', 'chrome'].includes(ui.view) && ui.sub === 'chrome-settings') { if (!ChromeApp.prefBack(ui)) ui.sub = ''; render(); return true; }
      if (['browser', 'chrome'].includes(ui.view) && !ui.sub && ui.browserFind !== undefined) { ui.browserFind = undefined; render(); return true; }
      if (['browser', 'chrome'].includes(ui.view) && !ui.sub && ui.browserIndex > 0) { browserBack(); return true; }
      return false;
    },
    opening(app) {
      if (app === 'chrome') useBrowserSession(app);
      return false;
    },
    render() {
      return renderChrome();
    },
    afterRender() {
      if (['browser', 'chrome'].includes(ui.view) && !ui.sub && ui.browserFind) highlightBrowserText();
      return false;
    },
    overlays: {
      // Chrome's menu, the AOSP Browser's in any other browser view.
      'browser-menu'() {
        if (ui.view === 'chrome') { overlayRoot.innerHTML = ChromeApp.menu({ui, data: lp.data, t: key => i18n.t(key), locale: i18n.locale(), url: ui.browserUrl, incognito: !!ICSBrowserSession.current(ui.browserSession)?.incognito}); return; }
        overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu web-menu"><button data-action="browser-forward" ${ui.browserIndex >= ui.browserHistory.length-1?'disabled':''}>Forward</button><button data-action="browser-refresh">Refresh</button><button data-action="browser-new-tab">New tab</button><button data-action="browser-save">Bookmark</button><button data-action="browser-bookmarks">Bookmarks</button><button data-action="browser-saved">Saved pages</button><button data-action="browser-save-page">Save for offline reading</button><button data-action="browser-find">Find on page</button></div>`;
      },
      'chrome-a2hs'() {
        // Chrome's Add to homescreen: the page's title in the Title field, Cancel / Add.
        overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog chr-a2hs" role="dialog" aria-label="${safe(chromeText('Add to homescreen'))}"><h3>${safe(chromeText('Add to homescreen'))}</h3><div class="chr-a2hs-row"><img src="assets/chr40-app_shortcut_icon.png" alt=""><input data-a2hs-title value="${safe(ui.a2hs?.title || '')}" placeholder="${safe(chromeText('Title'))}" aria-label="${safe(chromeText('Title'))}"></div><div class="settings-dialog-actions"><button data-action="close-overlay">${safe(chromeText('Cancel'))}</button><button data-action="chrome-a2hs-add">${safe(chromeText('Add'))}</button></div></div>`;
      },
    },
    click(action, button, event) {
      const {id, url} = button.dataset;
      if (action.startsWith('chrome-') && ui.sub === 'chrome-settings') {
        const result = ChromeApp.prefAction(action, id, {ui, data: lp.data, locale: i18n.locale(), t: key => i18n.t(key)});
        if (result) {
          if (result === 'save' || result.toast) save();
          if (result.open) { ui.sub = ''; ui.chromePrefStack = []; chromeNewTab(false); navigateBrowser(result.open); return; }
          render(); if (result.toast) toast(result.toast); return;
        }
      }
      switch (action) {
        case 'browser-search': openApp('chrome'); document.querySelector('.chr-omnibox input')?.focus(); break;
        case 'browser-link': navigateBrowser(url); break;
        case 'browser-forward': browserForward(); break;
        case 'browser-tabs': ui.sub = 'tabs'; render(); break;
        case 'browser-menu': ui.overlay = 'browser-menu'; renderOverlay(); break;
        case 'browser-bookmarks': ui.sub = 'bookmarks'; ui.overlay = ''; render(); break;
        case 'browser-bookmark': navigateBrowser(id); break;
        case 'browser-saved': ui.sub='saved'; ui.overlay=''; render(); break;
        case 'browser-save-page': lp.data.savedPages ||= []; if(!lp.data.savedPages.includes(ui.browserUrl))lp.data.savedPages.push(ui.browserUrl); save(); ui.overlay=''; renderOverlay(); toast('Page saved'); break;
        case 'browser-close-tab': { const last = ui.browserSession.tabs.length === 1; ICSBrowserSession.close(ui.browserSession,Number(id)); if (last && ui.browserOwner === 'chrome') ui.browserSession.tabs[0].history = [ChromeApp.NTP]; saveBrowserState(); render(); break; }
        case 'browser-refresh': ui.overlay=''; render(); break;
        case 'browser-find': ui.browserFind=''; ui.overlay=''; render(); viewport.querySelector('.web-find input')?.focus(); break;
        case 'browser-close-find': ui.browserFind=undefined; render(); break;
        // Chrome menu and New Tab page
        case 'chrome-incognito': chromeNewTab(true); break;
        // Chrome's Print…: the page as it is shown, its heading as the job's name.
        case 'chrome-print': { const page = viewport.querySelector('.browser-page'); ui.overlay = ''; renderOverlay(); const title = page?.querySelector('h1, h2, strong')?.textContent?.trim() || ui.browserUrl; PrintSpooler.open(lp.printContext(), {name: title, title, lines: String(page?.innerText || ui.browserUrl).split('\n').map(x => x.trim()).filter(Boolean)}); break; }
        case 'chrome-a2hs': { const page = viewport.querySelector('.browser-page'); ui.a2hs = {url: ui.browserUrl, title: page?.querySelector('h1, h2, strong')?.textContent?.trim() || ui.browserUrl}; ui.overlay = 'chrome-a2hs'; renderOverlay(); overlayRoot.querySelector('[data-a2hs-title]')?.focus(); break; }
        case 'chrome-a2hs-add': { const title = String(overlayRoot.querySelector('[data-a2hs-title]')?.value || ui.a2hs?.title || '').trim() || ui.a2hs.url; const item = {id: Date.now(), title, url: ui.a2hs.url}; (lp.data.webShortcuts ||= []).push(item); ui.overlay = ''; renderOverlay(); lp.placeShortcut(`web:${item.id}`, title); break; }
        case 'open-web-shortcut': { const item = (lp.data.webShortcuts || []).find(w => String(w.id) === id); if (!item) break; openApp('chrome'); navigateBrowser(item.url); break; }
        case 'chrome-close-all': ui.browserSession = {tabs: [{history: [ChromeApp.NTP], index: 0}], active: 0}; ui.sub = ''; ui.overlay = ''; renderOverlay(); saveBrowserState(); render(); break;
        case 'chrome-ntp': chromeSection(id); break;
        case 'chrome-bookmarks': chromeSection('bookmarks'); break;
        case 'chrome-devices': chromeSection('devices'); break;
        case 'chrome-history': ui.chromeHistoryQuery = ''; navigateBrowser(ChromeApp.HISTORY); break;
        case 'chrome-share': { const link = ui.browserUrl; ui.overlay = ''; renderOverlay(); if (ChromeApp.internal(link)) break; openApp('messaging'); ui.sub = 'new'; lp.messageDraft().body = link.startsWith('search:') ? link.slice(7) : `http://${link}`; save(); render(); break; }
        case 'chrome-desktop': ui.chromeDesktop = !ui.chromeDesktop; ui.overlay = ''; renderOverlay(); render(); break;
        case 'chrome-settings': ui.overlay = ''; renderOverlay(); ui.sub = 'chrome-settings'; ui.chromePrefStack = []; ui.chromePrefMenu = false; ui.chromeConfirm = ''; render(); break;
        case 'chrome-pref-menu': ui.chromePrefMenu = !ui.chromePrefMenu; render(); break;
        case 'chrome-list-open': ui.chromeList = id; render(); break;
        case 'chrome-list-pick': { const [key, value] = id.split(':'); (lp.data.chromePrefs ||= {})[key] = Number(value); ui.chromeList = ''; save(); render(); break; }
        case 'chrome-list-close': ui.chromeList = ''; render(); break;
        case 'chrome-noop': break;
        // Clear browsing data: the dialog's ticks, then a short "Please wait…" before the history goes.
        case 'chrome-clear-open': ui.chromePrefMenu = false; ui.chromeClear = Object.fromEntries(ChromeApp.CLEAR_ITEMS.map(([key, , on]) => [key, on])); render(); break;
        case 'chrome-clear-toggle': if (ui.chromeClear) { ui.chromeClear[id] = !ui.chromeClear[id]; render(); } break;
        case 'chrome-clear-cancel': ui.chromeClear = null; render(); break;
        case 'chrome-clear-run': { const picked = ui.chromeClear; if (!picked) break; ui.chromeClear = {...picked, busy: true}; render(); setTimeout(() => { if (picked.history) { lp.data.browserHistory = []; ui.chromeHistoryQuery = ''; } ui.chromeClear = null; save(); render(); }, 900); break; }
        case 'chrome-unsupported': ui.chromePrefMenu = false; if (ui.sub === 'chrome-settings') render(); ui.overlay = ''; renderOverlay(); toast(i18n.t('This feature is not part of the simulator.')); break;
        case 'browser-tab': ui.browserSession.active = Number(id); ui.sub = ''; ui.browserFind = undefined; saveBrowserState(); render(); break;
        case 'browser-new-tab': if (ui.view === 'chrome') { chromeNewTab(false); break; } if (!ICSBrowserSession.add(ui.browserSession)) { toast('Tab limit reached'); break; } ui.sub = ''; ui.overlay = ''; ui.browserFind = undefined; saveBrowserState(); render(); break;
        case 'browser-save': ui.overlay = ''; renderOverlay(); if (!lp.data.bookmarks.includes(ui.browserUrl)) { lp.data.bookmarks.push(ui.browserUrl); save(); toast('Bookmark saved'); } else toast('Already bookmarked'); break;
        default: return false;
      }
      return true;
    },
    submit(name, values, event, form) {
      switch (name) {
        case 'browser-find': ui.browserFind=String(values.get('query')||'').trim(); render(); break;
        case 'address': navigateBrowser(values.get('address')); break;
        case 'web-search': navigateBrowser(`search:${values.get('query')}`); break;
        case 'chrome-history-search': ui.chromeHistoryQuery = String(values.get('query') || '').trim(); render(); break;
        default: return false;
      }
      return true;
    }
  };
});
