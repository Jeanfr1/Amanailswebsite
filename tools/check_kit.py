#!/usr/bin/env python3
"""Content and integrity checks; browser layout/interaction remain a separate review."""
from pathlib import Path
from html.parser import HTMLParser
import json,re,hashlib,sys
from PIL import Image
ROOT=Path(__file__).resolve().parents[1];SITE=ROOT/'site'
class Markup(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.paths=set();self.targets=[];self.sections=[];self.lang=None
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='html':self.lang=a.get('lang')
  if a.get('id'):self.ids.append(a['id'])
  if tag=='section':self.sections.append((a.get('id'),a.get('data-background')))
  if 'data-dialog'in a:self.targets.append(a['data-dialog'])
  for k in ['src','href']:
   v=a.get(k,'')
   if v.startswith('#'):self.targets.append(v[1:])
   elif v and not re.match(r'^(https?:|tel:|data:)',v):self.paths.add(v)
  for entry in a.get('srcset','').split(','):
   v=entry.strip().split(' ')[0]
   if v and not v.startswith('http'):self.paths.add(v)
p=Markup();p.feed((SITE/'index.html').read_text());errors=[]
def require(ok,message):
 if not ok:errors.append(message)
require(p.lang=='de','Wrong public language')
require(len(p.ids)==len(set(p.ids)),'Duplicate HTML IDs')
for target in p.targets:require(target in p.ids,'Unknown anchor/dialog '+target)
for path in p.paths:require((SITE/path).is_file(),'Missing HTML asset '+path)
require(p.sections==[('start','image'),('detail','image'),('arbeiten','image'),('leistungen','color'),('studio','image')],'Approved model 2 order/backgrounds changed')
lock=json.loads((ROOT/'docs/architecture-lock.json').read_text())
require(lock['approved_model']==2 and lock['direction']=='Gesto','Wrong model lock')
require([s['id']for s in lock['sections']]==[s[0]for s in p.sections],'Lock disagrees with HTML')
for name in ['work-original.png','studio-original.png']:
 require(hashlib.sha256((SITE/'assets'/name).read_bytes()).digest()==hashlib.sha256((ROOT/'originals'/name).read_bytes()).digest(),'Original changed: '+name)
for css in SITE.rglob('*.css'):
 for url in re.findall(r'url\([\'\"]?([^\)\'\"]+)',css.read_text()):
  if not url.startswith(('data:','http','#')) and url!='x.svg':
   require((css.parent/url).is_file(),'Missing CSS asset '+url)
for path in ROOT.rglob('*.json'):
 try:json.loads(path.read_text())
 except Exception:errors.append('Invalid JSON '+str(path))
for path in (SITE/'assets').glob('*.svg'):
 import xml.etree.ElementTree as ET
 try:ET.parse(path)
 except Exception:errors.append('Invalid SVG '+path.name)
logo=Image.open(SITE/'assets/logo.png')
require(logo.mode=='RGBA','Logo lacks RGBA')
require(logo.getchannel('A').getextrema()[0]==0,'Logo lacks transparent pixels')
require((ROOT/'docs/modelo-2-aprovado.png').is_file(),'Missing approved model')
manifest=ROOT/'MANIFEST.sha256'
if manifest.exists():
 for line in manifest.read_text().splitlines():
  digest,name=line.split('  ',1);path=ROOT/name
  require(path.is_file() and hashlib.sha256(path.read_bytes()).hexdigest()==digest,'Checksum mismatch '+name)
if errors:print('\n'.join(errors));sys.exit(1)
print('PASS: model 2 Gesto; 4 photo backgrounds + 1 colour; German; anchors/dialogs; assets/fonts/masks; originals; transparent logo; JSON; checksums when present.')
print('Browser layout, interaction and performance are unverified. See docs/validacao.md.')

