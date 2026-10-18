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
      out += `<button type="button" class="mmgp-tile" data-action="mmgp-open" data-id="${p.id}">${pic(p, 'mmgp-svg', 1)}${p.kind === 'video' ? '<i class="mmgp-play"></i>' : p.kind === 'pano' ? `<img class="mmgp-badge" src="${A('quantum_ic_photosphere_white_24')}" alt="">` : ''}</button>`;
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
  // The edits Photos' editor saved (light, colour, pop, vignette, quarter turns), drawn over the picture.
  const look = p => { const e = p.edit; if (!e) return ''; return `filter:brightness(${(1 + e.light * .4).toFixed(2)}) saturate(${(1 + e.color).toFixed(2)}) contrast(${(1 + e.pop * .5).toFixed(2)});${e.rot ? `transform:rotate(${e.rot * -90}deg)` : ''}`; };
  const pic = (p, cls, ratio) => { const st = look(p), svg = MM.media.svg(p, cls, ratio); return st ? svg.replace('<svg ', `<svg style="${st}" `) : svg; };
  const albums = c => c.data.photoAlbums || (c.data.photoAlbums = []);
  const SCREENS = {'': 'photos_drawermenu_nav_photos', trash: 'photos_trash_ui_title', assistant: 'assistant_title', collections: 'collections_title', folders: 'device_folders_title', shared: 'label_shared_links'};
  function drawerHtml(c) {
    const t = T(), u = ui(c), on = k => u.screen === k || (k === 'folders' && u.screen.startsWith('folder:')) || (k === 'collections' && u.screen.startsWith('album:'));
    const item = (ic, key, action, k) => `<button type="button" class="mmgp-ditem${on(k) ? ' on' : ''}" data-action="${action}"><img src="${A(ic)}" alt=""><span>${esc(c, t.t(key))}</span></button>`;
    return `<div class="mmgp-scrim" data-action="mmgp-drawer"></div><div class="mmgp-drawer"><div class="mmgp-dacct"><img src="assets/gm-avatar_placeholder.png" alt=""><b>${esc(c, MM.account.name)}</b><small>${esc(c, MM.account.email)}</small></div>
      ${item('quantum_ic_photo_album_grey600_24', 'photos_drawermenu_nav_assistant', 'mmgp-assistant', 'assistant')}${item('quantum_ic_photos_grey600_18', 'photos_drawermenu_nav_photos', 'mmgp-photos', '')}${item('quantum_ic_collections_bookmark_grey600_24', 'photos_drawermenu_nav_collections', 'mmgp-collections', 'collections')}
      ${item('quantum_ic_folder_grey600_24', 'photos_drawermenu_nav_device_folders', 'mmgp-folders', 'folders')}${item('quantum_ic_link_grey600_24', 'photos_drawermenu_nav_shared', 'mmgp-shared', 'shared')}${item('quantum_ic_delete_grey600_24', 'photos_drawermenu_nav_trash', 'mmgp-trash', 'trash')}
      <i class="mmgp-ddiv"></i>${item('quantum_ic_settings_grey600_24', 'photos_drawermenu_nav_settings', 'mmgp-settings', 'settings')}${item('quantum_ic_help_grey600_24', 'photos_drawermenu_nav_help', 'mmgp-help', 'help')}</div>`;
  }
  const bar = (c, title, extra = '', back = false) => `<div class="mmgp-bar"><button type="button" class="mmgp-btn" data-action="${back ? 'mmgp-up2' : 'mmgp-drawer'}"><img src="${A(back ? 'quantum_ic_arrow_back_grey600_24' : 'quantum_ic_menu_grey600_24')}" alt=""></button><span class="mmgp-title">${esc(c, title)}</span>${extra}</div>`;
  const empty = (c, title, caption, icon = '') => `<div class="mmgp-empty">${icon ? `<img src="${A(icon)}" alt="">` : ''}${title ? `<b>${esc(c, title)}</b>` : ''}${caption ? `<span>${esc(c, caption)}</span>` : ''}</div>`;
  function assistant(c) {
    const t = T(), u = ui(c), gone = new Set(c.data.photosCardsGone || []);
    const card = (id, title, text, btn = '') => gone.has(id) ? '' : `<div class="mmgp-card" data-card="${id}"><b>${esc(c, title)}</b><p>${esc(c, text)}</p>${btn}<button type="button" class="mmgp-cardx" data-action="mmgp-dismiss" data-card="${id}">✕</button></div>`;
    const backup = u.backup ? card('backup', t.t('photos_assistant_autobackup_all_photos_backed_up'), MM.account.email) : card('backup', t.t('photos_assistant_autobackup_is_off'), t.t('photos_assistant_autobackup_is_off_subtitle'));
    return card('overview', t.t('photos_assistant_overview_card_title'), `${t.t('photos_assistant_overview_card_description')}\n\n${t.t('photos_assistant_overview_card_swipe_prompt')}`) + backup;
  }
  function collections(c) {
    const t = T(), list = albums(c);
    if (!list.length) return empty(c, t.t('photos_remotemedia_ui_collection_empty_state_title'), t.t('photos_remotemedia_ui_collection_empty_state_caption'), 'quantum_ic_collections_bookmark_grey600_24');
    return `<div class="mmgp-albums">${list.map(al => { const p = MM.media.photos(c).find(x => x.id === al.items[0]); return `<button type="button" class="mmgp-album" data-action="mmgp-album" data-id="${al.id}"><span class="mmgp-acover">${p ? pic(p, 'mmgp-svg', 1) : ''}</span><b>${esc(c, al.name || t.t('default_album_name'))}</b><small>${esc(c, al.items.length ? `${al.items.length}` : t.t('album_subtitle_zero_photos'))}</small></button>`; }).join('')}</div>`;
  }
  function folders(c) {
    const t = T(), list = visible(c), p = list[0];
    return `<div class="mmgp-albums"><button type="button" class="mmgp-album" data-action="mmgp-folder"><span class="mmgp-acover">${p ? pic(p, 'mmgp-svg', 1) : ''}</span><b>${esc(c, t.t('photos_localmedia_core_camera_label'))}</b><small>${list.length}</small></button></div>`;
  }
  function searchPage(c) {
    const t = T(), u = ui(c), q = (u.q || '').trim().toLowerCase();
    const bar = `<div class="mmgp-bar"><button type="button" class="mmgp-btn" data-action="mmgp-sback"><img src="${A('quantum_ic_arrow_back_grey600_24')}" alt=""></button><input class="mmgp-q" value="${esc(c, u.q || '')}" placeholder="${esc(c, t.t('photos_search'))}" autocomplete="off">${u.q ? `<button type="button" class="mmgp-btn" data-action="mmgp-sclear" aria-label="${esc(c, t.t('photos_search_clear_text_button'))}"><img src="${A('quantum_ic_close_grey600_24')}" alt=""></button>` : ''}</div>`;
    let body;
    if (q) {
      const types = {[t.t('photos_search_core_type_videos_text').toLowerCase()]: 'video', [t.t('photos_localmedia_core_camera_label').toLowerCase()]: 'all'};
      const kind = Object.entries(types).find(([k]) => k.startsWith(q))?.[1];
      const hits = visible(c).filter(p => kind === 'all' || (kind && p.kind === kind) || dateLabel(c, p.time).toLowerCase().includes(q));
      body = hits.length ? grid(c, hits) : empty(c, t.t('photos_search_suggestions_empty_explore_title'), '');
    } else body = `<div class="mmgp-scold"><b>${esc(c, t.t('photos_search_suggestions_cold_start_header'))}</b><p>${esc(c, t.t('photos_search_suggestions_cold_start_text'))}</p></div>
      <div class="mmgp-shead">${esc(c, t.t('photos_search_core_category_types'))}</div><div class="mmgp-chips"><button type="button" data-action="mmgp-sq" data-q="${esc(c, t.t('photos_search_core_type_videos_text'))}">${esc(c, t.t('photos_search_core_type_videos_text'))}</button><button type="button" data-action="mmgp-sq" data-q="${esc(c, t.t('photos_search_core_type_creations_text'))}">${esc(c, t.t('photos_search_core_type_creations_text'))}</button></div>`;
    return `<div class="mmgp">${bar}<div class="mmgp-page mmgp-list">${body}</div></div>`;
  }
  // "Choose photos" for a new album: the grid with a tick on each picked photo, then the album is made.
  function albumPick(c) {
    const t = T(), u = ui(c), picked = new Set(u.picked || []);
    const tiles = visible(c).map(p => `<button type="button" class="mmgp-tile${picked.has(p.id) ? ' picked' : ''}" data-action="mmgp-pickt" data-id="${p.id}">${pic(p, 'mmgp-svg', 1)}<i class="mmgp-tick"></i></button>`).join('');
    return `<div class="mmgp"><div class="mmgp-bar"><button type="button" class="mmgp-btn" data-action="mmgp-up2"><img src="${A('quantum_ic_close_grey600_24')}" alt=""></button><span class="mmgp-title">${esc(c, picked.size ? String(picked.size) : t.t('photos_remotemedia_ui_edit_album'))}</span><button type="button" class="mmgp-tbtn" data-action="mmgp-albumdone"${picked.size ? '' : ' disabled'}>${esc(c, t.t('cpe_editor_action_save'))}</button></div><div class="mmgp-page mmgp-list"><div class="mmgp-grid">${tiles}</div></div></div>`;
  }
  function home(c) {
    const t = T(), u = ui(c), scr = u.screen;
    if (scr === 'search') return searchPage(c);
    if (scr === 'albumpick') return albumPick(c);
    let title = t.t(SCREENS[scr] || 'photos_drawermenu_nav_photos'), body, extra = '', back = false, fab = false;
    if (scr === 'assistant') body = assistant(c);
    else if (scr === 'collections') { body = collections(c); extra = `<button type="button" class="mmgp-btn" data-action="mmgp-create" aria-label="${esc(c, t.t('create_new_album'))}"><img src="${A('quantum_ic_add_grey600_24')}" alt=""></button>`; }
    else if (scr === 'folders') body = folders(c);
    else if (scr === 'shared') body = empty(c, '', '', 'quantum_ic_link_grey600_24');
    else if (scr === 'folder:camera') { title = t.t('photos_localmedia_core_camera_label'); body = grid(c, visible(c)); back = true; }
    else if (scr.startsWith('album:')) {
      const al = albums(c).find(x => x.id === +scr.slice(6)); if (!al) { u.screen = 'collections'; return home(c); }
      title = al.name || t.t('default_album_name'); back = true; extra = MM.menu.button(c, 'mmgp-over');
      const list = al.items.map(id => MM.media.photos(c).find(p => p.id === id)).filter(p => p && !p.trashed);
      body = list.length ? `<div class="mmgp-grid">${list.map(p => `<button type="button" class="mmgp-tile" data-action="mmgp-open" data-id="${p.id}">${pic(p, 'mmgp-svg', 1)}</button>`).join('')}</div>` : empty(c, '', t.t('photos_remotemedia_ui_album_empty_state_caption'));
    } else { const list = visible(c, scr === 'trash'); body = grid(c, list); fab = scr !== 'trash'; }
    return `<div class="mmgp">${bar(c, title, extra, back)}<div class="mmgp-page mmgp-list">${body}</div>${fab ? `<button type="button" class="mmgp-fab" data-action="mmgp-search"><img src="${A('quantum_ic_search_white_24')}" alt=""></button>` : ''}${u.drawer ? drawerHtml(c) : ''}</div>`;
  }
  // The editor (Google Photos Editor): the picture, the adjustments (Auto, Light, Color, Pop, Vignette with their
  // sliders, Reset) or crop & rotate (the quarter turn, AUTO, RESET), the close button and SAVE.
  function editor(c, p) {
    const t = T(), u = ui(c), e = u.edit, tab = u.etab || 'tune';
    const view = {...p, edit: e};
    const slider = k => `<label class="mmgp-sl"><span>${esc(c, t.t(`cpe_adjustments_${k}`))}</span><input type="range" min="-100" max="100" value="${Math.round(e[k] * 100)}" data-k="${k}"></label>`;
    const panel = tab === 'tune' ? `<div class="mmgp-epanel"><div class="mmgp-erow"><button type="button" data-action="mmgp-eauto">${esc(c, t.t('cpe_adjustments_auto'))}</button><button type="button" data-action="mmgp-ereset">${esc(c, t.t('cpe_adjustments_reset'))}</button></div>${['light', 'color', 'pop', 'vignette'].map(slider).join('')}</div>`
      : `<div class="mmgp-epanel crop"><button type="button" data-action="mmgp-erot"><img src="${A('quantum_ic_rotate_90_degrees_ccw_white_24')}" alt=""></button><div class="mmgp-erow"><button type="button" data-action="mmgp-ereset">${esc(c, t.t('cpe_crop_and_rotate_reset'))}</button></div></div>`;
    return `<div class="mmgp mmgp-editor"><div class="mmgp-etop"><button type="button" data-action="mmgp-eclose" aria-label="${esc(c, t.t('cpe_a11y_close_editor'))}"><img src="${A('quantum_ic_close_white_24')}" alt=""></button><i></i><button type="button" class="mmgp-esave" data-action="mmgp-esave">${esc(c, t.t('cpe_editor_action_save'))}</button></div>
      <div class="mmgp-epic${e.vignette > 0 ? ' vig' : ''}" style="--vig:${Math.max(0, e.vignette).toFixed(2)}">${pic(view, 'mmgp-vsvg')}</div>${panel}
      <div class="mmgp-etabs"><button type="button" data-action="mmgp-etab" data-tab="tune"><img src="${A(tab === 'tune' ? 'quantum_ic_tune_googblue_24' : 'quantum_ic_tune_white_24')}" alt=""></button><button type="button" data-action="mmgp-etab" data-tab="crop"><img src="${A(tab === 'crop' ? 'quantum_ic_crop_rotate_googblue_24' : 'quantum_ic_crop_rotate_white_24')}" alt=""></button></div></div>`;
  }
  // Info (the details sheet): the description field, then Details: the date and time, the file, its size and resolution, the camera.
  function infoSheet(c, p) {
    const t = T(), d = new Date(p.time), pad = n => String(n).padStart(2, '0');
    const name = `${p.kind === 'video' ? 'VID' : p.kind === 'pano' ? 'PANO' : 'IMG'}_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}.${p.kind === 'video' ? 'mp4' : 'jpg'}`;
    const [w, h] = p.kind === 'pano' ? [8192, 2048] : p.front ? [2592, 1944] : [4032, 3024];
    const row = (ic, a, b) => `<div class="mmgp-irow"><img src="${A(ic)}" alt=""><span><b>${esc(c, a)}</b>${b ? `<small>${esc(c, b)}</small>` : ''}</span></div>`;
    return `<div class="mmgp-scrim" data-action="mmgp-info"></div><div class="mmgp-info"><div class="mmgp-ihead">${esc(c, t.t('photos_mediadetails_details_title'))}</div><input class="mmgp-icap" value="${esc(c, p.caption || '')}" placeholder="${esc(c, t.t('photos_mediadetails_caption_placeholder_hint'))}">
      <div class="mmgp-isub">${esc(c, t.t('photos_mediadetails_exif_header'))}</div>${row('quantum_ic_photo_album_grey600_24', new Intl.DateTimeFormat(c.locale(), {weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'}).format(d), new Intl.DateTimeFormat(c.locale(), {hour: 'numeric', minute: '2-digit'}).format(d))}
      ${row('quantum_ic_photos_grey600_18', name, `${AndroidStrings.format(t.t('photos_mediadetails_exif_pixels_value'), Math.round(w * h / 1e6))}  ${w} × ${h}  ${MM.fileSize(c, Math.round(w * h * .3))}`)}${row('quantum_ic_camera_alt_grey600_24', 'LGE Nexus 5X', p.front ? 'ƒ/2.2  1/30  2.88mm  ISO400' : 'ƒ/2.0  1/120  4.67mm  ISO100')}</div>`;
  }
  function viewer(c, p) {
    const t = T(), u = ui(c);
    const btn = (ic, action, key) => `<button type="button" data-action="${action}" aria-label="${esc(c, t.t(key))}"><img src="${A(ic)}" alt=""></button>`;
    return `<div class="mmgp mmgp-viewer${u.chrome ? '' : ' bare'}"><div class="mmgp-vpic" data-action="mmgp-chrome">${pic(p, 'mmgp-vsvg')}${p.kind === 'video' ? '<i class="mmgp-play big"></i>' : ''}</div>
      <div class="mmgp-vtop"><button type="button" data-action="mmgp-up"><img src="${A('quantum_ic_arrow_back_white_24')}" alt=""></button><i></i><button type="button" data-action="mmgp-more"><img src="${A('quantum_ic_more_vert_white_24')}" alt=""></button></div>
      <div class="mmgp-vbar">${btn('quantum_ic_share_white_24', 'mmgp-share', 'stories_share')}${btn('quantum_ic_edit_white_24', 'mmgp-edit', 'edit_button_text')}${btn('quantum_ic_info_white_24', 'mmgp-info', 'photos_photofragment_components_photobar_action_details')}${btn('quantum_ic_delete_white_24', 'mmgp-trashit', 'photos_photofragment_components_photobar_action_move_to_trash')}</div>${u.info ? infoSheet(c, p) : ''}</div>`;
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
    if (u.screen.startsWith('photo:')) { const p = MM.media.photos(c).find(x => x.id === +u.screen.slice(6)); if (p) return u.edit ? editor(c, p) : viewer(c, p); u.screen = ''; }
    if (u.screen === 'slide') { const list = visible(c).filter(p => p.kind !== 'video'); const p = list[(u.slide || 0) % Math.max(1, list.length)]; clearTimeout(u.slideTimer); u.slideTimer = setTimeout(() => { if (ui(c).screen === 'slide' && c.ui.view === 'photos') { ui(c).slide = (ui(c).slide || 0) + 1; c.render(); } }, 3000); return `<div class="mmgp mmgp-viewer bare mmgp-slide" data-action="mmgp-slideend"><div class="mmgp-vpic">${p ? pic(p, 'mmgp-vsvg') : ''}</div></div>`; }
    return home(c);
  }
  MM.register('photos', {
    // The window animation's page (mm-core.js): deeper screens open over the ones they came from.
    page: c => MM.page('photos', c.ui.photos?.screen),
    statusColor: c => ui(c).pick ? '#757575' : ui(c).screen.startsWith('photo:') || ui(c).screen === 'slide' || !c.data.photosOnboarded ? '#000' : '#757575',
    render,
    mount(c, root) {
      const u = ui(c), q = root.querySelector('.mmgp-q');
      if (q) { q.addEventListener('input', () => { const p = q.selectionStart; u.q = q.value; c.render(); const g = c.el.viewport.querySelector('.mmgp-q'); if (g) { g.focus(); g.setSelectionRange(p, p); } }); if (document.activeElement !== q) setTimeout(() => q.focus(), 40); }
      root.querySelectorAll('.mmgp-sl input').forEach(r => r.addEventListener('input', () => { u.edit[r.dataset.k] = +r.value / 100; const pic = root.querySelector('.mmgp-epic'); const p = MM.media.photos(c).find(x => x.id === +u.screen.slice(6)); if (pic && p) { pic.innerHTML = MM.media.svg(p, 'mmgp-vsvg').replace('<svg ', `<svg style="${look({edit: u.edit})}" `); pic.style.setProperty('--vig', Math.max(0, u.edit.vignette).toFixed(2)); pic.classList.toggle('vig', u.edit.vignette > 0); } }));
      const cap = root.querySelector('.mmgp-icap');
      if (cap) cap.addEventListener('change', () => { const p = MM.media.photos(c).find(x => x.id === +u.screen.slice(6)); if (p) { p.caption = cap.value; c.save(); } });
    },
    back(c) {
      const u = ui(c);
      if (u.pick) { u.pick = false; return false; }
      if (u.drawer) { u.drawer = false; c.render(); return true; }
      if (u.info) { u.info = false; c.render(); return true; }
      if (u.edit) { u.edit = null; c.render(); return true; }
      if (u.screen === 'slide') { u.screen = u.slideFrom || ''; c.render(); return true; }
      if (u.screen === 'folder:camera') { u.screen = 'folders'; c.render(); return true; }
      if (u.screen.startsWith('album:') || u.screen === 'albumpick') { u.screen = 'collections'; c.render(); return true; }
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
        case 'mmgp-assistant': case 'mmgp-collections': case 'mmgp-folders': case 'mmgp-shared': u.screen = name.slice(5); u.drawer = false; c.render(); return true;
        case 'mmgp-settings': u.drawer = false; MM.openPrefs(c, 'photos', 'settings_headers', T().t('photos_drawermenu_nav_settings')); return true;
        case 'mmgp-up2': this.back(c); return true;
        case 'mmgp-folder': u.screen = 'folder:camera'; c.render(); return true;
        case 'mmgp-album': u.screen = `album:${el.dataset.id}`; c.render(); return true;
        case 'mmgp-dismiss': c.data.photosCardsGone = [...(c.data.photosCardsGone || []), el.dataset.card]; c.save(); c.toast(T().t('photos_assistant_ui_dismiss_card_dismissed'), false); c.render(); return true;
        case 'mmgp-create': c.menu([{label: T().t('create_new_album'), action: c => { u.picked = []; u.screen = 'albumpick'; c.render(); }}]); return true;
        case 'mmgp-pickt': { const id = +el.dataset.id, s = new Set(u.picked || []); s.has(id) ? s.delete(id) : s.add(id); u.picked = [...s]; c.render(); return true; }
        case 'mmgp-albumdone': { const list = albums(c), id = Math.max(0, ...list.map(x => x.id)) + 1; list.push({id, name: '', items: u.picked, time: Date.now()}); c.save(); u.picked = []; u.screen = `album:${id}`; c.render(); return true; }
        case 'mm-menu': {
          if (u.screen.startsWith('album:')) { const t = T(), al = albums(c).find(x => x.id === +u.screen.slice(6)); return c.menu([{label: t.t('photos_remotemedia_ui_delete_album'), action: c => c.dialog({title: t.t('photos_remotemedia_ui_delete_album_dialog_title'), message: t.t('photos_remotemedia_ui_delete_album_dialog_message'), buttons: [{label: t.t('photos_remotemedia_ui_delete_album_negative_button')}, {label: t.t('photos_remotemedia_ui_delete_album_positive_button'), action: c => { c.data.photoAlbums = albums(c).filter(x => x !== al); c.save(); u.screen = 'collections'; c.render(); }}]})}]), true; }
          return false;
        }
        case 'mmgp-sback': u.screen = ''; u.q = ''; c.render(); return true;
        case 'mmgp-sclear': u.q = ''; c.render(); return true;
        case 'mmgp-sq': u.q = el.dataset.q; c.render(); return true;
        case 'mmgp-slideend': u.screen = u.slideFrom || ''; clearTimeout(u.slideTimer); c.render(); return true;
        case 'mmgp-etab': u.etab = el.dataset.tab; c.render(); return true;
        case 'mmgp-eauto': Object.assign(u.edit, {light: .15, color: .1, pop: .2}); c.render(); return true;
        case 'mmgp-ereset': Object.assign(u.edit, u.etab === 'crop' ? {rot: 0} : {light: 0, color: 0, pop: 0, vignette: 0}); c.render(); return true;
        case 'mmgp-erot': u.edit.rot = ((u.edit.rot || 0) + 1) % 4; c.render(); return true;
        case 'mmgp-eclose': u.edit = null; c.render(); return true;
        case 'mmgp-esave': { const e = u.edit; p.edit = Object.values(e).some(v => v) ? {...e} : undefined; c.save(); u.edit = null; c.toast(T().t('photos_photoeditor_save_complete'), false); c.render(); return true; }
        case 'mmgp-help': u.drawer = false; c.open('help', 'photos'); return true;
        case 'mmgp-search': u.screen = 'search'; u.q = ''; c.render(); return true;
        case 'mmgp-share': MM.share(c, {kind: 'image', exclude: ['photos']}); return true;
        case 'mmgp-edit': if (p.kind === 'video') { c.toast(T().t('photos_pager_menu_slideshow'), false); return true; } u.edit = {light: 0, color: 0, pop: 0, vignette: 0, rot: 0, ...(p.edit || {})}; u.etab = 'tune'; c.render(); return true;
        case 'mmgp-info': u.info = !u.info; c.render(); return true;
        // The viewer's overflow: Slideshow, Use as (the wallpaper crop), Print, Add to album; in Trash Restore and
        // Permanently delete.
        case 'mmgp-more': {
          const t = T();
          if (p.trashed) return c.menu([{label: t.t('photos_pager_menu_restore_from_trash'), action: c => { p.trashed = false; c.save(); u.screen = u.from || ''; c.render(); }}, {label: t.t('photos_pager_menu_delete_from_trash'), action: c => { c.data.photos = MM.media.photos(c).filter(x => x !== p); c.save(); u.screen = u.from || ''; c.render(); }}]), true;
          c.menu([{label: t.t('photos_pager_menu_slideshow'), action: c => { u.slideFrom = u.screen; u.slide = Math.max(0, visible(c).filter(x => x.kind !== 'video').indexOf(p)); u.screen = 'slide'; c.render(); }},
            {label: t.t('photos_pager_menu_set_as'), action: c => c.open('wallpapers', `crop:${p.id}`)},
            {label: t.t('photos_pager_menu_print'), action: c => MM.print(c, {name: `IMG_${p.id}`, title: `IMG_${p.id}`, lines: [new Intl.DateTimeFormat(c.locale(), {dateStyle: 'long'}).format(new Date(p.time))]})},
            ...(albums(c).length ? [{label: t.t('photos_pager_menu_add_to_album'), action: c => c.dialog({title: t.t('photos_pager_menu_add_to_album'), items: albums(c).map(al => ({html: esc(c, al.name || t.t('default_album_name'))})), onItem: (i, c) => { const al = albums(c)[i]; if (!al.items.includes(p.id)) al.items.push(p.id); c.save(); }})}] : [])]);
          return true;
        }
      }
      return false;
    }
  });
})();
