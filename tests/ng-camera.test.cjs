const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {test} = require('node:test');

// Exercise capture and activity lifetime with a deterministic clock, including navigating away
// and returning before the old countdown's next second (a stale callback must never take a photo).
function phone() {
  let now = 10000, next = 0, camera;
  const intervals = new Map(), timeouts = new Map();
  const c = {data: {photos: []}, ui: {view: 'camera'}, el: {viewport: {querySelector: () => null}},
    save() {}, render() {}, safe: String};
  const NG = {text: () => ({t: x => x}), register: (id, mod) => { camera = mod; },
    media: {photos: c => c.data.photos, add(c, item) { c.data.photos.push(item); }}};
  vm.runInNewContext(fs.readFileSync('versions/7.1.2/ng-camera.js', 'utf8'), {
    NG, Date: {now: () => now},
    setInterval: fn => { intervals.set(++next, fn); return next; }, clearInterval: id => intervals.delete(id),
    setTimeout: fn => { timeouts.set(++next, fn); return next; }
  });
  return {c, camera, intervals, action: (name, data = {}) => camera.action(`ngcm-${name}`, {dataset: data}, null, c),
    advance(ms) { now += ms; }, second() { now += 1000; for (const fn of [...intervals.values()]) fn(); }};
}

test('Nougat Camera captures a photo and keeps front/back selection', () => {
  const p = phone(); p.action('switch'); p.action('shutter');
  assert.equal(p.c.data.photos.length, 1);
  assert.equal(p.c.data.photos[0].kind, 'photo');
  assert.equal(p.c.data.photos[0].front, true);
});

test('timer takes exactly one picture, ignores repeated shutter and blocks mode changes', () => {
  const p = phone(); p.action('pick', {o: 'timer', v: '3'}); p.action('shutter');
  p.action('shutter'); p.action('flip');
  assert.equal(p.c.data.camera.mode, 'photo');
  p.second(); p.second(); assert.equal(p.c.data.photos.length, 0);
  p.second(); p.second(); assert.equal(p.c.data.photos.length, 1);
  assert.equal(p.intervals.size, 0);
});

test('Back cancels countdown; leaving and immediately returning cannot revive it', () => {
  const p = phone(); p.action('pick', {o: 'timer', v: '3'}); p.action('shutter');
  assert.equal(p.camera.back(p.c), true); assert.equal(p.intervals.size, 0);
  p.action('shutter'); p.camera.unmount(p.c);
  p.c.ui.view = 'home'; p.c.ui.view = 'camera';
  for (let i = 0; i < 4; i++) p.second();
  assert.equal(p.c.data.photos.length, 0); assert.equal(p.c.ui.camera.count, 0);
});

test('video excludes paused time and is saved once when leaving the app', () => {
  const p = phone(); p.action('flip'); p.action('shutter'); p.advance(2500);
  p.action('pause'); p.advance(8000); p.action('pause'); p.advance(1500);
  p.camera.unmount(p.c); p.camera.unmount(p.c);
  assert.equal(p.c.data.photos.length, 1);
  assert.equal(p.c.data.photos[0].kind, 'video'); assert.equal(p.c.data.photos[0].duration, 4000);
  assert.equal(p.intervals.size, 0); assert.equal(p.camera.keepAwake(p.c), false);
});

test('Back stops a paused video with its elapsed duration', () => {
  const p = phone(); p.action('flip'); p.action('shutter'); p.advance(1200);
  p.action('pause'); p.advance(6000); assert.equal(p.camera.back(p.c), true);
  assert.equal(p.c.data.photos[0].duration, 1200); assert.equal(p.intervals.size, 0);
});

test('slow motion selects the rear camera and saves the selected frame rate', () => {
  const p = phone(); p.action('switch'); p.action('mode', {m: 'slomo'}); p.action('hfr');
  p.action('shutter'); p.advance(1000); p.action('shutter');
  assert.equal(p.c.data.photos[0].front, false); assert.equal(p.c.data.photos[0].fps, 120);
});
