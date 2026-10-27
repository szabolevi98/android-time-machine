/* Android 7.1.2 app widgets on the home screen (the launcher's LauncherAppWidgetHostView, ng-launcher.js). So far the
   simulator's own home screen rule needs one: the Clock app's digital clock (PrebuiltDeskClockGoogle 4.6.1,
   com.android.alarmclock.DigitalAppWidgetProvider, xml/digital_appwidget.xml: 206 x 129 dp at least):
   - digital_widget.xml: centred at the top, the time (TextClock "h:mm" / "kk:mm", widget_big_thin: sans-serif-light on
     API 23+, white, no font padding) over the date (abbrev_wday_month_day_no_year "EEEMMMd", widget_label: caps,
     letter spacing 0.15) and the next alarm (the clock font's "A" glyph and the time), both with widget_shadow_color
     #67000000 2 px down, 2.75 px blur.
   - DigitalAppWidgetProvider sizes the texts to the widget: the launcher's appWidgetMinWidth and appWidgetMaxHeight in
     portrait, a binary search from widget_max_clock_font_size 88 dp down for the largest clock font whose
     digital_widget_sizer.xml ("11:59" or "23:59", the date and the alarm) fits; the date and alarm at the clock size
     / 7.5, the alarm glyph 1.4 times that with a third of it as padding. Below that, with more than
     widget_min_world_city_list_size 80 dp left, the world clock list (no cities chosen: empty).
   - A tap opens the Clock app. */
(() => {
  'use strict';
  const D = 3.5;
  const is24 = c => c.data.settings.time24 ?? !new Intl.DateTimeFormat(c.locale(), {hour: 'numeric'}).resolvedOptions().hour12;
  const time = (c, d = NG.deviceDate(c)) => is24(c) ? `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}`;
  const date = (c, d = NG.deviceDate(c)) => new Intl.DateTimeFormat(c.locale(), {weekday: 'short', month: 'short', day: 'numeric'}).format(d);
  // DeskClock's next alarm text: the best "EEE hma" / "EEE Hm" pattern.
  const nextAlarm = c => { const at = NG.clock?.nextAlarm(c); return at ? new Intl.DateTimeFormat(c.locale(), {weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: !is24(c)}).format(at) : ''; };

  const INFO = {digital: {id: 'digital', app: 'clock', spanX: 5, spanY: 2, minW: 206, minH: 129}};

  // The provider's binary search, with the canvas measuring as the sizer view would (Roboto's ascent and descent 1.172
  // em without font padding).
  let canvas = null;
  function width(text, px, font, spacing = 0) {
    canvas ||= document.createElement('canvas');
    const g = canvas.getContext('2d'); g.font = `${font} ${px}px Roboto`;
    return g.measureText(text).width + spacing * px * text.length;
  }
  function fit(c, wDp, hDp) {
    const w = wDp * D, h = hDp * D, sample = is24(c) ? '23:59' : '11:59', d = date(c).toUpperCase(), alarm = nextAlarm(c).toUpperCase();
    const fits = k => {
      const j = Math.max(1, Math.round(k / 7.5)), l = Math.trunc(j * 1.4), m = Math.trunc(j / 3);
      const rowW = width(d, j, 400, .15) + (alarm ? width(alarm, j, 400, .15) + l + 2 * m : 0);
      return {ok: width(sample, k, 300) <= w && rowW <= w && k * 1.172 + Math.max(j, alarm ? l : 0) * 1.172 <= h, j, l, m};
    };
    let hi = Math.round(88 * D), lo = 0;
    if (fits(hi).ok) return {k: hi, ...fits(hi)};
    while (hi - lo > 1) { const mid = Math.trunc((hi + lo) / 2); if (fits(mid).ok) lo = mid; else hi = mid; }
    return {k: lo, ...fits(lo)};
  }

  function home(c, it) {
    if (it.w !== 'digital') return '';
    const alarm = nextAlarm(c);
    // The launcher's portrait cell is 80.686 x 96.686 dp: appWidgetMinWidth 5 cells, appWidgetMaxHeight 2 cells.
    // AppWidgetHostView.updateAppWidgetSize removes the host padding before reporting the available dimensions.
    const g = NG.launcherGrid, s = fit(c, Math.max(1, (it.spanX || 5) * g.cellW / D - 16), Math.max(1, (it.spanY || 2) * g.cellH / D - 16));
    const px = v => `calc(${(v / D).toFixed(3)} * var(--dp))`;
    return `<button type="button" class="ngwg-digital" data-action="ngwg-open" data-app="clock" style="--k:${px(s.k)};--j:${px(s.j)};--l:${px(s.l)};--m:${px(s.m)}"><b class="ngwg-time">${c.safe(time(c))}</b><span class="ngwg-row"><i class="ngwg-date">${c.safe(date(c))}</i>${alarm ? `<em class="ngwg-aicon">A</em><i class="ngwg-alarm">${c.safe(alarm)}</i>` : ''}</span></button>`;
  }

  let lastMinute = -1;
  NG.widgets = {
    info: id => INFO[id] || null,
    home,
    action(name, el, event, c) {
      if (name === 'ngwg-open') { c.open(el.dataset.app, '', {from: el}); return true; }
      return false;
    }
  };
  NG.register('widgets-clock', {
    app: false, render: () => '',
    tick(c, now) {
      if (now.getMinutes() === lastMinute) return;
      lastMinute = now.getMinutes();
      if (c.ui.view !== 'home') return;
      c.el.viewport.querySelectorAll('.ngh-widget[data-w="digital"]').forEach(el => { const [,page,index]=(el.dataset.src||'').split(':');const item=c.data.home?.pages?.[+page-1]?.[+index];el.innerHTML = home(c, item||{w: 'digital', spanX: 5, spanY: 2}); });
    }
  });
})();
