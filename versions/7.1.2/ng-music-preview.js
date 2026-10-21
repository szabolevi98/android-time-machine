/* AudioPreview / audiopreview.xml: the external audio VIEW activity. The
   snapshot belongs to this temporary preview and never adds a library item. */
(() => {
  'use strict';
  const T=()=>NG.text('music');
  function position(p){return Math.min(p.duration,p.position+(p.playing?Math.max(0,Date.now()-p.started):0));}
  NG.musicPreview=(c,file)=>{NG.musicModel.pause(c);NG.musicUI.notification(c);c.ui.musicPreview={file:JSON.parse(JSON.stringify(file)),duration:Math.max(1000,+file.duration||180000),position:0,started:Date.now(),playing:true};c.overlay('music-preview');};
  const previous=NG.viewDocument;NG.viewDocument=(c,file)=>file.type==='audio'?NG.musicPreview(c,file):previous(c,file);
  NG.register('music-preview',{app:false,
    render(c){const p=c.ui.musicPreview;if(!p)return '';return `<div class="ngmu-preview-scrim" data-action="ngmup-close"></div><div class="ngmu-preview"><input type="range" min="0" max="${p.duration}" value="${position(p)}" aria-label="${c.safe(p.file.name)}"><div><span><b>${c.safe(p.file.title||p.file.name)}</b><small>${c.safe(p.file.artist||T().t('unknown_artist_name'))}</small></span><button type="button" data-action="ngmup-toggle" aria-label="${c.safe(T().t(p.playing?'accessibility_pause':'accessibility_play'))}"><img src="assets/mu-${p.playing?'pause':'play'}.png" alt=""></button></div></div>`;},
    mount(c,root){root.querySelector('.ngmu-preview input')?.addEventListener('input',e=>{const p=c.ui.musicPreview;p.position=+e.target.value;p.started=Date.now();});},
    back(c){c.ui.musicPreview=null;return false;},
    action(name,el,e,c){if(name==='ngmup-close'){c.ui.musicPreview=null;c.closeOverlay();return true;}if(name==='ngmup-toggle'){const p=c.ui.musicPreview;p.position=position(p);if(p.position>=p.duration)p.position=0;p.started=Date.now();p.playing=!p.playing;c.overlay('music-preview');return true;}return false;},
    tick(c){const p=c.ui.musicPreview;if(!p)return;if(c.ui.overlay!=='music-preview'){c.ui.musicPreview=null;return;}if(!p.playing)return;const value=position(p),input=c.el.overlay.querySelector('.ngmu-preview input');if(input)input.value=value;if(value>=p.duration){p.position=p.duration;p.playing=false;c.overlay('music-preview');}}
  });
})();
