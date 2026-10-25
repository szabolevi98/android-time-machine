/* YouTube 2.1.6 of the Nexus S image (YouTube.apk), the dark 2011 app, from its layouts, dimensions and texts:
   - header.xml: the 51 dip header (header.9 with the logo, then the search and upload buttons);
   - home_activity.xml / results_activity.xml: video_item.xml rows (the 80 x 60 dip thumbnail in video_frame with the
     duration on black, the 13 dp bold white title, the 12 dp grey author and "%1$,d views");
   - the Browse categories (category_item.xml, 18 dp) and a category's videos with the time filter;
   - watch_activity.xml: the player (the paused overlay, the scrubber and the time), the Info / Related videos / Comments
     tab row (tab_drawable, 16 dp) over watch_video_info.xml (18 dp bold title, date and views, likes and dislikes,
     Description, Category, Tags) and the like / dislike / favorite / share toolbar;
   - the Menu-key menu (Home, Browse, My Channel, Upload, Search, Settings).
   YouTube 2.1.6 has no Hungarian, so it stays English there, as on the phone. The videos are made up and play offline. */
(() => {
  'use strict';
  const {e} = GBApps;
  const STRINGS = __STRINGS__({
    "YouTube": "application_name", "Home": "menu_home", "Browse": "menu_browse", "My Channel": "menu_my_channel", "Upload": "menu_upload",
    "Search": "menu_search", "Settings": "menu_settings", "Search YouTube": "search_hint", "Info": "video_info", "Related videos": "video_info_related_label_text",
    "Comments": "comments", "Description": "description_label_text", "Category": "category_label_text", "Tags": "tags_label_text",
    "%1$,d views": "views", "by %1$s": "video_author", "%1$d likes, %2$d dislikes": "num_likes_and_dislikes", "Favorite": "add_favorite",
    "Unfavorite": "remove_favorite", "Share": "share", "Flag": "flag", "You like this video": "rating_like", "You dislike this video": "rating_dislike",
    "Video added to favorites": "added_to_favorites", "Video removed from favorites": "removed_from_favorites", "Results for \"%1$s\"": "videos_matching",
    "No videos found": "no_videos_found", "All": "all_categories", "Most viewed": "most_viewed_videos", "Top rated": "top_rated_videos",
    "Time filter": "time_filter_dialog_title", "Today": "time_filter_today", "This week": "time_filter_this_week", "This month": "time_filter_this_month",
    "All time": "time_filter_all_time", "Respond to this video...": "comment_hint", "Post": "comment_post_button", "Comment posted": "comment_posted",
    "Rotate or double tap the video to toggle fullscreen": "promo_fullscreen", "%1$s days ago": "ago_day_plural", "%1$s weeks ago": "ago_week_plural",
    "%1$s months ago": "ago_month_plural", "Subscribe": "subscribe", "Share this video via": "send_video", "Sign in": "accounts_title",
    "General settings": "pref_general_category",
    "High quality on mobile": "pref_default_hq_title",
    "Start videos in high quality when connected to a mobile network.": "pref_default_hq_summary",
    "Caption font size": "pref_subtitles_size_title",
    "Sets the font size to use for captions": "pref_subtitles_size_summary",
    "Small": "@array/subtitles_size_entries:0",
    "Medium": "@array/subtitles_size_entries:1",
    "Large": "@array/subtitles_size_entries:2",
    "Extra Large": "@array/subtitles_size_entries:3",
    "Search settings": "pref_search_category",
    "Clear search history": "pref_clear_search_history_title",
    "Clear previous YouTube searches from showing up in the Search box": "pref_clear_search_history_summary",
    "SafeSearch filtering": "pref_safe_search_title",
    "Block videos containing restricted content from appearing in search results": "pref_safe_search_summary",
    "SafeSearch": "safe_search_dialog_title",
    "Don't filter": "@array/safe_search_levels:0",
    "Moderate": "@array/safe_search_levels:1",
    "Strict": "@array/safe_search_levels:2",
    "About": "pref_about_category",
    "Help": "pref_help_title",
    "Find answers to your YouTube questions here": "pref_help_summary",
    "Feedback": "pref_feedback_title",
    "Help us make YouTube better": "pref_feedback_summary",
    "Google Mobile Terms of Service": "pref_mobile_terms_title",
    "Read Google Mobile Terms of Service": "pref_mobile_terms_summary",
    "YouTube Terms of Service": "pref_youtube_terms_title",
    "Read YouTube's Terms of Service": "pref_youtube_terms_summary",
    "Google Mobile Privacy Policy": "pref_mobile_privacy_title",
    "Read Google Mobile Privacy Policy": "pref_mobile_privacy_summary",
    "YouTube Privacy Policy": "pref_youtube_privacy_title",
    "Read YouTube's Privacy Policy": "pref_youtube_privacy_summary",
    "Application version": "pref_version_title"
  });
  const T = GBApps.texts(STRINGS);
  const A = name => `assets/yt-${name}.png`;
  const CATEGORIES = ['Autos & Vehicles', 'Comedy', 'Education', 'Entertainment', 'Film & Animation', 'Gaming', 'Howto & Style', 'Music', 'News & Politics', 'Nonprofits & Activism', 'People & Blogs', 'Pets & Animals', 'Science & Technology', 'Sports', 'Travel & Events'];
  // Spring 2011 videos: [id, title, author, seconds, views, category, days ago, likes, dislikes, colours].
  const VIDEOS = [
    ['y1', 'Nexus S hands-on: Gingerbread, NFC and the curved glass', 'GadgetWeekly', 512, 1204311, 'Science & Technology', 40, 8123, 211, ['#1d3557', '#a8dadc']],
    ['y2', 'Gingerbread tips: 10 things to try on Android 2.3', 'DroidCorner', 375, 486020, 'Howto & Style', 25, 3920, 88, ['#264653', '#e9c46a']],
    ['y3', 'Cat vs. cardboard box — the rematch', 'WhiskerTV', 142, 9871442, 'Pets & Animals', 9, 51220, 960, ['#6d597a', '#e56b6f']],
    ['y4', 'Sunset timelapse over the old town bridge', 'Trail & Summit', 188, 52977, 'Travel & Events', 60, 1204, 15, ['#f4a261', '#2a9d8f']],
    ['y5', 'Learn three chords in ten minutes', 'StrumSchool', 603, 2311020, 'Music', 120, 22018, 410, ['#3a0ca3', '#f72585']],
    ['y6', 'Street football skills compilation', 'KickItTV', 255, 731554, 'Sports', 14, 6112, 199, ['#2b9348', '#eeef20']],
    ['y7', 'How a paper airplane really flies', 'Physics Explained', 421, 318020, 'Education', 75, 4502, 61, ['#023e8a', '#90e0ef']],
    ['y8', 'Unboxing the 2011 smartphone lineup', 'TechTalk Daily', 734, 155802, 'Science & Technology', 5, 1802, 77, ['#343a40', '#adb5bd']],
    ['y9', 'Five-minute pasta for busy evenings', 'Kitchen Corner', 301, 90311, 'Howto & Style', 33, 1350, 22, ['#9d0208', '#ffba08']],
    ['y10', 'Stand-up: smartphones and our grandparents', 'Laugh Track', 480, 2650098, 'Comedy', 19, 30512, 802, ['#5f0f40', '#fb8b24']]
  ].map(([id, title, author, seconds, views, category, days, likes, dislikes, colors]) => ({id, title, author, seconds, views, category, days, likes, dislikes, colors}));
  const COMMENTS = ['Great video, thanks for sharing!', 'Watching this on my Nexus S right now :)', 'The ending was the best part.', 'Subscribed!'];
  const video = id => VIDEOS.find(v => v.id === id);
  const length = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const views = (lang, n) => AndroidStrings.format(T(lang, '%1$,d views'), n.toLocaleString('en-US'));
  const ago = (lang, d) => d >= 60 ? AndroidStrings.format(T(lang, '%1$s months ago'), Math.round(d / 30)) : d >= 14 ? AndroidStrings.format(T(lang, '%1$s weeks ago'), Math.round(d / 7)) : AndroidStrings.format(T(lang, '%1$s days ago'), d);
  const thumb = (v, cls = '') => `<span class="yt-thumb ${cls}" style="--a:${v.colors[0]};--b:${v.colors[1]}"><em>${e(v.title.split(':')[0])}</em></span>`;
  const store = data => (data.youtube23 ||= {liked: {}, favorites: [], comments: {}});
  function header(ctx, title = '') {
    const {lang, ui} = ctx;
    const search = ui.ytSearching ? `<form class="yt-search" data-form="yt-search"><input name="q" value="${e(ui.ytQuery || '')}" placeholder="${e(T(lang, 'Search YouTube'))}" aria-label="${e(T(lang, 'Search YouTube'))}" autocomplete="off"></form>` : '';
    return `<div class="yt-header"><button class="yt-logo" data-action="yt-home" aria-label="YouTube"><img src="${A('logo')}" alt=""></button><span class="yt-hbtns"><img class="yt-hdiv" src="${A('header_divider')}" alt=""><button data-action="yt-upload" aria-label="${e(T(lang, 'Upload'))}"><img src="${A('ic_menu_capture_normal')}" alt=""></button><img class="yt-hdiv" src="${A('header_divider')}" alt=""><button data-action="yt-search-open" aria-label="${e(T(lang, 'Search'))}"><img src="${A('ic_menu_search_normal')}" alt=""></button></span></div>${search}${title ? `<div class="yt-title">${e(title)}</div>` : ''}`;
  }
  const row = (ctx, v) => `<button class="yt-item" data-action="yt-watch" data-id="${v.id}"><span class="yt-frame">${thumb(v)}<i class="yt-dur">${length(v.seconds)}</i></span><span class="yt-meta"><b>${e(v.title)}</b><small>${e(AndroidStrings.format(T(ctx.lang, 'by %1$s'), v.author))}${v.days <= 7 ? ` <i class="yt-new">New</i>` : ''}</small><small>${e(views(ctx.lang, v.views))}</small></span></button>`;
  function list(ctx) {
    const {ui, lang} = ctx;
    if (ui.ytPage === 'browse') return `<div class="app-view yt" data-no-translate>${header(ctx, T(lang, 'Browse'))}<div class="yt-scroll">${[T(lang, 'All'), ...CATEGORIES].map((c, i) => `<button class="yt-cat" data-action="yt-cat" data-id="${i ? e(CATEGORIES[i - 1]) : ''}">${e(c)}</button>`).join('')}</div></div>`;
    let items = [...VIDEOS], title = T(lang, 'Most viewed');
    if (ui.ytPage === 'results') { const q = (ui.ytQuery || '').toLowerCase(); items = VIDEOS.filter(v => [v.title, v.author, v.category].join(' ').toLowerCase().includes(q)); title = AndroidStrings.format(T(lang, 'Results for "%1$s"'), ui.ytQuery || ''); }
    else if (ui.ytPage === 'category') { items = ui.ytCat ? VIDEOS.filter(v => v.category === ui.ytCat) : VIDEOS; title = ui.ytCat || T(lang, 'All'); }
    else if (ui.ytPage === 'channel') { const s = store(ctx.data); items = VIDEOS.filter(v => s.favorites.includes(v.id)); title = T(lang, 'My Channel'); }
    else items.sort((a, b) => b.views - a.views);
    if (ui.ytFilter && ui.ytPage !== 'channel') items = items.filter(v => v.days <= {today: 1, week: 7, month: 31}[ui.ytFilter] || ui.ytFilter === 'all');
    return `<div class="app-view yt" data-no-translate>${header(ctx, title)}<div class="yt-scroll">${items.map(v => row(ctx, v)).join('') || `<p class="yt-empty">${e(T(lang, 'No videos found'))}</p>`}</div></div>`;
  }
  function watch(ctx) {
    const {ui, lang, data} = ctx, v = video(ui.ytWatch), s = store(data);
    if (!v) return list(ctx);
    const tab = ui.ytTab || 'info', rating = s.liked[v.id], fav = s.favorites.includes(v.id), pos = Math.min(v.seconds, ui.ytPos || 0);
    const tabs = [['info', T(lang, 'Info')], ['related', T(lang, 'Related videos')], ['comments', T(lang, 'Comments')]].map(([id, label]) => `<button class="yt-tab${tab === id ? ' on' : ''}" data-action="yt-tab" data-id="${id}">${e(label)}</button>`).join('');
    const tool = (action, img, label, on = false) => `<button class="yt-tool${on ? ' on' : ''}" data-action="${action}" aria-label="${e(label)}"><img src="${A(img)}" alt=""></button>`;
    const likes = v.likes + (rating === 1 ? 1 : 0), dislikes = v.dislikes + (rating === -1 ? 1 : 0);
    const info = `<div class="yt-info"><h3>${e(v.title)}</h3><p><span class="grey">${e(ago(lang, v.days))} — </span>${e(views(lang, v.views))}</p><p class="grey">${e(AndroidStrings.format(T(lang, '%1$d likes, %2$d dislikes'), likes, dislikes))}</p>${rating ? `<p>${e(T(lang, rating > 0 ? 'You like this video' : 'You dislike this video'))}</p>` : ''}<button class="yt-channel" data-action="yt-author">${e(v.author)}</button><b>${e(T(lang, 'Description'))}</b><p>${e(`${v.title}. Uploaded by ${v.author}.`)}</p><b>${e(T(lang, 'Category'))}</b><p class="grey">${e(v.category)}</p><b>${e(T(lang, 'Tags'))}</b><p class="grey">${e(v.category.toLowerCase().split(/\W+/).filter(Boolean).join(' '))} android 2011</p></div>`;
    const related = VIDEOS.filter(x => x.id !== v.id && (x.category === v.category || x.views > 500000)).slice(0, 6).map(x => row(ctx, x)).join('');
    const comments = [...(s.comments[v.id] || []).map(c => ({author: 'me', text: c, time: ''})), ...COMMENTS.map((c, i) => ({author: ['jake88', 'anna_k', 'mrtechguy', 'sunnyday'][i], text: c, time: ago(lang, v.days - i > 0 ? v.days - i : 1)}))];
    const commentList = `<form class="yt-comment" data-form="yt-comment"><input name="text" placeholder="${e(T(lang, 'Respond to this video...'))}" aria-label="${e(T(lang, 'Respond to this video...'))}" autocomplete="off"><button type="submit">${e(T(lang, 'Post'))}</button></form>${comments.map(c => `<div class="yt-c"><b>${e(c.author)}</b><span>${e(c.text)}</span>${c.time ? `<small>${e(c.time)}</small>` : ''}</div>`).join('')}`;
    const playing = ui.ytPlaying && pos < v.seconds;
    return `<div class="app-view yt yt-watch" data-no-translate>${header(ctx)}<div class="yt-player${playing ? ' playing' : ''}" style="--a:${v.colors[0]};--b:${v.colors[1]}"><button class="yt-screen" data-action="yt-play" aria-label="Play"><em>${e(v.title)}</em>${playing ? '' : `<img class="yt-paused" src="${A(pos >= v.seconds ? 'player_replay_off' : 'player_osd_paused')}" alt="">`}</button><div class="yt-bar"><span>${length(Math.floor(pos))}</span><i class="yt-track"><i style="width:${pos / v.seconds * 100}%"></i></i><span>${length(v.seconds)}</span></div></div><div class="yt-tools">${tool('yt-like', 'ic_like', T(lang, 'You like this video'), rating === 1)}${tool('yt-dislike', 'ic_dislike', T(lang, 'You dislike this video'), rating === -1)}${tool('yt-fav', fav ? 'ic_unfavorite' : 'ic_favorite', T(lang, fav ? 'Unfavorite' : 'Favorite'), fav)}${tool('yt-share', 'ic_share', T(lang, 'Share'))}${tool('yt-flag', 'ic_flag', T(lang, 'Flag'))}</div><div class="yt-tabs">${tabs}</div><div class="yt-scroll yt-work">${tab === 'related' ? related : tab === 'comments' ? commentList : info}</div></div>`;
  }
  function render(ctx) { return ctx.ui.ytWatch ? watch(ctx) : list(ctx); }
  // The player plays the made-up video in real time while it is on screen.
  let playTimer = 0;
  function mounted(ctx) {
    clearInterval(playTimer);
    const {ui} = ctx, v = video(ui.ytWatch); if (!v || !ui.ytPlaying) return;
    playTimer = setInterval(() => {
      if (ui.view !== 'youtube' || ui.ytWatch !== v.id || !ui.ytPlaying) { clearInterval(playTimer); return; }
      ui.ytPos = Math.min(v.seconds, (ui.ytPos || 0) + 1);
      const bar = document.querySelector('.yt-track i'), time = document.querySelector('.yt-bar span');
      if (bar) bar.style.width = `${ui.ytPos / v.seconds * 100}%`; if (time) time.textContent = length(ui.ytPos);
      if (ui.ytPos >= v.seconds) { ui.ytPlaying = false; clearInterval(playTimer); ctx.render(); }
    }, 1000);
  }
  function menu(ctx) {
    const {lang} = ctx, t = k => T(lang, k);
    return [{action: 'yt-home', title: t('Home'), icon: 'yt-ic_menu_home.png'}, {action: 'yt-browse', title: t('Browse'), icon: 'yt-ic_menu_browse.png'}, {action: 'yt-channel-open', title: t('My Channel'), icon: 'yt-ic_menu_my_channel.png'},
      {action: 'yt-upload', title: t('Upload'), icon: 'yt-ic_menu_capture_normal.png'}, {action: 'yt-search-open', title: t('Search'), icon: 'ic_menu_search'}, {action: 'gbpref-open', id: 'youtube', title: t('Settings'), icon: 'ic_menu_preferences'}];
  }
  function dialog(kind, ctx) {
    const {lang} = ctx, t = k => T(lang, k);
    if (kind === 'filter') return {title: t('Time filter'), items: [['today', 'Today'], ['week', 'This week'], ['month', 'This month'], ['all', 'All time']].map(([id, l]) => ({action: 'yt-filter', id, title: t(l)})), choice: 'single', selected: ['today', 'week', 'month', 'all'].indexOf(ctx.ui.ytFilter || 'all')};
    if (kind === 'share') return {title: t('Share this video via'), items: [['gmail', 'Gmail'], ['messaging', 'Messaging'], ['email', 'Email']].map(([id, n]) => ({action: 'yt-share-to', id, title: ctx.t(n), icon: `${id}.png`}))};
    return null;
  }
  function handle(action, id, ctx) {
    const {ui, data, lang} = ctx, s = store(data), close = () => { ui.overlay = ''; ctx.renderOverlay(); };
    const go = page => { close(); ui.ytWatch = ''; ui.ytPage = page; ui.ytSearching = false; ctx.render(); };
    switch (action) {
      case 'yt-home': go(''); break;
      case 'yt-browse': go('browse'); break;
      case 'yt-channel-open': go('channel'); break;
      case 'yt-cat': ui.ytCat = id; ui.ytFilter = ''; go('category'); ctx.dialog('filter'); break;
      case 'yt-filter': ui.ytFilter = id; close(); ctx.render(); break;
      case 'yt-search-open': close(); ui.ytSearching = true; ctx.render(); ctx.focus('.yt-search input'); break;
      case 'yt-watch': ui.ytWatch = id; ui.ytTab = 'info'; ui.ytPos = 0; ui.ytPlaying = true; ui.ytSearching = false; ctx.render(); ctx.toast(T(lang, 'Rotate or double tap the video to toggle fullscreen')); break;
      case 'yt-play': { const v = video(ui.ytWatch); if (!v) break; if ((ui.ytPos || 0) >= v.seconds) ui.ytPos = 0; ui.ytPlaying = !ui.ytPlaying; ctx.render(); break; }
      case 'yt-tab': ui.ytTab = id; ctx.render(); break;
      case 'yt-like': s.liked[ui.ytWatch] = s.liked[ui.ytWatch] === 1 ? 0 : 1; ctx.save(); ctx.render(); break;
      case 'yt-dislike': s.liked[ui.ytWatch] = s.liked[ui.ytWatch] === -1 ? 0 : -1; ctx.save(); ctx.render(); break;
      case 'yt-fav': { const i = s.favorites.indexOf(ui.ytWatch); if (i >= 0) s.favorites.splice(i, 1); else s.favorites.push(ui.ytWatch); ctx.save(); ctx.render(); ctx.toast(T(lang, i >= 0 ? 'Video removed from favorites' : 'Video added to favorites')); break; }
      case 'yt-share': ctx.dialog('share'); break;
      case 'yt-share-to': close(); ctx.openApp(id); break;
      case 'yt-author': { const v = video(ui.ytWatch); ui.ytQuery = v?.author || ''; go('results'); break; }
      case 'yt-upload': close(); ctx.openApp('camera'); break;
      case 'yt-flag': case 'yt-unsupported': close(); ctx.toast('This feature is not part of the simulator.'); break;
      default: return false;
    }
    return true;
  }
  function submit(form, values, ctx) {
    const {ui, data, lang} = ctx;
    // Each search is kept for the Search box's history (Settings' Clear search history empties it).
    if (form === 'yt-search') { const q = String(values.get('q') || '').trim(); if (!q) return true; const s = store(ctx.data); s.searches = [q, ...(s.searches || []).filter(x => x !== q)].slice(0, 10); ctx.save(); ui.ytQuery = q; ui.ytPage = 'results'; ui.ytWatch = ''; ui.ytSearching = false; ctx.render(); return true; }
    if (form === 'yt-comment') { const text = String(values.get('text') || '').trim(); if (!text) return true; const s = store(data); (s.comments[ui.ytWatch] ||= []).unshift(text); ctx.save(); ctx.render(); ctx.toast(T(lang, 'Comment posted')); return true; }
    return false;
  }
  function back(ctx) {
    const {ui} = ctx;
    if (ui.ytSearching) { ui.ytSearching = false; ctx.render(); return true; }
    if (ui.ytWatch) { ui.ytWatch = ''; ui.ytPlaying = false; ctx.render(); return true; }
    if (ui.ytPage === 'category') { ui.ytPage = 'browse'; ctx.render(); return true; }
    if (ui.ytPage) { ui.ytPage = ''; ctx.render(); return true; }
    return false;
  }
  function open(ctx, resume) { if (!resume) Object.assign(ctx.ui, {ytWatch: '', ytPage: '', ytSearching: false, ytPlaying: false}); }
  GBApps.register('youtube', {render, mounted, menu, dialog, handle, submit, back, open, scroll: '.yt-scroll'});
  window.GBYouTube = {VIDEOS, CATEGORIES, T};
})();
