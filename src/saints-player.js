import Hls from 'hls.js';
window.SaintsPlayback={attach(video,url){this.destroy();if(Hls.isSupported()){this.hls=new Hls();this.hls.loadSource(url);this.hls.attachMedia(video);}else if(video.canPlayType('application/vnd.apple.mpegurl'))video.src=url;else throw new Error('Streaming is not supported in this browser.');},destroy(){this.hls?.destroy();this.hls=null;}};
