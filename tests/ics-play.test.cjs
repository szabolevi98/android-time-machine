require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{},Intl};
for(const f of ['play-store.js','ics-play.js'])vm.runInNewContext(fs.readFileSync(`versions/4.0.4/${f}`,'utf8'),context);
const P=context.window.ICSPlay;
const ctx=(o={})=>({lang:'en',locale:'en-US',page:'home',installed:[],everInstalled:[],downloading:'',phase:'',progress:0,plussed:[],autoUpdate:[],prefs:{notify:true,autoUpdate:false,wifiOnly:false,widgets:true,pin:false,pinSet:false,admob:true},history:[],query:'',...o});
// Play Store 3.4.7 is the IMM76I image's Phonesky.apk; texts from its resources in five languages.
assert.equal(P.VERSION,'3.4.7');
assert.equal(P.text('en','DESCRIPTION'),'Description');assert.notEqual(P.text('de','Accept & download'),'Accept & download');
// Home: the TOC's corpus cells (no Magazines yet, "Movies"), each with its watermark and "see more"; the Games tile.
let html=P.render(ctx());
assert.deepEqual([...html.matchAll(/class="icsp-tile ([a-z]+)"/g)].map(m=>m[1]),['apps','music','movies','books']);
assert.match(html,/<b>Movies<\/b>/);assert.doesNotMatch(html,/Magazines|Movies &amp; TV/);assert.match(html,/see more/);assert.match(html,/icsp-games/);
// Details: the byline strings of the APK, +1 with "You +1'd this.", Description / What's new, reviews without sorting.
html=P.render(ctx({page:'detail',selected:'orbit'}));
assert.match(html,/1,000,000\+ downloads/);assert.match(html,/Size: 12MB/);assert.match(html,/>Description</);assert.match(html,/5 stars/);assert.doesNotMatch(html,/Most helpful first|icsp-review-sort/);
assert.match(P.render(ctx({page:'detail',selected:'orbit',plussed:['orbit']})),/You \+1&#39;d this\./);
html=P.render(ctx({page:'detail',selected:'orbit',installed:['orbit']}));assert.match(html,/What&#39;s new[^]*Description/);assert.match(html,/icsp-uninstall-ask/);
assert.match(P.dialog('uninstall',ctx({selected:'orbit'})),/Do you want to uninstall this app\?/);
// The purchase page: Permissions, the framework's groups, Accept & download.
html=P.render(ctx({page:'permissions',selected:'orbit'}));assert.match(html,/Permissions/);assert.match(html,/Network communication/);assert.match(html,/Accept &amp; download/);
// My apps: one list with the "Installed" section header.
assert.match(P.render(ctx({page:'my-apps'})),/icsp-group"><span>Installed<\/span>/);
// Settings (res/layout/settings.xml): Unlock settings (disabled without a PIN), the AdMob note with Learn more, build 3.4.7.
html=P.render(ctx({page:'settings'}));
assert.match(html,/data-action="icsp-unlock" disabled><span><b>Unlock settings/);assert.match(html,/Choose whether to personalize ads from Google and AdMob[^<]*Learn more/);assert.match(html,/Version: 3\.4\.7/);
assert.doesNotMatch(P.render(ctx({page:'settings',prefs:{pinSet:true,admob:true}})),/disabled><span><b>Unlock settings/);
assert.deepEqual([...P.menu(ctx()).map(m=>m.title)],['My apps','Accounts','Settings','Help']);
for(const lang of ['hu','de','fr','es'])for(const page of ['home','settings','my-apps'])assert.doesNotMatch(P.render(ctx({lang,page})),/undefined/);
console.log('ics-play ok');
