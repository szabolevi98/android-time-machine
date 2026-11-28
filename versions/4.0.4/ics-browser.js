/* Browser (IMM76I Browser.apk), moved out of simulator.js (docs/plans/engine-migration.md). It browses a small set of
   offline example pages (no network):
   - the address bar (a word or phrase searches), the tabs (browser-session.js keeps them and their histories in
     data.browserSession), Bookmarks / History / Saved pages, the overflow menu, Find on page with its matches marked
   - Back steps back in the tab's history before it leaves the app. */
(() => {
  'use strict';

  function normalizeAddress(raw) {
    const value = raw.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
    if (!value) return 'www.google.com';
    if (value.startsWith('search:')) return value;
    if (value.includes(' ') || !value.includes('.')) return `search:${value}`;
    return value.toLowerCase();
  }
  function saveBrowserState(c) { c.syncBrowserState(); c.data.browserSession = c.clone(c.ui.browserSession); c.save(); }
  function navigateBrowser(c, url) {
    const {ui, data, render} = c;
    const normalized = normalizeAddress(url);
    ICSBrowserSession.navigate(ui.browserSession,normalized);
    data.browserHistory = [...data.browserHistory,normalized].slice(-50);
    ui.sub = ''; ui.overlay = ''; ui.browserFind = undefined; saveBrowserState(c); render();
  }
  function browserBack(c) { ICSBrowserSession.move(c.ui.browserSession,-1); saveBrowserState(c); c.render(); }
  function browserForward(c) { ICSBrowserSession.move(c.ui.browserSession,1); c.ui.overlay = ''; saveBrowserState(c); c.render(); }
  function browserLink(safe, url, title, subtitle = '') { return `<div class="web-result"><a href="#" data-action="browser-link" data-url="${safe(url)}"><strong>${safe(title)}</strong></a><small>${safe(url)}</small><p>${safe(subtitle)}</p></div>`; }
  function renderWebsite(safe, url) {
    const browserLink_ = (...args) => browserLink(safe, ...args);
    if (url === 'www.google.com') return `<div class="google-logo"><span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span></div><form class="search-form" data-form="web-search"><input name="query" aria-label="Search the web" placeholder="Search the web" required><button type="submit">Search</button></form><div class="browser-tiles">${[['www.android.com','Android'],['en.wikipedia.org/wiki/Android','Wikipedia'],['news.example','News'],['retro.example','2012 Web']].map(item => `<button data-action="browser-link" data-url="${item[0]}">${item[1]}</button>`).join('')}</div><p style="font-size:calc(12.9412 * var(--dp));color:#888;margin-top:calc(28.2353 * var(--dp))">Offline demo pages · 2012</p>`;
    if (url.startsWith('search:')) {
      const term = url.slice(7);
      return `<h2>Search results</h2><p>Results for <strong>${safe(term)}</strong></p>${browserLink_('www.android.com', 'Android – Discover the new Android 4.0', 'Ice Cream Sandwich brings a refined design and powerful new features.')}${browserLink_('en.wikipedia.org/wiki/Android', 'Android (operating system) – Wikipedia', 'An overview of the Android mobile operating system.')}${browserLink_('news.example', 'Tech News', `Stories related to ${term}.`)}`;
    }
    if (url.includes('android.com')) return `<h2 style="color:#79b93f">android</h2><h3>Meet Android 4.0</h3><p>A new, refined Android for phones and tablets. Share more, browse faster and personalize your home screen.</p><div style="background:#23343c;color:white;padding:calc(29.4118 * var(--dp));text-align:center;font-size:calc(44.7059 * var(--dp))">🤖<br><small style="font-size:calc(20 * var(--dp))">Ice Cream Sandwich</small></div>${browserLink_('en.wikipedia.org/wiki/Android','Learn about Android','The story of Android.')}`;
    if (url.includes('wikipedia.org')) return `<h2>Android (operating system)</h2><p><small>From Wikipedia, the free encyclopedia</small></p><hr><p>Android is a mobile operating system based on a modified version of the Linux kernel. Android 4.0, known as Ice Cream Sandwich, introduced the Holo interface and virtual navigation buttons.</p><h3>Versions</h3><p>Gingerbread · Ice Cream Sandwich · Jelly Bean</p>${browserLink_('www.android.com','Official Android website')}`;
    if (url === 'news.example/galaxy-nexus' || url === 'retro.example/holo') return `<article class="web-offline-article"><h2>${url.startsWith('news')?'A day with Galaxy Nexus':'A closer look at Holo'}</h2><time>August 20, 2012 · Demo archive</time><p>The phone has a large screen, three navigation buttons and a blue-accented interface. Open the app drawer to discover the classic Android experience.</p><h3>Everyday essentials</h3><p>Contacts, messages and the browser share a simple visual language. Swipe between home screens, arrange your favorite apps, and pull down the notification shade.</p><h3>Make it yours</h3><p>Choose a wallpaper, add an analog clock and keep your favorite contacts close. This small offline archive is a fictional snapshot of the early smartphone era.</p>${browserLink_('news.example','Back to Tech News')}${browserLink_('retro.example/holo','Explore the Holo interface')}</article>`;
    if (url.includes('news.example')) return `<h2>Tech News</h2><p style="color:#777">Monday, August 20, 2012</p><hr><h3>The Galaxy Nexus experience</h3><p>Android 4.0 makes multitasking, notifications and home screen customization easier than ever.</p><h3>Apps in your pocket</h3><p>Explore the growing world of mobile apps and connected devices.</p>${browserLink_('news.example/galaxy-nexus','Read the Galaxy Nexus story')}${browserLink_('retro.example','Visit the 2012 Web')}`;
    if (url.includes('retro.example')) return `<h2>Welcome to the 2012 Web</h2><p>A little time capsule from the early smartphone era.</p><ul><li>Share photos</li><li>Check your email</li><li>Customize your phone</li></ul>${browserLink_('retro.example/holo','Explore the Holo interface')}${browserLink_('maps.example','Open the sample map')}${browserLink_('www.google.com','Back to Google')}`;
    if (url.includes('maps.example')) return `<h2>Maps</h2><div style="height:calc(270.5883 * var(--dp));background:repeating-linear-gradient(35deg,#e2ead9,#e2ead9 calc(21.1765 * var(--dp)),#c7dfd7 calc(21.1765 * var(--dp)),#c7dfd7 calc(28.2353 * var(--dp)));display:grid;place-items:center;color:#426a68">San Francisco · Demo map</div><p>Map data is a local illustration.</p>`;
    return `<h2>Webpage unavailable</h2><p>The simulator browses a small collection of offline example pages.</p>${browserLink_('www.google.com','Go to Google')}`;
  }
  function browserTitle(url) {
    return url === 'www.google.com' ? 'Google' : url.startsWith('search:') ? url.slice(7) : url.replace(/^www\./,'');
  }
  function renderBrowser(c) {
    const {ui, data, safe, i18n} = c;
    const header = title => `<header class="web-header"><button data-action="back" aria-label="Back">‹</button><h2>${safe(i18n.t(title))}</h2><button data-action="browser-new-tab" aria-label="New tab"><img src="assets/web-ic_new_window_holo_dark.png" alt=""></button></header>`;
    if (ui.sub === 'tabs') return `<div class="app-view ics-browser">${header('Tabs')}<div class="web-tabs">${ui.browserTabs.map((url,i)=>`<article class="web-tab-card ${i===ui.browserTab?'current':''}"><div class="web-tab-title"><button data-action="browser-tab" data-id="${i}">${safe(browserTitle(url))}</button><button data-action="browser-close-tab" data-id="${i}" aria-label="Close tab"><img src="assets/web-ic_tab_close.png" alt=""></button></div><div class="web-tab-preview" role="button" tabindex="0" aria-label="${safe(browserTitle(url))}" data-action="browser-tab" data-id="${i}"><div class="browser-page" inert aria-hidden="true">${renderWebsite(safe, url)}</div></div></article>`).join('')}</div></div>`;
    if (['bookmarks','history','saved'].includes(ui.sub)) {
      const urls = ui.sub==='history' ? [...data.browserHistory].reverse() : ui.sub==='saved' ? data.savedPages || [] : data.bookmarks;
      return `<div class="app-view ics-browser">${header('Bookmarks')}<nav class="web-library-tabs">${[['bookmarks','Bookmarks'],['history','History'],['saved','Saved pages']].map(([id,label])=>`<button class="${ui.sub===id?'active':''}" data-action="browser-${id}">${safe(i18n.t(label))}</button>`).join('')}</nav><div class="web-library">${urls.map(url=>`<div class="web-library-row"><button data-action="browser-bookmark" data-id="${safe(url)}">${safe(browserTitle(url))}<small>${safe(url)}</small></button>${ui.sub!=='history'?`<button data-action="browser-remove-saved" data-id="${safe(url)}" aria-label="Delete">×</button>`:''}</div>`).join('')||'<p class="empty-note">No saved pages</p>'}</div></div>`;
    }
    return `<div class="app-view ics-browser"><div class="browser-toolbar"><form data-form="address"><img src="assets/browser.png" alt=""><input name="address" aria-label="Web address" value="${safe(ui.browserUrl.startsWith('search:')?ui.browserUrl.slice(7):ui.browserUrl)}"></form><button data-action="browser-tabs" aria-label="Tabs"><img src="assets/web-ic_windows_holo_dark.png" alt=""><span class="browser-tab-count">${ui.browserTabs.length}</span></button><button data-action="browser-menu" aria-label="More options"><img src="assets/ic_menu_overflow.png" alt=""></button></div>${ui.browserFind!==undefined?`<form class="web-find" data-form="browser-find"><input name="query" aria-label="Find on page" placeholder="Find on page" value="${safe(ui.browserFind)}"><button type="submit">Search</button><button type="button" data-action="browser-close-find" aria-label="Close">×</button></form><div class="web-find-count" aria-live="polite"></div>`:''}<div class="browser-page">${renderWebsite(safe, ui.browserUrl)}</div></div>`;
  }
  function highlightBrowserText(c) {
    const {ui, viewport, i18n} = c;
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

  ICS.register('browser', {
    scroller: '.browser-page,.web-tabs,.web-library',
    init(c) { c.navigateBrowser = url => navigateBrowser(c, url); },
    render: renderBrowser,
    overlay(c) {
      const {ui} = c;
      if (ui.overlay === 'browser-menu') return `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu web-menu"><button data-action="browser-forward" ${ui.browserIndex >= ui.browserHistory.length-1?'disabled':''}>Forward</button><button data-action="browser-refresh">Refresh</button><button data-action="browser-new-tab">New tab</button><button data-action="browser-save">Bookmark</button><button data-action="browser-bookmarks">Bookmarks</button><button data-action="browser-saved">Saved pages</button><button data-action="browser-save-page">Save for offline reading</button><button data-action="browser-find">Find on page</button></div>`;
    },
    action(action, button, c) {
      const {ui, data, save, render, renderOverlay, toast, openApp, viewport, navigateBrowser} = c, {id, url} = button.dataset;
      switch (action) {
        case 'browser-search': openApp('browser'); document.querySelector('.browser-toolbar input')?.focus(); break;
        case 'browser-link': navigateBrowser(url); break;
        case 'browser-back': browserBack(c); break;
        case 'browser-forward': browserForward(c); break;
        case 'browser-tabs': ui.sub = 'tabs'; render(); break;
        case 'browser-menu': ui.overlay = 'browser-menu'; renderOverlay(); break;
        case 'browser-bookmarks': ui.sub = 'bookmarks'; ui.overlay = ''; render(); break;
        case 'browser-bookmark': navigateBrowser(id); break;
        case 'browser-saved': ui.sub='saved'; ui.overlay=''; render(); break;
        case 'browser-save-page': data.savedPages ||= []; if(!data.savedPages.includes(ui.browserUrl))data.savedPages.push(ui.browserUrl); save(); ui.overlay=''; renderOverlay(); toast('Page saved'); break;
        case 'browser-remove-saved': if(ui.sub==='saved')data.savedPages=data.savedPages.filter(url=>url!==id); else data.bookmarks=data.bookmarks.filter(url=>url!==id); save(); render(); break;
        case 'browser-close-tab': ICSBrowserSession.close(ui.browserSession,Number(id)); saveBrowserState(c); render(); break;
        case 'browser-refresh': ui.overlay=''; render(); break;
        case 'browser-find': ui.browserFind=''; ui.overlay=''; render(); viewport.querySelector('.web-find input')?.focus(); break;
        case 'browser-close-find': ui.browserFind=undefined; render(); break;
        case 'browser-history': ui.sub = 'history'; render(); break;
        case 'browser-tab': ui.browserSession.active = Number(id); ui.sub = ''; ui.browserFind = undefined; saveBrowserState(c); render(); break;
        case 'browser-new-tab': if (!ICSBrowserSession.add(ui.browserSession)) { toast('Tab limit reached'); break; } ui.sub = ''; ui.overlay = ''; ui.browserFind = undefined; saveBrowserState(c); render(); break;
        case 'browser-save': ui.overlay = ''; renderOverlay(); if (!data.bookmarks.includes(ui.browserUrl)) { data.bookmarks.push(ui.browserUrl); save(); toast('Bookmark saved'); } else toast('Already bookmarked'); break;
        default: return false;
      }
      return true;
    },
    submit(form, values, c) {
      const {ui, render, navigateBrowser} = c;
      switch (form.dataset.form) {
        case 'browser-find': ui.browserFind=String(values.get('query')||'').trim(); render(); break;
        case 'address': navigateBrowser(values.get('address')); break;
        case 'web-search': navigateBrowser(`search:${values.get('query')}`); break;
        default: return false;
      }
      return true;
    },
    // Enter or Space on a tab's preview opens the tab.
    key(event) {
      if (event.target.matches('.web-tab-preview') && ['Enter',' '].includes(event.key)) { event.preventDefault(); event.target.click(); return true; }
    },
    // After every draw: Find on page marks its matches.
    rendered(c) { const {ui} = c; if (ui.view === 'browser' && !ui.sub && ui.browserFind) highlightBrowserText(c); },
    back(c) {
      const {ui, render} = c;
      if (ui.overlay) return false;
      if (ui.view === 'browser' && !ui.sub && ui.browserFind !== undefined) { ui.browserFind = undefined; render(); return true; }
      if (ui.view === 'browser' && !ui.sub && ui.browserIndex > 0) { browserBack(c); return true; }
      return false;
    },
    clearData(c) {
      const {ui, data, clone} = c;
      delete data.browserSession;data.browserHistory=clone(c.defaults.browserHistory);data.bookmarks=clone(c.defaults.bookmarks||[]);data.savedPages=[];ui.browserSession=ICSBrowserSession.restore(null,data.browserHistory);c.syncBrowserState();
    }
  });
})();
