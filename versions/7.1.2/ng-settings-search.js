/* Android 7.1.2 Settings: the dashboard's search (SearchResultsSummary) and the Support tab's Phone / Chat (SettingsGoogle
   N2G48C). The logic is 6.0.1's (its search code); N2G48C decides what differs:
   - The search menu item expands a SearchView over the action bar (the query in white, Widget.Material.SearchView's
     defaultQueryHint "Search…", the clear button);
     search_panel: before a query the Recent searches list (search_panel_suggestions_header, search_suggestion_item with
     ic_search_history at the end), with one the Results (search_panel_results_header; search_result_item: the 24 dp
     icon of the screen the row is on, 12 dp in and 32 dp before the title in textAppearanceMedium). The index is what
     the image's screens show: each dashboard tile, then the titles of its screen's preferences.
   - SupportItemAdapter's escalation buttons ask SupportDisclaimerDialogFragment (Send system information, the content,
     Do not show again), then "Just a sec…" while the support request goes out; offline it never comes back, so the
     dialog closes. */
(() => {
  'use strict';
  const T = () => NG.text('settings');
  const S = c => c.data.settings;
  const A = name => `assets/${name}`;
  const str = NG.settingsStr;
  function index(c) {
    const out = [], seen = new Set(), t = T();
    const add = (title, screen, icon, nav) => { if (!title || seen.has(title + screen)) return; seen.add(title + screen); out.push({title, screen, icon, nav}); };
    for (const tile of NG.settingsDashboard.tiles) {
      if (tile.disabled || !tile.fragment || (tile.cls === 'Settings$DevelopmentSettingsActivity' && !S(c).devOptions)) continue;
      const screen = NG.settingsScreenOf(tile.fragment), icon = tile.icon;
      add(t.t(tile.title), screen, icon, 'menu');
      const xml = screen?.startsWith('xml:') ? screen.slice(4) : null, node = xml && NG.settingsXml[xml];
      const walk = n => { for (const k of n.c || []) { if (k.title && !/Category$/.test(k.t)) add(str(k.title), screen, icon, 'menu'); walk(k); } };
      if (node) walk(node);
    }
    return out;
  }
  const tileIcon = ic => !ic?.icon ? '<i class="ngse-ic"></i>' : ic.tint ? `<i class="ngse-ic" style="background:${ic.tint};-webkit-mask-image:url('${A(ic.icon)}');mask-image:url('${A(ic.icon)}')"></i>` : `<img class="ngse-ic" src="${A(ic.icon)}" alt="">`;
  NG.settingsSearch = c => NG.settingsGo(c, 'search', T().t('search_menu'), 'up');
  NG.settingsScreens.search = {
    full: true,
    render(c) {
      const t = T(), q = (c.ui.settingsQ || '').trim().toLocaleLowerCase(c.locale()), recents = S(c).searchRecents || [];
      const hits = q ? index(c).filter(x => x.title.toLocaleLowerCase(c.locale()).includes(q)).slice(0, 60) : [];
      const list = q ? `<div class="ngse-head">${c.safe(t.t('search_results_label'))}</div>${hits.map(h => `<button type="button" class="ngse-row" data-action="ngse-hit" data-screen="${c.safe(h.screen || '')}" data-title="${c.safe(h.title)}">${tileIcon(h.icon)}<span>${c.safe(h.title)}</span></button>`).join('')}`
        : recents.length ? `<div class="ngse-head">${c.safe(t.t('search_recents_queries_label'))}</div>${recents.map(r => `<button type="button" class="ngse-row recent" data-action="ngse-recent" data-q="${c.safe(r)}"><span>${c.safe(r)}</span><i class="ngse-hist"></i></button>`).join('')}` : '';
      return `<div class="ngst ngse"><div class="ngst-ab"><button type="button" class="ngst-nav" data-action="ngse-back" aria-label="${c.safe(t.t('framework/action_bar_up_description'))}"><i style="-webkit-mask-image:url('${A('fw-ic_ab_back_material.svg')}');mask-image:url('${A('fw-ic_ab_back_material.svg')}')"></i></button>
        <input class="ngse-q" value="${c.safe(c.ui.settingsQ || '')}" placeholder="${c.safe(t.t('framework/search_hint'))}" autocomplete="off" spellcheck="false">${c.ui.settingsQ ? `<button type="button" class="ngst-ab-btn" data-action="ngse-clear" aria-label="${c.safe(t.t('framework/searchview_description_clear'))}"><i style="-webkit-mask-image:url('${A('fw-ic_clear_material.svg')}');mask-image:url('${A('fw-ic_clear_material.svg')}')"></i></button>` : ''}</div>
        <div class="ngst-content ngse-panel">${list ? `<div class="ngse-list">${list}</div>` : ''}</div></div>`;
    },
    mount(c, root) {
      const f = root.querySelector('.ngse-q'); if (!f) return;
      f.addEventListener('input', () => { const p = f.selectionStart; c.ui.settingsQ = f.value; c.transition('none'); c.render(); const g = c.el.viewport.querySelector('.ngse-q'); if (g) { g.focus(); g.setSelectionRange(p, p); } });
      f.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); remember(c, f.value); } });
      if (document.activeElement !== f) setTimeout(() => f.focus(), 40);
    },
    back(c) { c.ui.settingsQ = ''; return false; },
    action(c, name, el) {
      if (name === 'ngse-back') { c.ui.settingsQ = ''; c.ui.settings.stack.pop(); c.render(); return true; }
      if (name === 'ngse-clear') { c.ui.settingsQ = ''; c.transition('none'); c.render(); return true; }
      if (name === 'ngse-recent') { c.ui.settingsQ = el.dataset.q; c.transition('none'); c.render(); return true; }
      if (name === 'ngse-hit') {
        remember(c, c.ui.settingsQ);
        c.ui.settingsQ = ''; c.ui.settings.stack.pop();
        if (el.dataset.screen) NG.settingsGo(c, el.dataset.screen, el.dataset.title, 'menu'); else c.render();
        return true;
      }
      return false;
    }
  };
  // SavedQueries: the last queries, newest first (MAX_SAVED_SEARCH_QUERY 64; the panel shows them all).
  function remember(c, q) {
    q = (q || '').trim(); if (!q) return;
    S(c).searchRecents = [q, ...(S(c).searchRecents || []).filter(x => x !== q)].slice(0, 64); c.save();
  }

  // SupportDisclaimerDialogFragment, then the support request.
  NG.settingsSupportEscalation = c => {
    const t = T(), s = S(c);
    const start = c => { c.dialog({progress: t.t('support_loader_dialog_message'), cancelable: true}); setTimeout(() => c.closeDialog?.(), 2500); };
    if (s.supportNoDisclaimer) { start(c); return; }
    let skip = false;
    c.dialog({title: t.t('support_disclaimer_title'), html: `<div class="ngse-disc"><p>${c.safe(t.t('support_disclaimer_content'))}</p><label class="ngwf-check"><input type="checkbox"><i class="ngst-check"></i><span>${c.safe(t.t('support_disclaimer_do_not_show'))}</span></label></div>`,
      mount: (c, win) => win.querySelector('input').addEventListener('change', e => { skip = e.target.checked; e.target.nextElementSibling.classList.toggle('on', skip); }),
      buttons: [{label: t.t('cancel')}, {label: t.t('ok'), action: c => { if (skip) { s.supportNoDisclaimer = true; c.save(); } start(c); }}]});
  };
})();
