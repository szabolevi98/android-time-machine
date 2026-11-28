/* Keep 2.0.51 in the 4.4.4 shell (docs/plans/engine-migration.md): the notes (stock-apps.js), lists, pictures, the editor and its menus (keep-more.js) and Back, moved out of simulator.js. */
(() => {
  'use strict';
  function scope(c) {
    const {cameraShoot, data, keepAttach, keepCurrent, keepMoreContext, render, renderOverlay, renderStockApp, save, saveKeepNote, ui, viewport} = c;
    // Show / Hide checkboxes: lines become unchecked items; back to text drops the checked ones when asked to.
    function keepToText(note, dropChecked) { note.text = note.list.filter(item => !(dropChecked && item.checked)).map(item => item.text).join('\n'); delete note.list; }
    return {
      render() {
        return renderStockApp();
      },
      action(action, button, event) {
        const {id, app, url} = button.dataset;
        if(action.startsWith('kp-') && KeepMore.handle(action,id,keepMoreContext()))return;
        switch (action) {
          case 'keep-open': ui.keepNote = id; ui.sub = 'note'; render(); viewport.querySelector('.keep-text')?.focus(); break;
          case 'keep-delete': ui.overlay = ''; renderOverlay(); data.keepNotes = (data.keepNotes || []).filter(note => note.id !== ui.keepNote); ui.sub = ''; save(); render(); break;
          case 'keep-new': { const note = {id: 'k' + Date.now(), text: '', color: 0}; data.keepNotes = [note, ...(data.keepNotes || [])]; ui.keepNote = note.id; ui.sub = 'note'; render(); viewport.querySelector('.keep-text')?.focus(); break; }
          case 'keep-color': { const note = (data.keepNotes || []).find(item => item.id === ui.keepNote); if (note) { saveKeepNote(); note.color = ((note.color || 0) + 1) % 5; save(); render(); } break; }
          case 'keep-archive': { ui.overlay = ''; renderOverlay(); const note = (data.keepNotes || []).find(item => item.id === ui.keepNote); if (note) { saveKeepNote(); note.archived = !note.archived; ui.sub = ''; save(); render(); } break; }
          case 'keep-columns': ui.overlay = ''; renderOverlay(); data.keepSingle = !data.keepSingle; save(); render(); break;
          case 'keep-refresh': ui.overlay = ''; renderOverlay(); render(); break;
          // List and picture notes (stock-apps.js keepEditor / keepDialog).
          case 'keep-new-list': { const note = {id: 'k' + Date.now(), text: '', color: 0, list: []}; data.keepNotes = [note, ...(data.keepNotes || [])]; ui.keepNote = note.id; ui.sub = 'note'; render(); viewport.querySelector('.kp-ed-add input')?.focus(); break; }
          case 'keep-li-check': { const item = keepCurrent()?.list?.[Number(id)]; if (item) { item.checked = !item.checked; save(); render(); } break; }
          case 'keep-li-delete': { const note = keepCurrent(); if (note?.list) { note.list.splice(Number(id), 1); save(); render(); } break; }
          case 'keep-checkboxes': { ui.overlay = ''; renderOverlay(); const note = keepCurrent(); if (!note) break; saveKeepNote(); if (!note.list) { note.list = String(note.text || '').split('\n').filter(line => line.trim()).map(text => ({text, checked: false})); note.text = ''; } else if (note.list.some(item => item.checked)) ui.keepDialog = 'hide-checkboxes'; else keepToText(note, false); save(); render(); break; }
          case 'keep-hide-keep': case 'keep-hide-delete': { const note = keepCurrent(); ui.keepDialog = ''; if (note?.list) keepToText(note, action === 'keep-hide-delete'); save(); render(); break; }
          case 'keep-picture': saveKeepNote(); ui.keepDialog = 'picture'; render(); break;
          case 'keep-photo-take': { ui.keepDialog = ''; saveKeepNote(); keepAttach(cameraShoot().id, ui.sub === 'note' ? ui.keepNote : ''); break; }
          case 'keep-photo-choose': ui.keepDialog = ''; saveKeepNote(); ui.keepPhotoTo = ui.sub === 'note' ? ui.keepNote : ''; ui.docPickFor = 'keep'; ui.view = 'kk-doc-picker'; render(); break;
          case 'keep-photo-remove': saveKeepNote(); ui.keepDialog = 'remove-photo'; render(); break;
          case 'keep-photo-delete': { ui.keepDialog = ''; const note = keepCurrent(); if (note) { delete note.photo; save(); } render(); break; }
          case 'keep-dialog-close': ui.keepDialog = ''; render(); break;
          // Keep 2.0's navigation drawer: Notes, Archive, Reminders.
          case 'keep-drawer': ui.keepDrawer = !ui.keepDrawer; render(); break;
          case 'keep-landing': ui.keepView = id; ui.keepDrawer = false; render(); break;
          default: return false;
        }
        return true;
      },
      submit(form, event) {
        const values = new FormData(form);
        switch (form.dataset.form) {
          case 'keep-li-add': { const text = String(values.get('text') || '').trim(), note = keepCurrent(); if (!text || !note?.list) return; note.list.push({text, checked: false}); save(); render(); viewport.querySelector('.kp-ed-add input')?.focus(); break; }
          case 'keep-add': { const text = String(values.get('text') || '').trim(); if (!text) return; data.keepNotes = [{id: 'k' + Date.now(), text, color: (data.keepNotes || []).length % 5}, ...(data.keepNotes || [])]; save(); render(); break; }
          default: return false;
        }
        return true;
      },
      input(event) {
        if (event.target.matches('[data-keep-li]')) { const item = keepCurrent()?.list?.[Number(event.target.dataset.keepLi)]; if (item) { item.text = event.target.value; save(); } return true; }
        if (event.target.matches('.keep-text')) { const note = (data.keepNotes || []).find(item => item.id === ui.keepNote); if (note) { note.text = event.target.value; save(); } return true; }
        return false;
      },
      back() {
        if(ui.view==='keep' && KeepMore.back(keepMoreContext()))return true;
        if (ui.view === 'keep' && ui.keepDialog) { ui.keepDialog = ''; render(); return true; }
        return false;
      }
    };
  }
  const spec = {
    render: c => scope(c).render(),
    action: (name, el, event, c) => scope(c).action(name, el, event),
    submit: (form, event, c) => scope(c).submit(form, event),
    input: (event, c) => scope(c).input(event),
    back: c => scope(c).back()
  };
  for (const id of ['keep']) KK.register(id, spec);
})();
