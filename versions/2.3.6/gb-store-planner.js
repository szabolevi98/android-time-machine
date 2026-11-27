/* Pocket Planner on Android 2.3.6: the Market's made-up app (docs/plans/play-apps.md) in the look apps had in 2011, from
   the framework of GRK39F. The logic and the texts are shared (store-apps/pocket-planner.js); store-apps/legacy-host.js
   hosts it in simulator.js. This file only draws it:
   - the default theme's window title bar (gb-titlebar) on the black window background
   - the week's header (the dates between ‹ and ›, the week's progress under them)
   - a list separator per day (dark_header: the weekday and date, "Today" on the current one; a tap adds a task to
     that day), the tasks under it as CheckedTextView rows (simple_list_item_multiple_choice: the text, btn_check at the
     right, the list selector when pressed, divider_horizontal_dark between); a tap ticks a task off, a long press opens
     its context menu (Edit task, Delete)
   - the options menu from the Menu key (IconMenuView): Add task, Previous week, Next week, This week, Clear completed
   - the add and edit dialogs are Gingerbread's AlertDialog with an EditText, OK and Cancel. */
(() => {
  'use strict';
  const P = () => StoreApps.planner;
  const t = (c, k) => P().t(k, c.lang);
  const u = c => c.ui.planner ||= {offset: 0};
  const now = () => new Date();
  function render(c) {
    const s = u(c), n = now(), days = P().week(c.data, n, s.offset, c.lang), k = P().counts(c.data, n, s.offset, c.lang);
    const week = s.offset ? P().range(c.data, n, s.offset, c.lang) : t(c, 'This week');
    const head = `<div class="gbplan-week"><button type="button" data-action="gbplan-week" data-step="-1" aria-label="${c.safe(t(c, 'Previous week'))}">‹</button><span><b>${c.safe(week)}</b>${k.total ? `<small>${c.safe(P().fmt('%1$d of %2$d done', c.lang, k.done, k.total))}</small>` : ''}</span><button type="button" data-action="gbplan-week" data-step="1" aria-label="${c.safe(t(c, 'Next week'))}">›</button></div>`;
    const day = d => `<button type="button" class="gbplan-day${d.today ? ' today' : ''}" data-action="gbplan-add" data-day="${d.key}"><b>${c.safe(d.weekday)}</b>, ${c.safe(d.short)}${d.today ? ` <em>${c.safe(t(c, 'Today'))}</em>` : ''}</button>`
      + (d.tasks.length ? d.tasks.map(x => `<button type="button" class="gbplan-task${x.done ? ' done' : ''}" data-action="gbplan-toggle" data-id="${x.id}" role="checkbox" aria-checked="${x.done}"><span>${c.safe(x.text)}</span><img src="assets/gb-btn_check_${x.done ? 'on' : 'off'}.png" alt=""></button>`).join('')
        : `<div class="gbplan-empty">${c.safe(t(c, 'Nothing planned'))}</div>`);
    return `<div class="app-view gbplan" data-no-translate><div class="gb-titlebar">${c.safe(t(c, 'Pocket Planner'))}</div><div class="gbplan-list">${head}${days.map(day).join('')}</div></div>`;
  }
  function editor(c, {title, value = '', onSave}) {
    c.dialog({title, html: `<div class="gbplan-edit"><input class="gbplan-input" type="text" maxlength="120" value="${c.safe(value)}" placeholder="${c.safe(t(c, 'What do you need to do?'))}" autocomplete="off"></div>`,
      enter: 0, buttons: [{label: c.t('OK'), action: (c, v) => { if (onSave(c, v || '')) { c.save(); c.render(); } }}, {label: c.t('Cancel')}]});
  }
  function addTo(c, dayKey) {
    if (!dayKey) { const days = P().week(c.data, now(), u(c).offset, c.lang); dayKey = (days.find(d => d.today) || days[0]).key; }
    editor(c, {title: t(c, 'New task'), onSave: (c, v) => !!P().add(c.data, dayKey, v)});
  }
  function context(c, id) {
    const f = P().find(c.data, id); if (!f) return;
    c.dialog({title: f.task.text, items: [t(c, 'Edit task'), t(c, 'Delete')], onItem: (i, c) => {
      if (i === 0) editor(c, {title: t(c, 'Edit task'), value: f.task.text, onSave: (c, v) => P().edit(c.data, f.task.id, v)});
      else { P().remove(c.data, f.task.id); c.save(); c.render(); }
    }});
  }
  let held = false;
  StoreHost.register('store-pocket-planner', {
    title: 'Pocket Planner', color: '#2a6fbd', dark: '#1f5594', version: '1.3', size: 1.6, key: 'planner',
    render,
    mount(c, root) {
      for (const row of root.querySelectorAll('.gbplan-task')) {
        let timer = 0;
        row.addEventListener('pointerdown', () => { held = false; timer = setTimeout(() => { held = true; context(c, row.dataset.id); }, 500); });
        for (const type of ['pointerup', 'pointerleave', 'pointercancel']) row.addEventListener(type, () => clearTimeout(timer));
      }
    },
    action(name, el, c) {
      const s = u(c);
      switch (name) {
        case 'gbplan-week': s.offset += +el.dataset.step; c.render(); return true;
        case 'gbplan-add': addTo(c, el.dataset.day); return true;
        case 'gbplan-toggle': if (held) { held = false; return true; } P().toggle(c.data, el.dataset.id); c.save(); c.render(); return true;
      }
      return false;
    },
    menu(c) {
      const s = u(c);
      c.menu([
        {label: t(c, 'Add task'), icon: 'ic_menu_add', action: c => addTo(c)},
        {label: t(c, 'Previous week'), icon: 'ic_menu_revert', action: c => { s.offset--; c.render(); }},
        {label: t(c, 'Next week'), icon: 'ic_menu_forward', action: c => { s.offset++; c.render(); }},
        {label: t(c, 'This week'), icon: 'ic_menu_today', disabled: !s.offset, action: c => { s.offset = 0; c.render(); }},
        {label: t(c, 'Clear completed'), icon: 'ic_menu_delete', action: c => { const n = P().clearDone(c.data, now(), s.offset, c.lang); c.save(); c.render(); c.toast(t(c, n ? 'Completed tasks cleared' : 'No completed tasks')); }}
      ]);
    },
    clearData(c) { if (c.data.storeApps) delete c.data.storeApps.planner; if (c.ui.planner) c.ui.planner.offset = 0; }
  });
})();
