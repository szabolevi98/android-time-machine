/* Android 7.1.2 volume panel (SystemUI.apk VolumeDialog, VolumeDialogController, VolumeDialogMotion, ZenFooter of
   N2G48C; AudioService's defaults). The logic is 6.0.1's (mm-volume.js); the look is N2G48C's (ng-volume.css):
   - The streams: AudioService's DEFAULT_STREAM_VOLUME / MAX_STREAM_VOLUME (call 4 of 5, ring 5 of 7, media 11 of 15,
     alarm 6 of 7); the keys move the active stream (media while something plays, else the ring stream) a step;
     VolumePolicy.DEFAULT: the ring stream goes to vibrate below its first step (the 6P vibrates) and never to silent
     from the keys, up from vibrate returns to the first step.
   - The dialog: a window at the top of the screen (gravity top, volume_offset_top 0), volume_dialog_panel_width
     (standard_notification_panel_width) at most, so the 6P's full width; volume_dialog.xml on colorPrimary (#263238)
     with no corners, translationZ 4 dp, 4 dp margin below.
   - volume_dialog_row.xml per stream (64 dp, 9.4 dp padding below): the header (TextAppearance.Volume.Header 12 sp
     volume_slider_inactive #b0bec5, 16 dp in; only while expanded, VolumeDialog.updateVolumeRowHeaderVisibleH), then a
     48 dp row 4 dp in: the 48 dp icon button (a tap mutes or unmutes: the ring stream to vibrate and back) and the
     SeekBar (12 dp at the start, 16 dp at the end, max level x 100; the active row in the accent, the others
     volume_slider_inactive). The rows leave volume_button_size 48 dp at the end for the expand button (6 dp down,
     2 dp from the end; ic_volume_expand_animation collapsed, ic_volume_collapse_animation expanded, 300 ms).
   - VolumeDialog.isVisibleH: collapsed only the active stream; expanded also the important ones (ring, media), with
     volume_dialog_expanded_spacer 14 dp under them.
   - ZenFooter while Do not disturb is on and the active stream follows the ringer mode: the 1 dp divider
     (qs_tile_divider #29ffffff, 8 dp above, 12 below), ic_dnd / ic_dnd_total_silence in 48 dp, 7 dp before the level
     (ZenSummary 14 sp medium) over its condition (ZenDetail 14 sp, #b0bec5: "Until you turn this off" or "Until …"),
     END NOW (QS.DetailButton in the accent, 15 dp padding at the sides, 8 dp from the end).
   - computeTimeoutH: 3 s, 1.5 s for media, 5 s expanded; a touch outside closes it.
   - VolumeDialogMotion: shown, it comes down from its own height above in 300 ms (LogDecelerateInterpolator base 400,
     time scale 1.4), its contents fading in over 150 ms, the chevron after 50 ms; dismissed it goes up in 250 ms
     (LogAccelerateInterpolator). */
(() => {
  'use strict';
  const A = name => `assets/${name}`;
  const T = () => NG.text('volume');
  const MAX = {voice: 5, ring: 7, music: 15, alarm: 7};
  const TYPE = {voice: 0, ring: 2, music: 3, alarm: 4};
  const ICONS = {ring: ['ic_volume_ringer', 'ic_volume_ringer_mute'], music: ['ic_volume_media', 'ic_volume_media_mute'],
    alarm: ['ic_volume_alarm', 'ic_volume_alarm_mute'], voice: ['ic_volume_voice', 'ic_volume_voice']};
  const IMPORTANT = {ring: true, music: true, alarm: false, voice: false};
  Object.assign(NG.defaults.settings, {volume: {voice: 4, ring: 5, music: 11, alarm: 6}, ringerMode: 'normal'});

  // VolumeDialogMotion's interpolators, as keyframes.
  const logDecel = t => (1 - Math.pow(400, -t / 1.4)) / (1 - Math.pow(400, -1 / 1.4));
  const logAccel = t => { const log = x => 1 - Math.pow(100, -x); return 1 - log(1 - t) / log(1); };
  const frames = (f, from, to) => Array.from({length: 21}, (_, i) => ({offset: i / 20, transform: `translateY(${(from + (to - from) * f(i / 20)).toFixed(2)}%)`}));

  let layer = null, timer = 0;
  const st = {showing: false, expanded: false, active: 'ring'};

  const vol = c => c.data.settings.volume || (c.data.settings.volume = {voice: 4, ring: 5, music: 11, alarm: 6});
  const activeStream = c => {
    if (c.ui.inCall || NG.phone?.active?.(c)) return 'voice';
    const u = c.ui;
    const media = u.musicPlaying || c.data.music?.playing ||
      (u.overlay === 'music-preview' && u.musicPreview?.playing) ||
      (u.view === 'messenger' && u.messenger?.audio?.playing) ||
      (u.view === 'photos' && u.photos?.playing) ||
      (u.view === 'youtube' && u.youtube?.player?.playing) ||
      (u.view === 'drive' && u.drive?.player?.playing) ||
      (u.view === 'play-movies' && u.movies?.player?.playing);
    return media ? 'music' : 'ring';
  };

  // VolumeDialog.updateVolumeRowH: the icon, the level the slider shows and whether it follows.
  function rowState(c, stream) {
    const s = c.data.settings, t = T(), v = vol(c);
    const title = t.t('volume_stream_titles')[TYPE[stream]];
    const ring = stream === 'ring', vibrate = ring && s.ringerMode === 'vibrate';
    // zenMuted: alarms only mutes the ring and notification streams, total silence also media and alarms.
    const zenMuted = s.zen === 3 ? ring : s.zen === 2 ? ['ring', 'music', 'alarm'].includes(stream) : false;
    let icon = ICONS[stream][0], level = v[stream], desc;
    if (vibrate) { icon = 'ic_volume_ringer_vibrate'; level = 0; }
    else if (zenMuted || v[stream] === 0) { icon = ICONS[stream][1]; if (zenMuted) level = 0; }
    if (zenMuted) desc = title;
    else if (ring) desc = t.fmt(vibrate ? 'volume_stream_content_description_unmute' : 'volume_stream_content_description_vibrate', null, title);
    else desc = t.fmt(v[stream] ? 'volume_stream_content_description_mute' : 'volume_stream_content_description_unmute', null, title);
    return {title, icon, level, max: MAX[stream], enabled: !zenMuted, desc};
  }
  const visibleRows = () => ['ring', 'music', 'alarm', 'voice'].filter(id => id === st.active || (st.expanded && IMPORTANT[id]));

  function footer(c) {
    const s = c.data.settings, t = T();
    if (!s.zen || st.active !== 'ring') return '';
    const line1 = t.t(s.zen === 2 ? 'interruption_level_none' : s.zen === 3 ? 'interruption_level_alarms' : 'interruption_level_priority');
    const line2 = s.zenUntil ? t.fmt('framework/zen_mode_until', null, new Intl.DateTimeFormat(c.locale(), {hour: 'numeric', minute: '2-digit'}).format(new Date(s.zenUntil))) : t.t('framework/zen_mode_forever');
    return `<div class="ngvol-zen"><i class="ngvol-divider"></i><div class="ngvol-zenrow"><img src="${A(`sui-${s.zen === 2 ? 'ic_dnd_total_silence' : 'ic_dnd'}.svg`)}" alt=""><div class="ngvol-zentext"><div class="ngvol-zen1">${c.safe(line1)}</div><div class="ngvol-zen2">${c.safe(line2)}</div></div></div>
      <button type="button" class="ngvol-end" data-vol="end">${c.safe(t.t('volume_zen_end_now'))}</button></div>`;
  }

  function rowHtml(c, id) {
    const r = rowState(c, id), value = r.level / r.max;
    return `<div class="ngvol-row${id === st.active ? ' active' : ''}" data-stream="${id}">
      ${st.expanded ? `<div class="ngvol-header">${c.safe(r.title)}</div>` : ''}
      <div class="ngvol-line"><button type="button" class="ngvol-icon${r.enabled ? '' : ' off'}" data-vol="mute" aria-label="${c.safe(r.desc)}"><img src="${A(`sui-${r.icon}.svg`)}" alt=""></button>
        <div class="ngvol-slider${r.enabled ? '' : ' off'}${id === st.active && r.enabled ? ' on' : ''}" role="slider" aria-label="${c.safe(r.title)}" aria-valuemax="${r.max}" aria-valuenow="${r.level}" style="--v:${value.toFixed(4)}"><i class="ngvol-track"></i><i class="ngvol-progress"></i><i class="ngvol-thumb"></i></div></div></div>`;
  }
  function render(c) {
    const t = T(), rows = visibleRows();
    // While the chevron turns it plays the drawable of the state it leaves (updateExpandButtonH).
    const was = st.turning ? !st.expanded : st.expanded;
    const chevron = NG.qsAvd?.(was ? 'ic_volume_collapse_animation' : 'ic_volume_expand_animation', 'ngvol-chevron') || '';
    return `<div class="ngvol-dialog"><div class="ngvol-content"><div class="ngvol-rows">${rows.map(id => rowHtml(c, id)).join('')}${st.expanded ? '<i class="ngvol-spacer"></i>' : ''}</div>${footer(c)}</div>
      <button type="button" class="ngvol-expand" data-vol="expand" aria-label="${c.safe(t.t(st.expanded ? 'accessibility_volume_collapse' : 'accessibility_volume_expand'))}">${chevron.replace('<svg', '<svg data-rest="start"')}</button></div>`;
  }

  function draw(c, play = false) {
    if (!layer) {
      layer = document.createElement('div'); layer.className = 'ngvol-layer'; c.el.screen.append(layer);
      layer.addEventListener('pointerdown', e => { if (e.target === layer) dismiss(c); });
      layer.addEventListener('click', e => onClick(c, e));
      layer.addEventListener('pointerdown', e => slide(c, e));
    }
    layer.innerHTML = render(c);
    layer.classList.add('open');
    // The chevron rests on its first frame; after a tap it plays (updateExpandButtonH starts the drawable).
    for (const svg of layer.querySelectorAll('svg[data-avd]')) { try { if (play) { svg.setCurrentTime(0); svg.unpauseAnimations(); } else { svg.pauseAnimations(); svg.setCurrentTime(0); } } catch {} }
  }

  function rescheduleTimeout(c) {
    clearTimeout(timer);
    timer = setTimeout(() => dismiss(c), st.expanded ? 5000 : st.active === 'music' ? 1500 : 3000);
  }
  function show(c) {
    st.active = activeStream(c);
    const first = !st.showing;
    if (first) { st.showing = true; st.expanded = false; }
    draw(c); rescheduleTimeout(c);
    const dialog = layer.querySelector('.ngvol-dialog');
    if (first && dialog?.animate) {
      dialog.animate(frames(logDecel, -100, 0), {duration: 300});
      layer.querySelector('.ngvol-content').animate([{opacity: 0}, {opacity: 1}], {duration: 150, easing: 'cubic-bezier(0,0,.2,1)'});
      layer.querySelector('.ngvol-expand').animate([{opacity: 0}, {opacity: 1}], {duration: 150, delay: 50, easing: 'cubic-bezier(0,0,.2,1)', fill: 'backwards'});
    }
  }
  function dismiss(c) {
    clearTimeout(timer);
    if (!layer || !st.showing) return;
    st.showing = false; st.expanded = false;
    const dialog = layer.querySelector('.ngvol-dialog');
    const done = () => { if (!st.showing && layer) { layer.innerHTML = ''; layer.classList.remove('open'); } };
    if (dialog?.animate) dialog.animate(frames(logAccel, 0, -100), {duration: 250, fill: 'forwards'}).finished.then(done, done);
    else done();
  }

  function setLevel(c, stream, level) {
    const s = c.data.settings, v = vol(c), max = MAX[stream];
    if (stream === 'ring') {
      if (level <= 0) { if (s.ringerMode === 'normal') { s.ringerMode = 'vibrate'; navigator.vibrate?.(100); } }
      else { s.ringerMode = 'normal'; v.ring = Math.min(max, level); }
    } else v[stream] = Math.max(0, Math.min(max, level));
    c.save(); NG.system?.changed(c);
  }

  function key(c, dir) {
    const stream = activeStream(c), s = c.data.settings, v = vol(c);
    if (rowState(c, stream).enabled) {
      if (stream === 'ring' && s.ringerMode === 'vibrate') { if (dir > 0) setLevel(c, 'ring', 1); }
      else setLevel(c, stream, v[stream] + dir);
    }
    show(c);
  }

  function onClick(c, e) {
    const el = e.target.closest('[data-vol]'); if (!el) return;
    const what = el.dataset.vol, row = el.closest('.ngvol-row')?.dataset.stream, s = c.data.settings, v = vol(c);
    if (what === 'expand') {
      if (st.turning) return;
      st.expanded = !st.expanded; st.turning = true; draw(c, true); rescheduleTimeout(c);
      // volume_expand_animation_duration 300 ms, then the drawable of the new state at rest.
      setTimeout(() => { st.turning = false; if (st.showing) draw(c); }, 300);
      return;
    }
    if (what === 'end') { NG.system.setZen(c, 0); draw(c); rescheduleTimeout(c); return; }
    if (what === 'mute' && row) {
      if (!rowState(c, row).enabled) return;
      if (row === 'ring') {
        if (s.ringerMode === 'normal') { s.ringerMode = 'vibrate'; navigator.vibrate?.(100); }
        else { s.ringerMode = 'normal'; if (!v.ring) v.ring = 1; }
        c.save(); NG.system?.changed(c);
      } else {
        st.lastAudible = st.lastAudible || {};
        if (v[row]) { st.lastAudible[row] = v[row]; v[row] = 0; } else v[row] = st.lastAudible[row] || 1;
        c.save();
      }
      draw(c); rescheduleTimeout(c);
    }
  }
  // Dragging a slider: the level VolumeDialog.getImpliedLevel gives the progress (12 dp in at the start, 16 at the end).
  function slide(c, e) {
    const slider = e.target.closest('.ngvol-slider'); if (!slider || slider.classList.contains('off')) return;
    const stream = slider.closest('.ngvol-row').dataset.stream, max = MAX[stream];
    e.preventDefault();
    try { slider.setPointerCapture(e.pointerId); } catch {}
    slider.classList.add('pressed');
    const move = ev => {
      const r = slider.getBoundingClientRect(), dp = c.el.screen.clientWidth / (1440 / 3.5);
      const frac = Math.min(1, Math.max(0, (ev.clientX - r.left - 12 * dp) / (r.width - 28 * dp)));
      const progress = frac * max * 100, level = progress === 0 ? 0 : progress >= max * 100 ? max : Math.floor(progress / (max * 100) * (max - 1)) + 1;
      slider.style.setProperty('--v', frac.toFixed(4));
      if (level !== (stream === 'ring' && c.data.settings.ringerMode === 'vibrate' ? 0 : vol(c)[stream])) {
        setLevel(c, stream, level);
        const r2 = rowState(c, stream), row = slider.closest('.ngvol-row');
        row.querySelector('.ngvol-icon img').src = A(`sui-${r2.icon}.svg`);
      }
      rescheduleTimeout(c);
    };
    move(e);
    const up = () => { slider.removeEventListener('pointermove', move); slider.classList.remove('pressed'); draw(c); };
    slider.addEventListener('pointermove', move);
    slider.addEventListener('pointerup', up, {once: true}); slider.addEventListener('pointercancel', up, {once: true});
  }

  NG.register('volume', {
    app: false,
    render: () => '',
    key(c, dir) { if (c.ui.power) return; key(c, dir); },
    init(c) { NG.volume = {dismiss: () => dismiss(c), ringerMode: () => c.data.settings.ringerMode}; }
  });
})();
