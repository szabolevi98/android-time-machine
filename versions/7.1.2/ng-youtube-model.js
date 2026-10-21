/* YouTube 11.41.56: invented offline catalogue and browser-local account data.
   No external videos, view counts, comments or subscriptions are fetched. */
(() => {
  'use strict';
  const videos=[
    {id:'nougat',title:'Android 7.1.2: a quick tour',channel:'Android Time Machine',duration:94000,views:4328,seed:17,description:'Explore the Nexus 6P, split-screen apps, quick settings and the Android timeline.'},
    {id:'river',title:'A walk by the river',channel:'Riverside Walks',duration:127000,views:1892,seed:31,description:'A quiet afternoon on the Riverside trail.'},
    {id:'material',title:'Material Design in motion',channel:'Design Notes',duration:78000,views:7240,seed:12,description:'Colour, surfaces and motion in a short design study.'},
    {id:'camera',title:'Nexus 6P camera walk',channel:'Android Time Machine',duration:112000,views:3017,seed:8,description:'Mountains, sunlight and a few camera tips.'},
    {id:'coffee',title:'Coffee at Riverside',channel:'Riverside Walks',duration:63000,views:946,seed:42,description:'A morning coffee and a view of the city.'},
    {id:'timeline',title:'The Android timeline',channel:'Android Time Machine',duration:145000,views:12048,seed:5,description:'From the first Android phones to Nougat.'}
  ];
  const find=(id,c)=>videos.find(v=>v.id===id)||(c&&state(c).uploads.find(v=>v.id===id));
  function state(c){const s=c.data.youtube ||= {ratings:{},subscriptions:[],later:[],playlists:[],history:[],searches:[],nextPlaylist:1};for(const key of ['subscriptions','later','playlists','history','searches','uploads'])if(!Array.isArray(s[key]))s[key]=[];s.ratings ||= {};s.nextPlaylist ||= 1;return s;}
  const pref=(c,key,def)=>NG.appPref?.(c,'youtube',key,def)??def;
  function list(c,{tab='home',query='',channel='',collection=''}={}){const s=state(c);let ids;
    if(collection==='history')ids=[...s.history].sort((a,b)=>b.time-a.time).map(h=>h.id);
    else if(collection==='later')ids=s.later;
    else if(collection==='liked')ids=[...videos,...s.uploads].filter(v=>s.ratings[v.id]===1).map(v=>v.id);
    else if(collection)ids=s.playlists.find(p=>p.id===collection)?.videos||[];
    let out=collection==='uploads'?s.uploads.slice():ids?ids.map(id=>find(id,c)).filter(Boolean):(query||channel?[...videos,...s.uploads]:videos.slice());
    if(tab==='subscriptions')out=out.filter(v=>s.subscriptions.includes(v.channel));
    if(tab==='trending')out.sort((a,b)=>b.views-a.views);
    if(channel)out=out.filter(v=>v.channel===channel);
    const q=query.trim().toLocaleLowerCase();if(q)out=out.filter(v=>(v.title+' '+v.channel+' '+v.description).toLocaleLowerCase().includes(q));
    return out;
  }
  function record(c,id,position=0){if(!find(id,c)||pref(c,'pause_watch_history',false))return;const s=state(c),old=s.history.find(v=>v.id===id),entry={id,time:Date.now(),position:Math.max(0,Math.min(find(id,c).duration,position))};if(old)Object.assign(old,entry);else s.history.unshift(entry);s.history=s.history.slice(0,100);}
  function search(c,query){query=String(query).trim();if(!query||pref(c,'pause_search_history',false))return;const s=state(c);s.searches=[query,...s.searches.filter(x=>x!==query)].slice(0,20);}
  function rate(c,id,value){if(!find(id,c)||![1,-1].includes(value))return;const s=state(c);s.ratings[id]=s.ratings[id]===value?0:value;}
  function subscribe(c,channel){if(!videos.some(v=>v.channel===channel))return;const s=state(c);s.subscriptions=s.subscriptions.includes(channel)?s.subscriptions.filter(x=>x!==channel):[...s.subscriptions,channel];}
  function save(c,id,collection,on=true){if(!find(id,c))return false;const s=state(c),items=collection==='later'?s.later:s.playlists.find(p=>p.id===collection)?.videos;if(!items)return false;const at=items.indexOf(id);if(on&&at<0)items.push(id);else if(!on&&at>=0)items.splice(at,1);return true;}
  function playlist(c,title,privacy='private',description=''){if(typeof title!=='string'||!title.trim()||title.trim().length>150||!['private','unlisted','public'].includes(privacy))return null;const s=state(c);while(s.playlists.some(p=>p.id==='p'+s.nextPlaylist))s.nextPlaylist++;const p={id:'p'+s.nextPlaylist++,title:title.trim(),description,privacy,videos:[]};s.playlists.push(p);return p;}
  function remove(c,id){const s=state(c);s.playlists=s.playlists.filter(p=>p.id!==id);}
  function upload(c,node,{title,description='',privacy='public'}={}){if(node?.type!=='video'||!title?.trim()||title.length>100||!['private','unlisted','public'].includes(privacy))return null;const snapshot=node.mediaSnapshot||(node.photo&&NG.photoLibrary?.find(c,node.photo)),s=state(c);s.nextUpload ||= 1;while(find('upload-'+s.nextUpload,c))s.nextUpload++;const v={id:'upload-'+s.nextUpload++,title:title.trim(),description,privacy,channel:NG.account?.name||'Nexus 6P',duration:node.duration||snapshot?.duration||1000,views:0,seed:snapshot?.seed||0,source:snapshot?JSON.parse(JSON.stringify(snapshot)):undefined};s.uploads.unshift(v);return v;}
  function removeUpload(c,id){const s=state(c);if(!s.uploads.some(v=>v.id===id))return false;s.uploads=s.uploads.filter(v=>v.id!==id);s.history=s.history.filter(v=>v.id!==id);s.later=s.later.filter(v=>v!==id);for(const p of s.playlists)p.videos=p.videos.filter(v=>v!==id);delete s.ratings[id];if(s.comments)delete s.comments[id];return true;}
  NG.youtubeModel={videos,find,state,list,record,search,rate,subscribe,save,playlist,remove,upload,removeUpload};
})();
