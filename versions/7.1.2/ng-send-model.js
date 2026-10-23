/* Enabled ACTION_SEND activities/aliases of the N2G48C APK manifests. VideoShareIntentActivity is a separate alias
   in Messenger and Hangouts; Hangouts has no audio SEND filter. MIME matching follows IntentFilter.matchDataType. */
(() => {
  'use strict';
  const TYPES = {
    beam: ['*/*'],
    bluetooth: ['image/*', 'video/*', 'audio/*', 'text/x-vcard', 'text/plain', 'text/html', 'text/xml', 'application/zip', 'application/vnd.ms-excel', 'application/msword', 'application/vnd.ms-powerpoint', 'application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/x-hwp'],
    cloudprint: ['*/*'], clipboard: ['text/plain'], drive: ['*/*'], gmail: ['*/*'],
    hangouts: ['image/*', 'text/plain', 'video/*'], messenger: ['text/plain', 'text/x-vcard', 'image/*', 'audio/*', 'application/ogg', 'video/*'],
    photos: ['application/vnd.google.panorama360+jpg', 'image/*', 'video/*'], youtube: ['video/*']
  };
  const clone = value => JSON.parse(JSON.stringify(value));
  // SEND_MULTIPLE filters differ from SEND: Hangouts/Cloud Print/clipboard have
  // none, Bugle only accepts images, and Bluetooth's batch set excludes audio.
  const MULTIPLE={beam:['*/*'],bluetooth:['image/*','video/*','x-mixmedia/*','text/x-vcard'],drive:['*/*'],gmail:['*/*'],messenger:['image/*'],photos:['application/vnd.google.panorama360+jpg','image/*','video/*'],youtube:['video/*']};
  const fallback = {image:'image/jpeg', video:'video/mp4', audio:'audio/mpeg', vcard:'text/x-vcard', text:'text/plain', pdf:'application/pdf', file:'application/octet-stream'};
  function mime(spec) {
    const explicit = spec.mime || spec.document?.mime;
    if (explicit) return explicit.split(';')[0].trim().toLowerCase();
    const kind = spec.photoSnapshot?.kind === 'video' ? 'video' : spec.document?.type || spec.kind || 'text';
    return fallback[kind] || 'application/octet-stream';
  }
  const kind = type => type.startsWith('video/') ? 'video' : type.startsWith('audio/') || type === 'application/ogg' ? 'audio' : type.startsWith('image/') || type === 'application/vnd.google.panorama360+jpg' ? 'image' : type.toLowerCase() === 'text/x-vcard' ? 'vcard' : type.startsWith('text/') ? 'text' : 'file';
  const matches = (filter, type) => filter === '*/*' || filter === type || filter.endsWith('/*') && filter.split('/')[0] === type.split('/')[0];
  function accepts(id, type, multiple=false) { return ((multiple?MULTIPLE:TYPES)[id] || []).some(filter => matches(filter, type)); }
  function normalizeOne(c, spec) {
    const out = {...spec};
    const source = spec.photoSnapshot || spec.document?.mediaSnapshot || (spec.photo && NG.photoLibrary?.find(c, spec.photo));
    if (source) out.photoSnapshot = clone(source);
    if (spec.document) out.document = clone(spec.document);
    // A Photos video was previously passed as kind:image. The stream's real media type takes precedence.
    if (!out.mime && !out.document?.mime && source?.kind === 'video') out.mime = 'video/mp4';
    out.mime = mime(out); out.kind = kind(out.mime);
    if (['image', 'video', 'audio'].includes(out.kind)) {
      const doc = out.document ||= {};
      doc.type = out.kind; doc.mime = out.mime; doc.name ||= out.name || source?.fileName || (out.kind === 'video' ? 'Video.mp4' : out.kind === 'audio' ? 'Audio.mp3' : 'Photo.jpg');
      if (out.photo) doc.photo = out.photo;
      if (source) { doc.mediaSnapshot = clone(source); doc.duration ??= source.duration; doc.time ??= source.time; }
      if (out.kind !== 'audio') doc.size ??= out.kind === 'video' ? Math.max(1000000, (doc.duration || 1000) * 1200) : 3200000;
      doc.duration ??= out.duration;
      // Invented Documents video records can lack a thumbnail. Their content stays a simulator-owned scene.
      if (out.kind === 'video' && !doc.mediaSnapshot) doc.mediaSnapshot = {kind:'video', duration:doc.duration || 1000, time:doc.time || Date.now(), seed:[...doc.name].reduce((n,ch)=>(n*31+ch.charCodeAt(0))>>>0,7)};
      out.photoSnapshot = doc.mediaSnapshot;
    }
    return out;
  }
  const streams=s=>s.streams?.length?s.streams:[s];
  function normalize(c,spec) {
    const items=spec.streams?.length?spec.streams:spec.photos?.map(id=>{const p=NG.photoLibrary?.find(c,id);return p?{photo:id,kind:p.kind==='video'?'video':'image',name:p.fileName||`${p.kind==='video'?'VID':'IMG'}_${id}.${p.kind==='video'?'mp4':'jpg'}`}:null;}).filter(Boolean);
    if(!items?.length)return normalizeOne(c,spec);
    const normalized=items.map(item=>normalizeOne(c,item)),first=normalized[0],out={...normalizeOne(c,{...spec,...first}),...spec};
    if(normalized.length===1)return {...out,...first,streams:undefined,photos:undefined,multiple:false,action:'android.intent.action.SEND'};
    const types=normalized.map(mime),category=types[0].split('/')[0],type=types.every(t=>t===types[0])?types[0]:types.every(t=>t.startsWith(category+'/'))?category+'/*':'*/*';
    return {...out,photo:first.photo,document:first.document,photoSnapshot:first.photoSnapshot,streams:normalized,photos:undefined,mime:type,kind:kind(type),multiple:true,action:'android.intent.action.SEND_MULTIPLE'};
  }
  NG.sendModel = {types: TYPES, multipleTypes:MULTIPLE, mime, kind, matches, accepts, normalize, streams};
})();
