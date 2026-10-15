"""Crop and encode generated art; preserve the actual drawings and alpha channel."""
from pathlib import Path
from PIL import Image
import numpy as np
import json, shutil, argparse
ROOT=Path(__file__).resolve().parents[1]
MASTERS=ROOT/'artifacts/toy-masters';MASTERS.mkdir(parents=True,exist_ok=True)
DEST=ROOT/'dist/assets/toys';DEST.mkdir(parents=True,exist_ok=True)
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source-dir',type=Path,default=MASTERS,help='Directory containing the original generated PNG files')
SOURCE=parser.parse_args().source_dir
SHEETS={'pathogens':'pathogens-v1.png','supplies':'supplies-v1.png','damage':'damage-v1.png'}
ids={'pathogens':['strepto','ecoli','staph','virus','myco','chlamydia','pseudomonas','mrsa','esbl','kpc'],'supplies':['penicillin','cefazolin','ceftriaxone','immune','azithro','doxy','vancomycin','cefepime','meropenem','cza'],'damage':['mrsa','esbl','kpc','mrsa','esbl','kpc']}
# Main-body anchors locate physical centers separately from spikes, crests and tails.
centers={'strepto':(.5,.49),'ecoli':(.5,.55),'staph':(.5,.53),'virus':(.5,.52),'myco':(.5,.55),'chlamydia':(.5,.55),'pseudomonas':(.5,.64),'mrsa':(.5,.61),'esbl':(.5,.53),'kpc':(.5,.57)}
meta={'pathogens':{},'supplies':{}}
summary=[]
for sheet,filename in SHEETS.items():
 master=MASTERS/(sheet+'-v1.png')
 if not master.exists():shutil.copyfile(SOURCE/filename,master)
 im=Image.open(master).convert('RGBA');a=np.array(im.getchannel('A'));w,h=im.size
 assert (a==0).mean()>.25,'Generated atlas must have real transparency'
 cols=3 if sheet=='damage' else 5;step=w/cols
 for index,key in enumerate(ids[sheet]):
  col=index%cols;row=index//cols;x0=round(col*step);x1=round((col+1)*step)
  # Detect the empty row gap per column, preventing crests or tails from being cut.
  density=(a[:,x0:x1]>35).sum(axis=1);lo,hi=int(h*.41),int(h*.59)
  candidates=np.where(density[lo:hi]==density[lo:hi].min())[0]+lo
  split=int(candidates[np.argmin(abs(candidates-h*.5))])
  y0=0 if row==0 else split;y1=split if row==0 else h
  tile=im.crop((x0,y0,x1,y1));mask=np.array(tile.getchannel('A'))>8
  yy,xx=np.where(mask);box=(max(0,int(xx.min())-2),max(0,int(yy.min())-2),min(tile.width,int(xx.max())+3),min(tile.height,int(yy.max())+3))
  tile=tile.crop(box);variant='damaged' if sheet=='damage' and row==0 else 'bare' if sheet=='damage' else 'normal';group='supplies' if sheet=='supplies' else 'pathogens'
  fname=f'{key}-{variant}.webp';tile.save(DEST/fname,quality=92,method=6)
  anchor=centers.get(key,(.5,.53)) if group=='pathogens' else (.5,.52)
  # Keep body anchors consistent in the trimmed frame; normalized anchors are art direction metadata.
  m={'src':'assets/toys/'+fname,'w':tile.width,'h':tile.height,'anchor':list(anchor)}
  meta[group].setdefault(key,{})[variant]=m
  summary.append((fname,tile.size,round((np.array(tile.getchannel('A'))==0).mean(),2)))
(ROOT/'dist/toy-meta.js').write_text('window.NABO_TOY_META='+json.dumps(meta,separators=(',',':'))+';\n')
print(json.dumps({'sprites':len(summary),'bytes':sum(p.stat().st_size for p in DEST.glob('*.webp')),'items':summary},ensure_ascii=False))
