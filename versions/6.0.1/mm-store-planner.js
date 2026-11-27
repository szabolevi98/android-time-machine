/* Pocket Planner on Android 6.0.1: the store's made-up app (docs/plans/play-apps.md) in the Material look of its time.
   The logic and the texts are shared (store-apps/pocket-planner.js); this file only draws it:
   - a Toolbar in the app's colorPrimary #2a6fbd (status bar colorPrimaryDark #1f5594) with the title, the week's
     progress as the subtitle and the overflow (This week, Clear completed), extended by the week bar (the previous and
     next week arrows around the dates)
   - a card per day (CardView, 2 dp corners and elevation) with the weekday, its date, "Today" on the current day and
     an add button; the tasks are rows with a Material CheckBox, a tap on the text edits them
   - the FloatingActionButton (colorAccent #e8453c) adds a task to today, or to the first day of another week
   - the add and edit dialogs are the framework's AlertDialog with an EditText; editing also offers Delete.
   Its module is 'store-pocket-planner': mm-play.js gives it an app entry once it is installed, so Play's Open button,
   the launcher, Recents and Settings › Apps all reach it. */
(() => {
  'use strict';
  const P = () => StoreApps.planner;
  const t = (c, k) => P().t(k, c.lang);
  const u = c => c.ui.planner ||= {offset: 0};
  const now = () => new Date();
  const check = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>';
  function task(c, x) {
    return `<div class="mmplan-task${x.done ? ' done' : ''}"><button type="button" class="mmplan-check${x.done ? ' on' : ''}" data-action="mmplan-toggle" data-id="${x.id}" role="checkbox" aria-checked="${x.done}" aria-label="${c.safe(x.text)}">${check}</button><button type="button" class="mmplan-text" data-action="mmplan-edit" data-id="${x.id}">${c.safe(x.text)}</button></div>`;
  }
  function day(c, d) {
    return `<section class="mmplan-card${d.today ? ' today' : ''}"><header><div><b>${c.safe(d.weekday)}</b><small>${c.safe(d.short)}</small></div>${d.today ? `<em>${c.safe(t(c, 'Today'))}</em>` : ''}<button type="button" class="mmplan-add" data-action="mmplan-add" data-day="${d.key}" aria-label="${c.safe(t(c, 'Add task'))}"><i></i></button></header>${d.tasks.length ? d.tasks.map(x => task(c, x)).join('') : `<p class="mmplan-empty">${c.safe(t(c, 'Nothing planned'))}</p>`}</section>`;
  }
  function render(c) {
    const s = u(c), n = now(), days = P().week(c.data, n, s.offset, c.lang), k = P().counts(c.data, n, s.offset, c.lang);
    const sub = k.total ? P().fmt('%1$d of %2$d done', c.lang, k.done, k.total) : '';
    return `<div class="mmplan"><header class="mmplan-bar"><div class="mmplan-title"><b>${c.safe(t(c, 'Pocket Planner'))}</b>${sub ? `<small>${c.safe(sub)}</small>` : ''}</div>${MM.menu.button(c)}</header>
      <nav class="mmplan-week"><button type="button" data-action="mmplan-week" data-step="-1" aria-label="${c.safe(t(c, 'Previous week'))}"><i class="prev"></i></button><span>${c.safe(s.offset ? P().range(c.data, n, s.offset, c.lang) : t(c, 'This week'))}</span><button type="button" data-action="mmplan-week" data-step="1" aria-label="${c.safe(t(c, 'Next week'))}"><i class="next"></i></button></nav>
      <main class="mmplan-list">${days.map(d => day(c, d)).join('')}</main>
      <button type="button" class="mmplan-fab" data-action="mmplan-add" aria-label="${c.safe(t(c, 'Add task'))}"><i></i></button></div>`;
  }
  // The add / edit dialog: AlertDialog with an EditText; Enter saves.
  function editor(c, {title, value = '', onSave, onDelete}) {
    let text = value;
    const save = c => { if (onSave(c, text)) { c.save(); c.render(); } };
    const buttons = [...(onDelete ? [{label: t(c, 'Delete'), neutral: true, action: onDelete}] : []), {label: t(c, 'Cancel')}, {label: t(c, 'Save'), action: save}];
    c.dialog({title, buttons,
      html: `<div class="mmst-edit mmplan-edit"><input type="text" class="mmst-input" maxlength="120" value="${c.safe(value)}" placeholder="${c.safe(t(c, 'What do you need to do?'))}" autocomplete="off"></div>`,
      mount(c, win) {
        const input = win?.querySelector('input'); if (!input) return;
        input.addEventListener('input', () => { text = input.value; });
        input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); c.closeDialog(); save(c); } });
        setTimeout(() => { input.focus(); input.setSelectionRange(input.value.length, input.value.length); });
      }});
  }
  function addTo(c, dayKey) {
    if (!dayKey) { const days = P().week(c.data, now(), u(c).offset, c.lang); dayKey = (days.find(d => d.today) || days[0]).key; }
    editor(c, {title: t(c, 'New task'), onSave: (c, v) => !!P().add(c.data, dayKey, v)});
  }
  MM.register('store-pocket-planner', {
    title: 'Pocket Planner',
    statusColor: () => P().STORE.dark,
    render,
    action(name, el, event, c) {
      const s = u(c);
      switch (name) {
        case 'mmplan-week': s.offset += +el.dataset.step; c.render(); return true;
        case 'mmplan-add': addTo(c, el.dataset.day); return true;
        case 'mmplan-toggle': P().toggle(c.data, el.dataset.id); c.save(); c.render(); return true;
        case 'mmplan-edit': {
          const f = P().find(c.data, el.dataset.id); if (!f) return true;
          editor(c, {title: t(c, 'Edit task'), value: f.task.text, onSave: (c, v) => P().edit(c.data, f.task.id, v),
            onDelete: c => { P().remove(c.data, f.task.id); c.save(); c.render(); }});
          return true;
        }
        case 'mm-menu':
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
