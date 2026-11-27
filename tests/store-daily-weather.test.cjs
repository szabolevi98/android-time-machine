require('./lib/vm-strings.cjs');
const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm');
// Daily Weather's shared logic (store-apps/daily-weather.js, docs/plans/play-apps.md): Riverside's made-up forecast.
const w = {AndroidI18n: {language: 'en'}};
vm.runInNewContext(fs.readFileSync('store-apps/daily-weather.js', 'utf8'), w);
const D = w.StoreApps.weather;
const at = (y, m, d, h = 12) => new Date(y, m, d, h, 0);
// The same day gives the same weather; the forecast has twelve hours and seven days, today first.
const f1 = D.forecast(at(2026, 10, 28, 9)), f2 = D.forecast(at(2026, 10, 28, 9));
assert.equal(JSON.stringify(f1), JSON.stringify(f2));
assert.equal(f1.hours.length, 12);
assert.equal(f1.days.length, 7);
assert.equal(f1.days[0].date.getDate(), 28);
assert.ok(f1.hours[0].at.getHours() === 10);
// Every day's low is under its high, the hour's temperature stays between them, the conditions are known ones.
for (let m = 0; m < 12; m++) for (let d = 1; d <= 28; d += 3) {
  const day = D.day(at(2026, m, d));
  assert.ok(day.lo < day.hi, `${m}/${d}`);
  assert.ok(D.COND.includes(day.cond));
  assert.ok(day.pop >= 0 && day.pop <= 95 && day.humidity > 0 && day.humidity <= 100);
}
const now = D.forecast(at(2026, 6, 15, 15)).now;
assert.ok(now.temp <= now.hi + 1 && now.temp >= now.lo - 1);
// The season: July is warmer than January on average; snow only when it is cold.
const avg = m => { let s = 0; for (let d = 1; d <= 28; d++) { const x = D.day(at(2026, m, d)); s += (x.hi + x.lo) / 2; } return s / 28; };
assert.ok(avg(6) > avg(0) + 12);
for (let d = 1; d <= 28; d++) { const x = D.day(at(2026, 6, d)); assert.notEqual(x.cond, 'snow', 'no snow in July'); }
// Units: Celsius by default; Fahrenheit and mph on the setting.
const data = {}; assert.equal(D.state(data).unit, 'c');
assert.equal(D.deg(20, 'c'), '20°'); assert.equal(D.deg(20, 'f'), '68°');
assert.equal(D.speed(16, 'c'), '16 km/h'); assert.equal(D.speed(16, 'f'), '10 mph');
// Names, labels and icons.
assert.equal(D.t(D.NAME.partly, 'hu'), 'Részben felhős');
assert.equal(D.weekday(at(2026, 10, 28), 'en', 0), 'Today');
assert.match(D.icon('rain'), /<svg/);
for (const lang of ['hu', 'de', 'fr', 'es']) for (const k of D.keys) assert.ok(D.t(k, lang));
console.log('Daily Weather logic passed: the same day the same weather, hours and days, seasons, units, texts, icons.');
