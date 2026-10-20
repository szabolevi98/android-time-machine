/* Android 7.1.2 Contacts (Google Contacts 1.4.22, priv-app/GoogleContacts of N2G48C), the app 'contacts'. The logic is
   6.0.1's (its contacts module); the look and the behaviour below are the image's:
   - PeopleActivity (people_activity.xml, PeopleTheme: primary_color #0288d1, primary_color_dark #0277bd, the window
     #f9f9f9): people_activity_toolbar.xml's actionBarSize Toolbar with "Contacts", Search (ic_ab_search) and the overflow,
     then ViewPagerTabs (actionBarSize high, ContactsActionBarTabTextStyle: 14 sp bold all caps, white / #b3ffffff, the
     2 dp white underline) with FAVORITES / ALL, the bar's 2 dp elevation; floating_action_button.xml's 56 dp fab_blue
     with ic_person_add_24dp in white, 16 dp from the bottom end. The overflow (people_options.xml): Contacts to display
     on All, Import/export, Clear frequents on Favorites with frequents, Blocked numbers (the system user may block),
     Manage accounts, Settings, Help & feedback.
   - All (contact_list_content.xml): user_profile_header.xml's "Me" (SectionHeaderStyle 20 sp medium #888888 in the
     48 dp column) and "Set up my profile" or the profile's row, then ContactListItemView rows: the section letter, the
     40 dp photo, 15 dp, the 16 sp #363636 name, 12 dp above and below, 32 dp at the end. ContactsPreferences' sort
     order and name format apply.
   - Favorites (contact_tile_list.xml): contact_tile_starred.xml in 3 columns (16 dp at the sides, 24 dp above, the
     round photo, the 16 sp #202020 name 7 dp under it, centred), then list_separator.xml's "Frequently contacted"
     (24 sp bold in the primary colour, 16 / 15 dp) and contact_tile_frequent.xml rows (40 dp photo, 15 dp, 16 sp black);
     empty: ic_star_black_128dp at 0.38 with "No favorites", 48 dp down.
   - QuickContactActivity (quickcontact_activity.xml, fully expanded from the list): MultiShrinkScroller's square header
     in the contact's MaterialPalette (letter_tile_colors / letter_tile_colors_dark) with person_white_540dp, the
     gradients under the toolbar and behind the title (32 dp at most, 16 dp in), shrinking to the toolbar as the cards
     scroll; the toolbar's star, edit and overflow (Delete, Share, Place on Home screen, Help & feedback). The cards
     (ExpandingEntryCardView: 8 dp at the sides, 12 dp apart, 2 dp elevation) on #f4f4f4: the entries
     (expanding_entry_card_item.xml: 13 / 16 dp, 20 dp in, the 24 dp icon in the palette colour 27 dp before the 16 sp
     #202020 header and the #737373 sub header, the alternate icon 12 dp padded at the end): phone (ic_phone_24dp, Text
     with ic_message_24dp), email, then More fields' kinds; Recent (the title 16 sp in the palette colour, the
     #e0e0e0 separator) with the calls: ContactInteractionUtil's time or date and the call arrow.
   - The compact editor (compact_contact_editor_fragment.xml on #f9f9f9): the bar with "Add new contact" / "Edit contact",
     Save (ic_done_wht_24dp) and the overflow (edit_contact.xml: for a saved contact Link, Delete, Set ringtone, All
     calls to voicemail; Help & feedback); the photo at width / 1.96 (editor_portrait_photo_ratio) with the camera icon
     16 dp from the corner; CompactKindSectionView rows (EditKindIconStyle: 24 dp #7f7f7f icons 16 dp in, 14 dp down, 28 dp
     before the fields) with 16 sp fields 54 dp high: Name, Phone with Mobile, Email with Home; "More fields" (16 sp
     colorAccent, 72 dp in) adds Nickname, Organization (Company, Title), Address, Website, Notes.
   - Set up my profile edits the profile. Contacts to display (AccountFilterActivity), Import/export
     (ImportExportDialogFragment, shared with Phone) and Link (JoinContactActivity's picker: the picked contact's details
     join this one) work as the image does; Settings is ContactsPreferenceActivity (ng-appprefs.js). */
(() => {
  'use strict';
  const T = () => NG.text('contacts'), P = () => NG.people;
  const A = n => `assets/ct-${n}.png`;
  const DARK = ['#c53929', '#c2185b', '#7b1fa2', '#512da8', '#303f9f', '#3367d6', '#0277bd', '#006064', '#00796b', '#0b8043', '#33691e', '#e65100', '#e64a19', '#424242'];
  const ui = c => c.ui.contacts || (c.ui.contacts = {tab: c.data.contactsTab ?? 1, search: null, screen: '', from: '', draft: null});
  const esc = (c, s) => c.safe(s);
  const fw = k => T().t(`framework/${k}`);
  const icon = (n, cls = '', style = '') => `<i class="ngct-ic ${cls}" style="--ic:url('${A(n)}');${style}" aria-hidden="true"></i>`;
  const palette = p => { const i = Math.abs(P().javaHash(p.lookup || p.name)) % 14; return p.name ? [P().COLORS[i], DARK[i]] : ['#607d8b', '#455a64']; };
  const name = (c, p) => P().displayName(c, p);
  const letterOf = (c, p) => (NG.appPref(c, 'contacts', 'sortOrder', '1') === '2' ? P().alt(p) : p.name).charAt(0).toLocaleUpperCase(c.locale());

  // ---- lists ----------------------------------------------------------------------------------------------------
  function row(c, p, head = '', action = 'ngct-open') {
    return `<div class="ngct-item"><span class="ngct-sec">${esc(c, head)}</span><button type="button" class="ngct-row" data-action="${action}" data-id="${p.id}">${P().tile(c, p, 'ngct-photo')}<span class="ngct-name">${esc(c, name(c, p))}</span></button></div>`;
  }
  // The filter of All: the custom view without "All other contacts" shows none of them.
  const hidden = c => c.data.contactsFilter === 'custom' && c.data.contactsUngrouped === false;
  function allContacts(c, list = P().sorted(c), profile = true) {
    const t = T();
    if (profile && hidden(c)) return `<div class="ngct-list"><div class="ngct-fhead">${esc(c, t.t('listCustomView'))}</div></div><div class="ngct-empty">${esc(c, t.t('noContacts'))}</div>`;
    if (!list.length && !profile) return '';
    let letter = '';
    const pr = c.data.profile;
    const me = !profile ? '' : pr?.name ? row(c, pr, t.t('user_profile_contacts_list_header')).replace('ngct-item', 'ngct-item ngct-me')
      : `<div class="ngct-item ngct-me"><span class="ngct-sec">${esc(c, t.t('user_profile_contacts_list_header'))}</span><button type="button" class="ngct-row ngct-setup" data-action="ngct-profile">${esc(c, t.t('profile_display_name'))}</button></div>`;
    return `<div class="ngct-list">${me}${list.map(p => { const l = letterOf(c, p); const h = l !== letter ? (letter = l) : ''; return row(c, p, h); }).join('')}</div>${list.length ? '' : `<div class="ngct-empty">${esc(c, t.t('noContacts'))}</div>`}`;
  }
  function frequents(c) {
    const counts = new Map(), since = c.data.frequentsCleared || 0;
    for (const x of P().calls(c)) if (x.time > since && x.type !== 'missed') { const p = P().byNumber(c, x.number); if (p && !p.starred) counts.set(p.id, (counts.get(p.id) || 0) + 1); }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => P().byId(c, id)).filter(Boolean);
  }
  function favorites(c) {
    const t = T(), starred = P().sorted(c).filter(p => p.starred), freq = frequents(c);
    if (!starred.length && !freq.length) return `<div class="ngct-nofav"><img src="${A('ic_star_black_128dp')}" alt=""><span>${esc(c, t.t('listTotalAllContactsZeroStarred'))}</span></div>`;
    const grid = starred.length ? `<div class="ngct-stars">${starred.map(p => `<button type="button" class="ngct-star" data-action="ngct-open" data-id="${p.id}">${P().tile(c, p, 'ngct-sphoto')}<span class="ngct-sname">${esc(c, name(c, p))}</span></button>`).join('')}</div>` : '';
    const list = freq.length ? `<div class="ngct-freqhead${starred.length ? '' : ' first'}">${esc(c, t.t('favoritesFrequentContacted'))}</div>${freq.map(p => `<button type="button" class="ngct-freq" data-action="ngct-open" data-id="${p.id}">${P().tile(c, p, 'ngct-photo')}<span class="ngct-fname">${esc(c, name(c, p))}</span></button>`).join('')}` : '';
    return `<div class="ngct-favs">${grid}${list}</div>`;
  }
  const vcard = p => ['BEGIN:VCARD', 'VERSION:2.1', `N:;${p.name || ''};;;`, `FN:${p.name || ''}`, ...(p.phone ? [`TEL;CELL:${p.phone}`] : []), ...(p.email ? [`EMAIL;HOME:${p.email}`] : []), 'END:VCARD'].join('\r\n');
  // QuickContactActivity's Share: the contact as a vCard (text/x-vcard) through share_via.
  function share(c, p) {
    if (!p) return;
    if (NG.share) NG.share(c, {title: T().t('share_via'), kind: 'vcard', name: `${p.name || 'contact'}.vcf`, subject: p.name || '', text: vcard(p)});
  }
  function bar(c, title, {back = '', actions = '', search = false} = {}) {
    const t = T();
    return `<div class="ngct-bar">${back ? `<button type="button" class="ngct-btn" data-action="${back}" aria-label="${esc(c, NG.text('framework').t('action_menu_overflow_description'))}">${icon('ic_arrow_back_24dp')}</button>` : ''}<span class="ngct-title${back ? ' in' : ''}">${esc(c, title)}</span>
      ${search ? `<button type="button" class="ngct-btn" data-action="ngct-search" aria-label="${esc(c, t.t('menu_search'))}">${icon('ic_ab_search')}</button>` : ''}${actions}</div>`;
  }
  function people(c) {
    const t = T(), u = ui(c), searching = u.search !== null;
    if (searching) {
      const q = u.search.trim().toLowerCase(), d = q.replace(/[^0-9]/g, '');
      const list = q ? P().sorted(c).filter(p => p.name.toLowerCase().split(/\s+/).some(w => w.startsWith(q)) || p.name.toLowerCase().startsWith(q) || (d && P().digits(p.phone).includes(d))) : [];
      return `<div class="ngct"><div class="ngct-head"><div class="ngct-bar search"><button type="button" class="ngct-btn" data-action="ngct-sback" aria-label="${esc(c, t.t('action_menu_back_from_search'))}">${icon('ic_arrow_back_24dp')}</button><input type="text" class="ngct-sinput" value="${esc(c, u.search)}" placeholder="${esc(c, t.t('hint_findContacts'))}" autocomplete="off" spellcheck="false">${u.search ? `<button type="button" class="ngct-btn" data-action="ngct-sclear" aria-label="${esc(c, t.t('description_clear_search'))}">${icon('ic_close_dk')}</button>` : ''}</div></div>
        <div class="ngct-page">${allContacts(c, list, false)}</div></div>`;
    }
    const tabs = `<div class="ngct-tabs" role="tablist">${['favorites_tab_label', 'all_contacts_tab_label'].map((k, i) => `<button type="button" role="tab" aria-selected="${u.tab === i}" data-action="ngct-tab" data-tab="${i}">${esc(c, t.t(k))}</button>`).join('')}<i class="ngct-under" style="transform:translateX(${u.tab * 100}%)"></i></div>`;
    return `<div class="ngct"><div class="ngct-head">${bar(c, t.t('applicationLabel'), {search: true, actions: NG.menu.button(c, 'ngct-over')})}${tabs}</div><div class="ngct-page">${u.tab ? allContacts(c) : favorites(c)}</div>
      <button type="button" class="ngct-fab" data-action="ngct-new" aria-label="${esc(c, t.t('action_menu_add_new_contact_button'))}">${icon('ic_person_add_24dp')}</button></div>`;
  }
  function picker(c, title, action, exclude = null) {
    const list = P().sorted(c).filter(p => p.id !== exclude && (!c.ui.contactPicker?.phoneOnly || p.phone));
    return `<div class="ngct"><div class="ngct-head">${bar(c, title, {back: 'ngct-up'})}</div><div class="ngct-page"><div class="ngct-list">${list.map(p => row(c, p, '', action)).join('')}</div></div></div>`;
  }

  // ---- QuickContact ----------------------------------------------------------------------------------------------
  // ContactInteractionUtil.formatDateStringFromTimestamp: today the time, yesterday "Yesterday", else the date.
  function interactionDate(c, time) {
    const d = new Date(time), now = new Date(), day = x => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const diff = Math.round((day(now) - day(d)) / 864e5);
    if (diff === 0) return new Intl.DateTimeFormat(c.locale(), {hour: 'numeric', minute: '2-digit'}).format(d);
    if (diff === 1) return T().t('yesterday');
    return new Intl.DateTimeFormat(c.locale(), {month: 'long', day: 'numeric'}).format(d);
  }
  function card(c, p) {
    const t = T(), [color] = palette(p), tint = `background:${color}`;
    const entry = (ic, header, sub, alt = '', extra = '') => `<div class="ngct-entry"${extra}>${icon(ic, 'ngct-eic', tint)}<span class="ngct-etext"><b>${esc(c, header)}</b>${sub}</span>${alt}</div>`;
    const phone = p.phone ? entry('ic_phone_24dp', P().format(p.phone), `<span>${esc(c, P().typeLabel())}</span>`, `<button type="button" class="ngct-alt" data-action="ngct-sms" data-n="${esc(c, p.phone)}" aria-label="${esc(c, t.fmt('sms_custom', null, P().format(p.phone)))}">${icon('ic_message_24dp', '', tint)}</button>`, ` data-action="ngct-call" data-n="${esc(c, p.phone)}" role="button"`) : '';
    const email = p.email ? entry('ic_email_24dp', p.email, `<span>${esc(c, fw('emailTypeHome'))}</span>`, '', ` data-action="ngct-mail" data-to="${esc(c, p.email)}" role="button"`) : '';
    const recent = p.phone ? P().calls(c).filter(x => P().same(x.number, p.phone)).sort((a, b) => b.time - a.time).slice(0, 3) : [];
    const recentCard = recent.length ? `<div class="ngct-card"><div class="ngct-ctitle" style="color:${color}">${esc(c, t.t('recent_card_title'))}</div><i class="ngct-csep"></i>${recent.map(x => entry('ic_phone_24dp', P().format(x.number), `<span>${esc(c, P().typeLabel())}</span><span class="ngct-when"><i class="ngct-arrow ${x.type}"></i>${esc(c, interactionDate(c, x.time))}</span>`, '', ` data-action="ngct-call" data-n="${esc(c, x.number)}" role="button"`)).join('')}</div>` : '';
    const more = [p.nickname && entry('ic_person_24dp', p.nickname, `<span>${esc(c, t.t('header_nickname_entry'))}</span>`),
      (p.company || p.title) && entry('ic_business_black_24dp', p.company && p.title ? t.fmt('organization_company_and_title', null, p.title, p.company) : p.company || p.title, `<span>${esc(c, t.t('header_organization_entry'))}</span>`),
      p.address && entry('ic_place_24dp', p.address, `<span>${esc(c, t.t('postal_address'))}</span>`, `<button type="button" class="ngct-alt" data-action="ngct-map" data-q="${esc(c, p.address)}">${icon('ic_directions_24dp', '', tint)}</button>`, ` data-action="ngct-map" data-q="${esc(c, p.address)}" role="button"`),
      p.website && entry('ic_public_black_24dp', p.website, `<span>${esc(c, t.t('header_website_entry'))}</span>`, '', ` data-action="ngct-web" data-url="${esc(c, p.website)}" role="button"`),
      p.note && entry('ic_insert_comment_black_24dp', p.note, `<span>${esc(c, t.t('label_notes'))}</span>`)].filter(Boolean);
    const main = [phone, email].filter(Boolean).join('<i class="ngct-esep"></i>');
    return `${main ? `<div class="ngct-card">${main}</div>` : ''}${more.length ? `<div class="ngct-card">${more.join('<i class="ngct-esep"></i>')}</div>` : ''}${recentCard}`;
  }
  function quick(c, p) {
    const t = T(), [color] = palette(p);
    return `<div class="ngct ngct-qc" style="--pal:${color}"><div class="ngct-qhead"><div class="ngct-qphoto" style="background:${color}"><img src="${A('person_white_540dp')}" alt=""></div><i class="ngct-qgrad top"></i><i class="ngct-qgrad bottom"></i>
      <div class="ngct-qbar"><button type="button" class="ngct-btn" data-action="ngct-up">${icon('ic_arrow_back_24dp')}</button><i class="ngct-flex"></i>
        ${p.id === 'me' ? '' : `<button type="button" class="ngct-btn" data-action="ngct-star" data-id="${p.id}" aria-label="${esc(c, t.t(p.starred ? 'menu_removeStar' : 'menu_addStar'))}">${icon(p.starred ? 'ic_star_24dp' : 'ic_star_outline_24dp')}</button>`}
        <button type="button" class="ngct-btn" data-action="ngct-edit" data-id="${p.id}" aria-label="${esc(c, t.t('menu_editContact'))}">${icon('ic_create_24dp')}</button>${NG.menu.button(c, 'ngct-over')}</div>
      <b class="ngct-qtitle">${esc(c, name(c, p) || t.t('missing_name'))}</b></div>
      <div class="ngct-qscroll"><i class="ngct-qspace"></i><div class="ngct-cards">${card(c, p)}</div></div></div>`;
  }
  function mountQuick(c, root) {
    const sc = root.querySelector('.ngct-qscroll'), head = root.querySelector('.ngct-qhead'); if (!sc || !head) return;
    // The header starts square (the photo's full width) and the cards begin under it.
    root.querySelector('.ngct-qspace').style.height = `${head.parentElement.clientWidth}px`;
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
    const field = (key, hint, value, type = 'text') => `<input class="ngct-field" type="${type}" data-f="${key}" value="${esc(c, value)}" placeholder="${esc(c, hint)}" autocomplete="off" spellcheck="false">`;
    const section = (ic, body) => `<div class="ngct-kind">${icon(ic, 'ngct-kic')}<div class="ngct-kfields">${body}</div></div>`;
    const spinner = label => `<span class="ngct-spin">${esc(c, label)}</span>`;
    const [color] = palette(d.name ? {name: d.name, id: d.id} : {name: ''});
    const save = `<button type="button" class="ngct-btn" data-action="ngct-save" aria-label="${esc(c, t.t('menu_save'))}">${icon('ic_done_wht_24dp')}</button>${NG.menu.button(c, 'ngct-over')}`;
    return `<div class="ngct ngct-ed"><div class="ngct-head">${bar(c, t.t(existing ? 'contact_editor_title_existing_contact' : 'contact_editor_title_new_contact'), {back: 'ngct-edback', actions: save})}</div>
      <div class="ngct-page"><div class="ngct-ephoto" style="background:${color}"><img src="${A('person_white_540dp')}" alt=""><i class="ngct-eover"></i>${icon('ic_photo_camera_white_24dp', 'ngct-cam')}</div>
        <div class="ngct-fields">${section('ic_person_24dp', field('name', t.t('full_name'), d.name))}${section('ic_phone_24dp', `<div class="ngct-fr">${field('phone', t.t('phoneLabelsGroup'), d.phone, 'tel')}${spinner(P().typeLabel())}</div>`)}${section('ic_email_24dp', `<div class="ngct-fr">${field('email', t.t('emailLabelsGroup'), d.email, 'email')}${spinner(fw('emailTypeHome'))}</div>`)}
        ${d.more ? `${section('ic_person_24dp', field('nickname', t.t('nicknameLabelsGroup'), d.nickname))}${section('ic_business_black_24dp', `${field('company', t.t('ghostData_company'), d.company)}${field('title', t.t('ghostData_title'), d.title)}`)}${section('ic_place_24dp', field('address', t.t('postal_address'), d.address))}${section('ic_public_black_24dp', field('website', t.t('websiteLabelsGroup'), d.website))}${section('ic_insert_comment_black_24dp', field('note', t.t('label_notes'), d.note))}`
          : `<button type="button" class="ngct-more" data-action="ngct-more">${esc(c, t.t('compact_editor_more_fields'))}</button>`}</div></div></div>`;
  }
  function mountEditor(c, root) {
    root.querySelectorAll('.ngct-field').forEach(i => i.addEventListener('input', () => { ui(c).draft[i.dataset.f] = i.value; }));
  }
  const KEYS = ['name', 'phone', 'email', 'nickname', 'company', 'title', 'address', 'website', 'note'];
  const snap = d => JSON.stringify(KEYS.map(k => d[k] || ''));
  function startEdit(c, p, phone = '') {
    const u = ui(c), d = {id: p ? p.id : 0, more: false};
    for (const k of KEYS) d[k] = p ? p[k] || '' : k === 'phone' ? phone : '';
    // PhoneNumberFormattingTextWatcher: the number as the field shows it.
    if (d.phone) d.phone = P().format(d.phone);
    d.more = KEYS.slice(3).some(k => d[k]); d.orig = snap(d); u.draft = d;
    u.editFrom = u.screen; u.screen = 'edit';
  }
  function save(c) {
    const u = ui(c), d = u.draft, t = T();
    if (KEYS.every(k => !(d[k] || '').trim())) { leaveEditor(c); return; }
    const vals = Object.fromEntries(KEYS.map(k => [k, (d[k] || '').trim()]));
    let p;
    // The profile ("Me") is kept apart from the contacts.
    if (d.id === 'me') p = c.data.profile = Object.assign(c.data.profile || {id: 'me', lookup: 'profile'}, vals);
    else {
      const list = P().list(c);
      p = d.id ? list.find(x => x.id === d.id) : null;
      if (!p) { p = {id: Math.max(0, ...list.map(x => x.id)) + 1}; list.push(p); }
      Object.assign(p, vals);
    }
    c.save(); c.toast(t.t('contactSavedToast'));
    u.draft = null; u.screen = `card:${p.id}`;
    if (u.closeAfter) { u.closeAfter = false; u.from = 'external'; }
    c.render();
  }
  function leaveEditor(c) { const u = ui(c); u.draft = null; u.screen = u.editFrom || ''; u.editFrom = ''; if (u.closeAfter) { u.closeAfter = false; c.back(); return; } c.render(); }
  function editorBack(c) {
    const u = ui(c), d = u.draft, t = T();
    if (snap(d) === d.orig) { leaveEditor(c); return; }
    // CancelEditDialogFragment.
    c.dialog({message: t.t('cancel_confirmation_dialog_message'), buttons: [{label: fw('cancel')}, {label: fw('ok'), action: c => leaveEditor(c)}]});
  }
  function remove(c, id) {
    const t = T();
    c.dialog({message: t.t('deleteConfirmation'), buttons: [{label: fw('cancel')}, {label: fw('ok'), action: c => {
      c.data.contacts = P().list(c).filter(p => p.id !== +id); c.save(); const u = ui(c); u.screen = ''; u.draft = null;
      if (u.from === 'external') { u.from = ''; c.back(); return; }
      c.render();
    }}]});
  }
  // JoinContactActivity: the picked contact's details fill this one's empty fields and the two become one.
  function join(c, id, other) {
    const list = P().list(c), p = list.find(x => x.id === +id), o = list.find(x => x.id === +other);
    if (!p || !o) return;
    for (const k of KEYS) if (!p[k] && o[k]) p[k] = o[k];
    p.starred = p.starred || o.starred;
    c.data.contacts = list.filter(x => x !== o); c.save();
    const u = ui(c); u.screen = `card:${p.id}`; c.toast(T().t('contactsJoinedMessage')); c.render();
  }

  // ShortcutIntentBuilder: the contact's round letter tile (LetterTileDrawable, circular) as the launcher icon.
  function shortcutIcon(p) {
    const ch = p.name.charAt(0), letter = /^[A-Za-z]$/.test(ch) ? ch.toUpperCase() : '';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><circle cx="48" cy="48" r="44" fill="${palette(p)[0]}"/>${letter ? `<text x="48" y="48" dy=".36em" text-anchor="middle" font-family="Roboto,sans-serif" font-weight="500" font-size="59" fill="#fff">${letter}</text>` : ''}</svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }
  NG.openShortcut ||= (c, it) => { if (it.target) c.open(it.target.view, it.target.sub || ''); };

  // ---- shell ---------------------------------------------------------------------------------------------------------
  NG.pickContact = (c, spec = {}) => { c.ui.contactPicker = spec; c.open('contacts', 'pick'); };
  function consume(c) {
    const u = ui(c), sub = c.ui.sub || '';
    if (!sub) return;
    c.ui.sub = ''; u.search = null;
    if (sub.startsWith('contact:')) { u.screen = `card:${sub.slice(8)}`; u.from = 'external'; }
    else if (sub === 'new' || sub.startsWith('new:')) { u.screen = ''; startEdit(c, null, sub.slice(4)); u.closeAfter = true; }
    else if (sub.startsWith('add:')) { u.screen = 'pick'; u.pickNumber = sub.slice(4); u.from = 'external'; }
    else if (sub === 'pick') { u.screen = 'pick'; u.from = 'external'; }
  }
  const byId = (c, id) => id === 'me' ? c.data.profile : P().byId(c, id);
  function render(c) {
    consume(c);
    const u = ui(c), t = T();
    if (u.screen === 'edit' && u.draft) return editor(c);
    if (u.screen === 'pick') return picker(c, t.t('contactPickerActivityTitle'), 'ngct-pick');
    if (u.screen.startsWith('join:')) return picker(c, t.t('titleJoinContactDataWith'), 'ngct-joinpick', +u.screen.slice(5));
    if (u.screen === 'filter' || u.screen === 'customize') return filters(c);
    if (u.screen.startsWith('card:')) { const p = byId(c, u.screen.slice(5)); if (p) return quick(c, p); u.screen = ''; }
    return people(c);
  }
  // ImportExportDialogFragment (Contacts and Phone): the SIM holds no contacts; the files go through DocumentsUI.
  NG.contactsImportExport = c => {
    const t = T(), list = P().sorted(c);
    c.dialog({title: t.t('dialog_import_export'), accent: '#0288d1', items: [t.t('import_from_sim'), t.t('import_from_vcf_file'), t.t('export_to_vcf_file'), t.t('share_visible_contacts')].map(s => ({html: esc(c, s)})), onItem: (i, c) => {
      if (i === 0) c.toast(t.t('noContacts'));
      else if (i === 1) c.open('documents', 'pick:vcf');
      else if (i === 2) c.open('documents', 'save:contacts.vcf');
      else if (NG.share) NG.share(c, {title: t.t('share_via'), kind: 'vcard', name: 'contacts.vcf', subject: '', text: list.map(vcard).join('\r\n')});
    }});
  };
  // AccountFilterActivity and CustomContactListFilterActivity.
  function filters(c) {
    const t = T(), f = c.data.contactsFilter || 'all', radio = on => `<i class="ngw-radio ngst-radio${on ? ' on' : ''}" style="--ngw-accent:#0288d1"></i>`;
    const email = NG.account?.email || '';
    if (ui(c).screen === 'customize') {
      const on = c.data.contactsUngrouped !== false;
      return `<div class="ngct ngct-filter"><div class="ngct-head">${bar(c, t.t('custom_list_filter'), {back: 'ngct-up'})}</div>
        <div class="ngct-page white"><div class="ngct-frow head"><span><b>${esc(c, email)}</b><small>${esc(c, t.fmt('google_account_type_format', null, 'Google'))}</small></span></div>
        <button type="button" class="ngct-frow child" data-action="ngct-ungrouped"><span><b>${esc(c, t.t('display_ungrouped'))}</b></span><i class="ngct-check${on ? ' on' : ''}"></i></button></div></div>`;
    }
    const frow = (key, title, sub) => `<button type="button" class="ngct-frow" data-action="ngct-filterpick" data-f="${key}"><span><b>${esc(c, title)}</b>${sub ? `<small>${esc(c, sub)}</small>` : ''}</span>${key === 'customize' ? '' : radio(f === key)}</button>`;
    return `<div class="ngct ngct-filter"><div class="ngct-head">${bar(c, t.t('activity_title_contacts_filter'), {back: 'ngct-up'})}</div>
      <div class="ngct-page white">${frow('all', t.t('list_filter_all_accounts'))}${email ? frow('account', email, t.fmt('google_account_type_format', null, 'Google')) : ''}${frow('customize', t.t('list_filter_customize'))}</div></div>`;
  }
  function menu(c, anchor) {
    const t = T(), u = ui(c);
    if (u.screen === 'edit') {
      const id = u.draft?.id, items = [];
      if (id && id !== 'me') {
        const p = P().byId(c, id);
        items.push({label: t.t('menu_joinAggregate'), action: c => { const uu = ui(c); uu.joinFrom = 'edit'; uu.draftKeep = uu.draft; uu.screen = `join:${id}`; c.render(); }},
          {label: t.t('menu_deleteContact'), action: c => remove(c, id)},
          {label: t.t('menu_set_ring_tone'), action: c => NG.ringtonePicker?.(c, {kind: 'ringtone', current: p?.ringtone ?? 'default', defaultTitle: NG.settingsRingtones?.ringtone.default, onPick: (c, v) => { if (p) { p.ringtone = v; c.save(); } }})},
          {label: t.t('menu_redirect_calls_to_vm'), checked: !!p?.toVoicemail, action: c => { if (p) { p.toVoicemail = !p.toVoicemail; c.save(); } }});
      }
      items.push({label: t.t('menu_help'), action: c => c.open('help', 'contacts')});
      return c.menu(items, anchor);
    }
    if (u.screen.startsWith('card:')) {
      const id = u.screen.slice(5);
      if (id === 'me') return c.menu([{label: t.t('menu_share'), action: c => share(c, byId(c, id))}, {label: t.t('menu_help'), action: c => c.open('help', 'contacts')}], anchor);
      return c.menu([{label: t.t('menu_deleteContact'), action: c => remove(c, id)}, {label: t.t('menu_share'), action: c => share(c, P().byId(c, id))},
        {label: t.t('menu_create_contact_shortcut'), action: c => { const p = P().byId(c, id); NG.launcherInstall?.(c, {type: 'shortcut', label: p.name, icon: shortcutIcon(p), target: {view: 'contacts', sub: `contact:${p.id}`}}); }},
        {label: t.t('menu_help'), action: c => c.open('help', 'contacts')}], anchor);
    }
    if (u.screen) return;
    const items = [];
    if (u.tab === 1) items.push({label: t.t('menu_contacts_filter'), action: c => { ui(c).screen = 'filter'; c.render(); }});
    items.push({label: t.t('menu_import_export'), action: c => NG.contactsImportExport(c)});
    if (u.tab === 0 && frequents(c).length) items.push({label: t.t('menu_clear_frequents'), action: c => { c.data.frequentsCleared = Date.now(); c.save(); c.render(); }});
    items.push({label: t.t('menu_blocked_numbers'), action: c => NG.openPrefs(c, 'quickresponses', 'blocked', NG.text('appprefs').t('Telecom/blocked_numbers'))},
      {label: t.t('menu_accounts'), action: c => c.open('settings', 'accounts')},
      {label: t.t('menu_settings'), action: c => NG.openPrefs(c, 'contacts', 'preference_display_options', NG.text('appprefs').t('GoogleContacts/activity_title_settings'))},
      {label: t.t('menu_help'), action: c => c.open('help', 'contacts')});
    c.menu(items, anchor);
  }

  // ContactsPreferenceActivity (ng-appprefs.js): the display options, the default account (the Google account), About.
  if (NG.appPrefsHooks) NG.appPrefsHooks.contacts = {...(NG.appPrefsOrder ? NG.appPrefsOrder('contacts', 'GoogleContacts/', '#0288d1') : {}),
    summary(c, key) {
      if (key === 'accounts') return NG.account?.email || '';
      if (key === 'pref_build_version') return NG.appsData?.contacts?.version || '';
      return NG.appPrefsOrder ? NG.appPrefsOrder('contacts', 'GoogleContacts/').summary(c, key) : undefined;
    },
    screens: {about: 'preference_about'},
    click(c, key, n) {
      if (key === 'accounts') { NG.appPrefsChoose(c, NG.appPrefStr(n.title), [NG.account?.email || ''], 0, () => {}, '#0288d1'); return true; }
      if (/^pref_(open_source|privacy|terms)/.test(key)) return true;
      return NG.appPrefsOrder ? NG.appPrefsOrder('contacts', 'GoogleContacts/', '#0288d1').click(c, key, n) : false;
    }
  };

  NG.register('contacts', {
    // The window animation's page (ng-core.js): deeper screens open over the ones they came from.
    page: c => NG.page('contacts', c.ui.contacts?.screen),
    statusColor: c => { consume(c); const u = ui(c); if (u.screen.startsWith('card:')) { const p = byId(c, u.screen.slice(5)); if (p) return palette(p)[1]; } return '#0277bd'; },
    // ContactsAlertDialogTheme: colorAccent primary_color.
    dialogAccent: () => '#0288d1',
    render,
    mount(c, root) {
      const u = ui(c);
      if (u.screen.startsWith('card:')) mountQuick(c, root);
      if (u.screen === 'edit') mountEditor(c, root);
      // Each list keeps its scroll position across redraws.
      const page = root.querySelector('.ngct-page');
      if (page) { const key = `${u.screen}|${u.tab}|${u.search !== null}`; page.scrollTop = u.scroll?.[key] || 0; page.addEventListener('scroll', () => { (u.scroll ||= {})[key] = page.scrollTop; }, {passive: true}); }
      const input = root.querySelector('.ngct-sinput');
      if (input) { input.addEventListener('input', () => { ui(c).search = input.value; const pos = input.selectionStart; c.render(); const i2 = c.el.viewport.querySelector('.ngct-sinput'); i2?.focus(); i2?.setSelectionRange(pos, pos); }); if (document.activeElement !== input) input.focus(); }
    },
    back(c) {
      const u = ui(c);
      if(u.screen==='pick'&&c.ui.contactPicker){const spec=c.ui.contactPicker;c.ui.contactPicker=null;spec.onCancel?.(c);}
      if (u.screen === 'edit') { editorBack(c); return true; }
      if (u.screen.startsWith('join:')) { u.screen = u.joinFrom === 'edit' && u.draftKeep ? 'edit' : `card:${u.screen.slice(5)}`; if (u.draftKeep) { u.draft = u.draftKeep; u.draftKeep = null; } c.render(); return true; }
      if (u.from === 'external' && (u.screen.startsWith('card:') || u.screen === 'pick')) { u.from = ''; u.screen = ''; return false; }
      if (u.screen === 'customize') { u.screen = 'filter'; c.render(); return true; }
      if (u.screen) { u.screen = ''; c.render(); return true; }
      if (u.search !== null) { u.search = null; c.render(); return true; }
      return false;
    },
    action(name, el, event, c) {
      const u = ui(c), t = T();
      switch (name) {
        case 'ngct-tab': u.tab = +el.dataset.tab; c.data.contactsTab = u.tab; c.save(); c.render(); return true;
        case 'ngct-open': u.screen = `card:${el.dataset.id}`; u.from = ''; if (u.scroll) delete u.scroll[u.screen]; c.render(); return true;
        case 'ngct-up': if (!this.back(c)) c.back(); return true;
        case 'ngct-filterpick': { const f = el.dataset.f; if (f === 'customize') { u.screen = 'customize'; c.render(); return true; } c.data.contactsFilter = f; c.save(); u.screen = ''; c.render(); return true; }
        case 'ngct-ungrouped': c.data.contactsUngrouped = c.data.contactsUngrouped === false; c.data.contactsFilter = 'custom'; c.save(); c.render(); return true;
        case 'ngct-map': if (event?.target?.closest('.ngct-alt') && el.classList.contains('ngct-entry')) return false; c.open('maps', `q:${el.dataset.q}`); return true;
        case 'ngct-web': c.open('chrome', `url:${el.dataset.url}`); return true;
        case 'ngct-search': u.search = ''; c.render(); return true;
        case 'ngct-sback': u.search = null; c.render(); return true;
        case 'ngct-sclear': u.search = ''; c.render(); return true;
        case 'ngct-new': startEdit(c, null); c.render(); return true;
        case 'ngct-edit': startEdit(c, byId(c, el.dataset.id)); c.render(); return true;
        case 'ngct-edback': editorBack(c); return true;
        case 'ngct-save': save(c); return true;
        case 'ngct-more': u.draft.more = true; c.render(); return true;
        case 'ngct-profile': startEdit(c, c.data.profile || {id: 'me', name: ''}); c.render(); return true;
        case 'ngct-pick': { const p = P().byId(c, el.dataset.id);if(c.ui.contactPicker){const spec=c.ui.contactPicker;c.ui.contactPicker=null;u.screen='';u.from='';spec.onPick?.(c,p);c.back();return true;}startEdit(c, p); if (u.pickNumber) u.draft.phone = u.pickNumber; u.pickNumber = ''; u.editFrom = ''; u.closeAfter = true; c.render(); return true; }
        case 'ngct-joinpick': { const id = u.screen.slice(5); u.draft = null; u.draftKeep = null; join(c, id, el.dataset.id); return true; }
        case 'ngct-star': { const p = P().byId(c, el.dataset.id); p.starred = !p.starred; c.save(); c.toast(t.t(p.starred ? 'description_action_menu_add_star' : 'description_action_menu_remove_star')); c.render(); return true; }
        case 'ngct-call': if (event?.target?.closest('.ngct-alt')) return false; NG.phone?.call(c, el.dataset.n); return true;
        case 'ngct-sms': c.open('messenger', `to:${el.dataset.n}`); return true;
        case 'ngct-mail': c.open('gmail', `to:${el.dataset.to}`); return true;
        case 'ng-menu': menu(c, el); return true;
      }
      return false;
    }
  });
})();
