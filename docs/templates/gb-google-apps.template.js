/* More Google apps of the Nexus S image (GRK39F) as working 2011 screens, from their APKs' layouts, drawables and texts:
   - News & Weather 1.3.04 (GenieWidget.apk): the 41 dip tab row (tab_layout.xml, 18 sp, tab_weather_* 9-patches) with
     Weather and the news topics; weather_current_view.xml on weather_background_grey / bg_weather_panel_app (30 sp city,
     90 dp condition picture, 90 sp temperature, 21 sp high / low, humidity and wind, the four-day forecast) and
     news_item_layout.xml rows on #1a1a1a (80 dip, 16 sp bold title, 14 sp snippet, 70 dip picture); a story opens on
     white (news_content_layout.xml). Its 4 x 1 miniwidget is in gb-widgets.js.
   - Books 1.2.2 (BooksPhone.apk): the 45 dip home_actionbar with Get eBooks and search, the library grid on #eaf0fb
     (grid_item_volume.xml: 72 x 100 dip covers, 14 sp title, 11 sp author), and the reader with its 60 dip
     ab_material_reader_day bar, flowing text and the page scrubber.
   - Earth 2.0.1 (GoogleEarth.apk): the splash, then the globe under the brand with the north button, Search and Layers.
   - Voice Search 2.1.3 (VoiceSearch.apk): recognition_dialog.xml (319 x 265 dip on vs_dialog_red: "Speak now", the
     microphone with its level meter, the Google watermark, Help and Cancel), "No speech heard" with Speak again, and
     the Voice Actions help ("Try saying...") whose examples run the matching app.
   Content (stories, weather, books) is offline: the books are public-domain openings, the news is made up. */
(() => {
  'use strict';
  const {e} = GBApps;
  const STRINGS = __STRINGS__({
    "News & Weather": "app_name", "Weather": "weather_tab_label", "Refresh": "menu_item_refresh", "Share story": "menu_item_share",
    "Settings": "menu_item_setting", "Humidity: %s%%": "weather_humidity", "Wind: %1$s %2$s": "weather_wind", "km/h": "weather_kph", "mph": "weather_mph",
    "Loading...": "loading", "No weather information": "weather_unavailable", "News": "widget_news",
    "Books": "BooksPhone:app_name", "Get eBooks": "BooksPhone:button_shop", "My eBooks": "BooksPhone:menu_myebooks", "Contents": "BooksPhone:menu_toc",
    "Sort order": "BooksPhone:menu_sort", "Manage eBooks": "BooksPhone:menu_view_downloads", "Help": "BooksPhone:menu_help", "page %1$s of %2$s": "BooksPhone:reading_scrub_callout_int_page",
    "Search results for \"%1$s\"": "BooksPhone:search_results_pending_title", "Your book will open in a moment…": "BooksPhone:loading_book", "Title": "BooksPhone:display_sort_title",
    "Author": "BooksPhone:display_sort_author", "Recently read": "BooksPhone:display_sort_date_read", "Sort by:": "BooksPhone:sort_dialog_title", "About": "BooksPhone:menu_reader_about",
    "Keep": "BooksPhone:remove_book_dialog_cancel", "Remove book": "BooksPhone:remove_book_dialog_confirm", "Remove book message": "BooksPhone:remove_book_dialog_message",
    "Pin toast": "BooksPhone:pin_toast", "Unpin toast": "BooksPhone:unpin_toast",
    "Day": "BooksPhone:pref_themes_day", "Night": "BooksPhone:pref_themes_night", "Text size": "BooksPhone:text_size",
    "Earth": "GoogleEarth:app_name", "Layers": "GoogleEarth:menu_layer", "My Location": "GoogleEarth:my_location", "Search": "GoogleEarth:search_id",
    "Example: Pizza": "GoogleEarth:search_hint", "Clear Search Results": "GoogleEarth:menu_clear", "Not Found: %s": "GoogleEarth:search_not_found", "Fly to": "GoogleEarth:menu_flyto",
    "Voice Search": "VoiceSearch:appName", "Speak now": "VoiceSearch:speak_now", "Starting up": "VoiceSearch:initializing", "No speech heard": "VoiceSearch:speech_timeout",
    "Speak again": "VoiceSearch:tryagain", "Cancel": "VoiceSearch:cancel", "Voice Help": "VoiceSearch:help", "Try saying...": "VoiceSearch:help_header",
    "Touch Help to learn what you can say": "VoiceSearch:help_hint", "or try any Google search by voice": "VoiceSearch:or_try_search", "Voice Actions": "VoiceSearch:voice_actions",
    "News isn't available right now.": "news_unavailable", "Updating news topics…": "news_updating", "Weather settings": "pref_screen_weather", "Set location, units": "pref_screen_weather_desc", "News settings": "pref_screen_news", "Choose topics, manage downloads": "pref_screen_news_desc", "Refresh settings": "pref_screen_refresh", "Set up auto-refresh, refresh interval": "pref_screen_refresh_desc", "App version": "pref_screen_version", "Use my location": "pref_use_my_location", "Automatically determine location": "pref_use_my_location_desc", "Set location": "pref_set_location", "Specify your location": "pref_set_location_desc", "Use metric": "pref_temperature_unit", "Toggle metric/imperial units": "pref_temperature_unit_desc", "Choose news topics": "pref_screen_select_topics", "Manage news topics": "pref_screen_select_topics_desc", "Prefetch articles": "pref_prefetch_pages", "Prefetch articles for faster access": "pref_prefetch_pages_desc", "Prefetch images": "pref_prefetch_images", "Prefetch images for faster access": "pref_prefetch_images_desc", "News terms of service": "legal_activity_title", "Mobile privacy policy": "pref_screen_privacy", "Custom topics": "pref_screen_custom_topics", "Custom topic": "pref_custom_topic_dialog_title", "Add a custom news topic here": "pref_custom_topic_summary", "News topics": "pref_screen_standard_topics", "Auto-refresh": "pref_auto_refresh", "Auto-refresh summary": "pref_auto_refresh_desc", "Refresh interval": "dlg_refresh_interval", "Refresh status": "pref_screen_refreshStatus", "Last refresh %s": "refresh_status1", "Last refresh %1$s \nNext refresh %2$s": "refresh_status2", "Type a city or postal code:": "enterlocation", "Type a custom topic:": "pref_custom_topic_dialog_message", "Half an hour": "@array/array_refresh_interval_descs:0", "1 hour": "@array/array_refresh_interval_descs:1", "3 hours": "@array/array_refresh_interval_descs:2", "6 hours": "@array/array_refresh_interval_descs:3", "12 hours": "@array/array_refresh_interval_descs:4", "One day": "@array/array_refresh_interval_descs:5", "Typeface": "BooksPhone:typeface", "Line space": "BooksPhone:line_height", "Justification": "BooksPhone:justification", "Themes": "BooksPhone:themes", "Brightness": "BooksPhone:brightness", "Use system setting": "BooksPhone:pref_brightness_match"
  });
  const T = GBApps.texts(STRINGS);

  // ---------- News & Weather ----------
  const NA = name => `assets/nw-${name}.png`;
  const TOPICS = ['Top Stories', 'World', 'Business', 'Technology', 'Entertainment', 'Sports', 'Health'];
  const STORIES = {
    'Top Stories': [['City council approves new riverside park', 'The plan turns the old freight yard into gardens, a playground and a cycle path by next summer.', 'Metro Daily'], ['Heat wave expected to ease by the weekend', 'Forecasters say cooler air from the coast will bring temperatures back to normal.', 'Weather Desk'], ['Library opens its doors around the clock', 'The central branch tries 24-hour opening for students during exam season.', 'Campus News']],
    World: [['Leaders meet to discuss shipping lanes', 'Talks focus on safer routes and shared rescue services in busy waters.', 'World Wire'], ['Ancient city found under farmland', 'Archaeologists mapped streets and a market square with ground radar.', 'Science Today']],
    Business: [['Small shops embrace mobile payments', 'More stores now accept payments with a tap of a phone, owners say.', 'Business Line'], ['Coffee prices climb after a dry season', 'Roasters expect prices to stay high for the rest of the year.', 'Market Watch']],
    Technology: [['Phones with NFC chips arrive in stores', 'Tags in posters and shop windows can now open web pages with a tap.', 'Tech Report'], ['Video calls go mobile', 'Front-facing cameras make face-to-face chats possible on the go.', 'Gadget Weekly'], ['Tablets expected to outsell netbooks', 'Analysts point to longer battery life and instant-on screens.', 'Tech Report']],
    Entertainment: [['Summer blockbuster breaks opening records', 'The 3D adventure topped the charts in its first weekend.', 'Screen Beat'], ['Local band signs with a major label', 'Their debut album is due in the autumn.', 'Music Scene']],
    Sports: [['Home team clinches the title in extra time', 'A late header settled the final in front of a sold-out crowd.', 'Sports Desk'], ['Marathon sets new course record', 'The winner finished nearly a minute under the old mark.', 'Run Daily']],
    Health: [['Study links walking to better sleep', 'Thirty minutes a day made a measurable difference, researchers found.', 'Health Notes'], ['Clinics extend evening hours', 'Patients can now book appointments until 9 pm on weekdays.', 'City Health']]
  };
  // A summer week for the made-up city: [condition, icon, high, low] in °F; today first.
  const FORECAST = [['Partly Cloudy', 'partly_cloudy', 78, 59], ['Sunny', 'sunny', 82, 61], ['Chance of Rain', 'chance_of_rain', 74, 58], ['Cloudy', 'cloudy', 71, 57]];
  // Use metric (news-prefs.js) follows the language until it is set.
  let newsData = {};
  const metric = lang => window.NewsPrefs ? NewsPrefs.metric(newsData, lang) : lang !== 'en';
  const deg = (lang, f) => metric(lang) ? `${Math.round((f - 32) * 5 / 9)}°` : `${f}°`;
  function news(ctx) {
    const {ui, lang} = ctx, NP = window.NewsPrefs, story = ui.nwStory;
    newsData = ctx.data;
    // Preferences (news-prefs.js) under the window's title bar.
    if (ui.nwSub === 'settings') return NP.render({data: ctx.data, ui, lang, locale: ctx.locale, N: key => T(lang, key), t: ctx.t, standard: TOPICS, topic: name => ctx.t(name), version: '1.3.04', bar: title => `<div class="gb-titlebar">${e(title)}</div>`});
    const tabs0 = ['Weather', ...NP.topics(ctx.data, TOPICS)], tab = tabs0.includes(ui.nwTab ?? 'Weather') ? (ui.nwTab ?? 'Weather') : 'Weather';
    if (story) {
      const [title, snippet, source] = STORIES[tab]?.[+story] || [];
      return `<div class="app-view nw nw-article" data-no-translate><div class="nw-scroll"><h2>${e(title)}</h2><small>${e(source)}</small><p>${e(snippet)}</p><p>${e(snippet.replace(/\.$/, ''))} — a fuller account follows when the phone is online.</p></div></div>`;
    }
    const tabs = tabs0.map(t => `<button class="nw-tab${t === tab ? ' on' : ''}" data-action="nw-tab" data-id="${e(t)}">${e(t === 'Weather' ? T(lang, 'Weather') : TOPICS.includes(t) ? ctx.t(t) : t)}</button>`).join('');
    let body;
    if (tab === 'Weather') {
      const [cond, icon, hi, lo] = FORECAST[0], days = [...Array(4)].map((_, i) => new Date(ctx.now.getTime() + i * 864e5).toLocaleDateString(ctx.locale, {weekday: 'short'}));
      body = `<div class="nw-weather"><div class="nw-panel"><div class="nw-city"><span>${e(NP.city(ctx.data, 'Mountain View, CA'))}</span><img src="${NA('ic_weather_info')}" alt=""></div><i class="nw-div"></i><div class="nw-now"><img class="nw-cond" src="${NA(`ic_weather_${icon}_xl`)}" alt=""><span class="nw-temp">${deg(lang, 72)}</span><img class="nw-twc" src="${NA('ic_weather_weather_channel')}" alt=""></div><div class="nw-detail"><b>${deg(lang, hi)}</b><b class="lo">${deg(lang, lo)}</b><span>${e(ctx.t(cond))}</span><small>${e(AndroidStrings.format(T(lang, 'Humidity: %s%%'), 58))}</small><small>${e(AndroidStrings.format(T(lang, 'Wind: %1$s %2$s'), metric(lang) ? '13' : '8', T(lang, metric(lang) ? 'km/h' : 'mph')))}</small></div><i class="nw-div"></i><div class="nw-days">${FORECAST.map(([c, ic, h, l], i) => `<span><b>${e(days[i])}</b><img src="${NA(`ic_weather_${ic}_s`)}" alt="${e(ctx.t(c))}"><i>${deg(lang, h)}</i><i class="lo">${deg(lang, l)}</i></span>`).join('')}</div></div></div>`;
    } else body = !STORIES[tab] ? `<p class="nw-unavailable">${e(T(lang, "News isn't available right now."))}</p>` : `<div class="nw-list">${STORIES[tab].map(([title, snippet, source], i) => `<button class="nw-item" data-action="nw-story" data-id="${i}"><span><b>${e(title)}</b><small>${e(snippet)}</small></span>${i === 0 ? `<i class="nw-pic" style="--h:${(title.length * 37) % 360}"></i>` : ''}</button>`).join('')}</div>`;
    return `<div class="app-view nw" data-no-translate><div class="nw-tabs"><div class="nw-tabrow">${tabs}</div></div><div class="nw-scroll">${body}</div></div>`;
  }

  // ---------- Books ----------
  const BA = name => `assets/bk-${name}.png`;
  // Public-domain openings (Carroll 1865, Austen 1813, Dumas 1844 in the 1846 English translation, Doyle 1892).
  const BOOKS = [
    {id: 'b1', title: 'Alice’s Adventures in Wonderland', author: 'Lewis Carroll', colors: ['#2f6f9f', '#f2c94c'], pages: ['CHAPTER I.\nDown the Rabbit-Hole', 'Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, “and what is the use of a book,” thought Alice “without pictures or conversations?”', 'So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.', 'There was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the Rabbit say to itself, “Oh dear! Oh dear! I shall be late!”',
      'CHAPTER II.\nThe Pool of Tears',
      '“Curiouser and curiouser!” cried Alice (she was so much surprised, that for the moment she quite forgot how to speak good English); “now I’m opening out like the largest telescope that ever was! Good-bye, feet!”',
      'CHAPTER III.\nA Caucus-Race and a Long Tale',
      'They were indeed a queer-looking party that assembled on the bank—the birds with draggled feathers, the animals with their fur clinging close to them, and all dripping wet, cross, and uncomfortable.']},
    {id: 'b2', title: 'Pride and Prejudice', author: 'Jane Austen', colors: ['#7b2d26', '#e9d8a6'], pages: ['Chapter 1', 'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.', 'However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.', '“My dear Mr. Bennet,” said his lady to him one day, “have you heard that Netherfield Park is let at last?”\n\nMr. Bennet replied that he had not.',
      'Chapter 2',
      'Mr. Bennet was among the earliest of those who waited on Mr. Bingley. He had always intended to visit him, though to the last always assuring his wife that he should not go; and till the evening after the visit was paid she had no knowledge of it.']},
    {id: 'b3', title: 'The Three Musketeers', author: 'Alexandre Dumas', colors: ['#1b4332', '#d8b365'], pages: ['1. The Three Presents of D’Artagnan the Elder', 'On the first Monday of the month of April, 1625, the market town of Meung, in which the author of Romance of the Rose was born, appeared to be in as perfect a state of revolution as if the Huguenots had just made a second La Rochelle of it.', 'Many citizens, seeing the women flying toward the High Street, leaving their children crying at the open doors, hastened to don the cuirass, and supporting their somewhat uncertain courage with a musket or a partisan, directed their steps toward the hostelry of the Jolly Miller.',
      '2. The Antechamber of M. de Tréville',
      'M. de Troisville, as his family was still called in Gascony, or M. de Tréville, as he has ended by styling himself in Paris, had really commenced life as d’Artagnan now did; that is to say, without a sou in his pocket, but with a fund of audacity, shrewdness, and intelligence.']},
    {id: 'b4', title: 'The Adventures of Sherlock Holmes', author: 'Arthur Conan Doyle', colors: ['#3d3d3d', '#c9ada7'], pages: ['I. A Scandal in Bohemia', 'To Sherlock Holmes she is always the woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex.', 'It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind.',
      'II. The Red-Headed League',
      'I had called upon my friend, Mr. Sherlock Holmes, one day in the autumn of last year and found him in deep conversation with a very stout, florid-faced, elderly gentleman with fiery red hair.']}
  ];
  // Each chapter opens on its heading page; the reader's Contents lists them (ContentsView.ChaptersAdapter).
  BOOKS.forEach(book => { book.starts = book.pages.map((page, i) => /^(CHAPTER [IVX]+\.|Chapter \d+|\d+\. |[IVX]+\. )/.test(page) ? i : -1).filter(i => i >= 0); });
  const cover = b => `<span class="bk-cover" style="--a:${b.colors[0]};--b:${b.colors[1]}"><b>${e(b.title)}</b><small>${e(b.author)}</small></span>`;
  // LocalPreferences.applyMissingDefaults: themes 0 (Day), typeface serif, textSize 0, lineHeight 1, justification left,
  // brightness -1 (the system's). getFontSize / getLineHeight map them to the hdpi text_size_* (18 / 22 / 32 pt) and
  // height_* (1.2 / 1.6 / 2) strings that reader.js applies; style.css's night mode is #fff on #000.
  const BOOK_PREFS = {themes: '0', typeface: 'serif', textSize: '0', lineHeight: '1', justification: 'left', brightness: -1};
  const bookPrefs = data => ({...BOOK_PREFS, ...(data.booksNight ? {themes: '1'} : {}), ...(data.booksPrefs || {})});
  const TEXT_PT = {0: 18, 1: 22, 2: 32}, LINE_HEIGHT = {0: 1.2, 1: 1.6, 2: 2};
  // typeface_custom / typeface_custom_values (the APK carries Vollkorn and Sorts Mill Goudy).
  const TYPEFACES = [['Droid Sans', 'sans'], ['Droid Serif', 'serif'], ['Vollkorn', 'Vollkorn'], ['Sorts Mill Goudy', 'OFLGoudyStMTT']];
  const FACE_CSS = {sans: "'Droid Sans',Arial,sans-serif", serif: "'Droid Serif',Georgia,serif", Vollkorn: "'BK Vollkorn',serif", OFLGoudyStMTT: "'BK Goudy',serif"};
  // 1 pt = 4/3 CSS px, and the reader's CSS px is a dip.
  const textStyle = pr => `font-size:calc(${((TEXT_PT[pr.textSize] || 18) * 4 / 3).toFixed(3)} * var(--dp));line-height:${LINE_HEIGHT[pr.lineHeight] || 1.6};font-family:${FACE_CSS[pr.typeface] || FACE_CSS.serif};text-align:${pr.justification === 'justify' ? 'justify' : 'left'}`;
  const pageHtml = (book, page) => e(book.pages[page]).replace(/\n/g, '<br>');
  // ReadingPreferenceActivity (Theme.Books.White, no title): the 100 dip TextPreview of the page being read, then
  // preferences.xml's rows between list_view_rule dividers: Text size, Typeface, Line space, Justification (the
  // InlineRadioGroupPreference buttons on btn_default_dropdown / btn_selected_), Themes and BrightnessEmbedded.
  function bookSettings(ctx, book, page, dim) {
    const {lang, data} = ctx, pr = bookPrefs(data), t = k => T(lang, k);
    const radios = (key, options) => `<div class="bk-radios">${options.map(([value, icon, label]) => `<button class="${String(pr[key]) === value ? 'on' : ''}${label ? ' bk-theme-radio' : ''}" data-action="bk-pref" data-id="${key}:${value}" aria-pressed="${String(pr[key]) === value}" aria-label="${e(label || value)}"><img src="${BA(`${icon}_${String(pr[key]) === value ? 'selected' : 'default'}`)}" alt="">${label ? `<span>${e(label)}</span>` : ''}</button>`).join('')}</div>`;
    const row = (title, body) => `<div class="bk-pref"><b>${e(t(title))}</b>${body}</div><i class="bk-rule"></i>`;
    const face = (TYPEFACES.find(([, v]) => v === pr.typeface) || TYPEFACES[1])[0], match = pr.brightness < 0;
    const bright = `<div class="bk-pref bk-bright"><div class="bk-bright-head"><b>${e(t('Brightness'))}</b><label><span>${e(t('Use system setting'))}</span><input type="checkbox" data-action="bk-pref-match"${match ? ' checked' : ''}></label></div><div class="bk-bright-bar"><span>10%</span><input type="range" min="10" max="100" step="5" value="${match ? 100 : pr.brightness}" data-bk-bright aria-label="${e(t('Brightness'))}"${match ? ' disabled' : ''}><span>100%</span></div></div>`;
    return `<div class="app-view bk bk-prefs" style="--bk-dim:${dim}" data-no-translate><div class="bk-preview${pr.themes === '1' ? ' night' : ''}"><div class="bk-text" style="${textStyle(pr)}">${pageHtml(book, page)}</div></div><i class="bk-rule"></i><div class="bk-prefs-list"><i class="bk-rule"></i>${row('Text size', radios('textSize', [['0', 'ic_text_small'], ['1', 'ic_text_medium'], ['2', 'ic_text_large']]))}<button class="bk-pref bk-face" data-action="bk-typeface"><b>${e(t('Typeface'))}</b><span>${e(face)}</span><img src="${BA('expander_ic_minimized')}" alt=""></button><i class="bk-rule"></i>${row('Line space', radios('lineHeight', [['0', 'ic_line_height_1'], ['1', 'ic_line_height_1_5'], ['2', 'ic_line_height_2']]))}${row('Justification', radios('justification', [['left', 'ic_left_justify'], ['justify', 'ic_full_justify']]))}${row('Themes', radios('themes', [['0', 'ic_day', T(lang, 'Day')], ['1', 'ic_night', T(lang, 'Night')]]))}${bright}</div><div class="bk-dim"></div></div>`;
  }
  // The reader's TabHost (reader_tabs.xml) with reader_tab_chapters.xml: the ab_material_reader title over the
  // list_item_chapter.xml rows (10 dip sides, 14 sp, the start page on the right) between list_view_rule_day lines.
  function bookChapters(book, page) {
    const current = book.starts.filter(start => start <= page).length - 1;
    return `<div class="bk-chapters"><div class="bk-ch-title"><b>${e(book.title)}</b><small>${e(book.author)}</small></div><div class="bk-ch-list">${book.starts.map((start, n) => `<button class="${n === current ? 'current' : ''}" data-action="bk-goto" data-id="${start}"><span>${e(book.pages[start].replace(/\n/g, ' '))}</span><em>${start + 1}</em></button>`).join('')}</div></div>`;
  }
  /* Manage eBooks (VolumesListActivity.setDownloadsVisible: activity_volumes_content.xml's downloads_list): a
     downloads_item_volume.xml row per book — title, author, the trash button (Remove "…" from the My eBooks shelf?,
     Keep / Remove) and pin_or_buy_button (pin_unpinned / pin_pinned, with pin_toast / unpin_toast). */
  function manage(ctx, list) {
    const pinned = ctx.data.booksPinned || {};
    return `<div class="bk-downloads">${list.map(b => `<div class="bk-dl-row"><span><b>${e(b.title)}</b><small>${e(b.author)}</small></span><i></i><button data-action="bk-remove" data-id="${b.id}" aria-label="${e(T(ctx.lang, 'Remove book'))}"><img src="${BA('trash_default')}" alt=""></button><i></i><button data-action="bk-pin" data-id="${b.id}" aria-pressed="${!!pinned[b.id]}" aria-label="${e(T(ctx.lang, 'Pin toast'))}"><img src="${BA(pinned[b.id] ? 'pin_pinned_default' : 'pin_unpinned_default')}" alt=""></button></div>`).join('')}</div>`;
  }
  function books(ctx) {
    const {ui, lang, data} = ctx, reading = BOOKS.find(b => b.id === ui.bkRead);
    if (reading) {
      const page = Math.min(reading.pages.length - 1, (data.booksPages || {})[reading.id] || 0), pr = bookPrefs(data), night = pr.themes === '1', dim = pr.brightness < 0 ? 0 : ((100 - pr.brightness) / 100 * .7).toFixed(3);
      if (ui.bkPrefs) return bookSettings(ctx, reading, page, dim);
      return `<div class="app-view bk bk-reader${night ? ' night' : ''}" style="--bk-dim:${dim}" data-no-translate><div class="bk-rbar"><button class="bk-home" data-action="bk-library" aria-label="${e(T(lang, 'My eBooks'))}"><img src="${BA('ic_myebooks_default')}" alt=""></button><span class="bk-rtitle"><b>${e(reading.title)}</b><small>${e(reading.author)}</small></span><button data-action="bk-toc" aria-label="${e(T(lang, 'Contents'))}"><img src="${BA('ic_table_of_contents_default')}" alt=""></button><button data-action="bk-settings" aria-label="${e(T(lang, 'Settings'))}"><img src="${BA('ic_reader_settings_default')}" alt=""></button></div>${ui.bkToc ? bookChapters(reading, page) : `<div class="bk-page"><button class="bk-turn prev" data-action="bk-page" data-id="-1" aria-label="‹"></button><div class="bk-text" style="${textStyle(pr)}">${pageHtml(reading, page)}</div><button class="bk-turn next" data-action="bk-page" data-id="1" aria-label="›"></button></div><div class="bk-scrub"><i style="--p:${reading.pages.length > 1 ? page / (reading.pages.length - 1) : 0}"></i><span>${e(AndroidStrings.format(T(lang, 'page %1$s of %2$s'), page + 1, reading.pages.length))}</span></div>`}<div class="bk-dim"></div></div>`;
    }
    const sort = data.booksSort || 'Recently read', last = data.booksLast || {}, removed = data.booksRemoved || [];
    const list = BOOKS.filter(b => !removed.includes(b.id)).sort((a, b) => sort === 'Title' ? a.title.localeCompare(b.title) : sort === 'Author' ? a.author.split(' ').pop().localeCompare(b.author.split(' ').pop()) : (last[b.id] || 0) - (last[a.id] || 0));
    return `<div class="app-view bk" data-no-translate><div class="bk-bar"><span class="bk-logo">Google <b>eBooks</b></span><button class="bk-get" data-action="bk-get" aria-label="${e(T(lang, 'Get eBooks'))}"><span>${e(T(lang, 'Get eBooks'))}</span></button><button class="bk-search" data-action="bk-get" aria-label="Search"><img src="${BA('ic_home_search_default')}" alt=""></button></div><div class="bk-scroll">${ui.bkDownloads ? manage(ctx, list) : `<div class="bk-grid">${list.map(b => `<button class="bk-vol" data-action="bk-open" data-id="${b.id}">${cover(b)}<b>${e(b.title)}</b><small>${e(b.author)}</small></button>`).join('')}</div>`}</div></div>`;
  }

  // ---------- Earth ----------
  const EA = name => `assets/ea-${name}.png`;
  // Very rough continents as [lon, lat] rings, filled onto an equirectangular texture the globe samples.
  const LAND = [
    [[-168, 66], [-140, 70], [-95, 72], [-75, 62], [-60, 55], [-55, 47], [-70, 43], [-76, 35], [-81, 25], [-97, 26], [-105, 20], [-92, 16], [-83, 9], [-80, 8], [-87, 14], [-106, 24], [-117, 32], [-124, 40], [-124, 48], [-135, 57], [-150, 60], [-165, 60]],
    [[-80, 9], [-72, 12], [-60, 10], [-50, 0], [-35, -5], [-38, -14], [-48, -26], [-57, -35], [-65, -42], [-68, -55], [-73, -50], [-73, -38], [-71, -18], [-81, -5], [-79, 2]],
    [[-10, 36], [-9, 43], [-2, 48], [3, 51], [9, 54], [12, 56], [5, 59], [10, 63], [20, 70], [30, 70], [40, 67], [60, 70], [80, 73], [110, 76], [140, 72], [170, 70], [180, 65], [160, 60], [140, 52], [130, 43], [121, 31], [120, 22], [109, 20], [105, 10], [100, 14], [98, 8], [92, 22], [80, 15], [77, 8], [72, 20], [66, 25], [57, 25], [52, 30], [48, 30], [44, 13], [35, 28], [34, 32], [28, 36], [26, 40], [20, 40], [15, 38], [12, 44], [5, 43]],
    [[-17, 15], [-16, 25], [-6, 35], [10, 37], [20, 32], [32, 31], [35, 22], [43, 12], [51, 11], [42, -2], [40, -15], [35, -24], [27, -34], [18, -34], [12, -18], [13, -5], [9, 4], [-8, 5], [-15, 10]],
    [[114, -22], [122, -18], [131, -12], [137, -12], [142, -11], [146, -19], [153, -25], [151, -34], [145, -38], [138, -35], [130, -32], [115, -34], [114, -26]],
    [[-50, 60], [-30, 60], [-20, 70], [-25, 80], [-45, 83], [-65, 78], [-55, 68]],
    [[-180, -70], [-120, -72], [-60, -64], [0, -70], [60, -67], [120, -66], [180, -70], [180, -90], [-180, -90]]
  ];
  let earthTexture = null;
  function texture() {
    if (earthTexture) return earthTexture;
    const c = document.createElement('canvas'); c.width = 512; c.height = 256;
    const g = c.getContext('2d');
    const sea = g.createLinearGradient(0, 0, 0, 256); sea.addColorStop(0, '#0d2a52'); sea.addColorStop(.5, '#14427e'); sea.addColorStop(1, '#0d2a52');
    g.fillStyle = sea; g.fillRect(0, 0, 512, 256);
    for (const ring of LAND) {
      g.beginPath(); ring.forEach(([lon, lat], i) => { const x = (lon + 180) / 360 * 512, y = (90 - lat) / 180 * 256; i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath();
      const land = g.createLinearGradient(0, 0, 0, 256); land.addColorStop(0, '#e9eef0'); land.addColorStop(.14, '#9aa77a'); land.addColorStop(.24, '#4f6e34'); land.addColorStop(.36, '#6f7a3e'); land.addColorStop(.42, '#b49a62'); land.addColorStop(.5, '#3d6a2a'); land.addColorStop(.58, '#a58c58'); land.addColorStop(.7, '#5d7838'); land.addColorStop(.86, '#c9d3d2'); land.addColorStop(1, '#f2f6f7');
      g.fillStyle = land; g.fill();
    }
    // Speckled relief and thin cloud streaks.
    for (let i = 0; i < 900; i++) { const x = (i * 131) % 512, y = (i * 71 + (i >> 3)) % 256; g.fillStyle = i % 3 ? '#00000014' : '#ffffff12'; g.fillRect(x, y, 3, 2); }
    g.fillStyle = '#ffffff30';
    for (let i = 0; i < 40; i++) { const x = (i * 97) % 512, y = 40 + (i * 53) % 180; g.beginPath(); g.ellipse(x, y, 9 + i % 9, 1.5 + i % 2, (i % 5 - 2) / 10, 0, Math.PI * 2); g.fill(); }
    earthTexture = g.getImageData(0, 0, 512, 256);
    return earthTexture;
  }
  function drawGlobe(canvas, lon0, lat0) {
    const w = canvas.width = canvas.clientWidth, h = canvas.height = canvas.clientHeight; if (!w || !h) return;
    const g = canvas.getContext('2d'), r = Math.min(w, h) * .4, cx = w / 2, cy = h * .52, tex = texture();
    const out = g.createImageData(Math.ceil(r * 2), Math.ceil(r * 2)), size = out.width;
    const sl = Math.sin(lat0 * Math.PI / 180), cl = Math.cos(lat0 * Math.PI / 180);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const nx = (x - r) / r, ny = (r - y) / r, d = nx * nx + ny * ny; if (d > 1) continue;
      const nz = Math.sqrt(1 - d), lat = Math.asin(ny * cl + nz * sl), lon = lon0 * Math.PI / 180 + Math.atan2(nx, nz * cl - ny * sl);
      const tx = ((Math.floor((lon / Math.PI + 1) / 2 * 512) % 512) + 512) % 512, ty = Math.min(255, Math.max(0, Math.floor((.5 - lat / Math.PI) * 256)));
      const i = (ty * 512 + tx) * 4, o = (y * size + x) * 4, light = .35 + .65 * Math.max(0, nz * .8 + nx * -.3 + ny * .25);
      out.data[o] = tex.data[i] * light; out.data[o + 1] = tex.data[i + 1] * light; out.data[o + 2] = tex.data[i + 2] * light; out.data[o + 3] = 255;
    }
    g.clearRect(0, 0, w, h);
    const glow = g.createRadialGradient(cx, cy, r * .95, cx, cy, r * 1.12); glow.addColorStop(0, '#6fb4ff88'); glow.addColorStop(1, '#6fb4ff00');
    g.fillStyle = glow; g.beginPath(); g.arc(cx, cy, r * 1.12, 0, Math.PI * 2); g.fill();
    // putImageData would overwrite the glow under the sphere's square, so the sphere is composited from its own canvas.
    const sphere = drawGlobe.sphere ||= document.createElement('canvas'); sphere.width = size; sphere.height = size;
    sphere.getContext('2d').putImageData(out, 0, 0);
    g.drawImage(sphere, Math.round(cx - r), Math.round(cy - r));
  }
  function earth(ctx) {
    const {ui, lang} = ctx;
    if (ui.eaSplash) return `<div class="app-view ea ea-splash" data-no-translate><img src="${EA('splash')}" alt=""></div>`;
    const search = ui.eaSearching ? `<form class="ea-search" data-form="ea-search"><input name="q" placeholder="${e(T(lang, 'Example: Pizza'))}" aria-label="${e(T(lang, 'Search'))}" autocomplete="off"></form>` : '';
    return `<div class="app-view ea" data-no-translate><canvas class="ea-globe"></canvas><img class="ea-brand" src="${EA('brand')}" alt="Google earth"><button class="ea-north" data-action="ea-north" aria-label="N"><img src="${EA('north_button')}" alt=""></button>${ui.eaPlace ? `<div class="ea-label">${e(ui.eaPlace)}</div>` : ''}${search}</div>`;
  }
  const PLACES = {pizza: [-122.08, 37.39], 'mountain view': [-122.08, 37.39], london: [-.12, 51.5], paris: [2.35, 48.85], budapest: [19.04, 47.5], tokyo: [139.7, 35.7], 'new york': [-74, 40.7], sydney: [151.2, -33.9], 'rio de janeiro': [-43.2, -22.9], cairo: [31.2, 30], berlin: [13.4, 52.5], madrid: [-3.7, 40.4]};

  // ---------- Voice Search ----------
  const VA = name => `assets/vs-${name}.png`;
  // Voice Actions per recogniser locale (VoiceSearch.apk <locale>_action_* and <locale>_hint_*); Hungarian had none.
  const ACTIONS = {
    en: [['send_sms', 'Send text', 'send text to john smith', 'sms'], ['navigate_to', 'Navigate to', "navigate to mike's bikes", 'navigate'], ['call_contact', 'Call', 'call john smith at home', 'dial'], ['send_email', 'Send email', 'send email to jane smith', 'email'], ['map_of', 'Map of', 'map of gas stations', 'map'], ['directions_to', 'Directions to', 'directions to 123 main st', 'directions'], ['listen_to', 'Listen to', 'listen to beethoven', 'listen'], ['go_to', 'Go to', 'go to wikipedia', 'website'], ['note_to_self', 'Note to self', 'note to self do the laundry', 'note'], ['set_alarm', 'Set alarm', 'set alarm for 8:30 am', 'alarm']],
    de: [['send_sms', 'SMS senden', 'send text to john smith', 'sms'], ['navigate_to', 'Fahrtroute', 'fahrtroute zum brandenburg tor', 'navigate'], ['call_contact', 'Anrufen', 'rufe michael schuster zu hause an', 'dial'], ['send_email', 'E-Mail senden', 'e-mail senden an michael wagner', 'email'], ['map_of', 'Karte', 'karte von tankstellen in heidelberg', 'map'], ['directions_to', 'Weg', 'weg zum eiffelturm', 'directions'], ['listen_to', 'Anhören', 'anhören beethoven', 'listen'], ['go_to', 'Besuchen Sie', 'besuchen sie wikipedia', 'website'], ['note_to_self', 'Persönliche Notiz', 'persönliche notiz wecker einstellen', 'note'], ['set_alarm', 'Wecker einstellen', 'wecker einstellen auf 07:00 uhr', 'alarm']],
    fr: [['send_sms', 'Envoyer un message texte', 'envoyer un message texte à claire richard', 'sms'], ['navigate_to', 'Direction', 'direction la tour eiffel', 'navigate'], ['call_contact', 'Appeler', 'appeler pierre sur son portable', 'dial'], ['send_email', 'Envoyer un e-mail', 'envoyer un e-mail à thomas fontaine', 'email'], ['map_of', 'Carte', 'carte des parcs à paris', 'map'], ['directions_to', 'Itinéraire', 'itinéraire pour le louvre', 'directions'], ['listen_to', 'Écouter', 'écouter beethoven', 'listen'], ['go_to', 'Accéder à', 'accéder à wikipedia', 'website'], ['note_to_self', 'Note personnelle', 'note to self do the laundry', 'note'], ['set_alarm', 'Activer l’alarme', 'set alarm for 8:30 am', 'alarm']],
    es: [['send_sms', 'Enviar mensaje', 'enviar mensaje a sergio lópez', 'sms'], ['navigate_to', 'Guíame', 'guíame a la sagrada familia', 'navigate'], ['call_contact', 'Llama', 'llama a patricia gómez al móvil', 'dial'], ['send_email', 'Enviar email', 'enviar email a patricia garcía', 'email'], ['map_of', 'Mapa', 'mapa de sidrerías en oviedo', 'map'], ['directions_to', 'Cómo llegar', 'cómo llegar a la puerta del sol', 'directions'], ['listen_to', 'Escuchar', 'escuchar a beethoven', 'listen'], ['go_to', 'Ir a', 'ir a wikipedia', 'website'], ['note_to_self', 'Nota personal', 'nota personal compra flores', 'note'], ['set_alarm', 'Activar alarma', 'activar alarma para las 7', 'alarm']]
  };
  function voice(ctx) {
    const {ui, lang} = ctx, state = ui.vsState || 'listening';
    if (state === 'help') {
      const list = ACTIONS[lang] || ACTIONS.en;
      return `<div class="app-view vs vs-helpview" data-no-translate><div class="vs-helpbox"><h3>${e(T(lang, 'Try saying...'))}</h3>${list.map(([id, label, hint, icon]) => `<button class="vs-act" data-action="vs-do" data-id="${id}"><img src="${VA(`action_${icon}`)}" alt=""><span><b>${e(label)}</b><small>“${e(hint)}”</small></span></button>`).join('')}<button class="vs-act" data-action="vs-do" data-id="search"><img src="${VA('action_search')}" alt=""><span><b>${e(T(lang, 'Voice Search'))}</b><small>${e(T(lang, 'or try any Google search by voice'))}</small></span></button></div></div>`;
    }
    const failed = state === 'timeout';
    return `<div class="app-view vs" data-no-translate><div class="vs-dialog${failed ? ' failed' : ''}"><div class="vs-title">${e(T(lang, state === 'starting' ? 'Starting up' : failed ? 'No speech heard' : 'Speak now'))}</div><div class="vs-center">${failed ? `<img class="vs-alert" src="${VA('ic_dialog_alert_large')}" alt="">` : `<span class="vs-mic${state === 'listening' ? ' on' : ''}"><img src="${VA('mic_base')}" alt=""><img class="vs-level" src="${VA('mic_full')}" alt=""></span>`}</div><img class="vs-logo" src="${VA('google_watermark')}" alt="Google"><div class="vs-buttons">${failed ? `<button data-action="vs-again">${e(T(lang, 'Speak again'))}</button>` : `<button data-action="vs-help">${e(T(lang, 'Voice Help'))}</button>`}<button data-action="vs-cancel">${e(T(lang, 'Cancel'))}</button></div></div>${failed ? '' : `<button class="vs-hint" data-action="vs-help">${e(T(lang, 'Touch Help to learn what you can say'))}</button>`}</div>`;
  }

  function render(ctx) {
    switch (ctx.view) {
      case 'news-weather': return news(ctx);
      case 'books': return books(ctx);
      case 'earth': return earth(ctx);
      default: return voice(ctx);
    }
  }
  let earthAnim = 0, vsTimer = 0, globe = {lon: -100, lat: 25, spin: true};
  function mounted(ctx) {
    const {ui, root} = ctx;
    cancelAnimationFrame(earthAnim);
    if (ctx.view === 'earth' && !ui.eaSplash) {
      const canvas = root.querySelector('.ea-globe');
      const tick = () => { if (!canvas.isConnected) return; if (globe.spin) globe.lon -= .25; drawGlobe(canvas, globe.lon, globe.lat); earthAnim = requestAnimationFrame(tick); };
      tick();
    }
    if (ctx.view === 'voice-search' && (ui.vsState || 'listening') === 'listening') {
      clearTimeout(vsTimer);
      vsTimer = setTimeout(() => { if (ui.view === 'voice-search' && (ui.vsState || 'listening') === 'listening') { ui.vsState = 'timeout'; ctx.render(); } }, 5000);
    }
  }
  // Dragging spins the globe.
  let drag = null;
  document.addEventListener('pointerdown', event => { if (!event.target.closest?.('.ea-globe')) return; drag = {x: event.clientX, y: event.clientY, lon: globe.lon, lat: globe.lat}; globe.spin = false; });
  document.addEventListener('pointermove', event => { if (!drag) return; globe.lon = drag.lon - (event.clientX - drag.x) * .5; globe.lat = Math.max(-80, Math.min(80, drag.lat + (event.clientY - drag.y) * .5)); });
  document.addEventListener('pointerup', () => { drag = null; });

  function menu(ctx) {
    const {lang, ui, view} = ctx, t = k => T(lang, k);
    if (view === 'news-weather') return ui.nwSub === 'settings' ? [] : [{action: 'nw-refresh', title: t('Refresh'), icon: 'nw-ic_menu_refresh.png'}, ...(ui.nwStory ? [{action: 'nw-share', title: t('Share story'), icon: 'nw-ic_menu_share.png'}] : []), {action: 'nw-settings', title: t('Settings'), icon: 'ic_menu_preferences'}];
    // menu/reader.xml: About, Contents, (Original pages: scanned books only), My eBooks, Settings, Help.
    if (view === 'books') return ui.bkRead && !ui.bkPrefs
      ? [{action: 'bk-about', title: t('About'), icon: 'bk-ic_menu_about.png'}, {action: 'bk-toc', title: t('Contents'), icon: 'bk-ic_menu_contents.png'}, {action: 'bk-library', title: t('My eBooks'), icon: 'bk-ic_menu_myebooks.png'}, {action: 'bk-settings', title: t('Settings'), icon: 'bk-ic_menu_reader_settings.png'}, {action: 'ga-unsupported', title: t('Help'), icon: 'bk-ic_menu_help.png'}]
      : [{action: 'bk-sort', title: t('Sort order'), icon: 'bk-ic_menu_sort_alphabetically.png'}, {action: 'bk-downloads', title: t('Manage eBooks'), icon: 'bk-ic_menu_my_downloads.png'}, {action: 'bk-get', title: t('Get eBooks'), icon: 'bk-ic_menu_myebooks.png'}, {action: 'ga-unsupported', title: t('Help'), icon: 'bk-ic_menu_help.png'}];
    if (view === 'earth') return [{action: 'ea-search', title: t('Search'), icon: 'ic_menu_search'}, {action: 'ea-layers', title: t('Layers'), icon: 'ea-ic_menu_layers.png'}, {action: 'ea-myloc', title: t('My Location'), icon: 'ic_menu_mylocation'}, {action: 'ea-clear', title: t('Clear Search Results'), icon: 'ic_menu_close_clear_cancel'}, {action: 'ga-unsupported', title: ctx.t('Settings'), icon: 'ic_menu_preferences'}];
    return [];
  }
  function dialog(kind, ctx) {
    const {lang, ui, data} = ctx, t = k => T(lang, k);
    // TypefacePreference: the typeface_custom list.
    if (kind === 'typeface') { const pr = bookPrefs(data); return {title: t('Typeface'), items: TYPEFACES.map(([label, value]) => ({action: 'bk-typeface-set', id: value, title: label})), choice: 'single', selected: Math.max(0, TYPEFACES.findIndex(([, v]) => v === pr.typeface))}; }
    if (kind === 'remove') { const b = BOOKS.find(x => x.id === ui.bkRemove); return {message: AndroidStrings.format(t('Remove book message'), b?.title || ''), buttons: [{action: 'bk-remove-keep', title: t('Keep')}, {action: 'bk-remove-ok', title: t('Remove book')}]}; }
    if (kind === 'sort') return {title: t('Sort by:'), items: ['Recently read', 'Title', 'Author'].map(k => ({action: 'bk-sort-by', id: k, title: t(k)})), choice: 'single', selected: ['Recently read', 'Title', 'Author'].indexOf(data.booksSort || 'Recently read')};
    if (kind === 'layers') return {title: t('Layers'), items: ['Places', 'Businesses', 'Panoramio Photos', 'Wikipedia', 'Borders', '3D Buildings'].map(l => ({action: 'ea-layer', id: l, title: ctx.t(l), checked: (ui.eaLayers || ['Borders']).includes(l)})), choice: 'multi'};
    return null;
  }
  function voiceDo(ctx, id) {
    const {ui, data} = ctx, contact = (ctx.contacts || [])[0];
    ui.vsState = 'listening';
    switch (id) {
      case 'send_sms': case 'note_to_self': ctx.openApp('messaging'); break;
      case 'send_email': ctx.openApp('gmail'); break;
      case 'call_contact': if (contact) ctx.call(contact.phone); break;
      case 'navigate_to': ctx.openApp('navigation'); break;
      case 'map_of': case 'directions_to': ctx.openApp('maps'); break;
      case 'listen_to': ctx.openApp('music'); break;
      case 'go_to': ctx.browse('http://www.wikipedia.org'); break;
      case 'set_alarm': ctx.openApp('clock'); break;
      default: ctx.openApp('search');
    }
  }
  function handle(action, id, ctx) {
    const {ui, data, lang} = ctx, close = () => { ui.overlay = ''; ctx.renderOverlay(); };
    switch (action) {
      case 'nw-tab': ui.nwTab = id; ui.nwStory = ''; ctx.render(); break;
      case 'nw-story': ui.nwStory = id; ctx.render(); break;
      case 'nw-refresh': close(); NewsPrefs.refresh(data, Date.now()); ctx.save(); ctx.toast(T(lang, 'Updating news topics…')); break;
      case 'nw-settings': close(); ui.nwSub = 'settings'; ui.nwpScreen = 'root'; ui.nwpDialog = ''; ui.nwStory = ''; ctx.render(); break;
      case 'nwp-open': case 'nwp-toggle': case 'nwp-topic': case 'nwp-remove': case 'nwp-dialog': case 'nwp-cancel': case 'nwp-choose': case 'nwp-ok': case 'nwp-unsupported':
        NewsPrefs.handle(action, id, {ui, data, lang, save: ctx.save, render: ctx.render, input: () => ctx.root?.querySelector?.('[data-nwp-input]')?.value ?? document.querySelector('[data-nwp-input]')?.value, unsupported: () => ctx.toast('This feature is not part of the simulator.')}); break;
      case 'nw-share': close(); ctx.openApp('gmail'); break;
      case 'bk-open': ui.bkRead = id; (data.booksLast ||= {})[id] = Date.now(); ctx.save(); ctx.toast(T(lang, 'Your book will open in a moment…')); ctx.render(); break;
      case 'bk-page': { const b = BOOKS.find(x => x.id === ui.bkRead); if (!b) break; const p = data.booksPages ||= {}; p[b.id] = Math.max(0, Math.min(b.pages.length - 1, (p[b.id] || 0) + Number(id))); ctx.save(); ctx.render(); break; }
      case 'bk-goto': (data.booksPages ||= {})[ui.bkRead] = Number(id); ui.bkToc = false; close(); ctx.save(); ctx.render(); break;
      case 'bk-settings': ui.bkPrefs = true; ui.bkToc = false; close(); ctx.render(); break;
      case 'bk-pref': { const [key, value] = String(id).split(':'); data.booksPrefs = {...bookPrefs(data), [key]: value}; delete data.booksNight; ctx.save(); ctx.render(); break; }
      case 'bk-typeface': ctx.dialog('typeface'); break;
      case 'bk-typeface-set': data.booksPrefs = {...bookPrefs(data), typeface: id}; delete data.booksNight; close(); ctx.save(); ctx.render(); break;
      case 'bk-pref-match': { const pr = bookPrefs(data); data.booksPrefs = {...pr, brightness: pr.brightness < 0 ? Math.max(10, Math.round((data.settings?.brightness ?? 100) / 5) * 5) : -1}; delete data.booksNight; ctx.save(); ctx.render(); break; }
      case 'bk-toc': ui.bkToc = !ui.bkToc; close(); ctx.render(); break;
      case 'bk-library': ui.bkRead = ''; close(); ctx.render(); break;
      // The reader's About: OceanUris.getAboutTheBookUrl, the book's Google Books page in the Browser.
      case 'bk-about': close(); ctx.browse(`books.google.com/books?id=${ui.bkRead}`); break;
      case 'bk-downloads': close(); ui.bkDownloads = true; ctx.render(); break;
      case 'bk-pin': { const pins = data.booksPinned ||= {}; pins[id] = !pins[id]; ctx.save(); ctx.render(); ctx.toast(T(lang, pins[id] ? 'Pin toast' : 'Unpin toast')); break; }
      case 'bk-remove': ui.bkRemove = id; ctx.dialog('remove'); break;
      case 'bk-remove-keep': close(); break;
      case 'bk-remove-ok': data.booksRemoved = [...new Set([...(data.booksRemoved || []), ui.bkRemove])]; close(); ctx.save(); ctx.render(); break;
      case 'bk-sort': ctx.dialog('sort'); break;
      case 'bk-sort-by': data.booksSort = id; close(); ctx.save(); ctx.render(); break;
      case 'bk-get': close(); ctx.openApp('play-store'); break;
      case 'ea-search': close(); ui.eaSearching = true; ctx.render(); ctx.focus('.ea-search input'); break;
      case 'ea-layers': ctx.dialog('layers'); break;
      case 'ea-layer': { const l = ui.eaLayers ||= ['Borders']; const i = l.indexOf(id); if (i >= 0) l.splice(i, 1); else l.push(id); ctx.dialog('layers'); break; }
      case 'ea-myloc': close(); Object.assign(globe, {lon: -122.08, lat: 37.39, spin: false}); ui.eaPlace = T(lang, 'My Location'); ctx.render(); break;
      case 'ea-clear': close(); ui.eaPlace = ''; globe.spin = true; ctx.render(); break;
      case 'ea-north': globe.lat = 0; break;
      case 'vs-help': clearTimeout(vsTimer); ui.vsState = 'help'; ctx.render(); break;
      case 'vs-again': ui.vsState = 'listening'; ctx.render(); break;
      case 'vs-cancel': clearTimeout(vsTimer); ui.vsState = 'listening'; ctx.home(); break;
      case 'vs-do': voiceDo(ctx, id); break;
      case 'ga-unsupported': close(); ctx.toast('This feature is not part of the simulator.'); break;
      default: return false;
    }
    return true;
  }
  function submit(form, values, ctx) {
    const {ui, lang} = ctx;
    if (form !== 'ea-search') return false;
    const q = String(values.get('q') || '').trim().toLowerCase(); ui.eaSearching = false;
    const hit = PLACES[q] || Object.entries(PLACES).find(([k]) => k.includes(q) || q.includes(k))?.[1];
    if (hit) { Object.assign(globe, {lon: hit[0], lat: hit[1], spin: false}); ui.eaPlace = String(values.get('q')).trim(); }
    else ctx.toast(AndroidStrings.format(T(lang, 'Not Found: %s'), String(values.get('q')).trim()));
    ctx.render(); return true;
  }
  function back(ctx) {
    const {ui, view} = ctx;
    if (view === 'news-weather' && ui.nwSub === 'settings') { if (!NewsPrefs.back(ui)) { ui.nwSub = ''; ui.nwpScreen = ''; } ctx.render(); return true; }
    if (view === 'news-weather' && ui.nwStory) { ui.nwStory = ''; ctx.render(); return true; }
    if (view === 'books' && ui.bkRead && (ui.bkPrefs || ui.bkToc)) { ui.bkPrefs = false; ui.bkToc = false; ctx.render(); return true; }
    if (view === 'books' && ui.bkRead) { ui.bkRead = ''; ctx.render(); return true; }
    if (view === 'books' && ui.bkDownloads) { ui.bkDownloads = false; ctx.render(); return true; }
    if (view === 'earth' && ui.eaSearching) { ui.eaSearching = false; ctx.render(); return true; }
    if (view === 'voice-search' && ui.vsState === 'help') { ui.vsState = 'listening'; ctx.render(); return true; }
    return false;
  }
  function open(ctx, resume) {
    const {ui, view} = ctx;
    if (resume) return;
    if (view === 'news-weather') { ui.nwTab = 'Weather'; ui.nwStory = ''; ui.nwSub = ''; ui.nwpScreen = ''; ui.nwpDialog = ''; }
    if (view === 'books') { ui.bkRead = ''; ui.bkPrefs = false; ui.bkToc = false; ui.bkDownloads = false; }
    if (view === 'earth') { ui.eaSplash = true; ui.eaPlace = ''; globe.spin = true; setTimeout(() => { ui.eaSplash = false; if (ui.view === 'earth') ctx.render(); }, 1600); }
    if (view === 'voice-search') ui.vsState = 'listening';
  }
  const module = {render, mounted, menu, dialog, handle, submit, back, open};
  for (const id of ['news-weather', 'books', 'earth', 'voice-search']) GBApps.register(id, module);
  window.GBGoogleApps = {T, STORIES, BOOKS, ACTIONS, FORECAST, BOOK_PREFS, bookPrefs};
})();
