/* Android 6.0.1: four small apps of MTC20K, each on its own APK's resources.
   - 'downloads': the launcher's Downloads (DownloadProviderUi) only forwards (Theme.NoDisplay) to DocumentsUI's
     Downloads root (DownloadProvider's root_downloads): activity.xml's toolbar in DocumentsTheme's colorPrimary
     material_blue_grey_800 #37474f (the status bar material_blue_grey_900 #263238) with the roots button
     (ic_hamburger_alpha), the root's title, search, the grid / list toggle and the overflow (Sort by: By name, By date
     modified, By size; Show internal storage); fragment_directory.xml's "No items" on material_grey_50; the roots
     drawer (256 dp: Recent, Downloads).
   - 'android-pay' (Android Pay 1.0, app/Wallet): the white toolbar (colorPrimaryDark quantum_grey500 #9e9e9e) with the
     Android Pay logo, the empty card list with tp_placeholder_card and "Add a credit or debit card", the + FAB; How to
     pay in the overflow.
   - 'project-fi' (app/Tycho): the demo account is not a Project Fi subscriber, so the app shows its own activation
     error (activation_error_title, activation_error_account_setup) under the google_green toolbar.
   - 'device-policy' (DMAgent 6.81): dm_introduction_activity.xml — the #3aa3db toolbar "Google Apps Device Policy"
     (status #0099cc), introduction_text and info_shared_admin, and the NEXT button over a 1 dp #cccccc line. */
(() => {
  'use strict';
  const T = () => MM.text('smallapps');
  const esc = (c, s) => c.safe(s);
  const bar = (c, title, color, dark, actions = '', lead = '') => `<div class="mmsa-bar${dark ? ' dark' : ''}" style="background:${color}">${lead}<span class="mmsa-title">${esc(c, title)}</span>${actions}</div>`;
  /* GET_CONTENT for images (the launcher's "My photos"): DocumentsUI at its Recent root, the images as
     item_doc_grid.xml tiles (the thumbnail, the file name the camera gives, the date); the roots drawer opens under
     title_open ("Open from"). The picture chosen goes back to the asking app. */
  function pickImage(c) {
    const t = T(), u = c.ui.downloads, w = MM.text('wallpapers');
    const pad = n => String(n).padStart(2, '0');
    const name = p => { const d = new Date(p.time); return `IMG_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}.jpg`; };
    const list = (MM.media?.photos(c) || []).filter(p => !p.trashed && p.kind !== 'video').sort((a, b) => b.time - a.time);
    const tiles = list.map(p => `<button type="button" class="mmsa-doc" data-action="mmsa-pickone" data-id="${p.id}">${MM.media.svg(p, 'mmsa-docsvg', 1)}<span><b>${esc(c, name(p))}</b><small>${esc(c, new Intl.DateTimeFormat(c.locale(), {month: 'short', day: 'numeric'}).format(new Date(p.time)))}</small></span></button>`).join('');
    const roots = u.roots ? `<div class="mmsa-scrim" data-action="mmsa-roots"></div><div class="mmsa-roots"><div class="mmsa-rbar"><span>${esc(c, w.t('DocumentsUI/title_open'))}</span></div><button type="button" class="mmsa-root on" data-action="mmsa-roots"><img src="assets/du-ic_root_recent_alpha.png" alt=""><span>${esc(c, t.t('DocumentsUI/root_recent'))}</span></button><button type="button" class="mmsa-root" data-action="mmsa-roots"><img src="assets/du-ic_root_download_alpha.png" alt=""><span>${esc(c, t.t('DownloadProvider/root_downloads'))}</span></button></div>` : '';
    const btn = (img, action) => `<button type="button" class="mmsa-btn" data-action="${action}"><img src="assets/du-${img}.png" alt=""></button>`;
    return `<div class="mmsa">${bar(c, t.t('DocumentsUI/root_recent'), '#37474f', true, btn('ic_menu_search_alpha', 'mmsa-missing'), btn('ic_hamburger_alpha', 'mmsa-roots'))}
      <div class="mmsa-page grey">${tiles ? `<div class="mmsa-docs">${tiles}</div>` : `<div class="mmsa-empty">${esc(c, t.t('DocumentsUI/empty'))}</div>`}</div>${roots}</div>`;
  }
  MM.register('downloads', {
    statusColor: () => '#263238',
    render(c) {
      if (c.ui.sub === 'pick:wallpaper') { c.ui.sub = ''; c.ui.downloads = {grid: true, roots: false, pick: true}; }
      if (c.ui.downloads?.pick) return pickImage(c);
      const t = T(), u = c.ui.downloads || (c.ui.downloads = {grid: false, roots: false});
      const btn = (img, action, label) => `<button type="button" class="mmsa-btn" data-action="${action}" aria-label="${esc(c, label)}"><img src="assets/du-${img}.png" alt=""></button>`;
      const roots = u.roots ? `<div class="mmsa-scrim" data-action="mmsa-roots"></div><div class="mmsa-roots"><div class="mmsa-rbar"></div><button type="button" class="mmsa-root" data-action="mmsa-roots"><img src="assets/du-ic_root_recent_alpha.png" alt=""><span>${esc(c, t.t('DocumentsUI/root_recent'))}</span></button><button type="button" class="mmsa-root on" data-action="mmsa-roots"><img src="assets/du-ic_root_download_alpha.png" alt=""><span>${esc(c, t.t('DownloadProvider/root_downloads'))}</span></button></div>` : '';
      return `<div class="mmsa">${bar(c, t.t('DownloadProvider/root_downloads'), '#37474f', true, `${btn('ic_menu_search_alpha', 'mmsa-missing', t.t('DocumentsUI/menu_search'))}${btn(u.grid ? 'ic_menu_view_list_alpha' : 'ic_menu_view_grid_alpha', 'mmsa-grid', t.t(u.grid ? 'DocumentsUI/menu_list' : 'DocumentsUI/menu_grid'))}${MM.menu.button(c, 'mmsa-over')}`, btn('ic_hamburger_alpha', 'mmsa-roots', ''))}
        <div class="mmsa-page grey"><div class="mmsa-empty">${esc(c, t.t('DocumentsUI/empty'))}</div></div>${roots}</div>`;
    },
    back(c) { const u = c.ui.downloads; if (u?.roots) { u.roots = false; c.render(); return true; } if (u?.pick) c.ui.downloads = null; return false; },
    action(name, el, event, c) {
      const t = T(), u = c.ui.downloads;
      if (name === 'mmsa-roots') { u.roots = !u.roots; c.render(); return true; }
      if (name === 'mmsa-grid') { u.grid = !u.grid; c.render(); return true; }
      if (name === 'mm-menu') { c.menu([{label: t.t('DocumentsUI/menu_sort'), action: c => c.dialog({title: t.t('DocumentsUI/menu_sort'), items: ['DocumentsUI/sort_name', 'DocumentsUI/sort_date', 'DocumentsUI/sort_size'].map(k => ({html: c.safe(t.t(k))}))})}, {label: t.t('DocumentsUI/menu_advanced_show'), action: () => {}}]); return true; }
      if (name === 'mmsa-missing') { c.open('missing-documents-search'); return true; }
      if (name === 'mmsa-pickone') { c.ui.downloads = null; MM.wallpaperPicked?.(c, +el.dataset.id); c.back(); return true; }
      return false;
    }
  });
  MM.register('android-pay', {
    statusColor: () => '#9e9e9e',
    render(c) {
      const t = T();
      return `<div class="mmsa">${bar(c, t.t('Wallet/application_name'), '#fff', false, MM.menu.button(c, 'mmsa-over light'), '<img class="mmsa-logo" src="assets/wa-tp_logo_android_pay_color_48dp.png" alt="">')}
        <div class="mmsa-page"><div class="mmsa-pay"><img src="assets/wa-tp_placeholder_card_color_296x187dp.png" alt=""><b>${esc(c, t.t('Wallet/add_payment_card_headline'))}</b></div></div>
        <button type="button" class="mmsa-fab" data-action="mmsa-addcard" aria-label="${esc(c, t.t('Wallet/action_add_payment_card'))}"><img src="assets/wa-ic_add.png" alt=""></button></div>`;
    },
    action(name, el, event, c) {
      if (name === 'mmsa-addcard') { c.open('missing-android-pay-add-card'); return true; }
      if (name === 'mm-menu') { c.menu([{label: T().t('Wallet/menu_item_warm_welcome'), action: c => c.open('missing-android-pay-how-to-pay')}]); return true; }
      return false;
    }
  });
  MM.register('project-fi', {
    statusColor: () => '#0b8043',
    render(c) {
      const t = T();
      return `<div class="mmsa">${bar(c, t.t('Tycho/app_name'), '#0f9d58', true)}<div class="mmsa-page"><div class="mmsa-text"><h1>${esc(c, t.t('Tycho/activation_error_title'))}</h1><p>${esc(c, t.t('Tycho/activation_error_account_setup'))}</p></div></div></div>`;
    }
  });
  MM.register('device-policy', {
    statusColor: () => '#0099cc',
    render(c) {
      const t = T();
      return `<div class="mmsa">${bar(c, t.t('DMAgent/main_title'), '#3aa3db', true)}<div class="mmsa-page"><div class="mmsa-text"><p>${esc(c, t.t('DMAgent/introduction_text'))}</p><p>${esc(c, t.t('DMAgent/info_shared_admin'))}</p></div></div>
        <div class="mmsa-foot"><button type="button" data-action="mmsa-next">${esc(c, t.t('DMAgent/next_button_label'))}</button></div></div>`;
    },
    action(name, el, event, c) { if (name === 'mmsa-next') { c.open('missing-device-policy-sign-in'); return true; } return false; }
  });
})();
