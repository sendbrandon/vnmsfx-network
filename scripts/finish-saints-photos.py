"""Conventional full-resolution FFmpeg grade; never reads generated finishing v1 pixels."""
from pathlib import Path
import hashlib,json,struct,subprocess
REPO=Path(__file__).resolve().parents[1]
OUT=REPO/'assets/saints/film-finish/v2'
FILTER="format=rgb24,curves=master='0/0.008 0.12/0.112 0.35/0.322 0.6/0.557 0.82/0.767 1/0.94':interp=pchip,colorchannelmixer=rr=0.952756:rg=0.042912:rb=0.004332:gr=0.012756:gg=0.982912:gb=0.004332:br=0.012756:bg=0.042912:bb=0.944332,colorbalance=rs=-0.006:gs=0.002:bs=0.004:rh=-0.004:bh=0.002:pl=1,format=gbrp,noise=alls=1:allf=u:c0_seed=137:c1_seed=137:c2_seed=137,format=rgb24"
SOURCES={k:f'assets/saints/cast-headshots/v1/{k}-centered-upscaled-v1.png' for k in ['nix','rook','brick','vernon']}
SOURCES.update(episode01='assets/saints/stills/rook-hero.png',episode02='assets/saints/episode-02-hero.png')
def dims(path):return struct.unpack('>II',path.read_bytes()[16:24])
def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()
if __name__=='__main__':
 OUT.mkdir(parents=True,exist_ok=True); records=[]
 for key,relative in SOURCES.items():
  source=REPO/relative;before=digest(source);name=(key+'-cast' if key in ['nix','rook','brick','vernon'] else 'episode-0'+key[-1])+'-film-v2.png';dest=OUT/name
  command=['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(source),'-vf',FILTER,'-frames:v','1','-c:v','png','-pix_fmt','rgb24','-compression_level','9','-color_range','pc','-colorspace','0','-color_primaries','bt709','-color_trc','iec61966-2-1','-update','1',str(dest)]
  subprocess.run(command,check=True)
  assert dims(source)==dims(dest),(key,dims(source),dims(dest))
  assert digest(source)==before
  w,h=dims(dest);records.append(dict(key=key,source=relative,source_sha256=before,website_path='/'+str(dest.relative_to(REPO)),sha256=digest(dest),width=w,height=h,bytes=dest.stat().st_size,command=command))
  print(key,w,h,flush=True)
 manifest=dict(date='2026-10-16',method='FFmpeg conventional pixel processing; no generation, resize, crop, warp, blur or sharpening',filter=FILTER,ffmpeg_version=subprocess.check_output(['ffmpeg','-version'],text=True).splitlines()[0],supersedes='Generative finishing v1 rejected by Brandon for reconstructed detail and reduced resolution',records=records)
 (OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
