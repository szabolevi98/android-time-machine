"""Minimal protobuf wire reader for native Gboard metadata (schema-independent)."""
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
  if number==0:raise ValueError('invalid field')
  if wire==0:value,pos=varint(data,pos)
  elif wire==2:
   size,pos=varint(data,pos);value=data[pos:pos+size];pos+=size
  elif wire in (1,5):size=8 if wire==1 else 4;value=data[pos:pos+size];pos+=size
  else:raise ValueError('unsupported wire '+str(wire))
  if pos>len(data):raise ValueError('truncated message')
  out.setdefault(number,[]).append(value)
 return out
