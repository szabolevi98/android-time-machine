/* Android 6.0.1 Settings (Settings.apk MTC20K): the screens under Language & input, Date & time, Accessibility,
   Backup & reset and Printing that have code of their own.
   - LocalePicker (com.android.internal.app.LocalePicker): the system's locales (the language-region configurations
     of framework-res.apk, without the pseudo-locales of user builds), each in its own language, the country only for a
     language with several; picking one of the simulator's five languages switches it (the page follows), the others
     are listed as the phone lists them.
   - SpellCheckersSettings (spellchecker_prefs.xml under the switch bar): Language (Use system language, or one of the
     spell checker's locales) and the Google Spell Checker with its settings button; UserDictionarySettings: the empty text and Add (UserDictionaryAddWordActivity's word, shortcut).
   - Current Keyboard: InputMethodPicker's dialog (Change keyboard: Show input method, the enabled keyboards, Choose
     keyboards).
   - Date & time: Set date / Set time greyed while Automatic date & time is on (they open the framework's
     DatePickerDialog / TimePickerDialog, the chosen moment kept as an offset), Select time zone opens ZonePicker: the
     zones of timezones.xml with their GMT offsets, sorted by name or by offset; the names are the city names of the
     image's DeskClock (cities.xml, translated) for the zone, else the zone id's city.
   - Accessibility > Captions: CaptionPropertiesFragment (see there).
   - Accessibility: ToggleAccessibilityServicePreferenceFragment for TalkBack and Switch Access (the switch bar, the
     service's description, Settings; turning one on asks enable_service_title with what it can do, off
     disable_service_title), ToggleScreenMagnificationPreferenceFragment and ToggleGlobalGesturePreferenceFragment (the
     switch bar over their summaries).
   - Backup & reset > Back up my data (ToggleBackupSettingFragment: the switch bar, backup_data_summary; off asks
     backup_erase_dialog_message), Printing > Cloud Print (PrintServiceSettingsFragment: the switch bar, on asks
     print_service_security_warning, then searching and No printers found; Add printer / Settings in the menu). */
(() => {
  'use strict';
  const T = () => MM.text('settings');
  const S = c => c.data.settings;
  const esc = (c, s) => c.safe(s);
  const go = (c, screen, title) => MM.settingsGo(c, screen, title);
  const bar = (c, action, on) => `<button type="button" class="mmst-switchbar" data-action="${action}"><span>${esc(c, T().t(on ? 'switch_on_text' : 'switch_off_text'))}</span><i class="mmw-switch${on ? ' on' : ''}"><i class="mmw-thumb"></i></i></button>`;
  const text = (c, s) => `<div class="mmsx-text">${esc(c, s)}</div>`;
  const pref = (c, action, title, summary = '', extra = '', widget = '') => `<button type="button" class="mmst-pref" data-action="${action}"${extra}><span class="mmst-texts"><span class="mmst-title">${esc(c, title)}</span>${summary ? `<span class="mmst-summary">${esc(c, summary)}</span>` : ''}</span>${widget ? `<span class="mmst-widget">${widget}</span>` : ''}</button>`;
  const radio = (c, label, on) => ({html: `<span class="mmst-choice"><i class="mmw-radio${on ? ' on' : ''}"></i><span>${esc(c, label)}</span></span>`});

  // -- Language ------------------------------------------------------------------------------------------------------
  // framework-res.apk's language-region configurations (aapt2 dump configurations), the pseudo-locales en-XA / ar-XB left out.
  const LOCALES = 'af-ZA am-ET ar-EG az-AZ bg-BG bn-BD ca-ES cs-CZ da-DK de-DE el-GR en-AU en-GB en-IN en-US es-ES es-US et-EE eu-ES fa-IR fi-FI fr-CA fr-FR gl-ES gu-IN hi-IN hr-HR hu-HU hy-AM in-ID is-IS it-IT iw-IL ja-JP ka-GE kk-KZ km-KH kn-IN ko-KR ky-KG lo-LA lt-LT lv-LV mk-MK ml-IN mn-MN mr-IN ms-MY my-MM nb-NO ne-NP nl-NL pl-PL pt-BR pt-PT ro-RO ru-RU si-LK sk-SK sl-SI sq-AL sr-RS sv-SE sw-TZ ta-IN te-IN th-TH tl-PH tr-TR uk-UA ur-PK uz-UZ vi-VN zh-CN zh-HK zh-TW zu-ZA'.split(' ');
  const bcp = tag => tag.replace(/^in-/, 'id-').replace(/^iw-/, 'he-').replace(/^tl-/, 'fil-');
  const cap = (s, loc) => s ? s.charAt(0).toLocaleUpperCase(loc) + s.slice(1) : s;
  function localeName(tag) {
    const b = bcp(tag), lang = b.split('-')[0], several = LOCALES.filter(x => bcp(x).split('-')[0] === lang).length > 1;
    try {
      const dn = new Intl.DisplayNames([b], {type: 'language'}), rn = new Intl.DisplayNames([b], {type: 'region'});
      const name = cap(dn.of(lang), b);
      return several ? `${name} (${rn.of(b.split('-')[1])})` : name;
    } catch { return tag; }
  }
  const SIM = {en: 'en-US', hu: 'hu-HU', de: 'de-DE', fr: 'fr-FR', es: 'es-ES'};
  const systemLocale = c => S(c).locale || SIM[c.lang] || 'en-US';
  MM.systemLocaleName = c => localeName(systemLocale(c));
  MM.settingsScreens.locale = {
    title: () => T().t('phone_language'),
    render(c) {
      const col = new Intl.Collator(c.locale()), list = LOCALES.map(tag => ({tag, name: localeName(tag)})).sort((a, b) => col.compare(a.name, b.name));
      return `<div class="mmst-list">${list.map(x => `<button type="button" class="mmst-pref small" data-action="mmsx-locale" data-tag="${x.tag}"><span class="mmst-texts"><span class="mmst-title">${esc(c, x.name)}</span></span></button>`).join('')}</div>`;
    },
    action(c, name, el) {
      if (name !== 'mmsx-locale') return false;
      const tag = el.dataset.tag, lang = Object.keys(SIM).find(l => SIM[l] === tag || (l !== 'en' && tag.startsWith(l + '-')));
      S(c).locale = tag; c.save();
      c.ui.settings.stack.pop();
      // The simulator's language follows (the page reloads in it, as the language menu beside the phone does).
      if (lang && lang !== c.lang) { window.AndroidI18n?.setLanguage(lang); location.reload(); return true; }
      c.render();
      return true;
    }
  };

  // -- Spell checker, personal dictionary ------------------------------------------------------------------------------
  /* The spell checker's subtypes (LatinImeGoogle's res/xml/spellchecker.xml, label subtype_generic "%s": the locale's
     name). Language opens showChooseLanguageDialog (phone_language: Use system language, then the subtypes, single
     choice); the Google Spell Checker row is SpellCheckerPreference: its radio (the current spell checker), a divider
     and the settings button (ic_sysbar_quicksettings) that opens its settingsActivity, SpellCheckerSettingsActivity. */
  const SPELL_LOCALES = ['en', 'en_US', 'en_GB', 'cs', 'da', 'de', 'el', 'es', 'fi', 'fr', 'hr', 'it', 'iw', 'lt', 'lv', 'nb', 'nl', 'pl', 'pt_BR', 'pt_PT', 'ru', 'sl', 'sr', 'sv', 'tr'];
  const spellName = (c, code) => { try { return new Intl.DisplayNames([c.locale()], {type: 'language'}).of(code.replace('iw', 'he').replace('_', '-')); } catch { return code; } };
  MM.settingsScreens.spellcheck = {
    title: () => T().t('spellcheckers_settings_title'),
    bar: c => bar(c, 'mmsx-spell', S(c).spellCheck ?? true),
    render(c) {
      const t = T(), on = S(c).spellCheck ?? true, lang = S(c).spellLang || '';
      const gear = `<span class="mmst-widget mmsx-usermanage"><i class="mmsx-userdiv np-fw-divider_horizontal_dark"></i><span class="mmsx-usergear mmsx-spellgear" role="button" data-action="mmsx-spellsettings" aria-label="${esc(c, t.t('settings_label'))}"><img src="assets/st-ic_sysbar_quicksettings.png" alt=""></span></span>`;
      return `<div class="mmst-list${on ? '' : ' off'}">${pref(c, 'mmsx-spelllang', t.t('spellchecker_language'), lang ? spellName(c, lang) : t.t('use_system_language_to_select_input_method_subtypes'))}`
        + `<button type="button" class="mmst-pref" data-action="mmsx-none"><span class="mmst-iconframe"><i class="mmw-radio on"></i></span><span class="mmst-texts"><span class="mmst-title">${esc(c, MM.text('appprefs').t('LatinImeGoogle/spell_checker_service_name'))}</span></span>${gear}</button></div>`;
    },
    action(c, name) {
      const t = T();
      if (name === 'mmsx-spell') { S(c).spellCheck = !(S(c).spellCheck ?? true); c.save(); c.render(); return true; }
      if (name === 'mmsx-spelllang') {
        const cur = S(c).spellLang || '', codes = ['', ...SPELL_LOCALES];
        c.dialog({title: t.t('phone_language'), items: codes.map(code => radio(c, code ? spellName(c, code) : t.t('use_system_language_to_select_input_method_subtypes'), code === cur)),
          onItem: i => { S(c).spellLang = codes[i]; c.save(); c.render(); }});
        return true;
      }
      if (name === 'mmsx-spellsettings') { MM.openPrefs(c, 'keyboard', 'spell_checker_settings', MM.text('appprefs').t('LatinImeGoogle/android_spell_checker_settings')); return true; }
      return name === 'mmsx-none';
    }
  };
  const words = c => S(c).userWords || (S(c).userWords = []);
  function addWord(c, edit) {
    const t = T();
    let word = edit?.word || '', shortcut = edit?.shortcut || '';
    c.dialog({title: t.t(edit ? 'user_dict_settings_edit_dialog_title' : 'user_dict_settings_add_dialog_title'),
      html: `<div class="mmsx-form"><label>${esc(c, t.t('user_dict_settings_add_word_option_name'))}<input data-f="word" value="${esc(c, word)}" placeholder="${esc(c, t.t('user_dict_settings_add_word_hint'))}" autocomplete="off"></label><label>${esc(c, t.t('user_dict_settings_add_shortcut_option_name'))}<input data-f="shortcut" value="${esc(c, shortcut)}" placeholder="${esc(c, t.t('user_dict_settings_add_shortcut_hint'))}" autocomplete="off"></label></div>`,
      mount: (c, win) => { win.querySelectorAll('input').forEach(f => f.addEventListener('input', () => { if (f.dataset.f === 'word') word = f.value; else shortcut = f.value; })); setTimeout(() => win.querySelector('input').focus(), 50); },
      buttons: [...(edit ? [{label: t.t('user_dict_settings_context_menu_delete_title'), neutral: true, action: c => { S(c).userWords = words(c).filter(w => w !== edit); c.save(); c.render(); }}] : []), {label: t.t('cancel')},
        {label: t.t('user_dict_settings_add_dialog_confirm'), action: c => { if (!word.trim()) return; if (edit) Object.assign(edit, {word: word.trim(), shortcut: shortcut.trim()}); else words(c).push({word: word.trim(), shortcut: shortcut.trim()}); c.save(); c.render(); }}]});
  }
  MM.settingsScreens['user-dictionary'] = {
    title: () => T().t('user_dict_settings_title'),
    actions: c => `<button type="button" class="mmst-ab-btn" data-action="mmsx-addword" aria-label="${esc(c, T().t('user_dict_settings_add_menu_title'))}"><img src="assets/st-ic_menu_add.svg" alt=""></button>`,
    render(c) {
      const list = [...words(c)].sort((a, b) => a.word.localeCompare(b.word, c.locale()));
      if (!list.length) return `<div class="mmst-empty center"><span>${esc(c, T().t('user_dict_settings_empty_text'))}</span></div>`;
      return `<div class="mmst-list">${list.map(w => pref(c, 'mmsx-word', w.word, w.shortcut, ` data-w="${esc(c, w.word)}"`)).join('')}</div>`;
    },
    action(c, name, el) {
      if (name === 'mmsx-addword') { addWord(c); return true; }
      if (name === 'mmsx-word') { addWord(c, words(c).find(w => w.word === el.dataset.w)); return true; }
      return false;
    }
  };
  // InputMethodManagerService.showInputMethodMenu: Change keyboard with the hardware keyboard's switch (no hardware
  // keyboard: none), the enabled keyboards (Google Keyboard in the system language) and Choose keyboards
  // (showConfigureInputMethods: Settings' Language & input).
  MM.imePicker = c => {
    const t = T(), name = `${MM.systemLocaleName(c)} - ${MM.text('appprefs').t('LatinImeGoogle/english_ime_name')}`;
    c.dialog({title: t.t('framework/select_input_method'), items: [radio(c, name, true)], buttons: [{label: t.t('framework/configure_input_methods'), action: c => { if (c.ui.view === 'settings') MM.settingsGo(c, 'xml:language_settings', t.t('language_keyboard_settings_title')); else c.open('settings', 'xml:language_settings'); }}]});
  };

  // -- Date & time ---------------------------------------------------------------------------------------------------
  const cityByZone = c => { const col = {en: 2, hu: 3, de: 4, fr: 5, es: 6}[c.lang] ?? 2, map = {}; for (const r of MM.deskClockCities || []) if (!map[r[1]]) map[r[1]] = String(r[col] || r[2]).split('=').pop(); return map; };
  const offsetMin = tz => { try { const p = new Intl.DateTimeFormat('en-US', {timeZone: tz, timeZoneName: 'longOffset'}).formatToParts(new Date()).find(x => x.type === 'timeZoneName').value; const m = /GMT([+-])(\d+)(?::(\d+))?/.exec(p); return m ? (m[1] === '-' ? -1 : 1) * (+m[2] * 60 + +(m[3] || 0)) : 0; } catch { return 0; } };
  const gmt = min => `GMT${min < 0 ? '-' : '+'}${String(Math.floor(Math.abs(min) / 60)).padStart(2, '0')}:${String(Math.abs(min) % 60).padStart(2, '0')}`;
  MM.settingsScreens.timezone = {
    title: () => T().t('date_time_set_timezone'),
    actions: c => MM.menu.button(c),
    render(c) {
      const names = cityByZone(c), col = new Intl.Collator(c.locale());
      const zones = (MM.settingsXml.timezones?.c || []).map(n => n.id).map(id => ({id, name: names[id] || id.split('/').pop().replace(/_/g, ' '), off: offsetMin(id)}));
      zones.sort((a, b) => c.ui.zoneByName === false ? a.off - b.off || col.compare(a.name, b.name) : col.compare(a.name, b.name));
      const cur = S(c).timeZone;
      return `<div class="mmst-list">${zones.map(z => `<button type="button" class="mmst-pref${z.id === cur ? ' on' : ''}" data-action="mmsx-zone" data-id="${z.id}"><span class="mmst-texts"><span class="mmst-title">${esc(c, z.name)}</span><span class="mmst-summary">${gmt(z.off)}</span></span></button>`).join('')}</div>`;
    },
    action(c, name, el) {
      const t = T();
      if (name === 'mm-menu') { c.menu([{label: t.t(c.ui.zoneByName === false ? 'zone_list_menu_sort_alphabetically' : 'zone_list_menu_sort_by_timezone'), action: c => { c.ui.zoneByName = c.ui.zoneByName === false; c.render(); }}]); return true; }
      if (name === 'mmsx-zone') { S(c).timeZone = el.dataset.id; S(c).autoZone = false; c.save(); c.ui.settings.stack.pop(); c.render(); return true; }
      return false;
    }
  };
  // The framework's DatePickerDialog (date_picker_dialog: DatePicker in calendar mode, the header with the year and the
  // date in colorAccent): the month grid of the chosen month, the year list behind the header's year.
  MM.datePicker = (c, date, onSet) => {
    let d = new Date(date.getFullYear(), date.getMonth(), date.getDate()), month = new Date(d.getFullYear(), d.getMonth(), 1);
    const fmt = (o, x) => new Intl.DateTimeFormat(c.locale(), o).format(x);
    const draw = win => {
      const first = (month.getDay() - (new Intl.Locale(c.locale()).weekInfo?.firstDay ?? 1) % 7 + 7) % 7, days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
      const wd = Array.from({length: 7}, (_, i) => fmt({weekday: 'narrow'}, new Date(2017, 0, 2 + ((new Intl.Locale(c.locale()).weekInfo?.firstDay ?? 1) - 1 + i) % 7)));
      win.querySelector('.mmsx-dphead').innerHTML = `<small>${esc(c, d.getFullYear())}</small><b>${esc(c, fmt({weekday: 'short', month: 'short', day: 'numeric'}, d))}</b>`;
      win.querySelector('.mmsx-dpmonth').innerHTML = `<button type="button" data-m="-1">‹</button><span>${esc(c, fmt({month: 'long', year: 'numeric'}, month))}</span><button type="button" data-m="1">›</button>`;
      win.querySelector('.mmsx-dpgrid').innerHTML = wd.map(x => `<i>${esc(c, x)}</i>`).join('') + '<s></s>'.repeat(first) + Array.from({length: days}, (_, i) => `<button type="button" data-d="${i + 1}" class="${month.getFullYear() === d.getFullYear() && month.getMonth() === d.getMonth() && d.getDate() === i + 1 ? 'on' : ''}">${i + 1}</button>`).join('');
    };
    c.dialog({html: '<div class="mmsx-dp"><div class="mmsx-dphead"></div><div class="mmsx-dpmonth"></div><div class="mmsx-dpgrid"></div></div>',
      mount(c, win) {
        draw(win);
        win.addEventListener('click', e => {
          const m = e.target.closest('[data-m]'), day = e.target.closest('[data-d]');
          if (m) { e.stopPropagation(); month = new Date(month.getFullYear(), month.getMonth() + +m.dataset.m, 1); draw(win); }
          if (day) { e.stopPropagation(); d = new Date(month.getFullYear(), month.getMonth(), +day.dataset.d); draw(win); }
        });
      },
      buttons: [{label: MM.text('framework').t('cancel')}, {label: MM.text('framework').t('ok'), action: c => onSet(c, d)}]});
  };

  // -- Accessibility services and toggles ------------------------------------------------------------------------------
  const SERVICE = {a11y_talkback: {title: 'talkback/talkback_title', desc: 'talkback/talkback_service_description', caps: ['canRetrieveWindowContent', 'canRequestTouchExploration', 'canRequestFilterKeyEvents']},
    a11y_switch: {title: 'talkback/switch_service_name', desc: 'talkback/switch_access_service_description', caps: ['canRetrieveWindowContent', 'canRequestFilterKeyEvents']}};
  const a11y = c => S(c).a11y || (S(c).a11y = {});
  MM.settingsScreens.a11y = {
    title: (c, cur) => { const k = cur.screen.split(':')[1]; return SERVICE[k] ? T().t(SERVICE[k].title) : cur.title; },
    bar: (c, cur) => bar(c, 'mmsx-a11y', !!a11y(c)[cur.screen.split(':')[1]]),
    actions: (c, cur) => SERVICE[cur.screen.split(':')[1]] ? MM.menu.button(c) : '',
    render(c, cur) {
      const t = T(), k = cur.screen.split(':')[1];
      if (k === 'screen_magnification_preference_screen') return text(c, t.t('accessibility_screen_magnification_summary'));
      if (k === 'enable_global_gesture_preference_screen') return text(c, t.t('accessibility_global_gesture_preference_description'));
      return text(c, t.t(SERVICE[k]?.desc) || t.t('accessibility_service_default_description'));
    },
    action(c, name, el, cur) {
      const t = T(), k = cur.screen.split(':')[1], s = a11y(c), svc = SERVICE[k];
      if (name === 'mm-menu') { c.menu([{label: t.t('accessibility_menu_item_settings'), disabled: true, action: () => {}}]); return true; }
      if (name !== 'mmsx-a11y') return false;
      const flip = c => { s[k] = !s[k]; if (k === 'enable_global_gesture_preference_screen') s.shortcut = s[k]; c.save(); c.render(); };
      if (!svc) { flip(c); return true; }
      const title = t.t(svc.title);
      if (s[k]) c.dialog({title: t.fmt('disable_service_title', null, title), message: t.fmt('disable_service_message', null, title), buttons: [{label: t.t('cancel')}, {label: t.t('framework/ok'), action: flip}]});
      else c.dialog({title: t.fmt('enable_service_title', null, title), html: `<div class="mmsx-caps"><p>${esc(c, t.fmt('capabilities_list_title', null, title))}</p>${svc.caps.map(cap => `<p><b>• ${esc(c, t.t(`framework/capability_title_${cap}`))}</b><br>${esc(c, t.t(`framework/capability_desc_${cap}`))}</p>`).join('')}</div>`,
        buttons: [{label: t.t('cancel')}, {label: t.t('framework/ok'), action: flip}]});
      return true;
    }
  };

  // -- Backup, Cloud Print -------------------------------------------------------------------------------------------
  MM.settingsScreens.backup = {
    title: () => T().t('backup_data_title'),
    bar: c => bar(c, 'mmsx-backup', !!S(c).backup),
    render: c => text(c, T().t('backup_data_summary')),
    action(c, name) {
      if (name !== 'mmsx-backup') return false;
      const t = T(), s = S(c);
      if (s.backup) c.dialog({message: t.t('backup_erase_dialog_message'), buttons: [{label: t.t('cancel')}, {label: t.t('framework/ok'), action: c => { s.backup = false; c.save(); c.render(); }}]});
      else { s.backup = true; c.save(); c.render(); }
      return true;
    }
  };
  MM.settingsScreens.cloudprint = {
    title: () => T().t('CloudPrint2/app_name'),
    bar: c => bar(c, 'mmsx-cloudprint', !!S(c).cloudPrint),
    actions: c => MM.menu.button(c),
    render(c) {
      const t = T();
      if (!S(c).cloudPrint) return '<div class="mmst-list"></div>';
      const searching = (c.ui.cloudPrintAt || 0) > Date.now();
      if (searching) setTimeout(() => c.ui.view === 'settings' && c.render(), c.ui.cloudPrintAt - Date.now() + 30);
      return `<div class="mmst-empty center"><span>${esc(c, t.t(searching ? 'print_searching_for_printers' : 'print_no_printers_found'))}</span></div>`;
    },
    action(c, name) {
      const t = T(), s = S(c);
      if (name === 'mm-menu') { c.menu([{label: t.t('print_menu_item_add_printer'), disabled: !s.cloudPrint, action: () => {}}, {label: t.t('print_menu_item_settings'), disabled: !s.cloudPrint, action: () => {}}]); return true; }
      if (name !== 'mmsx-cloudprint') return false;
      if (s.cloudPrint) { s.cloudPrint = false; c.save(); c.render(); return true; }
      const title = t.t('CloudPrint2/app_name');
      c.dialog({title: t.fmt('print_service_security_warning_title', null, title), message: t.t('print_service_security_warning_summary'), buttons: [{label: t.t('cancel')}, {label: t.t('framework/ok'), action: c => { s.cloudPrint = true; c.ui.cloudPrintAt = Date.now() + 3000; c.save(); c.render(); }}]});
      return true;
    }
  };
  /* -- Captions (CaptionPropertiesFragment, captioning_settings.xml) -----------------------------------------------
     captioning_preview over the list: caption_background (centerCrop, 200 dp), and at its bottom in 16 dp the
     SubtitleView with captioning_preview_text in the user's style (applyCaptionProperties: 0.0533 of the larger of
     width x 9 and height x 16, over 16, times the font scale; the window colour behind it). The switch bar turns
     captions on (CaptioningManager.isEnabled); while off the whole screen is greyed out. Standard options: Language
     (LocalePreference: Default, then the system's locales), Text size (captioning_font_size_selector_titles) and Caption
     style (PresetPreference: Use app defaults, White on black, Black on white, Yellow on black, Yellow on blue, Custom);
     Custom options only for Custom (refreshShowingCustom): Font family, Text color / opacity, Edge type / color (the
     colour greyed out with no edge), Background color / opacity, Caption window color / opacity. The colour, preset and
     edge rows open ListDialogPreference's grid_picker_dialog (96 dp columns): color_picker_item swatches over
     transparency_tileable when not opaque, preset_picker_item samples ("Aa" at 32 dp). The values are the Settings.Secure
     ones CaptionStyle reads: a colour and its opacity are kept apart as the fragment's parseColorOpacity splits them. */
  const CAP_COLORS = [0x00ffffff, 0xffffffff, 0xff000000, 0xffff0000, 0xffffff00, 0xff00ff00, 0xff00ffff, 0xff0000ff, 0xffff00ff,
    0xff000055, 0xff0000aa, 0xff005500, 0xff005555, 0xff0055aa, 0xff0055ff, 0xff00aa00, 0xff00aa55, 0xff00aaaa, 0xff00aaff, 0xff00ff55,
    0xff00ffaa, 0xff550000, 0xff550055, 0xff5500aa, 0xff5500ff, 0xff555500, 0xff555555, 0xff5555aa, 0xff5555ff, 0xff55aa00, 0xff55aa55,
    0xff55aaaa, 0xff55aaff, 0xff55ff00, 0xff55ff55, 0xff55ffaa, 0xff55ffff, 0xffaa0000, 0xffaa0055, 0xffaa00aa, 0xffaa00ff, 0xffaa5500,
    0xffaa5555, 0xffaa55aa, 0xffaa55ff, 0xffaaaa00, 0xffaaaa55, 0xffaaaaaa, 0xffaaaaff, 0xffaaff00, 0xffaaff55, 0xffaaffaa, 0xffaaffff,
    0xffff0055, 0xffff00aa, 0xffff5500, 0xffff5555, 0xffff55aa, 0xffff55ff, 0xffffaa00, 0xffffaa55, 0xffffaaaa, 0xffffaaff, 0xffffff55,
    0xffffffaa];
  const CAP_COLOR_TITLES = ['color_unspecified', 'color_white', 'color_black', 'color_red', 'color_yellow', 'color_green', 'color_cyan', 'color_blue', 'color_magenta'];
  const CAP_OPACITY = [0x40ffffff, 0x80ffffff, 0xc0ffffff, 0xffffffff];
  const CAP_PRESETS = [4, 0, 1, 2, 3, -1];
  const CAP_EDGES = [-1, 0, 1, 2, 3, 4];
  const CAP_SCALES = ['0.25', '0.5', '1.0', '1.5', '2.0'];
  const CAP_FACES = ['', 'sans-serif', 'sans-serif-condensed', 'sans-serif-monospace', 'serif', 'serif-monospace', 'casual', 'cursive', 'sans-serif-smallcaps'];
  // fonts.xml's families for those names (mm-settings.css loads the files).
  const CAP_FONT = {'': 'Roboto', 'sans-serif': 'Roboto', 'sans-serif-condensed': "'Roboto Condensed'", 'sans-serif-monospace': "'Droid Sans Mono'", serif: "'Noto Serif'",
    'serif-monospace': "'Cutive Mono'", casual: "'Coming Soon'", cursive: "'Dancing Script'", 'sans-serif-smallcaps': "'Carrois Gothic SC'"};
  // CaptioningManager.CaptionStyle.PRESETS (white / black / yellow on black / yellow on blue; no edge, no window).
  const CAP_STYLE = {0: [0xffffffff, 0xff000000], 1: [0xff000000, 0xffffffff], 2: [0xffffff00, 0xff000000], 3: [0xffffff00, 0xff0000ff]};
  // The custom style's defaults: CaptionStyle.DEFAULT_CUSTOM (white on black, no edge, black edge colour, no window).
  const capState = c => {
    const a = S(c).a11y || (S(c).a11y = {});
    return a.captions || (a.captions = {preset: 0, scale: '1.0', locale: '', typeface: '', fg: 0xffffffff, fgOp: 0xffffffff, bg: 0xff000000, bgOp: 0xffffffff,
      edge: 0, edgeColor: 0xff000000, win: 0, winOp: 0xffffffff});
  };
  const capOn = c => !!(S(c).a11y || {}).captioning_preference_screen;
  const rgba = (color, alpha) => `rgba(${color >>> 16 & 255},${color >>> 8 & 255},${color & 255},${(alpha / 255).toFixed(3)})`;
  // A colour row's value over its opacity: Default (unspecified) falls back to the default style's, None is clear.
  const capColor = (color, op, fallback) => color === 0x00ffffff ? fallback : color === 0 ? 'transparent' : rgba(color, op >>> 24);
  function capStyle(c) {
    const s = capState(c), dp = 'var(--dp)';
    let fg, bg, win = 'transparent', edge = 0, edgeColor = '#000', face = 'Roboto';
    if (s.preset === -1) {
      fg = capColor(s.fg, s.fgOp, '#fff'); bg = capColor(s.bg, s.bgOp, '#000'); win = capColor(s.win, s.winOp, 'transparent');
      edge = s.edge < 0 ? 0 : s.edge; edgeColor = capColor(s.edgeColor, 0xff000000, '#000'); face = CAP_FONT[s.typeface] || 'Roboto';
    } else { const [f, b] = CAP_STYLE[s.preset] || CAP_STYLE[0]; fg = rgba(f, 255); bg = rgba(b, 255); }
    return {fg, bg, win, face, smallcaps: s.preset === -1 && s.typeface === 'sans-serif-smallcaps', shadow: capEdge(edge, edgeColor, dp)};
  }
  // SubtitleView.onDraw's edges: an outline stroke, a drop shadow, or raised / depressed light and dark shadows.
  function capEdge(edge, color, dp) {
    if (edge === 1) return `-webkit-text-stroke:calc(2 * ${dp}) ${color};paint-order:stroke fill`;
    if (edge === 2) return `text-shadow:calc(2 * ${dp}) calc(2 * ${dp}) calc(2 * ${dp}) ${color}`;
    if (edge === 3 || edge === 4) { const up = edge === 3 ? '#fff' : color, down = edge === 3 ? color : '#fff'; return `text-shadow:calc(-1 * ${dp}) calc(-1 * ${dp}) calc(2 * ${dp}) ${up},${dp} ${dp} calc(2 * ${dp}) ${down}`; }
    return '';
  }
  const capText = (style, text, size) => `<span class="mmsx-captext" style="color:${style.fg};background:${style.bg};font-family:${style.face},Roboto,sans-serif;font-size:calc(${size} * var(--dp));${style.smallcaps ? 'font-variant:small-caps;' : ''}${style.shadow}">${text}</span>`;
  const capLocales = c => { const col = new Intl.Collator(c.locale()); return LOCALES.map(tag => ({value: tag.replace('-', '_'), name: localeName(tag)})).sort((a, b) => col.compare(a.name, b.name)); };
  const colorTitle = (t, v, list) => { const i = list.indexOf(v), none = list[0] === 0; const k = none ? i - 1 : i;
    if (none && i === 0) return t.t('color_none');
    return k >= 0 && k < CAP_COLOR_TITLES.length ? t.t(CAP_COLOR_TITLES[k]) : t.fmt('color_custom', null, v >>> 16 & 255, v >>> 8 & 255, v & 255); };
  const opTitle = (t, v) => t.t('captioning_opacity_selector_titles')[CAP_OPACITY.indexOf(v)] ?? '';
  const ROWS = {
    captioning_foreground_color: ['fg', 'color'], captioning_foreground_opacity: ['fgOp', 'opacity'], captioning_edge_type: ['edge', 'edge'],
    captioning_edge_color: ['edgeColor', 'color'], captioning_background_color: ['bg', 'colornone'], captioning_background_opacity: ['bgOp', 'opacity'],
    captioning_window_color: ['win', 'colornone'], captioning_window_opacity: ['winOp', 'opacity']
  };
  function capSummary(c, key) {
    const t = T(), s = capState(c);
    if (key === 'captioning_locale') return s.locale ? capLocales(c).find(l => l.value === s.locale)?.name || s.locale : t.t('locale_default');
    if (key === 'captioning_font_size') return t.t('captioning_font_size_selector_titles')[CAP_SCALES.indexOf(s.scale)] ?? '';
    if (key === 'captioning_preset') return t.t('captioning_preset_selector_titles')[CAP_PRESETS.indexOf(s.preset)] ?? '';
    if (key === 'captioning_typeface') return t.t('captioning_typeface_selector_titles')[CAP_FACES.indexOf(s.typeface)] ?? '';
    const [field, kind] = ROWS[key] || [];
    if (kind === 'opacity') return opTitle(t, s[field]);
    if (kind === 'edge') return t.t('captioning_edge_type_selector_titles')[CAP_EDGES.indexOf(s.edge)] ?? '';
    if (kind === 'color') return colorTitle(t, s[field], CAP_COLORS);
    if (kind === 'colornone') return colorTitle(t, s[field], [0, ...CAP_COLORS]);
    return '';
  }
  // ListDialogPreference: the grid; picking an item sets it and closes.
  function capGrid(c, title, items, onPick) {
    c.dialog({title, html: `<div class="mmsx-capgrid">${items.map((it, i) => `<button type="button" class="mmsx-capitem" data-i="${i}">${it.html}<span class="mmsx-capname">${esc(c, it.title || '')}</span></button>`).join('')}</div>`,
      buttons: [{label: T().t('cancel')}],
      mount: (c, w) => { w.querySelectorAll('.mmsx-capitem').forEach(b => b.addEventListener('click', () => { onPick(+b.dataset.i); c.closeDialog(); c.render(); })); }});
  }
  function capDialog(c, key, n) {
    const t = T(), s = capState(c), title = MM.settingsStr(n?.title) || '';
    const list = (values, labels, cur, set) => c.dialog({title, items: values.map((v, i) => radio(c, labels[i], v === cur)), buttons: [{label: t.t('cancel')}], onItem: i => { set(values[i]); c.save(); c.render(); }});
    if (key === 'captioning_locale') { const locs = capLocales(c); return list(['', ...locs.map(l => l.value)], [t.t('locale_default'), ...locs.map(l => l.name)], s.locale, v => { s.locale = v; }); }
    if (key === 'captioning_font_size') return list(CAP_SCALES, t.t('captioning_font_size_selector_titles'), s.scale, v => { s.scale = v; });
    if (key === 'captioning_typeface') return list(CAP_FACES, t.t('captioning_typeface_selector_titles'), s.typeface, v => { s.typeface = v; });
    const aa = esc(c, t.t('captioning_preview_characters'));
    if (key === 'captioning_preset') {
      const titles = t.t('captioning_preset_selector_titles');
      return capGrid(c, title, CAP_PRESETS.map((p, i) => {
        const save = s.preset; s.preset = p === 4 ? 0 : p; const st = capStyle(c); s.preset = save;
        return {title: titles[i], html: `<span class="mmsx-capsample">${capText(st, aa, 32)}</span>`};
      }), i => { s.preset = CAP_PRESETS[i]; c.save(); });
    }
    const [field, kind] = ROWS[key] || [];
    if (kind === 'edge') {
      const titles = t.t('captioning_edge_type_selector_titles');
      return capGrid(c, title, CAP_EDGES.map((e, i) => ({title: titles[i], html: `<span class="mmsx-capsample">${capText({fg: '#fff', bg: 'transparent', face: 'Roboto', shadow: capEdge(e < 0 ? 0 : e, '#000', 'var(--dp)')}, aa, 32)}</span>`})),
        i => { s.edge = CAP_EDGES[i]; c.save(); });
    }
    const values = kind === 'opacity' ? CAP_OPACITY : kind === 'colornone' ? [0, ...CAP_COLORS] : CAP_COLORS;
    return capGrid(c, title, values.map(v => {
      const alpha = v >>> 24, label = kind === 'opacity' ? opTitle(t, v) : colorTitle(t, v, values);
      return {title: label, html: `<span class="mmsx-swatch${alpha < 255 ? ' clear' : ''}"><i style="background:${rgba(v, alpha)}"></i></span>`};
    }), i => { s[field] = values[i]; c.save(); });
  }
  MM.settingsScreens['xml:captioning_settings'] = {
    bar: c => bar(c, 'mmsx-captions', capOn(c)),
    render(c) {
      const t = T(), s = capState(c), on = capOn(c), st = capStyle(c), node = MM.settingsXml.captioning_settings;
      const size = (0.0533 * Math.max(411.4286 * 9, 200 * 16) / 16 * parseFloat(s.scale)).toFixed(3);
      const preview = `<div class="mmsx-capview"><img src="assets/st-caption_background.jpg" alt=""><div class="mmsx-capwin"><span style="background:${st.win}">${capText(st, esc(c, t.t('captioning_preview_text')), size)}</span></div></div>`;
      const rows = cat => cat.c.map(n => {
        const disabled = n.key === 'captioning_edge_color' && s.edge === 0;
        return `<button type="button" class="mmst-pref${disabled ? ' disabled' : ''}" data-action="mmsx-caprow" data-key="${n.key}"${disabled ? ' disabled' : ''}><span class="mmst-texts"><span class="mmst-title">${esc(c, MM.settingsStr(n.title))}</span><span class="mmst-summary">${esc(c, capSummary(c, n.key))}</span></span></button>`;
      }).join('');
      const cats = node.c.filter(cat => cat.key !== 'custom' || s.preset === -1);
      return `${preview}<div class="mmst-list${on ? '' : ' off'}">${cats.map(cat => `<div class="mmst-cat">${esc(c, MM.settingsStr(cat.title))}</div>${rows(cat)}`).join('')}</div>`;
    },
    action(c, name, el) {
      if (name === 'mmsx-captions') { const a = S(c).a11y || (S(c).a11y = {}); a.captioning_preference_screen = !a.captioning_preference_screen; c.save(); c.render(); return true; }
      if (name === 'mmsx-caprow') { capDialog(c, el.dataset.key, findNode(el.dataset.key)); return true; }
      return false;
    }
  };
  const findNode = key => { const seek = n => n?.key === key ? n : (n?.c || []).reduce((r, x) => r || seek(x), null); return seek(MM.settingsXml.captioning_settings); };
})();
