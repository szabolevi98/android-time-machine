/* Daily Weather on Android 6.0.1: the store's made-up app (docs/plans/play-apps.md) in the Material look of its time.
   The forecast, the texts and the weather icons are shared (store-apps/daily-weather.js); this file only draws it:
   - the Toolbar in colorPrimary #1e88e5 (status bar #1565c0) with the title and the overflow (Celsius / Fahrenheit as
     checkable items, Refresh)
   - a card for now in Riverside (the sky's icon, the temperature, the sky, feels like, wind, humidity, high and low)
   - the next twelve hours as a row that scrolls sideways, and seven days as a list in a card.
   It is the Play Store's runtime 'store-daily-weather' (mm-play.js). */
(() => {
  'use strict';
  const D = () => StoreApps.weather;
  const ID = 'store-daily-weather', P = 'mmdw';
  const t = (c, k) => D().t(k, c.lang);
  function render(c) {
    const s = D().state(c.data), u = s.unit, f = D().forecast(new Date()), n = f.now, l = c.lang;
    const hours = f.hours.map(h => `<div class="${P}-hour"><small>${c.safe(D().hourLabel(h.at, l))}</small>${D().icon(h.cond, 32)}<b>${D().deg(h.temp, u)}</b></div>`).join('');
    const days = f.days.map((d, i) => `<div class="${P}-day"><b>${c.safe(D().weekday(d.date, l, i))}</b>${D().icon(d.cond, 32)}<span>${c.safe(t(c, D().NAME[d.cond]))}${d.pop >= 20 ? ` <em>${d.pop}%</em>` : ''}</span><strong>${D().deg(d.hi, u)}</strong><small>${D().deg(d.lo, u)}</small></div>`).join('');
    return `<div class="${P}" data-no-translate><header class="${P}-bar"><b>${c.safe(t(c, 'Daily Weather'))}</b>${MM.menu.button(c)}</header><main class="${P}-list">
      <section class="${P}-now"><h2>${c.safe(t(c, 'Riverside'))}</h2><div class="${P}-big">${D().icon(n.cond, 88)}<b>${D().deg(n.temp, u)}</b></div><p>${c.safe(t(c, D().NAME[n.cond]))}</p>
        <small>${c.safe(D().fmt('High %1$s · Low %2$s', l, D().deg(n.hi, u), D().deg(n.lo, u)))}</small>
        <ul><li>${c.safe(D().fmt('Feels like %s', l, D().deg(n.feels, u)))}</li><li>${c.safe(D().fmt('Wind %s', l, D().speed(n.wind, u)))}</li><li>${c.safe(D().fmt('Humidity %s', l, n.humidity + '%'))}</li></ul></section>
      <h3>${c.safe(t(c, 'Next hours'))}</h3><section class="${P}-hours">${hours}</section>
      <h3>${c.safe(t(c, '7-day forecast'))}</h3><section class="${P}-days">${days}</section></main></div>`;
  }
  MM.register(ID, {
    title: 'Daily Weather',
    statusColor: () => D().STORE.dark,
    render,
    action(name, el, event, c) {
      if (name !== 'mm-menu') return false;
      const s = D().state(c.data);
      c.menu([
        {label: t(c, 'Celsius'), checked: s.unit === 'c', action: c => { s.unit = 'c'; c.save(); c.render(); }},
        {label: t(c, 'Fahrenheit'), checked: s.unit === 'f', action: c => { s.unit = 'f'; c.save(); c.render(); }},
        {label: t(c, 'Refresh'), action: c => { c.render(); c.toast(D().fmt('Updated %s', c.lang, new Date().toLocaleTimeString(c.locale?.() || 'en-US', {hour: 'numeric', minute: '2-digit'}))); }}
      ], el);
      return true;
    },
    clearData(c) { if (c.data.storeApps) delete c.data.storeApps.weather; }
  });
})();
