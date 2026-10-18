/* Android 6.0.1 Contacts (Google Contacts 1.2, priv-app/GoogleContacts of MTC20K), the app 'contacts'.
   - PeopleActivity (people_activity.xml, PeopleTheme: primary #0288d1, status bar #0277bd): the actionBarSize Toolbar
     with "Contacts", Search (ic_ab_search) and the overflow, ViewPagerTabs with FAVORITES / ALL CONTACTS (All contacts
     first, as ActionBarAdapter's default), 2 dp elevation, and the 56 dp fab_blue FAB (ic_person_add_24dp) 16 dp from
     the bottom right. The overflow (people_options.xml, onPrepareOptionsMenu): Contacts to display on All contacts, Clear
     frequents on Favorites when there are frequents, Import/export, Accounts, Settings, Help & feedback.
   - All contacts (contact_list_content.xml on #f9f9f9): user_profile_header's "Me" / "Set up my profile", then
     ContactListItemView rows: the 48 dp section letter (SectionHeaderStyle 20 sp medium #888888), the 40 dp photo,
     15 dp, the 16 sp #363636 name; 12 dp above and below.
   - Favorites (contact_tile_list.xml): ContactTileStarredView in 3 columns (16 dp at the sides, 24 dp above each, the
     round photo, the 16 sp #202020 name 7 dp under it), then list_separator's "Frequently contacted" (24 sp bold
     #0288d1, 16 / 15 dp) and ContactTileFrequentView rows; empty: "No favorites.".
   - QuickContactActivity (quickcontact_activity.xml, fully expanded from the list): MultiShrinkScroller's square header
     in the contact's MaterialPalette (a letter tile's colour from letter_tile_colors, the status bar its
     letter_tile_colors_dark pair) with person_white_540dp, the #88000000 gradients under the toolbar and behind the 30 dp
     title, shrinking to the toolbar as the cards scroll; the toolbar's star (ic_star_outline_24dp / ic_star_24dp), edit
     (ic_create_24dp) and overflow (Delete, Share, Place on Home screen, Help & feedback). The cards on #f4f4f4
     (ExpandingEntryCardView: 8 dp sides, 12 dp apart, 2 dp corners): the phone (ic_phone_24dp, the number, its type,
     ic_message_24dp to text it) and the email (ic_email_24dp), icons in the palette colour; Recent with
     CallLogInteraction's entries (the number, its type, ContactInteractionUtil's date with the call arrow #2aad6f /
     #ff2e58).
   - The compact editor (compact_contact_editor_fragment.xml): the actionBarSize bar with "Add new contact" / "Edit
     contact", Save (ic_done_wht_24dp) and the overflow (Discard changes, Delete); the photo at width / 1.96
     (editor_portrait_photo_ratio) with ic_photo_camera_white_24dp; KindSectionView rows (EditKindIconStyle: 24 dp #7f7f7f
     icons 16 dp in, 14 dp down, 28 dp before the fields) with 16 sp fields 54 dp high, hints at #40000000: Name, Phone
     with its Mobile type, Email with Home; "More Fields" in the accent. No account on the phone, so no account row. */
(() => {
  'use strict';
  const T = () => MM.text('contacts'), P = () => MM.people;
  const A = n => `assets/ct-${n}.png`;
  const DARK = ['#c53929', '#c2185b', '#7b1fa2', '#512da8', '#303f9f', '#3367d6', '#0277bd', '#006064', '#00796b', '#0b8043', '#33691e', '#e65100', '#e64a19', '#424242'];
  const ui = c => c.ui.contacts || (c.ui.contacts = {tab: c.data.contactsTab ?? 1, search: null, screen: '', from: '', draft: null, opened: ''});
  const esc = (c, s) => c.safe(s);
  const icon = (n, cls = '', style = '') => `<i class="mmct-ic ${cls}" style="--ic:url('${A(n)}');${style}" aria-hidden="true"></i>`;
  const palette = p => { const i = Math.abs(P().javaHash(p.lookup || p.name)) % 14; return p.name ? [P().COLORS[i], DARK[i]] : ['#607d8b', '#455a64']; };

  // ---- lists ----------------------------------------------------------------------------------------------------
  function row(c, p, head = '') {
    return `<div class="mmct-item"><span class="mmct-sec">${esc(c, head)}</span><button type="button" class="mmct-row" data-action="mmct-open" data-id="${p.id}">${P().tile(c, p, 'mmct-photo')}<span class="mmct-name">${esc(c, p.name)}</span></button></div>`;
  }
  function allContacts(c, list = P().sorted(c), profile = true) {
    const t = T();
    if (!list.length) return `<div class="mmct-empty">${esc(c, t.t('noContacts'))}</div>`;
    let letter = '';
    const me = profile ? `<div class="mmct-item mmct-me"><span class="mmct-sec">${esc(c, t.t('user_profile_contacts_list_header'))}</span><button type="button" class="mmct-row mmct-setup" data-action="mmct-profile">${esc(c, t.t('profile_display_name'))}</button></div>` : '';
    return `<div class="mmct-list">${me}${list.map(p => { const l = p.name.charAt(0).toLocaleUpperCase(c.locale()); const h = l !== letter ? (letter = l) : ''; return row(c, p, h); }).join('')}</div>`;
  }
  function frequents(c) {
    const counts = new Map(), since = c.data.frequentsCleared || 0;
    for (const x of P().calls(c)) if (x.time > since && x.type !== 'missed') { const p = P().byNumber(c, x.number); if (p && !p.starred) counts.set(p.id, (counts.get(p.id) || 0) + 1); }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => P().byId(c, id));
  }
  function favorites(c) {
    const t = T(), starred = P().sorted(c).filter(p => p.starred), freq = frequents(c);
    if (!starred.length && !freq.length) return `<div class="mmct-empty">${esc(c, t.t('listTotalAllContactsZeroStarred'))}</div>`;
    const grid = starred.length ? `<div class="mmct-stars">${starred.map(p => `<button type="button" class="mmct-star" data-action="mmct-open" data-id="${p.id}">${P().tile(c, p, 'mmct-sphoto')}<span class="mmct-sname">${esc(c, p.name)}</span></button>`).join('')}</div>` : '';
    const list = freq.length ? `<div class="mmct-freqhead${starred.length ? '' : ' first'}">${esc(c, t.t('favoritesFrequentContacted'))}</div>${freq.map(p => `<button type="button" class="mmct-freq" data-action="mmct-open" data-id="${p.id}">${P().tile(c, p, 'mmct-photo', false)}<span class="mmct-fname">${esc(c, p.name)}</span></button>`).join('')}` : '';
    return `<div class="mmct-favs">${grid}${list}</div>`;
  }
  // QuickContactActivity's Share: the contact as a vCard (Contacts.CONTENT_VCARD_URI, text/x-vcard) through share_via.
  function share(c, p) {
    if (!p) return;
    const vcard = ['BEGIN:VCARD', 'VERSION:2.1', `N:;${p.name || ''};;;`, `FN:${p.name || ''}`, ...(p.phone ? [`TEL;CELL:${p.phone}`] : []), ...(p.email ? [`EMAIL;HOME:${p.email}`] : []), 'END:VCARD'].join('\r\n');
    MM.share(c, {title: T().t('share_via'), kind: 'vcard', name: `${p.name || 'contact'}.vcf`, subject: p.name || '', text: vcard});
  }
  function people(c) {
    const t = T(), u = ui(c), searching = u.search !== null;
    const bar = searching
      ? `<div class="mmct-bar search"><button type="button" class="mmct-btn" data-action="mmct-sback" aria-label="${esc(c, t.t('menu_search'))}"><img src="${A('ic_arrow_back_24dp')}" alt=""></button><input type="text" class="mmct-sinput" value="${esc(c, u.search)}" placeholder="${esc(c, t.t('hint_findContacts'))}" autocomplete="off" spellcheck="false">${u.search ? `<button type="button" class="mmct-btn" data-action="mmct-sclear">${icon('ic_close_dk', 'w')}</button>` : ''}</div>`
      : `<div class="mmct-bar"><span class="mmct-title">${esc(c, t.t('applicationLabel'))}</span><button type="button" class="mmct-btn" data-action="mmct-search" aria-label="${esc(c, t.t('menu_search'))}"><img src="${A('ic_ab_search')}" alt=""></button>${MM.menu.button(c, 'mmct-over')}</div>`;
    if (searching) {
      const q = u.search.trim().toLowerCase(), d = q.replace(/[^0-9]/g, '');
      const list = q ? P().sorted(c).filter(p => p.name.toLowerCase().split(/\s+/).some(w => w.startsWith(q)) || p.name.toLowerCase().startsWith(q) || (d && P().digits(p.phone).includes(d))) : [];
      return `<div class="mmct">${bar}<div class="mmct-page">${list.length ? allContacts(c, list, false) : ''}</div></div>`;
    }
    const tabs = `<div class="mmct-tabs" role="tablist">${['favorites_tab_label', 'all_contacts_tab_label'].map((k, i) => `<button type="button" role="tab" aria-selected="${u.tab === i}" data-action="mmct-tab" data-tab="${i}">${esc(c, t.t(k))}</button>`).join('')}<i class="mmct-under" style="transform:translateX(${u.tab * 100}%)"></i></div>`;
    return `<div class="mmct"><div class="mmct-head">${bar}${tabs}</div><div class="mmct-page">${u.tab ? allContacts(c) : favorites(c)}</div>
      <button type="button" class="mmct-fab" data-action="mmct-new" aria-label="${esc(c, t.t('contact_editor_title_new_contact'))}"><img src="${A('ic_person_add_24dp')}" alt=""></button></div>`;
  }
  function picker(c) {
    const t = T(), u = ui(c);
    return `<div class="mmct"><div class="mmct-head"><div class="mmct-bar"><button type="button" class="mmct-btn" data-action="mmct-up"><img src="${A('ic_arrow_back_24dp')}" alt=""></button><span class="mmct-title in">${esc(c, t.t('contactPickerActivityTitle'))}</span></div></div>
      <div class="mmct-page"><div class="mmct-list">${P().sorted(c).map(p => `<div class="mmct-item"><span class="mmct-sec"></span><button type="button" class="mmct-row" data-action="mmct-pick" data-id="${p.id}">${P().tile(c, p, 'mmct-photo')}<span class="mmct-name">${esc(c, p.name)}</span></button></div>`).join('')}</div></div></div>`;
  }

  // ---- QuickContact ----------------------------------------------------------------------------------------------
  function interactionDate(c, time) {
    const d = new Date(time), now = new Date(), day = x => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const diff = Math.round((day(now) - day(d)) / 864e5);
    if (diff === 0) return new Intl.DateTimeFormat(c.locale(), {hour: 'numeric', minute: '2-digit'}).format(d);
    if (diff === 1) return MM.text('contacts').t('yesterday');
    return new Intl.DateTimeFormat(c.locale(), {month: 'long', day: 'numeric'}).format(d);
  }
  function card(c, p) {
    const t = T(), [color] = palette(p), tint = `background:${color}`;
    const entry = (ic, header, sub, alt = '', extra = '') => `<div class="mmct-entry"${extra}>${icon(ic, 'mmct-eic', tint)}<span class="mmct-etext"><b>${esc(c, header)}</b>${sub}</span>${alt}</div>`;
    const phone = p.phone ? entry('ic_phone_24dp', P().format(p.phone), `<span>${esc(c, P().typeLabel())}</span>`, `<button type="button" class="mmct-alt" data-action="mmct-sms" data-n="${esc(c, p.phone)}" aria-label="${esc(c, AndroidStrings.format(t.t('sms_custom'), P().format(p.phone)))}">${icon('ic_message_24dp', '', tint)}</button>`, ` data-action="mmct-call" data-n="${esc(c, p.phone)}"`) : '';
    const email = p.email ? entry('ic_email_24dp', p.email, `<span>${esc(c, t.t('emailTypeHome'))}</span>`, '', ` data-action="mmct-mail" data-to="${esc(c, p.email)}"`) : '';
    const recent = P().calls(c).filter(x => P().same(x.number, p.phone)).sort((a, b) => b.time - a.time).slice(0, 3);
    const recentCard = recent.length ? `<div class="mmct-card"><div class="mmct-ctitle" style="color:${color}">${esc(c, t.t('recent_card_title'))}</div><i class="mmct-csep"></i>${recent.map(x => entry('ic_phone_24dp', x.number, `<span>${esc(c, P().typeLabel())}</span><span class="mmct-when"><i class="mmct-arrow ${x.type}"></i>${esc(c, interactionDate(c, x.time))}</span>`, '', ` data-action="mmct-call" data-n="${esc(c, x.number)}"`)).join('')}</div>` : '';
    return `<div class="mmct-card">${phone}${phone && email ? '<i class="mmct-esep"></i>' : ''}${email}</div>${recentCard}`;
  }
  function quick(c, p) {
    const t = T(), [color] = palette(p);
    return `<div class="mmct mmct-qc" style="--pal:${color}"><div class="mmct-qhead"><div class="mmct-qphoto" style="background:${color}"><img src="${A('person_white_540dp')}" alt=""></div><i class="mmct-qgrad top"></i><i class="mmct-qgrad bottom"></i>
      <div class="mmct-qbar"><button type="button" class="mmct-btn" data-action="mmct-up"><img src="${A('ic_arrow_back_24dp')}" alt=""></button><i class="mmct-flex"></i>
        <button type="button" class="mmct-btn" data-action="mmct-star" data-id="${p.id}" aria-label="${esc(c, t.t(p.starred ? 'menu_removeStar' : 'menu_addStar'))}"><img src="${A(p.starred ? 'ic_star_24dp' : 'ic_star_outline_24dp')}" alt=""></button>
        <button type="button" class="mmct-btn" data-action="mmct-edit" data-id="${p.id}" aria-label="${esc(c, t.t('menu_editContact'))}"><img src="${A('ic_create_24dp')}" alt=""></button>${MM.menu.button(c, 'mmct-over')}</div>
      <b class="mmct-qtitle">${esc(c, p.name || t.t('missing_name'))}</b></div>
      <div class="mmct-qscroll"><i class="mmct-qspace"></i><div class="mmct-cards">${card(c, p)}</div></div></div>`;
  }
  function mountQuick(c, root) {
    const sc = root.querySelector('.mmct-qscroll'), head = root.querySelector('.mmct-qhead'); if (!sc || !head) return;
    const apply = () => {
      const w = head.parentElement.clientWidth, min = parseFloat(getComputedStyle(head).getPropertyValue('--bar')) || 56;
      const h = Math.max(min, w - sc.scrollTop), f = Math.max(0, Math.min(1, (h - min) / (w - min)));
      head.style.height = `${h}px`; head.style.setProperty('--f', f.toFixed(3));
      head.classList.toggle('collapsed', f === 0);
    };
    const u = ui(c), key = u.screen;
    sc.scrollTop = u.scroll?.[key] || 0;
    sc.addEventListener('scroll', () => { (u.scroll ||= {})[key] = sc.scrollTop; apply(); }, {passive: true}); apply();
  }

  // ---- editor ------------------------------------------------------------------------------------------------------
  function editor(c) {
    const t = T(), u = ui(c), d = u.draft, existing = !!d.id;
    const field = (key, hint, value, type = 'text') => `<input class="mmct-field" type="${type}" data-f="${key}" value="${esc(c, value)}" placeholder="${esc(c, hint)}" autocomplete="off" spellcheck="false">`;
    const section = (ic, body) => `<div class="mmct-kind">${icon(ic, 'mmct-kic')}<div class="mmct-kfields">${body}</div></div>`;
    const spinner = label => `<span class="mmct-spin">${esc(c, label)}</span>`;
    const p = {name: d.name, id: d.id}, [color] = palette(p.name ? p : {name: ''});
    return `<div class="mmct mmct-ed"><div class="mmct-head"><div class="mmct-bar"><button type="button" class="mmct-btn" data-action="mmct-edback"><img src="${A('ic_arrow_back_24dp')}" alt=""></button>
      <span class="mmct-title in">${esc(c, t.t(existing ? 'contact_editor_title_existing_contact' : 'contact_editor_title_new_contact'))}</span>
      <button type="button" class="mmct-btn" data-action="mmct-save" aria-label="${esc(c, t.t('menu_save'))}"><img src="${A('ic_done_wht_24dp')}" alt=""></button>${MM.menu.button(c, 'mmct-over')}</div></div>
      <div class="mmct-page"><div class="mmct-ephoto" style="background:${color}"><img src="${A('person_white_540dp')}" alt=""><i class="mmct-eover"></i><img class="mmct-cam" src="${A('ic_photo_camera_white_24dp')}" alt=""></div>
        <div class="mmct-fields">${section('ic_person_24dp', field('name', t.t('full_name'), d.name))}${section('ic_phone_24dp', `<div class="mmct-fr">${field('phone', t.t('phoneLabelsGroup'), d.phone, 'tel')}${spinner(P().typeLabel())}</div>`)}${section('ic_email_24dp', `<div class="mmct-fr">${field('email', t.t('emailLabelsGroup'), d.email, 'email')}${spinner(t.t('emailTypeHome'))}</div>`)}
        <button type="button" class="mmct-more" data-action="mmct-more">${esc(c, t.t('compact_editor_more_fields'))}</button></div></div></div>`;
  }
  function mountEditor(c, root) {
    root.querySelectorAll('.mmct-field').forEach(i => i.addEventListener('input', () => { ui(c).draft[i.dataset.f] = i.value; }));
  }
  function startEdit(c, p, phone = '') {
    const u = ui(c);
    u.draft = p ? {id: p.id, name: p.name, phone: p.phone, email: p.email || '', orig: JSON.stringify([p.name, p.phone, p.email || ''])} : {id: 0, name: '', phone, email: '', orig: JSON.stringify(['', phone, ''])};
    u.editFrom = u.screen; u.screen = 'edit';
  }
  function save(c) {
    const u = ui(c), d = u.draft, t = T();
    if (!d.name.trim() && !d.phone.trim() && !d.email.trim()) { leaveEditor(c); return; }
    const list = P().list(c);
    let p = d.id ? list.find(x => x.id === d.id) : null;
    if (!p) { p = {id: Math.max(0, ...list.map(x => x.id)) + 1}; list.push(p); }
    Object.assign(p, {name: d.name.trim(), phone: d.phone.trim(), email: d.email.trim()});
    c.save(); c.toast(t.t('contactSavedToast'), false);
    u.draft = null; u.screen = `card:${p.id}`; c.render();
  }
  function leaveEditor(c) { const u = ui(c); u.draft = null; u.screen = u.editFrom || ''; u.editFrom = ''; if (u.closeAfter) { u.closeAfter = false; c.back(); return; } c.render(); }
  function editorBack(c) {
    const u = ui(c), d = u.draft, t = T();
    if (JSON.stringify([d.name, d.phone, d.email]) === d.orig) { leaveEditor(c); return; }
    // CancelEditDialogFragment.
    c.dialog({icon: 'assets/fw-ic_dialog_alert_material.svg', message: t.t('cancel_confirmation_dialog_message'), buttons: [{label: MM.text('framework').t('cancel')}, {label: MM.text('framework').t('ok'), action: c => leaveEditor(c)}]});
  }
  function remove(c, id) {
    const t = T();
    c.dialog({icon: 'assets/fw-ic_dialog_alert_material.svg', message: t.t('deleteConfirmation'), buttons: [{label: MM.text('framework').t('cancel')}, {label: MM.text('framework').t('ok'), action: c => {
      c.data.contacts = P().list(c).filter(p => p.id !== +id); c.save(); const u = ui(c); u.screen = ''; u.draft = null; c.render();
    }}]});
  }

  // ---- shell ---------------------------------------------------------------------------------------------------------
  function consume(c) {
    const u = ui(c), sub = c.ui.sub || '';
    if (!sub) return;
    u.opened = sub; c.ui.sub = ''; u.search = null;
    if (sub.startsWith('contact:')) { u.screen = `card:${sub.slice(8)}`; u.from = 'external'; }
    else if (sub === 'new' || sub.startsWith('new:')) { u.screen = ''; startEdit(c, null, sub.slice(4)); u.closeAfter = true; }
    else if (sub.startsWith('add:')) { u.screen = 'pick'; u.pickNumber = sub.slice(4); u.from = 'external'; }
  }
  function render(c) {
    consume(c);
    const u = ui(c);
    if (u.screen === 'edit' && u.draft) return editor(c);
    if (u.screen === 'pick') return picker(c);
    if (u.screen.startsWith('card:')) { const p = P().byId(c, u.screen.slice(5)); if (p) return quick(c, p); u.screen = ''; }
    return people(c);
  }
  function menu(c) {
    const t = T(), u = ui(c);
    if (u.screen === 'edit') {
      const items = [{label: t.t('menu_discard'), action: c => leaveEditor(c)}];
      if (u.draft?.id) items.push({label: t.t('menu_deleteContact'), action: c => remove(c, u.draft.id)});
      return c.menu(items);
    }
    if (u.screen.startsWith('card:')) {
      const id = u.screen.slice(5);
      return c.menu([{label: t.t('menu_deleteContact'), action: c => remove(c, id)}, {label: t.t('menu_share'), action: c => share(c, P().byId(c, id))}, {label: t.t('menu_create_contact_shortcut'), action: c => c.open('missing-shortcut')}, {label: t.t('menu_help'), action: c => c.open('help', 'contacts')}]);
    }
    const items = [];
    if (u.tab === 1) items.push({label: t.t('menu_contacts_filter'), action: c => c.open('missing-contacts-filter')});
    if (u.tab === 0 && frequents(c).length) items.push({label: t.t('menu_clear_frequents'), action: c => { c.data.frequentsCleared = Date.now(); c.save(); c.render(); }});
    items.push({label: t.t('menu_import_export'), action: c => c.open('missing-import-export')}, {label: t.t('menu_accounts'), action: c => c.open('settings', 'accounts')}, {label: t.t('menu_settings'), action: c => MM.openPrefs(c, 'contacts', 'preference_display_options')}, {label: t.t('menu_help'), action: c => c.open('help', 'contacts')});
    c.menu(items);
  }

  MM.register('contacts', {
    statusColor: c => { const u = ui(c); if (u.screen.startsWith('card:')) { const p = P().byId(c, u.screen.slice(5)); if (p) return palette(p)[1]; } return '#0277bd'; },
    render,
    mount(c, root) {
      const u = ui(c);
      if (u.screen.startsWith('card:')) mountQuick(c, root);
      if (u.screen === 'edit') mountEditor(c, root);
      // Each list keeps its scroll position across redraws.
      const page = root.querySelector('.mmct-page');
      if (page) { const key = `${u.screen}|${u.tab}|${u.search !== null}`; page.scrollTop = u.scroll?.[key] || 0; page.addEventListener('scroll', () => { (u.scroll ||= {})[key] = page.scrollTop; }, {passive: true}); }
      const input = root.querySelector('.mmct-sinput');
      if (input) { input.addEventListener('input', () => { ui(c).search = input.value; const pos = input.selectionStart; c.render(); const i2 = c.el.viewport.querySelector('.mmct-sinput'); i2?.focus(); i2?.setSelectionRange(pos, pos); }); if (document.activeElement !== input) input.focus(); }
    },
    back(c) {
      const u = ui(c);
      if (u.screen === 'edit') { editorBack(c); return true; }
      if (u.from === 'external' && (u.screen.startsWith('card:') || u.screen === 'pick')) { u.from = ''; u.screen = ''; return false; }
      if (u.screen) { u.screen = ''; c.render(); return true; }
      if (u.search !== null) { u.search = null; c.render(); return true; }
      return false;
    },
    action(name, el, event, c) {
      const u = ui(c), t = T();
      switch (name) {
        case 'mmct-tab': u.tab = +el.dataset.tab; c.data.contactsTab = u.tab; c.save(); c.render(); return true;
        case 'mmct-open': u.screen = `card:${el.dataset.id}`; u.from = ''; if (u.scroll) delete u.scroll[u.screen]; c.render(); return true;
        case 'mmct-up': if (u.from === 'external') { u.from = ''; u.screen = ''; c.back(); return true; } u.screen = ''; c.render(); return true;
        case 'mmct-search': u.search = ''; c.render(); return true;
        case 'mmct-sback': u.search = null; c.render(); return true;
        case 'mmct-sclear': u.search = ''; c.render(); return true;
        case 'mmct-new': startEdit(c, null); c.render(); return true;
        case 'mmct-edit': startEdit(c, P().byId(c, el.dataset.id)); c.render(); return true;
        case 'mmct-edback': editorBack(c); return true;
        case 'mmct-save': save(c); return true;
        case 'mmct-more': c.open('missing-more-fields'); return true;
        case 'mmct-profile': c.open('missing-profile'); return true;
        case 'mmct-pick': { const p = P().byId(c, el.dataset.id); startEdit(c, p); if (u.pickNumber) u.draft.phone = u.pickNumber; u.pickNumber = ''; u.editFrom = ''; u.closeAfter = true; c.render(); return true; }
        case 'mmct-star': { const p = P().byId(c, el.dataset.id); p.starred = !p.starred; c.save(); c.toast(t.t(p.starred ? 'description_action_menu_add_star' : 'description_action_menu_remove_star'), false); c.render(); return true; }
        case 'mmct-call': if (event?.target?.closest('.mmct-alt')) return false; MM.phone?.call(c, el.dataset.n); return true;
        case 'mmct-sms': c.open('messenger', `to:${el.dataset.n}`); return true;
        case 'mmct-mail': c.open('gmail', `to:${el.dataset.to}`); return true;
        case 'mm-menu': menu(c); return true;
      }
      return false;
    }
  });
})();
