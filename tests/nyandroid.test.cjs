require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};vm.runInNewContext(fs.readFileSync('versions/4.0.4/nyandroid.js','utf8'),context);
const ny=context.window.ICSNyandroid;
// PlatLogoActivity: 1 + 0.25 n^2 for the four steps, first after two long-press timeouts.
assert.deepEqual([1,2,3,4].map(ny.zoomScale),[1.25,2,3.25,5]);assert.equal(ny.LONG_PRESS,500);
// FlyingCat: depth z = (i / 20)^2 gives scale 0.1-2 and speed 100-1000 device px/s (CSS px are half).
const board={width:360,height:600},random=()=>.5;
const far=ny.cat(0,board,random),near=ny.cat(19,board,random);
assert.ok(Math.abs(far.scale-.1)<1e-9&&Math.abs(far.v-50)<1e-9);
assert.ok(Math.abs(near.scale-(.1+1.9*(19/20)**2))<1e-9&&near.scale>1.6,'the nearest cats are wider than the screen half');
assert.equal(ny.CAT,160);assert.equal(ny.NUM_CATS,20);assert.equal(ny.NUM_STARS,20);
// Cats fly right and re-enter at the left edge once they leave the board.
const item=ny.cat(10,board,random);item.x=board.width+3;ny.step([item],board,.016,random);
assert.ok(item.x<0&&item.y>=0,'reset re-enters from the left');
const moving=ny.cat(10,board,random),x0=moving.x;ny.step([moving],board,.5,random);assert.ok(Math.abs(moving.x-x0-moving.v*.5)<1e-9);
// The original star_anim frames are present: frame 0 is empty, later frames grow.
const png=f=>fs.readFileSync(`versions/4.0.4/assets/${f}`);
assert.ok(png('star0.png').length<png('star3.png').length,'star frames are not blank copies');
console.log('Nyandroid checks passed: stepped logo zoom, cat depth, size and speed, re-entry and star frames.');

// Native AnimationDrawable cadence: the hands/body use twelve 80 ms bitmaps, stars six 200 ms bitmaps.
assert.deepEqual([0,79,80,879,880,959,960].map(ny.droidFrame),[0,0,1,10,11,11,0]);
assert.deepEqual([0,199,200,999,1000,1199,1200].map(ny.starFrame),[0,0,1,4,5,5,0]);
const crypto=require('node:crypto');
for(const [prefix,count]of [['nyandroid',12],['star',6]]){const frames=Array.from({length:count},(_,i)=>crypto.createHash('sha256').update(png(prefix+(prefix==='nyandroid'?String(i).padStart(2,'0'):i)+'.png')).digest('hex'));assert.equal(new Set(frames).size,count,`${prefix}: distinct native bitmap frames`);}
