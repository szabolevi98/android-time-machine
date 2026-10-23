/* Google Photos 1.25.0.131504660, angler N2G48C. Rebuilt from Photos.apk's home_fragment,
   tab_bar_fragment, photos_drawermenu_*, photo_pager_fragment, photo_action_bar, details_fragment,
   cpe_editor_activity/cpe_toolbar_fragment/cpe_crop_toolbar_fragment, trash_menu and home_menu.
   Its network library is represented by this browser's demo library; no real upload takes place.
   All artwork and interface texts come from this image. Drawn photos are the simulator's own content. */
(() => {
  'use strict';
  const L = () => NG.photoLibrary, T = () => NG.text('photos');
  const K = {
    photos:'photos_tabbar_photos_label', assistant:'photos_tabbar_assistant_label', albums:'photos_tabbar_albums_label',
    trash:'photos_trash_ui_title', device:'photos_drawermenu_navigation_device_folders', shared:'photos_drawermenu_navigation_shared',
    settings:'photos_drawermenu_navigation_settings', 'assistant-settings':'photos_settings_assistant_cards_title', search:'action_menu_search', create:'action_menu_create', more:'photos_actionbar_overflow_menu_label',
    select:'action_menu_select', layout:'photos_home_menu_label_layout', day:'photos_home_menu_action_day', month:'photos_home_menu_action_month',
    year:'photos_home_menu_action_year', comfortable:'photos_home_menu_action_comfortable', album:'photos_create_mediabundle_create_new_album',
    sharedAlbum:'photos_create_mediabundle_create_new_collaborative_album', movie:'photos_create_mediabundle_create_new_movie',
    animation:'photos_create_mediabundle_create_new_motion', collage:'photos_create_mediabundle_create_new_mix',
    addPhotos:'photos_album_emptystate_add_items_button_text', albumHint:'photos_album_ui_add_title', untitled:'photos_create_default_album_name',
    deleteAlbum:'photos_album_ui_delete_album_dialog_title', deleteAlbumMessage:'photos_album_ui_delete_album_dialog_message',
    keepAlbum:'photos_album_ui_delete_album_negative_button', editAlbum:'photos_album_ui_enter_edit_mode', emptyAlbum:'photos_album_emptystate_title',
    share:'photos_photofragment_components_photobar_action_share', edit:'edit_button_text', details:'photos_mediadetails_exif_header',
    moveTrash:'photos_photofragment_components_photobar_action_move_to_trash', trashInfo:'photos_trash_ui_trash_info',
    emptyTrash:'photos_trash_ui_empty_trash', emptyTrashTitle:'photos_trash_ui_empty_state_title',
    emptyTrashCaption:'photos_trash_ui_empty_state_caption', permanentMessage:'photos_trash_ui_empty_trash_dialog_text',
    permanent:'photos_pager_menu_delete_from_trash', restore:'photos_pager_menu_restore_from_trash',
    delete:'photos_trash_ui_delete_positive_button', undo:'undo', cancel:'framework/cancel', ok:'framework/ok',
    done:'photos_strings_done_button', back:'framework/action_bar_up_description', empty:'photos_list_no_photos',
    emptyCaption:'photos_gridlayers_empty_state_caption', emptyShared:'photos_sharedlinks_empty_state_caption',
    today:'photos_dateformat_today', yesterday:'photos_dateformat_yesterday', camera:'photos_localmedia_core_camera_label',
    addAlbum:'photos_pager_menu_add_to_album', allPhotos:'photos_pager_menu_all_photos', slideshow:'photos_pager_menu_slideshow',
    loop:'photos_pager_menu_loop_video', useAs:'photos_pager_menu_set_as', print:'photos_pager_menu_print',
    description:'photos_mediadetails_caption_placeholder_hint', play:'photos_videoplayer_play_video', pause:'photos_videoplayer_pause_video',
    deviceOnly:'photos_pager_autobackup_tag', save:'cpe_editor_action_save', saveCopy:'cpe_editor_action_save_copy',
    saved:'photos_photoeditor_save_complete', reset:'cpe_crop_and_rotate_reset', discardTitle:'cpe_leave_editing_title',
    discardMessage:'cpe_leave_editing_message', discard:'cpe_leave_editing_confirm', keepEditing:'cpe_leave_editing_cancel',
    filters:'cpe_a11y_view_filters', adjustments:'cpe_a11y_enhance_photo', crop:'cpe_a11y_crop_photo', rotate:'cpe_a11y_rotate',
    aspect:'cpe_a11y_aspect_ratio_menu', original:'cpe_aspect_ratio_original', square:'cpe_aspect_ratio_square', free:'cpe_aspect_ratio_free',
    auto:'cpe_adjustments_auto', light:'cpe_adjustments_light', color:'cpe_adjustments_color', pop:'cpe_adjustments_pop', undoEdits:'cpe_editor_action_undo_edits',
    welcome:'photos_onboarding_intro_brand_text', getStarted:'photos_onboarding_get_started', backupTitle:'photos_onboarding_back_up_your_photos',
    backupDescription:'photos_onboarding_back_up_your_photos_description', next:'photos_onboarding_next',
    backup:'photos_backup_settings_activity_title', backupOff:'photos_assistant_autobackup_is_off', backupOffSubtitle:'photos_assistant_autobackup_is_off_subtitle',
    backupComplete:'photos_assistant_autobackup_all_photos_backed_up', createNew:'photos_assistant_create_header',
    backupAccount:'photos_backup_settings_account_category', quality:'photos_backup_settings_upload_size_category',
    qualityHigh:'photos_backup_settings_upload_size_high_quality_title', qualityOriginal:'photos_backup_settings_upload_size_original_fallback',
    cellular:'photos_backup_settings_cell_data_category', videos:'photos_backup_settings_data_for_videos_switch',
    whenBackup:'photos_backup_settings_when_to_back_up_category', roaming:'photos_backup_settings_roaming_switch',
    charging:'photos_backup_settings_while_charging_switch', deviceBackup:'photos_backup_settings_device_folders_category',
    assistantCards:'photos_settings_assistant_cards_title', assistantSummary:'photos_settings_assistant_cards_summary',
    rediscover:'photos_settings_rediscover_this_day', rediscoverSummary:'photos_settings_rediscover_summary',
    creations:'auto_create_setting_title', creationsSummary:'auto_create_setting_desc', freeSpace:'photos_drawermenu_navigation_free_up_space',
    freeSpaceMessage:'photos_settings_no_item_title', sharedLinks:'photos_settings_envelope_view_setting_title',
    about:'about_photos_title', privacy:'menu_home_privacy_policy', terms:'menu_home_terms_of_service',
    help:'photos_app_menu_item_help_feedback', noResults:'search_empty_state_title', noResultsCaption:'search_empty_state_caption',
    people:'photos_search_core_category_people', places:'photos_search_core_category_places',
    noFaces:'photos_search_suggestions_people_empty_page_other_state_caption', noPlaces:'photos_search_suggestions_places_empty_page_other_state_caption'
  };
  const t = key => T().t(K[key] || key), esc = (c, value) => c.safe(value);
  const A = name => `assets/ph-${name}.png`;
  const image = (name, cls = '') => `<img class="${cls}" src="${A(name)}" alt="">`;
  const button = (c, action, icon, label, extra = '') => `<button type="button" class="ngphotos-ib" data-action="ngphotos-${action}"${extra} aria-label="${esc(c,t(label))}">${image(icon)}</button>`;
  const U = c => c.ui.photos || (c.ui.photos = {page:'photos', sub:undefined, stack:[], selected:[], selecting:false, drawer:false, info:false, chrome:true, zoom:1, tab:'photos', query:'', playing:false, position:0});
  const state = c => L().state(c);
  const current = c => L().find(c, U(c).photo);
  const hasPhoto = c => ['photo','editor'].includes(U(c).page);
  function sync(c) {
    const u = U(c);
    if (u.sub !== c.ui.sub) {
      u.sub = c.ui.sub;
      if (/^(photo|edit):\d+$/.test(c.ui.sub)) { u.photo = +c.ui.sub.split(':')[1]; u.page='photo'; u.stack=[{page:'photos'}]; u.chrome=true; u.info=false;if(c.ui.sub.startsWith('edit:')){const p=current(c);if(p){u.stack.push({page:'photo'});Object.assign(u,editorState(c,p));u.page='editor';}} }
    }
    L().expire(c);
  }
  function go(c, page, extra = {}, replace = false) {
    const u = U(c); if (!replace) u.stack.push({page:u.page, album:u.album, tab:u.tab, category:u.category, query:u.query});
    Object.assign(u, {page, selected:[], selecting:false, drawer:false, info:false, playing:false, zoom:1}, extra); c.render();
  }
  function back(c) {
    const u = U(c);
    if (u.drawer) { u.drawer=false; c.render(); return true; }
    if (u.info) { u.info=false; c.render(); return true; }
    if (u.page==='editor') { leaveEditor(c); return true; }
    if (u.selecting || u.picking) { u.selected=[]; u.selecting=false; u.picking=''; c.render(); return true; }
    const prev = u.stack.pop(); if (prev) { Object.assign(u, prev, {playing:false, selected:[], chrome:true, zoom:1}); c.render(); return true; }
    if (u.page!=='photos') { go(c,'photos',{},true); return true; }
    return false;
  }
  function albumOf(c) { return state(c).albums.find(a => a.id === +U(c).album); }
  function shown(c) {
    if(hasPhoto(c)&&current(c)?.appPrivate)return [current(c)];
    const u=U(c); let list=L().list(c,u.page==='trash' || u.page==='photo' && !!current(c)?.trashedAt);
    if (u.page==='album' || u.page==='photo' && u.fromAlbum) { const a=state(c).albums.find(a=>a.id===+(u.fromAlbum || u.album)); list=list.filter(p=>a?.ids.includes(p.id)); }
    if (u.page==='search') {
      const q=u.query.toLocaleLowerCase(c.locale());
      list=list.filter(p=>(!u.category || p.kind===u.category) && (!q || `${p.caption||''} ${fileName(p)} ${date(c,p.time)} ${p.kind} ${p.front?'room':'landscape'}`.toLocaleLowerCase(c.locale()).includes(q)));
    }
    return list;
  }
  function date(c, ms, full=false) {
    const d=new Date(ms), today=new Date(); today.setHours(0,0,0,0);
    if (!full && +d>=+today) return t('today');
    const yesterday=new Date(today); yesterday.setDate(yesterday.getDate()-1);
    if (!full && +d>=+yesterday) return t('yesterday');
    return d.toLocaleDateString(c.locale(), full?{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'}:{weekday:'short',month:'short',day:'numeric'});
  }
  function fileName(p) { return `${p.kind==='video'?'VID':'IMG'}_${new Date(p.time).toISOString().slice(0,19).replace(/[-:T]/g,'')}_${p.id}.${p.kind==='video'?'mp4':'jpg'}`; }
  const duration = ms => { const sec=Math.floor(Math.max(0,ms)/1000); return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`; };
  function grid(c,list,grouped=true) {
    const u=U(c), groups=new Map();
    for (const p of list) { const day=grouped?date(c,p.time):''; if(!groups.has(day))groups.set(day,[]); groups.get(day).push(p); }
    return [...groups].map(([day,items])=>`${day?`<div class="ngphotos-date">${esc(c,day)}</div>`:''}<div class="ngphotos-grid" style="--ngphotos-cols:${state(c).columns||3}">${items.map(p=>`<button type="button" class="ngphotos-cell${u.selected.includes(p.id)?' selected':''}" data-action="ngphotos-photo" data-id="${p.id}" aria-label="${esc(c,`${date(c,p.time,true)} ${t(p.kind==='video'?'videos':'photos')}`)}">${NG.media.svg(p,'ngphotos-svg')}${u.selecting||u.picking?`<i class="ngphotos-check">${u.selected.includes(p.id)?'✓':''}</i>`:''}${p.kind==='video'?`<span class="ngphotos-duration">${duration(p.duration||0)}</span>`:''}</button>`).join('')}</div>`).join('');
  }
  const empty = (c,title,caption='',icon='null_album_color_276x88dp')=>`<div class="ngphotos-empty">${image(icon)}<h2>${esc(c,t(title))}</h2>${caption?`<p>${esc(c,t(caption))}</p>`:''}</div>`;
  function bar(c) {
    const u=U(c), photo=hasPhoto(c), white=photo?'white':'grey600';
    if(u.selecting||u.picking) return `<div class="ngphotos-bar selection">${button(c,'cancel-selection','quantum_ic_close_white_24','cancel')}<span class="ngphotos-title">${u.selected.length}</span>${u.picking?`<button type="button" class="ngphotos-textbtn" data-action="ngphotos-picked"${u.selected.length?'':' disabled'}>${esc(c,t('done'))}</button>`:u.page==='trash'?`<button type="button" class="ngphotos-textbtn" data-action="ngphotos-restore">${esc(c,t('restore'))}</button>${button(c,'delete','quantum_ic_delete_white_24','permanent')}`:`${button(c,'share','quantum_ic_share_white_24','share')}${button(c,'create','quantum_ic_add_white_24','create')}${button(c,'delete','quantum_ic_delete_white_24','moveTrash')}`}</div>`;
    const root=['photos','albums','assistant'].includes(u.page), title=u.page==='album'?(albumOf(c)?.name||t('untitled')):t(u.page==='editor'?'edit':u.page);
    const left=button(c,root?'drawer':'back',root?'quantum_ic_menu_grey600_24':`quantum_ic_arrow_back_${white}_24`,root?'more':'back');
    if(u.page==='editor') return `<div class="ngphotos-bar editor">${button(c,'back','quantum_ic_close_white_24','cancel')}<span class="ngphotos-title"></span><button type="button" class="ngphotos-textbtn" data-action="ngphotos-save">${esc(c,t('save'))}</button>${button(c,'more','quantum_ic_more_vert_white_24','more')}</div>`;
    return `<div class="ngphotos-bar${photo?' viewer':''}">${left}${u.page==='search'?`<input class="ngphotos-search" type="search" placeholder="${esc(c,t('search'))}" value="${esc(c,u.query)}" aria-label="${esc(c,t('search'))}">`:`<span class="ngphotos-title">${photo?'':esc(c,title)}</span>`}${root?`${button(c,'create','quantum_ic_add_grey600_24','create')}${button(c,'search','quantum_ic_search_grey600_24','search')}`:''}${button(c,'more',`quantum_ic_more_vert_${white}_24`,'more')}</div>`;
  }
  function tabs(c) { const u=U(c); return `<div class="ngphotos-tabs">${[['assistant','assistant'],['photos','photo'],['albums','photo_album']].map(([tab,icon])=>`<button type="button" class="${u.page===tab?'on':''}" data-action="ngphotos-tab" data-tab="${tab}">${image(`quantum_ic_${icon}_${u.page===tab?'googblue':'grey600'}_24`)}<span>${esc(c,t(tab))}</span></button>`).join('')}</div>`; }
  function drawer(c) {
    if(!U(c).drawer)return '';
    const rows=[['photos','photo'],['assistant','assistant'],['albums','photo_album'],['shared','share'],['device','photo_album'],['trash','delete'],['settings','settings'],['help','help']];
    return `<div class="ngphotos-dim" data-action="ngphotos-drawer"></div><aside class="ngphotos-drawer"><div class="ngphotos-account"><i>L</i><strong>Levente</strong><span>${esc(c,NG.account?.email||'nexus6p.demo@gmail.com')}</span></div><div class="ngphotos-lockup">${image('googlelogo_standard_color_74x24')} <span>${esc(c,t('photos'))}</span></div>${rows.map(([p,icon])=>`<button type="button" class="ngphotos-drow${U(c).page===p?' on':''}" data-action="ngphotos-dest" data-page="${p}">${image(`quantum_ic_${icon}_grey600_24`)}<span>${esc(c,t(p))}</span></button>`).join('')}</aside>`;
  }
  function albums(c,shared=false) {
    const albums=state(c).albums.filter(a=>!shared||a.shared), cover=a=>a.ids.map(id=>L().find(c,id)).find(p=>p&&!p.trashedAt);
    return `${!shared?`<div class="ngphotos-types">${[['device','camera'],['video','videos'],['collage','collage'],['animation','animation']].map(([v,label])=>`<button type="button" data-action="ngphotos-category" data-kind="${v}">${image(`quantum_ic_${v==='device'?'photo_album':v==='video'?'play_arrow':v==='collage'?'photo_album':'photo'}_${v==='video'?'white':'grey600'}_24`)}<span>${esc(c,t(label))}</span></button>`).join('')}</div>`:''}${albums.length?`<div class="ngphotos-albums">${albums.map(a=>`<button type="button" data-action="ngphotos-album" data-id="${a.id}"><span class="ngphotos-cover">${cover(a)?NG.media.svg(cover(a),'ngphotos-svg',1):image('null_album_color_276x88dp')}</span><strong>${esc(c,a.name||t('untitled'))}</strong><small>${a.ids.filter(id=>{const p=L().find(c,id);return p&&!p.trashedAt;}).length}</small></button>`).join('')}</div>`:empty(c,shared?'shared':'albums',shared?'emptyShared':'emptyAlbum',shared?'null_shared_albums_color_132x132dp':'null_album_color_276x88dp')}`;
  }
  function assistant(c) {
    return `<div class="ngphotos-create"><p>${esc(c,t('createNew'))}</p>${['album','collage','animation','movie'].map(type=>`<button type="button" data-action="ngphotos-new" data-kind="${type}">${image('quantum_ic_add_grey600_24')}<span>${esc(c,t(type))}</span></button>`).join('')}</div><div class="ngphotos-card">${image('quantum_ic_backup_googblue_24')}<h2>${esc(c,t(state(c).backup?'backupComplete':'backupOff'))}</h2><p>${esc(c,t('backupOffSubtitle'))}</p><button type="button" class="ngphotos-blue" data-action="ngphotos-dest" data-page="backup">${esc(c,t('settings'))}</button></div>`;
  }
  function details(c,p) {
    return `<div class="ngphotos-info-dim" data-action="ngphotos-info"></div><section class="ngphotos-info"><header>${esc(c,t('details'))}${button(c,'info','quantum_ic_close_grey600_24','cancel')}</header><input class="ngphotos-caption" placeholder="${esc(c,t('description'))}" value="${esc(c,p.caption||'')}" aria-label="${esc(c,t('description'))}"><p>${esc(c,date(c,p.time,true))}</p><p>${esc(c,fileName(p))}</p><p>${p.kind==='video'?duration(p.duration||0):'4032 × 3024'} · Nexus 6P</p><p>${esc(c,t('deviceOnly'))}</p></section>`;
  }
  function viewer(c) {
    const u=U(c), p=current(c); if(!p)return empty(c,'empty');
    const ed=u.page==='editor', pic=ed?{...p,edits:{...u.edits,...(u.tool==='crop'?{crop:[0,0,1,1]}:{})}}:p, video=p.kind==='video'||p.kind==='animation', playing=video&&u.playing;
    const frame=playing&&p.frames?.length?{...p.frames[Math.floor(u.position/(p.kind==='animation'?500:2000))%p.frames.length],edits:p.edits}:pic;
    return `<div class="ngphotos-canvas${ed&&u.tool==='crop'?' cropping':''}" data-action="ngphotos-toggle" style="--ngphotos-zoom:${u.zoom}">${NG.media.svg(frame,'ngphotos-full')}${ed&&u.tool==='crop'?'<div class="ngphotos-cropbox"><i></i><i></i><i></i><i></i></div>':''}</div>${video&&!ed?`<button type="button" class="ngphotos-play" data-action="ngphotos-play" aria-label="${esc(c,t(playing?'pause':'play'))}">${image(`quantum_ic_${playing?'pause':'play_arrow'}_white_24`)}</button><div class="ngphotos-video"><span>${duration(u.position)}</span><input type="range" min="0" max="${p.duration||2000}" value="${u.position}" aria-label="${esc(c,t('videos'))}"><span>${duration(p.duration||2000)}</span></div>`:''}${ed?editor(c,p):p.trashedAt?`<div class="ngphotos-photobar"><button type="button" data-action="ngphotos-restore">${esc(c,t('restore'))}</button><button type="button" data-action="ngphotos-delete">${esc(c,t('permanent'))}</button></div>`:`<div class="ngphotos-photobar">${button(c,'share','quantum_ic_share_white_24','share')}${button(c,'edit','quantum_ic_edit_white_24','edit')}${button(c,'info','quantum_ic_info_white_24','details')}${button(c,'delete','quantum_ic_delete_white_24','moveTrash')}</div>`}${u.info?details(c,p):''}`;
  }
  function editor(c,p) {
    const u=U(c), e=u.edits;
    const range=(k,label,min=-100,max=100)=>`<label>${esc(c,t(label))}<input type="range" data-edit="${k}" min="${min}" max="${max}" value="${e[k]||0}" aria-label="${esc(c,t(label))}"></label>`;
    let body='';
    if(p.kind==='video')body=`<div class="ngphotos-trim">${range('start','play',0,Math.max(0,(p.duration||2000)-100))}${range('end','pause',100,p.duration||2000)}</div>`;
    else if(u.tool==='adjustments')body=['light','color','pop'].map(k=>range(k,k)).join('');
    else if(u.tool==='crop')body=`<div class="ngphotos-croptools">${button(c,'aspect','quantum_ic_image_aspect_ratio_white_24','aspect')}${button(c,'rotate','quantum_ic_rotate_90_degrees_ccw_white_24','rotate')}<button type="button" class="ngphotos-textbtn" data-action="ngphotos-reset-crop">${esc(c,t('reset'))}</button></div>`;
    else body=`<div class="ngphotos-presets">${[['original',{}],['auto',{light:15,color:12,pop:18}]].map(([key,values])=>`<button type="button" data-action="ngphotos-filter" data-filter="${key}">${NG.media.svg({...p,edits:{...e,...values}},'ngphotos-svg',1)}<span>${esc(c,t(key))}</span></button>`).join('')}</div>`;
    return `<div class="ngphotos-edittools"><div class="ngphotos-toolbody">${body}</div><div class="ngphotos-toolnav">${[['filters','photo_filter'],['adjustments','tune'],['crop','crop_rotate']].map(([tool,icon])=>`<button type="button" data-action="ngphotos-tool" data-tool="${tool}" class="${u.tool===tool?'on':''}" aria-label="${esc(c,t(tool))}">${image(`quantum_ic_${icon}_white_24`)}</button>`).join('')}</div></div>`;
  }
  function preferences(c) {
    const u=U(c), s=state(c), row=(key,label,summary='',toggle=false)=>NG.settingsRow(c,{title:K[label]?t(label):label,summary:summary?t(summary):'',action:'ngphotos-pref',key,widget:toggle?NG.settingsSwitch(!!s[key]):''});
    if(u.page==='backup')return `${row('backup','backup','',true)}${NG.settingsCat(c,t('backupAccount'))}${row('account',NG.account?.email||'nexus6p.demo@gmail.com')}${NG.settingsCat(c,t('quality'))}${row('quality',s.quality==='original'?'qualityOriginal':'qualityHigh')}${NG.settingsCat(c,t('cellular'))}${row('cellPhotos','photos','',true)}${row('cellVideos','videos','',true)}${NG.settingsCat(c,t('whenBackup'))}${row('roaming','roaming','',true)}${row('charging','charging','',true)}${row('deviceBackup','deviceBackup')}`;
    if(u.page==='assistant-settings')return `${row('rediscover','rediscover','rediscoverSummary',true)}${row('creations','creations','creationsSummary',true)}`;
    if(u.page==='about')return `<div class="ngphotos-about">${image('product_logo_photos_color_144')}<h2>${esc(c,t('welcome'))}</h2><p>1.25.0.131504660</p></div>${row('privacy','privacy')}${row('terms','terms')}`;
    return `${row('backup','backup')}${row('freeSpace','freeSpace')}${row('assistant-settings','assistantCards','assistantSummary')}${row('sharedLinks','sharedLinks','',true)}${row('about','about')}`;
  }
  function onboarding(c) {
    const u=U(c);
    if(!u.onboard)return `<div class="ngphotos-onboard">${image('product_logo_photos_color_144')}<h1>${esc(c,t('welcome'))}</h1><button type="button" data-action="ngphotos-start">${esc(c,t('getStarted'))}</button></div>`;
    return `<div class="ngphotos-onboard backup"><h1>${esc(c,t('backupTitle'))}</h1><p>${esc(c,t('backupDescription'))}</p><strong>${esc(c,NG.account?.email||'nexus6p.demo@gmail.com')}</strong><button type="button" class="ngphotos-backuptoggle" data-action="ngphotos-onboard-backup">${esc(c,t('backup'))}${NG.settingsSwitch(state(c).backup)}</button><button type="button" data-action="ngphotos-start">${esc(c,t('done'))}</button></div>`;
  }
  function render(c) {
    sync(c); const u=U(c), photo=hasPhoto(c), main=['photos','albums','assistant'].includes(u.page);
    if(!state(c).seen&&!photo)return `<div class="ngphotos">${onboarding(c)}</div>`;
    const list=shown(c); let content='';
    if(photo)content=viewer(c);
    else if(u.page==='assistant')content=assistant(c);
    else if(u.page==='albums'||u.page==='shared')content=albums(c,u.page==='shared');
    else if(['settings','backup','assistant-settings','about'].includes(u.page))content=`<div class="ngst ngphotos-prefs">${preferences(c)}</div>`;
    else if(u.page==='device')content=`<button type="button" class="ngphotos-device" data-action="ngphotos-category" data-kind="camera">${list[0]?NG.media.svg(list[0],'ngphotos-svg',1):image('null_album_color_276x88dp')}<span>${esc(c,t('camera'))}</span></button>`;
    else if(u.page==='search'&&!u.query&&!u.category)content=`<div class="ngphotos-searchtypes">${[['video','videos'],['collage','collage'],['animation','animation'],['people','people'],['places','places']].map(([kind,label])=>`<button type="button" data-action="ngphotos-category" data-kind="${kind}">${esc(c,t(label))}</button>`).join('')}</div>`;
    else if(u.category==='people'||u.category==='places')content=empty(c,u.category,u.category==='people'?'noFaces':'noPlaces');
    else content=`${u.page==='trash'?`<p class="ngphotos-trashinfo">${esc(c,t('trashInfo'))}</p>`:''}${u.page==='album'?`<div class="ngphotos-albumtitle"><h1>${esc(c,albumOf(c)?.name||t('untitled'))}</h1><button type="button" data-action="ngphotos-addphotos">${esc(c,t('addPhotos'))}</button></div>`:''}${list.length?grid(c,list):empty(c,u.page==='trash'?'emptyTrashTitle':u.page==='search'?'noResults':u.page==='album'?'emptyAlbum':'empty',u.page==='trash'?'emptyTrashCaption':u.page==='search'?'noResultsCaption':'emptyCaption')}`;
    return `<div class="ngphotos${photo?' black':''}${photo&&!u.chrome&&u.page!=='editor'?' hidechrome':''}${u.page==='editor'?' editing':''}">${bar(c)}${photo?content:`<div class="ngphotos-content${main?' tabbed':''}">${content}</div>`}${main&&!u.selecting&&!u.picking?tabs(c):''}${u.undo?`<div class="ngphotos-snack"><span>${esc(c,t('moveTrash'))}</span><button type="button" data-action="ngphotos-undo">${esc(c,t('undo'))}</button></div>`:''}${drawer(c)}</div>`;
  }
  function askText(c,title,value,onSave) { let text=value; c.dialog({title:t(title),html:`<div class="ngphotos-input"><input value="${esc(c,value)}" aria-label="${esc(c,t(title))}" autocomplete="off"></div>`,mount(c,win){const f=win.querySelector('input');f.addEventListener('input',()=>text=f.value);f.focus();},buttons:[{label:t('cancel')},{label:t('done'),action:c=>onSave(text.trim()||t('untitled'))}]}); }
  function make(c,type,ids) {
    if(type==='album'||type==='sharedAlbum')askText(c,'albumHint','',name=>{const a=L().album(c,name,ids,type==='sharedAlbum');go(c,'album',{album:a.id});});
    else { const frames=ids.map(id=>L().find(c,id)).filter(Boolean).map(p=>({seed:p.seed,time:p.time,front:p.front,edits:p.edits})); if(!frames.length)return;
      const p=NG.media.add(c,{...frames[0],time:Date.now(),kind:type==='movie'?'video':type,frames,duration:frames.length*(type==='animation'?500:2000)}); go(c,'photo',{photo:p.id,fromAlbum:null}); }
  }
  function create(c,anchor) { c.menu(['album','sharedAlbum','movie','animation','collage'].map(type=>({label:t(type),action:c=>{const u=U(c);if(u.selected.length)make(c,type,[...u.selected]);else go(c,'photos',{picking:type,selecting:true});}})),anchor); }
  function chooseAlbum(c,ids) {
    c.dialog({title:t('addAlbum'),items:[{label:t('album')},...state(c).albums.map(a=>({label:a.name||t('untitled')}))],onItem:i=>{if(!i)make(c,'album',ids);else{L().addTo(c,state(c).albums[i-1].id,ids);c.render();}}});
  }
  function remove(c,permanent=false,allTrash=false) {
    const u=U(c), ids=allTrash?L().list(c,true).map(p=>p.id):u.selected.length?[...u.selected]:[u.photo];
    const really=permanent||ids.every(id=>L().find(c,id)?.trashedAt);
    c.dialog({title:t(really?'permanent':'moveTrash'),message:really?t('permanentMessage'):undefined,buttons:[{label:t('cancel')},{label:t(really?'delete':'moveTrash'),action:c=>{
      if(really)L().purge(c,ids);else{L().trash(c,ids);u.undo=ids;}
      u.selected=[];u.selecting=false;if(u.page==='photo')back(c);else c.render();
    }}]});
  }
  function editorState(c,p){return {photo:p.id,edits:{...L().edits(p.edits),start:0,end:p.duration||2000},baseline:JSON.stringify(L().edits(p.edits)),trimChanged:false,tool:'filters'};}
  function edit(c) { const p=current(c); if(p)go(c,'editor',editorState(c,p)); }
  function leaveEditor(c) {
    const u=U(c),leave=()=>{const prev=u.stack.pop()||{page:'photo'};Object.assign(u,prev);c.render();};
    if(JSON.stringify(L().edits(u.edits))===u.baseline && !u.trimChanged){leave();return;}
    c.dialog({title:t('discardTitle'),message:t('discardMessage'),buttons:[{label:t('keepEditing')},{label:t('discard'),action:leave}]});
  }
  function save(c,copy=false) { const u=U(c),p=current(c),out=L().saveEdit(c,p.id,u.edits,copy); if(!out)return;
    if(p.kind==='video'&&u.trimChanged){out.duration=Math.max(100,u.edits.end-u.edits.start);c.save();}
    u.stack.pop();u.page='photo';u.photo=out.id;u.chrome=true;u.trimChanged=false;c.render();c.toast(t('saved')); }
  function more(c,anchor) {
    const u=U(c),p=current(c),items=[],item=(label,action)=>items.push({label:t(label),action});
    if(u.page==='editor'){item('undoEdits',c=>{u.edits={...L().edits(),start:0,end:p.duration||2000};c.render();});item('saveCopy',c=>save(c,true));}
    else if(u.page==='photo') {
      if(p?.trashedAt){item('restore',c=>{L().restore(c,[p.id]);back(c);});item('permanent',c=>remove(c,true));}
      else {item('slideshow',c=>{u.slideshow=true;u.chrome=false;u.lastFrame=Date.now();c.render();});item('addAlbum',c=>chooseAlbum(c,[p.id]));item('details',c=>{u.info=true;c.render();});if(p?.kind==='video')items.push({label:t('loop'),checked:!!u.loop,action:c=>{u.loop=!u.loop;c.render();}});}
    } else if(u.page==='trash'){item('select',c=>{u.selecting=true;c.render();});item('emptyTrash',c=>remove(c,true,true));}
    else if(u.page==='album'){item('editAlbum',c=>askText(c,'albumHint',albumOf(c)?.name||'',name=>{albumOf(c).name=name;c.save();c.render();}));item('addPhotos',c=>go(c,'photos',{picking:'add',targetAlbum:u.album,selecting:true}));item('deleteAlbum',c=>c.dialog({title:t('deleteAlbum'),message:t('deleteAlbumMessage'),buttons:[{label:t('keepAlbum')},{label:t('delete'),action:c=>{state(c).albums=state(c).albums.filter(a=>a.id!==u.album);c.save();back(c);}}]}));}
    else {item('select',c=>{u.selecting=true;c.render();});item('layout',c=>c.menu([['comfortable',2],['day',3],['month',5],['year',8]].map(([key,columns])=>({label:t(key),action:c=>{state(c).columns=columns;c.save();c.render();}}))));}
    item('help',c=>go(c,'help'));c.menu(items,anchor);
  }
  function pref(c,key) {
    const s=state(c),u=U(c);
    if(key==='backup'&&u.page==='settings'){go(c,'backup');return;}
    if(['backup','cellPhotos','cellVideos','roaming','charging','sharedLinks','rediscover','creations'].includes(key)){s[key]=!s[key];c.save();c.render();return;}
    if(key==='quality'){c.dialog({title:t('quality'),items:[{label:t('qualityOriginal')},{label:t('qualityHigh')}],onItem:i=>{s.quality=i?'high':'original';c.save();c.render();}});return;}
    if(key==='account'){c.dialog({title:t('backupAccount'),items:[{label:NG.account?.email||'nexus6p.demo@gmail.com'}]});return;}
    if(key==='freeSpace'){c.dialog({message:t('freeSpaceMessage'),buttons:[{label:t('ok')}]});return;}
    if(key==='deviceBackup'){go(c,'device');return;}
    if(key==='privacy'||key==='terms'){c.dialog({title:t(key),message:`Google Photos · 2017`,buttons:[{label:t('ok')}]});return;}
    go(c,key);
  }
  function next(c,direction) { const u=U(c),list=shown(c),i=list.findIndex(p=>p.id===u.photo);if(!list.length)return;u.photo=list[(i+direction+list.length)%list.length].id;u.position=0;u.info=false;u.zoom=1;c.render(); }
  NG.register('photos', {
    init(c){let size='';new ResizeObserver(()=>{const next=`${c.el.screen.clientWidth}/${c.el.screen.clientHeight}`;if(next!==size){size=next;if(c.ui.view==='photos')c.render();}}).observe(c.el.screen);},
    noStatus:c=>{sync(c);return hasPhoto(c);}, statusColor:()=> '#9e9e9e', dialogAccent:()=> '#4285f4',
    render(c){sync(c);if(U(c).page==='help')return `<div class="ngphotos">${bar(c)}<div class="ngphotos-content"><div class="ngphotos-help"><h2>${esc(c,t('welcome'))}</h2>${['backupTitle','backupDescription','emptyCaption','trashInfo'].map(k=>`<p>${esc(c,t(k))}</p>`).join('')}</div></div></div>`;return render(c);},
    back,
    unmount(c){const u=U(c);u.playing=false;u.slideshow=false;u.drawer=false;},
    tick(c){const u=U(c);if(c.ui.view!=='photos')return;const now=Date.now();if(u.slideshow&&now-(u.lastFrame||now)>=2500){u.lastFrame=now;next(c,1);}if(u.playing){const p=current(c);u.position=Math.min(p?.duration||2000,u.position+now-(u.lastTick||now));u.lastTick=now;if(u.position>=(p?.duration||2000)){if(u.loop)u.position=0;else u.playing=false;}c.render();}},
    mount(c,root){
      const u=U(c),f=root.querySelector('.ngphotos-search');if(f){f.addEventListener('input',()=>{const start=f.selectionStart;u.query=f.value;c.render();const n=c.el.viewport.querySelector('.ngphotos-search');n.focus();try{n.setSelectionRange(start,start);}catch{}});}
      root.querySelector('.ngphotos-caption')?.addEventListener('change',e=>{current(c).caption=e.target.value;c.save();});
      for(const r of root.querySelectorAll('[data-edit]'))r.addEventListener('input',()=>{let value=+r.value;const key=r.dataset.edit;if(key==='start'){value=Math.min(value,u.edits.end-100);u.trimChanged=true;}if(key==='end'){value=Math.max(value,u.edits.start+100);u.trimChanged=true;}u.edits[key]=value;const svg=root.querySelector('.ngphotos-full');if(svg)svg.outerHTML=NG.media.svg({...current(c),edits:u.edits},'ngphotos-full');});
      root.querySelector('.ngphotos-video input')?.addEventListener('input',e=>{u.position=+e.target.value;u.lastTick=Date.now();c.render();});
      for(const cell of root.querySelectorAll('.ngphotos-cell')){
        let timer;const cancel=()=>clearTimeout(timer);cell.addEventListener('pointerdown',e=>{if(e.button)return;timer=setTimeout(()=>{u.selecting=true;if(!u.selected.includes(+cell.dataset.id))u.selected.push(+cell.dataset.id);c.render();},500);});for(const event of ['pointerup','pointercancel','pointerleave'])cell.addEventListener(event,cancel);
      }
      const canvas=root.querySelector('.ngphotos-canvas');if(canvas){let start=null;canvas.addEventListener('pointerdown',e=>{start=[e.clientX,e.clientY];});canvas.addEventListener('pointercancel',()=>start=null);canvas.addEventListener('pointerup',e=>{if(!start)return;const dx=e.clientX-start[0],dy=e.clientY-start[1];start=null;if(u.page==='photo'&&Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5){u.ignoreTap=true;next(c,dx<0?1:-1);}});canvas.addEventListener('dblclick',()=>{u.zoom=u.zoom===1?2:1;c.render();});}
      const cropbox=root.querySelector('.ngphotos-cropbox');
      if(cropbox&&canvas){
        const p=current(c),base=p.ratio||(p.kind==='pano'?3:4/3),ratio=u.edits.turn%2?1/base:base;
        const cw=canvas.clientWidth,ch=canvas.clientHeight,w=Math.min(cw,ch*ratio),h=w/ratio,left=(cw-w)/2,top=(ch-h)/2;
        const paint=()=>{const [x,y,rw,rh]=u.edits.crop;Object.assign(cropbox.style,{inset:'auto',left:`${left+x*w}px`,top:`${top+y*h}px`,width:`${rw*w}px`,height:`${rh*h}px`});};
        paint();let drag;
        cropbox.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();const corner=[...cropbox.children].indexOf(e.target);drag={x:e.clientX,y:e.clientY,crop:[...u.edits.crop],corner};cropbox.setPointerCapture(e.pointerId);});
        cropbox.addEventListener('pointermove',e=>{if(!drag)return;const dx=(e.clientX-drag.x)/w,dy=(e.clientY-drag.y)/h,[x,y,rw,rh]=drag.crop,clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
          if(drag.corner<0)u.edits.crop=[clamp(x+dx,0,1-rw),clamp(y+dy,0,1-rh),rw,rh];
          else{let l=x,r=x+rw,t=y,b=y+rh;if([0,2].includes(drag.corner))l=clamp(x+dx,0,r-.1);else r=clamp(x+rw+dx,l+.1,1);if([0,1].includes(drag.corner))t=clamp(y+dy,0,b-.1);else b=clamp(y+rh+dy,t+.1,1);u.edits.crop=[l,t,r-l,b-t];}paint();});
        for(const name of ['pointerup','pointercancel'])cropbox.addEventListener(name,()=>{if(!drag)return;drag=null;c.render();});
      }
    },
    action(name,el,event,c){
      const u=U(c),s=state(c),p=current(c);if(!name.startsWith('ngphotos-'))return false;
      switch(name.slice('ngphotos-'.length)){
        case 'start':if(!u.onboard)u.onboard=true;else{s.seen=true;c.save();}c.render();break;
        case 'onboard-backup':s.backup=!s.backup;c.save();c.render();break;
        case 'drawer':u.drawer=!u.drawer;c.render();break;
        case 'dest':go(c,el.dataset.page);break;
        case 'tab':u.stack=[];go(c,el.dataset.tab,{tab:el.dataset.tab},true);break;
        case 'back':back(c);break;
        case 'photo':if(u.selecting||u.picking){const id=+el.dataset.id;u.selected=u.selected.includes(id)?u.selected.filter(x=>x!==id):[...u.selected,id];c.render();}else go(c,'photo',{photo:+el.dataset.id,fromAlbum:u.page==='album'?u.album:null,chrome:true,position:0});break;
        case 'album':go(c,'album',{album:+el.dataset.id});break;
        case 'search':go(c,'search',{query:'',category:''});break;
        case 'category':if(el.dataset.kind==='device')go(c,'device');else if(el.dataset.kind==='camera')go(c,'photos');else go(c,'search',{category:el.dataset.kind,query:''});break;
        case 'more':more(c,el);break;
        case 'create':create(c,el);break;
        case 'new':go(c,'photos',{picking:el.dataset.kind,selecting:true});break;
        case 'cancel-selection':u.selected=[];u.selecting=false;u.picking='';c.render();break;
        case 'picked':{const ids=[...u.selected],kind=u.picking;u.picking='';u.selecting=false;u.selected=[];if(kind==='add'){L().addTo(c,u.targetAlbum,ids);back(c);}else make(c,kind,ids);break;}
        case 'addphotos':go(c,'photos',{picking:'add',targetAlbum:u.album,selecting:true});break;
        case 'delete':remove(c);break;
        case 'restore':L().restore(c,u.selected.length?u.selected:[u.photo]);u.selected=[];u.selecting=false;if(u.page==='photo')back(c);else c.render();break;
        case 'undo':L().restore(c,u.undo||[]);u.undo=null;c.render();break;
        case 'share':{const ids=u.selected.length?u.selected:[u.photo],first=L().find(c,ids[0]);if(first)NG.share(c,{kind:first.kind==='video'?'video':'image',title:t('share'),name:fileName(first),photo:first.id,exclude:['photos']});break;}
        case 'info':u.info=!u.info;c.render();break;
        case 'toggle':if(u.ignoreTap){u.ignoreTap=false;break;}if(u.page==='photo'){u.chrome=!u.chrome;u.slideshow=false;c.render();}break;
        case 'play':u.playing=!u.playing;u.lastTick=Date.now();if(u.position>=(p.duration||2000))u.position=0;c.render();break;
        case 'edit':edit(c);break;
        case 'tool':u.tool=el.dataset.tool;c.render();break;
        case 'filter':Object.assign(u.edits,el.dataset.filter==='auto'?{light:15,color:12,pop:18}:{light:0,color:0,pop:0});c.render();break;
        case 'rotate':u.edits.turn=(u.edits.turn+3)%4;u.edits.crop=[0,0,1,1];c.render();break;
        case 'reset-crop':u.edits.turn=0;u.edits.crop=[0,0,1,1];c.render();break;
        case 'aspect':c.menu([['original',0],['square',1],['cpe_aspect_ratio_4_3',4/3],['cpe_aspect_ratio_16_9',16/9],['cpe_aspect_ratio_3_2',3/2]].map(([key,ratio])=>({label:t(key),action:c=>{const r=(p.ratio||(p.kind==='pano'?3:4/3)),natural=u.edits.turn%2?1/r:r;if(!ratio)u.edits.crop=[0,0,1,1];else if(natural>ratio){const w=ratio/natural;u.edits.crop=[(1-w)/2,0,w,1];}else{const h=natural/ratio;u.edits.crop=[0,(1-h)/2,1,h];}c.render();}})),el);break;
        case 'save':save(c);break;
        case 'pref':pref(c,el.dataset.key);break;
      }
      return true;
    }
  });
})();
