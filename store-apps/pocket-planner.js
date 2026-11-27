/* Pocket Planner (Quiet Tools): one of the store's made-up apps (docs/plans/play-apps.md). This file is its logic and
   its own texts only, shared by every version; each version draws the app in its own look (ec-, gb-, ics-, jb-, kk-,
   lp-, mm-, ng- files). Nothing here renders HTML.
   The week on one page: the seven days of a week, each with its tasks. Tasks are added to a day, ticked off, edited and
   deleted; the week moves back and forward; the completed ones can be cleared. Kept in data.storeApps.planner:
   {tasks: {'YYYY-MM-DD': [{id, text, done}]}, next}. The week starts on Sunday in English (US) and on Monday in the
   other languages, as the phone's calendar does. */
(() => {
  'use strict';
  const T = {
    'Pocket Planner': {own: true, hu: 'Pocket Planner', de: 'Pocket Planner', fr: 'Pocket Planner', es: 'Pocket Planner'},
    'Add task': {own: true, hu: 'Feladat hozzáadása', de: 'Aufgabe hinzufügen', fr: 'Ajouter une tâche', es: 'Añadir tarea'},
    'New task': {own: true, hu: 'Új feladat', de: 'Neue Aufgabe', fr: 'Nouvelle tâche', es: 'Nueva tarea'},
    'Edit task': {own: true, hu: 'Feladat szerkesztése', de: 'Aufgabe bearbeiten', fr: 'Modifier la tâche', es: 'Editar tarea'},
    'Delete': {own: true, hu: 'Törlés', de: 'Löschen', fr: 'Supprimer', es: 'Eliminar'},
    'Save': {own: true, hu: 'Mentés', de: 'Speichern', fr: 'Enregistrer', es: 'Guardar'},
    'Cancel': {own: true, hu: 'Mégse', de: 'Abbrechen', fr: 'Annuler', es: 'Cancelar'},
    'What do you need to do?': {own: true, hu: 'Mit kell elintézned?', de: 'Was musst du erledigen?', fr: 'Que devez-vous faire ?', es: '¿Qué tienes que hacer?'},
    'This week': {own: true, hu: 'Ez a hét', de: 'Diese Woche', fr: 'Cette semaine', es: 'Esta semana'},
    'Previous week': {own: true, hu: 'Előző hét', de: 'Vorherige Woche', fr: 'Semaine précédente', es: 'Semana anterior'},
    'Next week': {own: true, hu: 'Következő hét', de: 'Nächste Woche', fr: 'Semaine suivante', es: 'Semana siguiente'},
    'Clear completed': {own: true, hu: 'Elvégzettek törlése', de: 'Erledigte löschen', fr: 'Effacer les tâches terminées', es: 'Borrar completadas'},
    'Nothing planned': {own: true, hu: 'Nincs semmi tervezve', de: 'Nichts geplant', fr: 'Rien de prévu', es: 'Nada planeado'},
    'Today': {own: true, hu: 'Ma', de: 'Heute', fr: 'Aujourd’hui', es: 'Hoy'},
    '%1$d of %2$d done': {own: true, hu: '%2$d feladatból %1$d kész', de: '%1$d von %2$d erledigt', fr: '%1$d sur %2$d terminées', es: '%1$d de %2$d hechas'},
    'No completed tasks': {own: true, hu: 'Nincs elvégzett feladat', de: 'Keine erledigten Aufgaben', fr: 'Aucune tâche terminée', es: 'No hay tareas completadas'},
    'Completed tasks cleared': {own: true, hu: 'Az elvégzett feladatok törölve', de: 'Erledigte Aufgaben gelöscht', fr: 'Tâches terminées effacées', es: 'Tareas completadas borradas'}
  };
  const text = AndroidStrings.table('store-pocket-planner', T);
  const pad = n => String(n).padStart(2, '0');
  const key = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fromKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
  const lang = l => String(l || globalThis.AndroidI18n?.language || 'en').slice(0, 2);
  const LOCALE = {en: 'en-US', hu: 'hu-HU', de: 'de-DE', fr: 'fr-FR', es: 'es-ES'};
  const locale = l => LOCALE[lang(l)] || 'en-US';
  function state(data) {
    const s = (data.storeApps ||= {}).planner ||= {tasks: {}, next: 1};
    s.tasks ||= {}; s.next ||= 1;
    return s;
  }
  // The first day of the week that holds `date`, `offset` weeks away.
  function weekStart(date, offset = 0, l) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const first = lang(l) === 'en' ? 0 : 1;
    d.setDate(d.getDate() - ((d.getDay() - first + 7) % 7) + offset * 7);
    return d;
  }
  // The seven days of the week: {key, date, today, weekday ('Monday'), short ('Nov 23'), tasks}.
  function week(data, now, offset = 0, l) {
    const start = weekStart(now, offset, l), today = key(now), s = state(data);
    return Array.from({length: 7}, (_, i) => {
      const date = new Date(start); date.setDate(start.getDate() + i);
      const k = key(date);
      return {key: k, date, today: k === today,
        weekday: date.toLocaleDateString(locale(l), {weekday: 'long'}),
        short: date.toLocaleDateString(locale(l), {month: 'short', day: 'numeric'}),
        tasks: s.tasks[k] || []};
    });
  }
  // "Nov 23 – 29" / "nov. 23. – 29." for the week's bar.
  function range(data, now, offset = 0, l) {
    const days = week(data, now, offset, l), a = days[0].date, b = days[6].date;
    try { return new Intl.DateTimeFormat(locale(l), {month: 'short', day: 'numeric'}).formatRange(a, b); }
    catch { return `${days[0].short} – ${days[6].short}`; }
  }
  const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, 120);
  function add(data, dayKey, value) {
    const v = clean(value); if (!v) return null;
    const s = state(data), task = {id: s.next++, text: v, done: false};
    (s.tasks[dayKey] ||= []).push(task);
    return task;
  }
  function find(data, id) {
    for (const [k, list] of Object.entries(state(data).tasks)) { const task = list.find(t => t.id === +id); if (task) return {day: k, task}; }
    return null;
  }
  function toggle(data, id) { const f = find(data, id); if (f) f.task.done = !f.task.done; return !!f; }
  function edit(data, id, value) { const f = find(data, id), v = clean(value); if (!f || !v) return false; f.task.text = v; return true; }
  function remove(data, id) {
    const f = find(data, id), s = state(data); if (!f) return false;
    s.tasks[f.day] = s.tasks[f.day].filter(t => t.id !== +id);
    if (!s.tasks[f.day].length) delete s.tasks[f.day];
    return true;
  }
  // Clears the completed tasks of the week shown; returns how many went.
  function clearDone(data, now, offset = 0, l) {
    const s = state(data); let n = 0;
    for (const day of week(data, now, offset, l)) {
      const list = s.tasks[day.key]; if (!list) continue;
      const keep = list.filter(t => !t.done); n += list.length - keep.length;
      if (keep.length) s.tasks[day.key] = keep; else delete s.tasks[day.key];
    }
    return n;
  }
  function counts(data, now, offset = 0, l) {
    const all = week(data, now, offset, l).flatMap(d => d.tasks);
    return {done: all.filter(t => t.done).length, total: all.length};
  }
  // The store's entry, the same in every version's catalogue.
  const STORE = {id: 'pocket-planner', name: 'Pocket Planner', developer: 'Quiet Tools', category: 'Productivity', color: '#2a6fbd', dark: '#1f5594', accent: '#e8453c',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="9" fill="#2a6fbd"/><rect x="10" y="12" width="28" height="26" rx="2" fill="#fff"/><rect x="10" y="12" width="28" height="7" rx="2" fill="#e8453c"/><path d="M17 29l4 4 9-9" fill="none" stroke="#2a6fbd" stroke-width="3"/></svg>'};
  const api = {T: text, keys: Object.keys(T), t: (k, l) => text.t(k, l), fmt: (k, l, ...a) => text.fmt(k, l, ...a), key, fromKey, state, weekStart, week, range, add, find, toggle, edit, remove, clearDone, counts, STORE};
  (globalThis.StoreApps ||= {}).planner = api;
})();
