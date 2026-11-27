// The paged apps drawer of 4.0.4–5.1.1 (Gingerbread's is one scrolling grid) under a mouse and a finger: a sideways
// drag that starts on an app icon turns the page (PagedView takes the gesture once it passes the touch slop, before the
// long press), however slowly it starts; a held icon still starts a drag to the home screen (Launcher.onLongClick →
// Workspace.beginDragShared).
// Needs a server for the repository root (BASE, default http://localhost:8090) and Chrome (CHROME).
//     node tests/browser/drawer-mouse.mjs [version...]
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const BASE = process.env.BASE || 'http://localhost:8090';
const CHROME = process.env.CHROME || (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : 'google-chrome');
const picked = process.argv.slice(2).filter(a => /^\d/.test(a));
const VERSIONS = picked.length ? picked : ['4.0.4', '4.3', '4.4.4', '5.1.1'];
const sleep = ms => new Promise(r => setTimeout(r, ms));

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'drawer-')), port = 9100 + Math.floor(Math.random() * 600);
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
const ev = async expr => (await send('Runtime.evaluate', {expression: expr, awaitPromise: true, returnByValue: true})).result?.result?.value;
const until = async (expr, ms = 15000) => { for (const end = Date.now() + ms; Date.now() < end; await sleep(100)) if (await ev(expr)) return true; return false; };
const act = action => ev(`(()=>{const el=document.createElement('button');el.dataset.action=${JSON.stringify(action)};const host=document.querySelector('#viewport').firstElementChild||document.querySelector('#viewport');host.append(el);el.click();el.remove();return true})()`);
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', {width: 1366, height: 900, deviceScaleFactor: 1, mobile: false});

const PAGE = `[...document.querySelectorAll('#viewport .drawer-indicators button')].findIndex(b=>b.classList.contains('active'))`;
const VIEW = `[...document.querySelector('#viewport').children].map(c=>c.className).join(' ')`;
// The centre of an app icon in the middle of the drawer page.
const ICON = `(()=>{const icons=[...document.querySelectorAll('#viewport .drawer-page .launcher-icon')];const el=icons[Math.min(icons.length-1,5)];if(!el)return null;const b=el.getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]})()`;

const mouse = (type, x, y, buttons) => send('Input.dispatchMouseEvent', {type, x, y, button: 'left', buttons, clickCount: type === 'mouseMoved' ? 0 : 1});
const touch = (type, x, y) => send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y}]});
// Press, wait, then move in small steps (a slow hand), and release.
async function gesture(kind, [x, y], dx, dy, hold, steps = 16) {
  if (kind === 'mouse') await mouse('mousePressed', x, y, 1); else await touch('touchStart', x, y);
  await sleep(hold);
  for (let i = 1; i <= steps; i++) {
    const px = x + dx * i / steps, py = y + dy * i / steps;
    if (kind === 'mouse') await mouse('mouseMoved', px, py, 1); else await touch('touchMove', px, py);
    await sleep(20);
  }
  if (kind === 'mouse') await mouse('mouseReleased', x + dx, y + dy, 0); else await touch('touchEnd');
  await sleep(500);
}

async function openDrawer(version) {
  await send('Page.navigate', {url: `${BASE}/versions/${version}/`});
  assert.ok(await until(`!!document.querySelector('#viewport .home-view, #viewport .lock-view') && !document.querySelector('.ga-boot')`, 45000), `${version}: boots`);
  if (/lock-view/.test(await ev(VIEW))) { await act('unlock'); assert.ok(await until(`!!document.querySelector('#viewport .home-view')`), `${version}: unlocks`); }
  await act('drawer');
  assert.ok(await until(`!!document.querySelector('#viewport .drawer-page .launcher-icon')`), `${version}: the drawer opens`);
  // A first-run cling over the drawer goes away as a visitor dismisses it.
  await ev(`document.querySelector('#viewport [data-cling] button, .cling [data-action]')?.click()`); await sleep(400);
  await ev(`document.querySelector('#viewport [data-action="drawer-page"][data-id="0"]')?.click()`); await sleep(300);
}

for (const version of VERSIONS) {
  errors.length = 0;
  for (const kind of ['mouse', 'touch']) {
    await send('Emulation.setTouchEmulationEnabled', {enabled: kind === 'touch', maxTouchPoints: 5});
    await openDrawer(version);
    assert.equal(await ev(PAGE), 0, `${version} ${kind}: the drawer starts on its first page`);
    const pages = await ev(`document.querySelectorAll('#viewport .drawer-indicators button').length`);
    assert.ok(pages > 1, `${version}: the drawer has more than one page`);
    // A slow start: the hand rests on the icon a moment (past any quick-flick window, short of the long press).
    await gesture(kind, await ev(ICON), -260, 12, 320);
    assert.match(await ev(VIEW), /drawer-view/, `${version} ${kind}: a sideways drag from an icon stays in the drawer`);
    assert.equal(await ev(PAGE), 1, `${version} ${kind}: a sideways drag from an icon turns the page`);
  }
  // A held icon still goes to the home screen.
  await send('Emulation.setTouchEmulationEnabled', {enabled: false});
  await openDrawer(version);
  const before = await ev(`document.querySelectorAll('#viewport .drawer-page .launcher-icon').length`);
  assert.ok(before > 0);
  const at = await ev(ICON);
  await mouse('mousePressed', at[0], at[1], 1); await sleep(800);
  for (let i = 1; i <= 10; i++) { await mouse('mouseMoved', at[0] + i * 3, at[1] - i * 4, 1); await sleep(20); }
  assert.ok(await until(`/home-view/.test(${VIEW})`, 3000), `${version}: a held icon is dragged onto the home screen (${await ev(VIEW)})`);
  await mouse('mouseReleased', at[0] + 30, at[1] - 40, 0); await sleep(500);
  assert.deepEqual(errors, [], `${version}: no exceptions`);
  console.log(`${version} drawer passed: a slow sideways mouse and finger drag from an icon turns the page; a held icon goes home.`);
}
chrome.kill();
process.exit(0);
