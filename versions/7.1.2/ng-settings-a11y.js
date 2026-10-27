/* Android 7.1.2 Settings: Accessibility (SettingsGoogle N2G48C) and the Font size / Display size pages, as
   NG.settingsHooks and screens. The logic is 6.0.1's (its accessibility services, toggles and captions code); N2G48C
   decides what differs:
   - AccessibilitySettings: the services the image installs (talkback.apk's TalkBack, whose service has no label so the
     application's, and Switch Access, enabled from -v21), each Off / On; Captions, Magnification gesture, Click after
     pointer stops moving and Color correction On / Off (updateFeatureSummary); Font size and Display size with their
     current step; High contrast text; Power button ends call (a voice-capable phone); Auto-rotate screen (the rotation
     lock's opposite); Speak passwords; Large mouse pointer; Mono audio; Accessibility shortcut On / Off; Text-to-speech
     output; Touch & hold delay; Color inversion.
   - ToggleAccessibilityServicePreferenceFragment: the switch bar, the service's description, Settings in the overflow
     (its settingsActivity); turning on asks "Use …?" with the capabilities the service declares (both declare only
     canRetrieveWindowContent), turning off "Stop …?".
   - ToggleScreenMagnificationPreferenceFragment: the switch bar, VideoPreference (the phone outline
     accessibility_screen_magnification_background at the screen's width, accessibility_screen_magnification.mp4 in it,
     170 x 311 dp of 750 dp, 40 dp down), the summary.
   - ToggleGlobalGesturePreferenceFragment, ToggleAutoclickPreferenceFragment (Delay before click, 200–1000 ms in 100 ms
     steps; the list's summary in accessibilty_autoclick_*_delay plurals), ToggleDaltonizerPreferenceFragment (the switch bar,
     the subtitle, Correction mode).
   - CaptionPropertiesFragment: the captioning_preview over the list (caption_background, the SubtitleView in the
     user's style), the switch bar; Standard options and, for Custom, the custom ones; grid_picker_dialog pickers.
   - ToggleFontSizePreferenceFragment / ScreenZoomSettings (PreviewSeekBarPreferenceFragment, font_size_activity /
     screen_zoom_activity): the preview pager in its 8 dp colorControlNormal outline with "Preview" on the bottom band;
     font_size_preview (Sample text …) or screen_zoom_preview_1 (the conversation of ConversationMessageView: the 9-patch
     bubbles, the lettered icons) and _2 (AppGridView: the launcher's apps); the dots, the current step's label, the
     LabeledSeekBar between the smaller and larger buttons, the summary. Font sizes are fontsize's entries (0.85, 1,
     1.15, 1.3); the 6P's display sizes are DisplayDensityUtils' (560 dpi; a 1.5 maximum cut to 320 dp of width: 476, 560, 612, 666, 720). The simulator keeps
     the choice and shows it in the previews; its own screens stay at the default size. */
(() => {
  'use strict';
  const T = () => NG.text('settings');
  const H = NG.settingsHooks;
  const S = c => c.data.settings;
  const A = name => `assets/${name}`;
  const go = (c, screen, title) => NG.settingsGo(c, screen, title);
  const a11y = c => S(c).a11y || (S(c).a11y = {});
  const radio = (c, label, on) => ({html: `<span class="ngst-choice"><i class="ngw-radio ngst-radio${on ? ' on' : ''}"></i><span>${c.safe(label)}</span></span>`});
  const text = (c, s) => `<div class="ngsx-text">${c.safe(s)}</div>`;
  const onOff = (c, on) => T().t(on ? 'accessibility_feature_state_on' : 'accessibility_feature_state_off');
  Object.assign(NG.settingsFragments, {
    'com.android.settings.accessibility.ToggleScreenMagnificationPreferenceFragment': 'a11y:screen_magnification_preference_screen',
    'com.android.settings.accessibility.ToggleGlobalGesturePreferenceFragment': 'a11y:enable_global_gesture_preference_screen',
    'com.android.settings.accessibility.ToggleAutoclickPreferenceFragment': 'autoclick',
    'com.android.settings.accessibility.ToggleDaltonizerPreferenceFragment': 'xml:accessibility_daltonizer_settings',
    'com.android.settings.accessibility.ToggleFontSizePreferenceFragment': 'font-size', 'com.android.settings.display.ScreenZoomSettings': 'screen-zoom'});

  // -- Services and toggles -------------------------------------------------------------------------------------------
  const SERVICE = {a11y_talkback: {title: 'talkback/talkback_title', desc: 'talkback/talkback_service_description', caps: ['canRetrieveWindowContent']},
    a11y_switch: {title: 'talkback/switch_service_name', desc: 'talkback/switch_access_service_description', caps: ['canRetrieveWindowContent']}};
  (() => {
    const cat = NG.settingsXml.accessibility_settings?.c.find(n => n.key === 'services_category');
    if (cat && !cat.c) cat.c = Object.entries(SERVICE).map(([key, s]) => ({t: 'Preference', key, title: `string/${s.title}`}));
  })();
  const SWITCHES = {toggle_high_text_contrast_preference: 'highContrast', toggle_power_button_ends_call_preference: 'powerEndsCall', toggle_speak_password_preference: 'speakPasswords',
    toggle_large_pointer_icon: 'largePointer', toggle_master_mono: 'mono', toggle_inversion_preference: 'inversion'};
  H.accessibility_settings = {
    get(c, key) {
      const a = a11y(c);
      if (key === 'toggle_lock_screen_rotation_preference') return !S(c).rotationLocked;
      if (key === 'select_long_press_timeout_preference') return String(a.longPress ?? 500);
      // Color inversion is Secure.ACCESSIBILITY_DISPLAY_INVERSION_ENABLED, the same value as the Quick Settings tile.
      if (key === 'toggle_inversion_preference') return !!S(c).inversion;
      return SWITCHES[key] ? !!a[SWITCHES[key]] : undefined;
    },
    set(c, key, v) {
      const s = S(c), a = a11y(c);
      if (key === 'toggle_lock_screen_rotation_preference') { s.rotationLocked = !v; NG.system?.changed(c); return true; }
      if (key === 'select_long_press_timeout_preference') { a.longPress = +v; return true; }
      if (key === 'toggle_inversion_preference') { NG.system.setInversion(c, v); return true; }
      if (SWITCHES[key]) { a[SWITCHES[key]] = v; return true; }
      return false;
    },
    summary(c, key) {
      const a = a11y(c), t = T();
      // updateAutoclickSummary: the delay's plural (getAutoclickPreferenceSummaryIndex) while on.
      if (key === 'autoclick_preference_screen' && a[key]) { const ms = a.autoclickDelay ?? 600; return t.plural(AUTOCLICK[ms <= 200 ? 0 : ms >= 1000 ? 4 : Math.floor((ms - 200) / 200)], ms); }
      if (SERVICE[key] || ['captioning_preference_screen', 'screen_magnification_preference_screen', 'daltonizer_preference_screen', 'autoclick_preference_screen'].includes(key)) return onOff(c, !!a[key]);
      if (key === 'enable_global_gesture_preference_screen') return onOff(c, !!a.shortcut);
      if (key === 'font_size_preference_screen') return fontLabel(c, fontIndex(c));
      if (key === 'screen_zoom') return zoomLabel(c, zoomIndex(c));
      return undefined;
    },
    click(c, key, n) {
      const t = T();
      if (SERVICE[key]) { go(c, `a11y:${key}`, t.t(SERVICE[key].title)); return true; }
      if (key === 'screen_zoom') { go(c, 'screen-zoom', t.t('screen_zoom_title')); return true; }
      return false;
    }
  };
  // Display settings' Font size and Display size rows lead to the same pages.
  NG.settingsFontSummary = c => fontLabel(c, fontIndex(c));
  NG.settingsZoomSummary = c => zoomLabel(c, zoomIndex(c));
  NG.settingsScreens.a11y = {
    title: (c, cur) => { const k = cur.screen.split(':')[1]; return SERVICE[k] ? T().t(SERVICE[k].title) : cur.title || T().t({screen_magnification_preference_screen: 'accessibility_screen_magnification_title', enable_global_gesture_preference_screen: 'accessibility_global_gesture_preference_title'}[k]); },
    bar: (c, cur) => { const k = cur.screen.split(':')[1]; return NG.settingsSwitchBar(c, !!(k === 'enable_global_gesture_preference_screen' ? a11y(c).shortcut : a11y(c)[k]), 'nga1-toggle'); },
    actions: (c, cur) => SERVICE[cur.screen.split(':')[1]] ? NG.menu.button(c) : '',
    render(c, cur) {
      const t = T(), k = cur.screen.split(':')[1];
      if (k === 'screen_magnification_preference_screen')
        return `<div class="nga1-video"><img src="${A('st-accessibility_screen_magnification_background.svg')}" alt=""><video src="${A('st-accessibility_screen_magnification.mp4')}" autoplay loop muted playsinline></video></div>${text(c, t.t('accessibility_screen_magnification_summary'))}`;
      if (k === 'enable_global_gesture_preference_screen') return text(c, t.t('accessibility_global_gesture_preference_description'));
      return text(c, t.t(SERVICE[k]?.desc) || t.t('accessibility_service_default_description'));
    },
    action(c, name, el, cur) {
      const t = T(), k = cur.screen.split(':')[1], a = a11y(c), svc = SERVICE[k];
      if (name === 'ng-menu') { c.menu([{label: t.t('accessibility_menu_item_settings'), action: c => NG.openPrefs(c, k === 'a11y_talkback' ? 'talkback' : 'switchaccess', k === 'a11y_talkback' ? 'preferences' : 'switch_access_preferences', t.t(svc.title))}], el); return true; }
      if (name !== 'nga1-toggle') return false;
      const field = k === 'enable_global_gesture_preference_screen' ? 'shortcut' : k;
      const flip = c => { a[field] = !a[field]; c.save(); c.transition('none'); c.render(); };
      if (!svc) { flip(c); return true; }
      const title = t.t(svc.title);
      if (a[k]) c.dialog({title: t.fmt('disable_service_title', null, title), message: t.fmt('disable_service_message', null, title), buttons: [{label: t.t('framework/cancel')}, {label: t.t('framework/ok'), action: flip}]});
      else c.dialog({title: t.fmt('enable_service_title', null, title), html: `<div class="nga1-caps"><p>${c.safe(t.fmt('capabilities_list_title', null, title))}</p><ul>${svc.caps.map(cap => `<li><b>${c.safe(t.t(`framework/capability_title_${cap}`))}</b><br>${c.safe(t.t(`framework/capability_desc_${cap}`))}</li>`).join('')}</ul></div>`,
        buttons: [{label: t.t('framework/cancel')}, {label: t.t('framework/ok'), action: flip}]});
      return true;
    }
  };
  // ToggleAutoclickPreferenceFragment: the switch bar and Delay before click (200–1000 ms in 100 ms steps).
  const AUTOCLICK = ['extremely_short', 'very_short', 'short', 'long', 'very_long'].map(k => `accessibilty_autoclick_preference_subtitle_${k}_delay`);
  NG.settingsScreens.autoclick = {
    title: () => T().t('accessibility_autoclick_preference_title'),
    bar: c => NG.settingsSwitchBar(c, !!a11y(c).autoclick_preference_screen, 'nga1-autoclick'),
    render(c) {
      const t = T(), ms = a11y(c).autoclickDelay ?? 600, on = !!a11y(c).autoclick_preference_screen;
      return `<div class="ngst-list"><div class="ngpe-slider${on ? '' : ' disabled'}"><div class="ngst-title">${c.safe(t.t('accessibility_autoclick_delay_preference_title'))}</div><div class="ngpe-sliderrow"><div class="ngst-seek" style="--v:${((ms - 200) / 800).toFixed(4)}"><i class="ngst-seek-track"></i><i class="ngst-seek-progress"></i><i class="ngst-seek-thumb"></i></div></div></div></div>`;
    },
    mount(c, root) {
      const bar = root.querySelector('.ngpe-slider:not(.disabled) .ngst-seek'); if (!bar) return;
      bar.addEventListener('pointerdown', e => {
        e.preventDefault(); try { bar.setPointerCapture(e.pointerId); } catch {}
        const move = ev => { const r = bar.getBoundingClientRect(), pad = 16 * c.el.screen.clientWidth / 411.43; a11y(c).autoclickDelay = 200 + Math.round(Math.min(1, Math.max(0, (ev.clientX - r.left - pad) / (r.width - 2 * pad))) * 8) * 100; bar.style.setProperty('--v', ((a11y(c).autoclickDelay - 200) / 800).toFixed(4)); };
        const up = () => { bar.removeEventListener('pointermove', move); c.save(); c.transition('none'); c.render(); };
        move(e); bar.addEventListener('pointermove', move); bar.addEventListener('pointerup', up, {once: true});
      });
    },
    action(c, name) { if (name !== 'nga1-autoclick') return false; const a = a11y(c); a.autoclick_preference_screen = !a.autoclick_preference_screen; c.save(); c.transition('none'); c.render(); return true; }
  };
  // ToggleDaltonizerPreferenceFragment: accessibility_daltonizer_settings under its switch bar.
  H.accessibility_daltonizer_settings = {
    bar: c => NG.settingsSwitchBar(c, !!a11y(c).daltonizer_preference_screen, 'nga1-dalton'),
    get: (c, key) => key === 'type' ? String(a11y(c).daltonizer ?? 12) : undefined,
    set(c, key, v) { if (key !== 'type') return false; a11y(c).daltonizer = +v; return true; },
    disabled: c => !a11y(c).daltonizer_preference_screen,
    action(c, name) { if (name !== 'nga1-dalton') return false; const a = a11y(c); a.daltonizer_preference_screen = !a.daltonizer_preference_screen; c.save(); NG.system?.changed(c); c.transition('none'); c.render(); return true; }
  };

  // -- Font size and Display size -------------------------------------------------------------------------------------
  const FONT_SCALES = ['0.85', '1.0', '1.15', '1.30'];
  const fontIndex = c => Math.max(0, FONT_SCALES.indexOf(S(c).fontScale || '1.0'));
  const fontLabel = (c, i) => NG.settingsArr('array/entries_font_size')[i] || '';
  const DENSITIES = [476, 560, 612, 666, 720];
  const ZOOM_LABELS = ['screen_zoom_summary_small', 'screen_zoom_summary_default', 'screen_zoom_summary_large', 'screen_zoom_summary_very_large', 'screen_zoom_summary_extremely_large'];
  const zoomIndex = c => Math.max(0, DENSITIES.indexOf(S(c).density || 560));
  const zoomLabel = (c, i) => T().t(ZOOM_LABELS[i]);
  // ConversationMessageView: the lettered icon, the 9-patch bubble in the message's colour, the text and its time.
  const message = (c, incoming, msg, time, letter, scale) => `<div class="nga1-msg${incoming ? ' in' : ' out'}" style="--z:${scale}"><span class="nga1-msgicon" style="background:${incoming ? '#689f38' : '#4285f4'}">${c.safe(letter)}</span><span class="nga1-bubble"><span class="nga1-msgtext">${c.safe(msg)}</span><span class="nga1-msgtime">${c.safe(time)}</span></span></div>`;
  const conversation = (c, scale) => { const t = T(); return `<div class="nga1-conv">${[[false, 1, 'alex'], [true, 2, 'pete'], [false, 3, 'alex'], [true, 4, 'pete']].map(([inc, i, who]) => message(c, inc, t.t(`screen_zoom_conversation_message_${i}`), t.t(`screen_zoom_conversation_timestamp_${i}`), t.t(`screen_zoom_conversation_icon_${who}`), scale)).join('')}</div>`; };
  // AppGridView: the launcher's apps with their icons and labels, screen_zoom_preview_app_icon_width 88 dp columns.
  const appGrid = (c, scale) => {
    const col = new Intl.Collator(c.locale()), label = id => NG.appsData[id].label[c.lang] || NG.appsData[id].label.en;
    const ids = Object.keys(NG.appsData || {}).filter(id => !NG.appDisabled?.(c, id)).sort((a, b) => col.compare(label(a), label(b))).slice(0, 12);
    return `<div class="nga1-grid" style="--z:${scale}">${ids.map(id => `<span><img src="${NG.appsData[id].icon}" alt=""><b>${c.safe(label(id))}</b></span>`).join('')}</div>`;
  };
  const fontPreview = (c, scale) => { const t = T(); return `<div class="nga1-fontprev" style="--f:${scale}"><h1>${c.safe(t.t('font_size_preview_text_headline'))}</h1><h2>${c.safe(t.t('font_size_preview_text_title'))}</h2><h3>${c.safe(t.t('font_size_preview_text_subtitle'))}</h3><p>${c.safe(t.t('font_size_preview_text_body'))}</p></div>`; };
  // PreviewSeekBarPreferenceFragment: the pager, the dots, the label, the seek bar with its buttons, the summary.
  function previewPage(c, kind) {
    const t = T(), zoom = kind === 'zoom', i = c.ui.previewStep ?? (zoom ? zoomIndex(c) : fontIndex(c)), n = zoom ? DENSITIES.length : FONT_SCALES.length;
    const page = c.ui.previewPage || 0, scale = zoom ? (DENSITIES[i] / 560).toFixed(4) : FONT_SCALES[i];
    const pages = zoom ? [conversation(c, scale), appGrid(c, scale)] : [fontPreview(c, scale)];
    const ticks = Array.from({length: n}, (_, k) => `<i style="left:${(k / (n - 1) * 100).toFixed(2)}%"></i>`).join('');
    return `<div class="nga1-preview"><div class="nga1-pager"><div class="nga1-pages" style="transform:translateX(${-page * 100}%)">${pages.map(p => `<div class="nga1-page">${p}</div>`).join('')}</div></div><div class="nga1-band">${c.safe(t.t('screen_zoom_preview_title'))}</div></div>
      <div class="nga1-controls">${zoom ? `<div class="nga1-dots">${pages.map((_, k) => `<button type="button" data-action="nga1-page" data-p="${k}" class="${k === page ? 'on' : ''}" aria-label="${k + 1}"></button>`).join('')}</div>` : ''}
      <div class="nga1-label">${c.safe(zoom ? zoomLabel(c, i) : fontLabel(c, i))}</div>
      <div class="nga1-seekrow"><button type="button" class="nga1-step" data-action="nga1-step" data-d="-1" aria-label="${c.safe(t.t(zoom ? 'screen_zoom_make_smaller_desc' : 'font_size_make_smaller_desc'))}"${i === 0 ? ' disabled' : ''}><i style="-webkit-mask-image:url('${A(zoom ? 'st-ic_remove_24dp.svg' : 'st-ic_font_size_16dp.svg')}');mask-image:url('${A(zoom ? 'st-ic_remove_24dp.svg' : 'st-ic_font_size_16dp.svg')}')" class="${zoom ? '' : 'small'}"></i></button>
        <div class="ngst-seek nga1-seek" data-n="${n}" style="--v:${(i / (n - 1)).toFixed(4)}"><i class="ngst-seek-track"></i><span class="nga1-ticks">${ticks}</span><i class="ngst-seek-progress"></i><i class="ngst-seek-thumb"></i></div>
        <button type="button" class="nga1-step" data-action="nga1-step" data-d="1" aria-label="${c.safe(t.t(zoom ? 'screen_zoom_make_larger_desc' : 'font_size_make_larger_desc'))}"${i === n - 1 ? ' disabled' : ''}><i style="-webkit-mask-image:url('${A(zoom ? 'st-ic_add_24dp.svg' : 'st-ic_font_size_24dp.svg')}');mask-image:url('${A(zoom ? 'st-ic_add_24dp.svg' : 'st-ic_font_size_24dp.svg')}')"></i></button></div>
      <div class="nga1-summary">${c.safe(t.t(zoom ? 'screen_zoom_summary' : 'font_size_summary'))}</div></div>`;
  }
  const setStep = (c, kind, i) => {
    if (kind === 'zoom') S(c).density = DENSITIES[i]; else S(c).fontScale = FONT_SCALES[i];
    c.ui.previewStep = i; c.save(); c.transition('none'); c.render();
  };
  const previewScreen = (kind, title) => ({
    title: () => T().t(title),
    grey: true,
    render: c => previewPage(c, kind),
    mount(c, root) {
      const bar = root.querySelector('.nga1-seek'); if (!bar) return;
      const n = +bar.dataset.n;
      bar.addEventListener('pointerdown', e => {
        e.preventDefault(); try { bar.setPointerCapture(e.pointerId); } catch {}
        let i = 0;
        const move = ev => { const r = bar.getBoundingClientRect(), pad = 16 * c.el.screen.clientWidth / 411.43; i = Math.round(Math.min(1, Math.max(0, (ev.clientX - r.left - pad) / (r.width - 2 * pad))) * (n - 1)); bar.style.setProperty('--v', (i / (n - 1)).toFixed(4)); };
        move(e); bar.addEventListener('pointermove', move);
        bar.addEventListener('pointerup', () => { bar.removeEventListener('pointermove', move); setStep(c, kind, i); }, {once: true});
      });
      // The pager follows a horizontal drag between the display size previews.
      const pager = root.querySelector('.nga1-pager');
      if (kind === 'zoom' && pager) {
        let x0 = null;
        pager.addEventListener('pointerdown', e => { x0 = e.clientX; });
        pager.addEventListener('pointerup', e => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) { c.ui.previewPage = Math.max(0, Math.min(1, (c.ui.previewPage || 0) + (dx < 0 ? 1 : -1))); c.transition('none'); c.render(); } });
      }
    },
    action(c, name, el) {
      const i = c.ui.previewStep ?? (kind === 'zoom' ? zoomIndex(c) : fontIndex(c)), n = kind === 'zoom' ? DENSITIES.length : FONT_SCALES.length;
      if (name === 'nga1-step') { setStep(c, kind, Math.max(0, Math.min(n - 1, i + +el.dataset.d))); return true; }
      if (name === 'nga1-page') { c.ui.previewPage = +el.dataset.p; c.transition('none'); c.render(); return true; }
      return false;
    },
    back(c) { c.ui.previewStep = null; c.ui.previewPage = 0; return false; }
  });
  NG.settingsScreens['font-size'] = previewScreen('font', 'title_font_size');
  NG.settingsScreens['screen-zoom'] = previewScreen('zoom', 'screen_zoom_title');

  /* -- Captions (CaptionPropertiesFragment, captioning_settings.xml) -----------------------------------------------
     The values are the Settings.Secure ones CaptionStyle reads: a colour and its opacity are kept apart as the
     fragment's parseColorOpacity splits them. */
  const CAP_COLORS = [0x00ffffff, 0xffffffff, 0xff000000, 0xffff0000, 0xffffff00, 0xff00ff00, 0xff00ffff, 0xff0000ff, 0xffff00ff,
    0xff000055, 0xff0000aa, 0xff005500, 0xff005555, 0xff0055aa, 0xff0055ff, 0xff00aa00, 0xff00aa55, 0xff00aaaa, 0xff00aaff, 0xff00ff55,
    0xff00ffaa, 0xff550000, 0xff550055, 0xff5500aa, 0xff5500ff, 0xff555500, 0xff555555, 0xff5555aa, 0xff5555ff, 0xff55aa00, 0xff55aa55,
    0xff55aaaa, 0xff55aaff, 0xff55ff00, 0xff55ff55, 0xff55ffaa, 0xff55ffff, 0xffaa0000, 0xffaa0055, 0xffaa00aa, 0xffaa00ff, 0xffaa5500,
    0xffaa5555, 0xffaa55aa, 0xffaa55ff, 0xffaaaa00, 0xffaaaa55, 0xffaaaaaa, 0xffaaaaff, 0xffaaff00, 0xffaaff55, 0xffaaffaa, 0xffaaffff,
    0xffff0055, 0xffff00aa, 0xffff5500, 0xffff5555, 0xffff55aa, 0xffff55ff, 0xffffaa00, 0xffffaa55, 0xffffaaaa, 0xffffaaff, 0xffffff55,
    0xffffffaa];
  const CAP_COLOR_TITLES = ['color_unspecified', 'color_white', 'color_black', 'color_red', 'color_yellow', 'color_green', 'color_cyan', 'color_blue', 'color_magenta'];
  const CAP_OPACITY = [0x40ffffff, 0x80ffffff, 0xc0ffffff, 0xffffffff];
  const CAP_PRESETS = [4, 0, 1, 2, 3, -1];
  const CAP_EDGES = [-1, 0, 1, 2, 3, 4];
  const CAP_SCALES = ['0.25', '0.5', '1.0', '1.5', '2.0'];
  const CAP_FACES = ['', 'sans-serif', 'sans-serif-condensed', 'sans-serif-monospace', 'serif', 'serif-monospace', 'casual', 'cursive', 'sans-serif-smallcaps'];
  // fonts.xml's families for those names (ng-settings.css loads the files).
  const CAP_FONT = {'': 'Roboto', 'sans-serif': 'Roboto', 'sans-serif-condensed': "'Roboto Condensed'", 'sans-serif-monospace': "'Droid Sans Mono'", serif: "'Noto Serif'",
    'serif-monospace': "'Cutive Mono'", casual: "'Coming Soon'", cursive: "'Dancing Script'", 'sans-serif-smallcaps': "'Carrois Gothic SC'"};
  const CAP_STYLE = {0: [0xffffffff, 0xff000000], 1: [0xff000000, 0xffffffff], 2: [0xffffff00, 0xff000000], 3: [0xffffff00, 0xff0000ff]};
  const capState = c => {
    const a = a11y(c);
    return a.captions || (a.captions = {preset: 0, scale: '1.0', locale: '', typeface: '', fg: 0xffffffff, fgOp: 0xffffffff, bg: 0xff000000, bgOp: 0xffffffff,
      edge: 0, edgeColor: 0xff000000, win: 0, winOp: 0xffffffff});
  };
  const capOn = c => !!a11y(c).captioning_preference_screen;
  const rgba = (color, alpha) => `rgba(${color >>> 16 & 255},${color >>> 8 & 255},${color & 255},${(alpha / 255).toFixed(3)})`;
  const capColor = (color, op, fallback) => color === 0x00ffffff ? fallback : color === 0 ? 'transparent' : rgba(color, op >>> 24);
  function capStyle(c) {
    const s = capState(c), dp = 'var(--dp)';
    let fg, bg, win = 'transparent', edge = 0, edgeColor = '#000', face = 'Roboto';
    if (s.preset === -1) {
      fg = capColor(s.fg, s.fgOp, '#fff'); bg = capColor(s.bg, s.bgOp, '#000'); win = capColor(s.win, s.winOp, 'transparent');
      edge = s.edge < 0 ? 0 : s.edge; edgeColor = capColor(s.edgeColor, 0xff000000, '#000'); face = CAP_FONT[s.typeface] || 'Roboto';
    } else { const [f, b] = CAP_STYLE[s.preset] || CAP_STYLE[0]; fg = rgba(f, 255); bg = rgba(b, 255); }
    return {fg, bg, win, face, smallcaps: s.preset === -1 && s.typeface === 'sans-serif-smallcaps', shadow: capEdge(edge, edgeColor, dp)};
  }
  // SubtitleView.onDraw's edges: an outline stroke, a drop shadow, or raised / depressed light and dark shadows.
  function capEdge(edge, color, dp) {
    if (edge === 1) return `-webkit-text-stroke:calc(2 * ${dp}) ${color};paint-order:stroke fill`;
    if (edge === 2) return `text-shadow:calc(2 * ${dp}) calc(2 * ${dp}) calc(2 * ${dp}) ${color}`;
    if (edge === 3 || edge === 4) { const up = edge === 3 ? '#fff' : color, down = edge === 3 ? color : '#fff'; return `text-shadow:calc(-1 * ${dp}) calc(-1 * ${dp}) calc(2 * ${dp}) ${up},${dp} ${dp} calc(2 * ${dp}) ${down}`; }
    return '';
  }
  const capText = (style, html, size) => `<span class="nga1-captext" style="color:${style.fg};background:${style.bg};font-family:${style.face},Roboto,sans-serif;font-size:calc(${size} * var(--dp));${style.smallcaps ? 'font-variant:small-caps;' : ''}${style.shadow}">${html}</span>`;
  // LocalePreference: Default, then the system's locales by their names.
  const capLocales = c => { const col = new Intl.Collator(c.locale()), names = NG.locales?.names || {}; return (NG.locales?.supported || []).filter(t => names[t]).map(tag => ({value: tag.replace(/-/g, '_'), name: names[tag][0]})).sort((a, b) => col.compare(a.name, b.name)); };
  const colorTitle = (t, v, list) => {
    const i = list.indexOf(v), none = list[0] === 0, k = none ? i - 1 : i;
    if (none && i === 0) return t.t('color_none');
    return k >= 0 && k < CAP_COLOR_TITLES.length ? t.t(CAP_COLOR_TITLES[k]) : t.fmt('color_custom', null, v >>> 16 & 255, v >>> 8 & 255, v & 255);
  };
  const opTitle = (t, v) => NG.settingsArr('array/captioning_opacity_selector_titles')[CAP_OPACITY.indexOf(v)] ?? '';
  const ROWS = {
    captioning_foreground_color: ['fg', 'color'], captioning_foreground_opacity: ['fgOp', 'opacity'], captioning_edge_type: ['edge', 'edge'],
    captioning_edge_color: ['edgeColor', 'color'], captioning_background_color: ['bg', 'colornone'], captioning_background_opacity: ['bgOp', 'opacity'],
    captioning_window_color: ['win', 'colornone'], captioning_window_opacity: ['winOp', 'opacity']
  };
  function capSummary(c, key) {
    const t = T(), s = capState(c), arr = name => NG.settingsArr(`array/${name}`);
    if (key === 'captioning_locale') return s.locale ? capLocales(c).find(l => l.value === s.locale)?.name || s.locale : t.t('locale_default');
    if (key === 'captioning_font_size') return arr('captioning_font_size_selector_titles')[CAP_SCALES.indexOf(s.scale)] ?? '';
    if (key === 'captioning_preset') return arr('captioning_preset_selector_titles')[CAP_PRESETS.indexOf(s.preset)] ?? '';
    if (key === 'captioning_typeface') return arr('captioning_typeface_selector_titles')[CAP_FACES.indexOf(s.typeface)] ?? '';
    const [field, kind] = ROWS[key] || [];
    if (kind === 'opacity') return opTitle(t, s[field]);
    if (kind === 'edge') return arr('captioning_edge_type_selector_titles')[CAP_EDGES.indexOf(s.edge)] ?? '';
    if (kind === 'color') return colorTitle(t, s[field], CAP_COLORS);
    if (kind === 'colornone') return colorTitle(t, s[field], [0, ...CAP_COLORS]);
    return '';
  }
  // ListDialogPreference: the grid; picking an item sets it and closes.
  function capGrid(c, title, items, onPick) {
    c.dialog({title, html: `<div class="nga1-capgrid">${items.map((it, i) => `<button type="button" class="nga1-capitem" data-i="${i}">${it.html}<span class="nga1-capname">${c.safe(it.title || '')}</span></button>`).join('')}</div>`,
      buttons: [{label: T().t('framework/cancel')}],
      mount: (c, w) => { w.querySelectorAll('.nga1-capitem').forEach(b => b.addEventListener('click', () => { onPick(+b.dataset.i); c.closeDialog(); c.render(); })); }});
  }
  function capDialog(c, key, n) {
    const t = T(), s = capState(c), title = NG.settingsStr(n?.title) || '', arr = name => NG.settingsArr(`array/${name}`);
    const list = (values, labels, cur, set) => c.dialog({title, items: values.map((v, i) => radio(c, labels[i], v === cur)), buttons: [{label: t.t('framework/cancel')}], onItem: i => { set(values[i]); c.save(); c.render(); }});
    if (key === 'captioning_locale') { const locs = capLocales(c); return list(['', ...locs.map(l => l.value)], [t.t('locale_default'), ...locs.map(l => l.name)], s.locale, v => { s.locale = v; }); }
    if (key === 'captioning_font_size') return list(CAP_SCALES, arr('captioning_font_size_selector_titles'), s.scale, v => { s.scale = v; });
    if (key === 'captioning_typeface') return list(CAP_FACES, arr('captioning_typeface_selector_titles'), s.typeface, v => { s.typeface = v; });
    const aa = c.safe(t.t('captioning_preview_characters'));
    if (key === 'captioning_preset') {
      const titles = arr('captioning_preset_selector_titles');
      return capGrid(c, title, CAP_PRESETS.map((p, i) => {
        const save = s.preset; s.preset = p === 4 ? 0 : p; const st = capStyle(c); s.preset = save;
        return {title: titles[i], html: `<span class="nga1-capsample">${capText(st, aa, 32)}</span>`};
      }), i => { s.preset = CAP_PRESETS[i]; c.save(); });
    }
    const [field, kind] = ROWS[key] || [];
    if (kind === 'edge') {
      const titles = arr('captioning_edge_type_selector_titles');
      return capGrid(c, title, CAP_EDGES.map((e, i) => ({title: titles[i], html: `<span class="nga1-capsample">${capText({fg: '#fff', bg: 'transparent', face: 'Roboto', shadow: capEdge(e < 0 ? 0 : e, '#000', 'var(--dp)')}, aa, 32)}</span>`})),
        i => { s.edge = CAP_EDGES[i]; c.save(); });
    }
    const values = kind === 'opacity' ? CAP_OPACITY : kind === 'colornone' ? [0, ...CAP_COLORS] : CAP_COLORS;
    return capGrid(c, title, values.map(v => {
      const alpha = v >>> 24, label = kind === 'opacity' ? opTitle(t, v) : colorTitle(t, v, values);
      return {title: label, html: `<span class="nga1-swatch${alpha < 255 ? ' clear' : ''}"><i style="background:${rgba(v, alpha)}"></i></span>`};
    }), i => { s[field] = values[i]; c.save(); });
  }
  const findNode = key => NG.settingsFind(NG.settingsXml.captioning_settings, key);
  NG.settingsScreens['xml:captioning_settings'] = {
    bar: c => NG.settingsSwitchBar(c, capOn(c), 'nga1-captions'),
    render(c) {
      const t = T(), s = capState(c), on = capOn(c), st = capStyle(c), node = NG.settingsXml.captioning_settings;
      // SubtitleView's size: 0.0533 of the larger of width x 9 and height x 16, over 16, times the font scale.
      const size = (0.0533 * Math.max(411.4286 * 9, 200 * 16) / 16 * parseFloat(s.scale)).toFixed(3);
      const preview = `<div class="nga1-capview"><img src="${A('st-caption_background.jpg')}" alt=""><div class="nga1-capwin"><span style="background:${st.win}">${capText(st, c.safe(t.t('captioning_preview_text')), size)}</span></div></div>`;
      const rows = cat => NG.settingsJoinRows(cat.c.map(n => {
        const disabled = !on || (n.key === 'captioning_edge_color' && s.edge === 0);
        return {html: NG.settingsRow(c, {key: n.key, title: NG.settingsStr(n.title), summary: capSummary(c, n.key), action: 'nga1-caprow', disabled}), sel: true};
      }));
      const cats = node.c.filter(cat => cat.key !== 'custom' || s.preset === -1);
      return `${preview}<div class="ngst-list">${cats.map(cat => `${NG.settingsCat(c, NG.settingsStr(cat.title))}${rows(cat)}`).join('')}</div>`;
    },
    action(c, name, el) {
      if (name === 'nga1-captions') { const a = a11y(c); a.captioning_preference_screen = !a.captioning_preference_screen; c.save(); c.transition('none'); c.render(); return true; }
      if (name === 'nga1-caprow') { capDialog(c, el.dataset.key, findNode(el.dataset.key)); return true; }
      return false;
    }
  };
})();
