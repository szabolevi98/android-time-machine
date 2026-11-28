/* Music on Android 2.3.6 (Music.apk of GRK39F) as a module (docs/plans/engine-migration.md): the library tabs, the
   groups, the player and the queue, the Menu key, the song dialogs (long press or right click on a song) and the new
   playlist form. Playback is the system's (MediaPlaybackService): ui.music, its tick, the home widget and the lock
   screen stay with the shell, which saves the player state through c.saveMusic. */
(() => {
  'use strict';
  const MUSIC = AndroidStrings.resources(() => window.GBStrings?.music), musicText = key => MUSIC.t(key, AndroidI18n.language);
  // Music's plurals (Nalbums, Nsongs, Nsongscomp): the one / other text of the image, %d and %n$d / %n$s filled in.
  // The quantity the language's plural rules pick (CLDR, as Android's Resources.getQuantityString).
  const musicPlural = (key, n, ...rest) => MUSIC.plural(key, n, AndroidI18n.language, n, ...rest);
  window.GB?.register('music', {
    render: c => ICSMusic.render(c.ui.music, c.ui, key => AndroidI18n.t(key), musicText, musicPlural),
    mount(c, root) { GB.hold(c, root, '.stock-music [data-action="music-select"]', song => { c.ui.musicSelected = Number(song.dataset.id); c.ui.overlay = 'gb-dialog-music'; c.ui.gbMusicDialog = 'track'; c.renderOverlay(); }); },
    menu(c) {
      const ui = c.ui;
      const party = {action: 'music-party', title: musicText(ui.music.party ? 'party_shuffle_off' : 'party_shuffle'), icon: 'gb-mu-ic_menu_party_shuffle.png'};
      c.gbMenu(ui.sub === 'player' ? [{action: 'music-library', title: musicText('goto_start'), icon: 'ic_menu_music_library'}, party, {action: 'music-track-menu-add', title: musicText('add_to_playlist'), icon: 'ic_menu_add'}, {action: 'music-ringtone', id: String(ui.music.track), title: musicText('ringtone_menu_short'), icon: 'ic_menu_set_as_ringtone'}, {action: 'music-delete', id: String(ui.music.track), title: musicText('delete_item'), icon: 'ic_menu_delete'}] : [party, {action: 'music-shuffle-all', title: musicText('shuffle_all'), icon: 'ic_menu_shuffle'}]);
    },
    // DeleteItems and the song's, the playlist's and the new playlist's dialogs (2.3.6's AlertDialog).
    dialog(kind, c) {
      const ui = c.ui, safe = c.safe, i18n = AndroidI18n;
      const track = ICSMusic.tracks[ui.musicSelected], inPlaylist = ui.sub === 'music-group' && String(ui.musicGroup).startsWith('playlist|');
      // DeleteItems (layout-finger/confirm_delete.xml, no title): delete_song_desc_nosdcard — the Nexus S keeps music on
      // its built-in USB storage (isExternalStorageRemovable is false) — then OK and Cancel.
      if (kind === 'delete') return {icon: 'ic_dialog_alert', message: AndroidStrings.format(musicText('delete_song_desc_nosdcard'), track?.title || ''), buttons: [{action: 'music-delete-ok', title: musicText('delete_confirm_button_text')}, {action: 'close-overlay', title: musicText('cancel')}]};
      if (kind === 'add') return {title: musicText('add_to_playlist'), items: [{action: 'music-add-queue', title: musicText('queue')}, {action: 'music-new-playlist', id: 'add', title: musicText('new_playlist')}, ...ui.music.playlists.map(p => ({action: 'music-add-confirm', id: p.id, title: p.name}))]};
      if (kind === 'new') return {title: musicText('new_playlist'), custom: `<form data-form="music-playlist"><input name="name" maxlength="60" required aria-label="${safe(i18n.t('Playlist name'))}" value="${safe(AndroidStrings.format(musicText('new_playlist_name_template'), String(ui.music.playlists.length + 1)))}"></form>`, buttons: [{action: 'music-playlist-save', title: musicText('create_playlist_create_text')}, {action: 'close-overlay', title: GBSettings.text(i18n.language, 'fw_cancel')}]};
      return {title: track?.title || '', items: [{action: 'music-play-selected', title: musicText('play_selection')}, {action: 'music-add-to-playlist', title: musicText('add_to_playlist')}, ...(inPlaylist ? [{action: 'music-remove-from-playlist', title: musicText('remove_from_playlist')}] : []), {action: 'music-ringtone', id: String(ui.musicSelected), title: musicText('ringtone_menu')}, {action: 'music-delete', id: String(ui.musicSelected), title: musicText('delete_item')}, {action: 'gbset-toast', id: 'This feature is not part of the simulator.', title: musicText('search_title')}]};
    },
    back(c) { if (c.ui.sub !== 'queue') return false; c.ui.sub = 'player'; c.render(); return true; },
    action(name, el, c) {
      const id = el.dataset.id, action = name, {data, ui, save, render, renderOverlay, toast, saveMusic} = c, overlayRoot = c.overlayRoot, tracks = ICSMusic.tracks;
      switch (name) {
        case 'music-play': ui.music.playing=!ui.music.playing;if(ui.music.playing&&ui.music.position>=tracks[ui.music.track].duration)ui.music.position=0;saveMusic();render();break;
        case 'music-prev': case 'music-next': ICSMusic.step(ui.music,action==='music-prev'?-1:1);saveMusic();render();break;
        case 'music-tab': ui.musicTab=id;ui.sub='';render();break;
        case 'music-library': ui.sub='';render();break;
        case 'music-player': ui.sub='player';render();break;
        case 'music-queue': ui.sub='queue';render();break;
        case 'music-group': ui.musicGroup=id;ui.sub='music-group';render();break;
        case 'music-expand': {const open=new Set(ui.musicExpanded||[]);if(open.has(id))open.delete(id);else open.add(id);ui.musicExpanded=[...open];render();break;}
        case 'music-select': ui.music.queue=[...ICSMusic.listing(ui.music,ui)];ui.music.track=Number(id);ui.music.position=0;ui.music.playing=true;saveMusic();ui.sub='player';render();break;
        case 'music-shuffle': ui.music.shuffle=!ui.music.shuffle;if(!ui.music.shuffle)ui.music.party=false;saveMusic();render();toast(musicText(ui.music.shuffle?'shuffle_on_notif':'shuffle_off_notif'));break;
        case 'music-repeat': ui.music.repeat={off:'all',all:'one',one:'off'}[ui.music.repeat];saveMusic();render();toast(musicText({all:'repeat_all_notif',one:'repeat_current_notif',off:'repeat_off_notif'}[ui.music.repeat]));break;
        case 'music-track-menu': ui.musicSelected=Number(id);ui.overlay='gb-dialog-music';ui.gbMusicDialog='track';renderOverlay();break;
        case 'music-track-menu-add': ui.musicSelected=ui.music.track;ui.overlay='gb-dialog-music';ui.gbMusicDialog='add';renderOverlay();break;
        case 'music-party': ui.music.party=!ui.music.party;ui.music.shuffle=ui.music.party;if(ui.music.party)ui.music.playing=true;ui.overlay='';saveMusic();render();break;
        case 'music-shuffle-all': ui.music.queue=ICSMusic.tracks.map((_,i)=>i);ui.music.shuffle=true;ui.music.track=Math.floor(Math.random()*ICSMusic.tracks.length);ui.music.position=0;ui.music.playing=true;ui.overlay='';saveMusic();ui.sub='player';render();break;
        case 'music-play-selected': ui.overlay='';{const button=document.createElement('button');button.dataset.action='music-select';button.dataset.id=String(ui.musicSelected);viewport.append(button);button.click();button.remove();}break;
        case 'music-playlist-save': overlayRoot.querySelector('form[data-form="music-playlist"]')?.requestSubmit();break;
        case 'music-add-to-playlist': ui.overlay='gb-dialog-music';ui.gbMusicDialog='add';renderOverlay();break;
        case 'music-add-queue': if(!ui.music.queue.includes(ui.musicSelected))ui.music.queue.push(ui.musicSelected);saveMusic();ui.overlay='';render();break;
        case 'music-new-playlist': ui.musicAddPending=id==='add';ui.overlay='gb-dialog-music';ui.gbMusicDialog='new';renderOverlay();overlayRoot.querySelector('[name=name]')?.focus();break;
        case 'music-add-confirm': {const playlist=ui.music.playlists.find(p=>String(p.id)===id);if(playlist&&!playlist.tracks.includes(ui.musicSelected))playlist.tracks.push(ui.musicSelected);saveMusic();ui.overlay='';render();toast('Added to playlist');break;}
        // Use as phone ringtone: the song is flagged IS_RINGTONE and becomes Settings › Sound › Phone ringtone.
        case 'music-ringtone': { const n = Number(id); if (!ICSMusic.setRingtone(ui.music, n)) break; data.settings.ringtone = `music:${n}`; saveMusic(); save(); ui.overlay = ''; renderOverlay(); toast(AndroidStrings.format(musicText('ringtone_set'), ICSMusic.tracks[n].title)); break; }
        case 'music-delete': ui.musicSelected = Number(id); ui.overlay = 'gb-dialog-music'; ui.gbMusicDialog = 'delete'; renderOverlay(); break;
        case 'music-delete-ok': {
          const n = ui.musicSelected; ICSMusic.remove(ui.music, n);
          if (data.settings.ringtone === `music:${n}`) delete data.settings.ringtone;
          ui.musicTrack = ui.music.track; ui.musicPlaying = ui.music.playing; ui.overlay = '';
          // MediaPlaybackActivity finishes once nothing is loaded.
          if (ui.music.track == null && (ui.sub === 'player' || ui.sub === 'queue')) ui.sub = '';
          saveMusic(); save(); renderOverlay(); render(); toast(musicPlural('NNNtracksdeleted', 1)); break;
        }
        case 'music-remove-from-playlist': {const playlist=ui.music.playlists.find(p=>`playlist|${p.id}`===ui.musicGroup);if(playlist)playlist.tracks=playlist.tracks.filter(track=>track!==ui.musicSelected);saveMusic();ui.overlay='';render();break;}
        default: return false;
      }
      return true;
    },
    submit(name, values, c) {
      const {ui, render, saveMusic} = c;
      if (name === 'music-playlist') {const title=String(values.get('name')||'').trim();if(!title)return true;ui.music.playlists.push({id:Date.now(),name:title,tracks:ui.musicAddPending?[ui.musicSelected]:[]});saveMusic();ui.overlay='';render();return true;}
      return false;
    },
    // The player's seek bar.
    input(event, c) {
      if (event.target.dataset.field !== 'music-position') return false;
      const {ui, saveMusic} = c, viewport = c.viewport;
      if(event.target.dataset.field==='music-position'){ui.music.position=Number(event.target.value);saveMusic();const elapsed=viewport.querySelector('.music-elapsed');if(elapsed)elapsed.textContent=ICSMusic.time(ui.music.position);}
      return true;
    },
    clearData(c) { c.ui.music = ICSMusic.restore(); c.saveMusic(); }
  });
})();

/* Music's playback (MediaPlaybackService) as part of the music module: the state kept in the save and the position that
   moves on every second, whatever screen is open (the home widget and the lock screen show it too). */
(() => {
  'use strict';
  const music = window.GB?.module('music'); if (!music) return;
  function service(c) {
    const {data, ui, save, render, viewport} = c, clone = c.clone, pointerStart = c.pressing();
    function saveMusic() {
      ui.musicTrack=ui.music.track;ui.musicPlaying=ui.music.playing;ui.musicPosition=ui.music.position;
      data.music=clone(ui.music);delete data.music.playing;save();
    }
    function tickMusic() {
      if(!ui.music.playing)return;
      const previous=ui.music.track;ICSMusic.tick(ui.music);
      ui.musicTrack=ui.music.track;ui.musicPlaying=ui.music.playing;
      if(previous!==ui.music.track || !ui.music.playing){saveMusic();if(ui.view==='music'||ui.view==='home'||ui.view==='lock'&&!pointerStart)render();}
      else if(Math.floor(ui.music.position)%10===0)saveMusic();
      const progress=viewport.querySelector('.music-progress');if(progress&&document.activeElement!==progress)progress.value=ui.music.position;
      const elapsed=viewport.querySelector('.music-elapsed');if(elapsed)elapsed.textContent=ICSMusic.time(ui.music.position);
    }
    return {saveMusic, tickMusic};
  }
  music.save = c => service(c).saveMusic();
  music.tick = c => service(c).tickMusic();
})();
