/* Android 7.1.2 multiple users (UserManager, SystemUI's UserSwitcherController, the framework's UserSwitchingDialog),
   each user a saved phone of its own (ng-core.js keeps the current user's data under its own key; the list of users is
   shared by all of them). The logic is 6.0.1's (its users module); N2G48C decides the texts and icons:
   - Icons: UserIcons.getDefaultUserIcon(userId), ic_account_circle in USER_ICON_COLORS[userId % 8]: the owner is user 0
     (user_icon_1), the users added 10, 11 … (Settings' assignDefaultPhoto); the guest has no photo and gets USER_NULL's
     user_icon_default_gray.
   - Guest: created if there is none, then the switch (user_switching_message, then the guest's own phone); coming back
     to a guest that was used asks guest_wipe_session (Start over wipes it, Yes, continue keeps it); Settings' Remove
     guest ends the session. SystemUI's Guest user notification waits for notification actions in the shade.
   - Add user: Add new user? (user_add_user_message_long from Settings, _short from quick settings), then Set up user
     now? (Not now leaves a "New user" that is "Not set up"; Set up now switches). A new user on the phone starts in
     SetupWizard; the simulator has no setup wizard, so the new user starts on the Home screen.
   - The maximum: config_multiuserMaximumUsers 4 (the guest not counted). */
(() => {
  'use strict';
  const T = () => NG.text('settings');
  const KEY = 'android-time-machine-ng-users';
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const write = v => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {} };
  const store = id => `android-time-machine-ng-v1${id === 'owner' ? '' : `-${id}`}`;
  const U = NG.users = {
    MAX: 4,
    current: c => c.user || 'owner',
    list: () => read().users || [],
    hasGuest: () => !!read().guest,
    ownerName: () => read().ownerName || T().t('framework/owner_name'),
    name: id => id === 'owner' ? U.ownerName() : id === 'guest' ? T().t('user_guest') : (U.list().find(u => u.id === id)?.name || T().t('user_new_user_name')),
    // The users added are 10, 11 … (u1, u2 …).
    icon(id) {
      if (id === 'guest') return 'fw-ic_account_circle-gray.svg';
      const n = id === 'owner' ? 0 : 9 + Number(String(id).slice(1));
      return `fw-ic_account_circle-c${n % 8 + 1}.svg`;
    },
    // A user never switched to is "Not set up".
    setUp: id => { try { return id === 'owner' || localStorage.getItem(store(id)) !== null; } catch { return true; } },
    canAdd: () => 1 + U.list().length < U.MAX,
    rename(id, name) { const v = read(); if (id === 'owner') v.ownerName = name; else v.users = (v.users || []).map(u => u.id === id ? {...u, name} : u); write(v); },
    switchTo(c, id) {
      c.dialog({progress: T().fmt('framework/user_switching_message', null, U.name(id)), cancelable: false});
      setTimeout(() => { try { sessionStorage.setItem('ng-user', id); } catch {} location.reload(); }, 900);
    },
    addUser() {
      const v = read(), n = v.next || 1;
      v.users = [...(v.users || []), {id: `u${n}`, name: T().t('user_new_user_name')}]; v.next = n + 1; write(v);
      return `u${n}`;
    },
    removeUser(id) {
      const v = read(); v.users = (v.users || []).filter(u => u.id !== id); write(v);
      try { localStorage.removeItem(store(id)); } catch {}
    },
    removeGuest(c) {
      const v = read(); delete v.guest; delete v.guestUsed; write(v);
      try { localStorage.removeItem(store('guest')); } catch {}
      if (U.current(c) === 'guest') U.switchTo(c, 'owner');
    },
    guest(c) {
      const v = read();
      if (!v.guest) { v.guest = true; write(v); }
      U.switchTo(c, 'guest');
    },
    exitGuestDialog(c) {
      const t = T();
      c.dialog({title: t.t('SystemUI/guest_exit_guest_dialog_title'), message: t.t('SystemUI/guest_exit_guest_dialog_message'), buttons: [{label: t.t('framework/cancel')}, {label: t.t('SystemUI/guest_exit_guest_dialog_remove'), action: c => U.removeGuest(c)}]});
    },
    // AddUserDialog (quick settings: the short message) and UserSettings (the long one), then the set-up question.
    addDialog(c, long) {
      const t = T();
      if (!U.canAdd()) return;
      c.dialog({title: t.t('user_add_user_title'), message: t.t(long ? 'user_add_user_message_long' : 'SystemUI/user_add_user_message_short'), buttons: [{label: t.t('framework/cancel')}, {label: t.t('framework/ok'), action: c => {
        if (!long) { U.switchTo(c, U.addUser()); return; }
        c.dialog({title: t.t('user_setup_dialog_title'), message: t.t('user_setup_dialog_message'), buttons: [
          {label: t.t('user_setup_button_setup_later'), action: c => { U.addUser(); c.render(); }},
          {label: t.t('user_setup_button_setup_now'), action: c => U.switchTo(c, U.addUser())}]});
      }}]});
    }
  };

  // The guest session: Welcome back on a later start.
  NG.register('users', {
    app: false,
    render: () => '',
    init(c) {
      if (U.current(c) !== 'guest') return;
      const v = read(), t = T();
      if (v.guestUsed) setTimeout(() => c.dialog({title: t.t('SystemUI/guest_wipe_session_title'), message: t.t('SystemUI/guest_wipe_session_message'), cancelable: false, buttons: [
        {label: t.t('SystemUI/guest_wipe_session_wipe'), action: () => { try { localStorage.removeItem(store('guest')); } catch {} location.reload(); }},
        {label: t.t('SystemUI/guest_wipe_session_dontwipe')}]}), 1200);
      v.guestUsed = true; write(v);
    }
  });
})();
