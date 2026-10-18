/* Android 6.0.1 framework TimePickerDialog (Widget.Material.TimePicker, time_picker_material.xml), the overlay
   'timepicker', as MM.timePicker(c, hour, minute, onSet(h, m), theme).
   - The header (headerBackground) with the time in headerTimeTextAppearance (timepicker_time_label_size 60 dp), the
     hour or the minute active in white, the other dimmed, and AM / PM (16 dp) at its side in 12-hour mode.
   - RadialTimePickerView, timepicker_radial_picker_dimen 224 dp on a screen of 320 dp or more in height: the numbers
     (1–12, or 00–23 with the inner ring of 13–23 and 00 in 24-hour mode; the minutes in fives) on numbersBackgroundColor,
     the selector (timepicker_selector_radius 20 dp) and its line in numbersSelectorColor; letting go of an hour moves to
     the minutes.
   - The theme is the caller's: DeskClock's TimePickerTheme (#212121, the accent #da4336, white numbers) by default;
     Cancel / OK in the accent. */
(() => {
  'use strict';
  // settings: Theme.Settings' light Material picker (the header in colorAccent #009688, dark numbers on #eceff1).
  const THEMES = {deskclock: {bg: '#212121', header: '#212121', dial: '#212121', numbers: '#ffffff', accent: '#da4336', dim: 'rgba(255,255,255,.5)'},
    settings: {bg: '#ffffff', header: '#009688', dial: '#eceff1', numbers: 'rgba(0,0,0,.87)', accent: '#009688', dim: 'rgba(255,255,255,.6)'}};
  const st = c => c.ui.timePicker;
  MM.timePicker = (c, h, m, onSet, theme = 'deskclock') => {
    const is24 = c.data.settings.time24 ?? !new Intl.DateTimeFormat(c.locale(), {hour: 'numeric'}).resolvedOptions().hour12;
    c.ui.timePicker = {h, m, mode: 'hour', onSet, theme: THEMES[theme] || THEMES.deskclock, is24};
    c.overlay('timepicker');
  };
  const period = (c, pm) => new Intl.DateTimeFormat(c.locale(), {hour: 'numeric', hour12: true}).formatToParts(new Date(2000, 0, 1, pm ? 15 : 9)).find(p => p.type === 'dayPeriod')?.value || (pm ? 'PM' : 'AM');
  function dial(s) {
    const R = 112, items = [];
    if (s.mode === 'minute') for (let i = 0; i < 12; i++) items.push({v: i * 5, label: String(i * 5).padStart(2, '0'), a: i * 30, r: R - 26});
    else if (s.is24) { for (let i = 0; i < 12; i++) { items.push({v: i === 0 ? 12 : i, label: String(i === 0 ? 12 : i), a: i * 30, r: R - 26}); items.push({v: i === 0 ? 0 : i + 12, label: i === 0 ? '00' : String(i + 12), a: i * 30, r: R - 58, inner: true}); } }
    else for (let i = 0; i < 12; i++) items.push({v: i === 0 ? 12 : i, label: String(i === 0 ? 12 : i), a: i * 30, r: R - 26});
    const cur = s.mode === 'minute' ? s.m : s.is24 ? s.h : (s.h % 12 || 12);
    const sel = s.mode === 'minute' ? {a: s.m * 6, r: R - 26} : (items.find(x => x.v === cur) || {a: (cur % 12) * 30, r: R - 26});
    const pos = (a, r) => [R + r * Math.sin(a * Math.PI / 180), R - r * Math.cos(a * Math.PI / 180)];
    const [sx, sy] = pos(sel.a, sel.r);
    return `<svg class="mmtp-dial" viewBox="0 0 ${2 * R} ${2 * R}"><circle cx="${R}" cy="${R}" r="${R}" fill="${s.theme.dial}"/>
      <line x1="${R}" y1="${R}" x2="${sx.toFixed(1)}" y2="${sy.toFixed(1)}" stroke="${s.theme.accent}" stroke-width="2"/><circle cx="${R}" cy="${R}" r="2" fill="${s.theme.accent}"/>
      <circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="20" fill="${s.theme.accent}"/>
      ${items.map(x => { const [px, py] = pos(x.a, x.r); return `<text x="${px.toFixed(1)}" y="${(py + 5).toFixed(1)}" text-anchor="middle" font-size="${x.inner ? 12 : 16}" fill="${s.theme.numbers}" opacity="${x.inner ? .7 : 1}">${x.label}</text>`; }).join('')}</svg>`;
  }
  function render(c) {
    const s = st(c), hh = s.is24 ? String(s.h).padStart(2, '0') : String(s.h % 12 || 12), mm = String(s.m).padStart(2, '0');
    const on = k => s.mode === k ? '#fff' : s.theme.dim;
    return `<div class="mmdlg"><div class="mmdlg-dim" data-action="mmtp-cancel"></div><div class="mmdlg-win mmtp" style="background:${s.theme.bg}">
      <div class="mmtp-head" style="background:${s.theme.header}"><button type="button" data-action="mmtp-mode" data-m="hour" style="color:${on('hour')}">${hh}</button><span style="color:${s.theme.dim}">:</span><button type="button" data-action="mmtp-mode" data-m="minute" style="color:${on('minute')}">${mm}</button>
        ${s.is24 ? '' : `<span class="mmtp-ampm"><button type="button" data-action="mmtp-ampm" data-pm="0" style="color:${s.h < 12 ? '#fff' : s.theme.dim}">${c.safe(period(c, false))}</button><button type="button" data-action="mmtp-ampm" data-pm="1" style="color:${s.h >= 12 ? '#fff' : s.theme.dim}">${c.safe(period(c, true))}</button></span>`}</div>
      <div class="mmtp-body">${dial(s)}</div>
      <div class="mmdlg-buttons"><i class="mmdlg-spacer"></i><button type="button" class="mmdlg-button" data-action="mmtp-cancel" style="color:${s.theme.accent}">${c.safe(MM.text('framework').t('cancel'))}</button><button type="button" class="mmdlg-button" data-action="mmtp-ok" style="color:${s.theme.accent}">${c.safe(MM.text('framework').t('ok'))}</button></div></div></div>`;
  }
  function mount(c, root) {
    const s = st(c), svg = root.querySelector('.mmtp-dial'); if (!svg) return;
    const pick = (e, done) => {
      const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 224 - 112, y = (e.clientY - r.top) / r.height * 224 - 112;
      const a = (Math.atan2(x, -y) * 180 / Math.PI + 360) % 360, dist = Math.hypot(x, y);
      if (s.mode === 'minute') s.m = Math.round(a / 6) % 60;
      else { let h = Math.round(a / 30) % 12; if (s.is24) s.h = dist < 70 ? (h === 0 ? 0 : h + 12) : (h === 0 ? 12 : h); else s.h = (h === 0 ? 0 : h) + (s.h >= 12 ? 12 : 0); }
      if (done && s.mode === 'hour') s.mode = 'minute';
      c.closeOverlay(); c.overlay('timepicker');
    };
    let down = false;
    svg.addEventListener('pointerdown', e => { down = true; e.preventDefault(); });
    svg.addEventListener('pointerup', e => { if (down) { down = false; pick(e, true); } });
  }
  MM.register('timepicker', {
    app: false, render, mount,
    action(name, el, event, c) {
      const s = st(c);
      if (name === 'mmtp-cancel') { c.closeOverlay(); return true; }
      if (name === 'mmtp-ok') { c.closeOverlay(); s.onSet?.(s.h, s.m); return true; }
      if (name === 'mmtp-mode') { s.mode = el.dataset.m; c.overlay('timepicker'); return true; }
      if (name === 'mmtp-ampm') { const pm = el.dataset.pm === '1'; if (pm && s.h < 12) s.h += 12; if (!pm && s.h >= 12) s.h -= 12; c.overlay('timepicker'); return true; }
      return false;
    }
  });
})();
