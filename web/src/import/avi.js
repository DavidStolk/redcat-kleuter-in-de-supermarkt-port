// AVI (RIFF) container reader for the intro video Dxs3.avi (decomp/notes/video.md): stream headers
// (hdrl/avih/strh/strf), the first video stream's frames and the first audio stream's PCM, from
// LIST movi (incl. nested `rec ` lists) in file order. The idx1 index is not needed: every chunk is
// found by walking movi.

                                                                                                           

                          
                                                                                           
                                                                                               
                                                                                                              
                                                                                             
                                                                                                        
 

                                                                                                      

const fourcc = (v          , o        )         =>
  String.fromCharCode(v.getUint8(o), v.getUint8(o + 1), v.getUint8(o + 2), v.getUint8(o + 3));

export function parseAvi(buf             )          {
  const v = new DataView(buf);
  if (buf.byteLength < 12 || fourcc(v, 0) !== 'RIFF' || fourcc(v, 8) !== 'AVI ') throw new Error('AVI: not a RIFF AVI file');
  const streams           = [];
  let width = 0, height = 0;
  const frames               = [];
  const audioChunks               = [];
  let vIdx = -1, aIdx = -1;

  // Chunks `##xx`: stream number in the first two ASCII digits.
  const movi = (start        , end        )       => {
    for (let o = start; o + 8 <= end;) {
      const id = fourcc(v, o), size = v.getUint32(o + 4, true), body = o + 8;
      if (body + size > buf.byteLength) throw new Error(`AVI: chunk ${id} runs past the end of the file`);
      if (id === 'LIST') movi(body + 4, body + size); // `rec ` (or any other nested list)
      else {
        const n = parseInt(id.slice(0, 2), 10), kind = id.slice(2);
        if (n === vIdx && (kind === 'dc' || kind === 'db')) frames.push(new Uint8Array(buf, body, size));
        else if (n === aIdx && kind === 'wb') audioChunks.push(new Uint8Array(buf, body, size));
      }
      o = body + size + (size & 1);
    }
  };

  const walk = (start        , end        )       => {
    for (let o = start; o + 8 <= end;) {
      const id = fourcc(v, o), size = v.getUint32(o + 4, true), body = o + 8;
      if (id === 'LIST') {
        const type = fourcc(v, body);
        if (type === 'movi') {
          vIdx = streams.findIndex((s) => s.type === 'vids');
          aIdx = streams.findIndex((s) => s.type === 'auds');
          movi(body + 4, Math.min(body + size, end));
        } else walk(body + 4, Math.min(body + size, end)); // hdrl, strl, ...
      } else if (id === 'avih') {
        width = v.getUint32(body + 32, true); height = v.getUint32(body + 36, true);
      } else if (id === 'strh') {
        streams.push({ type: fourcc(v, body), handler: fourcc(v, body + 4),
          scale: v.getUint32(body + 20, true), rate: v.getUint32(body + 24, true), strf: null });
      } else if (id === 'strf' && streams.length) {
        streams[streams.length - 1].strf = new DataView(buf, body, size);
      }
      o = body + size + (size & 1);
    }
  };
  walk(12, Math.min(8 + v.getUint32(4, true), buf.byteLength));

  const vs = streams.find((s) => s.type === 'vids');
  if (!vs) throw new Error('AVI: no video stream');
  let videoFourcc = vs.handler;
  if (vs.strf && vs.strf.byteLength >= 20) {
    width = vs.strf.getInt32(4, true); height = Math.abs(vs.strf.getInt32(8, true)); // BITMAPINFOHEADER
    if (!/^[\x21-\x7e]{4}$/.test(videoFourcc)) videoFourcc = fourcc(vs.strf, 16);
  }

  let audio                  = null;
  const as = streams.find((s) => s.type === 'auds');
  if (as && as.strf) {
    const f = as.strf; // WAVEFORMATEX
    if (f.getUint16(0, true) !== 1) throw new Error(`AVI: unsupported audio format tag ${f.getUint16(0, true)} (PCM only)`);
    const data = new Uint8Array(audioChunks.reduce((n, c) => n + c.length, 0));
    let p = 0;
    for (const c of audioChunks) { data.set(c, p); p += c.length; }
    audio = { channels: f.getUint16(2, true), sampleRate: f.getUint32(4, true), bitsPerSample: f.getUint16(14, true), data };
  }

  const fpsNum = vs.rate, fpsDen = vs.scale;
  return { width, height, fpsNum, fpsDen, videoFourcc, frames, audio,
    durationTicks: Math.round((frames.length * 60 * fpsDen) / fpsNum) };
}
