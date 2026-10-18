/* Android 6.0.1: the simulator's own small offline web of 2016, made up in the spirit of the other versions'
   offline webs: the Google mobile home page and its results, www.android.com with Marshmallow, a Wikipedia
   article, a tech news site and "the 2016 Web". Pages are web content, not the image's UI, so they stay in English like
   the sites themselves. MM.web.page(url) → {title, html, secure} or null for an address the offline web does not have;
   MM.web.normalize(text) turns what the omnibox got into a URL (a Google search for anything that is not an address). */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const GOOGLE = 'https://www.google.com/', ANDROID = 'https://www.android.com/', WIKI = 'https://en.m.wikipedia.org/wiki/Android_(operating_system)', NEWS = 'http://news.example/', RETRO = 'http://retro.example/';
  const link = (url, text) => `<a class="mmwb-a" data-action="mmcr-go" data-url="${esc(url)}">${esc(text)}</a>`;
  const logo = (cls = '') => `<div class="mmwb-logo ${cls}"><span style="color:#4285f4">G</span><span style="color:#ea4335">o</span><span style="color:#fbbc05">o</span><span style="color:#4285f4">g</span><span style="color:#34a853">l</span><span style="color:#ea4335">e</span></div>`;
  const box = (q = '') => `<form class="mmwb-search" data-form="mmcr-search"><input name="q" value="${esc(q)}" autocomplete="off" spellcheck="false" aria-label="Search"><button type="submit" aria-label="Search"><svg viewBox="0 0 24 24"><path fill="#4285f4" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></button></form>`;
  const query = u => { const m = /[?&]q=([^&#]*)/.exec(u); return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : ''; };
  const RESULTS = [[ANDROID, 'Android – Marshmallow', 'Android 6.0 Marshmallow: Now on Tap, app permissions, Doze and fingerprint support. Get to know the latest version of Android.'],
    [WIKI, 'Android (operating system) - Wikipedia', 'Android is a mobile operating system developed by Google, based on the Linux kernel and designed primarily for touchscreen devices.'],
    [NEWS, 'Tech News – phones, apps and the mobile web', 'The latest on phones, apps and the mobile web, updated every day.'],
    [RETRO, 'The 2016 Web', 'A small time capsule from the age of Material design and mobile-first sites.']];

  function google(u) {
    const q = query(u);
    if (!q) return {title: 'Google', secure: true, html: `<div class="mmwb-google"><div class="mmwb-gtop"><span>All</span><span>Images</span><i></i><b>Sign in</b></div>${logo()}${box()}
      <div class="mmwb-tiles">${[[ANDROID, 'Android'], [WIKI, 'Wikipedia'], [NEWS, 'Tech News'], [RETRO, 'The 2016 Web']].map(([url, text]) => link(url, text)).join('')}</div>
      <div class="mmwb-gfoot"><div>Offline demo pages · 2016</div><div><span>Settings</span><span>Privacy</span><span>Terms</span></div></div></div>`};
    const words = q.toLocaleLowerCase();
    const ranked = RESULTS.map(r => ({r, hit: `${r[1]} ${r[2]}`.toLocaleLowerCase().split(/\W+/).filter(w => w && words.includes(w)).length})).sort((a, b) => b.hit - a.hit).map(x => x.r);
    return {title: `${q} - Google Search`, secure: true, html: `<div class="mmwb-results"><div class="mmwb-rhead">${logo('small')}${box(q)}<div class="mmwb-rtabs"><b>All</b><span>Images</span><span>News</span><span>Videos</span><span>Maps</span></div></div>
      ${ranked.map(([url, title, snip]) => `<div class="mmwb-card">${link(url, title)}<div class="mmwb-url">${esc(url.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</div><div class="mmwb-snip">${esc(snip)}</div></div>`).join('')}</div>`};
  }
  const android = () => ({title: 'Android', secure: true, html: `<div class="mmwb-android"><div class="mmwb-abar"><b>android</b><span>☰</span></div><div class="mmwb-hero"><small>Android 6.0</small><h1>Marshmallow</h1><p>Get the right info at the right time. Use apps the way you want. And keep your phone going longer.</p></div>
    <h2>Now on Tap</h2><p>Just tap and hold the Home button to get cards with useful info based on what's on your screen — no need to leave the app you're in.</p>
    <h2>App permissions</h2><p>Decide which permissions to give an app when it needs them, like the camera or your location, and change them any time in Settings.</p>
    <h2>Doze</h2><p>When your phone is still for a while, Doze puts it into a deep sleep, so a charge lasts longer.</p>
    <h2>Fingerprint</h2><p>Unlock your phone and pay in stores with Android Pay with just a touch.</p><p>${link(WIKI, 'Read about Android on Wikipedia')}</p></div>`});
  const wiki = () => ({title: 'Android (operating system) - Wikipedia, the free encyclopedia', secure: true, html: `<div class="mmwb-wiki"><div class="mmwb-wbar"><span>☰</span><b>W<small>IKIPEDIA</small></b><span>⌕</span></div><h1>Android (operating system)</h1><p class="mmwb-from">From Wikipedia, the free encyclopedia</p>
    <p><b>Android</b> is a mobile operating system developed by Google, based on the Linux kernel and designed primarily for touchscreen mobile devices such as smartphones and tablets.</p>
    <h2>History</h2><p>Android, Inc. was founded in Palo Alto, California in October 2003. Google acquired it in 2005, and the first commercially available Android phone, the HTC Dream, was released in 2008.</p>
    <h2>Versions</h2><ul><li>4.4 KitKat</li><li>5.0 – 5.1 Lollipop</li><li>6.0 Marshmallow</li></ul><p>Android 6.0 Marshmallow added runtime permissions, Doze, native fingerprint support and Now on Tap.</p><p>${link(ANDROID, 'Official website')}</p></div>`});
  const news = () => ({title: 'Tech News', secure: false, html: `<div class="mmwb-news"><div class="mmwb-nbar">Tech News</div><p class="mmwb-date">Demo archive · 2016</p>
    <h2>Monthly security updates keep arriving for Nexus phones</h2><p>The Nexus 5X and 6P get their patches straight from Google, month after month.</p>
    <h2>What Doze means for your battery</h2><p>Leave your phone on the desk overnight and it barely notices the time passing.</p>
    <h2>Five apps to try this week</h2><p>From photo editing to note taking, a few favourites from the Play Store.</p><p>${link(RETRO, 'Visit The 2016 Web')}</p></div>`});
  const retro = () => ({title: 'The 2016 Web', secure: false, html: `<div class="mmwb-retro"><h1>Welcome to the 2016 Web</h1><p>A little time capsule from the age of Material design and mobile-first sites.</p><ul><li>Responsive pages</li><li>Cards everywhere</li><li>Hamburger menus</li></ul><p>${link(GOOGLE, 'Back to Google')}</p></div>`});

  // My Account (myaccount.google.com): the pages Google Settings' account rows open; the simulator's own short page.
  const ACCOUNT_PAGES = {security: ['Sign-in & security', 'Control your password and account access, along with backup options if you get locked out of your account.'],
    privacy: ['Personal info & privacy', 'Manage your visibility settings and the data we use to personalize your experience.'],
    preferences: ['Account preferences', 'Set language, accessibility and other settings that help you use Google.'],
    ads: ['Ads Settings', 'Control the information Google uses to show you ads.'],
    games: ['Google Play Games', 'Games can send you notifications about multiplayer invitations, quests and gifts.']};
  function myaccount(u) {
    const sec = (/myaccount\.google\.com\/(\w+)/.exec(u) || [])[1], [title, text] = ACCOUNT_PAGES[sec] || ['My Account', 'Control, protect and secure your account, all in one place.'];
    return {title: `${title} – My Account`, secure: true, html: `<div class="mmwb-acct"><div class="mmwb-abar2">${logo('small')}<b>My Account</b></div><h1>${esc(title)}</h1><p>${esc(text)}</p>
      <div class="mmwb-acard"><b>nexus5x.demo@gmail.com</b><span>Demo account · offline</span></div><p class="mmwb-date">Offline demo pages · 2016</p></div>`};
  }
  function normalize(text) {
    const s = String(text || '').trim();
    if (!s) return '';
    if (/^https?:\/\//i.test(s)) return s;
    if (!/\s/.test(s) && /^[\w-]+(\.[\w-]+)+(:\d+)?(\/.*)?$/.test(s)) return `http://${s}${/\//.test(s) ? '' : '/'}`;
    return `${GOOGLE}search?q=${encodeURIComponent(s).split('%20').join('+')}`;
  }
  function page(url) {
    const u = String(url || '').replace(/^https?:\/\/(?:www\.)?(google\.com|android\.com)/, 'https://www.$1').replace(/^http:\/\/(en\.(m\.)?wikipedia\.org)/, 'https://$1');
    if (/^https:\/\/(www\.)?google\.com\/(search|\?|$)/.test(u)) return {url: u, ...google(u)};
    if (/^https:\/\/www\.android\.com\/?$/.test(u)) return {url: ANDROID, ...android()};
    if (/^https:\/\/en\.(m\.)?wikipedia\.org\/wiki\/Android/.test(u)) return {url: WIKI, ...wiki()};
    if (/^http:\/\/news\.example\/?$/.test(u)) return {url: NEWS, ...news()};
    if (/^http:\/\/retro\.example\/?$/.test(u)) return {url: RETRO, ...retro()};
    if (/^https:\/\/myaccount\.google\.com\//.test(u)) return {url: u, ...myaccount(u)};
    return null;
  }
  MM.web = {page, normalize, GOOGLE};
})();
