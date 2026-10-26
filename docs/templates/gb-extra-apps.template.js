/* The last Google apps of the Nexus S image (GRK39F) as working 2011 screens, from their APKs:
   - Car Home 2.2.1.2 (CarHomeGoogle.apk): res/xml/default_carhome.xml (screen 1: Navigate, Phone, Voice Search, Contacts,
     Music, Exit car mode; screen 2: Maps, Places, Settings, Day/Night mode), the 160 x 133.3 dip cells on the
     container 9-patch over the home wallpaper ("Same as Home screen"), the 130 x 53.3 dip screen arrows and Add shortcut;
     the disclaimer.xml dialog on entry (Always show), and Settings' own dialogs: Colorize icons (color_palette.xml's nine
     Automotive.Color.Palette colors over the icons), Wallpaper (Same as Home screen / Select from Gallery) and Reset to
     defaults (gb-prefs.js draws the Settings screens).
   - Google Voice 0.4.2.30 (googlevoice.apk, Theme.Light): conversation_item.xml rows (the 54 dip picture with its
     voicemail / text / call badge, the 18 sp bold name with the count and time, the star, the 14 sp message), the
     labels (label_item.xml), a conversation with the transcript and playback, and Compose; English only, as the
     service was US-only.
   - Tags 1.1 (TagGoogle.apk): the Tags / Starred / My tag tabs (ic_tab_*), tag_list_item.xml rows, tag_viewer.xml (65 dip
     title_bar_medium, the records, Done and Delete), the About Tags pages (intro_to_nfc.xml) and "NFC turned off".
   - Voice Dialer (packages/apps/VoiceDialer, VoiceDialer.apk): voice_dialing.xml ("Starting up.", "Listening…", the
     microphone, retry), "No results, try again." and the "Did you know…" tool tip.
   Mail, calls and tags are made up and offline. 1 dp = 0.8625 px. */
(() => {
  'use strict';
  const {e} = GBApps;
  const STRINGS = __STRINGS__({
    "Tags": "tab_tags", "Starred": "tab_starred", "My tag": "tab_my_tag", "You have not scanned any tags.": "empty_list", "You have no starred tags.": "empty_list_starred",
    "More info": "button_more_info", "About Tags": "intro_title", "Back": "back", "Next": "next", "Done": "button_done", "Delete": "button_delete",
    "Tag deleted": "tag_deleted", "NFC turned off": "dialog_title_nfc_off", "You must turn on NFC to scan tags.": "dialog_text_nfc_off", "Settings": "button_settings",
    "Cancel": "button_cancel", "Share my tag": "turn_on_my_tag", "Allow others to read my tag": "turn_on_my_tag_subtitle", "Add new tag": "add_tag",
    "You have no tags created.": "no_tags_created", "Edit tag": "menu_edit", "Delete tag": "menu_delete", "Help": "menu_help", "Set as active tag": "menu_set_as_active",
    "Text": "tag_text", "URL": "url", "Title": "tag_title", "Save": "button_save", "Contact": "contact", "Active tag": "active_tag", "Call %s": "action_call",
    "Tags is for organizing and sharing Near Field Communication (NFC) tags.": "intro_text_about",
    "You scan a tag by turning on your phone and placing it right next to a tag.": "intro_text_usage",
    "NFC tags can contain text, URLs, pictures, and other kinds of information.": "intro_text_contents",
    "For more information, press Menu and touch Help on any Tags screen.": "intro_text_more2",
    "Starting up.": "VoiceDialer:initializing", "Listening…": "VoiceDialer:listening", "No results, try again.": "VoiceDialer:no_results_tts",
    "Please try again.": "VoiceDialer:please_try_again", "Did you know…": "VoiceDialer:tool_tip_title",
    "Pressing & holding the green Call button opens the Voice Dialer.": "VoiceDialer:tool_tip_message", "Voice Dialer": "VoiceDialer:voiceDialer",
    "Navigate": "CarHomeGoogle:navigate", "Phone": "CarHomeGoogle:phone", "Voice Search": "CarHomeGoogle:speech", "Contacts": "CarHomeGoogle:contacts",
    "Music": "CarHomeGoogle:music", "Exit car mode": "CarHomeGoogle:exit", "Maps": "CarHomeGoogle:maps", "Places": "CarHomeGoogle:places",
    "Car Home": "CarHomeGoogle:app_name", "Add shortcut": "CarHomeGoogle:label_add_shortcut", "Day/Night mode": "CarHomeGoogle:ui_mode_night_label",
    "Car applications": "CarHomeGoogle:shortcut_item_car_apps",
    "Always show disclaimer": "CarHomeGoogle:settings_always_show_disclaimer",
    "Hide Status bar": "CarHomeGoogle:settings_hide_statusbar",
    "Colorize icons": "CarHomeGoogle:settings_tint_color",
    "Pick a color": "CarHomeGoogle:dlg_title_tint_color",
    "Wallpaper": "CarHomeGoogle:settings_wallpaper",
    "Car Home Wallpaper": "CarHomeGoogle:chooser_wallpaper",
    "Select from Gallery": "CarHomeGoogle:pick_sdcard_wallpaper",
    "Same as Home screen": "CarHomeGoogle:system_wallpaper",
    "Bluetooth starts Car Home": "CarHomeGoogle:bt_launch_settings",
    "Select paired device to automatically start Car Home when in range.": "CarHomeGoogle:bt_launch_settings_summary",
    "Start Car Home on connect with:": "CarHomeGoogle:bt_launch_settings_category",
    "Before a device can be used here, it needs to be paired and Bluetooth has to be enabled.": "CarHomeGoogle:bt_launch_settings_hint",
    "Bluetooth": "CarHomeGoogle:bluetooth",
    "Stop Car Home on disconnect": "CarHomeGoogle:disconnect_category_title",
    "Timeout": "CarHomeGoogle:disconnect_title",
    "Never": "CarHomeGoogle:disconnect_entry_never",
    "Immediately": "CarHomeGoogle:disconnect_entry_immediately",
    "After 5 seconds": "CarHomeGoogle:disconnect_entry_5",
    "After 10 seconds": "CarHomeGoogle:disconnect_entry_10",
    "After 30 seconds": "CarHomeGoogle:disconnect_entry_30",
    "Reset to defaults": "CarHomeGoogle:settings_reset_screens_section",
    "Delete all custom settings and shortcuts ?": "CarHomeGoogle:reset_screen_message",
    "Android settings": "CarHomeGoogle:settings_android_settings_title",
    "Disclaimer": "CarHomeGoogle:disclaimer_title",
    "Please exercise caution": "CarHomeGoogle:disclaimer_agreement",
    "Terms of Service": "CarHomeGoogle:disclaimer_tos",
    "Always show": "CarHomeGoogle:disclaimer_checkbox",
    "Continue": "CarHomeGoogle:btn_accept"
  });
  const T = GBApps.texts(STRINGS);

  // ---------- Car Home ----------
  const CA = name => `assets/ch-${name}.png`;
  const CAR = [[['navigate', 'Navigate', 'ic_navigate', 'navigation'], ['phone', 'Phone', 'ic_phone', 'phone'], ['voice', 'Voice Search', 'ic_voicesearch', 'voice-search'], ['contacts', 'Contacts', 'ic_contacts', 'people'], ['music', 'Music', 'ic_music', 'music'], ['exit', 'Exit car mode', 'ic_exit_carhome', '']],
    [['maps', 'Maps', 'ic_maps', 'maps'], ['places', 'Places', 'ic_places', 'places'], null, null, ['settings', 'Settings', 'ic_settings', ''], ['night', 'Day/Night mode', 'ic_brightness_auto', '']], [null, null, null, null, null, null], [null, null, null, null, null, null]];
  const PALETTE = ['#ff1600', '#ff6900', '#98fd00', '#00d285', '#8e9dfe', '#ffffff', '#7fcbff', '#0070ff', '#afbde9'];
  const carPrefs = data => data.appPrefs?.['car-settings'] || {};
  function carHome(ctx) {
    const {ui, lang, data} = ctx, screen = ui.chScreen || 0, custom = data.carHome || {};
    const cells = CAR[screen].map((cell, i) => {
      const item = custom[`${screen}:${i}`] ? [custom[`${screen}:${i}`], ctx.t(ctx.appName(custom[`${screen}:${i}`])), null, custom[`${screen}:${i}`]] : cell;
      if (!item) return `<button class="ch-cell add" data-action="ch-add" data-id="${screen}:${i}"><img src="${CA('ic_add_shortcut_semi')}" alt=""><span>${e(T(lang, 'Add shortcut'))}</span></button>`;
      const [id, label, icon, app] = item;
      const tint = icon && data.carTint ? ` class="ch-tint" style="--tint:${e(data.carTint)};-webkit-mask-image:url('${CA(icon)}');mask-image:url('${CA(icon)}')"` : '';
      return `<button class="ch-cell" data-action="ch-open" data-id="${e(id)}" data-app="${e(app)}"><img src="${icon ? CA(icon) : `assets/${app}.png`}" alt=""${tint}><span>${e(icon ? T(lang, label) : label)}</span></button>`;
    }).join('');
    const photo = data.carWallpaper && data.photos.find(p => String(p.id) === String(data.carWallpaper));
    return `<div class="app-view ch${data.carNight ? ' night' : ''}"${photo ? ` style="background-image:linear-gradient(#00000059,#00000059),url('${e(ICSMedia.image(photo))}')"` : ''} data-no-translate><div class="ch-grid">${cells}</div><div class="ch-arrows"><button class="ch-prev" data-action="ch-screen" data-id="-1"${screen ? '' : ' disabled'} aria-label="‹"><img src="${CA(screen ? 'arrow_left_normal' : 'arrow_empty')}" alt=""></button><span class="ch-dots">${CAR.map((_, i) => `<i class="${i === screen ? 'on' : ''}"></i>`).join('')}</span><button class="ch-next" data-action="ch-screen" data-id="1"${screen < CAR.length - 1 ? '' : ' disabled'} aria-label="›"><img src="${CA(screen < CAR.length - 1 ? 'arrow_right_normal' : 'arrow_empty')}" alt=""></button></div></div>`;
  }

  // ---------- Google Voice ----------
  const GV = name => `assets/gv-${name}.png`;
  const GV_LABELS = [['inbox', 'Inbox'], ['starred', 'Starred'], ['voicemail', 'Voicemail'], ['sms', 'Text'], ['recorded', 'Recorded'], ['placed', 'Placed'], ['received', 'Received'], ['missed', 'Missed'], ['trash', 'Trash'], ['all', 'All']];
  // [id, name, number, kind, minutes ago, read, starred, items [from me?, text]]
  const GV_SAMPLE = [
    ['v1', 'Alex Morgan', '(202) 555-0148', 'voicemail', 35, false, true, [[false, 'Hey, it’s Alex. Just checking if we’re still on for Saturday’s hike. Call me back when you get this. Bye!']]],
    ['v2', 'Sam Rivera', '(202) 555-0192', 'sms', 140, false, false, [[false, 'Dinner at 8?'], [true, 'Sounds good, see you there'], [false, 'Great, I booked a table for four.']]],
    ['v3', 'Taylor Lee', '(202) 555-0116', 'missed', 320, true, false, []],
    ['v4', '(202) 555-0107', '(202) 555-0107', 'voicemail', 1500, true, false, [[false, 'Hi, this is a reminder from the dentist’s office about your appointment on Thursday at 10 am. Please call us if you need to reschedule.']]],
    ['v5', 'Mom', '(202) 555-0107', 'placed', 2900, true, false, []]
  ];
  const gvStore = data => (data.gvoice ||= GV_SAMPLE.map(([id, name, number, kind, mins, read, starred, items]) => ({id, name, number, kind, mins, read, starred, label: 'inbox', items: items.map(([me, text]) => ({me, text}))})));
  const gvBadge = kind => kind === 'voicemail' ? 'voicemail_with_border' : kind === 'sms' ? 'sms_with_border' : kind === 'missed' ? 'call_missed_with_border' : kind === 'placed' ? 'call_placed_with_border' : 'call_received_with_border';
  const gvTime = (ctx, mins) => mins < 1440 ? new Date(ctx.now.getTime() - mins * 6e4).toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'}) : new Date(ctx.now.getTime() - mins * 6e4).toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
  const gvIn = (c, label) => label === 'all' ? c.label !== 'trash' : label === 'starred' ? c.starred && c.label !== 'trash' : label === 'trash' ? c.label === 'trash' : ['voicemail', 'sms', 'missed', 'placed', 'received', 'recorded'].includes(label) ? c.kind === label && c.label !== 'trash' : c.label === label;
  function googleVoice(ctx) {
    const {ui} = ctx, list = gvStore(ctx.data), label = ui.gvLabel || 'inbox';
    if (ui.gvLabels) return `<div class="app-view gv" data-no-translate><div class="gb-titlebar">Google Voice - Labels</div><div class="gv-scroll">${GV_LABELS.map(([id, name]) => { const n = list.filter(c => gvIn(c, id) && !c.read).length; return `<button class="gv-label" data-action="gv-label" data-id="${id}"><img src="${GV(id === 'sms' ? 'text_message' : id === 'starred' ? 'star_on' : id === 'missed' ? 'call_missed' : id === 'placed' ? 'call_placed' : id === 'received' ? 'call_received' : id === 'recorded' ? 'call_recorded' : 'voicemail')}" alt=""><span>${e(name)}${n ? ` (${n})` : ''}</span></button>`; }).join('')}</div></div>`;
    const c = list.find(x => x.id === ui.gvOpen);
    if (c) {
      const rows = c.items.length ? c.items.map(m => c.kind === 'voicemail' ? `<div class="gv-vm"><button class="gv-play${ui.gvPlaying === c.id ? ' on' : ''}" data-action="gv-play" data-id="${c.id}" aria-label="Play"></button><span class="gv-bar"><i style="width:${ui.gvPlaying === c.id ? 100 : 0}%"></i></span><p class="gv-transcript">${e(m.text)}</p></div>` : `<div class="gv-sms${m.me ? ' me' : ''}"><b>${e(m.me ? 'Me' : c.name)}:</b> ${e(m.text)}</div>`).join('') : `<p class="gv-call">${e({missed: 'Missed call', placed: 'Placed call', received: 'Received call'}[c.kind] || '')} · ${e(gvTime(ctx, c.mins))}</p>`;
      return `<div class="app-view gv" data-no-translate><div class="gb-titlebar">${e(c.name)}</div><div class="gv-scroll gv-conv"><div class="gv-head"><img src="${GV('default_contact_picture')}" alt=""><span><b>${e(c.name)}</b><small>${e(c.number)}</small></span></div>${rows}</div>${c.kind === 'sms' ? `<form class="gv-compose" data-form="gv-sms"><input name="text" placeholder="Type to compose" aria-label="Type to compose" autocomplete="off"><button type="submit">Send</button></form>` : ''}</div>`;
    }
    const q = String(ui.gvQuery || '').toLocaleLowerCase(), match = x => [x.name, x.number || '', ...x.items.map(m => m.text || '')].some(t => String(t).toLocaleLowerCase().includes(q));
    const items = list.filter(x => q ? x.label !== 'trash' && match(x) : gvIn(x, label)).sort((a, b) => a.mins - b.mins);
    const rows = items.map(x => `<div class="gv-item${x.read ? '' : ' unread'}"><button class="gv-open" data-action="gv-open" data-id="${x.id}"><span class="gv-photo"><img src="${GV('default_contact_picture')}" alt=""><img class="gv-badge" src="${GV(gvBadge(x.kind))}" alt=""></span><span class="gv-main"><span class="gv-top"><b>${e(x.name)}</b>${x.items.length > 1 ? `<i>(${x.items.length})</i>` : ''}<small>${e(gvTime(ctx, x.mins))}</small></span><span class="gv-text">${e(x.items.at(-1)?.text || {missed: 'Missed call', placed: 'Placed call', received: 'Received call'}[x.kind] || '')}</span></span></button><button class="gv-star${x.starred ? ' on' : ''}" data-action="gv-star" data-id="${x.id}" aria-label="Star"></button></div>`).join('');
    // Search (audit step 5): search_title over the matches, search_view_empty, the framework SearchDialog on top.
    const title = q ? `Search results for: ${ui.gvQuery} (${items.length}/${items.length})` : `Google Voice - ${(GV_LABELS.find(l => l[0] === label) || [0, 'Inbox'])[1]}`;
    const dialog = ui.gvSearching ? `<div class="gbbr-search-scrim" data-action="gv-search-cancel"></div><form class="gbbr-search" data-form="gv-search"><div class="gbbr-search-row"><img class="gbbr-search-app" src="assets/google-voice.png" alt=""><input name="query" autocomplete="off" aria-label="Search" placeholder="Search"><button class="gbbr-go" type="submit" aria-label="Go"><img src="assets/gb-ic_btn_search_go.png" alt=""></button></div></form>` : '';
    return `<div class="app-view gv" data-no-translate><div class="gb-titlebar">${e(title)}</div><div class="gv-scroll">${rows || `<p class="gv-empty">${q ? 'No matches for your search' : 'No messages'}</p>`}</div>${dialog}</div>`;
  }

  // ---------- Tags ----------
  const TA = name => `assets/tg-${name}.png`;
  const tgStore = data => (data.tags23 ||= {tags: [
    {id: 't1', title: 'Riverside Park — summer concerts', kind: 'url', value: 'http://www.example.com/concerts', date: 'Jul 14, 2011', starred: true},
    {id: 't2', title: 'Alex Morgan', kind: 'contact', value: '202-555-0148', date: 'Jul 9, 2011', starred: false},
    {id: 't3', title: 'Bean There Café: free Wi-Fi', kind: 'text', value: 'Network: BeanThere · Password on the receipt', date: 'Jun 30, 2011', starred: false}], myTag: {title: '', text: '', on: false}});
  function tags(ctx) {
    const {ui, lang, data} = ctx, s = tgStore(data), tab = ui.tgTab || 'tags', t = k => T(lang, k);
    if (ui.tgIntro !== undefined) {
      const page = ui.tgIntro;
      return `<div class="app-view tg" data-no-translate><div class="tg-intro"><h3>${e(t('About Tags'))}</h3><div class="tg-page">${page === 0 ? `<p>${e(t('Tags is for organizing and sharing Near Field Communication (NFC) tags.'))}</p><img src="${TA('tag_scan_illustration')}" alt=""><p>${e(t('You scan a tag by turning on your phone and placing it right next to a tag.'))}</p>` : `<p>${e(t('NFC tags can contain text, URLs, pictures, and other kinds of information.'))}</p><p>${e(t('For more information, press Menu and touch Help on any Tags screen.'))}</p>`}</div><div class="tg-buttons"><button data-action="tg-intro" data-id="${page - 1}"${page ? '' : ' disabled'}>${e(t('Back'))}</button><button data-action="tg-intro" data-id="${page + 1}">${e(t(page ? 'Done' : 'Next'))}</button></div></div></div>`;
    }
    const tag = s.tags.find(x => x.id === ui.tgOpen);
    if (tag) return `<div class="app-view tg" data-no-translate><div class="tg-title"><img src="${TA('ic_launcher_nfc')}" alt=""><span><b>${e(tag.title)}</b><small>${e(tag.date)}</small></span><button class="tg-star${tag.starred ? ' on' : ''}" data-action="tg-star" data-id="${tag.id}" aria-label="${e(t('Starred'))}"></button></div><div class="tg-scroll"><button class="tg-record" data-action="tg-record" data-id="${tag.id}"><small>${e(t(tag.kind === 'url' ? 'URL' : tag.kind === 'contact' ? 'Contact' : 'Text'))}</small><b>${e(tag.kind === 'contact' ? AndroidStrings.format(T(lang, 'Call %s'), tag.value) : tag.value)}</b></button></div><div class="tg-buttons"><button data-action="tg-done">${e(t('Done'))}</button><button data-action="tg-delete" data-id="${tag.id}">${e(t('Delete'))}</button></div></div>`;
    const tabs = [['tags', 'Tags', 'all_tags'], ['starred', 'Starred', 'starred'], ['my', 'My tag', 'my_tag']].map(([id, label, icon]) => `<button class="tg-tab${tab === id ? ' on' : ''}" data-action="tg-tab" data-id="${id}"><img src="${TA(`ic_tab_${tab === id ? 'selected' : 'unselected'}_${icon}`)}" alt=""><span>${e(t(label))}</span></button>`).join('');
    let body;
    if (tab === 'my') body = `<div class="tg-my"><label class="tg-switch"><span><b>${e(t('Share my tag'))}</b><small>${e(t('Allow others to read my tag'))}</small></span><input type="checkbox" data-action="tg-share" ${s.myTag.on ? 'checked' : ''}></label><form data-form="tg-my" class="tg-form"><input name="title" value="${e(s.myTag.title)}" placeholder="${e(t('Title'))}" aria-label="${e(t('Title'))}" autocomplete="off"><input name="text" value="${e(s.myTag.text)}" placeholder="${e(t('Text'))}" aria-label="${e(t('Text'))}" autocomplete="off"><button type="submit">${e(t('Save'))}</button></form></div>`;
    else {
      const list = s.tags.filter(x => tab === 'tags' || x.starred);
      body = list.length ? list.map(x => `<button class="tg-item" data-action="tg-open" data-id="${x.id}"><b>${e(x.title)}</b><small>${e(x.date)}</small></button>`).join('') : `<div class="tg-empty"><p>${e(t(tab === 'tags' ? 'You have not scanned any tags.' : 'You have no starred tags.'))}</p><button data-action="tg-intro" data-id="0">${e(t('More info'))}</button></div>`;
    }
    return `<div class="app-view tg" data-no-translate><div class="tg-tabs">${tabs}</div><div class="tg-scroll">${body}</div></div>`;
  }

  // ---------- Voice Dialer ----------
  const VD = name => `assets/vd-${name}.png`;
  function voiceDialer(ctx) {
    const {ui, lang} = ctx, state = ui.vdState || 'starting', t = k => T(lang, k);
    const names = (ctx.contacts || []).slice(0, 3).map(c => c.name);
    return `<div class="app-view vd" data-no-translate><div class="vd-box"><div class="vd-state">${e(t(state === 'starting' ? 'Starting up.' : state === 'failed' ? 'No results, try again.' : 'Listening…'))}</div><div class="vd-sub">${state === 'failed' ? e(t('Please try again.')) : ''}</div><div class="vd-row"><button class="vd-mic" data-action="vd-retry" aria-label="${e(t('Voice Dialer'))}"><img src="${VD(state === 'starting' ? 'ic_vd_mic_off' : state === 'failed' ? 'ic_vd_retry' : 'ic_vd_mic_on')}" alt=""></button><div class="vd-ex"><b>Examples:</b>${names.map(n => `<span>“Call ${e(n)}”</span>`).join('')}<span>“Dial 202 555 0148”</span><span>“Open Calendar”</span></div></div></div>${state === 'failed' ? `<div class="vd-tip"><b>${e(t('Did you know…'))}</b><i></i><p><img src="${VD('ic_vd_green_key')}" alt=""><span>${e(t('Pressing & holding the green Call button opens the Voice Dialer.'))}</span></p></div>` : ''}</div>`;
  }

  function render(ctx) {
    switch (ctx.view) {
      case 'car-home': return carHome(ctx);
      case 'google-voice': return googleVoice(ctx);
      case 'tags': return tags(ctx);
      default: return voiceDialer(ctx);
    }
  }
  let vdTimer = 0, gvTimer = 0;
  function mounted(ctx) {
    const {ui} = ctx;
    if (ctx.view === 'voice-dialer' && (ui.vdState || 'starting') !== 'failed') {
      clearTimeout(vdTimer);
      vdTimer = setTimeout(() => { if (ui.view !== 'voice-dialer') return; ui.vdState = ui.vdState === 'listening' ? 'failed' : 'listening'; ctx.render(); }, ui.vdState === 'listening' ? 3500 : 900);
    }
  }
  function menu(ctx) {
    const {view, ui, lang} = ctx, t = k => T(lang, k);
    if (view === 'google-voice') return ui.gvOpen
      ? [{action: 'gv-call', title: 'Call', icon: 'gv-ic_menu_call_gingerbread.png'}, {action: 'gv-sms-open', title: 'Text', icon: 'gv-ic_menu_sms_gingerbread.png'}, {action: 'gv-archive', title: 'Archive', icon: 'gv-ic_menu_archive_gingerbread.png'}, {action: 'gv-delete', title: 'Delete', icon: 'gv-ic_menu_delete_gingerbread.png'}, {action: 'gv-star', id: ui.gvOpen, title: 'Add star', icon: 'gv-ic_menu_star_gingerbread.png'}]
      : [{action: 'gv-compose', title: 'Compose', icon: 'gv-ic_menu_compose_gingerbread.png'}, {action: 'gv-labels', title: 'Labels', icon: 'gv-ic_menu_labels_gingerbread.png'}, {action: 'gv-refresh', title: 'Refresh', icon: 'gv-ic_menu_refresh_gingerbread.png'}, {action: 'gv-search', title: 'Search', icon: 'gv-ic_menu_search_gingerbread.png'}, {action: 'gv-unsupported', title: 'Balance', icon: 'gv-ic_menu_balance_gingerbread.png'}, {action: 'gbpref-open', id: 'gv-settings', title: 'Settings', icon: 'ic_menu_preferences'}, {action: 'gv-unsupported', title: 'Help', icon: 'ic_menu_help'}];
    if (view === 'tags') return ui.tgOpen ? [{action: 'tg-delete', id: ui.tgOpen, title: t('Delete tag'), icon: 'ic_menu_delete'}, {action: 'tg-intro', id: '0', title: t('Help'), icon: 'ic_menu_help'}] : [{action: 'tg-intro', id: '0', title: t('Help'), icon: 'ic_menu_help'}, {action: 'tg-settings', title: t('Settings'), icon: 'ic_menu_preferences'}];
    if (view === 'car-home') return [{action: 'ch-open', id: 'exit', title: T(lang, 'Exit car mode'), icon: 'ch-ic_exit_carhome.png'}, {action: 'gbpref-open', id: 'car-settings', title: t('Settings'), icon: 'ic_menu_preferences'}];
    return [];
  }
  function dialog(kind, ctx) {
    const {lang} = ctx, t = k => T(lang, k);
    if (kind === 'nfc') return {title: t('NFC turned off'), icon: 'ic_dialog_alert', message: t('You must turn on NFC to scan tags.'), buttons: [{action: 'tg-settings', title: t('Settings')}, {action: 'close-overlay', title: t('Cancel')}]};
    if (kind === 'car-tint') return {title: t('Pick a color'), icon: 'ch-ic_settings.png', custom: `<div class="ch-palette">${PALETTE.map(c => `<button type="button" data-action="ch-tint-pick" data-id="${c}" style="--swatch:${c}" aria-label="${c}"><img src="assets/ch-ic_color_pick_normal.png" alt=""></button>`).join('')}</div>`, buttons: [{action: 'close-overlay', title: ctx.cancel}]};
    if (kind === 'car-wallpaper') return {title: t('Car Home Wallpaper'), items: [{action: 'ch-wallpaper-pick', id: 'system', title: t('Same as Home screen'), icon: 'ch-ic_system_wallpaper.png'}, {action: 'ch-wallpaper-pick', id: 'gallery', title: t('Select from Gallery'), icon: 'ch-ic_sdcard_wallpaper.png'}]};
    if (kind === 'car-pictures') return {title: t('Select from Gallery'), custom: `<div class="gbmms-pictures">${ctx.data.photos.filter(p => !p.video).map(p => `<button type="button" data-action="ch-wallpaper-photo" data-id="${p.id}">${window.ICSMessaging.photo(p)}</button>`).join('')}</div>`, buttons: [{action: 'close-overlay', title: ctx.cancel}]};
    if (kind === 'car-reset') return {title: t('Reset to defaults'), icon: 'ic_dialog_alert', message: t('Delete all custom settings and shortcuts ?'), buttons: [{action: 'ch-reset-ok', title: ctx.ok}, {action: 'close-overlay', title: ctx.cancel}]};
    if (kind === 'car-disclaimer') return {title: t('Disclaimer'), custom: `<div class="ch-disclaimer"><p>${e(t('Please exercise caution'))}</p><button type="button" class="ch-tos" data-action="ch-tos">${e(t('Terms of Service'))}</button><button type="button" class="ch-always" data-action="ch-disclaimer-check" role="checkbox" aria-checked="${!!ctx.ui.chDisclaimer}"><img src="assets/gb-btn_check_${ctx.ui.chDisclaimer ? 'on' : 'off'}.png" alt="">${e(t('Always show'))}</button></div>`, buttons: [{action: 'ch-disclaimer-ok', title: t('Continue')}]};
    if (kind === 'car-add') return {title: t('Car applications'), items: ['navigation', 'maps', 'places', 'music', 'phone', 'people', 'voice-search', 'talk', 'gmail', 'news-weather'].map(app => ({action: 'ch-add-pick', id: app, title: ctx.t(ctx.appName(app)), icon: `${app}.png`}))};
    if (kind === 'gv-compose') return {title: 'Compose', custom: `<form data-form="gv-new"><input class="gbdlg-input" name="to" placeholder="To" aria-label="To" autocomplete="off"><input class="gbdlg-input" name="text" placeholder="Type to compose" aria-label="Type to compose" autocomplete="off"></form>`, buttons: [{action: 'gv-new-send', title: 'Send'}, {action: 'close-overlay', title: 'Cancel'}]};
    return null;
  }
  function handle(action, id, ctx, button) {
    const {ui, data, lang} = ctx, close = () => { ui.overlay = ''; ctx.renderOverlay(); };
    switch (action) {
      case 'ch-screen': ui.chScreen = Math.max(0, Math.min(CAR.length - 1, (ui.chScreen || 0) + Number(id))); ctx.render(); break;
      case 'ch-open': close();
        if (id === 'exit') { ui.chScreen = 0; ctx.home(); }
        else if (id === 'night') { data.carNight = !data.carNight; ctx.save(); ctx.render(); }
        else if (id === 'settings') { ui.gbPrefs = {app: 'car-settings', view: 'car-home'}; ctx.render(); }
        else if (button?.dataset.app) ctx.openApp(button.dataset.app);
        else ctx.openApp(id);
        break;
      case 'ch-add': ui.chSlot = id; ctx.dialog('car-add'); break;
      // Settings' Colorize icons, Wallpaper, Reset to defaults, Android settings and Bluetooth (gb-prefs.js rows).
      case 'ch-tint': ctx.dialog('car-tint'); break;
      case 'ch-tint-pick': data.carTint = id; close(); ctx.save(); ctx.render(); break;
      case 'ch-wallpaper': ctx.dialog('car-wallpaper'); break;
      case 'ch-wallpaper-pick': if (id === 'gallery') { ctx.dialog('car-pictures'); break; } delete data.carWallpaper; close(); ctx.save(); ctx.render(); break;
      case 'ch-wallpaper-photo': data.carWallpaper = id; close(); ctx.save(); ctx.render(); break;
      case 'ch-reset': ctx.dialog('car-reset'); break;
      case 'ch-reset-ok': delete data.carHome; delete data.carTint; delete data.carWallpaper; (data.appPrefs ||= {})['car-settings'] = {}; close(); ctx.save(); ctx.render(); break;
      case 'ch-android-settings': ui.gbPrefs = null; ctx.openApp('settings'); break;
      case 'ch-bluetooth': data.settings.bluetooth = !data.settings.bluetooth; ctx.save(); ctx.render(); break;
      // The disclaimer: Always show unticked turns it off; Continue closes it; Terms of Service opens the link.
      case 'ch-disclaimer-check': ui.chDisclaimer = !ui.chDisclaimer; ctx.renderOverlay(); break;
      case 'ch-disclaimer-ok': ((data.appPrefs ||= {})['car-settings'] ||= {})['settings.always_show_disclaimer'] = !!ui.chDisclaimer; close(); ctx.save(); break;
      case 'ch-tos': close(); ctx.browse('http://m.google.com/toscountry'); break;
      case 'ch-add-pick': (data.carHome ||= {})[ui.chSlot] = id; close(); ctx.save(); ctx.render(); break;
      case 'gv-open': { const c = gvStore(data).find(x => x.id === id); if (c) { c.read = true; ui.gvOpen = id; ctx.save(); ctx.render(); } break; }
      case 'gv-star': { const c = gvStore(data).find(x => x.id === id); if (c) c.starred = !c.starred; close(); ctx.save(); ctx.render(); break; }
      case 'gv-labels': close(); ui.gvLabels = true; ctx.render(); break;
      case 'gv-label': ui.gvLabel = id; ui.gvLabels = false; ui.gvQuery = ''; ctx.render(); break;
      case 'gv-play': { ui.gvPlaying = ui.gvPlaying === id ? '' : id; ctx.render(); clearTimeout(gvTimer); if (ui.gvPlaying) gvTimer = setTimeout(() => { ui.gvPlaying = ''; if (ui.view === 'google-voice') ctx.render(); }, 6000); break; }
      case 'gv-call': { const c = gvStore(data).find(x => x.id === ui.gvOpen); close(); if (c) ctx.call(c.number); break; }
      case 'gv-sms-open': close(); ctx.focus('.gv-compose input'); break;
      case 'gv-archive': case 'gv-delete': { const c = gvStore(data).find(x => x.id === ui.gvOpen); if (c) c.label = action === 'gv-delete' ? 'trash' : 'archive'; ui.gvOpen = ''; close(); ctx.save(); ctx.render(); break; }
      case 'gv-compose': ctx.dialog('gv-compose'); ctx.focus('.gbdlg [name=to]'); break;
      case 'gv-new-send': document.querySelector('.gbdlg form[data-form="gv-new"]')?.requestSubmit(); break;
      case 'gv-refresh': close(); ctx.toast('Getting messages'); break;
      case 'gv-search': close(); ui.gvSearching = true; ctx.render(); ctx.focus('.gbbr-search input'); break;
      case 'gv-search-cancel': ui.gvSearching = false; ctx.render(); break;
      case 'gv-unsupported': close(); ctx.toast('This feature is not part of the simulator.'); break;
      // Settings › Sync and notifications › Background data: the system's Accounts & sync settings.
      case 'gv-sync-settings': ui.gbPrefs = null; ctx.openApp('settings'); ui.gbSettingsStack = ['']; ui.sub = 'sync'; ctx.render(); break;
      case 'tg-tab': ui.tgTab = id; ctx.render(); break;
      case 'tg-open': ui.tgOpen = id; ctx.render(); break;
      case 'tg-done': ui.tgOpen = ''; ctx.render(); break;
      case 'tg-star': { const tag = tgStore(data).tags.find(x => x.id === id); if (tag) tag.starred = !tag.starred; ctx.save(); ctx.render(); break; }
      case 'tg-delete': { const s = tgStore(data); s.tags = s.tags.filter(x => x.id !== id); ui.tgOpen = ''; close(); ctx.save(); ctx.render(); ctx.toast(T(lang, 'Tag deleted')); break; }
      case 'tg-record': { const tag = tgStore(data).tags.find(x => x.id === id); if (!tag) break; if (tag.kind === 'url') ctx.browse(tag.value); else if (tag.kind === 'contact') ctx.call(tag.value); break; }
      case 'tg-intro': close(); { const n = Number(id); ui.tgIntro = n > 1 || n < 0 ? undefined : n; } ctx.render(); break;
      case 'tg-share': { const s = tgStore(data); s.myTag.on = !s.myTag.on; ctx.save(); break; }
      case 'tg-settings': close(); ctx.openApp('settings'); break;
      case 'vd-retry': ui.vdState = 'listening'; ctx.render(); break;
      default: return false;
    }
    return true;
  }
  function submit(form, values, ctx) {
    const {ui, data} = ctx;
    if (form === 'gv-search') { const query = String(values.get('query') || '').trim(); if (!query) return true; ui.gvSearching = false; ui.gvQuery = query; ctx.render(); return true; }
    if (form === 'gv-sms') { const text = String(values.get('text') || '').trim(), c = gvStore(data).find(x => x.id === ui.gvOpen); if (!text || !c) return true; c.items.push({me: true, text}); c.mins = 0; ctx.save(); ctx.render(); ctx.toast('Message sent via Google Voice.'); return true; }
    if (form === 'gv-new') { const to = String(values.get('to') || '').trim(), text = String(values.get('text') || '').trim(); if (!to || !text) return true; gvStore(data).unshift({id: 'v' + Date.now(), name: to, number: to, kind: 'sms', mins: 0, read: true, starred: false, label: 'inbox', items: [{me: true, text}]}); ui.overlay = ''; ctx.renderOverlay(); ctx.save(); ctx.render(); ctx.toast('Message sent via Google Voice.'); return true; }
    if (form === 'tg-my') { const s = tgStore(data); s.myTag.title = String(values.get('title') || '').trim(); s.myTag.text = String(values.get('text') || '').trim(); ctx.save(); ctx.toast(T(ctx.lang, 'Save')); return true; }
    return false;
  }
  function back(ctx) {
    const {ui, view} = ctx;
    if (view === 'google-voice' && ui.gvOpen) { ui.gvOpen = ''; ctx.render(); return true; }
    if (view === 'google-voice' && ui.gvLabels) { ui.gvLabels = false; ctx.render(); return true; }
    if (view === 'google-voice' && ui.gvSearching) { ui.gvSearching = false; ctx.render(); return true; }
    if (view === 'google-voice' && ui.gvQuery) { ui.gvQuery = ''; ctx.render(); return true; }
    if (view === 'tags' && ui.tgIntro !== undefined) { ui.tgIntro = undefined; ctx.render(); return true; }
    if (view === 'tags' && ui.tgOpen) { ui.tgOpen = ''; ctx.render(); return true; }
    if (view === 'car-home' && ui.chScreen) { ui.chScreen = 0; ctx.render(); return true; }
    return false;
  }
  function open(ctx, resume) {
    const {ui, view, data} = ctx;
    if (resume) return;
    if (view === 'google-voice') { ui.gvOpen = ''; ui.gvLabels = false; ui.gvLabel = 'inbox'; ui.gvQuery = ''; ui.gvSearching = false; }
    if (view === 'tags') { ui.tgOpen = ''; ui.tgIntro = undefined; if (data.settings?.nfc === false) setTimeout(() => ctx.dialog('nfc')); }
    if (view === 'voice-dialer') ui.vdState = 'starting';
    if (view === 'car-home') { ui.chScreen = 0; if (carPrefs(data)['settings.always_show_disclaimer'] !== false) { ui.chDisclaimer = true; requestAnimationFrame(() => ctx.dialog('car-disclaimer')); } }
  }
  const module = {render, mounted, menu, dialog, handle, submit, back, open};
  for (const id of ['car-home', 'google-voice', 'tags', 'voice-dialer']) GBApps.register(id, module);
  window.GBExtraApps = {T, CAR, GV_LABELS, gvStore};
})();
