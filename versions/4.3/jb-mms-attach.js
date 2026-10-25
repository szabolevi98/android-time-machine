/* Android 4.3 Messaging attachments (Mms.apk of the Nexus 4 JWR66Y image): the Attach sources the simulator had only
   drawn, Play in the audio editor, and the slideshow screens.
   - Capture picture / Capture video open the Camera (IMAGE_CAPTURE, VIDEO_CAPTURE) and come back with what it takes;
     Videos picks one of the phone's videos (GET_CONTENT video/*); Audio is the ringtone picker over every sound of the
     image (MessageUtils.selectAudio: no Default, no Silent, "Select audio"); Slideshow opens the slideshow editor.
     Pictures and Record audio keep their own paths (the photo list, Sound Recorder).
   - AttachmentEditor (image_ / video_ / audio_ / slideshow_attachment_view.xml on attachment_editor_bg): the media with
     View / Play, Replace, Remove (100 x 45 dp buttonStyleSmall, 8 dp in from the right); a slideshow shows its first
     slide in the 240 x 180 dp picture_frame with mms_play_btn and Edit / Send / Remove. With a slideshow the compose
     bar is hidden (drawBottomPanel): the text lives in the slides.
   - View / Play and a message's play button open SlideshowActivity (each slide for its duration, its text on top or at
     the bottom, the sound with playing_audio_info's ic_mms_music and name).
   - SlideshowEditActivity "Edit slideshow" (slideshow_edit_item.xml: ic_attach_slideshow_holo_light 60 dp, "Slide n",
     the text and the duration) and SlideEditorActivity "Part n/N" (edit_slide_activity.xml: the slide in picture_frame
     on editbox_background, ic_maps_back / _next, Preview, Replace picture, Remove slide, the text and Done) with their
     action bar overflow menus (Add slide, Discard slideshow; Preview, Remove text / picture / music / video, Add
     picture / Capture picture / music / video, Add slide, Duration, Layout) and the duration and layout lists.
   Attachments: a picture or video is the item itself (a video has video: true), a sound {kind: 'audio', name, album,
   artist, file?}, a slideshow {kind: 'slideshow', slides: [{image | video, audio, text, duration}], layout}. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const M = key => window.MmsStrings?.t(key) ?? key;
  const DURATION = 5, MAX_SLIDES = 10;
  const kindOf = a => !a ? '' : a.kind || (a.video ? 'video' : 'image');
  const picture = p => p ? window.ICSMedia?.art(p) || '' : '';
  const soundCat = file => Object.keys(window.SystemSounds?.SOUNDS || {}).find(cat => window.SystemSounds.SOUNDS[cat][file]);
  const soundTitle = file => window.SystemSounds?.SOUNDS?.[soundCat(file)]?.[file]?.[0] || file;
  const slidesOf = a => kindOf(a) === 'slideshow' ? a.slides : a ? [kindOf(a) === 'audio' ? {audio: a, text: '', duration: DURATION} : {[kindOf(a)]: a, text: '', duration: DURATION}] : [];
  const secs = n => AndroidStrings.format(M(n === 1 ? '%s sec' : '%s secs'), n);
  const top = ui => (ui.jbmaScreen || []).at(-1);
  const slides = ctx => ctx.draftOf()?.attachment?.slides || [];

  // ---------- The compose screen ----------
  const small = (action, label, id = '') => `<button type="button" class="jbma-btn" data-action="${action}"${id ? ` data-id="${e(id)}"` : ''}>${e(label)}</button>`;
  const three = first => `<span class="jbma-btns">${small('jbma-view', M(first))}${small('jbma-replace', M('Replace'))}${small('mms-remove-attachment', M('Remove'))}</span>`;
  function editor(draft) {
    const a = draft?.attachment, kind = kindOf(a); if (!kind) return '';
    if (kind === 'image') return `<div class="jbma jbma-image"><span class="jbma-media">${picture(a)}</span>${three('View')}</div>`;
    if (kind === 'video') return `<div class="jbma jbma-video"><span class="jbma-media">${picture(a)}<img class="jbma-overlay" src="assets/mms-ic_gallery_video_overlay.png" alt=""></span>${three('View')}</div>`;
    if (kind === 'audio') return `<div class="jbma jbma-audio"><span class="jbma-sound"><img src="assets/mms-ic_attach_capture_audio_holo_light.png" alt=""><b>${e(a.name)}</b>${a.album ? `<small>${e(a.album)}</small>` : ''}${a.artist ? `<small>${e(a.artist)}</small>` : ''}</span>${three('Play')}</div>`;
    const s = a.slides[0] || {};
    return `<div class="jbma jbma-show"><span class="jbma-showbox"><span class="jbma-frame"><span class="jbma-framebody${a.layout === 'top' ? ' top' : ''}"><span class="jbma-framepic">${picture(s.image || s.video)}</span>${s.text ? `<span class="jbma-frametext">${e(s.text)}</span>` : ''}</span><button type="button" class="jbma-play" data-action="jbma-view" aria-label="${e(M('Play'))}"><img src="assets/mms-mms_play_btn.png" alt=""></button></span></span><span class="jbma-btns">${small('jbma-edit', M('Edit'))}${small('mms-send-now', M('Send'))}${small('mms-remove-attachment', M('Remove'))}</span></div>`;
  }
  // A message's attachment: the picture (with mms_play_btn over a video or a slideshow), a sound's icon and name.
  function row(m) {
    const a = m.attachment, kind = kindOf(a); if (!kind || kind === 'image') return '';
    if (kind === 'audio') return `<span class="jbma-row jbma-rowaudio"><span class="mms-audio"><img src="assets/mms-ic_attach_capture_audio_holo_light.png" alt=""><span>${e(a.name)}</span></span><span class="jbma-play" data-action="jbma-rowplay" data-id="${e(m.id)}" role="button" aria-label="${e(M('Play'))}"><img src="assets/mms-mms_play_btn.png" alt=""></span></span>`;
    const first = kind === 'slideshow' ? a.slides[0] || {} : {[kind]: a}, shot = first.image || first.video;
    return `<span class="jbma-row">${shot ? `<span class="mms-photo media-attachment">${picture(shot)}</span>` : '<img class="jbma-rowicon" src="assets/mms-ic_mms_music.png" alt="">'}<span class="jbma-play" data-action="jbma-rowplay" data-id="${e(m.id)}" role="button" aria-label="${e(M('Play'))}"><img src="assets/mms-mms_play_btn.png" alt=""></span></span>`;
  }

  // ---------- Screens over the compose screen (ui.jbmaScreen) ----------
  const bar = (title, menu) => `<header class="mms-header jbma-bar"><button class="mms-up" data-action="back" aria-label="Back"><span>‹</span><img src="assets/messaging.png" alt=""></button><div class="mms-title"><h2>${e(title)}</h2></div>${menu ? '<button data-action="jbma-menu" aria-label="More options"><img src="assets/ic_menu_overflow.png" alt=""></button>' : ''}</header>`;
  function screen(ctx) {
    const id = top(ctx.ui); if (!id) return '';
    if (id === 'show') {
      const sh = ctx.ui.jbmaShow, s = sh?.slides[sh.at]; if (!s) return '';
      const media = s.image || s.video ? picture(s.image || s.video) : s.audio ? `<span class="jbma-playing"><img src="assets/mms-ic_mms_music.png" alt=""><span>${e(s.audio.name)}</span></span>` : '';
      return `<div class="app-view jbma-slideshow${sh.layout === 'top' ? ' top' : ''}" data-no-translate><div class="jbma-slidemedia">${media}</div>${s.text ? `<div class="jbma-slidetext">${e(s.text)}</div>` : ''}</div>`;
    }
    if (id === 'slides') {
      const rows = slides(ctx).map((s, i) => `<button type="button" class="jbma-srow" data-action="jbma-open-slide" data-id="${i}">${s.image || s.video ? `<span class="jbma-sthumb">${picture(s.image || s.video)}</span>` : '<img class="jbma-sthumb icon" src="assets/mms-ic_attach_slideshow_holo_light.png" alt="">'}<span class="jbma-stext"><b>${e(AndroidStrings.format(M('Slide %s'), i + 1))}</b><span class="jbma-sline">${s.text ? `<span class="jbma-sprev">${e(s.text)}</span>` : ''}${s.audio ? `<span class="jbma-sprev">${e(s.audio.name)}</span>` : ''}<span class="jbma-sdur">${e(secs(s.duration))}</span></span></span></button>`).join('');
      return `<div class="app-view mms-app jbma-slides" data-no-translate>${bar(M('Edit slideshow'), true)}<div class="jbma-slist">${rows}<button type="button" class="jbma-srow" data-action="jbma-add-slide"><img class="jbma-sthumb icon" src="assets/mms-ic_attach_slideshow_holo_light.png" alt=""><span class="jbma-stext"><b>${e(M('Add slide'))}</b><span class="jbma-sline"><span class="jbma-sprev">${e(M('Select to create new slide.'))}</span></span></span></button></div></div>`;
    }
    if (id === 'slide') {
      const list = slides(ctx), i = ctx.ui.jbmaSlide ?? 0, s = list[i]; if (!s) return '';
      const btn = (action, inner, on = true) => `<button type="button" class="jbma-small" data-action="${action}"${on ? '' : ' disabled'}>${inner}</button>`;
      return `<div class="app-view mms-app jbma-editor" data-no-translate>${bar(AndroidStrings.format(M('Part %1$s/%2$s'), i + 1, list.length), true)}<div class="jbma-epanel"><div class="jbma-eleft"><span class="jbma-epic">${picture(s.image || s.video)}</span>${s.audio ? `<span class="jbma-eaudio"><img src="assets/mms-ic_mms_music.png" alt=""><span>${e(s.audio.name)}</span></span>` : ''}</div>
        <div class="jbma-ectl"><div class="jbma-enav">${btn('jbma-prev', '<img src="assets/mms-ic_maps_back.png" alt="">', i > 0)}${btn('jbma-next', '<img src="assets/mms-ic_maps_next.png" alt="">', i < list.length - 1)}</div>${btn('jbma-preview', e(M('Preview')))}${btn('jbma-replace-picture', e(M('Replace picture')))}${btn('jbma-remove-slide', e(M('Remove slide')))}</div></div>
        <div class="jbma-ebottom"><input class="jbma-etext" data-jbma-text value="${e(s.text || '')}" placeholder="${e(M('Type message, or leave blank'))}" autocomplete="off" maxlength="2000"><button type="button" class="jbma-done" data-action="jbma-done">${e(M('Done'))}</button></div></div>`;
    }
    return '';
  }

  // ---------- Overlays: the overflow menus, the pickers and the lists ----------
  const menuHtml = items => `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu" data-no-translate>${items.map(([action, label, id = '']) => `<button data-action="${action}" data-id="${e(id)}">${e(label)}</button>`).join('')}</div>`;
  const dialog = (title, icon, body, buttons = '') => `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog mms-dialog jbma-dialog" role="dialog" aria-label="${e(title)}" data-no-translate><h3>${icon ? `<img src="assets/${icon}" alt="">` : ''}${e(title)}</h3>${body}${buttons ? `<div class="settings-dialog-actions">${buttons}</div>` : ''}</div>`;
  function overlay(kind, ctx) {
    const {ui, data} = ctx, list = slides(ctx), i = ui.jbmaSlide ?? 0, s = list[i] || {};
    if (kind === 'jbma-menu') {
      if (top(ui) === 'slides') return menuHtml([['jbma-add-slide', M('Add slide')], ['jbma-discard', M('Discard slideshow')]]);
      const items = [['jbma-preview', M('Preview')]];
      if (s.text) items.push(['jbma-remove-part', M('Remove text'), 'text']);
      if (s.image) items.push(['jbma-remove-part', M('Remove picture'), 'image']);
      else if (!s.video) items.push(['jbma-attach', M('Add picture'), 'pictures:slide'], ['jbma-attach', M('Capture picture'), 'capture-picture:slide']);
      if (s.audio) items.push(['jbma-remove-part', M('Remove music'), 'audio']);
      else if (!s.video) items.push(['jbma-music', M('Add music')]);
      if (s.video) items.push(['jbma-remove-part', M('Remove video'), 'video']);
      else if (!s.image && !s.audio) items.push(['jbma-attach', M('Add video'), 'videos:slide']);
      items.push(['jbma-add-slide', M('Add slide')], ['jbma-duration', AndroidStrings.format(M('Duration (%s sec)'), s.duration || DURATION)], ['jbma-layout', M(ctx.draftOf()?.attachment?.layout === 'top' ? 'Layout (top)' : 'Layout (bottom)')]);
      return menuHtml(items);
    }
    if (kind === 'jbma-media') {
      const video = ui.jbmaPick?.type === 'video', items = data.photos.filter(p => video ? p.video : !p.video);
      return dialog(M(video ? 'Videos' : 'Pictures'), '', `<div class="mms-dialog-list">${items.map(p => `<button data-action="jbma-picked" data-id="${p.id}">${window.ICSMessaging.photo(p)}${p.video ? '<img class="jbma-overlay" src="assets/mms-ic_gallery_video_overlay.png" alt="">' : ''}</button>`).join('') || `<p>${e(ctx.t(video ? 'No videos' : 'No photos'))}</p>`}</div>`, `<button data-action="close-overlay">${e(M('Cancel'))}</button>`);
    }
    if (kind === 'jbma-audio') {
      const files = Object.values(window.SystemSounds?.SOUNDS || {}).flatMap(l => Object.keys(l));
      return dialog(M('Select audio'), '', `<div class="jbma-choices">${files.map(f => `<button data-action="jbma-audio-pick" data-id="${e(f)}" role="radio" aria-checked="${ui.jbmaAudio === f}"><span>${e(soundTitle(f))}</span><i class="jbma-radio${ui.jbmaAudio === f ? ' on' : ''}"></i></button>`).join('')}</div>`, `<button data-action="jbma-audio-cancel">${e(M('Cancel'))}</button><button data-action="jbma-audio-ok">OK</button>`);
    }
    if (kind === 'jbma-music') return dialog(M('Add music'), '', `<div class="jbma-choices">${[['audio', 'Audio'], ['record-audio', 'Record audio']].map(([id, key]) => `<button data-action="jbma-attach" data-id="${id}:slide"><span>${e(M(key))}</span></button>`).join('')}</div>`);
    if (kind === 'jbma-duration') return dialog(`${M('Duration for slide ')}${i + 1}/${list.length}`, 'mms-ic_mms_duration.png', `<div class="jbma-choices">${['1 second', '2 seconds', '3 seconds', '4 seconds', '5 seconds', '6 seconds', '7 seconds', '8 seconds', '9 seconds', '10 seconds', 'Other'].map((key, n) => `<button data-action="jbma-duration-pick" data-id="${n}"><span>${e(M(key))}</span></button>`).join('')}</div>`);
    if (kind === 'jbma-duration-other') return dialog(`${M('Duration for slide ')}${i + 1}/${list.length}`, 'mms-ic_mms_duration.png', `<input class="jbma-number" data-jbma-duration type="number" inputmode="numeric" min="1" max="999" value="${s.duration || DURATION}">`, `<button data-action="close-overlay">${e(M('Cancel'))}</button><button data-action="jbma-duration-ok">OK</button>`);
    if (kind === 'jbma-layout') return dialog(`${M('Slideshow layout ')}${i + 1}/${list.length}`, 'mms-ic_mms_layout.png', `<div class="jbma-choices">${[['top', 'Text on top', 'mms-ic_mms_text_top.png'], ['bottom', 'Text on bottom', 'mms-ic_mms_text_bottom.png']].map(([id, key, icon]) => `<button data-action="jbma-layout-pick" data-id="${id}"><img src="assets/${icon}" alt=""><span>${e(M(key))}</span></button>`).join('')}</div>`);
    return null;
  }

  // ---------- Actions ----------
  // ctx: {ui, data, t, draftOf(), save, render, renderOverlay, toast, capture(type, target), record(target), back()}.
  let showTimer = 0;
  const open = (ctx, kind) => { ctx.ui.overlay = kind; ctx.renderOverlay(); };
  const close = ctx => { ctx.ui.overlay = ''; ctx.renderOverlay(); };
  function setAttachment(ctx, a) {
    const draft = ctx.draftOf();
    if (a) draft.attachment = a; else delete draft.attachment;
    draft.updated = Date.now(); ctx.save();
  }
  // What was picked, captured or recorded goes to the draft (a new attachment) or to the slide being edited.
  function apply(ctx, target, part) {
    if (target === 'slide') {
      const s = slides(ctx)[ctx.ui.jbmaSlide ?? 0]; if (!s) return;
      if (part.image) { delete s.video; s.image = part.image; } else if (part.video) { delete s.image; delete s.audio; s.video = part.video; } else if (part.audio) s.audio = part.audio;
      ctx.save(); return;
    }
    setAttachment(ctx, part.image || part.video || part.audio);
  }
  function start(ctx, type, target = 'draft') {
    close(ctx);
    if (type === 'pictures' || type === 'videos') { ctx.ui.jbmaPick = {type: type === 'videos' ? 'video' : 'image', target}; open(ctx, 'jbma-media'); return; }
    if (type === 'capture-picture' || type === 'capture-video') { ctx.capture(type === 'capture-video' ? 'video' : 'image', target); return; }
    if (type === 'audio') { ctx.ui.jbmaPick = {type: 'audio', target}; ctx.ui.jbmaAudio = ''; open(ctx, 'jbma-audio'); return; }
    if (type === 'record-audio') { ctx.record(target); return; }
    if (type === 'slideshow') editSlideshow(ctx);
  }
  // Slideshow: what is attached becomes the first slide, the typed text its text.
  function editSlideshow(ctx) {
    const draft = ctx.draftOf(), a = draft.attachment;
    if (kindOf(a) !== 'slideshow') {
      const list = slidesOf(a);
      if (!list.length) list.push({text: '', duration: DURATION});
      if ((draft.body || '').trim()) { list[0].text = draft.body; draft.body = ''; }
      setAttachment(ctx, {kind: 'slideshow', slides: list, layout: 'bottom'});
    }
    ctx.ui.jbmaScreen = ['slides']; ctx.render();
  }
  // WorkingMessage.correctAttachmentState on leaving the editor: one slide is that slide's attachment, none is none.
  function settle(ctx) {
    const draft = ctx.draftOf(), a = draft.attachment; if (kindOf(a) !== 'slideshow') return;
    if (a.slides.length > 1) return;
    const s = a.slides[0];
    if (s?.text) draft.body = s.text;
    setAttachment(ctx, s ? s.image || s.video || s.audio : null);
  }
  function play(ctx, list, layout) {
    clearTimeout(showTimer);
    ctx.ui.jbmaShow = {slides: list, layout: layout || 'bottom', at: 0};
    (ctx.ui.jbmaScreen ||= []).push('show'); ctx.render();
  }
  // SlideshowActivity's player and the slide editor's text field.
  function mounted(ctx) {
    clearTimeout(showTimer);
    if (top(ctx.ui) === 'show') {
      const sh = ctx.ui.jbmaShow, s = sh?.slides[sh.at]; if (!s) return;
      if (s.audio?.file && soundCat(s.audio.file)) window.SystemSounds.play(soundCat(s.audio.file), s.audio.file);
      showTimer = setTimeout(() => {
        if (top(ctx.ui) !== 'show' || ctx.ui.jbmaShow !== sh) return;
        window.SystemSounds?.stop();
        if (sh.at + 1 < sh.slides.length) sh.at++; else { ctx.ui.jbmaScreen.pop(); ctx.ui.jbmaShow = null; if (!ctx.ui.jbmaScreen.length) ctx.ui.jbmaScreen = null; }
        ctx.render();
      }, (s.audio?.length && !s.image && !s.video ? Math.max(s.duration || DURATION, s.audio.length) : s.duration || DURATION) * 1000);
    }
    const text = ctx.root?.querySelector('[data-jbma-text]');
    if (text) text.addEventListener('input', () => { const s = slides(ctx)[ctx.ui.jbmaSlide ?? 0]; if (s) { s.text = text.value; ctx.save(); } });
  }
  const addSlide = ctx => { if (slides(ctx).length >= MAX_SLIDES) { ctx.toast(M('Cannot add more slides.')); return false; } slides(ctx).push({text: '', duration: DURATION}); ctx.save(); return true; };
  function handle(action, id, ctx) {
    const {ui, data} = ctx, a = () => ctx.draftOf().attachment;
    switch (action) {
      case 'jbma-attach': { const [type, target] = String(id).split(':'); start(ctx, type, target || 'draft'); return true; }
      case 'jbma-picked': { const p = data.photos.find(x => String(x.id) === String(id)); close(ctx); if (p) apply(ctx, ui.jbmaPick?.target, p.video ? {video: structuredClone(p)} : {image: structuredClone(p)}); ui.jbmaPick = null; ctx.render(); return true; }
      case 'jbma-audio-pick': ui.jbmaAudio = id; if (soundCat(id)) window.SystemSounds.play(soundCat(id), id); ctx.renderOverlay(); return true;
      case 'jbma-audio-ok': window.SystemSounds?.stop(); close(ctx); if (ui.jbmaAudio) apply(ctx, ui.jbmaPick?.target, {audio: {kind: 'audio', name: soundTitle(ui.jbmaAudio), file: ui.jbmaAudio}}); ui.jbmaPick = null; ctx.render(); return true;
      case 'jbma-audio-cancel': window.SystemSounds?.stop(); close(ctx); ui.jbmaPick = null; return true;
      case 'jbma-view': play(ctx, slidesOf(a()), a()?.layout); return true;
      case 'jbma-replace': { const kind = kindOf(a()); start(ctx, kind === 'video' ? 'videos' : kind === 'audio' ? 'audio' : 'pictures'); return true; }
      case 'jbma-edit': ui.jbmaScreen = ['slides']; ctx.render(); return true;
      case 'jbma-rowplay': { const m = data.messages.find(x => String(x.id) === String(id)); if (m?.attachment) play(ctx, slidesOf(m.attachment), m.attachment.layout); return true; }
      case 'jbma-menu': open(ctx, 'jbma-menu'); return true;
      case 'jbma-open-slide': ui.jbmaSlide = Number(id); ui.jbmaScreen.push('slide'); ctx.render(); return true;
      case 'jbma-add-slide': close(ctx); if (addSlide(ctx) && top(ui) === 'slide') ui.jbmaSlide = slides(ctx).length - 1; ctx.render(); return true;
      case 'jbma-discard': close(ctx); ui.jbmaScreen = null; setAttachment(ctx, null); ctx.render(); return true;
      case 'jbma-prev': ui.jbmaSlide = Math.max(0, (ui.jbmaSlide ?? 0) - 1); ctx.render(); return true;
      case 'jbma-next': ui.jbmaSlide = Math.min(slides(ctx).length - 1, (ui.jbmaSlide ?? 0) + 1); ctx.render(); return true;
      case 'jbma-preview': close(ctx); play(ctx, slides(ctx), a()?.layout); return true;
      case 'jbma-replace-picture': start(ctx, 'pictures', 'slide'); return true;
      case 'jbma-remove-slide': { const list = slides(ctx), i = ui.jbmaSlide ?? 0; list.splice(i, 1); ctx.save(); if (!list.length) ui.jbmaScreen.pop(); else ui.jbmaSlide = Math.max(0, i - 1); ctx.render(); return true; }
      case 'jbma-done': ctx.back(); return true;
      case 'jbma-remove-part': { const s = slides(ctx)[ui.jbmaSlide ?? 0]; close(ctx); if (s) { if (id === 'text') s.text = ''; else delete s[id]; ctx.save(); } ctx.render(); return true; }
      case 'jbma-music': close(ctx); open(ctx, 'jbma-music'); return true;
      case 'jbma-duration': close(ctx); open(ctx, 'jbma-duration'); return true;
      case 'jbma-duration-pick': { const n = Number(id), s = slides(ctx)[ui.jbmaSlide ?? 0]; close(ctx); if (n === 10) { open(ctx, 'jbma-duration-other'); return true; } if (s) { s.duration = n + 1; ctx.save(); } ctx.render(); return true; }
      case 'jbma-duration-ok': { const n = Math.round(Number(document.querySelector('[data-jbma-duration]')?.value)), s = slides(ctx)[ui.jbmaSlide ?? 0]; if (s && n >= 1 && n <= 999) { s.duration = n; ctx.save(); } close(ctx); ctx.render(); return true; }
      case 'jbma-layout': close(ctx); open(ctx, 'jbma-layout'); return true;
      case 'jbma-layout-pick': close(ctx); if (kindOf(a()) === 'slideshow') { a().layout = id; ctx.save(); } ctx.render(); return true;
    }
    return false;
  }
  // Back: the player stops, the slide editor returns to the list, the list settles the slideshow.
  function back(ctx) {
    const id = top(ctx.ui); if (!id) return false;
    if (id === 'show') { clearTimeout(showTimer); window.SystemSounds?.stop(); ctx.ui.jbmaShow = null; }
    ctx.ui.jbmaScreen.pop();
    if (id === 'slides') { ctx.ui.jbmaScreen = null; settle(ctx); }
    if (!ctx.ui.jbmaScreen?.length) ctx.ui.jbmaScreen = null;
    return true;
  }
  window.JBMmsAttach = {kindOf, editor, row, screen, overlay, handle, back, mounted, apply, start};
})();
