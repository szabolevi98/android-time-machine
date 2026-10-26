/* Videos in the Android 4.3 Gallery (GalleryGoogle 1.1.40012 of the Nexus 4 JWR66Y image), written by docs/tools/gallery2-video.py.
   AbstractSlotRenderer.drawVideoOverlay: ic_video_thumb scaled to the slot height on the left, ic_gallery_play at a
   sixth of the slot in the middle. PhotoView draws ic_control_play (hdpi only, so at 96.7 dp) over a video; a tap in
   the middle sixth (|x - w/2| * 12 <= w, the same for y) plays it in MovieActivity: movie_view.xml's black root, the
   Holo.ActionBar with the title and Share (menu/movie.xml), CommonControllerOverlay's play / pause / replay button on
   bg_vidcontrol in the middle and TimeBar at the foot (#C1000000 darker_transparent strip, the #808080 bar with the
   white played part, scrubber_knob, 14 dp #CECECE times "%02d:%02d", 10 dp scrubber and 30 dp vertical paddings).
   MovieControllerOverlay hides it 2.5 s after playback starts with player_out (500 ms alpha) and MoviePlayer hides
   the system bars with it; a touch shows them again. At the end the replay icon stays. The picture is the clip's
   frame from the camera, slowly moving while it plays.
   Trim (TrimVideo: trim_view.xml under an overlaid action bar whose custom view is trim_menu.xml's SAVE with
   menu_save_photo) plays the clip inside the chosen range; TrimTimeBar's text_select_handle_left / _right mark its ends
   (the start never passes the end, the scrubber stays between them, a touch elsewhere plays or pauses), and SAVE is
   enabled only when the range differs from the clip by 100 ms or more at both ends (isModified). Trimming and Mute
   (MuteVideo) show their ProgressDialog ("Trimming" / "Muting", "Please wait"), then SaveVideoFileUtils writes
   TRIM_ / MUTE_yyyyMMdd_HHmmss next to the original — the Camera folder ("Saving video to %1$s …"), with the
   original's date taken — and the new clip plays in MovieActivity. A copy keeps where it starts in the recording
   (clip.from of clip.full), so its picture moves on from there, and a muted copy has no sound track (muted). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const HIDE = 2500, FADE = 500;
  // TimeBar.stringForTime and DetailsAdapter's details_ms.
  const time = ms => { const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, r = s % 60; return h ? `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}` : `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`; };
  const slot = photo => photo?.video ? '<span class="g2v-strip" aria-hidden="true"></span><img class="g2v-slot-play" src="assets/gallery-ic_gallery_play.png" alt="">' : '';
  const photoIcon = photo => photo?.video ? '<img class="g2v-photo-play" src="assets/gallery-ic_control_play.png" alt="">' : '';
  // PhotoPage.onSingleTapUp: only the middle of the view starts the video.
  // Where the picture is in the recording: a trimmed copy starts clip.from into the clip.full ms the camera took.
  const span = photo => photo.clip?.full || photo.duration, from = photo => photo.clip?.from || 0;
  const frameAt = (photo, pos) => Math.min(1, (from(photo) + pos) / span(photo));
  const centerTap = (rect, x, y) => Math.abs(x - rect.left - rect.width / 2) * 12 <= rect.width && Math.abs(y - rect.top - rect.height / 2) * 12 <= rect.height;
  function render(photo, {ui, t, media, bar}) {
    const m = ui.galleryMovie || {}, pos = Math.min(m.pos || 0, photo.duration), state = m.ended ? 'ended' : m.paused ? 'paused' : 'playing';
    const icon = {playing: ['ic_vidcontrol_pause', 'Pause video'], paused: ['ic_vidcontrol_play', 'Play video'], ended: ['ic_vidcontrol_reload', 'Reload video']}[state];
    return `<div class="app-view gallery-app jbgal jbgal-photo g2v${m.hidden ? "" : " bars"}" data-jbgal data-page="movie" data-g2v data-state="${state}" data-sound="${photo.muted ? 'none' : 'track'}">
      <div class="g2v-frame" data-g2v-frame>${media.art(photo)}</div>
      ${bar}
      <div class="g2v-overlay" data-g2v-overlay>
        <div class="g2v-timebar" data-g2v-bar role="slider" aria-label="${e(t('Video player time bar'))}" aria-valuemin="0" aria-valuemax="${photo.duration}" aria-valuenow="${pos}"><span class="g2v-back"></span><span class="g2v-time g2v-now" data-g2v-now>${time(pos)}</span><span class="g2v-track" data-g2v-track><i data-g2v-played style="width:${pos / photo.duration * 100}%"></i><b data-g2v-knob style="left:${pos / photo.duration * 100}%"></b></span><span class="g2v-time g2v-total">${time(photo.duration)}</span></div>
        <button type="button" class="g2v-button" data-g2v-toggle aria-label="${e(t(icon[1]))}"><img src="assets/gallery-${icon[0]}.png" alt=""></button>
      </div>
    </div>`;
  }
  // MoviePlayer: plays from the start, pauses, replays, seeks on the time bar; controls hide while playing.
  function attach(root, {photo, ui, rerender, reduced}) {
    const m = ui.galleryMovie ||= {id: photo.id, pos: 0, paused: false, ended: false, hidden: false};
    let destroyed = false, last = performance.now(), hideTimer = 0, frame = 0;
    const node = sel => root.querySelector(sel), duration = photo.duration;
    const paint = () => {
      const k = Math.min(1, m.pos / duration);
      node('[data-g2v-played]').style.width = `${k * 100}%`; node('[data-g2v-knob]').style.left = `${k * 100}%`;
      node('[data-g2v-now]').textContent = time(m.pos); node('[data-g2v-bar]').setAttribute('aria-valuenow', Math.round(m.pos));
      const f = frameAt(photo, m.pos);
      if (!reduced) node('[data-g2v-frame]').style.transform = `scale(${1 + .08 * f}) translateX(${-2 * f}%)`;
    };
    const setHidden = hidden => { m.hidden = hidden; root.classList.toggle('bars', !hidden); root.classList.remove('fading'); };
    const scheduleHide = () => { clearTimeout(hideTimer); if (!m.paused && !m.ended) hideTimer = setTimeout(() => { if (destroyed) return; root.classList.add('fading'); hideTimer = setTimeout(() => !destroyed && setHidden(true), FADE); }, HIDE); };
    const tick = now => {
      if (destroyed) return;
      if (!m.paused && !m.ended) {
        m.pos = Math.min(duration, m.pos + now - last);
        if (m.pos >= duration) { m.ended = true; clearTimeout(hideTimer); setHidden(false); rerender(); return; }
        paint();
      }
      last = now; frame = requestAnimationFrame(tick);
    };
    const seek = clientX => { const r = node('[data-g2v-track]').getBoundingClientRect(); m.pos = Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * duration; if (m.ended && m.pos < duration) m.ended = false; paint(); };
    root.addEventListener('pointerdown', event => {
      if (m.hidden) { event.stopPropagation(); setHidden(false); scheduleHide(); return; }
      const bar = event.target.closest('[data-g2v-bar]');
      if (!bar) { scheduleHide(); return; }
      clearTimeout(hideTimer); seek(event.clientX);
      const move = ev => seek(ev.clientX), up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); rerender(); };
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    }, true);
    root.addEventListener('click', event => {
      if (!event.target.closest('[data-g2v-toggle]')) return;
      if (m.ended) { m.ended = false; m.paused = false; m.pos = 0; } else m.paused = !m.paused;
      rerender();
    });
    paint(); scheduleHide(); frame = requestAnimationFrame(now => { last = now; tick(now); });
    return {destroy() { destroyed = true; cancelAnimationFrame(frame); clearTimeout(hideTimer); }};
  }
  // TrimVideo.isModified: a range under 100 ms, or within 100 ms of the whole clip, is not saved.
  const modified = (s, duration) => { const delta = s.end - s.start; return delta >= 100 && Math.abs(duration - delta) >= 100; };
  // ProgressDialog (Theme.Gallery's dark Holo dialog): the title and the spinning progress with "Please wait".
  const progress = (t, kind) => `<div class="g2v-scrim"></div><div class="g2v-progress" role="alertdialog" aria-label="${e(t(kind === 'mute' ? 'Muting' : 'Trimming'))}"><h3>${e(t(kind === 'mute' ? 'Muting' : 'Trimming'))}</h3><p><span class="g2v-spinner"></span>${e(t('Please wait'))}</p></div>`;
  function trimView(photo, {ui, t, media, bar}) {
    const s = ui.galleryTrim ||= {id: photo.id, start: 0, end: photo.duration, pos: 0, paused: false, ended: false};
    const d = photo.duration, at = v => `${v / d * 100}%`, state = s.ended ? 'ended' : s.paused ? 'paused' : 'playing', can = modified(s, d);
    const icon = {playing: ['ic_vidcontrol_pause', 'Pause video'], paused: ['ic_vidcontrol_play', 'Play video'], ended: ['ic_vidcontrol_reload', 'Reload video']}[state];
    const save = `<button type="button" class="g2v-save" data-g2v-save${can ? '' : ' disabled'}><img src="assets/gallery-ic_menu_savephoto${can ? '' : '_disabled'}.png" alt=""><span>${e(t('Save'))}</span></button>`;
    return `<div class="app-view gallery-app jbgal jbgal-photo g2v g2v-trim bars" data-jbgal data-page="trim" data-g2v-trim data-state="${state}">
      <div class="g2v-frame" data-g2v-frame>${media.art(photo)}</div>
      ${bar(save)}
      <div class="g2v-overlay" data-g2v-overlay>
        <div class="g2v-timebar g2v-trimbar" data-g2v-bar role="group" aria-label="${e(t('Video player time bar'))}"><span class="g2v-back"></span><span class="g2v-time g2v-now" data-g2v-now>${time(s.pos)}</span><span class="g2v-track" data-g2v-track><i data-g2v-played style="left:${at(s.start)};width:${at(s.pos - s.start)}"></i><b data-g2v-knob data-g2v-drag="pos" style="left:${at(s.pos)}"></b><img class="g2v-handle g2v-handle-start" data-g2v-drag="start" src="assets/gallery-text_select_handle_left.png" alt="" style="left:${at(s.start)}"><img class="g2v-handle g2v-handle-end" data-g2v-drag="end" src="assets/gallery-text_select_handle_right.png" alt="" style="left:${at(s.end)}"></span><span class="g2v-time g2v-total">${time(d)}</span></div>
        <button type="button" class="g2v-button" data-g2v-toggle aria-label="${e(t(icon[1]))}"><img src="assets/gallery-${icon[0]}.png" alt=""></button>
      </div>
      ${ui.galleryVideoTask ? progress(t, ui.galleryVideoTask) : ''}
    </div>`;
  }
  // TrimVideo / TrimTimeBar: playback held inside [start, end], the handles and the scrubber dragged on the bar.
  function attachTrim(root, {photo, ui, rerender, reduced, onSave}) {
    const s = ui.galleryTrim, d = photo.duration;
    let destroyed = false, last = performance.now(), frame = 0;
    const node = sel => root.querySelector(sel), pct = v => `${v / d * 100}%`;
    const paint = () => {
      node('[data-g2v-played]').style.left = pct(s.start); node('[data-g2v-played]').style.width = pct(Math.max(0, s.pos - s.start));
      node('[data-g2v-knob]').style.left = pct(s.pos); node('[data-g2v-now]').textContent = time(s.pos);
      node('.g2v-handle-start').style.left = pct(s.start); node('.g2v-handle-end').style.left = pct(s.end);
      const f = frameAt(photo, s.pos);
      if (!reduced) node('[data-g2v-frame]').style.transform = `scale(${1 + .08 * f}) translateX(${-2 * f}%)`;
    };
    const tick = now => {
      if (destroyed) return;
      if (!s.paused && !s.ended && !ui.galleryVideoTask) {
        s.pos = Math.max(s.start, s.pos + now - last);
        if (s.pos >= s.end) { s.pos = s.end; s.ended = true; rerender(); return; }
        paint();
      }
      last = now; frame = requestAnimationFrame(tick);
    };
    root.addEventListener('pointerdown', event => {
      if (ui.galleryVideoTask || event.target.closest('[data-g2v-save]') || event.target.closest('.jbgal-bar')) return;
      const grip = event.target.closest('[data-g2v-drag]');
      if (!grip) { if (event.target.closest('[data-g2v-bar]')) return; event.preventDefault(); if (s.ended) { s.ended = false; s.paused = false; s.pos = s.start; } else s.paused = !s.paused; rerender(); return; }
      event.preventDefault(); event.stopPropagation();
      const which = grip.dataset.g2vDrag, r = node('[data-g2v-track]').getBoundingClientRect(), base = s[which], x0 = event.clientX;
      s.paused = true; root.dataset.state = 'paused';
      const move = ev => {
        const v = base + (ev.clientX - x0) / r.width * d;
        if (which === 'start') { s.start = Math.max(0, Math.min(s.end, v)); s.pos = s.start; }
        else if (which === 'end') { s.end = Math.max(s.start, Math.min(d, v)); s.pos = s.end; }
        else s.pos = Math.max(s.start, Math.min(s.end, v));
        s.ended = false; paint();
      };
      const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); s.start = Math.round(s.start); s.end = Math.round(s.end); s.pos = Math.round(s.pos); rerender(); };
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    }, true);
    root.addEventListener('click', event => {
      if (event.target.closest('[data-g2v-save]') && modified(s, d) && !ui.galleryVideoTask) { s.paused = true; onSave({start: s.start, end: s.end}); }
    });
    paint(); frame = requestAnimationFrame(now => { last = now; tick(now); });
    return {destroy() { destroyed = true; cancelAnimationFrame(frame); }};
  }
  // SaveVideoFileUtils: the copy's name from the time it is written; it keeps the original's date taken and album.
  const stamp = (prefix, now) => { const d = new Date(now), p = n => String(n).padStart(2, '0'); return `${prefix}_${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`; };
  const copy = (photo, {start = 0, end = photo.duration, mute = false} = {}, now = Date.now()) => ({...photo, id: now, name: stamp(mute ? 'MUTE' : 'TRIM', now), duration: Math.round(end - start), clip: {from: from(photo) + Math.round(start), full: span(photo)}, muted: !!(photo.muted || mute)});
  window.G2Video = {time, slot, photoIcon, centerTap, render, attach, trimView, attachTrim, modified, progress, copy, frameAt};
})();
