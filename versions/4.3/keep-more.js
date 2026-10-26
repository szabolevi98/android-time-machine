/* 4.3 Keep 1.0.81 from the mako image: settings.xml (1/2), editor_settings.xml (3),
   editor_audio_player.xml and the package's SEND menus. Audio notes use the simulator's local timed recording model;
   a small deterministic WAV is the demo recording, rather than microphone input or a speech service. */
(() => {
  'use strict';
  const ERA = 'jb', PREFIX = 'kp', VERSION = 'Keep 1.0.81';
  const e = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const text = (c,k) => { const row=window.StockStrings?.keep?.[k];return row?AndroidStrings.pick(row,String(c.locale||'en').slice(0,2),k):c.t(k); };
  const current = c => (c.data.keepNotes||[]).find(n=>n.id===c.ui.keepNote);
  const noteText = n => [n.text,...(n.list||[]).map(i=>`${i.checked?'☑':'☐'} ${i.text}`)].filter(Boolean).join('\n');
  const clone = v => JSON.parse(JSON.stringify(v));
  const id = () => 'k'+Date.now()+'-'+Math.random().toString(36).slice(2,7);
  let recording = null, player = null, timer = 0;
  const clock = seconds => `${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;
  function stop() { if(player){player.pause();player=null;}clearInterval(timer);timer=0; }
  function leave(ui) { stop();if(recording){clearTimeout(recording.timer);recording=null;}ui.kpScreen=''; }
  // Same timed demo as SoundRecorder.sample, with PCM bytes so a saved note can also be replayed after reload.
  function sample(seconds) {
    const rate=8000,count=Math.round(seconds*rate),b=new Uint8Array(44+count),v=new DataView(b.buffer),put=(at,s)=>[...s].forEach((ch,i)=>b[at+i]=ch.charCodeAt(0));
    put(0,'RIFF');v.setUint32(4,36+count,true);put(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate,true);v.setUint16(32,1,true);v.setUint16(34,8,true);put(36,'data');v.setUint32(40,count,true);
    for(let i=0;i<count;i++){const t=i/rate,env=Math.sin(Math.PI*i/count)**2*(.2+.8*Math.sin(t*7)**2);b[44+i]=128+Math.round(24*env*(Math.sin(t*2*Math.PI*220)+.4*Math.sin(t*2*Math.PI*440)));}
    let bytes='';for(const x of b)bytes+=String.fromCharCode(x);return {name:'AUD_'+Date.now()+'.wav',mime:'audio/wav',duration:seconds,dataUrl:'data:audio/wav;base64,'+btoa(bytes)};
  }
  function badge(c,n) { return n.audio?`<span class="kpm-card-audio"><img src="assets/${PREFIX}-${ERA==='lp'?'ic_material_mic_dark':'ic_mic_dark'}.png" alt="">${e(text(c,'Voice recording'))} · ${clock(n.audio.duration)}</span>`:''; }
  function audio(c,n) {
    if(!n.audio)return '';
    const k=key=>text(c,key),playing=!!player&&c.ui.kpPlaying===n.id;
    return `<div class="kpm-audio" data-kpm-audio><button type="button" data-action="kp-play" aria-label="${e(k('Play'))}" aria-pressed="${playing}"><img src="assets/${PREFIX}-${playing?'pause':'play'}.png" alt=""></button><progress data-kpm-progress max="${n.audio.duration}" value="0"></progress><span>${clock(n.audio.duration)}</span><button type="button" data-action="kp-audio-remove" aria-label="${e(k('Remove voice recording?'))}"><img src="assets/${PREFIX}-${ERA==='lp'?'ic_material_delete_dark':'ic_delete_dark'}.png" alt=""></button></div>`;
  }
  function page(c,title,body) { return `<div class="app-view sa-app sa-keep kpm kpm-${ERA}"><header class="sa-bar"><button class="sa-up" data-action="kp-back" aria-label="${e(c.t('Back'))}"><img src="assets/keep.png" alt=""></button><b class="sa-title">${e(title)}</b></header><div class="sa-scroll">${body}</div></div>`; }
  const row = (c,action,key,sub='') => `<button class="kpm-row" data-action="${action}"><span>${e(text(c,key))}${sub?`<small>${e(sub)}</small>`:''}</span></button>`;
  function screen(c) {
    const k=key=>text(c,key),s=c.ui.kpScreen;
    if(s==='share')return page(c,k(ERA==='lp'?'Send note':'Share note'),['gmail','email'].map(app=>`<button class="kpm-row" data-action="kp-send" data-id="${app}"><img src="assets/${app}.png" alt="">${e(c.t(app==='gmail'?'Gmail':'Email'))}</button>`).join(''));
    if(s==='about')return page(c,k('About Google Keep'),`<div class="kpm-about"><img src="assets/keep.png" alt=""><h2>${e(k('Keep'))}</h2><p>${e(AndroidStrings.format(k('Version %s'),VERSION.split(' ').at(-1)))}</p></div>`);
    if(s==='account')return page(c,k('Switch accounts'),`<button class="kpm-row" data-action="kp-back">${e(c.account||'demo@android.local')}</button>`);
    if(s==='remove-audio')return page(c,k('Remove voice recording?'),row(c,'kp-audio-delete','Delete')+row(c,'kp-back','Cancel'));
    const sync=c.data.settings.autoSync!==false&&!c.data.settings.syncOff?.Keep;
    return page(c,k('Settings'),(ERA==='jb'?row(c,'kp-account','Switch accounts'):'')+row(c,'kp-sync',sync?'Sync is on':'Sync is off',c.account)+row(c,'kp-about','About Google Keep')+row(c,'kp-website','You can see your notes at',k('drive.google.com/keep')));
  }
  // AccountSyncSettings launched with Keep's authority filter: only this package's sync checkbox is displayed.
  function syncPage(c) {
    const on=c.data.settings.autoSync!==false&&!c.data.settings.syncOff?.Keep;
    return `<div class="detail-pad"><h3>${e(c.account)}</h3></div><button class="settings-row" data-action="kp-sync-toggle" data-id="Keep" role="checkbox" aria-checked="${on}"><span class="row-copy">${e(text(c,'Keep'))}</span><img class="holo-checkbox" src="assets/btn_check_${on?'on':'off'}_holo_dark.png" alt=""></button>`;
  }
  function back(c) {
    if(c.ui.kpScreen==='record'){leave(c.ui);c.render();return true;}
    if(c.ui.kpScreen){stop();c.ui.kpScreen=['about','account'].includes(c.ui.kpScreen)?'settings':'';c.render();return true;}
    return false;
  }
  function finish(c,token) {
    if(recording!==token)return;
    clearTimeout(token.timer);recording=null;
    if(c.ui.view!=='keep'||c.ui.kpScreen!=='record')return;
    const duration=Math.max(.3,Math.min(5,(Date.now()-token.start)/1000)),n={id:id(),text:'',color:0,audio:sample(duration)};
    (c.data.keepNotes||=[]).unshift(n);c.ui.keepNote=n.id;c.ui.sub='note';c.ui.kpScreen='';c.save();c.render();
  }
  function handle(action,value,c) {
    const {ui,data}=c,n=current(c);
    if(!action.startsWith('kp-'))return false;
    if(action==='kp-record'){stop();const token={start:Date.now()};recording=token;ui.voiceState='';ui.kpScreen='record';token.timer=setTimeout(()=>finish(c,token),5000);}
    else if(action==='kp-record-done'){if(recording)finish(c,recording);return true;}
    else if(action==='kp-copy'&&n){c.saveNote();const made=clone(n);made.id=id();made.archived=false;(data.keepNotes||=[]).unshift(made);ui.keepNote=made.id;ui.sub='note';c.save();}
    else if(action==='kp-share'){c.saveNote();stop();ui.kpShare=n?clone(n):null;ui.kpScreen='share';}
    else if(action==='kp-send'){const spec=ui.kpShare;if(spec)c.send(value,{text:noteText(spec),audio:spec.audio,photo:spec.photo});return true;}
    else if(action==='kp-settings'){c.saveNote();ui.kpScreen='settings';}
    else if(action==='kp-sync'){ui.kpScreen='';c.sync();return true;}
    else if(action==='kp-sync-toggle'){const off=(data.settings.syncOff||={});off.Keep=!off.Keep;c.save();}
    else if(action==='kp-about')ui.kpScreen='about';
    else if(action==='kp-account')ui.kpScreen='account';
    else if(action==='kp-website'){c.website(text(c,'drive.google.com/keep'));return true;}
    else if(action==='kp-back'){back(c);return true;}
    else if(action==='kp-audio-remove')ui.kpScreen='remove-audio';
    else if(action==='kp-audio-delete'){stop();if(n)delete n.audio;ui.kpScreen='';c.save();}
    else if(action==='kp-play'&&n?.audio){
      if(player&&ui.kpPlaying===n.id){stop();ui.kpPlaying='';}
      else {stop();const p=player=new Audio(n.audio.dataUrl);ui.kpPlaying=n.id;p.onended=()=>{if(player===p){stop();ui.kpPlaying='';if(ui.view==='keep')c.render();}};p.play().catch(()=>{if(player===p){stop();ui.kpPlaying='';c.render();}});timer=setInterval(()=>{if(ui.view!=='keep'||ui.keepNote!==n.id){stop();return;}const bar=document.querySelector('#viewport [data-kpm-progress]');if(bar)bar.value=p.currentTime;},100);}
    } else return false;
    ui.overlay='';c.renderOverlay();c.render();return true;
  }
  window.KeepMore={text,audio,badge,screen,syncPage,handle,back,leave,stop,noteText,sample};
})();
