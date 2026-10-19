/* Android 6.0.1: the apps' own settings screens drawn from their res/xml (mm-appprefs-data.js, docs/tools/mm-appprefs.py),
   as each app's PreferenceActivity / PreferenceFragment shows them.
   - The toolbar in the activity theme's colorPrimary (the status bar colorPrimaryDark) with Up and the title: the
     screen's title, else the header's or the hook's; a light colorPrimary (Calendar's white) takes dark text.
   - preference_material.xml rows as in Settings (the 16 sp title over the 14 sp summary, 16 dp at the sides, the
     widget at the end), PreferenceCategory titles in Body2 in colorAccent; a preference-headers file lists its headers.
   - SwitchPreference / CheckBoxPreference keep their value (data.appPrefs[app][key], the XML's defaultValue first) and
     disable their dependants as Preference.setDependency does; ListPreference (and the apps' own list subclasses)
     open a single choice dialog and show the chosen entry as the summary when the XML gives none; EditTextPreference
     a text dialog. A nested PreferenceScreen opens as the next screen; a header or preference with a fragment opens
     the XML its hook names.
   Hooks (MM.appPrefsHooks[app]): {title(c, xml), hide(c, key, node) or hidden: [keys], summary(c, key, node),
   click(c, key, node), get(c, key), set(c, key, v), fragments: {class name: xml}, screens: {key: xml} (an empty
   PreferenceScreen the code fills from another file), append: {xml: [xml]} (files the code adds to a screen), top(c,
   xml) → html above the rows, color: [primary, dark]}.
   Use: MM.openPrefs(c, app, xml, title). */
(() => {
  'use strict';
  const T = () => MM.text('appprefs');
  const esc = (c, s) => c.safe(s);
  const str = r => typeof r === 'string' && r.startsWith('string/') ? T().t(r.slice(7)) : r || '';
  const arr = r => typeof r === 'string' && r.startsWith('array/') ? T().t(r.slice(6)) : Array.isArray(r) ? r : [];
  MM.appPrefsHooks = MM.appPrefsHooks || {};
  MM.appPrefStr = str; MM.appPrefArr = arr;

  const st = c => c.ui.appPrefs;
  const cur = c => st(c)?.stack.at(-1);
  const app = c => MM.appPrefsXml[st(c).app];
  const hooks = c => MM.appPrefsHooks[st(c).app] || {};
  const store = c => { const d = c.data.appPrefs || (c.data.appPrefs = {}); return d[st(c).app] || (d[st(c).app] = {}); };
  MM.appPref = (c, id, key, def) => (c.data.appPrefs?.[id] || {})[key] ?? def;
  MM.openPrefs = (c, id, xml, title = '') => { c.ui.appPrefs = {app: id, stack: [{xml, path: [], title}]}; c.open('app-prefs', id); };

  function nodeOf(c) {
    const s = cur(c); let n = app(c).xml[s.xml];
    for (const k of s.path) n = (n.c || []).find(x => x.key === k) || n;
    return n;
  }
  const find = (n, key) => { if (!n) return null; if (n.key === key) return n; for (const k of n.c || []) { const f = find(k, key); if (f) return f; } return null; };
  const isList = n => /ListPreference$|DropDownPreference$/.test(n.t);
  const isEdit = n => /EditTextPreference$/.test(n.t);
  const isToggle = n => /(Switch|CheckBox)Preference$/.test(n.t);
  function value(c, n) {
    const h = hooks(c).get?.(c, n.key, n); if (h !== undefined) return h;
    const s = store(c); if (n.key in s) return s[n.key];
    if (isToggle(n)) return String(n.defaultValue) === 'true';
    return str(n.defaultValue) || (isList(n) ? arr(n.entryValues)[0] : '');
  }
  function setValue(c, n, v) { if (hooks(c).set?.(c, n.key, v, n) === true) { c.save(); return; } store(c)[n.key] = v; c.save(); }
  function disabled(c, n) {
    // A row the app's code enables itself (setEnabled) although its XML starts it disabled.
    const on = hooks(c).enabled?.(c, n.key, n); if (on !== undefined) return !on;
    if (n.enabled === 'false') return true;
    if (!n.dependency) return false;
    const dep = find(app(c).xml[cur(c).xml], n.dependency);
    return dep ? !value(c, dep) : false;
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
  // Each row carries the index path of its node under the screen's node (data-p).
  function rows(c, node, prefix = '') {
    const h = hooks(c), out = [];
    for (const [i, n] of (node.c || []).entries()) {
      if (h.hide?.(c, n.key, n) || (n.key && h.hidden?.includes(n.key))) continue;
      if (n.t === 'PreferenceCategory') {
        const inner = rows(c, n, `${prefix}${i}.`);
        if (inner) out.push(`${n.title ? `<div class="mmpf-cat">${esc(c, str(n.title))}</div>` : ''}${inner}`);
        continue;
      }
      // An edit text without a title shows its value as the title (Telecom's quick responses).
      const title = h.title?.(c, n.key, n) ?? (str(n.title) || (isEdit(n) ? value(c, n) : '')), sum = summary(c, n), off = disabled(c, n);
      if (!title && !sum) continue;
      let widget = '';
      if (/SwitchPreference$/.test(n.t)) widget = `<i class="mmw-switch${value(c, n) ? ' on' : ''}"><i class="mmw-thumb"></i></i>`;
      else if (/CheckBoxPreference$/.test(n.t)) widget = `<i class="mmst-check${value(c, n) ? ' on' : ''}"></i>`;
      out.push(`<button type="button" class="mmst-pref${off ? ' disabled' : ''}" data-action="mmpf-pref" data-p="${prefix}${i}"${off ? ' disabled' : ''}><span class="mmst-texts"><span class="mmst-title">${esc(c, title)}</span>${sum ? `<span class="mmst-summary">${esc(c, sum)}</span>` : ''}</span>${widget ? `<span class="mmst-widget">${widget}</span>` : ''}</button>`);
    }
    return out.join('');
  }
  const light = hex => { const v = parseInt(hex.slice(1), 16); return ((v >> 16) * 299 + ((v >> 8 & 255) * 587) + (v & 255) * 114) / 1000 > 200; };
  const colors = c => { const h = hooks(c).color, th = app(c).theme || {}; return h || [th.colorPrimary || '#607d8b', th.colorPrimaryDark || '#455a64']; };

  function render(c) {
    if (!st(c)) return '';
    const s = cur(c), n = nodeOf(c), [primary] = colors(c), accent = app(c).theme?.colorAccent || '#009688';
    const title = s.title || str(n.title) || hooks(c).title?.(c, s.xml) || MM.appLabel?.(c, st(c).app) || '';
    // A dark activity theme (Clock's, Camera's: a light textColorPrimary) draws the list light on its windowBackground.
    const th = app(c).theme || {}, dark = light(th.textColorPrimary || '#000000');
    return `<div class="mmpf${dark ? ' dark' : ''}" style="--mmpf-accent:${accent};--mmw-accent:${accent};background:${th.windowBackground || '#fafafa'}"><div class="mmpf-bar${light(primary) ? ' light' : ''}" style="background:${primary}"><button type="button" class="mmpf-up" data-action="mmpf-up"><img src="assets/fw-ic_ab_back_material.svg" alt=""></button><span>${esc(c, title)}</span></div>
      <div class="mmpf-list">${hooks(c).top?.(c, s.xml) || ''}${rows(c, n)}${s.path.length ? '' : hooks(c).after?.(c, s.xml) || ''}${s.path.length ? '' : (hooks(c).append?.[s.xml] || []).map((x, k) => rows(c, app(c).xml[x], `@${k}.`)).join('')}</div></div>`;
  }
  function choose(c, n) {
    const entries = arr(n.entries), values = arr(n.entryValues), v = String(value(c, n));
    c.dialog({title: str(n.dialogTitle || n.title), items: entries.map((e, i) => ({html: `<span class="mmst-choice"><i class="mmw-radio${values[i] === v ? ' on' : ''}"></i><span>${esc(c, e)}</span></span>`})),
      buttons: [{label: MM.text('framework').t('cancel')}], onItem: i => { setValue(c, n, values[i]); c.render(); }});
  }
  function edit(c, n) {
    let v = String(value(c, n) || '');
    c.dialog({title: str(n.dialogTitle || n.title), message: str(n.dialogMessage), html: `<div class="mmpf-edit"><input value="${esc(c, v)}" autocomplete="off"></div>`,
      mount: (c, win) => { const f = win.querySelector('input'); f.addEventListener('input', () => { v = f.value; }); setTimeout(() => f.focus(), 50); },
      buttons: [{label: MM.text('framework').t('cancel')}, {label: MM.text('framework').t('ok'), action: c => { setValue(c, n, v); c.render(); }}]});
  }
  /* A NumberPicker in a dialog (the framework's number_picker_material: the value between dividers in colorAccent, the
     neighbours above and below faded; a touch on one or the wheel steps). values: the numbers to pick from; label(n)
     their text; caption: a text under the picker (SnoozeLengthDialog's "minutes"). */
  MM.numberDialog = (c, {title, values, value, label = String, caption = '', ok, onSet}) => {
    let i = Math.max(0, values.indexOf(value));
    const draw = win => { win.querySelector('.mmpf-picker').innerHTML = [i - 1, i, i + 1].map((j, k) => `<button type="button" data-d="${k - 1}" class="${k === 1 ? 'cur' : ''}">${j >= 0 && j < values.length ? c.safe(label(values[j])) : ''}</button>`).join(''); };
    c.dialog({title, html: `<div class="mmpf-number"><div class="mmpf-picker"></div>${caption ? `<span>${c.safe(caption)}</span>` : ''}</div>`,
      mount(c, win) {
        draw(win);
        const col = win.querySelector('.mmpf-picker');
        col.addEventListener('click', e => { const b = e.target.closest('[data-d]'); if (!b) return; e.stopPropagation(); i = Math.min(values.length - 1, Math.max(0, i + +b.dataset.d)); draw(win); });
        col.addEventListener('wheel', e => { e.preventDefault(); i = Math.min(values.length - 1, Math.max(0, i + Math.sign(e.deltaY))); draw(win); }, {passive: false});
      },
      buttons: [{label: MM.text('framework').t('cancel')}, {label: ok || MM.text('framework').t('ok'), action: c => onSet(c, values[i])}]});
  };
  MM.register('app-prefs', {
    // The window animation's page (mm-core.js): deeper screens open over the ones they came from.
    page: c => MM.page('prefs', ...(c.ui.appPrefs?.stack || []).map(s => `${s.xml}.${s.path.join('.')}`)),
    app: false,
    statusColor: c => st(c) ? colors(c)[1] : '#000',
    render,
    back(c) { const s = st(c); if (s && s.stack.length > 1) { s.stack.pop(); c.render(); return true; } c.ui.appPrefs = null; return false; },
    action(name, el, event, c) {
      if (name === 'mmpf-up') { if (!this.back(c)) c.back(); return true; }
      // A row a hook adds (after): data-xml opens that file of the app as the next screen.
      if (name === 'mmvc-corpus') { const k = `corpus_${el.dataset.k}`; ((c.data.appPrefs ||= {}).voice ||= {})[k] = !(MM.appPref(c, 'voice', k, true)); c.save(); c.render(); return true; }
      if (name === 'mmpf-goto') { st(c).stack.push({xml: el.dataset.xml, path: [], title: el.dataset.title || ''}); c.render(); return true; }
      if (name !== 'mmpf-pref') return hooks(c).action?.(c, name, el) === true;
      let node = nodeOf(c);
      for (const i of el.dataset.p.split('.')) node = i.startsWith('@') ? app(c).xml[hooks(c).append[cur(c).xml][+i.slice(1)]] : node?.c?.[+i];
      if (!node) return true;
      if (hooks(c).click?.(c, node.key, node) === true) return true;
      if (isToggle(node)) { setValue(c, node, !value(c, node)); c.render(); return true; }
      if (isList(node)) { choose(c, node); return true; }
      if (isEdit(node)) { edit(c, node); return true; }
      const to = node.key && hooks(c).screens?.[node.key];
      if (to) { st(c).stack.push({xml: to, path: [], title: str(node.title)}); c.render(); return true; }
      if (node.c && node.t === 'PreferenceScreen') { const s = cur(c); st(c).stack.push({xml: s.xml, path: [...s.path, node.key], title: ''}); c.render(); return true; }
      if (node.fragment) { const x = hooks(c).fragments?.[node.fragment.split('.').pop()] || hooks(c).fragment?.(c, node.fragment, node); if (x) { st(c).stack.push({xml: x, path: [], title: str(node.title)}); c.render(); } return true; }
      return true;
    }
  });
})();
