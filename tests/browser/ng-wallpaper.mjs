import assert from 'node:assert/strict';
import {nougat,sleep} from './ng-harness.mjs';
const b=await nougat(),click=a=>b.click(`#viewport [data-action="ngwp-${a}"]`),back=()=>b.click('#nav-bar [data-key="back"]');
const set=async i=>{await click('set');await b.click(`#overlay-root [data-action="ngdlg-item"][data-index="${i}"]`);};
const photo=async()=>{await click('photos');await b.click('[data-action="ngdocs-root"][data-root="images"]');await b.click('#viewport .ngdocs-item[data-id^="photo:"]');};
try {
 await b.language('en');await b.open('wallpapers');await photo();assert.equal(await b.ev(`!!document.querySelector('#viewport .ngwp-tile.selected .ngwp-thumb[src^="data:"]')`),true);
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
 for(const lang of ['en','hu','de','fr','es']){await b.language(lang);await b.open('wallpapers');await click('set');await back();await click('live');assert.deepEqual(await b.ev(`[...AndroidStrings.misses]`),[],`${lang}: wallpaper native strings`);}
 await b.send('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:true});await b.open('wallpapers');await sleep(300);await b.shot('7.1.2-wallpaper-phone');assert.equal(await b.ev(`document.documentElement.scrollWidth<=innerWidth+1`),true);
 b.check();console.log('Wallpaper browser checks passed: image picker, pan/crop snapshot, home/lock/both, cancel, persistence, native empty live-wallpaper list, five languages and phone width.');
}catch(error){await b.shot('7.1.2-wallpaper-failure');throw error;}finally{b.close();}
