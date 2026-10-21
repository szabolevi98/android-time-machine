/* The screen savers of N2G48C (DreamManagerService, Settings › Display › Screen saver › Start now; c.open('daydream', id)):
   - Clock: DeskClock 4.6.1's Screensaver (desk_clock_saver): the 64 sp big_thin digital clock or the analog
     clock_analog_* dial, the date and the next alarm in white on black; screensaver_settings' Style (digital by default)
     and Night mode (on by default: the very dim display). ScreensaverMoveSaverRunnable moves it to a new place each
     minute, fading out and in.
   - Colors: BasicDreams' Colors, a slowly turning wash of colour.
   - Photos: Google Photos' daydream, the device albums' photos one after another, slowly panning; its settings
     (DreamSettingsActivity: General with Only use Wifi for data, Albums on device, Albums in Google Photos).
   Any touch or key wakes the dream back to the screen it covered. */
(() => {
  'use strict';
  const T=()=>NG.text('dreams'),t=k=>T().t(k);
  const P=(c,k,d)=>NG.appPref(c,'clocksaver',k,d);
  const U=c=>c.ui.dream ||= {id:'clock',pos:{x:.5,y:.4},moved:0,index:0,shown:0};
  const albums=c=>[...new Set(NG.media.photos(c).map(p=>p.album||'camera'))];
  const albumName=a=>a==='camera'?t('photos_localmedia_core_camera_label'):a.charAt(0).toUpperCase()+a.slice(1);
  const chosen=c=>{const sel=c.data.dreams?.albums;return NG.media.photos(c).filter(p=>!sel||sel.includes(p.album||'camera'));};
  function clockHtml(c){const now=new Date(),loc=c.locale(),style=P(c,'screensaver_clock_style','digital'),night=P(c,'screensaver_night_mode',true)!==false,u=U(c);
    const date=new Intl.DateTimeFormat(loc,{weekday:'short',month:'short',day:'numeric'}).format(now),next=NG.clock?.nextAlarm?.(c);
    const alarm=next?new Intl.DateTimeFormat(loc,{weekday:'short',hour:'numeric',minute:'2-digit'}).format(new Date(next)):'';
    const h=now.getHours()%12+now.getMinutes()/60,m=now.getMinutes()+now.getSeconds()/60,s=now.getSeconds();
    const main=style==='analog'?`<div class="ngsv-analog"><img src="assets/sv-dial.svg" alt=""><img style="transform:rotate(${h*30}deg)" src="assets/sv-hour.svg" alt=""><img style="transform:rotate(${m*6}deg)" src="assets/sv-minute.svg" alt=""><img style="transform:rotate(${s*6}deg)" src="assets/sv-second.svg" alt=""></div>`:`<div class="ngsv-digital">${c.safe(new Intl.DateTimeFormat(loc,{hour:'numeric',minute:'2-digit'}).format(now).replace(/\s?[AP]M$/i,''))}</div>`;
    return `<div class="ngsv-clock${night?' night':''}" style="left:${(u.pos.x*100).toFixed(1)}%;top:${(u.pos.y*100).toFixed(1)}%">${main}<div class="ngsv-date">${c.safe(date)}${alarm?`<span class="ngsv-alarm"><img src="assets/dc-ic_alarm_small.svg" alt="">${c.safe(alarm)}</span>`:''}</div></div>`;}
  function photosHtml(c){const list=chosen(c),u=U(c);if(!list.length)return '';const p=list[u.index%list.length];return `<div class="ngsv-photo" style="animation-delay:-${((Date.now()-u.shown)/1000).toFixed(1)}s">${NG.media.svg(p,'ngsv-svg')}</div>`;}
  function render(c){const u=U(c);if(c.ui.sub){u.id=c.ui.sub;c.ui.sub='';u.moved=Date.now();u.shown=Date.now();u.index=0;}
    return `<div class="ngsv is-${u.id}" data-action="ngsv-wake">${u.id==='clock'?clockHtml(c):u.id==='colors'?'<div class="ngsv-colors"></div>':photosHtml(c)}</div>`;}
  NG.register('daydream',{render,statusColor:()=> '#000',noStatus:()=>true,noNav:()=>true,keepAwake:()=>true,timeout:()=>-1,
    back(c){return false;},
    action(name,el,e,c){if(name!=='ngsv-wake')return false;c.back();return true;},
    tick(c){if(c.ui.view!=='daydream')return;const u=U(c),now=Date.now();
      if(u.id==='clock'){if(now-u.moved>=60000){u.moved=now;u.pos={x:.25+Math.random()*.5,y:.2+Math.random()*.55};const el=c.el.viewport.querySelector('.ngsv-clock');if(el){el.classList.add('fade');setTimeout(()=>{if(c.ui.view==='daydream')c.render();},500);return;}}c.render();}
      else if(u.id==='photos'&&now-u.shown>=6000){u.index++;u.shown=now;c.render();}}
  });
  // Google Photos' DreamSettingsActivity, drawn as a Settings page over the screen saver list.
  NG.settingsScreens['photos-dream']={
    render:c=>{const d=c.data.dreams ||= {},sel=d.albums,row=r=>({html:NG.settingsRow(c,r),sel:true}),cat=k=>({html:NG.settingsCat(c,t(k)),sel:false});
      return `<div class="ngst-list">${NG.settingsJoinRows([cat('photos_daydream_general_settings_header'),row({title:t('photos_daydream_use_only_wifi'),widget:NG.settingsSwitch(d.wifiOnly!==false),action:'ngsv-wifi'}),cat('photos_daydream_local_photos_header'),...albums(c).map(a=>row({title:albumName(a),widget:`<i class="ngst-check${!sel||sel.includes(a)?' on':''}"></i>`,action:'ngsv-album',data:` data-a="${c.safe(a)}"`})),cat('photos_daydream_remote_photos_header')])}</div>`;},
    action(c,name,el){const d=c.data.dreams ||= {};if(name==='ngsv-wifi'){d.wifiOnly=d.wifiOnly===false;c.save();c.render();return true;}
      if(name==='ngsv-album'){const all=albums(c),cur=d.albums||all.slice(),a=el.dataset.a;d.albums=cur.includes(a)?cur.filter(x=>x!==a):[...cur,a];if(d.albums.length===all.length)delete d.albums;c.save();c.render();return true;}return false;}
  };
})();
