/* Gingerbread credential screens (PatternUnlockScreen, PasswordUnlockScreen and the PasswordEntryKeyboardView keyboards).
   This is a local simulation, not a browser security boundary. */
(() => {
  'use strict';
  const kinds=['pattern','pin','password'];
  const names={none:'None',slide:'Slide',pattern:'Pattern',pin:'PIN',password:'Password'};
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const secure=data=>kinds.includes(data.settings.screenLock)&&data.screenCredential?.kind===data.settings.screenLock&&/^[a-f0-9]{64}$/.test(data.screenCredential.digest)&&/^[a-f0-9]{32}$/.test(data.screenCredential.salt);
  function initialize(data){if(kinds.includes(data.settings.screenLock)&&!secure(data))data.settings.screenLock='slide';data.lockAttempts||={count:0,until:0};}
  function appendPattern(pattern,cell){
    if(!Number.isInteger(cell)||cell<0||cell>8||pattern.includes(cell))return pattern;
    const last=pattern.at(-1);
    if(last!==undefined){const x=cell%3-last%3,y=Math.floor(cell/3)-Math.floor(last/3);if((Math.abs(x)===2&&y%2===0)||(Math.abs(y)===2&&x%2===0)){const middle=(last+cell)/2;if(!pattern.includes(middle))pattern.push(middle);}}
    pattern.push(cell);return pattern;
  }
  function validate(kind,value){
    if(kind==='pattern')return /^[0-8]{4,9}$/.test(value)&&new Set(value).size===value.length?'':'Connect at least 4 dots';
    if(kind==='pin')return /^\d{4,16}$/.test(value)?'':'Use 4–16 digits';
    if(kind==='password')return /^[\x21-\x7e]{4,16}$/.test(value)&&/[a-z]/i.test(value)?'':'Use 4–16 characters, including a letter';
    return 'Choose screen lock';
  }
  const hex=bytes=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
  async function digest(kind,value,salt){return hex(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${salt}:${kind}:${value}`))));}
  async function credential(kind,value){const error=validate(kind,value);if(error)throw Error(error);const salt=hex(crypto.getRandomValues(new Uint8Array(16)));return {kind,salt,digest:await digest(kind,value,salt)};}
  async function matches(record,value){return !!record&&await digest(record.kind,value,record.salt)===record.digest;}
  function failed(data,now=Date.now()){const state=data.lockAttempts||={count:0,until:0};state.count++;if(state.count>=5){state.count=0;state.until=now+30000;}}
  const remaining=(data,now=Date.now())=>Math.max(0,Math.ceil(((data.lockAttempts?.until||0)-now)/1000));

  function controller({getData,getUI,t,save,render,unlock,clock,date,carrier,toast,gb}){
    let state={stage:'unlock',kind:'slide',value:'',pattern:[]},drawing=null,busy=false,revision=0,clearTimer;
    const data=()=>getData(),ui=()=>getUI();
    const active=()=>ui().view==='lock'&&secure(data())||ui().view==='settings'&&ui().sub==='lock-setup';
    const setup=()=>ui().view==='settings';
    function fresh(stage,kind){clearTimeout(clearTimer);revision++;state={stage,kind,value:'',pattern:[],error:'',first:'',shift:false,symbols:false};drawing=null;busy=false;}
    function open(){fresh(secure(data())?'verify':'choose',data().settings.screenLock);ui().overlay='';ui().sub='lock-setup';render();}
    function cancel(){fresh('unlock',data().settings.screenLock);ui().sub='security';render();}
    function lock(){fresh('unlock',data().settings.screenLock);}
    const keyButton=(key,label=key,extra='')=>`<button type="button" data-lock-key="${escape(key)}" aria-label="${escape(t(label))}" ${extra}>${escape(label.length>2?t(label):label)}</button>`;
    // password_kbd_numeric.xml: 33.33% keys with 2px gaps and the sym_keyboard_num icons; password_kbd_qwerty.xml: 10% keys,
    // the second letter row inset by 5%, 15% shift and delete, and a symbols/space/OK row. Keys use btn_keyboard_key_fulltrans.
    function keyboard(){
      const icon=(key,file,label,cls='')=>`<button type="button" class="${cls}" data-lock-key="${key}" aria-label="${escape(t(label))}"><img src="assets/gb-${file}.png" alt=""></button>`;
      if(state.kind==='pin')return `<div class="credential-keyboard gbkb gbkb-numeric">${'123456789'.split('').map(k=>icon(k,`sym_keyboard_num${k}`,k)).join('')}${icon('next','sym_keyboard_ok','OK')}${icon('0','sym_keyboard_num0_no_plus','0')}${icon('delete','sym_keyboard_delete','Delete')}</div>`;
      const rows=state.symbols?['1234567890','@#$%&*-=()','!"\':;/?','']:['1234567890','qwertyuiop','asdfghjkl','zxcvbnm'];
      const letters=row=>row.split('').map(k=>keyButton(state.shift&&!state.symbols?k.toUpperCase():k)).join('');
      return `<div class="credential-keyboard gbkb gbkb-qwerty">${rows.map((row,i)=>i<3?`<div class="${i===2&&!state.symbols?'gbkb-inset':''}">${letters(row)}</div>`:`<div>${icon('shift',state.shift?'sym_keyboard_shift_locked':'sym_keyboard_shift','Shift','gbkb-wide')}${letters(row)}${row?'':'<span class="gbkb-fill"></span>'}${icon('delete','sym_keyboard_delete','Delete','gbkb-wide')}</div>`).join('')}<div>${keyButton('symbols',state.symbols?'ABC':'?123','class="gbkb-double"')}${keyButton(',')}${keyButton('-')}${icon('space','sym_keyboard_space','Space','gbkb-double')}${keyButton('=')}${keyButton('.')}${icon('next','sym_keyboard_ok','OK','gbkb-double')}</div></div>`;
    }
    // LockPatternView: btn_code_lock_* inside indicator_code_lock_point_area_* rings, a white 50% path a quarter of a cell
    // wide, and the drag-direction arrow at the top edge of each ring, turned towards the next dot.
    const arrows=pattern=>pattern.slice(0,-1).map((n,i)=>{const m=pattern[i+1],angle=Math.atan2(Math.floor(m/3)-Math.floor(n/3),m%3-n%3)*180/Math.PI+90;return `<g transform="translate(${n%3*100+50} ${Math.floor(n/3)*100+50}) rotate(${angle})"><use href="#gbkg-arrow"/></g>`;}).join('');
    function grid(){return `<div class="credential-pattern gbkg-pattern${state.error?' wrong':''}${data().settings.patternVisible===false&&state.stage==='unlock'?' stealth':''}" role="group" aria-label="${escape(t('Pattern'))}"><svg viewBox="0 0 300 300" aria-hidden="true"><defs><g id="gbkg-arrow"><image class="gbkg-arrow-green" href="assets/gb-indicator_code_lock_drag_direction_green_up.png" x="-10" y="-40" width="20" height="20"/><image class="gbkg-arrow-red" href="assets/gb-indicator_code_lock_drag_direction_red_up.png" x="-10" y="-40" width="20" height="20"/></g></defs><polyline points="${state.pattern.map(n=>`${n%3*100+50},${Math.floor(n/3)*100+50}`).join(' ')}"></polyline></svg>${Array.from({length:9},(_,n)=>`<button type="button" data-lock-dot="${n}" class="${state.pattern.includes(n)?'selected':''}" aria-label="${escape(t('Dot'))} ${n+1}" aria-pressed="${state.pattern.includes(n)}"><i></i></button>`).join('')}<svg class="gbkg-arrow-layer" viewBox="0 0 300 300" aria-hidden="true"><g class="gbkg-arrows">${arrows(state.pattern)}</g></svg></div>`;}
    function message(){
      const locking=['unlock','verify'].includes(state.stage);
      if(remaining(data())&&locking)return AndroidStrings.format(t('Try again in %d seconds.'), remaining(data()));
      if(state.stage==='unlock'){
        // PatternUnlockScreen shows "Sorry, try again" after a wrong pattern; PasswordUnlockScreen only clears the field.
        if(state.kind==='pattern')return t(state.error?'Sorry, try again':'Draw pattern to unlock');
        return t(state.kind==='pin'?'Enter PIN code':'Enter password to unlock');
      }
      if(state.error)return t(state.error);
      if(state.stage==='verify')return setupHeader();
      if(state.kind==='pattern')return t(state.stage==='confirm'?'Draw your pattern again':state.stage==='create'?'Draw an unlock pattern':'Draw pattern to unlock');
      if(state.stage==='confirm')return t(state.kind==='pin'?'Confirm your PIN':'Confirm your password');
      return t(state.kind==='pin'?'Enter PIN':'Enter password');
    }
    function surface(){
      return `<p class="credential-instruction" role="status">${escape(message())}</p>${state.kind==='pattern'?grid():`<form class="credential-entry" data-lock-form><input aria-label="${escape(t(names[state.kind]))}" type="password" inputmode="none" autocomplete="off" maxlength="16" value="${escape(state.value)}"><button type="button" data-lock-key="delete" aria-label="${escape(t('Delete'))}">⌫</button></form>`}`;
    }
    /* Settings 2.3.6: ChooseLockGeneric (security_settings_picker.xml), ChooseLockPattern (choose_lock_pattern.xml with
       its header, code_lock_top / code_lock_bottom rules, footer and ButtonBar) and ChooseLockPassword (header, divider,
       field, keyboard and bottom_bar). Stage texts follow ChooseLockPattern.Stage and ChooseLockPassword. */
    const G=key=>window.GBSettings?GBSettings.text(window.AndroidI18n?.language||'en',key):key;
    function setupHeader(){
      if(state.kind==='pattern'){
        if(state.stage==='verify')return G(state.error?'lockpattern_need_to_unlock_wrong':'lockpattern_need_to_unlock');
        if(state.stage==='create')return state.error?AndroidStrings.format(G('lockpattern_recording_incorrect_too_short'), '4'):drawing?G('lockpattern_recording_inprogress'):state.pattern.length?G('lockpattern_pattern_entered_header'):G('lockpattern_recording_intro_header');
        return state.error?G('lockpattern_need_to_unlock_wrong'):drawing?G('lockpattern_recording_inprogress'):state.pattern.length?G('lockpattern_pattern_confirmed_header'):G('lockpattern_need_to_confirm');
      }
      const pin=state.kind==='pin';
      if(state.stage==='verify')return state.error?t(state.error):G(pin?'lockpassword_confirm_your_pin_header':'lockpassword_confirm_your_password_header');
      if(state.error==='Does not match. Try again.')return G(pin?'lockpassword_confirm_pins_dont_match':'lockpassword_confirm_passwords_dont_match');
      if(state.error)return AndroidStrings.format(G(pin?'lockpassword_pin_too_short':'lockpassword_password_too_short'), '4');
      return G(state.stage==='confirm'?(pin?'lockpassword_confirm_your_pin_header':'lockpassword_confirm_your_password_header'):(pin?'lockpassword_choose_your_pin_header':'lockpassword_choose_your_password_header'));
    }
    function renderSetup(){
      const titlebar=`<div class="gb-titlebar">${escape(G('lock_settings_picker_title'))}</div>`;
      if(state.stage==='choose'){
        const choice=(kind,key,id=kind)=>`<button class="gbset-row" data-lock-action="choose" data-lock-kind="${id}"><span class="gbset-text"><span class="gbset-title">${escape(G(`unlock_set_unlock_${key}_title`))}</span><span class="gbset-sum">${escape(G(`unlock_set_unlock_${key}_summary`))}</span></span></button>`;
        return `<div class="app-view gbset credential-setup" data-no-translate>${titlebar}<div class="gbset-list"><div class="gbset-cat">${escape(G('lock_settings_picker_title'))}</div>${choice('slide','none')}${choice('pattern','pattern')}${choice('pin','pin')}${choice('password','password')}<p class="credential-demo">${escape(t('Local simulator lock. Use a test code.'))}</p></div></div>`;
      }
      if(state.kind==='pattern'){
        const valid=state.pattern.length>=4&&!state.error&&!drawing;
        const left=state.stage==='create'&&state.pattern.length&&!drawing?['retry',G('lockpattern_retry_button_text')]:['cancel',G('lockpassword_cancel_label')];
        const right=state.stage==='verify'?null:[state.stage==='create'?G('lockpattern_continue_button_text'):G('lockpattern_confirm_button_text'),valid];
        const footer=state.stage==='create'&&!state.pattern.length&&!state.error?G('lockpattern_recording_intro_footer'):'';
        return `<div class="app-view gbchoose gbchoose-pattern" data-no-translate>${titlebar}<p class="credential-instruction gbchoose-header" role="status">${escape(setupHeader())}</p><i class="gbchoose-top"></i>${grid()}<i class="gbchoose-bottom"></i><p class="gbchoose-footer">${escape(footer)}</p><div class="gbchoose-buttons"><button type="button" data-lock-action="${left[0]}">${escape(left[1])}</button><span></span>${right?`<button type="button" data-lock-action="next" ${right[1]&&!busy?'':'disabled'}>${escape(right[0])}</button>`:'<span></span>'}</div></div>`;
      }
      return `<div class="app-view gbchoose gbkg-password-screen" data-no-translate>${titlebar}<p class="credential-instruction gbkg-label" role="status">${escape(setupHeader())}</p><div class="gbkg-divider"></div><form class="credential-entry gbkg-field" data-lock-form><input aria-label="${escape(t(names[state.kind]))}" type="password" inputmode="none" autocomplete="off" maxlength="16" value="${escape(state.value)}"></form><div class="gbkg-spacer"></div>${keyboard()}<div class="gbchoose-bottombar"><button type="button" data-lock-action="cancel">${escape(G('lockpassword_cancel_label'))}</button><button type="button" data-lock-action="next" ${busy?'disabled':''}>${escape(G(state.stage==='create'?'lockpassword_continue_label':'lockpassword_ok_label'))}</button></div></div>`;
    }
    const emergency=()=>`<button type="button" class="gbkg-emergency" data-lock-action="emergency"><img src="assets/gb-ic_emergency.png" alt="">${escape(t('Emergency call'))}</button>`;
    function renderLock(){
      const info=gb();
      if(state.kind==='pattern')return `<div class="lock-view gbkg gbkg-pattern-screen"><div class="gbkg-head"><div class="gbkg-carrier">${escape(carrier())}</div>${GBKeyguard.clock(info)}<div class="gbkg-date">${escape(info.date)}</div></div><div class="gbkg-divider"></div><p class="credential-instruction gbkg-status-row" role="status">${escape(message())}</p>${grid()}<div class="gbkg-footer">${emergency()}</div></div>`;
      return `<div class="lock-view gbkg gbkg-password-screen"><p class="credential-instruction gbkg-label" role="status">${escape(message())}</p><div class="gbkg-divider"></div><form class="credential-entry gbkg-field" data-lock-form><input aria-label="${escape(t(names[state.kind]))}" type="password" inputmode="none" autocomplete="off" maxlength="16" value="${escape(state.value)}"></form><div class="gbkg-spacer"></div>${keyboard()}${emergency()}</div>`;
    }
    async function next(){
      if(busy||!active()||remaining(data())&&['unlock','verify'].includes(state.stage))return;
      const value=state.kind==='pattern'?state.pattern.join(''):state.value,token=revision,model=data();
      if(!value)return;
      if(state.stage==='create'){
        state.error=validate(state.kind,value);if(!state.error){state.first=value;state.stage='confirm';state.value='';state.pattern=[];}render();return;
      }
      if(state.stage==='confirm'&&value!==state.first){state.error='Does not match. Try again.';state.value='';state.pattern=[];render();return;}
      busy=true;
      try{
        if(state.stage==='confirm'){
          const record=await credential(state.kind,value);if(token!==revision||model!==data())return;
          data().screenCredential=record;data().settings.screenLock=state.kind;data().settings.patternVisible=true;data().lockAttempts={count:0,until:0};save();cancel();
        }else{
          const record=data().screenCredential,ok=await matches(record,value);if(token!==revision||model!==data()||record!==data().screenCredential)return;
          if(ok){data().lockAttempts={count:0,until:0};save();if(state.stage==='verify'){fresh('choose',state.kind);render();}else{fresh('unlock',state.kind);unlock();}}
          else{if(state.kind!=='pattern'||value.length>=4)failed(data());save();state.error='Wrong screen lock. Try again.';state.value='';busy=false;render();if(state.kind==='pattern')clearTimer=setTimeout(()=>{if(token===revision){state.pattern=[];render();}},900);}
        }
      }catch{if(token===revision){state.error='Could not save screen lock';busy=false;render();}}
      finally{if(token===revision)busy=false;}
    }
    function updateInput(value){state.value=(state.kind==='pin'?value.replace(/\D/g,''):value).slice(0,16);state.error='';const input=document.querySelector('.credential-entry input');if(input)input.value=state.value;}
    function key(key){
      if(busy)return;
      if(key==='next'){next();return;}
      if(key==='shift'||key==='symbols'){state[key]=!state[key];render();return;}
      updateInput(key==='delete'?state.value.slice(0,-1):state.value+(key==='space'?' ':key));
    }
    function paint(point){
      const element=document.querySelector('.credential-pattern');if(!element)return;
      element.classList.remove('wrong');element.classList.toggle('drawing',!!drawing);const arrowLayer=element.querySelector('.gbkg-arrows');if(arrowLayer)arrowLayer.innerHTML=arrows(state.pattern);element.querySelectorAll('[data-lock-dot]').forEach(node=>{const selected=state.pattern.includes(Number(node.dataset.lockDot));node.classList.toggle('selected',selected);node.setAttribute('aria-pressed',String(selected));});
      const points=state.pattern.map(n=>`${n%3*100+50},${Math.floor(n/3)*100+50}`);if(point&&points.length)points.push(point.join(','));element.querySelector('polyline').setAttribute('points',points.join(' '));
    }
    function hit(x,y){const n=Math.floor(y/100)*3+Math.floor(x/100);if(x<0||x>300||y<0||y>300)return;if(Math.abs(x-(n%3*100+50))<=30&&Math.abs(y-(Math.floor(n/3)*100+50))<=30)appendPattern(state.pattern,n);}
    function bind(screen){
      screen.addEventListener('pointerdown',event=>{if(ui().locked&&event.target.closest('#status-bar')){event.preventDefault();event.stopImmediatePropagation();}},true);
      screen.addEventListener('click',event=>{
        const button=event.target.closest('[data-lock-action],[data-lock-key],[data-lock-dot]');if(!button)return;event.preventDefault();event.stopImmediatePropagation();
        if(button.disabled||busy)return;
        const action=button.dataset.lockAction;
        if(action==='open'){open();return;}if(!active())return;
        if(action==='cancel'){cancel();return;}
        if(action==='emergency'){toast('Emergency calls are unavailable in this simulator.');return;}
        if(action==='choose'){
          const kind=button.dataset.lockKind;if(['none','slide'].includes(kind)){data().settings.screenLock=kind;delete data().screenCredential;data().lockAttempts={count:0,until:0};save();cancel();}
          else if(kinds.includes(kind)){fresh('create',kind);render();}return;
        }
        if(action==='retry'){state.pattern=[];state.value='';state.error='';render();return;}
        if(action==='next'){next();return;}
        if(button.hasAttribute('data-lock-key')){key(button.dataset.lockKey);return;}
        if(event.detail===0&&button.hasAttribute('data-lock-dot')&&!remaining(data())){state.error='';appendPattern(state.pattern,Number(button.dataset.lockDot));paint();}
      },true);
      screen.addEventListener('submit',event=>{if(event.target.matches('[data-lock-form]')){event.preventDefault();event.stopImmediatePropagation();next();}},true);
      screen.addEventListener('input',event=>{if(event.target.matches('.credential-entry input')){updateInput(event.target.value);event.stopImmediatePropagation();}},true);
      screen.addEventListener('pointerdown',event=>{
        const pattern=event.target.closest('.credential-pattern');if(!pattern||busy||remaining(data())&&['unlock','verify'].includes(state.stage))return;
        event.preventDefault();event.stopImmediatePropagation();clearTimeout(clearTimer);state.pattern=[];state.error='';const header=document.querySelector('.gbchoose-header');if(header)header.textContent=G('lockpattern_recording_inprogress');const r=pattern.getBoundingClientRect();drawing={id:event.pointerId,element:pattern,rect:r,last:[(event.clientX-r.left)/r.width*300,(event.clientY-r.top)/r.height*300]};pattern.setPointerCapture(event.pointerId);hit(...drawing.last);paint(drawing.last);
      },true);
      window.addEventListener('pointermove',event=>{
        if(!drawing||event.pointerId!==drawing.id)return;event.preventDefault();event.stopImmediatePropagation();const r=drawing.rect,point=[(event.clientX-r.left)/r.width*300,(event.clientY-r.top)/r.height*300],old=drawing.last,steps=Math.max(1,Math.ceil(Math.hypot(point[0]-old[0],point[1]-old[1])/8));for(let i=1;i<=steps;i++)hit(old[0]+(point[0]-old[0])*i/steps,old[1]+(point[1]-old[1])*i/steps);drawing.last=point;paint(point);
      },true);
      window.addEventListener('pointerup',event=>{if(!drawing||event.pointerId!==drawing.id)return;event.preventDefault();event.stopImmediatePropagation();drawing=null;paint();if(['verify','unlock'].includes(state.stage))next();else{state.error=state.stage==='create'?validate('pattern',state.pattern.join('')):state.pattern.length>=4&&state.pattern.join('')!==state.first?'Does not match. Try again.':'';render();}},true);
      window.addEventListener('pointercancel',()=>{if(drawing){drawing=null;state.pattern=[];paint();}},true);
      document.addEventListener('keydown',event=>{if(!active())return;if(event.key==='Escape'&&setup()&&!ui().overlay){event.preventDefault();event.stopImmediatePropagation();cancel();return;}if(event.target.matches('input,textarea,select')||state.kind==='pattern'||event.target.matches('button')&&['Enter',' '].includes(event.key))return;if(event.key==='Enter'||event.key==='Backspace'||event.key.length===1&&!event.ctrlKey&&!event.metaKey){event.preventDefault();event.stopImmediatePropagation();key(event.key==='Enter'?'next':event.key==='Backspace'?'delete':event.key);}},true);
    }
    function tick(){if(active()&&['unlock','verify'].includes(state.stage)){const label=document.querySelector('.credential-instruction');if(label)label.textContent=message();}}
    return {open,cancel,lock,renderSetup,renderLock,bind,tick};
  }
  window.ICSLockscreen={names,secure,initialize,appendPattern,validate,credential,matches,failed,remaining,controller};
})();
