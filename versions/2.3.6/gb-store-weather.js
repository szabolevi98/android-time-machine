/* Daily Weather on Android 2.3.6: the Market's made-up app (docs/plans/play-apps.md) in the look apps had in 2011, from
   the framework of GRK39F. The forecast, the texts and the weather icons are shared (store-apps/daily-weather.js);
   store-apps/legacy-host.js hosts it in simulator.js. This file only draws it:
   - the default theme's window title bar on the black window background
   - now in Riverside: the sky's icon and the temperature large, the sky, high and low, feels like, wind, humidity
   - list separators (dark_header) over the next six hours (a row) and the seven days (list rows with their icon)
   - the options menu of the Menu key: Units (a single-choice dialog: Celsius, Fahrenheit) and Refresh. */
(() => {
  'use strict';
  const D = () => StoreApps.weather;
  const ID = 'store-daily-weather', P = 'gbdw';
  const t = (c, k) => D().t(k, c.lang);
  function render(c) {
    const s = D().state(c.data), u = s.unit, f = D().forecast(new Date()), n = f.now, l = c.lang;
    const hours = f.hours.slice(0, 6).map(h => `<div class="${P}-hour"><small>${c.safe(D().hourLabel(h.at, l))}</small>${D().icon(h.cond, 32)}<b>${D().deg(h.temp, u)}</b></div>`).join('');
    const days = f.days.map((d, i) => `<div class="${P}-day"><b>${c.safe(D().weekday(d.date, l, i))}</b>${D().icon(d.cond, 32)}<span>${c.safe(t(c, D().NAME[d.cond]))}</span><strong>${D().deg(d.hi, u)}</strong><small>${D().deg(d.lo, u)}</small></div>`).join('');
    return `<div class="app-view ${P}" data-no-translate><div class="gb-titlebar">${c.safe(t(c, 'Daily Weather'))}</div><div class="${P}-list">
      <div class="${P}-now"><b class="${P}-city">${c.safe(t(c, 'Riverside'))}</b><div class="${P}-big">${D().icon(n.cond, 80)}<span>${D().deg(n.temp, u)}</span></div>
        <div class="${P}-sky">${c.safe(t(c, D().NAME[n.cond]))} · ${c.safe(D().fmt('High %1$s · Low %2$s', l, D().deg(n.hi, u), D().deg(n.lo, u)))}</div>
        <div class="${P}-more">${c.safe(D().fmt('Feels like %s', l, D().deg(n.feels, u)))}<br>${c.safe(D().fmt('Wind %s', l, D().speed(n.wind, u)))} · ${c.safe(D().fmt('Humidity %s', l, n.humidity + '%'))}</div></div>
      <div class="${P}-sep">${c.safe(t(c, 'Next hours'))}</div><div class="${P}-hours">${hours}</div>
      <div class="${P}-sep">${c.safe(t(c, '7-day forecast'))}</div>${days}</div></div>`;
  }
  StoreHost.register(ID, {
    title: 'Daily Weather', color: '#1e88e5', dark: '#1565c0', version: '1.6', size: 6.2, key: 'weather',
    render,
    menu(c) {
      const s = D().state(c.data);
      c.menu([
        {label: t(c, 'Units'), icon: 'ic_menu_preferences', action: c => c.dialog({title: t(c, 'Units'), items: [t(c, 'Celsius'), t(c, 'Fahrenheit')], onItem: (i, c) => { s.unit = i ? 'f' : 'c'; c.save(); c.render(); }})},
        {label: t(c, 'Refresh'), icon: 'ic_menu_refresh', action: c => { c.render(); c.toast(D().fmt('Updated %s', c.lang, new Date().toLocaleTimeString(c.locale, {hour: 'numeric', minute: '2-digit'}))); }}
      ]);
    },
    clearData(c) { if (c.data.storeApps) delete c.data.storeApps.weather; }
  });
})();
