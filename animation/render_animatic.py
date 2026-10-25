#!/usr/bin/env python3
"""Reproducible edited animatic; not a recording of HTML or real salon video."""
from pathlib import Path
import subprocess
ROOT=Path(__file__).resolve().parents[1]
CAP=ROOT/'animation/captions';CAP.mkdir(exist_ok=True)
captions={'hero1':'Eine Linie.','hero2':'Dein Stil.','brand':'AMANAILS · HAMBURG','detail1':'Von der Idee','detail2':'zum Detail.','work1':'Nägel mit','work2':'Charakter.','workword':'DEIN.','solid':'Für dich.','services':'Maniküre  /  Pediküre  /  Nageldesign','studio1':'Dein Moment','studio2':'bei Amanails.','cta':'TERMIN ANFRAGEN','original':'ORIGINALFOTO · AMANAILS','inspiration':'KAMPAGNENMOTIV · INSPIRATION'}
for name,value in captions.items():(CAP/(name+'.txt')).write_text(value,encoding='utf-8')
def txt(key,x,y,size,color='0xf5f0ea',italic=False,extra=''):
 font='animation/font-0.ttf' if italic else 'animation/font-1.ttf'
 return f'drawtext=fontfile={font}:textfile=animation/captions/{key}.txt:x={x}:y={y}:fontsize={size}:fontcolor={color}{extra}'
def photo(i,zoom=.0004,focus='.5'):
 return f"[{i}:v]scale=2560:1440:force_original_aspect_ratio=increase,crop=2560:1440,setsar=1,zoompan=z='1+{zoom}*on':x='(iw-iw/zoom)*{focus}':y='(ih-ih/zoom)*0.5':d=1:s=1280x720:fps=24,trim=duration=5.6,setpts=PTS-STARTPTS"
f=[]
f.append(photo(0,.00065,'.78')+','+txt('brand',65,64,16)+','+txt('hero1',125,170,104,extra=":alpha='min(1,max(0,(t-0.1)/0.7))'")+','+txt('hero2',230,280,104,extra=":alpha='min(1,max(0,(t-0.3)/0.7))'")+','+txt('inspiration',65,665,11)+',format=yuv420p[h]')
f.append(photo(1,.00045)+',drawbox=x=0:y=0:w=650:h=720:color=0x180d0b@0.25:t=fill,'+txt('detail1',65,210,82)+','+txt('detail2',65,310,82,italic=True)+','+txt('inspiration',65,665,11)+',format=yuv420p[d]')
f.append(photo(2,.00013)+',drawbox=x=0:y=0:w=1280:h=720:color=0x190d1c@0.2:t=fill,'+txt('work1',65,100,67)+','+txt('work2',65,180,67,italic=True)+','+txt('workword',65,400,200,extra=":alpha=0.75")+','+txt('original',65,665,11)+',format=yuv420p[w]')
f.append('[4:v]scale=640:640:force_original_aspect_ratio=decrease,format=rgba,colorchannelmixer=aa=0.45[logo]')
f.append('[5:v][logo]overlay=x=-150:y=20:shortest=1,'+txt('solid',470,180,126,'0x4b2d18')+','+txt('services',475,370,27,'0x4b2d18')+','+txt('brand',475,460,16,'0x4b2d18')+',trim=duration=5.6,setpts=PTS-STARTPTS,format=yuv420p[s]')
f.append(photo(3,.00013)+',drawbox=x=550:y=0:w=730:h=720:color=0x180d17@0.58:t=fill,'+txt('studio1',675,230,60)+','+txt('studio2',675,302,60,italic=True)+','+txt('cta',680,420,18)+','+txt('original',65,665,11)+',format=yuv420p[t]')
f.extend(['[h][d]xfade=transition=smoothup:duration=0.6:offset=5[hd]','[hd][w]xfade=transition=smoothleft:duration=0.6:offset=10[hdw]','[hdw][s]xfade=transition=fade:duration=0.6:offset=15[hdws]','[hdws][t]xfade=transition=smoothup:duration=0.6:offset=20[out]'])
cmd=['ffmpeg','-y','-hide_banner','-loglevel','error','-filter_complex_threads','1']
for p in ['hero.webp','macro.webp','work-original.png','studio-original.png','logo.png']:cmd+=['-loop','1','-framerate','24','-i','site/assets/'+p]
cmd+=['-f','lavfi','-i','color=c=0xbfa398:s=1280x720:r=24:d=5.6','-filter_complex',';'.join(f),'-map','[out]','-t','25.6','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart','-an','animation/motion-preview.mp4']
subprocess.run(cmd,cwd=ROOT,check=True)
print(ROOT/'animation/motion-preview.mp4')

