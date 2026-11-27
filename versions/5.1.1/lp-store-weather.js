/* Daily Weather on Android 5.1.1: the Play Store's made-up app (docs/plans/play-apps.md) in the Material look of 2015.
   The forecast, the texts and the weather icons are shared (store-apps/daily-weather.js); store-apps/legacy-host.js
   hosts it in simulator.js. This file only draws it:
   - the Toolbar in colorPrimary #1e88e5 (status bar #1565c0) with the title and the overflow (Units: a single-choice
     dialog with Celsius and Fahrenheit; Refresh)
   - a card for now in Riverside (the sky's icon, the temperature, the sky, feels like, wind, humidity, high and low)
   - the next twelve hours as a row that scrolls sideways, and seven days as a list in a card.
   Its status bar is colorPrimaryDark (simulator.js LP_STATUS_COLORS). */
(() => {
  'use strict';
  const D = () => StoreApps.weather;
  const ID = 'store-daily-weather', P = 'lpdw';
  const t = (c, k) => D().t(k, c.lang);
  function render(c) {
    const s = D().state(c.data), u = s.unit, f = D().forecast(new Date()), n = f.now, l = c.lang;
    const hours = f.hours.map(h => `<div class="${P}-hour"><small>${c.safe(D().hourLabel(h.at, l))}</small>${D().icon(h.cond, 32)}<b>${D().deg(h.temp, u)}</b></div>`).join('');
    const days = f.days.map((d, i) => `<div class="${P}-day"><b>${c.safe(D().weekday(d.date, l, i))}</b>${D().icon(d.cond, 32)}<span>${c.safe(t(c, D().NAME[d.cond]))}${d.pop >= 20 ? ` <em>${d.pop}%</em>` : ''}</span><strong>${D().deg(d.hi, u)}</strong><small>${D().deg(d.lo, u)}</small></div>`).join('');
    return `<div class="app-view ${P}" data-no-translate><header class="${P}-bar"><b>${c.safe(t(c, 'Daily Weather'))}</b><button type="button" class="${P}-more" data-action="sth-overflow" aria-label="${c.safe(c.t('More options'))}"><img src="assets/lp-fw-ic_menu_moreoverflow_material.svg" alt=""></button></header><main class="${P}-list">
      <section class="${P}-now"><h2>${c.safe(t(c, 'Riverside'))}</h2><div class="${P}-big">${D().icon(n.cond, 88)}<b>${D().deg(n.temp, u)}</b></div><p>${c.safe(t(c, D().NAME[n.cond]))}</p>
        <small>${c.safe(D().fmt('High %1$s · Low %2$s', l, D().deg(n.hi, u), D().deg(n.lo, u)))}</small>
        <ul><li>${c.safe(D().fmt('Feels like %s', l, D().deg(n.feels, u)))}</li><li>${c.safe(D().fmt('Wind %s', l, D().speed(n.wind, u)))}</li><li>${c.safe(D().fmt('Humidity %s', l, n.humidity + '%'))}</li></ul></section>
      <h3>${c.safe(t(c, 'Next hours'))}</h3><section class="${P}-hours">${hours}</section>
      <h3>${c.safe(t(c, '7-day forecast'))}</h3><section class="${P}-days">${days}</section></main></div>`;
  }
  StoreHost.register(ID, {
    title: 'Daily Weather', color: '#1e88e5', dark: '#1565c0', version: '3.0', size: 6.2, key: 'weather',
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
