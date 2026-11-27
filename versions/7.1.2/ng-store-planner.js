/* Pocket Planner on Android 7.1.2: the store's made-up app (docs/plans/play-apps.md) in the Material look of its time.
   The logic and the texts are shared (store-apps/pocket-planner.js); this file only draws it:
   - a Toolbar in the app's colorPrimary #2a6fbd (status bar colorPrimaryDark #1f5594) with the title, the week's
     progress as the subtitle and the overflow (This week, Clear completed), extended by the week bar (the previous and
     next week arrows around the dates)
   - a card per day (CardView, 2 dp corners and elevation) with the weekday, its date, "Today" on the current day and
     an add button; the tasks are rows with a Material CheckBox in the accent colour, a tap on the text edits them
   - the FloatingActionButton (colorAccent #e8453c) adds a task to today, or to the first day of another week
   - the add and edit dialogs are the framework's AlertDialog with an EditText; editing also offers Delete.
   It is registered as the store app's runtime ('demo-pocket-planner', ng-play-model.js), so the Play Store's Open
   button, the launcher, Recents and Settings › Apps all reach it. */
(() => {
  'use strict';
  const P = () => StoreApps.planner;
  const ID = 'demo-pocket-planner';
  const t = (c, k) => P().t(k, c.lang);
  const u = c => c.ui.planner ||= {offset: 0};
  const now = () => new Date();
  const check = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>';
  function task(c, x) {
    return `<div class="ngplan-task${x.done ? ' done' : ''}"><button type="button" class="ngplan-check${x.done ? ' on' : ''}" data-action="ngplan-toggle" data-id="${x.id}" role="checkbox" aria-checked="${x.done}" aria-label="${c.safe(x.text)}">${check}</button><button type="button" class="ngplan-text" data-action="ngplan-edit" data-id="${x.id}">${c.safe(x.text)}</button></div>`;
  }
  function day(c, d) {
    return `<section class="ngplan-card${d.today ? ' today' : ''}"><header><div><b>${c.safe(d.weekday)}</b><small>${c.safe(d.short)}</small></div>${d.today ? `<em>${c.safe(t(c, 'Today'))}</em>` : ''}<button type="button" class="ngplan-add" data-action="ngplan-add" data-day="${d.key}" aria-label="${c.safe(t(c, 'Add task'))}"><i></i></button></header>${d.tasks.length ? d.tasks.map(x => task(c, x)).join('') : `<p class="ngplan-empty">${c.safe(t(c, 'Nothing planned'))}</p>`}</section>`;
  }
  function render(c) {
    const s = u(c), n = now(), days = P().week(c.data, n, s.offset, c.lang), k = P().counts(c.data, n, s.offset, c.lang);
    const sub = k.total ? P().fmt('%1$d of %2$d done', c.lang, k.done, k.total) : '';
    return `<div class="ngplan"><header class="ngplan-bar"><div class="ngplan-title"><b>${c.safe(t(c, 'Pocket Planner'))}</b>${sub ? `<small>${c.safe(sub)}</small>` : ''}</div>${NG.menu.button(c)}</header>
      <nav class="ngplan-week"><button type="button" data-action="ngplan-week" data-step="-1" aria-label="${c.safe(t(c, 'Previous week'))}"><i class="prev"></i></button><span>${c.safe(s.offset ? P().range(c.data, n, s.offset, c.lang) : t(c, 'This week'))}</span><button type="button" data-action="ngplan-week" data-step="1" aria-label="${c.safe(t(c, 'Next week'))}"><i class="next"></i></button></nav>
      <main class="ngplan-list">${days.map(d => day(c, d)).join('')}</main>
      <button type="button" class="ngplan-fab" data-action="ngplan-add" aria-label="${c.safe(t(c, 'Add task'))}"><i></i></button></div>`;
  }
  // The add / edit dialog: AlertDialog with an EditText in the app's accent; Enter saves.
  function editor(c, {title, value = '', onSave, onDelete}) {
    let text = value;
    const buttons = [...(onDelete ? [{label: t(c, 'Delete'), neutral: true, action: onDelete}] : []),
      {label: t(c, 'Cancel')}, {label: t(c, 'Save'), action: c => { if (onSave(c, text)) { c.save(); c.render(); } }}];
    c.dialog({title, accent: P().STORE.color, buttons,
      html: `<div class="ngst-edit ngplan-edit"><input type="text" class="ngst-input" maxlength="120" value="${c.safe(value)}" placeholder="${c.safe(t(c, 'What do you need to do?'))}" autocomplete="off"></div>`,
      mount(c, win) {
        const input = win?.querySelector('input'); if (!input) return;
        input.addEventListener('input', () => { text = input.value; });
        input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); c.closeDialog(); if (onSave(c, text)) { c.save(); c.render(); } } });
        setTimeout(() => { input.focus(); input.setSelectionRange(input.value.length, input.value.length); });
      }});
  }
  function addTo(c, dayKey) {
    if (!dayKey) { const s = u(c), days = P().week(c.data, now(), s.offset, c.lang); dayKey = (days.find(d => d.today) || days[0]).key; }
    editor(c, {title: t(c, 'New task'), onSave: (c, v) => !!P().add(c.data, dayKey, v)});
  }
  NG.register(ID, {
    title: 'Pocket Planner',
    statusColor: () => P().STORE.dark,
    dialogAccent: () => P().STORE.color,
    render,
    action(name, el, event, c) {
      const s = u(c);
      switch (name) {
        case 'ngplan-week': s.offset += +el.dataset.step; c.render(); return true;
        case 'ngplan-add': addTo(c, el.dataset.day); return true;
        case 'ngplan-toggle': P().toggle(c.data, el.dataset.id); c.save(); c.render(); return true;
        case 'ngplan-edit': {
          const f = P().find(c.data, el.dataset.id); if (!f) return true;
          editor(c, {title: t(c, 'Edit task'), value: f.task.text, onSave: (c, v) => P().edit(c.data, f.task.id, v),
            onDelete: c => { P().remove(c.data, f.task.id); c.save(); c.render(); }});
          return true;
        }
        case 'ng-menu':
          c.menu([
            {label: t(c, 'This week'), disabled: !s.offset, action: c => { s.offset = 0; c.render(); }},
            {label: t(c, 'Clear completed'), action: c => { const n = P().clearDone(c.data, now(), s.offset, c.lang); c.save(); c.render(); c.toast(t(c, n ? 'Completed tasks cleared' : 'No completed tasks')); }}
          ], el);
          return true;
      }
      return false;
    },
    // Settings › Apps › Clear data, and uninstalling, take the app's tasks with them.
    clearData(c) { if (c.data.storeApps) delete c.data.storeApps.planner; if (c.ui.planner) c.ui.planner.offset = 0; }
  });
})();
