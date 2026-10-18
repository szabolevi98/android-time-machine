/* Android 6.0.1 printing: PrintSpooler's PrintActivity (MTC20K), which an app's Print item opens with its document.
   - The PrintActivity theme: Theme.DeviceDefault (dark Material) with colorPrimary material_blue_grey_900 #263238,
     colorPrimaryDark material_blue_grey_950 #21272b, colorAccent material_deep_teal_500 #009688; the window is
     translucent without a dim.
   - print_activity.xml: static_content (colorPrimary, elevation 8 dp) with the 256 dp destination Spinner
     (printer_dropdown_item.xml: the 32 dp icon, the title in textAppearanceMedium): Save as PDF (ic_menu_savetopdf, the
     only destination: no print service of the image has found a printer) and All printers…; the summary row
     ("Copies:" 1, "Paper size:" ISO A4, textAppearanceSmall / Medium) with print_button (48 dp,
     promoted_action_background_color #80cbc4, the destination's icon); print_activity_controls.xml folds open under the
     expand handle (ic_expand_more / ic_expand_less): Copies, Paper size, Color, Orientation and Pages in two columns
     (print_option_column_count 2), the Two-sided spinner only for a printer that can; the preview below on
     print_preview_background_color #f2f1f2: the document's pages (preview_page.xml: white, 8 dp margin, the 32 dp
     material_grey_500 footer with the page number), "Preparing preview…" first.
   - Save as PDF asks DocumentsUI for a place (ACTION_CREATE_DOCUMENT, application/pdf): DocumentsUI's save mode (title
     "Save to", fragment_save.xml: the PDF icon, the file name selected, SAVE) in Downloads; the file is then listed
     there. All printers… opens SelectPrinterActivity ("All printers", searching, then print_no_printers).
   Use: MM.print(c, {name: the job's name, title, lines: [paragraphs]}). */
(() => {
  'use strict';
  const T = () => MM.text('print');
  const esc = (c, s) => c.safe(s);
  MM.print = (c, spec) => { c.ui.print = {spec, expanded: false, copies: 1, paper: 0, color: 1, orientation: 0, ready: Date.now() + 700, printers: false}; c.open('print'); };

  // The document's pages: the paragraphs filled into A4 pages of roughly 40 lines of 80 characters.
  function pages(spec) {
    const out = [[]]; let used = 3;
    for (const p of spec.lines || []) {
      const h = Math.max(1, Math.ceil(String(p).length / 80)) + 1;
      if (used + h > 40 && out.at(-1).length) { out.push([]); used = 0; }
      out.at(-1).push(p); used += h;
    }
    return out;
  }
  function render(c) {
    const u = c.ui.print, t = T();
    if (!u) return '';
    if (u.printers) {
      const searching = u.printers > Date.now();
      return `<div class="mmpr dark"><div class="mmpr-bar"><button type="button" class="mmpr-up" data-action="mmpr-closeprinters"><img src="assets/fw-ic_ab_back_material.svg" alt=""></button><span>${esc(c, t.t('all_printers_label'))}</span></div>
        <div class="mmpr-empty">${searching ? `<svg class="mmpr-spin" viewBox="0 0 48 48"><circle cx="24" cy="24" r="19"/></svg>` : ''}<span>${esc(c, t.t(searching ? 'print_searching_for_printers' : 'print_no_printers'))}</span></div></div>`;
    }
    const list = pages(u.spec), paper = [t.t('framework/mediasize_iso_a4'), t.t('framework/mediasize_na_letter')];
    const spin = (key, values, field) => `<label class="mmpr-opt"><span>${esc(c, t.t(key))}</span><select data-f="${field}">${values.map((v, i) => `<option value="${i}"${u[field] === i ? ' selected' : ''}>${esc(c, v)}</option>`).join('')}</select></label>`;
    const options = u.expanded ? `<div class="mmpr-opts">
      <label class="mmpr-opt"><span>${esc(c, t.t('label_copies'))}</span><input data-f="copies" inputmode="numeric" value="${u.copies}"></label>
      ${spin('label_paper_size', paper, 'paper')}${spin('label_color', t.t('color_mode_labels'), 'color')}${spin('label_orientation', t.t('orientation_labels'), 'orientation')}
      ${spin('label_pages', [AndroidStrings.format(t.t('template_all_pages'), list.length)], 'pagesOpt')}</div>` : '';
    const ready = u.ready <= Date.now();
    const preview = ready ? list.map((p, i) => `<div class="mmpr-page${u.orientation ? ' land' : ''}${u.color ? '' : ' bw'}"><div class="mmpr-sheet">${i === 0 && u.spec.title ? `<h1>${esc(c, u.spec.title)}</h1>` : ''}${p.map(x => `<p>${esc(c, x)}</p>`).join('')}</div><div class="mmpr-foot">${AndroidStrings.format(t.t('current_page_template'), i + 1, list.length)}</div></div>`).join('')
      : `<div class="mmpr-loading">${esc(c, t.t('print_preparing_preview'))}</div>`;
    return `<div class="mmpr"><div class="mmpr-top"><button type="button" class="mmpr-dest" data-action="mmpr-dest"><img src="assets/ps-ic_menu_savetopdf.png" alt=""><span>${esc(c, t.t('save_as_pdf'))}</span><i></i></button></div>
      <div class="mmpr-summary"><span>${esc(c, t.t('label_copies_summary'))}</span><b>${u.copies}</b><span class="gap">${esc(c, t.t('label_paper_size_summary'))}</span><b>${esc(c, paper[u.paper])}</b>
        <button type="button" class="mmpr-print" data-action="mmpr-print" aria-label="${esc(c, t.t('savetopdf_button'))}"><img src="assets/ps-ic_menu_savetopdf.png" alt=""></button></div>
      <div class="mmpr-controls">${options}<button type="button" class="mmpr-handle" data-action="mmpr-expand"><img src="assets/ps-ic_expand_${u.expanded ? 'less' : 'more'}.png" alt=""></button></div>
      <div class="mmpr-preview">${preview}${u.expanded ? '<div class="mmpr-scrim" data-action="mmpr-expand"></div>' : ''}</div></div>`;
  }
  MM.register('print', {
    app: false,
    statusColor: () => '#21272b',
    render,
    mount(c, root) {
      const u = c.ui.print; if (!u) return;
      if (u.ready > Date.now()) setTimeout(() => { if (c.ui.view === 'print') c.render(); }, u.ready - Date.now() + 20);
      if (u.printers > Date.now()) setTimeout(() => { if (c.ui.view === 'print') c.render(); }, u.printers - Date.now() + 20);
      for (const el of root.querySelectorAll('.mmpr-opts [data-f]')) el.addEventListener('change', () => {
        const f = el.dataset.f, v = f === 'copies' ? Math.max(1, Math.min(99, parseInt(el.value, 10) || 1)) : +el.value;
        if (f !== 'pagesOpt') u[f] = v; c.render();
      });
    },
    back(c) { const u = c.ui.print; if (u?.printers) { u.printers = false; c.render(); return true; } if (u?.expanded) { u.expanded = false; c.render(); return true; } c.ui.print = null; return false; },
    action(name, el, event, c) {
      const u = c.ui.print, t = T();
      switch (name) {
        case 'mmpr-expand': u.expanded = !u.expanded; c.render(); return true;
        case 'mmpr-dest': c.menu([{label: t.t('save_as_pdf'), action: () => {}}, {label: t.t('all_printers'), action: c => { u.printers = Date.now() + 3000; c.render(); }}]); return true;
        case 'mmpr-closeprinters': u.printers = false; c.render(); return true;
        // PrintActivity hands the PDF to DocumentsUI's save; it finishes once the file is written.
        case 'mmpr-print': c.ui.docSave = {name: `${(u.spec.name || 'Document').replace(/[\\/:*?"<>|]/g, '_')}.pdf`, size: 18000 + 9000 * pages(u.spec).length * u.copies, mime: 'application/pdf', done: c => { c.ui.print = null; if (c.ui.view === 'print') c.back(); }}; c.open('downloads', 'save'); return true;
      }
      return false;
    }
  });
})();
