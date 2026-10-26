/* The remaining apps of the Nexus 6 factory image (LMY48Y): Docs 1.4, Sheets 1.4 and Slides 1.2 (the Drive editors,
   from their APKs since audit step 4: the app name as the doclist title, Search and Add new in the toolbar, the
   overflow, Drive's file type icons; a read-only file view), Fit 1.51 (since audit step 9 its TimelineFragment
   header: the legend, the summary message and the wheel of today's active time, then today's sessions), Newsstand 3.3
   (Read Now cards) and Wallet 8.0 (since audit step 9 the WarmWelcomeActivity a new user meets first). All content is
   offline and made up. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const APPS = ['docs', 'sheets', 'slides', 'fit', 'newsstand', 'wallet'];
  // Brand colours (toolbar, status bar) of the 2015 apps.
  const COLORS = {docs: ['#4285f4', '#3367d6'], sheets: ['#0f9d58', '#0b8043'], slides: ['#f4b400', '#f09300'], fit: ['#f0f1f2', '#757575'], newsstand: ['#3f51b5', '#303f9f'], wallet: ['#efefef', '#8f8f8f']};
  const KIND = {docs: 'doc', sheets: 'sheet', slides: 'slides'};
  const TITLE = {docs: 'Recent documents', sheets: 'Recent spreadsheets', slides: 'Recent presentations'};
  const svg = {
    menu: '<svg viewBox="0 0 24 24"><path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" fill="currentColor"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20z" fill="currentColor"/></svg>',
    search: '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" fill="currentColor"/></svg>',
    more: '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="19" r="2" fill="currentColor"/></svg>',
    doc: '<svg viewBox="0 0 24 24"><path d="M6 2h9l5 5v15H6zm8 1.5V8h4.5zM8 12h8v1.5H8zm0 3h8v1.5H8zm0 3h5v1.5H8z" fill="currentColor"/></svg>'
  };
  // Texts the stock-strings index resolves from the image's APKs (docs/data/stock-strings.json).
  const S = (app, key, t, locale) => { const row = window.StockStrings?.[app]?.[key]; return row ? AndroidStrings.pick(row, String(locale || 'en').slice(0, 2), key) : t(key); };
  /* Fit 1.51 and Wallet 8.0 keep their plurals as ICU MessageFormat ("{count, plural, =1 {1 min} other {# min}}", with
     {activity} arguments; MessageFormatter.a): a small formatter for the patterns of the image's translations. */
  function icu(pattern, args, locale) {
    let out = '', i = 0;
    const block = from => { let depth = 0, j = from; for (; j < pattern.length; j++) { if (pattern[j] === '{') depth++; else if (pattern[j] === '}' && !--depth) break; } return j; };
    while (i < pattern.length) {
      if (pattern[i] !== '{') { out += pattern[i++]; continue; }
      const end = block(i), body = pattern.slice(i + 1, end); i = end + 1;
      const m = body.match(/^\s*(\w+)\s*,\s*plural\s*,([\s\S]*)$/);
      if (!m) { out += args[body.trim()] ?? ''; continue; }
      const n = Number(args[m[1]]), cases = {}, rest = m[2];
      for (let k = 0; k < rest.length;) {
        const sel = rest.slice(k).match(/^\s*(=\d+|\w+)\s*\{/);
        if (!sel) break;
        const open = k + sel[0].length - 1;
        let depth = 0, j = open; for (; j < rest.length; j++) { if (rest[j] === '{') depth++; else if (rest[j] === '}' && !--depth) break; }
        cases[sel[1]] = rest.slice(open + 1, j); k = j + 1;
      }
      const text = cases['=' + n] ?? cases[new Intl.PluralRules(locale).select(n)] ?? cases.other ?? '';
      out += icu(text.replace(/#/g, n.toLocaleString(locale)), args, locale);
    }
    return out;
  }
  const lines = text => e(text).replace(/\n/g, '<br>');
  // StringFormatter.a: every run of digits gets the larger TextAppearanceSpan.
  const digits = html => html.replace(/\d(?:[\d.,\u00a0\u202f]*\d)?/g, '<b>$&</b>');
  /* Fit 1.51's TimelineFragment for a demo day: three sessions (newest first, as TimelineAdapter lists them) against
     the 30-minute active time goal. Legend shows each activity's minutes in a PrimaryColor circle with its white
     IconDrawable (legend_item.xml; LegendItem.Value 20 sp #212121 digits in LegendItem.Unit 16 sp #757575), the
     summary message follows the goal percentage (SummaryMessageHelper), the wheel (current_activity_view.xml: 290 dp,
     20 dp stroke, 1 dp inset, wheel_background_color under one segment per activity) holds wheel_content.xml: the
     duration in the unit size (28 sp) with 30 sp digits (Lwt.a) and the additional info 15 sp #757575 15 dp below.
     Sessions (timeline_session.xml): the 20 dp SessionDots in the activity colour on its LineDrawable at x 26 dp,
     TimelineEventTitleDuration ("9 min walking") and the start time (DateFormat.getTimeFormat). */
  const FIT_COLOR = {walking: '#ff9000', running: '#c1175a', biking: '#4bc5ab'};
  const FIT_SESSIONS = [{type: 'walking', at: [17, 30], min: 5}, {type: 'biking', at: [12, 40], min: 4}, {type: 'walking', at: [8, 5], min: 9}];
  const FIT_GOAL = 30;
  /* Since T41 the day is FitMore's (fit-more.js): the demo sessions plus the activities added on the phone, yesterday's
     under timeline_divider_yesterday, and the daily goal from Settings (active time; a steps goal has no step data
     here, so its wheel counts 0 steps; without a goal the ring is today's mix and there is no goal line). Durations
     use the _0 / _m / _h / _h_m forms of WheelContent and TimelineEventTitleDuration. */
  function fit(t, locale, data = {}, ui = {}) {
    const F = key => S('fit', key, t, locale), total = {}, ctx = {data, ui, t, locale};
    if (window.FitMore) { const page = FitMore.page(ctx); if (page) return page; }
    const day = window.FitMore ? FitMore.days(ctx, FIT_SESSIONS) : {today: FIT_SESSIONS, yesterday: [], goal: {type: 'duration', value: FIT_GOAL}};
    const color = type => window.FitMore ? FitMore.color(type) : FIT_COLOR[type];
    day.today.forEach(({type, min}) => { total[type] = (total[type] || 0) + min; });
    const types = [...['walking', 'running', 'biking'].filter(type => total[type]), ...Object.keys(total).filter(type => !FIT_COLOR[type]).sort((a, b) => total[b] - total[a] || a.localeCompare(b))];
    const active = Object.values(total).reduce((a, b) => a + b, 0), goal = day.goal, steps = goal?.type === 'steps';
    const pct = !goal ? 0 : steps ? 0 : active / goal.value * 100;
    const hm = (key, m, args = {}) => m >= 60 && m % 60 ? AndroidStrings.format(F(key + '_h_m'), Math.floor(m / 60), m % 60, args.activity ?? '') : icu(F(key + (m >= 60 ? '_h' : '_m')), {...args, count: m >= 60 ? m / 60 : m}, locale);
    const legend = types.map(type => `<i class="fit-space"></i><span class="fit-legend-item"><span class="fit-legend-icon" style="background:${color(type)}"><img src="assets/fit-ic_${type}.png" alt=""></span><span class="fit-legend-value">${digits(lines(icu(F('legend_duration_value'), {count: total[type]}, locale)))}</span></span>`).join('');
    const summary = F(pct >= 100 ? 'summary_message_goal_complete' : pct >= 70 ? 'summary_message_goal_70_to_90_percent' : pct >= 50 ? 'summary_message_goal_50_to_70_percent' : pct >= 30 ? 'summary_message_goal_30_to_50_percent' : active ? 'summary_message_no_goal_active' : 'summary_message_no_data_today');
    let start = 0;
    const full = steps ? 0 : goal ? goal.value : active;
    const arcs = full ? types.map(type => { const len = Math.min(total[type] / full * 360, 360 - start); const arc = `<circle cx="145" cy="145" r="134" pathLength="360" stroke="${color(type)}" stroke-dasharray="${len} 360" stroke-dashoffset="${-start}"/>`; start += len; return arc; }).join('') : '';
    const left = goal && !steps ? goal.value - active : 0;
    const info = !goal ? '' : steps ? icu(F('wheel_goal_steps_not_met'), {count: goal.value}, locale) : left > 0 ? hm('wheel_goal_duration_not_met', left) : left === 0 ? F('wheel_goal_duration_met') : hm('wheel_goal_duration_exceeded', -left);
    const value = steps ? icu(F('wheel_steps_value'), {count: 0}, locale) : !active ? F('wheel_duration_today_0') : active >= 60 && active % 60 ? AndroidStrings.format(F('wheel_duration_today_h_m'), Math.floor(active / 60), active % 60) : icu(F(active >= 60 ? 'wheel_duration_today_h' : 'wheel_duration_today_m'), {count: active >= 60 ? active / 60 : active}, locale);
    const time = s => s.start != null ? new Date(s.start).toLocaleTimeString(locale, {hour: 'numeric', minute: '2-digit'}) : new Date(2015, 0, 1, s.at[0], s.at[1]).toLocaleTimeString(locale, {hour: 'numeric', minute: '2-digit'});
    const row = s => `<li class="fit-session" style="--c:${color(s.type)}"><i class="fit-dot"></i><strong>${e(hm('timeline_event_title_activity', s.min, {activity: F('timeline_activity_' + s.type)}))}</strong><small>${e(time(s))}</small></li>`;
    const sessions = day.today.map(row).join('') + (day.yesterday.length ? `<li class="fit-divider">${e(F('timeline_divider_yesterday'))}</li>${day.yesterday.map(row).join('')}` : '');
    return `<div class="app-view lpx-app fit-app"><div class="fit-scroll"><div class="fit-legend"><div class="fit-legend-items">${legend}</div><button class="fit-overflow" data-action="lpx-overflow" aria-label="${e(F('overflow_menu'))}"><img src="assets/fit-ic_overflow_dark.png" alt=""></button></div><p class="fit-summary">${e(summary)}</p><div class="fit-wheel"><svg viewBox="0 0 290 290" aria-hidden="true"><circle cx="145" cy="145" r="134" stroke="#3333330d"/><g transform="rotate(-90 145 145)">${arcs}</g></svg><div class="fit-wheel-center"><p class="fit-value">${digits(lines(value))}</p><p class="fit-info">${e(info)}</p></div></div><ol class="fit-timeline">${sessions}</ol></div></div>`;
  }
  /* Wallet 8.0 on a new account: WarmWelcomeFilter starts WarmWelcomeActivity (Theme.Wallet.TranslucentStatusBar).
     warm_welcome_activity.xml's splash (img_logo_wallet_color_88dp and welcome_intro in Headline.WarmWelcomeIntro:
     18 sp #de000000, 64 dp in, on application_background #efefef) gives way to the pager of WarmWelcomeScreens:
     three warm_welcome.xml pages (the 360x640 dp hero cropped to the page, Headline.Inverted 18 sp white and
     Body.Splash.WarmWelcomeSubcopy 14 sp #b3ffffff with 8 dp extra line spacing, 48 dp in, over a #33ffffff divider)
     on the page colour, and the 48 dp bar: Skip, the PagingIndicator (8 dp dots 12 dp apart, white / #80ffffff) and
     the Continue chevron, Done on the last page (FlatButton.Inverted: 14 sp bold caps). */
  const WAL_PAGES = [['walletcard', '#fab018'], ['p2p', '#116ae8'], ['loyalty', '#1ca8f4']];
  const walletStatus = ui => { const color = ui.walPage == null ? '#efefef' : WAL_PAGES[ui.walPage][1]; return '#' + [1, 3, 5].map(i => Math.round(parseInt(color.slice(i, i + 2), 16) * .6).toString(16).padStart(2, '0')).join(''); };
  function wallet(ui, t, locale) {
    const W = key => S('wallet', key, t, locale), page = ui.walPage ?? 0, [name, color] = WAL_PAGES[page], last = page === WAL_PAGES.length - 1;
    const splash = ui.walPage == null ? `<div class="wal-splash"><img src="assets/wal8-img_logo_wallet_color_88dp.png" alt=""><h1>${e(W('welcome_intro'))}</h1></div>` : '';
    return `<div class="app-view lpx-app wal-app" style="background:${color}"><div class="wal-page"><img class="wal-hero" src="assets/wal8-img_setup_${name}_color_360x640dp.webp" alt=""><div class="wal-copy"><h2>${e(W(`welcome_${name}_heading`))}</h2><p>${lines(W(`welcome_${name}_text`))}</p></div></div><div class="wal-bar"><button class="wal-btn wal-skip" data-action="wal-finish">${e(W('skip_warm_welcome'))}</button><span class="wal-dots">${WAL_PAGES.map((_, i) => `<i${i === page ? ' class="on"' : ''}></i>`).join('')}</span>${last ? `<button class="wal-btn wal-done" data-action="wal-finish">${e(W('button_done'))}</button>` : `<button class="wal-btn wal-next" data-action="wal-next" aria-label="${e(W('button_continue'))}"><img src="assets/wal8-quantum_ic_chevron_right_white_24.png" alt=""></button>`}</div>${splash}</div>`;
  }
  const EDITOR_ICON = {doc: 'ic_type_doc', sheet: 'ic_type_sheet', slides: 'ic_type_presentation'};
  const APP_NAME = {docs: 'Docs', sheets: 'Sheets', slides: 'Slides'};
  // The editors' toolbar: menu_doclist_activity_editors' always items (Search, Add new) and the overflow.
  const editorsBar = (app, title, t, locale) => `<header class="lpx-bar" style="background:${COLORS[app][0]}"><button class="lpx-btn" data-action="emore-drawer" aria-label="${e(S('editors', 'Open navigation drawer', t, locale))}">${svg.menu}</button><h2>${e(title)}</h2><button class="lpx-btn" data-action="ed-search-open" aria-label="${e(S('editors', 'Search', t, locale))}"><img class="lpx-icon" src="assets/ed-editors_action_search.png" alt=""></button><button class="lpx-btn" data-action="ed-new" aria-label="${e(S('editors', 'Add new', t, locale))}"><img class="lpx-icon" src="assets/ed-editors_action_new.png" alt=""></button><button class="lpx-btn" data-action="lpx-overflow" aria-label="${e(t('More options'))}">${svg.more}</button></header>`;
  // A toolbar with only the actions an app's menu XML shows: nav ('drawer', 'none', or the unsupported toast), icons, overflow.
  const toolbar = (app, title, {nav = 'unsupported', icons = '', overflow = false} = {}) => `<header class="lpx-bar" style="background:${COLORS[app][0]}">${nav === 'none' ? '<i class="lpx-pad"></i>' : `<button class="lpx-btn" data-action="${nav === 'drawer' ? 'lpx-drawer' : 'lpx-unavailable'}" aria-label="Open navigation drawer">${svg.menu}</button>`}<h2>${e(title)}</h2>${icons}${overflow ? `<button class="lpx-btn" data-action="lpx-overflow" aria-label="More options">${svg.more}</button>` : ''}</header>`;
  // Newsstand 3.3's PlayDrawer (lp-play.css's lpa-* classes).
  const nsDrawer = (t, locale) => { const n = key => S('newsstand', key, t, locale); return `<div class="pa-drawer-scrim lpa-scrim" data-action="lpx-drawer"></div><nav class="lpa-drawer"><div class="lpa-profile"><img class="lpa-cover" src="assets/ns33-bg_default_profile_art.png" alt=""><img class="lpa-avatar" src="assets/mv36-ic_profile_none.png" alt=""><b>Nexus 6</b><small>nexus6.demo@gmail.com</small></div><div class="lpa-primary">${[['Read Now', 'readnow', 'lpx-drawer'], ['My Library', 'mylibrary', 'nr-section', 'My Library'], ['Bookmarks', 'bookmarks', 'nr-section', 'saved'], ['Explore', 'explore', 'lpx-unavailable']].map(([key, icon, action, id = ''], i) => `<button class="${i ? '' : 'on'}" data-action="${action}" data-id="${id}"><img src="assets/ns33-ic_drawer_${icon}${i ? '' : '_selected'}.png" alt="">${e(n(key))}</button>`).join('')}</div><hr>${[['Settings', 'nr-settings'], ['Help & Feedback', 'lpx-unavailable']].map(([key, action]) => `<button data-action="${action}">${e(n(key))}</button>`).join('')}</nav>`; };
  const bar = (app, title, {up = false} = {}) => `<header class="lpx-bar" style="background:${COLORS[app][0]}"><button class="lpx-btn" data-action="${up ? 'back' : 'lpx-menu'}" aria-label="${e(up ? 'Navigate up' : 'Open navigation drawer')}">${up ? svg.back : svg.menu}</button><h2>${e(title)}</h2><button class="lpx-btn" data-action="lpx-unavailable" aria-label="Search">${svg.search}</button><button class="lpx-btn" data-action="lpx-unavailable" aria-label="More options">${svg.more}</button></header>`;
  function render(app, {files, ui, t, locale, data={}, news}) {
    if (KIND[app]) {
      const context={files,ui,t,locale,data};
      const list=window.EditorMore?EditorMore.list(app,context):files.filter(file=>file.kind===KIND[app]);
      const open = ui.sub && files.find(file=>file.id===ui.sub&&file.kind===KIND[app]&&!file.trashed);
      if (open) return `<div class="app-view lpx-app lpx-editor">${bar(app, open.name, {up: true})}<div class="lpx-page"><article class="lpx-paper ${KIND[app]}">${KIND[app] === 'sheet' ? `<table>${String(open.text||'').split('\n').map((line, i) => `<tr><th>${i + 1}</th>${line.split(/\s+(?=\S+$)/).map(cell => `<td>${e(cell)}</td>`).join('')}</tr>`).join('')}</table>` : String(open.text||'').split('\n').map(line => `<p>${e(line)}</p>`).join('')}</article></div></div>`;
      // Search (audit step 5): drive_search_bar.xml, then the matching files under "Search: "%s"".
      const ed = key => S('editors', key, t, locale), q = String(ui.edQuery || '');
      if (ui.sub === 'search') return `<div class="app-view lpx-app"><header class="lpx-bar ed-searchbar"><button class="ed-back" data-action="back" aria-label="${e(ed('Cancel search'))}"><img src="assets/ed-ic_back_arrow_alpha.png" alt=""></button><form class="ed-sv" data-form="ed-search"><input name="query" placeholder="${e(ed('Search'))}" aria-label="${e(ed('Search'))}" autocomplete="off" spellcheck="false" enterkeyhint="search"></form></header><div class="lpx-list"></div></div>`;
      const found = ui.sub === 'results' ? list.filter(file => file.name.toLocaleLowerCase().includes(q.trim().toLocaleLowerCase())) : list;
      const rows = found.map(file => `<div class="ed-row"><button class="lpx-file" data-action="lpx-open" data-id="${e(file.id)}"><img class="lpx-type" src="assets/dr2-${EDITOR_ICON[KIND[app]]}.png" alt=""><span class="lpx-file-copy"><strong>${e(file.name)}${file.pinned?'<i class="ed-offline"></i>':''}</strong><small>${e(AndroidStrings.format(S('editors', 'Modified: %s', t, locale), window.EditorMore?EditorMore.modified(file,context):file.date))}</small></span></button><button class="ed-more" data-action="ed-item" data-id="${e(file.id)}" aria-label="${e(S('editors', 'Open the document actions menu', t, locale))}">${svg.more}</button></div>`).join('');
      if (ui.sub === 'results') return `<div class="app-view lpx-app"><header class="lpx-bar" style="background:${COLORS[app][0]}"><button class="lpx-btn" data-action="back" aria-label="${e(t('Back'))}"><img class="lpx-icon" src="assets/ed-ic_back_arrow_alpha.png" alt=""></button><h2>${e(AndroidStrings.format(ed('Search: "%s"'), q))}</h2><button class="lpx-btn" data-action="ed-search-clear" aria-label="${e(ed('Clear search'))}"><img class="lpx-icon" src="assets/ed-ic_menu_clear_alpha.png" alt=""></button><button class="lpx-btn" data-action="lpx-overflow" aria-label="${e(t('More options'))}">${svg.more}</button></header>${ui.editorRefreshing?'<div class="emore-refreshing"></div>':''}<div class="lpx-list${window.EditorMore?.prefs(data,app).grid?' ed-grid':''}">${rows || `<p class="lpx-empty">${e(ed('No Items'))}</p>`}</div></div>`;
      return `<div class="app-view lpx-app">${editorsBar(app, S('editors', APP_NAME[app], t, locale), t, locale)}${ui.editorRefreshing?'<div class="emore-refreshing"></div>':''}<div class="lpx-list${window.EditorMore?.prefs(data,app).grid?' ed-grid':''}">${rows || `<p class="lpx-empty">${e(t('No recent files'))}</p>`}</div>${window.EditorMore?.drawer(context)||''}</div>`;
    }
    if (app === 'fit') return fit(t, locale, data, ui);
    if (app === 'newsstand') {
      // The reader, search, the drawer's sections and the settings (news-reader.js) under an Up toolbar.
      const nr = news && window.NewsReader?.render({...news, bar: ({title, actions = ''}) => `<header class="lpx-bar nr-bar" style="background:${COLORS.newsstand[0]}"><button class="lpx-btn" data-action="back" aria-label="Navigate up">${svg.back}</button><h2>${e(title)}</h2>${actions}</header>`});
      if (nr) return nr;
      const stories = ['n1', 'n2', 'n3'].map(id => { const a = window.NewsReader?.ARTICLES[id] || {}; return [a.title, a.source, {n1: '#5c6bc0', n2: '#43a047', n3: '#ef6c00'}[id], id]; });
      return `<div class="app-view lpx-app">${toolbar('newsstand', S('newsstand', 'Read Now', t, locale), {nav: 'drawer', icons: `<button class="lpx-btn" data-action="nr-search" aria-label="${e(S('newsstand', 'Search', t, locale))}"><img class="lpx-icon" src="assets/ns33-abc_ic_search_api_mtrl_alpha.png" alt=""></button>`})}<div class="lpx-list lpx-cards">${stories.map(([title, source, color, id]) => `<button class="lpx-story nr-story" data-action="nr-open" data-id="${id}"><div class="lpx-story-art" style="background:${color}"></div><div class="lpx-story-copy"><small>${e(source)}</small><strong>${e(title)}</strong></div></button>`).join('')}</div>${ui.lpxDrawer ? nsDrawer(t, locale) : ''}</div>`;
    }
    if (app === 'wallet') return wallet(ui, t, locale);
    return '';
  }
  // The editors' overflow: menu_doclist_activity_editors' ifRoom and never items.
  function menu(app, t, locale, context) {
    if(KIND[app]&&window.EditorMore&&context)return EditorMore.menu(context);
    if (KIND[app]) return ['View as Grid', 'Sort by', 'Open document', 'Refresh'].map(key => ({action: 'lpx-unavailable', title: S('editors', key, t, locale)}));
    if (app === 'fit') return window.FitMore ? FitMore.menu({t, locale}) : ['Add activity', 'Add your weight', 'Settings', 'Help & feedback'].map(key => ({action: 'lpx-unavailable', title: S('fit', key, t, locale)}));
    return [];
  }
  // The document actions menu (menu_doclist_context.xml's items for a Google document) and its Rename / Remove dialogs.
  const ITEM_MENU = ['Share link', 'Send file', 'Keep on device', 'Move', 'Add to home screen', 'Rename', 'Print', 'Remove'];
  const RENAME_TITLE = {doc: 'Rename document', sheet: 'Rename spreadsheet', slides: 'Rename presentation'};
  const UNTITLED = {doc: 'Untitled document', sheet: 'Untitled spreadsheet', slides: 'Untitled presentation'};
  function edDialog(kind, {files, ui, t, locale}) {
    const file = files.find(f => f.id === ui.edFile), ed = key => S('editors', key, t, locale);
    if (!file) return '';
    if (kind === 'menu') return `<div class="menu-scrim" data-action="close-overlay"></div><div class="lpa-menu ed-itemmenu" data-no-translate>${ITEM_MENU.map(key => `<button data-action="${key === 'Rename' ? 'ed-rename' : key === 'Remove' ? 'ed-remove' : key === 'Print' ? 'ed-print' : {'Share link':'emore-link','Send file':'emore-send','Keep on device':'emore-pin','Move':'emore-move','Add to home screen':'emore-shortcut'}[key]||'lpx-unavailable'}">${e(ed(key==='Keep on device'&&file.pinned?'Remove from device':key))}</button>`).join('')}</div>`;
    const box = (title, body, ok) => `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${e(title)}" data-no-translate>${title ? `<h3>${e(title)}</h3>` : ''}${body}<div class="settings-dialog-actions"><button data-action="close-overlay">${e(ed('Cancel'))}</button>${ok}</div></div>`;
    if (kind === 'rename') return box(ed(RENAME_TITLE[file.kind] || 'Rename'), `<input class="ed-name" data-ed-name value="${e(file.name)}" autocomplete="off" spellcheck="false">`, `<button data-action="ed-rename-ok">${e(ed('OK'))}</button>`);
    if (kind === 'remove') return box('', `<p>${e(ed('Do you really want to remove this file?'))}</p>`, `<button data-action="ed-remove-ok">${e(ed('Remove button'))}</button>`);
    return '';
  }
  window.LPExtraApps = {edDialog, KIND, UNTITLED, APPS, COLORS, render, menu, icu, walletStatus, WAL_PAGES};
})();
