"""Read Gboard 6.0.84's protobuf theme metadata and layered style sheets from N2G48C.
Only native colour constants are serialized; no dependency on a newer Gboard schema.
"""
import json,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
APK=ROOT/'_aosp/angler/system/app/LatinIMEGooglePrebuilt/LatinIMEGooglePrebuilt.apk'
def varint(data,pos):
 value=shift=0
 while True:
  byte=data[pos];pos+=1;value|=(byte&127)<<shift
  if byte<128:return value,pos
  shift+=7
  if shift>63:raise ValueError('oversized varint')
def fields(data):
 pos=0;out={}
 while pos<len(data):
  key,pos=varint(data,pos);number,wire=key>>3,key&7
  if wire==0:value,pos=varint(data,pos)
  elif wire==2:
   size,pos=varint(data,pos);value=data[pos:pos+size];pos+=size
  elif wire in (1,5):size=8 if wire==1 else 4;value=data[pos:pos+size];pos+=size
  else:raise ValueError('unsupported wire '+str(wire))
  out.setdefault(number,[]).append(value)
 return out

def main():
 z=zipfile.ZipFile(APK);themes={}
 for path in z.namelist():
  if not path.startswith('assets/theme_package_metadata_') or path.endswith('no_background.binarypb'):continue
  name=path.removeprefix('assets/theme_package_metadata_').removesuffix('.binarypb');meta=fields(z.read(path))
  layers=[s.decode() for s in meta.get(2,[])]
  bordered=layers[:]
  for variant in meta.get(3,[]):
   group=fields(variant)
   if group.get(1)==[1]:bordered += [s.decode() for s in group.get(2,[])]
  def palette(sheets):
   colors={}
   for sheet in sheets:
    for entry in fields(z.read('assets/'+sheet)).get(2,[]):
     item=fields(entry)
     if 1 not in item or 2 not in item:continue
     key=item[1][0].decode()
     if not key.startswith('color_'):continue
     vals=fields(item[2][0])
     if 1 not in vals or not isinstance(vals[1][0],int):continue
     argb=vals[1][0];rgb=argb&0xffffff;alpha=argb>>24
     colors[key]=f'#{rgb:06x}'+(f'{alpha:02x}' if alpha!=255 else '')
   return colors
  themes[name]={'label':'kb_theme_'+name,'colors':palette(layers),'bordered':palette(bordered),'sources':[path]+['assets/'+s for s in bordered]}
 out=ROOT/'versions/7.1.2/ng-keyboard-themes.js'
 out.write_text('/* Generated from N2G48C Gboard theme_package_metadata / style_sheet protobufs by docs/tools/ng-keyboard-themes.py. */\nNG.keyboardThemes = '+json.dumps(themes,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
 print(len(themes),'native theme packages')
 for k,v in themes.items():print(k,v['colors'].get('color_base'),v['colors'].get('color_label'),v['colors'].get('color_text'))
if __name__=='__main__':main()
