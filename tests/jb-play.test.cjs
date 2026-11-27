require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{},Intl};
for(const f of ['play-store.js','jb-play.js'])vm.runInNewContext(fs.readFileSync(`versions/4.3/${f}`,'utf8'),context);
const P=context.window.JBPlay;
const ctx=(o={})=>({lang:'en',locale:'en-US',page:'home',installed:[],everInstalled:[],downloading:'',phase:'',progress:0,plussed:[],autoUpdate:[],wishlist:[],rated:{},prefs:{notify:true,shortcuts:true,password:false,autoMode:'wifi'},history:[],...o});
// Play Store 4.2.3 is the JWR66Y image's Phonesky.apk; no navigation drawer before 4.4.
assert.equal(P.VERSION,'4.2.3');
// Texts come from the APK in the five languages (docs/templates/jb-play.template.js through docs/tools/apk-strings.py).
assert.equal(P.text('hu','My apps'),'Alkalmazásaim');assert.equal(P.text('de','Auto-add shortcuts'),'Verknüpfungen automatisch hinzufügen');
assert.equal(P.text('en','Installed '),'Installed');
// Home: the six corpus links, clusters with the "%d MORE" / "SEE MORE" box (CardListAdapter), the promo banner.
let html=P.render(ctx());
assert.deepEqual([...html.matchAll(/class="jbp-cat ([a-z]+)"/g)].map(m=>m[1]),['apps','games','movies','music','books','magazines']);
assert.match(html,/Albums from \$3\.99/);assert.match(html,/\d MORE<\/em>/);assert.match(html,/Get Unlimited Music/);assert.doesNotMatch(html,/drawer/);
assert.match(P.render(ctx({lang:'hu'})),/Magazinok/);
// Corpus pages: action_bar_bg_apps (#96AA39 over #819231), the tab strip with Featured selected, listing rows.
html=P.render(ctx({page:'section',section:'apps',tab:'Featured'}));assert.match(html,/--bar:#96AA39;--edge:#819231/);assert.match(html,/class="on" data-action="jbp-tab" data-id="Featured">FEATURED/);assert.match(html,/Phone Highlights/);
// Lunar Golf is free since it works (docs/plans/play-apps.md): Top Free lists it, Top Paid no longer does.
html=P.render(ctx({page:'section',section:'games',tab:'Top Free'}));assert.match(html,/<b>Lunar Golf<\/b>/);assert.doesNotMatch(P.render(ctx({page:'section',section:'games',tab:'Top Paid'})),/<b>Lunar Golf<\/b>/);
// Details: INSTALL or BUY, OPEN / UNINSTALL once installed; owned apps list What's new first and get Rate & review.
html=P.render(ctx({page:'detail',selected:'orbit'}));assert.match(html,/jbp-btn buy[^>]*>INSTALL</);assert.doesNotMatch(html,/Rate &amp; review/);assert.match(html,/Description[^]*What&#39;s new/);assert.match(html,/Reviews/);assert.match(html,/1,000,000\+ downloads/);
assert.match(html,/jbp-ab wish/);
assert.match(P.render(ctx({page:'detail',selected:'movie-quiet'})),/>BUY \$2\.99</);assert.match(P.render(ctx({page:'detail',selected:'lunar-golf'})),/jbp-btn buy[^>]*>INSTALL</);
html=P.render(ctx({page:'detail',selected:'orbit',installed:['orbit']}));assert.match(html,/>OPEN</);assert.match(html,/>UNINSTALL</);assert.match(html,/Rate &amp; review/);assert.match(html,/What&#39;s new[^]*Description/);
html=P.render(ctx({page:'detail',selected:'orbit',downloading:'orbit',phase:'downloading',progress:.5}));assert.match(html,/width:50%/);assert.match(html,/>50%</);
// Dialogs: permissions (framework group labels) with ACCEPT, the card overflow, auto-update, review, content filter.
html=P.dialog('perms',ctx({target:'orbit'}));assert.match(html,/<b>Orbit Hopper<\/b> needs access to:/);assert.match(html,/Network communication/);assert.match(html,/ACCEPT/);
html=P.dialog('card',ctx({target:'movie-quiet'}));assert.match(html,/Add to wishlist/);assert.match(html,/Buy \$2\.99/);
assert.match(P.dialog('card',ctx({target:'lunar-golf',wishlist:['lunar-golf']})),/Remove from wishlist/);
html=P.dialog('auto',ctx());assert.match(html,/Do not auto-update apps/);assert.match(html,/data-id="wifi" role="radio" aria-checked="true"/);
assert.match(P.dialog('rate',ctx({target:'orbit',rateDraft:4})),/Rate it![^]*Above average/);
assert.match(P.dialog('filter',ctx()),/Allow apps rated for[^]*High maturity[^]*Show all apps/);
// My apps, wishlist, settings (res/xml/settings.xml), the overflow (MainActivity.onCreateOptionsMenu).
html=P.render(ctx({page:'my-apps'}));assert.match(html,/Up to date/);assert.match(html,/INSTALLED/);
assert.match(P.render(ctx({page:'wishlist'})),/There are no items in your wishlist/);assert.match(P.render(ctx({page:'wishlist',wishlist:['mag-trail']})),/Trail &amp; Summit/);
html=P.render(ctx({page:'settings'}));assert.match(html,/Auto-update apps over Wi-Fi only/);assert.match(html,/Auto-add shortcuts/);assert.match(html,/Use password to restrict purchases/);assert.match(html,/Version: 4\.2\.3/);assert.match(html,/holo_light/);
assert.deepEqual([...P.menu(ctx()).map(m=>m.title)],['My apps','My wishlist','Redeem','Accounts','Settings','Help']);
assert.deepEqual([...P.menu(ctx({page:'detail',selected:'orbit'})).map(m=>m.title)],['My apps','Share','My wishlist','Redeem','Accounts','Settings','Help']);
console.log('jb-play ok');
