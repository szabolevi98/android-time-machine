/* The shared used-phone Hangouts demo, stored independently of SMS. Local data only. */
(() => {
  'use strict';
  function state(c){return c.data.hangouts ||= {threads:[{id:1,participants:[{id:2,name:'Sam Rivera',email:'sam@example.com'}],read:true,messages:[{id:1,mine:false,text:'The photos from the hike are up!',time:Date.now()-26*36e5},{id:2,mine:true,text:'They look amazing 😀',time:Date.now()-26*36e5+60000}]}],nextThread:2,nextMessage:3,drafts:{},blocked:[],prefs:{notifications:true,vibrate:true,dndUntil:0,shareStatus:true,shareDevice:true,shareCall:true,improve:false},signedOut:false};}
  const find=(c,id)=>state(c).threads.find(t=>t.id===+id);
  const title=t=>t?.name||t?.participants.map(p=>p.name).join(', ')||'';
  function create(c,people){const s=state(c),members=[...new Map(people.filter(p=>p?.id).map(p=>[p.id,{id:p.id,name:p.name,email:p.email||'',phone:p.phone||''}])).values()];if(!members.length)return null;let thread=members.length===1?s.threads.find(t=>t.participants.length===1&&t.participants[0].id===members[0].id):null;if(!thread){thread={id:s.nextThread++,participants:members,read:true,messages:[]};s.threads.push(thread);}return thread;}
  function append(c,id,message){const s=state(c),t=find(c,id);if(!t)return null;const m={...message,id:s.nextMessage++,time:message.time||Date.now()};t.messages.push(m);t.archived=false;return m;}
  function send(c,id,text,attachments=[]){text=String(text).trim();const thread=find(c,id);if(!thread||thread.left||thread.participants.some(p=>state(c).blocked.includes(p.id))||!text&&!attachments.length)return [];const out=(attachments.length?attachments:[{}]).map((a,i)=>append(c,id,{...a,mine:true,text:i===(attachments.length||1)-1?text:'',status:'sending'}));state(c).drafts[id]='';thread.read=true;return out;}
  function remove(c,id){const s=state(c);s.threads=s.threads.filter(t=>t.id!==+id);delete s.drafts[id];}
  function block(c,id){const s=state(c);id=+id;s.blocked=s.blocked.includes(id)?s.blocked.filter(p=>p!==id):[...s.blocked,id];}
  const muted=(c,t)=>state(c).signedOut||state(c).prefs.notifications===false||state(c).prefs.dndUntil>Date.now()||['none','important_only'].includes(t.notifications)||t.participants.some(p=>state(c).blocked.includes(p.id));
  NG.hangoutsModel={state,find,title,create,append,send,remove,block,muted};
})();
