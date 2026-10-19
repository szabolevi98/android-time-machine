/* Android 7.1.2 SystemUI BrightnessDialog (SystemUI.apk, N2G48C), the overlay 'brightness' Settings › Display ›
   Brightness level opens (android.intent.action.SHOW_BRIGHTNESS_DIALOG):
   - The activity's theme is Theme.DeviceDefault.Dialog (dark: dialog_background_material inset 16 dp, 2 dp corners,
     colorBackgroundFloating #424242, floating_window_z); BrightnessDialog.onCreate puts the window at the top
     (Gravity.TOP) and clears FLAG_DIM_BEHIND, so nothing dims behind it.
   - quick_settings_brightness_dialog.xml: 48 dp high, 16 dp padding at the sides, the ToggleSlider filling it (the same
     slider as quick settings: the SeekBar 20 dp in at each end, the 2 dp track in white at 0.3, the progress and the
     ic_brightness_thumb in colorAccent #80cbc4). BrightnessController moves the automatic adjustment while adaptive
     brightness is on, else the level.
   - A touch outside or Back closes it. */
(() => {
  'use strict';
  const A = name => `assets/${name}`;
  const value = s => s.brightnessAuto ? (s.brightnessAdj + 1) / 2 : s.brightness / 255;
  NG.register('brightness', {
    app: false,
    render(c) {
      const v = value(c.data.settings);
      return `<div class="ngbr"><div class="ngbr-out" data-action="ng-close"></div><div class="ngbr-win"><div class="ngqs-slider ngbr-slider" role="slider" aria-label="${c.safe(NG.text('shade').t('accessibility_brightness'))}" aria-valuenow="${Math.round(v * 100)}" style="--v:${v.toFixed(4)}"><i class="ngqs-track"></i><i class="ngqs-progress"></i><img class="ngqs-thumb" src="${A('sui-ic_brightness_thumb.svg')}" alt=""></div></div></div>`;
    },
    mount(c, root) {
      const slider = root.querySelector('.ngbr-slider');
      slider?.addEventListener('pointerdown', event => {
        event.preventDefault(); event.stopPropagation();
        try { slider.setPointerCapture(event.pointerId); } catch {}
        const s = c.data.settings;
        const move = e => {
          const r = slider.getBoundingClientRect(), pad = 20 * c.el.screen.clientWidth / 411.43;
          const v = Math.min(1, Math.max(0, (e.clientX - r.left - pad) / (r.width - 2 * pad)));
          if (s.brightnessAuto) s.brightnessAdj = Math.round(v * 2048) / 1024 - 1; else s.brightness = Math.round(v * 255);
          slider.style.setProperty('--v', v.toFixed(4)); slider.setAttribute('aria-valuenow', Math.round(v * 100));
          NG.system.applyBrightness(c);
        };
        move(event);
        const up = () => { slider.removeEventListener('pointermove', move); c.save(); };
        slider.addEventListener('pointermove', move);
        slider.addEventListener('pointerup', up, {once: true}); slider.addEventListener('pointercancel', up, {once: true});
      });
    }
  });
})();
