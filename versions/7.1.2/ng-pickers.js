/* Android 7.1.2 framework TimePickerDialog and DatePickerDialog (framework-res.apk of N2G48C), the overlays 'timepicker'
   and 'datepicker'. The logic is 6.0.1's (its time picker and date picker); the sizes are N2G48C's dimens:
   - TimePicker (time_picker_material.xml, Widget.Material.Light.TimePicker): the timepicker_header_height 96 dp header in
     the theme's accent with the time at timepicker_time_label_size 60 dp, the active field white, the other dimmed, AM /
     PM (timepicker_ampm_label_size 16 dp) at its side in 12-hour mode; RadialTimePickerView at
     timepicker_radial_picker_dimen 224 dp (h320dp): the numbers 16 sp, timepicker_text_inset_normal 22 dp in (in 24-hour
     mode the inner ring of 13–23 and 00 at 12 sp, 58 dp in; the minutes in fives) on the dial's background, the 20 dp
     selector and its 2 dp line in the accent; letting go of an hour moves to the minutes. Cancel / OK in the accent.
   - DatePicker in calendar mode (date_picker_material.xml): the header in the accent with the year over the date
     (DatePicker's DateFormat "EEE, MMM d"), the month's grid (DayPickerView: the weekday initials, the chosen day on a
     circle of the accent) with the previous / next month arrows, Cancel / OK.
   Use: NG.timePicker(c, hour, minute, onSet(h, m), theme) and NG.datePicker(c, date, onSet(c, date), theme), theme
   'settings' (Theme.Settings' accent #009688, dark numbers on #eceff1) unless an app passes its own colours. */
(() => {
  'use strict';
  const THEMES = {settings: {bg: '#ffffff', header: '#009688', dial: '#eceff1', numbers: '#000000de', accent: '#009688', dim: '#ffffff99', on: '#ffffff'}};
  const F = () => NG.text('settings');
  const is24 = c => c.data.settings.time24 ?? !new Intl.DateTimeFormat(c.locale(), {hour: 'numeric'}).resolvedOptions().hour12;
  NG.timePicker = (c, h, m, onSet, theme = 'settings') => {
    c.ui.timePicker = {h, m, mode: 'hour', onSet, theme: typeof theme === 'object' ? theme : THEMES[theme] || THEMES.settings, is24: is24(c)};
    c.overlay('timepicker');
  };
  const period = (c, pm) => new Intl.DateTimeFormat(c.locale(), {hour: 'numeric', hour12: true}).formatToParts(new Date(2000, 0, 1, pm ? 15 : 9)).find(p => p.type === 'dayPeriod')?.value || (pm ? 'PM' : 'AM');
  function dial(s) {
    const R = 112, items = [], outer = R - 22, inner = R - 58;
    if (s.mode === 'minute') for (let i = 0; i < 12; i++) items.push({v: i * 5, label: String(i * 5).padStart(2, '0'), a: i * 30, r: outer});
    else if (s.is24) { for (let i = 0; i < 12; i++) { items.push({v: i === 0 ? 12 : i, label: String(i === 0 ? 12 : i), a: i * 30, r: outer}); items.push({v: i === 0 ? 0 : i + 12, label: i === 0 ? '00' : String(i + 12), a: i * 30, r: inner, inner: true}); } }
    else for (let i = 0; i < 12; i++) items.push({v: i === 0 ? 12 : i, label: String(i === 0 ? 12 : i), a: i * 30, r: outer});
    const cur = s.mode === 'minute' ? s.m : s.is24 ? s.h : (s.h % 12 || 12);
    const sel = s.mode === 'minute' ? {a: s.m * 6, r: outer} : (items.find(x => x.v === cur) || {a: (cur % 12) * 30, r: outer});
    const pos = (a, r) => [R + r * Math.sin(a * Math.PI / 180), R - r * Math.cos(a * Math.PI / 180)];
    const [sx, sy] = pos(sel.a, sel.r);
    return `<svg class="ngtp-dial" viewBox="0 0 ${2 * R} ${2 * R}"><circle cx="${R}" cy="${R}" r="${R}" fill="${s.theme.dial}"/>
      <line x1="${R}" y1="${R}" x2="${sx.toFixed(1)}" y2="${sy.toFixed(1)}" stroke="${s.theme.accent}" stroke-width="2"/><circle cx="${R}" cy="${R}" r="2" fill="${s.theme.accent}"/>
      <circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="20" fill="${s.theme.accent}"/>
      ${items.map(x => { const [px, py] = pos(x.a, x.r), hit = Math.hypot(px - sx, py - sy) < 14; return `<text x="${px.toFixed(1)}" y="${(py + (x.inner ? 4 : 5.5)).toFixed(1)}" text-anchor="middle" font-size="${x.inner ? 12 : 16}" fill="${hit ? '#ffffff' : s.theme.numbers}" opacity="${x.inner && !hit ? .7 : 1}">${x.label}</text>`; }).join('')}</svg>`;
  }
  function renderTime(c) {
    const s = c.ui.timePicker, hh = s.is24 ? String(s.h).padStart(2, '0') : String(s.h % 12 || 12), mm = String(s.m).padStart(2, '0');
    const on = k => s.mode === k ? s.theme.on : s.theme.dim;
    return `<div class="ngdlg"><div class="ngdlg-dim" data-action="ngtp-cancel"></div><div class="ngdlg-win ngtp" style="background:${s.theme.bg}">
      <div class="ngtp-head" style="background:${s.theme.header}"><button type="button" data-action="ngtp-mode" data-m="hour" style="color:${on('hour')}">${hh}</button><span style="color:${s.theme.dim}">:</span><button type="button" data-action="ngtp-mode" data-m="minute" style="color:${on('minute')}">${mm}</button>
        ${s.is24 ? '' : `<span class="ngtp-ampm"><button type="button" data-action="ngtp-ampm" data-pm="0" style="color:${s.h < 12 ? s.theme.on : s.theme.dim}">${c.safe(period(c, false))}</button><button type="button" data-action="ngtp-ampm" data-pm="1" style="color:${s.h >= 12 ? s.theme.on : s.theme.dim}">${c.safe(period(c, true))}</button></span>`}</div>
      <div class="ngtp-body">${dial(s)}</div>
      <div class="ngdlg-buttons"><i class="ngdlg-spacer"></i><button type="button" class="ngdlg-button" data-action="ngtp-cancel" style="color:${s.theme.accent}">${c.safe(F().t('framework/cancel'))}</button><button type="button" class="ngdlg-button" data-action="ngtp-ok" style="color:${s.theme.accent}">${c.safe(F().t('framework/ok'))}</button></div></div></div>`;
  }
  function mountTime(c, root) {
    const s = c.ui.timePicker, svg = root.querySelector('.ngtp-dial'); if (!svg) return;
    const pick = (e, done) => {
      const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 224 - 112, y = (e.clientY - r.top) / r.height * 224 - 112;
      const a = (Math.atan2(x, -y) * 180 / Math.PI + 360) % 360, dist = Math.hypot(x, y);
      if (s.mode === 'minute') s.m = Math.round(a / 6) % 60;
      else { const h = Math.round(a / 30) % 12; if (s.is24) s.h = dist < 70 ? (h === 0 ? 0 : h + 12) : (h === 0 ? 12 : h); else s.h = h + (s.h >= 12 ? 12 : 0); }
      if (done && s.mode === 'hour') s.mode = 'minute';
      c.overlay('timepicker');
    };
    let down = false;
    svg.addEventListener('pointerdown', e => { down = true; e.preventDefault(); });
    svg.addEventListener('pointerup', e => { if (down) { down = false; pick(e, true); } });
  }
  NG.register('timepicker', {
    app: false, render: renderTime, mount: mountTime,
    action(name, el, event, c) {
      const s = c.ui.timePicker;
      if (name === 'ngtp-cancel') { c.closeOverlay(); return true; }
      if (name === 'ngtp-ok') { c.closeOverlay(); s.onSet?.(s.h, s.m); return true; }
      if (name === 'ngtp-mode') { s.mode = el.dataset.m; c.overlay('timepicker'); return true; }
      if (name === 'ngtp-ampm') { const pm = el.dataset.pm === '1'; if (pm && s.h < 12) s.h += 12; if (!pm && s.h >= 12) s.h -= 12; c.overlay('timepicker'); return true; }
      return false;
    }
  });

  NG.datePicker = (c, date, onSet, theme = 'settings') => {
    c.ui.datePicker = {d: new Date(date.getFullYear(), date.getMonth(), date.getDate()), month: new Date(date.getFullYear(), date.getMonth(), 1), onSet, theme: typeof theme === 'object' ? theme : THEMES[theme] || THEMES.settings};
    c.overlay('datepicker');
  };
  const firstDay = c => { try { return (new Intl.Locale(c.locale()).weekInfo?.firstDay ?? 1) % 7; } catch { return 1; } };
  function renderDate(c) {
    const s = c.ui.datePicker, {d, month, theme} = s, fmt = (o, x) => new Intl.DateTimeFormat(c.locale(), o).format(x), fd = firstDay(c);
    const lead = (month.getDay() - fd + 7) % 7, days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const wd = Array.from({length: 7}, (_, i) => fmt({weekday: 'narrow'}, new Date(2017, 0, 1 + (fd + i) % 7)));
    const same = i => month.getFullYear() === d.getFullYear() && month.getMonth() === d.getMonth() && d.getDate() === i;
    return `<div class="ngdlg"><div class="ngdlg-dim" data-action="ngdp-cancel"></div><div class="ngdlg-win ngdp">
      <div class="ngdp-head" style="background:${theme.header}"><small>${c.safe(d.getFullYear())}</small><b>${c.safe(fmt({weekday: 'short', month: 'short', day: 'numeric'}, d))}</b></div>
      <div class="ngdp-month"><button type="button" data-action="ngdp-month" data-m="-1" aria-label="prev"><i></i></button><span>${c.safe(fmt({month: 'long', year: 'numeric'}, month))}</span><button type="button" data-action="ngdp-month" data-m="1" aria-label="next"><i></i></button></div>
      <div class="ngdp-grid">${wd.map(x => `<i>${c.safe(x)}</i>`).join('')}${'<s></s>'.repeat(lead)}${Array.from({length: days}, (_, i) => `<button type="button" data-action="ngdp-day" data-d="${i + 1}" class="${same(i + 1) ? 'on' : ''}" style="${same(i + 1) ? `background:${theme.accent}` : ''}">${i + 1}</button>`).join('')}</div>
      <div class="ngdlg-buttons"><i class="ngdlg-spacer"></i><button type="button" class="ngdlg-button" data-action="ngdp-cancel" style="color:${theme.accent}">${c.safe(F().t('framework/cancel'))}</button><button type="button" class="ngdlg-button" data-action="ngdp-ok" style="color:${theme.accent}">${c.safe(F().t('framework/ok'))}</button></div></div></div>`;
  }
  NG.register('datepicker', {
    app: false, render: renderDate,
    action(name, el, event, c) {
      const s = c.ui.datePicker;
      if (name === 'ngdp-cancel') { c.closeOverlay(); return true; }
      if (name === 'ngdp-ok') { c.closeOverlay(); s.onSet?.(c, s.d); return true; }
      if (name === 'ngdp-month') { s.month = new Date(s.month.getFullYear(), s.month.getMonth() + +el.dataset.m, 1); c.overlay('datepicker'); return true; }
      if (name === 'ngdp-day') { s.d = new Date(s.month.getFullYear(), s.month.getMonth(), +el.dataset.d); c.overlay('datepicker'); return true; }
      return false;
    }
  });
})();
