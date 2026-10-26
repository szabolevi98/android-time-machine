/* Printing on the LMY48Y image: PrintSpooler 5.1.1's PrintActivity, which an app's Print item opens with its document:
   print_activity.xml — static_content with the destination spinner (Save as PDF, All printers…: no service of the image
   finds a printer), summary_content ("Copies:" n, "Paper size:" …) with the print_button (ic_menu_savetopdf for the
   PDF printer), print_activity_controls.xml folding open under the expand handle (Copies, Paper size, Color,
   Orientation, Pages: All n / Range of n), and the preview on print_preview_background_color (preview_page.xml: the
   white page, the material_grey_500 footer with "1 /n"), "Preparing preview…" first. Save to PDF asks DocumentsUI
   (ACTION_CREATE_DOCUMENT): "Save to" over Downloads with fragment_save.xml's name and Save. A saved PDF opens through
   ResolverActivity ("Complete action using": Drive, Play Books — the image's application/pdf handlers) in Drive's viewer.
   Use: PrintSpooler.open(ctx, {name, title, lines: [paragraphs]} or {name, image}). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const S = (ctx, key) => { const row = window.StockStrings?.print?.[key]; return row ? AndroidStrings.pick(row, ctx.language, row.en || key) : key; };
  const F = (ctx, key, ...args) => AndroidStrings.format(S(ctx, key), ...args);
  const LP = true;
  // ic_menu_savetopdf: 5.1's PDF printer icon (4.4's fake printer has none).
  const PDF_ICON = 'assets/ps-ic_menu_savetopdf.png';
  // pdf_printer_media_sizes, named by the framework's mediasize_* texts; the default is ISO A4 (the PDF printer has no
  // NA_LETTER, the en-US mediasize_default).
  const SIZES = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10'];
  const sizeName = (ctx, i) => S(ctx, `ISO ${SIZES[i]}`);
  // The document's pages: a picture fills one page; text runs into pages of about 40 lines of 80 characters.
  function pages(spec) {
    if (spec.image) return [{image: spec.image}];
    const out = [{lines: []}]; let used = spec.title ? 3 : 0;
    for (const p of spec.lines || []) {
      const h = Math.max(1, Math.ceil(String(p).length / 80)) + 1;
      if (used + h > 40 && out.at(-1).lines.length) { out.push({lines: []}); used = 0; }
      out.at(-1).lines.push(p); used += h;
    }
    return out;
  }
  const fileName = spec => `${String(spec.name || 'Document').replace(/[\\/:*?"<>|]/g, '_')}.pdf`;
  function open(ctx, spec) { ctx.ui.print = {spec, step: 'config', copies: 1, paper: 4, color: 1, orientation: spec.image ? 0 : 0, range: 0, pagesText: '', ready: Date.now() + 700}; ctx.ui.overlay = 'print'; ctx.renderOverlay();
    // "Preparing preview…" until the app has written the pages.
    if (LP) { const u = ctx.ui.print; setTimeout(() => { if (ctx.ui.print === u && u.step === 'config') ctx.renderOverlay(); }, 720); } }
  const sheet = (ctx, page, i, total, u) => `<div class="pr-page${u.orientation ? ' land' : ''}${u.color ? '' : ' bw'}"><div class="pr-sheet">${page.image ? `<img src="${e(page.image)}" alt="">` : `${i === 0 && u.spec.title ? `<h1>${e(u.spec.title)}</h1>` : ''}${page.lines.map(x => `<p>${e(x)}</p>`).join('')}`}</div>${LP ? `<div class="pr-foot">${e(F(ctx, '%1$d /%2$d', i + 1, total))}</div>` : ''}</div>`;
  const select = (ctx, field, options, value) => `<select class="pr-select" data-pr="${field}">${options.map((label, i) => `<option value="${i}"${i === value ? ' selected' : ''}>${e(label)}</option>`).join('')}</select>`;
  function config(ctx) {
    const u = ctx.ui.print, list = pages(u.spec), t = key => S(ctx, key);
    const colors = [t('color.0'), t('color.1')], orient = [t('orient.0'), t('orient.1')];
    // The PDF printer's row: printer_dropdown_item.xml, its icon left out on 4.4 (the fake printer has none).
    const pdfIcon = PDF_ICON ? `<img src="${PDF_ICON}" alt="">` : '';
    const dest = `<button type="button" class="pr-dest" data-action="pr-dest">${pdfIcon}<span>${e(t('Save as PDF'))}</span><i></i></button>${u.destOpen ? `<div class="pr-dest-drop"><button type="button" data-action="pr-dest-pick" data-id="pdf">${pdfIcon}<span>${e(t('Save as PDF'))}</span></button><button type="button" data-action="pr-dest-pick" data-id="all"><i></i><span>${e(t('All printers…'))}</span></button></div>` : ''}`;
    const copies = `<input class="pr-copies" data-pr="copies" inputmode="numeric" value="${u.copies}" aria-label="${e(t('Copies'))}">`;
    const range = u.range === 1 ? `<input class="pr-copies" data-pr="pagesText" value="${e(u.pagesText)}" placeholder="${e(t('e.g. 1—5,8,11—13'))}">` : '';
    if (!LP) {
      // print_job_config_activity_content_editing.xml: the destination spinner, then two columns (Copies, Color,
      // Pages / Paper Size, Orientation, the range field) under 13 sp #888888 caps titles, and the white Save bar.
      const opt = (title, control) => `<label class="pr-opt"><span>${e(title)}</span>${control}</label>`;
      return `<div class="pr-scrim" data-action="pr-cancel"></div><div class="pr-panel" role="dialog" aria-label="${e(t('Print dialog'))}">${dest}<div class="pr-cols"><div>${opt(t('Copies'), copies)}${opt(t('Color'), select(ctx, 'color', colors, u.color))}${opt(F(ctx, 'Pages (%1$s)', list.length), select(ctx, 'range', [t('pageopt.0'), t('pageopt.1')], u.range))}</div><div>${opt(t('Paper Size'), select(ctx, 'paper', SIZES.map((_, i) => sizeName(ctx, i)), u.paper))}${opt(t('Orientation'), select(ctx, 'orientation', orient, u.orientation))}${u.range === 1 ? opt(t('e.g. 1—5,8,11—13'), range) : ''}</div></div><div class="pr-actions"><i></i><button type="button" data-action="pr-print">${e(t('Save'))}</button></div></div>`;
    }
    // print_activity.xml: static_content's destination, summary_content (Copies: n, Paper size: …) with the
    // print_button, print_activity_controls.xml under the expand handle, and the preview on #f2f1f2.
    const ready = u.ready <= Date.now();
    const opts = u.expanded ? `<div class="pr-opts"><label><span>${e(t('Copies'))}</span>${copies}</label><label><span>${e(t('Paper size'))}</span>${select(ctx, 'paper', SIZES.map((_, i) => sizeName(ctx, i)), u.paper)}</label><label><span>${e(t('Color'))}</span>${select(ctx, 'color', colors, u.color)}</label><label><span>${e(t('Orientation'))}</span>${select(ctx, 'orientation', orient, u.orientation)}</label><label><span>${e(t('Pages'))}</span>${select(ctx, 'range', [F(ctx, 'All %1$s', list.length), F(ctx, 'Range of %1$s', list.length)], u.range)}</label>${u.range === 1 ? `<label><span>${e(t('e.g. 1—5,8,11—13'))}</span>${range}</label>` : ''}</div>` : '';
    const preview = ready ? list.map((p, i) => sheet(ctx, p, i, list.length, u)).join('') : `<div class="pr-loading">${e(t('Preparing preview…'))}</div>`;
    return `<div class="pr-activity" role="dialog" aria-label="${e(t('Print dialog'))}"><div class="pr-top">${dest}</div><div class="pr-summary"><span>${e(t('Copies:'))}</span><b>${u.copies}</b><span class="gap">${e(t('Paper size:'))}</span><b>${e(sizeName(ctx, u.paper))}</b><button type="button" class="pr-fab" data-action="pr-print" aria-label="${e(t('Save to PDF'))}"><img src="${PDF_ICON}" alt=""></button></div><div class="pr-controls">${opts}<button type="button" class="pr-handle" data-action="pr-expand" aria-label="${e(t(u.expanded ? 'Collapse handle' : 'Expand handle'))}"><img src="assets/ps-ic_expand_${u.expanded ? 'less' : 'more'}.png" alt=""></button></div><div class="pr-preview">${preview}${u.expanded ? '<div class="pr-preview-scrim" data-action="pr-expand"></div>' : ''}</div></div>`;
  }
  // DocumentsUI in save mode (ACTION_CREATE_DOCUMENT, application/pdf): "Save to" over the Downloads root's files, then
  // fragment_save.xml — the PDF mime icon, the file name with the name part selected, and Save.
  function save(ctx) {
    const u = ctx.ui.print, t = key => S(ctx, key), files = [...(ctx.data.downloads || [])].sort((a, b) => b.time - a.time);
    const rows = files.length ? files.map(f => `<div class="pr-doc"><img src="assets/ldu-ic_doc_${ctx.mime(f.name)}.png" alt=""><span><b>${e(f.name)}</b><small>${e(new Date(f.time).toLocaleDateString(ctx.locale, {month: 'short', day: 'numeric'}))}</small></span></div>`).join('') : `<p class="pr-empty">${e(t('No items'))}</p>`;
    return `<div class="pr-docs"><header class="pr-docs-bar"><img src="assets/ldu-ic_root_download.png" alt=""><span><b>${e(t('Save to'))}</b><small>${e(t('Downloads'))}</small></span></header><div class="pr-docs-list">${rows}</div><form class="pr-savebar" data-form="pr-save"><img src="assets/ldu-ic_doc_pdf.png" alt=""><input name="name" data-pr-name value="${e(u.name)}" aria-label="${e(t('Save to'))}"><button type="button" data-action="pr-save">${e(t('Save'))}</button></form></div>`;
  }
  // The framework's ResolverActivity for a file no default opens: "Complete action using", the apps that can, and Just
  // once / Always once one is chosen.
  function chooser(ctx) {
    const u = ctx.ui.print, t = key => S(ctx, key);
    return `<div class="settings-dialog-scrim" data-action="pr-cancel"></div><div class="settings-dialog pr-chooser" role="dialog" aria-label="${e(t('Complete action using'))}"><h3>${e(t('Complete action using'))}</h3>${u.apps.map(([id, icon, label]) => `<button type="button" class="pr-app${u.pick === id ? ' on' : ''}" data-action="pr-app" data-id="${id}"><img src="assets/${icon}" alt=""><span>${e(t(label))}</span></button>`).join('')}<div class="settings-dialog-actions"><button data-action="pr-once" ${u.pick ? '' : 'disabled'}>${e(t('Just once'))}</button><button data-action="pr-always" ${u.pick ? '' : 'disabled'}>${e(t('Always'))}</button></div></div>`;
  }
  // The saved PDF in Drive's viewer: its pages as they were written.
  function viewer(ctx) {
    const u = ctx.ui.print, doc = u.doc, spec = doc.pdf, list = pages(spec);
    return `<div class="pr-viewer"><header class="pr-viewer-bar"><button type="button" data-action="pr-cancel" aria-label="${e(ctx.t('Navigate up'))}"><img src="assets/lp-fw-ic_ab_back_material.svg" alt=""></button><img class="pr-viewer-app" src="assets/drive.png" alt=""><b>${e(doc.name)}</b></header><div class="pr-preview pr-viewer-pages">${list.map((p, i) => sheet(ctx, p, i, list.length, {spec, orientation: doc.orientation || 0, color: doc.color ?? 1})).join('')}</div></div>`;
  }
  function overlay(ctx) {
    const u = ctx.ui.print; if (!u) return '';
    if (u.step === 'printers') return `<div class="pr-docs pr-printers"><header class="pr-docs-bar"><button type="button" data-action="pr-printers-back" aria-label="${e(ctx.t('Navigate up'))}"><img src="assets/lp-fw-ic_ab_back_material.svg" alt=""></button><span><b>${e(S(ctx, 'All printers'))}</b></span></header><p class="pr-empty">${e(S(ctx, u.searching > Date.now() ? 'Searching for printers' : 'No printers found'))}</p></div>`;
    if (u.step === 'generating') return `<div class="pr-scrim"></div><div class="pr-panel pr-generating" role="dialog"><p>${e(S(ctx, 'Generating print job'))}<span class="pr-spinner"></span></p><div class="pr-actions"><i></i><button type="button" data-action="pr-cancel">${e(S(ctx, 'Cancel'))}</button></div></div>`;
    if (u.step === 'save') return save(ctx);
    if (u.step === 'chooser') return chooser(ctx);
    if (u.step === 'viewer') return viewer(ctx);
    return config(ctx);
  }
  const close = ctx => { ctx.ui.print = null; ctx.ui.overlay = ''; ctx.renderOverlay(); };
  // Opening a saved PDF: the chooser (Drive, Play Books), or the app chosen Always.
  function openPdf(ctx, doc) {
    const apps = [['drive', 'drive.png', 'Drive'], ['books', 'play-books.png', 'Play Books']];
    const always = ctx.data.pdfDefault && apps.find(([id]) => id === ctx.data.pdfDefault);
    ctx.ui.print = always ? {step: 'viewer', doc} : {step: 'chooser', doc, apps, pick: ''};
    if (always && always[0] !== 'drive') { ctx.ui.print = null; ctx.toast('This feature is not part of the simulator.'); return; }
    ctx.ui.overlay = 'print'; ctx.renderOverlay();
  }
  function handle(action, id, ctx) {
    const {ui, data} = ctx, u = ui.print;
    switch (action) {
      case 'pr-cancel': close(ctx); return true;
      case 'pr-dest': u.destOpen = !u.destOpen; ctx.renderOverlay(); return true;
      case 'pr-dest-pick': u.destOpen = false; if (id === 'all') { u.step = 'printers'; u.searching = Date.now() + 3000; setTimeout(() => { if (ui.print?.step === 'printers') ctx.renderOverlay(); }, 3050); } ctx.renderOverlay(); return true;
      case 'pr-printers-back': u.step = 'config'; ctx.renderOverlay(); return true;
      case 'pr-expand': u.expanded = !u.expanded; ctx.renderOverlay(); return true;
      case 'pr-print': {
        // The app writes the pages ("Generating print job" with Cancel on 4.4), then DocumentsUI asks where.
        u.name = fileName(u.spec);
        const next = () => { if (ui.print !== u) return; u.step = 'save'; ctx.renderOverlay(); const f = ctx.root.querySelector('[data-pr-name]'); if (f) { f.focus(); f.setSelectionRange(0, Math.max(0, f.value.lastIndexOf('.'))); } };
        if (LP) next(); else { u.step = 'generating'; ctx.renderOverlay(); setTimeout(next, 1200); }
        return true;
      }
      case 'pr-save': {
        const field = ctx.root.querySelector('[data-pr-name]'), name = String(field?.value || u.name || '').trim() || fileName(u.spec);
        const count = pages(u.spec).length;
        (data.downloads ||= []).unshift({name: /\.pdf$/i.test(name) ? name : `${name}.pdf`, size: 18000 + 9000 * count * u.copies, time: Date.now(), pdf: {name: u.spec.name, title: u.spec.title || '', lines: u.spec.lines || [], image: u.spec.image || ''}, orientation: u.orientation, color: u.color});
        ctx.save(); close(ctx); ctx.saved?.(); return true;
      }
      case 'pr-app': u.pick = id; ctx.renderOverlay(); return true;
      case 'pr-once': case 'pr-always': {
        if (action === 'pr-always') { data.pdfDefault = u.pick; ctx.save(); }
        if (u.pick !== 'drive') { close(ctx); ctx.toast('This feature is not part of the simulator.'); return true; }
        u.step = 'viewer'; ctx.renderOverlay(); return true;
      }
    }
    return false;
  }
  // Option fields: the spinners and the copies / range fields.
  function input(target, ctx) {
    const u = ctx.ui.print, key = target.dataset.pr; if (!u || !key) return false;
    if (key === 'copies') u.copies = Math.max(1, Math.min(99, parseInt(target.value, 10) || 1));
    else if (key === 'pagesText') u.pagesText = target.value;
    else { u[key] = Number(target.value); ctx.renderOverlay(); }
    return true;
  }
  window.PrintSpooler = {open, overlay, handle, input, openPdf, pages, SIZES};
})();
