/* Music2 6.13: saved local playlists and a media clock. MediaStore entries come
   from the same Documents provider as attachments; a fresh account has no songs. */
(() => {
  'use strict';
  const state=c=>c.data.music ||= {playlists:[],ratings:{},queue:[],index:0,position:0,playing:false,last:0,repeat:0,shuffle:false,recent:[],nextId:1};
  function tracks(c){return (NG.documents?.nodes(c)||[]).filter(n=>n.type==='audio'&&!n.driveId&&!n.id.startsWith('drive:')).map(n=>({...n,title:n.title||n.name.replace(/\.[^.]+$/,''),artist:n.artist||'',album:n.album||'',genre:n.genre||'',duration:Math.max(1000,+n.duration||180000),icon:n.art||'assets/mu-album.png'}));}
  const find=(c,id)=>tracks(c).find(n=>n.id===id);
  const current=c=>find(c,state(c).queue[state(c).index]);
  function playlist(c,name,description='',isPublic=false){name=String(name).trim();if(!name)return null;const s=state(c),p={id:'playlist-'+s.nextId++,name:name.slice(0,200),description:String(description).slice(0,2000),public:!!isPublic,tracks:[]};s.playlists.push(p);return p;}
  function add(c,pid,id){const p=state(c).playlists.find(p=>p.id===pid);if(!p||!find(c,id))return false;if(!p.tracks.includes(id))p.tracks.push(id);return true;}
  function removePlaylist(c,pid){const s=state(c);s.playlists=s.playlists.filter(p=>p.id!==pid);}
  function start(c,ids,id,now=Date.now()){const s=state(c),queue=ids.filter(x=>find(c,x));if(!queue.length)return false;s.queue=queue;s.index=Math.max(0,queue.indexOf(id));s.position=0;s.last=now;s.playing=true;record(c);return true;}
  function record(c){const s=state(c),it=current(c);if(it)s.recent=[it.id,...s.recent.filter(id=>id!==it.id)].slice(0,40);}
  function pause(c,now=Date.now()){tick(c,now);state(c).playing=false;}
  function toggle(c,now=Date.now()){const s=state(c),it=current(c);if(!it)return false;if(s.playing)pause(c,now);else{if(s.position>=it.duration)s.position=0;s.last=now;s.playing=true;}return true;}
  function seek(c,value,now=Date.now()){const it=current(c),s=state(c);if(!it||!Number.isFinite(+value))return false;s.position=Math.max(0,Math.min(it.duration,+value));s.last=now;return true;}
  function advance(c,dir=1,now=Date.now(),ended=false){const s=state(c),it=current(c);if(!it)return false;if(dir<0&&s.position>3000){s.position=0;s.last=now;return true;}let next=s.index+dir;if(ended&&s.repeat===1)next=s.index;else if(s.shuffle&&s.queue.length>1){const offset=1+Math.floor(Math.random()*(s.queue.length-1));next=(s.index+offset)%s.queue.length;}if(next>=s.queue.length){if(s.repeat===2)next=0;else{s.position=it.duration;s.playing=false;return false;}}if(next<0)next=s.repeat===2?s.queue.length-1:0;s.index=next;s.position=0;s.last=now;record(c);return true;}
  function reconcile(c){const s=state(c),valid=new Set(tracks(c).map(it=>it.id)),id=s.queue[s.index],before=s.queue.slice(0,s.index).filter(id=>valid.has(id)).length;s.queue=s.queue.filter(id=>valid.has(id));s.index=Math.min(before,Math.max(0,s.queue.length-1));if(s.queue[s.index]!==id)s.position=0;for(const p of s.playlists)p.tracks=p.tracks.filter(id=>valid.has(id));}
  function tick(c,now=Date.now()){reconcile(c);const s=state(c),it=current(c);if(s.sleepAt&&now>=s.sleepAt){s.playing=false;delete s.sleepAt;return;}if(!it){s.playing=false;return;}if(!s.playing)return;s.position+=Math.max(0,now-s.last);s.last=now;if(s.position>=it.duration)advance(c,1,now,true);}
  function queueRemove(c,index){const s=state(c);if(index<0||index>=s.queue.length)return false;const before=current(c)?.id;s.queue.splice(index,1);if(index<s.index)s.index--;else if(s.index>=s.queue.length)s.index=Math.max(0,s.queue.length-1);if(current(c)?.id!==before){s.position=0;s.last=Date.now();}if(!s.queue.length)s.playing=false;return true;}
  function queueMove(c,from,to){const s=state(c);if(from<0||to<0||from>=s.queue.length||to>=s.queue.length)return false;const playingIndex=s.index,item=s.queue.splice(from,1)[0];s.queue.splice(to,0,item);s.index=playingIndex===from?to:from<playingIndex&&to>=playingIndex?playingIndex-1:from>playingIndex&&to<=playingIndex?playingIndex+1:playingIndex;return true;}
  NG.musicModel={state,tracks,find,current,playlist,add,removePlaylist,start,pause,toggle,seek,advance,tick,queueRemove,queueMove,reconcile};
})();
