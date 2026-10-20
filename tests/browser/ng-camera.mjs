// Nougat Camera integration: a private Chrome profile, real module dispatch, both display sizes,
// all five languages, capture persistence and activity cleanup. Start a server at BASE first.
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';

const BASE = process.env.BASE || 'http://127.0.0.1:8090';
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ng-camera-'));
const port = 9700 + Math.floor(Math.random() * 200);
const chrome = spawn(CHROME, ['--headless=new', '--no-sandbox', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'], {stdio: 'ignore'});
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const errors = [], failed = [];
let ws, seq = 0;
const pending = new Map();
try {
  for (let i = 0; i < 80 && !ws; i++) {
    try { const tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl); } catch { await sleep(250); }
  }
  assert.ok(ws, 'Chrome starts');
  await new Promise(resolve => { ws.onopen = resolve; });
  ws.onmessage = message => {
    const data = JSON.parse(message.data);
    if (data.method === 'Runtime.exceptionThrown') errors.push(data.params.exceptionDetails.exception?.description || data.params.exceptionDetails.text);
    if (data.method === 'Network.responseReceived' && data.params.response.status >= 400) failed.push(data.params.response.url);
    if (pending.has(data.id)) { pending.get(data.id)(data); pending.delete(data.id); }
  };
  const send = (method, params = {}) => new Promise(resolve => { pending.set(++seq, resolve); ws.send(JSON.stringify({id: seq, method, params})); });
  const ev = async expression => {
    const result = await send('Runtime.evaluate', {expression, awaitPromise: true, returnByValue: true});
    assert.ok(!result.result?.exceptionDetails, JSON.stringify(result.result?.exceptionDetails));
    return result.result?.result?.value;
  };
  const until = async expression => {
    for (let i = 0; i < 100; i++) { if (await ev(expression)) return; await sleep(200); }
    throw new Error(`Timed out: ${expression}`);
  };
  const click = async selector => assert.equal(await ev(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)return false;el.click();return true})()`), true, selector);
  const open = async view => {
    await ev(`(()=>{const b=document.createElement('button');b.dataset.action='ng-open';b.dataset.view=${JSON.stringify(view)};document.querySelector('#viewport').append(b);b.click();b.remove()})()`);
    await sleep(450);
  };
  const saved = () => ev(`JSON.parse(localStorage.getItem('android-time-machine-ng-v1'))`);
  const shoot = () => click('#viewport [data-action="ngcm-shutter"]');
  const choose = async (o, v) => { await click(`#viewport [data-action="ngcm-option"][data-o="${o}"]`); await click(`#viewport [data-action="ngcm-pick"][data-v="${v}"]`); };
  await send('Runtime.enable'); await send('Network.enable');
  await send('Network.setCacheDisabled', {cacheDisabled: true});
  await send('Emulation.setDeviceMetricsOverride', {width: 1280, height: 1000, deviceScaleFactor: 1, mobile: false});
  await send('Page.navigate', {url: `${BASE}/versions/7.1.2/`});
  await until(`!!document.querySelector('#viewport .ngh, #viewport .nglk') || document.querySelector('#screen')?.classList.contains('view-home')`);
  await ev(`document.querySelector('.ngpw-boot')?.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))`);
  await until(`!document.querySelector('.ngpw-boot')`);
  // A fresh non-secure phone boots home; the action button below uses the same path as the launcher icon.
  await until(`document.querySelector('#screen').classList.contains('view-home')`);
  await open('camera');
  assert.equal(await ev(`!!document.querySelector('#viewport .ngcm')`), true);
  assert.equal(await ev(`getComputedStyle(document.querySelector('#status-bar')).display`), 'none');
  assert.equal(await ev(`getComputedStyle(document.querySelector('#viewport')).bottom`), '0px');
  const before = (await saved()).photos.length;
  await shoot(); assert.equal((await saved()).photos.length, before + 1);
  await choose('grid', '3x3'); assert.equal(await ev(`document.querySelectorAll('#viewport .ngcm-grid i').length`), 4);
  await choose('timer', '3');
  assert.equal((await saved()).camera.timer, 3, 'timer selected');
  await shoot(); assert.equal(await ev(`document.querySelector('.ngcm-count')?.textContent`), '3');
  await click('#nav-bar [data-key="back"]');
  assert.equal(await ev(`!!document.querySelector('#viewport .ngcm-count')`), false, 'Back removes countdown');
  await sleep(3200); assert.equal((await saved()).photos.length, before + 1, 'Back cancels timer');
  await choose('timer', '0');
  await click('#viewport [data-action="ngcm-switch"]'); await shoot();
  assert.equal((await saved()).photos.at(-1).front, true);
  assert.equal(await ev(`!!document.querySelector('#viewport [data-o="hdr"]')`), false);
  await click('#viewport [data-action="ngcm-flip"]'); await sleep(450); await shoot();
  await sleep(1200); await click('#viewport [data-action="ngcm-pause"]'); await sleep(1100);
  await click('#viewport [data-action="ngcm-pause"]'); await sleep(300); await click('#nav-bar [data-key="home"]'); await sleep(450);
  let video = (await saved()).photos.at(-1);
  assert.equal(video.kind, 'video'); assert.ok(video.duration >= 1400 && video.duration < 2300, `duration ${video.duration}`);
  const count = (await saved()).photos.length;
  await open('camera'); assert.equal(await ev(`!!document.querySelector('.ngcm-rec')`), false);
  assert.equal((await saved()).photos.length, count, 'return does not save twice');
  await click('#viewport [data-action="ngcm-menu"]'); await click('#viewport [data-m="settings"]');
  assert.equal(await ev(`document.querySelector('#screen').classList.contains('view-app-prefs')`), true);
  assert.equal(await ev(`!!document.querySelector('#viewport [data-action="ngap-pref"][data-p="1.0"]')`), true, 'back camera resolution preference');
  await click('#viewport [data-action="ngap-pref"][data-p="1.0"]');
  assert.equal(await ev(`document.querySelector('#overlay-root').textContent.includes('12.2')`), true, '6P camera resolution choices');
  await click('#nav-bar [data-key="back"]');
  await click('#nav-bar [data-key="back"]'); await sleep(450);
  await click('#viewport [data-action="ngcm-menu"]'); await click('#viewport [data-m="slomo"]'); await sleep(450);
  await click('#viewport [data-action="ngcm-hfr"]'); await shoot(); await sleep(150); await shoot();
  assert.equal((await saved()).photos.at(-1).fps, 120);
  await click('#viewport [data-action="ngcm-mode"][data-m="photo"]'); await sleep(450);
  await click('#viewport [data-action="ngcm-thumb"]');
  assert.equal(await ev(`document.querySelector('#screen').classList.contains('view-photos')`), true);
  assert.equal(await ev(`!!document.querySelector('#viewport .ngphotos-full')`), true, 'Photos displays the captured picture');
  await open('camera');
  const artifacts = path.resolve('tests/browser/artifacts'); fs.mkdirSync(artifacts, {recursive: true});
  const desktop = await send('Page.captureScreenshot', {format: 'png'});
  fs.writeFileSync(path.join(artifacts, '7.1.2-camera-desktop.png'), Buffer.from(desktop.result.data, 'base64'));
  await send('Emulation.setDeviceMetricsOverride', {width: 375, height: 812, deviceScaleFactor: 1, mobile: true});
  await sleep(250);
  assert.equal(await ev(`document.documentElement.scrollWidth <= innerWidth + 1`), true);
  assert.equal(await ev(`(()=>{const b=document.querySelector('.ngcm-shutter').getBoundingClientRect(),n=document.querySelector('#nav-bar').getBoundingClientRect();return b.bottom<=n.top && b.left>=0 && b.right<=innerWidth})()`), true, 'shutter clears navigation at phone width');
  const shot = await send('Page.captureScreenshot', {format: 'png'});
  fs.writeFileSync(path.join(artifacts, '7.1.2-camera-phone.png'), Buffer.from(shot.result.data, 'base64'));
  for (const lang of ['en', 'hu', 'de', 'fr', 'es']) {
    await ev(`AndroidI18n.setLanguage(${JSON.stringify(lang)});location.reload()`);
    await until(`document.querySelector('#screen')?.classList.contains('view-home') && document.documentElement.lang===${JSON.stringify(lang)}`);
    await open('camera'); await choose('wb', 'cloudy');
    await click('#viewport [data-action="ngcm-menu"]'); await click('#viewport [data-m="settings"]');
    assert.deepEqual(await ev(`[...AndroidStrings.misses]`), [], `${lang} camera strings`);
  }
  assert.deepEqual(errors, [], 'no JavaScript exceptions'); assert.deepEqual(failed, [], 'no failed requests');
  console.log('Nougat Camera browser checks passed: capture, timer, front camera, video pause/resume, activity exit, settings, slow motion, Photos route, phone width and five languages.');
} finally { ws?.close(); chrome.kill(); }
