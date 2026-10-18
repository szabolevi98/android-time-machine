/* Android 6.0.1 daydreams (DreamService) as Settings > Display > Daydream's Start now runs them, full screen until a
   touch or a key wakes the phone:
   - Clock (PrebuiltDeskClockGoogle's Screensaver, desk_clock_saver.xml): the time in the Clock's style setting (digital
     or analog, dream_settings.xml's screensaver_clock_style) with the date and the next alarm, moving every minute
     to keep from burning in; Night mode (screensaver_night_mode, on by default) dims it to a dark red.
   - Colors (BasicDreams' ColorsDream): the whole screen slowly cycling through the hues.
   - Photos (the Photos app's daydream): the phone's photos one after another, cross-fading; with none, dream_no_photos.
   The Photos daydream's settings (DreamSettingsActivity): Photos on device (Camera) and Google Accounts (the account),
   each with a check box. */
(() => {
  'use strict';
  const esc = (c, s) => c.safe(s);
  let timer = 0;
  function clockFace(c) {
    const style = MM.appPref(c, 'clock', 'screensaver_clock_style', 'digital'), night = MM.appPref(c, 'clock', 'screensaver_night_mode', 'true');
    const now = new Date(), h24 = c.data.settings.time24 ?? !new Intl.DateTimeFormat(c.locale(), {hour: 'numeric'}).resolvedOptions().hour12;
    const pos = (now.getMinutes() * 37) % 60, top = 20 + pos, left = 10 + (now.getMinutes() * 53) % 40;
    const date = new Intl.DateTimeFormat(c.locale(), {weekday: 'short', month: 'short', day: 'numeric'}).format(now), next = MM.clockNextAlarm?.(c) || '';
    const time = new Intl.DateTimeFormat(c.locale(), {hour: 'numeric', minute: '2-digit', hour12: !h24}).format(now).replace(/\s?[AP]M$/i, '');
    const analog = () => { const hr = (now.getHours() % 12 + now.getMinutes() / 60) * 30, mn = now.getMinutes() * 6; return `<svg class="mmdd-analog" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46"/><line x1="50" y1="50" x2="50" y2="26" transform="rotate(${hr} 50 50)"/><line x1="50" y1="50" x2="50" y2="14" transform="rotate(${mn} 50 50)"/></svg>`; };
    return `<div class="mmdd mmdd-clock${String(night) === 'true' ? ' night' : ''}"><div class="mmdd-face" style="top:${top}%;left:${left}%">${style === 'analog' ? analog() : `<b>${esc(c, time)}</b>`}<span>${esc(c, date)}${next ? ` · ${esc(c, next)}` : ''}</span></div></div>`;
  }
  function photosFace(c) {
    const list = (MM.media?.photos(c) || []).filter(p => !p.trashed && p.kind !== 'video');
    if (!list.length) return `<div class="mmdd"><span class="mmdd-none">${esc(c, MM.text('settings').t('Photos/dream_no_photos'))}</span></div>`;
    const i = Math.floor(Date.now() / 6000) % list.length;
    return `<div class="mmdd mmdd-photos">${MM.media.svg(list[i], 'mmdd-photo', 1)}</div>`;
  }
  MM.register('daydream', {
    app: false,
    noStatus: () => true,
    noNav: () => true,
    keepAwake: () => true,
    render(c) {
      const d = c.ui.sub || c.data.settings.dream || 'clock';
      clearTimeout(timer);
      timer = setTimeout(() => { if (c.ui.view === 'daydream') c.render(); }, d === 'photos' ? 6000 : 20000);
      if (d === 'colors') return '<div class="mmdd mmdd-colors"></div>';
      if (d === 'photos') return photosFace(c);
      return clockFace(c);
    },
    mount(c, root) {
      const wake = e => { e.preventDefault(); e.stopPropagation(); clearTimeout(timer); document.removeEventListener('keydown', key, true); c.back(); };
      const key = e => wake(e);
      root.querySelector('.mmdd')?.addEventListener('pointerdown', wake, {once: true});
      document.addEventListener('keydown', key, {capture: true, once: true});
    }
  });

  // The Photos daydream's settings.
  MM.settingsScreens = MM.settingsScreens || {};
  MM.settingsScreens['photos-dream'] = {
    title: c => MM.appLabel(c, 'photos'),
    render(c) {
      const t = MM.text('settings'), off = new Set(c.data.settings.photosDreamOff || []);
      const row = (k, label) => `<button type="button" class="mmst-pref" data-action="mmdd-src" data-k="${k}"><span class="mmst-texts"><span class="mmst-title">${esc(c, label)}</span></span><span class="mmst-widget"><i class="mmst-check${off.has(k) ? '' : ' on'}"></i></span></button>`;
      return `<div class="mmst-list"><div class="mmst-cat">${esc(c, t.t('Photos/dream_local_photos_header'))}</div>${row('camera', 'Camera')}<div class="mmst-cat">${esc(c, t.t('Photos/dream_accounts_header'))}</div>${row('account', MM.account.email)}</div>`;
    },
    action(c, name, el) {
      if (name !== 'mmdd-src') return false;
      const s = c.data.settings, off = new Set(s.photosDreamOff || []), k = el.dataset.k;
      off.has(k) ? off.delete(k) : off.add(k); s.photosDreamOff = [...off]; c.save(); c.render(); return true;
    }
  };
})();
