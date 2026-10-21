/* Tycho K.2.7.20 (Project Fi). AccountDetailsActivity needs a Project Fi account; the demo Google account has none,
   so the app opens its activation flow in SuwThemeGlif.Light (setupwizardlib's suw_glif_template_compact, the
   google_blue_500 #4285f4 accent of DialogTheme.Glif): "Sign up for Project Fi" with the account it would use,
   fragment_account_chooser for "use a different account", and the sign-up page on the web. */
(() => {
  'use strict';
  const T=()=>NG.text('fi'),t=k=>T().t(k),E=(c,s)=>c.safe(s);
  const U=c=>c.ui.fi ||= {route:'signup',account:0};
  // The texts' own <a href=#clickify> link becomes the page's button, the rest stays text.
  const linked=(c,text,action)=>E(c,text).replace(/&lt;a href=#clickify&gt;(.*?)&lt;\/a&gt;/g,(_,label)=>`<button type="button" class="ngfi-link" data-action="${action}">${label}</button>`).replace(/&lt;br&gt;/g,'<br>');
  function page(c,title,body,buttons){return `<div class="ngfi"><div class="ngfi-scroll"><header><img src="assets/fi-logo.svg" alt=""><h1>${E(c,title)}</h1></header><div class="ngfi-content">${body}</div></div><footer class="ngfi-nav">${buttons}</footer></div>`;}
  function render(c){const u=U(c);
    if(u.route==='choose')return page(c,t('app_name'),`<p>${E(c,t('choose_account_body'))}</p><div class="ngfi-accounts">${[NG.account.email].map((email,i)=>`<label class="ngfi-radio"><input type="radio" name="account" checked><span>${E(c,email)}</span></label>`).join('')}</div>`,`<button type="button" data-action="ngfi-back">${E(c,t('cancel'))}</button><button type="button" class="primary" data-action="ngfi-next">${E(c,t('next'))}</button>`);
    return page(c,t('activation_sign_up_title'),`<p>${linked(c,T().fmt('activation_sign_up_or_retry',null,NG.account.email),'ngfi-choose')}</p>`,`<span></span><button type="button" class="primary" data-action="ngfi-web">${E(c,t('activation_sign_up_on_web'))}</button>`);}
  NG.register('project-fi',{render,statusColor:()=> '#e0e0e0',dialogAccent:()=> '#4285f4',
    back(c){const u=U(c);if(u.route!=='signup'){u.route='signup';c.render();return true;}return false;},
    action(name,el,e,c){const u=U(c);if(!name.startsWith('ngfi-'))return false;
      switch(name.slice(5)){
        case 'choose':u.route='choose';break;
        case 'next':case 'back':u.route='signup';break;
        case 'web':c.open('chrome','url:https://fi.google.com/');return true;
        default:return false;
      }c.render();return true;}
  });
})();
