/* Android 6.0.1 Settings (Settings.apk MTC20K): the screens under Language & input, Date & time, Accessibility,
   Backup & reset and Printing that have code of their own.
   - LocalePicker (com.android.internal.app.LocalePicker): the system's locales (the language-region configurations
     of framework-res.apk, without the pseudo-locales of user builds), each in its own language, the country only for a
     language with several; picking one of the simulator's five languages switches it (the page follows), the others
     are listed as the phone lists them.
   - SpellCheckersSettings (spellchecker_prefs.xml under the switch bar): Language (Use system language) and the Google
     Spell Checker; UserDictionarySettings: the empty text and Add (UserDictionaryAddWordActivity's word, shortcut).
   - Current Keyboard: InputMethodPicker's dialog (Change keyboard: Show input method, the enabled keyboards, Choose
     keyboards).
   - Date & time: Set date / Set time greyed while Automatic date & time is on (they open the framework's
     DatePickerDialog / TimePickerDialog, the chosen moment kept as an offset), Select time zone opens ZonePicker: the
     zones of timezones.xml with their GMT offsets, sorted by name or by offset; the names are the city names of the
     image's DeskClock (cities.xml, translated) for the zone, else the zone id's city.
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
  MM.settingsScreens.spellcheck = {
    title: () => T().t('spellcheckers_settings_title'),
    bar: c => bar(c, 'mmsx-spell', S(c).spellCheck ?? true),
    render(c) {
      const t = T(), on = S(c).spellCheck ?? true;
      return `<div class="mmst-list${on ? '' : ' off'}">${pref(c, 'mmsx-none', t.t('spellchecker_language'), t.t('use_system_language_to_select_input_method_subtypes'))}${pref(c, 'mmsx-none', MM.text('appprefs').t('LatinImeGoogle/spell_checker_service_name'))}</div>`;
    },
    action(c, name) { if (name === 'mmsx-spell') { S(c).spellCheck = !(S(c).spellCheck ?? true); c.save(); c.render(); return true; } return name === 'mmsx-none'; }
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
  // keyboard: none), the enabled keyboards (Google Keyboard in the system language) and Choose keyboards.
  MM.imePicker = c => {
    const t = T(), name = `${MM.systemLocaleName(c)} - ${MM.text('appprefs').t('LatinImeGoogle/english_ime_name')}`;
    c.dialog({title: t.t('framework/select_input_method'), items: [radio(c, name, true)], buttons: [{label: t.t('framework/configure_input_methods'), action: () => {}}]});
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
})();
