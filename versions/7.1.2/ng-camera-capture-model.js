/* Sensor-independent capture state for the simulator's own Camera scenes. Pointer movement
   supplies orientation/vertical travel; saved poses describe the synthetic panorama/depth sequence. */
(() => {
  'use strict';
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function targets(mode,kind){
    if(mode==='photosphere')return [0,-.34,.34].flatMap((pitch,row)=>Array.from({length:8},(_,i)=>({x:(row===1?7-i:i)*.34,y:pitch})));
    if(kind==='vertical')return Array.from({length:7},(_,i)=>({x:0,y:-i*.34}));
    if(kind==='wide_angle')return [0,-.34,.34].flatMap(y=>[-.34,0,.34].map(x=>({x,y})));
    if(kind==='fish_eye')return [{x:0,y:0},{x:-.34,y:0},{x:0,y:-.34},{x:.34,y:0},{x:0,y:.34}];
    return Array.from({length:9},(_,i)=>({x:i*.34,y:0}));
  }
  function start(mode,kind,seed,now){return {mode,kind,seed,started:now,points:targets(mode,kind),index:0,x:0,y:0,frames:[],alignedSince:null,travel:0,progress:0,warningUntil:0,lastMove:now};}
  const target=g=>g.points[g.index]||null;
  const aligned=g=>{const t=target(g);return !!t&&Math.hypot(t.x-g.x,t.y-g.y)<.055;};
  function move(g,dx,dy,now){if(g.done)return;const dt=Math.max(16,now-g.lastMove);g.lastMove=now;
    if(g.mode==='refocus'){
      const speed=Math.hypot(dx,dy)/dt;
      if(speed>1.6||Math.abs(dx)>Math.abs(dy)*1.2+8){g.warningUntil=now+700;return;}
      g.travel=clamp(g.travel-dy,0,140);g.progress=g.travel/140;if(g.progress===1)g.done=true;return;
    }
    g.x-=dx;g.y-=dy;if(!aligned(g))g.alignedSince=null;
  }
  function tick(g,now){if(g.mode==='refocus'||g.done)return false;if(!aligned(g)){g.alignedSince=null;return false;}if(g.alignedSince===null)g.alignedSince=now;if(now-g.alignedSince<350)return false;const t=target(g);g.frames.push({yaw:t.x,pitch:t.y,seed:g.seed,time:now});g.index++;g.progress=g.index/g.points.length;g.alignedSince=null;if(g.index===g.points.length)g.done=true;return true;}
  const canSave=g=>g.mode==='refocus'?g.done:g.frames.length>=2;
  function photo(g,now){if(!canSave(g))return null;if(g.mode==='refocus')return {seed:g.seed,kind:'photo',time:now,refocus:{focus:[.5,.5],strength:.6,travel:g.travel}};
    const sphere=g.mode==='photosphere',vertical=g.kind==='vertical';return {seed:g.seed,kind:'pano',time:now,ratio:sphere?2:vertical?1/3:g.kind==='fish_eye'?1:3,panorama:{type:sphere?'sphere':g.kind,complete:g.done,poses:g.frames.map(p=>({...p})),projection:sphere?'equirectangular':'cylindrical'}};}
  function burst(seed,now){return {id:'burst-'+now+'-'+seed,seed,started:now,frames:[]};}
  function burstFrame(b,now){if(b.frames.length>=40||now-b.started>5000)return false;const i=b.frames.length;b.frames.push({seed:b.seed+i*3,kind:'photo',time:now,score:((b.seed*17+i*37)%101)/100,index:i});return true;}
  function keepBurst(b,best){const ranked=[...b.frames].sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,8),top=new Set(ranked.map(p=>p.index)),list=best?b.frames.filter(p=>top.has(p.index)):b.frames;return list.map((frame,index)=>{const {score,...p}=frame;return {...p,burst:{id:b.id,index,total:b.frames.length,kept:list.length,best:best||false,bestFrame:top.has(frame.index)}};});}
  function creation(frames,type,now){if(frames.length<2||!['collage','animation','video','photo_booth'].includes(type))return null;const chosen=type==='photo_booth'?frames.slice(0,4):type==='collage'?frames.slice(0,9):frames;
    const shots=chosen.map(p=>{const {id,burst,...copy}=JSON.parse(JSON.stringify(p));return copy;});return {kind:type==='photo_booth'?'collage':type,seed:shots[0].seed,time:now,frames:shots,duration:shots.length*(type==='animation'?125:1000),ratio:type==='photo_booth'?1/4:undefined,burstCreation:{id:frames[0].burst.id,type},album:'camera'};}
  NG.cameraCaptureModel={start,target,aligned,move,tick,canSave,photo,burst,burstFrame,keepBurst,creation};
})();
