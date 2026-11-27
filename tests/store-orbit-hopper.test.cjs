require('./lib/vm-strings.cjs');
const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm');
// Orbit Hopper's shared rules (store-apps/orbit-hopper.js, docs/plans/play-apps.md): planets, the jump, landing,
// stars, getting lost, and the course going on.
const w = {AndroidI18n: {language: 'en'}};
vm.runInNewContext(fs.readFileSync('store-apps/orbit-hopper.js', 'utf8'), w);
const O = w.StoreApps.orbit;
const fly = (g, ms = 4000) => { let r = ''; for (let i = 0; i < ms / 8 && !r; i++) r = O.step(g, 1 / 120); return r; };
const aimAt = (g, i) => { const from = g.planets[g.player.on], to = g.planets[i]; g.planets.forEach(p => { p.spin = 0; }); g.player.angle = Math.atan2(to.y - from.y, to.x - from.x); O.place(g); };

// A new game: the player stands on the first planet, the next ones are above it.
let g = O.start(42);
assert.equal(g.player.on, 0);
assert.equal(g.phase, 'ready');
assert.ok(g.planets.length >= 7);
for (let i = 1; i < g.planets.length; i++) assert.ok(g.planets[i].y < g.planets[i - 1].y, 'planets go up');
// Standing on a spinning planet turns the player with it.
const a0 = g.player.angle; O.step(g, 0.5); assert.notEqual(g.player.angle, a0);
// Aimed at the next planet, a jump lands on it and scores; the stars on the way count too.
aimAt(g, 1);
const star = g.stars[0]; star.x = (g.player.x + g.planets[1].x) / 2; star.y = (g.player.y + g.planets[1].y) / 2;
assert.ok(O.jump(g));
assert.equal(g.player.on, null);
assert.equal(fly(g), 'land');
assert.equal(g.player.on, 1);
assert.equal(g.score, 2, 'one planet and one star');
assert.ok(g.stars[0].taken);
// A second jump while flying does nothing; landing again on a planet already reached scores nothing.
g = O.start(7); aimAt(g, 1); O.jump(g); assert.equal(O.jump(g), false); fly(g);
const before = g.score; g.player.from = 1; aimAt(g, 0); O.jump(g); g.player.from = 1; fly(g);
assert.equal(g.score, before);
// Jumping down, away from every planet, is lost in space.
g = O.start(3); g.planets.forEach(p => { p.spin = 0; }); g.player.angle = Math.PI / 2; O.place(g); O.jump(g);
assert.equal(fly(g), 'lost');
// The course keeps going: planets are added above the one reached.
g = O.start(11);
for (let i = 1; i <= 10; i++) { aimAt(g, i); O.jump(g); assert.equal(fly(g), 'land', `hop ${i}`); }
assert.ok(g.planets.length >= 17);
assert.ok(g.score >= 10);
// Planets further up spin faster.
const far = O.start(5); for (let i = 0; i < 40; i++) O.addPlanet(far);
const avg = list => list.reduce((a, p) => a + Math.abs(p.spin), 0) / list.length;
assert.ok(avg(far.planets.slice(30)) > avg(far.planets.slice(1, 10)));
// The best score is kept in the save.
const data = {}; O.state(data).best = 12; assert.equal(data.storeApps.orbit.best, 12);
for (const lang of ['hu', 'de', 'fr', 'es']) for (const k of O.keys) assert.ok(O.t(k, lang));
assert.equal(O.fmt('Score: %d', 'hu', 5), 'Pontszám: 5');
console.log('Orbit Hopper logic passed: planets, spin, jump, landing, stars, lost in space, the course going on, texts.');
