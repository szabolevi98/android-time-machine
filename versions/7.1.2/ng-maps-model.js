/* Invented Riverside map data and local routing; no remote map, GPS or account requests.
   The same demo town is used in the offline web. UI resources belong to Maps 9.34.1. */
(() => {
  'use strict';
  const places=[
    {id:'park',name:'Riverside Park',kind:'Park',address:'12 Park Lane, Riverside',x:330,y:265},
    {id:'station',name:'Central Station',kind:'Train station',address:'4 Station Avenue, Riverside',x:665,y:505},
    {id:'cafe',name:'Corner Café',kind:'Café',address:'26 Main Street, Riverside',x:450,y:385},
    {id:'library',name:'City Library',kind:'Library',address:'18 River Road, Riverside',x:720,y:285},
    {id:'market',name:'Harbor Market',kind:'Market',address:'7 Harbor Street, Riverside',x:275,y:705},
    {id:'museum',name:'Hilltop Museum',kind:'Museum',address:'42 Hill Road, Riverside',x:850,y:750}
  ];
  const me={id:'me',name:'Riverside',address:'Main Street, Riverside',x:520,y:470};
  const state=c=>c.data.maps ||= {saved:[],home:'',work:'',historyEnabled:false,visits:[],searches:[],areas:[],nextArea:1};
  const find=id=>id==='me'?me:places.find(p=>p.id===id);
  function search(q){q=String(q).trim().toLocaleLowerCase();return places.filter(p=>`${p.name} ${p.kind} ${p.address}`.toLocaleLowerCase().includes(q));}
  function route(from='me',to,mode='driving'){
    const a=find(from),b=find(to);if(!a||!b||a.id===b.id)return null;
    const points=[a,{x:a.x,y:b.y},b],meters=Math.round((Math.abs(a.x-b.x)+Math.abs(a.y-b.y))*1.2);
    const speed={driving:350,walking:80,bicycling:220,transit:260}[mode]||350;
    return {from:a,to:b,mode,points,meters,minutes:Math.max(1,Math.ceil(meters/speed)+(mode==='transit'?3:0))};
  }
  function visit(c,id){const s=state(c);if(!find(id)||id==='me')return;s.visits=[{id,time:Date.now()},...s.visits.filter(p=>p.id!==id)].slice(0,50);}
  function save(c,id){const s=state(c);if(!find(id)||id==='me')return;s.saved=s.saved.includes(id)?s.saved.filter(p=>p!==id):[...s.saved,id];}
  function area(c,name,now=Date.now()){const s=state(c),a={id:s.nextArea++,name:String(name).trim()||'Riverside',started:now,readyAt:now+4000,expires:now+30*864e5,mb:24};s.areas.push(a);return a;}
  const progress=(a,now=Date.now())=>Math.min(100,Math.max(0,Math.round((now-a.started)/Math.max(1,a.readyAt-a.started)*100)));
  NG.mapsModel={places,me,state,find,search,route,visit,save,area,progress};
})();
