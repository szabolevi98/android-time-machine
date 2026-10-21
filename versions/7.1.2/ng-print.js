/* PrintSpooler 7.1.2 (PrintActivity) for the apps' print jobs (c.ui.printJob = {title, text, photo}; Cloud Print's share
   alias hands over the share's content). print_activity under Theme.PrintActivity (Theme.Material.Light: the static
   and summary content in colorPrimary #f5f5f5, colorAccent #009688): the destination spinner with Save as PDF and
   All printers…, the "Copies: / Paper size:" summary, print_activity_controls (Copies, Paper size, Color, Orientation,
   Pages with the range field), the round print_button in the accent with ic_menu_savetopdf, and the preview pages on
   print_preview_background_color #f2f1f2 with the page selector. The default paper follows mediasize_standard
   (north_america for en-US, ISO elsewhere). Save to PDF writes the PDF through Documents' save dialog. */
(() => {
  'use strict';
  const T=()=>NG.text('print'),t=k=>T().t(k),f=(k,...a)=>T().fmt(k,null,...a),E=(c,s)=>c.safe(s);
  const SIZES=[['iso_a4',210,297],['iso_a3',297,420],['iso_a5',148,210],['na_letter',216,279],['na_legal',216,356]];
  const LINES=36;
  function job(c){const j=c.ui.printJob||(c.ui.shareSpec?{title:c.ui.shareSpec.subject||c.ui.shareSpec.name||'',text:c.ui.shareSpec.text||'',photo:c.ui.shareSpec.photo}:{title:'',text:''});return j;}
  const U=c=>c.ui.print ||= {dest:'pdf',copies:'1',paper:c.lang==='en'?'na_letter':'iso_a4',color:1,orientation:0,range:0,pages:'',open:false,route:'dialog'};
  function pages(c){const j=job(c);if(j.photo)return [{photo:j.photo}];const lines=String(j.text||j.title||'').split('\n').flatMap(l=>l.match(/.{1,60}(\s|$)|.{1,60}/g)||['']);const out=[];for(let i=0;i<lines.length;i+=LINES)out.push({lines:lines.slice(i,i+LINES)});return out.length?out:[{lines:['']}];}
  // A page range "1-5,8" (either dash, the example's em dash too) to page numbers; null when it does not parse or overflows.
  function parseRange(text,n){const set=new Set();for(const part of String(text).split(',').map(s=>s.trim()).filter(Boolean)){const m=/^(\d+)(?:\s*[-—–]\s*(\d+))?$/.exec(part);if(!m)return null;const a=+m[1],b=+(m[2]||m[1]);if(!a||b<a||b>n)return null;for(let i=a;i<=b;i++)set.add(i);}return set.size?[...set].sort((x,y)=>x-y):null;}
  const select=(c,name,labels,value)=>`<select class="ngpr-select" data-field="${name}">${labels.map((l,i)=>`<option value="${i}"${i===value?' selected':''}>${E(c,l)}</option>`).join('')}</select>`;
  function dialog(c){const u=U(c),list=pages(c),n=list.length,size=SIZES.find(s=>s[0]===u.paper),land=u.orientation===1,[w,h]=land?[size[2],size[1]]:[size[1],size[2]],sel=u.range?parseRange(u.pages,n):list.map((_,i)=>i+1);
    const sizeLabels=SIZES.map(s=>t('framework/mediasize_'+s[0]));
    return `<div class="ngpr"><div class="ngpr-static"><select class="ngpr-dest" data-field="dest" aria-label="${E(c,t('save_as_pdf'))}"><option value="pdf">${E(c,t('save_as_pdf'))}</option><option value="all">${E(c,t('all_printers'))}</option></select></div>
      ${u.open?`<div class="ngpr-options"><label><span>${E(c,t('label_copies'))}</span><input class="ngpr-copies${/^[1-9]\d*$/.test(u.copies)?'':' bad'}" data-field="copies" inputmode="numeric" value="${E(c,u.copies)}"></label><label><span>${E(c,t('label_paper_size'))}</span>${select(c,'paper',sizeLabels,SIZES.findIndex(s=>s[0]===u.paper))}</label><label><span>${E(c,t('label_color'))}</span>${select(c,'color',T().t('color_mode_labels'),u.color)}</label><label><span>${E(c,t('label_orientation'))}</span>${select(c,'orientation',T().t('orientation_labels'),u.orientation)}</label><label><span>${E(c,t('label_pages'))}</span>${select(c,'range',[f('template_all_pages',n),f('template_page_range',n)],u.range)}</label>${u.range?`<label class="wide"><span>${E(c,t('pages_range_example'))}</span><input class="ngpr-range${sel?'':' bad'}" data-field="pages" value="${E(c,u.pages)}" placeholder="${E(c,t('pages_range_example'))}"></label>`:''}</div>`:`<div class="ngpr-summary" data-action="ngpr-toggle"><span>${E(c,t('label_copies_summary'))}</span><b>${E(c,u.copies)}</b><span>${E(c,t('label_paper_size_summary'))}</span><b>${E(c,sizeLabels[SIZES.findIndex(s=>s[0]===u.paper)])}</b></div>`}
      <button type="button" class="ngpr-handle" data-action="ngpr-toggle" aria-label="${E(c,t(u.open?'label_pages':'more_options_button'))}"><img src="assets/pr-expand-${u.open?"less":"more"}.png" alt=""></button>
      <button type="button" class="ngpr-fab" data-action="ngpr-save" aria-label="${E(c,t('savetopdf_button'))}"${sel&&/^[1-9]\d*$/.test(u.copies)?'':' disabled'}><img src="assets/pr-savetopdf.png" alt=""></button>
      <div class="ngpr-preview">${list.map((p,i)=>`<figure class="ngpr-page${sel?.includes(i+1)?' on':''}" style="aspect-ratio:${w}/${h}"><div class="ngpr-sheet${u.color===0?' mono':''}">${p.photo?photo(c,p.photo):`<pre>${E(c,p.lines.join('\n'))}</pre>`}</div>${n>1?`<i></i>`:''}<figcaption>${E(c,f('current_page_template',i+1,n))}</figcaption></figure>`).join('')}</div></div>`;}
  function photo(c,ph){const obj=typeof ph==='string'?(NG.media.photos?.(c)||[]).find(x=>x.id===ph):ph;return obj?NG.media.svg(obj,'ngpr-photo'):'';}
  function printers(c){return `<div class="ngpr ngpr-printers"><header class="ngpr-bar"><button type="button" class="ngpr-icon" data-action="ngpr-back" aria-label="${E(c,t('framework/action_bar_up_description'))}"><i class="ngpr-up"></i></button><span>${E(c,t('all_printers_label'))}</span><button type="button" class="ngpr-icon" data-action="ngpr-add" aria-label="${E(c,t('print_add_printer'))}"><img src="assets/pr-add.svg" alt=""></button></header><div class="ngpr-empty"><img src="assets/pr-printer.png" alt=""><p>${E(c,t('print_no_printers'))}</p><button type="button" data-action="ngpr-service">${E(c,t('add_print_service_label'))}</button></div></div>`;}
  function save(c){const u=U(c),j=job(c),list=pages(c),sel=u.range?parseRange(u.pages,list.length):list.map((_,i)=>i+1);if(!sel)return;const title=(j.title||t('save_as_pdf')).replace(/[\\/:*?"<>|]+/g,' ').trim().slice(0,60)||'Document';
    const text=sel.map(i=>list[i-1].lines?.join('\n')||'').join('\n\f\n');
    NG.saveDocument(c,{name:title+'.pdf',type:'pdf',content:text,extra:{pages:sel.length,paper:u.paper,orientation:u.orientation?'landscape':'portrait',color:!!u.color,copies:+u.copies},onPick:c=>{c.ui.printJob=null;c.ui.print=null;setTimeout(()=>{if(c.ui.view==='print-preview')c.back();},0);}});}
  function back(c){const u=U(c);if(u.route==='printers'){u.route='dialog';u.dest='pdf';c.render();return true;}if(u.open){u.open=false;c.render();return true;}c.ui.printJob=null;c.ui.print=null;return false;}
  NG.register('print-preview',{
    render:c=>U(c).route==='printers'?printers(c):dialog(c),
    statusColor:()=> '#757575',dialogAccent:()=> '#009688',
    back,
    mount(c,root){const u=U(c);root.querySelectorAll('[data-field]').forEach(el=>el.addEventListener(el.tagName==='SELECT'?'change':'input',()=>{const k=el.dataset.field;if(k==='dest'){if(el.value==='all'){u.route='printers';c.render();}return;}u[k]=el.tagName==='SELECT'?(k==='paper'?SIZES[+el.value][0]:+el.value):el.value;if(el.tagName==='SELECT')c.render();else{const list=pages(c),ok=/^[1-9]\d*$/.test(u.copies)&&(!u.range||parseRange(u.pages,list.length));el.classList.toggle('bad',k==='copies'?!/^[1-9]\d*$/.test(u.copies):!parseRange(u.pages,list.length));root.querySelector('.ngpr-fab').disabled=!ok;const sel=u.range?parseRange(u.pages,list.length)||[]:list.map((_,i)=>i+1);root.querySelectorAll('.ngpr-page').forEach((p,i)=>p.classList.toggle('on',sel.includes(i+1)));}}));},
    action(name,el,e,c){const u=U(c);if(!name.startsWith('ngpr-'))return false;
      switch(name.slice(5)){
        case 'toggle':u.open=!u.open;break;
        case 'save':save(c);return true;
        case 'back':if(!back(c))c.back();return true;
        case 'add':case 'service':c.open('play-store','search:print service');return true;
        default:return false;
      }c.render();return true;}
  });
})();
