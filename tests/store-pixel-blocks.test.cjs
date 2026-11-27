require('./lib/vm-strings.cjs');
const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm');
// Pixel Blocks' shared rules (store-apps/pixel-blocks.js, docs/plans/play-apps.md): groups, clearing, falling, the
// columns closing up, scoring, the end and the cleared-board bonus.
const w = {AndroidI18n: {language: 'en'}};
vm.runInNewContext(fs.readFileSync('store-apps/pixel-blocks.js', 'utf8'), w);
const B = w.StoreApps.blocks;
const board = cols => ({board: cols.map(c => [...c, ...Array(B.ROWS - c.length).fill(null)]).concat(Array.from({length: B.COLS - cols.length}, () => Array(B.ROWS).fill(null))), score: 0, phase: 'play'});
// A new board is full of the four colours.
const g0 = B.start(1);
assert.equal(g0.board.length, B.COLS);
assert.ok(g0.board.every(col => col.length === B.ROWS && col.every(k => k >= 0 && k < 4)));
// A group is the touching cells of one colour; a lone block cannot be cleared.
let g = board([[0, 0, 1], [0, 2, 1], [3, 3, 3]]);
assert.equal(B.group(g, 0, 0).length, 3);
assert.equal(B.tap(g, 1, 1), 0, 'a lone block stays');
// Clearing the red L: 3 × 2 points, the blocks above fall, the emptied first column closes up.
assert.equal(B.tap(g, 0, 0), 6);
assert.equal(JSON.stringify(g.board[0].slice(0, 2)), JSON.stringify([1, null]));
assert.equal(JSON.stringify(g.board[1].slice(0, 2)), JSON.stringify([2, 1]));
// The yellow pair now touches across the columns; clearing it leaves a single blue … then green.
g = board([[1, 2], [2, 2], [1]]);
assert.equal(B.tap(g, 0, 1), 6);
assert.equal(g.score, 6);
// No group left: the game is over; an emptied board scores the bonus.
g = board([[0, 1], [1, 0]]);
assert.ok(!B.hasMoves(g));
g = board([[2, 2], [2]]);
assert.equal(B.tap(g, 0, 0), 6);
assert.equal(g.phase, 'over'); assert.ok(g.cleared); assert.equal(g.score, 6 + B.BONUS);
// A real game ends: tapping the first group found until none is left.
g = B.start(99); let taps = 0;
while (g.phase === 'play' && taps < 200) { let done = false; for (let x = 0; x < B.COLS && !done; x++) for (let y = 0; y < B.ROWS && !done; y++) if (B.group(g, x, y).length > 1) { B.tap(g, x, y); done = true; } taps++; }
assert.equal(g.phase, 'over'); assert.ok(g.score > 0);
for (const lang of ['hu', 'de', 'fr', 'es']) for (const k of B.keys) assert.ok(B.t(k, lang));
assert.equal(B.fmt('Board cleared! +%d', 'hu', 500), 'Üres tábla! +500');
console.log('Pixel Blocks logic passed: groups, clearing, falling, columns closing up, scoring, the end, the bonus, texts.');
