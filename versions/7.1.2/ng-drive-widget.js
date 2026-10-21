/* CakemixAppWidgetProvider / app_widget.xml: 56dp Widget.Container, 52dp
   action buttons, 18sp title and 10sp account name, exact HDPI artwork. */
(() => {
  'use strict';
  (NG.widgetViews ||= {})['drive-app_widget']={
    configure(c,it,done){c.dialog({title:NG.text('drive').t('select_account'),items:[{html:c.safe(NG.account.email)}],onItem(){it.accountEmail=NG.account.email;done(true);},onCancel:()=>done(false)});},
    render(c,it){const t=NG.text('drive'),b=(action,icon,key)=>`<button type="button" class="ngdv-wg-action" data-action="ngdvw-${action}" aria-label="${c.safe(t.t(key))}"><img src="assets/dv-widget-${icon}.png" alt=""></button>`;return `<div class="ngdv-widget np-dv-widget-background"><button type="button" class="ngdv-wg-home" data-action="ngdvw-home"><img src="assets/dv-widget-logo.png" alt=""><span><b>${c.safe(t.t('app_name_drive'))}</b><small>${c.safe(it.accountEmail||NG.account.email)}</small></span></button>${b('upload','upload','widget_upload')}${b('scan','scan','create_new_ocr_doc')}${b('new','new','menu_create_new_doc')}</div>`;},
    action(name,el,e,c){if(!name.startsWith('ngdvw-'))return false;const action=name.slice(6);if(action==='home')c.open('drive');else if(action==='new')c.open('drive','shortcut:create');else c.open('drive','shortcut:'+action);return true;}
  };
})();
