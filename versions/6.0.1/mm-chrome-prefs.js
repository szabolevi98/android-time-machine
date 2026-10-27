/* mm Chrome 6.0.1: local controls from Chrome 44's search_engine.xml and preference_text_scale.xml;
   clear data uses the image's strings. Only Chrome's local data is removed; bookmarks, app preferences and site
   permissions are independent. Search providers are the existing simulator's Google/Bing/Yahoo subset. */
(() => {
  'use strict';
  const T = () => MM.text('chrome'), F = () => MM.text('framework');
  const engines = [['Google', 'https://www.google.com/search?q='], ['Bing', 'https://www.bing.com/search?q='], ['Yahoo!', 'https://search.yahoo.com/search?p=']];
  const pref = (c, k, d) => MM.appPref(c, 'chrome', k, d);
  const set = (c, k, v) => { ((c.data.appPrefs ||= {}).chrome ||= {})[k] = v; c.save(); };
  MM.chromeAddress = (c, text) => {
    const u = MM.web.normalize(text);
    if (/^https?:\/\//i.test(String(text).trim()) || !/^https:\/\/www\.google\.com\/search\?q=/.test(u)) return u;
    return (engines.find(e => e[0] === pref(c, 'search_engine', 'Google')) || engines[0])[1] + encodeURIComponent(String(text).trim()).split('%20').join('+');
  };
  const state = c => c.data.chrome ||= {};
  function clear(c, selected, period = Infinity) {
    const s = state(c);
    if (selected[0]) {
      const cutoff = Date.now() - period;
      s.log = (s.log || []).filter(e => Number(e.time) < cutoff);
      s.visits = {};
      for (const e of s.log) s.visits[e.url] = (s.visits[e.url] || 0) + 1;
      s.closed = (s.closed || []).filter(e => Number(e.time) < cutoff);
      // Back/forward entries have no visit timestamps. Keep only the displayed page after clearing history.
      const tabs = false ? (s.tabs || []) : [s];
      for (const t of tabs) { t.history = [t.history?.[t.index] || 'chrome-native://newtab/']; t.index = 0; }
    }
    for (const [i, key] of [[1, 'cookies'], [2, 'cache'], [3, 'passwords'], [4, 'formData']]) if (selected[i]) delete s[key];
    c.save(); c.render();
  }
  MM.chromeClearLocal = clear;
  MM.chromeClearDialog = c => {
    const t = T(), selected = [true, true, true, false, false];
    const keys = ['clear_history_title', 'clear_cookies_and_site_data_title', 'clear_cache_title', 'clear_passwords_title', 'clear_formdata_title'];
    let period = Infinity;
    const periods = [3600000, 86400000, 604800000, 2419200000, Infinity];
    c.dialog({title: t.t('clear_browsing_data_title'), keepOpen: true,
      html: false ? `<label class="mmcr-period">${c.safe(t.t('clear_browsing_data_period_title'))}<select data-clear-period>${['hour', 'day', 'week', 'four_weeks', 'everything'].map((x, i) => `<option value="${i}"${i === 4 ? ' selected' : ''}>${c.safe(t.t('clear_browsing_data_period_' + x))}</option>`).join('')}</select></label>` : '',
      items: keys.map((k, i) => ({html: `<span class="mmst-choice"><i class="mmst-check${selected[i] ? ' on' : ''}"></i><span>${c.safe(t.t(k))}</span></span>`})),
      mount(c, win) { win.querySelector('[data-clear-period]')?.addEventListener('change', e => { period = periods[+e.target.value]; }); },
      onItem(i, c) { selected[i] = !selected[i]; c.el.overlay.querySelectorAll('.mmst-check')[i].classList.toggle('on', selected[i]); },
      buttons: [{label: F().t('cancel')}, {label: t.t('clear_data_delete'), action: c => clear(c, selected, period)}]});
  };
  const hooks = MM.appPrefsHooks.chrome, oldClick = hooks.click, oldSummary = hooks.summary;
  hooks.summary = (c, k, n) => k === 'search_engine' ? pref(c, k, 'Google') : k === 'text_scale' ? `${pref(c, k, 100)}%` : oldSummary?.(c, k, n);
  hooks.click = (c, k, n) => {
    if (k === 'clear_browsing_data') { MM.chromeClearDialog(c); return true; }
    if (k === 'search_engine') {
      c.dialog({title: T().t('prefs_search_engine'), items: engines.map(([name]) => ({html: `<span class="mmst-choice"><i class="mmw-radio mmst-radio${pref(c, k, 'Google') === name ? ' on' : ''}"></i><span>${name}</span></span>`})),
        buttons: [{label: F().t('cancel')}], onItem(i, c) { set(c, k, engines[i][0]); c.render(); }}); return true;
    }
    if (k === 'text_scale') {
      let v = pref(c, k, 100);
      c.dialog({title: T().t('font_size'), html: `<div class="mmcr-scale"><label><output>${v}%</output><input data-text-scale type="range" min="50" max="200" step="1" value="${v}" aria-label="${c.safe(T().t('font_size'))}"></label><p style="font-size:calc(${16 * v / 100} * var(--dp))">${c.safe(T().t('font_size_preview_text'))}</p></div>`,
        mount(c, win) { win.querySelector('input').addEventListener('input', e => { v = +e.target.value; win.querySelector('output').textContent = `${v}%`; win.querySelector('p').style.fontSize = `calc(${16 * v / 100} * var(--dp))`; }); },
        buttons: [{label: F().t('cancel')}, {label: F().t('ok'), action: c => { set(c, k, v); c.render(); }}]}); return true;
    }
    return oldClick?.(c, k, n) || false;
  };
  // Chrome's page text scales; the toolbar, thumbnails, icons and native pages keep their size.
  const prefsModule = MM.module('app-prefs'), oldAccent = prefsModule.dialogAccent;
  prefsModule.dialogAccent = c => c.ui.appPrefs?.app === 'chrome' ? '#4285f4' : oldAccent?.(c);
  const mod = MM.module('chrome'), mount = mod.mount;
  mod.mount = (c, root) => {
    const page = root.querySelector('.mmcr-page .mmwb'), scale = Math.min(200, Math.max(50, +pref(c, 'text_scale', 100) || 100)) / 100;
    if (page && scale !== 1) {
      const nodes = [page, ...page.querySelectorAll('*')].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()));
      const sizes = nodes.map(e => parseFloat(getComputedStyle(e).fontSize));
      nodes.forEach((e, i) => { e.style.fontSize = `${sizes[i] * scale}px`; });
    }
    mount?.(c, root);
  };
})();
