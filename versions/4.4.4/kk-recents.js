/* Android 4.4.4 Recents (SystemUI RecentsPanelView / RecentsActivity of KTU84P, AppTransition thumbnail animations): the
   4.3 layouts and dimens, plus status_bar_recent_panel's foreground bg_protect, the gradient that darkens the
   translucent bars' edges (25 % black fading out over 100 dp at the top and the bottom). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const DP = .9;
  // status_bar_recents_app_icon_translate_distance, animateInIconOfFirstTask, DEFAULT_APP_TRANSITION_DURATION.
  const R = {iconShift: 35 * DP, iconDuration: 250, iconDelay: 150, window: 250, longPress: 500, slop: 8};
  const decelerate = 'cubic-bezier(.215,.61,.355,1)';

  function render(recent, {names, icon, snapshots, popup, t}) {
    if (!recent.length) return `<div class="recent-panel jb-recents" data-action="close-overlay"><p class="recent-empty">${e(t('No recent apps'))}</p><i class="kk-recents-protect" aria-hidden="true"></i></div>`;
    const items = [...recent].reverse().map(id => `<div class="recent-item" data-action="open-app" data-app="${id}" role="button" tabindex="0" aria-label="${e(names[id])}"><span class="recent-label">${e(names[id])}</span><span class="recent-thumbnail" aria-hidden="true"><span class="recent-thumbnail-inner" inert>${snapshots[id] || `<div class="recent-fallback">${icon(id)}</div>`}</span></span><span class="recent-app-icon" aria-hidden="true">${icon(id)}</span></div>`).join('');
    const menu = popup ? `<div class="jb-recent-popup" role="menu" style="left:${popup.x}px;top:${popup.y}px"><button type="button" data-action="remove-recent" data-id="${e(popup.id)}" role="menuitem">${e(t('Remove from list'))}</button><button type="button" data-action="recent-app-info" data-id="${e(popup.id)}" role="menuitem">${e(t('App info'))}</button></div>` : '';
    return `<div class="recent-panel jb-recents" data-action="close-overlay"><div class="recent-list">${items}</div>${menu}<i class="kk-recents-protect" aria-hidden="true"></i></div>`;
  }

  /* Opening: from an app, its window shrinks into the newest thumbnail (makeThumbnailScaleDownAnimation: scale and
     fade, decelerate_cubic, 250 ms); from the launcher, the launcher fades out above Recents
     (recents_launch_from_launcher_exit). The newest task's icon, label and callout then slide in by 35dp. */
  function open(panel, outgoing, {fromApp, reduced, layer}) {
    const items = panel.querySelectorAll('.recent-item'), first = items[items.length - 1];
    if (!first || reduced) return;
    const slide = [first.querySelector('.recent-label'), first.querySelector('.recent-app-icon')].filter(Boolean);
    slide.forEach(node => node.animate([{opacity: 0, transform: `translateX(${-R.iconShift}px)`}, {opacity: 1, transform: 'none'}], {duration: R.iconDuration, delay: R.iconDelay, easing: decelerate, fill: 'backwards'}));
    if (!outgoing || !layer) return;
    const thumb = first.querySelector('.recent-thumbnail'), box = layer.getBoundingClientRect(), k = box.width / layer.offsetWidth || 1;
    const t = thumb.getBoundingClientRect(), to = {left: (t.left - box.left) / k, top: (t.top - box.top) / k, width: t.width / k, height: t.height / k};
    const clone = document.createElement('div');
    clone.className = 'jb-recents-window'; clone.setAttribute('aria-hidden', 'true'); clone.inert = true;
    clone.append(outgoing);
    layer.append(clone);
    const sx = to.width / layer.offsetWidth, sy = to.height / layer.offsetHeight;
    const frames = fromApp
      ? [{transform: 'none', opacity: 1}, {transform: `translate(${to.left}px,${to.top}px) scale(${sx},${sy})`, opacity: 0}]
      : [{opacity: 1}, {opacity: 0}];
    clone.animate(frames, {duration: R.window, easing: decelerate, fill: 'forwards'}).finished.then(() => clone.remove(), () => clone.remove());
  }
  // Back to the launcher: recents_return_to_launcher_exit fades Recents out in 250 ms while the launcher fades in.
  function close(panel, done, reduced) {
    if (!panel || reduced || !panel.animate) { done(); return; }
    panel.style.pointerEvents = 'none';
    panel.animate([{opacity: 1}, {opacity: 0}], {duration: R.window, easing: decelerate, fill: 'forwards'}).finished.then(done, done);
  }
  // Long press on a task opens the PopupMenu (recent_popup_menu) under the thumbnail.
  function bindLongPress(panel, onPopup) {
    let press = null;
    panel.addEventListener('pointerdown', event => {
      const item = event.target.closest('.recent-item'); if (!item || event.button > 0) return;
      press = {x: event.clientX, y: event.clientY, item, timer: setTimeout(() => {
        const box = panel.getBoundingClientRect(), k = box.width / panel.offsetWidth || 1, thumb = item.querySelector('.recent-thumbnail').getBoundingClientRect();
        press = null; onPopup({id: item.dataset.app, x: (thumb.left - box.left) / k + 12, y: Math.min((thumb.top - box.top) / k + thumb.height / k / 2, panel.offsetHeight - 100)});
      }, R.longPress)};
    });
    const cancel = event => { if (!press) return; if (event.type === 'pointermove' && Math.hypot(event.clientX - press.x, event.clientY - press.y) < R.slop) return; clearTimeout(press.timer); press = null; };
    panel.addEventListener('pointermove', cancel); panel.addEventListener('pointerup', cancel); panel.addEventListener('pointercancel', cancel);
  }
  window.JBRecents = {R, render, open, close, bindLongPress};
})();
/* Recent apps of the 4.4.4 shell (docs/plans/engine-migration.md): the panel (kk-recents.js), opening and removing
   a task and its App info, moved out of simulator.js. Its swipe stays with the shell's pointer handling. */
(() => {
  'use strict';
  function scope(c) {
    const {appIcon, appNames, captureRecentView, closeRecents, i18n, openApp, overlayRoot, reducedMotion, removeTask, render, renderOverlay, screen, ui, viewport} = c;
    return {
      action(action, button, event) {
        const {id, app, url} = button.dataset;
        switch (action) {
          case 'recent': {
            if (ui.view === 'lock') break;
            if (ui.overlay === 'recent') { closeRecents(); break; }
            captureRecentView(); ui.recentPopup = null;
            const fromApp = !!appNames[ui.view], outgoing = viewport.firstElementChild?.cloneNode(true);
            ui.overlay = 'recent'; renderOverlay();
            // The outgoing window animates in a layer above Recents (makeThumbnailScaleDownAnimation is ZORDER_TOP).
            const layer = document.createElement('div'); layer.className = 'jb-recents-layer';
            Object.assign(layer.style, {top: `${viewport.offsetTop}px`, left: `${viewport.offsetLeft}px`, width: `${viewport.offsetWidth}px`, height: `${viewport.offsetHeight}px`});
            screen.append(layer); setTimeout(() => layer.remove(), JBRecents.R.window + 80);
            JBRecents.open(overlayRoot.querySelector('.recent-panel'), outgoing, {fromApp, reduced: !!reducedMotion?.matches, layer});
            break;
          }
          case 'recent-app-info': ui.overlay = ''; ui.recentPopup = null; openApp('settings'); ui.settingsApp = id; ui.sub = 'app-info'; render(); break;
          case 'remove-recent': event.stopPropagation(); ui.recentPopup = null; removeTask(id); if (!ui.recent.length) ui.overlay = ''; renderOverlay(); break;
          default: return false;
        }
        return true;
      },
      overlay() {
        if (ui.overlay === 'recent') {
          overlayRoot.innerHTML = JBRecents.render(ui.recent, {names: appNames, icon: appIcon, snapshots: ui.recentSnapshots, popup: ui.recentPopup, t: key => i18n.t(key)});
          // PopupMenu keeps itself on screen: shift it left when the anchor is near the right edge.
          const popup = overlayRoot.querySelector('.jb-recent-popup'); if (popup) popup.style.left = `${Math.max(4, Math.min(parseFloat(popup.style.left), popup.parentElement.clientWidth - popup.offsetWidth - 4))}px`;
          JBRecents.bindLongPress(overlayRoot.querySelector('.recent-panel'), popup => { ui.recentPopup = popup; c.suppressClickUntil = Infinity; window.addEventListener('pointerup', () => { c.suppressClickUntil = Date.now() + 50; }, {once: true, capture: true}); renderOverlay(); });
        } else return false;
        return true;
      }
    };
  }
  const spec = {
    action: (name, el, event, c) => scope(c).action(name, el, event),
    overlay: c => scope(c).overlay()
  };
  if (window.KK) for (const id of ['recent']) KK.register(id, spec);
})();
