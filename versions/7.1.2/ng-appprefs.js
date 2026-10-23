/* Android 7.1.2: the apps' own settings screens drawn from their res/xml (ng-appprefs-data.js, docs/tools/mm-appprefs.py
   with ERA=ng), as each app's PreferenceActivity / PreferenceFragment shows them. The logic is 6.0.1's (its app
   preferences module); the rows are the framework's preference_material.xml as Settings draws them (ng-settings.js):
   - The action bar in the app's colour (a hook's color: [bar, status bar], else the activity theme's colorPrimary and
     colorPrimaryDark) with Up and the title: the screen's title, else the header's or the hook's.
   - SwitchPreference / CheckBoxPreference keep their value (data.appPrefs[app][key], the XML's defaultValue first) and
     disable their dependants as Preference.setDependency does; ListPreference (and the apps' own list subclasses) open
     a single choice dialog and show the chosen entry as the summary when the XML gives none; EditTextPreference a text
     dialog. A nested PreferenceScreen opens as the next screen; a header or preference with a fragment opens the XML
     its hook names; a hook's custom screen (customs: {name: {title, render, action}}) draws a page of its own.
   Hooks (NG.appPrefsHooks[app]): {title(c, key, node), hide(c, key, node) or hidden: [keys], summary(c, key, node),
   top(c, xml) / after(c, xml) (rows of the hook's own before / after the XML's),
   click(c, key, node), get(c, key), set(c, key, v), fragments: {class name: xml}, screens: {key: xml}, top(c, xml),
   color: [bar, status], customs, actions(c, xml) (the action bar's buttons of an XML screen)}.
   Use: NG.openPrefs(c, app, xml, title). */
(() => {
  'use strict';
  const T = () => NG.text('appprefs');
  const esc = (c, s) => c.safe(s);
  const str = r => typeof r === 'string' && r.startsWith('string/') ? T().t(r.slice(7)) : r || '';
  const arr = r => typeof r === 'string' && r.startsWith('array/') ? T().t(r.slice(6)) : Array.isArray(r) ? r : [];
  NG.appPrefsHooks = NG.appPrefsHooks || {};
  NG.appPrefStr = str; NG.appPrefArr = arr;

  const st = c => c.ui.appPrefs;
  const cur = c => st(c)?.stack.at(-1);
  // Each screen of the stack names its app: another app's settings activity opens over the one it came from.
  const appId = c => cur(c)?.app;
  const app = c => NG.appPrefsXml[appId(c)] || {xml: {}, theme: {}};
  const hooks = c => NG.appPrefsHooks[appId(c)] || {};
  const store = c => { const d = c.data.appPrefs || (c.data.appPrefs = {}); return d[appId(c)] || (d[appId(c)] = {}); };
  NG.appPref = (c, id, key, def) => (c.data.appPrefs?.[id] || {})[key] ?? def;
  NG.setAppPref = (c, id, key, v) => { ((c.data.appPrefs ||= {})[id] ||= {})[key] = v; c.save(); };
  NG.openPrefs = (c, id, xml, title = '') => {
    if (c.ui.view === 'app-prefs' && st(c)) { st(c).stack.push({app: id, xml, path: [], title}); c.render(); return; }
    c.ui.appPrefs = {stack: [{app: id, xml, path: [], title}]}; c.open('app-prefs', id);
  };
  NG.appPrefsGo = (c, xml, title = '') => { st(c).stack.push({app: appId(c), xml, path: [], title}); c.render(); };

  function nodeOf(c) {
    const s = cur(c); let n = app(c).xml[s.xml];
    // PreferenceCategories group rows visually; they are not navigation levels.
    // A nested screen inside one must still resolve by its preference key.
    for (const k of s.path) n = find(n, k) || n;
    return n;
  }
  const find = (n, key) => { if (!n) return null; if (n.key === key) return n; for (const k of n.c || []) { const f = find(k, key); if (f) return f; } return null; };
  const isList = n => /ListPreference$|DropDownPreference$/.test(n.t);
  const isEdit = n => /EditTextPreference$/.test(n.t);
  const isToggle = n => /(Switch|CheckBox)Preference$/.test(n.t) || n.extras?.TYPE_SWITCH === 'yes';
  function value(c, n) {
    const h = hooks(c).get?.(c, n.key, n); if (h !== undefined) return h;
    const s = store(c); if (n.key in s) return s[n.key];
    if (isToggle(n)) return String(n.defaultValue) === 'true';
    return str(n.defaultValue) || (isList(n) ? arr(n.entryValues)[0] : '');
  }
  function setValue(c, n, v) { if (hooks(c).set?.(c, n.key, v, n) === true) { c.save(); return; } store(c)[n.key] = v; c.save(); }
  function disabled(c, n) {
    const on = hooks(c).enabled?.(c, n.key, n); if (on !== undefined) return !on;
    if (n.enabled === 'false') return true;
    if (!n.dependency) return false;
    const dep = find(app(c).xml[cur(c).xml], n.dependency);
    if (!dep) return false;
    const v = value(c, dep);
    return String(dep.disableDependentsState) === 'true' ? !!v : !v;
  }
  function summary(c, n) {
    const h = hooks(c).summary?.(c, n.key, n); if (h !== undefined) return h;
    if (isToggle(n)) { const v = value(c, n); return str(v ? n.summaryOn || n.summary : n.summaryOff || n.summary); }
    if (isList(n)) {
      const i = arr(n.entryValues).indexOf(String(value(c, n))), entry = arr(n.entries)[i] ?? '';
      const s = str(n.summary);
      return s ? AndroidStrings.format(s, entry) : entry;
    }
    if (isEdit(n)) return n.title ? value(c, n) || str(n.summary) : str(n.summary);
    return str(n.summary);
  }
  const hidden = (c, n) => hooks(c).hide?.(c, n.key, n) || (n.key && hooks(c).hidden?.includes(n.key));
  // Each row carries the index path of its node under the screen's node (data-p).
  function rows(c, node, prefix = '') {
    const h = hooks(c), out = [];
    for (const [i, n] of (node.c || []).entries()) {
      if (hidden(c, n)) continue;
      if (n.t === 'header' && !n.fragment && !n.intent && !isToggle(n)) { if (n.title) out.push(NG.settingsCat(c, str(n.title))); continue; }
      if (/PreferenceCategory(?:Header)?$/.test(n.t)) {
        // A category without children is a header before the rows that follow it (Chrome's main_preferences).
        const cat = h.title?.(c, n.key, n) ?? str(n.title);
        if (!n.c?.length) { if (cat) out.push(NG.settingsCat(c, cat)); continue; }
        const inner = rows(c, n, `${prefix}${i}.`);
        if (inner) out.push(`${cat ? NG.settingsCat(c, cat) : ''}${inner}`);
        continue;
      }
      // An edit text without a title shows its value as the title (Telecom's quick responses).
      const title = h.title?.(c, n.key, n) ?? (str(n.title) || (isEdit(n) ? value(c, n) : '')), sum = summary(c, n), off = disabled(c, n);
      if (!title && !sum) continue;
      let widget = '';
      if (/SwitchPreference$/.test(n.t) || n.extras?.TYPE_SWITCH === 'yes') widget = NG.settingsSwitch(!!value(c, n), off);
      else if (/CheckBoxPreference$/.test(n.t)) widget = `<i class="ngst-check${value(c, n) ? ' on' : ''}"></i>`;
      out.push(NG.settingsRow(c, {title, summary: sum, widget, disabled: off, action: 'ngap-pref', data: ` data-p="${prefix}${i}"`}));
    }
    return out.join('');
  }
  const colors = c => { const h = hooks(c).color, th = app(c).theme || {}; return h || [th.colorPrimary || '#607d8b', th.colorPrimaryDark || '#455a64']; };
  // Light action-bar themes use the activity's dark foreground; coloured bars
  // use the inverse foreground. A hook may name an explicit source barText.
  const barText = c => {if(hooks(c).barText)return hooks(c).barText;const hex=String(colors(c)[0]).replace('#',''),rgb=hex.length===6?[0,2,4].map(i=>parseInt(hex.slice(i,i+2),16)):[];return rgb.length&&rgb[0]*.299+rgb[1]*.587+rgb[2]*.114>180?(app(c).theme?.textColorPrimary||'#333333'):'#ffffff';};
  const accent = c => hooks(c).accent || app(c).theme?.colorAccent || '#009688';

  // Open source licences: the input methods' LicenseActivity is a WebView of the APK's assets/licenses.html; the
  // social.licenses LicenseMenuActivity lists res/raw/third_party_license_metadata ("offset:length name", byte offsets
  // into third_party_licenses) and shows one; without the metadata the whole text.
  const LICENSES = {imehindi: {html: 'ime-hindi-licenses.html'}, imejapanese: {html: 'ime-japanese-licenses.html'}, imekorean: {html: 'ime-korean-licenses.html'},
    imepinyin: {html: 'ime-pinyin-licenses.html'}, gboard: {text: 'lime-third-party-licenses.txt'}, google: {text: 'gs-third-party-licenses.txt'},
    dialer: {text: 'dl-third-party-licenses.txt', meta: 'dl-third-party-license-metadata.txt'}};
  const licenseCache = {};
  const loadLicense = (c, id) => {
    const l = LICENSES[id], k = id; if (licenseCache[k]) return licenseCache[k];
    licenseCache[k] = {loading: true};
    Promise.all([fetch('assets/' + l.text).then(r => r.arrayBuffer()), l.meta ? fetch('assets/' + l.meta).then(r => r.text()) : null]).then(([buf, meta]) => {
      const bytes = new Uint8Array(buf), dec = new TextDecoder();
      const items = meta ? meta.split('\n').map(line => line.match(/^(\d+):(\d+) (.+)$/)).filter(Boolean).map(m => ({name: m[3], text: dec.decode(bytes.subarray(+m[1], +m[1] + +m[2]))})) : null;
      licenseCache[k] = {items, text: items ? '' : dec.decode(bytes)};
      if (c.ui.view === 'app-prefs') c.render();
    });
    return licenseCache[k];
  };
  function licensePage(c, s) {
    const l = LICENSES[s.app];
    if (l.html) return `<iframe class="ngap-licframe" src="assets/${l.html}" title=""></iframe>`;
    const d = loadLicense(c, s.app);
    if (d.loading) return '';
    if (s.xml === '@license' && d.items) return `<pre class="ngap-lictext">${esc(c, d.items[s.path[0]]?.text || '')}</pre>`;
    if (d.items) return d.items.map((x, i) => NG.settingsRow(c, {title: x.name, action: 'ngap-license', data: ` data-i="${i}"`})).join('');
    return `<pre class="ngap-lictext">${esc(c, d.text)}</pre>`;
  }
  // The intents of rows no hook takes: a web page in Chrome, the system's settings pages, the licences.
  function openIntent(c, n) {
    const i = n.intent || {}, cls = i.targetClass || '';
    if (i.action === 'android.intent.action.VIEW' && /^https?:/.test(i.data || '')) { c.open('chrome', 'url:' + i.data); return true; }
    if (i.action === 'android.settings.USER_DICTIONARY_SETTINGS') { c.open('settings', 'user-dictionary'); return true; }
    if (i.action === 'android.settings.CAPTIONING_SETTINGS') { c.open('settings', 'xml:captioning_settings'); return true; }
    if (i.action === 'com.google.android.gms.location.settings.GOOGLE_LOCATION_SETTINGS') { c.open('settings', 'gms-location'); return true; }
    if (/License(Menu)?Activity$|LicensesActivity$/.test(cls) && LICENSES[appId(c)]) { st(c).stack.push({app: appId(c), xml: '@licenses', path: [], title: str(n.title)}); c.render(); return true; }
    return false;
  }

  function render(c) {
    if (!st(c)) return '';
    const s = cur(c), lic = s.xml.startsWith('@license'), custom = lic ? null : hooks(c).customs?.[s.xml], [primary] = colors(c), h = hooks(c);
    const n = custom || lic ? null : nodeOf(c);
    const title = custom?.title?.(c) || (n && h.title?.(c, n.key, n)) || s.title || (n && str(n.title)) || h.screenTitle?.(c, s.xml) || '';
    const body = lic ? licensePage(c, s) : custom ? custom.render(c) : n ? `${h.top?.(c, s.xml) || ''}${rows(c, n)}${h.after?.(c, s.xml) || ''}` : c.missing('app-prefs');
    if(custom?.fullscreen)return body;
    const bg = h.window || app(c).theme?.windowBackground || '#fafafa';
    return `<div class="ngst ngap" style="--ngap-primary:${primary};--ngap-accent:${accent(c)};--ngap-window:${bg};--ngap-bar-text:${barText(c)}"><div class="ngst-ab"><button type="button" class="ngst-nav" data-action="ngap-up" aria-label="${esc(c, NG.text('settings').t('framework/action_bar_up_description'))}"><i style="-webkit-mask-image:url('assets/fw-ic_ab_back_material.svg');mask-image:url('assets/fw-ic_ab_back_material.svg')"></i></button>
      <span class="ngst-abtitle nav">${esc(c, title)}</span><span class="ngst-actions">${custom ? custom.actions?.(c) || '' : lic ? '' : h.actions?.(c, s.xml) || ''}</span></div><div class="ngst-content ngst-list ngap-list">${body}</div></div>`;
  }
  // The list dialog's radios take the app's accent (its AlertDialog theme).
  NG.appPrefsChoose = (c, title, entries, curIndex, onPick, color = '#009688') => c.dialog({title, items: entries.map((e, i) => ({html: `<span class="ngst-choice"><i class="ngw-radio ngst-radio${i === curIndex ? ' on' : ''}" style="--ngw-accent:${color}"></i><span>${esc(c, e)}</span></span>`})),
    buttons: [{label: NG.text('settings').t('framework/cancel')}], onItem: i => onPick(c, i)});
  function choose(c, n) {
    const values = arr(n.entryValues), v = String(value(c, n));
    NG.appPrefsChoose(c, str(n.dialogTitle || n.title), arr(n.entries), values.indexOf(v), (c, i) => { setValue(c, n, values[i]); c.render(); }, accent(c));
  }
  function edit(c, n) {
    let v = String(value(c, n) || '');
    c.dialog({title: str(n.dialogTitle || n.title), message: str(n.dialogMessage), html: `<div class="ngst-edit"><input type="text" class="ngst-input" value="${esc(c, v)}" autocomplete="off" style="border-color:${accent(c)}"></div>`,
      mount: (c, win) => { const f = win.querySelector('input'); f.addEventListener('input', () => { v = f.value; }); setTimeout(() => f.focus(), 50); },
      buttons: [{label: NG.text('settings').t('framework/cancel')}, {label: NG.text('settings').t('framework/ok'), action: c => { setValue(c, n, v); c.render(); }}]});
  }
  NG.register('app-prefs', {
    // The window animation's page (ng-core.js): deeper screens open over the ones they came from.
    page: c => NG.page('prefs', ...(c.ui.appPrefs?.stack || []).map(s => `${s.app}.${s.xml}.${s.path.join('.')}`)),
    app: false,
    statusColor: c => st(c) ? hooks(c).customs?.[cur(c).xml]?.statusColor?.(c) || colors(c)[1] : '#000',
    dialogAccent: c => st(c) ? accent(c) : '',
    render,
    back(c) { const s = st(c); if (s && s.stack.length > 1) { s.stack.pop(); c.render(); return true; } c.ui.appPrefs = null; return false; },
    action(name, el, event, c) {
      if (name === 'ngap-up') { if (!this.back(c)) c.back(); return true; }
      const custom = hooks(c).customs?.[cur(c)?.xml];
      if (custom?.action?.(c, name, el) === true) return true;
      if (name === 'ngap-license') { const d = licenseCache[appId(c)]; st(c).stack.push({app: appId(c), xml: '@license', path: [+el.dataset.i], title: d?.items?.[+el.dataset.i]?.name || ''}); c.render(); return true; }
      if (name !== 'ngap-pref') return hooks(c).action?.(c, name, el) === true;
      let node = nodeOf(c);
      for (const i of el.dataset.p.split('.')) node = node?.c?.[+i];
      if (!node || disabled(c, node)) return true;
      if (hooks(c).click?.(c, node.key, node) === true) return true;
      if (isToggle(node)) { setValue(c, node, !value(c, node)); c.render(); return true; }
      if (isList(node)) { choose(c, node); return true; }
      if (isEdit(node)) { edit(c, node); return true; }
      const to = node.key && hooks(c).screens?.[node.key];
      if (to) { st(c).stack.push({app: appId(c), xml: to, path: [], title: str(node.title)}); c.render(); return true; }
      if (node.c && node.t === 'PreferenceScreen') { const s = cur(c); st(c).stack.push({app: s.app, xml: s.xml, path: [...s.path, node.key], title: ''}); c.render(); return true; }
      if (node.fragment) { const x = hooks(c).fragments?.[node.fragment.split('.').pop()] || hooks(c).fragment?.(c, node.fragment, node); if (x) { st(c).stack.push({app: appId(c), xml: x, path: [], title: str(node.title)}); c.render(); } return true; }
      if (node.intent) openIntent(c, node);
      return true;
    }
  });
})();
