/* GoogleHelp and Google Feedback of PrebuiltGmsCore 9.8, opened by each app's Help & feedback (c.open('help', app)).
   gh_help_activity: the #e5e5e5 help console under a light header, gh_search_pane's "Search help" card
   (gh_card_background), the articles card with BROWSE ALL ARTICLES, gh_contact_card_fragment's Contact us with Send
   feedback; the search shows the server's "No results found." on this offline phone. The overflow has Version info
   (gh_version_dialog), Clear help history and View in Google Play Store. Send feedback opens feedback_ui under the
   gf_action_bar_fill #00bbd3 bar: the account, Write your feedback, Include system logs, the screenshot preview and Send. */
(() => {
  'use strict';
  const T=()=>NG.text('help'),t=k=>T().t(k),f=(k,...a)=>T().fmt(k,null,...a),E=(c,s)=>c.safe(s);
  const U=c=>c.ui.help ||= {app:'',route:'help',query:null,searched:'',text:'',logs:true};
  const appName=(c,id)=>{const d=NG.appsData?.[id];return d?.label?.[c.lang]||d?.label?.en||c.title(id);};
  function help(c){const u=U(c),name=appName(c,u.app);return `<div class="nghp"><header class="nghp-bar"><button type="button" class="nghp-icon" data-action="nghp-back" aria-label="${E(c,t('framework/action_bar_up_description'))}"><i class="nghp-up"></i></button><span>${E(c,t('gh_menu_help'))}</span>${NG.menu.button(c,'nghp-overflow',true)}</header><div class="nghp-console"><form class="nghp-search np-gh-card" data-form="nghp-search"><input name="query" value="${E(c,u.query||'')}" placeholder="${E(c,t('gh_default_help_box_string'))}" aria-label="${E(c,t('gh_default_help_box_string'))}" autocomplete="off">${u.query?`<button type="button" class="nghp-icon" data-action="nghp-clear" aria-label="${E(c,t('framework/ok'))}"><img src="assets/gh-search-clear.png" alt=""></button>`:''}</form>${u.searched?`<section class="nghp-card np-gh-card"><h2>${E(c,t('gh_help_search_title'))}</h2><p class="nghp-none">${E(c,t('gh_no_results_found'))}</p></section>`:''}<section class="nghp-card np-gh-card"><h2>${E(c,f('gh_hangout_product_specific_subtext',name))}</h2><button type="button" class="nghp-browse" data-action="nghp-browse">${E(c,t('gh_help_browse_all_articles_title'))}</button></section><section class="nghp-card np-gh-card"><h2>${E(c,t('gh_menu_feedback_and_support'))}</h2><button type="button" class="nghp-option" data-action="nghp-feedback"><img src="assets/gh-feedback.png" alt=""><span><b>${E(c,t('gh_menu_feedback'))}</b><small>${E(c,t('gh_feedback_wait_time'))}</small></span></button></section></div></div>`;}
  function feedback(c){const u=U(c);return `<div class="nghp nghp-fb"><header class="nghp-bar cyan"><button type="button" class="nghp-icon" data-action="nghp-back" aria-label="${E(c,t('framework/action_bar_up_description'))}"><i class="nghp-up"></i></button><span>${E(c,t('gf_report_feedback'))}</span><button type="button" class="nghp-icon" data-action="nghp-send" aria-label="${E(c,t('gf_action_send'))}"><i class="nghp-send"></i></button></header><div class="nghp-fbbody"><div class="nghp-account">${E(c,NG.account.email)}</div><textarea class="nghp-text" placeholder="${E(c,t('gf_enter_feedback'))}">${E(c,u.text)}</textarea><label class="nghp-check"><input type="checkbox"${u.logs?' checked':''}><span>${E(c,t('gf_include_private_data_logs_only'))}</span></label><button type="button" class="nghp-shot" data-action="nghp-preview"><span class="nghp-thumb"><img src="${E(c,NG.appsData?.[u.app]?.icon||'assets/gh-feedback.png')}" alt=""></span><span><b>${E(c,t('gf_touch_preview'))}</b><small>${E(c,t('gf_edit_screenshot'))}</small></span></button></div></div>`;}
  function back(c){const u=U(c);if(u.route==='feedback'){u.route='help';c.render();return true;}if(u.searched){u.searched='';u.query=null;c.render();return true;}return false;}
  NG.register('help',{
    render:c=>{const u=U(c);if(c.ui.sub){const fb=c.ui.sub.startsWith('feedback:'),app=fb?c.ui.sub.slice(9):c.ui.sub;if(app!==u.app||fb)Object.assign(u,{app,route:fb?'feedback':'help',query:null,searched:'',text:''});c.ui.sub='';}return u.route==='feedback'?feedback(c):help(c);},
    statusColor:c=>U(c).route==='feedback'?'#0097a7':'#bdbdbd',dialogAccent:()=> '#4285f4',
    back,
    mount(c,root){const u=U(c),q=root.querySelector('.nghp-search input');q?.addEventListener('input',()=>{u.query=q.value;});const txt=root.querySelector('.nghp-text');txt?.addEventListener('input',()=>{u.text=txt.value;});root.querySelector('.nghp-check input')?.addEventListener('change',e=>{u.logs=e.target.checked;});},
    submit(form,e,c){const u=U(c);u.query=new FormData(form).get('query')||'';u.searched=u.query.trim();c.render();},
    action(name,el,e,c){const u=U(c);
      if(name==='ng-menu'){c.menu([{label:t('gh_menu_version_info'),action:c=>c.dialog({title:appName(c,u.app),message:`${f('gh_subtitle_format_for_version_number',NG.appsData?.[u.app]?.version||'7.1.2')}\n${t('gh_copyright')}`,buttons:[{label:t('gf_ok')}]})},{label:t('gh_menu_print'),action:c=>{c.ui.printJob={title:f('gh_print_job_name',appName(c,u.app)),text:[f('gh_hangout_product_specific_subtext',appName(c,u.app)),'',t('gh_menu_feedback_and_support'),t('gh_menu_feedback'),t('gh_feedback_wait_time')].join('\n')};c.ui.print=null;c.open('print-preview');}},{label:t('gh_menu_clear_history'),action:c=>c.toast(t('gh_clear_history_announcement'))},...(NG.appsData?.[u.app]?.pkg?[{label:t('gh_menu_play_store'),action:c=>c.open('play-store','search:'+appName(c,u.app))}]:[])],el);return true;}
      if(!name.startsWith('nghp-'))return false;
      switch(name.slice(5)){
        case 'back':if(!back(c))c.back();return true;
        case 'clear':u.query='';u.searched='';break;
        case 'browse':c.open('chrome','url:https://support.google.com/');return true;
        case 'feedback':u.route='feedback';break;
        case 'preview':c.toast(t('gf_preview_screenshot'));return true;
        case 'send':if(!u.text.trim()){c.toast(t('gf_invalid_description_text'));return true;}u.text='';u.route='help';c.toast(t('gf_report_being_sent'));c.back();return true;
        default:return false;
      }c.render();return true;}
  });
})();
