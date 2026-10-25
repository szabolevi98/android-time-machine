// Regression for the simulator-limit fixes (docs/reports/simulator-limits-2026-10-23.md, the T packages): every path a
// package turned from a refusal into a working screen, reached the way a visitor reaches it. Each case runs on a fresh
// phone at desktop size (1280 × 900) and at phone width (375 × 812), and passes only when
//   the path's own positive result holds (the case's checks), no refusal message appeared on the way (a toast or a
//   "Not built yet" screen), no JavaScript exception was thrown and no local request failed.
// Taps are real pointer input at the element's centre (Input.dispatchMouseEvent), so a covered or off-screen control
// fails the same way it would for a visitor. Needs a server for the repository root (BASE, default
// http://localhost:8090) and Chrome (CHROME). A failing case leaves a screenshot in tests/browser/artifacts/.
//     node tests/browser/limits-regression.mjs [T01 ...] [--version 4.4.4] [--desktop | --phone]
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
    h.check('the IMAP account offers no Sync options', !await h.ev(`[...document.querySelectorAll('[role="menu"] button, .holo-menu button')].some(b => /Sync options/.test(b.textContent))`));
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
  const done = () => h.ev(`!document.querySelector('#viewport [data-action="empx-server-save"]').disabled`);
  const set = (field, value) => h.ev(`(()=>{const f=document.querySelector('#viewport [data-emp-field="${field}"]');f.value=${JSON.stringify(value)};f.dispatchEvent(new Event('input',{bubbles:true}));return true})()`);
  h.check('a set password shows as a mask and Done is enabled', await done() && await h.ev(`document.querySelector('#viewport [data-emp-field="password"]').value.length > 0`));
  await h.type('#viewport .emp-input[data-emp-field="port"]', '70000');
  h.check('a port above 65535 disables Done', !await done());
  await h.type('#viewport .emp-input[data-emp-field="port"]', '993');
  h.check('a valid port enables it again', await done());
  await set('password', '');
  h.check('an empty password disables Done', !await done());
  await h.type('#viewport .emp-input[data-emp-field="password"]', 'not-a-real-password');
  await set('security', '0');
  h.check('security None sets the IMAP port 143', await h.ev(`document.querySelector('#viewport [data-emp-field="port"]').value`) === '143' && await done());
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
  h.check('the settings are kept', kept.quickResponses?.[0] === 'See you at nine.' && kept[tone] === picked && kept.incoming?.server === 'mail.example.org' && kept.incoming?.port === '143' && !kept.outgoing, JSON.stringify({...kept, incoming: {...kept.incoming, password: undefined}}));
  h.check('the password is not stored', kept.incoming?.passwordSet === true && !('password' in kept.incoming) && !JSON.stringify(kept).includes('not-a-real-password'));
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

// Google Mail 2.3 (Gingerbread) › Menu › Settings: the account's settings, Confirm actions, Sync inboxes and labels and
// Labels to notify; a label synced for none lists no mail.
const gmailSettingsGB = async h => {
  const prefs = app => h.ev(`(()=>{const k=Object.keys(localStorage).find(k=>/^android-time-machine-\\w+-v1$/.test(k));return (JSON.parse(localStorage.getItem(k)).appPrefs||{})[${JSON.stringify(app)}]||{}})()`);
  const row = key => `#viewport .gbset-row[data-id$=":${key}"]`;
  await h.openApp('gmail');
  const rows = () => h.ev(`document.querySelectorAll('#viewport .gm-row').length`);
  h.check('the inbox lists mail', await h.until(`document.querySelectorAll('#viewport .gm-row').length > 0`));
  await h.tap('#nav-root .touch-menu, .touch-menu');
  await h.until(`!!document.querySelector('.gbmenu')`);
  if (!await h.ev(`!!document.querySelector('.gbmenu [data-action="gbpref-open"]')`)) await h.tap('.gbmenu [data-action="gb-menu-more"]');
  await h.tap('[data-action="gbpref-open"][data-id="gmail"]');
  h.check('Settings opens', await h.until(`!!document.querySelector('${row('account')}')`));
  await h.tap(row('account'));
  h.check('the account\'s settings open', await h.until(`!!document.querySelector('${row('priority-inbox')}')`));
  await h.tap(row('priority-inbox'));
  await h.tap(row('confirm-actions'));
  h.check('Confirm actions offers three boxes', await h.until(`document.querySelectorAll('.gbdlg [data-action="gbpref-multi"]').length === 3`));
  await h.tap('.gbdlg [data-action="gbpref-multi"]:nth-child(1)');
  await h.tap('.gbdlg [data-action="gbpref-multi-ok"]');
  await h.tap(row('labels-sync'));
  h.check('Sync inboxes and labels lists the labels', await h.until(`!!document.querySelector('${row('sync|Inbox')}')`));
  await h.tap(row('sync|Inbox'));
  await h.tap('.gbdlg [data-action="gbpref-pick"]:last-of-type');
  await h.key('Escape');
  await h.tap(row('labels-notification'));
  h.check('Labels to notify lists the synced labels', await h.until(`!!document.querySelector('${row('label|Starred')}')`));
  await h.key('Escape'); await h.key('Escape'); await h.key('Escape');
  h.check('Back returns to the inbox', await h.until(`!document.querySelector('#viewport .gbset')`));
  const account = await prefs('gmail-account'), sync = await prefs('gmail-sync');
  h.check('the settings are kept', account['priority-inbox'] === true && JSON.stringify(account['confirm-actions']) === '[0]' && sync['sync|Inbox'] === 2, JSON.stringify({account, sync}));
  h.check('the inbox synced for none lists no mail', await rows() === 0);
  h.check('the reload keeps it', await h.reload() && (await prefs('gmail-sync'))['sync|Inbox'] === 2);
};

// Gmail 4.0.4 (Ice Cream Sandwich) › Settings, Manage labels and the list's Label settings.
const gmailSettingsICS = async h => {
  const prefs = () => h.ev(`(()=>{const k=Object.keys(localStorage).find(k=>/^android-time-machine-\\w+-v1$/.test(k));return JSON.parse(localStorage.getItem(k)).gmail40Prefs||{}})()`);
  const menu = async item => {
    await h.tap('#viewport [data-action="g4-more"]');
    await h.tap(`[data-action="${item}"]`);
  };
  await h.openApp('gmail');
  const rows = () => h.ev(`document.querySelectorAll('#viewport [data-action="g4-open"]').length`);
  h.check('the inbox lists mail', await h.until(`document.querySelectorAll('#viewport [data-action="g4-open"]').length > 0`));
  await menu('g4-settings');
  h.check('Settings opens its headers', await h.until(`!!document.querySelector('#viewport .g4p-row[data-id="account"]')`));
  await h.tap('#viewport .g4p-row[data-id="general"]');
  await h.tap('#viewport .g4p-row[data-id="reply-all"]');
  await h.tap('#viewport .g4p-row[data-id="text-size"]');
  await h.tap('#viewport .g4p-dialog .g4p-choice[data-id="3"]');
  await h.key('Escape');
  await h.tap('#viewport .g4p-row[data-id="account"]');
  h.check('the account\'s settings open', await h.until(`!!document.querySelector('#viewport .g4p-row[data-action="g4p-days"]')`));
  await h.tap('#viewport .g4p-row[data-action="g4p-label"][data-id="Inbox"]');
  await h.tap('#viewport .g4p-row[data-id="vibrate"]');
  await h.tap('#viewport .g4p-dialog .g4p-choice[data-id="0"]');
  await h.key('Escape');
  await h.tap('#viewport .g4p-row[data-action="g4p-days"]');
  await h.type('#viewport [data-g4p-days]', '7');
  await h.tap('#viewport [data-action="g4p-days-ok"]');
  await h.tap('#viewport .g4p-row[data-id="labels"]');
  h.check('Manage labels lists the labels', await h.until(`document.querySelectorAll('#viewport .g4p-row[data-action="g4p-label"]').length >= 10`));
  await h.tap('#viewport .g4p-row[data-action="g4p-label"][data-id="Inbox"]');
  await h.tap('#viewport .g4p-row[data-id="sync"]');
  await h.tap('#viewport .g4p-dialog .g4p-choice[data-id="none"]');
  await h.key('Escape'); await h.key('Escape'); await h.key('Escape'); await h.key('Escape');
  h.check('Back returns to the mail', await h.until(`!document.querySelector('#viewport .g4p-app')`));
  const p = await prefs();
  h.check('the settings are kept', p['reply-all'] === true && p['text-size'] === 3 && p.days === 7 && p.labels?.Inbox?.vibrate === 0 && p.labels.Inbox.sync === 'none', JSON.stringify(p));
  h.check('the inbox synced for None lists no mail', await rows() === 0);
  await menu('g4-label-settings');
  h.check('Label settings opens the inbox\'s', await h.until(`!!document.querySelector('#viewport .g4p-row[data-id="sync"]')`));
  await h.key('Escape');
  h.check('Back from Label settings returns to the list', await h.until(`!document.querySelector('#viewport .g4p-app')`));
  h.check('the reload keeps it', await h.reload() && (await prefs()).labels?.Inbox?.sync === 'none');
};

// Ice Cream Sandwich camera: Video records and stops into the Camera album and plays in the Gallery; Panorama sweeps,
// saves, and its Cancel keeps nothing.
const cameraModesICS = async h => {
  const shots = () => h.ev(`(()=>{const k=Object.keys(localStorage).find(k=>/^android-time-machine-\\w+-v1$/.test(k));return (JSON.parse(localStorage.getItem(k)).photos||[]).map(p=>p.name)})()`);
  const mode = async id => { await h.tap('#viewport .camera-mode'); await h.tap(`#viewport .camera-mode-selection [data-id="${id}"]`); };
  await h.openApp('camera');
  h.check('opens the camera', await h.until(`!!document.querySelector('#viewport .camera-app')`));
  await mode('video');
  h.check('the picker switches to video', await h.until(`!!document.querySelector('#viewport .camera-video .camera-shutter.video')`));
  await h.tap('#viewport .camera-shutter');
  h.check('the shutter starts recording', await h.until(`!!document.querySelector('#viewport .camera-shutter.recording') && !!document.querySelector('#viewport [data-camera-rec]')`));
  await h.sleep(1600);
  h.check('the recording time runs', await h.ev(`document.querySelector('#viewport [data-camera-rec]').textContent === '00:01'`));
  await h.tap('#viewport .camera-shutter');
  const afterVideo = await shots();
  h.check('stopping keeps the clip', /^VID_\d{8}_\d{6}$/.test(afterVideo[0]), JSON.stringify(afterVideo.slice(0, 2)));
  await h.tap('#viewport .camera-thumbnail');
  h.check('the clip opens in the Gallery with its play button', await h.until(`!!document.querySelector('#viewport .icm-photo-play')`));
  await h.tap('#viewport .icm-photo-play');
  h.check('it plays in the movie player', await h.until(`!!document.querySelector('#viewport [data-icm] [data-icm-bar]')`));
  await h.key('Escape'); await h.key('Escape'); await h.key('Escape');
  await h.openApp('camera');
  await h.until(`!!document.querySelector('#viewport .camera-app')`);
  await mode('panorama');
  h.check('the picker switches to panorama', await h.until(`!!document.querySelector('#viewport [data-icp][data-state="idle"]')`));
  await h.tap('#viewport .camera-shutter');
  h.check('the shutter starts the sweep', await h.until(`!!document.querySelector('#viewport [data-icp][data-state="capture"]')`));
  await h.sleep(800);
  await h.tap('#viewport .camera-shutter');
  h.check('stopping shows the review', await h.until(`!!document.querySelector('#viewport [data-icp][data-state="review"]')`));
  await h.tap('#viewport [data-icp-cancel]');
  h.check('Cancel keeps nothing', await h.until(`!!document.querySelector('#viewport [data-icp][data-state="idle"]')`) && (await shots()).length === afterVideo.length);
  await h.tap('#viewport .camera-shutter');
  await h.sleep(800);
  await h.tap('#viewport .camera-shutter');
  h.check('the saved panorama joins the album', await h.until(`(()=>{const k=Object.keys(localStorage).find(k=>/^android-time-machine-\\w+-v1$/.test(k));return /^PANO_/.test(JSON.parse(localStorage.getItem(k)).photos[0].name)})()`, 8000));
  await h.tap('#viewport .camera-thumbnail');
  h.check('the panorama opens in the Gallery', await h.until(`document.querySelector('#viewport .gallery-image img')?.naturalWidth === 3072`));
};

// Gmail 5's Attach file: DocumentsUI's GET_CONTENT picker (the roots drawer, Images' buckets, Audio's artists, albums
// and songs), a picture as a tile and a song as a file row with name and size, the stack remembered for the next
// time, Back climbing out without a file, Remove, and the attachment kept in the sent mail. The wallpaper picker's Pick
// image goes through the same picker for image/* (no Audio root).
const gmailAttachLP = async h => {
  const attach = async () => {
    await h.tap('#viewport .lem-bar [data-action="email-menu"][data-id="attach"]');
    await h.tap('[role="menu"] [data-action="email-attach-file"]');
    h.check('Attach file opens DocumentsUI', await h.until(`!!document.querySelector('#viewport .ldp-app')`));
  };
  await h.openApp('gmail');
  h.check('opens Gmail', await h.until(`!!document.querySelector('#viewport .lem-fab')`));
  await h.tap('#viewport .lem-fab');
  h.check('Compose opens', await h.until(`!!document.querySelector('#viewport .lem-compose')`));
  await h.type('#viewport .lem-compose input[name="subject"]', 'Weekend files');
  await attach();
  h.check('the roots drawer opens on its own, under Open from', await h.until(`!!document.querySelector('#viewport .ldp-drawer .ldp-root.on[data-id="recent"]')`)
    && await h.ev(`[...document.querySelectorAll('#viewport .ldp-root')].map(b=>b.dataset.id).join()`) === 'recent,images,videos,audio,downloads');
  await h.tap('#viewport .ldp-root[data-id="images"]');
  h.check('Images lists its buckets in grid mode', await h.until(`!!document.querySelector('#viewport .ldu-grid .ldp-doc[data-id="images/pictures"] img')`));
  await h.tap('#viewport .ldp-doc[data-id="images/pictures"]');
  h.check('the bucket opens under the breadcrumb', await h.until(`document.querySelector('#viewport .ldp-crumb')?.textContent === 'Pictures'`));
  const picture = await h.ev(`document.querySelector('#viewport .ldp-doc[data-id^="photo:"] .ldu-title').textContent`);
  await h.tap('#viewport .ldp-doc[data-id^="photo:"]');
  h.check('the picture comes back as a tile with its size', await h.until(`document.querySelector('#viewport .lem-compose .lem-att-tile b')?.textContent === ${JSON.stringify(picture)}`)
    && /^\d+([.,]\d)?\sMB$/.test(await h.ev(`document.querySelector('#viewport .lem-att-tile small').textContent`)), `${picture} / ${await h.ev(`document.querySelector('#viewport .lem-compose .lem-att-tile')?.textContent`)}`);
  await attach();
  h.check('the next Attach file returns to that bucket, drawer closed', await h.until(`document.querySelector('#viewport .ldp-crumb')?.textContent === 'Pictures'`) && !(await h.ev(`!!document.querySelector('#viewport .ldp-drawer')`)));
  await h.tap('#viewport .ldu-nav');
  await h.tap('#viewport .ldp-root[data-id="audio"]');
  await h.tap('#viewport .ldp-doc[data-id="audio/The Demo Tapes"]');
  h.check('an artist lists the albums', await h.until(`document.querySelectorAll('#viewport .ldp-doc[data-id^="audio/The Demo Tapes/"]').length === 2`));
  await h.tap('#viewport .ldp-doc[data-id="audio/The Demo Tapes/After Hours"]');
  await h.tap('#viewport .ldp-doc[data-id^="track:"]');
  h.check('the song comes back as a file row', await h.until(`document.querySelector('#viewport .lem-file b')?.textContent === 'Night Drive'`)
    && /^3[.,]8\sMB$/.test(await h.ev(`document.querySelector('#viewport .lem-file small').textContent`)));
  await attach();
  await h.key('Escape'); await h.key('Escape'); await h.key('Escape');
  h.check('Back climbs out and cancels without a file', await h.until(`!!document.querySelector('#viewport .lem-compose')`)
    && await h.ev(`document.querySelectorAll('#viewport .lem-att-tile, #viewport .lem-file').length`) === 2
    && await h.ev(`document.querySelector('#viewport .lem-compose input[name="subject"]').value`) === 'Weekend files');
  await h.tap('#viewport .lem-file .lem-att-x');
  h.check('Remove drops the file', await h.until(`!document.querySelector('#viewport .lem-file') && !!document.querySelector('#viewport .lem-att-tile')`));
  await h.type('#viewport .lem-compose input[name="to"]', 'alex@example.com');
  await h.tap('#viewport .lem-compose [type="submit"]');
  h.check('the sent mail keeps the picture', await h.until(`!!document.querySelector('#viewport .lem-conversation .lem-att-tile') && !document.querySelector('#viewport .lem-conversation .lem-att-x')`));
  // Pick image: the same picker for image/*, without Videos and Audio.
  await h.key('Escape'); await h.key('Escape');
  await h.tap('[data-action="home"]');
  await h.hold('#viewport .home-slot:not(:has(*))');
  await h.tap('#viewport [data-action="open-wallpapers"]');
  if (await h.until(`!!document.querySelector('#viewport .kwp-tile.pick')`)) {
    await h.tap('#viewport .kwp-tile.pick');
    h.check('Pick image opens the picker without Videos and Audio', await h.until(`!!document.querySelector('#viewport .ldp-app')`)
      && await h.ev(`(()=>{if(!document.querySelector('#viewport .ldp-drawer'))document.querySelector('#viewport .ldu-nav').click();return [...document.querySelectorAll('#viewport .ldp-root')].map(b=>b.dataset.id).join()})()`) === 'recent,images,downloads');
  } else h.check('the wallpaper picker opens', false);
};

// Chrome's local settings pages (T07): Search engine changes where the omnibox searches, Text scaling scales the web
// page and drags Force enable zoom along, the content toggles and the action-bar switches save, and the reload keeps
// them. spec: the version's page ids, the switches (with the page that leads to each), and its extra pages.
const chromeSettings = spec => async h => {
  const prefs = () => h.ev(`(()=>{const k=Object.keys(localStorage).find(k=>/^android-time-machine-\\w+-v1$/.test(k));return JSON.parse(localStorage.getItem(k)).chromePrefs||{}})()`);
  const settings = async () => {
    await h.openApp('chrome');
    h.check('opens Chrome', await h.until(`!!document.querySelector('#viewport [data-action="browser-menu"]')`));
    await h.tap('#viewport [data-action="browser-menu"]');
    await h.tap('[data-action="chrome-settings"]');
    h.check('Settings opens', await h.until(`!!document.querySelector('#viewport .chr-prefs')`));
  };
  const page = async (id, label = id) => {
    await h.tap(`#viewport .chr-pref[data-action="chrome-pref"][data-id="${id}"]`);
    h.check(`${label} opens its page`, await h.until(`document.querySelector('#viewport .chr-prefs')?.dataset.chrPage === ${JSON.stringify(id)}`));
  };
  const summary = id => h.ev(`document.querySelector('#viewport .chr-pref[data-id="${id}"] small')?.textContent || ''`);
  const up = () => h.tap('#viewport .chr-pref-up');
  await settings();
  h.check('no Home page row (no partner home page on the image)', !(await h.ev(`!!document.querySelector('#viewport .chr-pref[data-id="homepage"]')`)));
  await page('search_engine');
  h.check('the engines are listed, Google current', await h.ev(`document.querySelectorAll('#viewport [data-action="chrome-engine"]').length`) === spec.engines && /\S/.test(await h.ev(`document.querySelector('#viewport [data-action="chrome-engine"][data-id="0"] small')?.textContent || ''`)));
  const bing = spec.bing ?? 1;
  await h.tap(`#viewport [data-action="chrome-engine"][data-id="${bing}"]`);
  h.check('picking Bing makes it current', await h.until(`/\\S/.test(document.querySelector('#viewport [data-action="chrome-engine"][data-id="${bing}"] small')?.textContent || '') && !document.querySelector('#viewport [data-action="chrome-engine"][data-id="0"] small')`));
  await up();
  h.check('the header shows the engine', /^Bing \(bing\.com\)$/.test(await summary('search_engine')), await summary('search_engine'));
  await page('accessibility');
  await h.drag('#viewport [data-chr-seek]', 90, 0);
  const scale = Number((await h.ev(`document.querySelector('#viewport [data-chr-seek]').value`)));
  h.check('the slider raises Text scaling', scale >= 130 && (await prefs()).text_scale === scale / 100, String(scale));
  h.check('Force enable zoom follows past 130 %', await h.ev(`document.querySelector('#viewport .chr-pref[data-id="force_enable_zoom"] .chr-pref-check').classList.contains('on')`));
  await up();
  await page(spec.content, 'Content settings');
  await h.tap('#viewport .chr-pref[data-action="chrome-pref-toggle"][data-id="enable_javascript"]');
  h.check('JavaScript turns off', (await prefs()).enable_javascript === false);
  for (const [id, label] of spec.extraPages || []) { await page(id, label); await up(); }
  if (spec.external) {
    await h.tap('#viewport .chr-pref[data-action="chrome-pref-ext"]');
    h.check('the location row opens the location settings page', await h.until(spec.external));
    await h.key('Escape');
    h.check('Back returns to Content settings', await h.until(`document.querySelector('#viewport .chr-prefs')?.dataset.chrPage === ${JSON.stringify(spec.content)}`));
  }
  if (spec.siteToggle) {
    await page('site:location', 'Location');
    await h.tap('#viewport .chr-pref[data-action="chrome-pref-toggle"][data-id="site_location"]');
    h.check('the Location toggle blocks', await h.until(`document.querySelector('#viewport .chr-pref[data-id="site_location"] small')?.textContent === 'Blocked'`));
    await up();
    h.check('Site settings shows Blocked', await summary('site:location') === 'Blocked');
  }
  await up();
  for (const [via, id, key, confirm] of spec.switches) {
    if (via) await page(via);
    await page(id);
    const before = await h.ev(`document.querySelector('#viewport .chr-pref-barswitch')?.getAttribute('aria-checked')`);
    await h.tap('#viewport .chr-pref-barswitch');
    if (confirm) { h.check(`${id} asks first`, await h.until(`!!document.querySelector('#viewport .chr-dlg-message')`)); await h.tap('#viewport .chr-dlg-message [data-id="ok"]'); }
    h.check(`the ${id} switch saves`, await h.until(`document.querySelector('#viewport .chr-pref-barswitch')?.getAttribute('aria-checked') === ${JSON.stringify(before === 'true' ? 'false' : 'true')}`) && (await prefs())[key] === (before !== 'true'), JSON.stringify(await prefs()));
    await up(); if (via) await up();
  }
  for (const [id, key] of spec.checks || []) {
    await page(id);
    await h.tap(`#viewport .chr-pref[data-action="chrome-pref-toggle"][data-id="${key}"]`);
    h.check(`${key} turns on`, (await prefs())[key] === true);
    await up();
  }
  const kept = await prefs();
  h.check('the reload keeps the settings', await h.reload() && JSON.stringify(await prefs()) === JSON.stringify(kept));
  // The omnibox now searches with Bing, and the page's text is scaled.
  await h.openApp('chrome');
  h.check('Chrome reopens', await h.until(`!!document.querySelector('#viewport .chr-omnibox input')`));
  await h.type('#viewport .chr-omnibox input', 'android lollipop');
  await h.send('Input.dispatchKeyEvent', {type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r'});
  await h.send('Input.dispatchKeyEvent', {type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13});
  h.check('the search goes to Bing', await h.until(`document.querySelector('#viewport .web-engine')?.textContent === 'Bing'`));
  h.check('the page text is scaled', await h.ev(`document.querySelector('#viewport .chr-app .browser-page')?.style.fontSize`) === `${scale}%`);
};

// DeskClock's More options (T33): the menu (Night mode, Settings, Help), Settings' values saved and shown in their
// summaries, the analog style and the Home clock on the clock page, Night mode, Help opening the article, the Cities
// search (KitKat and Lollipop), and the reload keeping everything.
const clockSettings = spec => async h => {
  const prefs = () => h.ev(`(()=>{const k=Object.keys(localStorage).find(k=>/^android-time-machine-\\w+-v1$/.test(k));return (JSON.parse(localStorage.getItem(k)).jbClock||{}).prefs||{}})()`);
  const summary = id => h.ev(`document.querySelector('#viewport .cpref-row[data-id="${id}"] small')?.textContent || ''`);
  const pick = async (row, value) => { await h.tap(`#viewport .cpref-row[data-id="${row}"]`); h.check(`${row} opens its dialog`, await h.until(`!!document.querySelector('#viewport .cpref-dlg')`)); await h.tap(`#viewport .cpref-radio[data-id="${value}"]`); };
  const menu = async () => { await h.tap('#viewport [data-action="jbclock-menu"]'); h.check('More options opens the menu', await h.until(`!!document.querySelector('[data-action="cpref-open"]')`)); };
  await h.openApp('clock');
  h.check('opens the clock', await h.until(`!!document.querySelector('#viewport [data-action="jbclock-tab"][data-id="clock"]')`));
  await h.tap('#viewport [data-action="jbclock-tab"][data-id="clock"]');
  await menu();
  h.check('the menu holds Night mode, Settings and Help', await h.ev(`[...document.querySelectorAll('[data-action^="cpref-"]')].map(b=>b.dataset.action).join()`) === 'cpref-night,cpref-open,cpref-help');
  await h.tap('[data-action="cpref-open"]');
  h.check('Settings opens', await h.until(`document.querySelectorAll('#viewport .cpref-row').length === 7`));
  await pick('style', 'analog');
  h.check('Style saves Analog', await h.until(`/Analog/.test(document.querySelector('#viewport .cpref-row[data-id="style"] small')?.textContent || '')`) && (await prefs()).style === 'analog');
  await pick('silence', '5');
  h.check('Silence after shows 5 minutes', /^5\b/.test(await summary('silence')));
  await pick('buttons', '1');
  h.check('Volume buttons saves Snooze', (await prefs()).buttons === '1');
  await h.tap('#viewport .cpref-row[data-id="snooze"]');
  await h.tap('#viewport .cpref-np [data-id="1"]');
  await h.tap('#viewport .cpref-np [data-id="1"]');
  await h.tap('#viewport .cpref-dlg [data-action="cpref-save"]');
  h.check('Snooze length saves 12 minutes', (await prefs()).snooze === 12 && /^12\b/.test(await summary('snooze')));
  await h.tap('#viewport .cpref-row[data-id="volume"]');
  await h.drag('#viewport [data-cpref-volume]', -150, 0);
  await h.tap('#viewport .cpref-dlg [data-action="cpref-save"]');
  h.check('Alarm volume saves the slider', (await prefs()).volume < 6, JSON.stringify(await prefs()));
  await pick('zone', 'Asia/Tokyo');
  h.check('Home time zone shows Tokyo', /Tokyo/.test(await summary('zone')));
  await h.tap('#viewport .cpref-row[data-id="autoHome"]');
  h.check('the home time zone follows the automatic home clock', await h.ev(`document.querySelector('#viewport .cpref-row[data-id="zone"]').disabled`) && (await prefs()).autoHome === false);
  await h.tap('#viewport .cpref-row[data-id="autoHome"]');
  await h.key('Escape');
  h.check('the clock page draws the analog clock', await h.until(`!!document.querySelector('#viewport .jbclock-clock [data-cpref-analog]')`));
  h.check('the Home clock leads the world clocks', await h.ev(`/${spec.home}/.test(document.querySelector('#viewport .jbclock-world, #viewport .lpdc-world')?.textContent || '')`));
  await menu();
  await h.tap('[data-action="cpref-night"]');
  h.check('Night mode dims the clock', await h.until(`!!document.querySelector('#viewport .cpref-night [data-cpref-analog]')`));
  await h.tap('#viewport .cpref-night');
  h.check('a tap ends Night mode', await h.until(`!!document.querySelector('#viewport .jbclock-clock')`));
  if (spec.search) {
    await h.tap('#viewport [data-action="jbclock-cities"]');
    await h.tap('#viewport [data-action="jbclock-city-search"]');
    await h.type('#viewport [data-city-search]', 'bu');
    h.check('the search keeps the cities starting with it', await h.until(`(()=>{const n=[...document.querySelectorAll('#viewport [data-action="jbclock-city"] b')].map(b=>b.textContent);return n.length>0&&n.every(x=>/^bu/i.test(x))})()`));
    await h.key('Escape');
    h.check('Back closes the search', await h.until(`!document.querySelector('#viewport [data-city-search]') && document.querySelectorAll('#viewport [data-action="jbclock-city"]').length > 50`));
    await h.key('Escape');
  }
  const kept = await prefs();
  h.check('the reload keeps the settings', await h.reload() && JSON.stringify(await prefs()) === JSON.stringify(kept));
  await h.openApp('clock');
  await h.until(`!!document.querySelector('#viewport [data-action="jbclock-menu"]')`);
  await menu();
  await h.tap('[data-action="cpref-help"]');
  h.check('Help opens the article in the browser', await h.until(`/support\\.google\\.com/.test(document.querySelector('#viewport .chr-omnibox input')?.value || '')`));
};

const store = (h, key) => h.ev(`(()=>{const k=Object.keys(localStorage).find(k=>/^android-time-machine-\\w+-v1$/.test(k));const d=k&&JSON.parse(localStorage.getItem(k));return d?d[${JSON.stringify(key)}]:undefined})()`);
// Contacts' Import/export (T11): Export to storage asks first and Cancel writes nothing; OK writes 00001.vcf; a deleted
// contact comes back from the card with its fields and nobody is duplicated; with two cards "Import all" still does
// not duplicate; Import from SIM card shows the empty SIM; up to 4.4 Set ringtone keeps the choice and Cancel does not.
const contactsImportExport = spec => async h => {
  const listMenu = async () => { await h.tap(`#viewport [data-action="${spec.listMenu}"]`); await h.tap('[data-action="vcf-open"]'); h.check('Import/export opens its dialog', await h.until(`document.querySelectorAll('.vcf-dialog .vcf-item').length === 4`)); };
  // A contact by its content: the name, its numbers and addresses whatever the shape, and the other fields.
  const values = (c, many, one) => (c[many]?.length ? c[many].map(x => x.value) : c[one] ? [c[one]] : []).sort();
  const strip = list => JSON.stringify((list || []).map(c => ({name: c.name, phones: values(c, 'phones', 'phone'), emails: values(c, 'emails', 'email'), company: c.company || '', notes: c.notes || '', title: c.title || ''})).sort((a, b) => a.name.localeCompare(b.name)));
  await h.openApp('people');
  h.check('opens Contacts', await h.until(`!!document.querySelector('#viewport [data-action="${spec.listMenu}"]')`));
  await listMenu();
  await h.tap('.vcf-dialog [data-action="vcf-export"]');
  h.check('Export asks with the file name', await h.until(`/00001\\.vcf/.test(document.querySelector('.vcf-dialog p')?.textContent || '')`));
  await h.tap('.vcf-dialog [data-action="vcf-cancel"]');
  h.check('Cancel writes no file', !((await store(h, 'vcards')) || []).length);
  await listMenu();
  await h.tap('.vcf-dialog [data-action="vcf-export"]');
  await h.tap('.vcf-dialog [data-action="vcf-export-ok"]');
  const files = await store(h, 'vcards'), before = await store(h, 'contacts');
  h.check('OK writes 00001.vcf with every contact', files?.length === 1 && files[0].name === '00001.vcf' && (files[0].text.match(/BEGIN:VCARD/g) || []).length === before.length);
  h.check('the export is notified', (await store(h, 'notifications')).some(n => /00001\.vcf/.test(n.title)));
  // Delete a contact, then read the card back.
  const gone = before.find(c => c.name === spec.victim);
  await h.tap(`#viewport [data-action="contact"][data-id="${gone.id}"]`);
  await h.tap('#viewport [data-action="people-menu"]');
  await h.tap('[data-action="people-delete"]');
  await h.tap('[data-action="people-confirm-delete"]');
  h.check('the contact is deleted', await h.until(`!document.querySelector('#viewport [data-action="contact"][data-id="${gone.id}"]')`) && (await store(h, 'contacts')).length === before.length - 1);
  await listMenu();
  await h.tap('.vcf-dialog [data-action="vcf-import"]');
  h.check('one card is imported at once, with every field and no duplicate', await h.until(`!document.querySelector('.vcf-dialog')`) && strip(await store(h, 'contacts')) === strip(before), JSON.stringify(await store(h, 'contacts')));
  await listMenu();
  await h.tap('.vcf-dialog [data-action="vcf-export"]');
  await h.tap('.vcf-dialog [data-action="vcf-export-ok"]');
  await listMenu();
  await h.tap('.vcf-dialog [data-action="vcf-import"]');
  h.check('two cards ask how many to import', await h.until(`!!document.querySelector('.vcf-dialog [data-action="vcf-mode"][data-id="all"]')`));
  await h.tap('.vcf-dialog [data-action="vcf-mode"][data-id="all"]');
  await h.tap('.vcf-dialog [data-action="vcf-mode-ok"]');
  h.check('Import all does not duplicate', await h.until(`!document.querySelector('.vcf-dialog')`) && strip(await store(h, 'contacts')) === strip(before));
  await listMenu();
  await h.tap('.vcf-dialog [data-action="vcf-sim"]');
  h.check('Import from SIM card shows the empty SIM', await h.until(`!!document.querySelector('#viewport .vcf-sim-empty')`));
  await h.key('Escape');
  h.check('Back returns to the list', await h.until(`!!document.querySelector('#viewport [data-action="${spec.listMenu}"]')`));
  if (spec.ringtone) {
    const person = (await store(h, 'contacts')).find(c => c.name === spec.victim);
    await h.tap(`#viewport [data-action="contact"][data-id="${person.id}"]`);
    const ring = async () => { await h.tap('#viewport [data-action="people-menu"]'); await h.tap('[data-action="people-ringtone"]'); h.check('Set ringtone opens the picker', await h.until(`!!document.querySelector('.vcf-ringtone')`)); };
    await ring();
    const tone = await h.ev(`document.querySelector('.vcf-ringtone label:nth-child(4) input').value`);
    await h.tap('.vcf-ringtone label:nth-child(4)');
    await h.tap('.vcf-ringtone [type="submit"]');
    h.check('OK keeps the ringtone on the contact', (await store(h, 'contacts')).find(c => c.id === person.id).ringtone === tone, tone);
    await ring();
    h.check('the picker shows it again', await h.ev(`document.querySelector('.vcf-ringtone input[value="${tone}"]').checked`));
    await h.tap('.vcf-ringtone label:nth-child(5)');
    await h.tap('.vcf-ringtone [data-action="close-overlay"]');
    h.check('Cancel keeps it', (await store(h, 'contacts')).find(c => c.id === person.id).ringtone === tone);
  }
};
// The 5.1 Phone app (T44): Import/export from its menu, its Settings (General: Sort by / Name format acting on the
// Phone and Contacts lists, Phone ringtone, Dialpad tones and Also vibrate shared with Settings, Quick responses).
const phoneSettings = async h => {
  const menu = async () => { await h.tap('#viewport [data-action="phone-menu"]:not([data-id])'); };
  await h.openApp('phone');
  h.check('opens the Phone', await h.until(`!!document.querySelector('#viewport [data-action="phone-menu"]:not([data-id])')`));
  await menu();
  await h.tap('[data-action="vcf-open"]');
  h.check('Import/export opens from the Phone', await h.until(`document.querySelectorAll('.vcf-dialog .vcf-item').length === 4`));
  await h.key('Escape');
  h.check('Back closes it', await h.until(`!document.querySelector('.vcf-dialog')`));
  await menu();
  await h.tap('[data-action="dpr-settings"]');
  h.check('Settings lists General, Calls and Advanced', await h.until(`document.querySelectorAll('#viewport .ldp2-row').length === 3`));
  await h.tap('#viewport .ldp2-row[data-id="dialer-general"]');
  const pick = async (row, id) => { await h.tap(`#viewport .ldp2-row[data-id="${row}"]`); await h.tap(`#viewport .ldp2-radio[data-id="${id}"]`); };
  await pick('order', 'family');
  await pick('sort', 'family');
  h.check('Sort by and Name format save', JSON.stringify(await store(h, 'contactPrefs')) === '{"order":"family","sort":"family"}');
  await h.tap('#viewport .ldp2-row[data-id="dialTones"]');
  h.check('Dialpad tones is the system setting', (await store(h, 'settings')).dialTones === false);
  await h.tap('#viewport .ldp2-row[data-action="dpr-ringtone"]');
  h.check('Phone ringtone opens the ringtone picker', await h.until(`!!document.querySelector('form[data-sound="ringtone"]')`));
  await h.tap('form[data-sound="ringtone"] label:nth-child(3)');
  const tone = await h.ev(`document.querySelector('form[data-sound="ringtone"] input:checked').value`);
  await h.tap('form[data-sound="ringtone"] [type="submit"]');
  h.check('the ringtone is the system ringtone', (await store(h, 'settings')).ringtone === tone && await h.until(`document.querySelector('#viewport .ldp2-row[data-action="dpr-ringtone"] small')?.textContent === ${JSON.stringify(tone)}`), tone);
  await h.tap('#viewport .ldp2-row[data-id="dialer-quick"]');
  await h.tap('#viewport .ldp2-row[data-id="quick:1"]');
  await h.type('#viewport .ldp2-edit input', 'Driving, call you soon');
  await h.tap('#viewport [data-action="dpr-quick-ok"]');
  h.check('a quick response is edited', (await store(h, 'quickResponses'))?.[1] === 'Driving, call you soon' && await h.until(`/Driving, call you soon/.test(document.querySelector('#viewport .ldp2-list').textContent)`));
  await h.key('Escape'); await h.key('Escape'); await h.key('Escape');
  await h.tap('#viewport [data-action="lpd-tab"][data-id="contacts"]');
  h.check('the Phone lists by last name in Last, First form', await h.until(`(()=>{const n=[...document.querySelectorAll('#viewport .lpd-contact-name')].map(x=>x.textContent);return n.includes('Morgan, Alex')&&n.indexOf('Lee, Taylor')<n.indexOf('Morgan, Alex')})()`));
  await h.openApp('people');
  h.check('Contacts follows the same format', await h.until(`[...document.querySelectorAll('#viewport .lpp-name')].some(x=>x.textContent==='Morgan, Alex')`));
};

// Photo Sphere (T49): the mode starts with the hint; dragging the preview turns the camera onto the dots, each held one
// is a frame; Undo (4.4) / Discard (5.1) and leaving the mode save nothing; Done after two frames renders and saves a
// PANO_ sphere, which the Gallery's View Photo Sphere button (4.4) or a touch in Photos (5.1) shows in the viewer,
// where dragging looks around and Back returns to the picture.
const photoSphere = spec => async h => {
  const sel = spec.kk ? '[data-kks]' : '[data-lps]', frames = () => h.ev(`Number(document.querySelector('#viewport ${sel}')?.dataset.frames)`);
  const unit = () => h.ev(`document.querySelector('#viewport ${sel}').getBoundingClientRect().width / 0.8`);
  const spheres = async () => ((await store(h, 'photos')) || []).filter(p => p.sphere);
  const choose = async () => {
    if (spec.kk) { await h.tap('#viewport [data-jbcam-switcher]'); await h.tap('#viewport [data-jbcam-module="photosphere"]'); }
    else { await h.tap('#viewport [data-gcam-modes]'); await h.tap('#viewport [data-gcam-mode="photosphere"]'); }
    h.check('Photo Sphere starts with the hint', await h.until(`/${spec.hint}/.test(document.querySelector('#viewport ${sel} p')?.textContent || '')`));
  };
  // The first dot sits just above the circle; the next one a step (45 degrees) to the right.
  const twoFrames = async () => {
    await h.drag(`#viewport ${sel}`, 0, .12 * await unit());
    h.check('holding the first dot in the circle takes a frame', await h.until(`document.querySelector('#viewport ${sel}')?.dataset.frames === '1'`, 4000));
    await h.drag(`#viewport ${sel}`, -.34 * await unit(), 0);
    h.check('turning to the next dot takes the second', await h.until(`document.querySelector('#viewport ${sel}')?.dataset.frames === '2'`, 4000));
  };
  await h.openApp('camera');
  h.check('opens the camera', await h.until(`!!document.querySelector('#viewport ${spec.kk ? '[data-jbcam-switcher]' : '[data-gcam-modes]'}')`));
  await choose();
  await twoFrames();
  if (spec.kk) {
    await h.tap('#viewport [data-kks-undo]');
    h.check('Undo takes back the last frame', await frames() === 1);
    await h.sleep(600);
    h.check('the undone frame is not retaken while the dot stays in the reticle', await frames() === 1);
    await h.tap('#viewport [data-jbcam-switcher]'); await h.tap('#viewport [data-jbcam-module="photo"]');
    await choose();
  } else {
    await h.tap('#viewport [data-lps-cancel]');
    h.check('Discard photo sphere starts over', await h.until(`document.querySelector('#viewport [data-lps]')?.dataset.frames === '0'`));
  }
  h.check('nothing is saved on the way', !(await spheres()).length);
  await twoFrames();
  await h.tap(`#viewport ${spec.kk ? '[data-jbcam-shutter]' : '[data-gcam-shutter]'}`);
  h.check('Done renders the sphere', await h.until(`/${spec.rendering}/.test(document.querySelector('#viewport ${sel}')?.textContent || '')`, 3000));
  h.check('a PANO_ photo sphere joins the camera roll', await h.until(`(()=>{const k=Object.keys(localStorage).find(k=>/^android-time-machine-\\w+-v1$/.test(k));const d=k&&JSON.parse(localStorage.getItem(k)),p=d&&d.photos.find(p=>p.sphere);return !!p&&/^PANO_\\d{8}_\\d{6}$/.test(p.name)&&p.frames.length===2})()`, 8000));
  const [photo] = await spheres();
  if (spec.kk) {
    await h.openApp('gallery');
    await h.tap('#viewport [data-jbgal-album="camera"]');
    await h.tap(`#viewport [data-action="photo"][data-id="${photo.id}"]`);
    h.check('the Gallery offers View Photo Sphere', await h.until(`!!document.querySelector('#viewport [data-jbgal-sphere]')`));
    await h.tap('#viewport [data-jbgal-sphere]');
  } else {
    await h.openApp('photos');
    await h.tap(`#viewport .ph-thumb[data-id="${photo.id}"]`);
    h.check('the picture opens in Photos', await h.until(`!!document.querySelector('#viewport .ph-viewer[data-action="photos-sphere"]')`));
    await h.tap('#viewport .ph-viewer');
    h.check('Loading photo sphere… comes first', await h.ev(`/Loading photo sphere/.test(document.querySelector('#viewport [data-lps-loading]')?.textContent || '')`));
    await h.sleep(1000);
  }
  h.check('the viewer shows the sphere', await h.until(`!!document.querySelector('#viewport [data-sph-band]')`));
  const before = await h.ev(`document.querySelector('#viewport [data-sph-band]').style.backgroundPosition`);
  await h.drag('#viewport [data-sph-band]', -120, 40);
  h.check('dragging looks around', await h.ev(`document.querySelector('#viewport [data-sph-band]').style.backgroundPosition`) !== before);
  await h.key('Escape');
  h.check('Back returns to the picture', await h.until(`!document.querySelector('#viewport [data-sph-band]') && !!document.querySelector('#viewport ${spec.kk ? '[data-jbgal-sphere]' : '.ph-viewer'}')`));
};

// 2.3.6 Email › Account settings › Incoming / Outgoing settings (AccountSetupIncoming / AccountSetupOutgoing): Next
// follows validateFields, a security type sets its port, Next keeps the fields (never the password), Back keeps nothing.
const emailServersGB = async h => {
  const servers = () => h.ev(`(()=>{const k=Object.keys(localStorage).find(k=>/^android-time-machine-\\w+-v1$/.test(k));const d=k&&JSON.parse(localStorage.getItem(k));return (d&&d.appPrefs||{})['email-servers']||{}})()`);
  const row = key => `#viewport .gbset-row[data-id$=":${key}"]`;
  const next = () => h.ev(`!document.querySelector('#viewport .gbem-server .next').disabled`);
  const set = (name, value) => h.ev(`(()=>{const f=document.querySelector('#viewport .gbem-server [name="${name}"]');f.value=${JSON.stringify(value)};f.dispatchEvent(new Event('input',{bubbles:true}));return true})()`);
  const settings = async () => {
    await h.openApp('email');
    await h.until(`!!document.querySelector('#viewport .gbem')`);
    await h.tap('#nav-root .touch-menu, .touch-menu');
    await h.until(`!!document.querySelector('.gbmenu')`);
    if (!await h.ev(`!!document.querySelector('.gbmenu [data-action="gbpref-open"]')`)) await h.tap('.gbmenu [data-action="gb-menu-more"]');
    await h.tap('[data-action="gbpref-open"][data-id="email"]');
    h.check('Account settings open', await h.until(`!!document.querySelector('${row('incoming')}')`));
  };
  await settings();
  await h.tap(row('incoming'));
  h.check('Incoming settings show the IMAP fields', await h.until(`!!document.querySelector('#viewport .gbem-server [name="prefix"]') && /IMAP/.test(document.querySelector('#viewport .gbem-server').textContent)`));
  h.check('Next is enabled for the account as it is', await next());
  await h.type('#viewport .gbem-server [name="port"]', '0');
  h.check('port 0 disables Next', !await next());
  await set('security', '3');
  h.check('TLS sets port 143 and enables Next', await h.ev(`document.querySelector('#viewport .gbem-server [name="port"]').value`) === '143' && await next());
  await h.type('#viewport .gbem-server [name="server"]', 'bad host');
  h.check('a server name with a space disables Next', !await next());
  await h.type('#viewport .gbem-server [name="server"]', 'mail.example.org');
  await h.key('Escape');
  h.check('Back returns without keeping anything', await h.until(`!!document.querySelector('${row('incoming')}')`) && !(await servers()).incoming);
  await h.tap(row('incoming'));
  await h.until(`!!document.querySelector('#viewport .gbem-server')`);
  await h.type('#viewport .gbem-server [name="server"]', 'mail.example.org');
  await set('security', '0');
  await h.tap('#viewport .gbem-server .next');
  h.check('Next keeps the fields and returns', await h.until(`!!document.querySelector('${row('outgoing')}')`) && (await servers()).incoming?.server === 'mail.example.org' && (await servers()).incoming?.port === '143');
  h.check('the password is not stored', (await servers()).incoming?.passwordSet === true && !('password' in (await servers()).incoming));
  await h.tap(row('outgoing'));
  h.check('Outgoing settings open', await h.until(`!!document.querySelector('#viewport .gbem-server [name="login"]')`));
  await h.tap('#viewport .gbem-server .gbem-login');
  h.check('without sign-in the user fields hide', await h.ev(`getComputedStyle(document.querySelector('#viewport .gbem-login-fields')).display === 'none'`) && await next());
  await set('security', '1');
  h.check('SSL sets the SMTP port 465', await h.ev(`document.querySelector('#viewport .gbem-server [name="port"]').value`) === '465');
  await h.tap('#viewport .gbem-server .next');
  h.check('the outgoing settings are kept', await h.until(`!!document.querySelector('${row('outgoing')}')`) && (await servers()).outgoing?.login === false);
  h.check('the reload keeps them', await h.reload() && (await servers()).incoming?.server === 'mail.example.org');
  await settings();
  await h.tap(row('incoming'));
  h.check('the saved server is shown again', await h.until(`document.querySelector('#viewport .gbem-server [name="server"]')?.value === 'mail.example.org'`));
};

// The 5.1 Phone app's Calls and Advanced (T44): CallFeaturesSetting as the shamu shows it (no DTMF tones, Auto-retry or
// video calling), TTY mode, Hearing aids, Calling accounts' SIP settings, Voicemail's number (OK keeps, Cancel not) and
// Sound, Call forwarding Off, Additional settings' Caller ID and Call waiting; Advanced's Caller ID by Google and
// Nearby places switches. Kept on the phone and after a reload.
const phoneCallSettings = async h => {
  const call = async () => (await store(h, 'callPrefs')) || {};
  const open = id => h.tap(`#viewport .ldp2-row[data-id="${id}"]`);
  const title = () => h.ev(`document.querySelector('#viewport .ldp2-bar h2')?.textContent`);
  await h.openApp('phone');
  await h.until(`!!document.querySelector('#viewport [data-action="phone-menu"]:not([data-id])')`);
  await h.tap('#viewport [data-action="phone-menu"]:not([data-id])');
  await h.tap('[data-action="dpr-settings"]');
  await open('dialer-calls');
  h.check('Calls opens Call settings', await h.until(`document.querySelector('#viewport .ldp2-bar h2')?.textContent === 'Call settings'`));
  h.check('the shamu\'s rows, without DTMF tones or Auto-retry', await h.ev(`[...document.querySelectorAll('#viewport .ldp2-row b')].map(b=>b.textContent).join('|')`) === 'Calling accounts|Voicemail|Fixed Dialing Numbers|TTY mode|Hearing aids|GSM call settings');
  await open('tty');
  await h.tap('#viewport .ldp2-radio[data-id="1"]');
  h.check('TTY mode keeps TTY Full as its summary', (await call()).tty === 1 && await h.until(`document.querySelector('#viewport .ldp2-row[data-id="tty"] small')?.textContent === 'TTY Full'`));
  await open('hac');
  h.check('Hearing aids turns on', (await call()).hac === true);
  await open('dialer-accounts');
  h.check('Calling accounts shows the SIP settings', await h.until(`!!document.querySelector('#viewport .ldp2-row[data-id="sipReceive"]')`) && await h.ev(`document.querySelector('#viewport .ldp2-row[data-id="sip"] small').textContent`) === 'Only for SIP calls');
  await open('sipReceive');
  h.check('Receive incoming calls turns on', (await call()).sipReceive === true);
  await h.key('Escape');
  await open('dialer-voicemail');
  await open('dialer-vmsetup');
  h.check('the voicemail number is not set', await h.until(`document.querySelector('#viewport .ldp2-row[data-id="vmnumber"] small')?.textContent === '<Not set>'`));
  await open('vmnumber');
  await h.type('#viewport .ldp2-edit input', '+36 1 234 5678');
  await h.tap('#viewport [data-action="dpr-dialog"][data-id=""]:not(.ldp2-scrim)');
  h.check('Cancel keeps no number', !(await call()).vmNumber);
  await open('vmnumber');
  await h.type('#viewport .ldp2-edit input', '+36 1 234 5678');
  await h.tap('#viewport [data-action="dpr-vmnumber-ok"]');
  h.check('OK keeps the voicemail number', (await call()).vmNumber === '+36 1 234 5678' && await h.until(`document.querySelector('#viewport .ldp2-row[data-id="vmnumber"] small')?.textContent === '+36 1 234 5678'`));
  await h.key('Escape');
  await h.tap('#viewport .ldp2-row[data-action="dpr-vmtone"]');
  h.check('Sound opens the notification sounds', await h.until(`!!document.querySelector('form[data-sound="notificationTone"]')`));
  await h.tap('form[data-sound="notificationTone"] label:nth-child(3)');
  const tone = await h.ev(`document.querySelector('form[data-sound="notificationTone"] input:checked').value`);
  await h.tap('form[data-sound="notificationTone"] [type="submit"]');
  h.check('the voicemail sound is kept', (await store(h, 'settings')).vmTone === tone && await h.until(`document.querySelector('#viewport .ldp2-row[data-action="dpr-vmtone"] small')?.textContent === ${JSON.stringify(tone)}`));
  await h.key('Escape');
  await open('dialer-gsm');
  await open('dialer-cf');
  h.check('call forwarding reads Off', await h.until(`document.querySelectorAll('#viewport .ldp2-row small').length === 4`) && await h.ev(`document.querySelector('#viewport .ldp2-row small').textContent`) === 'Off');
  await h.key('Escape');
  await open('dialer-additional');
  await open('clir');
  await h.tap('#viewport .ldp2-radio[data-id="1"]');
  h.check('Caller ID hides the number', (await call()).clir === 1 && await h.until(`document.querySelector('#viewport .ldp2-row[data-id="clir"] small')?.textContent === 'Number hidden in outgoing calls'`));
  await open('cw');
  h.check('Call waiting turns off', (await call()).cw === false);
  for (const page of ['Additional settings', 'GSM call settings', 'Call settings']) { await h.key('Escape'); await h.until(`document.querySelector('#viewport .ldp2-bar h2')?.textContent !== ${JSON.stringify(page)}`); }
  h.check('Back returns to Settings', await title() === 'Settings');
  await open('dialer-advanced');
  h.check('Advanced lists Caller ID by Google and Nearby places, both on', await h.until(`document.querySelector('#viewport .ldp2-row[data-id="dialer-nearby"] small')?.textContent === 'Display search results for nearby places'`));
  await open('dialer-nearby');
  await h.tap('#viewport .ldp2-switchrow');
  h.check('the Nearby places switch turns off', (await call()).nearby === false && await h.ev(`document.querySelector('#viewport .ldp2-switchrow').getAttribute('aria-checked')`) === 'false');
  await h.key('Escape');
  h.check('its summary reads Off', await h.until(`document.querySelector('#viewport .ldp2-row[data-id="dialer-nearby"] small')?.textContent === 'Off'`));
  const before = JSON.stringify(await call());
  h.check('the reload keeps them', await h.reload() && JSON.stringify(await call()) === before);
};

// Lens Blur (T49, 5.1.1): the mode's shutter starts the sweep with its instructions; a sideways drag does not count,
// raising (a drag up) fills it; Cancel on the shutter and Back save nothing; a full sweep processes and saves the
// picture; in Photos it opens the viewer, where a touch moves the focus and the bar the blur; Back drops the edit,
// Done keeps it.
const lensBlur = async h => {
  const blurred = async () => ((await store(h, 'photos')) || []).filter(p => p.refocus);
  const state = () => h.ev(`document.querySelector('#viewport [data-lpr]')?.dataset.state || 'idle'`);
  const height = () => h.ev(`document.querySelector('#viewport [data-lpr]').getBoundingClientRect().height`);
  await h.openApp('camera');
  await h.until(`!!document.querySelector('#viewport [data-gcam-modes]')`);
  await h.tap('#viewport [data-gcam-modes]'); await h.tap('#viewport [data-gcam-mode="refocus"]');
  h.check('Lens Blur has its shutter', await h.until(`/ic_capture_refocus/.test(document.querySelector('#viewport [data-gcam-shutter] img')?.src || '')`));
  await h.tap('#viewport [data-gcam-shutter]');
  h.check('the shutter starts the sweep with its instructions', await h.until(`/Slowly raise your device/.test(document.querySelector('#viewport .lpr-msg')?.textContent || '')`) && await h.ev(`/ic_cancel_normal/.test(document.querySelector('#viewport [data-gcam-shutter] img').src)`));
  await h.drag('#viewport [data-lpr]', 160, 0);
  h.check('a sideways drag does not count', Number(await h.ev(`document.querySelector('#viewport [data-lpr]').dataset.progress`)) === 0);
  await h.drag('#viewport [data-lpr]', 0, -(await height()) * .12);
  h.check('raising fills the progress', Number(await h.ev(`document.querySelector('#viewport [data-lpr]').dataset.progress`)) > .3);
  await h.tap('#viewport [data-gcam-shutter]');
  h.check('Cancel stops without saving', await h.until(`!document.querySelector('#viewport [data-lpr]')`) && !(await blurred()).length);
  await h.tap('#viewport [data-gcam-shutter]');
  await h.until(`!!document.querySelector('#viewport [data-lpr][data-state="capture"]')`);
  await h.key('Escape');
  h.check('Back stops it too', await h.until(`!document.querySelector('#viewport [data-lpr]')`) && !(await blurred()).length);
  await h.tap('#viewport [data-gcam-shutter]');
  await h.until(`!!document.querySelector('#viewport [data-lpr][data-state="capture"]')`);
  const full = (await height()) * .3;
  await h.drag('#viewport [data-lpr]', 0, -full / 2);
  await h.drag('#viewport [data-lpr]', 0, -full / 2);
  h.check('a full sweep succeeds and processes', await h.until(`['success','process'].includes(document.querySelector('#viewport [data-lpr]')?.dataset.state)`, 3000));
  h.check('the Lens Blur picture is saved', await h.until(`(()=>{const k=Object.keys(localStorage).find(k=>/^android-time-machine-\\w+-v1$/.test(k));const d=k&&JSON.parse(localStorage.getItem(k));return !!d&&d.photos.some(p=>p.refocus)})()`, 8000));
  const [photo] = await blurred();
  await h.openApp('photos');
  await h.tap(`#viewport .ph-thumb[data-id="${photo.id}"]`);
  await h.until(`!!document.querySelector('#viewport .ph-viewer[data-action="photos-refocus"]')`);
  await h.tap('#viewport .ph-viewer');
  h.check('the picture opens the Lens Blur viewer', await h.until(`!!document.querySelector('#viewport [data-lpr-viewer] [data-lpr-strength]')`));
  const src = () => h.ev(`document.querySelector('#viewport [data-lpr-picture] img').src`);
  const first = await src();
  await h.ev(`(()=>{const r=document.querySelector('#viewport [data-lpr-strength]');r.value='0.9';r.dispatchEvent(new Event('input',{bubbles:true}));return 1})()`);
  h.check('the bar changes the blur', await src() !== first);
  await h.key('Escape');
  h.check('Back drops the edit', await h.until(`!!document.querySelector('#viewport .ph-viewer')`) && (await blurred())[0].refocus.strength === .6);
  await h.tap('#viewport .ph-viewer');
  await h.until(`!!document.querySelector('#viewport [data-lpr-picture] img')`);
  const box = await h.ev(`(()=>{const r=document.querySelector('#viewport [data-lpr-picture] img').getBoundingClientRect();return [r.left,r.top,r.width,r.height]})()`);
  await h.send('Input.dispatchMouseEvent', {type: 'mousePressed', x: box[0] + box[2] * .2, y: box[1] + box[3] * .7, button: 'left', buttons: 1, clickCount: 1});
  await h.send('Input.dispatchMouseEvent', {type: 'mouseReleased', x: box[0] + box[2] * .2, y: box[1] + box[3] * .7, button: 'left', buttons: 0, clickCount: 1});
  await h.ev(`(()=>{const r=document.querySelector('#viewport [data-lpr-strength]');r.value='0.3';r.dispatchEvent(new Event('input',{bubbles:true}));return 1})()`);
  await h.tap('#viewport [data-action="photos-refocus-done"]');
  const kept = (await blurred())[0].refocus;
  h.check('Done keeps the new focus and blur', kept.strength === .3 && Math.abs(kept.focus[0] - .2) < .05 && Math.abs(kept.focus[1] - .7) < .05, JSON.stringify(kept));
  h.check('Done returns to the picture', await h.until(`!!document.querySelector('#viewport .ph-viewer')`));
};

// Contacts › Contacts to display and Settings (T11): the account filter shows its header; Customize's check boxes (Cancel
// keeps the old view, OK applies it) hide a group's contacts; All contacts brings them back; Settings' Sort list by
// and View contact names as order and spell the list; kept after a reload.
const contactsDisplay = spec => async h => {
  const names = () => h.ev(`[...document.querySelectorAll('#viewport ${spec.row}')].map(x=>x.textContent.trim())`);
  const menu = async item => { await h.tap(`#viewport [data-action="${spec.listMenu}"]`); await h.tap(`[data-action="${item}"]`); };
  await h.openApp('people');
  h.check('opens Contacts', await h.until(`document.querySelectorAll('#viewport ${spec.row}').length >= 4`));
  const all = await names();
  await menu('pfl-open');
  h.check('Contacts to display lists All contacts, the account and Customize', await h.until(`document.querySelectorAll('#viewport .pio-row').length === 3`));
  await h.tap('#viewport .pio-row[data-id="account"]');
  h.check('the account filter heads the list', await h.until(`/Contacts in .+@/.test(document.querySelector('#viewport .people-filter-header')?.textContent || '')`) && (await names()).length === all.length);
  await menu('pfl-open');
  await h.tap('#viewport .pio-row[data-id="customize"]');
  h.check('Customize shows the groups and All other contacts', await h.until(`!!document.querySelector('#viewport .pio-row[data-id="ungrouped"]') && !!document.querySelector('#viewport .pio-row[data-id="friends"]')`));
  await h.tap('#viewport .pio-row[data-id="friends"]');
  await h.key('Escape');
  await h.key('Escape');
  h.check('Cancel keeps the view', await h.until(`/Contacts in .+@/.test(document.querySelector('#viewport .people-filter-header')?.textContent || '')`) && (await names()).length === all.length);
  await menu('pfl-open');
  await h.tap('#viewport .pio-row[data-id="customize"]');
  await h.tap('#viewport .pio-row[data-id="friends"]');
  await h.tap('#viewport .pio-buttons [data-action="pfl-ok"]');
  h.check('OK hides the Friends group\'s contacts', await h.until(`document.querySelector('#viewport .people-filter-header')?.textContent === 'Contacts in custom view'`) && JSON.stringify(await names()) === '["Mom"]', JSON.stringify(await names()));
  await menu('pfl-open');
  await h.tap('#viewport .pio-row[data-id="all"]');
  h.check('All contacts shows everyone again', await h.until(`!document.querySelector('#viewport .people-filter-header')`) && (await names()).length === all.length);
  await menu('pst-open');
  h.check('Settings shows the display options', await h.until(`document.querySelectorAll('#viewport .pio-row').length === 2`));
  await h.tap('#viewport .pio-row[data-id="sort"]');
  await h.tap(`#viewport [data-action="pst-pick"][data-id="family"]`);
  await h.tap('#viewport .pio-row[data-id="order"]');
  await h.tap(`#viewport [data-action="pst-pick"][data-id="family"]`);
  h.check('the choices are kept and summarised', JSON.stringify(await store(h, 'contactPrefs')) === '{"sort":"family","order":"family"}' && await h.until(`/^(Last|Family) name first$/.test(document.querySelector('#viewport .pio-row[data-id="order"] small')?.textContent || '')`));
  await h.key('Escape');
  h.check('the list sorts by last name, last name first', await h.until(`(()=>{const n=[...document.querySelectorAll('#viewport ${spec.row}')].map(x=>x.textContent.trim());return n.indexOf('Lee, Taylor')>-1&&n.indexOf('Lee, Taylor')<n.indexOf('Morgan, Alex')&&n.indexOf('Morgan, Alex')<n.indexOf('Rivera, Sam')})()`), JSON.stringify(await names()));
  h.check('the reload keeps it', await h.reload() && JSON.stringify(await store(h, 'contactPrefs')) === '{"sort":"family","order":"family"}' && (await store(h, 'contactsFilter')) === 'all');
};

// Contacts › Share and Share visible contacts (T11): the chooser "Share contact via" offers Email and Gmail; leaving it
// shares nothing; Gmail's compose carries "<name>.vcf" with the contact's card; Import/export's Share visible contacts
// gives Email "vcards_….vcf" with every visible contact's card.
const contactsShare = spec => async h => {
  const cards = () => h.ev(`(()=>{const k=Object.keys(localStorage).find(k=>/^android-time-machine-\\w+-v1$/.test(k));const d=k&&JSON.parse(localStorage.getItem(k))||{};const out=[];for(const box of ['mailbox','gmailbox','gmail40'])for(const m of d[box]||[]){if(m.attachment?.vcard)out.push({box,name:m.attachment.name,text:m.attachment.text});for(const f of m.files||[])if(f.mime==='text/x-vcard')out.push({box,name:f.name,text:f.text});}return out})()`);
  await h.openApp('people');
  await h.until(`!!document.querySelector('#viewport [data-action="contact"][data-id="1"]')`);
  await h.tap('#viewport [data-action="contact"][data-id="1"]');
  await h.tap('#viewport [data-action="people-menu"]');
  await h.tap('[data-action="psh-open"]');
  h.check('Share opens "Share contact via" with Email and Gmail', await h.until(`document.querySelectorAll('.pio-share .pio-share-row').length === 2 && /Share contact via/.test(document.querySelector('.pio-share h3').textContent)`));
  await h.key('Escape');
  h.check('leaving the chooser shares nothing', await h.until(`!document.querySelector('.pio-share')`) && !(await cards()).length);
  await h.tap('#viewport [data-action="people-menu"]');
  await h.tap('[data-action="psh-open"]');
  await h.tap('.pio-share [data-action="psh-to"][data-id="gmail"]');
  const one = (await cards())[0];
  h.check('Gmail\'s compose carries the contact\'s card', !!one && one.name === 'Alex Morgan.vcf' && (one.text.match(/BEGIN:VCARD/g) || []).length === 1 && /FN:Alex Morgan/.test(one.text), JSON.stringify(one));
  h.check('the compose shows it', await h.until(`/Alex Morgan\\.vcf/.test(document.querySelector('#viewport').textContent)`));
  await h.openApp('people');
  await h.tap(`#viewport [data-action="${spec.listMenu}"]`);
  await h.tap('[data-action="vcf-open"]');
  await h.tap('.vcf-dialog [data-action="vcf-share"]');
  await h.tap('.pio-share [data-action="psh-to"][data-id="email"]');
  const all = (await cards()).find(c => /^vcards_\d{8}_\d{6}\.vcf$/.test(c.name));
  const count = await store(h, 'contacts');
  h.check('Share visible contacts gives Email every card', !!all && (all.text.match(/BEGIN:VCARD/g) || []).length === count.length, JSON.stringify(all?.name));
};

// Contacts › Place on Home screen (T11; 4.1 added it, ICS's contact menu has none): the toast names the shortcut, InstallShortcutReceiver's screen gets it (Launcher2:
// the default screen first; Launcher3: from the second screen on), it shows the contact's name and opens the contact.
const contactsShortcut = spec => async h => {
  await h.openApp('people');
  await h.until(`!!document.querySelector('#viewport [data-action="contact"][data-id="1"]')`);
  await h.tap('#viewport [data-action="contact"][data-id="1"]');
  await h.tap('#viewport [data-action="people-menu"]');
  await h.tap('[data-action="people-place-home"]');
  h.check('the toast names the shortcut', await h.until(`/Alex Morgan/.test(document.querySelector('.toast')?.textContent || '')`));
  const pages = await store(h, 'homePages'), page = pages.findIndex(p => p.includes('contact:1'));
  h.check(`it lands on screen ${spec.page}`, page === spec.page, JSON.stringify(page));
  // The launcher's first-run clings are not this path: they are marked seen, then the phone reloads onto its home.
  await h.ev(`(()=>{const k=Object.keys(localStorage).find(k=>/^android-time-machine-\\w+-v1$/.test(k));const d=JSON.parse(localStorage.getItem(k));d.clings={firstRun:true,workspace:true,folder:true};localStorage.setItem(k,JSON.stringify(d));return 1})()`);
  await h.reload();
  await h.until(`!!document.querySelector('#viewport .home-view')`);
  // The first-run clings step aside, then the shortcut's screen is shown.
  await h.ev(`(()=>{document.querySelectorAll('[data-action*="cling"]').forEach(b=>b.click());const m=document.querySelector('[data-action="page"][data-id="${page}"]');m?.click();return 1})()`);
  h.check('the shortcut shows the contact', await h.until(`document.querySelector('#viewport .home-grid[data-home-page="${page}"] .contact-shortcut > span:last-child')?.textContent.trim() === 'Alex Morgan'`));
  await h.sleep(600);
  // (The launcher's first-run clings were marked seen before the reload above.)
  await h.tap(`#viewport .home-grid[data-home-page="${page}"] .contact-shortcut`);
  h.check('a tap opens the contact', await h.until(`!!document.querySelector('#viewport [data-action="people-menu"]') && /Alex Morgan/.test(document.querySelector('#viewport').textContent)`));
};

// 2.3.6 Select text (T08): Browser's and Google Mail's menu arm the page; a drag over the text then copies it ("Text
// copied to clipboard."); an unarmed drag copies nothing.
const gbSelectText = async h => {
  const copied = () => h.until(`/Text copied to clipboard/.test(document.querySelector('.toast')?.textContent || '')`, 3000);
  const select = async () => {
    await h.tap('#nav-root .touch-menu, .touch-menu');
    await h.until(`!!document.querySelector('.gbmenu')`);
    if (!await h.ev(`!!document.querySelector('.gbmenu [data-action="gb-select-text"]')`)) await h.tap('.gbmenu [data-action="gb-menu-more"]');
    await h.tap('[data-action="gb-select-text"]');
  };
  await h.openApp('browser');
  h.check('the Browser shows its page', await h.until(`[...document.querySelectorAll('#viewport .gbbr-page p')].some(p => p.textContent.trim().length > 20)`));
  const text = '#viewport .gbbr-page p';
  await h.drag(text, 60, 0);
  h.check('an unarmed drag copies nothing', !await h.until(`/Text copied/.test(document.querySelector('.toast')?.textContent || '')`, 800));
  await select();
  await h.drag(text, 60, 0);
  h.check('Select text then a drag copies the text', await copied());
  await h.openApp('gmail');
  await h.tap('#viewport [data-action="gm-open"][data-id="gm-1"]');
  h.check('Google Mail opens the conversation', await h.until(`!!document.querySelector('#viewport .gm-body')`));
  await select();
  await h.drag('#viewport .gm-body', 80, 0);
  h.check('Google Mail\'s Select text copies the message text', await copied());
};

// 2.3.6 Maps (T12): the server's layers drawn over the city, Labs (Scale Bar, Measure, Bubble Buttons), Cache settings'
// Clear cache, Places' Add, Navigation's Settings, and the Gallery's Show on map for a picture taken with Store location.
const gbMapsLocal = async h => {
  const touch = async (selector, fx, fy) => {
    const r = await h.ev(`(()=>{const b=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return [b.left,b.top,b.width,b.height]})()`);
    const x = r[0] + r[2] * fx, y = r[1] + r[3] * fy;
    await h.send('Input.dispatchMouseEvent', {type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1}); await h.sleep(40);
    await h.send('Input.dispatchMouseEvent', {type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1}); await h.sleep(250);
  };
  const menu = async (action, id) => {
    const item = `.gbmenu [data-action="${action}"]${id ? `[data-id="${id}"]` : ''}`;
    await h.tap('.touch-menu');
    await h.until(`!!document.querySelector('.gbmenu')`);
    if (!await h.ev(`!!document.querySelector(${JSON.stringify(item)})`)) await h.tap('.gbmenu [data-action="gb-menu-more"]');
    await h.tap(item.replace('.gbmenu ', ''));
  };
  const pixels = `document.querySelector('#viewport .mp-canvas').toDataURL()`;
  await h.openApp('maps');
  await h.until(`!!document.querySelector('#viewport .mp-canvas')`); await h.sleep(500);
  const plain = await h.ev(pixels);
  await h.tap('#viewport [data-action="mp-layers"]');
  await h.tap('[data-action="mp-layer"][data-id="transit"]');
  await h.sleep(400);
  h.check('Transit Lines draws on the map', await h.ev(pixels) !== plain);
  await h.tap('#viewport [data-action="mp-layers"]');
  h.check('the layer stays checked', await h.until(`document.querySelector('[data-action="mp-layer"][data-id="transit"]')?.getAttribute('aria-checked') === 'true'`));
  await h.tap('[data-action="mp-layer"][data-id="wiki"]');
  h.check('Wikipedia puts its pins on the map', await h.until(`document.querySelectorAll('#viewport .mp-wiki').length === 4`));
  // Labs: the picture rows' checks are kept; Measure's button and the scale bar appear on the map.
  await menu('gbpref-open', 'maps-labs');
  h.check('Labs lists the image\'s labs', await h.until(`document.querySelectorAll('#viewport .gbset-row .gbset-img').length === 3`));
  await h.tap('#viewport [data-action="gbpref-check"][data-id="maps-labs:measure"]');
  await h.tap('#viewport [data-action="gbpref-check"][data-id="maps-labs:bubble"]');
  h.check('the labs are saved', (await store(h, 'appPrefs'))?.['maps-labs']?.measure === true);
  await h.ev(`(()=>{const el=document.createElement('button');el.dataset.action='back';document.querySelector('#viewport').firstElementChild.append(el);el.click();el.remove();return 1})()`);
  await h.until(`!!document.querySelector('#viewport .mp-measure')`);
  await touch('#viewport .mp-canvas', .5, .5);
  await h.tap('#viewport .mp-measure');
  await touch('#viewport .mp-canvas', .3, .3); await touch('#viewport .mp-canvas', .7, .7);
  h.check('Measure gives the distance of the taps', await h.until(`/\\d/.test(document.querySelector('#viewport .mp-measure-total')?.textContent || '')`));
  await h.tap('#viewport .mp-measure');
  h.check('a second press clears the measure', !await h.ev(`!!document.querySelector('#viewport .mp-measure-total')`));
  // Bubble Buttons: the place's bubble calls and navigates.
  await h.ev(`(()=>{const el=document.createElement('button');el.dataset.action='mp-select';el.dataset.id='p1';document.querySelector('#viewport .mp-map').append(el);el.click();el.remove();return 1})()`);
  h.check('Bubble Buttons gives the bubble its call and navigate buttons', await h.until(`!!document.querySelector('#viewport .mp-bb [data-action="mp-call"]') && !!document.querySelector('#viewport .mp-bb [data-action="mp-navigate"]')`));
  // Cache settings: the shown map is in the cache; Clear cache empties it and has nothing more to clear.
  await menu('gbpref-open', 'maps-cache');
  h.check('Clear cache has the map to clear', await h.until(`document.querySelector('#viewport [data-id="maps-cache:cache_settings_clear_cache"]')?.disabled === false`));
  await h.tap('#viewport [data-id="maps-cache:cache_settings_clear_cache"]');
  h.check('Clear cache empties it', await h.until(`document.querySelector('#viewport [data-id="maps-cache:cache_settings_clear_cache"]')?.disabled === true`) && await store(h, 'mapsCache') === false);
  // Places' Add: a search of one's own as a tile that lists its places.
  await h.openApp('places');
  await h.tap('#viewport [data-action="mp-cat"][data-id="add"]');
  await h.type('.gbdlg [name=q]', 'pizza');
  await h.tap('[data-action="mp-add-ok"]');
  h.check('Add puts the search on the grid', await h.until(`document.querySelector('#viewport [data-action="mp-cat"][data-id="custom:0"]')?.textContent.trim() === 'pizza'`) && (await store(h, 'placesCustom'))?.[0] === 'pizza');
  await h.tap('#viewport [data-action="mp-cat"][data-id="custom:0"]');
  h.check('the tile lists its places', await h.until(`document.querySelectorAll('#viewport .mp-result').length > 0`));
  // Navigation's Settings: 1-click report a problem is kept.
  await h.openApp('navigation');
  await menu('gbpref-open', 'maps-navigation');
  await h.tap('#viewport [data-action="gbpref-check"][data-id="maps-navigation:OneButtonRmi"]');
  h.check('Navigation\'s Settings keeps its check', (await store(h, 'appPrefs'))?.['maps-navigation']?.OneButtonRmi === true);
  // The Gallery: a picture taken with Store location has Show on map; it opens Maps on the place.
  await h.openApp('camera'); await h.sleep(800);
  const act = (a, id) => h.ev(`(()=>{const el=document.createElement('button');el.dataset.action=${JSON.stringify(a)};${id ? `el.dataset.id=${JSON.stringify(id)};` : ''}document.querySelector('#viewport').firstElementChild.append(el);el.click();el.remove();return 1})()`);
  await act('gbcam-set', 'gps:on'); await act('gbcam-shutter');
  h.check('the picture keeps its location', await h.until(`${SAVE}?.photos?.[0]?.location?.fx > 0`, 5000));
  await act('camera-review'); await h.sleep(800);
  await act('gbg-select-current'); await act('gbg-more');
  h.check('Show on map is offered', await h.until(`!!document.querySelector('#viewport [data-action="gbg-show-map"]')`));
  await h.tap('#viewport [data-action="gbg-show-map"]');
  h.check('Maps opens on the picture\'s place', await h.until(`!!document.querySelector('#viewport .mp-map .mp-bubble')`));
};

// Maps' settings (T12, maps-prefs.js). Maps 6.x (4.0.4, 4.3): Cache settings' check and Clear cache; 4.3's My Places
// (the search card's star, delete with confirmation); 4.0.4 Latitude's arrows. Maps 7.5 / 9.3 (4.4.4, 5.1.1):
// Distance units, Shake to send feedback, Maps history, Edit home or work, About and Google location settings;
// 5.1.1's Your places.
const mapsSettings = spec => async h => {
  const prefs = async () => (await store(h, 'mapsPrefs')) || {};
  const search = async q => {
    if (spec.maps6) await h.tap('#viewport [data-action="maps-search-open"]');
    await h.type('#viewport [data-form="maps-search"] input', q);
    await h.ev(`document.querySelector('#viewport [data-form="maps-search"]').requestSubmit()`);
    await h.sleep(300);
  };
  const open = async id => {
    if (spec.maps6) { await h.tap('#viewport [data-action="sa-menu"]'); await h.tap(`.holo-menu [data-action="mps-settings"][data-id="${id}"]`); }
    else { await h.tap('#viewport [data-action="maps-panel"]'); await h.tap(`#viewport [data-action="mps-settings"][data-id="${id}"]`); }
    h.check(`the ${id} screen opens`, await h.until(`!!document.querySelector('#viewport .mps-${id}')`));
  };
  const back = () => h.ev(`(()=>{const el=document.createElement('button');el.dataset.action='back';document.querySelector('#viewport').firstElementChild.append(el);el.click();el.remove();return 1})()`);
  await h.openApp('maps');
  await h.until(`!!document.querySelector('#viewport .sa-maps')`);
  if (spec.maps6) {
    await search('Pizza');
    if (spec.places) {
      await h.tap('#viewport .sa-maps-star');
      h.check('the star keeps the place', (await store(h, 'mapsStarred'))?.[0] === 'Pizza');
      await open('places');
      h.check('My Places lists it', await h.until(`/Pizza/.test(document.querySelector('#viewport .mps-item')?.textContent || '')`));
      await h.tap('#viewport .mps-item .mps-del');
      h.check('Delete asks first', await h.until(`/will be removed from My Places/.test(document.querySelector('#viewport .mps-dialog')?.textContent || '')`));
      await h.tap('#viewport .mps-buttons [data-action="mps-del-ok"]');
      h.check('the place is gone', await h.until(`!!document.querySelector('#viewport .mps-empty')`) && !(await store(h, 'mapsStarred'))?.length);
      await back();
      await h.until(`!!document.querySelector('#viewport .sa-maps')`);
    }
    await open('settings');
    h.check('Switch account names the account', await h.ev(`/demo@gmail\\.com/.test(document.querySelector('#viewport .mps-settings').textContent)`));
    await h.tap('#viewport [data-action="mps-open"][data-id="cache"]');
    await h.tap('#viewport [data-action="mps-check"][data-id="map_tile_settings_use_cached_tiles_only"]');
    h.check('Use cached tiles only is kept', (await prefs()).map_tile_settings_use_cached_tiles_only === true);
    h.check('Clear cache has the shown map to clear', await h.ev(`document.querySelector('#viewport [data-action="mps-act"][data-id="clear"]')?.disabled === false`));
    await h.tap('#viewport [data-action="mps-act"][data-id="clear"]');
    h.check('Clear cache empties it', await h.until(`document.querySelector('#viewport [data-action="mps-act"][data-id="clear"]')?.disabled === true`) && await store(h, 'mapsCache') === false);
    await back(); await back();
    h.check('Back returns to the map', await h.until(`!!document.querySelector('#viewport .sa-maps6-map')`));
    if (spec.latitude) {
      await h.openApp('latitude');
      await h.until(`!!document.querySelector('#viewport [data-action="maps-lat-step"]')`);
      await h.tap('#viewport [data-action="maps-lat-step"][data-id="1"]'); await h.tap('#viewport [data-action="maps-lat-step"][data-id="1"]');
      h.check('Next steps to a friend', await h.until(`/Alex Morgan/.test(document.querySelector('#viewport .sa-lat-card')?.textContent || '')`));
      await h.tap('#viewport [data-action="maps-lat-step"][data-id="-1"]');
      h.check('Previous steps back to me', await h.until(`!/Alex/.test(document.querySelector('#viewport .sa-lat-card')?.textContent || 'Alex')`));
    }
    return;
  }
  await search('Coffee');
  h.check('the search joins Maps history', (await store(h, 'mapsHistory'))?.[0] === 'Coffee');
  await open('settings');
  await h.tap('#viewport [data-action="mps-list"][data-id="distance_units"]');
  await h.tap('#viewport [data-action="mps-pick"][data-id="distance_units:2"]');
  h.check('Distance units keeps Miles', (await prefs()).distance_units === 'MILES');
  await h.tap('#viewport [data-action="mps-check"][data-id="shake_to_send_feedback"]');
  h.check('Shake to send feedback turns off', (await prefs()).shake_to_send_feedback === false);
  await h.tap('#viewport [data-action="mps-open"][data-id="history"]');
  h.check('Maps history lists the search', await h.until(`/Coffee/.test(document.querySelector('#viewport .mps-item')?.textContent || '')`));
  await h.tap('#viewport .mps-item .mps-del');
  await h.tap('#viewport .mps-buttons [data-action="mps-del-ok"]');
  h.check('Delete removes it', await h.until(`!document.querySelector('#viewport .mps-item')`) && !(await store(h, 'mapsHistory'))?.length);
  await back();
  await h.tap('#viewport [data-action="mps-open"][data-id="homework"]');
  await h.tap('#viewport [data-action="mps-act"][data-id="home"]');
  await h.type('#viewport [data-mps-input]', '1 Main St');
  await h.tap('#viewport .mps-buttons [data-action="mps-edit-ok"]');
  h.check('Home keeps the address', await h.until(`/1 Main St/.test(document.querySelector('#viewport [data-id="home"]')?.textContent || '')`) && await store(h, 'mapsHome') === '1 Main St');
  await back();
  await h.tap('#viewport [data-action="mps-open"][data-id="about"]');
  h.check('About shows the version', await h.until(`/${spec.version.replace(/\./g, '\\.')} \\(#\\d+\\)/.test(document.querySelector('#viewport .mps-about')?.textContent || '')`));
  await back();
  if (spec.places) {
    await back();
    await open('places');
    h.check('Your places shows Home', await h.until(`/1 Main St/.test(document.querySelector('#viewport .mps-places')?.textContent || '')`));
    await back();
    await open('settings');
  }
  await h.tap('#viewport [data-action="mps-act"][data-id="location"]');
  h.check('Google location settings opens Google Settings', await h.until(`!!document.querySelector('#viewport .gms-app, #viewport .gms6-app') && /Google location settings/.test(document.querySelector('#viewport').textContent)`));
};

// 2.3.6 Messaging attachments (T13, gb-mms-attach.js): Audio (Select audio) with Play, Record audio in Sound Recorder,
// Capture picture / video through the Camera, Slideshow (Edit slideshow, a slide's Duration) sent and played.
const gbMmsAttach = async h => {
  const act = (a, id) => h.ev(`(()=>{const el=document.createElement('button');el.dataset.action=${JSON.stringify(a)};${id ? `el.dataset.id=${JSON.stringify(id)};` : ''}document.querySelector('#viewport').firstElementChild.append(el);el.click();el.remove();return 1})()`);
  const attach = async type => {
    await h.tap('.touch-menu');
    await h.until(`!!document.querySelector('.gbmenu')`);
    if (!await h.ev(`!!document.querySelector('.gbmenu [data-action="mms-attach"]')`)) await h.tap('.gbmenu [data-action="gb-menu-more"]');
    await h.tap('[data-action="mms-attach"]');
    await h.tap(`.gbdlg [data-action="gbma-attach"][data-id="${type}"]`);
  };
  const kind = () => h.ev(`(()=>{const d=Object.values(${SAVE}.messageDrafts||{}).find(x=>x.attachment);const a=d&&d.attachment;return a?a.kind||(a.video?'video':'image'):''})()`);
  await h.openApp('messaging');
  await h.tap('#viewport [data-action="thread"][data-id="1"]');
  await h.until(`!!document.querySelector('#viewport .gbmms-compose')`);
  await attach('sound');
  await h.tap('.gbdlg [data-action="gbma-audio-pick"][data-id="Aquila"]');
  await h.tap('.gbdlg [data-action="gbma-audio-ok"]');
  h.check('Audio attaches the sound', await h.until(`/Aquila/.test(document.querySelector('#viewport .gbma-audio')?.textContent || '')`) && await kind() === 'audio');
  await h.tap('#viewport .gbma-audio [data-action="gbma-view"]');
  h.check('Play opens the slideshow player', await h.until(`!!document.querySelector('#viewport .gbma-slideshow')`));
  await act('back');
  await h.tap('#viewport .gbma [data-action="mms-remove-attachment"]');
  h.check('Remove takes it off', await h.until(`!document.querySelector('#viewport .gbma')`) && !await kind());
  await attach('record-sound');
  h.check('Record audio opens Sound Recorder', await h.until(`!!document.querySelector('#viewport .gbsr')`));
  await h.tap('#viewport [data-action="gbma-rec-record"]'); await h.sleep(1300); await h.tap('#viewport [data-action="gbma-rec-stop"]');
  await h.tap('#viewport [data-action="gbma-rec-accept"]');
  h.check('Use this recording attaches it', await h.until(`/Audio recordings/.test(document.querySelector('#viewport .gbma-audio')?.textContent || '')`));
  await h.tap('#viewport .gbma [data-action="mms-remove-attachment"]');
  await attach('take-photo');
  await h.until(`!!document.querySelector('#viewport [data-action="gbcam-shutter"]')`); await h.sleep(500);
  await h.tap('#viewport [data-action="gbcam-shutter"]');
  h.check('the capture shows OK, Retake and Cancel', await h.until(`!!document.querySelector('#viewport [data-action="gbcam-cap-ok"]') && !!document.querySelector('#viewport [data-action="gbcam-cap-retake"]')`, 6000));
  await h.tap('#viewport [data-action="gbcam-cap-ok"]');
  h.check('Capture picture comes back with the picture', await h.until(`!!document.querySelector('#viewport .gbma-image')`, 8000) && await kind() === 'image');
  await h.tap('#viewport .gbma [data-action="gbma-replace"]');
  h.check('Replace offers the pictures', await h.until(`!!document.querySelector('.gbdlg [data-action="gbma-picked"]')`));
  await act('close-overlay');
  await h.tap('#viewport .gbma [data-action="mms-remove-attachment"]');
  await attach('record-video');
  await h.until(`!!document.querySelector('#viewport [data-action="gbcam-shutter"]')`); await h.sleep(500);
  await h.tap('#viewport [data-action="gbcam-shutter"]'); await h.sleep(1300); await h.tap('#viewport [data-action="gbcam-shutter"]');
  await h.until(`!!document.querySelector('#viewport [data-action="gbcam-cap-play"]')`, 6000);
  await h.tap('#viewport [data-action="gbcam-cap-ok"]');
  h.check('Capture video comes back with the video', await h.until(`!!document.querySelector('#viewport .gbma-video')`, 8000) && await kind() === 'video');
  // With an attachment shown the menu has no Add attachment, so the video is removed first; a second slide gets 3 seconds.
  await h.sleep(2500);
  await h.tap('#viewport .gbma [data-action="mms-remove-attachment"]');
  await attach('slideshow');
  h.check('Slideshow opens Edit slideshow', await h.until(`document.querySelectorAll('#viewport .gbma-srow').length === 2`));
  await h.tap('#viewport [data-action="gbma-add-slide"]');
  await h.tap('#viewport [data-action="gbma-open-slide"][data-id="1"]');
  await h.tap('.touch-menu'); await h.until(`!!document.querySelector('.gbmenu')`);
  if (!await h.ev(`!!document.querySelector('.gbmenu [data-action="gbma-duration"]')`)) await h.tap('.gbmenu [data-action="gb-menu-more"]');
  await h.tap('[data-action="gbma-duration"]');
  await h.tap('.gbdlg [data-action="gbma-duration-pick"][data-id="2"]');
  await act('back');
  h.check('the slide keeps its duration', await h.until(`/3 secs/.test(document.querySelectorAll('#viewport .gbma-srow')[1]?.textContent || '')`));
  await act('back');
  h.check('the compose screen shows the slideshow', await h.until(`!!document.querySelector('#viewport .gbma-show')`) && await kind() === 'slideshow');
  await h.tap('#viewport .gbma-show [data-action="gbmms-send"]');
  h.check('Send puts the slideshow in the conversation', await h.until(`!!document.querySelector('#viewport .gbmms-msg [data-action="gbma-rowplay"]')`));
  await h.tap('#viewport .gbmms-msg [data-action="gbma-rowplay"]');
  h.check('its play button plays it', await h.until(`!!document.querySelector('#viewport .gbma-slideshow')`));
};

// 4.3 Messaging attachments (T13, jb-mms-attach.js): Audio with Play, Capture picture / video through the Camera, and a
// slideshow (Edit slideshow, a slide's Duration from the overflow) sent and played.
const jbMmsAttach = async h => {
  const act = a => h.ev(`(()=>{const el=document.createElement('button');el.dataset.action=${JSON.stringify(a)};document.querySelector('#viewport').firstElementChild.append(el);el.click();el.remove();return 1})()`);
  const attach = async type => { await h.tap('#viewport .mms-header [data-action="mms-attach"]'); await h.tap(`[data-action="mms-attach-type"][data-id="${type}"]`); };
  const kind = () => h.ev(`(()=>{const d=Object.values(${SAVE}.messageDrafts||{}).find(x=>x.attachment);const a=d&&d.attachment;return a?a.kind||(a.video?'video':'image'):''})()`);
  const shutter = async () => { await h.until(`!!document.querySelector('#viewport .jbcam-shutter')`); await h.sleep(600); await h.tap('#viewport .jbcam-shutter'); };
  await h.openApp('messaging');
  await h.tap('#viewport [data-action="thread"][data-id="1"]');
  await h.until(`!!document.querySelector('#viewport .mms-compose')`);
  await attach('audio');
  await h.tap('.jbma-dialog [data-action="jbma-audio-pick"][data-id="Aquila"]');
  await h.tap('.jbma-dialog [data-action="jbma-audio-ok"]');
  h.check('Audio attaches the sound', await h.until(`/Aquila/.test(document.querySelector('#viewport .jbma-audio')?.textContent || '')`) && await kind() === 'audio');
  await h.tap('#viewport .jbma-audio [data-action="jbma-view"]');
  h.check('Play plays it', await h.until(`!!document.querySelector('#viewport .jbma-slideshow')`));
  await act('back');
  await h.tap('#viewport .jbma [data-action="mms-remove-attachment"]');
  await attach('capture-picture');
  await shutter();
  h.check('the capture offers Done, Retake and Cancel', await h.until(`!!document.querySelector('#viewport [data-action="cam-review-done"]')`, 8000));
  await h.tap('#viewport [data-action="cam-review-done"]');
  h.check('Capture picture comes back with the picture', await h.until(`!!document.querySelector('#viewport .jbma-image')`, 8000) && await kind() === 'image');
  await h.tap('#viewport .jbma [data-action="mms-remove-attachment"]');
  await attach('capture-video');
  await shutter(); await h.sleep(1300); await h.tap('#viewport .jbcam-shutter');
  h.check('Capture video comes back with the video', await h.until(`!!document.querySelector('#viewport .jbma-video')`, 8000) && await kind() === 'video');
  await attach('slideshow');
  h.check('Slideshow makes the video its first slide', await h.until(`document.querySelectorAll('#viewport .jbma-srow').length === 2`));
  await h.tap('#viewport [data-action="jbma-menu"]'); await h.tap('.holo-menu [data-action="jbma-add-slide"]');
  await h.tap('#viewport [data-action="jbma-open-slide"][data-id="1"]');
  await h.tap('#viewport [data-action="jbma-menu"]'); await h.tap('.holo-menu [data-action="jbma-duration"]');
  await h.tap('.jbma-dialog [data-action="jbma-duration-pick"][data-id="2"]');
  await act('back');
  h.check('the slide keeps its duration', await h.until(`/3 secs/.test(document.querySelectorAll('#viewport .jbma-srow')[1]?.textContent || '')`));
  await act('back');
  h.check('the compose screen shows the slideshow', await h.until(`!!document.querySelector('#viewport .jbma-show')`) && await kind() === 'slideshow');
  await h.tap('#viewport .jbma-show [data-action="mms-send-now"]');
  h.check('Send puts it in the conversation', await h.until(`!!document.querySelector('#viewport .mms-message [data-action="jbma-rowplay"]')`));
  await h.tap('#viewport .mms-message [data-action="jbma-rowplay"]');
  h.check('its play button plays it', await h.until(`!!document.querySelector('#viewport .jbma-slideshow')`));
};

// 2.3.6 Car Home's Settings and the Clock's Dock settings (T15): the disclaimer on entry, Hide Status bar, Colorize
// icons, Reset to defaults; DockSettings' "Dock not found" and Dock insertion sound.
const gbCarDock = async h => {
  const menu = async (action, id) => {
    await h.tap('.touch-menu'); await h.until(`!!document.querySelector('.gbmenu')`);
    const item = `[data-action="${action}"][data-id="${id}"]`;
    if (!await h.ev(`!!document.querySelector('.gbmenu ${item}')`)) await h.tap('.gbmenu [data-action="gb-menu-more"]');
    await h.tap(item);
  };
  const prefs = async key => (await store(h, 'appPrefs'))?.[key] || {};
  const back = () => h.ev(`(()=>{const el=document.createElement('button');el.dataset.action='back';document.querySelector('#viewport').firstElementChild.append(el);el.click();el.remove();return 1})()`);
  await h.openApp('car-home');
  h.check('the disclaimer opens Car Home', await h.until(`!!document.querySelector('.ch-disclaimer')`));
  await h.tap('[data-action="ch-disclaimer-ok"]');
  await menu('gbpref-open', 'car-settings');
  h.check('Settings opens its screen', await h.until(`!!document.querySelector('#viewport [data-id="car-settings:settings.hide_statusbar"]')`));
  await h.tap('#viewport [data-id="car-settings:settings.hide_statusbar"]');
  h.check('Hide Status bar is kept', (await prefs('car-settings'))['settings.hide_statusbar'] === true);
  await h.tap('#viewport [data-action="ch-tint"]');
  await h.tap('.ch-palette [data-id="#0070ff"]');
  h.check('Colorize icons keeps the color', await store(h, 'carTint') === '#0070ff');
  await back();
  h.check('Car Home hides the status bar and tints its icons', await h.until(`document.querySelector('#screen').classList.contains('gb-fullscreen') && !!document.querySelector('#viewport .ch-cell img.ch-tint')`));
  await menu('gbpref-open', 'car-settings');
  await h.tap('#viewport [data-id="car-settings:settings.always_show_disclaimer"]');
  await h.tap('#viewport [data-action="ch-reset"]');
  await h.tap('[data-action="ch-reset-ok"]');
  h.check('Reset to defaults drops the color and the settings', await store(h, 'carTint') === undefined && !Object.keys(await prefs('car-settings')).length);
  await h.openApp('clock');
  await menu('gbpref-open', 'dock');
  h.check('Dock settings opens', await h.until(`!!document.querySelector('#viewport [data-id="dock:dock_audio"]')`));
  await h.tap('#viewport [data-id="dock:dock_audio"]');
  h.check('Audio says the dock is not found', await h.until(`/docked to configure dock audio/.test(document.querySelector('.gbdlg')?.textContent || '')`));
  await h.tap('.gbdlg [data-action="close-overlay"]');
  await h.tap('#viewport [data-id="dock:dock_sounds"]');
  h.check('Dock insertion sound is kept', (await prefs('dock')).dock_sounds === true && await h.until(`/Play sound when inserting/.test(document.querySelector('#viewport [data-id="dock:dock_sounds"]')?.textContent || '')`));
};

// Google Talk (T17). 2.3.6: Add to chat makes a group chat; Settings (gtalk_preferences.xml) keeps its values and greys
// the rows under Notifications "Off". 4.0.4: Display options, Add to chat, Friend info (nickname, Block), Talk settings
// and Blocked friends.
const gbTalk = async h => {
  const menu = async (action, id = '') => {
    await h.tap('.touch-menu'); await h.until(`!!document.querySelector('.gbmenu')`);
    const item = `[data-action="${action}"]${id ? `[data-id="${id}"]` : ''}`;
    if (!await h.ev(`!!document.querySelector('.gbmenu ${item}')`)) await h.tap('.gbmenu [data-action="gb-menu-more"]');
    await h.tap(item);
  };
  await h.openApp('talk');
  await h.tap('#viewport [data-action="tk-chat"][data-id="1"]');
  await menu('tk-add-to-chat');
  h.check('Add to chat lists the friends to invite', await h.until(`!!document.querySelector('.gbdlg [data-action="tk-invite-pick"][data-id="4"]')`));
  await h.tap('.gbdlg [data-action="tk-invite-pick"][data-id="4"]');
  h.check('the chat becomes a group chat', await h.until(`/Invitation sent to/.test(document.querySelector('#viewport .tk-history')?.textContent || '') && /,/.test(document.querySelector('#viewport .tk-who small')?.textContent || '')`) && (await store(h, 'talk23'))?.groups?.[1]?.includes('4'));
  await h.ev(`(()=>{const el=document.createElement('button');el.dataset.action='back';document.querySelector('#viewport').firstElementChild.append(el);el.click();el.remove();return 1})()`);
  await menu('gbpref-open', 'talk');
  await h.tap('#viewport [data-id="talk:gtalk-auto-login"]');
  h.check('Sign in automatically is kept', (await store(h, 'appPrefs'))?.talk?.['gtalk-auto-login'] === false);
  await h.tap('#viewport [data-id="talk:gtalk-enable-notifications"]');
  await h.tap('.gbdlg [data-action="gbpref-pick"][data-id="talk:gtalk-enable-notifications:2"]');
  h.check('Notifications Off greys its ringtone', await h.until(`document.querySelector('#viewport [data-id="talk:gtalk-text-ringtone"]')?.disabled === true`));
};
const icsTalk = async h => {
  const menu = async action => { await h.tap('#viewport [data-action="ga-menu"]'); await h.tap(`.holo-menu [data-action="${action}"]`); };
  await h.openApp('talk');
  await h.until(`!!document.querySelector('#viewport .ga-buddy')`);
  await menu('ga-talk-display');
  await h.tap('#viewport [data-action="ga-talk-sort-pick"][data-id="1"]');
  h.check('Display options sorts by name', await store(h, 'talkSort') === 1 && await h.ev(`[...document.querySelectorAll('#viewport .ga-buddy b')].map(b=>b.textContent).join('|') === [...document.querySelectorAll('#viewport .ga-buddy b')].map(b=>b.textContent).sort((a,b)=>a.localeCompare(b)).join('|')`));
  await h.tap('#viewport .ga-buddy[data-id="1"]');
  await menu('ga-talk-add-to-chat');
  await h.tap('#viewport [data-action="ga-talk-invite-pick"][data-id="2"]');
  h.check('Add to chat makes a group chat', await h.until(`/Invitation sent to/.test(document.querySelector('#viewport .ga-talk-chat')?.textContent || '')`) && (await store(h, 'talkGroups'))?.[1]?.includes('2'));
  await menu('ga-talk-info');
  await h.type('#viewport .ga-tk-nick', 'Alex M.');
  h.check('Friend info keeps the nickname', await h.until(`true`) && (await store(h, 'talkNick'))?.[1] === 'Alex M.');
  await h.tap('#viewport [data-action="ga-talk-block"]');
  h.check('Block takes the friend off the list', await h.until(`!document.querySelector('#viewport .ga-buddy[data-id="1"]')`));
  await menu('ga-talk-settings');
  await h.tap('#viewport [data-action="ga-tks-list"][data-id="gtalk-enable-notifications"]');
  await h.tap('#viewport [data-action="ga-tks-pick"][data-id="2"]');
  h.check('IM notifications Off greys its ringtone', await h.until(`document.querySelector('#viewport [data-id="gtalk-text-ringtone"]')?.disabled === true`) && (await store(h, 'talkPrefs'))?.['gtalk-enable-notifications'] === 2);
  await h.tap('#viewport [data-action="ga-tks-blocked"]');
  await h.tap('#viewport [data-action="ga-talk-unblock"][data-id="1"]');
  h.check('Blocked friends gives the friend back', await h.until(`!document.querySelector('#viewport [data-action="ga-talk-unblock"]')`) && !(await store(h, 'talkBlocked'))?.length);
};

// 2.3.6 YouTube's Settings (T20, youtube_preferences.xml): the checks and lists are kept, SafeSearch's own dialog
// title, and Clear search history empties the searches.
const gbYouTubeSettings = async h => {
  const prefs = async () => (await store(h, 'appPrefs'))?.youtube || {};
  const menu = async (action, id = '') => {
    await h.tap('.touch-menu'); await h.until(`!!document.querySelector('.gbmenu')`);
    const item = `[data-action="${action}"]${id ? `[data-id="${id}"]` : ''}`;
    if (!await h.ev(`!!document.querySelector('.gbmenu ${item}')`)) await h.tap('.gbmenu [data-action="gb-menu-more"]');
    await h.tap(item);
  };
  await h.openApp('youtube');
  await menu('yt-search-open');
  await h.type('#viewport .yt-search input', 'nexus');
  await h.ev(`document.querySelector('#viewport .yt-search').requestSubmit()`);
  h.check('a search is kept for the history', (await store(h, 'youtube23'))?.searches?.[0] === 'nexus');
  await menu('gbpref-open', 'youtube');
  h.check('Settings opens', await h.until(`!!document.querySelector('#viewport [data-id="youtube:default_hq"]')`));
  await h.tap('#viewport [data-id="youtube:default_hq"]');
  await h.tap('#viewport [data-id="youtube:subtitles_size"]');
  await h.tap('.gbdlg [data-id="youtube:subtitles_size:2"]');
  await h.tap('#viewport [data-id="youtube:safe_search"]');
  h.check('SafeSearch has its own dialog title', await h.until(`/^SafeSearch$/.test(document.querySelector('.gbdlg .gbdlg-title, .gbdlg h3, .gbdlg header')?.textContent.trim() || '')`));
  await h.tap('.gbdlg [data-id="youtube:safe_search:2"]');
  const p = await prefs();
  h.check('the values are kept', p.default_hq === true && p.subtitles_size === 2 && p.safe_search === 2, JSON.stringify(p));
  await h.tap('#viewport [data-id="youtube:clear_history"]');
  h.check('Clear search history empties it', !(await store(h, 'youtube23'))?.searches?.length);
};

// 4.0.4 YouTube 3.5.5 (T20): Search with its kept queries and time filter, the watch page's Add to (Watch later,
// a new playlist), Share into Gmail, Copy URL, the uploader's channel and Subscribe, Record into the upload form (the
// upload policy asked once) with the upload opening from Uploads, and Settings' General / Search pages.
const icsYouTube = async h => {
  const yt = async () => (await store(h, 'gaYt')) || {};
  const menu = async action => { await h.tap('#viewport [data-action="ga-menu"]'); await h.tap(`.holo-menu [data-action="${action}"]`); };
  const toast = re => h.until(`${re}.test(document.querySelector('.toast')?.textContent || '')`, 4000);
  await h.openApp('youtube');
  await h.until(`!!document.querySelector('#viewport .ga-yt-row')`);
  await h.tap('#viewport .ga-yt-bar [data-action="ga-yt-search"]');
  await h.type('#viewport .ga-yt-sv input', 'galaxy nexus');
  await h.key('Enter'); await h.ev(`document.querySelector('#viewport .ga-yt-sv')?.requestSubmit()`);
  h.check('Search lists the matching video', await h.until(`document.querySelectorAll('#viewport .ga-yt-row').length === 1 && !!document.querySelector('#viewport .ga-yt-row[data-id="v1"]')`));
  h.check('the query is kept', (await yt()).searches?.[0] === 'galaxy nexus');
  await h.tap('#viewport .ga-yt-spin');
  await h.tap('#viewport [data-action="ga-yt-time"][data-id="0"]');
  h.check('the Today filter leaves no 2011 video', await h.until(`/No videos found/.test(document.querySelector('#viewport .ga-yt-none')?.textContent || '')`));
  await h.tap('#viewport .ga-yt-bar [data-action="ga-yt-search"]');
  await h.type('#viewport .ga-yt-sv input', 'gal');
  h.check('the SearchView suggests the kept query', await h.until(`[...document.querySelectorAll('#viewport .ga-yt-suggest')].some(b => b.textContent === 'galaxy nexus')`));
  await h.tap('#viewport .ga-yt-suggest[data-id="galaxy nexus"]');
  await h.until(`!!document.querySelector('#viewport .ga-yt-row[data-id="v1"]')`);
  await h.tap('#viewport .ga-yt-row[data-id="v1"]');
  h.check('the video opens', await h.until(`!!document.querySelector('#viewport .ga-yt-info')`));
  await h.tap('#viewport [data-action="ga-yt-addto"]');
  await h.tap('#viewport [data-action="ga-yt-addto-pick"][data-id="later"]');
  h.check('Add to › Watch later', await toast('/Watch Later playlist/') && (await yt()).later?.[0] === 'v1');
  await h.tap('#viewport [data-action="ga-yt-addto"]');
  await h.tap('#viewport [data-action="ga-yt-addto-pick"][data-id="later"]');
  h.check('a second time it is already there', await toast('/already in your Watch Later/') && (await yt()).later.length === 1);
  await h.tap('#viewport [data-action="ga-yt-addto"]');
  await h.tap('#viewport [data-action="ga-yt-addto-pick"][data-id="new"]');
  await h.type('#viewport [data-ga-yt-newlist]', 'Phones');
  await h.tap('#viewport [data-action="ga-yt-newlist-ok"]');
  h.check('New playlist takes the video', await toast('/Video added to Phones playlist/') && (await yt()).playlists?.[0]?.videos?.[0] === 'v1');
  await menu('ga-yt-copy');
  h.check('Copy URL', await toast('/URL copied/'));
  await h.tap('#viewport [data-action="ga-yt-share"]');
  await h.tap('#viewport [data-action="ga-yt-share-to"][data-id="gmail"]');
  h.check('Share writes the link into Gmail', await h.until(`/youtube\\.com\\/watch\\?v=/.test(document.querySelector('#viewport .g4-form textarea')?.value || '') && /Galaxy Nexus/.test(document.querySelector('#viewport .g4-form [name=subject]')?.value || '')`));
  await h.openApp('youtube');
  await h.until(`!!document.querySelector('#viewport .ga-yt-row')`);
  await h.tap('#viewport .ga-yt-row[data-id="v2"]');
  await h.tap('#viewport .ga-yt-channel');
  h.check('the uploader\'s channel lists its video', await h.until(`/Droid Corner/.test(document.querySelector('#viewport .ga-yt-chhead')?.textContent || '') && !!document.querySelector('#viewport .ga-yt-row[data-id="v2"]')`));
  await menu('ga-yt-subscribe');
  await h.tap('#viewport [data-action="ga-yt-subscribe-pick"][data-id="0"]');
  h.check('Subscribe › All activity', await toast("/Subscribed to Droid Corner's activity/") && (await yt()).subs?.['Droid Corner'] === 'activity');
  await h.key('Escape'); await h.key('Escape');
  h.check('Back returns through the watch page to Home', await h.until(`!!document.querySelector('#viewport .ga-yt-tabs')`));
  // Record: the camcorder, then the upload form.
  await h.tap('#viewport [data-action="ga-yt-record"]');
  h.check('Record opens the camcorder', await h.until(`!!document.querySelector('#viewport [data-action="shoot"]')`));
  await h.tap('#viewport [data-action="shoot"]'); await h.sleep(1300); await h.tap('#viewport [data-action="shoot"]');
  h.check('the clip comes back to Upload video', await h.until(`!!document.querySelector('#viewport .ga-yt-upload .ga-yt-upframe')`));
  await h.type('#viewport [data-ga-yt-up="title"]', 'Trail clip');
  await h.tap('#viewport .ga-yt-privacy');
  await h.tap('#viewport [data-action="ga-yt-privacy"][data-id="1"]');
  await h.tap('#viewport .ga-yt-upbuttons button');
  h.check('the first upload asks the upload policy', await h.until(`!!document.querySelector('#viewport [data-action="ga-yt-policy-ok"]')`));
  await h.tap('#viewport [data-action="ga-yt-policy-ok"]');
  const up = (await yt()).uploads?.[0];
  h.check('the upload is kept', up?.title === 'Trail clip' && up.privacy === 1 && (await store(h, 'gaYtPrefs'))?.upload_policy === 0);
  h.check('its notification is posted', (await store(h, 'notifications')).some(n => /uploaded successfully/.test(n.title)));
  h.check('the clip is in the Gallery', (await store(h, 'photos')).some(p => p.video && p.id === up.photo));
  await h.tap('#viewport [data-action="ga-yt-tab"][data-id="Account"]');
  await h.tap('#viewport .ga-yt-stack[data-id="uploads"]');
  await h.tap(`#viewport .ga-yt-row[data-id="${up.id}"]`);
  h.check('the upload opens from Uploads', await h.until(`/Trail clip/.test(document.querySelector('#viewport .ga-yt-info h3')?.textContent || '')`));
  await h.key('Escape'); await h.key('Escape');
  await h.tap('#viewport .ga-yt-stack[data-id="playlists"]');
  await h.tap('#viewport .ga-yt-stack[data-id^="pl:"]');
  h.check('the playlist holds its video', await h.until(`/Phones/.test(document.querySelector('#viewport .ga-yt-plhead')?.textContent || '') && !!document.querySelector('#viewport .ga-yt-row[data-id="v1"]')`));
  await h.key('Escape'); await h.key('Escape');
  await h.tap('#viewport .ga-yt-stack[data-id="subscriptions"]');
  h.check('Subscriptions lists the channel', await h.until(`/Droid Corner's activity/.test(document.querySelector('#viewport .ga-yt-sub')?.textContent || '')`));
  await h.key('Escape');
  // Settings: General and Search.
  await menu('ga-yt-settings');
  await h.tap('#viewport [data-action="ga-yts-page"][data-id="general"]');
  await h.tap('#viewport [data-id="default_hq"]');
  await h.tap('#viewport [data-id="subtitles_size"]');
  await h.tap('#viewport [data-action="ga-yts-pick"][data-id="2"]');
  await h.key('Escape');
  await h.tap('#viewport [data-action="ga-yts-page"][data-id="search"]');
  await h.tap('#viewport [data-id="safe_search"]');
  h.check('SafeSearch has its own dialog title', await h.until(`document.querySelector('#viewport .mps-dialog h3')?.textContent === 'SafeSearch'`));
  await h.tap('#viewport [data-action="ga-yts-pick"][data-id="2"]');
  await h.tap('#viewport [data-id="clear_history"]');
  await h.tap('#viewport [data-action="ga-yts-clear-ok"]');
  const p = await store(h, 'gaYtPrefs');
  h.check('the settings are kept', p.default_hq === true && p.subtitles_size === 2 && p.safe_search === 2, JSON.stringify(p));
  h.check('Clear search history empties the queries', !(await yt()).searches.length);
};

// 4.3 YouTube 4.5.17 (T20): Add to (Watch later, a new playlist), Like then Dislike, Copy URL, Share into Gmail, and
// Settings' General / Search pages (a search is kept unless Never remember history is on).
const jbYouTube = async h => {
  const yt = async () => (await store(h, 'yt4')) || {};
  const menu = async (action, id) => { await h.tap('#viewport [data-action="sa-menu"]'); await h.tap(`.holo-menu [data-action="${action}"]${id ? `[data-id="${id}"]` : ''}`); };
  const toast = re => h.until(`${re}.test(document.querySelector('.toast')?.textContent || '')`, 4000);
  await h.openApp('youtube');
  await h.tap('#viewport [data-action="yt-search-open"]');
  await h.type('#viewport .yt-sv input', 'nexus');
  await h.ev(`document.querySelector('#viewport .yt-sv').requestSubmit()`);
  h.check('a search is kept', await h.until(`true`) && (await yt()).searches?.[0] === 'nexus');
  await h.tap('#viewport .sa-yt-item[data-id="v1"]');
  h.check('the video opens', await h.until(`!!document.querySelector('#viewport .sa-yt-player')`));
  await h.tap('#viewport [data-action="yt4-addto"]');
  await h.tap('#viewport [data-action="yt4-addto-pick"][data-id="later"]');
  h.check('Add to › Watch later', await toast('/Watch Later playlist/') && (await yt()).later?.[0] === 'v1');
  await h.tap('#viewport [data-action="yt4-addto"]');
  await h.tap('#viewport [data-action="yt4-addto-pick"][data-id="later"]');
  h.check('a second time it is already there', await toast('/already in your Watch Later/') && (await yt()).later.length === 1);
  await h.tap('#viewport [data-action="yt4-addto"]');
  await h.tap('#viewport [data-action="yt4-addto-pick"][data-id="new"]');
  await h.type('#viewport [data-yt4-newlist]', 'Phones');
  await h.tap('#viewport [data-action="yt4-newlist-ok"]');
  h.check('New playlist takes the video', await toast('/Video added to Phones playlist/') && (await yt()).playlists?.[0]?.videos?.[0] === 'v1');
  await h.tap('#viewport [data-action="yt4-addto"]');
  h.check('the playlist is offered next time', await h.until(`[...document.querySelectorAll('#viewport [data-action="yt4-addto-pick"]')].some(b => b.textContent === 'Phones')`));
  await h.key('Escape');
  await menu('yt4-rate', 'like');
  h.check('Like', await toast('/You like this video/') && (await yt()).ratings?.v1 === 'like');
  await menu('yt4-rate', 'dislike');
  h.check('Dislike replaces it', await toast('/You dislike this video/') && (await yt()).ratings?.v1 === 'dislike');
  await menu('yt4-copy');
  h.check('Copy URL', await toast('/URL copied/'));
  await h.tap('#viewport [data-action="yt4-share"]');
  await h.tap('#viewport [data-action="yt4-share-to"][data-id="gmail"]');
  const draft = (await store(h, 'gmailbox'))?.[0];
  h.check('Share writes the link into Gmail', /Nexus 4/.test(draft?.subject || '') && /youtube\.com\/watch\?v=/.test(draft?.body || ''), JSON.stringify(draft?.subject));
  await h.openApp('youtube');
  await menu('yt4-settings');
  await h.tap('#viewport [data-action="yt4-page"][data-id="general"]');
  await h.tap('#viewport [data-id="default_hq"]');
  await h.tap('#viewport [data-id="country"]');
  await h.tap('#viewport [data-action="yt4-pref-pick"][data-id="HU"]');
  await h.key('Escape');
  await h.tap('#viewport [data-action="yt4-page"][data-id="search"]');
  await h.tap('#viewport [data-id="safe_search"]');
  h.check('SafeSearch has its own dialog title', await h.until(`document.querySelector('#viewport .mps-dialog h3')?.textContent === 'SafeSearch'`));
  await h.tap('#viewport [data-action="yt4-pref-pick"][data-id="2"]');
  await h.tap('#viewport [data-id="clear_history"]');
  await h.tap('#viewport [data-action="yt4-clear-ok"]');
  h.check('Clear search history empties the queries', !(await yt()).searches.length);
  await h.tap('#viewport [data-id="no_search_history"]');
  const p = await store(h, 'yt4Prefs');
  h.check('the settings are kept', p.default_hq === true && p.country === 'HU' && p.safe_search === '2' && p.no_search_history === true, JSON.stringify(p));
  await h.key('Escape'); await h.key('Escape');
  await h.tap('#viewport [data-action="yt-search-open"]');
  await h.type('#viewport .yt-sv input', 'jelly');
  await h.ev(`document.querySelector('#viewport .yt-sv').requestSubmit()`);
  h.check('Never remember history keeps no search', await h.until(`!!document.querySelector('#viewport .yt-filters')`) && !(await yt()).searches.length);
};

// 4.4.4 YouTube 5.2.27 (T20): Settings from the overflow, General / Search kept, the licenses page, Back out.
const kkYouTubeSettings = async h => {
  await h.openApp('youtube');
  await h.tap('#viewport [data-action="yt-search-open"]');
  await h.type('#viewport .yt-sv input', 'nexus');
  await h.ev(`document.querySelector('#viewport .yt-sv').requestSubmit()`);
  h.check('a search is kept', await h.until(`true`) && (await store(h, 'yt5Searches'))?.[0] === 'nexus');
  await h.key('Escape');
  await h.until(`!document.querySelector('#viewport .yt-sv')`);
  await h.tap('#viewport [data-action="sa-menu"]');
  await h.tap('.holo-menu [data-action="yt5-settings"]');
  h.check('Settings lists its headers', await h.until(`document.querySelectorAll('#viewport [data-action="yt5-page"]').length === 4`));
  await h.tap('#viewport [data-action="yt5-page"][data-id="general"]');
  await h.tap('#viewport [data-id="video_notifications_enabled"]');
  await h.tap('#viewport [data-id="country"]');
  await h.tap('#viewport [data-action="yt5-pref-pick"][data-id="GB"]');
  await h.key('Escape');
  await h.tap('#viewport [data-action="yt5-page"][data-id="search"]');
  await h.tap('#viewport [data-id="safety_mode"]');
  h.check('SafeSearch offers Don\'t filter and Strict', await h.until(`document.querySelector('#viewport .mps-dialog h3')?.textContent === 'SafeSearch' && document.querySelectorAll('#viewport [data-action="yt5-pref-pick"]').length === 2`));
  await h.tap('#viewport [data-action="yt5-pref-pick"][data-id="1"]');
  await h.tap('#viewport [data-id="clear_history"]');
  await h.tap('#viewport [data-action="yt5-clear-ok"]');
  const p = await store(h, 'yt5Prefs');
  h.check('the settings are kept', p.video_notifications_enabled === false && p.country === 'GB' && p.safety_mode === '1', JSON.stringify(p));
  h.check('Clear search history empties the queries', !(await store(h, 'yt5Searches'))?.length);
  await h.key('Escape');
  await h.tap('#viewport [data-action="yt5-page"][data-id="about"]');
  await h.tap('#viewport [data-id="open_source_licenses"]');
  h.check('Open source licenses shows licenses.html', await h.until(`!!document.querySelector('#viewport .yt5-licenses iframe')`));
  await h.key('Escape'); await h.key('Escape'); await h.key('Escape');
  h.check('Back leaves Settings', await h.until(`!document.querySelector('#viewport .yt5-prefs') && !!document.querySelector('#viewport .yt5-feed')`));
};

// 5.1.1 YouTube 10.03.5 (T20): Settings › General, Captions (the Custom style's options and the preview), Privacy's
// clears, Pause search history, About's licenses.
const lpYouTubeSettings = async h => {
  await h.openApp('youtube');
  await h.tap('#viewport .yt10-bar [data-action="yt-search-open"]');
  await h.type('#viewport .yt-sv input, #viewport input[name="query"]', 'nexus');
  await h.ev(`document.querySelector('#viewport form[data-form="yt-search"]').requestSubmit()`);
  h.check('a search is kept', await h.until(`true`) && (await store(h, 'yt10Searches'))?.[0] === 'nexus');
  await h.key('Escape'); await h.sleep(300);
  if (await h.ev(`!!document.querySelector('#viewport form[data-form="yt-search"]')`)) await h.key('Escape');
  await h.tap('#viewport [data-action="sa-menu"]');
  await h.tap('.holo-menu [data-action="yt10-settings"]');
  h.check('Settings lists its headers', await h.until(`document.querySelectorAll('#viewport [data-action="yt10-page"]').length === 5`));
  await h.tap('#viewport [data-action="yt10-page"][data-id="general"]');
  await h.tap('#viewport [data-id="innertube_safety_mode_enabled"]');
  await h.tap('#viewport [data-id="upload_policy"]');
  await h.tap('#viewport [data-action="yt10-pref-pick"][data-id="any"]');
  await h.key('Escape');
  await h.tap('#viewport [data-action="yt10-page"][data-id="captions"]');
  h.check('Captions has no custom options for a preset style', await h.until(`!!document.querySelector('#viewport .yt10-preview') && !document.querySelector('#viewport [data-id="subtitles_font"]')`));
  await h.tap('#viewport [data-id="subtitles_style"]');
  await h.tap('#viewport [data-action="yt10-pref-pick"][data-id="4"]');
  h.check('the Custom style shows its options, Edge color off without an edge', await h.until(`!!document.querySelector('#viewport [data-id="subtitles_font"]') && document.querySelector('#viewport [data-id="subtitles_edge_color"]')?.disabled === true`));
  await h.tap('#viewport [data-id="subtitles_text_color"]');
  await h.tap('#viewport [data-action="yt10-pref-pick"][data-id="-256"]');
  h.check('the preview takes the text color', await h.until(`/rgb\\(255, 255, 0\\)/.test(getComputedStyle(document.querySelector('#viewport .yt10-window>span')).color)`));
  await h.key('Escape');
  await h.tap('#viewport [data-action="yt10-page"][data-id="privacy"]');
  await h.tap('#viewport [data-id="clear_search_history"]');
  await h.tap('#viewport [data-action="yt10-clear-ok"]');
  h.check('Clear search history empties the queries', !(await store(h, 'yt10Searches'))?.length);
  await h.tap('#viewport [data-id="no_search_history"]');
  const p = await store(h, 'yt10Prefs');
  h.check('the settings are kept', p.innertube_safety_mode_enabled === true && p.upload_policy === 'any' && p.subtitles_style === '4' && p.subtitles_text_color === '-256' && p.no_search_history === true, JSON.stringify(p));
  await h.key('Escape');
  await h.tap('#viewport [data-action="yt10-page"][data-id="about"]');
  await h.tap('#viewport [data-id="open_source_licenses"]');
  h.check('Open source licenses shows licenses.html', await h.until(`!!document.querySelector('#viewport .yt10-licenses iframe')`));
  await h.key('Escape'); await h.key('Escape'); await h.key('Escape');
  h.check('Back leaves Settings', await h.until(`!document.querySelector('#viewport .yt10-prefs')`));
};
// 4.0.4 Google Search 1.4.1 (T25): typing lists the searchable items' finds; Searchable items turns a source off and
// its finds go, and a find opens its app.
const icsSearchableItems = async h => {
  await h.openApp('search');
  await h.type('#viewport [data-ga-qsb]', 'alex');
  h.check('People finds the contact', await h.until(`[...document.querySelectorAll('#viewport .ga-qsb-hit')].some(b => /Alex Morgan/.test(b.textContent))`));
  await h.type('#viewport [data-ga-qsb]', 'coffee');
  h.check('Messaging is off by default', await h.until(`!document.querySelector('#viewport .ga-qsb-hit')`));
  await h.tap('#viewport [data-action="ga-qsb-sources"]');
  h.check('Searchable items lists the sources', await h.until(`document.querySelectorAll('#viewport .ga-qsb-source').length === 8`));
  await h.tap('#viewport .ga-qsb-source[data-id="messaging"]');
  await h.tap('#viewport .ga-qsb-source[data-id="people"]');
  h.check('the choices are kept', JSON.stringify(await store(h, 'gaQsbSources')) === JSON.stringify({messaging: true, people: false}));
  await h.key('Escape');
  await h.type('#viewport [data-ga-qsb]', 'coffee');
  h.check('Messaging now finds the message', await h.until(`[...document.querySelectorAll('#viewport .ga-qsb-hit')].some(b => /coffee/.test(b.textContent))`));
  await h.type('#viewport [data-ga-qsb]', 'alex');
  h.check('People off finds no contact', await h.until(`![...document.querySelectorAll('#viewport .ga-qsb-hit')].some(b => /Alex Morgan/.test(b.textContent))`));
  await h.type('#viewport [data-ga-qsb]', 'calc');
  await h.tap('#viewport .ga-qsb-hit[data-action="ga-qsb-app"][data-id="calculator"]');
  h.check('an app find opens the app', await h.until(`!!document.querySelector('#viewport .calculator, #viewport [class*="calc"]')`));
};
// 4.3 Google Search 2.5 (T25): the settings headers open their pages; a Now card switch hides the card, a notification
// level, places, a team and a stock, Voice and Phone search choices are kept; Location services opens Google Settings.
const jbSearchSettings = async h => {
  const gs = async () => (await store(h, 'gsearch')) || {};
  await h.openApp('google-search');
  h.check('the Weather card shows', await h.until(`!!document.querySelector('#viewport .vn-weather')`));
  await h.ev(`(()=>{const el=document.createElement('button');el.dataset.action='gel-overview-settings';document.querySelector('#viewport').firstElementChild.append(el);el.click();el.remove()})()`);
  await h.tap('#viewport [data-action="gsp-open"][data-id="now"]');
  h.check('Google Now lists the cards', await h.until(`document.querySelectorAll('#viewport .gms-switch[data-action="gsp-card"]').length === 16`));
  await h.tap('#viewport .gms-switch[data-action="gsp-card"][data-id="weather"]');
  h.check('the Weather switch is kept off', (await gs()).cards?.weather === false);
  await h.key('Escape');
  await h.tap('#viewport [data-action="gsp-open"][data-id="notifications"]');
  await h.tap('#viewport [data-action="gsp-list"][data-id="notif:tickets"]');
  await h.tap('#viewport [data-action="gsp-pick"][data-id="0"]');
  h.check('a notification level is kept', (await gs()).prefs?.['notif:tickets'] === '0' && await h.until(`/Off/.test(document.querySelector('#viewport [data-id="notif:tickets"]')?.textContent || '')`));
  await h.key('Escape');
  await h.tap('#viewport [data-action="gsp-open"][data-id="mystuff"]');
  await h.tap('#viewport [data-action="gsp-page"][data-id="places"]');
  await h.tap('#viewport [data-action="gsp-edit"][data-id="home"]');
  await h.type('#viewport [data-gsp-input]', '1600 Amphitheatre Pkwy');
  await h.tap('#viewport [data-action="gsp-edit-ok"]');
  h.check('Home is kept', (await gs()).places?.home === '1600 Amphitheatre Pkwy');
  await h.key('Escape');
  await h.tap('#viewport [data-action="gsp-page"][data-id="stocks"]');
  await h.tap('#viewport [data-action="gsp-edit"][data-id="stocks"]');
  await h.type('#viewport [data-gsp-input]', 'goog');
  await h.tap('#viewport [data-action="gsp-edit-ok"]');
  h.check('a stock is added', (await gs()).stocks?.[0] === 'GOOG');
  await h.key('Escape');
  h.check('My stuff shows the stock', await h.until(`/GOOG/.test(document.querySelector('#viewport [data-id="stocks"]')?.textContent || '')`));
  await h.key('Escape');
  await h.tap('#viewport [data-action="gsp-open"][data-id="voice"]');
  await h.tap('#viewport [data-action="gsp-list"][data-id="ttsMode"]');
  await h.tap('#viewport [data-action="gsp-pick"][data-id="always"]');
  await h.tap('#viewport [data-action="gsp-check"][data-id="hotwordDetector"]');
  await h.key('Escape');
  await h.tap('#viewport [data-action="gsp-open"][data-id="phone"]');
  await h.tap('#viewport [data-action="gsp-check"][data-id="source:chrome"]');
  await h.key('Escape');
  await h.tap('#viewport [data-action="gsp-open"][data-id="privacy"]');
  h.check('the account is named', await h.until(`/jellybean\\.demo@gmail\\.com/.test(document.querySelector('#viewport [data-id="account"]')?.textContent || '')`));
  await h.tap('#viewport [data-action="gsp-list"][data-id="safe_search_settings"]');
  await h.tap('#viewport [data-action="gsp-pick"][data-id="active"]');
  const p = (await gs()).prefs;
  h.check('Voice, Phone search and SafeSearch are kept', p.ttsMode === 'always' && p.hotwordDetector === false && p['source:chrome'] === false && p.safe_search_settings === 'active', JSON.stringify(p));
  await h.tap('#viewport [data-action="gsp-location"]');
  h.check('Location services opens Google Settings\' Location', await h.until(`!!document.querySelector('#viewport .sa-gsettings, #viewport [class*="gms"]')`));
  await h.openApp('google-search');
  h.check('the Weather card is gone', await h.until(`!!document.querySelector('#viewport .vn-cards') && !document.querySelector('#viewport .vn-weather')`));
};
// 4.4.4 Google Search 3.3 (T25): the settings headers open their pages and keep their choices; Location services and
// Google Settings' Play Games open their apps.
const kkSearchSettings = async h => {
  const prefs = async () => (await store(h, 'gsearch'))?.prefs || {};
  const open = async () => { await h.openApp('google-search'); await h.ev(`(()=>{const el=document.createElement('button');el.dataset.action='gel-overview-settings';document.querySelector('#viewport').firstElementChild.append(el);el.click();el.remove()})()`); };
  await open();
  await h.tap('#viewport [data-action="ksp-open"][data-id="phone"]');
  h.check('Phone search lists the sources', await h.until(`document.querySelectorAll('#viewport .ksp-source').length === 7`));
  await h.tap('#viewport [data-action="ksp-check"][data-id="source:drive"]');
  await h.key('Escape');
  await h.tap('#viewport [data-action="ksp-open"][data-id="voice"]');
  await h.tap('#viewport [data-action="ksp-page"][data-id="hotword"]');
  await h.tap('#viewport [data-action="ksp-check"][data-id="hotwordDetector"]');
  h.check('Hotword off greys Listen on home screen', await h.until(`document.querySelector('#viewport [data-id="homescreen_hotword"]')?.disabled === true`));
  await h.key('Escape');
  await h.tap('#viewport [data-action="ksp-list"][data-id="ttsMode"]');
  await h.tap('#viewport [data-action="ksp-pick"][data-id="never"]');
  await h.key('Escape');
  await h.tap('#viewport [data-action="ksp-open"][data-id="notifications"]');
  await h.tap('#viewport [data-action="ksp-list"][data-id="notificationOverride"]');
  await h.tap('#viewport [data-action="ksp-pick"][data-id="1"]');
  await h.key('Escape');
  await h.tap('#viewport [data-action="ksp-open"][data-id="privacy"]');
  await h.tap('#viewport [data-action="ksp-check"][data-id="safe_search"]');
  const p = await prefs();
  h.check('the choices are kept', p['source:drive'] === true && p.hotwordDetector === false && p.ttsMode === 'never' && p.notificationOverride === '1' && p.safe_search === true, JSON.stringify(p));
  await h.tap('#viewport [data-action="ksp-location"]');
  h.check('Location services opens Google Settings\' Location', await h.until(`!!document.querySelector('#viewport [class*="gms"]')`));
  await h.openApp('google-settings');
  await h.tap('#viewport [data-action="gs-play-games"]');
  h.check('Play Games opens the Games app', await h.until(`!!document.querySelector('#viewport [class*="games"], #viewport [class*="pg"]')`));
};
// 5.1.1 Google Search 4.1 (T25): the header list of 4.1.29 and its pages; Show cards off empties the Google page.
const lpSearchSettings = async h => {
  const prefs = async () => (await store(h, 'gsearch'))?.prefs || {};
  await h.openApp('google-search');
  h.check('the Google page has cards', await h.until(`!!document.querySelector('#viewport .gnow-card, #viewport .gnow-weather, #viewport .gnow-cards > section')`));
  await h.ev(`(()=>{const el=document.createElement('button');el.dataset.action='gel-overview-settings';document.querySelector('#viewport').firstElementChild.append(el);el.click();el.remove()})()`);
  h.check('Settings lists the five headers', await h.until(`document.querySelectorAll('#viewport [data-action="lsp-page"]').length === 5`));
  await h.tap('#viewport [data-action="lsp-page"][data-id="privacy"]');
  await h.tap('#viewport [data-action="lsp-toggle"][data-id="safe_search"]');
  await h.key('Escape');
  await h.tap('#viewport [data-action="lsp-page"][data-id="language"]');
  await h.tap('#viewport [data-action="lsp-set"][data-id="search_language:hu-HU"]');
  await h.key('Escape');
  await h.tap('#viewport [data-action="lsp-page"][data-id="voice"]');
  await h.tap('#viewport [data-action="lsp-page"][data-id="hotword"]');
  await h.tap('#viewport [data-action="lsp-toggle"][data-id="voiceEverywhereEnabled"]');
  h.check('From any screen enables Personal results', await h.until(`document.querySelector('#viewport [data-id="hotword_from_lock_screen"]')?.disabled === false`));
  await h.key('Escape'); await h.key('Escape');
  await h.tap('#viewport [data-action="lsp-page"][data-id="phone"]');
  await h.tap('#viewport [data-action="lsp-source"][data-id="drive"]');
  await h.key('Escape');
  const p = await prefs();
  h.check('the choices are kept', p.safe_search === true && p.search_language === 'hu-HU' && p.voiceEverywhereEnabled === true && p['source:drive'] === true, JSON.stringify(p));
  await h.tap('#viewport [data-action="lsp-page"][data-id="cards"]');
  await h.tap('#viewport [data-action="lsp-cards"]');
  h.check('Show cards off greys the card notifications', (await store(h, 'googleNowOn')) === false && await h.until(`document.querySelector('#viewport [data-id="notificationOverride"]')?.disabled === true`));
  await h.key('Escape'); await h.key('Escape');
  h.check('the Google page has no cards', await h.until(`!!document.querySelector('#viewport .gnow-cards') && !document.querySelector('#viewport .gnow-cards > section')`));
  await h.openApp('google-settings');
  await h.tap('#viewport [data-action="gs-play-games"]');
  h.check('Google Settings › Play Games opens the Games app', await h.until(`!document.querySelector('#viewport .sa-gsettings6')`));
};
// 4.0.4 Navigation and Places (T28): the pickers' empty texts, then a contact's address and a starred place drive there;
// Places' categories and search look through the stored places, a find opens on the map, Back returns to the picker.
const icsNavPlaces = async h => {
  await h.openApp('navigation');
  await h.tap('#viewport .nav-tile[data-id="contacts"]');
  h.check('Contacts without addresses says so', await h.until(`/contacts with addresses/.test(document.querySelector('#viewport .nav-pick-empty')?.textContent || '')`));
  await h.key('Escape');
  h.check('Back returns to the tiles', await h.until(`!!document.querySelector('#viewport .nav-tile')`));
  // A contact with an address and two places Maps keeps (one starred, one searched).
  await h.ev(`(()=>{const k='android-time-machine-ics-v1';const d=JSON.parse(localStorage.getItem(k)||'{}');d.contacts=[{id:1,name:'Alex Morgan',phone:'202-555-0148',email:'alex@example.com',postals:[{type:'home',value:'1600 Amphitheatre Pkwy'}]},{id:2,name:'Sam Rivera',phone:'202-555-0192',email:'sam@example.com'},{id:3,name:'Taylor Lee',phone:'202-555-0116',email:'taylor@example.com'},{id:4,name:'Mom',phone:'202-555-0107',email:'mom@example.com'}];d.mapsStarred=['Blue Bottle Coffee'];d.mapsHistory=['Computer History Museum'];localStorage.setItem(k,JSON.stringify(d));return true})()`);
  h.check('reloads', await h.reload());
  await h.openApp('navigation');
  await h.tap('#viewport .nav-tile[data-id="contacts"]');
  await h.tap('#viewport .nav-pick-row[data-id="1600 Amphitheatre Pkwy"]');
  h.check('a contact address starts navigation', await h.until(`!!document.querySelector('#viewport .mr-nav')`));
  await h.ev(`(()=>{const el=document.createElement('button');el.dataset.action='home';document.querySelector('#viewport').firstElementChild.append(el);el.click();el.remove()})()`);
  await h.openApp('local');
  await h.tap('#viewport .loc-cats [data-id="Coffee"]');
  h.check('Coffee finds the starred café', await h.until(`[...document.querySelectorAll('#viewport .loc-hit')].some(b => /Blue Bottle Coffee/.test(b.textContent))`));
  await h.key('Escape');
  await h.tap('#viewport .loc-cats [data-id="Hotels"]');
  h.check('Hotels finds nothing', await h.until(`!!document.querySelector('#viewport .loc-results') && !document.querySelector('#viewport .loc-hit')`));
  await h.key('Escape');
  await h.tap('#viewport [data-action="xa-loc-search"]');
  await h.type('#viewport .loc-sv input', 'museum');
  await h.ev(`document.querySelector('#viewport .loc-sv').requestSubmit()`);
  await h.tap('#viewport .loc-hit[data-id="Computer History Museum"]');
  h.check('a find opens on the map', await h.until(`!!document.querySelector('#viewport .sa-map, #viewport svg.sa-map')`));
};
// 5.1.1 Hangouts 2.5 and Messenger (T32): Settings keep their choices; People & options mutes and blocks (Blocked people
// unblocks); a muted chat's answer posts no notification; Add people starts a named group Hangout; Messenger's People &
// options turns a conversation's notifications off and Block archives it.
const lpHangoutsOptions = async h => {
  const act = (action, id = '') => h.ev(`(()=>{const el=document.createElement('button');el.dataset.action=${JSON.stringify(action)};el.dataset.id=${JSON.stringify(id)};document.querySelector('#viewport').firstElementChild.append(el);el.click();el.remove()})()`);
  await h.openApp('hangouts');
  await h.tap('#viewport [data-action="hg-drawer"]');
  await h.tap('[data-action="hgp-open"][data-id="settings"]');
  h.check('Settings lists the account', await h.until(`!!document.querySelector('#viewport .hgp-row[data-id="account"]')`));
  await h.tap('#viewport .hgp-row[data-id="account"]');
  h.check('the account has its settings', await h.until(`document.querySelectorAll('#viewport .hgp-row').length >= 10 && !!document.querySelector('#viewport .hgp-cat')`));
  await h.tap('#viewport .hgp-row[data-id="lastSeen"]');
  await h.tap('#viewport .hgp-row[data-id="acl"]');
  await h.tap('#viewport .hgp-row[data-id="acl:public"]');
  await h.tap('#viewport .hgp-choice[data-id="RING"]');
  h.check('Everyone Else can contact directly', await h.until(`/directly/.test(document.querySelector('#viewport .hgp-row[data-id="acl:public"] small')?.textContent || '')`));
  await h.key('Escape');
  await h.tap('#viewport .hgp-row[data-id="notify:chat"]');
  await h.tap('#viewport .hgp-row[data-id="chatOn"]');
  h.check('Notifications off greys Sound and Vibrate', await h.until(`document.querySelector('#viewport .hgp-row[data-id="tone:chat"]')?.disabled === true && document.querySelector('#viewport .hgp-row[data-id="chatVibrate"]')?.disabled === true`));
  await h.tap('#viewport .hgp-row[data-id="chatOn"]');
  await h.tap('#viewport .hgp-row[data-id="tone:chat"]');
  const tone = await h.ev(`document.querySelectorAll('#viewport .hgp-choice')[3].textContent`);
  await h.tap('#viewport .hgp-choice:nth-child(4)');
  await h.tap('#viewport [data-action="hgp-tone-ok"]');
  h.check('the chosen sound is the summary', await h.until(`document.querySelector('#viewport .hgp-row[data-id="tone:chat"] small')?.textContent === ${JSON.stringify(tone)}`));
  const p = await store(h, 'hgPrefs') || {};
  h.check('the settings are kept', p.lastSeen === false && p.acl?.public === 'RING' && p.chatOn === true && p.chatSound === tone, JSON.stringify(p));
  for (let i = 0; i < 3; i++) await h.key('Escape');
  h.check('Back leaves Settings for the list', await h.until(`!!document.querySelector('#viewport [data-action="thread"][data-id="2"]')`));
  // People & options of Sam's chat: mute, then block and unblock from Blocked people.
  await h.tap('#viewport [data-action="thread"][data-id="2"]');
  await h.tap('#viewport [data-action="mms-menu"]');
  await h.tap('[data-action="hgp-open"][data-id="options"]');
  h.check('People & options lists the options and Sam', await h.until(`!!document.querySelector('#viewport .hgp-option[data-action="hgp-mute"]') && /Sam Rivera/.test(document.querySelector('#viewport .hgp-person')?.textContent || '') && /Block Sam Rivera/.test(document.querySelector('#viewport .hgp-option[data-id="block"]')?.textContent || '')`));
  await h.tap('#viewport .hgp-option[data-action="hgp-mute"]');
  h.check('Notifications off is kept for the chat', (await store(h, 'hgConv'))?.['2']?.quiet === true && await h.until(`document.querySelector('#viewport .hgp-option[data-id="tone:conv"]')?.disabled === true`));
  await h.tap('#viewport .hgp-option[data-id="block"]');
  await h.tap('#viewport [data-action="hgp-block"]');
  h.check('Block keeps Sam blocked', (await store(h, 'hgBlocked'))?.includes(2) && await h.until(`/Unblock Sam Rivera/.test(document.querySelector('#viewport .hgp-option[data-action="hgp-unblock"]')?.textContent || '')`));
  await h.key('Escape'); await h.key('Escape');
  await h.tap('#viewport [data-action="hg-drawer"]');
  await h.tap('[data-action="hgp-open"][data-id="blocked"]');
  h.check('Blocked people lists Sam', await h.until(`/Sam Rivera/.test(document.querySelector('#viewport .hgp-blocked-row')?.textContent || '')`));
  await h.tap('#viewport .hgp-blocked-row [data-action="hgp-unblock"]');
  h.check('Unblock empties the list', await h.until(`!!document.querySelector('#viewport .hgp-zero')`) && !(await store(h, 'hgBlocked'))?.length);
  await h.key('Escape');
  // The muted chat: the answer arrives but posts no notification.
  await h.tap('#viewport [data-action="thread"][data-id="2"]');
  await h.type('#viewport .hgl-compose textarea', 'Muted test');
  await h.ev(`document.querySelector('#viewport .hgl-compose').requestSubmit()`);
  await act('home');
  await h.sleep(5500);
  const msgs = await store(h, 'messages'), notes = await store(h, 'notifications');
  h.check('the muted chat gets its answer without a notification', msgs.filter(m => m.contact === 2 && m.channel === 'hangouts' && !m.mine).length === 2 && !notes.some(n => n.channel === 'hangouts'), JSON.stringify(notes));
  // Add people from Sam's chat: a group Hangout with Taylor, renamed.
  await h.openApp('hangouts');
  await h.tap('#viewport [data-action="thread"][data-id="2"]');
  await h.tap('#viewport [data-action="mms-menu"]');
  await h.tap('[data-action="hgp-open"][data-id="add"]');
  h.check('Add people keeps Sam and offers the others', await h.until(`/Sam Rivera/.test(document.querySelector('#viewport .hgp-chip.fixed')?.textContent || '') && !!document.querySelector('#viewport .hgp-pick[data-id="3"]') && document.querySelector('#viewport [data-action="hgp-add-ok"]')?.disabled === true`));
  await h.type('#viewport [data-hgp-query]', 'Tay');
  h.check('the field filters the people', await h.until(`document.querySelectorAll('#viewport .hgp-pick').length === 1`));
  await h.tap('#viewport .hgp-pick[data-id="3"]');
  await h.tap('#viewport [data-action="hgp-add-ok"]');
  h.check('OK opens the group Hangout', await h.until(`/Sam Rivera, Taylor Lee/.test(document.querySelector('#viewport .hgl-bar h2')?.textContent || '')`));
  await h.type('#viewport .hgl-compose textarea', 'Hi both');
  await h.ev(`document.querySelector('#viewport .hgl-compose').requestSubmit()`);
  await h.tap('#viewport [data-action="mms-menu"]');
  await h.tap('[data-action="hgp-open"][data-id="options"]');
  h.check('the group lists both people and Leave', await h.until(`document.querySelectorAll('#viewport .hgp-person').length === 2 && !!document.querySelector('#viewport .hgp-option[data-id="leave"]')`));
  await h.tap('#viewport .hgp-option[data-id="rename"]');
  await h.type('#viewport [data-hgp-edit]', 'Hike crew');
  await h.tap('#viewport [data-action="hgp-rename"]');
  h.check('Rename names the group', await h.until(`/Hike crew/.test(document.querySelector('#viewport .hgp-option[data-id="rename"]')?.textContent || '')`));
  h.check('reloads', await h.reload());
  await h.openApp('hangouts');
  h.check('the named group stays in the list', await h.until(`[...document.querySelectorAll('#viewport .hgl-thread')].some(b => /Hike crew/.test(b.textContent))`));
  // Messenger: People & options of Alex's conversation.
  await h.openApp('messaging');
  await h.tap('#viewport [data-action="thread"][data-id="1"]');
  await h.tap('#viewport [data-action="mms-menu"]');
  await h.tap('[data-action="mpo-open"]');
  h.check('Messenger\'s People & options opens', await h.until(`!!document.querySelector('#viewport .mpo-app .mpo-row[data-action="mpo-toggle"]')`));
  await h.tap('#viewport .mpo-row[data-action="mpo-toggle"]');
  h.check('Notifications off is kept', (await store(h, 'lpmConv'))?.['1']?.off === true && await h.until(`document.querySelector('#viewport .mpo-row[data-action="mpo-dialog"]')?.disabled === true`));
  await h.tap('#viewport .mpo-row[data-action="mpo-block"]');
  await h.tap('#viewport [data-action="mpo-block-ok"]');
  h.check('Block archives the conversation', await h.until(`!!document.querySelector('#viewport .lpm-list') && !document.querySelector('#viewport [data-action="thread"][data-id="1"]')`));
  await h.tap('#viewport [data-action="mms-menu"]');
  await h.tap('[data-action="mms-archived"]');
  h.check('Archived lists it', await h.until(`!!document.querySelector('#viewport [data-action="thread"][data-id="1"]')`));
};
// 4.4.4 Hangouts 2.0 (T32): Settings and SMS keep their choices; People & options turns a conversation's notifications
// off, so its answer posts none while another conversation's does; New group MMS starts a group conversation that
// People & options lists and deletes; Invites and Blocked People show their empty lists.
const kkHangoutsOptions = async h => {
  const act = (action, id = '') => h.ev(`(()=>{const el=document.createElement('button');el.dataset.action=${JSON.stringify(action)};el.dataset.id=${JSON.stringify(id)};document.querySelector('#viewport').firstElementChild.append(el);el.click();el.remove()})()`);
  await h.openApp('hangouts');
  await h.tap('#viewport [data-action="mms-menu"]');
  await h.tap('[data-action="hgp-open"][data-id="settings"]');
  h.check('Settings open on the account\'s rows', await h.until(`!!document.querySelector('#viewport .hgp-row[data-id="chatOn"]') && !!document.querySelector('#viewport .hgp-row[data-id="sms"]')`));
  await h.tap('#viewport .hgp-row[data-id="chatOn"]');
  h.check('Notifications off greys Sound, Vibrate and Invites', await h.until(`['tone:chat','chatVibrate','chatInvites'].every(id => document.querySelector('#viewport .hgp-row[data-id="'+id+'"]')?.disabled)`));
  await h.tap('#viewport .hgp-row[data-id="chatOn"]');
  await h.tap('#viewport .hgp-row[data-id="acl"]');
  await h.tap('#viewport .hgp-row[data-id="acl"]');
  await h.tap('#viewport .hgp-choice[data-id="RING"]');
  h.check('Everyone Else can Hangout', await h.until(`/Hangout with you/.test(document.querySelector('#viewport .hgp-row[data-id="acl"] small')?.textContent || '')`));
  await h.key('Escape');
  await h.tap('#viewport .hgp-row[data-id="sms"]');
  h.check('SMS shows its settings', await h.until(`!!document.querySelector('#viewport .hgp-row[data-id="smsOn"]') && /kitkat\\.demo/.test(document.querySelector('#viewport .hgp-info')?.textContent || '')`));
  await h.tap('#viewport .hgp-row[data-id="groupMms"]');
  await h.tap('#viewport .hgp-row[data-id="tone:sms"]');
  const tone = await h.ev(`document.querySelectorAll('#viewport .hgp-choice')[2].textContent`);
  await h.tap('#viewport .hgp-choice:nth-child(3)');
  await h.tap('#viewport [data-action="hgp-tone-ok"]');
  h.check('the chosen sound is the summary', await h.until(`document.querySelector('#viewport .hgp-row[data-id="tone:sms"] small')?.textContent === ${JSON.stringify(tone)}`));
  await h.tap('#viewport .hgp-row[data-id="autoMms"]');
  h.check('Auto retrieve off greys roaming', await h.until(`document.querySelector('#viewport .hgp-row[data-id="roamingMms"]')?.disabled === true`));
  const p = await store(h, 'hgPrefs') || {};
  h.check('the settings are kept', p.acl === 'RING' && p.groupMms === false && p.autoMms === false && p.smsSound === tone && p.chatOn === true, JSON.stringify(p));
  await h.key('Escape');
  await h.tap('#viewport .hgp-row[data-id="blocked"]');
  h.check('Blocked People is empty', await h.until(`/No blocked people/.test(document.querySelector('#viewport .hgp-zero')?.textContent || '')`));
  await h.key('Escape'); await h.key('Escape');
  await h.tap('#viewport [data-action="mms-menu"]');
  await h.tap('[data-action="hgp-open"][data-id="invites"]');
  h.check('Invites has none', await h.until(`/No invites/.test(document.querySelector('#viewport .hgp-empty')?.textContent || '')`));
  await h.key('Escape');
  // Alex's conversation: Notifications off in People & options.
  await h.tap('#viewport [data-action="thread"][data-id="1"]');
  await h.tap('#viewport [data-action="mms-menu"]');
  await h.tap('[data-action="hgp-open"][data-id="options"]');
  h.check('People & options lists Notifications and Alex', await h.until(`!!document.querySelector('#viewport .hgp-option[data-action="hgp-mute"] .hgp-check.on') && /Alex Morgan/.test(document.querySelector('#viewport .hgp-person')?.textContent || '')`));
  await h.tap('#viewport .hgp-option[data-action="hgp-mute"]');
  h.check('Notifications off is kept', (await store(h, 'hgConv'))?.['1']?.quiet === true);
  await h.key('Escape');
  await h.type('#viewport .hg-compose textarea', 'Quiet please');
  await h.ev(`document.querySelector('#viewport .hg-compose').requestSubmit()`);
  await act('home');
  await h.sleep(5500);
  let notes = await store(h, 'notifications');
  h.check('the quiet conversation answers without a notification', (await store(h, 'messages')).some(m => m.contact === 1 && !m.mine && /Sounds good/.test(m.body)) && !notes.some(n => n.kind === 'message'), JSON.stringify(notes));
  await h.openApp('hangouts');
  await h.tap('#viewport [data-action="thread"][data-id="4"]');
  await h.type('#viewport .hg-compose textarea', 'Call you later');
  await h.ev(`document.querySelector('#viewport .hg-compose').requestSubmit()`);
  await act('home');
  await h.sleep(5500);
  notes = await store(h, 'notifications');
  h.check('another conversation\'s answer posts its notification', notes.some(n => n.kind === 'message' && n.contact === 4), JSON.stringify(notes));
  // New group MMS from Alex's conversation.
  await h.openApp('hangouts');
  await h.tap('#viewport [data-action="thread"][data-id="1"]');
  await h.tap('#viewport [data-action="mms-menu"]');
  await h.tap('[data-action="hgp-open"][data-id="add"]');
  h.check('New group MMS keeps Alex and offers the others', await h.until(`/Alex Morgan/.test(document.querySelector('#viewport .hgp-chip.fixed')?.textContent || '') && !!document.querySelector('#viewport .hgp-pick[data-id="3"]')`));
  await h.tap('#viewport .hgp-pick[data-id="3"]');
  await h.tap('#viewport [data-action="hgp-add-ok"]');
  h.check('OK opens the group conversation', await h.until(`/Alex Morgan, Taylor Lee/.test(document.querySelector('#viewport .hg-title h2')?.textContent || '') && !document.querySelector('#viewport [data-action="mms-call"]')`));
  await h.type('#viewport .hg-compose textarea', 'Hi both');
  await h.ev(`document.querySelector('#viewport .hg-compose').requestSubmit()`);
  h.check('reloads', await h.reload());
  await h.openApp('hangouts');
  h.check('the group stays in the list', await h.until(`[...document.querySelectorAll('#viewport .hg-thread')].some(b => /Alex Morgan, Taylor Lee/.test(b.textContent))`));
  await h.tap('#viewport .hg-thread[data-id="g1"]');
  await h.tap('#viewport [data-action="mms-menu"]');
  await h.tap('[data-action="hgp-open"][data-id="options"]');
  h.check('the group lists both people and Delete', await h.until(`document.querySelectorAll('#viewport .hgp-person').length === 2 && !!document.querySelector('#viewport .hgp-option[data-action="mms-delete-thread"]')`));
  await h.tap('#viewport .hgp-option[data-action="mms-delete-thread"]');
  await h.tap('[data-action="mms-confirm-delete"]');
  h.check('Delete removes the group conversation', await h.until(`!!document.querySelector('#viewport .hg-threads') && !document.querySelector('#viewport .hg-thread[data-id="g1"]')`));
};
// 4.3 Hangouts 1.0.2 (T32): Settings keep their choices; People & options mutes and blocks (Blocked People unblocks);
// a muted chat's answer posts no notification while another chat's does; Add people starts a group Hangout that can
// be renamed and left; Hangout requests shows its empty list.
const jbHangoutsOptions = async h => {
  const act = (action, id = '') => h.ev(`(()=>{const el=document.createElement('button');el.dataset.action=${JSON.stringify(action)};el.dataset.id=${JSON.stringify(id)};document.querySelector('#viewport').firstElementChild.append(el);el.click();el.remove()})()`);
  const send = async text => { await h.type('#viewport .hg-compose textarea', text); await h.ev(`document.querySelector('#viewport .hg-compose').requestSubmit()`); };
  await h.openApp('hangouts');
  await h.tap('#viewport [data-action="mms-menu"]');
  await h.tap('[data-action="hgp-open"][data-id="settings"]');
  h.check('Settings list the account and About Hangouts', await h.until(`!!document.querySelector('#viewport .hgp-row[data-id="account"]') && !!document.querySelector('#viewport .hgp-row[data-id="about"]')`));
  await h.tap('#viewport .hgp-row[data-id="about"]');
  h.check('About shows the build', await h.until(`/1\\.0\\.2\\.717155/.test(document.querySelector('#viewport .hgp-scroll')?.textContent || '')`));
  await h.key('Escape');
  await h.tap('#viewport .hgp-row[data-id="account"]');
  await h.tap('#viewport .hgp-row[data-id="chatVibrate"]');
  await h.tap('#viewport .hgp-row[data-id="acl"]');
  await h.tap('#viewport .hgp-row[data-id="acl"]');
  await h.tap('#viewport .hgp-choice[data-id="RING"]');
  h.check('Public can Hangout', await h.until(`/Hangout with you/.test(document.querySelector('#viewport .hgp-row[data-id="acl"] small')?.textContent || '')`));
  await h.key('Escape');
  await h.tap('#viewport .hgp-row[data-id="chatOn"]');
  h.check('Notifications off greys Sound, Vibrate and Hangout requests', await h.until(`['tone:chat','chatVibrate','chatInvites'].every(id => document.querySelector('#viewport .hgp-row[data-id="'+id+'"]')?.disabled)`));
  await h.tap('#viewport .hgp-row[data-id="chatOn"]');
  const p = await store(h, 'hgPrefs') || {};
  h.check('the settings are kept', p.chatVibrate === true && p.acl === 'RING' && p.chatOn === true, JSON.stringify(p));
  for (let i = 0; i < 2; i++) await h.key('Escape');
  await h.tap('#viewport [data-action="mms-menu"]');
  await h.tap('[data-action="hgp-open"][data-id="invites"]');
  h.check('Hangout requests has none', await h.until(`/No Hangout requests/.test(document.querySelector('#viewport .hgp-empty')?.textContent || '')`));
  await h.key('Escape');
  // Sam's chat: Notifications off, then Block and Unblock from Blocked People.
  await h.tap('#viewport [data-action="thread"][data-id="2"]');
  await h.tap('#viewport [data-action="mms-menu"]');
  await h.tap('[data-action="hgp-open"][data-id="options"]');
  h.check('People & options lists Notifications, Block and Sam', await h.until(`!!document.querySelector('#viewport .hgp-option[data-action="hgp-mute"] .hgp-check.on') && /Block Sam Rivera/.test(document.querySelector('#viewport .hgp-option[data-id="block"]')?.textContent || '') && /Sam Rivera/.test(document.querySelector('#viewport .hgp-person')?.textContent || '')`));
  await h.tap('#viewport .hgp-option[data-action="hgp-mute"]');
  h.check('Notifications off is kept', (await store(h, 'hgConv'))?.['2']?.quiet === true);
  await h.tap('#viewport .hgp-option[data-id="block"]');
  await h.tap('#viewport [data-action="hgp-block"]');
  h.check('Block person blocks Sam', (await store(h, 'hgBlocked'))?.includes(2) && await h.until(`!!document.querySelector('#viewport .hgp-option[data-action="hgp-unblock"]')`));
  await h.tap('#viewport [data-action="hgp-menu"]');
  await h.tap('#viewport [data-action="hgp-page"][data-id="settings"]');
  await h.tap('#viewport .hgp-row[data-id="account"]');
  await h.tap('#viewport .hgp-row[data-id="blocked"]');
  h.check('Blocked People lists Sam', await h.until(`/Sam Rivera/.test(document.querySelector('#viewport .hgp-blocked-row')?.textContent || '')`));
  await h.tap('#viewport .hgp-blocked-row [data-action="hgp-unblock"]');
  h.check('Unblock empties the list', await h.until(`!!document.querySelector('#viewport .hgp-zero')`) && !(await store(h, 'hgBlocked'))?.length);
  for (let i = 0; i < 4; i++) await h.key('Escape');
  h.check('Back returns to the chat', await h.until(`!!document.querySelector('#viewport .hg-compose')`));
  await send('Quiet please');
  await act('home');
  await h.sleep(5500);
  let notes = await store(h, 'notifications');
  h.check('the muted chat answers without a notification', (await store(h, 'hangoutChats')).some(m => m.contact === 2 && !m.mine && /Got it/.test(m.body)) && !notes.some(n => n.channel === 'hangouts'), JSON.stringify(notes));
  await h.openApp('hangouts');
  await h.tap('#viewport [data-action="thread"][data-id="3"]');
  await send('Nice photos');
  await act('home');
  await h.sleep(5500);
  notes = await store(h, 'notifications');
  h.check('another chat\'s answer posts its notification', notes.some(n => n.channel === 'hangouts' && n.contact === 3), JSON.stringify(notes));
  // Add people from Sam's chat: a group Hangout with Alex, renamed, then left.
  await h.openApp('hangouts');
  await h.tap('#viewport [data-action="thread"][data-id="2"]');
  await h.tap('#viewport [data-action="mms-menu"]');
  await h.tap('[data-action="hgp-open"][data-id="add"]');
  h.check('Add people keeps Sam and offers the others', await h.until(`/Sam Rivera/.test(document.querySelector('#viewport .hgp-chip.fixed')?.textContent || '') && !!document.querySelector('#viewport .hgp-pick[data-id="1"]')`));
  await h.tap('#viewport .hgp-pick[data-id="1"]');
  await h.tap('#viewport [data-action="hgp-add-ok"]');
  h.check('OK opens the group Hangout', await h.until(`/Sam Rivera, Alex Morgan/.test(document.querySelector('#viewport .hg-title h2')?.textContent || '')`));
  await send('Hi both');
  await h.tap('#viewport [data-action="mms-menu"]');
  await h.tap('[data-action="hgp-open"][data-id="options"]');
  h.check('the group lists Rename, Leave, both people and Add People', await h.until(`!!document.querySelector('#viewport .hgp-option[data-id="rename"]') && !!document.querySelector('#viewport .hgp-option[data-id="leave"]') && document.querySelectorAll('#viewport .hgp-person').length === 2 && !!document.querySelector('#viewport .hgp-option[data-id="add"]')`));
  await h.tap('#viewport .hgp-option[data-id="rename"]');
  await h.type('#viewport [data-hgp-edit]', 'Coffee club');
  await h.tap('#viewport [data-action="hgp-rename"]');
  h.check('Edit name names the group', await h.until(`/Coffee club/.test(document.querySelector('#viewport .hgp-option[data-id="rename"]')?.textContent || '')`));
  h.check('reloads', await h.reload());
  await h.openApp('hangouts');
  h.check('the named group stays in the list', await h.until(`[...document.querySelectorAll('#viewport .hg-thread')].some(b => /Coffee club/.test(b.textContent))`));
  await h.tap('#viewport .hg-thread[data-id="g1"]');
  await h.tap('#viewport [data-action="mms-menu"]');
  await h.tap('[data-action="hgp-open"][data-id="options"]');
  await h.tap('#viewport .hgp-option[data-id="leave"]');
  await h.tap('#viewport [data-action="hgp-leave"]');
  h.check('Leave removes the group', await h.until(`!!document.querySelector('#viewport .hg-threads') && !document.querySelector('#viewport .hg-thread[data-id="g1"]')`));
};
// 4.4.4 Drive 1.2 (T34): Add new makes a folder and a document; Sort by and Filter by reorder and narrow the list; a
// held item moves into a folder, is renamed, made available offline (the Offline entry lists it) and removed; the
// detail panel stars it; Send hands it to Gmail; Refresh reads the list again; Settings keep Wi-Fi only.
const kkDriveFiles = async h => {
  const files = async () => (await store(h, 'driveFiles')) || [];
  const menu = async () => { await h.tap('#viewport [data-action="sa-menu"]'); await h.until(`!!document.querySelector('.holo-menu')`); };
  const names = () => h.ev(`[...document.querySelectorAll('#viewport .dr-text b')].map(b => b.textContent)`);
  await h.openApp('drive');
  h.check('opens My Drive', await h.until(`!!document.querySelector('#viewport .dr-row')`));
  await menu();
  h.check('the overflow has the APK\'s items', await h.ev(`[...document.querySelectorAll('.holo-menu button')].map(b => b.textContent).join('|')`) === 'Add new|Refresh|Filter by|Sort by|Settings|Product Tour');
  await h.tap('.holo-menu [data-action="drv-dialog"][data-id="add"]');
  h.check('Add new lists Folder, Document, Spreadsheet, Scan, Upload', await h.until(`[...document.querySelectorAll('#viewport .drv-item')].map(b => b.textContent).join('|') === 'Folder|Document|Spreadsheet|Scan|Upload'`));
  await h.tap('#viewport .drv-item[data-id="folder"]');
  await h.type('#viewport [data-drv-edit]', 'Receipts');
  await h.tap('#viewport [data-action="drv-folder-ok"]');
  h.check('the folder is listed', await h.until(`[...document.querySelectorAll('#viewport .dr-text b')].some(b => b.textContent === 'Receipts')`) && (await files()).some(f => f.name === 'Receipts' && f.kind === 'folder'));
  await menu();
  await h.tap('.holo-menu [data-action="drv-dialog"][data-id="add"]');
  await h.tap('#viewport .drv-item[data-id="doc"]');
  h.check('Document opens an untitled document', await h.until(`/Untitled document/.test(document.querySelector('#viewport .sa-title, #viewport .sa-bar')?.textContent || '')`));
  await h.key('Escape');
  await menu();
  await h.tap('.holo-menu [data-action="drv-dialog"][data-id="sort"]');
  await h.tap('#viewport .drv-item[data-id="title"]');
  const sortedNames = await names();
  h.check('Sort by Title puts folders first, then names', sortedNames[0] === 'Photos' || sortedNames[0] === 'Receipts', JSON.stringify(sortedNames));
  h.check('the sort is kept', (await store(h, 'drivePrefs'))?.sort === 'title');
  await menu();
  await h.tap('.holo-menu [data-action="drv-dialog"][data-id="filter"]');
  await h.tap('#viewport .drv-item[data-id="sheet"]');
  h.check('Filter by Spreadsheets lists only Budget', await h.until(`/Filter: Spreadsheets/.test(document.querySelector('#viewport .sa-title')?.textContent || '')`) && JSON.stringify(await names()) === '["Budget"]');
  await h.key('Escape');
  h.check('Back leaves the filter', await h.until(`/My Drive/.test(document.querySelector('#viewport .sa-title')?.textContent || '')`));
  // Hold Trip plan: Move to Receipts, Rename, Available offline.
  const trip = (await files()).find(f => f.name === 'Trip plan 2014').id, receipts = (await files()).find(f => f.name === 'Receipts').id;
  await h.hold(`#viewport [data-drive-hold="${trip}"]`); await h.sleep(600);
  h.check('holding an item opens its menu', await h.until(`/Trip plan 2014/.test(document.querySelector('#viewport .drv-context h3')?.textContent || '')`));
  await h.tap('#viewport .drv-context [data-action="drv-move"]');
  await h.tap(`#viewport .drv-pick[data-id="${receipts}"]`);
  await h.tap('#viewport [data-action="drv-move-ok"]');
  h.check('Move to puts it in the folder', await h.until(`![...document.querySelectorAll('#viewport .dr-text b')].some(b => b.textContent === 'Trip plan 2014')`) && (await files()).find(f => f.id === trip).parent === receipts);
  await h.tap(`#viewport .dr-main[data-id="${receipts}"]`);
  h.check('the folder opens on its item', await h.until(`/Receipts/.test(document.querySelector('#viewport .sa-title')?.textContent || '') && JSON.stringify([...document.querySelectorAll('#viewport .dr-text b')].map(b => b.textContent)) === '["Trip plan 2014"]'`));
  await h.hold(`#viewport [data-drive-hold="${trip}"]`); await h.sleep(600);
  await h.tap('#viewport .drv-context [data-action="drv-rename"]');
  await h.type('#viewport [data-drv-edit]', 'Lisbon trip');
  await h.tap('#viewport [data-action="drv-rename-ok"]');
  h.check('Rename renames it', await h.until(`[...document.querySelectorAll('#viewport .dr-text b')].some(b => b.textContent === 'Lisbon trip')`));
  await h.tap(`#viewport .dr-info[data-id="${trip}"]`);
  h.check('the detail panel shows its general info', await h.until(`/General info/i.test(document.querySelector('#viewport .drv-detail')?.textContent || '')`));
  await h.tap('#viewport .drv-pin-row');
  await h.tap('#viewport .drv-star');
  h.check('Available offline and the star are kept', (await files()).some(f => f.id === trip && f.pinned && f.starred));
  await h.tap('#viewport .drv-close');
  await h.key('Escape');
  await h.tap('#viewport [data-action="drive-nav"]');
  await h.tap('#viewport .dr-nav [data-id="offline"]');
  h.check('Offline lists the pinned item', await h.until(`/Offline/.test(document.querySelector('#viewport .sa-title')?.textContent || '') && [...document.querySelectorAll('#viewport .dr-text b')].some(b => b.textContent === 'Lisbon trip')`));
  await h.tap('#viewport [data-action="drive-nav"]');
  await h.tap('#viewport .dr-nav [data-id="my"]');
  // Remove Budget, Refresh, then Send Meetup slides to Gmail.
  const budget = (await files()).find(f => f.name === 'Budget').id;
  await h.hold(`#viewport [data-drive-hold="${budget}"]`); await h.sleep(600);
  await h.tap('#viewport .drv-context [data-action="drv-remove"]');
  await h.tap('#viewport [data-action="drv-remove-ok"]');
  h.check('Remove takes it off the list', await h.until(`![...document.querySelectorAll('#viewport .dr-text b')].some(b => b.textContent === 'Budget')`) && (await files()).find(f => f.id === budget).trashed === true);
  await menu();
  await h.tap('.holo-menu [data-action="drv-refresh"]');
  h.check('Refresh shows its progress and lists the same items', await h.until(`!!document.querySelector('#viewport .drv-spinner')`, 2000) && await h.until(`!document.querySelector('#viewport .drv-spinner') && !![...document.querySelectorAll('#viewport .dr-text b')].length`));
  h.check('reloads', await h.reload());
  await h.openApp('drive');
  h.check('the changes stay after a reload', await h.until(`[...document.querySelectorAll('#viewport .dr-text b')].some(b => b.textContent === 'Receipts') && ![...document.querySelectorAll('#viewport .dr-text b')].some(b => b.textContent === 'Budget')`));
  const slides = (await files()).find(f => f.name === 'Meetup slides').id;
  await h.hold(`#viewport [data-drive-hold="${slides}"]`); await h.sleep(600);
  await h.tap('#viewport .drv-context [data-action="drv-send"]');
  await h.tap('#viewport .drv-app[data-id="gmail"]');
  h.check('Send opens Gmail with the item attached', await h.until(`/Meetup slides/.test(document.querySelector('#viewport .kem-attachment')?.textContent || '')`));
  await h.openApp('drive');
  await menu();
  await h.tap('.holo-menu [data-action="drv-settings"]');
  await h.tap('#viewport .drv-row[data-action="drv-wifi"]');
  h.check('Settings keep Transfer files only over Wi-Fi', (await store(h, 'drivePrefs'))?.wifiOnly === false && await h.until(`!document.querySelector('#viewport .drv-row[data-action="drv-wifi"] .drv-check.on')`));
};
// 5.1.1 Drive 2.1 (T34): Create's "New" sheet makes a folder and a Google Docs file; Sort by and Filter by reorder and
// narrow the list; a held item moves into a folder, is renamed, kept on device (On device lists it) and removed;
// Refresh reads the list again; the opened file's Send file hands it to Gmail.
const lpDriveFiles = async h => {
  const files = async () => (await store(h, 'driveFiles')) || [];
  const overflow = async () => { await h.tap('#viewport [data-action="sa-menu"]'); await h.until(`!!document.querySelector('[data-action="drv-refresh"]')`); };
  const names = () => h.ev(`[...document.querySelectorAll('#viewport .dr2-row b')].map(b => b.textContent)`);
  await h.openApp('drive');
  h.check('opens My Drive', await h.until(`!!document.querySelector('#viewport .dr2-row')`));
  await overflow();
  h.check('the overflow has Create, Refresh, Filter by, Sort by', await h.ev(`[...document.querySelectorAll('[data-action="drv-dialog"], [data-action="drv-refresh"]')].filter(b => !b.closest('.dr2-list')).map(b => b.textContent).join('|')`) === 'Create|Refresh|Filter by|Sort by');
  await h.tap('[data-action="drv-dialog"][data-id="add"]');
  h.check('Create opens the New sheet', await h.until(`[...document.querySelectorAll('#viewport .drv2-choice')].map(b => b.textContent).join('|') === 'Folder|Upload|Scan|Google Docs|Google Sheets|Google Slides'`));
  await h.tap('#viewport .drv2-choice[data-id="folder"]');
  await h.type('#viewport [data-drv-edit]', 'Receipts');
  await h.tap('#viewport [data-action="drv-folder-ok"]');
  h.check('the folder is listed', await h.until(`[...document.querySelectorAll('#viewport .dr2-row b')].some(b => b.textContent === 'Receipts')`));
  await overflow();
  await h.tap('[data-action="drv-dialog"][data-id="add"]');
  await h.tap('#viewport .drv2-choice[data-id="slides"]');
  h.check('Google Slides opens an untitled presentation', await h.until(`/Untitled presentation/.test(document.querySelector('#viewport .sa-bar')?.textContent || '')`) && (await files()).some(f => f.kind === 'slides' && f.name === 'Untitled presentation'));
  await h.key('Escape');
  await overflow();
  await h.tap('[data-action="drv-dialog"][data-id="sort"]');
  await h.tap('#viewport .drv2-item[data-id="title"]');
  const sortedNames = await names();
  h.check('Sort by Title puts folders first', ['Photos', 'Receipts'].includes(sortedNames[0]) && ['Photos', 'Receipts'].includes(sortedNames[1]), JSON.stringify(sortedNames));
  await overflow();
  await h.tap('[data-action="drv-dialog"][data-id="filter"]');
  await h.tap('#viewport .drv2-item[data-id="sheet"]');
  h.check('Filter by Spreadsheets lists only Budget', await h.until(`/Filter: Spreadsheets/.test(document.querySelector('#viewport .dr2-bar')?.textContent || '')`) && JSON.stringify(await names()) === '["Budget"]');
  await h.key('Escape');
  h.check('Back leaves the filter', await h.until(`/My Drive/.test(document.querySelector('#viewport .dr2-bar')?.textContent || '')`));
  const trip = (await files()).find(f => f.name === 'Trip plan 2015').id, receipts = (await files()).find(f => f.name === 'Receipts').id;
  await h.hold(`#viewport [data-drive-hold="${trip}"]`); await h.sleep(600);
  h.check('holding an item opens its menu', await h.until(`/Trip plan 2015/.test(document.querySelector('#viewport .drv2-context h3')?.textContent || '')`));
  await h.tap('#viewport .drv2-context [data-action="drv-move"]');
  await h.tap(`#viewport .drv2-pick[data-id="${receipts}"]`);
  await h.tap('#viewport [data-action="drv-move-ok"]');
  h.check('Move puts it in the folder', await h.until(`![...document.querySelectorAll('#viewport .dr2-row b')].some(b => b.textContent === 'Trip plan 2015')`) && (await files()).find(f => f.id === trip).parent === receipts);
  await h.tap(`#viewport .dr2-row[data-id="${receipts}"]`);
  h.check('the folder opens on its item', await h.until(`JSON.stringify([...document.querySelectorAll('#viewport .dr2-row b')].map(b => b.textContent)) === '["Trip plan 2015"]'`));
  await h.hold(`#viewport [data-drive-hold="${trip}"]`); await h.sleep(600);
  await h.tap('#viewport .drv2-context [data-action="drv-rename"]');
  await h.type('#viewport [data-drv-edit]', 'Lisbon trip');
  await h.tap('#viewport [data-action="drv-rename-ok"]');
  h.check('Rename renames it', await h.until(`[...document.querySelectorAll('#viewport .dr2-row b')].some(b => b.textContent === 'Lisbon trip')`));
  await h.hold(`#viewport [data-drive-hold="${trip}"]`); await h.sleep(600);
  await h.tap('#viewport .drv2-context [data-action="drv-pin"]');
  h.check('Keep on device is kept', (await files()).find(f => f.id === trip).pinned === true);
  await h.key('Escape');
  await h.tap('#viewport [data-action="drive-nav"]');
  await h.tap('#viewport .dr2-nav [data-id="offline"]');
  h.check('On device lists it', await h.until(`/On device/.test(document.querySelector('#viewport .dr2-bar')?.textContent || '') && [...document.querySelectorAll('#viewport .dr2-row b')].some(b => b.textContent === 'Lisbon trip')`));
  await h.tap('#viewport [data-action="drive-nav"]');
  await h.tap('#viewport .dr2-nav [data-id="my"]');
  const budget = (await files()).find(f => f.name === 'Budget').id;
  await h.hold(`#viewport [data-drive-hold="${budget}"]`); await h.sleep(600);
  await h.tap('#viewport .drv2-context [data-action="drv-remove"]');
  await h.tap('#viewport [data-action="drv-remove-ok"]');
  h.check('Remove takes it off the list', await h.until(`![...document.querySelectorAll('#viewport .dr2-row b')].some(b => b.textContent === 'Budget')`) && (await files()).find(f => f.id === budget).trashed === true);
  await overflow();
  await h.tap('[data-action="drv-refresh"]');
  h.check('Refresh shows its progress, then the list', await h.until(`!!document.querySelector('#viewport .drv2-spinner')`, 2000) && await h.until(`!document.querySelector('#viewport .drv2-spinner') && !!document.querySelector('#viewport .dr2-row')`));
  h.check('reloads', await h.reload());
  await h.openApp('drive');
  h.check('the changes stay after a reload', await h.until(`[...document.querySelectorAll('#viewport .dr2-row b')].some(b => b.textContent === 'Receipts') && ![...document.querySelectorAll('#viewport .dr2-row b')].some(b => b.textContent === 'Budget')`));
  const slides = (await files()).find(f => f.name === 'Meetup slides').id;
  await h.tap(`#viewport .dr2-row[data-id="${slides}"]`);
  await h.tap(`#viewport [data-action="drv-send"][data-id="${slides}"]`);
  await h.tap('#viewport .drv2-app[data-id="gmail"]');
  h.check('Send file opens Gmail with the item attached', await h.until(`/Meetup slides/.test(document.querySelector('#viewport')?.textContent || '') && /compose|Compose/.test(document.querySelector('#viewport').innerHTML)`));
};
// 4.3 Drive (T34): the JWR66Y image has no Drive and the launcher lists none, so Drive does not open on the Nexus 4.
const jbNoDrive = async h => {
  h.check('the launcher has no Drive', !await h.ev(`[...document.querySelectorAll('[data-app="drive"]')].length`) && !await h.ev(`(window.StockApps?.APPS || []).includes('drive')`));
  await h.openApp('drive');
  h.check('opening Drive stays on the home screen', await h.until(`!!document.querySelector('#viewport .home-view')`));
};
// 4.4.4 Play apps (T43): Music's search MORE list, an album's menu (Keep on device, Play next, Add to playlist, Go to
// artist), now playing's Save as playlist and Music settings; Movies' download pin and On Device, Settings; Books'
// card menu (Don't keep, Delete from library), Sort and Settings; Games' player page, Dismiss and Settings.
const kkPlayMore = async h => {
  const prefs = async app => ((await store(h, 'playPrefs')) || {})[app] || {};
  const tapCardDots = sel => h.tap(`${sel} .pa-dots`);
  const menuItem = async (action, id) => { await h.until(`!!document.querySelector('.pmx-menu, .holo-menu')`); await h.tap(`[data-action="${action}"]${id !== undefined ? `[data-id="${id}"]` : ''}`); };
  // Music
  await h.openApp('play-music');
  h.check('opens Listen Now', await h.until(`!!document.querySelector('#viewport .pa-card[data-action="pa-album"]')`));
  const album = await h.ev(`document.querySelector('#viewport .pa-card[data-action="pa-album"]').dataset.id`);
  await tapCardDots(`#viewport .pa-card[data-id="${album}"]`);
  h.check('an album\'s menu has DocumentMenuHandler\'s entries', await h.until(`[...document.querySelectorAll('.pmx-menu button')].map(b => b.textContent).join('|') === 'Start instant mix|Play next|Add to queue|Keep on device|Add to playlist|Go to artist|Shop this artist'`));
  await menuItem('px-keep');
  h.check('Keep on device marks the album', (await store(h, 'playMusicKept'))?.includes(album) && await h.until(`!!document.querySelector('#viewport .pa-card[data-id="${album}"] .pa-kept')`));
  await tapCardDots(`#viewport .pa-card[data-id="${album}"]`);
  await menuItem('px-dialog', `playlist:album:${album}`);
  await h.tap('.pmx-dialog [data-action="px-new-playlist"]');
  await h.type('[data-pmx-edit]', 'Road trip');
  await h.tap('.pmx-dialog [data-action="px-create-playlist"]');
  const music = await store(h, 'music');
  h.check('Add to playlist makes the playlist with the album', music?.playlists?.some(p => p.name === 'Road trip' && p.tracks.length > 0), JSON.stringify(music?.playlists));
  await tapCardDots(`#viewport .pa-card[data-id="${album}"]`);
  await menuItem('px-artist');
  h.check('Go to artist opens the artist\'s albums', await h.until(`!!document.querySelector('#viewport .pmx-page .pa-card')`));
  await h.key('Escape');
  await tapCardDots(`#viewport .pa-card[data-id="${album}"]`);
  await menuItem('px-mix');
  h.check('Start instant mix plays', await h.until(`!!document.querySelector('#viewport .pm-now')`));
  await h.tap('#viewport [data-action="px-np"]');
  h.check('now playing\'s menu', await h.until(`[...document.querySelectorAll('.pmx-menu button')].map(b => b.textContent).join('|') === 'Start instant mix|Add to playlist|Go to artist|Go to album|Clear queue|Save as playlist'`));
  await menuItem('px-dialog', 'save-queue');
  await h.type('[data-pmx-edit]', 'Queue copy');
  await h.tap('.pmx-dialog [data-action="px-create-playlist"]');
  h.check('Save as playlist keeps the queue', (await store(h, 'music'))?.playlists?.some(p => p.name === 'Queue copy' && p.tracks.length > 1));
  await h.key('Escape');
  await h.tap('#viewport [data-action="pa-menu"]');
  await menuItem('px-page', 'music-settings');
  await h.tap('#viewport .pmx-row[data-id="music:streamWifi"]');
  await h.tap('#viewport .pmx-row[data-id="quality"]');
  await h.tap('.pmx-dialog [data-id="music:quality:high"]');
  const mp = await prefs('music');
  h.check('Music settings keep their choices', mp.streamWifi === true && mp.quality === 'high' && await h.until(`/High/.test(document.querySelector('#viewport .pmx-row[data-id="quality"]')?.textContent || '')`), JSON.stringify(mp));
  await h.key('Escape');
  await h.tap('#viewport [data-action="pa-search"]');
  // The demo library (6 songs, 3 albums, 2 artists) never passes a cluster's 4 / 5 limit, so the MORE page is opened
  // the way its chip opens it and must list every song the query finds.
  await h.type('#viewport [data-pa-search]', 'i');
  await h.until(`document.querySelectorAll('#viewport .pm-song').length === 5`);
  await h.ev(`(()=>{const el=document.createElement('button');el.dataset.action='px-more';el.dataset.id='songs';document.querySelector('#viewport').firstElementChild.append(el);el.click();el.remove()})()`);
  h.check('the MORE page lists every song found', await h.until(`document.querySelectorAll('#viewport .pmx-page .pm-song').length === 5`));
  await h.key('Escape');
  h.check('Back returns to the search', await h.until(`!!document.querySelector('#viewport [data-pa-search]')`));
  // Movies
  await h.openApp('play-movies');
  const movie = await h.ev(`document.querySelector('#viewport .pa-pin')?.dataset.id`);
  await h.tap(`#viewport .pa-pin[data-id="${movie}"]`);
  h.check('the pin downloads the movie', (await store(h, 'playMoviesDevice'))?.includes(movie) && await h.until(`!!document.querySelector('#viewport .pa-pin.on[data-id="${movie}"]')`));
  await h.ev(`(()=>{const el=document.createElement('button');el.dataset.action='pa-page';el.dataset.id='device';document.querySelector('#viewport').firstElementChild.append(el);el.click();el.remove()})()`);
  h.check('On Device lists it', await h.until(`!!document.querySelector('#viewport .pa-card[data-id="${movie}"]')`));
  await h.tap('#viewport [data-action="pa-menu"]');
  await menuItem('px-page', 'movies-settings');
  await h.tap('#viewport .pmx-row[data-id="caption"]');
  await h.tap('.pmx-dialog [data-id="movies:captionSize:3"]');
  h.check('Movies settings keep the caption size', (await prefs('movies')).captionSize === 3);
  // Books
  await h.openApp('play-books');
  await h.ev(`(()=>{const el=document.createElement('button');el.dataset.action='pa-page';el.dataset.id='library';document.querySelector('#viewport').firstElementChild.append(el);el.click();el.remove()})()`);
  const book = await h.ev(`document.querySelector('#viewport .pa-card[data-action="pa-book"]').dataset.id`);
  await tapCardDots(`#viewport .pa-card[data-id="${book}"]`);
  h.check('a book\'s menu', await h.until(`[...document.querySelectorAll('.pmx-menu button')].map(b => b.textContent).join('|') === "Don't keep|Delete from library|About this book"`));
  await menuItem('px-book-keep', book);
  h.check('Don\'t keep drops the pin', (await store(h, 'playBooksState'))?.notKept?.includes(book) && await h.until(`!document.querySelector('#viewport .pa-card[data-id="${book}"] .pa-kept')`));
  await tapCardDots(`#viewport .pa-card[data-id="${book}"]`);
  await menuItem('px-dialog', `remove-book:${book}`);
  await h.tap('.pmx-dialog [data-action="px-remove-book"]');
  h.check('Delete from library removes it', await h.until(`!document.querySelector('#viewport .pa-card[data-id="${book}"]')`));
  await h.tap('#viewport [data-action="pa-menu"]');
  await menuItem('px-more-dialog', 'sort');
  await h.tap('.pmx-dialog [data-id="title"]');
  const titles = await h.ev(`[...document.querySelectorAll('#viewport .pa-card b')].map(b => b.textContent)`);
  h.check('Sort by Title orders the library', JSON.stringify(titles) === JSON.stringify([...titles].sort((a, b) => a.localeCompare(b, 'en'))), JSON.stringify(titles));
  await h.tap('#viewport [data-action="pa-drawer"]');
  await h.tap('[data-action="px-page"][data-id="books-settings"]');
  await h.tap('#viewport .pmx-row[data-id="books:volumeKeys"]');
  h.check('Books settings keep their choices', (await prefs('books')).volumeKeys === true);
  // Games
  await h.openApp('play-games');
  await h.tap('#viewport .pa-card[data-action="px-player"]');
  h.check('a player opens their page', await h.until(`!!document.querySelector('#viewport .pmx-player')`));
  await h.key('Escape');
  const player = await h.ev(`document.querySelector('#viewport .pa-card[data-action="px-player"]').dataset.id`);
  await tapCardDots(`#viewport .pa-card[data-id="${player}"]`);
  await menuItem('px-dismiss');
  h.check('Dismiss takes the player off', await h.until(`!document.querySelector('#viewport .pa-card[data-id="${player}"]')`));
  await h.tap('#viewport [data-action="pa-menu"]');
  await menuItem('px-page', 'games-settings');
  await h.tap('#viewport .pmx-row[data-id="games:requests"]');
  h.check('Games settings keep their choices', (await prefs('games')).requests === false);
};
// 5.1.1 Play apps (T43): Music's album menu (Download, Add to playlist, Go to artist, Start instant mix), now playing's
// Save queue, the search MORE list and Music settings from the drawer; Movies' download pin, Manage downloads and
// Settings; Books' card menu, Sort, the reader's bookmark and Settings; Games' player page, Dismiss and Settings.
const lpPlayMore = async h => {
  const prefs = async app => ((await store(h, 'playPrefs')) || {})[app] || {};
  const tapCardDots = sel => h.tap(`${sel} .pa-dots`);
  const menuItem = async (action, id) => { await h.until(`!!document.querySelector('.lpx-menu, .lpa-menu')`); await h.tap(`[data-action="${action}"]${id !== undefined ? `[data-id="${id}"]` : ''}`); };
  const menuText = () => `[...document.querySelectorAll('.lpx-menu button')].map(b => b.textContent).join('|')`;
  const drawerSettings = async () => { await h.tap('#viewport [data-action="pa-drawer"]'); await h.tap('[data-action="px-settings"]'); };
  // Music
  await h.openApp('play-music');
  h.check('opens Listen Now', await h.until(`!!document.querySelector('#viewport .pa-card[data-action="pa-album"]')`));
  const album = await h.ev(`document.querySelector('#viewport .pa-card[data-action="pa-album"]').dataset.id`);
  await tapCardDots(`#viewport .pa-card[data-id="${album}"]`);
  h.check('an album\'s menu has Music 5.8\'s entries', await h.until(`${menuText()} === 'Start instant mix|Shuffle|Play next|Add to queue|Add to playlist|Download|Go to artist|Shop this artist'`), await h.ev(menuText()));
  await menuItem('px-keep');
  h.check('Download marks the album', (await store(h, 'playMusicKept'))?.includes(album) && await h.until(`!!document.querySelector('#viewport .pa-card[data-id="${album}"] .pa-kept')`));
  await tapCardDots(`#viewport .pa-card[data-id="${album}"]`);
  h.check('the menu then offers Remove download', await h.until(`${menuText()}.includes('Remove download')`));
  await menuItem('px-dialog', `playlist:album:${album}`);
  await h.tap('.lpx-dialog [data-action="px-new-playlist"]');
  await h.type('[data-lpx-edit]', 'Road trip');
  await h.tap('.lpx-dialog [data-action="px-create-playlist"]');
  const music = await store(h, 'music');
  h.check('Add to playlist makes the playlist with the album', music?.playlists?.some(p => p.name === 'Road trip' && p.tracks.length > 0), JSON.stringify(music?.playlists));
  h.check('the created toast', await h.until(`/Road trip/.test(document.querySelector('.toast')?.textContent || '')`));
  await tapCardDots(`#viewport .pa-card[data-id="${album}"]`);
  await menuItem('px-artist');
  h.check('Go to artist opens the artist\'s albums', await h.until(`!!document.querySelector('#viewport .lpx-page .pa-card')`));
  await h.key('Escape');
  await tapCardDots(`#viewport .pa-card[data-id="${album}"]`);
  await menuItem('px-mix');
  h.check('Start instant mix plays', await h.until(`!!document.querySelector('#viewport .pm-now')`));
  await h.tap('#viewport [data-action="px-np"]');
  h.check('now playing\'s menu', await h.until(`${menuText()} === 'Start instant mix|Add to playlist|Go to artist|Go to album|Clear queue|Save queue'`), await h.ev(menuText()));
  await menuItem('px-dialog', 'save-queue');
  await h.type('[data-lpx-edit]', 'Queue copy');
  await h.tap('.lpx-dialog [data-action="px-create-playlist"]');
  h.check('Save queue keeps the queue', (await store(h, 'music'))?.playlists?.some(p => p.name === 'Queue copy' && p.tracks.length > 1));
  await h.key('Escape');
  await drawerSettings();
  h.check('the drawer\'s Settings opens Music settings', await h.until(`!!document.querySelector('#viewport .lpx-music .lpx-row[data-id="quality"]')`));
  await h.tap('#viewport .lpx-row[data-id="quality"]');
  await h.tap('.lpx-dialog [data-id="music:quality:high"]');
  await h.tap('#viewport .lpx-row[data-id="music:streamWifi"]');
  const mp = await prefs('music');
  h.check('Music settings keep their choices', mp.streamWifi === true && mp.quality === 'high' && await h.until(`/High/.test(document.querySelector('#viewport .lpx-row[data-id="quality"]')?.textContent || '') && document.querySelector('#viewport .lpx-row[data-id="quality"]').disabled`), JSON.stringify(mp));
  await h.key('Escape');
  await h.tap('#viewport [data-action="pa-search"]');
  // The demo library never passes a cluster's 4 / 5 limit, so the MORE page is opened the way its chip opens it.
  await h.type('#viewport [data-pa-search]', 'i');
  await h.until(`document.querySelectorAll('#viewport .pm-song').length >= 1`);
  const found = await h.ev(`document.querySelectorAll('#viewport .pm-song').length`);
  await h.ev(`(()=>{const el=document.createElement('button');el.dataset.action='px-more';el.dataset.id='songs';document.querySelector('#viewport').firstElementChild.append(el);el.click();el.remove()})()`);
  h.check('the MORE page lists every song found', await h.until(`document.querySelectorAll('#viewport .lpx-page .pm-song').length === ${found}`));
  await h.key('Escape');
  h.check('Back returns to the search', await h.until(`!!document.querySelector('#viewport [data-pa-search]')`));
  // Movies
  await h.openApp('play-movies');
  const movie = await h.ev(`document.querySelector('#viewport .pa-pin')?.dataset.id`);
  await h.tap(`#viewport .pa-pin[data-id="${movie}"]`);
  h.check('the pin downloads the movie', (await store(h, 'playMoviesDevice'))?.includes(movie) && await h.until(`!!document.querySelector('#viewport .pa-pin.on[data-id="${movie}"]')`));
  await drawerSettings();
  await h.tap('#viewport .lpx-row[data-id="manage-downloads"]');
  h.check('Manage downloads lists it', await h.until(`!!document.querySelector('#viewport .lpx-page .pa-card[data-id="${movie}"]')`));
  await tapCardDots(`#viewport .lpx-page .pa-card[data-id="${movie}"]`);
  await menuItem('px-movie-pin', movie);
  h.check('Remove download empties the list', await h.until(`!!document.querySelector('#viewport .lpx-empty')`));
  await h.key('Escape');
  await h.tap('#viewport .lpx-row[data-id="network"]');
  await h.tap('.lpx-dialog [data-id="movies:network:1"]');
  await h.tap('#viewport .lpx-row[data-id="movies:restrict"]');
  const vp = await prefs('movies');
  h.check('Movies settings keep their choices', vp.network === 1 && vp.restrict === true, JSON.stringify(vp));
  // Books
  await h.openApp('play-books');
  await h.ev(`(()=>{const el=document.createElement('button');el.dataset.action='pa-page';el.dataset.id='library';document.querySelector('#viewport').firstElementChild.append(el);el.click();el.remove()})()`);
  const book = await h.ev(`document.querySelector('#viewport .pa-card[data-action="pa-book"]').dataset.id`);
  await tapCardDots(`#viewport .pa-card[data-id="${book}"]`);
  h.check('a book\'s menu', await h.until(`${menuText()} === 'Remove download|Delete from library|About this book'`), await h.ev(menuText()));
  await menuItem('px-book-keep', book);
  h.check('Remove download drops the mark', (await store(h, 'playBooksState'))?.notKept?.includes(book) && await h.until(`!document.querySelector('#viewport .pa-card[data-id="${book}"] .pa-kept')`));
  await tapCardDots(`#viewport .pa-card[data-id="${book}"]`);
  await menuItem('px-dialog', `remove-book:${book}`);
  await h.tap('.lpx-dialog [data-action="px-remove-book"]');
  h.check('Delete from library removes it', await h.until(`!document.querySelector('#viewport .pa-card[data-id="${book}"]')`));
  await h.tap('#viewport [data-action="px-dialog"][data-id="sort"]');
  await h.tap('.lpx-dialog [data-id="title"]');
  const titles = await h.ev(`[...document.querySelectorAll('#viewport .pa-card b')].map(b => b.textContent)`);
  h.check('Sort by Title orders the library', titles.length > 1 && JSON.stringify(titles) === JSON.stringify([...titles].sort((a, b) => a.localeCompare(b, 'en'))), JSON.stringify(titles));
  await h.tap('#viewport .pa-card[data-action="pa-book"]');
  await h.until(`!!document.querySelector('#viewport .pb-reader')`);
  await h.tap('#viewport [data-action="px-reader-menu"]');
  h.check('the reader\'s overflow', await h.until(`${menuText()} === 'About this book|Share|Add bookmark|Read aloud|Settings|Help & feedback'`), await h.ev(menuText()));
  await menuItem('px-bookmark');
  h.check('Add bookmark saves the page', Object.values((await store(h, 'playBookmarks')) || {}).some(list => list.length === 1));
  await h.tap('#viewport [data-action="bk-toc"]');
  await h.tap('#viewport [data-action="bk-toc-tab"][data-id="bookmarks"]');
  h.check('Contents lists the bookmark', await h.until(`document.querySelectorAll('#viewport .bk33-toc-list button').length === 1`));
  await h.key('Escape');
  await h.tap('#viewport [data-action="px-reader-menu"]');
  await menuItem('px-page', 'books-settings');
  await h.tap('#viewport .lpx-row[data-id="books:volumeKeys"]');
  h.check('Books settings keep their choices', (await prefs('books')).volumeKeys === true);
  await h.key('Escape');
  h.check('Back from Settings returns to the reader', await h.until(`!!document.querySelector('#viewport .pb-reader')`));
  // Games
  await h.openApp('play-games');
  await h.tap('#viewport .pa-card[data-action="px-player"]');
  h.check('a player opens their page', await h.until(`!!document.querySelector('#viewport .lpx-player')`));
  await h.key('Escape');
  const player = await h.ev(`document.querySelector('#viewport .pa-card[data-action="px-player"]').dataset.id`);
  await tapCardDots(`#viewport .pa-card[data-id="${player}"]`);
  await menuItem('px-dismiss');
  h.check('Dismiss takes the player off', await h.until(`!document.querySelector('#viewport .pa-card[data-id="${player}"]')`));
  await h.tap('#viewport [data-action="pa-menu"]');
  await menuItem('px-page', 'games-settings');
  await h.tap('#viewport .lpx-row[data-id="games:requests"]');
  await h.tap('#viewport .lpx-row[data-id="profile"]');
  await h.tap('.lpx-dialog [data-id="games:profile:hidden"]');
  const gp = await prefs('games');
  h.check('Games settings keep their choices', gp.requests === false && gp.profile === 'hidden', JSON.stringify(gp));
};
// 4.3 Play apps (T43): Music 5.0's album menu (Keep on device, Add to playlist, Go to artist, Start instant mix), now
// playing's Save as playlist, the search MORE list and Music settings; Movies 2.5.4's download pin, Remove from this
// device and Settings; Books 2.8's card menu, Sort, the reader's bookmark and Settings.
const jbPlayMore = async h => {
  const prefs = async app => ((await store(h, 'playPrefs')) || {})[app] || {};
  const menuItem = async (action, id) => { await h.until(`!!document.querySelector('.pmx-menu, .holo-menu')`); await h.tap(`[data-action="${action}"]${id !== undefined ? `[data-id="${id}"]` : ''}`); };
  const menuText = () => `[...document.querySelectorAll('.pmx-menu button')].map(b => b.textContent).join('|')`;
  // Music
  await h.openApp('play-music');
  h.check('opens Listen Now', await h.until(`!!document.querySelector('#viewport .pa-card[data-action="pa-album"]')`));
  const album = await h.ev(`document.querySelector('#viewport .pa-card[data-action="pa-album"]').dataset.id`);
  await h.tap(`#viewport .pa-card[data-id="${album}"] .pa-dots`);
  h.check('an album\'s menu has Music 5.0\'s entries', await h.until(`${menuText()} === 'Start instant mix|Play next|Add to queue|Keep on device|Add to playlist|Go to artist|Shop this artist'`), await h.ev(menuText()));
  await menuItem('px-keep');
  h.check('Keep on device marks the album', (await store(h, 'playMusicKept'))?.includes(album) && await h.until(`!!document.querySelector('#viewport .pa-card[data-id="${album}"] .pa-kept')`));
  await h.tap(`#viewport .pa-card[data-id="${album}"] .pa-dots`);
  await menuItem('px-dialog', `playlist:album:${album}`);
  await h.tap('.pmx-dialog [data-action="px-new-playlist"]');
  await h.type('[data-pmx-edit]', 'Road trip');
  await h.tap('.pmx-dialog [data-action="px-create-playlist"]');
  const music = await store(h, 'music');
  h.check('Add to playlist makes the playlist with the album', music?.playlists?.some(p => p.name === 'Road trip' && p.tracks.length > 0), JSON.stringify(music?.playlists));
  await h.tap(`#viewport .pa-card[data-id="${album}"] .pa-dots`);
  await menuItem('px-artist');
  h.check('Go to artist opens the artist\'s albums', await h.until(`!!document.querySelector('#viewport .pmx-page .pa-card')`));
  await h.key('Escape');
  await h.tap(`#viewport .pa-card[data-id="${album}"] .pa-dots`);
  await menuItem('px-mix');
  h.check('Start instant mix plays', await h.until(`!!document.querySelector('#viewport .pm-now')`));
  await h.tap('#viewport [data-action="px-np"]');
  h.check('now playing\'s menu', await h.until(`${menuText()} === 'Start instant mix|Add to playlist|Go to artist|Go to album|Clear queue|Save as playlist'`), await h.ev(menuText()));
  await menuItem('px-dialog', 'save-queue');
  await h.type('[data-pmx-edit]', 'Queue copy');
  await h.tap('.pmx-dialog [data-action="px-create-playlist"]');
  h.check('Save as playlist keeps the queue', (await store(h, 'music'))?.playlists?.some(p => p.name === 'Queue copy' && p.tracks.length > 1));
  await h.key('Escape');
  await h.tap('#viewport [data-action="pa-menu"]');
  await menuItem('px-page', 'music-settings');
  await h.tap('#viewport .pmx-row[data-id="music:streamHq"]');
  await h.tap('#viewport .pmx-row[data-id="music:cacheStreamed"]');
  const mp = await prefs('music');
  h.check('Music settings keep their choices', mp.streamHq === true && mp.cacheStreamed === false, JSON.stringify(mp));
  await h.key('Escape');
  await h.tap('#viewport [data-action="pa-search"]');
  // The demo library never passes a cluster's 4 / 5 limit, so the MORE page is opened the way its chip opens it.
  await h.type('#viewport [data-pa-search]', 'i');
  await h.until(`document.querySelectorAll('#viewport .pm-song').length >= 1`);
  const found = await h.ev(`document.querySelectorAll('#viewport .pm-song').length`);
  await h.ev(`(()=>{const el=document.createElement('button');el.dataset.action='px-more';el.dataset.id='songs';document.querySelector('#viewport').firstElementChild.append(el);el.click();el.remove()})()`);
  h.check('the MORE page lists every song found', await h.until(`document.querySelectorAll('#viewport .pmx-page .pm-song').length === ${found}`));
  await h.key('Escape');
  h.check('Back returns to the search', await h.until(`!!document.querySelector('#viewport [data-pa-search]')`));
  // Movies
  await h.openApp('play-movies');
  const movie = await h.ev(`document.querySelector('#viewport .mv25-pin button')?.dataset.id`);
  await h.tap(`#viewport .mv25-pin button[data-id="${movie}"]`);
  h.check('the pin downloads the movie', (await store(h, 'playMoviesDevice'))?.includes(movie) && await h.until(`!!document.querySelector('#viewport .mv25-pin.on img[src*="complete"]')`));
  await h.tap(`#viewport .mv25-pin.on button`);
  await menuItem('px-movie-pin', movie);
  h.check('Remove from this device takes it off', !(await store(h, 'playMoviesDevice'))?.includes(movie) && await h.until(`!document.querySelector('#viewport .mv25-pin.on')`));
  await h.tap('#viewport [data-action="pa-menu"]');
  await menuItem('px-page', 'movies-settings');
  await h.tap('#viewport .pmx-row[data-id="caption"]');
  await h.tap('.pmx-dialog [data-id="movies:captionSize:3"]');
  await h.tap('#viewport .pmx-row[data-id="movies:warning"]');
  const vp = await prefs('movies');
  h.check('Movies settings keep their choices', vp.captionSize === 3 && vp.warning === false, JSON.stringify(vp));
  // Books
  await h.openApp('play-books');
  await h.ev(`(()=>{const el=document.createElement('button');el.dataset.action='pa-page';el.dataset.id='library';document.querySelector('#viewport').firstElementChild.append(el);el.click();el.remove()})()`);
  const book = await h.ev(`document.querySelector('#viewport .bk28-card').dataset.id`);
  await h.tap(`#viewport .bk28-card[data-id="${book}"] .bk28-overflow`);
  h.check('a book\'s menu', await h.until(`${menuText()} === "Don't keep|Delete from library|About this book"`), await h.ev(menuText()));
  await menuItem('px-book-keep', book);
  h.check('Don\'t keep is saved', (await store(h, 'playBooksState'))?.notKept?.includes(book));
  await h.tap(`#viewport .bk28-card[data-id="${book}"] .bk28-overflow`);
  await menuItem('px-dialog', `remove-book:${book}`);
  await h.tap('.pmx-dialog [data-action="px-remove-book"]');
  h.check('Delete from library removes it', await h.until(`!document.querySelector('#viewport .bk28-card[data-id="${book}"]')`));
  await h.tap('#viewport [data-action="pa-menu"]');
  await menuItem('px-dialog', 'sort');
  await h.tap('.pmx-dialog [data-id="title"]');
  const titles = await h.ev(`[...document.querySelectorAll('#viewport .bk28-card .bk28-info b')].map(b => b.textContent)`);
  h.check('Sort by Title orders the library', titles.length > 1 && JSON.stringify(titles) === JSON.stringify([...titles].sort((a, b) => a.localeCompare(b, 'en'))), JSON.stringify(titles));
  await h.tap('#viewport .bk28-card');
  await h.until(`!!document.querySelector('#viewport .pb-reader')`);
  await h.tap('#viewport [data-action="px-reader-menu"]');
  h.check('the reader\'s overflow', await h.until(`${menuText()} === 'About this book|Share|Add bookmark|Read aloud|Settings|Help'`), await h.ev(menuText()));
  await menuItem('px-bookmark');
  h.check('Add bookmark saves the page', Object.values((await store(h, 'playBookmarks')) || {}).some(list => list.length === 1));
  await h.tap('#viewport [data-action="bk-toc"]');
  await h.tap('#viewport [data-action="bk-toc-tab"][data-id="bookmarks"]');
  h.check('Contents lists the bookmark', await h.until(`document.querySelectorAll('#viewport .bk28-toc-list button').length === 1`));
  await h.key('Escape');
  await h.tap('#viewport [data-action="px-reader-menu"]');
  await menuItem('px-page', 'books-settings');
  await h.tap('#viewport .pmx-row[data-id="books:volumeKeys"]');
  h.check('Books settings keep their choices', (await prefs('books')).volumeKeys === true);
  await h.key('Escape');
  h.check('Back from Settings returns to the reader', await h.until(`!!document.querySelector('#viewport .pb-reader')`));
};
// 4.0.4 System updates and TalkBack (T29): GSF's up-to-date screen and Check now; TalkBack's page, the security warning
// (Cancel keeps it off, OK turns it on), Explore by touch under System with its warning, TalkBack's own settings, Stop.
const icsA11y = async h => {
  const settings = async () => ((await store(h, 'settings')) || {});
  const sub = id => h.ev(`(()=>{const el=document.createElement('button');el.dataset.action='settings-sub';el.dataset.id=${JSON.stringify(id)};document.querySelector('#viewport').firstElementChild.append(el);el.click();el.remove()})()`);
  await h.openApp('settings');
  await sub('about');
  await h.tap('#viewport .settings-row[data-id="sysupdate"]');
  h.check('System updates opens the up-to-date screen', await h.until(`/Your system is currently up to date/.test(document.querySelector('#viewport .icsa-update h1')?.textContent || '') && /Last checked for update at /.test(document.querySelector('#viewport .icsa-update p')?.textContent || '')`));
  await h.tap('#viewport [data-action="icsa-check"]');
  h.check('Check now shows the progress bar', await h.until(`!!document.querySelector('#viewport .icsa-progress') && document.querySelector('#viewport [data-action="icsa-check"]').disabled`));
  h.check('the check ends up to date and is dated anew', await h.until(`!document.querySelector('#viewport .icsa-progress')`, 6000) && typeof (await settings()).updateChecked === 'number');
  await h.key('Escape');
  h.check('Back returns to About phone', await h.until(`!!document.querySelector('#viewport .settings-row[data-id="sysupdate"]')`));
  await h.key('Escape');
  await sub('accessibility');
  h.check('TalkBack is off and Explore by touch hidden', await h.until(`/Off/.test(document.querySelector('#viewport .settings-row[data-id="talkback"]')?.textContent || '') && !document.querySelector('#viewport [data-id="touch-exploration"]')`));
  await h.tap('#viewport .settings-row[data-id="talkback"]');
  h.check('TalkBack shows its description and switch', await h.until(`/spoken feedback/.test(document.querySelector('#viewport .icsa-desc')?.textContent || '') && !!document.querySelector('#viewport [data-action="icsa-tb-toggle"][aria-checked="false"]')`));
  await h.tap('#viewport [data-action="icsa-tb-toggle"]');
  h.check('turning it on asks "Use TalkBack?"', await h.until(`/Use TalkBack\\?/.test(document.querySelector('.icsa-warning h3')?.textContent || '') && /can collect all of the text you type/.test(document.querySelector('.icsa-warning p')?.textContent || '')`));
  await h.tap('.icsa-warning [data-action="close-overlay"]:not(.settings-dialog-scrim)');
  h.check('Cancel keeps it off', !(await settings()).talkback && await h.until(`!!document.querySelector('#viewport [data-action="icsa-tb-toggle"][aria-checked="false"]')`));
  await h.tap('#viewport [data-action="icsa-tb-toggle"]');
  await h.tap('.icsa-warning [data-action="icsa-tb-on"]');
  h.check('OK turns TalkBack on', (await settings()).talkback === true && await h.until(`!!document.querySelector('#viewport [data-action="icsa-tb-toggle"][aria-checked="true"]')`));
  await h.tap('#viewport [data-action="icsa-tb-settings"]');
  h.check('Settings opens TalkBack\'s preferences', await h.until(`!!document.querySelector('#viewport .settings-row[data-id="ringer"]')`));
  await h.tap('#viewport .settings-row[data-id="ringer"]');
  await h.tap('[data-action="icsa-pick"][data-id="ringer:2"]');
  await h.tap('#viewport .settings-row[data-id="soundback"]');
  const tp = (await store(h, 'talkbackPrefs')) || {};
  h.check('TalkBack\'s preferences are kept', tp.ringer === 2 && tp.soundback === false && await h.until(`document.querySelector('#viewport .settings-row[data-id="volume"]')?.disabled === true`), JSON.stringify(tp));
  await h.key('Escape');
  await h.key('Escape');
  h.check('Accessibility shows TalkBack on and Explore by touch', await h.until(`/On/.test(document.querySelector('#viewport .settings-row[data-id="talkback"]')?.textContent || '') && !!document.querySelector('#viewport .settings-row[data-id="touch-exploration"]')`));
  await h.tap('#viewport .settings-row[data-id="touch-exploration"]');
  await h.tap('#viewport [data-action="icsa-te-toggle"]');
  h.check('Explore by touch warns first', await h.until(`/changes the way your device responds to touch/.test(document.querySelector('.icsa-warning p')?.textContent || '')`));
  await h.tap('.icsa-warning [data-action="icsa-te-on"]');
  h.check('Explore by touch turns on', (await settings()).touchExploration === true);
  await h.key('Escape');
  await h.tap('#viewport .settings-row[data-id="talkback"]');
  await h.tap('#viewport [data-action="icsa-tb-toggle"]');
  h.check('turning it off asks "Stop TalkBack?"', await h.until(`/Stop TalkBack\\?/.test(document.querySelector('.icsa-warning h3')?.textContent || '')`));
  await h.tap('.icsa-warning [data-action="icsa-tb-off"]');
  const st = await settings();
  h.check('OK stops TalkBack and Explore by touch', st.talkback === false && st.touchExploration === false);
};
// 2.3.6 contact photo (T10): the editor's Take photo opens the Camera as a capture request; Cancel leaves the editor
// without a photo, Retake goes back to the shutter, OK returns the picture as the contact's photo, Done keeps it.
const gbContactPhoto = async h => {
  const act = (action, id) => h.ev(`(()=>{const el=document.createElement('button');el.dataset.action=${JSON.stringify(action)};${id !== undefined ? `el.dataset.id=${JSON.stringify(String(id))};` : ''}document.querySelector('#viewport').firstElementChild.append(el);el.click();el.remove()})()`);
  await h.openApp('people');
  await h.until(`!!document.querySelector('#viewport [data-action="gbp-contact"]')`);
  const person = {id: Number(await h.ev(`document.querySelector('#viewport [data-action="gbp-contact"]').dataset.id`))};
  await act('contact', person.id); await act('people-edit');
  h.check('the editor opens', await h.until(`!!document.querySelector('#viewport .gbce-photo')`));
  const shoot = async () => {
    await h.tap('#viewport .gbce-photo');
    await h.tap('[data-action="gbce-photo-take"]');
    h.check('Take photo opens the Camera with Cancel', await h.until(`!!document.querySelector('#viewport .gbcam-control.capture [data-action="gbcam-cap-cancel"]')`));
    await h.sleep(400);
    await h.tap('#viewport [data-action="gbcam-shutter"]');
    return h.until(`!!document.querySelector('#viewport [data-action="gbcam-cap-ok"]')`, 6000);
  };
  h.check('the shutter takes a picture for review', await shoot());
  await h.shot('gb-capture-review');
  await h.tap('#viewport [data-action="gbcam-cap-cancel"]');
  h.check('Cancel returns to the editor without a photo', await h.until(`!!document.querySelector('#viewport .gbce-photo:not(.has-photo)')`));
  h.check('the gallery got no picture from the request', !((await store(h, 'photos')) || []).some(p => p.created > Date.now() - 60000));
  await shoot();
  await h.tap('#viewport [data-action="gbcam-cap-retake"]');
  h.check('Retake goes back to the shutter', await h.until(`!!document.querySelector('#viewport .gbcam-control.capture [data-action="gbcam-shutter"]')`));
  await h.sleep(400);
  await h.tap('#viewport [data-action="gbcam-shutter"]');
  await h.until(`!!document.querySelector('#viewport [data-action="gbcam-cap-ok"]')`, 6000);
  await h.tap('#viewport [data-action="gbcam-cap-ok"]');
  h.check('OK returns the picture as the photo', await h.until(`!!document.querySelector('#viewport .gbce-photo.has-photo img')`));
  await h.tap('#viewport .gbce-buttonbar button[type="submit"]');
  const saved = (await store(h, 'contacts')).find(c => c.id === person.id), photos = (await store(h, 'contactPhotos')) || [];
  h.check('Done keeps the photo with the contact', !!saved?.photo && photos.some(p => p.id === saved.photo), JSON.stringify(saved?.photo));
};
// 4.3 / 4.4.4 / 5.1.1 Hangouts Take photo (T10): the attach menu's Take photo opens the Camera as an IMAGE_CAPTURE
// request; Cancel returns to the conversation without a picture, Retake goes back to the shutter, Done puts the picture
// into the draft, and sending it adds it to the conversation.
const hangoutsTakePhoto = async h => {
  const act = (action, id) => h.ev(`(()=>{const el=document.createElement('button');el.dataset.action=${JSON.stringify(action)};${id !== undefined ? `el.dataset.id=${JSON.stringify(String(id))};` : ''}document.querySelector('#viewport').firstElementChild.append(el);el.click();el.remove()})()`);
  const lp = await h.ev(`!!document.querySelector('link[href^="lp-camera.css"]')`);
  const shutter = lp ? '#viewport [data-gcam-shutter]' : '#viewport .jbcam-shutter';
  await h.openApp('hangouts');
  await h.until(`!!document.querySelector('#viewport [data-action="thread"]')`);
  const thread = await h.ev(`document.querySelector('#viewport [data-action="thread"]').dataset.id`);
  await act('thread', thread);
  h.check('the conversation opens', await h.until(`!!document.querySelector('#viewport .mms-compose')`));
  const take = async () => {
    await act('mms-attach');
    await h.tap('[data-action="hg-take-photo"]');
    // GoogleCamera 2.4 shows no Cancel before the shutter (Back cancels); the mode list is off during the request.
    h.check('Take photo opens the Camera for the request', await h.until(lp ? `!!document.querySelector('#viewport [data-gcam-shutter]') && !document.querySelector('#viewport [data-gcam-modes]')` : `!!document.querySelector('#viewport [data-action="cam-review-cancel"]')`));
    await h.sleep(700);
    await h.tap(shutter);
    return h.until(`!!document.querySelector('#viewport [data-action="cam-review-done"]') && !!document.querySelector('#viewport [data-action="cam-review-retake"]')`, 8000);
  };
  h.check('the shutter keeps the picture for review', await take());
  await h.shot('hangouts-capture-review');
  await h.tap('#viewport [data-action="cam-review-cancel"]');
  const draft = () => h.ev(`(()=>{const k=Object.keys(localStorage).find(k=>/^android-time-machine-\\w+-v1$/.test(k));const d=k&&JSON.parse(localStorage.getItem(k));const m=d?.messageDrafts||{};return (m[${JSON.stringify(thread)}]||m[${JSON.stringify('hg:' + thread)}])?.attachment||null})()`);
  h.check('Cancel returns to the conversation without a picture', await h.until(`!!document.querySelector('#viewport .mms-compose')`) && !(await draft()));
  await take();
  await h.tap('#viewport [data-action="cam-review-retake"]');
  h.check('Retake goes back to the shutter', await h.until(`!document.querySelector('#viewport [data-action="cam-review-done"]')`));
  await h.sleep(700);
  await h.tap(shutter);
  await h.until(`!!document.querySelector('#viewport [data-action="cam-review-done"]')`, 8000);
  const before = ((await store(h, 'photos')) || []).length;
  await h.tap('#viewport [data-action="cam-review-done"]');
  h.check('Done puts the picture into the draft', await h.until(`!!document.querySelector('#viewport .mms-compose')`) && !!(await draft()));
  h.check('the picture stays out of the Gallery', ((await store(h, 'photos')) || []).length === before);
};
// 2.3.6 Market (T21): the details page's content rating, Developer Info (View more applications, Send email to
// developer), Sharing through "Share via", and the content filter behind a PIN that really hides what it filters.
const gbMarketMore = async h => {
  const act = (action, id) => h.ev(`(()=>{const el=document.createElement('button');el.dataset.action=${JSON.stringify(action)};${id !== undefined ? `el.dataset.id=${JSON.stringify(String(id))};` : ''}document.querySelector('#viewport').firstElementChild.append(el);el.click();el.remove()})()`);
  const prefs = async () => (await store(h, 'marketPrefs')) || {};
  const detail = async () => { await h.openApp('play-store'); await act('gbmk-detail', 'orbit'); return h.until(`!!document.querySelector('#viewport .gbmk-devrow')`); };
  h.check('the details page shows the developer rows', await detail());
  h.check('the content rating is shown', await h.ev(`/Content rating: Medium maturity/.test(document.querySelector('#viewport .gbmk-desc')?.textContent || '')`));
  await h.tap('#viewport .gbmk-devrow[data-action="gbmk-dev-apps"]');
  h.check('View more applications lists the developer apps', await h.until(`[...document.querySelectorAll('#viewport .gbmk-row b')].some(b => b.textContent === 'Orbit Hopper')`));
  await detail();
  await h.tap('#viewport .gbmk-devrow[data-action="gbmk-dev-email"]');
  h.check('Send email to developer opens a message to the developer', await h.until(`[...document.querySelectorAll('#viewport input, #viewport textarea')].some(f => f.value === 'moonlightstudio@example.com')`));
  await detail();
  await h.tap('#viewport [data-action="gbmk-share"]');
  await h.tap('[data-action="gbmk-share-to"][data-id="messaging|orbit"]');
  h.check('Share via Messaging carries the Market link', await h.until(`!!document.querySelector('#viewport .mms-compose, #viewport .gbmms')`) && /market\.android\.com\/details\?id=com\.moonlightstudio\.orbithopper/.test((await store(h, 'messageDrafts'))?.new?.body || ''));
  await h.openApp('play-store'); await act('gbmk-settings');
  await h.until(`!!document.querySelector('#viewport .gbmk-lock.open')`);
  await h.tap('#viewport .gbmk-lock');
  await h.type('[data-gbmk-pin]', '1234'); await h.tap('[data-action="gbmk-pin-ok"]');
  h.check('Set PIN keeps the PIN and closes the lock', (await prefs()).pinCode === '1234' && await h.until(`!!document.querySelector('#viewport .gbmk-lock:not(.open)')`));
  await h.tap('#viewport [data-action="gbmk-filter"]');
  h.check('the filter asks for the PIN first', await h.until(`!!document.querySelector('[data-action="gbmk-pin-ok"][data-id="pin-enter"]')`));
  await h.type('[data-gbmk-pin]', '99'); await h.tap('[data-action="gbmk-pin-ok"]');
  h.check('a wrong PIN keeps the filter closed', await h.until(`!!document.querySelector('[data-action="gbmk-pin-ok"][data-id="pin-enter"]')`));
  await h.type('[data-gbmk-pin]', '1234'); await h.tap('[data-action="gbmk-pin-ok"]');
  await h.until(`!!document.querySelector('[data-action="gbmk-filter-pick"]')`);
  await h.tap('[data-action="gbmk-filter-pick"][data-id="Medium maturity"]');
  await h.tap('[data-action="gbmk-filter-ok"]');
  await act('gbmk-section', 'games');
  await h.until(`!!document.querySelector('#viewport .gbmk-cat')`);
  const games = await h.ev(`document.querySelector('#viewport .gbmk-cat small')?.textContent || ''`);
  h.check('the filter hides the Medium maturity game', !games.includes('Orbit Hopper') && games.includes('Pixel Blocks'), games);
};
// 4.0.4 Play Store 3.4.7 (T21): Set or change PIN (typed twice), the user controls locked behind Unlock settings, a
// wrong PIN refused, and Content filtering that hides the ratings it does not allow.
const icsPlayFilter = async h => {
  const act = (action, id) => h.ev(`(()=>{const el=document.createElement('button');el.dataset.action=${JSON.stringify(action)};${id !== undefined ? `el.dataset.id=${JSON.stringify(String(id))};` : ''}document.querySelector('#viewport').firstElementChild.append(el);el.click();el.remove()})()`);
  const prefs = async () => (await store(h, 'marketPrefs')) || {};
  const pin = async value => { await h.type('[data-icsp-pin]', value); await h.tap('[data-action="icsp-pin-ok"]'); };
  await h.openApp('play-store'); await act('icsp-settings');
  h.check('Unlock settings is off without a PIN', await h.until(`document.querySelector('#viewport [data-action="icsp-unlock"]')?.disabled === true`));
  await h.tap('#viewport [data-action="icsp-pin"]');
  await pin('1234');
  h.check('a new PIN is typed again to confirm', await h.until(`/Re-type to confirm/.test(document.querySelector('.icsp-dialog')?.textContent || '')`));
  await pin('1234');
  h.check('the PIN is kept and the user controls lock', (await prefs()).pinCode === '1234' && await h.until(`document.querySelector('#viewport [data-action="icsp-filter"]')?.disabled === true`));
  await h.tap('#viewport [data-action="icsp-unlock"]');
  await pin('99');
  h.check('a wrong PIN is refused', await h.until(`document.querySelector('[data-icsp-pin]')?.placeholder === 'Incorrect PIN'`));
  await pin('1234');
  h.check('Unlock settings opens the user controls', await h.until(`document.querySelector('#viewport [data-action="icsp-filter"]')?.disabled === false`));
  await h.tap('#viewport [data-action="icsp-filter"]');
  await h.tap('[data-action="icsp-filter-pick"][data-id="Medium maturity"]');
  await h.tap('[data-action="icsp-filter-ok"]');
  h.check('Content filtering keeps the choice', !((await prefs()).filter || []).includes('Medium maturity'));
  await act('icsp-section', 'games');
  await h.until(`/Pixel Blocks/.test(document.querySelector('#viewport')?.textContent || '')`);
  h.check('the filter hides the Medium maturity game', !(await h.ev(`/Orbit Hopper/.test(document.querySelector('#viewport').textContent)`)));
};
// 4.3 / 4.4.4 / 5.1.1 Play Store (T21): Share opens the chooser and the mail app's compose screen with the item's
// play.google.com link; 5.1.1 also expands the description with READ MORE and mails the developer with Send email.
const playShare = async h => {
  const act = (action, id) => h.ev(`(()=>{const el=document.createElement('button');el.dataset.action=${JSON.stringify(action)};${id !== undefined ? `el.dataset.id=${JSON.stringify(String(id))};` : ''}document.querySelector('#viewport').firstElementChild.append(el);el.click();el.remove()})()`);
  const fields = () => h.ev(`[...document.querySelectorAll('#viewport input, #viewport textarea')].map(f => f.value).join(' | ')`);
  const lp = await h.ev(`!!document.querySelector('link[href^="lp-play.css"]')`);
  await h.openApp('play-store'); await act('jbp-detail', 'orbit');
  h.check('the details page opens', await h.until(`!!document.querySelector('#viewport .jbp-scroll')`));
  if (lp) {
    await h.tap('#viewport [data-action="lpp-readmore"]');
    h.check('READ MORE expands the description', await h.until(`!document.querySelector('#viewport [data-action="lpp-readmore"]') && !!document.querySelector('#viewport .lpp-callout.expanded')`));
    await h.tap('#viewport [data-action="jbp-share"]');
  } else await act('jbp-share');
  h.check('Share opens the chooser', await h.until(`/Share "Orbit Hopper" via/.test(document.querySelector('.jbp-dlg, .lpp-dlg')?.textContent || '')`));
  await h.tap('[data-action="jbp-share-to"][data-id="gmail|orbit"]');
  h.check('Gmail gets the subject and the link', await h.until(`/Check out "Orbit Hopper"/.test([...document.querySelectorAll('#viewport input, #viewport textarea')].map(f => f.value).join(' '))`) && /play\.google\.com\/store\/apps\/details\?id=com\.moonlightstudio\.orbithopper/.test(await fields()), await fields());
  if (lp) {
    await h.openApp('play-store'); await act('jbp-detail', 'orbit');
    await h.until(`!!document.querySelector('#viewport [data-action="jbp-dev-email"]')`);
    await h.tap('#viewport [data-action="jbp-dev-email"]');
    h.check('Send email writes to the developer', await h.until(`[...document.querySelectorAll('#viewport input, #viewport textarea')].some(f => f.value.includes('moonlightstudio@example.com'))`), await fields());
  }
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
  {id: 'T11', version: '4.0.4', name: 'Contacts › Import/export and Set ringtone', run: contactsImportExport({listMenu: 'people-list-menu', victim: 'Taylor Lee', ringtone: true})},
  {id: 'T11', version: '4.3', name: 'Contacts › Import/export and Set ringtone', run: contactsImportExport({listMenu: 'people-list-menu', victim: 'Taylor Lee', ringtone: true})},
  {id: 'T11', version: '4.4.4', name: 'Contacts › Import/export and Set ringtone', run: contactsImportExport({listMenu: 'people-list-menu', victim: 'Taylor Lee', ringtone: true})},
  {id: 'T11', version: '5.1.1', name: 'Contacts › Import/export', run: contactsImportExport({listMenu: 'people-menu', victim: 'Taylor Lee', ringtone: false})},
  {id: 'T11', version: '4.0.4', name: 'Contacts › Contacts to display and Settings', run: contactsDisplay({listMenu: 'people-list-menu', row: '.people-row > span:last-of-type'})},
  {id: 'T11', version: '4.3', name: 'Contacts › Contacts to display and Settings', run: contactsDisplay({listMenu: 'people-list-menu', row: '.people-row > span:last-of-type'})},
  {id: 'T11', version: '4.4.4', name: 'Contacts › Contacts to display and Settings', run: contactsDisplay({listMenu: 'people-list-menu', row: '.people-row > span:last-of-type'})},
  {id: 'T11', version: '5.1.1', name: 'Contacts › Contacts to display and Settings', run: contactsDisplay({listMenu: 'people-menu', row: '.lpp-row[data-action="contact"] .lpp-name'})},
  {id: 'T11', version: '4.0.4', name: 'Contacts › Share and Share visible contacts', run: contactsShare({listMenu: 'people-list-menu'})},
  {id: 'T11', version: '4.3', name: 'Contacts › Share and Share visible contacts', run: contactsShare({listMenu: 'people-list-menu'})},
  {id: 'T11', version: '4.4.4', name: 'Contacts › Share and Share visible contacts', run: contactsShare({listMenu: 'people-list-menu'})},
  {id: 'T11', version: '5.1.1', name: 'Contacts › Share and Share visible contacts', run: contactsShare({listMenu: 'people-menu'})},
  {id: 'T11', version: '4.3', name: 'Contacts › Place on Home screen', run: contactsShortcut({page: 2})},
  {id: 'T11', version: '4.4.4', name: 'Contacts › Place on Home screen', run: contactsShortcut({page: 1})},
  {id: 'T11', version: '5.1.1', name: 'Contacts › Place on Home screen', run: contactsShortcut({page: 1})},
  {id: 'T08', version: '2.3.6', name: 'Browser and Google Mail › Select text', run: gbSelectText},
  {id: 'T12', version: '2.3.6', name: 'Maps › layers, Labs, cache, Places Add, Navigation Settings, Show on map', run: gbMapsLocal},
  {id: 'T12', version: '4.0.4', name: 'Maps › Settings, Cache settings; Latitude arrows', run: mapsSettings({maps6: true, latitude: true})},
  {id: 'T12', version: '4.3', name: 'Maps › My Places, Settings, Cache settings', run: mapsSettings({maps6: true, places: true})},
  {id: 'T12', version: '4.4.4', name: 'Maps › Settings, Maps history, Edit home or work, About', run: mapsSettings({version: '7.5.0'})},
  {id: 'T12', version: '5.1.1', name: 'Maps › Settings, Maps history, Your places, About', run: mapsSettings({version: '9.3.0', places: true})},
  {id: 'T10', version: '4.3', name: 'Hangouts › Take photo through the Camera capture request', run: hangoutsTakePhoto},
  {id: 'T10', version: '4.4.4', name: 'Hangouts › Take photo through the Camera capture request', run: hangoutsTakePhoto},
  {id: 'T10', version: '5.1.1', name: 'Hangouts › Take photo through the Camera capture request', run: hangoutsTakePhoto},
  {id: 'T21', version: '2.3.6', name: 'Market › Developer Info, Sharing, content rating and the PIN-guarded filter', run: gbMarketMore},
  {id: 'T21', version: '4.0.4', name: 'Play Store › PIN, Unlock settings and the content filter', run: icsPlayFilter},
  {id: 'T21', version: '4.3', name: 'Play Store › Share', run: playShare},
  {id: 'T21', version: '4.4.4', name: 'Play Store › Share', run: playShare},
  {id: 'T21', version: '5.1.1', name: 'Play Store › Share, READ MORE and Send email', run: playShare},
  {id: 'T10', version: '2.3.6', name: 'Contacts › Take photo through the Camera capture request', run: gbContactPhoto},
  {id: 'T13', version: '2.3.6', name: 'Messaging › Audio, Record audio, Capture picture / video, Slideshow', run: gbMmsAttach},
  {id: 'T13', version: '4.3', name: 'Messaging › Audio Play, Capture picture / video, Slideshow', run: jbMmsAttach},
  {id: 'T15', version: '2.3.6', name: 'Car Home Settings and Dock settings', run: gbCarDock},
  {id: 'T17', version: '2.3.6', name: 'Talk › Add to chat, Settings', run: gbTalk},
  {id: 'T17', version: '4.0.4', name: 'Talk › Display options, Add to chat, Friend info, Talk settings', run: icsTalk},
  {id: 'T20', version: '2.3.6', name: 'YouTube › Settings', run: gbYouTubeSettings},
  {id: 'T20', version: '4.0.4', name: 'YouTube › Search, Add to, Share, Copy URL, channel, Record and upload, Settings', run: icsYouTube},
  {id: 'T20', version: '4.3', name: 'YouTube › Add to, Like / Dislike, Copy URL, Share, Settings', run: jbYouTube},
  {id: 'T20', version: '4.4.4', name: 'YouTube › Settings', run: kkYouTubeSettings},
  {id: 'T20', version: '5.1.1', name: 'YouTube › Settings: General, Captions, Privacy, About', run: lpYouTubeSettings},
  {id: 'T25', version: '4.0.4', name: 'Google Search › Searchable items filter the suggestions', run: icsSearchableItems},
  {id: 'T25', version: '4.3', name: 'Google Search › Settings pages: Google Now, Notifications, My stuff, Voice, Phone search, Privacy', run: jbSearchSettings},
  {id: 'T25', version: '4.4.4', name: 'Google Search › Settings pages; Google Settings › Play Games', run: kkSearchSettings},
  {id: 'T25', version: '5.1.1', name: 'Google Search › Settings: the 4.1 headers and pages, Show cards', run: lpSearchSettings},
  {id: 'T28', version: '4.0.4', name: 'Navigation › Contacts / Starred places; Places › categories and search', run: icsNavPlaces},
  {id: 'T32', version: '4.3', name: 'Hangouts › Settings, Hangout requests, Blocked People, People & options, Add people', run: jbHangoutsOptions},
  {id: 'T32', version: '4.4.4', name: 'Hangouts › Settings, SMS, Invites, Blocked People, People & options, New group MMS', run: kkHangoutsOptions},
  {id: 'T32', version: '5.1.1', name: 'Hangouts › Settings, People & options, Blocked people, Add people; Messenger › People & options', run: lpHangoutsOptions},
  {id: 'T34', version: '4.3', name: 'Drive is not on the Nexus 4 image', run: jbNoDrive},
  {id: 'T34', version: '4.4.4', name: 'Drive › Add new, Sort by, Filter by, Move to, Rename, Offline, Remove, Refresh, Send, Settings', run: kkDriveFiles},
  {id: 'T34', version: '5.1.1', name: 'Drive › Create, Sort by, Filter by, Move, Rename, Keep on device, Remove, Refresh, Send file', run: lpDriveFiles},
  {id: 'T29', version: '4.0.4', name: 'Settings › System updates and TalkBack, its warnings, Explore by touch and settings', run: icsA11y},
  {id: 'T43', version: '4.3', name: 'Play Music / Movies / Books › menus, keep on device, bookmarks, sort, settings', run: jbPlayMore},
  {id: 'T43', version: '4.4.4', name: 'Play Music / Movies / Books / Games › menus, keep on device, sort, settings', run: kkPlayMore},
  {id: 'T43', version: '5.1.1', name: 'Play Music / Movies / Books / Games › menus, downloads, bookmarks, sort, settings', run: lpPlayMore},
  {id: 'T44', version: '5.1.1', name: 'Phone › Import/export and Settings', run: phoneSettings},
  {id: 'T44', version: '5.1.1', name: 'Phone › Settings › Calls and Advanced', run: phoneCallSettings},
  {id: 'T49', version: '4.4.4', name: 'Camera › Photo Sphere capture and the Gallery viewer', run: photoSphere({kk: true, hint: 'Align to start', rendering: 'Rendering photo sphere'})},
  {id: 'T49', version: '5.1.1', name: 'Camera › Lens Blur capture and the refocus viewer', run: lensBlur},
  {id: 'T49', version: '5.1.1', name: 'Camera › Photo Sphere capture and the Photos viewer', run: photoSphere({kk: false, hint: 'To start, keep dot inside circle', rendering: 'Processing photo sphere'})},
  {id: 'T33', version: '5.1.1', name: 'Clock › menu, Settings, Night mode, Cities search', run: clockSettings({home: 'Home', search: true})},
  {id: 'T33', version: '4.4.4', name: 'Clock › menu, Settings, Night mode, Cities search', run: clockSettings({home: 'Home', search: true})},
  {id: 'T33', version: '4.3', name: 'Clock › menu, Settings, Night mode', run: clockSettings({home: 'Home', search: false})},
  {id: 'T07', version: '5.1.1', name: 'Chrome › local settings pages', run: chromeSettings({engines: 5, content: 'content', siteToggle: true, extraPages: [['sites:all', 'All sites'], ['protected', 'Protected content'], ['translate', 'Google Translate'], ['sites:storage', 'Storage']], switches: [['', 'tabs_apps', 'document_mode', true], ['', 'bandwidth', 'reduce_data'], ['privacy', 'dnt', 'dnt'], ['privacy', 'contextual', 'contextual_search']]})},
  {id: 'T07', version: '4.4.4', name: 'Chrome › local settings pages', run: chromeSettings({engines: 5, content: 'content', extraPages: [['sites:all', 'Website settings']], external: `!!document.querySelector('#viewport .settings-app') && !document.querySelector('#viewport .chr-prefs')`, switches: [['bandwidth', 'reduce', 'reduce_data'], ['privacy', 'dnt', 'dnt'], ['content', 'protected', 'protected_content'], ['content', 'translate', 'translate']]})},
  {id: 'T07', version: '4.3', name: 'Chrome › local settings pages', run: chromeSettings({engines: 3, bing: 2, content: 'content', extraPages: [['sites:all', 'Website settings']], external: `!!document.querySelector('#viewport .gms-app') && !document.querySelector('#viewport .chr-prefs')`, switches: [['bandwidth', 'reduce', 'reduce_data'], ['privacy', 'dnt', 'dnt'], ['content', 'translate', 'translate']], checks: [['devtools', 'enable_remote_debugging']]})},
  {id: 'T06', version: '5.1.1', name: 'Gmail › Attach file through DocumentsUI', run: gmailAttachLP},
  {id: 'T05', version: '4.0.4', name: 'Camera › Video and Panorama', run: cameraModesICS},
  {id: 'T04', version: '2.3.6', name: 'Google Mail › Settings: account, confirm actions, label sync', run: gmailSettingsGB},
  {id: 'T04', version: '4.0.4', name: 'Gmail › Settings, Manage labels, Label settings', run: gmailSettingsICS},
  {id: 'T04', version: '4.3', name: 'Gmail › Settings: label sound, labels, days to sync', run: gmailSettings},
  {id: 'T04', version: '4.4.4', name: 'Gmail › Settings: label sound, labels, days to sync', run: gmailSettings},
  {id: 'T04', version: '5.1.1', name: 'Gmail › Settings: label sound, labels, days to sync, vacation responder', run: h => gmailSettings({...h, vacation: true})},
  {id: 'T09', version: '2.3.6', name: 'Email › Incoming and Outgoing settings', run: emailServersGB},
  {id: 'T09', version: '4.0.4', name: 'Email › Settings: quick responses, ringtone, server settings', run: emailSettings},
  {id: 'T09', version: '4.4.4', name: 'Email › Settings: quick responses, ringtone, server settings', run: emailSettings},
  {id: 'T09', version: '5.1.1', name: 'Email › Settings: quick responses, ringtone, server settings', run: emailSettings}
];

const args = process.argv.slice(2), picked = args.filter(a => /^T\d+/i.test(a)).map(a => a.toUpperCase());
const WIDTHS = args.includes('--desktop') ? ['desktop'] : args.includes('--phone') ? ['phone'] : ['desktop', 'phone'];
const only = args.includes('--version') ? args[args.indexOf('--version') + 1] : '';
const cases = CASES.filter(c => (!picked.length || picked.includes(c.id)) && (!only || c.version === only));
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
// A long press: held a second where a finger would rest.
async function hold(selector, ms = 1000) {
  await settled();
  const c = await center(selector);
  if (!c) throw new Error(`nothing to hold: ${selector}`);
  await mouse('mousePressed', c.x, c.y, 1); await sleep(ms); await mouse('mouseReleased', c.x, c.y, 0); await sleep(250);
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
  // h.shot(name): with SHOTS=1 in the environment, a screenshot of the step in tests/browser/artifacts/ to look at.
  const shot = async name => { if (!process.env.SHOTS) return; fs.mkdirSync(ARTIFACTS, {recursive: true}); const r = await send('Page.captureScreenshot', {format: 'png'}); if (r.result?.data) fs.writeFileSync(path.join(ARTIFACTS, `shot-${c.version}-${name}-${width}.png`), Buffer.from(r.result.data, 'base64')); };
  await c.run({ev, send, until, tap, hold, drag, type, key, openApp, sleep, check, phone, shot, save: () => ev(SAVE), reload: () => boot(c.version)});
  await sleep(400);
  const refusals = await ev(`window.__refusals || []`);
  check('no refusal on the way', !refusals.length, refusals.join(' | '));
  check('no exception', !errors.length, errors.join(' | '));
  for (const f of [...failed]) { const m = f.match(/^net::(?:ERR_CONNECTION_\w+|ERR_NO_BUFFER_SPACE) (\S+)$/); if (m && (await fetch(BASE + m[1]).catch(() => null))?.ok) failed.splice(failed.indexOf(f), 1); }
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
