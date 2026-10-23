/* Gboard 6.0.84, angler N2G48C. Key mappings, accents and emoji come from its compiled XML
   (ng-keyboard-data.js); material light colours/dimensions/icons come from this APK, not an older IME.
   The browser field remains the editor: selection, input events and app-specific Enter handlers are preserved. */
(() => {
  'use strict';
  let c, root, field, target, mode = 'alpha', shift = 0, lastShift = 0, category = 'smiley_people', held = false, timer, repeat;
  let candidateOverride=null,lastCorrection=null,gestureState=null,lastGlide=false;
  const T = () => NG.text('gboard'), tr = key => T().t(key), A = name => `assets/gb-${name}.png`;
  const pref = (key, def) => NG.appPref(c, 'gboard', key, NG.keyboardDefaults[key] ?? def);
  const lang = () => pref('use_system_language', true) ? c.lang : pref('language', c.lang);
  const layout = () => {
    const base=NG.keyboardData[lang()] || NG.keyboardData.en, variant=pref('style_'+lang(),null);
    const rows={qwerty:NG.keyboardData.en.rows,qwertz:NG.keyboardData.de.rows,azerty:NG.keyboardData.fr.rows}[variant];
    return rows ? {...base,rows} : base;
  };
  const eligible = el => el?.matches?.('input,textarea') && !el.disabled && !el.readOnly && el.closest('#viewport,#overlay-root') &&
    (el.tagName === 'TEXTAREA' || ['text','search','email','url','password','tel','number'].includes(el.type));
  const numeric = () => ['tel','number'].includes(field?.type) || /numeric|decimal/.test(field?.dataset.ngInputmode || '');
  const secret = () => field?.type === 'password';
  const icon = name => `<img src="${A(name)}" alt="">`;
  function button(key, text, cls = '', label = '') {
    return `<button type="button" class="ngboard-key ${cls}" data-gb="${c.safe(key)}"${label ? ` aria-label="${c.safe(tr(label))}"` : ''}>${text}</button>`;
  }
  const charKey = text => button(`text:${text}`, c.safe(text), 'char');
  function nav() {
    const img = c.el.screen.querySelector('.ngnb-key[data-key="back"] img');
    if (img) { const src = `assets/sui-${root ? 'ic_sysbar_back_ime' : 'ic_sysbar_back'}.png`; if (img.getAttribute('src') !== src) img.src = src; }
  }
  function resize() {
    if (!root) return;
    const rows = pref('enable_number_row', false) && mode === 'alpha' && !numeric();
    const ratio = Math.max(.8, Math.min(1.2, +pref('keyboard_height_ratio', '1.0') || 1));
    const height = (numeric() ? 249 : 282) * ratio * (rows ? 1.2 : 1)+(NG.keyboardFeatures?.isSearch()?8:0);
    root.classList.toggle('searching',!!NG.keyboardFeatures?.isSearch());
    c.el.screen.style.setProperty('--ngboard-height', `${height}`);
    c.el.screen.classList.add('ngboard-open');
    root.classList.toggle('numbers', numeric());
    root.classList.toggle('borders', !!pref('key_borders', false));
    root.classList.toggle('dark', pref('theme', 'light') === 'dark');
    if(NG.keyboardThemeStyle){root.setAttribute('style',NG.keyboardThemeStyle(c,pref('theme','light'),!!pref('key_borders',false)));root.classList.add('native-palette');}
    const hand = pref('one_handed_mode', '0');
    root.classList.toggle('left', hand === '2'); root.classList.toggle('right', hand === '1');
    nav();
  }
  function word() {
    if (!field || secret() || numeric()) return '';
    return field.value.slice(0, field.selectionStart ?? field.value.length).match(/[\p{L}\p{M}]+(?:['’][\p{L}\p{M}]*)?$/u)?.[0] || '';
  }
  const predictive=()=>!!field&&!secret()&&!numeric()&&!['email','url'].includes(field.type);
  const wordOptions=()=>({block:pref('block_offensive_words',true),personal:[...(c.data.settings.userWords||[]),...(pref('pref_key_use_personalized_dicts',true)?pref('learned_words',[]).filter(p=>p.lang===lang()&&(!pref('block_offensive_words',true)||!wordModel()?.isBlocked(p.word))):[])],learned:pref('learned_words',[]).filter(p=>p.lang===lang())});
  const wordModel=()=>NG.keyboardWords?.get(lang());
  function capital(text,typed){return typed&&typed.length>1&&typed===typed.toLocaleUpperCase(lang())?text.toLocaleUpperCase(lang()):typed&&typed[0]===typed[0].toLocaleUpperCase(lang())?text[0].toLocaleUpperCase(lang())+text.slice(1):text;}
  function suggestions() {
    const el=root?.querySelector('.ngboard-word');if(!el)return;const text=word(),enabled=predictive()&&pref('show_suggestions',NG.keyboardDefaults.latin_show_suggestion),opts=wordOptions(),model=wordModel();let items=[];
    if(enabled){if(candidateOverride)items=candidateOverride;else if(text){const corrections=model?.correct(text,opts)||[],prefix=model?.prefix(text,opts)||[];items=[text,...prefix.slice(0,1),...corrections,...prefix.slice(1)].filter(Boolean).map(w=>capital(w,text));}else if(pref('next_word_prediction',true))items=model?.predict(field.value.slice(0,field.selectionStart??field.value.length),opts)||[];}
    items=[...new Set(items)].slice(0,3);const signature=JSON.stringify(items);if(el.dataset.words===signature)return;el.dataset.words=signature;el.innerHTML=items.map((w,i)=>`<button type="button" class="ngboard-candidate${i===1?' preferred':''}" data-gb="candidate:${c.safe(w)}">${c.safe(w)}</button>`).join('');
  }
  function ensureWords(){const expected=lang();NG.keyboardWords?.load(expected).then(()=>{if(root&&field&&lang()===expected)suggestions();});}
  function replaceWord(text,space=false){if(!field)return;const old=word(),pos=field.selectionStart??field.value.length;try{field.setSelectionRange(pos-old.length,pos);}catch{}candidateOverride=null;insert(text+(space?' ':''));}
  function learnWord(text){if(!predictive()||!pref('pref_key_use_personalized_dicts',true)||!text||pref('block_offensive_words',true)&&wordModel()?.isBlocked(text))return;const pos=field.selectionStart??field.value.length,before=field.value.slice(0,pos-text.length),after=(before.match(/([\p{L}\p{M}]+)\s+$/u)?.[1]||'').toLocaleLowerCase(lang()),list=JSON.parse(JSON.stringify(pref('learned_words',[]))),lower=text.toLocaleLowerCase(lang()),item=list.find(x=>x.lang===lang()&&x.word.toLocaleLowerCase(lang())===lower&&x.after===after);if(item)item.count++;else list.unshift({word:text,after,lang:lang(),count:1});NG.setAppPref(c,'gboard','learned_words',list.slice(0,300));}
  function space(){const value=field?.value||'',pos=field?.selectionStart??value.length,text=word(),candidate=predictive()&&field.spellcheck!==false&&pref('pref_key_auto_correction',true)?wordModel()?.correct(text,wordOptions())?.[0]:null;let correction=null;
    if(candidate){const replacement=capital(candidate,text);replaceWord(replacement);correction={start:pos-text.length,before:text,after:replacement};}
    learnWord(word());if(!secret()&&pref('enable_double_space_period',true)&&/\S $/.test(value.slice(0,pos))){insert('',true);insert('. ');}else insert(' ');lastGlide=false;if(correction)lastCorrection={...correction,cursor:field?.selectionStart};
  }
  function draw() {
    if (!root) return;
    let body = '';
    if (mode === 'emoji' && !numeric()) {
      const tabs = Object.keys(NG.keyboardEmoji).map((id, i) => button(`category:${id}`, ['☺','♧','♨','⚽','✈','♬','♡','⚑'][i], id === category ? 'selected' : '')).join('');
      body = `<div class="ngboard-emojis">${NG.keyboardEmoji[category].map(x => charKey(x.text)).join('')}</div><div class="ngboard-categories">${tabs}</div>`;
    } else {
      const rows = numeric() ? [['1','2','3'],['4','5','6'],['7','8','9']] : mode === 'symbols' ? NG.keyboardSymbols[shift ? 1 : 0] : layout().rows;
      if (!numeric() && mode === 'alpha' && pref('enable_number_row', false)) body += `<div class="ngboard-row number-row">${[...'1234567890'].map(charKey).join('')}</div>`;
      rows.forEach((row, i) => {
        const letters = row.map(x => charKey(shift && mode === 'alpha' ? x.toLocaleUpperCase(lang()) : x)).join('');
        body += `<div class="ngboard-row row${i}">${i === 2 && !numeric() ? button('shift', mode === 'symbols' ? shift ? '?123' : '=\\<' : icon(shift ? 'shift-on' : 'shift-off'), `function shift${shift === 2 ? ' locked' : ''}`, 'shift_key_content_desc') : ''}${letters}${i === 2 && !numeric() ? button('delete', icon('delete'), 'function', 'delete_key_content_desc') : ''}</div>`;
      });
    }
    const end = button('enter', icon(field?.type === 'search' || field?.enterKeyHint === 'search' ? 'search' : 'enter'), 'function enter', 'enter_key_content_desc');
    const langName = new Intl.DisplayNames([c.locale()], {type:'language'}).of(lang());
    const bottom = numeric() ? `${charKey(field?.type === 'tel' ? '*' : '.')}${charKey('0')}${button('delete', icon('delete'), 'function', 'delete_key_content_desc')}${end}` :
      `${button(mode === 'alpha' ? 'symbols' : 'alpha', mode === 'alpha' ? '?123' : 'ABC', 'function', 'symbol_keyboard_key_content_desc')}${button('emoji', icon('emoji'), 'function', 'emoji_keyboard_key_content_desc')}${charKey(',')}${button('space', c.safe(langName), 'space', 'space_key_content_desc')}${charKey('.')}${mode === 'emoji' ? button('delete', icon('delete'), 'function', 'delete_key_content_desc') : ''}${end}`;
    const header=NG.keyboardFeatures?.header()||`${button('features', icon(pref('enable_one_tap_to_search',false)?'feature-search':'menu'), 'tool', 'open_access_points_menu_content_desc')}<span class="ngboard-word"></span>${!secret()&&pref('enable_voice_input',true)?button('voice',icon('mic'),'tool','voice_input_key_content_desc'):''}${button('language', icon('globe'), 'tool', 'next_language_key_content_desc')}`;
    const featureBody=NG.keyboardFeatures?.body();
    root.innerHTML = `${NG.keyboardThemeBackground?.(c,pref('theme','light'))||''}<div class="ngboard-inner"><div class="ngboard-header">${header}</div><div class="ngboard-body">${featureBody??`${body}<div class="ngboard-row bottom">${bottom}</div>`}</div></div>`;
    resize(); suggestions();NG.keyboardFeatures?.mount();
  }
  function remember(el) {
    const scope = el.closest('#overlay-root') ? '#overlay-root' : '#viewport';
    return {scope, index: [...document.querySelector(scope).querySelectorAll('input,textarea')].indexOf(el), view:c.ui.view, sub:c.ui.sub, overlay:c.ui.overlay,
      tag:el.tagName, type:el.type, id:el.id, cls:el.className, start:el.selectionStart, end:el.selectionEnd};
  }
  function bind(el) {
    field = el; target = remember(el);
    if (!('ngInputmode' in el.dataset)) { el.dataset.ngInputmode = el.getAttribute('inputmode') ?? ''; el.dataset.ngHadInputmode = String(el.hasAttribute('inputmode')); }
    el.setAttribute('inputmode', 'none');
  }
  function restoreMode(el) {
    if (!el || !('ngInputmode' in el.dataset)) return;
    if (el.dataset.ngHadInputmode === 'true') el.setAttribute('inputmode', el.dataset.ngInputmode); else el.removeAttribute('inputmode');
    delete el.dataset.ngInputmode; delete el.dataset.ngHadInputmode;
  }
  function autoShift() {
    if (!field || mode !== 'alpha' || shift === 2) return;
    const caps = field.autocapitalize || (field.tagName === 'TEXTAREA' ? 'sentences' : 'none');
    const before = field.value.slice(0, field.selectionStart ?? field.value.length);
    shift = !secret() && pref('enable_auto_capitalization',true) && (caps === 'characters' || caps === 'words' && /(?:^|\s)$/.test(before) || caps === 'sentences' && /(?:^|[.!?]\s+)$/.test(before)) ? 1 : 0;
  }
  function show(el) {
    if (!c || !eligible(el) || c.ui.sleeping || c.ui.power) return;
    if (field !== el) {
      const replacing = field && !field.isConnected && target?.view === c.ui.view && target?.sub === c.ui.sub && target?.cls === el.className && target?.type === el.type;
      const selection = replacing && {start:target.start,end:target.end};
      restoreMode(field); bind(el);
      if (selection) { try { el.setSelectionRange(selection.start,selection.end); } catch {} target=remember(el); }
      else {mode='alpha';shift=0;candidateOverride=null;lastCorrection=null;lastGlide=false;NG.keyboardFeatures?.reset();autoShift();}
    }
    if (!root) {
      root = document.createElement('div'); root.className = 'ngboard'; root.setAttribute('role','group'); root.setAttribute('aria-label',tr('ime_name'));
      c.el.screen.append(root);
      root.addEventListener('pointerdown', down);
      root.addEventListener('pointerup', up);
      root.addEventListener('pointermove', glideMove);
      root.addEventListener('pointercancel', ()=>{cancelPress();gestureState=null;root?.querySelector('.ngboard-trail')?.remove();});
      root.addEventListener('click', e => { e.stopPropagation(); if (e.detail === 0) { const key = e.target.closest('[data-gb]'); if (key) press(key.dataset.gb); } });
      root.addEventListener('mousedown',e=>{if(!e.target.closest('.ngboard-search-query'))e.preventDefault();});
    }
    draw();ensureWords();
    requestAnimationFrame(() => field?.scrollIntoView({block:'nearest',inline:'nearest'}));
  }
  function cancelPress() { clearTimeout(timer); clearInterval(repeat); root?.querySelector('.pressed')?.classList.remove('pressed'); root?.querySelector('.ngboard-preview')?.remove(); }
  function hide() {
    cancelPress();gestureState=null;candidateOverride=null;lastCorrection=null;lastGlide=false;NG.keyboardFeatures?.reset(); root?.remove(); root = null;
    restoreMode(field); const old = field; field = null; target = null;
    if (document.activeElement === old) old.blur();
    c?.el.screen.classList.remove('ngboard-open'); c?.el.screen.style.removeProperty('--ngboard-height'); if(c) nav();
  }
  function reconcile() {
    if (!root) return;
    if (c.ui.sleeping || c.ui.power || target.view !== c.ui.view || target.sub !== c.ui.sub || target.scope === '#overlay-root' && target.overlay !== c.ui.overlay) { hide(); return; }
    if (!field.isConnected) {
      const replacement = document.querySelector(target.scope)?.querySelectorAll('input,textarea')[target.index];
      if (!eligible(replacement) || replacement.tagName !== target.tag || replacement.type !== target.type || replacement.id !== target.id || replacement.className !== target.cls) { hide(); return; }
      const {start,end} = target; restoreMode(field); bind(replacement); replacement.focus({preventScroll:true});
      try { replacement.setSelectionRange(start,end); } catch {}
    }
    resize(); suggestions();
  }
  function insert(text, deleting = false) {
    reconcile(); if (!field) return;
    if(!deleting)lastCorrection=null;
    const editor = field, value = editor.value;
    let start = editor.selectionStart ?? value.length, end = editor.selectionEnd ?? value.length;
    if (deleting && start === end && start > 0) {
      const before = value.slice(0,start);
      const segments = typeof Intl.Segmenter === 'function' ? [...new Intl.Segmenter(lang(),{granularity:'grapheme'}).segment(before)] : [...before].map((x,i,a) => ({index:a.slice(0,i).join('').length}));
      start = segments.at(-1)?.index ?? 0;
    }
    if (editor.maxLength >= 0) text = text.slice(0, Math.max(0, editor.maxLength - value.length + end - start));
    const type = deleting ? 'deleteContentBackward' : 'insertText';
    if (!editor.dispatchEvent(new InputEvent('beforeinput',{bubbles:true,cancelable:true,inputType:type,data:deleting ? null : text}))) return;
    try { editor.setRangeText(text,start,end,'end'); } catch { editor.value = value.slice(0,start)+text+value.slice(end); }
    target = {...remember(editor), start:editor.selectionStart??start+text.length,end:editor.selectionEnd??start+text.length};
    editor.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:type,data:deleting ? null : text}));
    reconcile();
    if (shift === 1) shift = 0;
    autoShift(); draw();
  }
  function enter() {
    if (!field) return;
    const editor = field;
    if (!editor.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true,cancelable:true}))) return;
    if (editor.tagName === 'TEXTAREA' && !['send','go','search','done','next'].includes(editor.enterKeyHint)) insert('\n');
    else if (editor.enterKeyHint === 'next') {
      const inputs = [...editor.closest('#viewport,#overlay-root').querySelectorAll('input,textarea')].filter(eligible);
      inputs[inputs.indexOf(editor)+1]?.focus();
    } else if (editor.form) { editor.form.requestSubmit(); hide(); }
    else hide();
  }
  function chooseLanguage() {
    hide(); const current = lang(), langs = ['en','hu','de','fr','es'];
    NG.appPrefsChoose(c,tr('setting_languages'),langs.map(l => new Intl.DisplayNames([c.locale()],{type:'language'}).of(l)),langs.indexOf(current),(c,i) => {
      NG.setAppPref(c,'gboard','use_system_language',false); NG.setAppPref(c,'gboard','language',langs[i]);
    });
  }
  function press(key) {
    if(NG.keyboardFeatures?.press(key)){if(key.startsWith('text:')&&shift===1){shift=0;draw();}return;}
    if(key.startsWith('candidate:')){replaceWord(key.slice(10),true);lastGlide=false;}
    else if (key.startsWith('text:')) {candidateOverride=null;if(lastGlide&&word())insert(' ');lastGlide=false;insert(key.slice(5));}
    else if (key === 'space') {candidateOverride=null;space();}
    else if (key === 'delete') {candidateOverride=null;lastGlide=false;if(lastCorrection&&field?.selectionStart===lastCorrection.cursor&&field.selectionEnd===lastCorrection.cursor){const item=lastCorrection;lastCorrection=null;field.setSelectionRange(item.start,item.cursor);insert(item.before);}else insert('',true);}
    else if (key === 'shift') { const now=Date.now(); shift = now-lastShift < 350 && shift === 1 ? 2 : shift ? 0 : 1; lastShift=now; draw(); }
    else if (key === 'enter') {learnWord(word());candidateOverride=null;lastGlide=false;enter();}
    else if (['alpha','symbols','emoji'].includes(key)) { mode=key; shift=0; draw(); }
    else if (key.startsWith('category:')) { category=key.slice(9); draw(); }
    else if (key === 'language') chooseLanguage();
    else if (key === 'voice' && NG.googleVoiceInput) {
      const to=remember(field);hide();
      NG.googleVoiceInput(c,(ctx,text)=>{
        const editor=document.querySelector(to.scope)?.querySelectorAll('input,textarea')[to.index];
        if(!eligible(editor)||ctx.ui.view!==to.view||editor.tagName!==to.tag||editor.type!==to.type)return;
        editor.focus();show(editor);try{editor.setSelectionRange(to.start,to.end);}catch{}insert(text);
      });
    }
    else if (key === 'settings') { hide(); NG.openPrefs(c,'gboard','settings',tr('ime_name')); }
  }
  function popup(key, choices) {
    root.querySelector('.ngboard-preview')?.remove();
    const pop=document.createElement('div'); pop.className='ngboard-preview'+(choices.length > 1 ? ' choices' : '');
    pop.innerHTML=choices.map(charKey).join(''); root.append(pop);
    const r=key.getBoundingClientRect(), k=root.getBoundingClientRect(), dp=c.el.screen.clientWidth/411.4286;
    const width=Math.min(k.width-8*dp, Math.max(48,choices.length*38)*dp);
    pop.style.width=`${width}px`; pop.style.left=`${Math.min(k.width-width-4*dp,Math.max(4*dp,r.left-k.left+(r.width-width)/2))}px`;
    pop.style.bottom=`${k.bottom-r.top+4*dp}px`;
  }
  function accents(text) {
    if (mode === 'emoji') return NG.keyboardEmoji[category].find(x=>x.text===text)?.variants || [];
    return layout().accents[text] || [];
  }
  function down(e) {
    NG.keyboardFeatures?.pointerDown(e);
    const key=e.target.closest('[data-gb]'); if(!key) return;
    if(key.closest('.ngboard-preview.choices')) { e.preventDefault(); e.stopPropagation(); const value=key.dataset.gb; cancelPress(); held=true; press(value); return; }
    if(!key.closest('.ngboard-emojis'))e.preventDefault(); e.stopPropagation(); cancelPress(); held=false; key.classList.add('pressed');
    gestureState=mode==='alpha'&&predictive()&&pref('enable_gesture_input',true)&&key.dataset.gb.startsWith('text:')?{key:key.dataset.gb,points:[{x:e.clientX,y:e.clientY}],active:false,pointer:e.pointerId}:null;
    if (key.dataset.gb.startsWith('text:') && pref('enable_popup_on_keypress',true)) popup(key,[key.dataset.gb.slice(5)]);
    timer=setTimeout(() => {
      if(key.dataset.gb==='delete') { held=true; press('delete'); repeat=setInterval(()=>press('delete'),65); }
      else if(key.dataset.gb==='space') { held=true; chooseLanguage(); }
      else if(key.dataset.gb.startsWith('text:')) { const choices=accents(key.dataset.gb.slice(5)); if(choices.length) { held=true; popup(key,choices); } }
    },Math.max(150,Math.min(700,+pref('key_long_press_delay',300)||300)));
  }
  function glideMove(e){if(NG.keyboardFeatures?.pointerMove(e)){cancelPress();e.preventDefault();return;}const g=gestureState;if(!g||g.pointer!==e.pointerId||held)return;const first=g.points[0];if(!g.active&&Math.hypot(e.clientX-first.x,e.clientY-first.y)<12*c.el.screen.clientWidth/411.4286)return;
    if(!g.active){g.active=true;clearTimeout(timer);clearInterval(repeat);root.querySelector('.ngboard-preview')?.remove();root.setPointerCapture?.(e.pointerId);}g.points.push({x:e.clientX,y:e.clientY});e.preventDefault();
    if(pref('pref_gesture_preview_trail',true)){const r=root.getBoundingClientRect();let svg=root.querySelector('.ngboard-trail');if(!svg){svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('ngboard-trail');svg.innerHTML='<polyline fill="none" stroke-linecap="round" stroke-linejoin="round"/>';root.append(svg);}svg.setAttribute('viewBox',`0 0 ${r.width} ${r.height}`);svg.firstChild.setAttribute('points',g.points.map(p=>`${p.x-r.left},${p.y-r.top}`).join(' '));}
  }
  function up(e) {
    if(NG.keyboardFeatures?.pointerUp()){cancelPress();e.preventDefault();e.stopPropagation();return;}
    const g=gestureState;gestureState=null;if(g?.active){e.preventDefault();e.stopPropagation();cancelPress();root?.querySelector('.ngboard-trail')?.remove();const r=root.getBoundingClientRect(),unit=r.width/10,keys={};root.querySelectorAll('.ngboard-row .char[data-gb]').forEach(el=>{const k=el.dataset.gb.slice(5).toLocaleLowerCase(lang()),b=el.getBoundingClientRect();if(k.length===1)keys[NG.keyboardWords.fold(k)]={x:(b.left+b.width/2-r.left)/unit,y:(b.top+b.height/2-r.top)/unit};});const points=g.points.map(p=>({x:(p.x-r.left)/unit,y:(p.y-r.top)/unit})),items=wordModel()?.gesture(points,keys,wordOptions())||[];if(items.length){const before=word();if(before)insert(' ');const first=shift?capital(items[0],'A'):items[0];candidateOverride=null;insert(first);lastGlide=true;candidateOverride=[first,...items.slice(1)];suggestions();}return;}
    const key=e.target.closest('[data-gb]'), choice=key?.closest('.ngboard-preview.choices');
    clearTimeout(timer); clearInterval(repeat); e.preventDefault(); e.stopPropagation();
    if(choice) { const text=key.dataset.gb; cancelPress(); press(text); return; }
    if(held && root?.querySelector('.choices')) { root.querySelector('.pressed')?.classList.remove('pressed'); return; }
    cancelPress(); if(key && !held) press(key.dataset.gb);
  }
  NG.keyboardFeatures?.connect({context:()=>c,root:()=>root,draw,hide,insert,press,multiline:()=>field?.tagName==='TEXTAREA',alpha:()=>{mode='alpha';shift=0;},focus:()=>{autoShift();field?.focus({preventScroll:true});}});
  NG.ime = {open:()=>!!root, hide, back(){if(!root)return false;if(NG.keyboardFeatures?.back())return true;hide();return true;}, beforeRender(){ if(root && target && (c.ui.view!==target.view || c.ui.sub!==target.sub || c.ui.sleeping || c.ui.power)) hide(); }};
  const languageNames = ctx => ['en','hu','de','fr','es'].map(l=>new Intl.DisplayNames([ctx.locale()],{type:'language'}).of(l));
  const prefRow = (ctx,title,summary,action,data='',widget='') => NG.settingsRow(ctx,{title,summary,action,data,widget});
  const set = (ctx,key,value) => { NG.setAppPref(ctx,'gboard',key,value); ctx.render(); };
  NG.appPrefsHooks.gboard = {
    // AbstractSettingsActivity's overflow (menu_settings: Usage tips, About, Help & feedback); About is
    // AboutPreferenceFragment over setting_about with the version in setting_about_key.
    actions: (ctx,xml) => xml==='settings' ? NG.menu.button(ctx) : '',
    action(ctx,name,el) {
      if(name!=='ng-menu')return false;
      const ap=k=>NG.appPrefStr('string/LatinIMEGooglePrebuilt/'+k);
      // Usage tips: the support page (fallback_support_url, https://support.google.com, on this offline phone).
      ctx.menu([{label:ap('setting_tutorial_title'),action:ctx=>ctx.open('chrome','url:https://support.google.com')},{label:ap('setting_about_title'),action:ctx=>NG.appPrefsGo(ctx,'setting_about',ap('setting_about_title'))},{label:ap('setting_help_and_feedback'),action:ctx=>ctx.open('help','gboard')}],el);
      return true;
    },
    summary: (ctx,key) => key==='setting_about_key' ? '6.0.84.145092135-preload-arm64-v8a' : undefined,
    fragment(ctx,name,node) { return node.extras?.PREFERENCE_FRAGMENT || (name.endsWith('CustomInputStyleSettingsFragment') ? 'styles' : name.endsWith('AddOnDictionaryFragment') ? 'dictionaries' : null); },
    get(ctx,key) {
      const stored=NG.appPref(ctx,'gboard',key,undefined); if(stored!==undefined)return stored;
      const aliases={pref_gesture_preview_trail:'gesture_preview_trail',pref_show_recent_emoji_in_symbol_keyboard:'show_recent_emoji_in_symbol_keyboard',pref_key_enable_conv2query:'enable_conv2query',sync:'enable_sync_user_dictionary',show_suggestions:'latin_show_suggestion',pref_key_auto_correction:'latin_auto_correction',pref_key_use_personalized_dicts:'latin_personalization',enable_auto_capitalization:'auto_capitalization',enable_auto_language_switching:'auto_language_switching'};
      return NG.keyboardDefaults[aliases[key] || key];
    },
    enabled(ctx,key,node) { if(key==='show_language_switch_key')return !NG.appPref(ctx,'gboard','show_emoji_switch_key',false); },
    click(ctx,key,node) {
      if(node.intent?.targetClass?.endsWith('SubtypeSettingsActivity')) { NG.appPrefsGo(ctx,'languages',tr('setting_languages'));return true; }
      if(node.intent?.targetClass?.endsWith('ThemeSelectorActivity')) { NG.appPrefsGo(ctx,'themes',tr('setting_theme'));return true; }
      if(node.intent?.action==='android.settings.USER_DICTIONARY_SETTINGS') { ctx.open('settings','user-dictionary');return true; }
      if(['VolumePreference','VibrationDurationPreference','LongPressDelayPreference'].includes(node.t)) {
        const max=node.t==='VolumePreference'?100:node.t==='VibrationDurationPreference'?100:700, min=node.t==='LongPressDelayPreference'?150:0;
        let v=+NG.appPref(ctx,'gboard',key,key==='key_long_press_delay'?300:key==='sound_volume'?50:20);
        ctx.dialog({title:NG.appPrefStr(node.title),html:`<div class="ngboard-slider"><input type="range" min="${min}" max="${max}" value="${v}" aria-label="${ctx.safe(NG.appPrefStr(node.title))}"><output>${v}${key==='sound_volume'?'%':' ms'}</output></div>`,
          mount(ctx,win){win.querySelector('input').addEventListener('input',e=>{v=+e.target.value;win.querySelector('output').textContent=v+(key==='sound_volume'?'%':' ms');});},
          buttons:[{label:tr('framework/cancel')},{label:tr('framework/ok'),action:ctx=>set(ctx,key,v)}]});return true;
      }
      return false;
    },
    customs:{
      languages:{title:()=>tr('setting_languages'),render(ctx){
        const system=NG.appPref(ctx,'gboard','use_system_language',true), selected=NG.appPref(ctx,'gboard','language',ctx.lang);
        return prefRow(ctx,tr('settings_system_default'),'', 'ngboard-system','',NG.settingsSwitch(system))+languageNames(ctx).map((name,i)=>prefRow(ctx,name,'','ngboard-language',` data-lang="${['en','hu','de','fr','es'][i]}"`,`<i class="ngw-radio ngst-radio${!system&&selected===['en','hu','de','fr','es'][i]?' on':''}"></i>`)).join('');
      },action(ctx,name,el){if(name==='ngboard-system'){set(ctx,'use_system_language',!NG.appPref(ctx,'gboard','use_system_language',true));return true;}if(name==='ngboard-language'){NG.setAppPref(ctx,'gboard','use_system_language',false);set(ctx,'language',el.dataset.lang);return true;}return false;}},
      themes:{title:()=>tr('setting_theme'),render(ctx){
        const theme=NG.appPref(ctx,'gboard','theme','light');
        return `<div class="ngboard-themes">${['light','dark'].map(id=>`<button type="button" class="ngboard-swatch ${id}${id===theme?' selected':''}" data-action="ngboard-theme" data-theme="${id}"><span>q w e r t y<br>a s d f g h<br>⇧ z x c v ⌫</span><b>${ctx.safe(tr('kb_theme_material_'+id))}</b></button>`).join('')}</div>`+prefRow(ctx,tr('theme_selector_key_border'),'','ngboard-borders','',NG.settingsSwitch(NG.appPref(ctx,'gboard','key_borders',false)));
      },action(ctx,name,el){if(name==='ngboard-theme'){set(ctx,'theme',el.dataset.theme);return true;}if(name==='ngboard-borders'){set(ctx,'key_borders',!NG.appPref(ctx,'gboard','key_borders',false));return true;}return false;}},
      dictionaries:{title:()=>NG.text('appprefs').t('LatinIMEGooglePrebuilt/dictionary_download_title'),render(ctx){return ['de','en','es','fr','it','pt','ru'].map(l=>prefRow(ctx,new Intl.DisplayNames([ctx.locale()],{type:'language'}).of(l),tr('dictionary_download_bundled'),'')).join('');}},
      styles:{title:()=>NG.text('appprefs').t('LatinIMEGooglePrebuilt/setting_custom_input_styles_title'),render(ctx){return ['de','fr'].map(l=>prefRow(ctx,new Intl.DisplayNames([ctx.locale()],{type:'language'}).of(l),NG.appPref(ctx,'gboard','style_'+l,l==='de'?'qwerty':'qwertz').toUpperCase(),'ngboard-style',` data-lang="${l}"`)).join('');},
        action(ctx,name,el){if(name!=='ngboard-style')return false;const layouts=['qwerty','qwertz','azerty'];NG.appPrefsChoose(ctx,tr('setting_preferences'),layouts.map(x=>x.toUpperCase()),layouts.indexOf(NG.appPref(ctx,'gboard','style_'+el.dataset.lang,el.dataset.lang==='de'?'qwerty':'qwertz')),(ctx,i)=>{NG.setAppPref(ctx,'gboard','use_system_language',false);NG.setAppPref(ctx,'gboard','language',el.dataset.lang);set(ctx,'style_'+el.dataset.lang,layouts[i]);});return true;}}
    }
  };
  NG.register('gboard', {
    app:false,
    init(ctx) {
      c=ctx;
      document.addEventListener('focusin',e=>{if(eligible(e.target))show(e.target);});
      document.addEventListener('focusout',()=>setTimeout(()=>{if(root && field?.isConnected && document.activeElement!==field && !root.contains(document.activeElement) && !eligible(document.activeElement)) hide();},60));
      document.addEventListener('input',e=>{if(e.target===field){target=remember(field);suggestions();}});
      document.addEventListener('selectionchange',()=>{if(root && field===document.activeElement)target=remember(field);});
      new MutationObserver(reconcile).observe(c.el.screen,{childList:true,subtree:true});
    }
  });
})();
