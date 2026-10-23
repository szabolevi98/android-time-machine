/* N2G48C talkback.apk 5.0.4: TalkBackPreferencesActivity, its gesture/keyboard,
   label and tutorial activities, and SwitchAccessPreferenceActivity. Native
   preference XML/text/theme are generated from this APK. The two keymaps and
   tutorial.json come from its own code/resources (ng-accessibility-data.js).
   Speech and switch input use browser events; Android's accessibility service
   and hardware sensor backends are not emulated. */
(() => {
  'use strict';
  const T = () => NG.text('appprefs'), t = k => ['cancel','yes'].includes(k) ? NG.text('settings').t('framework/'+(k==='yes'?'ok':k)) : T().t('talkback/' + k);
  const fmt = (k, ...args) => T().fmt('talkback/' + k, null, ...args);
  const plural = (k, n, ...args) => T().plural('talkback/' + k, n, null, ...args);
  const prefs = c => (c.data.appPrefs ||= {}).talkback ||= {};
  const get = (c, key, fallback) => prefs(c)[key] ?? fallback;
  const put = (c, key, value) => { prefs(c)[key] = value; c.save(); };
  const active = c => !!c.data.settings.a11y?.a11y_talkback;
  const keymap = c => get(c, 'pref_select_keymap', 'classic_keymap');
  const maps = () => NG.accessibilityData.keymaps;
  const keyXml = c => keymap(c) === 'default_keymap' ? 'default_key_combo_preferences' : 'key_combo_preferences';
  const allNodes = n => [n, ...(n.c || []).flatMap(allNodes)];
  // TalkBackDumpAccessibilityEventFragment populates its empty XML at runtime.
  // AccessibilityEventUtils.getAllEventTypes is alphabetical by eventTypeToString;
  // these API-25 developer labels intentionally stay English in every locale.
  const eventNames=['VIEW_CLICKED','VIEW_LONG_CLICKED','VIEW_SELECTED','VIEW_FOCUSED','VIEW_TEXT_CHANGED','WINDOW_STATE_CHANGED','NOTIFICATION_STATE_CHANGED','VIEW_HOVER_ENTER','VIEW_HOVER_EXIT','TOUCH_EXPLORATION_GESTURE_START','TOUCH_EXPLORATION_GESTURE_END','WINDOW_CONTENT_CHANGED','VIEW_SCROLLED','VIEW_TEXT_SELECTION_CHANGED','ANNOUNCEMENT','VIEW_ACCESSIBILITY_FOCUSED','VIEW_ACCESSIBILITY_FOCUS_CLEARED','VIEW_TEXT_TRAVERSED_AT_MOVEMENT_GRANULARITY','GESTURE_DETECTION_START','GESTURE_DETECTION_END','TOUCH_INTERACTION_START','TOUCH_INTERACTION_END','WINDOWS_CHANGED','VIEW_CONTEXT_CLICKED','ASSIST_READING_CONTEXT'];
  const eventPrefs=[14,24,19,18,6,10,9,21,20,15,16,0,23,3,7,8,1,12,2,4,13,17,22,11,5].map(i=>({t:'CheckBoxPreference',key:'pref_dump_event_'+2**i,title:'TYPE_'+eventNames[i],defaultValue:'false'}));
  NG.appPrefsXml.talkback.xml.dump_events_preferences.c=eventPrefs;
  const find = (app, key) => Object.values(NG.appPrefsXml[app].xml).flatMap(allNodes).find(n => n.key === key);
  const title = n => NG.appPrefStr(n?.title);
  const defaultCombo = (c, key) => maps()[keymap(c)][key] || null;
  const combo = (c, key) => get(c, keymap(c) + ':' + key, defaultCombo(c, key));
  const trigger = c => keymap(c) === 'default_keymap' ? (get(c, 'pref_default_keymap_trigger_modifier', 'trigger_modifier_alt') === 'trigger_modifier_alt' ? 2 : 65536) : 0;
  const keyName = code => code >= 29 && code <= 54 ? String.fromCharCode(65 + code - 29) : code >= 7 && code <= 16 ? String(code - 7) :
    ({19:t('keycombo_key_arrow_up'),20:t('keycombo_key_arrow_down'),21:t('keycombo_key_arrow_left'),22:t('keycombo_key_arrow_right'),61:t('name_of_tab_key'),62:t('name_of_space_bar'),66:t('name_of_enter_key'),67:'Backspace',69:'−',70:'=',76:'/'})[code] || String(code);
  function describe(pair, extra = 0) {
    if (!pair) return t('keycombo_unassigned');
    const mods = pair[0] | extra;
    return [[4096,'ctrl'],[2,'alt'],[1,'shift'],[65536,'meta']].filter(([bit]) => mods & bit).map(([,name]) => t('keycombo_key_modifier_' + name)).concat(keyName(pair[1])).join(' + ');
  }
  function eventCombo(e) {
    const code = /^Key[A-Z]$/.test(e.code) ? e.code.charCodeAt(3) - 65 + 29 : /^Digit[0-9]$/.test(e.code) ? +e.code.slice(5) + 7 :
      ({ArrowUp:19,ArrowDown:20,ArrowLeft:21,ArrowRight:22,Tab:61,Space:62,Enter:66,Backspace:67,Minus:69,Equal:70,Slash:76})[e.code];
    return code ? [(e.ctrlKey?4096:0)|(e.altKey?2:0)|(e.shiftKey?1:0)|(e.metaKey?65536:0),code] : null;
  }
  function confirm(c, heading, message, yes, fn) {
    c.dialog({title:t(heading),message:t(message),buttons:[{label:t('cancel')},{label:t(yes),action:fn}]});
  }
  // One capture handler; an abandoned/closed dialog can never keep intercepting keys.
  let capture = null;
  document.addEventListener('keydown', e => {
    if (!capture) return;
    if (capture.c.ui.overlay !== 'dialog' || capture.c.ui.dialogSpec !== capture.spec) { capture = null; return; }
    capture.key(e);
  }, true);
  function assign(c, n, switches = false) {
    let list = switches ? c.clone(get(c, n.key, [])) : combo(c, n.key);
    const instruction = switches ? t('key_combo_preference_instructions') : keymap(c) === 'default_keymap' ? fmt('keycombo_assign_dialog_default_keymap_instruction', t('keycombo_key_modifier_' + (trigger(c) === 2 ? 'alt' : 'meta'))) : t('keycombo_assign_dialog_instruction');
    let view;
    const show = () => { if (view) view.textContent = switches ? list.map(x=>describe(x)).join('\n') || t('no_key_assigned') : describe(list,trigger(c)); };
    const save = () => {
      if (!switches && list) {
        const other = Object.keys(maps()[keymap(c)]).find(k=>k!==n.key && JSON.stringify(combo(c,k))===JSON.stringify(list));
        if (other) { c.toast(fmt('toast_msg_key_already_assigned',describe(list,trigger(c)),title(find('talkback',other)))); return false; }
      }
      put(c, switches ? n.key : keymap(c)+':'+n.key, list); c.closeDialog(); c.render(); return true;
    };
    const spec = {title:title(n),message:instruction,html:`<div class="ngax-keyvalue" tabindex="0"></div><button class="ngax-textbutton ngax-clear" type="button">${c.safe(t(switches?'key_combo_preference_reset_button':'keycombo_assign_dialog_clear'))}</button>`,buttons:[{label:t('cancel')},{label:t('save'),action:()=>save()}],
      mount(c, win) { view=win.querySelector('.ngax-keyvalue');show();win.querySelector('.ngax-clear').onclick=()=>{list=switches?[]:null;show();};view.focus(); }};
    // Keep the dialog visible on an invalid shortcut or duplicate assignment.
    spec.buttons[1].action=()=>{if(!save())c.dialog(spec);};
    c.dialog(spec);
    capture={c,spec,key(e){
      if(e.key==='Escape')return;
      if(!switches&&e.key==='Enter'&&!e.altKey&&!e.ctrlKey&&!e.metaKey){e.preventDefault();e.stopImmediatePropagation();save();return;}
      if(!switches&&e.key==='Backspace'&&!e.altKey&&!e.ctrlKey&&!e.metaKey){e.preventDefault();e.stopImmediatePropagation();list=null;show();return;}
      const pair=eventCombo(e);if(!pair)return;
      if(switches&&[19,20,21,22].includes(pair[1]))return;
      e.preventDefault();e.stopImmediatePropagation();
      if(switches){
        const other=allNodes(NG.appPrefsXml.switchaccess.xml.switch_access_preferences).find(x=>x.t==='KeyComboPreference'&&x.key!==n.key&&get(c,x.key,[]).some(v=>JSON.stringify(v)===JSON.stringify(pair)));
        if(other){c.toast(fmt('toast_msg_key_already_assigned',describe(pair),title(other)));return;}
        const i=list.findIndex(v=>JSON.stringify(v)===JSON.stringify(pair));if(i<0)list.push(pair);else list.splice(i,1);
      }else{
        const tr=trigger(c);if(tr?!(pair[0]&tr):!(pair[0]&4098)||!!(pair[0]&~4099))return;
        list=[pair[0]&~tr,pair[1]];
      }
      show();
    }};
  }
  function tutorial(c) {
    const off=!active(c), explore=get(c,'pref_explore_by_touch_reflect',true);
    if(off||!explore){const prefix=off?'tutorial_service_inactive':'tutorial_no_touch_explore';c.dialog({title:t(prefix+'_title'),message:t(prefix+'_message'),buttons:[{label:t('yes')}]});return;}
    c.ui.accessibilityTutorial={lesson:-1,page:0};NG.appPrefsGo(c,'@tutorial');
  }
  function speak(c,text){
    if(!window.speechSynthesis||!window.SpeechSynthesisUtterance)return;
    const voice=new SpeechSynthesisUtterance(text);voice.lang=c.locale();voice.volume=+get(c,'pref_speech_volume','100')/100;
    voice.rate=Math.max(.1,Math.min(3,(c.data.settings.ttsRate||100)/100));speechSynthesis.cancel();speechSynthesis.speak(voice);
  }
  function tutorialMenu(c){
    const u=c.ui.accessibilityTutorial,local=u.lesson===3||u.page===1||u.localPractice;
    const items=local?['default','character','word','line','paragraph'].map(k=>({html:c.safe(NG.text('accessibility').t('granularity_'+k))})):['keycombo_menu_other_read_from_top','keycombo_menu_other_read_from_next_item'].map(k=>({html:c.safe(t(k))}));
    c.dialog({items,buttons:[{label:t('cancel')}],onItem(i){if(local){u.granularity=i;speak(c,NG.text('accessibility').t('granularity_'+['default','character','word','line','paragraph'][i]));}else{speak(c,t('tutorial_lesson_4_sample_text'));u.localPractice=true;}c.render();}});
  }
  function labels(c) { return c.data.accessibilityLabels ||= []; }
  function importLabels(c) {
    NG.pickDocument(c,{mime:'application/json',onPick(c,files){
      let data;try{data=JSON.parse(files[0]?.content||'');if(!Array.isArray(data.labels_array)||data.labels_array.some(x=>!x||!['package_name','package_signature','view_name','label_text','locale'].every(k=>typeof x[k]==='string')||!Number.isInteger(x.package_version)||!Number.isFinite(x.timestamp)))throw Error();}catch{c.toast(t('label_import_failed'));return;}
      const incoming=c.clone(data.labels_array).filter(x=>x.package_name&&x.view_name&&x.label_text);
      // Documents finishes its own activity after the callback. Open the import
      // confirmation on the next task, over the restored label manager.
      setTimeout(()=>c.dialog({title:t('label_import_dialog_title'),message:t('label_import_dialog_message'),buttons:[{label:t('cancel')},...['skip','override'].map(mode=>({label:t('label_import_dialog_'+mode),action(c){
        const before=c.clone(labels(c));let count=0;
        for(const item of incoming){const i=labels(c).findIndex(x=>x.package_name===item.package_name&&x.view_name===item.view_name&&x.locale===item.locale);if(i>=0&&mode==='skip')continue;if(i>=0)labels(c).splice(i,1);labels(c).push(item);count++;}
        c.data.accessibilityLabelUndo=before;c.save();c.render();c.toast(plural('label_import_succeeded',count,count));
      }}))]}),0);
    }});
  }
  NG.appPrefsHooks.talkback = {
    screenTitle(c,xml){return t(xml.includes('key_combo')?'title_pref_manage_keyboard_shortcuts':xml==='gesture_preferences'?'title_pref_category_manage_gestures':'talkback_title');},
    title(c,key){if(key==='pref_help_and_feedback')return t('title_pref_help_and_feedback');},
    hide(c,key){return key==='pref_web_scripts'||key==='keycombo_shortcut_open_manage_keyboard_shortcuts';},
    actions(c,xml){return xml==='dump_events_preferences'?NG.menu.button(c):'';},
    action(c,name,el){
      if(name!=='ng-menu'||c.ui.appPrefs?.stack.at(-1)?.xml!=='dump_events_preferences')return false;
      c.menu([true,false].map(value=>({label:NG.text('accessibility').t(value?'button_check_all_events':'button_clear_all_events'),action(c){for(const n of eventPrefs)prefs(c)[n.key]=value;c.save();c.render();}})),el);return true;
    },
    enabled(c,key,n){
      if(n.t==='KeyboardShortcutDialogPreference')return Object.hasOwn(maps()[keymap(c)],key)&&(keymap(c)!=='default_keymap'||active(c));
      if(key==='pref_dim_when_talkback_enabled_key')return active(c)||get(c,key,false);
      if(key==='pref_two_volume_long_press_key')return active(c)||get(c,key,true);
    },
    get(c,key){return get(c,key,undefined);},
    set(c,key,v){
      if(key==='pref_select_keymap'){put(c,key,v);c.ui.appPrefs.stack.at(-1).xml=keyXml(c);return true;}
      if(key==='pref_default_keymap_trigger_modifier'){
        c.dialog({title:t('keycombo_menu_alert_title_trigger_modifier'),message:fmt('keycombo_menu_alert_message_trigger_modifier',t(v==='trigger_modifier_alt'?'keycombo_key_modifier_alt':'keycombo_key_modifier_meta')),buttons:[{label:t('cancel')},{label:t('yes'),action(c){for(const k of Object.keys(prefs(c)))if(k.startsWith('default_keymap:'))delete prefs(c)[k];put(c,key,v);c.render();}}]});return true;
      }
      put(c,key,v);return true;
    },
    summary(c,key,n){
      if(n.t==='KeyboardShortcutDialogPreference')return describe(combo(c,key),trigger(c));
      if(key==='pref_dump_a11y_event'){const count=Object.entries(prefs(c)).filter(([k,v])=>k.startsWith('pref_dump_event_')&&v).length;return plural('template_dump_event_count',count,count);}
      if(key==='pref_play_store')return fmt('summary_pref_play_store','5.0.4.3');
    },
    click(c,key,n){
      if(n.t==='KeyboardShortcutDialogPreference'){assign(c,n);return true;}
      if(key==='pref_tts_settings'){c.open('settings','xml:tts_settings');return true;}
      if(key==='pref_tutorial'){tutorial(c);return true;}
      if(key==='pref_category_manage_gestures'){NG.appPrefsGo(c,'gesture_preferences');return true;}
      if(key==='pref_category_manage_keyboard_shortcut_key'){NG.appPrefsGo(c,keyXml(c));return true;}
      if(key==='pref_dump_a11y_event'){NG.appPrefsGo(c,'dump_events_preferences');return true;}
      if(key==='pref_manage_labels'){NG.appPrefsGo(c,'@labels');return true;}
      if(key==='pref_reset_keymap'){
        confirm(c,'keycombo_menu_reset_keymap','message_in_reset_keymap_confirm_dialog','reset_button_in_reset_keymap_confirm_dialog',c=>{for(const k of Object.keys(prefs(c)))if(k.startsWith(keymap(c)+':'))delete prefs(c)[k];c.save();c.render();});return true;
      }
      if((key==='pref_explore_by_touch_reflect'&&get(c,key,true))||(key==='pref_tree_debug_reflect'&&!get(c,key,false))){const explore=key==='pref_explore_by_touch_reflect';confirm(c,explore?'dialog_title_disable_exploration':'dialog_title_enable_tree_debug',explore?'dialog_message_disable_exploration':'dialog_message_enable_tree_debug','yes',c=>{put(c,key,!explore);c.render();});return true;}
      if(key==='pref_help_and_feedback'){c.open('help','talkback');return true;}
      if(key==='pref_play_store'){c.open('play-store','app:com.google.android.marvin.talkback');return true;}
      if(key==='pref_policy'||key==='pref_show_tos'){c.open('chrome','url:'+(key==='pref_policy'?'http://www.google.com/policies/privacy/':'http://www.google.com/mobile/toscountry'));return true;}
      return false;
    },
    customs:{
      '@labels':{title:()=>t('label_manager_summary_title'),render(c){return `<div class="ngax-labels">${labels(c).length?labels(c).map(x=>`<p><b>${c.safe(x.package_name)}</b><br>${c.safe(x.label_text)}</p>`).join(''):`<p>${c.safe(t('label_manager_no_packages_message'))}</p>`}</div><div class="ngax-labelbuttons">${['import','export','revert'].map(k=>`<button type="button" class="ngax-textbutton" data-action="ngax-label-${k}"${k==='revert'&&!c.data.accessibilityLabelUndo?' disabled':''}>${c.safe(t(k==='import'?'label_import':k==='export'?'title_pref_export_custom_labels':'revert_imported_labels'))}</button>`).join('')}</div>`;},action(c,name){
        if(name==='ngax-label-import'){importLabels(c);return true;}
        if(name==='ngax-label-export'){if(!labels(c).length)c.toast(t('label_export_empty'));else{const content=JSON.stringify({labels_array:labels(c)});NG.documents.create(c,'internal','TalkBack-labels-'+Date.now()+'.json','json',content);c.toast(t('title_pref_export_custom_labels'));}return true;}
        if(name==='ngax-label-revert'){c.data.accessibilityLabels=c.data.accessibilityLabelUndo||[];delete c.data.accessibilityLabelUndo;c.save();c.render();return true;}return false;
      }},
      '@tutorial':{title:()=>t('tutorial_title'),render(c){
        const u=c.ui.accessibilityTutorial, lessons=NG.accessibilityData.lessons, text=ref=>t(ref.replace('@string/',''));
        if(u.lesson<0)return lessons.map((l,i)=>`<section class="ngax-lesson"><h3>${c.safe(text(l.title))}</h3><p>${c.safe(text(l.short_description))}</p><button type="button" class="ngax-textbutton" data-action="ngax-lesson" data-lesson="${i}" data-page="0">${c.safe(t('tutorial_start_lesson'))}</button><button type="button" class="ngax-textbutton" data-action="ngax-lesson" data-lesson="${i}" data-page="${l.pages.length-1}">${c.safe(t('tutorial_practice'))}</button></section>`).join('');
        const l=lessons[u.lesson],p=l.pages[u.page];
        const edit=/EditText|Lesson5/.test(p.exercise),list=/List|Lesson2/.test(p.exercise),reading=u.lesson===3,context=u.lesson===2;
        if(reading)return `<div class="ngax-tutorial"><header><h3>${c.safe(text(p.subtitle))}</h3><p>${c.safe(text(p.description))}</p></header><div class="ngax-reading" tabindex="0" data-action="ngax-reading">${c.safe(t('tutorial_lesson_4_sample_text'))}</div><footer><button type="button" data-action="ngax-tutorial-home">${c.safe(t('tutorial_title'))}</button><button type="button" data-action="ngax-part" data-step="-1">${c.safe(t('tutorial_previous'))}</button><button type="button" data-action="ngax-part" data-step="1">${c.safe(t(u.page===l.pages.length-1?'tutorial_next_lesson':'tutorial_next'))}</button></footer></div>`;
        if(context)return `<div class="ngax-tutorial"><header><h3>${c.safe(text(p.subtitle))}</h3><p>${c.safe(text(p.description))}</p></header><button type="button" class="ngax-arrow" data-action="ngax-tutorial-menu"><img src="assets/tb-${u.page===1||u.localPractice?'up':'down'}-right-arrow.png" alt="${c.safe(t(u.page===1||u.localPractice?'tutorial_lesson_3_up_right':'tutorial_lesson_3_down_right'))}"></button><footer><button type="button" data-action="ngax-tutorial-home">${c.safe(t('tutorial_title'))}</button><button type="button" data-action="ngax-part" data-step="-1">${c.safe(t('tutorial_previous'))}</button><button type="button" data-action="ngax-part" data-step="1">${c.safe(t(u.page===l.pages.length-1?'tutorial_next_lesson':'tutorial_next'))}</button></footer></div>`;
        return `<div class="ngax-tutorial"><header><h3>${c.safe(text(p.subtitle))}</h3><p>${c.safe(text(p.description))}</p></header><div class="ngax-practice${list?' list':''}">${edit?`<textarea aria-label="${c.safe(t('tutorial_practice_area'))}">${u.page===2?c.safe(t('tutorial_lesson_5_page3_sample_text')):''}</textarea>`:Array.from({length:list?50:9},(_,i)=>`<button type="button" data-action="ngax-practice" data-i="${i}">${c.safe(fmt('tutorial_template_item',i+1))}</button>`).join('')}</div><footer><button type="button" data-action="ngax-tutorial-home">${c.safe(t('tutorial_title'))}</button><button type="button" data-action="ngax-part" data-step="-1"${u.page===0&&u.lesson===0?' disabled':''}>${c.safe(t('tutorial_previous'))}</button><button type="button" data-action="ngax-part" data-step="1">${c.safe(t(u.page===l.pages.length-1?'tutorial_next_lesson':'tutorial_next'))}</button></footer></div>`;
      },action(c,name,el){const u=c.ui.accessibilityTutorial,lessons=NG.accessibilityData.lessons;
        if(name==='ngax-lesson'){u.lesson=+el.dataset.lesson;u.page=+el.dataset.page;u.localPractice=false;}
        else if(name==='ngax-tutorial-home')u.lesson=-1;
        else if(name==='ngax-part'){u.page+=+el.dataset.step;if(u.page>=lessons[u.lesson].pages.length){u.lesson++;u.page=0;if(u.lesson>=lessons.length)u.lesson=-1;}else if(u.page<0){u.lesson--;u.page=lessons[u.lesson].pages.length-1;}}
        else if(name==='ngax-tutorial-menu'||name==='ngax-reading'){tutorialMenu(c);return true;}
        else if(name==='ngax-practice'){document.querySelectorAll('.ngax-practice .selected').forEach(x=>x.classList.remove('selected'));el.classList.add('selected');speak(c,el.textContent);return true;}else return false;c.render();return true;
      }}
    }
  };
  const option=c=>get(c,'pref_scanning_methods_key','views_linear_ime_row_col_key')==='option_scanning_key';
  const auto=c=>get(c,'pref_key_auto_scan_enabled',false);
  const switchKeys=['pref_key_mapped_to_click','pref_key_mapped_to_next','pref_key_mapped_to_switch_3','pref_key_mapped_to_switch_4','pref_key_mapped_to_switch_5'];
  NG.appPrefsHooks.switchaccess={
    screenTitle:()=>t('switch_service_name'),get(c,key){return get(c,key,undefined);},
    set(c,key,v){put(c,key,v);if(key==='pref_key_auto_scan_enabled'&&v&&option(c))put(c,'pref_scanning_methods_key','row_col_scanning_key');return true;},
    title(c,key){const match=key?.match(/^pref_highlight_(\d)_key$/),i=switchKeys.indexOf(key);if(match&&option(c))return fmt('option_scan_switch_format',+match[1]+1);if(i>=0&&(option(c)||i>=2))return fmt('option_scan_switch_format',i+1);},
    hide(c,key){
      if(key==='pref_standard_highlight_key')return option(c);
      if(key==='pref_highlights_key')return !option(c);
      if(key==='pref_key_auto_scan_enabled')return option(c)&&!auto(c);
      if(key==='pref_key_auto_scan_time_delay')return !auto(c);
      if(['pref_key_mapped_to_auto_scan','pref_key_mapped_to_reverse_auto_scan'].includes(key))return !auto(c)&&!get(c,key,[]).length;
      const i=switchKeys.indexOf(key);if(i<2)return false;
      return !get(c,key,[]).length&&(!option(c)||switchKeys.slice(0,i).filter(k=>get(c,k,[]).length).length<i);
    },
    summary(c,key,n){if(n.t==='KeyComboPreference'){const v=get(c,key,[]);return v.length===1?describe(v[0]):plural('label_num_keys_assigned_format',v.length,v.length);}if(key==='pref_key_auto_scan_time_delay'){const v=+get(c,key,'1');return plural('auto_scan_time_delay_summary_format',v===1?1:2,v);}},
    click(c,key,n){
      if(n.t==='KeyComboPreference'){assign(c,n,true);return true;}
      if(key==='pref_help_feedback'){c.open('help','talkback');return true;}
      if(key==='pref_scanning_methods_key'&&auto(c)){const values=n.entryValues,entries=NG.appPrefArr(n.entries),ids=values.map((v,i)=>i).filter(i=>values[i]!=='option_scanning_key');NG.appPrefsChoose(c,title(n),ids.map(i=>entries[i]),ids.findIndex(i=>values[i]===get(c,key,n.defaultValue)),(c,i)=>{put(c,key,values[ids[i]]);c.render();});return true;}
      if(key==='pref_key_auto_scan_time_delay'){
        let v=get(c,key,'1');c.dialog({title:title(n),html:`<div class="ngst-edit"><input class="ngst-input" type="number" min="0.01" step="0.1" value="${c.safe(v)}"></div>`,mount(c,w){w.querySelector('input').oninput=e=>{v=e.target.value;};},buttons:[{label:t('cancel')},{label:t('yes'),action(c){if(Number.isFinite(+v)&&+v>0){put(c,key,String(+v));c.render();}}}]});return true;
      }return false;
    }
  };
})();
