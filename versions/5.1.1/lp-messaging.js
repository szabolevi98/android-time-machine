/* TODO */
'use strict';
LP.define(['messaging', 'hangouts'], ({
  clock, clone, contact, defaultData, deviceDate, dp, headsUp, holdDelay, i18n, openApp, overlayRoot, render,
  renderOverlay, REPLIES, safe, save, suppressReleaseClick, toast, ui, viewport
}, lp) => {
  function renderMessaging() {
    if (ui.lpmPage) return MessengerOptions.render(lp.data, ui, key => i18n.t(key));
    return ICSMessaging.render(lp.data, ui, key => i18n.t(key), i18n.locale(), deviceDate().getTime());
  }
  function messageDraft() {
    lp.data.messageDrafts ||= {};
    const key = ICSMessaging.draftKey(ui);
    return lp.data.messageDrafts[key] ||= {body:'',recipient:''};
  }
  function openMessageThread(key) {
    if (!['messaging', 'hangouts'].includes(ui.view)) openApp('messaging');
    if (ui.sub !== 'thread') ui.mmsListMode = ui.sub === 'search' ? 'search' : ui.sub === 'archived' ? 'archived' : '';
    ui.thread = key; ui.sub = 'thread'; ui.overlay = '';
    lp.data.messages.filter(m => String(m.contact) === String(key)).forEach(m => { m.read = true; });
    if (String(key) === '1') lp.data.notifications = lp.data.notifications.filter(n => n.id !== 2);
    save(); render(); scrollMessages();
  }
  function pickHangout(key) {
    const pending = lp.data.messageDrafts?.['hg:new'];
    if (pending && (pending.body || pending.attachment)) {
      const target = lp.data.messageDrafts['hg:' + String(key)] ||= {body: '', recipient: ''};
      target.body = [target.body, pending.body].filter(Boolean).join(' ').slice(0, 2000);
      if (pending.attachment) target.attachment = pending.attachment;
      target.updated = Date.now();
    }
    if (lp.data.messageDrafts) delete lp.data.messageDrafts['hg:new'];
    ui.mmsListMode = '';
    openMessageThread(key);
  }
  function scrollMessages() {
    const history = viewport.querySelector('.mms-history');
    if (history) history.scrollTop = history.scrollHeight;
  }
  function renderMessageOverlay() {
    const dialog = (title, content) => `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog mms-dialog" role="dialog" aria-label="${safe(i18n.t(title))}"><h3>${safe(i18n.t(title))}</h3>${content}</div>`;
    const option = (action, text, id = '') => `<button data-action="${action}" data-id="${safe(id)}">${safe(i18n.t(text))}</button>`;
    const hangouts = ui.view === 'hangouts' ? Hangouts.overlay(lp.data, ui, key => i18n.t(key)) : null;
    if (hangouts !== null) return hangouts;
    if (ui.overlay === 'mms-attach-photos') return dialog('Attach photo', `<div class="mms-dialog-list">${lp.data.photos.map(p => `<button data-action="mms-photo" data-id="${p.id}">${ICSMessaging.photo(p)}</button>`).join('') || '<p>No photos</p>'}</div>`);
    if (ui.overlay === 'mms-menu' && ui.view === 'messaging') {
      // Messenger's overflow: the conversation list (Archived, Settings, Help & feedback) or a conversation.
      const items = ui.sub === 'thread' ? [['mms-smiley', 'Insert smiley'], ['mpo-open', 'People & options'], ['mms-delete-thread', 'Delete'], ['mms-discard', 'Discard draft']] : ui.sub === 'new' ? [['mms-smiley', 'Insert smiley'], ['mms-discard', 'Discard draft']] : ui.sub === 'archived' ? [['mpo-settings', 'Settings'], ['toast:Help is not available offline.', 'Help & feedback']] : [['mms-archived', 'Archived'], ['mpo-settings', 'Settings'], ['toast:Help is not available offline.', 'Help & feedback']];
      return `<div class="menu-scrim" data-action="close-overlay"></div><div class="lp-popup-menu" role="menu">${items.map(([action, title]) => { const [act, arg] = action.split(/:(.*)/); return `<button role="menuitem" data-action="${act}"${arg ? ` data-id="${safe(arg)}"` : ''}>${safe(i18n.t(title))}</button>`; }).join('')}</div>`;
    }
    if (ui.overlay === 'mms-menu') {
      const composing = ['thread','new'].includes(ui.sub);
      return `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu ${composing ? '' : 'mms-menu-root'}">${composing ? option('mms-smiley','Insert smiley') + option('mms-discard','Discard draft') + (ui.sub === 'thread' ? option('mms-delete-thread','Delete thread') : '') : option('new-message','New message') + option('mms-search','Search messages')}</div>`;
    }
    if (ui.overlay === 'mms-attach') return dialog('Add attachment', `<div class="mms-dialog-list">${lp.data.photos.map(p => `<button data-action="mms-photo" data-id="${p.id}">${ICSMessaging.photo(p)}</button>`).join('') || '<p>No photos</p>'}</div>`);
    if (ui.overlay === 'mms-smiley') return dialog('Insert smiley', `<div class="mms-dialog-list">${[':-)',':-(', ';-)',':-D',':-P'].map(face=>option('mms-insert-smiley',face,face)).join('')}</div>`);
    if (ui.overlay === 'mms-delete-confirm') return dialog(ui.mmsDelete === 'thread' ? 'Delete thread' : 'Delete message', `<p>Delete this conversation or message from the simulator?</p><div class="settings-dialog-actions">${option('close-overlay','Cancel')}${option('mms-confirm-delete','Delete')}</div>`);
    const message = lp.data.messages.find(m => String(m.id) === String(ui.mmsMessage));
    if (!message) return '';
    if (ui.overlay === 'mms-message') return dialog('Message options', `<div class="mms-dialog-list">${option('mms-forward','Forward message')}${option('mms-details','View message details')}${option('mms-delete-message','Delete message')}</div>`);
    if (ui.overlay === 'mms-details') return dialog('Message details', `<p>${message.attachment ? 'MMS' : 'SMS'} · ${safe(i18n.t(message.mine ? 'Sent' : 'Received'))}</p><p>${safe(ICSMessaging.identity(message.contact,lp.data.contacts).phone)}</p><p>${safe(message.timestamp ? new Date(message.timestamp).toLocaleString(i18n.locale()) : i18n.t(message.time))}</p><p>${safe(message.body)}</p><div class="settings-dialog-actions">${option('close-overlay','OK')}</div>`);
    return '';
  }
  function sendMessage(id, body, attachment) {
    if (!body && !attachment) return;
    const more = lp.data.messageDrafts?.[ICSMessaging.draftKey(ui)]?.moreAttachments || [];
    // Messenger carries SMS; Hangouts keeps its own chats (channel 'hangouts').
    lp.data.messages.push({ id: Date.now(), contact: id, body, mine: true, time: clock(), timestamp:Date.now(), read:true, ...(ui.view === 'hangouts' ? {channel: 'hangouts'} : {}), ...(attachment ? {attachment:clone(attachment)} : {}) });
    more.forEach((photo, i) => lp.data.messages.push({ id: Date.now() + i + 1, contact: id, body: '', mine: true, time: clock(), timestamp: Date.now(), read: true, ...(ui.view === 'hangouts' ? {channel: 'hangouts'} : {}), attachment: clone(photo) }));
    delete lp.data.messageDrafts?.[ICSMessaging.draftKey(ui)];
    openMessageThread(id);
    scheduleReply(id, ui.view === 'hangouts' ? 'hangouts' : 'sms');
  }
  function scheduleReply(id, channel = 'sms') {
    const key = Number(id), app = channel === 'hangouts' ? 'hangouts' : 'messaging';
    if (!REPLIES[key] || (ui.repliedTo ||= new Set()).has(`${channel}:${key}`)) return;
    // A blocked person's Hangouts messages do not arrive (realtimechat_block_user_text).
    if (channel === 'hangouts' && !HangoutsPrefs.receives(lp.data, key)) return;
    ui.repliedTo.add(`${channel}:${key}`);
    setTimeout(() => {
      const who = contact(key); if (!who) return;
      const open = ui.view === app && ui.sub === 'thread' && Number(ui.thread) === key;
      lp.data.messages.push({id: Date.now(), contact: key, body: i18n.t(REPLIES[key]), mine: false, time: clock(), timestamp: Date.now(), read: open, ...(channel === 'hangouts' ? {channel} : {})});
      // Notifications off for the app or the conversation, a snooze or a block keep the answer silent.
      const quiet = channel === 'hangouts' ? !HangoutsPrefs.notifies(lp.data, key, deviceDate().getTime()) : !MessengerOptions.notifies(lp.data, key);
      if (!open && quiet) { save(); if (['messaging', 'hangouts'].includes(ui.view) && !ui.sub) render(); }
      else if (!open) {
        const note = {id: Date.now(), title: who.name, detail: i18n.t(REPLIES[key]), kind: 'message', contact: key, time: deviceDate().getTime(), ...(channel === 'hangouts' ? {channel} : {})};
        lp.data.notifications.unshift(note); save(); lp.renderStatus(); headsUp(note);
      } else { save(); render(); }
      if (ui.overlay === 'shade') renderOverlay();
    }, 4500);
  }
  Object.assign(lp, {messageDraft, openMessageThread, scrollMessages});
  // lp:code
  return {
    // lp:hooks
    // Settings › Apps › Messenger or Hangouts › Clear data: their shared conversations.
    clearData() { lp.data.messages=clone(defaultData.messages);lp.data.messageDrafts={}; },
    pointerdown(event) {
      const message = event.target.closest('.mms-message');
      if (message && !ui.overlay) lp.messageHoldTimer = setTimeout(() => { ui.mmsMessage = message.dataset.id; ui.overlay = 'mms-message'; suppressReleaseClick(); renderOverlay(); }, holdDelay(550));
      // lp:pointerdown
      return false;
    },
    contextmenu(event) {
      const message = event.target.closest('.mms-message');
      if (message && !ui.overlay) { ui.mmsMessage = message.dataset.id; ui.overlay = 'mms-message'; renderOverlay(); }
      // lp:contextmenu
      return false;
    },
    input(event) {
      if (event.target.closest('.hg-new')) {
        const query = event.target.value.trim().toLocaleLowerCase();
        (lp.data.messageDrafts ||= {}).new ||= {body: '', recipient: ''};
        lp.data.messageDrafts.new.recipient = event.target.value; save();
        viewport.querySelectorAll('.hg-person').forEach(row => { row.hidden = !!query && !row.dataset.search.includes(query); });
        return true;
      }
      if (event.target.closest('.mms-compose')) {
        const draft = messageDraft();
        if (event.target.name === 'body') draft.body = event.target.value;
        if (event.target.name === 'recipient') {
          draft.recipient = event.target.value;
          const query = draft.recipient.trim().toLocaleLowerCase();
          viewport.querySelector('.mms-suggestions').innerHTML = query ? lp.data.contacts.filter(p => `${p.name} ${p.phone}`.toLocaleLowerCase().includes(query)).slice(0,5).map(p => `<button type="button" data-action="mms-recipient" data-id="${p.id}">${safe(p.name)}<small>${safe(p.phone)}</small></button>`).join('') : '';
        }
        draft.updated = Date.now(); save();
        const count = ICSMessaging.counter(draft.body || '');
        viewport.querySelector('.mms-counter').textContent = draft.attachment ? 'MMS' : count.count > 1 || count.remaining < 10 ? `${count.remaining} / ${count.count}` : '';
        viewport.querySelector('.mms-send').disabled = !(draft.body || '').trim() && !draft.attachment;
        if (event.target.name === 'body') { event.target.style.height = 'calc(48.5652 * var(--dp))'; event.target.style.height = `${Math.min(dp(97.1303),event.target.scrollHeight)}px`; }
        return true;
      }
      // lp:input
      return false;
    },
    overlay(name, root) {
      if (ui.overlay.startsWith('mms-')) {
        overlayRoot.innerHTML = renderMessageOverlay();
        return true;
      }
      // lp:overlay
      return false;
    },
    back() {
      if (ui.view === 'messaging' && ui.sub === 'archived') { ui.sub = ''; render(); return true; }
      if (ui.view === 'hangouts' && ui.sub === 'archived') { ui.sub = ''; render(); return true; }
      if (['messaging', 'hangouts'].includes(ui.view) && ui.sub === 'thread') { ui.sub = ui.mmsListMode || ''; render(); return true; }
      // lp:back
      return false;
    },
    backPages() {
      if (ui.view === 'hangouts' && ui.hgPage) { HangoutsPrefs.back(ui); render(); return true; }
      if (ui.view === 'messaging' && ui.lpmPage) { MessengerOptions.back(ui); render(); return true; }
      // lp:backPages
      return false;
    },
    render() {
      if (ui.view === 'hangouts') return Hangouts.render(lp.data, ui, key => i18n.t(key), i18n.locale(), deviceDate().getTime());
      return renderMessaging();
      // lp:render
    },
    afterRender() {
      if (ui.view === 'hangouts' && ui.hgPage === 'add') HangoutsPrefs.mount(viewport, ui, render);
      // lp:afterRender
      return false;
    },
    click(action, button, event) {
      const {id, app, url} = button.dataset;
      if (/^(hgp|mpo|mset)-/.test(action)) {
        const ctx = {data: lp.data, ui, save, render, renderOverlay, toast, root: viewport, openApp, openThread: key => openMessageThread(key)};
        if ((action.startsWith('hgp-') ? HangoutsPrefs : MessengerOptions).handle(action, id, ctx)) return;
      }
      // lp:click
      switch (action) {
        case 'thread': openMessageThread(id); break;
        // New Hangout: a picked contact or typed number opens its conversation and takes along a shared draft.
        case 'hg-pick': pickHangout(id); break;
        case 'hg-attach-photo': ui.overlay = 'mms-attach-photos'; renderOverlay(); break;
        case 'hg-take-photo': lp.hangoutsTakePhoto(); break;
        case 'hg-unsupported': ui.overlay = ''; renderOverlay(); toast(i18n.t('This feature is not part of the simulator.')); break;
        // Hangouts 2.5: the attachment button's "Share your location" sends the demo place; conversations archive until
        // something newer arrives; the snooze dialog (1–72 hours) shows dnd_list_item.xml's banner until Resume.
        case 'hg-share-location': ui.overlay = ''; renderOverlay(); sendMessage(ui.thread, Hangouts.locationBody(key => i18n.t(key))); save(); break;
        case 'hg-archive': (lp.data.hgArchived ||= {})[ui.thread] = Date.now(); ui.overlay = ''; ui.sub = ''; ui.mmsListMode = ''; save(); renderOverlay(); render(); toast(Hangouts.H(key => i18n.t(key), 'Hangout archived.')); break;
        case 'hg-unarchive': if (lp.data.hgArchived) delete lp.data.hgArchived[ui.thread]; ui.overlay = ''; if (ui.mmsListMode === 'archived') ui.mmsListMode = ''; save(); renderOverlay(); render(); break;
        case 'hg-archived': ui.overlay = ''; ui.sub = 'archived'; renderOverlay(); render(); break;
        case 'mms-archived': ui.overlay = ''; ui.sub = 'archived'; renderOverlay(); render(); break;
        case 'hg-dnd': ui.overlay = 'mms-hg-dnd'; renderOverlay(); break;
        case 'hg-drawer': ui.overlay = 'mms-hg-drawer'; renderOverlay(); break;
        case 'hg-dnd-set': lp.data.hgSnooze = deviceDate().getTime() + Number(id) * 60000; ui.overlay = ''; save(); renderOverlay(); render(); break;
        case 'hg-dnd-cancel': delete lp.data.hgSnooze; save(); render(); break;
        case 'mms-search': ui.sub = 'search'; ui.overlay = ''; ui.mmsSearch = ''; render(); viewport.querySelector('.mms-search input')?.focus(); break;
        case 'mms-menu': case 'mms-attach': case 'mms-smiley': ui.overlay = action; renderOverlay(); break;
        case 'mms-recipient': { const person = contact(id); if (person) { messageDraft().recipient = person.phone; save(); render(); viewport.querySelector('.mms-compose textarea')?.focus(); } break; }
        case 'mms-call': {const person=ICSMessaging.identity(ui.thread,lp.data.contacts);lp.startPhoneCall(person.phone);break;}
        case 'mms-photo': { const photo = lp.data.photos.find(p => p.id === Number(id)); if (photo) { messageDraft().attachment = clone(photo); messageDraft().updated = Date.now(); save(); ui.overlay = ''; render(); scrollMessages(); } break; }
        case 'mms-remove-attachment': delete messageDraft().attachment; save(); render(); scrollMessages(); break;
        case 'mms-insert-smiley': messageDraft().body = ((messageDraft().body || '') + ' ' + id).trim().slice(0,2000); messageDraft().updated = Date.now(); save(); ui.overlay = ''; render(); scrollMessages(); break;
        case 'mms-discard': delete lp.data.messageDrafts?.[ICSMessaging.draftKey(ui)]; save(); ui.overlay = ''; render(); scrollMessages(); break;
        case 'mms-message': ui.mmsMessage = id; ui.overlay = 'mms-message'; renderOverlay(); break;
        case 'mms-details': ui.overlay = 'mms-details'; renderOverlay(); break;
        case 'mms-forward': { const message = lp.data.messages.find(m => String(m.id) === String(ui.mmsMessage)); if (!message) break; ui.sub = 'new'; Object.assign(messageDraft(),{body:message.body,recipient:'',attachment:message.attachment ? clone(message.attachment) : null,updated:Date.now()}); save(); ui.overlay = ''; render(); break; }
        case 'mms-delete-thread': case 'mms-delete-message': ui.mmsDelete = action === 'mms-delete-thread' ? 'thread' : 'message'; ui.overlay = 'mms-delete-confirm'; renderOverlay(); break;
        case 'mms-confirm-delete': {
          lp.data.messages = lp.data.messages.filter(m => ui.mmsDelete === 'thread' ? String(m.contact) !== String(ui.thread) : String(m.id) !== String(ui.mmsMessage));
          if (ui.mmsDelete === 'thread') { delete lp.data.messageDrafts?.[String(ui.thread)]; ui.sub = ''; }
          save(); ui.overlay = ''; render(); break;
        }
        case 'new-message': ui.sub = 'new'; ui.overlay = ''; render(); viewport.querySelector('[name=recipient]')?.focus(); break;
        // lp:cases
        default: return false;
      }
      return true;
    },
    submit(name, values, event, form) {
      switch (name) {
        case 'mms-search': ui.mmsSearch = String(values.get('query') || '').trim(); render(); break;
        case 'hg-new': { const target = ICSMessaging.recipient(values.get('recipient'), lp.data.contacts); if (!target) { toast('Enter a contact name or valid phone number'); return; } pickHangout(target.key); break; }
        case 'mms-send': {
          const target = ui.sub === 'thread' ? {key:ui.thread} : ICSMessaging.recipient(values.get('recipient'),lp.data.contacts);
          if (!target) { toast('Enter a contact name or valid phone number'); return; }
          sendMessage(target.key, String(values.get('body') || '').trim(), messageDraft().attachment); break;
        }
        // lp:scases
        default: return false;
      }
      return true;
    }
  };
});
