/* Movie Studio (AOSP VideoEditor, VideoEditorGoogle.apk in 4.0.4 and 4.3) as a minimal shell (owner decision
   2026-10-26): ProjectsActivity's grid with Create New Project (the name dialog, projects_project_name / untitled),
   VideoEditorActivity with the preview, the storyboard of the clips and action_bar_menu.xml: Add (Import video clip /
   Import image from the phone's pictures; Record a video, Take a photo and Import music keep the limit) and the
   overflow's Change project name and Delete project (editor_delete_project_question). Projects are kept in
   data.movieProjects ({id, name, items: [{kind: 'video' | 'image', pic}], at}). Playback, trimming, transitions,
   titles, aspect ratio and Export movie keep the simulator's limit. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const projects = data => data.movieProjects || [];
  const find = (ctx, id) => projects(ctx.data).find(p => p.id === id);
  // The projects grid (project_picker / project_picker_item): Create New Project first, then the projects.
  function picker(ctx) {
    const S = ctx.S, list = [...projects(ctx.data)].sort((a, b) => b.at - a.at);
    const tile = p => `<button class="ms-item" data-action="mst-open" data-id="${e(p.id)}"><span class="ms-thumb">${p.items.length ? ctx.thumb(p.items[0].pic) : ''}<b>${e(p.name)}</b></span></button>`;
    return `<div class="app-view kkx-app ms43">${ctx.bar({})}<div class="ms-grid"><button class="ms-item" data-action="mst-new" aria-label="${e(S('@new_project'))}"><span class="ms-thumb"><img src="assets/ms-add_video_project_big.png" alt=""><b>${e(S('@new_project'))}</b></span></button>${list.map(tile).join('')}</div>${dialog(ctx)}</div>`;
  }
  // VideoEditorActivity: the preview of the first clip over the storyboard (media_item rows).
  function editor(ctx, p) {
    const S = ctx.S;
    const add = ctx.ui.mstAdd ? `<button class="mps-scrim" data-action="mst-cancel" aria-label="${e(ctx.t('Cancel'))}"></button><nav class="ms-addmenu holo-menu">${[['mst-unavailable', 'Record a video'], ['mst-unavailable', 'Take a photo'], ['mst-import', 'Import video clip', 'video'], ['mst-import', 'Import image', 'image'], ['mst-unavailable', 'Import music']].map(([action, key, id = '']) => `<button data-action="${action}" data-id="${id}">${e(S(key))}</button>`).join('')}</nav>` : '';
    const pick = ctx.ui.mstPick ? `<button class="mps-scrim" data-action="mst-cancel" aria-label="${e(ctx.t('Cancel'))}"></button><div class="ms-pick">${[0, 1, 2, 3].map(i => `<button data-action="mst-add" data-id="${i}">${ctx.thumb(i)}${ctx.ui.mstPick === 'video' ? '<i class="ms-play"></i>' : ''}</button>`).join('')}</div>` : '';
    const strip = p.items.map((it, i) => `<span class="ms-clip">${ctx.thumb(it.pic)}${it.kind === 'video' ? '<i class="ms-play"></i>' : ''}<button class="ms-x" data-action="mst-remove" data-id="${i}" aria-label="${e(ctx.t('Remove'))}">×</button></span>`).join('');
    return `<div class="app-view kkx-app ms-editor">${ctx.bar({title: p.name, actions: `<button class="ms-act" data-action="mst-add-menu" aria-label="${e(S('Add'))}"><img src="${e(ctx.addIcon)}" alt=""></button>`})}<div class="ms-preview">${p.items.length ? ctx.thumb(p.items[0].pic) : ''}</div><div class="ms-timeline">${strip}<button class="ms-addclip" data-action="mst-add-menu" aria-label="${e(S('Add'))}">+</button></div>${add}${pick}${dialog(ctx)}</div>`;
  }
  function dialog(ctx) {
    const d = ctx.ui.mstDialog, S = ctx.S; if (!d) return '';
    const shell = (title, body, buttons) => `<button class="mps-scrim" data-action="mst-cancel" aria-label="${e(ctx.t('Cancel'))}"></button><div class="mps-dialog" role="dialog"${title ? ` aria-label="${e(title)}"` : ''}>${title ? `<h3>${e(title)}</h3>` : ''}${body}<div class="mps-buttons">${buttons}</div></div>`;
    const cancel = `<button data-action="mst-cancel">${e(ctx.t('Cancel'))}</button>`;
    if (d === 'new' || d === 'rename') { const p = d === 'rename' && find(ctx, ctx.ui.mstProject); return shell(S(d === 'new' ? '@new_project' : 'Change project name'), `<input data-mst-name autocomplete="off" maxlength="40" placeholder="${e(S('Project name'))}" value="${e(p ? p.name : '')}">`, `${cancel}<button data-action="mst-name-ok">${e(ctx.t('OK'))}</button>`); }
    if (d === 'delete') return shell('', `<p>${e(S('Do you want to delete this project?'))}</p>`, `${cancel}<button data-action="mst-delete-ok">${e(ctx.t('OK'))}</button>`);
    return '';
  }
  function render(ctx) {
    const p = ctx.ui.mstProject && find(ctx, ctx.ui.mstProject);
    return p ? editor(ctx, p) : picker(ctx);
  }
  // The editor's overflow (action_bar_menu.xml without Add, which is the bar's button).
  function menu(ctx) {
    if (!ctx.ui.mstProject) return [];
    return [['mst-unavailable', 'Change aspect ratio'], ['mst-rename', 'Change project name'], ['mst-unavailable', 'Export movie'], ['mst-delete', 'Delete project']].map(([action, key]) => ({action, title: ctx.S(key)}));
  }
  // ctx: {ui, data, t, S (studio texts), save, render, toast, refuse(), bar({title, actions}), thumb(i), addIcon}.
  function handle(action, id, ctx) {
    const {ui, data} = ctx, p = () => find(ctx, ui.mstProject);
    switch (action) {
      case 'mst-new': ui.mstDialog = 'new'; break;
      case 'mst-open': ui.mstProject = id; break;
      case 'mst-name-ok': {
        const input = document.querySelector('[data-mst-name]'), name = (input?.value || '').trim().slice(0, 40) || ctx.S('Untitled');
        if (ui.mstDialog === 'new') { const np = {id: `m${Date.now()}`, name, items: [], at: Date.now()}; data.movieProjects = [...projects(data), np]; ui.mstProject = np.id; }
        else if (p()) p().name = name;
        ui.mstDialog = ''; ctx.save(); break;
      }
      case 'mst-add-menu': ui.mstAdd = true; break;
      case 'mst-import': ui.mstAdd = false; ui.mstPick = id; break;
      case 'mst-add': if (p()) { p().items.push({kind: ui.mstPick === 'video' ? 'video' : 'image', pic: Number(id)}); p().at = Date.now(); ctx.save(); } ui.mstPick = ''; break;
      case 'mst-remove': if (p()) { p().items.splice(Number(id), 1); ctx.save(); } break;
      case 'mst-rename': ui.mstDialog = 'rename'; break;
      case 'mst-delete': ui.mstDialog = 'delete'; break;
      case 'mst-delete-ok': data.movieProjects = projects(data).filter(x => x.id !== ui.mstProject); ui.mstProject = ''; ui.mstDialog = ''; ctx.save(); break;
      case 'mst-cancel': ui.mstDialog = ''; ui.mstAdd = false; ui.mstPick = ''; break;
      case 'mst-unavailable': ui.mstAdd = false; ctx.render(); ctx.refuse(); return true;
      default: return false;
    }
    ctx.render();
    if (ui.mstDialog === 'new' || ui.mstDialog === 'rename') requestAnimationFrame(() => document.querySelector('[data-mst-name]')?.focus());
    return true;
  }
  // Back: a dialog or menu, then the editor returns to the projects.
  function back(ui) {
    if (ui.mstDialog || ui.mstAdd || ui.mstPick) { ui.mstDialog = ''; ui.mstAdd = false; ui.mstPick = ''; return true; }
    if (ui.mstProject) { ui.mstProject = ''; return true; }
    return false;
  }
  const open = ui => Object.assign(ui, {mstProject: '', mstDialog: '', mstAdd: false, mstPick: ''});
  window.MovieStudio = {render, menu, handle, back, open};
})();
