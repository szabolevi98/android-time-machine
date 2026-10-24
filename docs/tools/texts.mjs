// Every generator of the simulator's text tables and the command that rebuilds its output from the factory images
// unpacked in _aosp/ (audit point 10). Run from the repository root:
//     node docs/tools/texts.mjs            rebuilds everything in place; `git status` then shows what a regeneration changes
//     node docs/tools/texts.mjs gb-        only the jobs whose command or output contains the filter
//     node docs/tools/texts.mjs --check    rebuilds everything and fails when an output differs from the committed one
// Outputs are generated: edit the template or the generator, never the output, and rerun.
import {spawnSync} from 'node:child_process';

const apk = (device, app, template, output) => ({cmd: ['python', 'docs/tools/apk-strings.py', device, app, template, output], out: [output]});
const JOBS = [
  // docs/tools/apk-strings.py: a template's __STRINGS__({"English": "resource"}) filled from one image.
  apk('crespo', 'TagGoogle', 'docs/templates/gb-extra-apps.template.js', 'versions/2.3.6/gb-extra-apps.js'),
  apk('crespo', 'Gmail', 'docs/templates/gb-gmail.template.js', 'versions/2.3.6/gb-gmail.js'),
  apk('crespo', 'GenieWidget', 'docs/templates/gb-google-apps.template.js', 'versions/2.3.6/gb-google-apps.js'),
  apk('crespo', 'Maps', 'docs/templates/gb-google-widgets.template.js', 'versions/2.3.6/gb-google-widgets.js'),
  apk('crespo', 'Maps', 'docs/templates/gb-maps.template.js', 'versions/2.3.6/gb-maps.js'),
  apk('crespo', 'Vending', 'docs/templates/gb-market.template.js', 'versions/2.3.6/gb-market.js'),
  apk('crespo', 'Talk2', 'docs/templates/gb-talk.template.js', 'versions/2.3.6/gb-talk.js'),
  apk('crespo', 'YouTube', 'docs/templates/gb-youtube.template.js', 'versions/2.3.6/gb-youtube.js'),
  apk('maguro', 'EmailGoogle', 'docs/templates/ics-email.template.js', 'versions/4.0.4/email.js'),
  apk('maguro', 'Maps', 'docs/templates/ics-extra-apps.template.js', 'versions/4.0.4/ics-extra-apps.js'),
  apk('maguro', 'DownloadProviderUi', 'docs/templates/holo-downloads.template.js', 'versions/4.0.4/ics-downloads.js'),
  apk('maguro', 'PlusOne', 'docs/templates/ics-google-apps.template.js', 'versions/4.0.4/ics-google-apps.js'),
  apk('maguro', 'Settings', 'docs/templates/ics-language.template.js', 'versions/4.0.4/ics-language.js'),
  apk('maguro', 'Music2', 'docs/templates/ics-play-music.template.js', 'versions/4.0.4/ics-play-music.js'),
  apk('maguro', 'Phonesky', 'docs/templates/ics-play.template.js', 'versions/4.0.4/ics-play.js'),
  apk('maguro', 'Mms', 'docs/templates/mms-strings.template.js', 'versions/4.0.4/mms-strings.js'),
  apk('maguro', 'Contacts', 'docs/templates/people-strings.template.js', 'versions/4.0.4/people-strings.js'),
  apk('maguro', 'Settings', 'docs/templates/settings-system.template.js', 'versions/4.0.4/settings-system.js'),
  apk('mako', 'CalendarGoogle', 'docs/templates/calendar-jb.template.js', 'versions/4.3/calendar.js'),
  apk('mako', 'EmailGoogle', 'docs/templates/email-4.3.template.js', 'versions/4.3/email.js'),
  apk('mako', 'Maps', 'docs/templates/jb-extra-apps.template.js', 'versions/4.3/jb-extra-apps.js'),
  apk('mako', 'DownloadProviderUi', 'docs/templates/holo-downloads.template.js', 'versions/4.3/jb-downloads.js'),
  apk('mako', 'Phonesky', 'docs/templates/jb-play.template.js', 'versions/4.3/jb-play.js'),
  apk('mako', 'Mms', 'docs/templates/mms-strings.template.js', 'versions/4.3/mms-strings.js'),
  apk('mako', 'Contacts', 'docs/templates/people-strings.template.js', 'versions/4.3/people-strings.js'),
  apk('mako', 'Settings', 'docs/templates/settings-system.template.js', 'versions/4.3/settings-system.js'),
  apk('hammerhead', 'CalendarGoogle', 'docs/templates/calendar-jb.template.js', 'versions/4.4.4/calendar.js'),
  apk('hammerhead', 'Phonesky', 'docs/templates/kk-play.template.js', 'versions/4.4.4/kk-play.js'),
  apk('hammerhead', 'Contacts', 'docs/templates/people-strings.template.js', 'versions/4.4.4/people-strings.js'),
  apk('hammerhead', 'Settings', 'docs/templates/settings-system.template.js', 'versions/4.4.4/settings-system.js'),
  apk('shamu', 'Phonesky', 'docs/templates/lp-play.template.js', 'versions/5.1.1/lp-play.js'),
  apk('shamu', 'GoogleContacts', 'docs/templates/people-strings.template.js', 'versions/5.1.1/people-strings.js'),
  apk('shamu', 'Settings', 'docs/templates/settings-system.template.js', 'versions/5.1.1/settings-system.js'),
  // Generators with their own templates or tables.
  {cmd: ['python', 'docs/tools/devopts.py', 'maguro'], out: ['versions/4.0.4/ics-devopts.js']},
  {cmd: ['python', 'docs/tools/devopts.py', 'mako'], out: ['versions/4.3/jb-devopts.js']},
  {cmd: ['python', 'docs/tools/devopts.py', 'hammerhead'], out: ['versions/4.4.4/kk-devopts.js']},
  {cmd: ['python', 'docs/tools/devopts.py', 'shamu'], out: ['versions/5.1.1/lp-devopts.js']},
  {cmd: ['python', 'docs/tools/holo-contact-editor.py'], out: ['versions/4.0.4/contact-editor.js', 'versions/4.3/contact-editor.js', 'versions/4.4.4/contact-editor.js']},
  {cmd: ['python', 'docs/tools/datetimepicker.py'], out: ['versions/4.3/dtp.js', 'versions/4.4.4/dtp.js', 'versions/5.1.1/dtp.js']},
  {cmd: ['python', 'docs/tools/timezonepicker.py'], out: ['versions/4.3/tzpicker.js', 'versions/4.4.4/tzpicker.js', 'versions/5.1.1/tzpicker.js']},
  {cmd: ['python', 'docs/tools/ics-gmail-strings.py'], out: ['versions/4.0.4/ics-gmail.js']},
  {cmd: ['python', 'docs/tools/alarm-strings.py'], out: ['versions/4.0.4/alarm-strings.js', 'versions/4.3/alarm-strings.js', 'versions/4.4.4/alarm-strings.js', 'versions/5.1.1/alarm-strings.js']},
  {cmd: ['python', 'docs/tools/lock-strings.py'], out: ['versions/4.0.4/lock-strings.js', 'versions/4.3/lock-strings.js', 'versions/4.4.4/lock-strings.js', 'versions/5.1.1/lock-strings.js']},
  {cmd: ['python', 'docs/tools/aosp-music-strings.py'], out: ['versions/4.0.4/music-strings.js', 'versions/4.3/music-strings.js']},
  {cmd: ['python', 'docs/tools/email-prefs.py'], out: ['versions/4.0.4/email-prefs.js', 'versions/4.3/email-prefs.js', 'versions/4.4.4/email-prefs.js', 'versions/5.1.1/email-prefs.js']},
  {cmd: ['python', 'docs/tools/stock-strings.py'], out: ['versions/4.0.4/stock-strings.js', 'versions/4.3/stock-strings.js', 'versions/4.4.4/stock-strings.js', 'versions/5.1.1/stock-strings.js']},
  {cmd: ['python', 'docs/tools/maps-prefs.py'], out: ['versions/4.0.4/maps-prefs.js', 'versions/4.3/maps-prefs.js', 'versions/4.4.4/maps-prefs.js', 'versions/5.1.1/maps-prefs.js']},
  {cmd: ['python', 'docs/tools/news-prefs.py'], out: ['versions/2.3.6/news-prefs.js', 'versions/4.0.4/news-prefs.js', 'versions/4.3/news-prefs.js', 'versions/4.4.4/news-prefs.js']},
  {cmd: ['python', 'docs/tools/dc-cities.py'], out: ['versions/4.3/dc-cities.js', 'versions/4.4.4/dc-cities.js', 'versions/5.1.1/dc-cities.js']},
  {cmd: ['python', 'docs/tools/chrome-pak.py'], out: ['versions/4.3/chrome-pak.js', 'versions/4.4.4/chrome-pak.js']},
  {cmd: ['python', 'docs/tools/calendar-timezones.py'], out: ['versions/4.0.4/calendar-timezones.js']},
  {cmd: ['python', 'docs/tools/lp-sync-adapters.py'], out: ['versions/5.1.1/lp-sync-adapters.js']},
  {cmd: ['python', 'docs/tools/lp-sync-adapters.py', 'maguro'], out: ['versions/4.0.4/ics-sync-adapters.js']},
  {cmd: ['python', 'docs/tools/lp-email-strings.py'], env: {LMY48Y_SYSTEM: '_aosp/shamu/system'}, out: ['versions/5.1.1/lp-email-strings.js']},
  {cmd: ['python', 'docs/tools/lp-strings.py'], env: {LMY48Y_SYSTEM: '_aosp/shamu/system'}, out: ['versions/5.1.1/lp-strings.js']},
  // Gingerbread: the GRK39F tables (docs/tools/image_res.py reads _aosp/crespo).
  ...['contacts', 'phone', 'mms', 'calculator', 'deskclock', 'browser', 'email', 'gallery', 'camera', 'framework', 'settings2', 'accounts',
    'search', 'downloads', 'wallpapers', 'calendar', 'network', 'phonenet', 'contactsio'].map(app => ({cmd: ['python', 'docs/tools/gb-strings.py', app], out: [`versions/2.3.6/gb-strings-${app}.js`]})),
  {cmd: ['python', 'docs/tools/gb-settings-strings.py'], out: ['versions/2.3.6/gb-settings-strings.js']},
  {cmd: ['python', 'docs/tools/gb-music-strings.py'], out: ['versions/2.3.6/gb-strings-music.js']},
  {cmd: ['python', 'docs/tools/gb-voice-settings.py'], out: ['versions/2.3.6/gb-voice-settings.js']},
  {cmd: ['python', 'docs/tools/gb-timezones.py'], out: ['versions/2.3.6/gb-timezones.js']},
  // The shared AndroidI18n rows each image words its own way (docs/data/image-strings-<v>.res).
  ...['2.3.6', '4.0.4', '4.3', '4.4.4', '5.1.1'].map(v => ({cmd: ['node', 'docs/tools/image-strings.mjs', v], out: [`versions/${v}/image-strings.js`, `docs/reports/image-strings-${v}.tsv`]})),
  {cmd: ['node', 'docs/tools/text-survey.mjs', '--md', 'docs/reports/text-survey.md'], out: ['docs/reports/text-survey.md']},
];

const check = process.argv.includes('--check'), filter = process.argv.slice(2).find(a => !a.startsWith('--')) || '';
let failed = 0;
for (const job of JOBS) {
  if (filter && !job.cmd.join(' ').includes(filter) && !job.out.some(o => o.includes(filter))) continue;
  const run = spawnSync(job.cmd[0], job.cmd.slice(1), {encoding: 'utf8', env: {...process.env, PYTHONIOENCODING: 'utf-8', ...job.env}});
  const ok = run.status === 0;
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${job.cmd.slice(1).join(' ')}${ok ? '' : '\n' + (run.stderr || run.stdout).trim().split('\n').slice(-4).join('\n')}`);
}
if (failed) process.exit(1);
if (check) {
  // Regenerability: every output must come out as committed.
  const outputs = JOBS.filter(job => !filter || job.cmd.join(' ').includes(filter) || job.out.some(o => o.includes(filter))).flatMap(job => job.out);
  const changed = spawnSync('git', ['status', '--porcelain', '--', ...outputs], {encoding: 'utf8'}).stdout.trim();
  console.log(changed ? 'changed after regeneration:\n' + changed : 'every output is as committed');
  if (changed) process.exit(1);
}
export {JOBS};
