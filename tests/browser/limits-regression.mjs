// Regression for the simulator-limit fixes (docs/reports/simulator-limits-2026-10-23.md, the T packages): every path a
// package turned from a refusal into a working screen, reached the way a visitor reaches it. Each case runs on a fresh
// phone at desktop size (1280 × 900) and at phone width (375 × 812), and passes only when
//   the path's own positive result holds (the case's checks), no refusal message appeared on the way (a toast or a
//   "Not built yet" screen), no JavaScript exception was thrown and no local request failed.
// Taps are real pointer input at the element's centre (Input.dispatchMouseEvent), so a covered or off-screen control
// fails the same way it would for a visitor. Needs a server for the repository root (BASE, default
// http://localhost:8090) and Chrome (CHROME). A failing case leaves a screenshot in tests/browser/artifacts/.
//     node tests/browser/limits-regression.mjs [T01 ...] [--desktop | --phone]
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..', '..');
const BASE = process.env.BASE || 'http://localhost:8090';
const CHROME = process.env.CHROME || (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : 'google-chrome');
const ARTIFACTS = path.join(ROOT, 'tests', 'browser', 'artifacts');
const sleep = ms => new Promise(r => setTimeout(r, ms));
// The refusals the audit collected (its message table), in English: the cases run with the English UI.
const REFUSAL = /not part of the simulator|not part of this simulation|(?:un)?available in this (?:simulator|demo)|not available in the simulator|not built yet|is not simulated/i;

// Each case: the T package, the version, what it proves, and run(h) driving the path from the unlocked home screen.
// h.check(name, ok, detail) records a step; a false one fails the case.

// Email › Settings › the account: Quick responses, the ringtone and the server screens, kept and reloaded.
const emailSettings = async h => {
  const prefs = () => h.ev(`(()=>{const k=Object.keys(localStorage).find(k=>/^android-time-machine-\\w+-v1$/.test(k));return JSON.parse(localStorage.getItem(k)).emailPrefs||{}})()`);
  const account = async () => {
    await h.openApp('email');
    // The overflow's Settings (4.3, 4.4); Lollipop's Email has it in the navigation drawer.
    const overflow = '#viewport [data-action="email-menu"]:not([data-id="message"])', drawer = '#viewport [data-action="email-drawer"]';
    h.check('opens Email', await h.until(`!!document.querySelector('${overflow}, ${drawer}')`));
    await h.tap(await h.ev(`!!document.querySelector('${overflow}')`) ? overflow : drawer);
    await h.tap('[role="menu"] [data-action="email-settings"], .holo-menu [data-action="email-settings"], nav [data-action="email-settings"]');
    h.check('Settings opens Email\'s own settings', await h.until(`!!document.querySelector('#viewport .emp-app [data-id="account"]')`));
    await h.tap('#viewport .emp-row[data-id="account"]');
    h.check('the account\'s settings open', await h.until(`!!document.querySelector('#viewport .emp-row[data-id="incoming"]')`));
  };
  await account();
  await h.tap('#viewport .emp-row[data-id="account_quick_responses"]');
  h.check('Quick responses open empty', await h.until(`!!document.querySelector('#viewport .emp-empty')`));
  await h.tap('#viewport .emp-button[data-action="empx-quick"]');
  await h.type('#viewport [data-email-pref-edit]', 'See you at nine.');
  await h.tap('#viewport [data-action="empx-quick-save"]');
  h.check('a created quick response is listed', await h.until(`[...document.querySelectorAll('#viewport .emp-quick')].some(b=>b.textContent==='See you at nine.')`));
  await h.key('Escape');
  h.check('Back returns to the account', await h.until(`!!document.querySelector('#viewport .emp-row[data-id="incoming"]')`));
  const tone = await h.ev(`document.querySelector('#viewport .emp-row[data-id$="ringtone"]')?.dataset.id`);
  await h.tap(`#viewport .emp-row[data-id="${tone}"]`);
  h.check('the ringtone list opens', await h.until(`document.querySelectorAll('#viewport .emp-tones .emp-choice').length > 3`));
  const picked = await h.ev(`document.querySelectorAll('#viewport .emp-tones .emp-choice')[2].textContent`);
  await h.tap('#viewport .emp-tones .emp-choice:nth-child(3)');
  await h.tap('#viewport [data-action="empx-tone-ok"]');
  h.check('the chosen sound is the summary', await h.until(`document.querySelector('#viewport .emp-row[data-id="${tone}"] small')?.textContent === ${JSON.stringify(picked)}`));
  await h.tap('#viewport .emp-row[data-id="incoming"]');
  h.check('Incoming settings show the IMAP fields', await h.until(`document.querySelectorAll('#viewport .emp-form .emp-input').length >= 4`));
  await h.type('#viewport .emp-input[data-emp-field="server"]', 'mail.example.org');
  await h.tap('#viewport [data-action="empx-server-save"]');
  h.check('Done returns to the account', await h.until(`!!document.querySelector('#viewport .emp-row[data-id="outgoing"]')`));
  await h.tap('#viewport .emp-row[data-id="outgoing"]');
  await h.until(`!!document.querySelector('#viewport .emp-checkrow input')`);
  await h.tap('#viewport .emp-checkrow input');
  h.check('without sign-in the user fields hide', await h.ev(`getComputedStyle(document.querySelector('#viewport .emp-login')).display === 'none'`));
  await h.tap('#viewport [data-action="empx-server-cancel"]');
  await h.until(`!!document.querySelector('#viewport .emp-row[data-id="outgoing"]')`);
  const kept = await prefs();
  h.check('the settings are kept', kept.quickResponses?.[0] === 'See you at nine.' && kept[tone] === picked && kept.incoming?.server === 'mail.example.org' && !kept.outgoing, JSON.stringify(kept));
  h.check('the reload keeps them', await h.reload() && (await prefs()).incoming?.server === 'mail.example.org');
  await account();
  await h.tap('#viewport .emp-row[data-id="incoming"]');
  h.check('the saved server is shown again', await h.until(`document.querySelector('#viewport .emp-input[data-emp-field="server"]')?.value === 'mail.example.org'`));
};

// Calendar › Settings (General) and Calendars to display (Jelly Bean / KitKat Google Calendar): the choices take effect.
const calendarSettingsJB = async h => {
  const prefs = () => h.ev(`(()=>{const k=Object.keys(localStorage).find(k=>/^android-time-machine-\\w+-v1$/.test(k));return JSON.parse(localStorage.getItem(k)).calendarPrefs||{}})()`);
  const menu = async item => {
    await h.tap('#viewport .cal-bar [data-action="calendar-menu"]');
    await h.tap(`.cal-menu [data-action="${item}"]`);
  };
  await h.openApp('calendar');
  h.check('opens Calendar in Month', await h.until(`!!document.querySelector('#viewport .cal-month')`));
  const busy = () => h.ev(`document.querySelectorAll('#viewport .cal-month .cal-busy i').length`);
  h.check('the demo event shows', await busy() > 0);
  await menu('calendar-settings');
  h.check('Settings opens its headers', await h.until(`!!document.querySelector('#viewport .cpf-row[data-id="general"]')`));
  await h.tap('#viewport .cpf-row[data-id="general"]');
  h.check('General settings open', await h.until(`!!document.querySelector('#viewport .cpf-row[data-id="weekNum"]')`));
  await h.tap('#viewport .cpf-row[data-id="weekNum"]');
  await h.tap('#viewport .cpf-row[data-id="weekStart"]');
  h.check('Week starts on lists four choices', await h.until(`document.querySelectorAll('#viewport .cpf-dialog .cpf-choice').length === 4`));
  await h.tap('#viewport .cpf-dialog .cpf-choice[data-id="1"]');
  await h.tap('#viewport .cpf-row[data-id="reminder"]');
  await h.tap('#viewport .cpf-dialog .cpf-choice[data-id="8"]');
  await h.tap('#viewport .cpf-row[data-id="quick"]');
  h.check('Quick responses list the four defaults', await h.until(`document.querySelectorAll('#viewport .cpf-row[data-action="calpref-quick"]').length === 4`));
  await h.key('Escape'); await h.key('Escape'); await h.key('Escape');
  h.check('Back returns to the calendar', await h.until(`!!document.querySelector('#viewport .cal-month')`));
  const p = await prefs();
  h.check('the choices are saved', p.weekNum === true && p.weekStart === 1 && p.reminder === 30, JSON.stringify(p));
  h.check('Month shows week numbers', await h.ev(`document.querySelectorAll('#viewport .cal-weeknum').length === 6`));
  h.check('the week starts on Saturday', await h.ev(`(()=>{const d=new Date(document.querySelector('#viewport .cal-month [data-action="calendar-day"]').dataset.id+'T12:00:00');return d.getDay()===6})()`));
  await h.tap('#viewport .cal-bar [data-action="calendar-menu"]');
  await h.tap('.cal-menu [data-action="event-new"]');
  h.check('a new event gets the default reminder', await h.until(`document.querySelector('#viewport form[data-form="event"] [name="reminder"]')?.value === '30'`));
  await h.key('Escape');
  await h.until(`!!document.querySelector('#viewport .cal-month')`);
  await menu('calendar-visible');
  h.check('Calendars to display lists the account\'s calendar', await h.until(`!!document.querySelector('#viewport .cpf-cal')`));
  await h.tap('#viewport .cpf-cal');
  await h.key('Escape');
  h.check('a hidden calendar\'s events leave Month', await h.until(`!!document.querySelector('#viewport .cal-month')`) && await busy() === 0);
  h.check('the reload keeps it hidden', await h.reload() && (await prefs()).hidden?.includes('primary'));
};

// Calendar 5.0 (Lollipop) › the drawer's Settings: General, Events from Gmail and a calendar's Sync take effect.
const calendarSettingsLP = async h => {
  const prefs = () => h.ev(`(()=>{const k=Object.keys(localStorage).find(k=>/^android-time-machine-\\w+-v1$/.test(k));return JSON.parse(localStorage.getItem(k)).calendarPrefs||{}})()`);
  const settings = async () => {
    await h.tap('#viewport .gc-bar .gc-nav');
    await h.tap('.gc-drawer [data-action="calendar-settings"]');
    h.check('the drawer\'s Settings opens', await h.until(`!!document.querySelector('#viewport .cpf-row[data-id="general"]')`));
  };
  await h.openApp('calendar');
  h.check('opens Calendar', await h.until(`!!document.querySelector('#viewport .gc-bar .gc-nav')`));
  const events = () => h.ev(`document.querySelectorAll('#viewport [data-action="event-open"]').length`);
  h.check('the demo event shows in Schedule', await h.until(`document.querySelectorAll('#viewport [data-action="event-open"]').length > 0`));
  await settings();
  await h.tap('#viewport .cpf-row[data-id="general"]');
  h.check('General opens', await h.until(`!!document.querySelector('#viewport .cpf-row[data-id="weekStart"]')`));
  await h.tap('#viewport .cpf-row[data-id="weekStart"]');
  await h.tap('#viewport .cpf-dialog .cpf-choice[data-id="0"]');
  await h.tap('#viewport .cpf-row[data-id="duration"]');
  h.check('Default event duration lists six choices', await h.until(`document.querySelectorAll('#viewport .cpf-dialog .cpf-choice').length === 6`));
  await h.tap('#viewport .cpf-dialog .cpf-choice[data-id="2"]');
  await h.tap('#viewport .cpf-row[data-id="alerts"]');
  h.check('Notify off disables Tone and Vibrate', await h.ev(`document.querySelector('#viewport .cpf-row[data-id="tone"]').disabled && document.querySelector('#viewport .cpf-row[data-id="vibrate"]').disabled`));
  await h.key('Escape');
  await h.tap('#viewport .cpf-row[data-id="gmail"]');
  await h.tap('#viewport .cpf-row[data-action="calpref-gmail"]');
  await h.tap('#viewport [data-action="calpref-gmail-ok"]');
  await h.key('Escape');
  await h.tap('#viewport .cpf-row[data-id="cal:primary"]');
  await h.tap('#viewport .cpf-row[data-action="calpref-sync"]');
  await h.key('Escape'); await h.key('Escape');
  h.check('Back returns to the calendar', await h.until(`!!document.querySelector('#viewport .gc-bar .gc-nav')`));
  const p = await prefs();
  h.check('the choices are saved', p.weekStart === 0 && p.duration === 30 && p.alerts === false && p.gmail === false && p.unsynced?.includes('primary'), JSON.stringify(p));
  h.check('an unsynced calendar\'s events leave the views', await events() === 0);
  await h.tap('#viewport .gc-fab, #viewport [data-action="event-new"]');
  h.check('a new event lasts the default duration', await h.until(`document.querySelector('#viewport form[data-form="event"] [name="endTime"]')?.value === '12:30'`));
  await h.key('Escape');
  h.check('the reload keeps the settings', await h.reload() && (await prefs()).duration === 30);
};

// Gmail › Settings › the account: Inbox sound & vibrate, Manage labels, Days of mail to sync (and on Lollipop the
// Vacation responder); a label synced for None leaves its list empty.
const gmailSettings = async h => {
  const prefs = () => h.ev(`(()=>{const k=Object.keys(localStorage).find(k=>/^android-time-machine-\\w+-v1$/.test(k));return JSON.parse(localStorage.getItem(k)).gmailPrefs||{}})()`);
  const account = async () => {
    const overflow = '#viewport [data-action="email-menu"]:not([data-id="message"])', drawer = '#viewport [data-action="email-drawer"]';
    h.check('opens Gmail', await h.until(`!!document.querySelector('${overflow}, ${drawer}')`));
    await h.tap(await h.ev(`!!document.querySelector('${overflow}')`) ? overflow : drawer);
    await h.tap('[role="menu"] [data-action="email-settings"], .holo-menu [data-action="email-settings"], nav [data-action="email-settings"]');
    h.check('Settings opens', await h.until(`!!document.querySelector('#viewport .gmp-row[data-id="account"]')`));
    await h.tap('#viewport .gmp-row[data-id="account"]');
    h.check('the account\'s settings open', await h.until(`!!document.querySelector('#viewport .gmp-row[data-id="labels"]')`));
  };
  await h.openApp('gmail');
  const rows = () => h.ev(`document.querySelectorAll('#viewport [data-action="email-read"]').length`);
  h.check('the inbox lists mail', await h.until(`document.querySelectorAll('#viewport [data-action="email-read"]').length > 0`));
  await account();
  await h.tap('#viewport .gmp-row[data-id="label:Primary"]');
  h.check('Inbox sound & vibrate opens the inbox\'s label settings', await h.until(`!!document.querySelector('#viewport .gmp-row[data-action="gmx-vibrate"]')`));
  await h.tap('#viewport .gmp-row[data-action="gmx-vibrate"]');
  await h.tap('#viewport .gmp-dialog .gmp-choice[data-id="1"]');
  await h.tap('#viewport .gmp-row[data-action="gmx-tone"]');
  h.check('the sound list opens', await h.until(`document.querySelectorAll('#viewport .gmp-dialog .gmp-choice').length > 3`));
  const tone = await h.ev(`document.querySelectorAll('#viewport .gmp-dialog .gmp-choice')[2].textContent`);
  await h.tap('#viewport .gmp-dialog .gmp-choice:nth-child(3)');
  await h.tap('#viewport [data-action="gmx-tone-ok"]');
  await h.key('Escape');
  await h.tap('#viewport .gmp-row[data-id="labels"]');
  h.check('Manage labels lists the labels', await h.until(`document.querySelectorAll('#viewport .gmp-row[data-id^="label:"]').length >= 10`));
  await h.tap('#viewport .gmp-row[data-id="label:Primary"]');
  await h.tap('#viewport .gmp-row[data-action="gmx-sync"]');
  await h.tap('#viewport .gmp-dialog .gmp-choice[data-id="none"]');
  await h.key('Escape');
  h.check('Back returns to Manage labels', await h.until(`!!document.querySelector('#viewport .gmp-row[data-id="label:Trash"]')`));
  await h.key('Escape');
  await h.tap('#viewport .gmp-row[data-action="gmx-days"]');
  await h.type('#viewport [data-gmx-days]', '7');
  await h.tap('#viewport [data-action="gmx-days-ok"]');
  const p = await prefs();
  h.check('the label settings are kept', p.labels?.Primary?.vibrate === true && p.labels.Primary.tone === tone && p.labels.Primary.sync === 'none' && p.days === 7, JSON.stringify(p));
  if (h.vacation) {
    await h.tap('#viewport .gmp-row[data-id="vacation"]');
    h.check('the vacation responder opens', await h.until(`!!document.querySelector('#viewport [data-gmx-vac]')`));
    await h.tap('#viewport [data-gmx-vac] .gmx-switch');
    await h.tap('#viewport [data-action="gmx-vac-done"]');
    h.check('without a subject or message it stays open', await h.until(`!!document.querySelector('#viewport [data-gmx-vac]')`) && !(await prefs()).vacation);
    await h.type('#viewport [data-gmx-vac] [name="subject"]', 'Away this week');
    await h.tap('#viewport [data-action="gmx-vac-done"]');
    h.check('Done saves it and shows it on', await h.until(`!!document.querySelector('#viewport .gmp-row[data-id="vacation"] small')`) && (await prefs()).vacation?.subject === 'Away this week' && (await prefs()).vacation.on === true);
  }
  await h.key('Escape'); await h.key('Escape');
  h.check('the inbox synced for None shows no mail', await h.until(`!document.querySelector('#viewport .gmp-app') && !!document.querySelector('#viewport .kem-list, #viewport .lem-list, #viewport .kem')`) && await rows() === 0);
  h.check('the reload keeps it', await h.reload() && (await prefs()).labels?.Primary?.sync === 'none');
};
const CASES = [
  {id: 'T01', version: '5.1.1', name: 'Photos › Edit opens Google+\'s editor, saves and discards', async run(h) {
    const openViewer = async () => {
      await h.openApp('photos');
      h.check('opens Photos', await h.until(`!!document.querySelector('#viewport .ph-app .ph-grid')`));
      const id = await h.ev(`(()=>{const b=[...document.querySelectorAll('#viewport .ph-thumb[data-action="photos-open"]')].find(b=>!b.querySelector('[class*="gpv"]'));return b&&b.dataset.id})()`);
      h.check('has a still picture', !!id);
      await h.tap(`#viewport .ph-thumb[data-action="photos-open"][data-id="${id}"]`);
      h.check('opens the picture', await h.until(`!!document.querySelector('#viewport .ph-viewer-view .ph-edit')`));
      return Number(id);
    };
    const editOf = id => h.ev(`(()=>{const k=Object.keys(localStorage).find(k=>/^android-time-machine-\\w+-v1$/.test(k));const d=k&&JSON.parse(localStorage.getItem(k));return (d?.photos||[]).find(p=>p.id===${id})?.plusEdit||null})()`);
    const id = await openViewer();
    await h.tap('#viewport .ph-edit');
    h.check('Edit opens the editor with its tools', await h.until(`document.querySelectorAll('#viewport .pe-select .pe-tool').length === 15`));
    await h.tap('#viewport .pe-tool[data-id="tune"]');
    h.check('TUNE IMAGE opens its panel', await h.until(`!!document.querySelector('#viewport .pe-t-tune .pe-panel')`));
    await h.drag('#viewport .pe-stage', 120, 0);
    const value = await h.ev(`document.querySelector('#viewport .pe-value')?.textContent`);
    h.check('a sideways drag raises Brightness', /^\+\d+$/.test(value || ''), value);
    await h.tap('#viewport .pe-done');
    h.check('Done applies the tool', await h.until(`!!document.querySelector('#viewport .pe-select')`));
    h.check('nothing is saved before the editor\'s Done', !(await editOf(id)));
    await h.tap('#viewport .pe-done');
    h.check('Done returns to the picture', await h.until(`!!document.querySelector('#viewport .ph-viewer-view')`));
    const saved = await editOf(id);
    h.check('the edit is saved with the picture', saved?.steps?.[0]?.t === 'tune' && saved.steps[0].v[0] > 0, JSON.stringify(saved));
    h.check('the viewer shows the edited picture', await h.ev(`decodeURIComponent(document.querySelector('#viewport .ph-viewer img')?.src||'').includes('feFuncR type="gamma"')`));
    h.check('the reload keeps the edit', await h.reload() && !!(await editOf(id))?.steps?.length);
    await openViewer();
    // A tool's change dropped with Back, then the editor left with Back: nothing changes.
    await h.tap('#viewport .ph-edit');
    await h.until(`!!document.querySelector('#viewport .pe-select')`);
    await h.tap('#viewport .pe-tool[data-id="drama"]');
    h.check('DRAMA opens', await h.until(`!!document.querySelector('#viewport .pe-t-drama')`));
    await h.key('Escape');
    h.check('Back drops the tool', await h.until(`!!document.querySelector('#viewport .pe-select')`));
    await h.key('Escape');
    h.check('Back leaves an unchanged edit at once', await h.until(`!!document.querySelector('#viewport .ph-viewer-view')`));
    h.check('the saved edit is unchanged', (await editOf(id))?.steps?.length === 1);
    // An applied change and Back: the unsaved-changes dialog; Continue Editing stays, Exit discards.
    await h.tap('#viewport .ph-edit');
    await h.until(`!!document.querySelector('#viewport .pe-select')`);
    await h.tap('#viewport .pe-tool[data-id="auto"]');
    await h.until(`!!document.querySelector('#viewport .pe-t-auto')`);
    await h.tap('#viewport .pe-done');
    await h.until(`!!document.querySelector('#viewport .pe-select')`);
    await h.key('Escape');
    h.check('Back with changes asks', await h.until(`!!document.querySelector('#viewport .pe-dialog')`));
    await h.tap('#viewport .pe-dialog button[data-id="stay"]');
    h.check('Continue Editing stays', await h.until(`!document.querySelector('#viewport .pe-dialog') && !!document.querySelector('#viewport .pe-select')`));
    await h.key('Escape');
    await h.until(`!!document.querySelector('#viewport .pe-dialog')`);
    await h.tap('#viewport .pe-dialog button[data-id="exit"]');
    h.check('Exit leaves without saving', await h.until(`!!document.querySelector('#viewport .ph-viewer-view')`) && (await editOf(id))?.steps?.length === 1);
  }},
  {id: 'T02', version: '4.3', name: 'Email › Settings: quick responses, ringtone, server settings', run: emailSettings},
  {id: 'T03', version: '4.3', name: 'Calendar › Settings and Calendars to display', run: calendarSettingsJB},
  {id: 'T03', version: '4.4.4', name: 'Calendar › Settings and Calendars to display', run: calendarSettingsJB},
  {id: 'T03', version: '5.1.1', name: 'Calendar › Settings: General, Events from Gmail, Sync', run: calendarSettingsLP},
  {id: 'T04', version: '4.3', name: 'Gmail › Settings: label sound, labels, days to sync', run: gmailSettings},
  {id: 'T04', version: '4.4.4', name: 'Gmail › Settings: label sound, labels, days to sync', run: gmailSettings},
  {id: 'T04', version: '5.1.1', name: 'Gmail › Settings: label sound, labels, days to sync, vacation responder', run: h => gmailSettings({...h, vacation: true})},
  {id: 'T09', version: '4.4.4', name: 'Email › Settings: quick responses, ringtone, server settings', run: emailSettings},
  {id: 'T09', version: '5.1.1', name: 'Email › Settings: quick responses, ringtone, server settings', run: emailSettings}
];

const args = process.argv.slice(2), picked = args.filter(a => /^T\d+/i.test(a)).map(a => a.toUpperCase());
const WIDTHS = args.includes('--desktop') ? ['desktop'] : args.includes('--phone') ? ['phone'] : ['desktop', 'phone'];
const cases = CASES.filter(c => !picked.length || picked.includes(c.id));
if (!cases.length) { console.log(picked.length ? `No case for ${picked.join(', ')}` : 'No case yet'); process.exit(picked.length ? 1 : 0); }

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'limits-')), port = 9700 + Math.floor(Math.random() * 600);
const chrome = spawn(CHROME, ['--headless=new', '--no-sandbox', `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, 'about:blank'], {stdio: 'ignore'});
let ws;
for (let i = 0; i < 160 && !ws; i++) { try { const p = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page'); if (p) ws = new WebSocket(p.webSocketDebuggerUrl); } catch {} if (!ws) await sleep(250); }
if (!ws) { console.error('Chrome did not start'); process.exit(2); }
await new Promise(r => ws.onopen = r);
let id = 0; const pending = {}, errors = [], failed = [], urls = {};
ws.onmessage = m => {
  const d = JSON.parse(m.data);
  if (d.method === 'Runtime.exceptionThrown') errors.push(d.params.exceptionDetails.exception?.description?.split('\n')[0] || d.params.exceptionDetails.text);
  if (d.method === 'Network.requestWillBeSent') urls[d.params.requestId] = d.params.request.url;
  if (d.method === 'Network.responseReceived' && d.params.response.status >= 400 && d.params.response.url.startsWith(BASE)) failed.push(`${d.params.response.status} ${d.params.response.url.slice(BASE.length)}`);
  if (d.method === 'Network.loadingFailed' && !d.params.canceled && (urls[d.params.requestId] || '').startsWith(BASE)) failed.push(`${d.params.errorText} ${urls[d.params.requestId].slice(BASE.length)}`);
  if (pending[d.id]) { pending[d.id](d); delete pending[d.id]; }
};
const send = (method, params = {}) => new Promise(r => { pending[++id] = r; ws.send(JSON.stringify({id, method, params})); });
const ev = async expr => { const r = await send('Runtime.evaluate', {expression: expr, awaitPromise: true, returnByValue: true}); if (r.result?.exceptionDetails) throw new Error(`evaluate: ${r.result.exceptionDetails.exception?.description?.split('\n')[0] || r.result.exceptionDetails.text}`); return r.result?.result?.value; };
await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled', {cacheDisabled: true});
// Every element added to the page is read for a refusal; the watcher is installed on each new document.
await send('Page.enable');
await send('Page.addScriptToEvaluateOnNewDocument', {source: `window.__refusals=[];new MutationObserver(list=>{for(const m of list)for(const n of m.addedNodes){const t=n.nodeType===1?n.textContent:n.nodeType===3?n.data:'';if(${REFUSAL}.test(t||''))window.__refusals.push(t.trim().slice(0,120));}}).observe(document,{childList:true,subtree:true,characterData:true});`});

const until = async (expr, ms = 15000) => { for (const end = Date.now() + ms; Date.now() < end; await sleep(150)) if (await ev(expr)) return true; return false; };
// Of the matching elements (a screen being replaced can still be in the page), the one a touch at its centre reaches.
const center = selector => ev(`(()=>{const all=[...document.querySelectorAll(${JSON.stringify(selector)})];if(!all.length)return null;let last=null;for(const el of all){const r0=el.getBoundingClientRect(),strip=el.closest('[data-pe-strip],.pe-strip');if(strip){const sr=strip.getBoundingClientRect();if(r0.left<sr.left||r0.right>sr.right)strip.scrollLeft+=r0.left-sr.left-(sr.width-r0.width)/2;}else el.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});const b=el.getBoundingClientRect();if(!b.width||!b.height)continue;const x=b.left+b.width/2,y=b.top+b.height/2,hit=document.elementFromPoint(x,y);last={x,y,hit:!!hit&&(hit===el||el.contains(hit)),what:hit?(hit.tagName+'.'+hit.className+' in '+(hit.parentElement?.className||'')):'none'};if(last.hit)return last;}return last})()`);
const mouse = (type, x, y, buttons) => send('Input.dispatchMouseEvent', {type, x, y, button: 'left', buttons, clickCount: type === 'mouseMoved' ? 0 : 1});
// A tap where a visitor would touch: the element's centre, which must not be covered by another element.
// Screen transitions settle first (a view zooming in is not where it will stay).
const settled = () => until(`!document.getAnimations().some(a => a.playState === 'running' && a.effect?.getComputedTiming?.().iterations !== Infinity)`, 3000);
async function tap(selector) {
  await settled();
  const c = await center(selector);
  if (!c) throw new Error(`nothing to tap: ${selector}`);
  if (!c.hit) throw new Error(`covered: ${selector} (by ${c.what})`);
  await mouse('mousePressed', c.x, c.y, 1); await sleep(40); await mouse('mouseReleased', c.x, c.y, 0); await sleep(250);
}
async function drag(selector, dx, dy) {
  await settled();
  const c = await center(selector);
  if (!c) throw new Error(`nothing to drag: ${selector}`);
  await mouse('mousePressed', c.x, c.y, 1);
  for (let i = 1; i <= 12; i++) { await mouse('mouseMoved', c.x + dx * i / 12, c.y + dy * i / 12, 1); await sleep(16); }
  await mouse('mouseReleased', c.x + dx, c.y + dy, 0); await sleep(250);
}
// Typing into a field as a keyboard does: a tap on it, its text selected, then the new text.
async function type(selector, text) { await tap(selector); await ev(`document.activeElement?.select?.()`); await send('Input.insertText', {text}); await sleep(100); }
const key = k => ev(`(document.activeElement || document.body).dispatchEvent(new KeyboardEvent('keydown',{key:${JSON.stringify(k)},bubbles:true}))`);
// The launcher's own open-app action (the home screens differ per version; the path under test starts in the app).
const openApp = app => ev(`(()=>{const el=document.createElement('button');el.dataset.action='open-app';el.dataset.app=${JSON.stringify(app)};const host=document.querySelector('#viewport').firstElementChild;host.append(el);el.click();el.remove();return true})()`);
const SAVE = `(()=>{const k=Object.keys(localStorage).find(k=>/^android-time-machine-\\w+-v1$/.test(k));return k&&JSON.parse(localStorage.getItem(k))})()`;

// 2.3.6 to 5.1.1 share the page shell: a lock or home view in #viewport, unlocked with the 'unlock' action.
async function boot(version) {
  await send('Page.navigate', {url: `${BASE}/versions/${version}/`});
  if (!await until(`!!document.querySelector('#viewport .home-view, #viewport .lock-view')`, 25000)) return false;
  if (await ev(`!!document.querySelector('#viewport .lock-view')`)) {
    await ev(`(()=>{const el=document.createElement('button');el.dataset.action='unlock';document.querySelector('#viewport').firstElementChild.append(el);el.click();el.remove()})()`);
    if (!await until(`!!document.querySelector('#viewport .home-view')`)) return false;
  }
  return true;
}

async function run(c, width) {
  const steps = [], check = (name, ok, detail = '') => { steps.push(name); if (!ok) throw new Error(`${name}${detail ? ': ' + detail : ''}`); };
  errors.length = 0; failed.length = 0;
  const phone = width === 'phone';
  await send('Emulation.setDeviceMetricsOverride', phone ? {width: 375, height: 812, deviceScaleFactor: 2, mobile: true} : {width: 1280, height: 900, deviceScaleFactor: 1, mobile: false});
  await send('Page.navigate', {url: `${BASE}/versions/${c.version}/`}); await sleep(300);
  // A fresh phone, already switched on in this tab (the cold-boot animation is not part of these paths).
  await ev(`localStorage.clear(); sessionStorage.clear(); sessionStorage.setItem('android-sim-booted-${c.version}', '1'); localStorage.setItem('android-time-machine-language', 'en')`);
  check('boots and unlocks', await boot(c.version));
  await c.run({ev, send, until, tap, drag, type, key, openApp, sleep, check, phone, save: () => ev(SAVE), reload: () => boot(c.version)});
  await sleep(400);
  const refusals = await ev(`window.__refusals || []`);
  check('no refusal on the way', !refusals.length, refusals.join(' | '));
  check('no exception', !errors.length, errors.join(' | '));
  for (const f of [...failed]) { const m = f.match(/^net::ERR_CONNECTION_\w+ (\S+)$/); if (m && (await fetch(BASE + m[1]).catch(() => null))?.ok) failed.splice(failed.indexOf(f), 1); }
  check('no failed local request', !failed.length, failed.join(' | '));
  if (phone) check('fits the phone width', await ev(`document.documentElement.scrollWidth <= innerWidth + 1`));
  return steps;
}

let failures = 0;
for (const c of cases) for (const width of WIDTHS) {
  const name = `${c.id} ${c.version} ${c.name} (${width})`;
  try { const steps = await run(c, width); console.log(`ok   ${name}: ${steps.join(', ')}`); }
  catch (error) {
    failures++; console.log(`FAIL ${name}: ${error.message}`);
    fs.mkdirSync(ARTIFACTS, {recursive: true});
    const shot = await send('Page.captureScreenshot', {format: 'png'});
    if (shot.result?.data) fs.writeFileSync(path.join(ARTIFACTS, `limits-${c.id}-${c.version}-${width}.png`), Buffer.from(shot.result.data, 'base64'));
  }
}
ws.close(); chrome.kill();
process.exit(failures ? 1 : 0);
