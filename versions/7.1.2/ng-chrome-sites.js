/* Chrome 55 SingleCategoryPreferences / SingleWebsitePreferences, N2G48C.
   website_preferences.xml supplies the switch, cookie/vibration checkboxes and allow/block
   groups. single_website_preferences.xml supplies per-site permission lists and Clear & reset. */
(() => {
  'use strict';
  const P=()=>NG.text('appprefs'),T=()=>NG.text('chrome-sites'),t=k=>T().t(k),C=NG.chromeSiteCategories;
  const S=c=>NG.chromeState(c).siteSettings ||= {defaults:{},sites:{}};
  const U=c=>c.ui.chromeSite ||= {category:'cookies',site:''};
  const label=key=>C[key]?P().t('Chrome/'+C[key][0]):t(key==='use_storage'?'website_settings_storage':key==='usb'?'website_settings_usb':'all_sites');
  const base=key=>C[key]?.[1].endsWith('_ask')?'ask':key==='popups'?'block':'allow';
  function permission(c,key,host='') {
    const s=S(c);if(s.sites[host]?.[key])return s.sites[host][key];
    for(const [pattern,values]of Object.entries(s.sites).sort((a,b)=>b[0].length-a[0].length))if(pattern.startsWith('[*.]')&&(host===pattern.slice(4)||host.endsWith('.'+pattern.slice(4)))&&values[key])return values[key];
    return s.defaults[key]||base(key);
  }
  const modeText=mode=>mode==='ask'?t('website_settings_category_ask'):t('website_settings_permissions_'+(mode==='block'?'block':'allow'));
  const row=(c,title,summary,action,data='',widget='',disabled=false)=>NG.settingsRow(c,{title,summary,action,data,widget,disabled});
  function category(c,key){U(c).category=key;NG.appPrefsGo(c,'site-category',label(key));}
  function site(c,host){U(c).site=host;NG.appPrefsGo(c,'single-site',host);}
  function normalize(text){const raw=String(text).trim().toLowerCase(),wild=raw.startsWith('[*.]'),input=wild?raw.slice(4):raw;try{const u=new URL(input.includes('://')?input:'https://'+input);if(!/^[a-z0-9.-]+$/.test(u.hostname)||!u.hostname.includes('.')||u.username||u.password)return '';return (wild?'[*.]':'')+u.host;}catch{return '';}}
  function add(c){
    let host='';
    c.dialog({title:t('website_settings_add_site_dialog_title'),html:`<div class="ngst-edit"><input class="ngst-input" placeholder="${c.safe(t('website_settings_add_site_site_url'))}" autocomplete="off"></div>`,
      mount(c,win){const input=win.querySelector('input'),button=win.querySelector('[data-index="1"]');button.disabled=true;input.addEventListener('input',e=>{host=e.target.value;button.disabled=!normalize(host);});},
      buttons:[{label:t('framework/cancel')},{label:t('website_settings_add_site_add_button'),action:c=>{const name=normalize(host);if(!name)return;const key=U(c).category;(S(c).sites[name] ||= {})[key]=permission(c,key)==='block'?'allow':'block';c.save();c.render();}}]});
  }
  function choose(c,key,host){const modes=base(key)==='ask'?['allow','block','ask']:['allow','block'];NG.appPrefsChoose(c,label(key),modes.map(modeText),modes.indexOf(permission(c,key,host)),(c,i)=>{(S(c).sites[host] ||= {})[key]=modes[i];c.save();c.render();},'#4285f4');}
  function reset(c,host){c.dialog({title:t('website_reset'),message:t('webstorage_clear_data_dialog_message'),buttons:[{label:t('framework/cancel')},{label:t('webstorage_clear_data_dialog_ok_button'),action:c=>{delete S(c).sites[host];c.save();c.render();}}]});}
  NG.chromePermission=(c,key,url)=>{let host='';try{host=new URL(url).host;}catch{}return permission(c,key,host);};
  NG.chromeOpenSite=(c,url)=>{let host='';try{host=new URL(url).host;}catch{}if(!host){NG.openPrefs(c,'chrome','site_settings_preferences',NG.text('chrome').t('page_info_site_settings_button'));return;}U(c).site=host;NG.openPrefs(c,'chrome','single-site',host);};
  const hooks=NG.appPrefsHooks.chrome,oldClick=hooks.click,oldSummary=hooks.summary;
  hooks.hide=(c,key)=>key==='saved_passwords'||key==='sign_in'&&NG.chromeState(c).signedIn;
  hooks.summary=(c,key,node)=>C[key]?P().t('Chrome/'+(permission(c,key)==='block'?'website_settings_category_blocked':permission(c,key)==='ask'?'website_settings_category_ask':'website_settings_category_allowed')):oldSummary(c,key,node);
  hooks.click=(c,key,node)=>{if(C[key]||['all_sites','use_storage','usb'].includes(key)){category(c,key);return true;}if(key==='media'){NG.appPrefsGo(c,'site-media',t('media_permission_title'));return true;}return oldClick(c,key,node);};
  hooks.customs={...(hooks.customs||{}),
    'site-category':{render(c){
      const key=U(c).category,s=S(c);if(key==='usb')return `<div class="ngst-emptyview center">${c.safe(t('website_settings_usb_no_devices'))}</div>`;
      const hosts=Object.keys(s.sites).filter(host=>['all_sites','use_storage'].includes(key)||s.sites[host][key]).sort();
      let html='';if(C[key]){
        const on=permission(c,key)!=='block';html+=row(c,label(key),modeText(permission(c,key)),'ngcs-toggle','',NG.settingsSwitch(on));
        if(key==='cookies')html+=row(c,t('allow_third_party_cookies_title'),t('allow_third_party_cookies_summary'),'ngcs-extra',' data-permission="third_party_cookies"',`<i class="ngst-check${s.defaults.third_party_cookies!==false?' on':''}"></i>`,!on);
        if(key==='notifications')html+=row(c,t('enable_notifications_vibrate_title'),t('enable_notifications_vibrate_summary'),'ngcs-extra',' data-permission="notifications_vibrate"',`<i class="ngst-check${s.defaults.notifications_vibrate!==false?' on':''}"></i>`,!on);
        for(const mode of ['allow','block','ask']){const group=hosts.filter(host=>permission(c,key,host)===mode);if(group.length)html+=NG.settingsCat(c,modeText(mode))+group.map(host=>row(c,host,'','ngcs-site',` data-site="${c.safe(host)}"`)).join('');}
        html+=row(c,t('website_settings_add_site'),'','ngcs-add');
      }else html=hosts.map(host=>row(c,host,'','ngcs-site',` data-site="${c.safe(host)}"`)).join('');
      return html;
    },action(c,name,el){if(name==='ngcs-toggle'){const key=U(c).category;S(c).defaults[key]=permission(c,key)==='block'?(base(key)==='ask'?'ask':'allow'):'block';c.save();c.render();return true;}if(name==='ngcs-extra'){const key=el.dataset.permission;S(c).defaults[key]=S(c).defaults[key]===false;c.save();c.render();return true;}if(name==='ngcs-site'){site(c,el.dataset.site);return true;}if(name==='ngcs-add'){add(c);return true;}return false;}},
    'single-site':{render(c){const host=U(c).site;return NG.settingsCat(c,t('website_settings_site_category'))+row(c,host,'','')+NG.settingsCat(c,t('website_settings_permissions_category'))+Object.keys(C).map(key=>row(c,label(key),modeText(permission(c,key,host)),'ngcs-permission',` data-permission="${key}"`)).join('')+row(c,t('website_reset'),'','ngcs-reset');},action(c,name,el){if(name==='ngcs-permission'){choose(c,el.dataset.permission,U(c).site);return true;}if(name==='ngcs-reset'){reset(c,U(c).site);return true;}return false;}},
    'site-media':{render:c=>['camera','microphone','protected_content','autoplay'].map(key=>row(c,label(key),modeText(permission(c,key)),'ngcs-media',` data-permission="${key}"`)).join(''),action(c,name,el){if(name!=='ngcs-media')return false;category(c,el.dataset.permission);return true;}}
  };
})();
