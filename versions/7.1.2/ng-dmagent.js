/* DMAgent 7.05 (Device Policy) / DMAgentTheme: DMAgent.Toolbar in color/theme #3aa3db, colorPrimaryDark #0099cc.
   DMAgentActivity finds no Google Apps for Business, Education or Government account on the demo phone, so it shows
   add_account_activity (FullViewLayout 19 / 14 dp, the example address in #777777, the bordered bottom bar with Add
   account), which opens Settings' Add an account. */
(() => {
  'use strict';
  const T=()=>NG.text('dmagent'),t=k=>T().t(k),E=(c,s)=>c.safe(s);
  NG.register('device-policy',{statusColor:()=> '#0099cc',dialogAccent:()=> '#3aa3db',
    render:c=>`<div class="ngdm"><header class="ngdm-bar">${E(c,t('app_name'))}</header><div class="ngdm-scroll"><p>${E(c,t('no_apps_account'))}</p><p>${E(c,t('add_apps_account'))}</p><p class="ngdm-example">${E(c,t('apps_account_example'))}</p></div><footer class="ngdm-foot"><button type="button" data-action="ngdm-add">${E(c,t('button_add_account'))}</button></footer></div>`,
    action(name,el,e,c){if(name!=='ngdm-add')return false;c.open('settings','add-account');return true;}
  });
})();
