/* Android 7.1.2 framework options menu (framework-res.apk of N2G48C): the action bar's overflow button
   (Widget.Material.ActionButton.Overflow: ic_menu_moreoverflow_material, 36 dp at least, 6 dp before and 10 dp after the
   icon, "More options") opens MenuPopupHelper's ListPopupWindow in Widget.Material.Light.PopupMenu.Overflow:
   overlapAnchor (its top on the button's top), dropDownHorizontalOffset -4 dp from the button's end,
   popup_background_material (2 dp corners, colorBackgroundFloating), floating_window_z 16 dp; the width is the widest
   row (popup_menu_item_layout: 196 dp at least, the title 16 dp from the start and 16 dp from the end, 48 dp
   dropdownListPreferredItemHeight, textAppearanceLargePopupMenu 16 sp). popup_window_enter: EpicenterTranslateClipReveal
   (250 ms) from the button with a fade from 0.1 (100 ms); popup_window_exit a 300 ms fade.
   The logic is 6.0.1's (mm-menu.js). Use: c.menu([{label, disabled, checked, action(c)}], anchor) opens it as the
   overlay 'menu' (anchor: the element it drops from; else the screen's top end); NG.menu.button(c, extra, dark) is the
   overflow button's markup with data-action "ng-menu" for a module to open its own items. */
(() => {
  'use strict';
  const items = c => c.ui.menuItems || [];
  NG.menu = {
    button: (c, extra = '', dark = false) => `<button type="button" class="ng-overflow${extra ? ' ' + extra : ''}${dark ? ' dark' : ''}" data-action="ng-menu" aria-label="${c.safe(NG.text('framework').t('action_menu_overflow_description'))}"><i></i></button>`
  };
  NG.register('menu', {
    app: false,
    init(c) {
      c.menu = (list, anchor) => {
        const s = c.el.screen.getBoundingClientRect(), dpPx = c.el.screen.clientWidth / (1440 / 3.5), r = anchor?.getBoundingClientRect?.();
        c.ui.menuAt = r ? {top: (r.top - s.top) / dpPx, right: (s.right - r.right) / dpPx + 4} : {top: 24, right: 4};
        c.ui.menuItems = list; c.overlay('menu');
      };
    },
    render: c => { const at = c.ui.menuAt || {top: 24, right: 4}; return `<div class="ngmenu"><div class="ngmenu-out" data-action="ngmenu-close"></div><div class="ngmenu-pop" role="menu" style="top:calc(${at.top.toFixed(2)} * var(--dp));right:calc(${at.right.toFixed(2)} * var(--dp))">${items(c).map((it, i) =>
      `<button type="button" class="ngmenu-item" role="menuitem" data-action="ngmenu-item" data-index="${i}"${it.disabled ? ' disabled' : ''}><span>${c.safe(it.label)}</span>${'checked' in it ? `<i class="ngmenu-check${it.checked ? ' on' : ''}"></i>` : ''}</button>`).join('')}</div></div>`; },
    mount(c,root) {
      const pop=root.querySelector('.ngmenu-pop'),area=root.querySelector('.ngmenu');if(!pop||!area)return;
      // ListPopupWindow keeps its popup inside the display's available frame,
      // including when the anchor is beside the left edge or bottom toolbar.
      const frame=area.getBoundingClientRect(),box=pop.getBoundingClientRect(),dp=c.el.screen.clientWidth/(1440/3.5),pad=4*dp,top=24*dp,bottom=frame.height-48*dp;
      const left=Math.max(pad,Math.min(frame.width-box.width-pad,box.left-frame.left));
      const y=Math.max(top,Math.min(bottom-box.height,box.top-frame.top));
      Object.assign(pop.style,{left:left+'px',right:'auto',top:y+'px',maxHeight:Math.max(48*dp,bottom-top)+'px',overflowY:'auto'});
    },
    action(name, el, event, c) {
      if (name === 'ngmenu-close') { c.closeOverlay(); return true; }
      if (name === 'ngmenu-item') { const it = items(c)[+el.dataset.index]; if (it?.disabled) return true; c.closeOverlay(); it?.action?.(c); return true; }
      return false;
    }
  });
})();
