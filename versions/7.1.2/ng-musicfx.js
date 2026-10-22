/* MusicFX 1.4 ActivityMusic: Theme.Material.Light, music_main/music_eq, 180dp rotated
   SeekBars, 50dp band columns, 15/6dp effect row margins, 170dp strength sliders,
   16dp action-bar switch padding. Preset reverb's spinner stays GONE in this APK. */
(() => {
  'use strict';
  const M=()=>NG.musicFxModel,T=()=>NG.text('musicfx'),U=c=>c.ui.musicFx ||= {pkg:'com.google.android.music'};
  const presetName=(c,n)=>n===10?T().t('ci_extreme'):n===11?T().t('user'):T().t('preset_'+n);
  const frequency=(c,n)=>`${new Intl.NumberFormat(c.locale(),{maximumFractionDigits:0}).format(n>=1000?n/1000:n)} ${n>=1000?'k':''}Hz`;
  const slider=(c,key,value,min,max,disabled,label)=>`<input type="range" data-fx="${key}" min="${min}" max="${max}" step="1" value="${value}" ${disabled?'disabled':''} aria-label="${c.safe(label)}" style="--fx-value:${(value-min)/(max-min)*100}%">`;
  NG.register('musicfx',{
    app:false,statusColor:()=> '#bdbdbd',dialogAccent:()=> '#009688',
    render(c){const u=U(c);if(c.ui.sub){u.pkg=c.ui.sub;c.ui.sub='';}const s=M().state(c,u.pkg),headset=M().headset(c),levels=M().levels(c,u.pkg);u.headset=headset;
      return `<div class="ngfx"><header><h1>${c.safe(T().t('eq_dialog_title'))}</h1><button type="button" data-action="ngfx-enabled" role="switch" aria-checked="${s.enabled}" aria-label="${c.safe(T().t('eq_dialog_title'))}">${NG.settingsSwitch(s.enabled)}</button></header><main><button type="button" class="ngfx-preset" data-action="ngfx-preset" ${s.enabled?'':'disabled'}>${c.safe(presetName(c,s.preset))}<i></i></button><div class="ngfx-eq"><div class="ngfx-levels ${s.enabled?'':'disabled'}"><span>+10 dB</span><span>0 dB</span><span>-10 dB</span></div>${levels.map((value,i)=>`<label class="ngfx-band ${s.enabled?'':'disabled'}"><div>${slider(c,'band:'+i,value,-1000,1000,!s.enabled,frequency(c,M().frequencies[i]))}</div><span>${c.safe(frequency(c,M().frequencies[i]))}</span></label>`).join('')}</div>${['bass','surround'].map(key=>{const label=T().t(key==='bass'?'bass_boost_strength':'virtualizer_strength');return `<div class="ngfx-strength ${s.enabled&&headset?'':'disabled'}" data-action="ngfx-headset"><span>${c.safe(label)}</span>${slider(c,key,s[key],0,1000,!s.enabled||!headset,label)}</div>`;}).join('')}</main></div>`;},
    mount(c,root){root.querySelectorAll('[data-fx]').forEach(el=>el.addEventListener('input',()=>{const u=U(c),[key,index]=el.dataset.fx.split(':');const ok=key==='band'?M().band(c,u.pkg,+index,+el.value):M().strength(c,u.pkg,key,+el.value);if(!ok)return;el.style.setProperty('--fx-value',`${(+el.value- +el.min)/(+el.max- +el.min)*100}%`);if(key==='band')root.querySelector('.ngfx-preset').firstChild.textContent=presetName(c,11);c.save();}));},
    action(name,el,e,c){const u=U(c),s=M().state(c,u.pkg);if(name==='ngfx-enabled'){s.enabled=!s.enabled;c.save();c.render();return true;}if(name==='ngfx-headset'){if(s.enabled&&!M().headset(c))c.toast(T().t('headset_plug'));return true;}if(name==='ngfx-preset'){if(!s.enabled)return true;c.menu(Array.from({length:12},(_,i)=>({label:presetName(c,i),checked:s.preset===i,action:c=>{M().select(c,u.pkg,i);c.save();c.render();}})),el);return true;}return false;},
    tick(c){if(c.ui.view==='musicfx'&&U(c).headset!==M().headset(c))c.render();}
  });
})();
