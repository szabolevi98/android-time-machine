/* Android 7.1.2 quick settings editor (SystemUI.apk, N2G48C): QSCustomizer, opened by the header's Edit button and drawn
   over QSContainer by ng-shade.js (st.edit).
   - qs_customize_panel.xml / qs_customize_panel_content.xml in edit_theme (Theme.DeviceDefault.Settings.Dark): the
     background a TransitionDrawable from qs_detail_transition to colorPrimary (#263238); the Toolbar 28 dp down with the
     up button (homeAsUpIndicator, "Navigate up"), the title qs_edit "Edit" and one menu item, reset "Reset", in the
     overflow; under it the RecyclerView, a GridLayoutManager of 3 columns.
   - show / hide: QSDetailClipper's circular reveal (450 ms) from the Edit button's centre, closing back into the up
     button (QSCustomizer$4: its centre) or, for Back, the panel's centre (QSPanel.closeDetail); hide saves the tiles.
   - TileAdapter: the current tiles (Secure.QS_TILES), then the divider qs_customize_divider.xml (drag_to_add_tiles in
     colorAccent, TextAppearance.Material.Body2, 20 dp above, 13 dp below, 16 dp in; drag_to_remove_tiles while a tile is
     dragged), then the system tiles of quick_settings_tiles_stock not in use (TileQueryHelper, the available ones). From
     the divider down TileItemDecoration paints colorSecondary (#37474f). Each tile is a CustomizeTileView (QSTileView:
     the icon at rest and its two-line label) in qs_customize_tile_frame.xml (8 dp at the sides, 16 dp under it).
   - ItemTouchHelper: a long press starts the drag (Holder.startDrag: 1.2 times over 100 ms, the label fading out); the
     tile follows the finger and takes the place of the tile it is over, the others moving there in 150 ms
     (DefaultItemAnimator.setMoveDuration); canDropOver allows the current tiles and the divider's place, so a tile dragged
     past the divider is removed and one dragged up from below is added. Let go, it settles in its place (stopDrag) and
     the tiles are saved (TileAdapter.saveSpecs: everything before the divider).
   - Reset (QSCustomizer.reset) puts quick_settings_tiles_default back. */
(() => {
  'use strict';
  const A = name => `assets/${name}`;
  const T = () => NG.text('shade');
  const W = 1440 / 3.5;
  // qs_customize_tile_frame (8 dp, 16 dp under) around QSTileView's natural height: 14 + 4 dp padding above, the 24 dp
  // icon and 12 dp under it, the two-line label (30.57 dp at 12 sp with the font padding), 4 dp below.
  const ROW = 18 + 24 + 12 + 30.571 + 4 + 16, DIVIDER = 20 + 18.59 + 13, COL = W / 3;

  // TileAdapter.recalcSpecs: the current tiles, the divider (null), the other available system tiles.
  function order(c) {
    const cur = NG.qsTiles.specs(c), rest = NG.qsTiles.available(c).filter(id => !cur.includes(id));
    return [...cur, null, ...rest];
  }
  // GridLayoutManager: tiles one span, the divider all three on a row of its own.
  function layout(list) {
    const at = []; let y = 0, col = 0;
    for (const id of list) {
      if (id === null) { if (col) { y += ROW; col = 0; } at.push({x: 0, y, w: W, h: DIVIDER}); y += DIVIDER; continue; }
      at.push({x: col * COL, y, w: COL, h: ROW});
      if (++col === 3) { col = 0; y += ROW; }
    }
    return {at, height: y + (col ? ROW : 0)};
  }
  const edit = c => c.ui.shade?.edit;

  function tileHtml(c, id, i, box, editIndex) {
    const tile = NG.qsTiles.state(c, id), t = T(); if (!tile) return '';
    const label = i < editIndex ? t.fmt('accessibility_qs_edit_tile_label', null, i + 1, tile.label) : t.fmt('accessibility_qs_edit_add_tile_label', null, tile.label);
    const icon = tile.battery ? `<span class="ngqs-icon ngqs-batt">${NG.batteryMeter()}</span>`
      : tile.overlay !== undefined ? `<span class="ngqs-icon ngqs-signal"><img src="${A(tile.icon)}" alt="">${tile.overlay ? `<img src="${A(tile.overlay)}" alt="">` : ''}</span>`
      : NG.qsAvd?.(tile.icon.replace(/^sui-|\.svg$/g, ''), 'ngqs-icon') || `<img class="ngqs-icon" src="${A(tile.icon)}" alt="">`;
    return `<div class="ngqe-item ngqe-tile" data-spec="${id}" style="${pos(box)}" role="button" aria-label="${c.safe(label)}"><div class="ngqe-tv">${icon}<span class="ngqs-label${tile.dim ? ' dim' : ''}">${c.safe(tile.label)}</span></div></div>`;
  }
  const pos = b => `left:calc(${b.x.toFixed(3)} * var(--dp));top:calc(${b.y.toFixed(3)} * var(--dp));width:calc(${b.w.toFixed(3)} * var(--dp));height:calc(${b.h.toFixed(3)} * var(--dp))`;

  function render(c) {
    const e = edit(c), t = T();
    const list = e.order, {at, height} = layout(list), ei = list.indexOf(null);
    const at0 = e.origin ? `--rx:calc(${e.origin.x.toFixed(2)} * var(--dp));--ry:calc(${e.origin.y.toFixed(2)} * var(--dp))` : '';
    const items = list.map((id, i) => id === null
      ? `<div class="ngqe-item ngqe-divider" style="${pos(at[i])}">${c.safe(t.t(e.drag ? 'drag_to_remove_tiles' : 'drag_to_add_tiles'))}</div>`
      : tileHtml(c, id, i, at[i], ei)).join('');
    const menu = e.menu ? `<div class="ngqe-out" data-action="ngqe-menu-close"></div><div class="ngqe-pop" role="menu"><button type="button" class="ngqe-mi" role="menuitem" data-action="ngqe-reset">${c.safe(t.t('reset'))}</button></div>` : '';
    return `<div class="ngqe${e.revealed ? '' : ' reveal'}" style="${at0}" role="region" aria-label="${c.safe(t.t('accessibility_desc_quick_settings_edit'))}">
      <div class="ngqe-bar"><button type="button" class="ngqe-up" data-action="ngqe-up" aria-label="${c.safe(t.t('framework/action_bar_up_description'))}"><i></i></button><span class="ngqe-title">${c.safe(t.t('qs_edit'))}</span><button type="button" class="ngqe-more" data-action="ngqe-menu" aria-label="${c.safe(t.t('framework/action_menu_overflow_description'))}"><i></i></button></div>
      <div class="ngqe-list"><div class="ngqe-grid" style="height:calc(${height.toFixed(3)} * var(--dp))"><i class="ngqe-decor" style="top:calc(${at[ei].y.toFixed(3)} * var(--dp))"></i>${items}</div></div>${menu}
    </div>`;
  }

  // The tiles move to their places (the item animator); the dragged one stays under the finger.
  function relayout(c, root) {
    const e = edit(c), {at, height} = layout(e.order), ei = e.order.indexOf(null);
    root.querySelector('.ngqe-grid').style.height = `calc(${height.toFixed(3)} * var(--dp))`;
    root.querySelector('.ngqe-decor').style.top = `calc(${at[ei].y.toFixed(3)} * var(--dp))`;
    e.order.forEach((id, i) => {
      const el = id === null ? root.querySelector('.ngqe-divider') : root.querySelector(`.ngqe-tile[data-spec="${id}"]`);
      if (el && !el.classList.contains('dragging')) Object.assign(el.style, {left: `calc(${at[i].x.toFixed(3)} * var(--dp))`, top: `calc(${at[i].y.toFixed(3)} * var(--dp))`});
      if (el && id !== null) { const tile = NG.qsTiles.state(c, id), t = T(); el.setAttribute('aria-label', i < ei ? t.fmt('accessibility_qs_edit_tile_label', null, i + 1, tile.label) : t.fmt('accessibility_qs_edit_add_tile_label', null, tile.label)); }
    });
    return {at};
  }
  function save(c) {
    const e = edit(c); if (!e) return;
    const cur = e.order.slice(0, e.order.indexOf(null));
    const s = c.data.settings, same = cur.join() === NG.qsTiles.DEFAULT.join();
    if (same) delete s.qsTiles; else s.qsTiles = cur;
    c.save();
  }

  function mount(c, root, ctl) {
    const e = edit(c); if (!root || !e) return;
    e.revealed = true;
    NG.qsRestIcons?.(root);
    for (const el of root.querySelectorAll('.ngqe-tile')) bindDrag(c, root, el, ctl);
  }
  function bindDrag(c, root, el, ctl) {
    el.addEventListener('pointerdown', down => {
      if (down.button) return;
      const e = edit(c), dpPx = c.el.screen.clientWidth / W;
      let timer = setTimeout(start, 500), dragging = false, x0 = down.clientX, y0 = down.clientY;
      const grid = root.querySelector('.ngqe-grid');
      let base = null;
      function start() {
        timer = 0; dragging = true; e.drag = el.dataset.spec;
        root.querySelector('.ngqe-divider').textContent = T().t('drag_to_remove_tiles');
        const r = el.getBoundingClientRect(), g = grid.getBoundingClientRect();
        base = {left: (r.left - g.left) / dpPx, top: (r.top - g.top) / dpPx};
        el.classList.add('dragging');
      }
      const move = ev => {
        if (!dragging) { if (Math.hypot(ev.clientX - x0, ev.clientY - y0) / dpPx > 8) cancel(); return; }
        ev.preventDefault();
        const dx = (ev.clientX - x0) / dpPx, dy = (ev.clientY - y0) / dpPx;
        el.style.left = `calc(${(base.left + dx).toFixed(2)} * var(--dp))`; el.style.top = `calc(${(base.top + dy).toFixed(2)} * var(--dp))`;
        // The drop target: the item under the dragged tile's centre that canDropOver allows.
        const cx = base.left + dx + COL / 2, cy = base.top + dy + ROW / 2, {at} = layout(e.order), ei = e.order.indexOf(null);
        const from = e.order.indexOf(e.drag);
        const to = at.findIndex((b, i) => i !== from && cx >= b.x && cx < b.x + b.w && cy >= b.y && cy < b.y + b.h);
        if (to < 0 || to > ei + 1 || (to === ei + 1 && from > ei)) return;
        const id = e.order.splice(from, 1)[0]; e.order.splice(to, 0, id);
        relayout(c, root);
      };
      const cancel = () => { clearTimeout(timer); timer = 0; off(); };
      const off = () => { document.removeEventListener('pointermove', move, true); document.removeEventListener('pointerup', up, true); document.removeEventListener('pointercancel', up, true); };
      const up = () => {
        off(); clearTimeout(timer);
        if (!dragging) return;
        e.drag = null; el.classList.remove('dragging');
        root.querySelector('.ngqe-divider').textContent = T().t('drag_to_add_tiles');
        relayout(c, root); save(c);
        if (c.ui.shade) { c.ui.shade.dragged = true; setTimeout(() => { if (c.ui.shade) c.ui.shade.dragged = false; }, 0); }
      };
      document.addEventListener('pointermove', move, true);
      document.addEventListener('pointerup', up, true);
      document.addEventListener('pointercancel', up, true);
    });
  }

  function show(c, origin, ctl) {
    const st = c.ui.shade; if (!st || st.edit) return;
    st.edit = {order: order(c), origin, revealed: false, menu: false, drag: null};
    ctl.refresh(c);
  }
  // hide: saves, then the reveal backwards into origin (dp in QSContainer) or the panel's centre.
  function hide(c, origin, ctl) {
    const st = c.ui.shade, e = st?.edit; if (!e || e.closing) return;
    save(c); e.closing = true; e.menu = false;
    const el = c.el.overlay.querySelector('.ngqe');
    const finish = () => { if (c.ui.shade) { c.ui.shade.edit = null; c.ui.shade.closing = false; } ctl.refresh(c); };
    if (!el || !el.animate) { finish(); return; }
    const r = el.getBoundingClientRect(), dp = c.el.screen.clientWidth / W;
    const o = origin || {x: r.width / dp / 2, y: r.height / dp / 2};
    const at = `at calc(${o.x.toFixed(2)} * var(--dp)) calc(${o.y.toFixed(2)} * var(--dp))`;
    el.classList.remove('reveal'); el.querySelector('.ngqe-out')?.remove(); el.querySelector('.ngqe-pop')?.remove();
    st.closing = true;
    el.animate([{clipPath: `circle(150% ${at})`}, {clipPath: `circle(0px ${at})`}], {duration: 450, easing: 'cubic-bezier(.37,0,.63,1)', fill: 'forwards'});
    el.animate([{background: '#263238'}, {background: '#ffffff66'}], {duration: 158, delay: 292, fill: 'forwards'});
    setTimeout(finish, 450);
  }

  function action(c, name, el, ctl) {
    const e = edit(c); if (!e) return false;
    if (name === 'ngqe-up') {
      const b = el.getBoundingClientRect(), q = c.el.overlay.querySelector('.ngqe').getBoundingClientRect(), dp = c.el.screen.clientWidth / W;
      hide(c, {x: (b.left + b.width / 2 - q.left) / dp, y: (b.top + b.height / 2 - q.top) / dp}, ctl); return true;
    }
    if (name === 'ngqe-menu') { e.menu = true; ctl.refresh(c); return true; }
    if (name === 'ngqe-menu-close') { e.menu = false; ctl.refresh(c); return true; }
    if (name === 'ngqe-reset') { e.menu = false; e.order = [...NG.qsTiles.DEFAULT, null, ...NG.qsTiles.available(c).filter(id => !NG.qsTiles.DEFAULT.includes(id))]; save(c); ctl.refresh(c); return true; }
    return true;
  }

  NG.qsEdit = {render, mount, show, hide, action};
})();
