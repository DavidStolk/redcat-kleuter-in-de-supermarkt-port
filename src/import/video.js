// Digital video from the CD (MAIN #73 `Video` -> LOCAL/Dxs3.avi, decomp/notes/video.md), decoded
// in the browser: AVI container (avi.ts), Intel Indeo 4.1 frames (indeo4.ts), PCM sound.
import { parseAvi } from './avi.js';
import { Indeo4Decoder } from './indeo4.js';

                            
                                
                                            
              
                                                    
                        
                        
                            
 

export async function decodeVideo(buf             , audioCtx                         )                     {
  const avi = parseAvi(buf);
  if (avi.videoFourcc.toUpperCase() !== 'IV41') throw new Error('video codec ' + avi.videoFourcc + ' not supported');
  const { width: w, height: h } = avi;
  const dec = new Indeo4Decoder(w, h);
  const rgba = new Uint8ClampedArray(w * h * 4);
  const frames                = [];
  for (const f of avi.frames) {
    dec.decode(f); // an empty frame repeats the previous picture
    dec.toRGBA(rgba);
    frames.push(await createImageBitmap(new ImageData(rgba, w, h)));
  }
  let audio                     = null;
  const a = avi.audio;
  if (a && audioCtx && a.data.length > 0) {
    const bytes = a.bitsPerSample / 8, n = Math.floor(a.data.length / bytes / a.channels);
    audio = audioCtx.createBuffer(a.channels, n, a.sampleRate);
    const dv = new DataView(a.data.buffer, a.data.byteOffset, a.data.byteLength);
    for (let c = 0; c < a.channels; c++) {
      const out = audio.getChannelData(c);
      // WAVE PCM: 8-bit unsigned, 16-bit signed little-endian, channels interleaved.
      for (let i = 0; i < n; i++) {
        const o = (i * a.channels + c) * bytes;
        out[i] = bytes === 1 ? (dv.getUint8(o) - 128) / 128 : dv.getInt16(o, true) / 32768;
      }
    }
  }
  return { width: w, height: h, fps: avi.fpsNum / avi.fpsDen, durationTicks: avi.durationTicks, frames, audio };
}
