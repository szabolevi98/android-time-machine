// T47 (docs/reports/simulator-limits-2026-10-23.md): one reachability pass over the targets the modular versions list —
// 2.1 (EC), 6.0.1 (MM) and 7.1.2 (NG) — looking for the guard renderers (the "Not built yet" .ec-/.mm-/.ng-missing
// screen, the widget fallback, an unimplemented provider's pending card) on a normal path:
//   apps     every app of the launcher's catalogue, opened, then each control of its first screen and each item of
//            a menu that control opens (a fresh app each time);
//   settings the Settings tree breadth-first: every control of every screen, following each new screen it pushes;
//   widgets  every widget and shortcut the picker offers, drawn as the home screen draws it;
//   qs       (6.0.1, 7.1.2) every Quick Settings tile's detail panel the shade can open;
//   prefs    (6.0.1, 7.1.2) every app-preference XML the apps open, and each control of its first screen;
//   now      (6.0.1, 7.1.2) the Google Now page and the controls on it.
// It never generates arbitrary intents: only what the UI lists. Placeholders (%s) left in text are reported too.
//     node tests/browser/fallback-audit.mjs 7.1.2 [--out file.json]
// Needs a server for the repository root (BASE, default http://localhost:8090) and Chrome (CHROME).
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const VERSIONS = {'2.1': {g: 'EC', p: 'ec'}, '6.0.1': {g: 'MM', p: 'mm'}, '7.1.2': {g: 'NG', p: 'ng'}};
const version = process.argv[2], spec = VERSIONS[version];
if (!spec) { console.error('usage: node tests/browser/fallback-audit.mjs <2.1|6.0.1|7.1.2> [--out file]'); process.exit(2); }
const out = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : path.join(os.tmpdir(), `fallback-audit-${version}.json`);
const BASE = process.env.BASE || 'http://localhost:8090';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'fallback-')), port = 12000 + Math.floor(Math.random() * 2000);
const chrome = spawn(process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--no-sandbox', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'], {stdio: 'ignore'});
let ws, seq = 0; const pending = new Map(), errors = [], failed = [];
const send = (method, params = {}) => new Promise(resolve => { pending.set(++seq, resolve); ws.send(JSON.stringify({id: seq, method, params})); });
const ev = async expression => { const r = await send('Runtime.evaluate', {expression, awaitPromise: true, returnByValue: true}); if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400)); return r.result?.result?.value; };
const until = async (expression, ms = 20000) => { for (const end = Date.now() + ms; Date.now() < end; await sleep(200)) if (await ev(expression).catch(() => false)) return true; return false; };

// The pass itself, run inside the page against the core's context (a module registered for the purpose hands it over).
const CRAWL = ({g, p}) => `(async () => {
  const G = window.${g}, c = window.__auditC, wait = ms => new Promise(r => setTimeout(r, ms));
  const R = window.__audit = {done: false, at: '', counts: {apps: 0, appActions: 0, settings: 0, settingsActions: 0, widgets: 0, qs: 0, prefs: 0, now: 0}, found: [], placeholders: []};
  c.factoryReset = () => {}; if (G.users?.switchTo) G.users.switchTo = () => {}; if (window.AndroidI18n) AndroidI18n.setLanguage = () => {}; window.open = () => null;
  const MISS = '.${p}-missing, .ngwc-pending';
  const screen = () => document.querySelector('#screen'), overlay = () => document.querySelector('#overlay-root');
  const settle = async () => { for (let i = 0; i < 6 && c.ui.overlay; i++) { if (c.ui.overlay === 'dialog' && c.closeDialog) c.closeDialog(); else if (c.closeOverlay) c.closeOverlay(); else { c.ui.overlay = ''; c.render(); } await wait(20); } };
  const note = (kind, where, label) => {
    const m = screen()?.querySelector(MISS) || overlay()?.querySelector(MISS);
    if (m) R.found.push({kind, where, label, view: c.ui.view, overlay: c.ui.overlay || '', missing: m.dataset?.missing || m.className, detail: m.textContent.trim().slice(0, 120)});
    const text = (screen()?.innerText || '') + ' ' + (overlay()?.innerText || ''), ph = text.match(/%([0-9][$])?[sd](?![a-z])/);
    if (ph) R.placeholders.push({kind, where, label, around: text.slice(Math.max(0, ph.index - 40), ph.index + 40)});
    return !!m;
  };
  const label = el => (el.textContent || el.getAttribute('aria-label') || '').trim().replace(/\\s+/g, ' ').slice(0, 50);
  const click = el => { try { sessionStorage.setItem('__auditAt', R.at); if (el.click) el.click(); else el.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true})); } catch (e) { R.found.push({kind: 'error', where: R.at, label: label(el), detail: String(e).slice(0, 200)}); } };
  const actions = root => [...(root?.querySelectorAll('[data-action]') || [])];
  const SKIP = /^(${p}-key|${p}-up|${p}-back|${p}-home|${p}-recents|${p}-power|back|home)$/;
  // Actions that reload the page on purpose (a new UI language, a factory reset) end the pass, so they are left out.
  const RELOADS = /locale|language|factory|reset-all|ec-reset|${p}-reset/i;

  // ---- apps ----
  const ONLY = ${JSON.stringify(process.env.AUDIT_ONLY || '')}, part = name => !ONLY || ONLY.split(',').includes(name);
  const apps = !part('apps') ? [] : G.apps?.sorted ? G.apps.sorted().map(a => a.id) : Object.keys(G.appsData || {});
  for (const app of apps) {
    R.at = 'app ' + app; R.counts.apps++;
    await settle(); c.open(app); await wait(80);
    if (!G.module(app)) { R.found.push({kind: 'app', where: app, label: 'no module', view: c.ui.view}); continue; }
    if (note('app', app, 'open')) continue;
    const n = Math.min(actions(document.querySelector('#viewport')).length, 60);
    for (let i = 0; i < n; i++) {
      await settle(); c.open(app); await wait(40);
      const el = actions(document.querySelector('#viewport'))[i]; if (!el || SKIP.test(el.dataset.action) || RELOADS.test(el.dataset.action)) continue;
      const l = label(el); R.at = 'app ' + app + ' #' + i + ' ' + el.dataset.action; click(el); await wait(60); R.counts.appActions++;
      note('app', app, l);
      const items = c.ui.overlay ? actions(overlay()).length : 0;
      for (let j = 0; j < Math.min(items, 20); j++) {
        await settle(); c.open(app); await wait(30);
        const again = actions(document.querySelector('#viewport'))[i]; if (!again) break; click(again); await wait(50);
        const it = actions(overlay())[j]; if (!it) break; const l2 = label(it); click(it); await wait(60); R.counts.appActions++;
        note('app', app, l + ' > ' + l2);
      }
    }
  }

  // ---- settings ----
  const ec = ${JSON.stringify(p)} === 'ec';
  const getStack = () => ec ? [...(c.ui.settingsStack || [])] : JSON.parse(JSON.stringify(c.ui.settings?.stack || []));
  const setStack = s => { if (ec) c.ui.settingsStack = [...s]; else c.ui.settings = {stack: JSON.parse(JSON.stringify(s)), tab: 0}; c.render(); };
  const idOf = s => ec ? (s.at(-1) || 'settings') : (s.at(-1)?.screen || 'dashboard');
  await settle(); c.ui.dialog = null; c.ui.sub = ''; c.ui.settings = null; c.ui.settingsStack = ec ? ['settings'] : c.ui.settingsStack; c.open('home'); await wait(200); c.open('settings'); await wait(400);
  R.settingsStart = {view: c.ui.view, actions: actions(document.querySelector('#viewport')).length, html: document.querySelector('#viewport').innerHTML.slice(0, 1500)};
  const seen = new Set(), queue = part('settings') ? [getStack()] : [];
  while (queue.length && seen.size < 800) {
    const stack = queue.shift(), id = idOf(stack); if (seen.has(id)) continue; seen.add(id); R.counts.settings++;
    const at = async () => { await settle(); if (c.ui.view !== 'settings') c.open('settings'); setStack(stack); await wait(60); };
    await at(); R.at = 'settings ' + id;
    if (note('settings', id, 'screen')) continue;
    const n = actions(document.querySelector('#viewport')).length;
    for (let i = 0; i < n; i++) {
      await at(); const el = actions(document.querySelector('#viewport'))[i]; if (!el || SKIP.test(el.dataset.action) || RELOADS.test(el.dataset.action)) continue;
      const l = label(el); R.at = 'settings ' + id + ' #' + i + ' ' + el.dataset.action;
      const toast = () => [...document.querySelectorAll('[class*="toast"]')].map(x => x.textContent.trim()).filter(Boolean).join(' | '), t0 = toast();
      click(el); await wait(40); R.counts.settingsActions++;
      const missed = note('settings', id, l);
      // ec-settings.js: an intent action nothing handles ends as a toast of the row's own title.
      const t1 = toast(); if (t1 && t1 !== t0 && l && l.startsWith(t1.split(' | ').pop())) R.found.push({kind: 'settings', where: id, label: l, missing: 'title toast', detail: t1});
      const st = getStack();
      if (!missed && c.ui.view === 'settings' && st.length > stack.length && !seen.has(idOf(st))) queue.push(st);
    }
  }

  // ---- widgets: what the picker lists, drawn as the home screen draws it ----
  // 2.1: ec-widgets-more.js's PROVIDERS (the search bar is a home item of its own); ec-launcher.js draws widget:<id>.
  if (part('widgets') && ${JSON.stringify(p)} === 'ec') {
    for (const id of ['analog-clock', 'calendar', 'facebook', 'music', 'news-weather', 'picture-frame', 'power-control', 'youtube']) {
      R.counts.widgets++; const mod = G.module('widget:' + id);
      if (!mod) { R.found.push({kind: 'widget', where: id, label: 'no widget module'}); continue; }
      try { const box = document.createElement('div'); box.innerHTML = mod.render(c, {type: 'widget', widget: id, x: 0, y: 0, w: 4, h: 2}); if (box.querySelector(MISS)) R.found.push({kind: 'widget', where: id, label: 'render'}); }
      catch (e) { R.found.push({kind: 'widget', where: id, label: 'throws', detail: String(e).slice(0, 200)}); }
    }
  }
  if (part('widgets') && G.widgets?.home) {
    const ids = new Set();
    for (const w of G.widgetProviders || []) ids.add(w.id);
    await settle(); if (G.module('widgets')) { c.open('widgets'); await wait(120); document.querySelectorAll('#viewport [data-id], #viewport [data-widget], #viewport [data-w]').forEach(el => ids.add(el.dataset.id || el.dataset.widget || el.dataset.w)); }
    for (const id of ids) {
      const info = G.widgets.info?.(id); if (!info) continue; R.counts.widgets++;
      // A shortcut is not drawn as a widget: its configuration activity (widgetConfigs) puts a shortcut item on the screen.
      if (info.kind === 'shortcut') { if (!G.widgetConfigs?.[id]) R.found.push({kind: 'widget', where: id, label: 'shortcut without configuration'}); continue; }
      let html = ''; try { html = G.widgets.home(c, {w: id, id: 'audit-' + id, ...info, x: 0, y: 0}); } catch (e) { R.found.push({kind: 'widget', where: id, label: 'throws', detail: String(e).slice(0, 200)}); continue; }
      const box = document.createElement('div'); box.innerHTML = html;
      const m = box.querySelector(MISS) || (box.firstElementChild?.matches?.(MISS) ? box.firstElementChild : null);
      if (m) R.found.push({kind: 'widget', where: id, label: info.kind || '', missing: m.className, detail: m.textContent.trim().slice(0, 120)});
    }
  }

  // ---- Quick Settings details ----
  // The tiles whose click or label opens a detail panel (mm-shade.js / ng-shade.js showDetail and the user switcher).
  if (part('qs') && G.qsDetail) {
    const tiles = ${JSON.stringify(p)} === 'mm' ? ['wifi', 'bt', 'cell', 'dnd', 'cast', 'user'] : ['wifi', 'bt', 'cell', 'battery', 'dnd', 'cast', 'user'];
    for (const id of tiles) { R.counts.qs++; if (!G.qsDetail.has(id)) { if (id !== 'user' || G.users) R.found.push({kind: 'qs', where: id, label: 'no detail'}); continue; } c.ui.shade = {...(c.ui.shade || {}), qs: true, detail: id, revealed: true}; let html = ''; try { html = G.qsDetail.render(c, id, null); } catch (e) { R.found.push({kind: 'qs', where: id, label: 'throws', detail: String(e).slice(0, 200)}); continue; } const box = document.createElement('div'); box.innerHTML = html; if (box.querySelector(MISS)) R.found.push({kind: 'qs', where: id, label: 'detail'}); }
  }

  // ---- app preferences ----
  if (part('prefs') && G.openPrefs && G.appPrefsXml) {
    for (const [app, d] of Object.entries(G.appPrefsXml)) for (const xml of Object.keys(d.xml || {})) {
      R.at = 'prefs ' + app + ' ' + xml; R.counts.prefs++;
      const open = async () => { await settle(); c.ui.appPrefs = null; c.ui.settings = null; c.ui.dialog = null; c.open('home'); await wait(30); G.openPrefs(c, app, xml); await wait(60); };
      await open(); if (note('prefs', app + '/' + xml, 'open')) continue;
      const n = Math.min(actions(document.querySelector('#viewport')).length, 40);
      for (let i = 0; i < n; i++) { await open(); const el = actions(document.querySelector('#viewport'))[i]; if (!el || SKIP.test(el.dataset.action) || RELOADS.test(el.dataset.action)) continue; const l = label(el); click(el); await wait(40); note('prefs', app + '/' + xml, l); }
    }
  }

  // ---- Google Now page ----
  if (part('now') && G.google?.nowPage) {
    await settle(); c.open('home'); await wait(60); R.at = 'now';
    const box = document.createElement('div'); box.innerHTML = G.google.nowPage(c); R.counts.now++;
    if (box.querySelector(MISS)) R.found.push({kind: 'now', where: 'now page', label: 'render'});
  }
  R.done = true;
})().catch(e => { window.__audit.err = String(e.stack || e); window.__audit.done = true; }); 0`;

try {
  for (let i = 0; i < 100 && !ws; i++) { try { const tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl); } catch { await sleep(200); } }
  await new Promise(resolve => ws.onopen = resolve);
  ws.onmessage = m => { const d = JSON.parse(m.data); if (d.method === 'Runtime.exceptionThrown') errors.push(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text); if (d.method === 'Network.loadingFailed' && !d.params.canceled) failed.push(d.params.errorText); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
  await send('Runtime.enable'); await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride', {width: 1280, height: 900, deviceScaleFactor: 1, mobile: false});
  await send('Page.navigate', {url: `${BASE}/versions/${version}/`}); await sleep(400);
  await ev(`localStorage.clear(); sessionStorage.clear(); sessionStorage.setItem('android-sim-booted-${version}', '1'); localStorage.setItem('android-time-machine-language', 'en')`);
  await send('Page.navigate', {url: `${BASE}/versions/${version}/`});
  if (!await until(`!!window.${spec.g}?.module && !!document.querySelector('#screen')`)) throw new Error('the page does not start');
  await sleep(1500);
  await ev(`${spec.g}.register('zz-audit', {render: c => { window.__auditC = c; return ''; }}); (() => { const b = document.createElement('button'); b.dataset.action = '${spec.p}-open'; b.dataset.view = 'zz-audit'; document.querySelector('#viewport').append(b); b.click(); b.remove(); })(); 0`);
  if (!await until(`!!window.__auditC`)) throw new Error('no context');
  await ev(CRAWL(spec));
  let r; const start = Date.now();
  for (;;) { await sleep(3000); r = await ev(`window.__audit ? JSON.parse(JSON.stringify(window.__audit)) : null`); if (!r) { const at = await ev(`sessionStorage.getItem('__auditAt')`); throw new Error('the page reloaded or navigated at: ' + at); } if (r.done) break; if (Date.now() - start > 40 * 60e3) { r.err = 'timeout at ' + r.at; break; } }
  r.errors = [...new Set(errors)].slice(0, 20); r.failed = [...new Set(failed)].slice(0, 20); r.version = version;
  fs.writeFileSync(out, JSON.stringify(r, null, 1));
  console.log(`${version}: ${JSON.stringify(r.counts)}; ${r.found.length} guard renders, ${r.placeholders.length} placeholders, ${r.errors.length} exceptions${r.err ? '; ERROR ' + r.err : ''} → ${out}`);
} finally { ws?.close(); chrome.kill(); setTimeout(() => fs.rmSync(profile, {recursive: true, force: true}), 1500); }
