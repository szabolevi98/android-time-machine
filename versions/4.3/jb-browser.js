/* The Browser and Chrome 28 on Android 4.3, moved out of simulator.js (docs/plans/engine-migration.md): the offline
   web pages, the address bar, tabs, bookmarks, history, saved pages and find on page; Chrome's new tab page, menu,
   incognito, settings (chrome.js) and clear browsing data; their actions, forms, typing, overlays, Back, opening and
   Clear data. Each browser keeps its own tabs; the session (ui.browserSession) and syncBrowserState stay in the core. */
(() => {
  'use strict';
  if (!window.JB) return; // loaded on its own (the renderer's unit tests)
  let $c, clone, data, defaultData, i18n, label, messageDraft, openApp, overlayRoot, render, renderOverlay, restoreChrome, safe, save, syncBrowserState, toast, ui, viewport;
  const $bind = c => { $c = c; ({clone, data, defaultData, i18n, label, messageDraft, openApp, overlayRoot, render, renderOverlay, restoreChrome, safe, save, syncBrowserState, toast, ui, viewport} = c); };
  function normalizeAddress(raw) {
    const value = raw.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
    if (!value) return 'www.google.com';
    if (value.startsWith('search:') || value.startsWith('chrome://')) return value;
    if (value.includes(' ') || !value.includes('.')) return ui.browserOwner === 'chrome' ? ChromeApp.searchUrl(value, {data, locale: i18n.locale()}) : `search:${value}`;
    return value.toLowerCase();
  }
  function saveBrowserState() {
    syncBrowserState();
    if (ui.browserOwner === 'chrome') {
      // Incognito tabs are not stored.
      const tabs = ui.browserSession.tabs.filter(tab => !tab.incognito), current = ICSBrowserSession.current(ui.browserSession);
      data.chromeSession = clone({tabs: tabs.length ? tabs : [{history: [ChromeApp.NTP], index: 0}], active: Math.max(0, tabs.indexOf(current))});
    } else data.browserSession = clone(ui.browserSession);
    save();
  }
  function useBrowserSession(owner) {
    if (ui.browserOwner === owner) return;
    ui.browserSessions[ui.browserOwner] = ui.browserSession;
    ui.browserSession = ui.browserSessions[owner] || (owner === 'chrome' ? restoreChrome() : ICSBrowserSession.restore(data.browserSession, data.browserHistory));
    ui.browserOwner = owner; ui.browserFind = undefined; syncBrowserState();
  }
  function chromeTitle(url) { return url === ChromeApp.NTP ? i18n.t('New tab') : url === ChromeApp.HISTORY ? i18n.t('History') : browserTitle(url); }
  function renderChrome() {
    const session = ui.browserSession, tab = ICSBrowserSession.current(session);
    return ChromeApp.render({ui, data, t: key => i18n.t(key), locale: i18n.locale(), page: renderWebsite, title: chromeTitle, url: ui.browserUrl, incognito: !!tab.incognito, tabs: session.tabs.map(item => ({url: item.history[item.index], incognito: !!item.incognito})), active: session.active});
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
    if (!normalized.startsWith('chrome://') && !(ui.browserOwner === 'chrome' && ICSBrowserSession.current(ui.browserSession).incognito)) data.browserHistory = [...data.browserHistory,normalized].slice(-50);
    ui.sub = ''; ui.overlay = ''; ui.browserFind = undefined; saveBrowserState(); render();
  }
  function browserBack() { ICSBrowserSession.move(ui.browserSession,-1); saveBrowserState(); render(); }
  function browserForward() { ICSBrowserSession.move(ui.browserSession,1); ui.overlay = ''; saveBrowserState(); render(); }
  function browserLink(url, title, subtitle = '') { return `<div class="web-result"><a href="#" data-action="browser-link" data-url="${safe(url)}"><strong>${safe(title)}</strong></a><small>${safe(url)}</small><p>${safe(subtitle)}</p></div>`; }
  function renderWebsite(url) {
    if (url === 'www.google.com') return `<div class="google-logo"><span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span></div><form class="search-form" data-form="web-search"><input name="query" aria-label="Search the web" placeholder="Search the web" required><button type="submit">Search</button></form><div class="browser-tiles">${[['www.android.com','Android'],['en.wikipedia.org/wiki/Android','Wikipedia'],['news.example','News'],['retro.example','2013 Web']].map(item => `<button data-action="browser-link" data-url="${item[0]}">${item[1]}</button>`).join('')}</div><p style="font-size:calc(12.9169 * var(--dp));color:#888;margin-top:calc(28.1823 * var(--dp))">Offline demo pages · 2012</p>`;
    const engineHit = window.ChromeApp?.searchResult(url);
    if (url.startsWith('search:') || engineHit) {
      const term = engineHit ? engineHit.term : url.slice(7);
      return `${engineHit ? `<p class="web-engine">${safe(engineHit.name)}</p>` : ''}<h2>Search results</h2><p>Results for <strong>${safe(term)}</strong></p>${browserLink('www.android.com', 'Android – Discover Android 4.3, Jelly Bean', 'Jelly Bean brings smooth performance, Google Now and expandable notifications.')}${browserLink('en.wikipedia.org/wiki/Android', 'Android (operating system) – Wikipedia', 'An overview of the Android mobile operating system.')}${browserLink('news.example', 'Tech News', `Stories related to ${term}.`)}`;
    }
    if (url.includes('android.com')) return `<h2 style="color:#79b93f">android</h2><h3>Meet Android 4.3, Jelly Bean</h3><p>The sweetest Android yet: restricted profiles for tablets, Bluetooth Smart and a faster, smoother experience on phones.</p><div style="background:#23343c;color:white;padding:calc(29.3566 * var(--dp));text-align:center;font-size:calc(44.6219 * var(--dp))">🤖<br><small style="font-size:calc(19.9625 * var(--dp))">Jelly Bean</small></div>${browserLink('en.wikipedia.org/wiki/Android','Learn about Android','The story of Android.')}`;
    if (url.includes('wikipedia.org')) return `<h2>Android (operating system)</h2><p><small>From Wikipedia, the free encyclopedia</small></p><hr><p>Android is a mobile operating system based on a modified version of the Linux kernel. Android 4.0, known as Ice Cream Sandwich, introduced the Holo interface and virtual navigation buttons; versions 4.1–4.3, Jelly Bean, added Project Butter, Google Now and expandable notifications.</p><h3>Versions</h3><p>Gingerbread · Ice Cream Sandwich · Jelly Bean</p>${browserLink('www.android.com','Official Android website')}`;
    if (url === 'news.example/nexus-4' || url === 'retro.example/jelly-bean') return `<article class="web-offline-article"><h2>${url.startsWith('news')?'A day with the Nexus 4':'A closer look at Jelly Bean'}</h2><time>July 24, 2013 · Demo archive</time><p>The phone has a 4.7-inch screen, a sparkling glass back and the blue-accented Holo interface. Open the app drawer to discover Android 4.3 Jelly Bean.</p><h3>Everyday essentials</h3><p>Contacts, messages and the browser share a simple visual language. Swipe between home screens, arrange your favorite apps, and pull down the notification shade.</p><h3>Make it yours</h3><p>Choose a wallpaper, add an analog clock and keep your favorite contacts close. This small offline archive is a fictional snapshot of the early smartphone era.</p>${browserLink('news.example','Back to Tech News')}${browserLink('retro.example/jelly-bean','Explore Jelly Bean')}</article>`;
    if (url.includes('news.example')) return `<h2>Tech News</h2><p style="color:#777">Wednesday, July 24, 2013</p><hr><h3>Android 4.3 arrives on the Nexus 4</h3><p>Jelly Bean makes notifications, quick settings and lock screen widgets easier than ever.</p><h3>Apps in your pocket</h3><p>Explore the growing world of mobile apps and connected devices.</p>${browserLink('news.example/nexus-4','Read the Nexus 4 story')}${browserLink('retro.example','Visit the 2013 Web')}`;
    if (url.includes('retro.example')) return `<h2>Welcome to the 2013 Web</h2><p>A little time capsule from the early smartphone era.</p><ul><li>Share photos</li><li>Check your email</li><li>Customize your phone</li></ul>${browserLink('retro.example/jelly-bean','Explore Jelly Bean')}${browserLink('maps.example','Open the sample map')}${browserLink('www.google.com','Back to Google')}`;
    if (url.includes('maps.example')) return `<h2>Maps</h2><div style="height:calc(270.0799 * var(--dp));background:repeating-linear-gradient(35deg,#e2ead9,#e2ead9 calc(21.1367 * var(--dp)),#c7dfd7 calc(21.1367 * var(--dp)),#c7dfd7 calc(28.1823 * var(--dp)));display:grid;place-items:center;color:#426a68">San Francisco · Demo map</div><p>Map data is a local illustration.</p>`;
    return `<h2>Webpage unavailable</h2><p>The simulator browses a small collection of offline example pages.</p>${browserLink('www.google.com','Go to Google')}`;
  }
  function browserTitle(url) {
    return url === 'www.google.com' ? 'Google' : url.startsWith('search:') ? url.slice(7) : url.replace(/^www\./,'');
  }
  function renderBrowser() {
    const header = title => `<header class="web-header"><button data-action="back" aria-label="Back">‹</button><h2>${safe(i18n.t(title))}</h2><button data-action="browser-new-tab" aria-label="New tab"><img src="assets/web-ic_new_window_holo_dark.png" alt=""></button></header>`;
    if (ui.sub === 'tabs') return `<div class="app-view ics-browser">${header('Tabs')}<div class="web-tabs">${ui.browserTabs.map((url,i)=>`<article class="web-tab-card ${i===ui.browserTab?'current':''}"><div class="web-tab-title"><button data-action="browser-tab" data-id="${i}">${safe(browserTitle(url))}</button><button data-action="browser-close-tab" data-id="${i}" aria-label="Close tab"><img src="assets/web-ic_tab_close.png" alt=""></button></div><div class="web-tab-preview" role="button" tabindex="0" aria-label="${safe(browserTitle(url))}" data-action="browser-tab" data-id="${i}"><div class="browser-page" inert aria-hidden="true">${renderWebsite(url)}</div></div></article>`).join('')}</div></div>`;
    if (['bookmarks','history','saved'].includes(ui.sub)) {
      const urls = ui.sub==='history' ? [...data.browserHistory].reverse() : ui.sub==='saved' ? data.savedPages || [] : data.bookmarks;
      return `<div class="app-view ics-browser">${header('Bookmarks')}<nav class="web-library-tabs">${[['bookmarks','Bookmarks'],['history','History'],['saved','Saved pages']].map(([id,label])=>`<button class="${ui.sub===id?'active':''}" data-action="browser-${id}">${safe(i18n.t(label))}</button>`).join('')}</nav><div class="web-library">${urls.map(url=>`<div class="web-library-row"><button data-action="browser-bookmark" data-id="${safe(url)}">${safe(browserTitle(url))}<small>${safe(url)}</small></button>${ui.sub!=='history'?`<button data-action="browser-remove-saved" data-id="${safe(url)}" aria-label="Delete">×</button>`:''}</div>`).join('')||'<p class="empty-note">No saved pages</p>'}</div></div>`;
    }
    return `<div class="app-view ics-browser"><div class="browser-toolbar"><form data-form="address"><img src="assets/browser.png" alt=""><input name="address" aria-label="Web address" value="${safe(ui.browserUrl.startsWith('search:')?ui.browserUrl.slice(7):ui.browserUrl)}"></form><button data-action="browser-tabs" aria-label="Tabs"><img src="assets/web-ic_windows_holo_dark.png" alt=""><span class="browser-tab-count">${ui.browserTabs.length}</span></button><button data-action="browser-menu" aria-label="More options"><img src="assets/ic_menu_overflow.png" alt=""></button></div>${ui.browserFind!==undefined?`<form class="web-find" data-form="browser-find"><input name="query" aria-label="Find on page" placeholder="Find on page" value="${safe(ui.browserFind)}"><button type="submit">Search</button><button type="button" data-action="browser-close-find" aria-label="Close">×</button></form><div class="web-find-count" aria-live="polite"></div>`:''}<div class="browser-page">${renderWebsite(ui.browserUrl)}</div></div>`;
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
  const spec = {
    render(c) {
      $bind(c);
      switch (ui.view) {
        case 'browser': return renderBrowser();
        case 'chrome': return renderChrome();
      }
    },
    mount(c, root) {
      $bind(c);
      if (['browser', 'chrome'].includes(ui.view) && !ui.sub && ui.browserFind) highlightBrowserText();
    },
    action(action, button, c) {
      $bind(c);
      const event = c.event, { id, app, url } = button.dataset;
      if (action.startsWith('chrome-') && ui.sub === 'chrome-settings') {
        const result = ChromeApp.prefAction(action, id, {ui, data, locale: i18n.locale(), t: key => i18n.t(key)});
        if (result) {
          if (result === 'save' || result.toast) save();
          if (result.external) { const stack = [...(ui.chromePrefStack || [])]; openApp('google-settings'); ui.sub = 'gms-location'; ui.chromeReturn = {stack, view: ui.view, sub: ui.sub}; render(); return true; }
          if (result.open) { ui.sub = ''; ui.chromePrefStack = []; chromeNewTab(false); navigateBrowser(result.open); return true; }
          render(); if (result.toast) toast(result.toast); return true;
        }
      }
      switch (action) {
        case 'browser-search': openApp('browser'); document.querySelector('.browser-toolbar input')?.focus(); break;
        case 'browser-link': navigateBrowser(url); break;
        case 'browser-back': browserBack(); break;
        case 'browser-forward': browserForward(); break;
        case 'browser-tabs': ui.sub = 'tabs'; render(); break;
        case 'browser-menu': ui.overlay = 'browser-menu'; renderOverlay(); break;
        case 'browser-bookmarks': ui.sub = 'bookmarks'; ui.overlay = ''; render(); break;
        case 'browser-bookmark': navigateBrowser(id); break;
        case 'browser-saved': ui.sub='saved'; ui.overlay=''; render(); break;
        case 'browser-save-page': data.savedPages ||= []; if(!data.savedPages.includes(ui.browserUrl))data.savedPages.push(ui.browserUrl); save(); ui.overlay=''; renderOverlay(); toast('Page saved'); break;
        case 'browser-remove-saved': if(ui.sub==='saved')data.savedPages=data.savedPages.filter(url=>url!==id); else data.bookmarks=data.bookmarks.filter(url=>url!==id); save(); render(); break;
        case 'browser-close-tab': { const last = ui.browserSession.tabs.length === 1; ICSBrowserSession.close(ui.browserSession,Number(id)); if (last && ui.browserOwner === 'chrome') ui.browserSession.tabs[0].history = [ChromeApp.NTP]; saveBrowserState(); render(); break; }
        case 'browser-refresh': ui.overlay=''; render(); break;
        case 'browser-find': ui.browserFind=''; ui.overlay=''; render(); viewport.querySelector('.web-find input')?.focus(); break;
        case 'browser-close-find': ui.browserFind=undefined; render(); break;
        case 'browser-history': ui.sub = 'history'; render(); break;
        case 'browser-tab': ui.browserSession.active = Number(id); ui.sub = ''; ui.browserFind = undefined; saveBrowserState(); render(); break;
        case 'chrome-incognito': chromeNewTab(true); break;
        case 'chrome-close-all': ui.browserSession = {tabs: [{history: [ChromeApp.NTP], index: 0}], active: 0}; ui.sub = ''; ui.overlay = ''; renderOverlay(); saveBrowserState(); render(); break;
        case 'chrome-ntp': chromeSection(id); break;
        case 'chrome-bookmarks': chromeSection('bookmarks'); break;
        case 'chrome-devices': chromeSection('devices'); break;
        case 'chrome-share': { const link = ui.browserUrl; ui.overlay = ''; renderOverlay(); if (ChromeApp.internal(link)) break; openApp('messaging'); ui.sub = 'new'; messageDraft().body = link.startsWith('search:') ? link.slice(7) : `http://${link}`; save(); render(); break; }
        case 'chrome-desktop': ui.chromeDesktop = !ui.chromeDesktop; ui.overlay = ''; renderOverlay(); render(); break;
        case 'chrome-settings': ui.overlay = ''; renderOverlay(); ui.sub = 'chrome-settings'; ui.chromePrefStack = []; ui.chromePrefMenu = false; ui.chromeConfirm = ''; render(); break;
        case 'chrome-pref-menu': ui.chromePrefMenu = !ui.chromePrefMenu; render(); break;
        case 'chrome-list-open': ui.chromeList = id; render(); break;
        case 'chrome-list-pick': { const [key, value] = id.split(':'); (data.chromePrefs ||= {})[key] = Number(value); ui.chromeList = ''; save(); render(); break; }
        case 'chrome-list-close': ui.chromeList = ''; render(); break;
        case 'chrome-noop': break;
        case 'chrome-clear-open': ui.chromePrefMenu = false; ui.chromeClear = Object.fromEntries(ChromeApp.CLEAR_ITEMS.map(([key, , on]) => [key, on])); render(); break;
        case 'chrome-clear-toggle': if (ui.chromeClear) { ui.chromeClear[id] = !ui.chromeClear[id]; render(); } break;
        case 'chrome-clear-cancel': ui.chromeClear = null; render(); break;
        case 'chrome-clear-run': { const picked = ui.chromeClear; if (!picked) break; ui.chromeClear = {...picked, busy: true}; render(); setTimeout(() => { if (picked.history) { data.browserHistory = []; ui.chromeHistoryQuery = ''; } ui.chromeClear = null; save(); render(); }, 900); break; }
        case 'chrome-unsupported': ui.chromePrefMenu = false; if (ui.sub === 'chrome-settings') render(); ui.overlay = ''; renderOverlay(); toast(i18n.t('This feature is not part of the simulator.')); break;
        case 'browser-back-menu': ui.overlay = ''; renderOverlay(); browserBack(); break;
        case 'browser-new-tab': if (ui.view === 'chrome') { chromeNewTab(false); break; } if (!ICSBrowserSession.add(ui.browserSession)) { toast('Tab limit reached'); break; } ui.sub = ''; ui.overlay = ''; ui.browserFind = undefined; saveBrowserState(); render(); break;
        case 'browser-save': ui.overlay = ''; renderOverlay(); if (!data.bookmarks.includes(ui.browserUrl)) { data.bookmarks.push(ui.browserUrl); save(); toast('Bookmark saved'); } else toast('Already bookmarked'); break;
        default: return false;
      }
      return true;
    },
    submit(name, values, c) {
      $bind(c);
      const event = c.event, form = c.form;
      switch (form.dataset.form) {
        case 'browser-find': ui.browserFind=String(values.get('query')||'').trim(); render(); break;
        case 'address': navigateBrowser(values.get('address')); break;
        case 'web-search': navigateBrowser(`search:${values.get('query')}`); break;
        case 'chrome-history-search': ui.chromeHistoryQuery = String(values.get('query') || '').trim(); render(); break;
        default: return false;
      }
      return true;
    },
    input(event, c) {
      $bind(c);
      if (event.target.matches?.('[data-chr-seek]')) { const ctx = {ui, data, locale: i18n.locale()}; ChromeApp.prefSeek(event.target.value, ctx); ChromeApp.seekPaint(viewport, ctx); save(); return true; }
      return false;
    },
    back(c) {
      $bind(c);
      if (ui.overlay) return false;
      if (['browser', 'chrome'].includes(ui.view) && (ui.chromeClear || ui.chromeList || ui.chromePrefMenu || ui.chromeConfirm) && !ui.chromeClear?.busy) { ui.chromeClear = null; ui.chromeList = ''; ui.chromePrefMenu = false; ui.chromeConfirm = ''; render(); return true; }
      if (['browser', 'chrome'].includes(ui.view) && ui.sub === 'chrome-settings') { if (!ChromeApp.prefBack(ui)) ui.sub = ''; render(); return true; }
      if (['browser', 'chrome'].includes(ui.view) && !ui.sub && ui.browserFind !== undefined) { ui.browserFind = undefined; render(); return true; }
      if (['browser', 'chrome'].includes(ui.view) && !ui.sub && ui.browserIndex > 0) { browserBack(); return true; }
      return false;
    },
    // Opening, once the core has checked the phone is not locked.
    openUnlocked(c, resume, app) {
      $bind(c);
      if (app === 'chrome' || app === 'browser') useBrowserSession(app);
    },
    clearData(c) {
      $bind(c);
      const id = c.clearId;
      if(id==='chrome'){delete data.chromeSession;delete ui.browserSessions.chrome;if(ui.browserOwner==='chrome'){ui.browserSession=restoreChrome();syncBrowserState();}save();}
      if(id==='browser'){delete data.browserSession;data.browserHistory=clone(defaultData.browserHistory);data.bookmarks=clone(defaultData.bookmarks||[]);data.savedPages=[];ui.browserSession=ICSBrowserSession.restore(null,data.browserHistory);syncBrowserState();}
    },
    overlay(c) {
      $bind(c);
      if (ui.overlay === 'browser-menu' && ui.view === 'chrome') {
        overlayRoot.innerHTML = ChromeApp.menu({ui, data, t: key => i18n.t(key), locale: i18n.locale(), url: ui.browserUrl, incognito: !!ICSBrowserSession.current(ui.browserSession)?.incognito});
      } else if (ui.overlay === 'browser-menu') {
        overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu web-menu"><button data-action="browser-forward" ${ui.browserIndex >= ui.browserHistory.length-1?'disabled':''}>Forward</button><button data-action="browser-refresh">Refresh</button><button data-action="browser-new-tab">New tab</button><button data-action="browser-save">Bookmark</button><button data-action="browser-bookmarks">Bookmarks</button><button data-action="browser-saved">Saved pages</button><button data-action="browser-save-page">Save for offline reading</button><button data-action="browser-find">Find on page</button></div>`;
      }
      else return;
      return true;
    },
    exports: {
      navigateBrowser: (c, ...args) => { $bind(c); return navigateBrowser(...args); }
    }
  };
  JB.register('browser', spec);
  JB.register('chrome', spec);
})();
