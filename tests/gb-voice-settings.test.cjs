require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// 2.3.6 Voice input & output: VoiceInputOutputSettings with the one recognizer, VoiceSearch 2.1.3's settings, the microphones.
const dir='versions/2.3.6/',html=fs.readFileSync(dir+'index.html','utf8');
assert.ok(html.indexOf('gb-voice-settings.js')<html.indexOf('gb-settings.js?'));
const c={window:{}};vm.createContext(c);for(const f of ['gb-settings-strings.js','gb-voice-settings.js','gb-settings.js'])vm.runInContext(fs.readFileSync(dir+f,'utf8'),c);
const V=c.window.GBVoiceSettings,G=c.window.GBSettings;
assert.equal(V.languages.length,134);assert.equal(V.text('hu','prefTitle_safeSearch'),'SafeSearch');assert.equal(V.text('de','prefTitle_language'),'Sprache');
assert.ok(!V.text('en','personalization_popup_message').includes('START_LINK'));
const ctx=lang=>({settings:{},lang,t:k=>k,about:{},cred:{}});
const voice=G.render('voice',ctx('en')).html;assert.ok(voice.includes('Voice input')&&voice.includes("Settings for &#39;Google&#39;")&&voice.includes('Voice output'));
const rec=G.render('voice-recognizer',ctx('hu')).html;assert.ok(rec.includes('Google voice recognition settings')&&rec.includes('Default - Hungarian (Hungary)')&&rec.includes('Moderate — Filter explicit images only<br>Applies only to Google search by voice')&&rec.includes('gbvs-personal'));
const sim=require('./lib/engine-source.cjs')('2.3.6');assert.ok(sim.includes("case 'voice-search': openApp('voice-search'); break;")&&!sim.includes('Voice search unavailable offline'));
console.log('gb-voice-settings ok');
