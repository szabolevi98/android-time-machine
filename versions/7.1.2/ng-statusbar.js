/* Android 7.1.2 status bar and navigation bar (SystemUI.apk, N2G48C).
   - status_bar.xml: PhoneStatusBarView, 24 dp (status_bar_height), status_bar_contents with paddingStart 6 dp and
     paddingEnd 8 dp: the notification icon area (weight 1) at the left; at the right system_icons.xml (statusIcons, the
     SignalClusterView signal_cluster_margin_start 2.5 dp from them with signal_cluster_battery_padding 7 dp: Wi-Fi, the
     4 dp status_bar_wifi_signal_spacer_width, the mobile signal with its data type) and the 9.5 x 14.5 dp
     BatteryMeterView, then the Clock (TextAppearance.StatusBar.Clock: status_bar_clock_size 14 sp, medium, white;
     status_bar_clock_starting_padding 7 dp; PhoneStatusBar hides AM / PM).
   - The bar's background is the window's: transparent over the launcher, the app's statusBarColor in an app (a module's
     statusColor(c)), else black.
   - Icons: the image's VectorDrawables in DualToneLightTheme (docs/tools/mm-vectors.py, ERA=ng; docs/data/ng-vectors.tsv).
   - BatteryMeterDrawable.draw (the N2G48C code, the same drawing as 6.0.1): the button is battery_button_height_fraction
     10.5 % of the height and half the width; the body in batterymeter_frame_color #4dffffff; the level in white, in
     battery_saver_mode_color #f4511e at 15 % and below (batterymeter_color_levels); full from 96 %; at the critical level
     (5 %) empty with battery_meter_very_low_overlay_symbol "!"; charging, the bolt (batterymeter_bolt_points) is cut out
     of the level once the level covers more than 30 % of it, drawn in white below that. Battery saver (unplugged): the
     level in the last of batterymeter_color_values (white) and batterymeter_plus_points' plus, a square two thirds of the
     body's width in its middle, cut out or drawn the same way.
   - navigation_bar: NavigationBarInflaterView with config_navBarLayout "space,back;home;recent,menu_ime": the
     navigation_side_padding space (sw400dp: 50 dp) at the start, Back, Home and Overview (KeyButtonView, navigation_key_width 80 dp,
     no padding) side by side in center_group (gravity center, a layer of its own over the ends), the menu / IME slot at the end. KeyButtonRipple: a
     white pill as tall as the key and min(width, key_button_ripple_max_width 95 dp) wide, alpha 0.2, stretched to 1.35
     times in 350 ms while pressed, fading in 450 ms. Home held: the assist gesture. */
(() => {
  'use strict';
  const A = name => `assets/sui-${name}`;
  // The simulator's battery: unplugged at page load, 87 %, a percent every four minutes, never below 15.
  const battery = {level: 87, plugged: false, since: Date.now()};
  NG.battery = () => ({...battery, level: Math.max(15, battery.level - Math.floor((Date.now() - battery.since) / 240000))});

  // BatteryMeterDrawable.draw, in dp (9.5 x 14.5).
  const BOLT = [73, 0, 392, 0, 201, 259, 442, 259, 4, 703, 157, 334, 0, 334];
  const PLUS = [3, 0, 5, 0, 5, 3, 8, 3, 8, 5, 5, 5, 5, 8, 3, 8, 3, 5, 0, 5, 0, 3, 3, 3];
  let clipIds = 0;
  function batterySvg(level, plugged, powerSave = false) {
    const W = 9.5, H = 14.5, button = H * 0.105, inset = Math.round(W * 0.25 * 3) / 3;
    const bf = {l: inset, t: 0, r: W - inset, b: button}, f = {l: 0, t: button, r: W, b: H};
    let frac = level / 100;
    if (level >= 96) frac = 1; else if (level <= 5) frac = 0;
    const levelTop = frac === 1 ? bf.t : f.t + (f.b - f.t) * (1 - frac);
    const shape = `M${bf.l} ${bf.t}H${bf.r}V${bf.b}H${f.r}V${f.b}H${f.l}V${f.t}H${bf.l}Z`;
    const color = plugged || powerSave ? '#fff' : level <= 15 ? '#f4511e' : '#fff';
    let bolt = '', cut = false;
    if (!plugged && powerSave) {
      const side = (f.r - f.l) * 2 / 3, l = f.l + (f.r - f.l - side) / 2, t = f.t + (f.b - f.t - side) / 2, pts = [];
      for (let i = 0; i < PLUS.length; i += 2) pts.push(`${l + PLUS[i] / 8 * side} ${t + PLUS[i + 1] / 8 * side}`);
      bolt = `M${pts.join('L')}Z`;
      cut = Math.min(1, Math.max(0, (t + side - levelTop) / side)) > 0.3;
    }
    if (plugged) {
      const bl = f.l + (f.r - f.l) / 4.5, bt = f.t + (f.b - f.t) / 6, br = f.r - (f.r - f.l) / 7, bb = f.b - (f.b - f.t) / 10;
      const mx = 442, my = 703, pts = [];
      for (let i = 0; i < BOLT.length; i += 2) pts.push(`${bl + BOLT[i] / mx * (br - bl)} ${bt + BOLT[i + 1] / my * (bb - bt)}`);
      bolt = `M${pts.join('L')}Z`;
      cut = Math.min(1, Math.max(0, (bb - levelTop) / (bb - bt))) > 0.3;
    }
    const id = `ngsb-lv${++clipIds}`;   // one per drawing: the status bar, the shade header and the keyguard each draw it
    const clip = `<clipPath id="${id}"><rect x="0" y="${levelTop}" width="${W}" height="${H - levelTop}"/></clipPath>`;
    const body = cut ? `<path d="${shape} ${bolt}" fill-rule="evenodd"` : `<path d="${shape}"`;
    return `<svg class="ngsb-battery" viewBox="0 0 ${W} ${H}" aria-hidden="true"><defs>${clip}</defs>${body} fill="#ffffff" fill-opacity=".302"/>`
      + `${body} fill="${color}" clip-path="url(#${id})"/>${bolt && !cut ? `<path d="${bolt}" fill="#fff"/>` : ''}`
      + `${!plugged && !powerSave && level <= 5 ? `<text x="${W / 2}" y="${f.t + (f.b - f.t) * .75}" text-anchor="middle" font-size="${H * .75}" font-weight="700" fill="#f4511e">!</text>` : ''}</svg>`;
  }
  // The battery as the status bar, the shade and the battery detail draw it (powerSave: Battery saver).
  NG.batteryMeter = (powerSave = false) => { const b = NG.battery(); return batterySvg(b.level, b.plugged, powerSave); };
  NG.batterySvg = batterySvg;

  const is24 = c => c.data.settings.time24 ?? !new Intl.DateTimeFormat(c.locale(), {hour: 'numeric'}).resolvedOptions().hour12;
  const clock = (c, now = new Date()) => is24(c) ? `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}` : `${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, '0')}`;
  NG.clockText = clock;

  // signal_cluster_view.xml: Wi-Fi, the spacer when the mobile signal shows too, the mobile signal with its data type
  // drawn over it, the airplane after its spacer (the system module decides what shows; until then Wi-Fi and mobile).
  function signalCluster(c) {
    const s = c.signal?.() || {wifi: 'stat_sys_wifi_signal_4_fully', mobile: 'stat_sys_signal_4_fully'};
    const wifi = s.wifi ? `<img class="ngsb-wifi" src="${A(`${s.wifi}.svg`)}" alt="">` : '';
    const mobile = s.mobile ? `<span class="ngsb-mobile">${[s.mobile, s.type].filter(Boolean).map(name => `<img src="${A(`${name}.svg`)}" alt="">`).join('')}</span>` : '';
    const airplane = s.airplane ? `${s.wifi ? '<i class="ngsb-spacer"></i>' : ''}<img class="ngsb-airplane" src="${A('stat_sys_airplane_mode.svg')}" alt="">` : '';
    return `<span class="ngsb-signal">${wifi}${wifi && mobile ? '<i class="ngsb-spacer"></i>' : ''}${mobile}${airplane}</span>`;
  }
  NG.signalCluster = signalCluster;

  let lastMinute = -1;
  NG.register('statusbar', {
    render(c) {
      const mod = NG.module(c.ui.view), bg = c.ui.view === 'home' ? 'transparent' : mod?.statusColor?.(c) || '#000';
      const b = NG.battery(), notes = (NG.notifications?.icons(c) || []).map(icon => `<img class="ngsb-note" src="${c.safe(icon)}" alt="">`).join('');
      const status = (c.statusIcons?.() || []).map(name => `<img class="ngsb-icon" src="${A(`${name}.svg`)}" alt="">`).join('');
      return `<div class="ngsb" style="background:${bg}" data-action="ngsb-pull"><div class="ngsb-notes">${notes}</div>
        <div class="ngsb-system"><span class="ngsb-icons">${status}</span>${signalCluster(c)}${batterySvg(b.level, b.plugged, !!c.data.settings.powerSave)}</div>
        <span class="ngsb-clock">${clock(c)}</span></div>`;
    },
    // Pulling the bar down opens the notification shade.
    action(name, el, event, c) {
      if (name !== 'ngsb-pull') return false;
      if (c.ui.overlay === 'shade' || Date.now() - (c.ui.shadePulled || 0) < 400) return true;
      const shade = NG.module('shade'); if (shade?.open) shade.open(c); else c.overlay('shade');
      return true;
    },
    tick(c, now) {
      if (now.getMinutes() === lastMinute) return;
      lastMinute = now.getMinutes();
      const el = c.el.status.querySelector('.ngsb-clock'); if (el) el.textContent = clock(c, now);
    }
  });

  // NavigationBarInflaterView: space, then back;home;recent in the centre group, then the menu / IME slot.
  NG.register('navbar', {
    render(c) {
      const key = (id, img, label) => `<button type="button" class="ngnb-key" data-key="${id}" aria-label="${c.safe(c.t(label))}"><i class="ngnb-ripple"></i><img src="${A(`${img}.png`)}" alt=""></button>`;
      const back = NG.ime?.open() ? 'ic_sysbar_back_ime' : 'ic_sysbar_back';
      return `<div class="ngnb"><span class="ngnb-side"></span><span class="ngnb-center">${key('back', back, 'Back')}${key('home', 'ic_sysbar_home', 'Home')}${key('recents', 'ic_sysbar_recent', 'Overview')}</span><span class="ngnb-side"></span></div>`;
    },
    mount(c, root) {
      for (const el of root.querySelectorAll('.ngnb-key')) {
        const press = on => el.classList.toggle('pressed', on);
        el.addEventListener('pointerdown', () => press(true));
        for (const type of ['pointerup', 'pointercancel', 'pointerleave']) el.addEventListener(type, () => press(false));
        if (el.dataset.key === 'home') c.holdable(el, () => c.key('home'), () => c.key('assist'));
        else el.addEventListener('click', () => c.key(el.dataset.key));
      }
    }
  });
})();
