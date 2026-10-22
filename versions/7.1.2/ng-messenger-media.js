/* PrebuiltBugle's audio_attachment_view / message_audio_attachment / attachment_compose_audio and
   video_overlay_view. AudioAttachmentView: 70 dp high, 16 dp padding/gaps, 48 dp play target,
   14 sp PausableChronometer and the 6 dp AudioPlaybackProgressBar; compose preview 72 dp. */
(() => {
  'use strict';
  const t = key => NG.text('messenger').t(key);
  const duration = file => Math.max(1000, +file.duration || 180000);
  const time = ms => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;
  const position = p => Math.min(duration(p.file), p.position + (p.playing ? Math.max(0, Date.now() - p.started) : 0));
  function find(c, key) {
    const [kind, thread, id] = key.split(':');
    return kind === 'p' ? c.ui.messenger?.attach?.[thread]?.[+id]?.audio : c.data.sms?.find(x => x.id === +thread)?.messages.find(m => m.id === +id)?.audio;
  }
  function render(c, file, key, compact = false, incoming = false, accent = '#2a56c6') {
    const p = c.ui.messenger?.audio, active = p?.key === key, pos = active ? position(p) : 0, playing = active && p.playing;
    return `<div class="ngms-audio${compact ? ' compact' : ''}${incoming ? ' incoming' : ''}" style="--audio-accent:${c.safe(accent)}" data-audio-key="${c.safe(key)}" aria-label="${c.safe(t('audio_attachment_content_description'))}"><button type="button" data-action="ngms-audio-toggle" data-key="${c.safe(key)}" aria-label="${c.safe(t(playing ? 'audio_pause_content_description' : 'audio_play_content_description'))}"><i class="ngms-audio-icon" style="--audio-mask:url(assets/bg-ic_audio_${playing ? 'pause' : 'play'}.png)"></i></button><time>${time(active ? pos : duration(file))}</time><i class="ngms-audio-progress"><i style="width:${pos / duration(file) * 100}%"></i></i></div>`;
  }
  function video(c, photo) { return `<span class="ngms-video-overlay"><time>${time(photo.duration || 1000)}</time><img src="assets/bg-ic_play_circle_filled.png" alt=""></span>`; }
  function stop(c) { const p = c.ui.messenger?.audio; if (p) { p.position = position(p); p.playing = false; } }
  NG.smsMedia = {render, video, stop,
    action(name, el, c) {
      if (name === 'ngms-media-open') { stop(c); c.open('photos', 'photo:' + el.dataset.photo); return true; }
      if (name !== 'ngms-audio-toggle') return false;
      const key = el.dataset.key, file = find(c, key); if (!file) return true;
      const u = c.ui.messenger;
      if (u.audio?.key !== key) u.audio = {key, file: JSON.parse(JSON.stringify(file)), position: 0, started: Date.now(), playing: false};
      const p = u.audio; p.position = position(p); if (p.position >= duration(p.file)) p.position = 0;
      p.playing = !p.playing; if (p.playing) { NG.musicModel.pause(c); NG.musicUI.notification(c); } p.started = Date.now(); u.keepScroll = u.lastScroll; c.render(); return true;
    },
    tick(c) {
      const p = c.ui.messenger?.audio; if (!p?.playing) return;
      if (c.ui.view !== 'messenger' || c.ui.sleeping || !find(c, p.key)) { stop(c); return; }
      const value = position(p), root = [...c.el.viewport.querySelectorAll('.ngms-audio')].find(el => el.dataset.audioKey === p.key);
      if (!root) { stop(c); return; }
      root.querySelector('time').textContent = time(value); root.querySelector('.ngms-audio-progress i').style.width = `${value / duration(p.file) * 100}%`;
      if (value >= duration(p.file)) { p.position = value; p.playing = false; c.ui.messenger.keepScroll = c.ui.messenger.lastScroll; c.render(); }
    }};
})();
