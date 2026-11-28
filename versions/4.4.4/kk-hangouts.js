/* Hangouts (with SMS) in the 4.4.4 shell (docs/plans/engine-migration.md): the conversations and the thread
   (hangouts.js), compose with its recipients, smileys and attachments, a held message's options, archive, Do not
   disturb, location, its own pages (hangouts-prefs.js) and Back, moved out of simulator.js. */
(() => {
  'use strict';
  function scope(c) {
    const {REPLIES, clock, clone, contact, data, deviceDate, dp, hangoutsTakePhoto, holdDelay, i18n, messageDraft, openApp, openMessageThread, overlayRoot, render, renderOverlay, renderStatus, safe, save, scrollMessages, startPhoneCall, suppressReleaseClick, toast, ui, viewport} = c;
    function pickHangout(key) {
      const pending = data.messageDrafts?.new;
      if (pending && (pending.body || pending.attachment)) {
        const target = data.messageDrafts[String(key)] ||= {body: '', recipient: ''};
        target.body = [target.body, pending.body].filter(Boolean).join(' ').slice(0, 2000);
        if (pending.attachment) target.attachment = pending.attachment;
        target.updated = Date.now();
      }
      if (data.messageDrafts) delete data.messageDrafts.new;
      ui.mmsListMode = '';
      openMessageThread(key);
    }
    function renderMessageOverlay() {
      const dialog = (title, content) => `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog mms-dialog" role="dialog" aria-label="${safe(i18n.t(title))}"><h3>${safe(i18n.t(title))}</h3>${content}</div>`;
      const option = (action, text, id = '') => `<button data-action="${action}" data-id="${safe(id)}">${safe(i18n.t(text))}</button>`;
      const hangouts = ui.view === 'hangouts' ? Hangouts.overlay(data, ui, key => i18n.t(key)) : null;
      if (hangouts !== null) return hangouts;
      if (ui.overlay === 'mms-attach-photos') return dialog('Attach photo', `<div class="mms-dialog-list">${data.photos.map(p => `<button data-action="mms-photo" data-id="${p.id}">${ICSMessaging.photo(p)}</button>`).join('') || '<p>No photos</p>'}</div>`);
      if (ui.overlay === 'mms-menu') {
        const composing = ['thread','new'].includes(ui.sub);
        return `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu ${composing ? '' : 'mms-menu-root'}">${composing ? option('mms-smiley','Insert smiley') + option('mms-discard','Discard draft') + (ui.sub === 'thread' ? option('mms-delete-thread','Delete thread') : '') : option('new-message','New message') + option('mms-search','Search messages')}</div>`;
      }
      if (ui.overlay === 'mms-attach') return dialog('Add attachment', `<div class="mms-dialog-list">${data.photos.map(p => `<button data-action="mms-photo" data-id="${p.id}">${ICSMessaging.photo(p)}</button>`).join('') || '<p>No photos</p>'}</div>`);
      if (ui.overlay === 'mms-smiley') return dialog('Insert smiley', `<div class="mms-dialog-list">${[':-)',':-(', ';-)',':-D',':-P'].map(face=>option('mms-insert-smiley',face,face)).join('')}</div>`);
      if (ui.overlay === 'mms-delete-confirm') return dialog(ui.mmsDelete === 'thread' ? 'Delete thread' : 'Delete message', `<p>Delete this conversation or message from the simulator?</p><div class="settings-dialog-actions">${option('close-overlay','Cancel')}${option('mms-confirm-delete','Delete')}</div>`);
      const message = data.messages.find(m => String(m.id) === String(ui.mmsMessage));
      if (!message) return '';
      if (ui.overlay === 'mms-message') return dialog('Message options', `<div class="mms-dialog-list">${option('mms-forward','Forward message')}${option('mms-details','View message details')}${option('mms-delete-message','Delete message')}</div>`);
      if (ui.overlay === 'mms-details') return dialog('Message details', `<p>${message.attachment ? 'MMS' : 'SMS'} · ${safe(i18n.t(message.mine ? 'Sent' : 'Received'))}</p><p>${safe(ICSMessaging.identity(message.contact,data.contacts).phone)}</p><p>${safe(message.timestamp ? new Date(message.timestamp).toLocaleString(i18n.locale()) : i18n.t(message.time))}</p><p>${safe(message.body)}</p><div class="settings-dialog-actions">${option('close-overlay','OK')}</div>`);
      return '';
    }
    function sendMessage(id, body, attachment) {
      if (!body && !attachment) return;
      const more = data.messageDrafts?.[ICSMessaging.draftKey(ui)]?.moreAttachments || [];
      data.messages.push({ id: Date.now(), contact: id, body, mine: true, time: clock(), timestamp:Date.now(), read:true, ...(attachment ? {attachment:clone(attachment)} : {}) });
      more.forEach((photo, i) => data.messages.push({ id: Date.now() + i + 1, contact: id, body: '', mine: true, time: clock(), timestamp: Date.now(), read: true, attachment: clone(photo) }));
      delete data.messageDrafts?.[ICSMessaging.draftKey(ui)];
      openMessageThread(id);
      scheduleReply(id);
    }
    function scheduleReply(id) {
      const key = Number(id);
      if (!REPLIES[key] || (ui.repliedTo ||= new Set()).has(key)) return;
      ui.repliedTo.add(key);
      setTimeout(() => {
        const who = contact(key); if (!who) return;
        const open = ui.view === 'hangouts' && ui.sub === 'thread' && Number(ui.thread) === key && !ui.hgPage;
        data.messages.push({id: Date.now(), contact: key, body: i18n.t(REPLIES[key]), mine: false, time: clock(), timestamp: Date.now(), read: open});
        if (!open && HangoutsPrefs.notifies(data, key, deviceDate().getTime())) data.notifications.unshift({id: Date.now(), title: who.name, detail: i18n.t(REPLIES[key]), kind: 'message', contact: key});
        save(); renderStatus(); if (ui.view === 'hangouts') render(); if (ui.overlay === 'shade') renderOverlay();
      }, 4500);
    }
    return {
      render() {
        return Hangouts.render(data, ui, key => i18n.t(key), i18n.locale(), deviceDate().getTime());
      },
      mount(root) {
        if (ui.view === 'hangouts' && ui.hgPage === 'add') HangoutsPrefs.mount(viewport, ui, render);
      },
      action(action, button, event) {
        const {id, app, url} = button.dataset;
        if (action.startsWith('hgp-') && HangoutsPrefs.handle(action, id, {data, ui, save, render, renderOverlay, toast, root: viewport, openApp, openThread: key => openMessageThread(key),
          smsApp: () => { ui.overlay = 'kk-sms-app'; renderOverlay(); }, openApn: () => { openApp('settings'); ui.sub = 'apn'; render(); }})) return;
        switch (action) {
          case 'thread': openMessageThread(id); break;
          // New Hangout: a picked contact or typed number opens its conversation and takes along a shared draft.
          case 'hg-pick': pickHangout(id); break;
          case 'hg-attach-photo': ui.overlay = 'mms-attach-photos'; renderOverlay(); break;
          case 'hg-take-photo': hangoutsTakePhoto(); break;
          case 'hg-unsupported': ui.overlay = ''; renderOverlay(); toast(i18n.t('This feature is not part of the simulator.')); break;
          // Hangouts 2.0.303: ShareLocationActivity sends the demo place; conversations archive until something newer
          // arrives; the snooze dialog (EsApplication's 1–72 hours) shows dnd_list_item.xml's banner until Resume.
          case 'hg-location': ui.hgLocation = true; render(); break;
          case 'hg-share-location': ui.hgLocation = false; sendMessage(ui.thread, Hangouts.locationBody(key => i18n.t(key))); save(); break;
          case 'hg-archive': (data.hgArchived ||= {})[ui.thread] = Date.now(); ui.overlay = ''; ui.sub = ''; ui.mmsListMode = ''; save(); renderOverlay(); render(); toast(Hangouts.H(key => i18n.t(key), 'Hangout archived.')); break;
          case 'hg-unarchive': if (data.hgArchived) delete data.hgArchived[ui.thread]; ui.overlay = ''; if (ui.mmsListMode === 'archived') ui.mmsListMode = ''; save(); renderOverlay(); render(); break;
          case 'hg-archived': ui.overlay = ''; ui.sub = 'archived'; renderOverlay(); render(); break;
          case 'hg-dnd': ui.overlay = 'mms-hg-dnd'; renderOverlay(); break;
          case 'hg-dnd-set': data.hgSnooze = deviceDate().getTime() + Number(id) * 60000; ui.overlay = ''; save(); renderOverlay(); render(); break;
          case 'hg-dnd-cancel': delete data.hgSnooze; save(); render(); break;
          case 'mms-search': ui.sub = 'search'; ui.overlay = ''; ui.mmsSearch = ''; render(); viewport.querySelector('.mms-search input')?.focus(); break;
          case 'mms-menu': case 'mms-attach': case 'mms-smiley': ui.overlay = action; renderOverlay(); break;
          case 'mms-recipient': { const person = contact(id); if (person) { messageDraft().recipient = person.phone; save(); render(); viewport.querySelector('.mms-compose textarea').focus(); } break; }
          case 'mms-call': {const person=ICSMessaging.identity(ui.thread,data.contacts);startPhoneCall(person.phone);break;}
          case 'mms-photo': { const photo = data.photos.find(p => p.id === Number(id)); if (photo) { messageDraft().attachment = clone(photo); messageDraft().updated = Date.now(); save(); ui.overlay = ''; render(); scrollMessages(); } break; }
          case 'mms-remove-attachment': delete messageDraft().attachment; save(); render(); scrollMessages(); break;
          case 'mms-insert-smiley': messageDraft().body = ((messageDraft().body || '') + ' ' + id).trim().slice(0,2000); messageDraft().updated = Date.now(); save(); ui.overlay = ''; render(); scrollMessages(); break;
          case 'mms-discard': delete data.messageDrafts?.[ICSMessaging.draftKey(ui)]; save(); ui.overlay = ''; render(); scrollMessages(); break;
          case 'mms-message': ui.mmsMessage = id; ui.overlay = 'mms-message'; renderOverlay(); break;
          case 'mms-details': ui.overlay = 'mms-details'; renderOverlay(); break;
          case 'mms-forward': { const message = data.messages.find(m => String(m.id) === String(ui.mmsMessage)); if (!message) break; ui.sub = 'new'; Object.assign(messageDraft(),{body:message.body,recipient:'',attachment:message.attachment ? clone(message.attachment) : null,updated:Date.now()}); save(); ui.overlay = ''; render(); break; }
          case 'mms-delete-thread': case 'mms-delete-message': ui.mmsDelete = action === 'mms-delete-thread' ? 'thread' : 'message'; ui.overlay = 'mms-delete-confirm'; renderOverlay(); break;
          case 'mms-confirm-delete': {
            data.messages = data.messages.filter(m => ui.mmsDelete === 'thread' ? String(m.contact) !== String(ui.thread) : String(m.id) !== String(ui.mmsMessage));
            if (ui.mmsDelete === 'thread') { delete data.messageDrafts?.[String(ui.thread)]; ui.sub = ''; ui.hgPage = ''; ui.hgStack = []; }
            save(); ui.overlay = ''; render(); break;
          }
          case 'new-message': ui.sub = 'new'; ui.overlay = ''; render(); viewport.querySelector('[name=recipient]')?.focus(); break;
          default: return false;
        }
        return true;
      },
      submit(form, event) {
        const values = new FormData(form);
        switch (form.dataset.form) {
          case 'mms-search': ui.mmsSearch = String(values.get('query') || '').trim(); render(); break;
          case 'hg-new': { const target = ICSMessaging.recipient(values.get('recipient'), data.contacts); if (!target) { toast('Enter a contact name or valid phone number'); return; } pickHangout(target.key); break; }
          case 'mms-send': {
            const target = ui.sub === 'thread' ? {key:ui.thread} : ICSMessaging.recipient(values.get('recipient'),data.contacts);
            if (!target) { toast('Enter a contact name or valid phone number'); return; }
            sendMessage(target.key, String(values.get('body') || '').trim(), messageDraft().attachment); break;
          }
          default: return false;
        }
        return true;
      },
      input(event) {
        if (event.target.closest('.hg-new')) {
          const query = event.target.value.trim().toLocaleLowerCase();
          (data.messageDrafts ||= {}).new ||= {body: '', recipient: ''};
          data.messageDrafts.new.recipient = event.target.value; save();
          viewport.querySelectorAll('.hg-person').forEach(row => { row.hidden = !!query && !row.dataset.search.includes(query); });
          return true;
        }
        if (event.target.closest('.mms-compose')) {
          const draft = messageDraft();
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
          if (event.target.name === 'body') { event.target.style.height = 'calc(48.5652 * var(--dp))'; event.target.style.height = `${Math.min(dp(97.1303),event.target.scrollHeight)}px`; }
          return true;
        }
        return false;
      },
      overlay() {
        if (ui.overlay.startsWith('mms-')) {
          overlayRoot.innerHTML = renderMessageOverlay();
        } else return false;
        return true;
      },
      back() {
        if (ui.view === 'hangouts' && ui.sub === 'thread' && ui.hgLocation) { ui.hgLocation = false; render(); return true; }
        // Hangouts' own pages (hangouts-prefs.js) step back through what opened them.
        if (ui.view === 'hangouts' && ui.hgPage) { HangoutsPrefs.back(ui); render(); return true; }
        if (ui.view === 'hangouts' && ui.sub === 'archived') { ui.sub = ''; render(); return true; }
        if (['messaging', 'hangouts'].includes(ui.view) && ui.sub === 'thread') { ui.sub = ui.mmsListMode || ''; render(); return true; }
        return false;
      },
      gestureDown(event) {
        const message = event.target.closest('.mms-message');
        if (message && !ui.overlay) c.messageHoldTimer = setTimeout(() => { ui.mmsMessage = message.dataset.id; ui.overlay = 'mms-message'; suppressReleaseClick(); renderOverlay(); }, holdDelay(550));
      }
    };
  }
  const spec = {
    render: c => scope(c).render(),
    mount: (c, root) => scope(c).mount(root),
    action: (name, el, event, c) => scope(c).action(name, el, event),
    submit: (form, event, c) => scope(c).submit(form, event),
    input: (event, c) => scope(c).input(event),
    overlay: c => scope(c).overlay(),
    back: c => scope(c).back(),
    gestureDown: (event, c) => scope(c).gestureDown(event)
  };
  for (const id of ['hangouts']) KK.register(id, spec);
})();
