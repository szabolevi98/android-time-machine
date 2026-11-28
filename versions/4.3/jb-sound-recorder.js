/* Sound Recorder on Android 4.3 (SoundRecorder.apk of JWR66Y, opened by Messaging's Attach › Capture audio), moved
   out of simulator.js (docs/plans/engine-migration.md). The screen is sound-recorder.js's; here: record, play, stop,
   Done / Discard, the one-second tick and Back (stop, then leave with or without the recording). */
(() => {
  'use strict';
  let $c, back, i18n, jbmaContext, messageDraft, render, save, ui;
  const $bind = c => { $c = c; ({back, i18n, jbmaContext, messageDraft, render, save, ui} = c); };
  /* Sound Recorder: the recording runs until stopped or until the MMS size limit (SoundRecorder.LIMIT seconds, then
     "Maximum length reached"); playback runs to the end of the sample. The view repaints four times a second. */
  function srTick() {
    clearInterval(ui.srTimer);
    ui.srTimer = setInterval(() => {
      if (ui.view !== 'sound-recorder' || ui.sr.state === 'idle') { clearInterval(ui.srTimer); return; }
      const t = SoundRecorder.progress(ui.sr);
      if (ui.sr.state === 'recording' && t >= SoundRecorder.LIMIT) { ui.sr = {...ui.sr, state: 'idle', length: SoundRecorder.LIMIT, interrupted: true, error: 'max_length_reached'}; }
      else if (ui.sr.state === 'playing' && t >= ui.sr.length) ui.sr = {...ui.sr, state: 'idle'};
      render();
    }, 250);
    render();
  }
  function srStart() { if (ui.sr.state === 'recording') return; ui.sr = {...SoundRecorder.initial(), state: 'recording', started: Date.now()}; srTick(); }
  function srStop() {
    if (ui.sr.state === 'recording') ui.sr = {...ui.sr, state: 'idle', length: Math.max(1, SoundRecorder.progress(ui.sr))};
    else if (ui.sr.state === 'playing') ui.sr = {...ui.sr, state: 'idle'};
    clearInterval(ui.srTimer); render();
  }
  // Back in Messaging: saveSample's result becomes the draft's audio attachment.
  function srFinish(keep) {
    clearInterval(ui.srTimer);
    const back = ui.srReturn || {view: 'messaging', sub: ''};
    ui.view = back.view; ui.sub = back.sub; ui.thread = back.thread; ui.jbmaScreen = back.screen || null; ui.jbmaSlide = back.slide;
    if (keep && ui.sr.length > 0) { if (back.target === 'slide') JBMmsAttach.apply(jbmaContext(), 'slide', {audio: SoundRecorder.sample(ui.sr, i18n.language)}); else { const draft = messageDraft(); draft.attachment = SoundRecorder.sample(ui.sr, i18n.language); draft.updated = Date.now(); save(); } }
    ui.sr = SoundRecorder.initial(); render();
  }
  const spec = {
    render(c) {
      $bind(c);
      switch (ui.view) {
        case 'sound-recorder': return SoundRecorder.render(ui.sr ||= SoundRecorder.initial(), i18n.language);
      }
    },
    action(action, button, c) {
      $bind(c);
      const event = c.event, { id, app, url } = button.dataset;
      switch (action) {
        case 'sr-record': srStart(); break;
        case 'sr-play': if (ui.sr.state === 'idle' && ui.sr.length) { ui.sr = {...ui.sr, state: 'playing', started: Date.now(), interrupted: false, error: ''}; srTick(); } break;
        case 'sr-stop': srStop(); break;
        case 'sr-accept': srStop(); srFinish(true); break;
        case 'sr-discard': srStop(); srFinish(false); break;
        default: return false;
      }
      return true;
    },
    back(c) {
      $bind(c);
      if (ui.view === 'sound-recorder' && !ui.overlay) { const st = ui.sr.state; if (st === 'idle') srFinish(ui.sr.length > 0); else if (st === 'playing') srStop(); else { clearInterval(ui.srTimer); ui.sr = SoundRecorder.initial(); render(); } return true; }
      return false;
    }
  };
  JB.register('sound-recorder', spec);
})();
