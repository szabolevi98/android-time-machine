import assert from 'node:assert/strict';
import {nougat,sleep} from './ng-harness.mjs';
const b=await nougat(),click=a=>b.click(`#viewport [data-action="ngwp-${a}"]`),back=()=>b.click('#nav-bar [data-key="back"]');
const set=async i=>{await click('set');await b.click(`#overlay-root [data-action="ngdlg-item"][data-index="${i}"]`);};
const photo=async()=>{await click('photos');await b.click('[data-action="ngdocs-root"][data-root="images"]');await b.click('#viewport .ngdocs-item[data-id^="photo:"]');};
const labels={en:['Home screen','Lock screen','Home screen and lock screen'],hu:['Kezdőképernyő','Lezárási képernyő','Kezdőképernyő és lezárási képernyő'],de:['Startbildschirm','Sperrbildschirm','Start- und Sperrbildschirm'],fr:["Écran d'accueil",'Écran de verrouillage',"Écran d'accueil et écran de verrouillage"],es:['Pantalla de inicio','Pantalla de bloqueo','Pantalla de inicio y de bloqueo']};
const tap=async selector=>{const p=await b.ev(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect(),s=e.closest('.ngwp-strip').getBoundingClientRect(),x=(Math.max(r.left,s.left)+Math.min(r.right,s.right))/2,y=r.top+r.height/2;return x>=s.left&&x<=s.right&&r.right>s.left&&r.left<s.right&&document.elementFromPoint(x,y)?.closest(${JSON.stringify(selector)})?[x,y]:null;})()`);assert.ok(p,`${selector}: tile is visibly reachable`);for(const type of ['mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,x:p[0],y:p[1],button:'left',buttons:type==='mousePressed'?1:0,clickCount:1});};
try {
 await b.language('en');await b.open('wallpapers');
 // Real mouse gestures expose the tiles that DOM .click() can select while still offscreen.
 await b.drag('.ngwp-strip',-180,0);await b.drag('.ngwp-strip',-120,0);
 assert.ok(await b.ev(`document.querySelector('.ngwp-strip').scrollLeft>200`),'mouse drag scrolls the wallpaper strip');
 assert.equal(await b.ev(`document.querySelector('.ngwp-tile.selected').dataset.action`),'ngwp-default','drag does not select a tile');
 await tap('.ngwp-tile[data-res="wp_003"]');
 assert.ok(await b.ev(`document.querySelector('.ngwp-strip').scrollLeft>200`),'selection preserves strip position');
 await b.drag('.ngwp-strip',-100,0);await tap('.ngwp-tile[data-res="wp_004"]');
 assert.equal(await b.ev(`document.querySelector('.ngwp-tile.selected').dataset.res`),'wp_004','fourth bundled image is reachable');
 const wheel=await b.ev(`(()=>{const r=document.querySelector('.ngwp-strip').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()`);
 await b.send('Input.dispatchMouseEvent',{type:'mouseWheel',...wheel,deltaX:0,deltaY:-1000});await sleep(150);
 assert.equal(await b.ev(`document.querySelector('.ngwp-strip').scrollLeft`),0,'mouse wheel returns to the first tiles');
 await photo();assert.equal(await b.ev(`!!document.querySelector('#viewport .ngwp-tile.selected .ngwp-thumb[src^="data:"]')`),true);
 await b.drag('.ngwp-crop',-60,15);await set(0);
 let data=await b.save();assert.equal(data.wallpapers.home.kind,'photo');assert.equal(data.wallpapers.lock.kind,'default','home-only preserves the previous lock wallpaper');assert.ok(data.wallpapers.home.x>50);assert.ok(data.wallpapers.home.image.startsWith('data:image/svg+xml'));
 assert.equal(await b.ev(`getComputedStyle(document.querySelector('#screen')).backgroundImage.includes('data:image/svg+xml')`),true);
 // The photo wallpaper decodes as an image (its SVG carries the namespace).
 assert.equal(await b.ev(`(async()=>{const i=new Image();i.src=NG.wallpaper.image(JSON.parse(localStorage.getItem('android-time-machine-ng-v1')).wallpapers.home);try{await i.decode();return i.naturalWidth>0;}catch{return false;}})()`),true,'photo wallpaper decodes');
 await b.open('lock');assert.equal(await b.ev(`getComputedStyle(document.querySelector('.nglk-wall')).backgroundImage.includes('fw-default_wallpaper')`),true);
 await b.open('wallpapers');await click('default');await set(1);assert.equal((await b.save()).wallpapers.home.kind,'photo');assert.equal((await b.save()).wallpapers.lock.kind,'default');
 await b.open('wallpapers');await photo();await set(2);data=await b.save();assert.deepEqual(data.wallpapers.home,data.wallpapers.lock,'both targets receive the same crop');
 await b.open('wallpapers');await click('default');await back();await b.open('wallpapers');assert.equal(await b.ev(`!!document.querySelector('.ngwp-tile.selected .ngwp-thumb[src^="data:"]')`),true,'cancel discards an unapplied selection');
 // GoogleHome's four bundled wallpapers follow My photos and the default, in array/wallpapers order.
 await b.open('wallpapers');assert.deepEqual(await b.ev(`[...document.querySelectorAll('#viewport .ngwp-tile')].map(x=>x.dataset.action+(x.dataset.res?':'+x.dataset.res:''))`),['ngwp-photos','ngwp-default','ngwp-bundled:wp_001','ngwp-bundled:wp_002','ngwp-bundled:wp_003','ngwp-bundled:wp_004','ngwp-current','ngwp-live']);
 assert.equal(await b.ev(`Promise.all([...document.querySelectorAll('#viewport .ngwp-tile[data-res] img')].map(i=>i.decode().then(()=>i.naturalWidth>0,()=>i.src)))`).then(a=>a.every(x=>x===true)),true,'every bundled tile loads');
 await b.click('#viewport [data-action="ngwp-bundled"][data-res="wp_003"]');await set(2);data=await b.save();assert.equal(data.wallpapers.home.res,'wp_003');assert.equal(data.wallpapers.lock.res,'wp_003');
 assert.equal(await b.ev(`getComputedStyle(document.querySelector('#screen')).getPropertyValue('--ng-wallpaper').includes('ghome-wp_003.jpg')`),true);
 await b.open('wallpapers');await photo();await set(2);data=await b.save();await b.open('wallpapers');await sleep(400);await b.shot('7.1.2-wallpaper-picker');
await click('live');assert.equal(await b.ev(`document.querySelector('#viewport').textContent.includes('No live wallpapers.')`),true);assert.deepEqual(await b.ev(`NG.liveWallpaperServices`),[],'the image installs no live wallpaper service');await back();
 await b.ev('location.reload()');await b.until(`document.querySelector('#screen')?.classList.contains('view-home')`);assert.equal((await b.save()).wallpapers.home.image,data.wallpapers.home.image,'wallpaper snapshot survives reload');
 for(const lang of ['en','hu','de','fr','es']){await b.language(lang);await b.open('wallpapers');await click('set');assert.deepEqual(await b.ev(`[...document.querySelectorAll('#overlay-root .ngdlg-item')].map(x=>x.textContent)`),labels[lang],`${lang}: visible wallpaper destination labels`);if(lang==='en'){await sleep(250);await b.shot('7.1.2-wallpaper-destinations');}await back();await click('live');assert.deepEqual(await b.ev(`[...AndroidStrings.misses]`),[],`${lang}: wallpaper native strings`);}
 await b.send('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:true});await b.open('wallpapers');await sleep(300);await b.shot('7.1.2-wallpaper-phone');assert.equal(await b.ev(`document.documentElement.scrollWidth<=innerWidth+1`),true);
 await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
 const touch=await b.ev(`(()=>{const r=document.querySelector('.ngwp-strip').getBoundingClientRect();return {x:r.left+r.width*.8,y:r.top+r.height/2};})()`);
 await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...touch,id:1}]});
 for(let i=1;i<=8;i++){await b.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:touch.x-i*20,y:touch.y,id:1}]});await sleep(20);}
 await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await sleep(250);
 assert.ok(await b.ev(`document.querySelector('.ngwp-strip').scrollLeft>80`),'phone touch swipe scrolls the strip');
 b.check();console.log('Wallpaper browser checks passed: visible destination labels in five languages, real mouse drag/wheel and phone touch scrolling, image picker, pan/crop snapshot, home/lock/both, cancel, persistence and native empty live-wallpaper list.');
}catch(error){await b.shot('7.1.2-wallpaper-failure');throw error;}finally{b.close();}
