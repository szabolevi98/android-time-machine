/* Google+ posting and settings in the versions whose Google+ is a stock app screen (4.0.4's Google+ 2.4 Stream, 4.3's
   4.0, 4.4.4's 4.2.3, 5.1.1's 4.9). New post is the APK's post_fragment / sharekit share box: the audience ("Your
   circles"), the text (share_body_hint), a photo from the phone's pictures and the phone's location; the post button
   (post / post_share_button_text / share_button_text) puts it at the top of the stream, kept in data.gplusMyPosts
   ({id, text, photo (picture index), place, at}); an own post's Delete asks post_delete_question. Back with something
   written offers Discard. Settings is the APK's list (main_preferences.xml, 4.9's settings_headers.xml; 2.4 has no list
   and opens notifications_preferences.xml): Notifications keeps its check boxes and ringtone, About Google+ shows the
   version, Messenger (4.0) opens Messenger's settings; the other rows are Google's account pages and keep the limit.
   Reshare, comments, the notifications list and circles stay Google's. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const PLACE = 'Mountain View, CA';
  const VERSIONS = {'2.4': '2.4.1.271037', '4.0': '4.0.0.46852618', '4.2.3': '4.2.3.56763078', '4.9': '4.9.0.85105612'};
  const mine = data => data.gplusMyPosts || [];
  // An own post's time: "now" in the first minute, then minutes, hours, the date.
  function ago(ctx, at) {
    const s = Math.max(0, ((ctx.now ? +ctx.now : Date.now()) - at) / 1000);
    if (s < 60) return ctx.t('now');
    if (s < 3600) return `${Math.floor(s / 60)} min`;
    if (s < 86400) return `${Math.floor(s / 3600)} h`;
    return new Date(at).toLocaleDateString(ctx.locale || 'en-US', {month: 'short', day: 'numeric'});
  }
  // The stream's own posts in the stream's post shape (name, time, text, photo, plus) with mine / place.
  const posts = ctx => !ctx ? [] : mine(ctx.data).map(p => ({id: p.id, name: ctx.me, time: ago(ctx, p.at), text: p.text, photo: p.photo ?? null, plus: 0, mine: true, place: p.place || ''}));
  // The post card's extras: the place line and Delete for an own post.
  const place = (ctx, p) => ctx && p.place ? `<small class="gpp-place">${e(p.place)}</small>` : '';
  const del = (ctx, p) => ctx && p.mine ? `<button class="gpp-del" data-action="gpp-delete" data-id="${e(p.id)}">${e(ctx.S('Delete'))}</button>` : '';
  function composer(ctx) {
    const d = ctx.ui.gppDraft || {}, S = ctx.S;
    const photos = d.picking ? `<div class="gpp-pick">${[0, 1, 2, 3].map(i => `<button data-action="gpp-photo-set" data-id="${i}">${ctx.thumb(i)}</button>`).join('')}</div>` : '';
    return `<div class="app-view sa-app gpp gpp-${e(ctx.version.replace(/\./g, ''))}">${ctx.bar({title: S('New post'), action: `<button class="gpp-share" data-action="gpp-post"${String(d.text || '').trim() || d.photo != null ? '' : ' disabled'}>${e(S('@post'))}</button>`})}
<div class="sa-scroll gpp-body"><div class="gpp-audience"><span>${e(S('Your circles'))}</span></div>
<label class="gpp-text"><textarea data-gpp-text rows="4" placeholder="${e(S('@share_hint'))}" aria-label="${e(S('@share_hint'))}">${e(d.text || '')}</textarea></label>
<div class="gpp-row">${d.place ? `<span class="gpp-loc">${e(d.place)}</span><button class="gpp-x" data-action="gpp-place" aria-label="${e(ctx.t('Remove'))}">×</button>` : `<button class="gpp-add" data-action="gpp-place">${e(S('Location'))}</button>`}</div>
<div class="gpp-row">${d.photo != null ? `<span class="gpp-photo">${ctx.thumb(d.photo)}</span><button class="gpp-x" data-action="gpp-photo-clear" aria-label="${e(ctx.t('Remove'))}">×</button>` : `<button class="gpp-add" data-action="gpp-photo">${e(S('@add_photo'))}</button>`}</div>${photos}</div>${dialog(ctx)}</div>`;
  }
  // The APK's settings lists.
  function rows(ctx) {
    const S = ctx.S, v = ctx.version, screen = ctx.ui.gppPrefs;
    const remote = key => ({key, title: S(key), remote: true});
    if (screen === 'notifications' || v === '2.4') {
      const list = [
        {kind: 'check', key: 'notifications_enabled', title: S('Google+ notifications'), summary: v === '4.9' ? '' : S('Show when notifications are received'), def: true},
        {kind: 'tone', key: 'notifications_ringtone', title: S('Ringtone'), summary: S('Set a ringtone for new notifications')},
        {kind: 'check', key: 'notifications_vibrate', title: S('Vibrate'), summary: v === '2.4' ? S('Also vibrate when notifications are received') : '', def: true}];
      if (v === '2.4') return [{kind: 'cat', title: S('Google+ notifications')}, list[0], list[2], list[1], remote('Notification settings')];
      return v === '4.0' ? list : [...list, remote('Who can notify me')];
    }
    const head = [{key: 'notifications', title: S('Notifications'), open: 'notifications'}];
    if (v === '4.0') return [...head, remote('Camera & photos'), remote('Sharing'), remote('Location sharing'), remote('Contacts'), {key: 'messenger', title: S('Messenger')}, remote('Apps with Google+ Sign-In'), {key: 'about', title: S('About Google+')}];
    return [...head, remote('Photos'), remote('Sharing'), remote('Location sharing'), remote('Contacts'), remote('Apps with Google+ Sign-In'), {kind: 'info', key: 'account', title: S('Account'), summary: ctx.account}];
  }
  const value = (ctx, key, def) => ctx.data.gplusPrefs?.[key] ?? def;
  const sounds = () => Object.keys(window.SystemSounds?.SOUNDS?.notifications || {});
  const soundName = key => window.SystemSounds?.SOUNDS?.notifications?.[key]?.[0] || key;
  function settings(ctx) {
    const row = r => {
      if (r.kind === 'cat') return `<div class="mps-cat">${e(r.title)}</div>`;
      if (r.kind === 'info') return `<div class="mps-row mps-info"><span><b>${e(r.title)}</b><small>${e(r.summary || '')}</small></span></div>`;
      const on = r.kind === 'check' && value(ctx, r.key, r.def);
      return `<button class="mps-row" data-action="${r.remote ? 'sa-unsupported' : 'gpp-pref'}" data-id="${e(r.key)}"${r.kind === 'check' ? ` role="checkbox" aria-checked="${on}"` : ''}><span><b>${e(r.title)}</b>${r.summary ? `<small>${e(r.summary)}</small>` : ''}</span>${r.kind === 'check' ? `<i class="mps-check${on ? ' on' : ''}" role="presentation"></i>` : ''}</button>`;
    };
    const title = ctx.ui.gppPrefs === 'notifications' && ctx.version !== '2.4' ? ctx.S('Notifications') : ctx.S('Settings');
    return `<div class="app-view sa-app mps gpp-prefs">${ctx.bar({title, up: true})}<div class="sa-scroll mps-list">${rows(ctx).map(row).join('')}</div>${dialog(ctx)}</div>`;
  }
  function dialog(ctx) {
    const d = ctx.ui.gppDialog, S = ctx.S; if (!d) return '';
    const shell = (title, body, buttons) => `<button class="mps-scrim" data-action="gpp-cancel" aria-label="${e(ctx.t('Cancel'))}"></button><div class="mps-dialog" role="dialog"${title ? ` aria-label="${e(title)}"` : ''}>${title ? `<h3>${e(title)}</h3>` : ''}${body}<div class="mps-buttons">${buttons}</div></div>`;
    const cancel = `<button data-action="gpp-cancel">${e(ctx.t('Cancel'))}</button>`;
    if (d === 'ringtone') { const cur = value(ctx, 'notifications_ringtone', window.SystemSounds?.DEFAULTS?.notifications || ''); return shell(S('Ringtone'), `<div class="mps-choices">${sounds().map(k => `<button data-action="gpp-tone" data-id="${e(k)}" role="radio" aria-checked="${cur === k}"><span>${e(soundName(k))}</span><i class="mps-radio${cur === k ? ' on' : ''}"></i></button>`).join('')}</div>`, cancel); }
    if (d === 'about') return shell(S('About Google+'), `<p>${e(VERSIONS[ctx.version])}</p>`, `<button data-action="gpp-cancel">${e(ctx.t('OK'))}</button>`);
    if (d === 'discard') return shell('', `<p>${e(S('Discard'))}?</p>`, `${cancel}<button data-action="gpp-discard-ok">${e(S('Discard'))}</button>`);
    if (d.startsWith?.('delete:')) return shell(S('Delete'), `<p>${e(S('Do you want to delete this post?'))}</p>`, `${cancel}<button data-action="gpp-delete-ok" data-id="${e(d.slice(7))}">${e(S('Delete'))}</button>`);
    return '';
  }
  // The screen when Google+ shows one of these (else null: the version draws its stream, home or other views).
  function render(ctx) {
    if (!ctx?.ui) return null;
    if (ctx.ui.gppPrefs) return settings(ctx);
    if (ctx.ui.gppDraft) return composer(ctx);
    return null;
  }
  const draft = ui => ui.gppDraft;
  // Delete's question over the stream (the composer and Settings draw their own dialogs).
  const overlay = ctx => ctx && String(ctx.ui.gppDialog || '').startsWith('delete:') ? dialog(ctx) : '';
  // ctx: {ui, data, t, S (gplus texts), version ('2.4' | '4.0' | '4.2.3' | '4.9'), me, account, now, locale, save, render,
  // bar({title, up, action}), thumb(i), openMessengerSettings()}.
  function handle(action, id, ctx) {
    const {ui, data} = ctx, prefs = () => (data.gplusPrefs ||= {});
    switch (action) {
      // New post / Write, or Photo (the picture strip open) / Check in, Location (the place attached).
      case 'gpp-new': ui.gppDraft = {text: '', photo: null, place: id === 'place' ? PLACE : '', picking: id === 'photo'}; ui.gppDialog = ''; break;
      case 'gpp-photo': ui.gppDraft.picking = !ui.gppDraft.picking; break;
      case 'gpp-photo-set': Object.assign(ui.gppDraft, {photo: Number(id), picking: false}); break;
      case 'gpp-photo-clear': ui.gppDraft.photo = null; break;
      case 'gpp-place': ui.gppDraft.place = ui.gppDraft.place ? '' : PLACE; break;
      case 'gpp-post': {
        const d = ui.gppDraft; if (!d || !(String(d.text || '').trim() || d.photo != null)) return true;
        data.gplusMyPosts = [{id: `p${Date.now()}`, text: String(d.text || '').trim().slice(0, 2000), photo: d.photo, place: d.place, at: Date.now()}, ...mine(data)];
        ui.gppDraft = null; ctx.save(); break;
      }
      case 'gpp-delete': ui.gppDialog = `delete:${id}`; break;
      case 'gpp-delete-ok': data.gplusMyPosts = mine(data).filter(p => p.id !== id); ui.gppDialog = ''; ctx.save(); break;
      case 'gpp-discard-ok': ui.gppDraft = null; ui.gppDialog = ''; break;
      case 'gpp-settings': ui.gppPrefs = 'root'; ui.gppDialog = ''; break;
      case 'gpp-pref': {
        const r = rows(ctx).find(x => x.key === id); if (!r) return true;
        if (r.open) ui.gppPrefs = r.open;
        else if (r.kind === 'check') { prefs()[id] = !value(ctx, id, r.def); ctx.save(); }
        else if (r.kind === 'tone') ui.gppDialog = 'ringtone';
        else if (id === 'about') ui.gppDialog = 'about';
        else if (id === 'messenger') { ui.gppPrefs = ''; ctx.openMessengerSettings(); return true; }
        break;
      }
      case 'gpp-tone': prefs().notifications_ringtone = id; ui.gppDialog = ''; ctx.save(); break;
      case 'gpp-cancel': ui.gppDialog = ''; break;
      default: return false;
    }
    ctx.render();
    return true;
  }
  // The text follows the field without a re-render; Share is enabled once there is something to post.
  function input(target) {
    if (!target.matches?.('[data-gpp-text]')) return false;
    const d = window.__gppUi?.gppDraft; if (d) d.text = target.value;
    const share = document.querySelector('.gpp-share'); if (share && d) share.disabled = !(target.value.trim() || d.photo != null);
    return true;
  }
  // Back: a dialog, the notifications page, Settings, then the post (Discard when something is written).
  function back(ui) {
    if (ui.gppDialog) { ui.gppDialog = ''; return true; }
    if (ui.gppPrefs === 'notifications') { ui.gppPrefs = 'root'; return true; }
    if (ui.gppPrefs) { ui.gppPrefs = ''; return true; }
    if (ui.gppDraft) { if (String(ui.gppDraft.text || '').trim() || ui.gppDraft.photo != null) ui.gppDialog = 'discard'; else ui.gppDraft = null; return true; }
    return false;
  }
  // The ui the text field writes to (the field has no context of its own).
  const bind = ui => { window.__gppUi = ui; };
  const open = ui => Object.assign(ui, {gppDraft: null, gppPrefs: '', gppDialog: ''});
  window.PlusPost = {render, overlay, posts, place, del, handle, input, back, open, bind, draft};
})();
