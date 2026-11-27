/* Daily Weather (Clear Sky Co.): one of the store's made-up apps (docs/plans/play-apps.md). This file is its logic, its
   own texts and its own weather icons, shared by every version; each version draws the screens in its own look.
   The forecast is for the phone owner's town, Riverside (docs/demo-data.md: the Google Now and News & Weather card),
   made up from the date: the same day always gives the same weather, and the temperatures follow the season. Now (the
   temperature, the sky, feels like, wind, humidity, the day's high and low), the next twelve hours and seven days.
   Celsius or Fahrenheit is the app's one setting, kept in data.storeApps.weather: {unit}. */
(() => {
  'use strict';
  const T = {
    'Daily Weather': {own: true, hu: 'Daily Weather', de: 'Daily Weather', fr: 'Daily Weather', es: 'Daily Weather'},
    'Riverside': {own: true, hu: 'Riverside', de: 'Riverside', fr: 'Riverside', es: 'Riverside'},
    'Sunny': {own: true, hu: 'Napos', de: 'Sonnig', fr: 'Ensoleillé', es: 'Soleado'},
    'Partly cloudy': {own: true, hu: 'Részben felhős', de: 'Teilweise bewölkt', fr: 'Partiellement nuageux', es: 'Parcialmente nublado'},
    'Cloudy': {own: true, hu: 'Felhős', de: 'Bewölkt', fr: 'Nuageux', es: 'Nublado'},
    'Rain': {own: true, hu: 'Eső', de: 'Regen', fr: 'Pluie', es: 'Lluvia'},
    'Thunderstorms': {own: true, hu: 'Zivatar', de: 'Gewitter', fr: 'Orages', es: 'Tormentas'},
    'Snow': {own: true, hu: 'Havazás', de: 'Schnee', fr: 'Neige', es: 'Nieve'},
    'Fog': {own: true, hu: 'Köd', de: 'Nebel', fr: 'Brouillard', es: 'Niebla'},
    'Feels like %s': {own: true, hu: 'Hőérzet: %s', de: 'Gefühlt %s', fr: 'Ressenti %s', es: 'Sensación %s'},
    'Wind %s': {own: true, hu: 'Szél: %s', de: 'Wind %s', fr: 'Vent %s', es: 'Viento %s'},
    'Humidity %s': {own: true, hu: 'Páratartalom: %s', de: 'Luftfeuchtigkeit %s', fr: 'Humidité %s', es: 'Humedad %s'},
    'High %1$s · Low %2$s': {own: true, hu: 'Max. %1$s · Min. %2$s', de: 'Höchst %1$s · Tiefst %2$s', fr: 'Max. %1$s · Min. %2$s', es: 'Máx. %1$s · Mín. %2$s'},
    'Next hours': {own: true, hu: 'Következő órák', de: 'Nächste Stunden', fr: 'Prochaines heures', es: 'Próximas horas'},
    '7-day forecast': {own: true, hu: '7 napos előrejelzés', de: '7-Tage-Vorhersage', fr: 'Prévisions sur 7 jours', es: 'Previsión de 7 días'},
    'Today': {own: true, hu: 'Ma', de: 'Heute', fr: 'Aujourd’hui', es: 'Hoy'},
    'Now': {own: true, hu: 'Most', de: 'Jetzt', fr: 'Maintenant', es: 'Ahora'},
    'Celsius': {own: true, hu: 'Celsius', de: 'Celsius', fr: 'Celsius', es: 'Celsius'},
    'Fahrenheit': {own: true, hu: 'Fahrenheit', de: 'Fahrenheit', fr: 'Fahrenheit', es: 'Fahrenheit'},
    'Units': {own: true, hu: 'Mértékegység', de: 'Einheiten', fr: 'Unités', es: 'Unidades'},
    'Refresh': {own: true, hu: 'Frissítés', de: 'Aktualisieren', fr: 'Actualiser', es: 'Actualizar'},
    'Updated %s': {own: true, hu: 'Frissítve: %s', de: 'Aktualisiert: %s', fr: 'Mis à jour : %s', es: 'Actualizado: %s'}
  };
  const text = AndroidStrings.table('store-daily-weather', T);
  const t = (k, l) => text.t(k, l), fmt = (k, l, ...a) => text.fmt(k, l, ...a);
  const LOCALE = {en: 'en-US', hu: 'hu-HU', de: 'de-DE', fr: 'fr-FR', es: 'es-ES'};
  const locale = l => LOCALE[String(l || globalThis.AndroidI18n?.language || 'en').slice(0, 2)] || 'en-US';
  const COND = ['sunny', 'partly', 'cloudy', 'rain', 'storm', 'snow', 'fog'];
  const NAME = {sunny: 'Sunny', partly: 'Partly cloudy', cloudy: 'Cloudy', rain: 'Rain', storm: 'Thunderstorms', snow: 'Snow', fog: 'Fog'};
  // Riverside's monthly mean temperature (°C) and how wet each month is (0 … 1).
  const MEAN = [2, 4, 8, 13, 18, 22, 25, 24, 19, 13, 7, 3], WET = [.5, .45, .45, .4, .35, .3, .25, .25, .3, .4, .5, .55];
  const hash = str => { let h = 2166136261; for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return (h >>> 0) / 4294967296; };
  const keyOf = d => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  // One day's weather, from its date alone.
  function day(date) {
    const k = keyOf(date), m = date.getMonth(), r = hash('riverside' + k), r2 = hash('sky' + k), r3 = hash('wind' + k);
    const mean = MEAN[m] + (r - .5) * 8, hi = Math.round(mean + 4 + r2 * 3), lo = Math.round(mean - 4 - r3 * 3);
    const wet = WET[m] + (r2 - .5) * .3;
    let cond = wet > .62 ? (mean < 1 ? 'snow' : r3 > .8 && m >= 4 && m <= 8 ? 'storm' : 'rain') : wet > .45 ? 'cloudy' : wet > .3 ? 'partly' : 'sunny';
    if (cond === 'cloudy' && r3 < .12 && (m < 3 || m > 9)) cond = 'fog';
    return {date, cond, hi, lo, pop: Math.max(0, Math.min(95, Math.round((wet - .2) * 140 / 5) * 5)), wind: Math.round(6 + r3 * 22), humidity: Math.round(45 + wet * 50)};
  }
  // The hour's temperature: the day's low before dawn, its high mid-afternoon.
  const hourTemp = (d, h) => {
    const x = h < 5 ? h + 24 : h;
    return x <= 15 ? d.lo + (d.hi - d.lo) * (0.5 - 0.5 * Math.cos((x - 5) / 10 * Math.PI)) : d.hi - (d.hi - d.lo) * (x - 15) / 14;
  };
  function forecast(now = new Date()) {
    const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const days = Array.from({length: 7}, (_, i) => { const d = new Date(base); d.setDate(base.getDate() + i); return day(d); });
    const today = days[0], h = now.getHours();
    const temp = Math.round(hourTemp(today, h + now.getMinutes() / 60));
    const hours = Array.from({length: 12}, (_, i) => { const at = new Date(now); at.setMinutes(0, 0, 0); at.setHours(h + i + 1); const d = day(new Date(at.getFullYear(), at.getMonth(), at.getDate())); return {at, temp: Math.round(hourTemp(d, at.getHours())), cond: d.cond}; });
    return {now: {temp, feels: Math.round(temp - today.wind / 10), cond: today.cond, wind: today.wind, humidity: today.humidity, hi: today.hi, lo: today.lo}, hours, days};
  }
  function state(data) { const s = (data.storeApps ||= {}).weather ||= {unit: 'c'}; s.unit ||= 'c'; return s; }
  const deg = (c, unit) => `${Math.round(unit === 'f' ? c * 9 / 5 + 32 : c)}°`;
  const speed = (kmh, unit) => unit === 'f' ? `${Math.round(kmh / 1.609)} mph` : `${kmh} km/h`;
  const weekday = (date, l, i) => i === 0 ? t('Today', l) : date.toLocaleDateString(locale(l), {weekday: 'short'});
  const hourLabel = (date, l) => date.toLocaleTimeString(locale(l), {hour: 'numeric', minute: '2-digit'});
  // The app's own icons, drawn for it (the sky of each kind); size in px.
  const ICONS = {
    sun: '<circle cx="24" cy="24" r="9" fill="#ffc107"/><g stroke="#ffc107" stroke-width="3" stroke-linecap="round"><path d="M24 6v5M24 37v5M6 24h5M37 24h5M11 11l3.5 3.5M33.5 33.5L37 37M11 37l3.5-3.5M33.5 14.5L37 11"/></g>',
    cloud: '<path d="M15 36h20a8 8 0 0 0 0-16 11 11 0 0 0-21-1 8.5 8.5 0 0 0 1 17z" fill="#b0bec5"/>',
    rain: '<g stroke="#42a5f5" stroke-width="3" stroke-linecap="round"><path d="M17 39l-2 5M25 39l-2 5M33 39l-2 5"/></g>',
    snow: '<g fill="#e3f2fd" stroke="#90caf9"><circle cx="16" cy="41" r="2.5"/><circle cx="24" cy="44" r="2.5"/><circle cx="32" cy="41" r="2.5"/></g>',
    bolt: '<path d="M25 33l-6 9h5l-3 7 8-10h-5l3-6z" fill="#ffca28"/>',
    fog: '<g stroke="#b0bec5" stroke-width="3" stroke-linecap="round"><path d="M10 20h28M8 27h32M12 34h24"/></g>'
  };
  function icon(cond, size = 48) {
    const parts = {sunny: [ICONS.sun], partly: ['<g transform="translate(-6 -6) scale(.8)">' + ICONS.sun + '</g>', ICONS.cloud], cloudy: [ICONS.cloud], rain: [ICONS.cloud.replace('#b0bec5', '#90a4ae'), ICONS.rain], storm: [ICONS.cloud.replace('#b0bec5', '#78909c'), ICONS.bolt], snow: [ICONS.cloud, ICONS.snow], fog: [ICONS.fog]}[cond] || [ICONS.cloud];
    return `<svg viewBox="0 0 48 48" width="${size}" height="${size}" aria-hidden="true">${parts.join('')}</svg>`;
  }
  const STORE = {id: 'daily-weather', name: 'Daily Weather', developer: 'Clear Sky Co.', category: 'Weather', color: '#1e88e5', dark: '#1565c0',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="9" fill="#1e88e5"/><g transform="translate(2 4) scale(.92)">' + ICONS.sun.replace(/#ffc107/g, '#ffe082') + '</g><g transform="translate(6 8) scale(.85)">' + ICONS.cloud.replace('#b0bec5', '#ffffff') + '</g></svg>'};
  (globalThis.StoreApps ||= {}).weather = {T: text, t, fmt, keys: Object.keys(T), COND, NAME, day, forecast, state, deg, speed, weekday, hourLabel, icon, STORE};
})();
