require('./lib/vm-strings.cjs');
const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm');
// Focus Timer's shared logic (store-apps/focus-timer.js, docs/plans/play-apps.md): sessions, pause, the long break,
// ending while closed, and the day's count.
const w = {AndroidI18n: {language: 'en'}};
vm.runInNewContext(fs.readFileSync('store-apps/focus-timer.js', 'utf8'), w);
const F = w.StoreApps.focus, MIN = 60000;
let now = new Date(2026, 10, 28, 9, 0).getTime();
const data = {}, s = F.state(data, now);
assert.equal(s.mode, 'focus');
assert.equal(F.clock(F.remaining(s, now)), '25:00');
// Start, run ten minutes, pause, wait, resume: the paused time does not count.
assert.ok(F.start(s, now)); assert.ok(!F.start(s, now));
now += 10 * MIN; assert.equal(F.clock(F.remaining(s, now)), '15:00');
assert.ok(F.pause(s, now)); now += 30 * MIN;
assert.equal(F.clock(F.remaining(s, now)), '15:00');
F.start(s, now); now += 15 * MIN - 1000;
assert.equal(F.tick(s, now), null);
assert.equal(F.clock(F.remaining(s, now)), '0:01');
// It ends while nobody looks: tick reports it once, and the short break is next.
now += 5000;
assert.equal(F.tick(s, now).ended, 'focus');
assert.equal(F.tick(s, now), null);
assert.equal(s.mode, 'short'); assert.equal(s.running, false); assert.equal(s.sessions, 1);
assert.equal(F.clock(F.remaining(s, now)), '5:00');
// The fourth completed focus session is followed by the long break; skipping does not count.
const run = () => { F.start(s, now); now += F.LENGTH[s.mode]; return F.tick(s, now).ended; };
assert.equal(run(), 'short'); assert.equal(s.mode, 'focus');
for (let i = 0; i < 2; i++) { run(); run(); }
assert.equal(s.sessions, 3);
F.skip(s); assert.equal(s.mode, 'short'); assert.equal(s.sessions, 3, 'a skipped focus session does not count');
F.skip(s); run();
assert.equal(s.sessions, 4); assert.equal(s.mode, 'long');
assert.equal(F.clock(F.remaining(s, now)), '15:00');
// Reset puts the session back to its full length; progress runs from 0 to 1.
F.start(s, now); now += 5 * MIN; assert.ok(Math.abs(F.progress(s, now) - 1 / 3) < 1e-9);
F.reset(s); assert.equal(F.remaining(s, now), 15 * MIN); assert.equal(s.running, false);
// The next day counts from zero.
now += 24 * 60 * MIN; F.state(data, now); assert.equal(s.sessions, 0);
// The notification texts and the five languages.
assert.equal(F.ending('focus', 'en').title, 'Focus session complete');
assert.equal(F.ending('short', 'hu').title, 'Vége a szünetnek');
for (const lang of ['hu', 'de', 'fr', 'es']) for (const k of F.keys) assert.ok(F.t(k, lang));
console.log('Focus Timer logic passed: start, pause, ending while closed, breaks, the long break, skip, reset, the day, texts.');
