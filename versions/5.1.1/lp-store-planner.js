/* Pocket Planner on Android 5.1.1: the Play Store's made-up app (docs/plans/play-apps.md) in the Material look of the apps
   of 2015 (AppCompat's Toolbar, CardView and FloatingActionButton). The logic and the texts are shared
   (store-apps/pocket-planner.js); store-apps/legacy-host.js hosts it in simulator.js. This file only draws it:
   - the Toolbar in the app's colorPrimary #2a6fbd (status bar colorPrimaryDark #1f5594) with the title, the week's
     progress as the subtitle and the overflow (This week, Clear completed) as the version's popup menu, extended by the
     week bar (the previous and next week arrows around the dates)
   - a card per day with the weekday, its date, "Today" on the current day and an add button; the tasks are rows with a
     Material CheckBox (drawn: abc_btn_check_material is not in the image), a tap ticks a task off, a long
     press opens its context menu (Edit task, Delete)
   - the FloatingActionButton (colorAccent #e8453c) adds a task to today, or to the first day of another week
   - the add and edit dialogs are the version's Material AlertDialog with an EditText, Cancel and OK. */
(() => {
  'use strict';
  const P = () => StoreApps.planner;
  const t = (c, k) => P().t(k, c.lang);
  const u = c => c.ui.planner ||= {offset: 0};
  const now = () => new Date();
  const check = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>';
  function render(c) {
    const s = u(c), n = now(), days = P().week(c.data, n, s.offset, c.lang), k = P().counts(c.data, n, s.offset, c.lang);
    const sub = k.total ? P().fmt('%1$d of %2$d done', c.lang, k.done, k.total) : '';
    const task = x => `<div class="lpplan-task${x.done ? ' done' : ''}" data-id="${x.id}"><button type="button" class="lpplan-check${x.done ? ' on' : ''}" data-action="lpplan-toggle" data-id="${x.id}" role="checkbox" aria-checked="${x.done}" aria-label="${c.safe(x.text)}">${check}</button><button type="button" class="lpplan-text" data-action="lpplan-toggle" data-id="${x.id}">${c.safe(x.text)}</button></div>`;
    const day = d => `<section class="lpplan-card${d.today ? ' today' : ''}"><header><div><b>${c.safe(d.weekday)}</b><small>${c.safe(d.short)}</small></div>${d.today ? `<em>${c.safe(t(c, 'Today'))}</em>` : ''}<button type="button" class="lpplan-add" data-action="lpplan-add" data-day="${d.key}" aria-label="${c.safe(t(c, 'Add task'))}"><i></i></button></header>${d.tasks.length ? d.tasks.map(task).join('') : `<p class="lpplan-empty">${c.safe(t(c, 'Nothing planned'))}</p>`}</section>`;
    return `<div class="app-view lpplan" data-no-translate><header class="lpplan-bar"><div class="lpplan-title"><b>${c.safe(t(c, 'Pocket Planner'))}</b>${sub ? `<small>${c.safe(sub)}</small>` : ''}</div><button type="button" class="lpplan-more" data-action="sth-overflow" aria-label="${c.safe(c.t('More options'))}"><img src="assets/lp-fw-ic_menu_moreoverflow_material.svg" alt=""></button></header>
      <nav class="lpplan-week"><button type="button" data-action="lpplan-week" data-step="-1" aria-label="${c.safe(t(c, 'Previous week'))}"><i class="prev"></i></button><span>${c.safe(s.offset ? P().range(c.data, n, s.offset, c.lang) : t(c, 'This week'))}</span><button type="button" data-action="lpplan-week" data-step="1" aria-label="${c.safe(t(c, 'Next week'))}"><i class="next"></i></button></nav>
      <main class="lpplan-list">${days.map(day).join('')}</main>
      <button type="button" class="lpplan-fab" data-action="lpplan-add" aria-label="${c.safe(t(c, 'Add task'))}"><i></i></button></div>`;
  }
  function editor(c, {title, value = '', onSave}) {
    c.dialog({title, html: `<input class="lpplan-input" type="text" maxlength="120" value="${c.safe(value)}" placeholder="${c.safe(t(c, 'What do you need to do?'))}" autocomplete="off">`,
      buttons: [{label: c.t('Cancel')}, {label: c.t('OK'), action: (c, v) => { if (onSave(c, v || '')) { c.save(); c.render(); } }}]});
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
      for (const row of root.querySelectorAll('.lpplan-task')) {
        let timer = 0;
        row.addEventListener('pointerdown', () => { held = false; timer = setTimeout(() => { held = true; context(c, row.dataset.id); }, 500); });
        for (const type of ['pointerup', 'pointerleave', 'pointercancel']) row.addEventListener(type, () => clearTimeout(timer));
      }
    },
    action(name, el, c) {
      const s = u(c);
      switch (name) {
        case 'lpplan-week': s.offset += +el.dataset.step; c.render(); return true;
        case 'lpplan-add': addTo(c, el.dataset.day); return true;
        case 'lpplan-toggle': if (held) { held = false; return true; } P().toggle(c.data, el.dataset.id); c.save(); c.render(); return true;
      }
      return false;
    },
    menu(c, anchor) {
      const s = u(c);
      c.menu([
        {label: t(c, 'This week'), disabled: !s.offset, action: c => { s.offset = 0; c.render(); }},
        {label: t(c, 'Clear completed'), action: c => { const n = P().clearDone(c.data, now(), s.offset, c.lang); c.save(); c.render(); c.toast(t(c, n ? 'Completed tasks cleared' : 'No completed tasks')); }}
      ], anchor);
    },
    clearData(c) { if (c.data.storeApps) delete c.data.storeApps.planner; if (c.ui.planner) c.ui.planner.offset = 0; }
  });
})();
