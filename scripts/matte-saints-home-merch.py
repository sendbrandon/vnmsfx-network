"""Non-generative exterior-only matte for the approved studio hoodie images.
Usage: python matte-saints-home-merch.py SOURCE_DIRECTORY OUTPUT_DIRECTORY
The surrounded print regions stay opaque and retain their exact RGB pixels.
"""
import hashlib,json,sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
source,output=map(Path,sys.argv[1:]);output.mkdir(parents=True,exist_ok=True)
approved={r['name']:r['sha256'] for r in json.loads((Path(__file__).resolve().parents[1]/'docs/saints-hoodie-studio-media.json').read_text())}
records=[]
for name in ('nix-back','rook-back','nix-front','nix-detail','rook-detail'):
    path=source/(name+'.webp')
    assert hashlib.sha256(path.read_bytes()).hexdigest()==approved[name], 'Source must match approved studio asset'
    original=Image.open(path).convert('RGB'); assert original.size==((500,600) if name.endswith('detail') else (900,1000))
    rgb=np.array(original)
    # Only the border-connected light field is background: enclosed bone ink is never keyed.
    light=(np.min(rgb,axis=2)>200).astype('uint8')*255
    flood=Image.fromarray(light).copy()
    for seed in [(0,0),(original.width-1,0),(0,original.height-1),(original.width-1,original.height-1)]:
        if flood.getpixel(seed)==255: ImageDraw.floodfill(flood,seed,128,thresh=0)
    foreground=np.array(flood)!=128
    assert not foreground[0,0] and np.count_nonzero(foreground)>100000
    matte=Image.fromarray(foreground.astype('uint8')*255)
    core=np.array(matte.filter(ImageFilter.MinFilter(5)))>0
    alpha=foreground.astype('float64')
    edge=foreground & ~core
    alpha[edge]=np.clip((255.-np.min(rgb,axis=2)[edge])/235.,0,1)
    # Remove the white contribution in the narrow edge fringe, with no global grading.
    result=rgb.copy(); partial=edge & (alpha<1)
    result[partial]=np.clip((rgb[partial].astype(float)-255.*(1-alpha[partial,None]))/alpha[partial,None],0,255).round().astype('uint8')
    rgba=np.dstack((result,np.round(alpha*255).astype('uint8')))
    dest=output/(name+'.webp'); Image.fromarray(rgba).save(dest,lossless=True,quality=100,method=6,exact=True)
    assert np.array_equal(result[core],rgb[core])
    # Interior print guards; the complete opaque garment is also checked above.
    box={'nix-back':(325,345,590,810),'rook-back':(220,265,645,840),'nix-front':(480,415,655,515),'nix-detail':(115,140,365,590),'rook-detail':(60,80,420,540)}[name]
    x0,y0,x1,y1=box; assert np.array_equal(rgba[y0:y1+1,x0:x1+1,:3],rgb[y0:y1+1,x0:x1+1]); assert np.all(rgba[y0:y1+1,x0:x1+1,3]==255)
    records.append(dict(name=name,source_sha256=hashlib.sha256(path.read_bytes()).hexdigest(),sha256=hashlib.sha256(dest.read_bytes()).hexdigest(),width=original.width,height=original.height,bytes=dest.stat().st_size,protected_print_changed_pixels=0,method='Border-connected exterior matte; narrow edge white-unmatting; lossless RGBA; no generation/resize/grade'))
    preview=Image.new('RGBA',original.size,(37,38,40,255));preview.alpha_composite(Image.fromarray(rgba));preview.convert('RGB').save(output/(name+'-charcoal.png'))
(output/'manifest.json').write_text(json.dumps(records,indent=2)+'\n')
print(json.dumps(records,indent=2))
