/* Android 2.1 framework windows every app uses: the options menu, AlertDialog and Toast (framework-res ERE27).
   - c.menu(items): the icon menu (icon_menu_layout.xml: IconMenuView, rows of 65 dp, at most 3 a row and 6 items; with
     more, the sixth is More (ic_menu_more) and opens the expanded list menu, 296 dp wide, rows of 64 dp). Rows are
     filled from the bottom: the top row has the fewer items (5 = 2 + 3). Items: icon over a 14 sp textColorPrimaryInverse
     title (TextAppearance.Widget.IconMenu.Item), padding 3 / 3 / 1 dp, divider_vertical_bright / divider_horizontal_bright
     between, highlight_pressed when pressed; the panel is menu_background_fill_parent_width; options_panel_enter / exit:
     150 ms, a quarter of its height up and fading in (decelerate), half its height down and fading out (accelerate).
     items: [{label, icon, action(c)}].
   - c.dialog(spec): alert_dialog.xml with AlertController's backgrounds (title dark, message dark, list bright, buttons
     bright; full / top / center / bottom pieces, bottomMedium under a list with buttons), the window dimmed 0.6.
     spec: {title, icon, message, items: [label…], choice: 'single' | 'multi', checked, buttons: [{label, action}],
     onItem(index, c), html}. Title: textAppearanceLarge (22 sp, white); message: textAppearanceMedium (18 sp, white);
     list rows: select_dialog_item (22 sp black, 64 dp, padding 14 / 15 dp); buttons: btn_default, 14 sp black.
   - c.toast(text, long): transient_notification.xml (toast_frame, 14 sp white, shadow #bb000000 radius 2.75), bottom
     centre 64 dp up (toast_y_offset), 2 s or 3.5 s. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const F = () => EC.text('framework');
  let menu = null, dialog = null, under = null, toastTimer = 0;

  // IconMenuView.layoutItems: as few rows as the items need, the extra items in the lower rows.
  function rows(n) {
    const count = Math.ceil(n / 3), base = Math.floor(n / count), extra = n % count;
    return Array.from({length: count}, (_, i) => base + (i >= count - extra ? 1 : 0));
  }
  function renderMenu(c) {
    if (menu.expanded) {
      const list = menu.items.slice(5).map((item, i) => `<button type="button" class="ecui-xitem" data-action="ecui-item" data-index="${i + 5}"><span>${esc(item.label)}</span></button>`).join('');
      return `<div class="ecui-scrim" data-action="ecui-dismiss"></div><div class="ecui-expanded"><i class="ec-bg np-fw-menu_background"></i><div class="ecui-xlist">${list}</div></div>`;
    }
    const items = menu.items.length > 6 ? [...menu.items.slice(0, 5), {label: F().t('more_item_label'), icon: 'fw-ic_menu_more.png', more: true}] : menu.items;
    let index = 0;
    const html = rows(items.length).map(n => `<div class="ecui-row">${Array.from({length: n}, () => {
      const i = index++, item = items[i];
      return `<button type="button" class="ecui-item" data-action="ecui-item" data-index="${item.more ? 'more' : i}"${item.disabled ? ' disabled' : ''}><i class="ec-bg ec-pressed np-fw-highlight_pressed"></i>${item.icon ? `<img src="assets/${esc(item.icon)}" alt="">` : ''}<span>${esc(item.label)}</span></button>`;
    }).join('')}</div>`).join('');
    return `<div class="ecui-scrim" data-action="ecui-dismiss"></div><div class="ecui-menu${menu.closing ? ' closing' : ''}"><i class="ec-bg np-fw-menu_background_fill_parent_width"></i><div class="ecui-rows">${html}</div></div>`;
  }

  // AlertController.setBackground
  function renderDialog(c) {
    const d = dialog, panels = [];
    if (d.title || d.header) panels.push(['top', false]);
    if (d.message || d.items) panels.push(['content', !!d.items]);
    if (d.html) panels.push(['custom', !!d.inverse]);   // setInverseBackgroundForced
    if (d.buttons?.length) panels.push(['buttons', true]);
    const bg = {};
    panels.forEach(([name, light], i) => {
      const last = i === panels.length - 1, first = i === 0;
      bg[name] = panels.length === 1 ? (light ? 'full_bright' : 'full_dark')
        : first ? (light ? 'top_bright' : 'top_dark')
        : last ? (light ? (d.buttons?.length ? 'bottom_medium' : 'bottom_bright') : 'bottom_dark')
        : (light ? 'center_bright' : 'center_dark');
    });
    // AlertController.setBackground: the last panel is bottomMedium when it is light and there are buttons (the button
    // bar always is), bottomBright when light without buttons, else bottomDark.
    const piece = name => `<i class="ec-bg np-fw-popup_${bg[name]}"></i>`;
    const pad = name => `npp-fw-popup_${bg[name]}`;
    // header: a view in place of the title row (ContextMenu.setHeaderView, e.g. YouTube's thumbnail and title).
    const top = d.header ? `<div class="ecui-top ${pad('top')}">${piece('top')}<div class="ecui-title-row ecui-header">${d.header}</div></div>`
      : d.title ? `<div class="ecui-top ${pad('top')}">${piece('top')}<div class="ecui-title-row">${d.icon !== null ? `<img src="assets/${esc(d.icon || 'fw-ic_dialog_info.png')}" alt="">` : ''}<span class="ecui-title">${esc(d.title)}</span></div></div>` : '';
    let content = '';
    if (d.items) {
      const mark = i => d.choice === 'single' ? `<img class="ecui-mark" src="assets/fw-btn_radio_${d.checked === i ? 'on' : 'off'}.png" alt="">`
        : d.choice === 'multi' ? `<img class="ecui-mark" src="assets/fw-btn_check_${(d.checked || []).includes(i) ? 'on' : 'off'}.png" alt="">` : '';
      // An item is a label, or {label, icon, disabled} for add_list_item.xml rows (drawableLeft, drawablePadding 14 dp,
      // padding 15 dp); a disabled one (a context menu's setEnabled(false)) is primary_text_light_disable_only's #80000000.
      // rows: 'simple' is an adapter of simple_list_item_1 (textAppearanceLarge, 6 dp in) instead of select_dialog_item;
      // 'iconlist' Mms's IconListAdapter (icon_list_item.xml: padding 9 / 1 dp, the icon 9 dp from the text).
      content = `<div class="ecui-content ecui-list ${pad('content')}">${piece('content')}<div class="ecui-scroll">${d.items.map((item, i) => { const label = typeof item === 'string' ? item : item.label, icon = item?.icon;
        // global_actions_item.xml: the icon, a 22 sp message and a 14 sp status line under it.
        // smiley_menu_item.xml (Mms): the 20 dp icon 18 dp in, the name and the text in textAppearanceLarge, black.
        if (d.rows === 'smiley') return `<button type="button" class="ecui-li ecui-smiley" data-action="ecui-li" data-index="${i}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><img src="assets/${esc(icon)}" alt=""><span>${esc(label)}</span><span class="ecui-smiley-text">${esc(item.text)}</span></button>`;
        if (d.rows === 'global') return `<button type="button" class="ecui-li ecui-global" data-action="ecui-li" data-index="${i}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><img src="assets/${esc(icon)}" alt=""><span class="ecui-global-text"><span>${esc(label)}</span>${item.status ? `<small>${esc(item.status)}</small>` : ''}</span></button>`;
        return `<button type="button" class="ecui-li${icon ? ' ecui-li-icon' : ''}${d.rows === 'resolve' ? ' ecui-resolve' : d.rows === 'simple' ? ' ecui-simple' : d.rows === 'iconlist' ? ' ecui-iconlist' : d.rows ? ` ecui-r-${d.rows}` : ''}" data-action="ecui-li" data-index="${i}"${item?.disabled ? ' disabled' : ''}><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i>${icon ? `<img src="assets/${esc(icon)}" alt="">` : ''}<span>${esc(label)}</span>${mark(i)}</button>`; }).join('<i class="ecui-divider"></i>')}</div></div>`;
    } else if (d.message) content = `<div class="ecui-content ${pad('content')}">${piece('content')}<div class="ecui-scroll ecui-message">${esc(d.message)}</div></div>`;
    const custom = d.html ? `<div class="ecui-custom${d.inverse ? ' inverse' : ''} ${pad('custom')}">${piece('custom')}<div class="ecui-custom-inner">${d.html}</div></div>` : '';
    const buttons = d.buttons?.length ? `<div class="ecui-buttons ${pad('buttons')}">${piece('buttons')}<div class="ecui-button-row${d.buttons.length === 1 ? ' single' : ''}">${d.buttons.map((b, i) => `<button type="button" class="ecui-button" data-action="ecui-button" data-index="${i}"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(b.label)}</span></button>`).join('')}</div></div>` : '';
    return `<div class="ecui-dim${d.blur ? ' blur' : ''}${d.closing ? ' closing' : ''}" data-action="ecui-outside"></div><div class="ecui-dialog" role="dialog" aria-label="${esc(d.title || '')}">${top}${content}${custom}${buttons}</div>`;
  }

  EC.register('ui-menu', {
    app: false,
    render: c => menu ? renderMenu(c) : '',
    action(name, el, event, c) {
      if (name === 'ecui-dismiss') { closeMenu(c); return true; }
      if (name === 'ecui-item') {
        if (el.dataset.index === 'more') { menu.expanded = true; c.overlay('ui-menu'); return true; }
        const item = menu.items[Number(el.dataset.index)];
        closeMenu(c, true);
        item?.action?.(c);
        return true;
      }
      return false;
    },
    back(c) { closeMenu(c); return true; },
    menu(c) { closeMenu(c); return true; }
  });
  function closeMenu(c, instant) {
    if (!menu) return;
    if (instant || menu.expanded) { menu = null; if (c.ui.overlay === 'ui-menu') c.closeOverlay(); return; }
    menu.closing = true;
    c.el.overlay.querySelector('.ecui-menu')?.classList.add('closing');
    setTimeout(() => { menu = null; if (c.ui.overlay === 'ui-menu') c.closeOverlay(); }, 150);
  }

  EC.register('ui-dialog', {
    app: false,
    render: c => dialog ? (under ? EC.module(under).render(c) : '') + renderDialog(c) : '',
    mount(c, root) { dialog?.mount?.(root, c); },
    action(name, el, event, c) {
      if (name === 'ecui-outside') { if (dialog.cancelable !== false) closeDialog(c); return true; }
      // The button's action runs first (it may read the dialog's fields or open the next dialog), then the dialog closes.
      if (name === 'ecui-button') { const b = dialog.buttons[Number(el.dataset.index)], d = dialog; b.action?.(c, d, c.el.overlay); if (b.keep !== true && dialog === d) closeDialog(c); return true; }
      if (name === 'ecui-li') {
        const i = Number(el.dataset.index), d = dialog;
        if (d.choice === 'multi') { const set = new Set(d.checked || []); set.has(i) ? set.delete(i) : set.add(i); d.checked = [...set]; c.overlay('ui-dialog'); d.onItem?.(i, c, d); return true; }
        if (d.choice === 'single') {
          d.checked = i;
          if (!d.buttons?.length || d.closeOnChoice) { closeDialog(c); d.onItem?.(i, c, d); return true; }
          el.closest('.ecui-scroll')?.querySelectorAll('.ecui-mark').forEach((m, j) => { m.src = `assets/fw-btn_radio_${j === i ? 'on' : 'off'}.png`; });
          d.onSelect?.(i, c, d);
          return true;
        }
        closeDialog(c); d.onItem?.(i, c, d); return true;
      }
      return dialog?.action?.(name, el, event, c) || false;
    },
    submit(form, event, c) { dialog?.submit?.(form, c); },
    back(c) { if (dialog?.cancelable !== false) { const d = dialog; closeDialog(c); d.onCancel?.(c); } return true; },
    menu: () => true
  });
  function closeDialog(c) {
    dialog = null;
    if (c.ui.overlay !== 'ui-dialog') return;
    const back = under; under = null;
    if (back) c.overlay(back); else c.closeOverlay();
  }

  // SearchDialog (framework search_bar.xml): at the top on search_plate_global (padding 12 / 7 / 12 / 16 dp), the
  // searchable's 36 dp icon, the textfield_search field, the go button (btn_search_dialog with ic_btn_search) and the
  // voice button (btn_search_dialog_voice, ic_btn_speak_now); suggestions below on search_dropdown_background
  // (search_dropdown_item_icons_2line: 32 dp icon, 18 sp text over 14 sp); the rest of the screen dimmed.
  // c.searchDialog({icon, hint, value, suggest(q) → [{icon, text1, text2, value}], onGo(text), voice}).
  let search = null;
  function renderSearch() {
    const s = search;
    return `<div class="ecui-sd-dim" data-action="ecui-sd-close"></div><form class="ecui-sd npp-fw-search_plate_global" data-form="ecui-search"><i class="ec-bg np-fw-search_plate_global"></i>
      <div class="ecui-sd-row"><img class="ecui-sd-app" src="assets/${esc(s.icon)}" alt=""><span class="ecui-sd-field npp-fw-textfield_search_default"><i class="ec-bg np-fw-textfield_search_default"></i><i class="ec-bg ecwf-focus np-fw-textfield_search_selected"></i><input class="ecui-sd-input" data-ime="${esc(s.ime || 'normal')}" value="${esc(s.value || '')}" placeholder="${esc(s.hint || '')}" autocomplete="off" spellcheck="false"></span>
        <button type="submit" class="ecui-sd-go npp-fw-btn_search_dialog_default"><i class="ec-bg np-fw-btn_search_dialog_default"></i><i class="ec-bg ec-pressed np-fw-btn_search_dialog_pressed"></i><img src="assets/fw-ic_btn_search.png" alt=""></button>
        <button type="button" class="ecui-sd-voice" data-action="ecui-sd-voice"><i class="ec-bg np-fw-btn_search_dialog_voice_default"></i><i class="ec-bg ec-pressed np-fw-btn_search_dialog_voice_pressed"></i><img src="assets/fw-ic_btn_speak_now.png" alt=""></button></div></form>
      <div class="ecui-sd-list npp-fw-search_dropdown_background" hidden><i class="ec-bg np-fw-search_dropdown_background"></i><div class="ecui-sd-rows"></div></div>`;
  }
  function suggestRows(c, root) {
    const input = root.querySelector('.ecui-sd-input'), box = root.querySelector('.ecui-sd-list'), rows = search?.suggest?.(input.value) || [];
    box.hidden = !rows.length;
    box.querySelector('.ecui-sd-rows').innerHTML = rows.map((r, i) => `<button type="button" class="ecui-sd-item" data-action="ecui-sd-pick" data-index="${i}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i>${r.icon ? `<img src="assets/${esc(r.icon)}" alt="">` : ''}<span><span class="t1">${esc(r.text1)}</span>${r.text2 ? `<span class="t2">${esc(r.text2)}</span>` : ''}</span></button>`).join('');
    search.rows = rows;
  }
  EC.register('ui-search', {
    app: false,
    render: () => search ? renderSearch() : '',
    mount(c, root) {
      const input = root.querySelector('.ecui-sd-input');
      if (!input) return;
      input.addEventListener('input', () => suggestRows(c, root));
      root.querySelector('form').addEventListener('submit', event => { event.preventDefault(); const go = search.onGo, v = input.value; closeSearch(c); go?.(v); });
      setTimeout(() => { if (!input.isConnected) return; input.focus(); input.select(); input.dispatchEvent(new FocusEvent('focusin', {bubbles: true})); suggestRows(c, root); }, 30);
    },
    action(name, el, event, c) {
      if (name === 'ecui-sd-close') { closeSearch(c); return true; }
      if (name === 'ecui-sd-voice') { const v = search.voice; closeSearch(c); v ? v() : c.open('voice-search'); return true; }
      if (name === 'ecui-sd-pick') { const r = search.rows[Number(el.dataset.index)], go = search.onGo; closeSearch(c); go?.(r.value ?? r.text1); return true; }
      return false;
    },
    back(c) { closeSearch(c); return true; }
  });
  function closeSearch(c) { search = null; c.imeBack?.(); if (c.ui.overlay === 'ui-search') c.closeOverlay(); }

  EC.register('ui', {
    app: false,
    init(c) {
      // An activity window with the default theme's title bar (screen_title.xml: 25 dp windowTitleSize, title_bar,
      // TextAppearance.WindowTitle 14 sp bold white with a #bb000000 shadow) and windowContentOverlay title_bar_shadow.
      c.window = (title, inner, cls = '') => `<div class="ecwin ${cls}"><div class="ecwin-title npp-fw-title_bar"><i class="ec-bg np-fw-title_bar"></i><span>${esc(title)}</span></div><div class="ecwin-body"><div class="ecwin-content">${inner}</div><img class="ecwin-shadow" src="assets/fw-title_bar_shadow.9.png" alt=""></div></div>`;
      c.menu = items => { menu = {items}; c.overlay('ui-menu'); };
      c.searchDialog = spec => { search = {...spec}; c.overlay('ui-search'); };
      // An overlay screen that asks for it (underDialog: true, e.g. EmergencyDialer over the keyguard) stays under the
      // dialog and comes back when it closes.
      c.dialog = spec => { if (c.ui.overlay !== 'ui-dialog') under = EC.module(c.ui.overlay)?.underDialog ? c.ui.overlay : null; dialog = {...spec}; c.overlay('ui-dialog'); return dialog; };
      c.closeDialog = () => closeDialog(c);
      // Widget.SeekBar: progress_horizontal (20 dp high) with the seek_thumb (normal / pressed), thumbOffset 8 dp.
      c.seekbar = (id, value, max, extra = '') => `<div class="ecui-seek" data-seek="${esc(id)}" data-max="${max}" data-value="${value}" ${extra}><span class="ecui-seek-track"><span class="ecui-seek-fill" style="width:${value / max * 100}%"></span></span><span class="ecui-seek-thumb" style="left:${value / max * 100}%"></span></div>`;
      c.bindSeek = (root, onChange) => {
        for (const bar of root.querySelectorAll('.ecui-seek')) {
          const max = Number(bar.dataset.max);
          const set = event => {
            const r = bar.querySelector('.ecui-seek-track').getBoundingClientRect();
            const v = Math.round(Math.max(0, Math.min(1, (event.clientX - r.left) / r.width)) * max);
            bar.dataset.value = v; bar.querySelector('.ecui-seek-fill').style.width = `${v / max * 100}%`; bar.querySelector('.ecui-seek-thumb').style.left = `${v / max * 100}%`;
            onChange?.(bar.dataset.seek, v);
          };
          bar.addEventListener('pointerdown', event => { bar.setPointerCapture?.(event.pointerId); bar.classList.add('pressed'); set(event); });
          bar.addEventListener('pointermove', event => { if (bar.classList.contains('pressed')) set(event); });
          for (const t of ['pointerup', 'pointercancel']) bar.addEventListener(t, () => bar.classList.remove('pressed'));
        }
      };
      // NumberPicker (number_picker.xml): timepicker_up_btn, the 30 sp timepicker_input field, timepicker_down_btn; the
      // values wrap; a held button repeats every 300 ms (mSpeed).
      const np = (id, text, width) => `<div class="ecui-np" data-np="${id}" style="width:calc(${width} * var(--dp))"><button type="button" class="ecui-np-btn ecui-np-up" data-action="ecui-np" data-dir="1"><i class="ec-bg np-fw-timepicker_up_normal"></i><i class="ec-bg ec-pressed np-fw-timepicker_up_pressed"></i></button><div class="ecui-np-input"><i class="ec-bg np-fw-timepicker_input_normal"></i><span>${esc(text)}</span></div><button type="button" class="ecui-np-btn ecui-np-down" data-action="ecui-np" data-dir="-1"><i class="ec-bg np-fw-timepicker_down_normal"></i><i class="ec-bg ec-pressed np-fw-timepicker_down_pressed"></i></button></div>`;
      const pad2 = n => String(n).padStart(2, '0');
      const holdRepeat = (root, step) => {
        let timer = 0;
        root.addEventListener('pointerdown', event => {
          const b = event.target.closest('.ecui-np-btn'); if (!b) return;
          clearInterval(timer); timer = setInterval(() => step(b), 300);
          const stop = () => { clearInterval(timer); document.removeEventListener('pointerup', stop); };
          document.addEventListener('pointerup', stop);
        });
      };
      // c.numberPicker({title, label, value, min, max, onSet, setLabel, cancelLabel}): a dialog with a 100 dp NumberPicker that
      // stops at its ends (Mms's NumberPickerDialog$NonWrapNumberPicker: a held button repeats every 150 ms) under a 12 sp
      // centred label.
      c.numberPicker = ({title, label, value, min, max, onSet, setLabel, cancelLabel}) => {
        let v = value;
        const step = el => { v = Math.min(max, Math.max(min, v + Number(el.dataset.dir))); el.closest('.ecui-np').querySelector('span').textContent = v; };
        c.dialog({title, icon: null, html: `<div class="ecui-npdlg">${label ? `<div class="ecui-npdlg-label">${esc(label)}</div>` : ''}<div class="ecui-picker">${np('n', v, 100)}</div></div>`,
          mount: root => { let timer = 0; root.addEventListener('pointerdown', event => { const b = event.target.closest('.ecui-np-btn'); if (!b) return; clearInterval(timer); timer = setInterval(() => step(b), 150); const stop = () => { clearInterval(timer); document.removeEventListener('pointerup', stop); }; document.addEventListener('pointerup', stop); }); },
          action(name, el) { if (name !== 'ecui-np') return false; step(el); return true; },
          buttons: [{label: setLabel || F().t('date_time_set'), action: () => onSet(v)}, {label: cancelLabel || F().t('cancel')}]});
      };
      // DatePickerDialog: ic_dialog_time, the title the date in java.text.DateFormat.FULL, DatePicker (month 80 dp, day
      // 80 dp, year 95 dp, 1 dp margins; ordered as DateFormat.getDateFormatOrder; years 1900–2100), Set / Cancel.
      c.datePicker = ({date, onSet}) => {
        const v = {y: date.getFullYear(), m: date.getMonth(), d: date.getDate()}, loc = c.locale();
        const title = () => new Date(v.y, v.m, v.d).toLocaleDateString(loc, {dateStyle: 'full'});
        const days = () => new Date(v.y, v.m + 1, 0).getDate(), month = m => new Date(2000, m, 1).toLocaleDateString(loc, {month: 'short'});
        const pattern = c.shortDatePattern(), order = ['y', 'M', 'd'].sort((a, b) => pattern.indexOf(a) - pattern.indexOf(b));
        const col = k => k === 'M' ? np('M', month(v.m), 80) : k === 'd' ? np('d', v.d, 80) : np('y', v.y, 95);
        const show = root => {
          root.querySelector('[data-np="M"] span').textContent = month(v.m); root.querySelector('[data-np="d"] span').textContent = v.d;
          root.querySelector('[data-np="y"] span').textContent = v.y;
          const t = root.closest('.ecui-dialog')?.querySelector('.ecui-title'); if (t) t.textContent = title();
        };
        const step = el => {
          const k = el.closest('.ecui-np').dataset.np, dir = Number(el.dataset.dir);
          if (k === 'M') v.m = (v.m + dir + 12) % 12;
          else if (k === 'd') v.d = (v.d - 1 + dir + days()) % days() + 1;
          else v.y = v.y + dir > 2100 ? 1900 : v.y + dir < 1900 ? 2100 : v.y + dir;
          v.d = Math.min(v.d, days());
          show(el.closest('.ecui-picker'));
        };
        c.dialog({title: title(), icon: 'fw-ic_dialog_time.png', html: `<div class="ecui-picker">${order.map(col).join('')}</div>`,
          mount: root => holdRepeat(root, step),
          action(name, el) { if (name !== 'ecui-np') return false; step(el); return true; },
          buttons: [{label: F().t('date_time_set'), action: () => onSet(v.y, v.m, v.d)}, {label: F().t('cancel')}]});
      };
      // TimePickerDialog: ic_dialog_time, the title in DateFormat.getTimeFormat, TimePicker (hour and minute 70 dp, 5 dp
      // apart; 24-hour: 00–23, else 1–12 and the AM / PM button, marginTop 43 dp, padding 20 dp), Set / Cancel.
      c.timePicker = ({hour, minute, onSet}) => {
        const v = {h: hour, mi: minute}, h24 = c.is24();
        const ampm = h => c.javaAmPm(h);
        const hourText = () => h24 ? pad2(v.h) : String(v.h % 12 || 12);
        const title = () => c.timeText(new Date(2000, 0, 1, v.h, v.mi));
        const show = root => {
          root.querySelector('[data-np="h"] span').textContent = hourText(); root.querySelector('[data-np="mi"] span').textContent = pad2(v.mi);
          const b = root.querySelector('.ecui-ampm span'); if (b) b.textContent = ampm(v.h);
          const t = root.closest('.ecui-dialog')?.querySelector('.ecui-title'); if (t) t.textContent = title();
        };
        const step = el => {
          const k = el.closest('.ecui-np').dataset.np, dir = Number(el.dataset.dir);
          if (k === 'mi') v.mi = (v.mi + dir + 60) % 60;
          else if (h24) v.h = (v.h + dir + 24) % 24;
          else { const pm = v.h >= 12, h12 = (v.h % 12 + dir + 12) % 12; v.h = h12 + (pm ? 12 : 0); }
          show(el.closest('.ecui-picker'));
        };
        const amButton = h24 ? '' : `<button type="button" class="ecui-button ecui-ampm" data-action="ecui-ampm"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(ampm(v.h))}</span></button>`;
        c.dialog({title: title(), icon: 'fw-ic_dialog_time.png', html: `<div class="ecui-picker">${np('h', hourText(), 70)}${np('mi', pad2(v.mi), 70)}${amButton}</div>`,
          mount: root => holdRepeat(root, step),
          action(name, el) {
            if (name === 'ecui-np') { step(el); return true; }
            if (name === 'ecui-ampm') { v.h = (v.h + 12) % 24; show(el.closest('.ecui-picker')); return true; }
            return false;
          },
          buttons: [{label: F().t('date_time_set'), action: () => onSet(v.h, v.mi)}, {label: F().t('cancel')}]});
      };
      c.checkbox = (id, checked, label) => `<button type="button" class="ecui-check" data-action="ecui-check" data-check="${esc(id)}" aria-pressed="${!!checked}"><img src="assets/fw-btn_check_${checked ? 'on' : 'off'}.png" alt=""><span>${esc(label)}</span></button>`;
      c.toast = (text, long) => {
        let layer = c.el.screen.querySelector('.ecui-toast-layer');
        if (!layer) { layer = document.createElement('div'); layer.className = 'ecui-toast-layer'; c.el.screen.append(layer); }
        clearTimeout(toastTimer);
        layer.innerHTML = `<div class="ecui-toast npp-fw-toast_frame"><i class="ec-bg np-fw-toast_frame"></i><span>${esc(text)}</span></div>`;
        toastTimer = setTimeout(() => { const t = layer.firstElementChild; if (t) { t.classList.add('out'); setTimeout(() => t.remove(), 250); } }, long ? 3500 : 2000);
      };
    },
    render: () => ''
  });
})();
