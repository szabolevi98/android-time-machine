/* TODO */
'use strict';
LP.define(['email', 'gmail'], ({
  clone, emailData, i18n, overlayRoot, render, renderOverlay, save, toast, ui, viewport
}, lp) => {
  function renderEmail() {
    if (ui.sub === 'em-settings') return EmailPrefs.render(lp.data, ui, i18n.language, key => i18n.t(key), ICSEmail.account);
    return LPEmail.render(lp.data.mailbox,ui,key=>i18n.t(key),i18n.locale(),i18n.language,{app:'email',accountName:'Nexus 6'});
  }
  const mailbox = () => ui.view === 'gmail' ? lp.data.gmailbox : lp.data.mailbox;
  const gmailOptions = () => GmailApp.options(lp.data, ui, i18n.language, key => KKEmail.tr(i18n.language, key, 'gmail'));
  function renderGmail() { if (ui.sub === 'gm-settings') return GmailApp.settings(lp.data, ui, i18n.language, key => i18n.t(key)); return LPEmail.render(lp.data.gmailbox, ui, key => i18n.t(key), i18n.locale(), i18n.language, gmailOptions()); }
  // Each mail app keeps its own folder, conversation and selection.
  function useMailApp(app) {
    if (ui.mailApp === app) return;
    ui.mailStates ||= {};
    if (ui.mailApp) ui.mailStates[ui.mailApp] = {folder: ui.emailFolder, id: ui.emailId};
    const state = ui.mailStates[app] || {folder: app === 'gmail' ? 'Primary' : 'Inbox', id: null};
    ui.emailFolder = state.folder; ui.emailId = state.id; ui.emailSelected = []; ui.emailQuery = undefined; ui.mailApp = app;
  }
  function composeEmail(source=null,forward=false,to='') {
    const draft=ICSEmail.draft(source,forward);if(to)draft.to=to;
    if(ui.view==='gmail'){draft.from=draft.address=GmailApp.account;}
    // Gmail's signature preference (gmail.js): "\n\n%s" after what the message starts with.
    // The Email account's signature (email-prefs.js): R.string.signature, "\n\n%s", before what the message starts with.
    if(ui.view!=='gmail'&&EmailPrefs.signatureBody(lp.data))draft.body=EmailPrefs.signatureBody(lp.data)+(draft.body?'\n\n'+draft.body:'');
    if(ui.view==='gmail'&&lp.data.gmailPrefs?.signature)draft.body='\n\n'+lp.data.gmailPrefs.signature+(draft.body?'\n\n'+draft.body:'');
    mailbox().unshift(draft);ui.emailId=draft.id;ui.emailCc=false;ui.emailError='';ui.overlay='';ui.sub='compose';save();render();
  }
  Object.assign(lp, {composeEmail, mailbox});
  // lp:code
  return {
    // lp:hooks
    input(event) {
      if(event.target.closest('.email-compose')&&event.target.name){const item=mailbox().find(item=>item.id===ui.emailId);if(item){item[event.target.name]=event.target.value;save();}return true;}
      if (event.target.matches('[data-gmail-signature]')) { ui.gmSignature = event.target.value; return true; }
      // lp:input
      return false;
    },
    clearData(c, id) {
      if(id==='gmail'){lp.data.gmailbox=GmailApp.restore(null);delete lp.data.gmailWelcomeSeen;delete lp.data.gmailTeaserDismissed;delete lp.data.gmailSeen;if(ui.mailApp==='gmail'){ui.emailFolder='Primary';ui.emailSelected=[];}}
      if(id==='email'){lp.data.mailbox=ICSEmail.restore(null,emailData,[]);lp.data.sentEmails=[];ui.emailFolder='Inbox';ui.emailQuery=undefined;ui.emailSelected=[];}
      // lp:clearData
      return false;
    },
    overlay(name, root) {
      if (ui.overlay.startsWith('email-')) {
        overlayRoot.innerHTML = LPEmail.overlay(mailbox(),ui,lp.data.photos,key=>i18n.t(key),i18n.language,ui.view==='gmail'?gmailOptions():{app:'email'});
        return true;
      }
      // lp:overlay
      return false;
    },
    back() {
      if (ui.view === 'gmail' && ui.sub === 'gm-settings' && GmailApp.prefBack(ui, {data: lp.data, root: viewport, toast})) { render(); return true; }
      if (ui.view === 'gmail' && ui.sub === 'gm-settings') { if (ui.gmPrefList || ui.gmSignature !== undefined) { ui.gmPrefList = ''; ui.gmSignature = undefined; } else if (ui.gmPref === 'categories') ui.gmPref = 'account'; else if (ui.gmPref) ui.gmPref = ''; else ui.sub = ''; render(); return true; }
      // lp:back
      return false;
    },
    backEmailPrefs() {
      if (ui.view === 'email' && ui.sub === 'em-settings' && !ui.overlay) { if (ui.emPrefList || ui.emPrefEdit) { ui.emPrefList = ''; ui.emPrefEdit = ''; ui.emPrefTone = undefined; window.SystemSounds?.stop(); } else if (ui.emPref) ui.emPref = EmailPrefs.parent(ui.emPref); else ui.sub = ''; render(); return true; }
      // lp:backEmailPrefs
      return false;
    },
    opening(app) {
      if (app === 'email' || app === 'gmail') useMailApp(app);
      // lp:opening
      return false;
    },
    render() {
      if (ui.view === 'gmail') return renderGmail();
      return renderEmail();
      // lp:render
    },
    click(action, button, event) {
      const {id, app, url} = button.dataset;
      if (action.startsWith('gmx-') && GmailApp.handlePref(action, id, {data: lp.data, ui, save, render, toast, root: viewport})) return;
      if (action.startsWith('empx-') && EmailPrefs.handle(action, id, {data: lp.data, ui, save, render, root: viewport, account: ICSEmail.account})) return;
      // lp:click
      switch (action) {
        // The Email app's settings (email-prefs.js, from the image's EmailGoogle preference XMLs).
        case 'emailpref-page': ui.emPref = id; render(); break;
        case 'emailpref-toggle': (lp.data.emailPrefs ||= {})[id] = !EmailPrefs.value(lp.data, id, ICSEmail.account); save(); render(); break;
        case 'emailpref-list': ui.emPrefList = id; render(); break;
        case 'emailpref-pick': { const [key, value] = id.split(':'); (lp.data.emailPrefs ||= {})[key] = Number(value); ui.emPrefList = ''; save(); render(); break; }
        case 'emailpref-edit': ui.emPrefEdit = id; ui.emPrefEditValue = undefined; render(); viewport.querySelector('[data-email-pref-edit]')?.focus(); break;
        case 'emailpref-save': { const field = viewport.querySelector('[data-email-pref-edit]'); if (ui.emPrefEdit && field) { (lp.data.emailPrefs ||= {})[ui.emPrefEdit] = field.value.trim(); save(); } ui.emPrefEdit = ''; render(); break; }
        case 'emailpref-close': ui.emPrefList = ''; ui.emPrefEdit = ''; ui.emPrefTone = undefined; window.SystemSounds?.stop(); render(); break;
        case 'emailpref-unsupported': toast('This feature is not part of the simulator.'); break;
        case 'email-read': {const item=mailbox().find(item=>item.id===id);if(!item)break;if(ui.view==='gmail')lp.data.gmailWelcomeSeen=true;ui.emailId=id;item.read=true;ui.sub=item.folder==='Drafts'?'compose':'read';ui.emailError='';save();render();break;}
        case 'email-compose': composeEmail();break;
        case 'email-reply': case 'email-forward': composeEmail(mailbox().find(item=>item.id===ui.emailId),action==='email-forward');break;
        case 'email-list': ui.sub='';ui.overlay='';ui.emailSelected=[];render();break;
        case 'email-folders': case 'email-menu': ui.emailMenu=id||'list';ui.overlay=action;renderOverlay();break;
        // 4.4 Email (UnifiedEmail): the folder drawer, Save draft, Reply all, Move to and the menu entries without a screen.
        case 'email-drawer': ui.overlay='email-drawer';renderOverlay();break;
        case 'email-save': ui.sub='';ui.overlay='';ui.emailSelected=[];render();toast(KKEmail.tr(i18n.language,'Message saved as draft.',ui.view==='gmail'?'gmail':'email'));break;
        case 'email-reply-all': ui.overlay='';composeEmail(mailbox().find(item=>item.id===ui.emailId),false);break;
        case 'email-move': {const item=mailbox().find(item=>item.id===ui.emailId);if(item){if(id==='Trash')ICSEmail.trash(mailbox(),[item.id]);else{item.folder=id;delete item.previousFolder;}}ui.overlay='';ui.sub='';save();render();break;}
        case 'email-unavailable': ui.overlay='';renderOverlay();toast('This feature is not part of the simulator.');break;
        // Gmail's Print: the open message (sender, date, subject over the body) as the job.
        case 'email-print': { const m = (lp.data.mailbox || []).find(x => x.id === ui.emailId) || (lp.data.gmailbox || []).find(x => x.id === ui.emailId); ui.overlay=''; renderOverlay(); if (!m) break; PrintSpooler.open(lp.printContext(), {name: m.subject || '', title: m.subject || '', lines: [m.from || '', m.time || '', ...String(m.body || '').split('\n')].filter(Boolean)}); break; }
        case 'email-folder': if(ui.view==='gmail'){lp.data.gmailSeen={...lp.data.gmailSeen,[id]:Date.now()};save();}ui.emailFolder=id;ui.sub='';ui.emailQuery=undefined;ui.emailSelected=[];ui.overlay='';render();break;
        case 'email-star': {const item=mailbox().find(item=>item.id===id);if(item)item.starred=!item.starred;ui.overlay='';renderOverlay();save();render();break;}
        case 'email-empty-trash': ui.overlay='email-empty-trash';renderOverlay();break;
        case 'email-empty-trash-ok': {const box=mailbox();for(let i=box.length-1;i>=0;i--)if(box[i].folder==='Trash')box.splice(i,1);ui.overlay='';renderOverlay();save();render();break;}
        case 'email-select': ui.emailSelected ||= [];ui.emailSelected=ui.emailSelected.includes(id)?ui.emailSelected.filter(key=>key!==id):[...ui.emailSelected,id];render();break;
        case 'email-clear-selection': ui.emailSelected=[];render();break;
        case 'email-trash': case 'email-selected-trash': ICSEmail.trash(mailbox(),action==='email-trash'?[ui.emailId]:ui.emailSelected||[]);ui.sub='';ui.emailSelected=[];save();render();break;
        case 'email-restore': case 'email-selected-restore': {const ids=action==='email-restore'?[ui.emailId]:ui.emailSelected||[];mailbox().filter(item=>ids.includes(item.id)).forEach(ICSEmail.untrash);ui.sub='';ui.emailSelected=[];save();render();break;}
        case 'email-selected-read': mailbox().filter(item=>(ui.emailSelected||[]).includes(item.id)).forEach(item=>item.read=true);ui.emailSelected=[];save();render();break;
        case 'email-unread': {const item=mailbox().find(item=>item.id===ui.emailId);if(item)item.read=false;ui.sub='';ui.overlay='';save();render();break;}
        case 'email-search': ui.emailQuery='';render();viewport.querySelector('[data-form="email-search"] input')?.focus();break;
        case 'email-refresh': toast('Local mailbox is up to date');break;
        case 'email-cc': ui.emailCc=true;ui.overlay='';render();break;
        case 'email-attach': ui.overlay='email-attach';renderOverlay();break;
        case 'email-attach-photo': {const item=mailbox().find(item=>item.id===ui.emailId),photo=lp.data.photos.find(photo=>photo.id===Number(id));if(item&&photo)item.attachment=clone(photo);ui.overlay='';save();render();break;}
        case 'email-remove-attachment': {const item=mailbox().find(item=>item.id===ui.emailId);if(item)delete item.attachment;save();render();break;}
        case 'email-attach-file': lp.docPick(ui.view, '*/*'); break;
        case 'email-remove-file': {const item=mailbox().find(item=>item.id===ui.emailId);if(item?.files)item.files.splice(Number(id),1);save();render();break;}
        case 'email-discard': ui.overlay='email-discard';renderOverlay();break;
        case 'email-confirm-discard': ICSEmail.trash(mailbox(),[ui.emailId]);ui.sub='';ui.overlay='';save();render();break;
        // Gmail: Archive leaves the inbox (the conversation stays in All mail); tips and teaser links.
        case 'email-archive': case 'email-selected-archive': {const ids=action==='email-archive'?[ui.emailId]:ui.emailSelected||[];mailbox().filter(item=>ids.includes(item.id)&&item.folder==='Inbox').forEach(item=>{item.folder='Archive';});ui.sub='';ui.emailSelected=[];save();render();break;}
        case 'email-dismiss-teaser': if(ui.view==='gmail')lp.data.gmailTeaserDismissed=true;else lp.data.emailTeaserDismissed=true;save();render();break;
        // Gmail settings (gmail.js GmailApp.settings); Email's own settings are not simulated.
        case 'email-settings': ui.overlay = ''; renderOverlay(); if (ui.view === 'gmail') { ui.sub = 'gm-settings'; ui.gmPref = ''; } else { ui.sub = 'em-settings'; ui.emPref = ''; } render(); break;
        case 'gmail-categories': ui.sub = 'gm-settings'; ui.gmPref = 'categories'; render(); break;
        case 'gmail-pref': if (id.startsWith('label:')) ui.gmLabelFrom = ui.gmPref || 'account'; ui.gmPref = id; render(); break;
        case 'gmail-pref-toggle': { const prefs = lp.data.gmailPrefs ||= {}; const fallback = id.startsWith('category-') ? !['updates', 'forums'].includes(id.slice(9)) : !['reply-all', 'starred'].concat(['confirm-delete', 'confirm-archive', 'confirm-send']).includes(id); prefs[id] = !(prefs[id] ?? fallback); save(); render(); break; }
        case 'gmail-pref-list': ui.gmPrefList = id; render(); break;
        case 'gmail-pref-pick': { const [key, value] = id.split(':'); (lp.data.gmailPrefs ||= {})[key] = Number(value); ui.gmPrefList = ''; save(); render(); break; }
        case 'gmail-pref-close': ui.gmPrefList = ''; ui.gmSignature = undefined; render(); break;
        case 'gmail-signature': ui.gmSignature = (lp.data.gmailPrefs || {}).signature || ''; render(); viewport.querySelector('[data-gmail-signature]')?.focus(); break;
        case 'gmail-signature-save': { const text = viewport.querySelector('[data-gmail-signature]')?.value ?? ui.gmSignature ?? ''; (lp.data.gmailPrefs ||= {}).signature = String(text).trim(); ui.gmSignature = undefined; save(); render(); break; }
        case 'gmail-noop': break;
        case 'gmail-unavailable': toast(i18n.t('This feature is not part of the simulator.'));break;
        // lp:cases
        default: return false;
      }
      return true;
    },
    submit(name, values, event, form) {
      switch (name) {
        case 'email': {const item=mailbox().find(item=>item.id===ui.emailId);if(!item)break;for(const key of ['to','cc','bcc','subject','body'])if(values.has(key))item[key]=String(values.get(key)).trim();if(!ICSEmail.send(item)){ui.emailError='Enter valid email addresses';save();render();break;}save();ui.emailFolder='Sent';ui.emailQuery=undefined;ui.sub='read';ui.emailError='';render();toast('Demo email sent');break;}
        case 'email-search': ui.emailQuery=String(values.get('query')||'').trim();ui.emailSelected=[];render();break;
        // lp:scases
        default: return false;
      }
      return true;
    }
  };
});
