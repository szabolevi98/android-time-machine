/* The image's other input methods as Settings › Languages & input › Virtual keyboard shows them once enabled: their
   settingsActivity (method.xml) is a PreferenceActivity of preference headers whose PREFERENCE_FRAGMENT extra names
   the res/xml each CommonPreferenceFragment inflates (ng-appprefs-data.js: imehindi, imejapanese, imekorean,
   imepinyin). Google Japanese Input adds the shared ThemeSelectorActivity and Mozc's UserDictionaryToolActivity
   (the Dictionary tool, from its decompiled code in _aosp/ngjp):
   - the 48 dp dictionary spinner over the entry list (user_dictionary_tool_entry_list_view: a check box, the reading,
     the word, the category); a row opens "Edit a word";
   - the action bar's New word and Delete word (the checked words, else "Select the words you would like to
     delete."), the overflow's New / Rename / Delete current dictionary, Export (a .zip named after the dictionary
     through the share sheet), Import (Documents: a dictionary exported here comes back, anything else "Could not
     read the file.") and Undo;
   - the word dialog (Word, Reading, Category: UserDictionaryUtil's 43 parts of speech, Noun first).
   Values live in c.data.appPrefs; the dictionaries in c.data.imeDictionary. */
(() => {
  'use strict';
  const A = 'GoogleJapaneseInput/';
  const t = k => NG.appPrefStr('string/' + A + k);
  const POS = ['noun', 'abbreviation', 'suggestion_only', 'proper_noun', 'personal_name', 'family_name', 'first_name', 'organization_name', 'place_name',
    'sa_irregular_conjugation_noun', 'adjective_verbal_noun', 'number', 'alphabet', 'symbol', 'emoticon', 'adverb', 'prenoun_adjectival', 'conjunction',
    'interjection', 'prefix', 'counter_suffix', 'generic_suffix', 'person_name_suffix', 'place_name_suffix', 'wa_group1_verb', 'ka_group1_verb',
    'sa_group1_verb', 'ta_group1_verb', 'na_group1_verb', 'ma_group1_verb', 'ra_group1_verb', 'ga_group1_verb', 'ba_group1_verb', 'ha_group1_verb',
    'group2_verb', 'kuru_group3_verb', 'suru_group3_verb', 'zuru_group3_verb', 'ru_group3_verb', 'adjective', 'sentence_ending_particle', 'punctuation',
    'free_standing_word', 'suppression_word'];
  const fw = k => NG.text('framework').t(k);
  const APK = {imehindi: 'GoogleHindiIME', imejapanese: 'GoogleJapaneseInput', imekorean: 'KoreanIME', imepinyin: 'GooglePinyinIME'};
  const s_ = (id, k) => NG.appPrefStr(`string/${APK[id]}/${k}`);
  const fragment = (c, name, node) => node.extras?.PREFERENCE_FRAGMENT || null;
  // The shared input method library's preferences: the seek bars (VolumePreference, VibrationDurationPreference,
  // LongPressDelayPreference and Mozc's Inline* ones) as a slider dialog, Mozc's KeyboardLayoutPreference (12 keys,
  // QWERTY, Godan) as a choice, its Clear … DialogPreferences as their confirmation, ThemeSelectorActivity.
  const SLIDERS = {sound_volume: [0, 100, 50, '%'], vibration_duration: [0, 100, 20, ' ms'], key_long_press_delay: [150, 700, 300, ' ms'],
    keyboard_height_ratio: [70, 130, 100, '%'], 'keyboard_height_ratio.portrait': [70, 130, 100, '%'], 'keyboard_height_ratio.landscape': [70, 130, 100, '%']};
  const LAYOUTS = ['TWELVE_KEYS', 'QWERTY', 'GODAN'], LAYOUT_KEY = {TWELVE_KEYS: '12keys', QWERTY: 'qwerty', GODAN: 'godan'};
  function libsClick(id) {
    return (c, key, node) => {
      const cls = node.intent?.targetClass || '';
      if (cls.endsWith('ThemeSelectorActivity')) { NG.appPrefsGo(c, 'themes', s_(id, 'setting_theme')); return true; }
      if (cls.endsWith('UserDictionaryToolActivity')) { NG.appPrefsGo(c, 'dictool', t('user_dictionary_tool_app_name')); return true; }
      if (SLIDERS[key] && /Volume|VibrationDuration|LongPressDelay|SeekBar/.test(node.t) && !/List/.test(node.t)) {
        const [min, max, def, unit] = SLIDERS[key], title = NG.appPrefStr(node.title); let v = +NG.appPref(c, id, key, def);
        c.dialog({title, html: `<div class="ngime-slider"><input type="range" min="${min}" max="${max}" value="${v}" aria-label="${c.safe(title)}"><output>${v}${unit}</output></div>`,
          mount: (c, win) => win.querySelector('input').addEventListener('input', e => { v = +e.target.value; win.querySelector('output').textContent = v + unit; }),
          buttons: [{label: fw('cancel')}, {label: fw('ok'), action: c => { NG.setAppPref(c, id, key, v); c.render(); }}]});
        return true;
      }
      if (node.t === 'KeyboardLayoutPreference') {
        const curv = NG.appPref(c, id, key, node.defaultValue || 'TWELVE_KEYS');
        NG.appPrefsChoose(c, NG.appPrefStr(node.title), LAYOUTS.map(x => t('pref_keyboard_layout_title_' + LAYOUT_KEY[x])), LAYOUTS.indexOf(curv), (c, i) => { NG.setAppPref(c, id, key, LAYOUTS[i]); c.render(); });
        return true;
      }
      if (/^Clear\w+DialogPreference$/.test(node.t)) {
        c.dialog({title: NG.appPrefStr(node.title), message: NG.appPrefStr(node.dialogMessage), buttons: [{label: fw('cancel')}, {label: fw('ok'), action: c => { if (node.t === 'ClearUserDictionaryDialogPreference') { delete c.data.imeDictionary; c.save(); } }}]});
        return true;
      }
      return false;
    };
  }
  // AbstractSettingsActivity's overflow (menu_settings: Send feedback, About; About starts the activity again with
  // AboutPreferenceFragment over setting_about, whose setting_about_key row shows the version).
  const VERSION = {imehindi: '3.2.3.135773116-preload-arm64-v8a', imejapanese: '2.18.2583.3.130597023-preload-arm64-v8a', imekorean: '1.5.3.135744591-preload-arm64-v8a', imepinyin: '4.3.3.135772956-preload-arm64-v8a'};
  const PKG = {imehindi: 'com.google.android.apps.inputmethod.hindi', imejapanese: 'com.google.android.inputmethod.japanese', imekorean: 'com.google.android.inputmethod.korean', imepinyin: 'com.google.android.inputmethod.pinyin'};
  const actions = (c, xml) => xml === 'settings' ? NG.menu.button(c) : '';
  const menuAction = id => (c, name, el) => {
    if (name !== 'ng-menu') return false;
    c.menu([{label: s_(id, 'setting_send_feedback_title'), action: c => c.open('help', 'feedback:' + PKG[id])}, {label: s_(id, 'setting_about_title'), action: c => NG.appPrefsGo(c, 'setting_about', s_(id, 'setting_about_title'))}], el);
    return true;
  };
  const summary = id => (c, key, node) => key === 'setting_about_key' ? VERSION[id] : node.t === 'KeyboardLayoutPreference' ? t('pref_keyboard_layout_title_' + LAYOUT_KEY[NG.appPref(c, id, key, node.defaultValue || 'TWELVE_KEYS')]) : SLIDERS[key] && /Volume|VibrationDuration|LongPressDelay|InlineSeekBarPreference/.test(node.t) ? `${NG.appPref(c, id, key, SLIDERS[key][2])}${SLIDERS[key][3]}` : undefined;
  // ThemeSelectorActivity: the Material Light and Dark keyboard themes.
  const themes = id => ({
    title: () => s_(id, 'setting_theme'),
    render(c) {
      const theme = NG.appPref(c, id, 'theme', 'light'), sample = {imejapanese: 'あ か さ<br>た な は<br>ま や ら', imehindi: 'क ख ग<br>घ ङ च<br>छ ज झ', imekorean: 'ㅂ ㅈ ㄷ<br>ㄱ ㅅ ㅛ<br>ㅁ ㄴ ㅇ', imepinyin: 'q w e<br>a s d<br>z x c'}[id];
      return `<div class="ngime-themes">${['light', 'dark'].map(k => `<button type="button" class="ngime-swatch ${k}${k === theme ? ' selected' : ''}" data-action="ngime-theme" data-theme="${k}"><span>${sample}</span><b>${c.safe(s_(id, 'kb_theme_material_' + k))}</b></button>`).join('')}</div>`;
    },
    action(c, name, el) { if (name !== 'ngime-theme') return false; NG.setAppPref(c, id, 'theme', el.dataset.theme); c.transition('none'); c.render(); return true; }
  });
  for (const id of ['imehindi', 'imekorean', 'imepinyin']) NG.appPrefsHooks[id] = {fragment, click: libsClick(id), summary: summary(id), actions, action: menuAction(id), customs: {themes: themes(id)}};

  const D = c => { const d = c.data.imeDictionary ||= {dicts: [], cur: 0, undo: []}; if (!d.dicts.length) d.dicts.push({name: t('user_dictionary_tool_default_dictionary_name'), words: []}); d.cur = Math.min(d.cur, d.dicts.length - 1); return d; };
  const cur = c => D(c).dicts[D(c).cur];
  const snapshot = c => { const d = D(c); d.undo.push(JSON.stringify({dicts: d.dicts, cur: d.cur})); if (d.undo.length > 10) d.undo.shift(); };
  const done = c => { c.save(); c.transition('none'); c.render(); };
  const checked = c => (c.ui.imeChecked ||= new Set());

  function wordDialog(c, i) {
    const w = i == null ? {word: '', reading: '', pos: 'noun'} : {...cur(c).words[i]};
    c.dialog({title: t(i == null ? 'user_dictionary_tool_add_entry_dialog_title' : 'user_dictionary_tool_edit_entry_dialog_title'),
      html: `<div class="ngime-form"><label>${c.safe(t('user_dictionary_tool_word_register_dialog_word_label'))}</label><input data-f="word" value="${c.safe(w.word)}" placeholder="${c.safe(t('help_userdictionary_edit_word_value'))}">
        <label>${c.safe(t('user_dictionary_tool_word_register_dialog_reading_label'))}</label><input data-f="reading" value="${c.safe(w.reading)}" placeholder="${c.safe(t('help_userdictionary_edit_word_key'))}">
        <label>${c.safe(t('user_dictionary_tool_word_register_dialog_pos_label'))}</label><select data-f="pos">${POS.map(p => `<option value="${p}"${p === w.pos ? ' selected' : ''}>${c.safe(t('japanese_pos_' + p))}</option>`).join('')}</select></div>`,
      mount: (c, win) => win.querySelectorAll('[data-f]').forEach(el => el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', () => { w[el.dataset.f] = el.value; })),
      buttons: [{label: fw('cancel')}, {label: fw('ok'), action: c => {
        if (!w.word.trim()) { c.toast(t('user_dictionary_tool_status_error_word_empty')); return; }
        if (!w.reading.trim()) { c.toast(t('user_dictionary_tool_status_error_reading_empty')); return; }
        snapshot(c); const entry = {word: w.word.trim(), reading: w.reading.trim(), pos: w.pos};
        if (i == null) cur(c).words.push(entry); else cur(c).words[i] = entry; done(c);
      }}]});
  }
  function nameDialog(c, rename) {
    let name = rename ? cur(c).name : '';
    c.dialog({title: t(rename ? 'user_dictionary_tool_rename_dictionary_dialog_title' : 'user_dictionary_tool_create_dictionary_dialog_title'),
      html: `<div class="ngime-form"><label>${c.safe(t('user_dictionary_tool_dictionary_name_dialog_dictionary_name_label'))}</label><input value="${c.safe(name)}"></div>`,
      mount: (c, win) => win.querySelector('input').addEventListener('input', e => { name = e.target.value; }),
      buttons: [{label: fw('cancel')}, {label: fw('ok'), action: c => {
        const n = name.trim(), d = D(c);
        if (!n) { c.toast(t('user_dictionary_tool_status_error_dictionary_name_empty')); return; }
        if (d.dicts.some((x, j) => x.name === n && !(rename && j === d.cur))) { c.toast(t('user_dictionary_tool_status_error_dictionary_name_duplicated')); return; }
        snapshot(c); if (rename) cur(c).name = n; else { d.dicts.push({name: n, words: []}); d.cur = d.dicts.length - 1; } checked(c).clear(); done(c);
      }}]});
  }
  function importDictionary(c) {
    NG.pickDocument(c, {onPick(c, nodes) {
      const data = nodes[0]?.userDictionary;
      c.ui.appPrefs && c.open('app-prefs');
      if (!data) { c.toast(t('user_dictionary_tool_error_import_cannot_read_import_source')); return; }
      const d = D(c), names = d.dicts.map(x => x.name);
      c.dialog({title: t('user_dictionary_tool_import_dictionary_selection_dialog_title'), items: [...names, t('user_dictionary_tool_import_dictionary_selection_dialog_new_dictionary')].map(n => ({html: c.safe(n)})),
        onItem: (i, c) => { snapshot(c); if (i < names.length) { d.dicts[i].words.push(...data.words); d.cur = i; } else { let n = data.name, k = 2; while (names.includes(n)) n = `${data.name} ${k++}`; d.dicts.push({name: n, words: data.words}); d.cur = d.dicts.length - 1; } done(c); }});
    }});
  }

  const dictool = {
    title: () => t('user_dictionary_tool_app_name'),
    actions: c => `<button type="button" class="ngst-gear" data-action="ngime-add" aria-label="${c.safe(t('user_dictionary_tool_menu_add_entry_title'))}"><img src="assets/ime-ic_menu_add.png" alt=""></button><button type="button" class="ngst-gear" data-action="ngime-delete" aria-label="${c.safe(t('user_dictionary_tool_menu_delete_entry_title'))}"><img src="assets/ime-ic_menu_delete.png" alt=""></button>${NG.menu.button(c)}`,
    render(c) {
      const dict = cur(c), on = checked(c);
      return `<button type="button" class="ngime-spinner" data-action="ngime-dicts"><span>${c.safe(dict.name)}</span><i></i></button><div class="ngime-list">${dict.words.map((w, i) => `<div class="ngime-entry"><input type="checkbox" data-action="ngime-check" data-i="${i}"${on.has(i) ? ' checked' : ''} aria-label="${c.safe(w.word)}"><button type="button" data-action="ngime-edit" data-i="${i}"><span>${c.safe(w.reading)}</span><span>${c.safe(w.word)}</span><span>${c.safe(t('japanese_pos_' + w.pos))}</span></button></div>`).join('')}</div>`;
    },
    action(c, name, el) {
      const d = D(c);
      switch (name) {
        case 'ngime-add': wordDialog(c); return true;
        case 'ngime-edit': wordDialog(c, +el.dataset.i); return true;
        case 'ngime-check': { const i = +el.dataset.i, s = checked(c); s.has(i) ? s.delete(i) : s.add(i); return true; }
        case 'ngime-delete': { const s = checked(c); if (!s.size) { c.toast(t('user_dictionary_tool_error_delete_entries_without_check')); return true; } snapshot(c); cur(c).words = cur(c).words.filter((_, i) => !s.has(i)); s.clear(); c.toast(t('user_dictionary_tool_delete_done_message')); done(c); return true; }
        case 'ngime-dicts': c.dialog({items: d.dicts.map(x => ({html: c.safe(x.name)})), onItem: (i, c) => { d.cur = i; checked(c).clear(); done(c); }}); return true;
        case 'ng-menu': c.menu([
          {label: t('user_dictionary_tool_menu_create_dictionary_title'), action: c => nameDialog(c, false)},
          {label: t('user_dictionary_tool_menu_rename_dictionary_title'), action: c => nameDialog(c, true)},
          {label: t('user_dictionary_tool_menu_delete_dictionary_title'), action: c => { snapshot(c); d.dicts.splice(d.cur, 1); d.cur = 0; checked(c).clear(); c.toast(t('user_dictionary_tool_delete_done_message')); done(c); }},
          {label: t('user_dictionary_tool_menu_export_dictionary_title'), action: c => { const n = `${cur(c).name}.zip`; NG.share(c, {kind: 'file', name: n, subject: n, text: '', document: {name: n, type: 'file', mime: 'application/zip', userDictionary: JSON.parse(JSON.stringify(cur(c)))}}); }},
          {label: t('user_dictionary_tool_menu_import_dictionary_title'), action: c => importDictionary(c)},
          {label: t('user_dictionary_tool_menu_undo_title'), action: c => { const prev = d.undo.pop(); if (!prev) { c.toast(t('user_dictionary_tool_status_error_no_undo_history')); return; } Object.assign(d, JSON.parse(prev)); checked(c).clear(); c.toast(t('user_dictionary_tool_undo_done_message')); done(c); }}], el); return true;
      }
      return false;
    }
  };
  NG.appPrefsHooks.imejapanese = {fragment, click: libsClick('imejapanese'), summary: summary('imejapanese'), actions, action: menuAction('imejapanese'), customs: {dictool, themes: themes('imejapanese')}};
})();
