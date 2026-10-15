"""Package generated frames; measure connected shoe silhouettes without changing artwork."""
import json,shutil
from pathlib import Path
from PIL import Image
import numpy as np
meta={}
for row in json.load(open('qa/atlas-inputs.json')):
 key=row['key'];src=Path(row['path']);shutil.copyfile(src,Path('artifacts/animation-masters')/(key+'.png'))
 im=Image.open(src);im.save('dist/assets/'+key+'.webp',quality=92,method=6)
 a=np.array(im.getchannel('A'));height,width=a.shape;ch,cw=height//2,width//4;anchors=[]
 for i in range(8):
  cell=a[i//4*ch:(i//4+1)*ch,i%4*cw:(i%4+1)*cw];mask=cell>210
  hh,ww=ch//4,cw//4;coarse=mask[:hh*4,:ww*4].reshape(hh,4,ww,4).any(axis=(1,3));yy,xx=np.where(coarse);j=np.argmin((xx-ww*.5)**2+(yy-hh*.55)**2);seed=(int(yy[j]),int(xx[j]));seen=np.zeros_like(coarse);stack=[seed];seen[seed]=True
  while stack:
   y,x=stack.pop()
   for ny,nx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
    if 0<=ny<hh and 0<=nx<ww and coarse[ny,nx] and not seen[ny,nx]:seen[ny,nx]=True;stack.append((ny,nx))
  main=mask[:hh*4,:ww*4]&np.repeat(np.repeat(seen,4,axis=0),4,axis=1);yy,xx=np.where(main)
  if len(yy)<100:yy,xx=np.where(mask);main=mask
  bottom=int(yy.max());fy,fx=np.where(main[max(0,bottom-int(ch*.075)):bottom+1]);footx=(float(fx.min())+float(fx.max()))/2
  anchors.append({'x':round(footx/cw,5),'y':round((bottom+1)/ch,5)})
 meta[key]={'cols':4,'rows':2,'width':width,'height':height,'anchors':anchors}
Path('dist/atlas-meta.js').write_text('window.NABO_ATLAS_META='+json.dumps(meta,separators=(',',':'))+';\n')
print('Packaged',len(meta)*8,'frames in',len(meta),'atlases.')
