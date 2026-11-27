require('./lib/vm-strings.cjs');
const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm');
// Pocket Planner's shared logic (store-apps/pocket-planner.js, docs/plans/play-apps.md): the week, the tasks and the texts.
const w = {AndroidI18n: {language: 'en'}};
vm.runInNewContext(fs.readFileSync('store-apps/pocket-planner.js', 'utf8'), w);
const P = w.StoreApps.planner, data = {};
const now = new Date(2026, 10, 27, 15, 0);   // Friday 27 November 2026

// The week starts on Sunday in English (US) and on Monday in the other languages.
assert.equal(P.key(P.weekStart(now, 0, 'en')), '2026-11-22');
assert.equal(P.key(P.weekStart(now, 0, 'hu')), '2026-11-23');
assert.equal(P.key(P.weekStart(now, 1, 'de')), '2026-11-30');
assert.equal(P.key(P.weekStart(now, -1, 'en')), '2026-11-15');
const days = P.week(data, now, 0, 'hu');
assert.equal(days.length, 7);
assert.equal(days.filter(d => d.today).length, 1);
assert.equal(days.find(d => d.today).key, '2026-11-27');
assert.equal(days[0].weekday, 'hétfő');

// Adding trims and limits the text, and refuses an empty one.
assert.equal(P.add(data, '2026-11-27', '   '), null);
const a = P.add(data, '2026-11-27', '  Buy   milk  '), b = P.add(data, '2026-11-27', 'x'.repeat(200)), c = P.add(data, '2026-11-30', 'Call Mom');
assert.equal(a.text, 'Buy milk');
assert.equal(b.text.length, 120);
assert.deepEqual([a.id, b.id, c.id], [1, 2, 3]);
assert.equal(P.week(data, now, 0, 'en').find(d => d.today).tasks.length, 2);
assert.equal(P.week(data, now, 1, 'en')[1].tasks[0].text, 'Call Mom');

// Ticking, editing, counting, clearing the week's completed ones (the next week keeps its own) and deleting.
assert.ok(P.toggle(data, a.id));
assert.deepEqual({...P.counts(data, now, 0, 'en')}, {done: 1, total: 2});
assert.ok(P.edit(data, b.id, 'Water the plants'));
assert.ok(!P.edit(data, b.id, ' '));
P.toggle(data, c.id);
assert.equal(P.clearDone(data, now, 0, 'en'), 1);
assert.deepEqual([...P.state(data).tasks['2026-11-27'].map(t => t.text)], ['Water the plants']);
assert.equal(P.state(data).tasks['2026-11-30'][0].done, true);
assert.ok(P.remove(data, b.id));
assert.equal(P.state(data).tasks['2026-11-27'], undefined, 'an emptied day is dropped from the save');
assert.ok(!P.remove(data, 999));
// A new task after deletions keeps a fresh id.
assert.equal(P.add(data, '2026-11-27', 'New').id, 4);

// The texts in all five languages, and the week's range.
assert.ok(P.keys.length >= 15);
for (const lang of ['hu', 'de', 'fr', 'es']) for (const k of P.keys) assert.ok(P.t(k, lang) && (lang === 'hu' && k === 'Pocket Planner' || P.t(k, lang) !== k || k === 'Pocket Planner'), `${k} in ${lang}`);
assert.equal(P.t('Add task', 'hu'), 'Feladat hozzáadása');
assert.equal(P.fmt('%1$d of %2$d done', 'hu', 1, 3), '3 feladatból 1 kész');
assert.match(P.range(data, now, 0, 'en'), /Nov 22.*28/);
console.log('Pocket Planner logic passed: weeks per language, add / tick / edit / clear / delete, texts.');
