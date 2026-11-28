/* Messaging (IMM76I Mms.apk), moved out of simulator.js (docs/plans/engine-migration.md). messaging.js draws the
   conversation list and the thread, mms-prefs.js Messaging › Settings; this module is the app around them:
   - a thread (also opened from People, Phone's call log, the notification and Search), the compose box with its
     recipient suggestions, counter and attachment; a draft per conversation in data.messageDrafts
   - the overflow menus, Insert smiley, a message's long-press menu (Copy text, Forward, Lock / Unlock, View details,
     Delete) and the delete confirmations, in this image's words (mms-strings.js). */
(() => {
  'use strict';
  let holdTimer = null;

  // Messaging › Settings (mms-prefs.js) under Messaging's own action bar.
  const mmspContext = c => ({ui: c.ui, data: c.data, version: '4.0.4', M: key => MmsStrings.t(key), t: key => c.i18n.t(key), save: c.save, render: c.render,
    bar: (title, menu) => `<header class="mms-header"><button class="mms-up" data-action="back" aria-label="${c.safe(c.i18n.t('Back'))}"><span>‹</span><img src="assets/messaging.png" alt=""></button><div class="mms-title"><h2>${c.safe(title)}</h2></div>${menu ? `<button data-action="mms-menu" aria-label="${c.safe(c.i18n.t('More options'))}"><img src="assets/ic_menu_overflow.png" alt=""></button>` : ''}</header>`});
  function messageDraft(c) {
    const {ui, data} = c;
    data.messageDrafts ||= {};
    const key = ICSMessaging.draftKey(ui);
    return data.messageDrafts[key] ||= {body:'',recipient:''};
  }
  function openMessageThread(c, key) {
    const {ui, data, save, render, openApp} = c;
    if (ui.view !== 'messaging') openApp('messaging');
    if (ui.sub !== 'thread') ui.mmsListMode = ui.sub === 'search' ? 'search' : '';
    ui.thread = key; ui.sub = 'thread'; ui.overlay = '';
    data.messages.filter(m => String(m.contact) === String(key)).forEach(m => { m.read = true; });
    if (String(key) === '1') data.notifications = data.notifications.filter(n => n.id !== 2);
    save(); render(); scrollMessages(c);
  }
  function scrollMessages(c) {
    const history = c.viewport.querySelector('.mms-history');
    if (history) history.scrollTop = history.scrollHeight;
  }
  function sendMessage(c, id, body, attachment) {
    const {ui, data, clock, clone} = c;
    if (!body && !attachment) return;
    data.messages.push({ id: Date.now(), contact: id, body, mine: true, time: clock(), timestamp:Date.now(), read:true, ...(attachment ? {attachment:clone(attachment)} : {}) });
    delete data.messageDrafts?.[ICSMessaging.draftKey(ui)];
    openMessageThread(c, id);
  }
  /* Messaging overlays from this image's Mms code: the overflow menus (conversation_list_menu with ConversationList's
     visibility rules; ComposeMessageActivity.onPrepareOptionsMenu: Add subject, Send once there is something to send,
     Insert smiley, Delete thread or Discard, Add to People for a number that is no contact, Settings), Insert smiley
     (showSmileyDialog: smiley_menu_item rows of icon, name and text), the message context menu (Copy text, Forward,
     Lock / Unlock, View details, Delete), ConversationList.confirmDeleteThreadDialog (Delete? with "Delete locked
     messages" while locked messages are there), confirmDeleteDialog and MessageUtils.getTextMessageDetails. The words
     are mms-strings.js'. */
  function renderMessageOverlay(c) {
    const {ui, data, safe, i18n} = c;
    const M = key => MmsStrings.t(key), unavailable = 'This feature is not part of the simulator.';
    const option = (action, text, id = '') => `<button data-action="${action}" data-id="${safe(id)}">${safe(text)}</button>`;
    const alert = (title, body, buttons = '', icon = false) => `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="mms-alert" role="alertdialog" aria-label="${safe(title)}" data-no-translate>${title ? `<h3>${icon ? '<img src="assets/mms-ic_dialog_alert_holo_light.png" alt="">' : ''}${safe(title)}</h3>` : ''}${body}${buttons ? `<div class="mms-alert-buttons">${buttons}</div>` : ''}</div>`;
    const message = data.messages.find(m => String(m.id) === String(ui.mmsMessage));
    if (ui.overlay === 'mms-menu' && ui.mmsPrefs) return `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu" data-no-translate>${MmsPrefs.menu(mmspContext(c)).map(item => option(item.action, item.title)).join('')}</div>`;
    if (ui.overlay === 'mms-menu') {
      const composing = ['thread', 'new'].includes(ui.sub), draft = data.messageDrafts?.[ICSMessaging.draftKey(ui)] || {};
      const messages = ui.sub === 'thread' ? data.messages.filter(m => String(m.contact) === String(ui.thread)) : [];
      const to = ui.sub === 'thread' ? String(ui.thread) : ICSMessaging.recipient(draft.recipient || '', data.contacts)?.key || '';
      const items = composing
        ? option('toast', M('Add subject'), unavailable) + ((draft.body || '').trim() || draft.attachment ? option('mms-send-now', M('Send')) : '') + option('mms-smiley', M('Insert smiley'))
          + (messages.length ? option('mms-delete-thread', M('Delete thread')) : option('mms-discard', M('Discard'))) + (to.startsWith('tel:') ? option('toast', M('Add to People'), unavailable) : '') + option('mmsp-open', M('Settings'))
        : option('mmsp-open', M('Settings')) + (data.messages.length ? option('mms-delete-all', M('Delete all threads')) : '');
      return `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu ${composing ? '' : 'mms-menu-root'}" data-no-translate>${items}</div>`;
    }
    if (ui.overlay === 'mms-attach') return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog mms-dialog" role="dialog" aria-label="${safe(MmsStrings.t('Attach'))}" data-no-translate><h3>${safe(MmsStrings.t('Attach'))}</h3><div class="mms-dialog-list">${data.photos.map(p => `<button data-action="mms-photo" data-id="${p.id}">${ICSMessaging.photo(p)}</button>`).join('') || `<p>${safe(i18n.t('No photos'))}</p>`}</div></div>`;
    if (ui.overlay === 'mms-smiley') return alert(M('Insert smiley'), `<div class="mms-smileys">${MmsStrings.SMILEYS.map(([name, text, icon]) => `<button data-action="mms-insert-smiley" data-id="${safe(text)}"><img src="assets/mms-emo_im_${icon}.png" alt=""><span>${safe(M(name))}</span><b>${safe(text)}</b></button>`).join('')}</div>`);
    if (ui.overlay === 'mms-delete-confirm') {
      const scope = ui.mmsDelete === 'all' ? data.messages : ui.mmsDelete === 'thread' ? data.messages.filter(m => String(m.contact) === String(ui.thread)) : [];
      if (ui.mmsDelete === 'message') return alert('', `<p>${safe(M(message?.locked ? 'Delete this locked message?' : 'The message will be deleted.'))}</p>`, option('close-overlay', M('Cancel')) + option('mms-confirm-delete', M('Delete')));
      const locked = scope.some(m => m.locked) ? `<label class="mms-alert-check"><input type="checkbox" data-action="mms-delete-locked" ${ui.mmsDeleteLocked ? 'checked' : ''}><span>${safe(M('Delete locked messages'))}</span></label>` : '';
      return alert(M('Delete?'), `<p>${safe(M(ui.mmsDelete === 'all' ? 'All threads will be deleted.' : 'The entire thread will be deleted.'))}</p>${locked}`, option('close-overlay', M('Cancel')) + option('mms-confirm-delete', M('Delete')), true);
    }
    if (!message) return '';
    if (ui.overlay === 'mms-message') return alert(M('Message options'), `<div class="mms-alert-list">${option('mms-copy', M('Copy text'))}${option('mms-forward', M('Forward'))}${option('mms-lock', M(message.locked ? 'Unlock' : 'Lock'))}${option('mms-details', M('View details'))}${option('mms-delete-message', M('Delete'))}</div>`);
    if (ui.overlay === 'mms-details') {
      const when = message.timestamp ? new Date(message.timestamp).toLocaleString(i18n.locale(), {year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'}) : i18n.t(message.time || '');
      const lines = [M('Type: ') + M(message.attachment ? 'Multimedia message' : 'Text message'), M(message.mine ? 'To: ' : 'From: ') + ICSMessaging.identity(message.contact, data.contacts).phone, M(message.mine ? 'Sent: ' : 'Received: ') + when];
      return alert(M('Message details'), `<p class="mms-details">${lines.map(safe).join('<br>')}</p>`);
    }
    return '';
  }

  ICS.register('messaging', {
    scroller: '.mms-scroll',
    init(c) { c.openMessageThread = key => openMessageThread(c, key); c.messageDraft = () => messageDraft(c); },
    render(c) {
      const {ui, data, i18n} = c;
      if (ui.mmsPrefs) return MmsPrefs.render(mmspContext(c));
      return ICSMessaging.render(data, ui, key => i18n.t(key), i18n.locale());
    },
    overlay(c) { if (c.ui.overlay.startsWith('mms-')) return renderMessageOverlay(c); },
    // Messaging › Settings' controls (also from the overflow menu, which they close first), before the lock check.
    early(action, button, c) {
      const {ui, renderOverlay} = c, {id} = button.dataset;
      if (action.startsWith('mmsp-')) { if (ui.overlay) { ui.overlay = ''; renderOverlay(); } if (MmsPrefs.handle(action, id, mmspContext(c))) return true; }
    },
    action(action, button, c) {
      const {ui, data, save, render, renderOverlay, viewport, contact, clone} = c, {id} = button.dataset, messageDraft_ = () => messageDraft(c);
      switch (action) {
        case 'thread': openMessageThread(c, id); break;
        case 'mms-search': ui.sub = 'search'; ui.overlay = ''; ui.mmsSearch = ''; render(); viewport.querySelector('.mms-search input')?.focus(); break;
        case 'mms-menu': case 'mms-attach': case 'mms-smiley': ui.overlay = action; renderOverlay(); break;
        case 'mms-recipient': { const person = contact(id); if (person) { messageDraft_().recipient = person.phone; save(); render(); viewport.querySelector('.mms-compose textarea').focus(); } break; }
        case 'mms-call': {const person=ICSMessaging.identity(ui.thread,data.contacts);c.startPhoneCall(person.phone);break;}
        case 'mms-photo': { const photo = data.photos.find(p => p.id === Number(id)); if (photo) { messageDraft_().attachment = clone(photo); messageDraft_().updated = Date.now(); save(); ui.overlay = ''; render(); scrollMessages(c); } break; }
        case 'mms-remove-attachment': delete messageDraft_().attachment; save(); render(); scrollMessages(c); break;
        case 'mms-insert-smiley': messageDraft_().body = ((messageDraft_().body || '') + ' ' + id).trim().slice(0,2000); messageDraft_().updated = Date.now(); save(); ui.overlay = ''; render(); scrollMessages(c); break;
        case 'mms-discard': delete data.messageDrafts?.[ICSMessaging.draftKey(ui)]; save(); ui.overlay = ''; render(); scrollMessages(c); break;
        case 'mms-message': ui.mmsMessage = id; ui.overlay = 'mms-message'; renderOverlay(); break;
        case 'mms-details': ui.overlay = 'mms-details'; renderOverlay(); break;
        case 'mms-forward': { const message = data.messages.find(m => String(m.id) === String(ui.mmsMessage)); if (!message) break; ui.sub = 'new'; Object.assign(messageDraft_(),{body:message.body,recipient:'',attachment:message.attachment ? clone(message.attachment) : null,updated:Date.now()}); save(); ui.overlay = ''; render(); break; }
        case 'mms-delete-thread': case 'mms-delete-message': case 'mms-delete-all': ui.mmsDelete = action.slice(11); ui.mmsDeleteLocked = false; ui.overlay = 'mms-delete-confirm'; renderOverlay(); break;
        case 'mms-delete-locked': ui.mmsDeleteLocked = !ui.mmsDeleteLocked; renderOverlay(); break;
        case 'mms-lock': { const message = data.messages.find(m => String(m.id) === String(ui.mmsMessage)); if (message) { message.locked = !message.locked; save(); } ui.overlay = ''; render(); scrollMessages(c); break; }
        case 'mms-copy': { const message = data.messages.find(m => String(m.id) === String(ui.mmsMessage)); navigator.clipboard?.writeText(message?.body || '').catch(() => {}); ui.overlay = ''; renderOverlay(); break; }
        case 'mms-send-now': ui.overlay = ''; renderOverlay(); viewport.querySelector('.mms-compose')?.requestSubmit(); break;
        case 'mms-confirm-delete': {
          // Deleting a thread or all threads keeps locked messages unless "Delete locked messages" is ticked.
          const doomed = m => ui.mmsDelete === 'message' ? String(m.id) === String(ui.mmsMessage) : (ui.mmsDelete === 'all' || String(m.contact) === String(ui.thread)) && (!m.locked || ui.mmsDeleteLocked);
          data.messages = data.messages.filter(m => !doomed(m));
          if (ui.mmsDelete === 'all') data.messageDrafts = {};
          if (ui.mmsDelete === 'thread') { delete data.messageDrafts?.[String(ui.thread)]; if (!data.messages.some(m => String(m.contact) === String(ui.thread))) ui.sub = ''; }
          save(); ui.overlay = ''; render(); break;
        }
        case 'new-message': ui.sub = 'new'; ui.overlay = ''; render(); viewport.querySelector('[name=recipient]')?.focus(); break;
        default: return false;
      }
      return true;
    },
    submit(form, values, c) {
      const {ui, data, render, toast} = c;
      switch (form.dataset.form) {
        case 'mms-search': ui.mmsSearch = String(values.get('query') || '').trim(); render(); break;
        case 'mms-send': {
          const target = ui.sub === 'thread' ? {key:ui.thread} : ICSMessaging.recipient(values.get('recipient'),data.contacts);
          if (!target) { toast('Enter a contact name or valid phone number'); return true; }
          sendMessage(c, target.key, String(values.get('body') || '').trim(), messageDraft(c).attachment); break;
        }
        default: return false;
      }
      return true;
    },
    // The compose box: the draft, the recipient suggestions, the counter and the Send button follow the typing.
    input(event, c) {
      const {data, save, viewport, safe, dp} = c;
      if (event.target.closest('.mms-compose')) {
        const draft = messageDraft(c);
        if (event.target.name === 'body') draft.body = event.target.value;
        if (event.target.name === 'recipient') {
          draft.recipient = event.target.value;
          const query = draft.recipient.trim().toLocaleLowerCase();
          viewport.querySelector('.mms-suggestions').innerHTML = query ? data.contacts.filter(p => `${p.name} ${p.phone}`.toLocaleLowerCase().includes(query)).slice(0,5).map(p => `<button type="button" data-action="mms-recipient" data-id="${p.id}">${safe(p.name)}<small>${safe(p.phone)}</small></button>`).join('') : '';
        }
        draft.updated = Date.now(); save();
        const count = ICSMessaging.counter(draft.body || '');
        viewport.querySelector('.mms-counter').textContent = draft.attachment ? 'MMS' : count.count > 1 || count.remaining < 10 ? `${count.remaining} / ${count.count}` : '';
        viewport.querySelector('.mms-send').disabled = !(draft.body || '').trim() && !draft.attachment;
        if (event.target.name === 'body') { event.target.style.height = 'calc(51.7648 * var(--dp))'; event.target.style.height = `${Math.min(dp(103.5295),event.target.scrollHeight)}px`; }
        return true;
      }
    },
    back(c) {
      const {ui, render} = c;
      if (ui.overlay) return false;
      if (ui.view === 'messaging' && !ui.overlay && MmsPrefs.back(ui)) { render(); return true; }
      if (ui.view === 'messaging' && ui.sub === 'thread') { ui.sub = ui.mmsListMode || ''; render(); return true; }
      return false;
    },
    // A long press (or the browser's context menu) on a message opens its options.
    contextmenu(event, c) {
      const {ui, renderOverlay} = c;
      const message = event.target.closest('.mms-message');
      if (message && !ui.overlay) { ui.mmsMessage = message.dataset.id; ui.overlay = 'mms-message'; renderOverlay(); }
    },
    pointerdown(event, p, c) {
      const {ui, renderOverlay} = c;
      const message = event.target.closest('.mms-message');
      if (message && !ui.overlay) holdTimer = setTimeout(() => { ui.mmsMessage = message.dataset.id; ui.overlay = 'mms-message'; c.suppressReleaseClick(); renderOverlay(); }, c.holdDelay(550));
    },
    pointermove(event, p, dx, dy, c) { if (Math.hypot(dx,dy) > c.dp(9)) clearTimeout(holdTimer); },
    pointerup() { clearTimeout(holdTimer); },
    pointercancel() { clearTimeout(holdTimer); },
    clearData(c) { c.data.messages=c.clone(c.defaults.messages);c.data.messageDrafts={}; }
  });
})();
