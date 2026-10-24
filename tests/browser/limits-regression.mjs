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
  {id: 'T44', version: '5.1.1', name: 'Phone › Import/export and Settings', run: phoneSettings},
  {id: 'T49', version: '4.4.4', name: 'Camera › Photo Sphere capture and the Gallery viewer', run: photoSphere({kk: true, hint: 'Align to start', rendering: 'Rendering photo sphere'})},
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
  await c.run({ev, send, until, tap, hold, drag, type, key, openApp, sleep, check, phone, save: () => ev(SAVE), reload: () => boot(c.version)});
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
