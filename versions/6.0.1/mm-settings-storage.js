/* Android 6.0.1 Settings: Storage & USB (Settings.apk MTC20K), MM.settingsScreens.storage.
   - StorageSettings.refresh: with only the private internal volume and no portable one it opens PrivateVolumeSettings
     for "private" at once and finishes, so the tile shows that screen, titled with getBestVolumeDescription (the
     framework's storage_internal).
   - PrivateVolumeSettings.update: storage_summary.xml (the used size in storage_size_large's "^1 ^2", the number 36 sp
     in #607d8b with the unit small, "Used of" the total in Body1, the 8 dp progress bar), then ITEMS_SHOW_SHARED (the
     emulated shared storage is mounted): Apps, Images, Videos, Audio, Other, then Cached data and Explore; each summary
     is Formatter.formatFileSize of its measurement.
   - The total is the userdata partition's: the image's userdata.img is built for it, 2 844 160 blocks of 4 096 bytes
     (11 649 679 360 bytes, the 16 GB Nexus 5X); what is used is the simulator's own fresh-phone figures.
   - Apps opens the apps list; Cached data asks memory_clear_cache_title; Other explains storage_detail_dialog_other;
     Images, Videos, Audio and Explore open the Files app (DocumentsUI). */
(() => {
  'use strict';
  const T = () => MM.text('settings');
  const TOTAL = 2844160 * 4096;
  // The simulator's usage on a set-up phone: app data, a few screenshots, no media, the rest of the system's data.
  const ITEMS = [['apps', 'storage_detail_apps', 887619584], ['images', 'storage_detail_images', 13002342], ['videos', 'storage_detail_videos', 0],
    ['audio', 'storage_detail_audio', 0], ['other', 'storage_detail_other', 69206016]];
  const cached = c => c.data.settings.cacheCleared ? 0 : 109051904;
  const SYSTEM_DATA = 902823936;
  const used = c => ITEMS.reduce((a, i) => a + i[2], 0) + cached(c) + SYSTEM_DATA;

  function large(c, bytes) {
    // Formatter.formatBytes' value and unit, laid into storage_size_large with the unit small.
    const parts = MM.fileSize(c, bytes).split(/\s+/), unit = parts.pop(), value = parts.join(' ');
    return T().t('storage_size_large').split(/(\^[12])/).map(p => p === '^1' ? `<span>${c.safe(value)}</span>` : p === '^2' ? `<small>${c.safe(unit)}</small>` : c.safe(p)).join('');
  }
  function render(c) {
    const t = T(), u = used(c), pct = Math.floor(100 * u / TOTAL);
    const row = (key, title, summary) => `<button type="button" class="mmst-pref" data-action="mmsg-item" data-key="${key}"><span class="mmst-texts"><span class="mmst-title">${c.safe(title)}</span>${summary != null ? `<span class="mmst-summary">${c.safe(summary)}</span>` : ''}</span></button>`;
    return `<div class="mmst-list"><div class="mmsg-summary"><div class="mmsg-used">${large(c, u)}</div><div class="mmsg-of">${c.safe(t.fmt('storage_volume_used', null, MM.fileSize(c, TOTAL)))}</div>
      <div class="mmsg-bar"><i style="width:${pct}%"></i></div></div>
      ${ITEMS.map(([key, title, bytes]) => row(key, t.t(title), MM.fileSize(c, bytes))).join('')}${row('cached', t.t('storage_detail_cached'), MM.fileSize(c, cached(c)))}${row('explore', t.t('storage_menu_explore'), null)}</div>`;
  }
  MM.settingsScreens.storage = {
    title: () => T().t('framework/storage_internal'),
    render,
    action(c, name, el) {
      if (name !== 'mmsg-item') return false;
      const t = T(), key = el.dataset.key;
      if (key === 'apps') MM.settingsGo(c, 'apps', t.t('applications_settings'));
      else if (key === 'cached') c.dialog({title: t.t('memory_clear_cache_title'), message: t.t('memory_clear_cache_message'),
        buttons: [{label: t.t('cancel')}, {label: t.t('okay'), action: c => { c.data.settings.cacheCleared = true; c.save(); c.render(); }}]});
      else if (key === 'other') c.dialog({title: t.t('storage_detail_other'), message: t.t('storage_detail_dialog_other'), buttons: [{label: t.t('okay')}]});
      // PrivateVolumeSettings: Images / Videos / Audio browse MediaDocumentsProvider's roots, Explore the volume itself.
      else c.open('downloads', `root:${key === 'explore' ? 'storage' : key}`);
      return true;
    }
  };
})();
