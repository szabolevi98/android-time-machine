require('./lib/vm-strings.cjs');
const engineSource = require('./lib/engine-source.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// 5.1.1 navigation bar search panel (SearchPanelView / SearchPanelCircleView android-5.1.1_r9): the dimens, the circle's
// position, the rubber band, the Google app's assist icon; it launches Google Now in all three Jelly Bean+ simulators.
const w={window:{}};vm.runInNewContext(fs.readFileSync('versions/5.1.1/lp-search.js','utf8'),w);const P=w.window.JBSearchPanel;
assert.equal(P.S.size,88*.906);assert.equal(P.S.threshold,100*.906);assert.equal(P.S.up,48*.906);assert.equal(P.S.vibrate,10);
assert.deepEqual(JSON.parse(JSON.stringify(P.centre(400,700,P.S.travel))),{x:200,y:700-160*.906});
assert.ok(Math.abs(P.rubberband(-32)-Math.pow(32,.6))<1e-9);
assert.ok(Math.abs(P.EASE.fastOutSlowIn(.5)-.5)>.1&&P.EASE.appear(1)>.999);
assert.ok(P.markup(k=>k).includes('assets/lps-ic_google_logo.png')&&fs.existsSync('versions/5.1.1/assets/lps-ic_google_logo.png'));
for(const v of ['4.3','4.4.4','5.1.1'])assert.ok(engineSource(v).includes("onLaunch: () => { ui.overlay = ''; renderOverlay(); openApp('google-search'); },"),v);
assert.ok(fs.readFileSync('versions/4.4.4/kk-search.js','utf8').includes('vibrate?.(10)')&&fs.readFileSync('versions/4.3/jb-search.js','utf8').includes('vibrate?.(7)'));
console.log('lp-search ok');
