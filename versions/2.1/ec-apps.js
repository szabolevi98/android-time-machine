/* Android 2.1: the image's launcher entries (every enabled LAUNCHER activity of /system/app, docs/tools/launcher-apps.py),
   with the label resource each one shows (ec-strings-apps.js) and its hdpi icon (docs/tools/image-icons.py, app-<id>.png).
   view is the simulator screen it opens. All applications lists them by label, as Launcher2's AllAppsList sorts.
   An app installed from the Market (docs/plans/play-apps.md, ec-market.js) joins the list while it is installed, with
   its own name, icon and view (EC.apps.add / remove), as the package manager's broadcast tells Launcher2. */
(() => {
  'use strict';
  const APPS = [
    ['browser', 'Browser/application_name'], ['calculator', 'Calculator/app_name'], ['calendar', 'Calendar/app_label'],
    ['camera', 'Camera/camera_label'], ['car-home', 'CarDock/application_name'], ['clock', 'DeskClock/app_label'],
    ['phone', 'Contacts/launcherDialer'], ['contacts', 'Contacts/contactsList'], ['email', 'Email/app_name'],
    ['facebook', 'Facebook/app_name'], ['gallery', 'Gallery3D/app_name'], ['news-weather', 'GenieWidget/app_name'],
    ['gmail', 'Gmail/activity_gmail'], ['goggles', 'GoogleGoggles/app_name_icon'], ['maps', 'Maps/MAPS_APP_NAME'],
    ['messaging', 'Mms/app_label'], ['music', 'Music/musicbrowserlabel'], ['settings', 'Settings/settings_label'],
    ['talk', 'Talk/app_label'], ['market', 'Vending/homepage_activity_name'], ['voice-dialer', 'VoiceDialer/voiceDialer'],
    ['voice-search', 'VoiceSearchWithKeyboard/appName'], ['youtube', 'YouTube/application_name'],
    ['amazon-mp3', 'com.amazon.mp3/dmusic_main_launcher_name'], ['google-voice', 'googlevoice/app_icon_name']
  ].map(([id, label]) => ({id, label, icon: `app-${id}.png`, view: id}));
  const T = () => EC.text('apps');
  const extra = [];
  const all = () => [...APPS, ...extra];
  EC.apps = {
    get list() { return all(); },
    get: id => all().find(app => app.id === id),
    label: id => { const app = all().find(a => a.id === id); return !app ? id : app.name || T().t(app.label); },
    // Collator order in the simulator's language, like the launcher's ApplicationInfo sort.
    sorted: () => all().sort((a, b) => EC.apps.label(a.id).localeCompare(EC.apps.label(b.id), EC.context?.locale?.() || 'en')),
    add(app) { if (!extra.some(x => x.id === app.id)) extra.push(app); },
    remove(id) { const i = extra.findIndex(x => x.id === id); if (i >= 0) extra.splice(i, 1); }
  };
})();
