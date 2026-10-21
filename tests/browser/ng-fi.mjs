import assert from 'node:assert/strict';
import {nougat} from './ng-harness.mjs';
const b=await nougat(),back=()=>b.click('#nav-bar [data-key="back"]');
const text=sel=>b.ev(`document.querySelector(${JSON.stringify(sel)})?.textContent||''`);
try{
 await b.language('en');await b.open('project-fi');assert.ok((await text('#viewport .ngfi')).includes('Sign up for Project Fi service with nexus6p.demo@gmail.com'));await b.shot('7.1.2-fi-signup');
 await b.click('#viewport .ngfi-link');assert.ok((await text('#viewport .ngfi')).includes('Choose an account'));await back();assert.ok((await text('#viewport .ngfi h1')).includes('Sign up for Project Fi'));
 await b.act('ngfi-web');await b.until(`document.querySelector('#screen').classList.contains('view-chrome')`);
 for(const lang of ['en','hu','de','fr','es']){await b.language(lang);await b.open('project-fi');await b.act('ngfi-choose');await b.act('ngfi-next');assert.deepEqual(await b.ev(`[...AndroidStrings.misses]`),[],lang);}
 await b.send('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:true});await b.open('project-fi');assert.ok(await b.ev(`document.querySelector('#viewport').scrollWidth<=document.querySelector('#viewport').clientWidth+1`));b.check();console.log('Project Fi passed: sign-up page with the account, account chooser, web sign-up, five languages and phone width.');
}catch(error){await b.shot('7.1.2-fi-failure');throw error;}finally{b.close();}
