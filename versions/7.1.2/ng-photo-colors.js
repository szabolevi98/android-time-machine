/* Photos 1.25 native 17³ lookup tables, two intensity endpoints per PNG.
   libnative ApplyLook's 0..0.5 blend is identity→left; 0.5..1 is left→right.
   Pluto/Eris use the native 0.30/0.59/0.11 monochrome base. Rasterization only
   touches the simulator's drawn media; all LUT assets are unmodified APK bytes. */
(() => {
 'use strict';
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const advanced=['exposure','contrast','highlights','midtones','shadows','blackPoint','saturation','temperature','tint','skinTone','deepBlue','vignette','style'];
 // Own scene-processing approximation, with native PipelineParams ranges. The
 // proprietary CPE tone engine is not shipped as browser code; native look LUTs
 // below remain exact. Selective saturation uses smooth colour masks.
 function adjust(rgb,e={}){const v=k=>clamp(+e[k]||0,-100,100)/100,luma=rgb[0]*.3+rgb[1]*.59+rgb[2]*.11,y=luma/255,skin=clamp((rgb[0]-rgb[2])/90,0,1)*clamp(1-Math.abs(rgb[1]-(rgb[0]+rgb[2])/2)/90,0,1),blue=clamp((rgb[2]-Math.max(rgb[0],rgb[1]))/100,0,1),sat=1+v('saturation')+v('skinTone')*skin+v('deepBlue')*blue,exposure=2**(v('exposure')*2),contrast=1+v('contrast')*.8,style=v('style');
  return rgb.map((n,i)=>{let out=(luma+(n-luma)*Math.max(0,sat))*exposure;out=(out-127.5)*contrast+127.5;out+=v('shadows')*90*(1-y)**2+v('highlights')*90*y*y+v('midtones')*75*4*y*(1-y)-v('blackPoint')*70*(1-y)**3;out+=(i===0?1:i===2?-1:0)*v('temperature')*35+(i===1?-1:.5)*v('tint')*30;out=out*(1+style*.18)+style*(i===2?2:10);return clamp(Math.round(out),0,255);});
 }
 function sample(pixels,rgb,intensity=.5,mono=false){const q=rgb.map(n=>clamp(n,0,255)*16/255),lo=q.map(Math.floor),hi=lo.map(n=>Math.min(16,n+1)),f=q.map((n,i)=>n-lo[i]),left=[0,0,0],right=[0,0,0];
  for(let z=0;z<2;z++)for(let y=0;y<2;y++)for(let x=0;x<2;x++){const a=x?hi[0]:lo[0],b=y?hi[1]:lo[1],d=z?hi[2]:lo[2],weight=(x?f[0]:1-f[0])*(y?f[1]:1-f[1])*(z?f[2]:1-f[2]),index=((d*17+b)*34+a)*4;for(let k=0;k<3;k++){left[k]+=pixels[index+k]*weight;right[k]+=pixels[index+17*4+k]*weight;}}
  const amount=clamp(+intensity||0,0,1),base=mono?Array(3).fill(rgb[0]*.3+rgb[1]*.59+rgb[2]*.11):rgb;
  return (amount<.5?base.map((v,i)=>v+(left[i]-v)*amount*2):left.map((v,i)=>v+(right[i]-v)*(amount*2-1))).map(n=>clamp(Math.round(n),0,255));
 }
 const tables=new Map(),cache=new Map(),jobs=new Map(),byId=new Map();let seq=0;
 function table(id){if(!tables.has(id))tables.set(id,new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>{try{const canvas=document.createElement('canvas');canvas.width=34;canvas.height=289;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);resolve(ctx.getImageData(0,0,34,289).data);}catch(e){reject(e);}};image.onerror=reject;image.src=`assets/ph-lut-${id}.png`;}));return tables.get(id);}
 const wrapper=(cls,fit,v,url)=>`<svg class="${cls}" viewBox="${v.join(' ')}" preserveAspectRatio="xMidYMid ${fit||(cls==='ngphotos-full'?'meet':'slice')}" aria-hidden="true"><image href="${url}" x="${v[0]}" y="${v[1]}" width="${v[2]}" height="${v[3]}" preserveAspectRatio="none"/></svg>`;
 function render(p,cls,ratio,fit,base,v,makeBase){const id=+p.edits?.look||0;if(id>14||!id&&!advanced.some(k=>+p.edits?.[k]))return base;const thumb=/ngphotos-svg|ngcm-tsvg|ngdocs-thumb|ngms-gallery/.test(cls),max=thumb?192:1100,aspect=v[2]/v[3],w=Math.max(1,Math.round(aspect>=1?max:max*aspect)),h=Math.max(1,Math.round(aspect>=1?max/aspect:max));
  const snapshot=JSON.parse(JSON.stringify(p)),key=JSON.stringify([snapshot,cls,ratio,fit,w,h]);if(cache.has(key))return cache.get(key)||base;
  if(!jobs.has(key)){const tag=++seq,promise=(async()=>{try{
    const nested=[...base.matchAll(/data-nglut="(\d+)"/g)].map(m=>byId.get(+m[1])).filter(Boolean);if(nested.length)await Promise.allSettled(nested);const raw=nested.length?makeBase(snapshot):base,pixels=id?await table(id):null,image=new Image();image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(raw.replace('<svg ',`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" `));await image.decode();
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,w,h);const frame=ctx.getImageData(0,0,w,h),data=frame.data,colors=new Map(),strength=snapshot.edits.lookIntensity??.5;
    for(let i=0;i<data.length;i+=4){const code=(data[i]<<16)|(data[i+1]<<8)|data[i+2];let color=colors.get(code);if(!color){color=adjust([data[i],data[i+1],data[i+2]],snapshot.edits);if(pixels)color=sample(pixels,color,strength,id>12);colors.set(code,color);}const px=(i/4%w)/w,py=Math.floor(i/4/w)/h,shade=1-clamp(+snapshot.edits.vignette||0,0,100)/100*clamp(((px-.5)**2+(py-.5)**2)*1.8,0,1);data[i]=color[0]*shade;data[i+1]=color[1]*shade;data[i+2]=color[2]*shade;}ctx.putImageData(frame,0,0);const html=wrapper(cls,fit,v,canvas.toDataURL('image/png'));cache.set(key,html);requestAnimationFrame(()=>document.querySelectorAll(`svg[data-nglut="${tag}"]`).forEach(el=>el.outerHTML=html));
   }catch{cache.set(key,null);}finally{jobs.delete(key);while(cache.size>96)cache.delete(cache.keys().next().value);}})();jobs.set(key,{tag,promise});byId.set(tag,promise);promise.finally(()=>byId.delete(tag));}
  return base.replace('<svg ',`<svg data-nglut="${jobs.get(key).tag}" `);
 }
 NG.photoColors={sample,render,table,adjust};
})();
