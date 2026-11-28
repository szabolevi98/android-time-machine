/* TODO */
'use strict';
LP.define(['docs', 'sheets', 'slides', 'fit', 'newsstand', 'wallet'], ({
  deviceDate, i18n, openApp, overlayRoot, render, renderOverlay, safe, save, screen, toast, ui, viewport
}, lp) => {
  // Drive's files as the apps change them (the editors, Drive).
  const officeFiles = () => lp.data.driveFiles || StockApps.FILES;
  const fitContext=()=>({data: lp.data,ui,locale:i18n.locale(),t:key=>i18n.t(key),save,render,renderOverlay,toast});
  const editorContext=()=>({data: lp.data,ui,files:officeFiles(),locale:i18n.locale(),t:key=>i18n.t(key),save,render,renderOverlay,
    openDrive(){openApp('drive');},pick(){lp.docPick(ui.view,EditorMore.ACCEPT[ui.view]);},shareText:lp.driveShareText,shareFile:lp.driveShareFile,
    shortcut(file){lp.placeShortcut('office:'+file.id,file.name);}});
  Object.assign(lp, {editorContext});
  // lp:code
  return {
    // lp:hooks
    input(event) {
      if (['newsstand'].includes(ui.view) && NewsReader.input(event.target, lp.newsContext())) return true;
      // lp:input
      return false;
    },
    overlay(name, root) {
      if(ui.overlay.startsWith('emore-')) {
        overlayRoot.innerHTML=EditorMore.dialog(editorContext());
        return true;
      }
      if (['ed-menu', 'ed-rename', 'ed-remove'].includes(ui.overlay)) {
        // #overlay-root has no height of its own (its children are placed against the screen), so the row's place and the room below come from the screen.
        overlayRoot.innerHTML = LPExtraApps.edDialog(ui.overlay.slice(3), {files: officeFiles(), ui, t: key => i18n.t(key), locale: i18n.locale()});
        if (ui.overlay === 'ed-menu') { const anchor = viewport.querySelector(`[data-action="ed-item"][data-id="${CSS.escape(ui.edFile)}"]`), menu = overlayRoot.querySelector('.ed-itemmenu'); if (anchor && menu) { const a = anchor.getBoundingClientRect(), box = overlayRoot.getBoundingClientRect(), frame = screen.getBoundingClientRect(), scale = frame.height / screen.offsetHeight || 1, top = (a.top - box.top) / scale; menu.style.top = `${Math.max(8, Math.min(top, screen.offsetHeight - menu.offsetHeight - 8))}px`; } }
        return true;
      }
      // lp:overlay
      return false;
    },
    backDrawer() {
      if(LPExtraApps.KIND[ui.view]&&ui.editorDrawer){ui.editorDrawer=false;render();return true;}
      // lp:backDrawer
      return false;
    },
    backDocs() {
      if (['docs', 'sheets', 'slides'].includes(ui.view) && ui.sub) { ui.sub = !['search', 'results'].includes(ui.sub) && ui.edFrom === 'results' ? 'results' : ''; ui.edFrom = ''; render(); return true; }
      // lp:backDocs
      return false;
    },
    backFit() {
      if(ui.view==='fit'&&!ui.overlay&&FitMore.back(fitContext()))return true;
      // lp:backFit
      return false;
    },
    backNews() {
      if (['newsstand'].includes(ui.view) && !ui.overlay && NewsReader.back(ui)) { render(); return true; }
      // lp:backNews
      return false;
    },
    openingWallet(app, resume) {
      if (app === 'wallet' && !resume) { ui.walPage = undefined; setTimeout(() => { if (ui.view === 'wallet' && ui.walPage == null) { ui.walPage = 0; render(); } }, 2000); }
      // lp:openingWallet
      return false;
    },
    opening(app, resume) {
      if (['newsstand'].includes(app) && !resume) NewsReader.open(ui);
      if(!resume&&LPExtraApps.KIND[app]){ui.editorDrawer=false;ui.editorRefreshing=false;}
      // lp:opening
      return false;
    },
    render() {
      return LPExtraApps.render(ui.view, {news: ui.view === 'newsstand' ? lp.newsContext() : null, files: officeFiles(), ui, data: lp.data, t: key => i18n.t(key), locale: i18n.locale()});
      // lp:render
    },
    afterRenderFit() {
      const fitRoot=viewport.querySelector('[data-fit-more]');
      if(ui.fitMoreHook&&ui.fitMoreHook.root!==fitRoot){ui.fitMoreHook.destroy();ui.fitMoreHook=null;}
      if(fitRoot&&!ui.fitMoreHook)ui.fitMoreHook={...FitMore.attach(fitRoot,fitContext()),root:fitRoot};
      // lp:afterRenderFit
      return false;
    },
    overlays: {
      'lpx-overflow'() {
        overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="lpa-menu">${LPExtraApps.menu(ui.view, key => i18n.t(key), i18n.locale(),editorContext()).map(item => `<button data-action="${item.action}">${safe(item.title)}</button>`).join('')}</div>`;
      },
      // lp:overlays
    },
    click(action, button, event) {
      const {id, app, url} = button.dataset;
      if(action.startsWith('fitm-')&&FitMore.handle(action,id,fitContext()))return;
      if(action.startsWith('emore-')&&EditorMore.handle(action,id,editorContext()))return;
      if (['newsstand'].includes(ui.view) && action.startsWith('nr-')) { if (ui.overlay) { ui.overlay = ''; renderOverlay(); } ui.kkxDrawer = false; ui.lpxDrawer = false; ui.magDrawer = false; ui.currentsMenu = false; if (NewsReader.handle(action, id, lp.newsContext())) return; }
      // lp:click
      switch (action) {
        case 'open-office-shortcut': {const f=officeFiles().find(f=>f.id===id&&!f.trashed);if(f){openApp(EditorMore.APP[f.kind]);ui.sub=f.id;ui.edFrom='';render();}break;}
        case 'lpx-open': {const f=officeFiles().find(f=>f.id===id);if(f){lp.data.driveFiles=officeFiles().map(f=>f.id===id?{...f,otime:Date.now()}:f);save();}} ui.edFrom = ui.sub; ui.sub = id; render(); break;
        // Docs / Sheets / Slides: Add new opens an untitled file; the actions menu renames or removes one (Drive shows the same list).
        case 'ed-new': { const kind = LPExtraApps.KIND[ui.view], E = key => AndroidStrings.pick(window.StockStrings?.editors?.[key], i18n.language, key), base = E(LPExtraApps.UNTITLED[kind]), names = new Set(officeFiles().map(f => f.name)); let name = base, n = 2; while (names.has(name)) name = `${base} (${n++})`;
          const file = {id: `e${Date.now().toString(36)}`, name, kind, date: deviceDate().toLocaleDateString(i18n.locale(), {month: 'short', day: 'numeric'}), age: 0, text: ''}; lp.data.driveFiles = [file, ...officeFiles()]; save(); ui.edFrom = ui.sub; ui.sub = file.id; render(); break; }
        case 'ed-item': ui.edFile = id; ui.overlay = 'ed-menu'; renderOverlay(); break;
        case 'ed-rename': ui.overlay = 'ed-rename'; renderOverlay(); overlayRoot.querySelector('[data-ed-name]')?.select(); break;
        case 'ed-rename-ok': { const name = overlayRoot.querySelector('[data-ed-name]')?.value.trim(); if (name) { lp.data.driveFiles = officeFiles().map(f => f.id === ui.edFile ? {...f, name} : f); save(); } ui.overlay = ''; renderOverlay(); render(); break; }
        case 'ed-remove': ui.overlay = 'ed-remove'; renderOverlay(); break;
        case 'ed-remove-ok': lp.data.driveFiles = officeFiles().filter(f => f.id !== ui.edFile); save(); ui.overlay = ''; renderOverlay(); render(); break;
        case 'ed-search-open': ui.sub = 'search'; ui.edQuery = ''; render(); viewport.querySelector('[data-form="ed-search"] input')?.focus(); break;
        case 'ed-search-clear': ui.sub = ''; ui.edQuery = ''; render(); break;
        case 'lpx-unavailable': case 'lpx-menu': ui.overlay = ''; renderOverlay(); toast(i18n.t('This feature is not part of the simulator.')); break;
        case 'lpx-overflow': ui.overlay = 'lpx-overflow'; renderOverlay(); break;
        case 'wal-next': ui.walPage = Math.min((ui.walPage ?? 0) + 1, LPExtraApps.WAL_PAGES.length - 1); render(); break;
        case 'wal-finish': toast(i18n.t('This feature is not part of the simulator.')); break;
        case 'lpx-drawer': ui.lpxDrawer = !ui.lpxDrawer; render(); break;
        // Docs / Sheets / Slides' Print: the file's own text.
        case 'ed-print': { const file = officeFiles().find(f => f.id === ui.edFile); ui.overlay=''; renderOverlay(); if (!file) break; PrintSpooler.open(lp.printContext(), {name: file.name, title: file.name, lines: String(file.text || '').split('\n')}); break; }
        // lp:cases
        default: return false;
      }
      return true;
    },
    submit(name, values, event, form) {
      if (['newsstand'].includes(ui.view) && NewsReader.submit(form.dataset.form, values, lp.newsContext())) return;
      // lp:submit
      switch (name) {
        case 'ed-search': { const query = String(values.get('query') || '').trim(); if (!query) return; ui.edQuery = query; ui.sub = 'results'; render(); break; }
        // lp:scases
        default: return false;
      }
      return true;
    }
  };
});
