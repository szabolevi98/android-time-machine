/* Music (IMM76I Music.apk, AOSP Music), moved out of simulator.js (docs/plans/engine-migration.md). music.js draws the
   library, the player and the dialogs; this module is the app around it and its playback service:
   - ui.music is the MediaPlaybackService's state (also played by Play Music, the lock screen's transport and the Music
     widget); saveMusic keeps it in data.music, without playing (a reload starts paused)
   - targetSdkVersion 9: the navigation bar shows the legacy menu key, and a long press on a row opens its context menu
   - every second the playing track moves on, and the player's seek bar and elapsed time follow. */
(() => {
  'use strict';
  let holdTimer = null;

  function saveMusic(c) {
    const {ui, data, save, clone} = c;
    ui.musicTrack=ui.music.track;ui.musicPlaying=ui.music.playing;ui.musicPosition=ui.music.position;
    data.music=clone(ui.music);delete data.music.playing;save();
  }
  function tickMusic(c) {
    const {ui, render, viewport} = c;
    if(!ui.music.playing)return;
    const previous=ui.music.track;ICSMusic.tick(ui.music);
    ui.musicTrack=ui.music.track;ui.musicPlaying=ui.music.playing;
    if(previous!==ui.music.track || !ui.music.playing){saveMusic(c);if(ui.view==='music'||ui.view==='play-music'||ui.view==='home'||ui.view==='lock'&&!c.pointer)render();}
    else if(Math.floor(ui.music.position)%10===0)saveMusic(c);
    const progress=viewport.querySelector('.music-progress');if(progress&&document.activeElement!==progress)progress.value=ui.music.position;
    const elapsed=viewport.querySelector('.music-elapsed');if(elapsed)elapsed.textContent=ICSMusic.time(ui.music.position);
  }
  // The long press's context menu (the row's track, album, artist or playlist).
  function hold(c, row) {
    const {ui, i18n} = c;
    ui.musicHold = row.dataset.musicHold; if (ui.musicHold.startsWith('track:')) ui.musicSelected = Number(ui.musicHold.slice(6)); ui.music.lang = i18n.language; ui.overlay = 'music-context';
  }

  ICS.register('music', {
    scroller: '.music-library-scroll',
    // The Music service is active: playing, paused part way, or started from a widget (the lock screen's transport and
    // the Music widget show it).
    init(c) { c.saveMusic = () => saveMusic(c); c.musicActive = () => c.ui.music.playing || c.ui.music.position > 0 || !!c.ui.musicActive; },
    render(c) { const {ui, i18n} = c; return ICSMusic.render(ui.music,ui,key=>i18n.t(key)); },
    // AOSP Music (targetSdkVersion 9): the navigation bar's legacy menu key.
    legacyMenu(c) { return c.ui.view === 'music'; },
    overlay(c) {
      const {ui, i18n} = c;
      if (ui.overlay.startsWith('music-')) return ICSMusic.overlay(ui.music,ui,key=>i18n.t(key));
    },
    action(action, button, c) {
      const {ui, data, save, render, renderOverlay, toast, i18n, openApp, tracks} = c, {id} = button.dataset, saveMusic = c.saveMusic;
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
        // AOSP Music (targetSdkVersion 9): the navigation bar's legacy menu key and the long-press context menus.
        case 'legacy-menu': if(ui.view!=='music')return false;ui.music.lang=i18n.language;ui.overlay='music-options';renderOverlay();break;
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
    submit(form, values, c) {
      const {ui, render} = c;
      if (form.dataset.form === 'music-playlist') { const name=String(values.get('name')||'').trim();if(!name)return true;ui.music.playlists.push({id:Date.now(),name,tracks:ui.musicAddPending?[ui.musicSelected]:[]});c.saveMusic();ui.overlay='';render();return true; }
    },
    input(event, c) {
      const {ui, viewport} = c;
      if(event.target.dataset.field==='music-position'){ui.music.position=Number(event.target.value);c.saveMusic();const elapsed=viewport.querySelector('.music-elapsed');if(elapsed)elapsed.textContent=ICSMusic.time(ui.music.position);return true;}
    },
    back(c) {
      const {ui, render} = c;
      if (ui.overlay) return false;
      if(ui.view==='music' && ui.sub==='queue'){ui.sub='player';render();return true;}
      return false;
    },
    // A right click (the browser's context menu) or a long press on a row opens its context menu.
    contextmenu(event, c) {
      const {ui, renderOverlay} = c;
      const musicRow = ui.view === 'music' && !ui.overlay && event.target.closest('[data-music-hold]');
      if (musicRow) { hold(c, musicRow); renderOverlay(); }
    },
    pointerdown(event, p, c) {
      const {ui, renderOverlay} = c;
      const musicHold = ui.view === 'music' && !ui.overlay && event.target.closest('[data-music-hold]');
      if (musicHold) holdTimer = setTimeout(() => { hold(c, musicHold); c.suppressReleaseClick(); renderOverlay(); }, c.holdDelay(550));
    },
    pointermove(event, p, dx, dy, c) { if (Math.hypot(dx,dy) > c.dp(9)) clearTimeout(holdTimer); },
    pointerup() { clearTimeout(holdTimer); },
    pointercancel() { clearTimeout(holdTimer); },
    tick(c) { tickMusic(c); },
    clearData(c) { c.ui.music=ICSMusic.restore();c.saveMusic(); }
  });
})();
