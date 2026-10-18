/* Android 6.0.1 Photos (Google Photos 1.4.0, app/Photos of MTC20K), the app 'photos', with the demo account
   (MM.account). The pictures are MM.media's: the simulator's own drawn scenes and what Camera took.
   - Onboarding (onboarding_intro_fragment.xml): the Photos logo on the primary blue with GET STARTED (white_button, 240 dp,
     32 dp above the bottom), then the backup page: "Back up & sync" with "Use Google account %s", "Upload size for photos
     & videos" with High quality (free unlimited storage) / Original, CONTINUE.
   - home_activity.xml: scrolling_toolbar.xml's white toolbar (colorPrimary quantum_white_100; the status bar AppCompat's
     primary_dark_material_light #757575) with the drawer button (quantum_ic_menu_grey600_24) and the section title; the
     Photos section's grid under date_header.xml headers (48 dp, 16 dp in: Today, Yesterday, then the date) with 2 dp gaps;
     the 68 dp search FAB (fab_background in quantum_googblue #4285f4, quantum_ic_search_white_24) 16 dp from the corner.
   - The drawer (280 dp, photos_drawermenu_drawer_item.xml: 48 dp rows, 16 dp around the icon, body 2 text): Assistant,
     Photos, Collections, Device folders, Shared links, Trash, Settings, Help & feedback.
   - The viewer (photo_pager_fragment.xml): the picture on black, the back arrow and overflow on top, PhotoActionBar's
     share / edit / details / move to trash at the bottom over its gradient; tapping hides the chrome. Trash keeps what
     was moved there. */
(() => {
  'use strict';
  const T = () => MM.text('photos');
  const A = n => `assets/pt-${n}.png`;
  const ui = c => c.ui.photos || (c.ui.photos = {screen: '', drawer: false, chrome: true, onboard: 0, quality: 'hq', backup: true});
  const esc = (c, s) => c.safe(s);
  const visible = (c, trash = false) => MM.media.photos(c).filter(p => !!p.trashed === trash).sort((a, b) => b.time - a.time);
  function dateLabel(c, time) {
    const t = T(), d = new Date(time), now = new Date(), day = x => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const diff = Math.round((day(now) - day(d)) / 864e5);
    if (diff === 0) return t.t('photos_dateformat_today');
    if (diff === 1) return t.t('photos_dateformat_yesterday');
    return new Intl.DateTimeFormat(c.locale(), {weekday: 'short', month: 'short', day: 'numeric', ...(d.getFullYear() !== now.getFullYear() ? {year: 'numeric'} : {})}).format(d);
  }
  function grid(c, list) {
    let last = '', out = '';
    for (const p of list) {
      const label = dateLabel(c, p.time);
      if (label !== last) { if (last) out += '</div>'; out += `<div class="mmgp-date">${esc(c, label)}</div><div class="mmgp-grid">`; last = label; }
      out += `<button type="button" class="mmgp-tile" data-action="mmgp-open" data-id="${p.id}">${MM.media.svg(p, 'mmgp-svg', 1)}${p.kind === 'video' ? '<i class="mmgp-play"></i>' : p.kind === 'pano' ? `<img class="mmgp-badge" src="${A('quantum_ic_photosphere_white_24')}" alt="">` : ''}</button>`;
    }
    return out + (last ? '</div>' : '');
  }
  function onboarding(c) {
    const t = T(), u = ui(c);
    if (!u.onboard) return `<div class="mmgp mmgp-intro"><img src="${A('quantum_logo_photos_launcher_color_48')}" alt=""><button type="button" class="mmgp-start" data-action="mmgp-start">${esc(c, t.t('photos_onboarding_get_started'))}</button></div>`;
    const radio = (id, title, sub) => `<button type="button" class="mmgp-radio" data-action="mmgp-quality" data-q="${id}"><i class="mmw-radio${u.quality === id ? ' on' : ''}"></i><span><b>${esc(c, title)}</b><small>${esc(c, sub)}</small></span></button>`;
    return `<div class="mmgp mmgp-backup"><div class="mmgp-bhead"><h1>${esc(c, t.t('photos_onboarding_back_up_your_photos'))}</h1></div><div class="mmgp-page">
      <button type="button" class="mmgp-bsw" data-action="mmgp-backupsw"><span><b>${esc(c, t.t('photos_onboarding_auto_backup'))}</b><small>${esc(c, AndroidStrings.format(t.t('photos_onboarding_use_google_account'), MM.account.email))}</small></span><i class="mmw-switch${u.backup ? ' on' : ''}"><i class="mmw-thumb"></i></i></button>
      <div class="mmgp-bsub">${esc(c, t.t('photos_onboarding_auto_backup_second_title'))}</div>${radio('hq', t.t('photos_onboarding_high_quality_storage_title'), t.t('photos_onboarding_high_quality_storage_subtitle'))}${radio('orig', t.t('photos_onboarding_original_storage_title_fallback'), t.t('photos_onboarding_original_storage_subtitle'))}</div>
      <div class="mmgp-bbar"><button type="button" data-action="mmgp-continue">${esc(c, t.t('photos_onboarding_continue_label'))}</button></div></div>`;
  }
  function home(c) {
    const t = T(), u = ui(c), trash = u.screen === 'trash', list = visible(c, trash);
    const title = trash ? t.t('photos_trash_ui_title') : t.t('photos_drawermenu_nav_photos');
    const item = (ic, key, action, on = false) => `<button type="button" class="mmgp-ditem${on ? ' on' : ''}" data-action="${action}"><img src="${A(ic)}" alt=""><span>${esc(c, t.t(key))}</span></button>`;
    const drawer = u.drawer ? `<div class="mmgp-scrim" data-action="mmgp-drawer"></div><div class="mmgp-drawer"><div class="mmgp-dacct"><img src="assets/gm-avatar_placeholder.png" alt=""><b>${esc(c, MM.account.name)}</b><small>${esc(c, MM.account.email)}</small></div>
      ${item('quantum_ic_photo_album_grey600_24', 'photos_drawermenu_nav_assistant', 'mmgp-assistant')}${item('quantum_ic_photos_grey600_18', 'photos_drawermenu_nav_photos', 'mmgp-photos', !trash)}${item('quantum_ic_photo_album_grey600_24', 'photos_drawermenu_nav_collections', 'mmgp-collections')}<i class="mmgp-ddiv"></i>
      ${item('quantum_ic_photos_grey600_18', 'photos_drawermenu_nav_device_folders', 'mmgp-folders')}${item('quantum_ic_photo_album_grey600_24', 'photos_drawermenu_nav_shared', 'mmgp-shared')}${item('quantum_ic_delete_grey600_24', 'photos_drawermenu_nav_trash', 'mmgp-trash', trash)}<i class="mmgp-ddiv"></i>
      ${item('quantum_ic_settings_grey600_24', 'photos_drawermenu_nav_settings', 'mmgp-settings')}${item('quantum_ic_help_grey600_24', 'photos_drawermenu_nav_help', 'mmgp-help')}</div>` : '';
    return `<div class="mmgp"><div class="mmgp-bar"><button type="button" class="mmgp-btn" data-action="mmgp-drawer"><img src="${A('quantum_ic_menu_grey600_24')}" alt=""></button><span class="mmgp-title">${esc(c, title)}</span></div>
      <div class="mmgp-page mmgp-list">${grid(c, list)}</div>${trash ? '' : `<button type="button" class="mmgp-fab" data-action="mmgp-search"><img src="${A('quantum_ic_search_white_24')}" alt=""></button>`}${drawer}</div>`;
  }
  function viewer(c, p) {
    const t = T(), u = ui(c);
    const btn = (ic, action, key) => `<button type="button" data-action="${action}" aria-label="${esc(c, t.t(key))}"><img src="${A(ic)}" alt=""></button>`;
    return `<div class="mmgp mmgp-viewer${u.chrome ? '' : ' bare'}"><div class="mmgp-vpic" data-action="mmgp-chrome">${MM.media.svg(p, 'mmgp-vsvg')}${p.kind === 'video' ? '<i class="mmgp-play big"></i>' : ''}</div>
      <div class="mmgp-vtop"><button type="button" data-action="mmgp-up"><img src="${A('quantum_ic_arrow_back_white_24')}" alt=""></button><i></i><button type="button" data-action="mmgp-more"><img src="${A('quantum_ic_more_vert_white_24')}" alt=""></button></div>
      <div class="mmgp-vbar">${btn('quantum_ic_share_white_24', 'mmgp-share', 'stories_share')}${btn('quantum_ic_edit_white_24', 'mmgp-edit', 'edit_button_text')}${btn('quantum_ic_info_white_24', 'mmgp-info', 'photos_photofragment_components_photobar_action_details')}${btn('quantum_ic_delete_white_24', 'mmgp-trashit', 'photos_photofragment_components_photobar_action_move_to_trash')}</div></div>`;
  }
  // SetWallpaperActivity (Settings > Wallpaper > Photos): the picker titled photos_setwallpaper_picker_title over the
  // photos; the one chosen goes to the launcher's crop screen (CROP_AND_SET_WALLPAPER).
  function picker(c) {
    const list = visible(c, false).filter(p => p.kind !== 'video');
    return `<div class="mmgp"><div class="mmgp-bar"><button type="button" class="mmgp-btn" data-action="mmgp-pickback"><img src="${A('quantum_ic_arrow_back_grey600_24')}" alt=""></button><span class="mmgp-title">${esc(c, MM.text('wallpapers').t('Photos/photos_setwallpaper_picker_title'))}</span></div>
      <div class="mmgp-page mmgp-list">${grid(c, list).split('data-action="mmgp-open"').join('data-action="mmgp-pickone"')}</div></div>`;
  }
  function render(c) {
    const sub = c.ui.sub || '', u = ui(c);
    if (sub === 'pick:wallpaper') { c.ui.sub = ''; u.pick = true; }
    if (u.pick) return picker(c);
    if (sub.startsWith('photo:')) { c.ui.sub = ''; c.data.photosOnboarded = true; u.screen = `photo:${sub.slice(6)}`; u.external = true; u.chrome = true; }
    if (!c.data.photosOnboarded) return onboarding(c);
    if (u.screen.startsWith('photo:')) { const p = MM.media.photos(c).find(x => x.id === +u.screen.slice(6)); if (p) return viewer(c, p); u.screen = ''; }
    return home(c);
  }
  MM.register('photos', {
    statusColor: c => ui(c).pick ? '#757575' : ui(c).screen.startsWith('photo:') || !c.data.photosOnboarded ? '#000' : '#757575',
    render,
    back(c) {
      const u = ui(c);
      if (u.pick) { u.pick = false; return false; }
      if (u.drawer) { u.drawer = false; c.render(); return true; }
      if (u.screen.startsWith('photo:')) { if (u.external) { u.external = false; u.screen = ''; return false; } u.screen = u.from || ''; c.render(); return true; }
      if (u.screen) { u.screen = ''; c.render(); return true; }
      return false;
    },
    action(name, el, event, c) {
      const u = ui(c), p = MM.media.photos(c).find(x => x.id === +(el.dataset.id || u.screen.slice(6)));
      switch (name) {
        case 'mmgp-pickback': u.pick = false; c.back(); return true;
        case 'mmgp-pickone': u.pick = false; c.open('wallpapers', `crop:${el.dataset.id}`); return true;
        case 'mmgp-start': u.onboard = 1; c.render(); return true;
        case 'mmgp-backupsw': u.backup = !u.backup; c.render(); return true;
        case 'mmgp-quality': u.quality = el.dataset.q; c.render(); return true;
        case 'mmgp-continue': c.data.photosOnboarded = true; c.save(); c.render(); return true;
        case 'mmgp-drawer': u.drawer = !u.drawer; c.render(); return true;
        case 'mmgp-photos': u.screen = ''; u.drawer = false; c.render(); return true;
        case 'mmgp-trash': u.screen = 'trash'; u.drawer = false; c.render(); return true;
        case 'mmgp-open': u.from = u.screen; u.screen = `photo:${p.id}`; u.chrome = true; c.render(); return true;
        case 'mmgp-chrome': u.chrome = !u.chrome; c.render(); return true;
        case 'mmgp-up': if (u.external) { u.external = false; u.screen = ''; c.back(); return true; } u.screen = u.from || ''; c.render(); return true;
        case 'mmgp-trashit': p.trashed = !p.trashed; c.save(); u.screen = u.from || ''; c.render(); return true;
        case 'mmgp-assistant': case 'mmgp-collections': case 'mmgp-folders': case 'mmgp-shared': case 'mmgp-settings': u.drawer = false; c.open(`missing-photos-${name.slice(5)}`); return true;
        case 'mmgp-help': u.drawer = false; c.open('help', 'photos'); return true;
        case 'mmgp-search': c.open('missing-photos-search'); return true;
        case 'mmgp-share': MM.share(c, {kind: 'image', exclude: ['photos']}); return true;
        case 'mmgp-edit': c.open('missing-photo-editor'); return true;
        case 'mmgp-info': c.open('missing-photo-details'); return true;
        case 'mmgp-more': c.open('missing-photo-menu'); return true;
      }
      return false;
    }
  });
})();
