// 6.0.1 Play Music (mm-music.js) and Play Movies (mm-movies.js): the phone's six songs in Listen Now and My Library (GENRES, ARTISTS, ALBUMS, SONGS),
// an album's songs, playing one (the bottom bar, the now playing screen, pause, next, repeat), Back, Search and the
// phone width.
import assert from 'node:assert/strict';
import {marshmallow,sleep} from './mm-harness.mjs';
const b=await marshmallow();
const text=sel=>b.ev(`document.querySelector(${JSON.stringify(sel)})?.textContent||''`);
const count=sel=>b.ev(`document.querySelectorAll(${JSON.stringify(sel)}).length`);
try{
  await b.language('en');
  for(const width of [1280,390]){
    await b.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<500});
    await b.open('play-music');
    assert.equal(await count('#viewport .mmmu-cards button'),3,'Listen Now shows the three albums');
    await b.act('mmpm-page',{i:'1',kind:''});
    assert.deepEqual(await b.ev(`[...document.querySelectorAll('#viewport .mmmu-tabs button')].map(x=>x.textContent)`),['Genres','Artists','Albums','Songs']);
    assert.equal(await count('#viewport .mmmu-track'),6,'Songs lists the six songs');
    await b.click('#viewport .mmmu-tabs [data-id="albums"]');
    await b.click('#viewport .mmmu-cards [data-name="Small Worlds"]');
    assert.equal(await text('#viewport .mmpm-title'),'Small Worlds');
    assert.equal(await count('#viewport .mmmu-track'),3,'an album lists its songs');
    await b.click('#viewport .mmmu-track[data-id="t5"]');
    assert.match(await text('#viewport .mmmu-now b'),/Sunday Morning/,'the now playing screen');
    assert.equal((await b.save()).music6.playing,true);
    await b.click('#viewport [data-action="mmmu-toggle"]');
    assert.equal((await b.save()).music6.playing,false,'pause');
    await b.click('#viewport [data-action="mmmu-next"]');
    assert.match(await text('#viewport .mmmu-now b'),/Home Again/,'next');
    await b.click('#viewport [data-action="mmmu-repeat"]');
    assert.equal((await b.save()).music6.repeat,1,'repeat all');
    if(width>500) await b.shot('6.0.1-music-player');
    await b.click('#viewport [data-action="mmmu-close"]');
    assert.match(await text('#viewport .mmmu-mini b'),/Home Again/,'the bottom bar keeps the song');
    await b.click('#nav-bar [data-key="back"]').catch(()=>b.act('mm-back'));
    await sleep(300);
    assert.equal(await count('#viewport .mmmu-tabs'),1,'Back leaves the album');
    await b.act('mmpm-search');
    await b.ev(`(()=>{const f=document.querySelector('#viewport .mmpm-sinput');f.value='night';f.dispatchEvent(new Event('input',{bubbles:true}));})()`);
    await sleep(200);
    assert.equal(await count('#viewport .mmmu-track'),1,'Search finds Night Drive');
    if(width>500) await b.shot('6.0.1-music-library');
    // Play Movies: the account's two films in My library; a poster plays the whole film, Back closes the player.
    await b.open('play-movies');await b.act('mmpm-page',{i:'1',kind:''});
    assert.deepEqual(await b.ev(`[...document.querySelectorAll('#viewport .mmmv-card b')].map(x=>x.textContent)`),['Northern Lights','Paper Kites'],'My library lists the two films');
    await b.click('#viewport .mmmv-poster[data-id="m2-3"]');
    assert.ok(await b.ev(`!!document.querySelector('#viewport .mmmv-watch') && +document.querySelector('#viewport .mmmv-seek').max===119*60000`),'a poster plays the film');
    await b.click('#viewport [data-action="mmmv-toggle"]');
    assert.ok(await b.ev(`/play/.test(document.querySelector('#viewport .mmmv-toggle img').src)`),'pause');
    if(width>500) await b.shot('6.0.1-movies-player');
    await b.click('#viewport [data-action="mmmv-close"]');
    assert.equal(await count('#viewport .mmmv-card'),2,'Up returns to the library');
    await b.ev(`(()=>{const k='android-time-machine-mm-v1';const d=JSON.parse(localStorage.getItem(k));delete d.music6;localStorage.setItem(k,JSON.stringify(d));location.reload()})()`);
    await sleep(2500);
  }
  assert.deepEqual(b.errors,[]);
  console.log('6.0.1 Play Music and Movies passed: Listen Now albums, My Library tabs and songs, an album, the player (pause, next, repeat), the bottom bar, Back, Search; the two films and their player; phone width.');
}finally{await b.close();}
