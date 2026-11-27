/* Pocket Planner on Android 4.3: the Play Store's made-up app (docs/plans/play-apps.md) in the Holo look of the apps of
   2012–2013 (Theme.Holo.Light.DarkActionBar with the app's own action bar colour). The logic and the texts are shared
   (store-apps/pocket-planner.js); store-apps/legacy-host.js hosts it in simulator.js. This file only draws it:
   - the action bar (48 dp, #2a6fbd): the app icon and its title, the week's progress under it, the add action and the
     overflow (ic_menu_moreoverflow_normal_holo_dark: This week, Clear completed) as a Holo popup menu
   - the week bar (the previous and next week around the dates, borderless buttons)
   - a Holo list section header per day (bold caps, a divider under it, the app colour on today; a tap adds a task to
     that day), the tasks as rows with a Holo CheckBox (btn_check_*_holo_light); a tap ticks a task off, a long press
     opens its floating context menu (Edit task, Delete)
   - the add and edit dialogs are the version's AlertDialog with an EditText, Cancel and OK. */
(() => {
  'use strict';
  const P = () => StoreApps.planner;
  const t = (c, k) => P().t(k, c.lang);
  const u = c => c.ui.planner ||= {offset: 0};
  const now = () => new Date();
  const ok = c => c.t('OK'), cancel = c => c.t('Cancel');
  function render(c) {
    const s = u(c), n = now(), days = P().week(c.data, n, s.offset, c.lang), k = P().counts(c.data, n, s.offset, c.lang);
    const week = s.offset ? P().range(c.data, n, s.offset, c.lang) : t(c, 'This week');
    const day = d => `<button type="button" class="jbplan-day${d.today ? ' today' : ''}" data-action="jbplan-add" data-day="${d.key}"><span>${c.safe(d.weekday)} · ${c.safe(d.short)}</span>${d.today ? `<em>${c.safe(t(c, 'Today'))}</em>` : ''}</button>`
      + (d.tasks.length ? d.tasks.map(x => `<button type="button" class="jbplan-task${x.done ? ' done' : ''}" data-action="jbplan-toggle" data-id="${x.id}" role="checkbox" aria-checked="${x.done}"><img src="assets/btn_check_${x.done ? 'on' : 'off'}_holo_light.png" alt=""><span>${c.safe(x.text)}</span></button>`).join('')
        : `<p class="jbplan-empty">${c.safe(t(c, 'Nothing planned'))}</p>`);
    return `<div class="app-view jbplan" data-no-translate><header class="jbplan-bar"><img class="jbplan-icon" src="assets/store-pocket-planner.png" alt=""><div class="jbplan-title"><b>${c.safe(t(c, 'Pocket Planner'))}</b>${k.total ? `<small>${c.safe(P().fmt('%1$d of %2$d done', c.lang, k.done, k.total))}</small>` : ''}</div><button type="button" class="jbplan-action" data-action="jbplan-add" aria-label="${c.safe(t(c, 'Add task'))}"><i></i></button><button type="button" class="jbplan-action" data-action="sth-overflow" aria-label="${c.safe(c.t('More options'))}"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button></header>
      <nav class="jbplan-week"><button type="button" data-action="jbplan-week" data-step="-1" aria-label="${c.safe(t(c, 'Previous week'))}">‹</button><span>${c.safe(week)}</span><button type="button" data-action="jbplan-week" data-step="1" aria-label="${c.safe(t(c, 'Next week'))}">›</button></nav>
      <main class="jbplan-list">${days.map(day).join('')}</main></div>`;
  }
  function editor(c, {title, value = '', onSave}) {
    c.dialog({title, html: `<input class="jbplan-input" type="text" maxlength="120" value="${c.safe(value)}" placeholder="${c.safe(t(c, 'What do you need to do?'))}" autocomplete="off">`,
      buttons: [{label: cancel(c)}, {label: ok(c), action: (c, v) => { if (onSave(c, v || '')) { c.save(); c.render(); } }}]});
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
      for (const row of root.querySelectorAll('.jbplan-task')) {
        let timer = 0;
        row.addEventListener('pointerdown', () => { held = false; timer = setTimeout(() => { held = true; context(c, row.dataset.id); }, 500); });
        for (const type of ['pointerup', 'pointerleave', 'pointercancel']) row.addEventListener(type, () => clearTimeout(timer));
      }
    },
    action(name, el, c) {
      const s = u(c);
      switch (name) {
        case 'jbplan-week': s.offset += +el.dataset.step; c.render(); return true;
        case 'jbplan-add': addTo(c, el.dataset.day); return true;
        case 'jbplan-toggle': if (held) { held = false; return true; } P().toggle(c.data, el.dataset.id); c.save(); c.render(); return true;
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
