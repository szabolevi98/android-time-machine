/* Launcher3 DeepShortcutsContainer in Velvet 6.5.36: 208x48dp white pills, 4dp gaps,
   36dp icons, 9dp elevation and a 10x8dp arrow. Entries/intents/texts come from each
   N2G48C APK's own android.app.shortcuts XML (ng-launcher-data.js). */
(() => {
  'use strict';
  const items=app=>(NG.appShortcuts||[]).filter(s=>s.app===app).slice(0,4);
  function close(c){if(c.ui.home)c.ui.home.suppressClick=false;if(c.ui.drawer)c.ui.drawer.held=false;c.closeOverlay();}
  const label=(c,item,long=false)=>{const text=long&&item.longLabel?.en?item.longLabel:item.label;return text?.[c.lang]||text?.en||item.id;};
  function open(c,app,id) {
    const item=items(app).find(s=>s.id===id);if(!item)return;
    const key=String(id), lower=key.toLowerCase();
    if(app==='chrome'){c.open('chrome',lower.includes('incognito')?'shortcut:incognito':'shortcut:new-tab');return;}
    if(app==='contacts'||app==='phone'){c.open('contacts','new');return;}
    if(app==='calendar'){c.open('calendar',lower.includes('reminder')?'shortcut:reminder':'shortcut:event');return;}
    if(app==='camera'){c.open('camera',key==='selfie'?'shortcut:selfie':'shortcut:video');return;}
    if(app==='gmail'){c.open('gmail','shortcut:compose');return;}
    if(app==='messenger'){c.open('messenger','to:');return;}
    if(app==='search'){NG.googleOpen(c,lower.includes('voice'));return;}
    if(app==='settings'){c.open('settings',lower.includes('wifi')?'wifi':lower.includes('battery')?'battery':'data-usage');return;}
    c.open(app,'shortcut:'+key);
  }
  function pinItem(c,item) {return {type:'shortcut',app:item.app,deepId:item.id,label:label(c,item),icon:item.icon||NG.appsData[item.app]?.icon};}
  function show(c,app,anchor,origin,onDrag) {
    const list=items(app);if(!list.length)return false;
    NG.ime?.hide();const screen=c.el.screen.getBoundingClientRect(),r=anchor.getBoundingClientRect(),dp=screen.width/411.4286, height=list.length*52+12;
    const top=(r.top-screen.top)/dp, bottom=(r.bottom-screen.top)/dp, above=top>height+24;
    const x=Math.min(411.4286-208-8,Math.max(8,(r.left-screen.left)/dp));
    c.ui.deepShortcuts={app,list,origin,onDrag,created:Date.now(),x,y:above?top-height-4:bottom+4,above,arrow:Math.max(19,Math.min(189,(r.left+r.width/2-screen.left)/dp-x)),heldAt:0};
    c.overlay('shortcuts');
    setTimeout(()=>{if(c.ui.home)c.ui.home.suppressClick=false;if(c.ui.drawer)c.ui.drawer.held=false;},700);
    return true;
  }
  const previous=NG.openShortcut;
  NG.openShortcut=(c,item)=>{if(item.deepId)open(c,item.app,item.deepId);else previous?.(c,item);};
  NG.shortcuts={items,show,open,label:(c,app,id)=>{const it=items(app).find(x=>x.id===id);return it?label(c,it):'';}};
  NG.register('shortcuts',{
    app:false,
    render(c){const s=c.ui.deepShortcuts;if(!s)return '';return `<div class="ngsc"><div class="ngsc-out" data-action="ngsc-close"></div><div class="ngsc-list${s.above?' above':''}" style="left:calc(${s.x} * var(--dp));top:calc(${s.y} * var(--dp));--arrow:${s.arrow}">${s.list.map((item,i)=>`<button type="button" class="ngsc-item" data-action="ngsc-open" data-index="${i}" aria-label="${c.safe(label(c,item,true))}"><span class="ngsc-icon"><img src="${c.safe(item.icon||NG.appsData[item.app]?.icon||'')}" alt=""></span><span class="ngsc-label">${c.safe(label(c,item,true))}</span><i class="ngsc-handle"></i></button>`).join('')}<i class="ngsc-arrow"></i></div></div>`;},
    mount(c,root){
      const spec=c.ui.deepShortcuts;
      if(spec.origin&&spec.onDrag){const {x,y}=spec.origin;
        const move=e=>{if(Math.hypot(e.clientX-x,e.clientY-y)>16*c.el.screen.clientWidth/411.4286){off();close(c);spec.onDrag(e.clientX,e.clientY);}};
        const off=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',off);window.removeEventListener('pointercancel',off);};
        window.addEventListener('pointermove',move);window.addEventListener('pointerup',off,{once:true});window.addEventListener('pointercancel',off,{once:true});
      }
      root.querySelectorAll('.ngsc-item').forEach(el=>el.addEventListener('pointerdown',e=>{
        if(e.button)return;const item=spec.list[+el.dataset.index],x=e.clientX,y=e.clientY;let timer;
        const begin=(px,py)=>{off();spec.heldAt=Date.now();close(c);NG.launcherDragNew(c,pinItem(c,item),px,py);};
        const move=e=>{if(Math.hypot(e.clientX-x,e.clientY-y)>16)begin(e.clientX,e.clientY);};
        const off=()=>{clearTimeout(timer);window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',off);window.removeEventListener('pointercancel',off);};
        timer=setTimeout(()=>begin(x,y),500);window.addEventListener('pointermove',move);window.addEventListener('pointerup',off,{once:true});window.addEventListener('pointercancel',off,{once:true});
      }));
    },
    action(name,el,e,c){const s=c.ui.deepShortcuts;if(name==='ngsc-close'){if(Date.now()-s.created>=300)close(c);return true;}if(name==='ngsc-open'){if(Date.now()-s.heldAt<700)return true;const item=s.list[+el.dataset.index];close(c);if(item)open(c,item.app,item.id);return true;}return false;},
    back(c){close(c);return true;}
  });
})();
