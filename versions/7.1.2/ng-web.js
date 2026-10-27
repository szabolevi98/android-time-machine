/* Android 7.1.2: the simulator's own small offline web of 2017, made up in the spirit of the other versions' offline
   webs (the logic of 6.0.1's web module, the pages this version's own): the Google mobile home page and its results,
   www.android.com with Nougat, a Wikipedia article, a tech news site whose stories Chrome's New Tab page suggests
   (NG.web.articles), and "the 2017 Web". Pages are web content, not the image's UI, so they stay in English like the
   sites themselves. NG.web.page(url) gives {url, title, html, secure, color} or null for an address the offline web
   does not have; NG.web.normalize(text) turns what the omnibox got into a URL (a Google search for anything that is not
   an address). NG.webPages holds the apps' own page providers (url → page or null), asked first (News & Weather's
   stories). A link is data-action="ngcr-go" data-url, a search form data-form="ngcr-search". */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const GOOGLE = 'https://www.google.com/', ANDROID = 'https://www.android.com/', WIKI = 'https://en.m.wikipedia.org/wiki/Android_(operating_system)',
    NEWS = 'https://technews.example/', RETRO = 'https://web2017.example/';
  const STORIES = [
    {url: `${NEWS}android-7-1-2`, title: 'Android 7.1.2 arrives on the Nexus 6P with smoother fingerprint gestures', snippet: 'The last Nougat update for Google’s big Nexus brings battery fixes, a swipe on the fingerprint sensor for the notifications and the April security patch.', hue: 200, days: 1,
      body: ['Google has started rolling out Android 7.1.2 to the Nexus 6P. The update is small on paper, but owners will notice the details: a swipe down on the fingerprint sensor now pulls the notification shade, and the battery lasts a little longer on standby.', 'The rollout happens in stages, so it can take a few weeks for the update to appear under Settings › About phone › System updates.']},
    {url: `${NEWS}nougat-tips`, title: 'Ten Nougat tips: split screen, quick replies and Night Light', snippet: 'Long-press the Overview button to put two apps side by side, answer messages straight from the notification and more.', hue: 140, days: 2,
      body: ['Android Nougat added more than it first seems. Long-press the Overview button and the app you are in moves to the top half of the screen; pick another app for the bottom half.', 'Messages can be answered without opening the app: tap Reply in the notification, type, send.']},
    {url: `${NEWS}mobile-web-2017`, title: 'The mobile web in 2017: faster pages, fewer pop-ups', snippet: 'Pages load faster than ever, and browsers are getting stricter with intrusive ads.', hue: 20, days: 4,
      body: ['Mobile pages got lighter this year. Images are compressed better, scripts load later, and browsers warn about the worst kinds of ads.']}
  ];
  const link = (url, text, cls = 'ngwb-a') => `<a class="${cls}" data-action="ngcr-go" data-url="${esc(url)}">${text}</a>`;
  const logo = (cls = '') => `<div class="ngwb-logo ${cls}"><span style="color:#4285f4">G</span><span style="color:#ea4335">o</span><span style="color:#fbbc05">o</span><span style="color:#4285f4">g</span><span style="color:#34a853">l</span><span style="color:#ea4335">e</span></div>`;
  const box = (q = '') => `<form class="ngwb-search" data-form="ngcr-search"><input name="q" value="${esc(q)}" autocomplete="off" spellcheck="false" aria-label="Search"><button type="submit" aria-label="Search"><svg viewBox="0 0 24 24"><path fill="#4285f4" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></button></form>`;
  const query = u => { const m = /[?&]q=([^&#]*)/.exec(u); return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : ''; };
  const picture = (hue, cls = '') => `<i class="ngwb-pic ${cls}" style="--h:${hue}" aria-hidden="true"></i>`;
  const RESULTS = [[ANDROID, 'Android – Nougat', 'Android 7 Nougat: split screen, quick reply from notifications, Night Light and more. Meet the newest version of Android.'],
    [WIKI, 'Android (operating system) - Wikipedia', 'Android is a mobile operating system developed by Google, based on the Linux kernel and designed primarily for touchscreen devices.'],
    [NEWS, 'Tech News – phones, apps and the mobile web', 'The latest on phones, apps and the mobile web, updated every day.'],
    [RETRO, 'The 2017 Web', 'A small time capsule from the age of cards, AMP pages and mobile-first sites.']];

  function google(u) {
    const q = query(u);
    if (!q) return {title: 'Google', secure: true, html: `<div class="ngwb-google"><div class="ngwb-gtop"><b>All</b><span>Images</span><i></i><span class="ngwb-signin">Sign in</span></div>${logo()}${box()}
      <div class="ngwb-gfoot"><div>Offline demo pages · 2017</div><div><span>Settings</span><span>Privacy</span><span>Terms</span></div></div></div>`};
    const words = q.toLocaleLowerCase();
    const ranked = RESULTS.map(r => ({r, hit: `${r[1]} ${r[2]}`.toLocaleLowerCase().split(/\W+/).filter(w => w && words.includes(w)).length})).sort((a, b) => b.hit - a.hit).map(x => x.r);
    return {title: `${q} - Google Search`, secure: true, html: `<div class="ngwb-results"><div class="ngwb-rhead">${logo('small')}${box(q)}<div class="ngwb-rtabs"><b>All</b><span>News</span><span>Images</span><span>Videos</span><span>Maps</span></div></div>
      ${ranked.map(([url, title, snip]) => `<div class="ngwb-card">${link(url, esc(title), 'ngwb-rtitle')}<div class="ngwb-url">${esc(url.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</div><div class="ngwb-snip">${esc(snip)}</div></div>`).join('')}</div>`};
  }
  const android = () => ({title: 'Android – Nougat', secure: true, color: '#a4c639', html: `<div class="ngwb-android"><header><b>android</b><span>☰</span></header>
    <section class="ngwb-hero"><h1>Android 7 Nougat</h1><p>More powerful than ever. Two apps at once, quicker replies, longer battery life.</p></section>
    <section><h2>Multi-window</h2><p>Long-press the Overview button and use two apps side by side.</p></section>
    <section><h2>Direct reply</h2><p>Answer a message right from its notification.</p></section>
    <section><h2>Doze on the go</h2><p>Your phone rests while it is in your pocket, so the battery lasts longer.</p></section>
    <section><h2>Night Light</h2><p>Warmer colours in the evening, easier on the eyes.</p></section>${link(WIKI, 'Read more on Wikipedia', 'ngwb-a ngwb-more')}</div>`});
  const wiki = () => ({title: 'Android (operating system) - Wikipedia', secure: true, html: `<div class="ngwb-wiki"><header>W<span>Wikipedia</span></header><h1>Android (operating system)</h1>
    <p><b>Android</b> is a mobile operating system developed by Google, based on the Linux kernel and designed primarily for touchscreen mobile devices such as smartphones and tablets.</p>
    <h2>Versions</h2><p>Android 7.0 “Nougat” was released in August 2016 and Android 7.1 in October 2016, first on the Pixel phones. The Nexus 6P and Nexus 5X received Android 7.1.1 in December 2016 and 7.1.2 in April 2017.</p>
    <h2>Features</h2><p>Nougat added split-screen multitasking, bundled notifications with inline replies, a Data Saver and the Vulkan graphics API.</p>
    <p>See also: ${link(ANDROID, 'android.com')}, ${link(NEWS, 'Tech News')}.</p></div>`});
  function news(u) {
    const story = STORIES.find(s => s.url === u.replace(/\/$/, ''));
    const head = `<header class="ngwb-nhead">${link(NEWS, 'Tech<b>News</b>', 'ngwb-nlogo')}</header>`;
    if (story) return {title: story.title, secure: true, color: '#c62828', html: `<div class="ngwb-news">${head}<article>${picture(story.hue, 'wide')}<h1>${esc(story.title)}</h1><div class="ngwb-by">Tech News · ${esc(new Date(Date.now() - story.days * 864e5).toDateString())}</div>${story.body.map(p => `<p>${esc(p)}</p>`).join('')}</article>
      <h2>More stories</h2>${STORIES.filter(s => s !== story).map(s => link(s.url, esc(s.title), 'ngwb-a ngwb-nmore')).join('')}</div>`};
    return {title: 'Tech News – phones, apps and the mobile web', secure: true, color: '#c62828', html: `<div class="ngwb-news">${head}${STORIES.map(s => `<div class="ngwb-nitem">${picture(s.hue)}<div>${link(s.url, esc(s.title), 'ngwb-a ngwb-ntitle')}<p>${esc(s.snippet)}</p></div></div>`).join('')}</div>`};
  }
  const retro = () => ({title: 'The 2017 Web', secure: true, html: `<div class="ngwb-retro"><h1>The 2017 Web</h1><p>Cards everywhere, a hamburger menu in every corner, and pages that load before you finish blinking.</p>
    <ul><li>Accelerated Mobile Pages</li><li>Progressive web apps on the home screen</li><li>“Add to Home screen”, the app without a store</li><li>HTTPS, finally everywhere</li></ul>${link(GOOGLE, 'Back to Google')}</div>`});

  function page(raw) {for(const extra of NG.webPages||[]){const p=extra(raw);if(p)return p;}
    const u = String(raw || '').trim();
    let p = null;
    if (/^https?:\/\/(www\.)?google\.com\/?(search\?.*|\?.*)?$/.test(u)) p = google(u);
    else if (/^https?:\/\/(www\.)?android\.com\/?$/.test(u)) p = android();
    else if (/^https?:\/\/en\.(m\.)?wikipedia\.org\/wiki\/Android(_\(operating_system\))?$/.test(u)) p = wiki();
    else if (/^https?:\/\/technews\.example(\/.*)?$/.test(u)) p = news(u.replace(/^http:/, 'https:'));
    else if (/^https?:\/\/web2017\.example\/?$/.test(u)) p = retro();
    if (!p) return null;
    const canon = /google\.com/.test(u) ? (query(u) ? `${GOOGLE}search?q=${encodeURIComponent(query(u)).split('%20').join('+')}` : GOOGLE)
      : /android\.com/.test(u) ? ANDROID : /wikipedia/.test(u) ? WIKI : /technews/.test(u) ? (u.replace(/^https?:\/\/technews\.example\/?/, '') ? u.replace(/^http:/, 'https:').replace(/\/$/, '') : NEWS) : RETRO;
    return {url: canon, secure: true, ...p};
  }
  function normalize(text) {
    const s = String(text || '').trim();
    if (!s) return '';
    if (/^(chrome|chrome-native|about):/.test(s)) return s;
    if (/^https?:\/\//i.test(s)) return s;
    if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(s) && !/\s/.test(s)) return `http://${s}`;
    return `${GOOGLE}search?q=${encodeURIComponent(s).split('%20').join('+')}`;
  }
  NG.web = {page, normalize, GOOGLE, ANDROID, WIKI, NEWS, RETRO,
    // The stories Chrome's New Tab page suggests ("Articles for you"): the news site's own, newest first.
    articles: () => STORIES.map(s => ({url: s.url, title: s.title, snippet: s.snippet, publisher: 'technews.example', time: Date.now() - s.days * 864e5, hue: s.hue})),
    picture};
})();
