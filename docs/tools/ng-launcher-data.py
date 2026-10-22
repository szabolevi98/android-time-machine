"""N2G48C launcher catalogue: enabled widget providers and declared app shortcuts from the local APKs.
Writes ng-launcher-data.js plus the native raster preview extraction list. No older release's data is used.
"""
import json, math, re, sys, zipfile
from pathlib import Path
from loguru import logger
logger.remove()
from androguard.core.axml import AXMLPrinter
sys.path.insert(0, str(Path(__file__).parent))
from image_res import ImageRes
sys.stdout.reconfigure(encoding='utf-8')
ROOT=Path(__file__).resolve().parents[2]
SYSTEM=ROOT/'_aosp/angler/system'
N='{http://schemas.android.com/apk/res/android}'
R=ImageRes('angler')
APPS={'CalendarGooglePrebuilt':'calendar','Chrome':'chrome','Drive':'drive','Music2':'play-music','PrebuiltBugle':'messenger',
      'PrebuiltDeskClockGoogle':'clock','PrebuiltGmail':'gmail','Tycho':'project-fi','Phonesky':'play-store','SettingsGoogle':'settings',
      'Velvet':'search','GoogleCamera':'camera','GoogleDialer':'phone','GoogleContacts':'contacts','Photos':'photos','Maps':'maps','Hangouts':'hangouts',
      'Videos':'play-movies','YouTube':'youtube','LatinIMEGooglePrebuilt':'gboard'}
widgets=[];shortcuts=[];assets=[];vectors=[];live_wallpapers=[]
for path in sorted(SYSTEM.glob('*/*/*.apk')):
    z=zipfile.ZipFile(path)
    manifest=AXMLPrinter(z.read('AndroidManifest.xml')).get_xml_obj()
    app=manifest.find('application')
    for service in manifest.iter('service'):
        if any(a.get(N+'name')=='android.service.wallpaper.WallpaperService' for a in service.iter('action')):
            live_wallpapers.append({'apk':path.stem,'service':service.get(N+'name'),'enabled':service.get(N+'enabled','true')})
    receivers=[e for e in manifest.iter('receiver') if any(a.get(N+'name')=='android.appwidget.action.APPWIDGET_UPDATE' for a in e.iter('action'))]
    shortcuts_meta=[e for e in manifest.iter('meta-data') if e.get(N+'name')=='android.app.shortcuts']
    if not receivers and not shortcuts_meta:continue
    apk=path.stem;res,pkg,_=R._apk(apk)
    def name(v):
        return res.get_resource_xml_name(int(v[1:],16)).split(':')[-1].lstrip('@') if v and re.fullmatch(r'@[0-9a-fA-F]{8}',v) else v
    def raw(v):
        if not v or not re.fullmatch(r'@[0-9a-fA-F]{8}',v):return v
        configs=res.get_resolved_res_configs(int(v[1:],16))
        def score(item):
            q=item[0].get_qualifier() or ''
            sw=re.search(r'sw(\d+)dp',q);api=re.search(r'(?:^|-)v(\d+)',q)
            if sw and int(sw[1])>411 or api and int(api[1])>25 or re.search(r'land|night|[a-z]{2}-r[A-Z]',q):return -1
            return (int(sw[1]) if sw else 0)*100+(int(api[1]) if api else 0) if not q or re.fullmatch(r'(?:sw\d+dp-?)?(?:v\d+)?',q) else -1
        return max(configs,key=score)[1] if configs else ''
    def text(v):
        n=name(v)
        return R.string([apk],n.split('/',1)[1]) if n and n.startswith('string/') else {'en':v or ''}
    def xml(v):
        n=name(v);kind,key=n.split('/')
        choices=[]
        for file in z.namelist():
            m=re.fullmatch(rf'res/{kind}(?:-v(\d+))?/{re.escape(key)}\.xml',file)
            if m and int(m[1] or 0)<=25:choices.append((int(m[1] or 0),file))
        return AXMLPrinter(z.read(max(choices)[1])).get_xml_obj()
    def picture(v,output):
        n=name(v)
        if not n or not n.startswith(('drawable/','mipmap/')):return None
        kind,key=n.split('/')
        files=[f for f in z.namelist() if re.fullmatch(rf'res/{kind}[^/]*/{re.escape(key)}\.(png|webp|jpg)',f)]
        if not files:
            try:
                if xml(v).tag != 'vector':return None
            except (ValueError,KeyError):return None
            file=output+'.svg'
            vectors.append('\t'.join([file,path.relative_to(SYSTEM).as_posix(),key,'-']))
            return 'assets/'+file
        ext=Path(files[0]).suffix
        file=output+ext
        assets.append('\t'.join([file,path.relative_to(SYSTEM).as_posix(),n]))
        return 'assets/'+file
    for receiver in receivers:
        if str(raw(receiver.get(N+'enabled','true'))).lower()=='false':continue
        meta=next((e.get(N+'resource') for e in receiver.iter('meta-data') if e.get(N+'name')=='android.appwidget.provider'),None)
        if not meta:continue
        node=xml(meta);key=name(meta).split('/')[-1]
        ident='digital' if apk=='PrebuiltDeskClockGoogle' and 'digital' in key else 'analog' if apk=='PrebuiltDeskClockGoogle' else APPS.get(apk,apk.lower())+'-'+key
        if any(w['id']==ident for w in widgets):continue
        dim=lambda k, fallback=0:float(re.match(r'[0-9.]+',str(raw(node.get(N+k,str(fallback)))))[0])
        width,height=dim('minWidth'),dim('minHeight')
        entry={'id':ident,'app':APPS.get(apk,apk.lower()),'apk':apk,'receiver':receiver.get(N+'name'),'source':name(meta),
               'label':text(receiver.get(N+'label') or app.get(N+'label')),'minW':width,'minH':height,
               'spanX':min(5,max(1,math.ceil((width+16)/80.686))), 'spanY':min(5,max(1,math.ceil((height+16)/96.686))),
               'layout':name(node.get(N+'initialLayout')),'configure':node.get(N+'configure'),
               # AppWidgetServiceImpl falls back to minWidth/minHeight when resize minima are absent.
               'resize':node.get(N+'resizeMode','0'),'minResizeW':dim('minResizeWidth',width),'minResizeH':dim('minResizeHeight',height),
               'preview':picture(node.get(N+'previewImage'),'wid-'+ident)}
        widgets.append(entry)
    for meta in shortcuts_meta:
        for node in xml(meta.get(N+'resource')).iter('shortcut'):
            if str(raw(node.get(N+'enabled','true'))).lower()=='false':continue
            ident=raw(node.get(N+'shortcutId'))
            shortcuts.append({'app':APPS.get(apk,apk.lower()),'id':ident,'label':text(node.get(N+'shortcutShortLabel')),
                              'longLabel':text(node.get(N+'shortcutLongLabel')),'icon':picture(node.get(N+'icon'),'sc-'+apk.lower()+'-'+str(ident)),
                              'intent':[{k.split('}')[-1]:raw(v) for k,v in e.attrib.items()} for e in node.iter('intent')],
                              'extras':[{k.split('}')[-1]:raw(v) for k,v in e.attrib.items()} for e in node.iter('extra')]})
head='/* Generated by docs/tools/ng-launcher-data.py from angler N2G48C widget providers and app shortcut XML. */\n'
(ROOT/'versions/7.1.2/ng-launcher-data.js').write_text(head+'NG.widgetProviders = '+json.dumps(widgets,ensure_ascii=False,indent=2)+';\nNG.appShortcuts = '+json.dumps(shortcuts,ensure_ascii=False,indent=2)+';\nNG.liveWallpaperServices = '+json.dumps(live_wallpapers,ensure_ascii=False)+';\n',encoding='utf8',newline='\n')
(ROOT/'docs/data/ng-assets-widget-previews.tsv').write_text('# Native widget/shortcut previews. Generated by ng-launcher-data.py.\n'+'\n'.join(sorted(set(assets)))+'\n',encoding='utf8',newline='\n')
(ROOT/'docs/data/ng-vectors-shortcuts.tsv').write_text('# Native vector shortcut icons. Generated by ng-launcher-data.py.\n'+'\n'.join(sorted(set(vectors)))+'\n',encoding='utf8',newline='\n')
print(len(widgets),'enabled providers:',', '.join(x['id'] for x in widgets))
print(len(shortcuts),'declared shortcuts:',', '.join(x['app']+':'+str(x['id']) for x in shortcuts))
print(len(live_wallpapers),'live wallpaper services')
