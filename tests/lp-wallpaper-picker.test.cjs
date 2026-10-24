require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};
vm.runInNewContext(fs.readFileSync('versions/5.1.1/lp-wallpaper-picker.js','utf8'),context);
const W=context.window.KKWallpaperPicker;
// Pick image itself is DocumentsUI's GET_CONTENT picker (tests/lp-docpicker.test.cjs).
assert.equal(W.openFrom,undefined);
for(const f of ['ldu-ic_hamburger.png','ldu-ic_menu_overflow.png'])assert.ok(fs.existsSync('versions/5.1.1/assets/'+f),f);
console.log('lp-wallpaper-picker ok');
