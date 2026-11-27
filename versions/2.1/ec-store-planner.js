/* Pocket Planner on Android 2.1: the Market's made-up app (docs/plans/play-apps.md) in the look apps had in 2010, from
   the framework of ERE27. The logic and the texts are shared (store-apps/pocket-planner.js); this file only draws it:
   - the default theme's window (c.window: title_bar with the app's name) on the black window background
   - the week's header (dark_header, the list separator: the dates between ‹ and ›, the week's progress at the right)
   - a list separator per day (the weekday and date, "Today" on the current one; a tap adds a task to that day), the
     tasks under it as CheckedTextView rows (simple_list_item_multiple_choice: the text, btn_check at the right, the
     list selector when pressed, divider_horizontal_dark between); a tap ticks a task off, a long press opens its
     context menu (Edit task, Delete)
   - the options menu from the Menu key (IconMenuView): Add task (ic_menu_add), Previous week (ic_menu_revert), Next
     week (ic_menu_forward), This week (ic_menu_today), Clear completed (ic_menu_delete)
   - the add and edit dialogs are AlertDialogs with an EditText (textfield_default / _selected), OK and Cancel.
   The Market installs it as the launcher entry 'store-pocket-planner' (ec-market.js, EC.apps). */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const P = () => StoreApps.planner;
  const F = () => EC.text('framework');
  const t = (c, k) => P().t(k, c.lang);
  const u = c => c.ui.planner ||= {offset: 0};
  const now = () => new Date();
  function render(c) {
    const s = u(c), n = now(), days = P().week(c.data, n, s.offset, c.lang), k = P().counts(c.data, n, s.offset, c.lang);
    const week = s.offset ? P().range(c.data, n, s.offset, c.lang) : t(c, 'This week');
    const head = `<div class="ecplan-week"><button type="button" data-action="ecplan-week" data-step="-1" aria-label="${esc(t(c, 'Previous week'))}">‹</button><span><b>${esc(week)}</b>${k.total ? `<small>${esc(P().fmt('%1$d of %2$d done', c.lang, k.done, k.total))}</small>` : ''}</span><button type="button" data-action="ecplan-week" data-step="1" aria-label="${esc(t(c, 'Next week'))}">›</button></div>`;
    const day = d => `<button type="button" class="ecplan-day${d.today ? ' today' : ''}" data-action="ecplan-add" data-day="${d.key}"><b>${esc(d.weekday)}</b>, ${esc(d.short)}${d.today ? ` <em>${esc(t(c, 'Today'))}</em>` : ''}</button>`
      + (d.tasks.length ? d.tasks.map(x => `<button type="button" class="ecplan-task${x.done ? ' done' : ''}" data-action="ecplan-toggle" data-id="${x.id}" role="checkbox" aria-checked="${x.done}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span>${esc(x.text)}</span><img src="assets/fw-btn_check_${x.done ? 'on' : 'off'}.png" alt=""></button><i class="ecpf-divider"></i>`).join('')
        : `<div class="ecplan-empty">${esc(t(c, 'Nothing planned'))}</div>`);
    return c.window(t(c, 'Pocket Planner'), `<div class="ecplan">${head}${days.map(day).join('')}</div>`);
  }
  // AlertDialog with an EditText: OK saves, Enter too.
  function editor(c, {title, value = '', onSave}) {
    // mount gets the overlay's root, which the closing dialog empties: keep the EditText itself.
    let input = null;
    const save = () => { if (onSave(c, input?.value || '')) { c.save(); c.render(); } };
    c.dialog({title, icon: null, html: `<div class="ecplan-edit"><span class="ecwf-edit"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ecwf-focus np-fw-textfield_selected"></i><input class="ecwf-input" maxlength="120" value="${esc(value)}" placeholder="${esc(t(c, 'What do you need to do?'))}" spellcheck="false" autocomplete="off"></span></div>`,
      mount: r => {
        input = r.querySelector('input');
        input?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); c.closeDialog(); save(); } });
        setTimeout(() => { input?.focus(); input?.setSelectionRange(input.value.length, input.value.length); }, 50);
      },
      buttons: [{label: F().t('ok'), action: save}, {label: F().t('cancel')}]});
  }
  function addTo(c, dayKey) {
    if (!dayKey) { const days = P().week(c.data, now(), u(c).offset, c.lang); dayKey = (days.find(d => d.today) || days[0]).key; }
    editor(c, {title: t(c, 'New task'), onSave: (c, v) => !!P().add(c.data, dayKey, v)});
  }
  // The task's context menu (a long press): its text as the title, Edit task and Delete.
  function context(c, id) {
    const f = P().find(c.data, id); if (!f) return;
    c.dialog({title: f.task.text, icon: null, items: [t(c, 'Edit task'), t(c, 'Delete')], onItem: i => {
      if (i === 0) editor(c, {title: t(c, 'Edit task'), value: f.task.text, onSave: (c, v) => P().edit(c.data, f.task.id, v)});
      else { P().remove(c.data, f.task.id); c.save(); c.render(); }
    }});
  }
  let held = false;
  EC.register('store-pocket-planner', {
    render,
    mount(c, root) {
      for (const row of root.querySelectorAll('.ecplan-task')) {
        let timer = 0;
        row.addEventListener('pointerdown', () => { held = false; timer = setTimeout(() => { held = true; context(c, row.dataset.id); }, 500); });
        for (const type of ['pointerup', 'pointerleave', 'pointercancel']) row.addEventListener(type, () => clearTimeout(timer));
      }
    },
    action(name, el, event, c) {
      const s = u(c);
      switch (name) {
        case 'ecplan-week': s.offset += +el.dataset.step; c.render(); return true;
        case 'ecplan-add': addTo(c, el.dataset.day); return true;
        case 'ecplan-toggle': if (held) { held = false; return true; } P().toggle(c.data, el.dataset.id); c.save(); c.render(); return true;
      }
      return false;
    },
    menu(c) {
      const s = u(c);
      c.menu([
        {label: t(c, 'Add task'), icon: 'fw-ic_menu_add.png', action: () => addTo(c)},
        {label: t(c, 'Previous week'), icon: 'fw-ic_menu_revert.png', action: () => { s.offset--; c.render(); }},
        {label: t(c, 'Next week'), icon: 'fw-ic_menu_forward.png', action: () => { s.offset++; c.render(); }},
        {label: t(c, 'This week'), icon: 'fw-ic_menu_today.png', disabled: !s.offset, action: () => { s.offset = 0; c.render(); }},
        {label: t(c, 'Clear completed'), icon: 'fw-ic_menu_delete.png', action: () => { const n = P().clearDone(c.data, now(), s.offset, c.lang); c.save(); c.render(); c.toast(t(c, n ? 'Completed tasks cleared' : 'No completed tasks')); }}
      ]);
      return true;
    },
    // Uninstalling and Settings' Clear data take the app's tasks with them.
    clearData(c) { if (c.data.storeApps) delete c.data.storeApps.planner; if (c.ui.planner) c.ui.planner.offset = 0; }
  });
})();
