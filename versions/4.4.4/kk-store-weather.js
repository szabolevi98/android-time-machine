/* Daily Weather on Android 4.4.4: the Play Store's made-up app (docs/plans/play-apps.md) in the Holo look of the apps of
   2013–2014. The forecast, the texts and the weather icons are shared (store-apps/daily-weather.js);
   store-apps/legacy-host.js hosts it in simulator.js. This file only draws it:
   - the action bar (#1e88e5) with the app icon and title, and the overflow (Units, Refresh) as a Holo popup menu; Units
     is a single-choice dialog (Celsius, Fahrenheit)
   - now in Riverside: the sky's icon and the temperature in thin Roboto, the sky, high and low, feels like, wind,
     humidity
   - Holo list section headers over the next twelve hours (a row that scrolls sideways) and the seven days. */
(() => {
  'use strict';
  const D = () => StoreApps.weather;
  const ID = 'store-daily-weather', P = 'kkdw';
  const t = (c, k) => D().t(k, c.lang);
  function render(c) {
    const s = D().state(c.data), u = s.unit, f = D().forecast(new Date()), n = f.now, l = c.lang;
    const hours = f.hours.map(h => `<div class="${P}-hour"><small>${c.safe(D().hourLabel(h.at, l))}</small>${D().icon(h.cond, 32)}<b>${D().deg(h.temp, u)}</b></div>`).join('');
    const days = f.days.map((d, i) => `<div class="${P}-day"><b>${c.safe(D().weekday(d.date, l, i))}</b>${D().icon(d.cond, 32)}<span>${c.safe(t(c, D().NAME[d.cond]))}${d.pop >= 20 ? ` <em>${d.pop}%</em>` : ''}</span><strong>${D().deg(d.hi, u)}</strong><small>${D().deg(d.lo, u)}</small></div>`).join('');
    return `<div class="app-view ${P}" data-no-translate><header class="${P}-bar"><img class="${P}-icon" src="assets/${ID}.png" alt=""><b>${c.safe(t(c, 'Daily Weather'))}</b><button type="button" class="${P}-more" data-action="sth-overflow" aria-label="${c.safe(c.t('More options'))}"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button></header>
      <main class="${P}-list"><section class="${P}-now"><b class="${P}-city">${c.safe(t(c, 'Riverside'))}</b><div class="${P}-big">${D().icon(n.cond, 80)}<span>${D().deg(n.temp, u)}</span></div>
        <p>${c.safe(t(c, D().NAME[n.cond]))}</p><small>${c.safe(D().fmt('High %1$s · Low %2$s', l, D().deg(n.hi, u), D().deg(n.lo, u)))}<br>${c.safe(D().fmt('Feels like %s', l, D().deg(n.feels, u)))} · ${c.safe(D().fmt('Wind %s', l, D().speed(n.wind, u)))} · ${c.safe(D().fmt('Humidity %s', l, n.humidity + '%'))}</small></section>
        <h3 class="${P}-head">${c.safe(t(c, 'Next hours'))}</h3><div class="${P}-hours">${hours}</div>
        <h3 class="${P}-head">${c.safe(t(c, '7-day forecast'))}</h3>${days}</main></div>`;
  }
  StoreHost.register(ID, {
    title: 'Daily Weather', color: '#1e88e5', dark: '#1565c0', version: '2.4', size: 6.2, key: 'weather',
    render,
    menu(c, anchor) {
      const s = D().state(c.data);
      c.menu([
        {label: t(c, 'Units'), action: c => c.dialog({title: t(c, 'Units'), items: [t(c, 'Celsius'), t(c, 'Fahrenheit')], onItem: (i, c) => { s.unit = i ? 'f' : 'c'; c.save(); c.render(); }})},
        {label: t(c, 'Refresh'), action: c => { c.render(); c.toast(D().fmt('Updated %s', c.lang, new Date().toLocaleTimeString(c.locale, {hour: 'numeric', minute: '2-digit'}))); }}
      ], anchor);
    },
    clearData(c) { if (c.data.storeApps) delete c.data.storeApps.weather; }
  });
})();
