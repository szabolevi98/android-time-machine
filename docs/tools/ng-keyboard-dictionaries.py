"""Extract Gboard 6.0.84 D3 vocabularies from N2G48C's bundled dictionaries.
D3 embeds a MARISA trie and a 16/24-bit symbol-id -> trie-key+1 vector. The native
protobuf metadata supplies blocked word IDs and weighted initial candidates.
Requires marisa-trie (pip install marisa-trie). No vocabulary from another release.
"""
import hashlib,json,lzma,struct,sys,zipfile
from pathlib import Path
import marisa_trie
from ng_keyboard_proto import fields
ROOT=Path(__file__).resolve().parents[2]
APK=ROOT/'_aosp/angler/system/app/LatinIMEGooglePrebuilt/LatinIMEGooglePrebuilt.apk'

def decode(raw):
 data=lzma.decompress(raw)
 assert struct.unpack_from('<II',data)==(0x07506f06,2),'unexpected D3 header'
 size=struct.unpack_from('<I',data,16)[0];meta=fields(data[20:20+size])
 start=data.index(b'We love Marisa.\0');trie=None
 # The native stream aligns each mapped region to 16 bytes. Its length precedes
 # zero padding; the amount depends on the locale's symbol-table name.
 for padding in range(16):
  length=struct.unpack_from('<Q',data,start-padding-8)[0]
  if length<16 or start+length+24>len(data):continue
  try:trie=marisa_trie.Trie().frombytes(data[start:start+length]);break
  except RuntimeError:continue
 assert trie is not None,'native MARISA region not found'
 pos=(start+length+8+15)//16*16
 stride,count=struct.unpack_from('<QQ',data,pos)
 assert stride in (2,3) and count==len(trie)*stride,'unexpected symbol map'
 pos+=16;words=[]
 for i in range(len(trie)):
  key=int.from_bytes(data[pos+i*stride:pos+i*stride+stride],'little')-1
  try:word=trie.restore_key(key)
  except UnicodeDecodeError:word=None
  words.append(word if word and word.isprintable() and not word.startswith('<') else None)
 blocked=[fields(v)[1][0] for v in meta.get(12,[])]
 initialSize=struct.unpack_from('<I',data,20+size)[0];initial=fields(data[24+size:24+size+initialSize]);starts={}
 for entry in initial.get(1,[]):
  group=fields(entry);items=[]
  for item in group.get(2,[]):
   values=fields(item);label=values[1][0];weight=struct.unpack('<d',values[2][0])[0]
   if label<len(words) and words[label]:items.append([label,weight])
  starts[str(group.get(1,[0])[0])]=items
 return {'words':words,'blocked':blocked,'initial':starts}

def main():
 z=zipfile.ZipFile(APK);out=ROOT/'versions/7.1.2/dictionaries';out.mkdir(exist_ok=True)
 for lang,locale in [('en','en_us'),('de','de_de'),('fr','fr_fr'),('es','es_us')]:
  source=next(n for n in z.namelist() if n.startswith('res/raw/main_'+locale+'_d3_'))
  raw=z.read(source);parsed=decode(raw);result={'locale':locale,'source':'angler:LatinIMEGooglePrebuilt:'+source,'sha256':hashlib.sha256(raw).hexdigest(),**parsed}
  target=out/(lang+'.json');text=json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n'
  if '--check' in sys.argv:
   assert target.read_text(encoding='utf-8')==text,str(target)+' differs from its native dictionary'
  else:target.write_text(text,encoding='utf-8')
  print(lang,len(parsed['words']),'native symbols,',len(parsed['blocked']),'blocked,',len(parsed['initial']),'initial candidate contexts')
if __name__=='__main__':main()
