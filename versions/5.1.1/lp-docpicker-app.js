/* TODO */
'use strict';
LP.define('kk-doc-picker', ({
  clone, deviceDate, editorContext, i18n, keepAttach, overlayRoot, mailbox, render, renderOverlay, save, ui, viewport
}, lp) => {
  /* DocumentsUI's GET_CONTENT picker (lp-docpicker.js) for the wallpaper picker, Keep (image/*) and Gmail / Email's
     Attach file (any type). It runs as its own screen in the asking app's task; ui.docPickFor names that app. The
     free space of Internal storage is the Storage screen's Available figure (settings-detail.js). */
  const docContext = () => ({data: lp.data, ui, t: key => { const row = window.StockStrings?.docsui?.[key]; return row ? AndroidStrings.pick(row, i18n.language, key) : i18n.t(key); }, locale: i18n.locale(), image: photo => ICSMedia.image(photo), album: ICSMedia.album, tracks: ICSMusic.tracks, now: deviceDate().getTime(), free: `${(9.93).toLocaleString(i18n.locale(), {minimumFractionDigits: 2})} GB`});
  function docPick(caller, accept) { ui.overlay = ''; renderOverlay(); LPDocPicker.start(lp.data, ui, caller, accept, docContext()); ui.docPickFor = caller; ui.view = 'kk-doc-picker'; render(); }
  function docReturn() { const caller = ui.docPickFor; ui.docs = null; ui.docPickFor = ''; ui.view = {wallpaper: 'wallpaper-picker'}[caller] || caller || 'wallpaper-picker'; return caller; }
  // The document picked goes back to the app that asked: a picture to the wallpaper strip or a Keep note, any file to
  // the message being written.
  function docPicked(file) {
    const caller = docReturn();
    if(EditorMore.APP[LPExtraApps.KIND[caller]]){EditorMore.importFile(editorContext(),file);return;}
    if (caller === 'keep') { keepAttach(file.photo.id, ui.keepPhotoTo); return; }
    if (caller === 'wallpaper') { const wp = ui.wp ||= {selected: '', temp: [], checked: []}, pid = file.photo.id; wp.temp = [pid, ...(wp.temp || []).filter(x => x !== pid)]; wp.selected = `photo:${pid}`; render(); return; }
    const item = mailbox().find(item => item.id === ui.emailId);
    if (item) item.files = [...(item.files || []), {name: file.name, mime: file.mime, size: file.size, ...(file.photo ? {photo: clone(file.photo)} : {})}];
    save(); render();
  }
  Object.assign(lp, {docPick, docContext});
  // lp:code
  return {
    // lp:hooks
    // Sort by and the overflow menu (ui.overlay ldp-<menu>).
    overlay(name) {
      if (!(name.startsWith?.('ldp-') && ui.docs)) return false;
      overlayRoot.innerHTML = LPDocPicker.menu(ui.overlay.slice(4), docContext());
      return true;
    },
    back() {
      if (ui.view === 'kk-doc-picker') { if (LPDocPicker.back(docContext()) !== 'render') docReturn(); render(); return true; }
      // lp:back
      return false;
    },
    render() {
      return LPDocPicker.render(docContext());
      // lp:render
    },
    click(action, button, event) {
      const {id, app, url} = button.dataset;
      if (action.startsWith('ldp-') && ui.docs) {
        const result = LPDocPicker.act(action, id, docContext());
        if (result.save) save();
        if (result.overlay) { ui.overlay = `ldp-${result.overlay}`; renderOverlay(); return; }
        ui.overlay = ''; renderOverlay();
        if (result.pick) { docPicked(result.pick); return; }
        render(); if (result.focus) viewport.querySelector('.ldp-search input')?.focus(); return;
      }
      // lp:click
      switch (action) {
        // lp:cases
        default: return false;
      }
      return true;
    },
    submit(name, values, event, form) {
      if (form.dataset.form === 'ldp-search') { LPDocPicker.search(values.get('q'), docContext()); render(); return; }
      // lp:submit
      switch (name) {
        // lp:scases
        default: return false;
      }
      return true;
    }
  };
});
