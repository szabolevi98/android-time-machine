/* Android 6.0.1 status bar and navigation bar (SystemUI.apk, MTC20K).
   - status_bar.xml: PhoneStatusBarView, 24 dp (status_bar_height), status_bar_contents with paddingStart 6 dp and
     paddingEnd 8 dp: the notification icon area (weight 1) at the left; at the right system_icons.xml (statusIcons, the
     SignalClusterView 2.5 dp from them with signal_cluster_battery_padding 7 dp: Wi-Fi, the 4 dp wifi_signal_spacer,
     the mobile signal) and the 9.5 x 14.5 dp BatteryMeterView, then the Clock (TextAppearance.StatusBar.Clock:
     14 sp sans-serif-medium #fff, paddingStart 7 dp; PhoneStatusBar hides AM / PM).
   - The bar's background is the window's: transparent over the launcher, the app's statusBarColor in an app (a module's
     statusColor(c)), else system_bar_background (#ff000000).
   - Icons: the image's VectorDrawables in DualToneLightTheme (docs/tools/mm-vectors.py). On Wi-Fi the mobile icon is
     drawn "fully": MobileSignalController only shows the no-internet mark when mobile is the default network.
   - BatteryMeterView.draw: the button (terminal) is battery_button_height_fraction 10.5 % of the height and half the width
     (a quarter in from each side); the body in batterymeter_frame_color #4dffffff; the level in white (#fff4511e at 15 %
     and below, batterymeter_color_levels); full from 96 %; at the critical level (5 %) empty with a "!"; charging, the
     bolt (batterymeter_bolt_points in the body's frame: left w / 4.5, top h / 6, right w / 7, bottom h / 10) is cut out of
     the level once the level covers more than 30 % of it, drawn in white below that.
   - navigation_bar.xml (sw400dp): 50 dp navigation_side_padding, Back, Home and Overview KeyButtonViews 80 dp wide with a
     flexible gap between them, the 40 dp menu / IME key in the right padding; KeyButtonRipple: a white pill the bar's
     height round, alpha 0.2, growing 350 ms on press, fading 450 ms on release. Home held: the assist gesture. */
(() => {
  'use strict';
  const A = name => `assets/sui-${name}`;
  // The simulator's battery: unplugged at page load, 87 %, a percent every four minutes, never below 15.
  const battery = {level: 87, plugged: false, since: Date.now()};
  MM.battery = () => ({...battery, level: Math.max(15, battery.level - Math.floor((Date.now() - battery.since) / 240000))});

  // BatteryMeterView.draw, in dp (9.5 x 14.5).
  const BOLT = [73, 0, 392, 0, 201, 259, 442, 259, 4, 703, 157, 334, 0, 334];
  let clipIds = 0;
  function batterySvg(level, plugged) {
    const W = 9.5, H = 14.5, button = H * 0.105, inset = Math.round(W * 0.25 * 3) / 3;
    const bf = {l: inset, t: 0, r: W - inset, b: button}, f = {l: 0, t: button, r: W, b: H};
    let frac = level / 100;
    if (level >= 96) frac = 1; else if (level <= 5) frac = 0;
    const levelTop = frac === 1 ? bf.t : f.t + (f.b - f.t) * (1 - frac);
    const shape = `M${bf.l} ${bf.t}H${bf.r}V${bf.b}H${f.r}V${f.b}H${f.l}V${f.t}H${bf.l}Z`;
    const color = plugged ? '#fff' : level <= 15 ? '#f4511e' : '#fff';
    let bolt = '', cut = false;
    if (plugged) {
      const bl = f.l + (f.r - f.l) / 4.5, bt = f.t + (f.b - f.t) / 6, br = f.r - (f.r - f.l) / 7, bb = f.b - (f.b - f.t) / 10;
      const mx = 442, my = 703, pts = [];
      for (let i = 0; i < BOLT.length; i += 2) pts.push(`${bl + BOLT[i] / mx * (br - bl)} ${bt + BOLT[i + 1] / my * (bb - bt)}`);
      bolt = `M${pts.join('L')}Z`;
      const pct = Math.min(1, Math.max(0, (bb - levelTop) / (bb - bt)));
      cut = pct > 0.3;
    }
    const id = `mmsb-lv${++clipIds}`;   // one per drawing: the status bar, the shade header and the keyguard each draw it
    const clip = `<clipPath id="${id}"><rect x="0" y="${levelTop}" width="${W}" height="${H - levelTop}"/></clipPath>`;
    const body = cut ? `<path d="${shape} ${bolt}" fill-rule="evenodd"` : `<path d="${shape}"`;
    return `<svg class="mmsb-battery" viewBox="0 0 ${W} ${H}" aria-hidden="true"><defs>${clip}</defs>${body} fill="#ffffff" fill-opacity=".302"/>`
      + `${body} fill="${color}" clip-path="url(#${id})"/>${plugged && !cut ? `<path d="${bolt}" fill="#fff"/>` : ''}`
      + `${!plugged && level <= 5 ? `<text x="${W / 2}" y="${f.t + (f.b - f.t) * .75}" text-anchor="middle" font-size="${H * .75}" font-weight="700" fill="#f4511e">!</text>` : ''}</svg>`;
  }

  MM.batteryMeter = () => { const b = MM.battery(); return batterySvg(b.level, b.plugged); };

  const is24 = c => c.data.settings.time24 ?? !new Intl.DateTimeFormat(c.locale(), {hour: 'numeric'}).resolvedOptions().hour12;
  const clock = (c, now = MM.deviceDate(c)) => is24(c) ? `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}` : `${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, '0')}`;
  MM.clockText = clock;

  // signal_cluster_view.xml: Wi-Fi, the spacer when the mobile signal shows too, the mobile signal with its data type
  // drawn over it, the airplane after its spacer (mm-system.js decides what shows).
  function signalCluster(c) {
    const s = c.signal?.() || {wifi: 'stat_sys_wifi_signal_4_fully', mobile: 'stat_sys_signal_4_fully'};
    const wifi = s.wifi ? `<img class="mmsb-wifi" src="${A(`${s.wifi}.svg`)}" alt="">` : '';
    const mobile = s.mobile ? `<span class="mmsb-mobile">${[s.mobile, s.type].filter(Boolean).map(name => `<img src="${A(`${name}.svg`)}" alt="">`).join('')}</span>` : '';
    const airplane = s.airplane ? `${s.wifi ? '<i class="mmsb-spacer"></i>' : ''}<img class="mmsb-airplane" src="${A('stat_sys_airplane_mode.svg')}" alt="">` : '';
    return `<span class="mmsb-signal">${wifi}${wifi && mobile ? '<i class="mmsb-spacer"></i>' : ''}${mobile}${airplane}</span>`;
  }
  MM.signalCluster = signalCluster;

  let lastMinute = -1;
  MM.register('statusbar', {
    render(c) {
      const mod = MM.module(c.ui.view), bg = c.ui.view === 'home' ? 'transparent' : mod?.statusColor?.(c) || '#000';
      const b = MM.battery(), notes = (c.notifications?.() || []).map(n => `<img class="mmsb-note" src="${c.safe(n.icon)}" alt="">`).join('');
      const status = (c.statusIcons?.() || []).map(name => `<img class="mmsb-icon" src="${A(`${name}.svg`)}" alt="">`).join('');
      return `<div class="mmsb" style="background:${bg}" data-action="mmsb-pull"><div class="mmsb-notes">${notes}</div>
        <div class="mmsb-system"><span class="mmsb-icons">${status}</span>${signalCluster(c)}${batterySvg(b.level, b.plugged)}</div>
        <span class="mmsb-clock">${clock(c)}</span></div>`;
    },
    // Pulling the bar down opens the notification shade.
    action(name, el, event, c) { if (name === 'mmsb-pull') { if (c.ui.overlay === 'shade' || Date.now() - (c.ui.shadePulled || 0) < 400) return true; const shade = MM.module('shade'); if (shade) shade.open(c); else c.overlay('shade'); return true; } return false; },
    tick(c, now) {
      if (now.getMinutes() === lastMinute) return;
      lastMinute = now.getMinutes();
      const el = c.el.status.querySelector('.mmsb-clock'); if (el) el.textContent = clock(c);
    }
  });

  // navigation_bar.xml
  MM.register('navbar', {
    render(c) {
      const key = (id, img, label) => `<button type="button" class="mmnb-key" data-key="${id}" aria-label="${c.safe(c.t(label))}"><i class="mmnb-ripple"></i><img src="${A(`${img}.png`)}" alt=""></button>`;
      return `<div class="mmnb"><span class="mmnb-side"></span>${key('back', MM.ime?.open() ? 'ic_sysbar_back_ime' : 'ic_sysbar_back', 'Back')}<span class="mmnb-gap"></span>${key('home', 'ic_sysbar_home', 'Home')}<span class="mmnb-gap"></span>${key('recents', 'ic_sysbar_recent', 'Overview')}<span class="mmnb-side"></span></div>`;
    },
    mount(c, root) {
      for (const el of root.querySelectorAll('.mmnb-key')) {
        const press = on => el.classList.toggle('pressed', on);
        el.addEventListener('pointerdown', () => press(true));
        for (const type of ['pointerup', 'pointercancel', 'pointerleave']) el.addEventListener(type, () => press(false));
        if (el.dataset.key === 'home') c.holdable(el, () => c.key('home'), () => c.key('assist'));
        else el.addEventListener('click', () => c.key(el.dataset.key));
      }
    }
  });
})();
