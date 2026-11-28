/* Google's Play media apps on Android 4.3 (Play Music, Play Movies, Play Books of JWR66Y), moved out of simulator.js
   (docs/plans/engine-migration.md): their screens (play-apps.js), the drawer, the overflow menus and the more screens
   (jb-play-more.js), the video player's clock, the reader's options and brightness, and Back. */
(() => {
  'use strict';
  if (!window.JB) return; // loaded on its own (the renderer's unit tests)
  let $c, PLAY_APPS, clock, data, i18n, openApp, overlayRoot, render, renderOverlay, safe, save, saveMusic, shareText, toast, tracks, ui, viewport;
  const $bind = c => { $c = c; ({PLAY_APPS, clock, data, i18n, openApp, overlayRoot, render, renderOverlay, safe, save, saveMusic, shareText, toast, tracks, ui, viewport} = c); };
  const playContext = app => ({app, ui, data, locale: i18n.locale(), t: key => i18n.t(key), music: ui.music, tracks, time: ICSMusic.time});
  // The Play Movies player counts seconds without re-rendering (the picture keeps panning).
  function tickPlayVideo() {
    if (ui.view !== 'play-movies' || ui.sub !== 'movie' || ui.paPlaying === false || ui.locked) return;
    ui.paSeconds = (ui.paSeconds || 0) + 1;
    const item = [...PlayApps.MOVIES, ...PlayApps.SHOWS].find(entry => entry.id === ui.paItem); if (!item) return;
    const total = (item.mins || 24) * 60, pos = Math.min(total, Math.floor(total * (item.progress || 0)) + ui.paSeconds);
    const clock = value => `${Math.floor(value / 3600)}:${String(Math.floor(value / 60) % 60).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
    const footer = viewport.querySelector('.pm-video-bottom'); if (!footer) return;
    footer.querySelector('span').textContent = clock(pos); footer.querySelector('i').style.setProperty('--p', `${(pos / total * 100).toFixed(1)}%`);
  }
  const spec = {
    render(c) {
      $bind(c);
      switch (ui.view) {
        case 'play-music': case 'play-movies': case 'play-books': return PlayApps.render(playContext(ui.view));
      }
    },
    action(action, button, c) {
      $bind(c);
      const event = c.event, { id, app, url } = button.dataset;
      // A choice in a Play app's menu closes it before its action runs (jb-play-more.js handles its own).
      if (ui.overlay === 'pa-more' && !action.startsWith('px-') && action !== 'close-overlay') { ui.overlay = ''; ui.paMore = ''; renderOverlay(); }
      if (action.startsWith('px-') && PlayMore.handle(action, id, {...playContext(ui.view), save, saveMusic, render, renderOverlay, toast, root: viewport, openApp, shareText})) return true;
      switch (action) {
        case 'pa-drawer': ui.overlay = 'pa-drawer'; renderOverlay(); break;
        case 'pa-menu': ui.overlay = 'pa-menu'; renderOverlay(); break;
        case 'pa-refresh': ui.overlay = ''; renderOverlay(); render(); break;
        case 'pa-books-filter': ui.bkFilterOpen = !ui.bkFilterOpen; render(); break;
        case 'pa-books-filter-set': ui.bkFilter = Number(id); ui.bkFilterOpen = false; render(); break;
        case 'pa-page': ui.paPage ||= {}; ui.paPage[ui.view] = id; ui.sub = ''; ui.overlay = ''; renderOverlay(); render(); break;
        case 'pa-unsupported': case 'pa-game-play': ui.overlay = ''; renderOverlay(); toast(i18n.t('This feature is not part of the simulator.')); break;
        case 'pa-album': ui.paFromSearch = ui.sub === 'search'; ui.paAlbum = id; ui.sub = 'album'; render(); break;
        case 'pa-search': case 'pa-search-clear': ui.paQuery = ''; ui.sub = 'search'; ui.overlay = ''; renderOverlay(); render(); viewport.querySelector('[data-pa-search]')?.focus(); break;
        case 'pa-song': {
          const track = Number(id), queue = button.dataset.queue;
          if (queue === 'all') ui.music.queue = tracks.map((_, i) => i);
          else if (queue && queue !== 'keep') ui.music.queue = tracks.map((item, i) => item.album === queue ? i : -1).filter(i => i >= 0);
          if (!ui.music.queue.includes(track)) ui.music.queue = [...ui.music.queue, track];
          ui.music.track = track; ui.music.position = 0; ui.music.playing = true; saveMusic();
          if (ui.sub !== 'player' && ui.sub !== 'queue') ui.paReturn = ui.sub;
          ui.sub = 'player'; render(); break;
        }
        case 'pa-player': ui.paReturn = ui.sub; ui.sub = 'player'; render(); break;
        case 'pa-queue': ui.sub = ui.sub === 'queue' ? 'player' : 'queue'; render(); break;
        case 'pa-thumb': { data.playMusicThumbs ||= {}; const value = Number(id); if (data.playMusicThumbs[ui.music.track] === value) delete data.playMusicThumbs[ui.music.track]; else data.playMusicThumbs[ui.music.track] = value; save(); render(); break; }
        case 'pa-libtab': ui.paMusicTab = id; render(); break;
        case 'pa-mixtab': ui.paMixTab = id; render(); break;
        case 'pa-libtab-songs': ui.paPage ||= {}; ui.paPage['play-music'] = 'library'; ui.paMusicTab = 'songs'; render(); break;
        case 'pa-movie': ui.paItem = id; ui.sub = 'movie'; ui.paPlaying = true; ui.paSeconds = 0; ui.paBars = true; render(); break;
        case 'pa-video-bars': ui.paBars = ui.paBars === false; viewport.querySelector('.pm-video')?.classList.toggle('bare', ui.paBars === false); break;
        case 'pa-video-toggle': ui.paPlaying = ui.paPlaying === false; render(); break;
        case 'pa-shop': openApp('play-store'); break;
        case 'pa-book': ui.paItem = id; ui.sub = 'reader'; ui.paBars = true; render(); break;
        case 'pa-reader-tap': {
          const box = button.getBoundingClientRect(), x = (event.clientX - box.left) / box.width;
          if (x > .3 && x < .7) { ui.paBars = ui.paBars === false; viewport.querySelector('.pb-reader')?.classList.toggle('bare', ui.paBars === false); break; }
          data.playBooks ||= {}; const pages = PlayApps.bookPages(ui.paItem), now = data.playBooks[ui.paItem] || 0;
          data.playBooks[ui.paItem] = Math.max(0, Math.min(pages - 1, now + (x >= .7 ? 1 : -1))); save(); render(); break;
        }
        case 'bk-toc': ui.bkToc = !ui.bkToc; ui.bkTocTab = 'chapters'; ui.bkOptions = false; ui.bkSpin = ''; render(); break;
        case 'bk-toc-tab': ui.bkTocTab = id; render(); break;
        case 'bk-chapter': data.playBooks ||= {}; data.playBooks[ui.paItem] = Number(id) || 0; ui.bkToc = false; save(); render(); break;
        case 'bk-options': ui.bkOptions = !ui.bkOptions; ui.bkSpin = ''; render(); break;
        case 'bk-pref-spin': ui.bkSpin = ui.bkSpin === id ? '' : id; render(); break;
        case 'bk-pref': case 'bk-pref-step': {
          const [key, value] = String(id).split(':'), prefs = PlayApps.bookPrefs(data);
          data.bookPrefs = {...prefs, [key]: action === 'bk-pref' ? value : PlayApps.stepPref(prefs, key, Number(value))}; ui.bkSpin = ''; save(); render(); break;
        }
        case 'bk-pref-auto': { const prefs = PlayApps.bookPrefs(data); data.bookPrefs = {...prefs, brightness: prefs.brightness < 0 ? Math.max(5, Math.round(data.settings?.brightness ?? 100)) : -1}; save(); render(); break; }
        case 'pa-see-all': ui.paPage ||= {}; ui.paPage['play-books'] = 'library'; render(); break;
        case 'pa-game': ui.paItem = id; ui.sub = 'game'; render(); break;
        default: return false;
      }
      return true;
    },
    input(event, c) {
      $bind(c);
      if (event.target.matches('[data-bk-bright]')) { data.bookPrefs = {...PlayApps.bookPrefs(data), brightness: Number(event.target.value)}; save(); viewport.querySelector('.pb-reader')?.style.setProperty('--bk-dim', ((100 - Number(event.target.value)) / 100 * .7).toFixed(3)); return true; }
      if (event.target.matches('[data-pa-search]')) { ui.paQuery = event.target.value; const at = event.target.selectionStart; render(); const input = viewport.querySelector('[data-pa-search]'); if (input) { input.focus(); input.setSelectionRange(at, at); } return true; }
      return false;
    },
    back(c) {
      $bind(c);
      if (ui.overlay) return false;
      // Play Books' reader: a dropdown, then the Display options popup, then Contents close before the reader does.
      if (ui.view === 'play-books' && ui.sub === 'reader' && (ui.bkSpin || ui.bkOptions || ui.bkToc)) { if (ui.bkSpin) ui.bkSpin = ''; else if (ui.bkOptions) ui.bkOptions = false; else ui.bkToc = false; render(); return true; }
      if (ui.view === 'play-books' && ui.sub === 'reader') { ui.bkOptions = false; ui.bkToc = false; ui.bkSpin = ''; }
      // The Play apps' own pages (jb-play-more.js) go back to where they were opened.
      if (PLAY_APPS.includes(ui.view) && PlayMore.back(ui)) { render(); return true; }
      if (PLAY_APPS.includes(ui.view) && ui.sub) { ui.sub = ui.sub === 'queue' ? 'player' : ui.sub === 'player' ? ui.paReturn || '' : ui.sub === 'album' && ui.paFromSearch ? 'search' : ''; if (ui.sub !== 'album') ui.paFromSearch = ui.sub === 'search' && ui.paFromSearch; ui.paBars = true; render(); return true; }
      return false;
    },
    overlay(c) {
      $bind(c);
      if (ui.overlay === 'pa-drawer') {
        overlayRoot.innerHTML = PlayApps.drawer(playContext(ui.view));
      } else if (ui.overlay === 'pa-menu') {
        overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu${ui.view === 'play-movies' ? '' : ' holo-menu-light'}">${PlayApps.menu(playContext(ui.view)).map(item => `<button data-action="${item.action}"${item.id ? ` data-id="${safe(item.id)}"` : ''}>${safe(item.title)}</button>`).join('')}</div>`;
      } else if (ui.overlay === 'pa-more') {
        // The Play apps' card, now playing and reader menus and their dialogs (jb-play-more.js).
        overlayRoot.innerHTML = PlayMore.overlay(playContext(ui.view));
      }
      else return;
      return true;
    },
    exports: {
      tickPlayVideo: (c, ...args) => { $bind(c); return tickPlayVideo(...args); }
    }
  };
  JB.register('play-music', spec);
  JB.register('play-movies', spec);
  JB.register('play-books', spec);
})();
