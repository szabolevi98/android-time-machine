/* The Music app on Android 4.3 (Music.apk of JWR66Y), moved out of simulator.js (docs/plans/engine-migration.md): the
   library tabs, an artist's, album's or playlist's songs, now playing with its queue, the Menu-key options and the
   context menus, playlists, ringtone, delete; their actions, forms, the seek bar, overlays, Back and Clear data. The
   player itself (ui.music, saveMusic, tickMusic) stays in the core: the widget, the lock screen and Play Music use it. */
(() => {
  'use strict';
  if (!window.JB) return; // loaded on its own (the renderer's unit tests)
  let $c, data, i18n, openApp, overlayRoot, render, renderOverlay, save, saveMusic, toast, tracks, ui, viewport;
  const $bind = c => { $c = c; ({data, i18n, openApp, overlayRoot, render, renderOverlay, save, saveMusic, toast, tracks, ui, viewport} = c); };
  function renderMusic() {
    return ICSMusic.render(ui.music,ui,key=>i18n.t(key));
  }
  const spec = {
    render(c) {
      $bind(c);
      switch (ui.view) {
        case 'music': return renderMusic();
      }
    },
    action(action, button, c) {
      $bind(c);
      const event = c.event, { id, app, url } = button.dataset;
      switch (action) {
        case 'music-play': ui.music.playing=!ui.music.playing;if(ui.music.playing&&ui.music.position>=tracks[ui.music.track].duration)ui.music.position=0;saveMusic();render();break;
        case 'music-prev': case 'music-next': ICSMusic.step(ui.music,action==='music-prev'?-1:1);saveMusic();render();break;
        case 'music-tab': ui.musicTab=id;ui.sub='';render();break;
        case 'music-library': ui.sub='';render();break;
        case 'music-player': ui.sub='player';render();break;
        case 'music-queue': ui.sub='queue';render();break;
        case 'music-group': ui.musicGroup=id;ui.sub='music-group';render();break;
        case 'music-select': ui.music.queue=[...ICSMusic.listing(ui.music,ui)];ui.music.track=Number(id);ui.music.position=0;ui.music.playing=true;saveMusic();ui.sub='player';render();break;
        case 'music-shuffle': ui.music.shuffle=!ui.music.shuffle;saveMusic();render();break;
        case 'music-repeat': ui.music.repeat={off:'all',all:'one',one:'off'}[ui.music.repeat];saveMusic();render();break;
        case 'legacy-menu': if(ui.view==='music'){ui.music.lang=i18n.language;ui.overlay='music-options';renderOverlay();}break;
        case 'music-ctx-play': {
          const [kind,key]=String(id).includes(':')?String(id).split(/:(.*)/s):['track',id];
          const list=kind==='track'?[Number(key)]:kind==='playlist'?(key==='recent'?ICSMusic.listing(ui.music,{sub:''}):ui.music.playlists.find(p=>String(p.id)===key)?.tracks||[]):tracks.map((_,i)=>i).filter(i=>tracks[i].artist===key||tracks[i].album===key);
          ui.overlay='';renderOverlay();if(!list.length)break;ui.music.queue=[...list];ui.music.track=list[0];ui.music.position=0;ui.music.playing=true;saveMusic();ui.sub='player';render();break;
        }
        case 'music-party': ui.music.party=!ui.music.party;if(ui.music.party)ui.music.shuffle=true;ui.overlay='';renderOverlay();saveMusic();render();break;
        case 'music-shuffle-all': {const list=ICSMusic.listing(ui.music,{sub:''});ui.overlay='';renderOverlay();if(!list.length)break;ui.music.shuffle=true;ui.music.queue=[...list];ui.music.track=list[Math.floor(Math.random()*list.length)];ui.music.position=0;ui.music.playing=true;saveMusic();ui.sub='player';render();break;}
        case 'music-ringtone': {const track=tracks[Number(id)];ui.overlay='';renderOverlay();if(!track)break;data.settings.ringtoneName=track.title;save();toast(AndroidStrings.format(ICSMusic.M('ringtone_set',i18n.language), track.title));break;}
        case 'music-delete': {const n=Number(String(id).replace(/^group:/,''));if(String(id).startsWith('group:')){ui.musicSelected=null;ui.overlay='';renderOverlay();break;}ui.musicSelected=n;ui.music.lang=i18n.language;ui.overlay='music-delete';renderOverlay();break;}
        case 'music-delete-confirm': {ui.music.deleted=[...new Set([...(ui.music.deleted||[]),ui.musicSelected])];ui.music.queue=ui.music.queue.filter(x=>x!==ui.musicSelected);ui.music.playlists.forEach(p=>{p.tracks=p.tracks.filter(x=>x!==ui.musicSelected);});if(ui.music.track===ui.musicSelected){ui.music.playing=false;ui.sub='';}ui.overlay='';renderOverlay();saveMusic();render();break;}
        case 'music-playlist-delete': ui.music.playlists=ui.music.playlists.filter(p=>String(p.id)!==id);ui.overlay='';renderOverlay();saveMusic();render();break;
        case 'music-search': ui.overlay='';renderOverlay();openApp('search');break;
        case 'music-add-to-playlist': if(id&&!String(id).startsWith('group:'))ui.musicSelected=Number(id);ui.music.lang=i18n.language;ui.overlay='music-playlist-choice';renderOverlay();break;
        case 'music-new-playlist': ui.musicAddPending=id==='add';ui.overlay='music-new-playlist';renderOverlay();break;
        case 'music-add-confirm': {const playlist=ui.music.playlists.find(p=>String(p.id)===id);if(playlist&&!playlist.tracks.includes(ui.musicSelected))playlist.tracks.push(ui.musicSelected);saveMusic();ui.overlay='';render();toast('Added to playlist');break;}
        case 'music-remove-from-playlist': {const playlist=ui.music.playlists.find(p=>String(p.id)===ui.musicGroup);if(playlist)playlist.tracks=playlist.tracks.filter(track=>track!==ui.musicSelected);saveMusic();ui.overlay='';render();break;}
        default: return false;
      }
      return true;
    },
    submit(name, values, c) {
      $bind(c);
      const event = c.event, form = c.form;
      switch (form.dataset.form) {
        case 'music-playlist': {const name=String(values.get('name')||'').trim();if(!name)return true;ui.music.playlists.push({id:Date.now(),name,tracks:ui.musicAddPending?[ui.musicSelected]:[]});saveMusic();ui.overlay='';render();break;}
        default: return false;
      }
      return true;
    },
    input(event, c) {
      $bind(c);
      if(event.target.dataset.field==='music-position'){ui.music.position=Number(event.target.value);saveMusic();const elapsed=viewport.querySelector('.music-elapsed');if(elapsed)elapsed.textContent=ICSMusic.time(ui.music.position);}
      return false;
    },
    back(c) {
      $bind(c);
      if (ui.overlay) return false;
      if(ui.view==='music' && ui.sub==='queue'){ui.sub='player';render();return true;}
      return false;
    },
    clearData(c) {
      $bind(c);
      const id = c.clearId;
      if(id==='music'){ui.music=ICSMusic.restore();saveMusic();}
    },
    overlay(c) {
      $bind(c);
      if (ui.overlay.startsWith('music-')) {
        overlayRoot.innerHTML = ICSMusic.overlay(ui.music,ui,key=>i18n.t(key));
      }
      else return;
      return true;
    }
  };
  JB.register('music', spec);
})();
