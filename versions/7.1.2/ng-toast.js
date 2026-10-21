/* Android 7.1.2 Toast (framework-res transient_notification.xml of N2G48C): the message (TextAppearance.Toast:
   sans-serif-condensed at TextAppearance's 16 sp, bright_foreground_dark white with a 2.75 px #bb000000 shadow) on
   toastFrameBackground's toast_frame, at bottom | centre_horizontal, toast_y_offset 64 dp above the navigation bar;
   LENGTH_SHORT 2 s, LENGTH_LONG 3.5 s (NotificationManagerService); Animation.Toast fades it in (toast_enter: 500 ms
   decelerate_quad) and out (toast_exit: 500 ms accelerate_quad). A new toast takes the shown one's place. */
(() => {
  'use strict';
  let layer = null, timer = 0;
  // long may be {plain: true}: a toast whose view has no background (NekoActivationActivity's setBackgroundDrawable(null)).
  function show(c, text, long = false) {
    const plain = typeof long === 'object' && !!long?.plain; if (plain) long = false;
    if (!layer) { layer = document.createElement('div'); layer.className = 'ngtoast-layer'; c.el.screen.append(layer); }
    clearTimeout(timer);
    const fresh = !layer.firstElementChild || layer.firstElementChild.classList.contains('out');
    layer.innerHTML = `<div class="ngtoast${plain ? ' plain' : ' np-fw-toast_frame'}${fresh ? ' in' : ''}"><span>${c.safe(text)}</span></div>`;
    timer = setTimeout(() => {
      const el = layer.querySelector('.ngtoast'); if (!el) return;
      el.classList.remove('in'); el.classList.add('out');
      setTimeout(() => { if (el.classList.contains('out')) el.remove(); }, 500);
    }, long ? 3500 : 2000);
  }
  NG.register('toast', {app: false, render: () => '', show(c, text, long) { show(c, text, long); }});
})();
