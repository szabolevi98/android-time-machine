/* The Google app on 4.3: Google Search 2.5.9 (Velvet.apk of the Nexus 4 JWR66Y image) opened on its Google Now cards.
   velvet_main.xml: context_header_fragment (the time-of-day picture context_header_bg_dawn / _daylight / _dusk /
   _twilight with ic_google_large_light, 22 dp above centre), search_plate.xml on search_bg (ic_searh_plate_g, the
   "Search…" hint in 16 sp, ic_mic_dark), the cards on activity_background #e5e5e5 (card_background, 10 dp apart,
   CardTitle 25 sp sans-serif-light #707070, CardText 14 sp #8d8d8d, CardLightText #b5b5b5, action buttons 16 sp
   #33b5e5), and footer_fragment.xml: a 1 dp divider over the 50 dp footer with "Show more cards…" (16 sp italic #888,
   56 dp from the left) and the menu button (ic_menu_moreoverflow_smaller_dark). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // The weather pictures come from the web in Google Now; these stand in for them.
  const SUN = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5" fill="#fbc02d"/><g stroke="#fbc02d" stroke-width="2" stroke-linecap="round"><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/></g></svg>';
  const CLOUD = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="9" r="4" fill="#fbc02d"/><path d="M7 19h11a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.4 1.6A3.3 3.3 0 0 0 7 19z" fill="#cfd8dc"/></svg>';
  // VelvetTopLevelContainer picks the header picture by the time of day.
  const period = hour => hour >= 5 && hour < 8 ? 'dawn' : hour >= 8 && hour < 17 ? 'daylight' : hour >= 17 && hour < 20 ? 'dusk' : 'twilight';
  function weather(now, t, locale) {
    const temps = [[21, 13], [23, 14], [19, 12], [20, 11]];
    const days = temps.map((_, i) => new Date(now.getTime() + i * 864e5).toLocaleDateString(locale, {weekday: 'short'}));
    // weather_card.xml: the title, the current picture, conditions, wind and precipitation on the left, the temperature
    // on the right, then week_grid's label, icon, high and low rows.
    return `<section class="vn-card vn-weather"><h3>Mountain View</h3><div class="vn-weather-now"><div><span class="vn-weather-icon">${CLOUD}</span><p>${e(t('Partly cloudy'))}</p><p class="vn-wind"><img src="assets/vn-ic_weather_wind.png" alt="">13 km/h</p><p class="vn-rain"><img src="assets/vn-ic_weather_umbrella.png" alt="">10%</p></div><b>${temps[0][0]}°</b></div><table class="vn-week"><tr>${days.map(d => `<td>${e(d)}</td>`).join('')}</tr><tr>${temps.map((_, i) => `<td>${i % 2 ? SUN : CLOUD}</td>`).join('')}</tr><tr>${temps.map(([hi]) => `<td>${hi}°</td>`).join('')}</tr><tr class="vn-low">${temps.map(([, lo]) => `<td>${lo}°</td>`).join('')}</tr></table></section>`;
  }
  function render({data, t, locale, now, s}) {
    const today = now.toISOString().slice(0, 10);
    const event = (window.CalendarPrefs ? CalendarPrefs.events(data) : data.events || []).filter(item => !item.date || item.date >= today).sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')) || String(a.time || '').localeCompare(String(b.time || '')))[0];
    // next_appointment_card.xml: the title, appt_time in CardTitle, the location; it opens the event in Calendar.
    const when = event ? `${new Date(`${event.date || today}T00:00`).toLocaleDateString(locale, {weekday: 'long', month: 'long', day: 'numeric'})}${event.time ? ', ' + event.time : ''}` : '';
    const eventCard = event ? `<section class="vn-card vn-appt" data-action="open-app" data-app="calendar" role="button"><h3>${e(event.title)}</h3><p class="vn-appt-time">${e(when)}</p>${event.location ? `<p>${e(event.location)}</p>` : ''}<i></i></section>` : '';
    return `<div class="vn-page"><div class="vn-scroll"><div class="vn-header" style="background-image:url('assets/vn-context_header_bg_${period(now.getHours())}.jpg')"><img src="assets/vn-ic_google_large_light.png" alt="Google"></div><div class="vn-plate"><button class="vn-plate-text" data-action="browser-search"><img src="assets/vn-ic_searh_plate_g.png" alt=""><span>${e(s('Search…'))}</span></button><button class="vn-plate-mic" data-action="open-app" data-app="voice-search" aria-label="${e(s('Tap to speak'))}"><img src="assets/vn-ic_mic_dark.png" alt=""></button></div><div class="vn-cards">${weather(now, t, locale)}${eventCard}</div></div><footer class="vn-footer"><button class="vn-more" data-action="toast" data-id="${e(t('No more cards right now'))}">${e(s('Show more cards…'))}</button><button class="vn-menu" data-action="sa-menu" aria-label="${e(s('Menu'))}"><img src="assets/vn-ic_menu_moreoverflow_smaller_dark.png" alt=""></button></footer></div>`;
  }
  window.VelvetNow = {render};
})();
