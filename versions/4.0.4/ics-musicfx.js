/* Settings › Sound › Music effects: MusicFX's ActivityMusic (android.media.action.DISPLAY_AUDIO_EFFECT_CONTROL_PANEL) on
   Theme.Holo, labelled Equalizer, with the on / off Switch in the action bar. music_main.xml: the preset Spinner (the
   bundle's presets Normal … Rock as libbundlewrapper names them, then FX Booster and User), music_eq.xml's five 180 dp
   vertical band SeekBars (60 Hz to 14 kHz, -15 to +15 dB with the +15 dB / 0 dB / -15 dB scale), Bass boost and 3D
   effect with their 170 dp SeekBars, which need headphones ("Please plug headphones for these effects"); the reverb
   Spinner stays GONE. Moving a band makes the preset User. The values are kept per calling package (Settings here);
   no sound is processed. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const S = (ctx, key) => { const row = window.StockStrings?.musicfx?.[key]; return row ? AndroidStrings.pick(row, ctx.language, row.en || key) : key; };
  // EffectBundle.h: the five bands and the soft presets in millibels; FX Booster is ControlPanelEffect's CI_EXTREME.
  const FREQUENCIES = [60, 230, 910, 3600, 14000];
  const NAMES = ['Normal', 'Classical', 'Dance', 'Flat', 'Folk', 'Heavy Metal', 'Hip Hop', 'Jazz', 'Pop', 'Rock'];
  const PRESETS = [[3, 0, 0, 0, 3], [5, 3, -2, 4, 4], [6, 0, 2, 4, 1], [0, 0, 0, 0, 0], [3, 0, 0, 2, -1], [4, 1, 9, 3, 0], [5, 3, 0, 1, 3], [4, 2, -2, 2, 5], [-1, 2, 5, 1, -2], [5, 3, -1, 3, 5]].map(a => a.map(v => v * 100));
  const EXTREME = [0, 800, 400, 100, 1000], MAX = 1500;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, Math.round(Number(v) || 0)));
  const state = data => (data.musicFx ||= {}).settings ||= {enabled: false, preset: 10, user: [0, 0, 0, 0, 0], bass: 667, surround: 0};
  const levels = data => { const s = state(data); return [...(s.preset < 10 ? PRESETS[s.preset] : s.preset === 10 ? EXTREME : s.user)]; };
  // Headphones: a paired Bluetooth audio device while Bluetooth is on (the simulator has no wired jack).
  const headset = data => !!(data.settings?.bluetooth && data.settings?.pairedDevice);
  const freq = (n, locale) => `${new Intl.NumberFormat(locale, {maximumFractionDigits: 1}).format(n >= 1000 ? n / 1000 : n)} ${n >= 1000 ? 'kHz' : 'Hz'}`;
  const presetName = (ctx, n) => n === 10 ? S(ctx, 'FX Booster') : n === 11 ? S(ctx, 'User') : NAMES[n];
  function render(ctx) {
    const {data, ui} = ctx, s = state(data), on = s.enabled, phones = headset(data), lv = levels(data);
    const spinner = `<div class="mfx-spinner-wrap"><button class="mfx-spinner" data-action="mfx-spin"${on ? '' : ' disabled'}>${e(presetName(ctx, s.preset))}</button>${ui.mfxSpin ? `<div class="mfx-drop">${[...NAMES.keys(), 10, 11].map(n => `<button data-action="mfx-preset" data-id="${n}"${n === s.preset ? ' class="on"' : ''}>${e(presetName(ctx, n))}</button>`).join('')}</div>` : ''}</div>`;
    const scale = `<div class="mfx-scale"><span>+15 dB</span><span>0 dB</span><span>-15 dB</span></div>`;
    const bands = FREQUENCIES.map((f, i) => `<div class="mfx-band"><input type="range" class="mfx-vertical" data-mfx="band:${i}" min="${-MAX}" max="${MAX}" step="100" value="${lv[i]}"${on ? '' : ' disabled'} aria-label="${e(freq(f, ctx.locale))}"><span>${e(freq(f, ctx.locale))}</span></div>`).join('');
    const strength = (key, label) => `<div class="mfx-row${on && phones ? '' : ' off'}" data-action="mfx-headset"><span>${e(S(ctx, label))}</span><input type="range" data-mfx="${key}" min="0" max="1000" value="${s[key]}"${on && phones ? '' : ' disabled'} aria-label="${e(S(ctx, label))}"></div>`;
    return {title: S(ctx, 'Equalizer'), body: `<div class="mfx">${spinner}<div class="mfx-eq">${scale}${bands}</div>${strength('bass', 'Bass boost')}${strength('surround', '3D effect')}</div>`,
      right: `<button class="holo-switch settings-action-switch${on ? ' on' : ''}" data-action="mfx-enabled" role="switch" aria-checked="${on}" aria-label="${e(S(ctx, 'Equalizer'))}"><span class="switch-label" aria-hidden="true">${on ? 'ON' : 'OFF'}</span></button>`};
  }
  function handle(action, id, ctx) {
    const {data, ui} = ctx, s = state(data);
    switch (action) {
      case 'mfx-enabled': s.enabled = !s.enabled; ui.mfxSpin = false; ctx.save(); ctx.render(); return true;
      case 'mfx-spin': ui.mfxSpin = !ui.mfxSpin; ctx.render(); return true;
      case 'mfx-preset': s.preset = clamp(id, 0, 11); ui.mfxSpin = false; ctx.save(); ctx.render(); return true;
      case 'mfx-headset': if (s.enabled && !headset(data)) ctx.toast(S(ctx, 'Please plug headphones for these effects')); return true;
      default: return false;
    }
  }
  // A slider moved (the simulator's input event): a band turns the preset into User; the strengths need headphones.
  function input(target, ctx) {
    const [key, index] = String(target.dataset.mfx || '').split(':'), s = state(ctx.data);
    if (!key || !s.enabled) return false;
    if (key === 'band') { if (s.preset !== 11) s.user = levels(ctx.data); s.preset = 11; s.user[Number(index)] = clamp(target.value, -MAX, MAX); const sp = target.closest('.mfx')?.querySelector('.mfx-spinner'); if (sp) sp.textContent = presetName(ctx, 11); }
    else if (headset(ctx.data)) s[key] = clamp(target.value, 0, 1000);
    ctx.save(); return true;
  }
  window.MusicFX = {FREQUENCIES, NAMES, state, levels, headset, render, handle, input};
})();
