/* Android 2.3.6 Messaging attachments (Mms.apk of the GRK39F image) and the Sound Recorder it calls (SoundRecorder.apk):
   - Add attachment (AttachmentTypeSelectorAdapter): Pictures / Videos pick from the phone's pictures or videos (Gallery's
     GET_CONTENT image/* or video/*), Capture picture / video take one with the Camera (IMAGE_CAPTURE, VIDEO_CAPTURE),
     Audio is the ringtone picker over every sound (MessageUtils.selectAudio: no Default, no Silent, "Select audio"),
     Record audio Sound Recorder (GET_CONTENT audio/amr), Slideshow the slideshow editor. One attachment at a time; adding
     one makes the message MMS ("Converting to multimedia message…"), removing it SMS again.
   - The AttachmentEditor above the bottom panel: image_attachment_view (the picture 135 dp high; View / Replace / Remove
     100 x 45 dp), video_attachment_view (the frame with ic_gallery_video_overlay), audio_attachment_view
     (ic_launcher_record_audio, the name, album and artist; Play / Replace / Remove) and slideshow_attachment_view (the
     first slide in a 240 x 180 dp picture_frame with mms_play_btn; Edit / Send 80 x 45 dp). With a slideshow the bottom
     panel is INVISIBLE (drawBottomPanel): its text lives in the slides.
   - View / Play and a message's play button open SlideshowActivity: each slide's picture with its text on top or at the
     bottom for its duration, then back.
   - SlideshowEditActivity "Edit slideshow" (slideshow_edit_item.xml rows and the Add slide row) and SlideEditorActivity
     "Part n/N" (edit_slide_activity.xml) with their menus: Preview, Remove text, Remove / Add picture, Capture picture,
     Remove / Add music, Remove / Add video, Add slide, Duration (n sec) and Layout (top / bottom), the duration list
     (select_dialog_items, "Other…" a number) and the layout list.
   - Sound Recorder (layout-port/main.xml): the 242 dp timer panel on gradient_bg ("%02d:%02d" in 112 dp, the LED and
     the state text), the VUMeter or the exit buttons ("Use this recording" / "Discard" 15 / 2 dp in) and the 60 dp bar
     on activity_title_bar with record, play and stop (btn_media_player). A recording is kept with the title
     "yyyy-MM-dd HH:mm:ss", artist "Your recordings", album "Audio recordings". There is no microphone: the needle moves
     as it would with someone speaking.
   A draft's attachment is the picture or video itself (a video has video: true), {kind: 'audio', audio} or
   {kind: 'slideshow', slides, layout}; a slide is {image | video, audio, text, duration}. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const R = AndroidStrings.resources(() => window.GBStrings?.mms), T = (ctx, key) => R.t(key, ctx.lang);
  const RR = AndroidStrings.resources(() => window.GBStrings?.recorder), TR = (ctx, key) => RR.t(key, ctx.lang);
  const DURATION = 5;   // SlideModel's default, 5000 ms
  const MAX_SLIDES = 10; // SlideshowModel.checkMessageSize with the image's MmsConfig keeps a message to ten slides
  const kindOf = a => !a ? '' : a.kind || (a.video ? 'video' : 'image');
  const picture = p => p ? window.ICSMedia?.art(p) || '' : '';
  const soundTitle = file => { for (const list of Object.values(window.SystemSounds?.SOUNDS || {})) if (list[file]) return list[file][0]; return file; };
  const slidesOf = a => kindOf(a) === 'slideshow' ? a.slides : a ? [kindOf(a) === 'audio' ? {audio: a.audio, text: '', duration: DURATION} : {[kindOf(a)]: a, text: '', duration: DURATION}] : [];
  const duration = (ctx, n) => AndroidStrings.format(R.t(AndroidStrings.quantity(n, ctx.lang) === 'one' ? 'slide_duration_one' : 'slide_duration_other', ctx.lang), n);
  const top = ui => (ui.gbmaScreen || []).at(-1);

  // ---------- The compose screen ----------
  const button = (action, label, width, id = '') => `<button type="button" class="gbma-btn" data-action="${action}"${id ? ` data-id="${e(id)}"` : ''} style="width:calc(${width} * var(--dp))">${e(label)}</button>`;
  function editor(ctx, draft) {
    const a = draft?.attachment, kind = kindOf(a); if (!kind) return '';
    const three = first => `<span class="gbma-btns">${button(first === 'play' ? 'gbma-view' : 'gbma-view', T(ctx, first), 100)}${button('gbma-replace', T(ctx, 'replace'), 100)}${button('mms-remove-attachment', T(ctx, 'remove'), 100)}</span>`;
    if (kind === 'image') return `<div class="gbma gbma-image"><span class="gbma-media">${picture(a)}</span>${three('view')}</div>`;
    if (kind === 'video') return `<div class="gbma gbma-video"><span class="gbma-media">${picture(a)}<img class="gbma-overlay" src="assets/gb-m-ic_gallery_video_overlay.png" alt=""></span>${three('view')}</div>`;
    if (kind === 'audio') return `<div class="gbma gbma-audio"><span class="gbma-sound"><img src="assets/gb-m-ic_launcher_record_audio.png" alt=""><b>${e(a.audio.title)}</b>${a.audio.album ? `<small>${e(a.audio.album)}</small>` : ''}${a.audio.artist ? `<small>${e(a.audio.artist)}</small>` : ''}</span>${three('play')}</div>`;
    const s = a.slides[0] || {};
    return `<div class="gbma gbma-show"><span class="gbma-frame"><span class="gbma-framebody${a.layout === 'top' ? ' top' : ''}">${s.image || s.video ? `<span class="gbma-framepic">${picture(s.image || s.video)}</span>` : '<span class="gbma-framepic"></span>'}${s.text ? `<span class="gbma-frametext">${e(s.text)}</span>` : ''}</span><button type="button" class="gbma-play" data-action="gbma-view" aria-label="${e(T(ctx, 'play'))}"><img src="assets/gb-m-mms_play_btn.png" alt=""></button></span><span class="gbma-btns two">${button('gbma-edit', T(ctx, 'edit'), 80)}${button('gbmms-send', T(ctx, 'send'), 80)}</span></div>`;
  }
  // The message list's mms_layout_view: the picture, mms_play_btn over video, sound and slideshow.
  function row(m) {
    const a = m.attachment, kind = kindOf(a); if (!kind) return '';
    const first = kind === 'slideshow' ? a.slides[0] || {} : kind === 'audio' ? {} : {[kind]: a}, shot = first.image || first.video;
    return `<span class="gbmms-mms gbma-row">${shot ? `<span class="mms-photo-frame">${picture(shot)}</span>` : '<img class="gbma-rowicon" src="assets/gb-m-ic_mms_music.png" alt="">'}${kind !== 'image' ? `<span class="gbma-play" data-action="gbma-rowplay" data-id="${e(m.id)}" role="button" aria-label="Play"><img src="assets/gb-m-mms_play_btn.png" alt=""></span>` : ''}</span>`;
  }

  // ---------- Screens over the compose screen (ui.gbmaScreen) ----------
  function screen(ctx) {
    const id = top(ctx.ui); if (!id) return null;
    if (id === 'show') return showScreen(ctx);
    if (id === 'slides') return slidesScreen(ctx);
    if (id === 'slide') return slideScreen(ctx);
    if (id === 'recorder') return recorderScreen(ctx);
    return null;
  }
  const slides = ctx => ctx.draftOf()?.attachment?.slides || [];
  function showScreen(ctx) {
    const sh = ctx.ui.gbmaShow, s = sh?.slides[sh.at]; if (!s) return '';
    const media = s.image || s.video ? picture(s.image || s.video) : s.audio ? `<span class="gbma-playing"><img src="assets/gb-m-ic_mms_music.png" alt=""><span>${e(s.audio.title)}</span></span>` : '';
    return `<div class="app-view gbma-slideshow${sh.layout === 'top' ? ' top' : ''}" data-no-translate><div class="gbma-slidemedia">${media}</div>${s.text ? `<div class="gbma-slidetext">${e(s.text)}</div>` : ''}</div>`;
  }
  function slidesScreen(ctx) {
    const rows = slides(ctx).map((s, i) => {
      const shot = s.image || s.video;
      return `<button type="button" class="gbma-srow" data-action="gbma-open-slide" data-id="${i}">${shot ? `<span class="gbma-sthumb">${picture(shot)}</span>` : '<img class="gbma-sthumb icon" src="assets/gb-m-ic_launcher_slideshow_default_sms.png" alt="">'}<span class="gbma-stext"><b>${e(AndroidStrings.format(T(ctx, 'slide_number'), i + 1))}</b><span class="gbma-sline">${s.text ? `<span class="gbma-sprev">${e(s.text)}</span>` : ''}${s.audio ? `<span class="gbma-sprev">${e(s.audio.title)}</span>` : ''}<span class="gbma-sdur">${e(duration(ctx, s.duration))}</span></span></span></button>`;
    }).join('');
    return `<div class="app-view gbmms gbma-slides" data-no-translate><div class="gb-titlebar">${e(T(ctx, 'edit_slideshow_activity'))}</div><div class="gbma-slist">${rows}<button type="button" class="gbma-srow" data-action="gbma-add-slide"><img class="gbma-sthumb icon" src="assets/gb-m-ic_launcher_slideshow_add_sms.png" alt=""><span class="gbma-stext"><b>${e(T(ctx, 'add_slide'))}</b><span class="gbma-sline"><span class="gbma-sprev">${e(T(ctx, 'add_slide_hint'))}</span></span></span></button></div></div>`;
  }
  function slideScreen(ctx) {
    const list = slides(ctx), i = ctx.ui.gbmaSlide ?? 0, s = list[i]; if (!s) return '';
    const small = (action, inner, on = true) => `<button type="button" class="gbma-small" data-action="${action}"${on ? '' : ' disabled'}>${inner}</button>`;
    return `<div class="app-view gbmms gbma-editor" data-no-translate><div class="gb-titlebar">${e(AndroidStrings.format(T(ctx, 'slide_show_part'), i + 1, list.length))}</div><div class="gbma-epanel"><div class="gbma-eleft"><span class="gbma-epic">${picture(s.image || s.video)}</span>${s.audio ? `<span class="gbma-eaudio"><img src="assets/gb-m-ic_mms_music.png" alt=""><span>${e(s.audio.title)}</span></span>` : ''}</div>
      <div class="gbma-ectl"><div class="gbma-enav">${small('gbma-prev', '<img src="assets/gb-m-ic_maps_back.png" alt="">', i > 0)}${small('gbma-next', '<img src="assets/gb-m-ic_maps_next.png" alt="">', i < list.length - 1)}</div>${small('gbma-preview', e(T(ctx, 'preview')))}${small('gbma-replace-picture', e(T(ctx, 'replace_image')))}${small('gbma-remove-slide', e(T(ctx, 'remove_slide')))}</div></div>
      <div class="gbma-ebottom"><input class="gbma-etext" data-gbma-text value="${e(s.text || '')}" placeholder="${e(T(ctx, 'type_to_compose_text_or_leave_blank'))}" autocomplete="off" maxlength="2000">${button('gbma-done', T(ctx, 'done'), 80)}</div></div>`;
  }
  function recorderScreen(ctx) {
    const r = ctx.ui.gbmaRec || {state: 'idle', length: 0}, now = Date.now();
    const shown = r.state === 'recording' ? Math.floor((now - r.started) / 1000) : r.state === 'playing' ? Math.min(r.length, Math.floor((now - r.started) / 1000)) : r.length;
    const title = TR(ctx, r.state === 'playing' ? 'review_message' : r.state === 'idle' && r.length ? 'message_recorded' : 'record_your_message');
    const led = r.state === 'recording' ? 'recording_led' : r.state === 'idle' && !r.length ? 'idle_led' : '';
    const state = r.state === 'recording' ? TR(ctx, 'recording') : r.state === 'idle' && !r.length ? TR(ctx, 'press_record') : '';
    const exit = r.length && r.state !== 'recording';
    const media = (id, on) => `<button type="button" class="gbsr-btn" data-action="gbma-rec-${id}"${on ? '' : ' disabled'} aria-label="${id}"><img src="assets/gb-sr-${id}.png" alt=""></button>`;
    const needle = r.state === 'recording' ? 22.5 + 135 * Math.min(1, Math.abs(Math.sin(now / 170)) * (0.4 + Math.random() * 0.6)) : 22.5;
    return `<div class="app-view gbsr" data-no-translate><div class="gb-titlebar">${e(title)}</div><i class="gbsr-div"></i><div class="gbsr-panel"><div class="gbsr-state">${led ? `<img src="assets/gb-sr-${led}.png" alt="">` : ''}<span>${e(state)}</span></div>${r.state === 'playing' ? `<div class="gbsr-progress"><i style="width:${r.length ? Math.min(100, (now - r.started) / 10 / r.length) : 0}%"></i></div>` : ''}<div class="gbsr-time">${e(AndroidStrings.format(TR(ctx, 'timer_format'), Math.floor(shown / 60), shown % 60))}</div></div><i class="gbsr-div"></i>
      <div class="gbsr-middle">${exit ? `<div class="gbsr-exit"><button type="button" class="gbma-btn" data-action="gbma-rec-accept">${e(TR(ctx, 'accept'))}</button><button type="button" class="gbma-btn" data-action="gbma-rec-discard">${e(TR(ctx, 'discard'))}</button></div>` : `<div class="gbsr-vu"><img src="assets/gb-sr-vumeter.png" alt=""><i class="gbsr-needle" style="transform:rotate(${needle}deg)"></i><i class="gbsr-pivot"></i></div>`}</div><i class="gbsr-div"></i>
      <div class="gbsr-bar">${media('record', r.state !== 'recording')}${media('play', r.state === 'idle' && r.length > 0)}${media('stop', r.state !== 'idle')}</div></div>`;
  }

  // ---------- Menus and dialogs ----------
  function menu(ctx) {
    const id = top(ctx.ui);
    if (id === 'slides') return [{action: 'gbma-add-slide', title: T(ctx, 'add_slide'), icon: 'gb-m-ic_menu_add_slide.png'}, {action: 'gbma-discard', title: T(ctx, 'discard_slideshow'), icon: 'gb-m-ic_menu_delete_played.png'}];
    if (id !== 'slide') return id ? [] : null;
    const list = slides(ctx), i = ctx.ui.gbmaSlide ?? 0, s = list[i] || {}, layout = ctx.draftOf()?.attachment?.layout;
    const items = [{action: 'gbma-preview', title: T(ctx, 'preview_slideshow'), icon: 'gb-ic_menu_play_clip.png'}];
    if (s.text) items.push({action: 'gbma-remove-part', id: 'text', title: T(ctx, 'remove_text'), icon: 'gb-m-ic_menu_remove_text.png'});
    if (s.image) items.push({action: 'gbma-remove-part', id: 'image', title: T(ctx, 'remove_picture'), icon: 'gb-m-ic_menu_remove_picture.png'});
    else if (!s.video) items.push({action: 'gbma-attach', id: 'image:slide', title: T(ctx, 'add_picture'), icon: 'gb-m-ic_menu_picture.png'}, {action: 'gbma-attach', id: 'take-photo:slide', title: T(ctx, 'attach_take_photo'), icon: 'gb-m-ic_menu_picture.png'});
    if (s.audio) items.push({action: 'gbma-remove-part', id: 'audio', title: T(ctx, 'remove_music'), icon: 'gb-m-ic_menu_remove_sound.png'});
    else if (!s.video) items.push({action: 'gbma-music', title: T(ctx, 'add_music'), icon: 'gb-m-ic_menu_add_sound.png'});
    if (s.video) items.push({action: 'gbma-remove-part', id: 'video', title: T(ctx, 'remove_video'), icon: 'gb-m-ic_menu_remove_video.png'});
    else if (!s.image && !s.audio) items.push({action: 'gbma-attach', id: 'video:slide', title: T(ctx, 'add_video'), icon: 'gb-m-ic_menu_movie.png'});
    items.push({action: 'gbma-add-slide', title: T(ctx, 'add_slide'), icon: 'gb-m-ic_menu_add_slide.png'});
    items.push({action: 'gbma-duration', title: AndroidStrings.format(T(ctx, 'duration_sec'), s.duration || DURATION), icon: 'gb-m-ic_menu_duration.png'});
    items.push({action: 'gbma-layout', title: T(ctx, layout === 'top' ? 'layout_top' : 'layout_bottom'), icon: 'gb-m-ic_mms_layout.png'});
    return items;
  }
  function dialog(kind, ctx) {
    const pick = ctx.ui.gbmaPick || {};
    if (kind === 'gbma-media') {
      const list = ctx.data.photos.filter(p => pick.type === 'video' ? p.video : !p.video);
      return {title: T(ctx, pick.type === 'video' ? 'attach_video' : 'attach_image'), custom: `<div class="gbmms-pictures">${list.map(p => `<button type="button" data-action="gbma-picked" data-id="${p.id}">${window.ICSMessaging.photo(p)}${p.video ? '<img class="gbma-overlay" src="assets/gb-m-ic_gallery_video_overlay.png" alt="">' : ''}</button>`).join('')}</div>`, buttons: [{action: 'close-overlay', title: ctx.cancel}]};
    }
    if (kind === 'gbma-audio') {
      const files = Object.values(window.SystemSounds?.SOUNDS || {}).flatMap(list => Object.keys(list));
      return {title: T(ctx, 'select_audio'), items: files.map(file => ({action: 'gbma-audio-pick', id: file, title: soundTitle(file)})), choice: 'single', selected: Math.max(-1, files.indexOf(ctx.ui.gbmaAudio)), buttons: [{action: 'gbma-audio-ok', title: ctx.ok}, {action: 'gbma-audio-cancel', title: ctx.cancel}]};
    }
    if (kind === 'gbma-music') return {title: T(ctx, 'add_music'), items: [{action: 'gbma-attach', id: 'sound:slide', title: T(ctx, 'attach_sound')}, {action: 'gbma-attach', id: 'record-sound:slide', title: T(ctx, 'attach_record_sound')}]};
    const list = slides(ctx), i = ctx.ui.gbmaSlide ?? 0;
    if (kind === 'gbma-duration') return {title: `${T(ctx, 'duration_selector_title')}${i + 1}/${list.length}`, icon: 'gb-m-ic_mms_duration.png', items: R.array('select_dialog_items', ctx.lang).map((label, n) => ({action: 'gbma-duration-pick', id: n, title: label}))};
    if (kind === 'gbma-duration-other') return {title: `${T(ctx, 'duration_selector_title')}${i + 1}/${list.length}`, icon: 'gb-m-ic_mms_duration.png', custom: `<label class="gbdlg-field"><input data-gbma-duration type="number" inputmode="numeric" min="1" max="999" value="${list[i]?.duration || DURATION}"></label>`, buttons: [{action: 'gbma-duration-ok', title: ctx.ok}, {action: 'close-overlay', title: ctx.cancel}]};
    if (kind === 'gbma-layout') return {title: `${T(ctx, 'layout_selector_title')}${i + 1}/${list.length}`, icon: 'gb-m-ic_mms_layout.png', items: [{action: 'gbma-layout-pick', id: 'top', title: T(ctx, 'select_top_text'), icon: 'gb-m-ic_mms_text_top.png'}, {action: 'gbma-layout-pick', id: 'bottom', title: T(ctx, 'select_bottom_text'), icon: 'gb-m-ic_mms_text_bottom.png'}]};
    return null;
  }

  // ---------- Actions ----------
  // ctx: {ui, data, lang, ok, cancel, draft(), save, render, renderOverlay, toast, dialog(kind), capture(type), back()}.
  let showTimer = 0, recTimer = 0;
  function setAttachment(ctx, a) {
    const draft = ctx.draftOf(), had = !!draft.attachment || !!draft.subject;
    draft.attachment = a; draft.updated = Date.now();
    if (!a) { delete draft.attachment; if (!draft.subject) ctx.toast(T(ctx, 'converting_to_text_message')); }
    else if (!had) ctx.toast(T(ctx, 'converting_to_picture_message'));
    ctx.save();
  }
  // A part picked or recorded for the target: the draft (a new attachment) or the slide being edited.
  function apply(ctx, target, part) {
    if (target === 'slide') {
      const s = slides(ctx)[ctx.ui.gbmaSlide ?? 0]; if (!s) return;
      if (part.image) { delete s.video; s.image = part.image; } else if (part.video) { delete s.image; delete s.audio; s.video = part.video; } else if (part.audio) s.audio = part.audio;
      ctx.save(); return;
    }
    setAttachment(ctx, part.image || part.video || {kind: 'audio', audio: part.audio});
  }
  function start(ctx, type, target) {
    ctx.ui.overlay = ''; ctx.renderOverlay();
    if (type === 'image' || type === 'video') { ctx.ui.gbmaPick = {type, target}; ctx.dialog('gbma-media'); return; }
    if (type === 'take-photo' || type === 'record-video') { ctx.capture(type === 'take-photo' ? 'image' : 'video', target); return; }
    if (type === 'sound') { ctx.ui.gbmaPick = {type: 'audio', target}; ctx.ui.gbmaAudio = ''; ctx.dialog('gbma-audio'); return; }
    if (type === 'record-sound') { ctx.ui.gbmaRec = {state: 'idle', length: 0, target}; (ctx.ui.gbmaScreen ||= []).push('recorder'); ctx.render(); return; }
    if (type === 'slideshow') editSlideshow(ctx);
  }
  // Slideshow: what is attached becomes its first slide, the text the first slide's text.
  function editSlideshow(ctx) {
    const draft = ctx.draftOf(), a = draft.attachment;
    if (kindOf(a) !== 'slideshow') {
      const list = slidesOf(a);
      if (!list.length) list.push({text: '', duration: DURATION});
      if ((draft.body || '').trim()) { list[0].text = draft.body; draft.body = ''; }
      setAttachment(ctx, {kind: 'slideshow', slides: list, layout: 'bottom'});
    }
    ctx.ui.gbmaScreen = ['slides']; ctx.render();
  }
  // WorkingMessage.correctAttachmentState: leaving the editor, one slide is that slide's attachment, none none.
  function settle(ctx) {
    const draft = ctx.draftOf(), a = draft.attachment; if (kindOf(a) !== 'slideshow') return;
    if (!a.slides.length) { setAttachment(ctx, null); return; }
    if (a.slides.length > 1) return;
    const s = a.slides[0];
    if (s.text) draft.body = s.text;
    draft.attachment = s.image || s.video || (s.audio ? {kind: 'audio', audio: s.audio} : undefined);
    if (!draft.attachment) delete draft.attachment;
    ctx.save();
  }
  function play(ctx, list, layout) {
    clearTimeout(showTimer);
    ctx.ui.gbmaShow = {slides: list, layout: layout || 'bottom', at: 0};
    (ctx.ui.gbmaScreen ||= []).push('show'); ctx.render();
  }
  // SlideshowActivity's player: the slide's sound, then the next slide after its duration; the end goes back.
  function mounted(ctx) {
    clearTimeout(showTimer);
    if (top(ctx.ui) === 'show') {
      const sh = ctx.ui.gbmaShow, s = sh?.slides[sh.at]; if (!s) return;
      if (s.audio?.file) window.SystemSounds?.play(Object.keys(window.SystemSounds.SOUNDS).find(cat => window.SystemSounds.SOUNDS[cat][s.audio.file]), s.audio.file);
      showTimer = setTimeout(() => {
        if (top(ctx.ui) !== 'show' || ctx.ui.gbmaShow !== sh) return;
        window.SystemSounds?.stop();
        if (sh.at + 1 < sh.slides.length) { sh.at++; ctx.render(); } else { ctx.ui.gbmaScreen.pop(); ctx.ui.gbmaShow = null; ctx.render(); }
      }, (s.duration || DURATION) * 1000);
    }
    const text = ctx.root?.querySelector('[data-gbma-text]');
    if (text) text.addEventListener('input', () => { const s = slides(ctx)[ctx.ui.gbmaSlide ?? 0]; if (s) { s.text = text.value; ctx.save(); } });
    clearInterval(recTimer);
    const r = ctx.ui.gbmaRec;
    if (top(ctx.ui) === 'recorder' && r && r.state !== 'idle') recTimer = setInterval(() => {
      if (top(ctx.ui) !== 'recorder' || ctx.ui.gbmaRec !== r) { clearInterval(recTimer); return; }
      if (r.state === 'playing' && Date.now() - r.started >= r.length * 1000) { r.state = 'idle'; ctx.render(); return; }
      // The time, the needle and the progress change in place: a full redraw would drop a touch on Stop.
      const root = ctx.root, now = Date.now(), shown = Math.floor((now - r.started) / 1000);
      const time = root?.querySelector('.gbsr-time');
      if (time) time.textContent = AndroidStrings.format(TR(ctx, 'timer_format'), Math.floor(Math.min(shown, r.state === 'playing' ? r.length : shown) / 60), Math.min(shown, r.state === 'playing' ? r.length : shown) % 60);
      const needle = root?.querySelector('.gbsr-needle');
      if (needle && r.state === 'recording') needle.style.transform = `rotate(${22.5 + 135 * Math.min(1, Math.abs(Math.sin(now / 170)) * (0.4 + Math.random() * 0.6))}deg)`;
      const bar = root?.querySelector('.gbsr-progress i');
      if (bar && r.length) bar.style.width = `${Math.min(100, (now - r.started) / 10 / r.length)}%`;
    }, 100);
  }
  function removeSlide(ctx) {
    const list = slides(ctx), i = ctx.ui.gbmaSlide ?? 0;
    list.splice(i, 1); ctx.save();
    if (!list.length) { ctx.ui.gbmaScreen.pop(); return; }
    ctx.ui.gbmaSlide = Math.max(0, i - 1);
  }
  const addSlide = ctx => { if (slides(ctx).length >= MAX_SLIDES) { ctx.toast(T(ctx, 'cannot_add_slide_anymore')); return false; } slides(ctx).push({text: '', duration: DURATION}); ctx.save(); return true; };
  function recordedAudio(ctx) {
    const now = new Date(), pad = n => String(n).padStart(2, '0');
    // audio_db_title_format "yyyy-MM-dd HH:mm:ss" with the recording's length.
    return {title: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`, artist: TR(ctx, 'audio_db_artist_name'), album: TR(ctx, 'audio_db_album_name'), length: ctx.ui.gbmaRec?.length || 0};
  }
  function handle(action, id, ctx) {
    const {ui} = ctx, close = () => { ui.overlay = ''; ctx.renderOverlay(); };
    const draft = () => ctx.draftOf(), a = () => draft().attachment;
    switch (action) {
      // The Add attachment list (gb-mms.js) and the slide editor's menu: "type" or "type:slide".
      case 'gbma-attach': { const [type, target] = String(id).split(':'); start(ctx, type, target || 'draft'); return true; }
      case 'gbma-picked': { const p = ctx.data.photos.find(x => String(x.id) === String(id)); close(); if (p) { apply(ctx, ui.gbmaPick?.target, p.video ? {video: structuredClone(p)} : {image: structuredClone(p)}); } ui.gbmaPick = null; ctx.render(); return true; }
      case 'gbma-audio-pick': ui.gbmaAudio = id; { const cat = Object.keys(window.SystemSounds?.SOUNDS || {}).find(c => window.SystemSounds.SOUNDS[c][id]); if (cat) window.SystemSounds.play(cat, id); } ctx.renderOverlay(); return true;
      case 'gbma-audio-ok': window.SystemSounds?.stop(); close(); if (ui.gbmaAudio) apply(ctx, ui.gbmaPick?.target, {audio: {file: ui.gbmaAudio, title: soundTitle(ui.gbmaAudio)}}); ui.gbmaPick = null; ctx.render(); return true;
      case 'gbma-audio-cancel': window.SystemSounds?.stop(); close(); ui.gbmaPick = null; return true;
      // AttachmentEditor: View / Play, Replace (the same kind again), Edit (the slideshow editor).
      case 'gbma-view': play(ctx, slidesOf(a()), a()?.layout); return true;
      case 'gbma-replace': { const kind = kindOf(a()); start(ctx, kind === 'video' ? 'video' : kind === 'audio' ? 'sound' : 'image', 'draft'); return true; }
      case 'gbma-edit': ui.gbmaScreen = ['slides']; ctx.render(); return true;
      case 'gbma-rowplay': { const m = ctx.data.messages.find(x => String(x.id) === String(id)); if (m?.attachment) play(ctx, slidesOf(m.attachment), m.attachment.layout); return true; }
      // SlideshowEditActivity.
      case 'gbma-open-slide': ui.gbmaSlide = Number(id); ui.gbmaScreen.push('slide'); ctx.render(); return true;
      case 'gbma-add-slide': close(); if (addSlide(ctx) && top(ui) === 'slide') ui.gbmaSlide = slides(ctx).length - 1; ctx.render(); return true;
      case 'gbma-discard': close(); ui.gbmaScreen = null; setAttachment(ctx, null); ctx.render(); return true;
      // SlideEditorActivity.
      case 'gbma-prev': ui.gbmaSlide = Math.max(0, (ui.gbmaSlide ?? 0) - 1); ctx.render(); return true;
      case 'gbma-next': ui.gbmaSlide = Math.min(slides(ctx).length - 1, (ui.gbmaSlide ?? 0) + 1); ctx.render(); return true;
      case 'gbma-preview': close(); play(ctx, slides(ctx), a()?.layout); return true;
      case 'gbma-replace-picture': start(ctx, 'image', 'slide'); return true;
      case 'gbma-remove-slide': removeSlide(ctx); ctx.render(); return true;
      case 'gbma-done': ctx.back(); return true;
      case 'gbma-remove-part': { const s = slides(ctx)[ui.gbmaSlide ?? 0]; close(); if (s) { if (id === 'text') s.text = ''; else delete s[id]; ctx.save(); } ctx.render(); return true; }
      case 'gbma-music': close(); ctx.dialog('gbma-music'); return true;
      case 'gbma-duration': close(); ctx.dialog('gbma-duration'); return true;
      case 'gbma-duration-pick': { const n = Number(id), s = slides(ctx)[ui.gbmaSlide ?? 0]; close(); if (n === 10) { ctx.dialog('gbma-duration-other'); return true; } if (s) { s.duration = n + 1; ctx.save(); } ctx.render(); return true; }
      case 'gbma-duration-ok': { const input = document.querySelector('[data-gbma-duration]'), n = Math.round(Number(input?.value)), s = slides(ctx)[ui.gbmaSlide ?? 0]; if (s && n >= 1 && n <= 999) { s.duration = n; ctx.save(); } close(); ctx.render(); return true; }
      case 'gbma-layout': close(); ctx.dialog('gbma-layout'); return true;
      case 'gbma-layout-pick': close(); if (kindOf(a()) === 'slideshow') { a().layout = id; ctx.save(); } ctx.render(); return true;
      // Sound Recorder.
      case 'gbma-rec-record': ui.gbmaRec = {...ui.gbmaRec, state: 'recording', started: Date.now(), length: 0}; ctx.render(); return true;
      case 'gbma-rec-play': { const r = ui.gbmaRec; if (r?.length) { r.state = 'playing'; r.started = Date.now(); } ctx.render(); return true; }
      case 'gbma-rec-stop': { const r = ui.gbmaRec; if (r?.state === 'recording') r.length = Math.max(1, Math.floor((Date.now() - r.started) / 1000)); if (r) r.state = 'idle'; ctx.render(); return true; }
      case 'gbma-rec-accept': { const target = ui.gbmaRec?.target, audio = recordedAudio(ctx); ui.gbmaRec = null; ui.gbmaScreen.pop(); apply(ctx, target, {audio}); ctx.render(); return true; }
      case 'gbma-rec-discard': ui.gbmaRec = null; ui.gbmaScreen.pop(); ctx.render(); return true;
    }
    return false;
  }
  // Back: the player stops, the recorder drops its sound, the slide editor returns to the list, the list settles the slideshow.
  function back(ctx) {
    const id = top(ctx.ui); if (!id) return false;
    if (id === 'show') { clearTimeout(showTimer); window.SystemSounds?.stop(); ctx.ui.gbmaShow = null; }
    if (id === 'recorder') ctx.ui.gbmaRec = null;
    ctx.ui.gbmaScreen.pop();
    if (id === 'slides') { ctx.ui.gbmaScreen = null; settle(ctx); }
    if (!ctx.ui.gbmaScreen?.length) ctx.ui.gbmaScreen = null;
    return true;
  }
  window.GBMmsAttach = {kindOf, editor, row, screen, menu, dialog, handle, back, mounted, apply, slidesOf, DURATION};
})();
