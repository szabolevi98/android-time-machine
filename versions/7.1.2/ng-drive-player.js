/* N2G48C Drive file_viewer_audio/video: black window, 56dp metadata strip,
   8dp controller margin, original 48dp transport icons. Invented media uses the
   same local playback clock as Photos; no remote stream or host microphone. */
(() => {
  'use strict';
  const text = key => NG.text('drive').t(key);
  const playable = f => f && ['audio','video'].includes(f.type);
  const duration = f => Math.max(1000, Number(f.duration || f.photoSnapshot?.duration || 180000));
  const clock = ms => `${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}`;
  function state(c,f) {
    const u=NG.driveUI.state(c);
    if(u.player?.id!==f.id)u.player={id:f.id,playing:false,position:0,startedAt:0};
    return u.player;
  }
  function position(p,f) {return Math.min(duration(f),p.position+(p.playing?Math.max(0,Date.now()-p.startedAt):0));}
  function stop(c) {const p=NG.driveUI.state(c).player,f=p&&NG.driveModel.find(c,p.id);if(f){p.position=position(p,f);p.playing=false;}}
  function render(c,f) {
    const p=state(c,f),pos=position(p,f),button=(action,icon,label)=>`<button type="button" data-action="ngdvp-${action}" aria-label="${c.safe(text(label))}"><img src="assets/dv-${icon}.png" alt=""></button>`;
    return `<div class="ngdvp ${f.type}" aria-label="${c.safe(text(f.type==='video'?'desc_video_player':'document_type_audio'))}">${f.photoSnapshot?NG.media.svg(f.photoSnapshot,'ngdvp-frame',undefined,'meet'):`<div class="ngdvp-audio"><img src="assets/dv-audio-big.png" alt=""><b>${c.safe(f.name)}</b></div>`}${f.type==='audio'?`<div class="ngdvp-metadata"><b>${c.safe(f.name)}</b><span>${c.safe(f.artist||'')}</span></div>`:''}<div class="ngdvp-controls"><div class="ngdvp-buttons">${button('replay','media-replay','desc_audio_replay')}${button('play',p.playing?'media-pause':'media-play',p.playing?'desc_audio_pause':'desc_audio_play')}${button('forward','media-forward','desc_audio_forward')}</div><div class="ngdvp-seek"><time>${clock(pos)}</time><input type="range" min="0" max="${duration(f)}" value="${pos}" aria-label="${c.safe(f.name)}"><time>${clock(duration(f))}</time></div></div></div>`;
  }
  function mount(c,root,f) {
    const seek=root.querySelector('.ngdvp-seek input');
    seek?.addEventListener('input',()=>{const p=state(c,f);p.position=Number(seek.value);p.startedAt=Date.now();root.querySelector('.ngdvp-seek time').textContent=clock(p.position);});
  }
  function tick(c) {
    if(c.ui.view!=='drive'||c.ui.sleeping)return stop(c);
    const u=NG.driveUI.state(c),f=NG.driveModel.find(c,u.file),p=u.player;
    if(!f||!c.el.viewport.querySelector('.ngdvp'))return stop(c);if(p?.id!==f.id||!p.playing)return;
    const pos=position(p,f),root=c.el.viewport;
    if(pos>=duration(f)){p.position=duration(f);p.playing=false;c.render();return;}
    const time=root.querySelector('.ngdvp-seek time'),seek=root.querySelector('.ngdvp-seek input');
    if(time)time.textContent=clock(pos);if(seek&&document.activeElement!==seek)seek.value=pos;
    root.querySelector('.ngdvp-frame')?.style.setProperty('filter',`brightness(${1+.04*Math.sin(pos/400)})`);
  }
  function action(name,el,e,c) {
    if(!name.startsWith('ngdvp-'))return false;
    const u=NG.driveUI.state(c),f=NG.driveModel.find(c,u.file);if(!playable(f))return true;
    const p=state(c,f),pos=position(p,f),kind=name.slice(6);
    if(kind==='play'){p.position=pos>=duration(f)?0:pos;p.playing=!p.playing;p.startedAt=Date.now();}
    else if(kind==='forward'||kind==='replay'){p.position=Math.max(0,Math.min(duration(f),pos+(kind==='forward'?30000:-30000)));p.startedAt=Date.now();}

    c.render();return true;
  }
  NG.drivePlayer={render,mount,tick,action,stop,playable,duration};
})();
