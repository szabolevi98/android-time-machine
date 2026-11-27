require('./lib/vm-strings.cjs');
const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm');
// Lunar Golf's shared rules (store-apps/lunar-golf.js, docs/plans/play-apps.md): the course, the shot, the cup, and
// that every hole can be played: a greedy player trying a grid of pulls holes out within par + 1.
const w = {AndroidI18n: {language: 'en'}};
vm.runInNewContext(fs.readFileSync('store-apps/lunar-golf.js', 'utf8'), w);
const G = w.StoreApps.golf;

assert.equal(G.HOLES.length, 9);
assert.equal(G.PAR, G.HOLES.reduce((a, h) => a + h.par, 0));
// The cup is cut into the ground: two walls and a floor CUP_W wide, under the rim.
for (let n = 0; n < 9; n++) {
  const c = G.course(n);
  assert.ok(c.floor > c.rim, `hole ${n + 1}: the cup goes down`);
  assert.ok(c.cup - G.CUP_W / 2 > 0 && c.cup + G.CUP_W / 2 < G.W, `hole ${n + 1}: the cup is on the course`);
  assert.ok(Math.abs(c.tee - c.cup) > 150, `hole ${n + 1}: the tee is away from the cup`);
}
// A pull shoots the other way; a short pull is no shot; the power stops at the full pull.
assert.equal(G.launch(2, 2), null);
const v = G.launch(-100, 100);
assert.ok(v.vx > 0 && v.vy < 0);
assert.deepEqual(JSON.stringify(G.launch(-1000, 0)), JSON.stringify(G.launch(-160, 0)));
// A ball laid on the tee stays there; one dropped in the cup is sunk; one hit hard off the left edge is out.
const data = {}, g = G.start(data);
let r = ''; for (let i = 0; i < 200 && !r; i++) r = G.advance(g, 1 / 30);
assert.equal(r, 'rest');
const cup = G.start({}); cup.ball = {x: cup.c.cup, y: cup.c.rim + 4, vx: 0, vy: 0};
r = ''; for (let i = 0; i < 200 && !r; i++) r = G.advance(cup, 1 / 30);
assert.equal(r, 'sunk');
const out = G.start({}); Object.assign(out.ball, G.launch(160, 0));
r = ''; for (let i = 0; i < 600 && r !== 'out'; i++) r = G.advance(out, 1 / 30) || r;
assert.equal(r, 'out');

// Every hole can be played.
function play(n) {
  const game = G.start({}); game.c = G.course(n); game.hole = n;
  const tee = game.c.tee; game.ball = {x: tee, y: G.heightAt(game.c.ground, tee) - G.BALL, vx: 0, vy: 0};
  for (let stroke = 1; stroke <= G.HOLES[n].par + 1; stroke++) {
    let best = null;
    for (let a = 0; a <= 180; a += 5) for (let p = 20; p <= 160; p += 10) {
      const rad = a * Math.PI / 180, sim = {c: game.c, ball: {...game.ball}};
      Object.assign(sim.ball, G.launch(Math.cos(rad) * p, Math.sin(rad) * p) || {});
      let res = ''; for (let i = 0; i < 900 && !res; i++) res = G.advance(sim, 1 / 30);
      if (res === 'sunk') return stroke;
      if (res !== 'rest') continue;
      const d = Math.abs(sim.ball.x - game.c.cup);
      if (!best || d < best.d) best = {d, ball: {...sim.ball}};
    }
    if (!best) return 99;
    game.ball = best.ball;
  }
  return 99;
}
for (let n = 0; n < 9; n++) {
  const strokes = play(n);
  assert.ok(strokes <= G.HOLES[n].par + 1, `hole ${n + 1} (par ${G.HOLES[n].par}) took ${strokes}`);
}
// The texts in all five languages.
for (const lang of ['hu', 'de', 'fr', 'es']) for (const k of G.keys) assert.ok(G.t(k, lang));
assert.equal(G.fmt('Hole %1$d of %2$d', 'hu', 3, 9), '3. lyuk / 9');
assert.equal(G.verdict(1, 3, 'en'), 'Hole in one!');
assert.equal(G.verdict(5, 3, 'en'), '2 over par');
console.log('Lunar Golf logic passed: course, shot, cup, out of bounds, every hole playable, texts.');
