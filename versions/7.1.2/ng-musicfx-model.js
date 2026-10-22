/* N2G48C libbundlewrapper.so: EffectBundle.h's five-band soft presets and frequencies.
   MusicFX ControlPanelEffect's per-calling-package defaults and user preset, in millibels. */
(() => {
  'use strict';
  const frequencies=[60,230,910,3600,14000];
  const names=['Normal','Classical','Dance','Flat','Folk','Heavy Metal','Hip Hop','Jazz','Pop','Rock'];
  const presets=[[3,0,0,0,3],[5,3,-2,4,4],[6,0,2,4,1],[0,0,0,0,0],[3,0,0,2,-1],[4,1,9,3,0],[5,3,0,1,3],[4,2,-2,2,5],[-1,2,5,1,-2],[5,3,-1,3,5]].map(a=>a.map(v=>v*100));
  const extreme=[0,800,400,100,1000],clamp=(v,min,max)=>Math.max(min,Math.min(max,Math.round(Number(v)||0)));
  NG.defaults.musicFx={};
  const state=(c,pkg='com.google.android.music')=>(c.data.musicFx ||= {})[pkg] ||= {enabled:false,preset:10,user:[0,0,0,0,0],bass:667,surround:0};
  const levels=(c,pkg)=>{const s=state(c,pkg);return [...(s.preset<10?presets[s.preset]:s.preset===10?extreme:s.user)];};
  const headset=c=>!!c.data.settings.wiredHeadset||!!(c.data.settings.bluetooth&&NG.system.btDevices(c).some(d=>d.connected&&d.profiles.includes('a2dp')));
  const select=(c,pkg,preset)=>{if(!Number.isInteger(preset)||preset<0||preset>11)return false;state(c,pkg).preset=preset;return true;};
  function band(c,pkg,index,value){const s=state(c,pkg);if(!s.enabled||!Number.isInteger(index)||index<0||index>4)return false;if(s.preset!==11)s.user=levels(c,pkg);s.preset=11;s.user[index]=clamp(value,-1000,1000);return true;}
  function strength(c,pkg,key,value){const s=state(c,pkg);if(!s.enabled||!headset(c)||!['bass','surround'].includes(key))return false;s[key]=clamp(value,0,1000);return true;}
  // The simulator uses a media clock. This is its effect-session parameter state, not a Web Audio DSP graph.
  NG.musicFxModel={frequencies,names,state,levels,select,band,strength,headset,parameters(c,pkg){const s=state(c,pkg),headphones=headset(c);return {enabled:s.enabled,bands:s.enabled?levels(c,pkg):[0,0,0,0,0],bass:s.enabled&&headphones?s.bass:0,surround:s.enabled&&headphones?s.surround:0};}};
})();
