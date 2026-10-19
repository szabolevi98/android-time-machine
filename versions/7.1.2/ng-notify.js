/* Android 7.1.2 notifications: what apps post (NotificationManager), kept in the saved phone (c.data.notifications,
   newest first), shown as small icons in the status bar and as rows in the shade (ng-shade.js).
   - NG.notify(c, {app, icon, title, text, open: [view, sub]}) posts one; NG.notifications.cancel(c, id) takes it away.
   - The row is Notification.Builder's notification_template_material_base of N2G48C: the 53 dp NotificationHeaderView
     (paddingTop 10, paddingBottom 16, 16 dp from the start) with the 18 dp small icon, the app's name, "•" and the
     DateTimeView's relative time (showRelative: "now" under a minute, then minutes, hours, days, years in their
     *_shortest plurals); the main column 37.5 dp down (16 dp in from both sides, 16 dp above the bottom) with the title
     (TextAppearance.Material.Notification.Title, 14 sp #de000000) and the text (14 sp #8a000000), each one line. The
     small icon, the app name and the expand button take resolveContrastColor() of the notification's colour
     (notification_icon_default_color #757575 when the app sets none).
   - The simulator's own content: a new phone starts with the welcome and Alex's message, as every version
     (docs/demo-data.md); their texts follow the simulator's language (docs/data/ng-own.tsv). */
(() => {
  'use strict';
  const list = c => c.data.notifications || (c.data.notifications = []);
  const T = () => NG.text('shade');
  // The posting apps: the name the header shows and the colour the app gives its notifications (Notification.color).
  const APPS = {
    android: {name: () => T().t('framework/android_system_label'), color: '#757575'},
    // Messenger (PrebuiltBugle 2.0.906): its notifications in primary_color #2a56c6.
    messenger: {name: () => NG.text('apps').t('app_name'), color: '#2a56c6'}
  };
  const appOf = n => APPS[n.app] || {name: () => n.appName || '', color: n.color || '#757575'};

  // DateTimeView.updateRelativeTime (showRelative): now under a minute; minutes and hours by the elapsed time; days by
  // the calendar days between; years after 364 days.
  function relative(c, time) {
    const t = T(), d = Math.abs(Date.now() - time);
    if (d < 60000) return t.t('framework/now_string_shortest');
    if (d < 3600000) return t.plural('framework/duration_minutes_shortest', Math.floor(d / 60000));
    if (d < 86400000) return t.plural('framework/duration_hours_shortest', Math.floor(d / 3600000));
    if (d < 31449600000) {
      const day = x => { const v = new Date(x); return Date.UTC(v.getFullYear(), v.getMonth(), v.getDate()) / 864e5; };
      return t.plural('framework/duration_days_shortest', Math.max(1, Math.abs(day(Date.now()) - day(time))));
    }
    return t.plural('framework/duration_years_shortest', Math.floor(d / 31449600000));
  }

  // One row of the shade (ng-shade.css draws it).
  function row(c, n) {
    const app = appOf(n), safe = c.safe;
    return `<div class="ngnt-row" data-id="${n.id}" data-action="ngnt-open" style="--ngnt-color:${app.color}">
      <div class="ngnt-header"><i class="ngnt-icon" style="-webkit-mask-image:url('${safe(n.icon)}');mask-image:url('${safe(n.icon)}')"></i><span class="ngnt-app">${safe(app.name())}</span><span class="ngnt-sep">${safe(T().t('framework/notification_header_divider_symbol'))}</span><time class="ngnt-time" data-time="${n.time}">${safe(relative(c, n.time))}</time></div>
      <div class="ngnt-main"><div class="ngnt-title">${safe(n.title)}</div><div class="ngnt-text">${safe(n.text)}</div></div></div>`;
  }

  function refresh(c) {
    c.renderStatus?.();
    if (c.ui.overlay === 'shade') NG.module('shade')?.refresh?.(c);
  }
  function notify(c, n) {
    const note = {id: Date.now() + Math.floor(Math.random() * 1000), time: Date.now(), ...n};
    list(c).unshift(note); c.save(); refresh(c);
    return note;
  }
  function cancel(c, id) {
    c.data.notifications = list(c).filter(n => n.id !== +id); c.save(); refresh(c);
  }
  // Tapping a row: its content intent (the screen it opens) and FLAG_AUTO_CANCEL.
  function open(c, id) {
    const n = list(c).find(x => x.id === +id);
    if (!n) return;
    cancel(c, id);
    if (n.open) c.open(n.open[0], n.open[1] || '');
  }

  NG.notify = (c, n) => notify(c, n);
  NG.notifications = {row, relative, cancel, open, list};
  // The simulator's own first-boot notifications, as in every version: the welcome (SystemUI's ic_android, posted as
  // Android System) and Alex's message (Messenger's ic_sms_light, opening the thread).
  NG.defaults.notifications = [
    {id: 1, own: 'demo_welcome', app: 'android', icon: 'assets/sui-ic_android.svg', time: Date.now() - 2 * 60000},
    {id: 2, own: 'demo_message', app: 'messenger', icon: 'assets/bg-ic_sms_light.png', person: 1, open: ['messenger', 'conv:1'], time: Date.now() - 61 * 60000}];
  const ownTexts = n => n.own ? {...n, title: T().t(`${n.own}_title`), text: T().t(`${n.own}_text`)} : n;
  (NG.notificationSources ||= []).push(c => list(c).map(ownTexts));

  NG.register('notify', {app: false, render: () => ''});
})();
