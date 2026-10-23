/* Videos in the Ice Cream Sandwich Gallery (GalleryGoogle 4.0.4 of the Galaxy Nexus IMM76I image). The album grid marks
   a video with ic_video_thumb's film strip along the slot's side and ic_gallery_play in the middle; the photo view draws
   ic_control_play over it and a touch on it plays it in MovieActivity: movie_view.xml's black root under the action bar
   with the title and Share, MovieControllerOverlay's play / pause / reload button (ic_vidcontrol_*) on bg_vidcontrol in
   the middle and its TimeBar at the foot (the #808080 bar with the white played part, scrubber_knob, the "%02d:%02d"
   times). The controls hide 2.5 s after playback starts and come back with a touch; at the end the reload icon stays.
   The picture is the clip's frame from the camera, slowly moving while it plays. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const HIDE = 2500, FADE = 500;
  // TimeBar.stringForTime.
  const time = ms => { const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, r = s % 60; return h ? `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}` : `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`; };
  const slot = photo => photo?.video ? '<span class="icm-strip" aria-hidden="true"></span><img class="icm-slot-play" src="assets/gallery-ic_gallery_play.png" alt="">' : '';
  const play = (photo, label) => photo?.video ? `<button type="button" class="icm-photo-play" data-action="gallery-movie" data-id="${photo.id}" aria-label="${e(label)}"><img src="assets/gallery-ic_control_play.png" alt=""></button>` : '';
  function render(photo, {ui, t, art, header}) {
    const m = ui.galleryMovie || {}, pos = Math.min(m.pos || 0, photo.duration), state = m.ended ? 'ended' : m.paused ? 'paused' : 'playing';
    const icon = {playing: ['ic_vidcontrol_pause', 'Pause video'], paused: ['ic_vidcontrol_play', 'Play video'], ended: ['ic_vidcontrol_reload', 'Reload video']}[state];
    return `<div class="app-view gallery-app icm${m.hidden ? '' : ' bars'}" data-icm data-state="${state}">
      <div class="icm-frame" data-icm-frame>${art}</div>
      ${header}
      <div class="icm-overlay">
        <div class="icm-timebar" data-icm-bar role="slider" aria-label="${e(t('Video player time bar'))}" aria-valuemin="0" aria-valuemax="${photo.duration}" aria-valuenow="${pos}"><span class="icm-now" data-icm-now>${time(pos)}</span><span class="icm-track" data-icm-track><span class="icm-played" data-icm-played></span><img class="icm-knob" data-icm-knob src="assets/gallery-scrubber_knob.png" alt=""></span><span class="icm-total">${time(photo.duration)}</span></div>
        <button type="button" class="icm-button" data-icm-toggle aria-label="${e(t(icon[1]))}"><img src="assets/gallery-${icon[0]}.png" alt=""></button>
      </div>
    </div>`;
  }
  // MoviePlayer: plays from the start, pauses, replays, seeks on the time bar; the controls hide while playing.
  function attach(root, {photo, ui, rerender, reduced}) {
    const m = ui.galleryMovie ||= {id: photo.id, pos: 0, paused: false, ended: false, hidden: false};
    let destroyed = false, last = performance.now(), hideTimer = 0, frame = 0;
    const node = sel => root.querySelector(sel), duration = photo.duration;
    const paint = () => {
      const k = Math.min(1, m.pos / duration);
      node('[data-icm-played]').style.width = `${k * 100}%`; node('[data-icm-knob]').style.left = `${k * 100}%`;
      node('[data-icm-now]').textContent = time(m.pos); node('[data-icm-bar]').setAttribute('aria-valuenow', Math.round(m.pos));
      if (!reduced) node('[data-icm-frame]').style.transform = `scale(${1 + .08 * k}) translateX(${-2 * k}%)`;
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
    const seek = clientX => { const r = node('[data-icm-track]').getBoundingClientRect(); m.pos = Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * duration; if (m.ended && m.pos < duration) m.ended = false; paint(); };
    root.addEventListener('pointerdown', event => {
      if (m.hidden) { event.stopPropagation(); setHidden(false); scheduleHide(); return; }
      const bar = event.target.closest('[data-icm-bar]');
      if (!bar) { scheduleHide(); return; }
      clearTimeout(hideTimer); seek(event.clientX);
      const move = ev => seek(ev.clientX), up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); rerender(); };
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    }, true);
    root.addEventListener('click', event => {
      if (!event.target.closest('[data-icm-toggle]')) return;
      if (m.ended) { m.ended = false; m.paused = false; m.pos = 0; } else m.paused = !m.paused;
      rerender();
    });
    paint(); scheduleHide(); frame = requestAnimationFrame(now => { last = now; tick(now); });
    return {destroy() { destroyed = true; cancelAnimationFrame(frame); clearTimeout(hideTimer); }};
  }
  window.ICSMovie = {time, slot, play, render, attach};
})();
