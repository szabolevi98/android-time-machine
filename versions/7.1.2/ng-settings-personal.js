/* Android 7.1.2 Settings: Date & time, Location, Backup & reset and Languages & input (SettingsGoogle N2G48C), as
   NG.settingsHooks and screens. The logic is 6.0.1's (its Date & time, Location, Backup & reset and Language & input
   code); N2G48C's classes decide what differs:
   - DateTimeSettings: Automatic date & time and time zone on (def_auto_time, def_auto_time_zone), Set date / Set time
     greyed while automatic (the framework DatePickerDialog / TimePickerDialog of ng-pickers.js; the chosen moment kept as
     an offset), Use 24-hour format. ZonePicker over settingslib ZoneGetter (NG.zones of ng-locale-data.js, the image's
     ICU 56): timezones.xml's zones, each by its exemplar city, the zones of the locale's country by their long names
     unless two of those share one; "GMT+hh:mm"; sorted by name or by offset from the overflow; the summary is
     getTimeZoneOffsetAndName ("GMT+01:00 Central European Standard Time").
   - LocationSettings: the switch bar; Mode (LocationMode's RadioButtonPreference rows); Recent location requests
     (location_no_recent_apps); Location services, what SettingsInjector finds: GMS Core's LocationHistoryInjectorService
     (location_history_injected_setting.xml: ic_google, Google Location History; the location sharing injector is
     disabled in the manifest); the overflow's Scanning (ScanningSettings: N2G48C's defaults are on) and Help.
   - PrivacySettings with Google's backup transport: Back up my data (On / Off: ToggleBackupSettingFragment, the switch
     bar and backup_data_summary, turning it off asks backup_erase_dialog_message), Backup account (the transport's
     destination, the account; its configuration intent is GMS Core's SetBackupAccountActivity, a dialog of the
     accounts and Add account), Automatic restore (enabled while backup is on); Factory data reset (MasterClear:
     master_clear_desc, master_clear_desc_also_erases_external as the storage is emulated, the accounts with the
     authenticator's icon, Reset phone; MasterClearConfirm: Erase everything).
   - InputMethodAndLanguageSettings: Languages (the locale list's names joined), Spell checker, Personal dictionary,
     Virtual keyboard (VirtualKeyboardFragment: the enabled input methods by label with their application icons and
     enabled subtypes, then Manage keyboards; AvailableVirtualKeyboardFragment: every input method of the image with its
     switch, the only enabled system keyboard greyed), Physical keyboard, Text-to-speech output (TextToSpeechSettings:
     GoogleTTS with its settings, the speech rate and pitch sliders of preference_iconless_slider, their resets, the
     example from tts_demo_strings, the default language's status; only US English voice data is in the image), Pointer
     speed (PointerSpeedPreference's seek bar, -7…7); the game controller category goes (no such device).
   - LocaleListEditor (Language preferences, locale_drag_cell / locale_order_list): each locale's number in the accent,
     its name in itself, "May not be available in some apps" for one no framework values-* folder translates, the drag
     handle when there are several; Add a language (LocalePickerWithRegion over the framework's supported_locales:
     Suggested and All languages, each language in itself, then its regions; search in the action bar); Remove in the
     overflow (with several), then the check boxes and the delete action (dlg_remove_locales_*). The first locale is the
     phone's language: one of the simulator's five switches the page to it. */
(() => {
  'use strict';
  const T = () => NG.text('settings');
  const H = NG.settingsHooks;
  const S = c => c.data.settings;
  const A = name => `assets/${name}`;
  const radio = (c, label, on) => ({html: `<span class="ngst-choice"><i class="ngw-radio ngst-radio${on ? ' on' : ''}"></i><span>${c.safe(label)}</span></span>`});
  const cap = (s, loc) => s ? s.charAt(0).toLocaleUpperCase(loc) + s.slice(1) : s;
  const mask = file => `-webkit-mask-image:url('${A(file)}');mask-image:url('${A(file)}')`;
  Object.assign(NG.settingsFragments, {'com.android.settings.ZonePicker': 'timezone', 'com.android.settings.backup.ToggleBackupSettingFragment': 'backup',
    'com.android.settings.MasterClear': 'master-clear', 'com.android.settings.localepicker.LocaleListEditor': 'locale',
    'com.android.settings.inputmethod.VirtualKeyboardFragment': 'keyboards', 'com.android.settings.inputmethod.AvailableVirtualKeyboardFragment': 'keyboards-all',
    'com.android.settings.inputmethod.SpellCheckersSettings': 'spellcheck', 'com.android.settings.inputmethod.UserDictionaryList': 'user-dictionary'});

  // -- Date & time ---------------------------------------------------------------------------------------------------
  const h24 = c => S(c).time24 ?? !new Intl.DateTimeFormat(c.locale(), {hour: 'numeric'}).resolvedOptions().hour12;
  const zoneOf = c => S(c).autoZone === false && S(c).timeZone ? S(c).timeZone : Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offsetMin = (tz, at = new Date()) => { try { const p = new Intl.DateTimeFormat('en-US', {timeZone: tz, timeZoneName: 'longOffset'}).formatToParts(at).find(x => x.type === 'timeZoneName').value; const m = /GMT([+-])(\d+)(?::(\d+))?/.exec(p); return m ? (m[1] === '-' ? -1 : 1) * (+m[2] * 60 + +(m[3] || 0)) : 0; } catch { return 0; } };
  const inDst = (tz, now) => { const y = now.getFullYear(); return offsetMin(tz, now) > Math.min(offsetMin(tz, new Date(y, 0, 1)), offsetMin(tz, new Date(y, 6, 1))); };
  // libcore's SimpleDateFormat "ZZZZ".
  const gmt = min => `GMT${min < 0 ? '-' : '+'}${String(Math.floor(Math.abs(min) / 60)).padStart(2, '0')}:${String(Math.abs(min) % 60).padStart(2, '0')}`;
  const zoneNames = c => NG.zones?.names[c.lang] || NG.zones?.names.en || {};
  // getZoneLongName: ICU's long standard or daylight name (the browser's for a zone outside timezones.xml).
  const longName = (c, tz, now) => {
    const n = zoneNames(c)[tz];
    if (n) return n[inDst(tz, now) ? 2 : 1];
    try { return new Intl.DateTimeFormat(c.locale(), {timeZone: tz, timeZoneName: 'long'}).formatToParts(now).find(p => p.type === 'timeZoneName')?.value || ''; } catch { return ''; }
  };
  NG.settingsZoneSummary = c => { const tz = zoneOf(c), now = new Date(); return `${gmt(offsetMin(tz, now))} ${longName(c, tz, now)}`.trim(); };
  const shifted = c => new Date(Date.now() + (S(c).autoTime === false ? S(c).timeOffset || 0 : 0));
  H.date_time_prefs = {
    get(c, key) {
      const s = S(c);
      if (key === 'auto_time') return s.autoTime ?? true;
      if (key === 'auto_zone') return s.autoZone ?? true;
      if (key === '24 hour') return h24(c);
      return undefined;
    },
    set(c, key, v) {
      const s = S(c);
      if (key === 'auto_time') { s.autoTime = v; return true; }
      if (key === 'auto_zone') { s.autoZone = v; return true; }
      if (key === '24 hour') { s.time24 = v; NG.system?.changed(c); return true; }
      return false;
    },
    disabled(c, key) {
      const s = S(c);
      if (key === 'date' || key === 'time') return s.autoTime ?? true;
      if (key === 'timezone') return s.autoZone ?? true;
      return false;
    },
    summary(c, key) {
      const now = shifted(c), loc = c.locale();
      if (key === 'date') return new Intl.DateTimeFormat(loc, {year: 'numeric', month: 'long', day: 'numeric'}).format(now);
      if (key === 'time') return new Intl.DateTimeFormat(loc, {hour: 'numeric', minute: '2-digit', hour12: !h24(c)}).format(now);
      if (key === 'timezone') return NG.settingsZoneSummary(c);
      if (key === '24 hour') return new Intl.DateTimeFormat(loc, {hour: 'numeric', minute: '2-digit', hour12: !h24(c)}).format(new Date(now.getFullYear(), 11, 31, 13, 0));
      return undefined;
    },
    click(c, key) {
      const now = shifted(c), apply = d => { S(c).timeOffset = d - Date.now(); c.save(); c.render(); };
      if (key === 'date') { NG.datePicker(c, now, (c, d) => apply(new Date(d.getFullYear(), d.getMonth(), d.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()))); return true; }
      if (key === 'time') { NG.timePicker(c, now.getHours(), now.getMinutes(), (h, m) => apply(new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m))); return true; }
      return false;
    }
  };
  // ZoneGetter.getZonesList: the zones of the locale's country (libcore TimeZoneNames.forLocale) by their long names,
  // unless two of them share one; the others by their exemplar cities.
  function zoneList(c) {
    const now = new Date(), names = zoneNames(c), country = (c.locale().split('-')[1] || '').toUpperCase(), ids = NG.zones?.ids || [];
    const local = ids.filter(id => NG.zones.region[id] === country), longs = local.map(id => longName(c, id, now));
    const useLong = new Set(longs).size === longs.length;
    return ids.map(id => {
      const n = names[id] || [id.split('/').pop().replace(/_/g, ' ')], off = offsetMin(id, now);
      const name = (useLong && local.includes(id) ? longName(c, id, now) : n[0]) || longName(c, id, now) || gmt(off);
      return {id, name, off, gmt: gmt(off)};
    });
  }
  NG.settingsScreens.timezone = {
    title: () => T().t('date_time_set_timezone'),
    actions: c => NG.menu.button(c),
    render(c) {
      const col = new Intl.Collator(c.locale()), zones = zoneList(c);
      zones.sort((a, b) => c.ui.zoneByName === false ? a.off - b.off || col.compare(a.name, b.name) : col.compare(a.name, b.name));
      return `<div class="ngst-list">${NG.settingsJoinRows(zones.map(z => ({html: NG.settingsRow(c, {title: z.name, summary: z.gmt, action: 'ngpe-zone', data: ` data-id="${z.id}"`}), sel: true})))}</div>`;
    },
    action(c, name, el) {
      const t = T();
      if (name === 'ng-menu') { c.menu([{label: t.t(c.ui.zoneByName === false ? 'zone_list_menu_sort_alphabetically' : 'zone_list_menu_sort_by_timezone'), action: c => { c.ui.zoneByName = c.ui.zoneByName === false; c.render(); }}], el); return true; }
      if (name === 'ngpe-zone') { S(c).timeZone = el.dataset.id; c.save(); c.ui.settings.stack.pop(); c.render(); return true; }
      return false;
    }
  };

  // -- Location ------------------------------------------------------------------------------------------------------
  const MODES = {high_accuracy: 3, battery_saving: 2, sensors_only: 1};
  const modeKey = c => Object.keys(MODES).find(k => MODES[k] === (S(c).locationMode ?? 3));
  // The categories the code fills: no recent request; the injected Location History.
  (() => {
    const base = NG.settingsXml.location_settings; if (!base) return;
    const recent = base.c.find(n => n.key === 'recent_location_requests'), services = base.c.find(n => n.key === 'location_services');
    if (recent && !recent.c) recent.c = [{t: 'Preference', key: 'no_recent_apps', title: 'string/location_no_recent_apps', selectable: 'false'}];
    if (services && !services.c) services.c = [{t: 'Preference', key: 'location_history', title: 'string/PrebuiltGmsCore/location_ulr_setting_label'}];
  })();
  H.location_settings = {
    hidden: ['managed_profile_location_switch'],
    disabled: (c, key) => (key === 'location_mode' || key === 'location_history') && !S(c).location,
    summary(c, key) {
      if (key === 'location_mode') return T().t(S(c).location ? {3: 'location_mode_high_accuracy_title', 2: 'location_mode_battery_saving_title', 1: 'location_mode_sensors_only_title'}[S(c).locationMode ?? 3] : 'location_mode_location_off_title');
      return undefined;
    },
    // DimmableIconPreference: the injected setting's icon at its size (the icon frame's 48 dp at most).
    row(c, key) {
      if (key !== 'location_history') return null;
      const off = !S(c).location;
      return NG.settingsRow(c, {key, title: T().t('PrebuiltGmsCore/location_ulr_setting_label'), icon: `<img class="ngst-ic icon48" src="${A('gms-ic_google.png')}" alt="">`, disabled: off});
    },
    click(c, key) {
      if (key === 'location_mode') { NG.settingsGo(c, 'xml:location_mode', T().t('location_mode_screen_title')); return true; }
      if (key === 'location_history') { NG.settingsGo(c, 'missing:com.google.android.location.settings.LocationHistorySettingsActivity', T().t('PrebuiltGmsCore/location_ulr_setting_label')); return true; }
      return false;
    },
    bar: c => NG.settingsSwitchBar(c, !!S(c).location, 'ngpe-loc'),
    actions: c => NG.menu.button(c),
    action(c, name, el) {
      if (name === 'ngpe-loc') { NG.system.setLocation(c, !S(c).location); c.transition('none'); c.render(); return true; }
      if (name === 'ng-menu') { c.menu([{label: T().t('location_menu_scanning'), action: c => NG.settingsGo(c, 'xml:location_scanning', T().t('location_scanning_screen_title'))}, {label: T().t('help_label'), action: c => NG.settingsGo(c, 'help', '')}], el); return true; }
      return false;
    }
  };
  // RadioButtonPreference (preference_radio: the radio button in the icon frame).
  H.location_mode = {
    row: (c, key, n) => MODES[key] ? `<button type="button" class="ngst-pref ngst-radiopref" data-action="ngst-pref" data-key="${key}"><span class="ngst-iconframe"><i class="ngw-radio ngst-radio${modeKey(c) === key ? ' on' : ''}"></i></span><span class="ngst-texts"><span class="ngst-title">${c.safe(NG.settingsStr(n.title))}</span><span class="ngst-summary">${c.safe(NG.settingsStr(n.summary))}</span></span></button>` : null,
    click(c, key) { if (!MODES[key]) return false; S(c).locationMode = MODES[key]; c.save(); NG.system?.changed(c); c.transition('none'); c.render(); return true; }
  };
  H.location_scanning = {
    get: (c, key) => key === 'wifi_always_scanning' ? S(c).wifiScanAlways ?? true : key === 'bluetooth_always_scanning' ? S(c).bleScanAlways ?? true : undefined,
    set(c, key, v) { if (key === 'wifi_always_scanning') S(c).wifiScanAlways = v; else if (key === 'bluetooth_always_scanning') S(c).bleScanAlways = v; else return false; return true; }
  };

  // -- Backup & reset ------------------------------------------------------------------------------------------------
  const backupOn = c => S(c).backup !== false;
  H.privacy_settings = {
    hidden: ['backup_inactive', 'data_management'],
    get: (c, key) => key === 'auto_restore' ? S(c).autoRestore ?? true : undefined,
    set(c, key, v) { if (key !== 'auto_restore') return false; S(c).autoRestore = v; return true; },
    disabled: (c, key) => (key === 'auto_restore' || key === 'configure_account') && !backupOn(c),
    summary(c, key) {
      const t = T();
      if (key === 'backup_data') return t.t(backupOn(c) ? 'accessibility_feature_state_on' : 'accessibility_feature_state_off');
      if (key === 'configure_account') return backupOn(c) ? NG.account.email : t.t('backup_configure_account_default_summary');
      return undefined;
    },
    click(c, key) {
      if (key !== 'configure_account') return false;
      const t = T();
      c.dialog({title: t.t('PrebuiltGmsCore/header_set_backup_account'), items: [radio(c, NG.account.email, true), {html: `<span class="ngst-dlgitem">${c.safe(t.t('PrebuiltGmsCore/add_account'))}</span>`}],
        onItem: i => { if (i === 1) c.open('gmail', 'add-account'); }});
      return true;
    }
  };
  NG.settingsScreens.backup = {
    title: () => T().t('backup_data_title'),
    bar: c => NG.settingsSwitchBar(c, backupOn(c), 'ngpe-backup'),
    render: c => `<div class="ngsx-text">${c.safe(T().t('backup_data_summary'))}</div>`,
    action(c, name) {
      if (name !== 'ngpe-backup') return false;
      const t = T(), s = S(c);
      if (backupOn(c)) c.dialog({message: t.t('backup_erase_dialog_message'), buttons: [{label: t.t('framework/cancel')}, {label: t.t('framework/ok'), action: c => { s.backup = false; c.save(); c.render(); }}]});
      else { s.backup = true; c.save(); c.transition('none'); c.render(); }
      return true;
    }
  };
  NG.settingsScreens['master-clear'] = {
    title: (c, cur) => T().t(cur.screen.endsWith(':confirm') ? 'master_clear_confirm_title' : 'master_clear_title'),
    render(c, cur) {
      const t = T(), button = (action, label) => `<div class="ngpe-mcbtn"><button type="button" class="ngsx-btn" data-action="${action}">${c.safe(label)}</button></div>`;
      if (cur.screen.endsWith(':confirm')) return `<div class="ngpe-mc confirm"><div class="ngpe-mcfinal">${c.safe(t.t('master_clear_final_desc'))}</div>${button('ngpe-erase', t.t('master_clear_final_button_text'))}</div>`;
      return `<div class="ngpe-mc"><div class="ngpe-mcscroll"><p>${c.safe(t.t('master_clear_desc'))}</p><p>${c.safe(t.t('master_clear_desc_also_erases_external'))}</p><p>${c.safe(t.t('master_clear_accounts'))}</p>
        <div class="ngpe-mcacct"><img src="${A('gms-auth_ic_google_account.png')}" alt=""><span>${c.safe(NG.account.email)}</span></div></div>${button('ngpe-masterclear', t.t('master_clear_button_text'))}</div>`;
    },
    action(c, name) {
      if (name === 'ngpe-masterclear') { NG.settingsGo(c, 'master-clear:confirm', T().t('master_clear_confirm_title')); return true; }
      if (name === 'ngpe-erase') { c.dialog({progress: T().t('master_clear_progress_text'), title: T().t('master_clear_progress_title'), cancelable: false}); setTimeout(() => c.factoryReset(), 1500); return true; }
      return false;
    }
  };

  // -- Languages ------------------------------------------------------------------------------------------------------
  const SIM = {en: 'en-US', hu: 'hu-HU', de: 'de-DE', fr: 'fr-FR', es: 'es-ES'};
  const SUPPORTED = () => NG.locales?.supported || Object.values(SIM);
  // Old language codes of Android's tags, as BCP 47 for Intl.
  const bcp = tag => tag.replace(/^in(?=-|$)/, 'id').replace(/^iw(?=-|$)/, 'he');
  const langOf = tag => tag.split('-')[0];
  // The language with its script where one has several (LocaleStore's parent: zh-Hans, sr-Latn…).
  const parentOf = tag => { const p = tag.split('-'); return p[1]?.length === 4 ? `${p[0]}-${p[1]}` : p[0]; };
  // LocaleHelper.getDisplayName(locale, locale, sentence case): "English (United States)", "Magyar (Magyarország)", as
  // the image's ICU names them (NG.locales.names); in another language (inLoc) the browser's names.
  const nativeName = (tag, inLoc) => {
    if (!inLoc && NG.locales?.names[tag]) return NG.locales.names[tag][0];
    try { return cap(new Intl.DisplayNames([bcp(inLoc || tag)], {type: 'language', languageDisplay: 'standard'}).of(bcp(tag)), bcp(inLoc || tag)); } catch { return tag; }
  };
  const regionName = tag => { if (NG.locales?.names[tag]?.[1]) return NG.locales.names[tag][1]; const b = bcp(tag), r = b.split('-').pop(); try { return new Intl.DisplayNames([b], {type: 'region'}).of(r); } catch { return r; } };
  const locales = c => S(c).locales?.length ? S(c).locales : [SIM[c.lang] || 'en-US'];
  const translated = tag => !(NG.locales?.untranslated || []).includes(tag);
  NG.settingsLocaleNames = c => locales(c).map(tag => nativeName(tag)).join(', ');
  function applyLocales(c, list) {
    S(c).locales = list; c.save();
    const lang = Object.keys(SIM).find(l => langOf(list[0]) === l);
    if (lang && lang !== c.lang) { window.AndroidI18n?.setLanguage(lang); location.reload(); return true; }
    return false;
  }
  NG.settingsScreens.locale = {
    title: () => T().t('pref_title_lang_selection'),
    // The Remove item: in the overflow with several locales; the delete action while choosing.
    actions(c) {
      if (locales(c).length < 2) return '';
      return c.ui.localeRemove ? `<button type="button" class="ngst-ab-btn" data-action="ngpe-remove" aria-label="${c.safe(T().t('locale_remove_menu'))}"><i style="${mask('st-ic_delete.svg')}"></i></button>` : NG.menu.button(c);
    },
    render(c) {
      const t = T(), list = locales(c), removing = c.ui.localeRemove, drag = list.length > 1 && !removing, fmt = new Intl.NumberFormat(c.locale());
      const rows = list.map((tag, i) => `<div class="ngpe-loc" data-i="${i}">${removing ? `<label class="ngpe-locchk"><input type="checkbox" data-i="${i}"${removing.includes(i) ? ' checked' : ''}><i class="ngst-check${removing.includes(i) ? ' on' : ''}"></i><span>${c.safe(nativeName(tag))}</span></label>` : `<span class="ngpe-locnum">${fmt.format(i + 1)}</span><span class="ngpe-loclabel">${c.safe(nativeName(tag))}</span>`}${translated(tag) ? '' : `<span class="ngpe-locwarn">${c.safe(t.t('locale_not_translated'))}</span>`}${drag ? `<i class="ngpe-handle" data-i="${i}"></i>` : ''}</div>`).join('');
      return `<div class="ngpe-locales">${rows}<button type="button" class="ngpe-addlang${removing ? ' hidden' : ''}" data-action="ngpe-addlang"><i></i>${c.safe(t.t('add_a_language'))}</button></div>`;
    },
    mount(c, root) {
      const list = root.querySelector('.ngpe-locales');
      list?.querySelectorAll('.ngpe-locchk input').forEach(i => i.addEventListener('change', () => { const r = c.ui.localeRemove, n = +i.dataset.i; c.ui.localeRemove = i.checked ? [...r, n] : r.filter(x => x !== n); c.transition('none'); c.render(); }));
      // The drag handle moves a row (LocaleRecyclerView's ItemTouchHelper); letting go saves the new order.
      list?.querySelectorAll('.ngpe-handle').forEach(h => h.addEventListener('pointerdown', e => {
        e.preventDefault(); e.stopPropagation();
        const row = h.closest('.ngpe-loc'), rows = [...list.querySelectorAll('.ngpe-loc')], from = +h.dataset.i, rh = row.offsetHeight, y0 = e.clientY;
        let to = from;
        row.classList.add('dragging'); try { h.setPointerCapture(e.pointerId); } catch {}
        const move = ev => {
          const dy = Math.max(-from * rh, Math.min((rows.length - 1 - from) * rh, ev.clientY - y0));
          row.style.transform = `translateY(${dy}px)`; to = from + Math.round(dy / rh);
          rows.forEach((r, i) => { if (r !== row) r.style.transform = i > from && i <= to ? `translateY(${-rh}px)` : i < from && i >= to ? `translateY(${rh}px)` : ''; });
        };
        const up = () => {
          h.removeEventListener('pointermove', move); row.classList.remove('dragging'); rows.forEach(r => { r.style.transform = ''; });
          if (to !== from) { const l = [...locales(c)]; l.splice(to, 0, l.splice(from, 1)[0]); if (!applyLocales(c, l)) { c.transition('none'); c.render(); } }
        };
        h.addEventListener('pointermove', move); h.addEventListener('pointerup', up, {once: true}); h.addEventListener('pointercancel', up, {once: true});
      }));
    },
    action(c, name, el) {
      const t = T();
      if (name === 'ng-menu') { c.menu([{label: t.t('locale_remove_menu'), action: c => { c.ui.localeRemove = []; c.transition('none'); c.render(); }}], el); return true; }
      if (name === 'ngst-up' && c.ui.localeRemove) { c.ui.localeRemove = null; c.transition('none'); c.render(); return true; }
      if (name === 'ngpe-addlang') { c.ui.localeSearch = ''; NG.settingsGo(c, 'locale-add', t.t('framework/language_selection_title')); return true; }
      if (name === 'ngpe-remove') {
        const sel = c.ui.localeRemove, list = locales(c);
        if (!sel.length) { c.ui.localeRemove = null; c.transition('none'); c.render(); return true; }
        if (sel.length === list.length) { c.dialog({title: t.t('dlg_remove_locales_error_title'), message: t.t('dlg_remove_locales_error_message'), buttons: [{label: t.t('yes')}]}); return true; }
        c.dialog({title: t.plural('dlg_remove_locales_title', sel.length), message: t.t('dlg_remove_locales_message'),
          buttons: [{label: t.t('no')}, {label: t.t('yes'), action: c => { c.ui.localeRemove = null; if (!applyLocales(c, list.filter((_, i) => !sel.includes(i)))) c.render(); }}]});
        return true;
      }
      return false;
    },
    back(c) { c.ui.localeRemove = null; return false; }
  };
  // LocalePickerWithRegion (framework): the languages, then the regions of one with several. Suggested first (the
  // SIM's country, LocaleStore's SUGGESTION_TYPE_SIM), the locales already in the list left out.
  function pickerItems(c, lang) {
    const have = locales(c), country = (have[0].split('-').pop() || '').toUpperCase(), col = new Intl.Collator(c.locale()), q = (c.ui.localeSearch || '').toLocaleLowerCase();
    const free = SUPPORTED().filter(tag => !have.includes(tag));
    if (lang) {
      const regions = free.filter(tag => parentOf(tag) === lang).map(tag => ({tag, name: regionName(tag), sugg: tag.endsWith('-' + country)}));
      return regions.filter(r => !q || r.name.toLocaleLowerCase().includes(q)).sort((a, b) => col.compare(a.name, b.name));
    }
    const byLang = new Map();
    for (const tag of free) { const p = parentOf(tag); if (!byLang.has(p)) byLang.set(p, []); byLang.get(p).push(tag); }
    return [...byLang].map(([p, tags]) => ({lang: p, tags, name: nativeName(p), sugg: tags.some(t => t.endsWith('-' + country))}))
      .filter(x => !q || x.name.toLocaleLowerCase().includes(q) || nativeName(x.lang, c.locale()).toLocaleLowerCase().includes(q)).sort((a, b) => col.compare(a.name, b.name));
  }
  NG.settingsScreens['locale-add'] = {
    title: (c, cur) => { const lang = cur.screen.split(':')[1]; return lang ? nativeName(lang) : T().t('framework/language_selection_title'); },
    actions: (c, cur) => c.ui.localeSearching ? '' : `<button type="button" class="ngst-ab-btn" data-action="ngpe-locsearch" aria-label="${c.safe(T().t('search_menu'))}"><i style="${mask('fw-ic_search_api_material.svg')}"></i></button>`,
    render(c, cur) {
      const t = T(), lang = cur.screen.split(':')[1], items = pickerItems(c, lang);
      const sugg = items.filter(x => x.sugg), rest = lang ? items.filter(x => !x.sugg) : items;
      const row = x => ({html: NG.settingsRow(c, {title: x.name, action: lang ? 'ngpe-pick' : 'ngpe-lang', data: lang ? ` data-tag="${x.tag}"` : ` data-l="${x.lang}"`}), sel: true});
      const head = key => ({html: `<div class="ngpe-lochead">${c.safe(t.t(key))}</div>`, sel: false});
      const rows = sugg.length && !c.ui.localeSearch ? [head('framework/language_picker_section_suggested'), ...sugg.map(row), head(lang ? 'framework/region_picker_section_all' : 'framework/language_picker_section_all'), ...rest.map(row)] : items.map(row);
      const search = c.ui.localeSearching ? `<div class="ngpe-locsearch"><input type="search" value="${c.safe(c.ui.localeSearch || '')}" placeholder="${c.safe(t.t('framework/search_language_hint'))}" autocomplete="off"></div>` : '';
      return `${search}<div class="ngst-list">${NG.settingsJoinRows(rows)}</div>`;
    },
    mount(c, root) {
      const input = root.querySelector('.ngpe-locsearch input');
      if (!input) return;
      input.addEventListener('input', () => { c.ui.localeSearch = input.value; c.transition('none'); c.render(); });
      input.focus(); input.setSelectionRange(input.value.length, input.value.length);
    },
    action(c, name, el) {
      if (name === 'ngpe-locsearch') { c.ui.localeSearching = true; c.transition('none'); c.render(); return true; }
      if (name === 'ngpe-lang') {
        const item = pickerItems(c).find(x => x.lang === el.dataset.l);
        c.ui.localeSearch = ''; c.ui.localeSearching = false;
        if (item.tags.length > 1) NG.settingsGo(c, `locale-add:${item.lang}`, nativeName(item.lang));
        else this.add(c, item.tags[0]);
        return true;
      }
      if (name === 'ngpe-pick') { this.add(c, el.dataset.tag); return true; }
      return false;
    },
    add(c, tag) {
      S(c).locales = [...locales(c), tag]; c.save(); c.ui.localeSearch = ''; c.ui.localeSearching = false;
      const st = c.ui.settings.stack; while (st.length && st.at(-1).screen.startsWith('locale-add')) st.pop();
      c.render();
    },
    back(c) { if (c.ui.localeSearching) { c.ui.localeSearching = false; c.ui.localeSearch = ''; c.transition('none'); c.render(); return true; } return false; }
  };

  // -- Input methods --------------------------------------------------------------------------------------------------
  // InputMethodAndSubtypeUtil.getSubtypeLocaleNameListAsSentence: Gboard's subtype for the system locale (its label:
  // "English (US)" / "English (UK)", else subtype_generic, the language's name); the voice IME's Automatic.
  const gboardSubtype = c => {
    const l = locales(c)[0];
    if (l === 'en-US' || l === 'en-GB') return T().t(`LatinIMEGooglePrebuilt/subtype_locale_${l.replace('-', '_')}`);
    try { return cap(new Intl.DisplayNames([c.locale()], {type: 'language'}).of(langOf(bcp(l))), c.locale()); } catch { return l; }
  };
  // [id, label, icon (the application's; AvailableVirtualKeyboardFragment takes the service's logo or icon first, and
  // none of these has one), settings activity, enabled by default].
  const IMES = [['gboard', 'LatinIMEGooglePrebuilt/ime_name', 'ime-gboard.png', 'com.google.android.apps.inputmethod.latin.preference.SettingsActivity', true],
    ['voice', 'Velvet/ime_service_label', 'app-search.png', 'com.google.android.apps.gsa.velvet.ui.settings.VoiceSearchPreferences', true],
    ['hindi', 'GoogleHindiIME/ime_name', 'ime-hindi.png', 'com.google.android.apps.inputmethod.hindi.preference.SettingsActivity', false],
    ['japanese', 'GoogleJapaneseInput/ime_name', 'ime-japanese.png', 'com.google.android.apps.inputmethod.japanese.preference.SettingsActivity', false],
    ['korean', 'KoreanIME/ime_name', 'ime-korean.png', 'com.google.android.inputmethod.korean.KoreanImePreferences', false],
    ['pinyin', 'GooglePinyinIME/ime_name', 'ime-pinyin.png', 'com.google.android.inputmethod.pinyin.SettingsActivity', false]];
  const enabled = c => S(c).imes || IMES.filter(x => x[4]).map(x => x[0]);
  const imeSummary = (c, id) => id === 'gboard' ? gboardSubtype(c) : id === 'voice' ? T().t('Velvet/voice_ime_language_auto') : '';
  const sortedImes = (c, list) => { const col = new Intl.Collator(c.locale()); return [...list].sort((a, b) => col.compare(T().t(a[1]), T().t(b[1]))); };
  const imeIcon = file => `<img class="ngst-ic icon48" src="${A(file)}" alt="">`;
  NG.settingsScreens.keyboards = {
    title: () => T().t('virtual_keyboard_category'),
    render(c) {
      const t = T(), on = enabled(c);
      const rows = sortedImes(c, IMES.filter(x => on.includes(x[0]))).map(([id, label, icon]) => ({html: NG.settingsRow(c, {title: t.t(label), summary: imeSummary(c, id), icon: imeIcon(icon), action: 'ngpe-ime', data: ` data-id="${id}"`}), sel: true}));
      rows.push({html: NG.settingsRow(c, {title: t.t('add_virtual_keyboard'), icon: `<img class="ngst-ic" src="${A('st-ic_add_24dp.svg')}" alt="">`, action: 'ngpe-manage'}), sel: true});
      return `<div class="ngst-list">${NG.settingsJoinRows(rows)}</div>`;
    },
    action(c, name, el) {
      if (name === 'ngpe-manage') { NG.settingsGo(c, 'keyboards-all', T().t('add_virtual_keyboard')); return true; }
      if (name === 'ngpe-ime') { const ime = IMES.find(x => x[0] === el.dataset.id); if (ime[0] === 'gboard') NG.openPrefs(c, 'gboard', 'settings', T().t(ime[1])); else NG.settingsGo(c, `missing:${ime[3]}`, T().t(ime[1])); return true; }
      return false;
    }
  };
  NG.settingsScreens['keyboards-all'] = {
    title: () => T().t('add_virtual_keyboard'),
    render(c) {
      const t = T(), on = enabled(c);
      return `<div class="ngst-list">${NG.settingsJoinRows(sortedImes(c, IMES).map(([id, label, icon]) => ({html: NG.settingsRow(c, {title: t.t(label), summary: on.includes(id) ? imeSummary(c, id) : '', icon: imeIcon(icon), widget: NG.settingsSwitch(on.includes(id), id === 'gboard'), action: 'ngpe-imetoggle', data: ` data-id="${id}"`, disabled: id === 'gboard'}), sel: true})))}</div>`;
    },
    action(c, name, el) {
      if (name !== 'ngpe-imetoggle') return false;
      const id = el.dataset.id, on = enabled(c);
      if (id === 'gboard') return true;
      S(c).imes = on.includes(id) ? on.filter(x => x !== id) : [...on, id]; c.save(); c.transition('none'); c.render();
      return true;
    }
  };
  H.physical_keyboard_settings = {
    get: (c, key) => key === 'show_virtual_keyboard_switch' ? !!S(c).showImeWithHardKeyboard : undefined,
    set(c, key, v) { if (key !== 'show_virtual_keyboard_switch') return false; S(c).showImeWithHardKeyboard = v; return true; },
    click: (c, key) => key === 'keyboard_shortcuts_helper'
  };
  // A seek bar that follows the pointer (Widget.Material.SeekBar: 16 dp in at each end).
  function bindSeek(c, bar, max, onChange, onDone) {
    bar.addEventListener('pointerdown', e => {
      e.preventDefault(); e.stopPropagation(); try { bar.setPointerCapture(e.pointerId); } catch {}
      bar.classList.add('pressed');
      const move = ev => { const r = bar.getBoundingClientRect(), pad = 16 * c.el.screen.clientWidth / 411.43, v = Math.round(Math.min(1, Math.max(0, (ev.clientX - r.left - pad) / (r.width - 2 * pad))) * max); bar.style.setProperty('--v', (v / max).toFixed(4)); bar.setAttribute('aria-valuenow', v); onChange(v); };
      const up = () => { bar.classList.remove('pressed'); bar.removeEventListener('pointermove', move); onDone?.(); };
      move(e); bar.addEventListener('pointermove', move);
      bar.addEventListener('pointerup', up, {once: true}); bar.addEventListener('pointercancel', up, {once: true});
    });
  }
  const seekHtml = (v, max) => `<div class="ngst-seek" role="slider" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${v}" style="--v:${(v / max).toFixed(4)}"><i class="ngst-seek-track"></i><i class="ngst-seek-progress"></i><i class="ngst-seek-thumb"></i></div>`;
  H.language_settings = {
    hidden: ['game_controller_settings_category'],
    summary(c, key) {
      const t = T();
      if (key === 'phone_language') return NG.settingsLocaleNames(c);
      if (key === 'spellcheckers_settings') return S(c).spellCheck === false ? t.t('switch_off_text') : t.t('LatinIMEGooglePrebuilt/spell_checker_name');
      return undefined;
    },
    click(c, key) {
      const t = T();
      if (key === 'spellcheckers_settings') { NG.settingsGo(c, 'spellcheck', t.t('spellcheckers_settings_title')); return true; }
      if (key === 'key_user_dictionary_settings') { NG.settingsGo(c, 'user-dictionary', t.t('user_dict_settings_title')); return true; }
      if (key === 'pointer_speed') {
        let v = (S(c).pointerSpeed ?? 0) + 7;
        c.dialog({title: t.t('pointer_speed'), html: `<div class="ngpe-seekdlg">${seekHtml(v, 14)}</div>`,
          buttons: [{label: t.t('framework/cancel')}, {label: t.t('framework/ok'), action: c => { S(c).pointerSpeed = v - 7; c.save(); }}],
          mount: (c, win) => bindSeek(c, win.querySelector('.ngst-seek'), 14, x => { v = x; })});
        return true;
      }
      return false;
    }
  };
  // SpellCheckersSettings: the switch bar, the default spell checker (SpellCheckerPreference: Gboard's, with the
  // settings gear) and its language (Use system language, or one of its subtypes).
  const SPELL_LOCALES = ['en_US', 'en_GB', 'en_AU', 'en_CA', 'en_IN', 'cs', 'da', 'de', 'el', 'es', 'es_US', 'fi', 'fr', 'hr', 'hu', 'it', 'iw', 'lt', 'lv', 'nb', 'nl', 'pl', 'pt_BR', 'pt_PT', 'ro', 'ru', 'sk', 'sl', 'sr', 'sv', 'tr', 'uk'];
  const spellName = (c, code) => { try { const [l, r] = code.replace('iw', 'he').split('_'); const n = cap(new Intl.DisplayNames([c.locale()], {type: 'language'}).of(l), c.locale()); return r ? `${n} (${new Intl.DisplayNames([c.locale()], {type: 'region'}).of(r)})` : n; } catch { return code; } };
  NG.settingsScreens.spellcheck = {
    title: () => T().t('spellcheckers_settings_title'),
    bar: c => NG.settingsSwitchBar(c, S(c).spellCheck !== false, 'ngpe-spell'),
    render(c) {
      const t = T(), on = S(c).spellCheck !== false, lang = S(c).spellLang || '';
      const gear = `<button type="button" class="ngst-gear" data-action="ngpe-spellsettings" aria-label="${c.safe(t.t('settings_button'))}"${on ? '' : ' disabled'}><i></i></button>`;
      return `<div class="ngst-list">${NG.settingsJoinRows([
        {html: `<div class="ngst-pref${on ? '' : ' disabled'}" role="button" data-action="ngpe-spelldefault"><span class="ngst-texts"><span class="ngst-title">${c.safe(t.t('default_spell_checker'))}</span><span class="ngst-summary">${c.safe(t.t('LatinIMEGooglePrebuilt/spell_checker_name'))}</span></span><span class="ngst-widget">${gear}</span></div>`, sel: true},
        {html: NG.settingsRow(c, {title: t.t('phone_language'), summary: lang ? spellName(c, lang) : t.t('use_system_language_to_select_input_method_subtypes'), action: 'ngpe-spelllang', disabled: !on}), sel: true}])}</div>`;
    },
    action(c, name) {
      const t = T();
      if (name === 'ngpe-spell') { S(c).spellCheck = S(c).spellCheck === false; c.save(); c.transition('none'); c.render(); return true; }
      if (name === 'ngpe-spelldefault') {
        if (S(c).spellCheck === false) return true;
        c.dialog({title: t.t('choose_spell_checker'), items: [radio(c, t.t('LatinIMEGooglePrebuilt/spell_checker_name'), true), radio(c, t.t('GoogleHindiIME/spellchecker_name'), false)], buttons: [{label: t.t('framework/cancel')}],
          onItem: i => { if (i === 1) c.dialog({title: t.t('framework/dialog_alert_title'), message: t.fmt('spellchecker_security_warning', null, t.t('GoogleHindiIME/spellchecker_name')), buttons: [{label: t.t('framework/cancel')}, {label: t.t('framework/ok')}]}); }});
        return true;
      }
      if (name === 'ngpe-spelllang') {
        const cur = S(c).spellLang || '', codes = ['', ...SPELL_LOCALES];
        c.dialog({title: t.t('phone_language'), items: codes.map(code => radio(c, code ? spellName(c, code) : t.t('use_system_language_to_select_input_method_subtypes'), code === cur)), buttons: [{label: t.t('framework/cancel')}],
          onItem: i => { S(c).spellLang = codes[i]; c.save(); c.render(); }});
        return true;
      }
      if (name === 'ngpe-spellsettings') { NG.settingsGo(c, 'missing:com.google.android.apps.inputmethod.latin.preference.SettingsActivity', t.t('LatinIMEGooglePrebuilt/spell_checker_name')); return true; }
      return false;
    }
  };
  // UserDictionarySettings: the words (and shortcuts) of the dictionary; + adds one (UserDictionaryAddWordContents).
  const words = c => S(c).userWords || (S(c).userWords = []);
  function addWord(c, edit) {
    const t = T();
    let word = edit?.word || '', shortcut = edit?.shortcut || '';
    c.dialog({title: t.t(edit ? 'user_dict_settings_edit_dialog_title' : 'user_dict_settings_add_dialog_title'),
      html: `<div class="ngwf-dialog"><div class="ngwf-item"><span class="ngwf-label">${c.safe(t.t('user_dict_settings_add_word_option_name'))}</span><input class="ngwf-edit" data-f="word" value="${c.safe(word)}" placeholder="${c.safe(t.t('user_dict_settings_add_word_hint'))}" autocomplete="off"></div><div class="ngwf-item"><span class="ngwf-label">${c.safe(t.t('user_dict_settings_add_shortcut_option_name'))}</span><input class="ngwf-edit" data-f="shortcut" value="${c.safe(shortcut)}" placeholder="${c.safe(t.t('user_dict_settings_add_shortcut_hint'))}" autocomplete="off"></div></div>`,
      mount: (c, win) => { win.querySelectorAll('input').forEach(f => f.addEventListener('input', () => { if (f.dataset.f === 'word') word = f.value; else shortcut = f.value; })); setTimeout(() => win.querySelector('input').focus(), 50); },
      buttons: [...(edit ? [{label: t.t('user_dict_settings_context_menu_delete_title'), neutral: true, action: c => { S(c).userWords = words(c).filter(w => w !== edit); c.save(); c.render(); }}] : []), {label: t.t('framework/cancel')},
        {label: t.t('user_dict_settings_add_dialog_confirm'), action: c => { if (!word.trim()) return; if (edit) Object.assign(edit, {word: word.trim(), shortcut: shortcut.trim()}); else words(c).push({word: word.trim(), shortcut: shortcut.trim()}); c.save(); c.render(); }}]});
  }
  NG.settingsScreens['user-dictionary'] = {
    title: () => T().t('user_dict_settings_title'),
    actions: c => `<button type="button" class="ngst-ab-btn" data-action="ngpe-addword" aria-label="${c.safe(T().t('user_dict_settings_add_menu_title'))}"><i style="${mask('st-ic_menu_add_white.svg')}"></i></button>`,
    render(c) {
      const list = [...words(c)].sort((a, b) => a.word.localeCompare(b.word, c.locale()));
      if (!list.length) return `<div class="ngst-emptyview center">${c.safe(T().t('user_dict_settings_empty_text'))}</div>`;
      return `<div class="ngst-list">${NG.settingsJoinRows(list.map(w => ({html: NG.settingsRow(c, {title: w.word, summary: w.shortcut, action: 'ngpe-word', data: ` data-w="${c.safe(w.word)}"`}), sel: true})))}</div>`;
    },
    action(c, name, el) {
      if (name === 'ngpe-addword') { addWord(c); return true; }
      if (name === 'ngpe-word') { addWord(c, words(c).find(w => w.word === el.dataset.w)); return true; }
      return false;
    }
  };

  // TextToSpeechSettings. The rate and pitch are kept as Settings.Secure keeps them (100 = normal); the seek bars run
  // from the minimum (10 / 25) to the maximum (600 / 400). The example speaks through the browser's speech synthesis.
  const TTS = {tts_default_rate: [10, 600, 'ttsRate'], tts_default_pitch: [25, 400, 'ttsPitch']};
  const ttsTag = c => locales(c)[0];
  const ttsOk = c => ttsTag(c) === 'en-US';
  // TtsEnginePreference: the radio, the name, the divider and the settings button; the engine's category holds it.
  (() => {
    const cat = NG.settingsXml.tts_settings?.c.find(n => n.key === 'tts_engine_preference_section');
    if (cat && !cat.c) cat.c = [{t: 'Preference', key: 'tts_engine', title: 'string/GoogleTTS/app_name'}];
  })();
  H.tts_settings = {
    row(c, key, n) {
      const t = T();
      if (key === 'tts_engine') return `<div class="ngst-pref ngpe-engine" role="button" data-action="ngst-pref" data-key="tts_engine"><span class="ngst-iconframe"><i class="ngw-radio ngst-radio on"></i></span><span class="ngst-texts"><span class="ngst-title">${c.safe(t.t('GoogleTTS/app_name'))}</span></span><span class="ngst-widget"><i class="ngpe-vdiv"></i><button type="button" class="ngst-gear" data-action="ngst-pref" data-key="tts_engine_settings" aria-label="${c.safe(t.t('settings_button'))}"><i></i></button></span></div>`;
      if (TTS[key]) {
        const [min, max, field] = TTS[key], v = (S(c)[field] ?? 100) - min, off = !ttsOk(c);
        return `<div class="ngpe-slider${off ? ' disabled' : ''} ngst-nosel" data-key="${key}"><div class="ngst-title">${c.safe(NG.settingsStr(n.title))}</div><div class="ngpe-sliderrow">${seekHtml(v, max - min)}</div></div>`;
      }
      return null;
    },
    summary(c, key) {
      if (key === 'tts_status') return T().fmt(ttsOk(c) ? 'tts_status_ok' : 'tts_status_requires_network', null, nativeName(ttsTag(c), c.locale()));
      return undefined;
    },
    disabled: (c, key) => key === 'tts_play_example' && !ttsOk(c),
    mount(c, root) {
      root.querySelectorAll('.ngpe-slider:not(.disabled)').forEach(row => {
        const [min, max, field] = TTS[row.dataset.key];
        bindSeek(c, row.querySelector('.ngst-seek'), max - min, v => { S(c)[field] = v + min; }, () => c.save());
      });
    },
    click(c, key) {
      if (key === 'tts_engine' || key === 'tts_status') return true;
      if (key === 'reset_speech_rate') { S(c).ttsRate = 100; c.save(); c.transition('none'); c.render(); return true; }
      if (key === 'reset_speech_pitch') { S(c).ttsPitch = 100; c.save(); c.transition('none'); c.render(); return true; }
      if (key === 'tts_play_example') {
        // getDefaultSampleString: tts_demo_strings for the engine's language (ISO 3 codes in tts_demo_string_langs).
        const langs = T().t('tts_demo_string_langs'), texts = T().t('tts_demo_strings'), i = langs.indexOf('eng');
        const text = i >= 0 ? texts[i] : T().t('tts_default_sample_string');
        try { const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = (S(c).ttsRate ?? 100) / 100; u.pitch = Math.min(2, (S(c).ttsPitch ?? 100) / 100); speechSynthesis.cancel(); speechSynthesis.speak(u); } catch {}
        return true;
      }
      if (key === 'tts_engine_settings') { NG.settingsGo(c, 'missing:com.google.android.tts.local.voicepack.ui.VoiceDataInstallActivity', T().t('GoogleTTS/app_name')); return true; }
      return false;
    }
  };
})();
