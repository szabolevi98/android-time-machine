const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function fixture(storage={getItem(){return null;},setItem(){}}){
 const images=[],window={matchMedia:()=>({matches:true})};
 class Image{set src(value){this.url=value;images.push(this);}decode(){return new Promise(resolve=>this.decoded=resolve);}}
 const document={baseURI:'https://example.test/versions/7.1.2/',readyState:'complete',querySelector:()=>null,styleSheets:[],createElement:()=>({content:{querySelectorAll:()=>[]}})};
 vm.runInNewContext(fs.readFileSync('boot-ready.js','utf8'),{window,sessionStorage:storage,document,Image,URL,Promise,setTimeout,clearTimeout});
 return{boot:window.AndroidBoot,images};
}
test('reduced motion and unavailable private storage never suppress a fresh boot',()=>{
 const {boot}=fixture({getItem(){throw new Error('blocked');},setItem(){throw new Error('blocked');}});
 assert.equal(boot.shouldBoot('7.1.2'),true);assert.doesNotThrow(()=>boot.complete('7.1.2'));
});
test('a tab is remembered only after the boot completes',()=>{
 const data={}, {boot}=fixture({getItem:k=>data[k],setItem:(k,v)=>data[k]=v});
 assert.equal(boot.shouldBoot('6.0.1'),true);assert.equal(boot.shouldBoot('6.0.1'),true);
 boot.complete('6.0.1');assert.equal(boot.shouldBoot('6.0.1'),false);assert.equal(boot.shouldBoot('4.0.4'),true);
});
test('readiness waits for decoded launcher pictures, not only their network load',async()=>{
 const {boot,images}=fixture();let released=false;
 const ready=boot.prepare({images:['assets/calculator.png','assets/maps.png']}).then(()=>released=true);
 assert.equal(images.length,2);images.forEach(image=>image.onload());await Promise.resolve();
 assert.equal(released,false);assert.equal(boot.state.status,'loading');
 images[0].decoded();await Promise.resolve();assert.equal(released,false);
 images[1].decoded();await ready;assert.equal(boot.state.status,'ready');assert.equal(boot.state.failed.length,0);
});
