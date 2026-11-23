/* Currents 2.1 (JWR66Y Currents.apk): the editions by category and Customize.
   - The home menu (CurrentsHomeCategoryMenuAdapter) lists each category (currents_home_category_menu_category_row:
     18 dp light #b2b2b2), its editions (currents_home_category_menu_app_row) and an italic Customize child
     (currents_home_category_menu_customize_row). The three demo editions are the simulator's own: Tech Daily under
     Science & Tech (category_science), Trail & Summit and Weekend Kitchen under Lifestyle (category_lifestyle).
   - Customize (onCategoryMenuCustomizeSelected -> CurrentsNavigator.showManageContent -> ContentManagementActivity):
     the title customize_category ("Customize %1$s"), the category's editions as DraggableSubscriptionRows
     (manage_edition_row.xml: the reorder handle, the icon, the name, the pin button btn_download_stream /
     btn_download_pinned with the edition_has_been_pinned / _unpinned toast, and the x that removes it), then the fixed
     Breaking stories row whose check box adds or removes the category from Breaking stories
     (SubscriptionUtil.add/removeBreakingStorySubscription). content_management_menu.xml: Add editions (add.png).
   - Add editions (CurrentsNavigator.showLibraryManagement -> LibraryManagementActivity, add_apps_title_long): the
     server's catalogue in the app; offline it is the category's demo editions as add_more_edition_rows with "In
     library" or "Add for free" (a removed edition comes back at the end).
   State: data.currents = {order, removed, pinned, noBreaking}. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // [name, topic, colour, category]
  const EDITIONS = [['Tech Daily', 'Technology', '#e53935', 'science'], ['Trail & Summit', 'Outdoors', '#43a047', 'lifestyle'], ['Weekend Kitchen', 'Food', '#fb8c00', 'lifestyle']];
  const CATEGORIES = [['science', 'Science & Tech'], ['lifestyle', 'Lifestyle']];
  const find = name => EDITIONS.find(([n]) => n === name);
  function state(data) {
    const s = data.currents && typeof data.currents === 'object' ? data.currents : (data.currents = {});
    for (const key of ['order', 'removed', 'pinned', 'noBreaking']) if (!Array.isArray(s[key])) s[key] = [];
    return s;
  }
  // The subscribed editions in their saved order.
  function editions(data) {
    const s = state(data), names = [...s.order.filter(find), ...EDITIONS.map(([n]) => n).filter(n => !s.order.includes(n))];
    return names.filter(n => !s.removed.includes(n)).map(find);
  }
  const inCategory = (data, cat) => editions(data).filter(ed => ed[3] === cat);
  const label = (S, cat) => S((CATEGORIES.find(([id]) => id === cat) || [, cat])[1]);
  // Breaking stories leaves out removed editions and categories whose box is cleared.
  const inBreaking = (data, name) => { const ed = editions(data).find(([n]) => n === name); return !!ed && !state(data).noBreaking.includes(ed[3]); };
  const icon = ([name, , color]) => `<i style="background:${color}">${e(name[0])}</i>`;
  // The home menu's category groups (rendered by jb-extra-apps.js beside Breaking stories and Saved).
  function menu(data, S, edition) {
    return CATEGORIES.map(([cat]) => `<p class="cur-group">${e(label(S, cat))}</p>${inCategory(data, cat).map(ed => `<button class="cur-app${ed[0] === edition ? ' on' : ''}" data-action="currents-edition" data-id="${e(ed[0])}">${icon(ed)}${e(ed[0])}</button>`).join('')}<button class="cur-app cur-customize" data-action="ccz-open" data-id="${cat}">${e(S('Customize'))}</button>`).join('');
  }
  const bar = (title, t, actions = '') => `<header class="sa-bar nr-bar"><button class="sa-up" data-action="back" aria-label="${e(t('Back'))}"><img class="sa-caret" src="assets/ic_ab_back_holo_light.png" alt=""><img src="assets/currents.png" alt=""></button><span class="sa-title"><b>${e(title)}</b></span>${actions}</header>`;
  function page(ctx) {
    const {ui, data, S, t} = ctx, cat = ui.currentsCustomize, s = state(data);
    if (ui.currentsLibrary) {
      const rows = EDITIONS.filter(ed => ed[3] === cat).map(ed => { const owned = !s.removed.includes(ed[0]); return `<div class="ccz-lib-row">${icon(ed)}<span><b>${e(ed[0])}</b><small>${e(label(S, ed[3]))}</small></span>${owned ? `<button class="ccz-in" disabled>${e(S('In library'))}</button>` : `<button class="ccz-add" data-action="ccz-subscribe" data-id="${e(ed[0])}">${e(S('Add for free'))}</button>`}</div>`; }).join('');
      return `<div class="app-view kkx-app ccz">${bar(S('Add editions'), t)}<div class="ccz-list">${rows}</div></div>`;
    }
    const rows = inCategory(data, cat).map(ed => { const pinned = s.pinned.includes(ed[0]); return `<div class="ccz-row" data-ccz-row="${e(ed[0])}"><button class="ccz-grip" data-ccz-drag="${e(ed[0])}" aria-label="${e(S('Reorder'))}"><img src="assets/cur-reorder.png" alt=""></button>${icon(ed)}<span>${e(ed[0])}</span><button class="ccz-pin" data-action="ccz-pin" data-id="${e(ed[0])}" aria-pressed="${pinned}" aria-label="${e(S('Include images for offline reading'))}"><img src="assets/cur-btn_download_${pinned ? 'pinned' : 'stream'}.png" alt=""></button><button class="ccz-x" data-action="ccz-remove" data-id="${e(ed[0])}" aria-label="${e(S('Remove'))}"><img src="assets/cur-x.png" alt=""></button></div>`; }).join('');
    const breaking = !s.noBreaking.includes(cat);
    const fixed = `<label class="ccz-row ccz-fixed"><img src="assets/currents.png" alt=""><span>${e(S('Breaking stories'))}</span><input type="checkbox" data-ccz-breaking="${cat}"${breaking ? ' checked' : ''}></label>`;
    const add = `<button class="sa-btn ccz-addbtn" data-action="ccz-library" aria-label="${e(S('Add editions'))}"><img src="assets/cur-add.png" alt=""></button>`;
    return `<div class="app-view kkx-app ccz" data-ccz>${bar(AndroidStrings.format(S('Customize %1$s'), label(S, cat)), t, add)}<div class="ccz-list">${rows}${fixed}</div></div>`;
  }
  // ctx: {ui, data, S, save, render, toast}
  function handle(action, id, ctx) {
    const {ui, data, S} = ctx, s = state(data);
    switch (action) {
      case 'ccz-open': if (!CATEGORIES.some(([cat]) => cat === id)) return true; ui.currentsCustomize = id; ui.currentsLibrary = false; ui.currentsMenu = false; break;
      case 'ccz-library': ui.currentsLibrary = true; break;
      case 'ccz-pin': { if (!find(id)) return true; const on = !s.pinned.includes(id); s.pinned = on ? [...s.pinned, id] : s.pinned.filter(n => n !== id); ctx.save(); ctx.toast(AndroidStrings.format(S(on ? '%1$s - images will be available for offline reading.' : '%1$s - images will not be available for offline reading.'), id)); break; }
      case 'ccz-remove': if (!find(id)) return true; s.removed = [...s.removed.filter(n => n !== id), id]; s.pinned = s.pinned.filter(n => n !== id); if (ui.currentsEdition === id) ui.currentsEdition = ''; ctx.save(); break;
      case 'ccz-subscribe': if (!find(id)) return true; s.removed = s.removed.filter(n => n !== id); s.order = [...editions(data).map(([n]) => n).filter(n => n !== id), id]; ctx.save(); break;
      default: return false;
    }
    ctx.render();
    return true;
  }
  function change(target, ctx) {
    const cat = target?.dataset?.cczBreaking; if (!cat) return false;
    const s = state(ctx.data); s.noBreaking = target.checked ? s.noBreaking.filter(c => c !== cat) : [...s.noBreaking.filter(c => c !== cat), cat];
    ctx.save(); return true;
  }
  // Back (and Up): Add editions returns to Customize, Customize to the home screen.
  function back(ui) {
    if (ui.currentsLibrary) { ui.currentsLibrary = false; return true; }
    if (ui.currentsCustomize) { ui.currentsCustomize = ''; return true; }
    return false;
  }
  // DraggableRowsListView: the handle drags a row; dropping it saves the category's new order.
  function attach(root, ctx) {
    let cleanup = () => {}, destroyed = false;
    root.addEventListener('pointerdown', event => {
      const grip = event.target.closest('[data-ccz-drag]'); if (!grip) return;
      event.preventDefault(); event.stopPropagation(); cleanup();
      const name = grip.dataset.cczDrag, row = grip.closest('[data-ccz-row]'), height = row.getBoundingClientRect().height, start = event.clientY;
      let dy = 0; row.classList.add('dragging');
      const move = ev => { dy = ev.clientY - start; row.style.transform = `translateY(${dy}px)`; };
      const finish = ev => {
        cleanup(); if (destroyed) return;
        if (ev.type !== 'pointercancel') {
          const all = editions(ctx.data).map(([n]) => n), group = all.filter(n => find(n)[3] === find(name)[3]), from = group.indexOf(name), to = Math.max(0, Math.min(group.length - 1, from + Math.round(dy / height)));
          if (to !== from) { group.splice(from, 1); group.splice(to, 0, name); let i = 0; state(ctx.data).order = all.map(n => find(n)[3] === find(name)[3] ? group[i++] : n); ctx.save(); }
        }
        ctx.render();
      };
      cleanup = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', finish); window.removeEventListener('pointercancel', finish); row.style.transform = ''; row.classList.remove('dragging'); };
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', finish); window.addEventListener('pointercancel', finish);
    });
    return {destroy() { destroyed = true; cleanup(); }};
  }
  window.CurrentsCustomize = {EDITIONS, CATEGORIES, state, editions, inBreaking, menu, page, handle, change, back, attach};
})();
