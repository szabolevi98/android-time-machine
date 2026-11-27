/* Focus Timer (Calm Desk): one of the store's made-up apps (docs/plans/play-apps.md). This file is its logic and its
   own texts only, shared by every version; each version draws it in its own look. Nothing here renders HTML.
   Work in focus sessions with breaks between: 25 minutes of focus, then a 5 minute break, and a 15 minute long break
   after every fourth focus session. Start, pause and resume, reset the current session or skip to the next. The timer
   runs from the end time it keeps, so it ends while the app is closed too: tick() reports it once, for the version's
   notification. Kept in data.storeApps.focus: {mode, running, endAt, left, sessions, day, count}. */
(() => {
  'use strict';
  const T = {
    'Focus Timer': {own: true, hu: 'Focus Timer', de: 'Focus Timer', fr: 'Focus Timer', es: 'Focus Timer'},
    'Focus': {own: true, hu: 'Fókusz', de: 'Fokus', fr: 'Concentration', es: 'Concentración'},
    'Short break': {own: true, hu: 'Rövid szünet', de: 'Kurze Pause', fr: 'Pause courte', es: 'Descanso corto'},
    'Long break': {own: true, hu: 'Hosszú szünet', de: 'Lange Pause', fr: 'Pause longue', es: 'Descanso largo'},
    'Start': {own: true, hu: 'Indítás', de: 'Starten', fr: 'Démarrer', es: 'Iniciar'},
    'Pause': {own: true, hu: 'Szünet', de: 'Pausieren', fr: 'Pause', es: 'Pausar'},
    'Resume': {own: true, hu: 'Folytatás', de: 'Fortsetzen', fr: 'Reprendre', es: 'Reanudar'},
    'Reset': {own: true, hu: 'Visszaállítás', de: 'Zurücksetzen', fr: 'Réinitialiser', es: 'Restablecer'},
    'Skip': {own: true, hu: 'Kihagyás', de: 'Überspringen', fr: 'Passer', es: 'Saltar'},
    'Sessions today: %d': {own: true, hu: 'Mai fókuszidők: %d', de: 'Heutige Einheiten: %d', fr: 'Sessions aujourd’hui : %d', es: 'Sesiones de hoy: %d'},
    'Session %1$d of %2$d': {own: true, hu: '%1$d. fókuszidő a(z) %2$d-ból', de: 'Einheit %1$d von %2$d', fr: 'Session %1$d sur %2$d', es: 'Sesión %1$d de %2$d'},
    'Focus session complete': {own: true, hu: 'A fókuszidő véget ért', de: 'Fokuseinheit beendet', fr: 'Session de concentration terminée', es: 'Sesión de concentración terminada'},
    'Time for a break.': {own: true, hu: 'Ideje szünetet tartani.', de: 'Zeit für eine Pause.', fr: 'C’est l’heure de la pause.', es: 'Es hora de descansar.'},
    'Break is over': {own: true, hu: 'Vége a szünetnek', de: 'Die Pause ist vorbei', fr: 'La pause est terminée', es: 'Se acabó el descanso'},
    'Ready to focus again?': {own: true, hu: 'Kezdhetünk újra?', de: 'Bereit für die nächste Runde?', fr: 'Prêt à vous concentrer de nouveau ?', es: '¿Listo para concentrarte otra vez?'}
  };
  const text = AndroidStrings.table('store-focus-timer', T);
  const MIN = 60000, LENGTH = {focus: 25 * MIN, short: 5 * MIN, long: 15 * MIN}, LONG_EVERY = 4;
  const NAME = {focus: 'Focus', short: 'Short break', long: 'Long break'};
  const pad = n => String(n).padStart(2, '0');
  const dayOf = now => { const d = new Date(now); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  function state(data, now = Date.now()) {
    const s = (data.storeApps ||= {}).focus ||= {mode: 'focus', running: false, endAt: 0, left: LENGTH.focus, sessions: 0, day: dayOf(now), count: 0};
    // A new day starts the day's count again.
    if (s.day !== dayOf(now)) { s.day = dayOf(now); s.sessions = 0; }
    return s;
  }
  const remaining = (s, now = Date.now()) => s.running ? Math.max(0, s.endAt - now) : s.left;
  // The share of the session gone, 0 … 1, for a ring.
  const progress = (s, now = Date.now()) => 1 - remaining(s, now) / LENGTH[s.mode];
  // 25:00, 4:59 …
  const clock = ms => { const sec = Math.ceil(ms / 1000); return `${Math.floor(sec / 60)}:${pad(sec % 60)}`; };
  function start(s, now = Date.now()) { if (s.running) return false; s.endAt = now + s.left; s.running = true; return true; }
  function pause(s, now = Date.now()) { if (!s.running) return false; s.left = Math.max(0, s.endAt - now); s.running = false; return true; }
  function reset(s) { s.running = false; s.left = LENGTH[s.mode]; s.endAt = 0; }
  // The session after this one: a break after focus (long after every fourth), focus after a break.
  function next(s, completed) {
    if (s.mode === 'focus') { if (completed) { s.sessions++; s.count++; } s.mode = s.count && s.count % LONG_EVERY === 0 && completed ? 'long' : 'short'; }
    else s.mode = 'focus';
    reset(s);
  }
  const skip = s => next(s, false);
  // Checks the end: returns {ended: mode} once when a running session runs out, and moves on to the next one.
  function tick(s, now = Date.now()) {
    if (!s.running || now < s.endAt) return null;
    const ended = s.mode; next(s, true); return {ended};
  }
  // The notification for a session that ended: {title, text}.
  const ending = (ended, l) => ended === 'focus' ? {title: text.t('Focus session complete', l), text: text.t('Time for a break.', l)} : {title: text.t('Break is over', l), text: text.t('Ready to focus again?', l)};
  const STORE = {id: 'focus-timer', name: 'Focus Timer', developer: 'Calm Desk', category: 'Productivity', color: '#e53935', dark: '#b71c1c', accent: '#ffb300',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="9" fill="#e53935"/><circle cx="24" cy="26" r="14" fill="#fff"/><path d="M24 26V16" stroke="#e53935" stroke-width="3" stroke-linecap="round"/><path d="M24 26l6 4" stroke="#b71c1c" stroke-width="3" stroke-linecap="round"/><rect x="20" y="6" width="8" height="4" rx="1" fill="#fff"/></svg>'};
  // The status bar's small icon (a silhouette, as notification icons are).
  STORE.small = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M10 1h4v2h-4zM12 4a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm1 9.6V7h-2v7.4l4.2 2.5 1-1.7z"/></svg>';
  (globalThis.StoreApps ||= {}).focus = {T: text, t: (k, l) => text.t(k, l), fmt: (k, l, ...a) => text.fmt(k, l, ...a), keys: Object.keys(T), LENGTH, LONG_EVERY, NAME,
    state, remaining, progress, clock, start, pause, reset, skip, tick, ending, dayOf, STORE};
})();
