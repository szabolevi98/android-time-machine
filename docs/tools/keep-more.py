"""Generate each image's Keep continuation module, and extract its native audio playback drawables."""
from pathlib import Path
import zipfile,sys
sys.path.insert(0,str(Path(__file__).parent))
from dp_css import to_dp
for version,device,era,prefix,app,apk,scale,bar,ink,accent in [
 ('4.3','mako','jb','kp','Keep 1.0.81','app/Keep.apk',.8516,'#e5e5e5','#58585b','#33b5e5'),
 ('4.4.4','hammerhead','kk','kp2','Keep 2.0.51','app/Keep.apk',.906,'#e5e5e5','#58585b','#33b5e5'),
 ('5.1.1','shamu','lp','kp3','Keep 3.0.03','app/PrebuiltKeep/PrebuiltKeep.apk',.9087,'#ffbb00','#fff','#ffbb00')]:
 values={'VERSION':version,'DEVICE':device,'ERA':era,'PREFIX':prefix,'KEEP':app,'BAR':bar,'INK':ink,'ACCENT':accent}
 for ext in ['js','css']:
  text=Path('docs/templates/keep-more.template.'+ext).read_text(encoding='utf-8')
  for k,v in values.items():text=text.replace('__'+k+'__',v)
  if ext=='css':text=to_dp(text,scale)
  Path('versions/'+version+'/keep-more.'+ext).write_text(text,encoding='utf-8',newline='\n')
 with zipfile.ZipFile('_aosp/'+device+'/system/'+apk) as z:
  for key in ['play','pause']:
   name='ic_'+key+'_dark.png'
   paths=[n for n in z.namelist() if n.startswith('res/drawable-') and n.endswith('/'+name)]
   source=next((n for n in paths if 'xhdpi' in n and 'xxhdpi' not in n),paths[0])
   Path('versions/'+version+'/assets/'+prefix+'-'+key+'.png').write_bytes(z.read(source))
 print(version)
