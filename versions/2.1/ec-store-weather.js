/* Daily Weather on Android 2.1: the Market's made-up app (docs/plans/play-apps.md) in the look apps had in 2010, from the
   framework of ERE27. The forecast, the texts and the weather icons are shared (store-apps/daily-weather.js); this file
   only draws it:
   - the default theme's window (c.window: title_bar with the app's name) on the black window background
   - now in Riverside: the sky's icon and the temperature large, the sky, high and low, feels like, wind, humidity
   - list separators (dark_header) over the next six hours (a row) and the seven days (list rows with their icon)
   - the options menu of the Menu key: Units (a single-choice dialog: Celsius, Fahrenheit) and Refresh. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const D = () => StoreApps.weather;
  const ID = 'store-daily-weather', P = 'ecdw';
  const t = (c, k) => D().t(k, c.lang);
  function render(c) {
    const s = D().state(c.data), u = s.unit, f = D().forecast(new Date()), n = f.now, l = c.lang;
    const hours = f.hours.slice(0, 6).map(h => `<div class="${P}-hour"><small>${esc(D().hourLabel(h.at, l))}</small>${D().icon(h.cond, 32)}<b>${D().deg(h.temp, u)}</b></div>`).join('');
    const days = f.days.map((d, i) => `<div class="${P}-day"><b>${esc(D().weekday(d.date, l, i))}</b>${D().icon(d.cond, 32)}<span>${esc(t(c, D().NAME[d.cond]))}</span><strong>${D().deg(d.hi, u)}</strong><small>${D().deg(d.lo, u)}</small></div><i class="ecpf-divider"></i>`).join('');
    return c.window(t(c, 'Daily Weather'), `<div class="${P}" data-no-translate>
      <div class="${P}-now"><b class="${P}-city">${esc(t(c, 'Riverside'))}</b><div class="${P}-big">${D().icon(n.cond, 80)}<span>${D().deg(n.temp, u)}</span></div>
        <div class="${P}-sky">${esc(t(c, D().NAME[n.cond]))} · ${esc(D().fmt('High %1$s · Low %2$s', l, D().deg(n.hi, u), D().deg(n.lo, u)))}</div>
        <div class="${P}-more">${esc(D().fmt('Feels like %s', l, D().deg(n.feels, u)))}<br>${esc(D().fmt('Wind %s', l, D().speed(n.wind, u)))} · ${esc(D().fmt('Humidity %s', l, n.humidity + '%'))}</div></div>
      <div class="${P}-sep">${esc(t(c, 'Next hours'))}</div><div class="${P}-hours">${hours}</div>
      <div class="${P}-sep">${esc(t(c, '7-day forecast'))}</div>${days}</div>`);
  }
  EC.register(ID, {
    render,
    menu(c) {
      const s = D().state(c.data);
      c.menu([
        {label: t(c, 'Units'), icon: 'fw-ic_menu_preferences.png', action: () => c.dialog({title: t(c, 'Units'), icon: null, items: [t(c, 'Celsius'), t(c, 'Fahrenheit')], choice: 'single', checked: s.unit === 'f' ? 1 : 0,
          onItem: i => { s.unit = i ? 'f' : 'c'; c.save(); c.render(); }})},
        {label: t(c, 'Refresh'), icon: 'fw-ic_menu_refresh.png', action: () => { c.render(); c.toast(D().fmt('Updated %s', c.lang, new Date().toLocaleTimeString(c.locale(), {hour: 'numeric', minute: '2-digit'}))); }}
      ]);
      return true;
    },
    clearData(c) { if (c.data.storeApps) delete c.data.storeApps.weather; }
  });
})();
