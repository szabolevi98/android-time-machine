/* GoogleCamera 4.3 BurstEditorFragment: native grid sections, selection toolbar and
   AddCreationFabMenu. Frames/creations are the simulator's own media snapshots. */
(() => {
  'use strict';
  const U=c=>c.ui.burstEditor ||= {id:'',selected:[],photo:0,menu:false},T=()=>NG.text('camera'),S=(c,k)=>c.safe(T().t(k)),image=n=>`<img src="assets/cm-${n}" alt="">`;
  const frames=c=>NG.media.photos(c).filter(p=>p.burst?.id===U(c).id),creations=c=>NG.media.photos(c).filter(p=>p.burstCreation?.id===U(c).id);
  function sync(c){if(c.ui.sub){Object.assign(U(c),{id:c.ui.sub,selected:[],photo:0,menu:false});c.ui.sub='';}const u=U(c),ids=new Set(frames(c).concat(creations(c)).map(p=>p.id));u.selected=u.selected.filter(id=>ids.has(id));if(u.photo&&!ids.has(u.photo))u.photo=0;}
  const button=(c,action,icon,label,extra='')=>`<button type="button" data-action="ngbu-${action}" aria-label="${S(c,label)}" ${extra}>${image(icon)}</button>`;
  function create(c,type){const u=U(c),p=NG.cameraCaptureModel.creation(frames(c),type,Date.now());if(!p)return;const saved=NG.media.add(c,p);u.menu=false;u.selected=[];u.photo=saved.id;c.render();}
  function render(c){sync(c);const u=U(c),all=frames(c),best=all.filter(p=>p.burst.bestFrame),made=creations(c),p=NG.photoLibrary.find(c,u.photo);
    const cell=p=>`<div class="ngbu-cell${u.selected.includes(p.id)?' selected':''}"><button type="button" data-action="ngbu-photo" data-id="${p.id}" aria-label="${c.safe(T().fmt('burst_editor_frame_description',null,p.burst?.index+1||p.id))}">${NG.media.svg(p,'',1)}</button><button type="button" class="ngbu-circle" data-action="ngbu-select" data-id="${p.id}" aria-label="${c.safe(T().fmt('burst_editor_frame_description',null,p.burst?.index+1||p.id))}">${u.selected.includes(p.id)?image('done.png'):''}</button></div>`;
    const section=(label,list,header=true)=>`${header?`<header><span>${S(c,label)}</span><small>${list.length}</small></header>`:''}<div class="ngbu-grid">${list.map(cell).join('')}</div>`;
    const createTypes=[['collage','creation_collage','ic_auto_awesome_mix.png'],['animation','creation_gif','ic_auto_awesome_motion.png'],['video','creation_video','ic_auto_awesome_video.png'],['photo_booth','creation_photo_booth','ic_auto_awesome_mix.png']];
    return `<div class="ngbu"><div class="ngbu-toolbar${u.selected.length?' selecting':''}">${button(c,'back',u.selected.length?'ic_close.png':'ic_arrow_back.png','burst_editor_navigate_up')}<span>${u.selected.length||S(c,'burst_text')}</span>${u.selected.length?`${button(c,'share','ic_share_white_24dp.svg','share_button_description')}${button(c,'delete','ic_delete_white_24dp.svg','delete_button_description')}`:`<button type="button" data-action="ngbu-photos"><img src="assets/app-photos.png" alt="Photos"></button>`}</div>${p?`<div class="ngbu-full">${NG.media.svg(p,'ngbu-image',undefined,'meet')}</div><div class="ngbu-controls">${button(c,'share','ic_share_white_24dp.svg','share_button_description')}${button(c,'edit','ic_edit_white_24dp.svg','edit_button_description')}${button(c,'delete','ic_delete_white_24dp.svg','delete_button_description')}</div>${p.kind==='video'||p.kind==='animation'?button(c,'play',u.play?'ic_pause_resume.svg':'ic_resume_pause.svg','accessibility_capture_video_start','class="ngbu-play"'):''}`:`<div class="ngbu-scroll">${best.length&&best.length!==all.length?section('burst_editor_section_header_best',best):''}${section('burst_editor_section_header_all',all,!!best.length&&best.length!==all.length)}${made.length?section('burst_creations',made):''}</div>`}${u.menu?`<div class="ngbu-dim" data-action="ngbu-menu"></div><div class="ngbu-speed">${createTypes.map(([type,label,icon])=>`<button type="button" data-action="ngbu-create" data-type="${type}"><span>${S(c,label)}</span><i>${image(icon)}</i></button>`).join('')}</div>`:''}${!p&&all.length>=2?button(c,'menu',u.menu?'ic_close.png':'ic_auto_awesome.png',u.menu?'burst_editor_close_speed_dial_description':'burst_editor_open_speed_dial_description','class="ngbu-fab"'):''}</div>`;
  }
  NG.register('burst-editor',{app:false,noStatus:()=>true,statusColor:()=> '#000',render,
    back(c){const u=U(c);if(u.menu)u.menu=false;else if(u.selected.length)u.selected=[];else if(u.photo){u.photo=0;u.play=false;}else return false;c.render();return true;},
    unmount(c){U(c).play=false;},
    mount(c,root){const area=root.querySelector('.ngbu-full');if(!area)return;let x=null;area.addEventListener('pointerdown',e=>x=e.clientX);area.addEventListener('pointerup',e=>{if(x===null||Math.abs(e.clientX-x)<40)return;const u=U(c),list=frames(c).concat(creations(c)),i=list.findIndex(p=>p.id===u.photo);u.photo=list[(i+(e.clientX<x?1:-1)+list.length)%list.length].id;u.play=false;x=null;c.render();});},
    tick(c,now){const u=U(c),p=NG.photoLibrary.find(c,u.photo);if(!u.play||!p?.frames?.length)return;const el=c.el.viewport.querySelector('.ngbu-full');if(el)el.innerHTML=NG.media.svg(p.frames[Math.floor((now-u.started)/(p.kind==='animation'?125:1000))%p.frames.length],'ngbu-image',undefined,'meet');},
    action(name,el,e,c){if(!name.startsWith('ngbu-'))return false;const u=U(c),p=NG.photoLibrary.find(c,u.photo),ids=u.selected.length?[...u.selected]:p?[p.id]:[];
      switch(name.slice(5)){
        case 'back':if(!NG.module('burst-editor').back(c))c.back();break;
        case 'photo':u.photo=+el.dataset.id;u.play=false;c.render();break;
        case 'select':{const id=+el.dataset.id;u.selected=u.selected.includes(id)?u.selected.filter(i=>i!==id):[...u.selected,id];u.menu=false;c.render();break;}
        case 'menu':u.menu=!u.menu;c.render();break;
        case 'create':create(c,el.dataset.type);break;
        case 'play':u.play=!u.play;u.started=Date.now();c.render();break;
        case 'edit':if(p)c.open('photos',`edit:${p.id}`);break;
        case 'delete':NG.photoLibrary.trash(c,ids);u.selected=[];u.photo=0;u.play=false;c.toast(T().t('filmstrip_item_deleted'));if(!frames(c).length&&!creations(c).length)c.back();else c.render();break;
        case 'share':{const first=NG.photoLibrary.find(c,ids[0]);if(first)NG.share(c,{kind:first.kind==='video'?'video':'image',photo:first.id,photos:ids,name:first.kind==='video'?'Video.mp4':'Photo.jpg'});break;}
        case 'photos':c.open('photos');break;
      }return true;
    }
  });
})();
