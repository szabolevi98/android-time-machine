/* Photos 1.25 on N2G48C: local library operations. Demo media stay on this browser;
   the 60-day trash lifetime and nondestructive edits match the image's Photos resources.
   Album membership survives trash/restore, while permanent removal also removes stale memberships. */
(() => {
  'use strict';
  const DAY = 864e5, clone = x => JSON.parse(JSON.stringify(x));
  NG.defaults.photoLibrary = {seen: false, backup: false, quality: 'original', albums: [], columns: 3};
  const state = c => c.data.photoLibrary || (c.data.photoLibrary = clone(NG.defaults.photoLibrary));
  const all = c => NG.media.all(c);
  const find = (c, id) => all(c).find(p => p.id === +id);
  function purge(c, ids) {
    const gone = new Set(ids.map(Number));
    c.data.photos = all(c).filter(p => !gone.has(p.id));
    for (const a of state(c).albums) a.ids = a.ids.filter(id => !gone.has(id));
    c.save();
  }
  function expire(c, now = Date.now()) {
    const ids = all(c).filter(p => p.trashedAt && now - p.trashedAt >= 60 * DAY).map(p => p.id);
    if (ids.length) purge(c, ids);
  }
  const list = (c, trash = false) => all(c).filter(p => !p.appPrivate && !!p.trashedAt === trash).slice().sort((a, b) => b.time - a.time || b.id - a.id);
  function trash(c, ids, now = Date.now()) { for (const id of ids) { const p = find(c, id); if (p && !p.trashedAt) p.trashedAt = now; } c.save(); }
  function restore(c, ids) { for (const id of ids) { const p = find(c, id); if (p) delete p.trashedAt; } c.save(); }
  function album(c, name, ids, shared = false) {
    const s = state(c), a = {id: Math.max(0, ...s.albums.map(a => a.id)) + 1, name: name.trim(), ids: [], shared};
    s.albums.push(a); addTo(c, a.id, ids); return a;
  }
  function addTo(c, id, ids) {
    const a = state(c).albums.find(a => a.id === +id); if (!a) return;
    a.ids = [...new Set([...a.ids, ...ids.map(Number).filter(id => { const p = find(c, id); return p && !p.trashedAt; })])]; c.save();
  }
  function edits(e = {}) {
    const crop = e.crop || [0, 0, 1, 1], clamp = (n, min, max) => Math.max(min, Math.min(max, +n || 0));
    const x = clamp(crop[0], 0, .9), y = clamp(crop[1], 0, .9);
    const out = {turn: ((Math.round(+e.turn || 0) % 4) + 4) % 4, crop: [x, y, clamp(crop[2], .1, 1 - x), clamp(crop[3], .1, 1 - y)],
      light: clamp(e.light, -100, 100), color: clamp(e.color, -100, 100), pop: clamp(e.pop, -100, 100),...(+e.look>0?{look:Math.round(clamp(e.look,1,14)),lookIntensity:e.lookIntensity===undefined?.5:clamp(e.lookIntensity,0,1)}:{})};
    for (const key of ['exposure','contrast','highlights','midtones','shadows','blackPoint','saturation','temperature','tint','skinTone','deepBlue','vignette','style','straighten']) {
      const value=clamp(e[key],key==='vignette'||key==='style'?0:key==='straighten'?-45:-100,key==='straighten'?45:100);
      if(value)out[key]=value;
    }
    return out;
  }
  // Rotation is applied about the quarter-turned image centre. The scale covers
  // the rectangular canvas at every tilt so a saved crop never exposes corners.
  function tilt(e,w,h) {const angle=Math.max(-45,Math.min(45,+e?.straighten||0)),a=angle*Math.PI/180,s=Math.abs(Math.sin(a)),co=Math.abs(Math.cos(a));return {angle,scale:Math.max(co+s*h/w,co+s*w/h)};}
  function sourcePoint(p,x,y) {const w=400*(p.ratio||(p.kind==='pano'?3:4/3)),h=400,turn=((p.edits?.turn||0)%4+4)%4,rw=turn%2?h:w,rh=turn%2?w:h,q=tilt(p.edits,rw,rh),a=-q.angle*Math.PI/180,dx=(x-rw/2)/q.scale,dy=(y-rh/2)/q.scale; x=rw/2+dx*Math.cos(a)-dy*Math.sin(a);y=rh/2+dx*Math.sin(a)+dy*Math.cos(a);const v=turn===1?[y,h-x]:turn===2?[w-x,h-y]:turn===3?[w-y,x]:[x,y];return [Math.max(0,Math.min(1,v[0]/w)),Math.max(0,Math.min(1,v[1]/h))];}
  function saveEdit(c, id, e, copy = false) {
    const p = find(c, id); if (!p || p.trashedAt) return null;
    if (copy) { const {id: oldId, appPrivate, ...item} = clone(p); return NG.media.add(c, {...item, edits: edits(e), time: Date.now()}); }
    p.edits = edits(e); c.save(); return p;
  }
  NG.photoLibrary = {state, find, list, trash, restore, purge, expire, album, addTo, edits, saveEdit, tilt, sourcePoint};
})();
