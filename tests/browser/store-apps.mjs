// The store apps that work (docs/plans/play-apps.md), in every version: the version's store installs each of them
// (Pocket Planner, the three games, Focus Timer, Daily Weather), Open starts it (a task added in Pocket Planner is
// saved, a game opens on its canvas, Focus Timer at 25:00, Daily Weather on Riverside),
// and uninstalling from the store takes the app and its data away.
// Needs a server for the repository root (BASE, default http://localhost:8090) and Chrome (CHROME).
//     node tests/browser/store-apps.mjs [version...]
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const BASE = process.env.BASE || 'http://localhost:8090';
const CHROME = process.env.CHROME || (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : 'google-chrome');
const picked = process.argv.slice(2).filter(a => /^\d/.test(a));
const sleep = ms => new Promise(r => setTimeout(r, ms));

// In-page helpers every step can use.
const HELPERS = `
  window.__sleep = ms => new Promise(r => setTimeout(r, ms));
  window.__act = (a, extra = {}) => { const b = document.createElement('button'); b.dataset.action = a; Object.assign(b.dataset, extra); (document.querySelector('#viewport').firstElementChild || document.querySelector('#viewport')).append(b); b.click(); b.remove(); };
  window.__click = sel => { const el = document.querySelector(sel); if (!el) throw new Error('missing ' + sel); el.click(); };
  window.__type = (text) => { const i = document.querySelector('#overlay-root [role="dialog"] input, #overlay-root input, .mmdlg-win input, .ngdlg-win input'); if (!i) throw new Error('no input'); i.value = text; i.dispatchEvent(new Event('input', {bubbles: true})); i.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true})); };
  window.__save = re => { const k = Object.keys(localStorage).find(k => re.test(k)); return k ? JSON.parse(localStorage.getItem(k)) : {}; };
`;
// The older simulator.js versions: their store's detail page, Install / Accept, Open, the app's add button.
const legacy = (v, key, pfx, acceptInView, addSel) => ID => ({
  v, key,
  ready: `!!document.querySelector('#viewport .home-view, #viewport .lock-view') && !document.querySelector('.ga-boot')`,
  install: `__act('unlock'); await __sleep(900); __act('open-app', {app: 'play-store'}); await __sleep(1000); __act('${pfx}-detail', {id: '${ID}'}); await __sleep(700);
    __click('#viewport [data-action="${pfx}-buy"]'); await __sleep(700); __click('${acceptInView ? '#viewport' : '#overlay-root'} [data-action="${pfx}-accept"]');`,
  installed: `(__save(/${key}/).marketInstalled || []).includes('${ID}')`,
  open: `__click('#viewport [data-action="${pfx}-open"]');`,
  add: `__click('${addSel}'); await __sleep(500); __type('Buy milk'); await __sleep(500);`,
  data: `JSON.stringify(__save(/${key}/).storeApps?.planner?.tasks || {})`,
  uninstall: `__act('open-app', {app: 'play-store'}); await __sleep(900); __act('${pfx}-detail', {id: '${ID}'}); await __sleep(700);
    ${pfx === 'gbmk' ? `__act('gbmk-uninstall', {id: '${ID}'});` : `__act('${pfx}-uninstall', {id: '${ID}'});`} await __sleep(600);`,
  gone: `!(__save(/${key}/).marketInstalled || []).includes('${ID}') && !__save(/${key}/).storeApps?.planner && !JSON.stringify(__save(/${key}/).homePages || []).includes('store-${ID}')`
});
const VERSIONS = {
  '2.1': ID => ({
    v: '2.1', key: 'ec-v1',
    ready: `!!window.EC?.context && !document.querySelector('.ecsys-boot') && ['home', 'lock'].includes(EC.context.ui.view)`,
    install: `const c = EC.context; if (c.ui.view === 'lock') c.unlock(); await __sleep(400); c.open('market', 'details:${ID}'); await __sleep(700);
      __click('#viewport [data-action="ecmk-install"]'); await __sleep(500); __click('#viewport [data-action="ecmk-perm-ok"]');`,
    installed: `EC.context.data.market.installed.includes('${ID}') && !!EC.apps.get('store-${ID}')`,
    open: `__click('#viewport [data-action="ecmk-launch"]');`,
    add: `__click('#viewport .ecplan-day.today'); await __sleep(500); __type('Buy milk'); await __sleep(500);`,
    data: `JSON.stringify(EC.context.data.storeApps?.planner?.tasks || {})`,
    uninstall: `EC.context.open('market', 'details:${ID}'); await __sleep(600); __click('#viewport [data-action="ecmk-uninstall"]'); await __sleep(400);
      [...document.querySelectorAll('#overlay-root button')].find(b => /^(OK|Ok)$/.test(b.textContent.trim())).click(); await __sleep(500);`,
    gone: `!EC.context.data.market.installed.includes('${ID}') && !EC.context.data.storeApps?.planner && !EC.apps.get('store-${ID}')`
  }),
  '2.3.6': legacy('2.3.6', 'gb-v1', 'gbmk', true, '#viewport .gbplan-day'),
  '4.0.4': legacy('4.0.4', 'ics-v1', 'icsp', true, '#viewport .icsplan-action[data-action="icsplan-add"]'),
  '4.3': legacy('4.3', 'jb-v1', 'jbp', false, '#viewport .jbplan-action[data-action="jbplan-add"]'),
  '4.4.4': legacy('4.4.4', 'kk-v1', 'jbp', false, '#viewport .kkplan-action[data-action="kkplan-add"]'),
  '5.1.1': legacy('5.1.1', 'lp-v1', 'jbp', false, '#viewport .lpplan-fab'),
  '6.0.1': ID => ({
    v: '6.0.1', key: 'mm-v1',
    ready: `/view-(home|lock)/.test(document.querySelector('#screen').className) && !document.querySelector('.mmpw-boot')`,
    install: `MM.register('zz-cap', {render: c => { window.__c = c; return ''; }}); __act('mm-open', {view: 'zz-cap'}); await __sleep(300); __c.unlock?.(); __c.open('play-store'); await __sleep(1000);
      [...document.querySelectorAll('#viewport [data-action="mmps-item"]')].find(x => x.dataset.id === '${ID}').click(); await __sleep(800); __click('#viewport [data-action="mmps-install"]');`,
    installed: `(__save(/mm-v1/).play?.installed || []).includes('${ID}') && !!MM.appsData['store-${ID}']`,
    open: `__click('#viewport [data-action="mmps-open"]');`,
    add: `__click('#viewport .mmplan-fab'); await __sleep(500); __type('Buy milk'); await __sleep(500);`,
    data: `JSON.stringify(__save(/mm-v1/).storeApps?.planner?.tasks || {})`,
    uninstall: `__c.open('play-store'); await __sleep(800); const card = [...document.querySelectorAll('#viewport [data-action="mmps-item"]')].find(x => x.dataset.id === '${ID}'); if (card) { card.click(); await __sleep(700); }
      __click('#viewport [data-action="mmps-uninstall"]'); await __sleep(400); [...document.querySelectorAll('.mmdlg-button')].at(-1).click(); await __sleep(500);`,
    gone: `!(__save(/mm-v1/).play?.installed || []).includes('${ID}') && !__save(/mm-v1/).storeApps?.planner && !MM.appsData['store-${ID}']`
  }),
  '7.1.2': ID => ({
    v: '7.1.2', key: 'ng-v1',
    ready: `/view-(home|lock)/.test(document.querySelector('#screen').className) && !document.querySelector('.ngpw-boot, .ng-boot')`,
    install: `NG.register('zz-cap', {render: c => { window.__c = c; return ''; }}); __act('ng-open', {view: 'zz-cap'}); await __sleep(300); __c.unlock?.(); __c.open('play-store'); await __sleep(1000);
      [...document.querySelectorAll('#viewport [data-action="ngps-item"]')].find(x => x.dataset.id === '${ID}').click(); await __sleep(800); __click('#viewport [data-action="ngps-install"]');`,
    installed: `(__save(/ng-v1/).playStore?.installed || []).includes('${ID}') && !!NG.appsData['demo-${ID}']`,
    open: `__click('#viewport [data-action="ngps-open"]');`,
    add: `__click('#viewport .ngplan-fab'); await __sleep(500); __type('Buy milk'); await __sleep(500);`,
    data: `JSON.stringify(__save(/ng-v1/).storeApps?.planner?.tasks || {})`,
    uninstall: `__c.open('play-store'); await __sleep(800); const card = [...document.querySelectorAll('#viewport [data-action="ngps-item"]')].find(x => x.dataset.id === '${ID}'); if (card) { card.click(); await __sleep(700); }
      __click('#viewport [data-action="ngps-uninstall"]'); await __sleep(400); [...document.querySelectorAll('.ngdlg-button')].at(-1).click(); await __sleep(500);`,
    gone: `!(__save(/ng-v1/).playStore?.installed || []).includes('${ID}') && !__save(/ng-v1/).storeApps?.planner && !NG.appsData['demo-${ID}']`
  })
};

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'store-')), port = 9100 + Math.floor(Math.random() * 600);
const chrome = spawn(CHROME, ['--headless=new', '--no-sandbox', `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, 'about:blank'], {stdio: 'ignore'});
let ws;
for (let i = 0; i < 160 && !ws; i++) { try { const p = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page'); if (p) ws = new WebSocket(p.webSocketDebuggerUrl); } catch {} if (!ws) await sleep(250); }
if (!ws) { console.error('Chrome did not start'); process.exit(2); }
await new Promise(r => ws.onopen = r);
let id = 0; const pending = {}, errors = [];
ws.onmessage = m => {
  const d = JSON.parse(m.data);
  if (d.method === 'Runtime.exceptionThrown') errors.push(d.params.exceptionDetails.exception?.description?.split('\n')[0] || d.params.exceptionDetails.text);
  if (pending[d.id]) { pending[d.id](d); delete pending[d.id]; }
};
const send = (method, params = {}) => new Promise(r => { pending[++id] = r; ws.send(JSON.stringify({id, method, params})); });
const ev = async expr => { const r = await send('Runtime.evaluate', {expression: expr, awaitPromise: true, returnByValue: true}); if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text); return r.result?.result?.value; };
// A failed step says where the phone was.
const run = body => ev(`(async () => { ${body} })()`).catch(async error => {
  const where = await ev(`(document.querySelector('#screen')?.className || '') + ' | ' + (document.querySelector('#viewport')?.textContent || '').slice(0, 160)`).catch(() => '');
  throw new Error(`${error.message}
  at: ${where}`);
});
// A page that is still loading may not have the element yet: that counts as not ready.
const until = async (expr, ms = 20000) => { for (const end = Date.now() + ms; Date.now() < end; await sleep(250)) if (await ev(expr).catch(() => false)) return true; return false; };
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', {width: 1366, height: 900, deviceScaleFactor: 1, mobile: false});

for (const v of picked.length ? picked : Object.keys(VERSIONS)) for (const ID of ['pocket-planner', 'lunar-golf', 'orbit', 'blocks', 'focus-timer', 'daily-weather']) {
  const s = VERSIONS[v](ID), game = ['lunar-golf', 'orbit', 'blocks'].includes(ID); errors.length = 0;
  await send('Page.navigate', {url: `${BASE}/versions/${v}/`});
  assert.ok(await until(s.ready, 45000), `${v}: boots`);
  await sleep(3000);
  await ev(HELPERS);
  // Keep the screen awake: the steps send no pointer of their own.
  await ev(`window.__keep = setInterval(() => document.querySelector('#screen').dispatchEvent(new PointerEvent('pointerdown', {bubbles: true})), 1000)`);
  await run(s.install);
  assert.ok(await until(s.installed, 30000), `${v}: the store installs ${ID}`);
  await sleep(600);
  await run(s.open); await sleep(900);
  if (game) assert.ok(await ev(`!!document.querySelector('#viewport canvas[class*="game-canvas"]')`), `${v}: Open starts ${ID} on its canvas`);
  else if (ID === 'daily-weather') assert.match(await ev(`document.querySelector('#viewport')?.textContent || ''`), /Riverside/, `${v}: Open shows Riverside's weather`);
  else if (ID === 'focus-timer') assert.match(await ev(`document.querySelector('#viewport')?.textContent || ''`), /25:00/, `${v}: Open starts Focus Timer at 25:00`);
  else if (ID === 'pocket-planner') {
    assert.ok(await ev(`!!document.querySelector('#viewport [class*="plan-"]')`), `${v}: Open starts Pocket Planner`);
    await run(s.add);
    assert.match(await ev(s.data), /Buy milk/, `${v}: a task added in the app is saved`);
  }
  await run(s.uninstall);
  assert.ok(await until(s.gone, 8000), `${v}: uninstalling takes the app, its shortcut and its data away`);
  assert.deepEqual(errors, [], `${v}: no exceptions`);
  console.log(`${v} ${ID} passed: install, Open${game ? ' on its canvas' : ID === 'focus-timer' ? ' at 25:00' : ID === 'daily-weather' ? ' on Riverside' : ', a saved task'}, uninstall with the data.`);
}
chrome.kill();
process.exit(0);
